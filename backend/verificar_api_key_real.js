const { initEnv } = require('./config/env');

async function verificarApiKeyReal() {
  try {
    console.log('🔍 VERIFICANDO API KEY REAL...');
    
    const env = await initEnv();
    console.log('🧠 API Key:', env.GOOGLE_AI_KEY ? '✅ Existe' : '❌ No existe');
    
    if (env.GOOGLE_AI_KEY) {
      console.log('📏 Longitud:', env.GOOGLE_AI_KEY.length);
      console.log('🔍 Formato:', env.GOOGLE_AI_KEY.startsWith('AIzaSy') ? '✅ Correcto' : '❌ Incorrecto');
      console.log('🔍 Primeros 10 chars:', env.GOOGLE_AI_KEY.substring(0, 10) + '...');
      
      // Probar la API key directamente
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(env.GOOGLE_AI_KEY);
      
      console.log('🔧 Probando API key con Gemini 2.0...');
      
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent('Hola');
        const response = await result.response;
        console.log('✅ API Key funciona:', response.text());
      } catch (error) {
        console.error('❌ Error con Gemini 2.0:', error.message);
        
        // Probar con otros modelos disponibles
        const modelos = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
        for (const modelo of modelos) {
          try {
            console.log('🔍 Probando modelo:', modelo);
            const modelTest = genAI.getGenerativeModel({ model: modelo });
            const resultTest = await modelTest.generateContent('Hola');
            console.log('✅', modelo, '- FUNCIONA');
            
            // Si funciona, actualizar el modelo
            console.log('🔧 DEBERÍAS USAR ESTE MODELO EN VEZ DE GEMINI 2.0');
            break;
          } catch (err) {
            console.log('❌', modelo, '- ERROR');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

verificarApiKeyReal();
