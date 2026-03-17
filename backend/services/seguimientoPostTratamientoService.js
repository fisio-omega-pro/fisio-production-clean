/**
 * 🩺 SEGUIMIENTO POST-TRATAMIENTO
 * Detecta citas de hace 2 días y envía email personalizado al paciente
 * preguntando cómo se encuentra y ofreciendo reservar la próxima sesión.
 *
 * Requisito clínica: config_ia.seguimiento_activo = true
 * Cooldown por cita: campo seguimiento_sent = true en el doc de la cita
 */

const { db, Timestamp } = require('../config/firebase');
const { sendEmail } = require('./emailSenderService');
const { generateSeguimientoEmail } = require('./seguimientoEmailTemplate');

// Devuelve la fecha de hace N días en formato YYYY-MM-DD (Europe/Madrid)
function dateNDaysAgo(n) {
  const d = new Date(Date.now() - n * 24 * 60 * 60 * 1000);
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit'
  });
  return dtf.format(d); // YYYY-MM-DD
}

// Formatea YYYY-MM-DD a "lunes 15 de marzo" en español
function formatDateEs(isoDate) {
  try {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return date.toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC'
    });
  } catch (_) { return isoDate; }
}

async function runSeguimientoForClinic(clinicId, options = {}) {
  const maxPerRun = Number(options.maxPerRun || 10);
  const targetDate = options.targetDate || dateNDaysAgo(2); // por defecto hace 2 días

  const clinicDoc = await db.collection('clinicas').doc(clinicId).get();
  if (!clinicDoc.exists) return { ok: false, error: 'clinic not found' };
  const clinic = clinicDoc.data() || {};

  if (!clinic.config_ia?.seguimiento_activo) return { ok: true, sent: 0, skipped: 'inactive' };

  const clinicName = String(clinic.nombre_clinica || clinic.nombre || 'tu clínica').trim();
  const assistantName = String(clinic.ana_name || clinic.config_ia?.nombre_asistente || 'Ana').trim();
  const appUrl = `https://fisiotool.com/ana?ref=${clinicId}`;
  const clinicPhone = String(clinic.telefono || '').trim();
  const clinicEmail = String(clinic.email || clinic.email_contacto || '').trim();

  // Buscar citas del día objetivo para esta clínica
  const citasSnap = await db.collection('citas')
    .where('clinic_id', '==', clinicId)
    .where('fecha', '==', targetDate)
    .get();

  if (citasSnap.empty) return { ok: true, sent: 0, date: targetDate };

  let sent = 0;
  const errors = [];

  for (const doc of citasSnap.docs) {
    if (sent >= maxPerRun) break;
    const cita = doc.data() || {};

    // Saltar si ya se envió seguimiento para esta cita
    if (cita.seguimiento_sent === true) continue;

    const email = String(cita.email || '').trim().toLowerCase();
    const nombre = String(cita.nombre || 'paciente').trim();

    if (!email || !email.includes('@')) continue;
    if (cita.estado === 'cancelada') continue;

    const sessionDate = formatDateEs(targetDate);
    const subject = `${nombre}, ¿cómo te encuentras tras tu sesión?`;

    const html = generateSeguimientoEmail({
      patientName: nombre,
      clinicName,
      assistantName,
      appUrl,
      clinicPhone,
      clinicEmail,
      sessionDate
    });

    try {
      const r = await sendEmail({
        to: email,
        subject,
        html,
        type: 'ANA',
        clinicName
      });

      if (r?.ok === true) {
        // Marcar la cita como seguimiento enviado
        await db.collection('citas').doc(doc.id).update({
          seguimiento_sent: true,
          seguimiento_sent_at: Timestamp.now(),
          updated_at: Timestamp.now()
        });
        // Log en colección de auditoría
        await db.collection('seguimientos_sent').add({
          clinic_id: clinicId,
          cita_id: doc.id,
          to: email,
          nombre,
          subject,
          fecha_cita: targetDate,
          enviado_at: Timestamp.now()
        });
        console.log(`✅ [SEGUIMIENTO] Enviado a ${email} (cita ${doc.id}) — ${subject}`);
        sent++;
      } else {
        const reason = String(r?.reason || r?.error || 'fallo').slice(0, 160);
        console.warn(`⚠️ [SEGUIMIENTO] No enviado a ${email}: ${reason}`);
        errors.push({ email, reason });
      }
    } catch (e) {
      console.error(`🔥 [SEGUIMIENTO] Error enviando a ${email}:`, e.message);
      errors.push({ email, error: e.message });
    }
  }

  return { ok: true, sent, date: targetDate, ...(errors.length ? { errors } : {}) };
}

// Autopiloto global: procesa todas las clínicas activas
async function runSeguimientoAutopilot(options = {}) {
  const maxClinics = Number(options.maxClinics || 50);
  const clinicsSnap = await db.collection('clinicas').limit(300).get();

  const active = clinicsSnap.docs
    .map(d => ({ id: d.id, ...(d.data() || {}) }))
    .filter(c => !!c.config_ia?.seguimiento_activo)
    .slice(0, maxClinics);

  let totalSent = 0;
  for (const c of active) {
    const r = await runSeguimientoForClinic(c.id, options);
    totalSent += Number(r.sent || 0);
  }

  return { ok: true, sent: totalSent, clinics: active.length };
}

module.exports = { runSeguimientoForClinic, runSeguimientoAutopilot };
