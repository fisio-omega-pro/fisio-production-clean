console.log('🔧 VERIFICANDO URL DEL LOGO...');

const { db } = require('./config/firebase');

async function verificarLogoUrl() {
  try {
    const clinicDoc = await db.collection('clinicas').doc('VkZQrWpagjryISYfx2lU').get();
    const data = clinicDoc.data();
    
    console.log('🏥 Clínica:', data.nombre_clinica);
    console.log('🖼️ Logo URL:', data.logo_url);
    
    // Construir URL completa
    const fullLogoUrl = data.logo_url ? 'https://fisio-backend-omega-740657183492.europe-west1.run.app' + data.logo_url : null;
    console.log('🌐 URL completa:', fullLogoUrl);
    
    // Probar si la imagen es accesible
    if (fullLogoUrl) {
      try {
        const response = await fetch(fullLogoUrl);
        console.log('✅ Imagen accesible:', response.status === 200 ? 'SÍ' : 'NO');
        if (response.status === 200) {
          console.log('📊 Content-Type:', response.headers.get('content-type'));
          console.log('📊 Content-Length:', response.headers.get('content-length'));
        }
      } catch (error) {
        console.log('❌ Error accediendo a la imagen:', error.message);
      }
    }
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

verificarLogoUrl();
