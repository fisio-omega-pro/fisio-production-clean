const { db, Timestamp } = require('../config/firebase');
const { sendEmail } = require('./emailSenderService');

// --- 🕐 TIME ZONE HELPERS ---
const DEFAULT_TZ = 'Europe/Madrid';

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

// --- 🕐 TIME WINDOW VALIDATION ---
const isWithinNotificationWindow = (dateMs, tz) => {
  const p = getZonedParts(new Date(dateMs), tz);
  return p.hour >= 8 && p.hour < 21; // Ventana de 8:00 a 20:59
};

const adjustToNotificationWindow = (dateMs, tz) => {
  const p = getZonedParts(new Date(dateMs), tz);
  
  // Si es antes de las 8:00, mover a las 8:00 del mismo día
  if (p.hour < 8) {
    return zonedTimeToUtc({ 
      year: p.year, 
      month: p.month, 
      day: p.day, 
      hour: 8, 
      minute: 0 
    }, tz);
  }
  
  // Si es después de las 21:00, mover a las 8:00 del día siguiente
  if (p.hour >= 21) {
    const nextDay = new Date(dateMs);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayParts = getZonedParts(nextDay, tz);
    return zonedTimeToUtc({ 
      year: nextDayParts.year, 
      month: nextDayParts.month, 
      day: nextDayParts.day, 
      hour: 8, 
      minute: 0 
    }, tz);
  }
  
  return new Date(dateMs);
};

// --- 📅 PAYMENT REMINDER SERVICE ---
const schedulePaymentReminder = async (paymentId, clinicId, patientEmail, appointmentDateTime, amount) => {
  try {
    // Calculate reminder time (1 hour before appointment)
    const reminderTime = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000); // 1 hour before
    
    // Get clinic timezone
    const clinicDoc = await db.collection('clinicas').doc(clinicId).get();
    const clinicData = clinicDoc.data();
    const timezone = clinicData.timezone || DEFAULT_TZ;
    
    // Adjust to notification window (8-21h)
    const adjustedReminderTime = adjustToNotificationWindow(reminderTime.getTime(), timezone);
    
    // Store reminder in database
    await db.collection('payment_reminders').add({
      payment_id: paymentId,
      clinic_id: clinicId,
      patient_email: patientEmail,
      appointment_datetime: Timestamp.fromDate(appointmentDateTime),
      reminder_datetime: Timestamp.fromDate(adjustedReminderTime),
      amount: amount,
      status: 'pending',
      timezone: timezone,
      created_at: Timestamp.now()
    });
    
    console.log(`🕐 [PAYMENT REMINDER] Scheduled for ${adjustedReminderTime.toISOString()} (adjusted to 8-21h window)`);
    
    return { success: true, reminderTime: adjustedReminderTime };
  } catch (e) {
    console.error('🔥 [PAYMENT REMINDER] Error scheduling reminder:', e);
    return { success: false, error: e.message };
  }
};

// --- 📧 SEND REMINDER EMAIL ---
const sendPaymentReminderEmail = async (reminderId) => {
  try {
    const reminderDoc = await db.collection('payment_reminders').doc(reminderId).get();
    if (!reminderDoc.exists) {
      console.error('🔥 [PAYMENT REMINDER] Reminder not found:', reminderId);
      return { success: false, error: 'Reminder not found' };
    }
    
    const reminder = reminderDoc.data();
    
    // Get clinic details
    const clinicDoc = await db.collection('clinicas').doc(reminder.clinic_id).get();
    const clinicData = clinicDoc.data();
    
    // Send reminder email
    const emailContent = `
      <h2>Recordatorio de Pago - ${clinicData.nombre_clinica}</h2>
      <p>¡Hola! Este es un recordatorio amistoso sobre tu pago pendiente:</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>Detalles del Pago:</h3>
        <ul>
          <li><strong>Cantidad:</strong> ${reminder.amount}€</li>
          <li><strong>Fecha de cita:</strong> ${reminder.appointment_datetime.toDate().toLocaleDateString('es-ES')}</li>
          <li><strong>Hora:</strong> ${reminder.appointment_datetime.toDate().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</li>
        </ul>
      </div>
      
      <p>Tu enlace de pago está activo. Por favor, completa el pago antes de tu cita para asegurar tu reserva.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reminder.payment_url || '#'}" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Pagar Ahora
        </a>
      </div>
      
      <p>Si ya has realizado el pago, por favor ignora este mensaje.</p>
      
      <p>Gracias por tu confianza,<br>${clinicData.nombre_clinica}</p>
    `;
    
    await sendEmail({
      to: reminder.patient_email,
      subject: `Recordatorio de Pago - ${clinicData.nombre_clinica}`,
      html: emailContent
    });
    
    // Update reminder status
    await db.collection('payment_reminders').doc(reminderId).update({
      status: 'sent',
      sent_at: Timestamp.now()
    });
    
    console.log(`📧 [PAYMENT REMINDER] Email sent to ${reminder.patient_email}`);
    
    return { success: true };
  } catch (e) {
    console.error('🔥 [PAYMENT REMINDER] Error sending email:', e);
    return { success: false, error: e.message };
  }
};

// --- 🔄 PROCESS PENDING REMINDERS ---
const processPendingReminders = async () => {
  try {
    const now = Timestamp.now();
    const pendingReminders = await db.collection('payment_reminders')
      .where('status', '==', 'pending')
      .where('reminder_datetime', '<=', now)
      .get();
    
    console.log(`🕐 [PAYMENT REMINDER] Processing ${pendingReminders.size} pending reminders`);
    
    for (const doc of pendingReminders.docs) {
      await sendPaymentReminderEmail(doc.id);
    }
    
    return { 
      success: true, 
      processed: pendingReminders.size 
    };
  } catch (e) {
    console.error('🔥 [PAYMENT REMINDER] Error processing reminders:', e);
    return { success: false, error: e.message };
  }
};

module.exports = {
  schedulePaymentReminder,
  sendPaymentReminderEmail,
  processPendingReminders
};
