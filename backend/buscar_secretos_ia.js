const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

async function buscarSecretosReales() {
  try {
    console.log('🔍 Buscando secretos de IA en Secret Manager...');
    
    const client = new SecretManagerServiceClient();
    const projectId = 'fisio-backend-omega-740657183492';
    
    // Buscar secretos relacionados con IA
    const secretNames = [
      `projects/${projectId}/secrets/GOOGLE_AI_KEY/versions/latest`,
      `projects/${projectId}/secrets/ANTHROPIC_API_KEY/versions/latest`,
      `projects/${projectId}/secrets/CLAUDE_API_KEY/versions/latest`
    ];
    
    for (const secretName of secretNames) {
      try {
        const [version] = await client.accessSecretVersion({ name: secretName });
        const secret = version.payload.data.toString();
        console.log('✅ Secreto encontrado:', secretName.split('/')[3]);
        console.log('📏 Longitud:', secret.length);
        console.log('🔍 Primeros 10 chars:', secret.substring(0, 10) + '...');
        console.log('---');
      } catch (error) {
        console.log('❌ Secreto no encontrado:', secretName.split('/')[3]);
      }
    }
    
  } catch (error) {
    console.error('🔥 Error:', error.message);
  }
}

buscarSecretosReales();
