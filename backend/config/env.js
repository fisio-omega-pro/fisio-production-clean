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
        return process.env[name] || '';
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
        ADMIN_FOUNDRY_KEY: process.env.ADMIN_FOUNDRY_KEY || await getSecret('ADMIN_FOUNDRY_KEY'),
        
        // 📧 Configuración de emails (secretos separados)
        ANA_MAIL: {
            user: process.env.EMAIL_USER_ANA || await getSecret('EMAIL_USER_ANA'),
            pass: process.env.EMAIL_PASS_ANA || await getSecret('EMAIL_PASS_ANA')
        },
        INFO_MAIL: {
            user: process.env.EMAIL_USER_INFO || await getSecret('EMAIL_USER_INFO'),
            pass: process.env.EMAIL_PASS_INFO || await getSecret('EMAIL_PASS_INFO')
        },
        EMAIL_PASS: process.env.EMAIL_PASS || await getSecret('EMAIL_PASS') || '',
        ADMIN_EMAIL: 'fisiotoolsaas@gmail.com' // Email del admin para alertas críticas
    };
}

module.exports = { initEnv };
