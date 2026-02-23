const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { initEnv } = require('../config/env');
const adminController = require('../controllers/adminController');
const anaService = require('./anaService');
const { sendEmail } = require('./emailSenderService');
const { db, Timestamp } = require('../config/firebase');

const isBounceEmail = (from, subject, body) => {
  const f = String(from || '').toLowerCase();
  const s = String(subject || '').toLowerCase();
  const b = String(body || '').toLowerCase();
  return (
    f.includes('mailer-daemon') ||
    f.includes('postmaster') ||
    s.includes('mail delivery failed') ||
    s.includes('undelivered mail') ||
    s.includes('delivery status notification') ||
    b.includes('this message was created automatically by mail delivery software') ||
    b.includes('no such user') ||
    b.includes('the following address') && b.includes('failed')
  );
};

const extractFailedRecipients = (body) => {
  const text = String(body || '');
  const emails = new Set();
  // capturar emails tras “failed” típicos
  const lines = text.split('\n').slice(0, 400); // limita
  for (const ln of lines) {
    if (!ln) continue;
    const m = ln.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/ig);
    if (m) m.forEach((e) => emails.add(String(e).trim().toLowerCase()));
  }
  return Array.from(emails);
};

const guessBounceReason = (body) => {
  const b = String(body || '');
  const m =
    b.match(/No Such User Here/i) ||
    b.match(/User unknown/i) ||
    b.match(/Mailbox unavailable/i) ||
    b.match(/Recipient address rejected/i);
  return m ? String(m[0]) : '';
};

const connectImap = (credentials) => {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: credentials.user,
      password: credentials.pass,
      host: 'gmadm1033.siteground.biz',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      connTimeout: 30000,  // 30s (default 10s) — SiteGround tarda desde Cloud Run
      authTimeout: 25000,  // 25s (default 5s)
      keepalive: { interval: 10000, idleInterval: 300000, forceNoop: true }
    });
    const timeout = setTimeout(() => {
      try { imap.end(); } catch (_) {}
      reject(new Error('IMAP: timeout global 45s'));
    }, 45000);
    imap.once('ready', () => { clearTimeout(timeout); resolve(imap); });
    imap.once('error', (err) => { clearTimeout(timeout); reject(err); });
    imap.connect();
  });
};

const readEmails = async () => {
  const env = await initEnv();
  const credentials = env.ANA_MAIL; // 🚀 Ana lee su propio buzón

  if (!credentials.user || !credentials.pass) return;

  let imap;
  const MAX_RETRIES = 2;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      imap = await connectImap(credentials);
      console.log(`✅ [IMAP] Conectado (intento ${attempt + 1})`);
      break;
    } catch (err) {
      console.warn(`⚠️ [IMAP] Intento ${attempt + 1}/${MAX_RETRIES + 1} falló: ${err.message}`);
      if (attempt === MAX_RETRIES) {
        console.error('🔥 [IMAP] Error: Agotados todos los reintentos');
        return;
      }
      await new Promise(r => setTimeout(r, 3000)); // esperar 3s antes de reintentar
    }
  }

  imap.openBox('INBOX', false, (err) => {
    if (err) { imap.end(); return; }
    imap.search(['UNSEEN'], (err, results) => {
      if (err || !results || !results.length) { imap.end(); return; }
      const f = imap.fetch(results, { bodies: '' });
        f.on('message', (msg) => {
          msg.on('body', (stream) => {
            simpleParser(stream, async (e, parsed) => {
              const from = parsed.from.value[0].address;
              const subject = parsed.subject || 'Sin asunto';
              const body = parsed.text || parsed.html || '';

              console.log(`📧 [ANA INBOX] Procesando email de ${from}: ${subject}`);

              // 📌 Rebotes (Mailer-Daemon): NO pasan por IA, se registran y bloquean reintentos
              if (isBounceEmail(from, subject, body)) {
                const failed = extractFailedRecipients(body);
                const reason = guessBounceReason(body);
                try {
                  await db.collection('email_bounces').add({
                    from,
                    subject,
                    failed,
                    reason,
                    body_snippet: String(body || '').slice(0, 800),
                    createdAt: Timestamp.now(),
                  });
                } catch (dbErr) {
                  console.error('🔥 Error guardando bounce:', dbErr?.message || dbErr);
                }

                // Marcar destinatarios como bounced/do-not-email (best-effort)
                for (const r of failed.slice(0, 10)) {
                  try {
                    const leadSnap = await db.collection('leads').where('email', '==', String(r)).limit(10).get();
                    for (const d of leadSnap.docs) {
                      await d.ref.set({
                        email_bounced: true,
                        opt_out: true,
                        estado: 'no_responde',
                        status: 'no_responde',
                        ultima_accion: `Email rebotado: ${reason || 'fallo permanente'}`,
                        updated_at: Timestamp.now(),
                      }, { merge: true });
                    }
                  } catch (_) {}
                  try {
                    const pSnap = await db.collection('pacientes').where('email', '==', String(r)).limit(10).get();
                    for (const d of pSnap.docs) {
                      await d.ref.set({
                        email_bounced: true,
                        do_not_email: true,
                        last_bounce_reason: reason || 'fallo permanente',
                        last_bounce_at: Timestamp.now(),
                        updated_at: Timestamp.now(),
                      }, { merge: true });
                    }
                  } catch (_) {}
                }

                // 🔕 Evitar spam al admin: solo avisar si NO es un rebote interno de pruebas
                const shouldNotify = failed.some((r) => {
                  const s = String(r || '').toLowerCase();
                  const at = s.lastIndexOf('@');
                  const local = at > 0 ? s.slice(0, at) : s;
                  const domain = at > 0 ? s.slice(at + 1) : '';
                  if (domain === 'fisiotool.com' && local.includes('+')) return false;
                  return true;
                });
                if (shouldNotify) {
                  try {
                    const adminEmail = env.ADMIN_EMAIL || 'fisiotoolsaas@gmail.com';
                    await sendEmail({
                      to: adminEmail,
                      subject: `[ANA ALERTA] IMPORTANTE: Rebote de email`,
                      text: `De: ${from}\nAsunto: ${subject}\n\nDestinatarios fallidos:\n- ${failed.slice(0, 10).join('\n- ')}\n\nMotivo: ${reason || 'fallo permanente'}`,
                      type: 'ANA'
                    });
                  } catch (_) {}
                }

                return;
              }

              // 🎯 Buscar si el remitente es un lead de CAZA (para contexto y actualización)
              let leadDoc = null;
              try {
                const leadSnap = await db.collection('leads').where('email', '==', String(from).trim().toLowerCase()).limit(1).get();
                if (!leadSnap.empty) leadDoc = { id: leadSnap.docs[0].id, ...leadSnap.docs[0].data() };
              } catch (_) {}

              const leadContext = leadDoc
                ? { id: leadDoc.id, nombre: leadDoc.nombre || leadDoc.name, clinica: leadDoc.clinica || leadDoc.company }
                : null;

              // 🧠 Ana procesa el email con IA (con contexto CAZA si es un lead)
              const analysis = await anaService.processIncomingEmail(from, subject, body, leadContext);

              // 💾 Guardar email procesado en Firestore
              try {
                await db.collection('ana_inbox').add({
                  from,
                  subject,
                  body: body.substring(0, 500), // Limitar tamaño
                  clasificacion: analysis.clasificacion,
                  tipo: analysis.tipo,
                  respuesta_generada: analysis.respuesta,
                  notificar_admin: analysis.notificar_admin,
                  resumen: analysis.resumen,
                  fecha: new Date().toISOString(),
                  respondido: false
                });
              } catch (dbErr) {
                console.error('🔥 Error guardando email en Firestore:', dbErr);
              }

              // 📨 Si Ana generó una respuesta, enviarla automáticamente
              if (analysis.respuesta && analysis.tipo !== 'SPAM') {
                const r = await sendEmail({ to: from, subject: `Re: ${subject}`, text: analysis.respuesta, type: 'ANA' });
                if (r && r.ok) {
                  console.log(`✅ [ANA] Respuesta automática enviada a ${from}`);
                } else {
                  console.warn(`⚠️ [ANA] No se pudo responder automáticamente a ${from}`);
                  return;
                }
                
                // Marcar como respondido en ana_inbox
                try {
                  const docs = await db.collection('ana_inbox').where('from', '==', from).orderBy('fecha', 'desc').limit(1).get();
                  if (!docs.empty) {
                    await docs.docs[0].ref.update({ respondido: true });
                  }
                } catch (updateErr) {
                  console.error('🔥 Error actualizando estado:', updateErr);
                }
              }

              // 🎯 Actualizar lead en CAZA cuando el remitente es un lead que respondió
              if (leadDoc && leadDoc.id) {
                try {
                  const resumenCorto = (analysis.resumen || '').slice(0, 200);
                  const estadoNuevo = analysis.tipo === 'LEAD_PROSPECTO' ? 'interesado' : 'respondido';
                  await db.collection('leads').doc(leadDoc.id).set({
                    last_reply_at: Timestamp.now(),
                    ultima_accion: `Lead respondió: ${resumenCorto || subject}`,
                    estado: estadoNuevo,
                    status: estadoNuevo,
                    updated_at: Timestamp.now(),
                  }, { merge: true });
                  console.log(`✅ [CAZA] Lead ${leadDoc.id} actualizado (${estadoNuevo})`);
                } catch (leadErr) {
                  console.error('🔥 Error actualizando lead:', leadErr?.message || leadErr);
                }
              }

              // 🚨 Si es importante/urgente, notificar al admin
              if (analysis.notificar_admin && (analysis.clasificacion === 'URGENTE' || analysis.clasificacion === 'IMPORTANTE')) {
                const adminEmail = env.ADMIN_EMAIL || 'fisiotoolsaas@gmail.com';
                await sendEmail(
                  adminEmail,
                  `[ANA ALERTA] ${analysis.clasificacion}: ${subject}`,
                  `De: ${from}\n\nResumen: ${analysis.resumen}\n\nCuerpo original:\n${body.substring(0, 300)}...`,
                  'ANA'
                );
                console.log(`🚨 [ANA] Alerta enviada a ${adminEmail} sobre email de ${from}`);
              }

              // 🔧 Mantener compatibilidad con sistema anterior
              await adminController.handleIncomingResponse({
                body: { from, text: body, channel: 'email' }
              }, { json: () => {} });
            });
          });
          msg.once('attributes', (attrs) => { imap.addFlags(attrs.uid, ['\\Seen'], () => {}); });
        });
        f.once('end', () => imap.end());
      });
    });
};

module.exports = { readEmails };
