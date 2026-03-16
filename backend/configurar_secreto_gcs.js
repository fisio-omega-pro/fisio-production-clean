const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

async function configurarSecretoGCS() {
  try {
    const client = new SecretManagerServiceClient();
    const projectId = 'fisio-backend-omega-740657183492';
    const secretId = 'GCS_BUCKET_NAME';
    const secretValue = 'fisiotool-backend-uploads';
    
    console.log('🔧 Configurando secreto GCS_BUCKET_NAME...');
    
    // Crear o actualizar el secreto
    const parent = `projects/${projectId}`;
    const secretPath = `projects/${projectId}/secrets/${secretId}`;
    
    try {
      // Intentar crear el secreto
      await client.createSecret({
        parent: parent,
        secretId: secretId,
        secret: {
          replication: {
            automatic: {}
          }
        }
      });
      console.log('✅ Secreto creado');
    } catch (error) {
      if (error.code === 6) {
        console.log('✅ Secreto ya existe');
      } else {
        throw error;
      }
    }
    
    // Añadir la versión del secreto
    await client.addSecretVersion({
      parent: secretPath,
      payload: {
        data: Buffer.from(secretValue, 'utf8')
      }
    });
    
    console.log('✅ Valor del secreto configurado:', secretValue);
    console.log('🎯 GCS_BUCKET_NAME configurado exitosamente');
    
  } catch (error) {
    console.error('🔥 Error configurando secreto:', error);
  }
}

configurarSecretoGCS();
