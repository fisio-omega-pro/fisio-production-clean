/**
 * 📱 WEB PUSH NOTIFICATION SERVICE
 * Envía notificaciones push a pacientes con la app PWA instalada.
 * Usa Web Push Protocol con claves VAPID para autenticación sin servidor externo.
 *
 * Colección Firestore: push_subscriptions
 *   - clinic_id, email, subscription (objeto WebPush), created_at, last_used_at
 */

const webpush = require('web-push');
const { db, Timestamp } = require('../config/firebase');
const { initEnv } = require('../config/env');

let vapidInitialized = false;

async function ensureVapid() {
  if (vapidInitialized) return;
  const env = await initEnv();
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    throw new Error('VAPID keys not configured');
  }
  webpush.setVapidDetails(
    'mailto:info@fisiotool.com',
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );
  vapidInitialized = true;
}

// Guardar suscripción push de un paciente
async function savePushSubscription({ clinicId, email, nombre, subscription }) {
  if (!subscription || !subscription.endpoint) throw new Error('Invalid subscription');
  const endpoint = String(subscription.endpoint);

  // Upsert por endpoint — evita duplicados
  const existing = await db.collection('push_subscriptions')
    .where('endpoint', '==', endpoint).limit(1).get();

  if (!existing.empty) {
    await existing.docs[0].ref.set({
      clinic_id: clinicId,
      email: String(email || '').toLowerCase().trim(),
      nombre: String(nombre || ''),
      subscription,
      updated_at: Timestamp.now()
    }, { merge: true });
    console.log(`📱 [PUSH] Suscripción actualizada: ${email}`);
  } else {
    await db.collection('push_subscriptions').add({
      clinic_id: clinicId,
      email: String(email || '').toLowerCase().trim(),
      nombre: String(nombre || ''),
      endpoint,
      subscription,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    console.log(`📱 [PUSH] Nueva suscripción registrada: ${email}`);
  }
  return { ok: true };
}

// Enviar push a todos los dispositivos de un email en una clínica
async function sendPushToPatient({ clinicId, email, title, body, url, icon, data = {} }) {
  await ensureVapid();

  const snap = await db.collection('push_subscriptions')
    .where('clinic_id', '==', clinicId)
    .where('email', '==', String(email).toLowerCase().trim())
    .get();

  if (snap.empty) return { ok: true, sent: 0, reason: 'no_subscriptions' };

  const payload = JSON.stringify({
    title: String(title || 'FisioTool Pro'),
    body: String(body || ''),
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    url: url || '/ana',
    data
  });

  let sent = 0;
  const expired = [];

  for (const doc of snap.docs) {
    const sub = doc.data().subscription;
    try {
      await webpush.sendNotification(sub, payload);
      await doc.ref.set({ last_used_at: Timestamp.now() }, { merge: true });
      sent++;
      console.log(`📱 [PUSH] Enviado a ${email} (${doc.id})`);
    } catch (e) {
      // 410 Gone = suscripción expirada, limpiar
      if (e.statusCode === 410 || e.statusCode === 404) {
        expired.push(doc.id);
        console.warn(`📱 [PUSH] Suscripción expirada para ${email}, eliminando...`);
      } else {
        console.error(`📱 [PUSH] Error enviando a ${email}:`, e.message);
      }
    }
  }

  // Limpiar suscripciones expiradas
  for (const id of expired) {
    await db.collection('push_subscriptions').doc(id).delete();
  }

  return { ok: true, sent };
}

// Enviar push a toda una clínica (para mensajes masivos)
async function sendPushToClinic({ clinicId, title, body, url, icon, maxRecipients = 200 }) {
  await ensureVapid();

  const snap = await db.collection('push_subscriptions')
    .where('clinic_id', '==', clinicId)
    .limit(maxRecipients).get();

  if (snap.empty) return { ok: true, sent: 0 };

  const payload = JSON.stringify({
    title: String(title || 'FisioTool Pro'),
    body: String(body || ''),
    icon: icon || '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    url: url || '/ana'
  });

  let sent = 0;
  for (const doc of snap.docs) {
    try {
      await webpush.sendNotification(doc.data().subscription, payload);
      sent++;
    } catch (e) {
      if (e.statusCode === 410 || e.statusCode === 404) {
        await doc.ref.delete();
      }
    }
  }
  return { ok: true, sent };
}

module.exports = { savePushSubscription, sendPushToPatient, sendPushToClinic };
