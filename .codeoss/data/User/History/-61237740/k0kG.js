/**
 * 🔐 CONFIGURACIÓN DE ENTORNO BLINDADA
 * Compatible con Vertex AI (USA) y Server Omega.
 */

// 1. CONSTANTES MAESTRAS
const PROJECT_ID = 'spatial-victory-480409-b7';
const REGION = 'us-central1'; // <--- LA SOLUCIÓN (USA para la IA)

// 2. FUNCIÓN DE INICIALIZACIÓN (Para server.js)
const initEnv = async () => {
  return {
    PROJECT_ID,
    REGION,
    PORT: process.env.PORT || 8080,
    JWT_SECRET: process.env.JWT_SECRET || 'fisiotool_supreme_secret_2026',
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
    PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
    EMAIL_PASS: process.env.EMAIL_PASS,
  };
};

// 3. EXPORTACIÓN HÍBRIDA (Para vertexai.js y server.js)
module.exports = {
  PROJECT_ID,
  REGION,
  initEnv
};