const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function getSecret(name) {
    try {
        const [version] = await client.accessSecretVersion({
            name: `projects/fisiotool-pro-2026/secrets/${name}/versions/latest`,
        });
        return version.payload.data.toString();
    } catch (e) {
        console.warn(`⚠️ Aviso: Secreto ${name} no disponible. Usando entorno.`);
        return process.env[name] || '';
    }
}

async function initEnv() {
    return {
        PROJECT_ID: 'fisiotool-pro-2026',
        GOOGLE_AI_KEY: await getSecret('GOOGLE_AI_KEY'),
        JWT_SECRET: await getSecret('JWT_SECRET') || 'fisiotool_master_key_2026',
        STRIPE_SK: await getSecret('STRIPE_SK')
    };
}
module.exports = { initEnv };
