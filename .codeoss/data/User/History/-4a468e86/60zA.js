/**
 * 🔥 CONEXIÓN FIRESTORE OMEGA (CORREGIDA)
 */
const admin = require('firebase-admin');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const path = require('path');

const keyPath = path.join(__dirname, 'key.json');

// EL ID DEL NUEVO PROYECTO
const PROJECT_ID = 'fisiotool-omega-2026'; 

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(require(keyPath)),
      projectId: PROJECT_ID // <--- Aquí estaba el error, ahora apunta al nuevo
    });
    console.log(`✅ [FIREBASE] Conectado a ${PROJECT_ID}`);
  } catch (error) {
    console.error("❌ [FIREBASE] Error de credenciales:", error.message);
    process.exit(1);
  }
}

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

module.exports = { db, Timestamp, FieldValue, admin };