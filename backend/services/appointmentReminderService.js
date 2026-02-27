const { db, Timestamp } = require('../config/firebase');
const { sendEmail } = require('./emailSenderService');

// --- 🕐 TIME WINDOW VALIDATION ---
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

const isWithinNotificationWindow = (dateMs, tz) => {
  const p = getZonedParts(new Date(dateMs), tz);
  return p.hour >= 8 && p.hour < 21; // Ventana de 8:00 a 20:59
};

const adjustToNotificationWindow = (dateMs, tz) => {
  const p = getZonedParts(new Date(dateMs), tz);
  
  if (p.hour < 8) {
    return zonedTimeToUtc({ 
      year: p.year, 
      month: p.month, 
      day: p.day, 
      hour: 8, 
      minute: 0 
    }, tz);
  }
  
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

// --- 📅 APPOINTMENT REMINDER SERVICE ---
const scheduleAppointmentReminders = async (appointmentId, clinicId, patientEmail, patientName, appointmentDateTime, clinicName) => {
  try {
    const reminders = [
      {
        type: '24h',
        time: new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000),
        message: `Te recordamos tu cita de fisioterapia mañana a las ${appointmentDateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.`,
        subject: `Recordatorio de tu cita mañana a las ${appointmentDateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
        sendEmail: true,
        sendPush: true
      },
      {
        type: '4h',
        time: new Date(appointmentDateTime.getTime() - 4 * 60 * 60 * 1000),
        message: `Tu cita de fisioterapia es en 4 horas a las ${appointmentDateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.`,
        sendEmail: false,
        sendPush: true
      },
      {
        type: '1h',
        time: new Date(appointmentDateTime.getTime() - 1 * 60 * 60 * 1000),
        message: `Tu cita de fisioterapia es en 1 hora a las ${appointmentDateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.`,
        sendEmail: false,
        sendPush: true
      },
      {
        type: '15m',
        time: new Date(appointmentDateTime.getTime() - 15 * 60 * 1000),
        message: `¡Tu cita es en 15 minutos! Te esperamos en ${clinicName}.`,
        sendEmail: false,
        sendPush: true
      }
    ];
    
    // Get clinic timezone
    const clinicDoc = await db.collection('clinicas').doc(clinicId).get();
    const clinicData = clinicDoc.data();
    const timezone = clinicData.timezone || DEFAULT_TZ;
    
    // Store all reminders
    for (const reminder of reminders) {
      const adjustedTime = adjustToNotificationWindow(reminder.time.getTime(), timezone);
      
      await db.collection('appointment_reminders').add({
        appointment_id: appointmentId,
        clinic_id: clinicId,
        patient_email: patientEmail,
        patient_name: patientName,
        appointment_datetime: Timestamp.fromDate(appointmentDateTime),
        reminder_datetime: Timestamp.fromDate(adjustedTime),
        reminder_type: reminder.type,
        message: reminder.message,
        subject: reminder.subject,
        send_email: reminder.sendEmail,
        send_push: reminder.sendPush,
        status: 'pending',
        timezone: timezone,
        created_at: Timestamp.now()
      });
      
      console.log(`📅 [APPOINTMENT] Scheduled ${reminder.type} reminder for ${adjustedTime.toISOString()}`);
    }
    
    return { success: true, scheduled: reminders.length };
  } catch (e) {
    console.error('🔥 [APPOINTMENT] Error scheduling reminders:', e);
    return { success: false, error: e.message };
  }
};

// --- 📧 SEND REMINDER EMAIL ---
const sendAppointmentReminderEmail = async (reminderId) => {
  try {
    const reminderDoc = await db.collection('appointment_reminders').doc(reminderId).get();
    if (!reminderDoc.exists) {
      console.error('🔥 [APPOINTMENT] Reminder not found:', reminderId);
      return { success: false, error: 'Reminder not found' };
    }
    
    const reminder = reminderDoc.data();
    
    // Get clinic details
    const clinicDoc = await db.collection('clinicas').doc(reminder.clinic_id).get();
    const clinicData = clinicDoc.data();
    
    // Send email
    const emailContent = `
      <h2>Recordatorio de Cita - ${clinicData.nombre_clinica}</h2>
      <p>Hola ${reminder.patient_name},</p>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>Detalles de tu cita:</h3>
        <ul>
          <li><strong>Fecha:</strong> ${reminder.appointment_datetime.toDate().toLocaleDateString('es-ES')}</li>
          <li><strong>Hora:</strong> ${reminder.appointment_datetime.toDate().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</li>
          <li><strong>Clínica:</strong> ${clinicData.nombre_clinica}</li>
        </ul>
      </div>
      
      <p>${reminder.message}</p>
      
      <p>Si no puedes asistir, por favor avísanos con 4 horas de antelación.</p>
      
      <p>Te esperamos,<br>${clinicData.nombre_clinica}</p>
    `;
    
    await sendEmail({
      to: reminder.patient_email,
      subject: reminder.subject,
      html: emailContent
    });
    
    // Update reminder status
    await db.collection('appointment_reminders').doc(reminderId).update({
      status: 'sent',
      sent_at: Timestamp.now()
    });
    
    console.log(`📧 [APPOINTMENT] Email sent to ${reminder.patient_email}`);
    
    return { success: true };
  } catch (e) {
    console.error('🔥 [APPOINTMENT] Error sending email:', e);
    return { success: false, error: e.message };
  }
};

// --- 🔄 PROCESS PENDING REMINDERS ---
const processPendingReminders = async () => {
  try {
    const now = Timestamp.now();
    const pendingReminders = await db.collection('appointment_reminders')
      .where('status', '==', 'pending')
      .where('reminder_datetime', '<=', now)
      .get();
    
    console.log(`📅 [APPOINTMENT] Processing ${pendingReminders.size} pending reminders`);
    
    for (const doc of pendingReminders.docs) {
      const reminder = doc.data();
      
      // Send email if needed
      if (reminder.send_email) {
        await sendAppointmentReminderEmail(doc.id);
      }
      
      // TODO: Send push notification if needed
      if (reminder.send_push) {
        console.log(`📱 [APPOINTMENT] Push notification scheduled for ${reminder.patient_name}`);
      }
      
      // Update status
      await db.collection('appointment_reminders').doc(doc.id).update({
        status: reminder.send_email ? 'sent' : 'processed',
        processed_at: Timestamp.now()
      });
    }
    
    return { 
      success: true, 
      processed: pendingReminders.size 
    };
  } catch (e) {
    console.error('🔥 [APPOINTMENT] Error processing reminders:', e);
    return { success: false, error: e.message };
  }
};

module.exports = {
  scheduleAppointmentReminders,
  sendAppointmentReminderEmail,
  processPendingReminders
};
