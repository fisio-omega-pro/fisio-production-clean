const admin = require('firebase-admin');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { PROJECT_ID } = require('./env');
const path = require('path');

// Localizamos la ruta física de tu llave JSON
const serviceAccountPath = path.join(__dirname, 'key.json');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // 🛡️ Aquí es donde usamos la llave física que acabas de subir
      credential: admin.credential.cert(require(serviceAccountPath)),
      projectId: PROJECT_ID
    });
    console.log("✅ [FIREBASE] Conexión OMEGA establecida con éxito usando key.json.");
  } catch (error) {
    console.error("❌ [FIREBASE] Error al cargar key.json. Revisa que el nombre sea exacto.");
    process.exit(1);
  }
}

const db = getFirestore();

module.exports = {
  admin,
  db,
  Timestamp
};