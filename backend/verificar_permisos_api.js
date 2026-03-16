const { GoogleGenerativeAI } = require('@google/generative-ai');

async function verificarPermisosApi() {
  try {
    console.log('🔍 VERIFICANDO PERMISOS DE LA API KEY...');
    
    // La API key que existe
    const apiKey = 'AIzaSyBPzl7x6Q2L9X8n4k5J3m2P1qR9w8E7F6D';
    
    console.log('🔧 Intentando listar modelos disponibles...');
    
    try {
      // Listar modelos disponibles
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
      const data = await response.json();
      
      if (data.models) {
        console.log('✅ Modelos disponibles:');
        data.models.forEach(model => {
          console.log('📱', model.name, '-', model.displayName);
        });
      } else {
        console.log('❌ Error:', data);
        console.log('🔍 La API key podría estar desactivada o sin permisos para Gemini API');
      }
      
    } catch (error) {
      console.error('🔥 Error verificando permisos:', error.message);
    }
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

verificarPermisosApi();
