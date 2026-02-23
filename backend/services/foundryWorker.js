const { db, Timestamp } = require('../config/firebase');
const { readEmails } = require('./emailReaderService');
const { sendEmail } = require('./emailSenderService');

const runFoundryTasks = async () => {
  console.log("⚙️ [WORKER] Vigilancia activa (Emails y Alertas LLC)...");
  const now = new Date();
  now.setHours(0,0,0,0);

  // 1. Oídos de Ana (Emails)
  try { await readEmails(); } catch (e) { console.error("Error Email:", e.message); }

  // 2. Vigilante LLC (Sin usar la IA para no saturar la cuota)
  try {
    const alertsSnap = await db.collection('foundry_alerts').where('status', '==', 'vigilando').get();
    for (const doc of alertsSnap.docs) {
      const alert = doc.data();
      const target = new Date(alert.target_date);
      target.setHours(0,0,0,0);
      const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

      if ([3, 2, 1].includes(diffDays)) {
        const { initEnv } = require('../config/env');
        const env = await initEnv();
        const to = String(env.ADMIN_EMAIL || 'fisiotoolsaas@gmail.com').trim();
        await sendEmail(to, `⚠️ ALERTA: ${alert.title}`, `Plazo legal: Quedan ${diffDays} días para ${alert.title}.`, 'INFO');
      }
    }
  } catch (e) { console.error("Error LLC:", e.message); }
};

// Nota: el worker NO debe auto-ejecutarse al importar el módulo.
// La orquestación se hace desde `server.js` para evitar duplicar crons.
module.exports = { runFoundryTasks };
