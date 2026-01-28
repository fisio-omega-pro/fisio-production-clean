/**
 * 🔐 GESTOR DE VARIABLES DE ENTORNO (S.S.O.T - Single Source of Truth)
 * Aquí centralizamos todas las configuraciones. Si falta algo, lo sabremos aquí.
 */

// Detectamos si estamos en Cloud Run o en local
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  // --- IDENTIDAD INFRAESTRUCTURA ---
  PROJECT_ID: 'spatial-victory-480409-b7', // Tu ID fijo
  REGION: 'europe-west1',                  // Tu región fija
  
  // --- SEGURIDAD (CRÍTICO) ---
  // En producción, JWT_SECRET debe venir de las variables de entorno de Cloud Run.
  // Aquí dejamos un fallback SOLO para desarrollo local si no está definida.
  JWT_SECRET: process.env.JWT_SECRET || 'fisiotool_dev_secret_temporal_2026',
  VERIFY_TOKEN: process.env.VERIFY_TOKEN || 'fisio_prod_secure_2026',
  
  // --- PAGOS (STRIPE) ---
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // --- COMUNICACIONES (META / EMAIL) ---
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
  EMAIL_USER: "ana@fisiotool.com",
  EMAIL_PASS: process.env.EMAIL_PASS, // Contraseña de aplicación de Gmail/Hosting
  
  // --- FLAGS DE ENTORNO ---
  IS_PRODUCTION: isProduction,
  PORT: process.env.PORT || 8080
};