/**
 * 🔥 CONEXIÓN A FIRESTORE (BASE DE DATOS SOBERANA)
 * Inicializa la conexión segura usando la identidad nativa de Google Cloud.
 */

const admin = require('firebase-admin');
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { PROJECT_ID } = require('./env');

// Patrón Singleton: Asegura que solo haya una conexión activa
if (!admin.apps.length) {
  try {
    initializeApp({
      credential: applicationDefault(), // Usa la identidad de Cloud Run/Shell automáticamente
      projectId: PROJECT_ID
    });
    console.log("✅ [FIREBASE] Conexión establecida con éxito.");
  } catch (error) {
    console.error("❌ [FIREBASE] Error fatal al conectar:", error);
    process.exit(1); // Si no hay base de datos, apagamos el servidor por seguridad
  }
}

const db = getFirestore();

module.exports = {
  admin,
  db,
  Timestamp
};