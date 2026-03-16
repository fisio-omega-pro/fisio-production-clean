const { db } = require('./config/firebase');

async function verificarConfiguracionIA() {
  try {
    const clinicDoc = await db.collection('clinicas').doc('VkZQrWpagjryISYfx2lU').get();
    const data = clinicDoc.data();
    
    console.log('🤖 CONFIGURACIÓN DE ANA:');
    console.log('📧 Email:', data.email);
    console.log('🏥 Clínica:', data.nombre_clinica);
    console.log('');
    console.log('🔍 CONFIGURACIÓN IA:');
    console.log('🤖 Nombre:', data.ana_name || 'Ana');
    console.log('🎨 Color:', data.ana_color || '#075E54');
    console.log('💬 Mensaje:', data.ana_welcome || 'NO');
    console.log('🖼️ Foto:', data.ana_photo || 'NO');
    console.log('🏢 Usa Logo:', data.ana_use_clinic_logo);
    console.log('');
    
    // Buscar configuración de modelo IA
    console.log('🔍 BUSCANDO MODELO IA...');
    
    // Revisar variables de entorno
    const { initEnv } = require('./config/env');
    const env = await initEnv();
    
    console.log('🔗 OPENAI_API_KEY:', env.OPENAI_API_KEY ? '✅ Configurada' : '❌ No configurada');
    console.log('🔗 ANTHROPIC_API_KEY:', env.ANTHROPIC_API_KEY ? '✅ Configurada' : '❌ No configurada');
    console.log('🔗 GOOGLE_AI_API_KEY:', env.GOOGLE_AI_API_KEY ? '✅ Configurada' : '❌ No configurada');
    
    // Revisar si hay configuración de modelo específico
    console.log('');
    console.log('🔍 MODELO CONFIGURADO:');
    console.log('🤖 ana_model:', data.ana_model || 'NO ESPECIFICADO');
    console.log('🧠 ana_provider:', data.ana_provider || 'NO ESPECIFICADO');
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

verificarConfiguracionIA();
