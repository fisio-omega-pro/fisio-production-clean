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
        FRONTEND_URL: process.env.FRONTEND_URL || await getSecret('FRONTEND_URL'),
        GOOGLE_AI_KEY: process.env.GOOGLE_AI_KEY || await getSecret('GOOGLE_AI_KEY'),
        GOOGLE_AI_MODEL: process.env.GOOGLE_AI_MODEL || await getSecret('GOOGLE_AI_MODEL'),
        JWT_SECRET: process.env.JWT_SECRET || await getSecret('JWT_SECRET') || (() => { console.error('🔴 CRITICAL: JWT_SECRET no configurado. Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'); return ''; })(),
        // Stripe (ver backend/STRIPE_SETUP.md): clave, webhook, price IDs, cupón referidos
        STRIPE_SK: process.env.STRIPE_SK || process.env.STRIPE_SECRET_KEY || await getSecret('STRIPE_SECRET_KEY'),
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || await getSecret('STRIPE_WEBHOOK_SECRET'),
        STRIPE_PRICE_SOLO: process.env.STRIPE_PRICE_SOLO || await getSecret('STRIPE_PRICE_SOLO'),
        STRIPE_PRICE_BASE: process.env.STRIPE_PRICE_BASE || await getSecret('STRIPE_PRICE_BASE'), // alias plan base 100€ (mismo que STRIPE_PRICE_SOLO)
        STRIPE_PRICE_TEAM: process.env.STRIPE_PRICE_TEAM || await getSecret('STRIPE_PRICE_TEAM'),
        STRIPE_PRICE_CORPORATE: process.env.STRIPE_PRICE_CORPORATE || await getSecret('STRIPE_PRICE_CORPORATE'),
        STRIPE_REFERRAL_COUPON: process.env.STRIPE_REFERRAL_COUPON || await getSecret('STRIPE_REFERRAL_COUPON') || 'REFERRAL50',
        // Límite de fisios para ofrecer 30 días gratis; a partir de (FREE_TRIAL_CAP + 1) solo referidos 50% o 100%
        FREE_TRIAL_CAP: parseInt(process.env.FREE_TRIAL_CAP || (await getSecret('FREE_TRIAL_CAP')) || '50', 10) || 50,
        CORS_ORIGINS: process.env.CORS_ORIGINS || (await getSecret('CORS_ORIGINS')) || '',
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
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || await getSecret('ADMIN_EMAIL') || 'fisiotoolsaas@gmail.com'
    };
}

module.exports = { initEnv };
