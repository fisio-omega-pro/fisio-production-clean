const { Storage } = require('@google-cloud/storage');

async function configurarGCS() {
  try {
    console.log('🔧 Configurando Google Cloud Storage...');
    
    const storage = new Storage();
    const bucketName = 'fisiotool-backend-uploads';
    
    // Verificar si el bucket ya existe
    const [exists] = await storage.bucket(bucketName).exists();
    
    if (!exists) {
      console.log('📦 Creando bucket:', bucketName);
      await storage.createBucket(bucketName, {
        location: 'europe-west1',
        storageClass: 'STANDARD'
      });
      console.log('✅ Bucket creado exitosamente');
    } else {
      console.log('✅ Bucket ya existe');
    }
    
    // Configurar CORS para el bucket
    const bucket = storage.bucket(bucketName);
    await bucket.setCorsConfiguration([
      {
        origin: ['*'],
        method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        responseHeader: ['*'],
        maxAgeSeconds: 3600
      }
    ]);
    console.log('✅ CORS configurado para el bucket');
    
    // Crear carpetas necesarias
    const folders = ['ana-photos/', 'logo/', 'temp/'];
    for (const folder of folders) {
      const file = bucket.file(folder);
      await file.save('');
      console.log('✅ Carpeta creada:', folder);
    }
    
    console.log('');
    console.log('🎯 CONFIGURACIÓN COMPLETADA');
    console.log('📦 Bucket:', bucketName);
    console.log('🔧 Ahora configura GCS_BUCKET_NAME en Secret Manager');
    console.log('🔗 Valor a configurar: fisiotool-backend-uploads');
    
    return bucketName;
    
  } catch (error) {
    console.error('🔥 Error configurando GCS:', error);
    throw error;
  }
}

configurarGCS().then(bucketName => {
  console.log('✅ Google Cloud Storage listo para usar');
}).catch(console.error);
