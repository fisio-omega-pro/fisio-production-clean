/**
 * 🔐 CONFIGURACIÓN DE ENTORNO OMEGA (NUEVA SEDE)
 */
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

// EL NUEVO ID DEL PROYECTO
const PROJECT_ID = 'fisiotool-omega-2026'; 

async function getSecret(name) {
  try {
    // Intentamos leer de la nueva caja fuerte
    const [version] = await client.accessSecretVersion({
      name: `projects/${PROJECT_ID}/secrets/${name}/versions/latest`,
    });
    return version.payload.data.toString();
  } catch (error) {
    // Si no existen los secretos en el nuevo proyecto aún, no pasa nada.
    // Stripe entrará en modo Offline y Ana funcionará igual.
    return process.env[name] || null;
  }
}

const initEnv = async () => {
  return {
    PROJECT_ID,
    // Usamos la central de EEUU para la IA (Máxima disponibilidad de modelos)
    // Tus datos de pacientes siguen en Europa (Firestore eur3)
    REGION: 'us-central1', 
    PORT: process.env.PORT || 8080,
    JWT_SECRET: await getSecret('JWT_SECRET') || 'fisiotool_temp_secret',
    STRIPE_SECRET_KEY: await getSecret('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: await getSecret('STRIPE_WEBHOOK_SECRET'),
    WHATSAPP_TOKEN: await getSecret('WHATSAPP_TOKEN'),
    PHONE_NUMBER_ID: await getSecret('PHONE_NUMBER_ID'),
    EMAIL_PASS: await getSecret('EMAIL_PASS'),
  };
};

module.exports = { initEnv };