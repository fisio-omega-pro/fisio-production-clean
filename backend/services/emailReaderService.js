const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { initEnv } = require('../config/env');
const adminController = require('../controllers/adminController');
const anaService = require('./anaService');
const { sendEmail } = require('./emailSenderService');
const { db } = require('../config/firebase');

const readEmails = async () => {
  const env = await initEnv();
  const credentials = env.ANA_MAIL; // 🚀 Ana lee su propio buzón

  if (!credentials.user || !credentials.pass) return;

  const imap = new Imap({
    user: credentials.user,
    password: credentials.pass,
    host: 'gmadm1033.siteground.biz',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
  });

  imap.once('ready', () => {
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

              // 🧠 Ana procesa el email con IA
              const analysis = await anaService.processIncomingEmail(from, subject, body);

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
                await sendEmail(from, `Re: ${subject}`, analysis.respuesta, 'ANA');
                console.log(`✅ [ANA] Respuesta automática enviada a ${from}`);
                
                // Marcar como respondido
                try {
                  const docs = await db.collection('ana_inbox').where('from', '==', from).orderBy('fecha', 'desc').limit(1).get();
                  if (!docs.empty) {
                    await docs.docs[0].ref.update({ respondido: true });
                  }
                } catch (updateErr) {
                  console.error('🔥 Error actualizando estado:', updateErr);
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
  });
  imap.once('error', (err) => console.error('🔥 [IMAP] Error:', err.message));
  imap.connect();
};

module.exports = { readEmails };
