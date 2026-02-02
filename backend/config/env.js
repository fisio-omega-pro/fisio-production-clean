const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function getSecret(name) {
    try {
        const [version] = await client.accessSecretVersion({
            name: `projects/fisiotool-pro-2026/secrets/${name}/versions/latest`,
        });
        return version.payload.data.toString();
    } catch (e) {
        console.warn(`⚠️ Aviso: Secreto ${name} no disponible.`);
        return '';
    }
}

async function initEnv() {
    // ✅ Priorizar variables de entorno expuestas por Cloud Run
    return {
        PROJECT_ID: process.env.PROJECT_ID || 'fisiotool-pro-2026',
        GOOGLE_AI_KEY: process.env.GOOGLE_AI_KEY || await getSecret('GOOGLE_AI_KEY'),
        GOOGLE_AI_MODEL: process.env.GOOGLE_AI_MODEL || await getSecret('GOOGLE_AI_MODEL'),
        JWT_SECRET: process.env.JWT_SECRET || await getSecret('JWT_SECRET') || 'fisiotool_master_key_2026',
        STRIPE_SK: process.env.STRIPE_SK || await getSecret('STRIPE_SECRET_KEY'),
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || await getSecret('STRIPE_WEBHOOK_SECRET'),
        ADMIN_FOUNDRY_KEY: process.env.ADMIN_FOUNDRY_KEY || await getSecret('ADMIN_FOUNDRY_KEY')
    };
}

module.exports = { initEnv };
