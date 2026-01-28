/**
 * 🔐 GESTOR DE VARIABLES DE ENTORNO (S.S.O.T - Single Source of Truth)
 * Arquitectura: Centralizada, Validadora y Segura.
 */

const isProduction = process.env.NODE_ENV === 'production';

// Configuración Base
const config = {
  // --- IDENTIDAD INFRAESTRUCTURA ---
  // Mantenemos Bélgica (europe-west1) por soberanía de datos en la UE.
  PROJECT_ID: process.env.GCP_PROJECT_ID || 'spatial-victory-480409-b7',
  REGION: process.env.GCP_REGION || 'europe-west1',

  // --- FLAGS DE ENTORNO ---
  IS_PRODUCTION: isProduction,
  PORT: parseInt(process.env.PORT, 10) || 8080,

  // --- SEGURIDAD ---
  // En producción, es obligatorio que estas variables existan en el entorno.
  JWT_SECRET: process.env.JWT_SECRET || (isProduction ? null : 'dev_secret_only_for_local'),
  VERIFY_TOKEN: process.env.VERIFY_TOKEN || 'fisio_prod_secure_2026',

  // --- PAGOS (STRIPE) ---
  STRIPE: {
    SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  },

  // --- COMUNICACIONES (META / EMAIL) ---
  WHATSAPP: {
    TOKEN: process.env.WHATSAPP_TOKEN,
    PHONE_ID: process.env.PHONE_NUMBER_ID,
  },
  EMAIL: {
    USER: "ana@fisiotool.com",
    PASS: process.env.EMAIL_PASS,
  }
};

/**
 * VALIDACIÓN DE SEGURIDAD
 * Evita que la aplicación arranque si faltan variables críticas en producción.
 */
const validateConfig = () => {
  if (isProduction) {
    const criticalVars = [
      { name: 'JWT_SECRET', value: config.JWT_SECRET },
      { name: 'STRIPE_SECRET_KEY', value: config.STRIPE.SECRET_KEY },
      { name: 'WHATSAPP_TOKEN', value: config.WHATSAPP.TOKEN },
      { name: 'EMAIL_PASS', value: config.EMAIL.PASS }
    ];

    const missing = criticalVars.filter(v => !v.value).map(v => v.name);

    if (missing.length > 0) {
      console.error('❌ ERROR CRÍTICO: Faltan variables de entorno obligatorias:', missing.join(', '));
      process.exit(1); // Detiene la ejecución para evitar fallos impredecibles
    }
  }
};

validateConfig();

module.exports = config;