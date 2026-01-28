/**
 * 🔐 CONFIGURACIÓN DE ENTORNO OMEGA
 * Centraliza la carga de secretos desde Google Cloud Secret Manager.
 */
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

const PROJECT_ID = 'spatial-victory-480409-b7';

async function getSecret(name) {
  try {
    const [version] = await client.accessSecretVersion({
      name: `projects/${PROJECT_ID}/secrets/${name}/versions/latest`,
    });
    return version.payload.data.toString();
  } catch (error) {
    console.warn(`⚠️ [ENV] No se pudo cargar el secreto ${name}. Usando fallback o nulo.`);
    return process.env[name] || null;
  }
}

// Exportamos una función de inicialización para que el server espere a las llaves
const initEnv = async () => {
  return {
    PROJECT_ID,
    REGION: 'europe-west1',
    PORT: process.env.PORT || 8080,
    JWT_SECRET: await getSecret('JWT_SECRET'),
    STRIPE_SECRET_KEY: await getSecret('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: await getSecret('STRIPE_WEBHOOK_SECRET'),
    WHATSAPP_TOKEN: await getSecret('WHATSAPP_TOKEN'),
    PHONE_NUMBER_ID: await getSecret('PHONE_NUMBER_ID'),
    EMAIL_PASS: await getSecret('EMAIL_PASS'),
  };
};
module.exports = {
  PROJECT_ID: 'spatial-victory-480409-b7',
  REGION: 'us-central1', // <--- CAMBIO CRÍTICO: La central donde están todos los modelos
  JWT_SECRET: process.env.JWT_SECRET || 'fisiotool_supreme_secret_2026',
  // ... resto del archivo igual ...
};