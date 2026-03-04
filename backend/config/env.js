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
    // 🛡️ Priorizar Secret Manager para claves críticas (especialmente Stripe)
    // Esto evita que archivos .env locales subidos por error pisen las llaves de producción.
    const secretKeys = [
        'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'FRONTEND_URL', 'GOOGLE_AI_KEY',
        'JWT_SECRET', 'ADMIN_FOUNDRY_KEY', 'STRIPE_PRICE_SOLO', 'STRIPE_PRICE_TEAM'
    ];

    // Cache de secretos para evitar llamadas repetidas
    const secrets = {};
    for (const k of secretKeys) {
        secrets[k] = await getSecret(k);
    }

    const stripeSk = secrets.STRIPE_SECRET_KEY || process.env.STRIPE_SK || process.env.STRIPE_SECRET_KEY;
    const stripeWh = secrets.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

    if (stripeSk && stripeSk.startsWith('sk_')) {
        const source = secrets.STRIPE_SECRET_KEY ? 'SECRET_MANAGER' : (process.env.STRIPE_SK || process.env.STRIPE_SECRET_KEY ? 'LOCAL_ENV' : 'UNKNOWN');
        const masked = stripeSk.substring(0, 7) + '...' + stripeSk.substring(stripeSk.length - 4);
        console.log(`💳 [ENV] STRIPE_SK cargada desde: ${source} (${stripeSk.includes('live') ? 'LIVE' : 'TEST'}) [${masked}]`);
    } else {
        console.warn(`⚠️ [ENV] STRIPE_SK no configurada o inválida ("${stripeSk || 'EMPTY'}").`);
    }

    return {
        PROJECT_ID: process.env.PROJECT_ID || 'fisiotool-pro-2026',
        FRONTEND_URL: secrets.FRONTEND_URL || process.env.FRONTEND_URL,
        GOOGLE_AI_KEY: secrets.GOOGLE_AI_KEY || process.env.GOOGLE_AI_KEY,
        GOOGLE_AI_MODEL: process.env.GOOGLE_AI_MODEL || await getSecret('GOOGLE_AI_MODEL') || 'gemini-1.5-flash',
        JWT_SECRET: secrets.JWT_SECRET || process.env.JWT_SECRET || (() => { console.error('🔴 CRITICAL: JWT_SECRET no configurado.'); return 'fallback_secret_for_local_dev'; })(),
        // Stripe
        STRIPE_SK: stripeSk,
        STRIPE_WEBHOOK_SECRET: stripeWh,
        STRIPE_PRICE_SOLO: secrets.STRIPE_PRICE_SOLO || process.env.STRIPE_PRICE_SOLO,
        STRIPE_PRICE_BASE: await getSecret('STRIPE_PRICE_BASE') || process.env.STRIPE_PRICE_BASE,
        STRIPE_PRICE_TEAM: secrets.STRIPE_PRICE_TEAM || process.env.STRIPE_PRICE_TEAM,
        STRIPE_PRICE_CORPORATE: await getSecret('STRIPE_PRICE_CORPORATE') || process.env.STRIPE_PRICE_CORPORATE,
        STRIPE_REFERRAL_COUPON: await getSecret('STRIPE_REFERRAL_COUPON') || process.env.STRIPE_REFERRAL_COUPON || 'REFERRAL50',
        FREE_TRIAL_CAP: parseInt((await getSecret('FREE_TRIAL_CAP')) || process.env.FREE_TRIAL_CAP || '50', 10) || 50,
        CORS_ORIGINS: await getSecret('CORS_ORIGINS') || process.env.CORS_ORIGINS || '',
        GCS_BUCKET_NAME: await getSecret('GCS_BUCKET_NAME') || process.env.GCS_BUCKET_NAME || 'fisiotool-backend-uploads',
        ADMIN_FOUNDRY_KEY: secrets.ADMIN_FOUNDRY_KEY || process.env.ADMIN_FOUNDRY_KEY,

        // 📧 Configuración de emails
        ANA_MAIL: {
            user: await getSecret('EMAIL_USER_ANA') || process.env.EMAIL_USER_ANA,
            pass: await getSecret('EMAIL_PASS_ANA') || process.env.EMAIL_PASS_ANA
        },
        INFO_MAIL: {
            user: await getSecret('EMAIL_USER_INFO') || process.env.EMAIL_USER_INFO,
            pass: await getSecret('EMAIL_PASS_INFO') || process.env.EMAIL_PASS_INFO
        },
        EMAIL_PASS: await getSecret('EMAIL_PASS') || process.env.EMAIL_PASS || '',
        ADMIN_EMAIL: await getSecret('ADMIN_EMAIL') || process.env.ADMIN_EMAIL || 'fisiotoolsaas@gmail.com'
    };
}


module.exports = { initEnv };
