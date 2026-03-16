console.log('🔧 DIAGNÓSTICO COMPLETO...');

const { db } = require('./config/firebase');

async function diagnosticarTodo() {
  try {
    // 1. Verificar configuración de Ana
    const clinicDoc = await db.collection('clinicas').doc('VkZQrWpagjryISYfx2lU').get();
    const data = clinicDoc.data();
    
    console.log('🏥 CLÍNICA:', data.nombre_clinica);
    console.log('🤖 ANA NOMBRE:', data.ana_nombre);
    console.log('📝 ANA MENSAJE:', data.ana_mensaje);
    console.log('🖼️ LOGO URL:', data.logo_url);
    console.log('✅ ANA ACTIVA:', data.ana_activa);
    
    // 2. Probar Ana directamente
    const anaService = require('./services/anaService');
    console.log('\n🔧 PROBANDO ANA DIRECTAMENTE...');
    
    const result = await anaService.processMessage('VkZQrWpagjryISYfx2lU', 'Hola Ana');
    console.log('✅ Ana responde:', result.reply);
    
    // 3. Probar API de producción
    console.log('\n🔧 PROBANDO API DE PRODUCCIÓN...');
    
    const response = await fetch('https://fisio-backend-omega-740657183492.europe-west1.run.app/api/public/ana-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Clinic-ID': 'VkZQrWpagjryISYfx2lU'
      },
      body: JSON.stringify({
        message: 'Hola Ana',
        clinicId: 'VkZQrWpagjryISYfx2lU'
      })
    });
    
    const apiData = await response.json();
    console.log('✅ API responde:', apiData);
    
  } catch (error) {
    console.error('🔥 Error:', error.message);
  }
}

diagnosticarTodo();
