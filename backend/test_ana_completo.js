console.log('🔧 TEST INTERNO COMPLETO DE ANA...');
console.log('================================');

const anaService = require('./services/anaService');

async function testInternoAna() {
  try {
    console.log('\n📋 TEST 1: SALUDO SIMPLE');
    const response1 = await anaService.processMessage('VkZQrWpagjryISYfx2lU', 'Hola Ana');
    console.log('👤 Usuario: Hola Ana');
    console.log('🤖 Ana:', response1.reply);
    console.log('📏 Longitud:', response1.reply.length);
    
    console.log('\n📋 TEST 2: PREGUNTA CAPACIDADES');
    const response2 = await anaService.processMessage('VkZQrWpagjryISYfx2lU', '¿Qué puedes hacer por mí?');
    console.log('👤 Usuario: ¿Qué puedes hacer por mí?');
    console.log('🤖 Ana:', response2.reply);
    console.log('📏 Longitud:', response2.reply.length);
    
    console.log('\n📋 TEST 3: PEDIR CITA');
    const response3 = await anaService.processMessage('VkZQrWpagjryISYfx2lU', 'Quiero reservar una cita');
    console.log('👤 Usuario: Quiero reservar una cita');
    console.log('🤖 Ana:', response3.reply);
    console.log('📏 Longitud:', response3.reply.length);
    
    console.log('\n📋 TEST 4: HORARIOS');
    const response4 = await anaService.processMessage('VkZQrWpagjryISYfx2lU', '¿Qué horarios tienes?');
    console.log('👤 Usuario: ¿Qué horarios tienes?');
    console.log('🤖 Ana:', response4.reply);
    console.log('📏 Longitud:', response4.reply.length);
    
    console.log('\n📋 TEST 5: PREGUNTA DIFERENTE');
    const response5 = await anaService.processMessage('VkZQrWpagjryISYfx2lU', '¿Me recomiendas algo para el dolor de espalda?');
    console.log('👤 Usuario: ¿Me recomiendas algo para el dolor de espalda?');
    console.log('🤖 Ana:', response5.reply);
    console.log('📏 Longitud:', response5.reply.length);
    
    console.log('\n🔍 ANÁLISIS DE RESPUESTAS:');
    console.log('📊 ¿Todas las respuestas son iguales?', 
      response1.reply === response2.reply && 
      response2.reply === response3.reply && 
      response3.reply === response4.reply && 
      response4.reply === response5.reply ? 'SÍ - PROBLEMA' : 'NO - BIEN');
    
    console.log('\n🎯 DIAGNÓSTICO FINAL:');
    if (response1.reply === response2.reply) {
      console.log('❌ Ana está repitiendo la misma respuesta');
      console.log('🔍 Posible causa: Problema con Gemini o Claude');
    } else {
      console.log('✅ Ana responde diferente a cada pregunta');
    }
    
  } catch (error) {
    console.error('🔥 Error en test:', error.message);
  }
}

testInternoAna();
