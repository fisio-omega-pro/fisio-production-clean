const admin = require('firebase-admin');
const { db, Timestamp } = require('../config/firebase');
const anaService = require('./anaService');
const { sendEmail } = require('./emailSenderService');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const normalizeEstado = (v) => String(v || '').trim().toLowerCase();

const cadenceDelaysDays = [0, 2, 5, 10]; // intento 0 inmediato, luego 2d, 5d, 10d

const computeNextEmailAt = (attempts, nowMs) => {
  const idx = Math.min(Math.max(Number(attempts) || 0, 0), cadenceDelaysDays.length - 1);
  const days = cadenceDelaysDays[idx];
  return Timestamp.fromMillis(nowMs + days * 24 * 60 * 60 * 1000);
};

const isDue = (lead, nowMs) => {
  const estado = normalizeEstado(lead.estado || lead.status);
  if (!estado || estado === 'convertido' || estado === 'no_responde') return false;
  if (String(lead.canal || 'email').toLowerCase() !== 'email') return false;
  const email = String(lead.email || '').trim();
  if (!email || !email.includes('@')) return false;
  if (lead.opt_out === true) return false;
  if (lead.email_bounced === true) return false;

  const attempts = Number(lead.cadence_attempts || lead.attempts || 0);
  if (attempts >= cadenceDelaysDays.length) return true; // se marcará como no_responde

  // Si hay next_email_at, usarlo
  const next = lead.next_email_at;
  if (next && typeof next.toMillis === 'function') return next.toMillis() <= nowMs;
  if (next && next._seconds) return next._seconds * 1000 <= nowMs;

  // Si nunca se envió, due ya
  const last = lead.last_email_at;
  if (!last) return true;
  const lastMs =
    typeof last.toMillis === 'function' ? last.toMillis()
      : last._seconds ? last._seconds * 1000
      : NaN;
  if (!Number.isFinite(lastMs)) return true;

  const days = cadenceDelaysDays[Math.min(attempts, cadenceDelaysDays.length - 1)];
  return (lastMs + days * 24 * 60 * 60 * 1000) <= nowMs;
};

async function lockLead(leadId, nowMs) {
  const ref = db.collection('leads').doc(leadId);
  const lockUntil = Timestamp.fromMillis(nowMs + 5 * 60 * 1000); // 5 min
  return await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) return null;
    const lead = doc.data() || {};
    const curLock = lead.processing_lock_until;
    const curLockMs =
      curLock && typeof curLock.toMillis === 'function' ? curLock.toMillis()
        : curLock && curLock._seconds ? curLock._seconds * 1000
        : 0;
    if (curLockMs && curLockMs > nowMs) return null;
    if (!isDue(lead, nowMs)) return null;
    tx.set(ref, {
      processing_lock_until: lockUntil,
      processing_lock_at: Timestamp.now(),
    }, { merge: true });
    return { id: doc.id, ...lead };
  });
}

async function finalizeLead(leadId, patch) {
  const ref = db.collection('leads').doc(leadId);
  await ref.set({
    ...patch,
    processing_lock_until: null,
    processing_lock_at: null,
    updated_at: Timestamp.now(),
  }, { merge: true });
}

async function runCazaAutopilot(options = {}) {
  const maxPerRun = Number(options.maxPerRun || process.env.CAZA_MAX_PER_RUN || 5);
  const throttleMs = Number(options.throttleMs || process.env.CAZA_THROTTLE_MS || 1200);

  // Solo correr si Foundry (prospección) está activa
  const settingsDoc = await db.collection('foundry_settings').doc('prospeccion').get();
  const active = !!(settingsDoc.exists && (settingsDoc.data() || {}).active);
  if (!active) return { ok: true, sent: 0, skipped: 'inactive' };

  const nowMs = Date.now();

  // Evitar índices nuevos: traemos un bloque y filtramos en memoria
  const snap = await db.collection('leads').orderBy('updated_at', 'asc').limit(300).get();
  const candidates = snap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));

  let sent = 0;
  for (const c of candidates) {
    if (sent >= maxPerRun) break;
    if (!isDue(c, nowMs)) continue;

    const locked = await lockLead(c.id, nowMs);
    if (!locked) continue;

    const attempts = Number(locked.cadence_attempts || 0);
    if (attempts >= cadenceDelaysDays.length) {
      await finalizeLead(c.id, {
        estado: 'no_responde',
        status: 'no_responde',
        ultima_accion: 'Cadencia completada sin respuesta',
      });
      continue;
    }

    const to = String(locked.email || '').trim();
    const subject = '¿Podemos enseñarte FisioTool Pro?';
    let body = '';
    try {
      body = await anaService.generateProspectEmail({
        nombre: locked.nombre,
        clinica: locked.clinica,
        contexto: attempts === 0 ? 'Primer contacto' : `Seguimiento ${attempts}`,
        tipo: locked.tipo || locked.lead_type,
      });
    } catch {
      body = '';
    }
    if (!body) {
      body =
        `Hola,\n\n` +
        `Soy Ana de FisioTool Pro. Ayudamos a clínicas a digitalizar agenda, pacientes y cobros.\n\n` +
        `¿Te interesaría una demo rápida de 15 minutos?\n\n` +
        `Un saludo,\nAna · FisioTool Pro`;
    }

    try {
      const r = await sendEmail({ to, subject, text: body, type: 'ANA' });
      if (!r || r.ok !== true) {
        await finalizeLead(locked.id, {
          opt_out: r?.reason === 'BLOQUEADO_PLUS_FISIOTOOL' ? true : (locked.opt_out || false),
          email_invalid: r?.reason === 'BLOQUEADO_PLUS_FISIOTOOL' ? true : (locked.email_invalid || false),
          ultima_accion: `No enviado: ${String(r?.reason || r?.error || 'fallo')}`.slice(0, 160),
        });
        continue;
      }

      await db.collection('ana_sent_emails').add({
        to,
        subject,
        body,
        leadId: locked.id,
        leadInfo: { nombre: locked.nombre, clinica: locked.clinica, tipo: locked.tipo || locked.lead_type },
        fecha: Timestamp.now(),
        source: 'caza_autopilot',
        attempts,
      });

      const next = computeNextEmailAt(attempts + 1, nowMs);
      await finalizeLead(locked.id, {
        estado: attempts === 0 ? 'en_proceso' : String(locked.estado || locked.status || 'en_proceso'),
        status: attempts === 0 ? 'en_proceso' : String(locked.status || locked.estado || 'en_proceso'),
        canal: 'email',
        ultima_accion: `Email enviado (autopiloto) · intento ${attempts + 1}`,
        last_email_at: Timestamp.now(),
        cadence_attempts: attempts + 1,
        next_email_at: next,
      });

      sent++;
      await sleep(throttleMs);
    } catch (e) {
      await finalizeLead(locked.id, {
        ultima_accion: `Fallo envío email: ${String(e?.message || 'error')}`.slice(0, 180),
      });
    }
  }

  return { ok: true, sent };
}

module.exports = { runCazaAutopilot };

