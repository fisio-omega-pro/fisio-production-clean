const { db, Timestamp } = require('../config/firebase');
const { sendEmail } = require('./emailSenderService');

// Por defecto usamos Bélgica (Bruselas). Madrid y Bruselas comparten CET/CEST,
// pero esto evita ambigüedad operativa y deja claro el criterio.
const DEFAULT_TZ = 'Europe/Brussels';

function getZonedParts(date, timeZone) {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const map = {};
  for (const p of parts) map[p.type] = p.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
  };
}

// Convierte una fecha/hora “local” en timeZone a Date UTC (sin dependencias)
function zonedTimeToUtc({ year, month, day, hour, minute }, timeZone) {
  let utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  for (let i = 0; i < 3; i++) {
    const guessParts = getZonedParts(new Date(utcGuess), timeZone);
    const asIfUtcGuess = Date.UTC(guessParts.year, guessParts.month - 1, guessParts.day, guessParts.hour, guessParts.minute, 0);
    const asIfUtcDesired = Date.UTC(year, month - 1, day, hour, minute, 0);
    const diff = asIfUtcGuess - asIfUtcDesired;
    utcGuess = utcGuess - diff;
    if (diff === 0) break;
  }
  return new Date(utcGuess);
}

// Asegura que expira_el caiga entre 09:00–21:00 (para que reminder_el=expira-1h sea 08:00–20:00)
function clampExpiryToQuietHours(expiryDate, timeZone) {
  const tz = timeZone || DEFAULT_TZ;
  const p = getZonedParts(expiryDate, tz);

  // Si expira antes de 09:00 local, lo movemos a 09:00 del mismo día
  if (p.hour < 9) {
    return zonedTimeToUtc({ year: p.year, month: p.month, day: p.day, hour: 9, minute: 0 }, tz);
  }

  // Si expira después de 21:00 local, lo movemos a 09:00 del día siguiente
  if (p.hour > 21 || (p.hour === 21 && p.minute > 0)) {
    const base = zonedTimeToUtc({ year: p.year, month: p.month, day: p.day, hour: 9, minute: 0 }, tz);
    return new Date(base.getTime() + 24 * 60 * 60 * 1000);
  }

  return expiryDate;
}

function pickCitaEmail(c) {
  const candidates = [
    c.email,
    c.paciente_email,
    c.email_paciente,
    c.patient_email,
  ];
  for (const x of candidates) {
    const s = String(x || '').trim().toLowerCase();
    if (s && s.includes('@')) return s;
  }
  return '';
}

async function runDepositReminders(options = {}) {
  const maxPerRun = Number(options.maxPerRun || process.env.DEPOSIT_REMINDERS_MAX || 25);
  const now = Timestamp.now();
  const nowMs = Date.now();

  // Query eficiente por reminder_el (se rellena en registrarReserva)
  const snap = await db.collection('citas')
    .where('status', '==', 'pendiente_pago')
    .where('deposit_reminder_sent', '==', false)
    .where('reminder_el', '<=', now)
    .limit(maxPerRun)
    .get();

  let sent = 0;
  let skipped = 0;

  for (const doc of snap.docs) {
    const c = doc.data() || {};

    // Aún no expirada
    const expiraMs =
      c.expira_el && typeof c.expira_el.toMillis === 'function' ? c.expira_el.toMillis()
        : c.expira_el && c.expira_el._seconds ? c.expira_el._seconds * 1000
        : 0;
    if (expiraMs && expiraMs <= nowMs) {
      await doc.ref.set({
        deposit_reminder_sent: true,
        deposit_reminder_skipped_reason: 'EXPIRADA',
        updated_at: Timestamp.now(),
      }, { merge: true });
      skipped++;
      continue;
    }

    const email = pickCitaEmail(c);
    if (!email) {
      await doc.ref.set({
        deposit_reminder_sent: true,
        deposit_reminder_skipped_reason: 'SIN_EMAIL',
        updated_at: Timestamp.now(),
      }, { merge: true });
      skipped++;
      continue;
    }

    // Respetar quiet hours (por seguridad extra) usando timezone clínica si existe
    let tz = DEFAULT_TZ;
    try {
      if (c.clinic_id) {
        const clinicDoc = await db.collection('clinicas').doc(String(c.clinic_id)).get();
        const clinic = clinicDoc.exists ? (clinicDoc.data() || {}) : {};
        tz = String(clinic.timezone || clinic.tz || DEFAULT_TZ);
      }
    } catch (_) {}
    const local = getZonedParts(new Date(nowMs), tz);
    if (local.hour < 8 || local.hour >= 20) {
      // No enviamos fuera de horario. No lo marcamos como sent para reintentar dentro de ventana.
      skipped++;
      continue;
    }

    const clinicName = String(c.clinic_name || c.nombre_clinica || 'la clínica').trim();
    const fecha = String(c.fecha || '').trim();
    const hora = String(c.hora || '').trim();
    const subject = 'Tu reserva está pendiente — te queda 1 hora para confirmar';

    const payUrl = String(c.payment_url || c.pago_url || '').trim();
    const lines = [
      `Hola,`,
      ``,
      `Soy Ana de ${clinicName}.`,
      `Tu reserva${(fecha && hora) ? ` para el ${fecha} a las ${hora}` : ''} sigue pendiente de confirmación.`,
      `Te queda aproximadamente 1 hora para completar el pago de la fianza y asegurar el hueco.`,
      ``,
      payUrl ? `Enlace de pago: ${payUrl}` : `Si tienes el enlace de pago, úsalo ahora. Si no, responde a este email y te lo reenviamos.`,
      ``,
      `Un saludo,`,
      `Ana · FisioTool Pro`,
    ];
    const text = lines.join('\n');

    const r = await sendEmail({ to: email, subject, text, type: 'ANA' });
    if (!r || r.ok !== true) {
      await doc.ref.set({
        deposit_reminder_error: String(r?.reason || r?.error || 'fallo').slice(0, 160),
        deposit_reminder_attempts: Number(c.deposit_reminder_attempts || 0) + 1,
        updated_at: Timestamp.now(),
      }, { merge: true });
      skipped++;
      continue;
    }

    await doc.ref.set({
      deposit_reminder_sent: true,
      deposit_reminder_sent_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    }, { merge: true });
    sent++;
  }

  return { ok: true, sent, skipped };
}

module.exports = {
  runDepositReminders,
  // export helpers for reuse
  clampExpiryToQuietHours,
  getZonedParts,
  zonedTimeToUtc,
  DEFAULT_TZ,
};

