const admin = require('firebase-admin');
const { db, Timestamp } = require('../config/firebase');
const { sendEmail } = require('./emailSenderService');
const { generateRecaptacionEmail } = require('./recaptacionEmailTemplate');
const { sendPushToPatient } = require('./pushNotificationService');

const daysAgoIso = (days) => {
  const d = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
};

const toMs = (ts) => {
  if (!ts) return 0;
  if (typeof ts.toMillis === 'function') return ts.toMillis();
  if (ts._seconds) return ts._seconds * 1000;
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
};

const shouldRecap = (patient, recentSet, nowMs) => {
  const email = String(patient.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) return false;
  if (patient.do_not_email === true) return false;
  if (patient.email_bounced === true) return false;
  const phone = String(patient.telefono || '').trim();
  if (recentSet.has(email) || (phone && recentSet.has(phone))) return false;
  const last = patient.last_recap_at;
  const lastMs = toMs(last);
  // No repetir en 30 días (frecuencia mensual)
  if (lastMs && (nowMs - lastMs) < 30 * 24 * 60 * 60 * 1000) return false;
  return true;
};

async function lockPatient(clinicId, patientId, nowMs) {
  const ref = db.collection('pacientes').doc(patientId);
  const lockUntil = Timestamp.fromMillis(nowMs + 5 * 60 * 1000);
  return await db.runTransaction(async (tx) => {
    const doc = await tx.get(ref);
    if (!doc.exists) return null;
    const p = doc.data() || {};
    if (String(p.clinic_id || '') !== String(clinicId || '')) return null;
    const cur = p.recap_lock_until;
    const curMs = toMs(cur);
    if (curMs && curMs > nowMs) return null;
    tx.set(ref, { recap_lock_until: lockUntil, recap_lock_at: Timestamp.now() }, { merge: true });
    return { id: doc.id, ...p };
  });
}

async function finalizePatient(patientId, patch) {
  await db.collection('pacientes').doc(patientId).set({
    ...patch,
    recap_lock_until: null,
    recap_lock_at: null,
    updated_at: Timestamp.now(),
  }, { merge: true });
}

async function runRecaptacionForClinic(clinicId, options = {}) {
  const maxPerRun = Number(options.maxPerRun || process.env.RECAP_MAX_PER_RUN || 5);
  const nowMs = Date.now();

  const clinicDoc = await db.collection('clinicas').doc(clinicId).get();
  if (!clinicDoc.exists) return { ok: false, error: 'clinic not found' };
  const clinic = clinicDoc.data() || {};
  if (!clinic.config_ia?.modo_caza_activo) return { ok: true, sent: 0, skipped: 'inactive' };

  // Construir set de pacientes con citas en los últimos 30 días (sin índices compuestos)
  const cutoff = daysAgoIso(30);
  const citasSnap = await db.collection('citas').where('clinic_id', '==', clinicId).get();
  const recent = new Set();
  citasSnap.docs.forEach((d) => {
    const c = d.data() || {};
    const fecha = String(c.fecha || '').trim();
    if (fecha && fecha >= cutoff) {
      const email = String(c.email || '').trim().toLowerCase();
      const phone = String(c.telefono || '').trim();
      if (email) recent.add(email);
      if (phone) recent.add(phone);
    }
  });

  const patientsSnap = await db.collection('pacientes').where('clinic_id', '==', clinicId).limit(200).get();
  const patients = patientsSnap.docs.map((d) => ({ id: d.id, ...(d.data() || {}) }));

  let sent = 0;
  for (const p of patients) {
    if (sent >= maxPerRun) break;
    if (!shouldRecap(p, recent, nowMs)) continue;

    const locked = await lockPatient(clinicId, p.id, nowMs);
    if (!locked) continue;

    const to = String(locked.email || '').trim().toLowerCase();
    const nombre = String(locked.nombre || 'paciente').trim();
    const clinicName = String(clinic.nombre_clinica || 'tu clínica').trim();
    const assistantName = String(clinic.config_ia?.nombre_asistente || 'Ana').trim();
    const subject = `Hola ${nombre}, ¿cómo estás? Te extrañamos en ${clinicName}`;
    
    // Generar email HTML profesional
    const html = generateRecaptacionEmail({
      patientName: nombre,
      clinicName: clinicName,
      assistantName: assistantName,
      appUrl: 'https://app.fisiotool.com', // URL de la app
      clinicPhone: clinic.telefono || '+34 900 000 000',
      clinicEmail: clinic.email || 'info@fisiotool.com'
    });
    
    // Texto plano para fallback
    const text = `Hola ${nombre},

Somos ${clinicName} y te contactamos a través de FisioTool, nuestra plataforma inteligente de gestión.

Hemos visto que hace tiempo que no reservas y nos gustaría saber cómo estás.

💡 **Novedad**: Ahora puedes gestionar tus citas desde nuestra app móvil:
• 📅 Reserva tus citas cuando quieras
• 🔔 Recibe recordatorios automáticos
• 💬 Comunicación directa con nosotros

¿Te gustaría retomar tus tratamientos? Responde este email o descarga la app:
https://app.fisiotool.com

Un saludo,
${assistantName} - ${clinicName}
🤖 Powered by FisioTool
📞 ${clinic.telefono || '+34 900 000 000'}`;

    try {
      const r = await sendEmail({ 
        to, 
        subject, 
        text,
        html, // Añadir HTML profesional
        type: 'ANA',
        clinicName: clinicName // Pasar nombre de clínica para el remitente
      });
      if (!r || r.ok !== true) {
        await finalizePatient(locked.id, {
          do_not_email: r?.reason === 'BLOQUEADO_PLUS_FISIOTOOL' ? true : (locked.do_not_email || false),
          email_invalid: r?.reason === 'BLOQUEADO_PLUS_FISIOTOOL' ? true : (locked.email_invalid || false),
          last_recap_error: String(r?.reason || r?.error || 'fallo').slice(0, 180),
        });
      } else {
        // Push notification en paralelo (no bloqueante)
        sendPushToPatient({
          clinicId,
          email: to,
          title: `${assistantName} de ${clinicName}`,
          body: `${nombre}, te echamos de menos. ¿Volvemos a vernos pronto?`,
          url: `https://fisiotool.com/ana?ref=${clinicId}`
        }).catch(() => {});

        await db.collection('recaptacion_sent').add({
          clinic_id: clinicId,
          patient_id: locked.id,
          to,
          subject,
          fecha: Timestamp.now(),
        });
        await finalizePatient(locked.id, {
          last_recap_at: Timestamp.now(),
          last_recap_subject: subject,
        });
        sent++;
      }
    } catch (e) {
      await finalizePatient(locked.id, {
        last_recap_error: String(e?.message || 'error').slice(0, 180),
      });
    }
  }

  return { ok: true, sent };
}

// Autopiloto global (para cron): procesa clínicas activas (limitado)
async function runRecaptacionAutopilot(options = {}) {
  const maxClinics = Number(options.maxClinics || process.env.RECAP_MAX_CLINICS || 10);
  const clinicsSnap = await db.collection('clinicas').limit(200).get();
  const active = clinicsSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() || {}) }))
    .filter((c) => !!c.config_ia?.modo_caza_activo)
    .slice(0, maxClinics);

  let totalSent = 0;
  for (const c of active) {
    const r = await runRecaptacionForClinic(c.id, options);
    totalSent += Number(r.sent || 0);
  }
  return { ok: true, sent: totalSent, clinics: active.length };
}

module.exports = { runRecaptacionForClinic, runRecaptacionAutopilot };

