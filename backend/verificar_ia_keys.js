const { initEnv } = require('./config/env');

async function verificarApiKeys() {
  try {
    const env = await initEnv();
    
    console.log('🔍 VERIFICACIÓN API KEYS:');
    console.log('🧠 Gemini Key:', env.GOOGLE_AI_KEY ? '✅ Existe' : '❌ No existe');
    console.log('📧 Claude Key:', env.ANTHROPIC_API_KEY ? '✅ Existe' : '❌ No existe');
    
    if (env.GOOGLE_AI_KEY) {
      console.log('🧠 Gemini Key (primeros 10 chars):', env.GOOGLE_AI_KEY.substring(0, 10) + '...');
      console.log('🧠 Gemini Key (longitud):', env.GOOGLE_AI_KEY.length);
    }
    
    if (env.ANTHROPIC_API_KEY) {
      console.log('📧 Claude Key (primeros 10 chars):', env.ANTHROPIC_API_KEY.substring(0, 10) + '...');
      console.log('📧 Claude Key (longitud):', env.ANTHROPIC_API_KEY.length);
    }
    
    console.log('\n❌ DIAGNÓSTICO:');
    console.log('🔴 Claude: No hay API key → Falla');
    console.log('🔴 Gemini: Hay API key pero modelos no funcionan → Key inválida o desactualizada');
    console.log('🔴 RESULTADO: Ana no puede funcionar sin IA');
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

verificarApiKeys();
