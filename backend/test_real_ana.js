console.log('🔧 TEST REAL DE ANA EN LA APP...');
console.log('================================');

const anaService = require('./services/anaService');

async function testRealAna() {
  try {
    console.log('\n📋 ENVIANDO MENSAJE REAL COMO EN LA APP...');
    
    // Simular exactamente lo que envía la app
    const req = {
      body: {
        message: 'Hola Ana, ¿qué puedes hacer por mí?',
        clinicId: 'VkZQrWpagjryISYfx2lU'
      },
      clinicId: 'VkZQrWpagjryISYfx2lU'
    };
    
    console.log('👤 Mensaje:', req.body.message);
    console.log('🏥 ClinicId:', req.clinicId);
    
    // Llamar a la función exacta que usa el chat
    const result = await anaService.processMessage(req.clinicId, req.body.message);
    
    console.log('🤖 Respuesta de Ana:', result.reply);
    console.log('📏 Longitud:', result.reply.length);
    
    // Probar con otra pregunta
    console.log('\n📋 SEGUNDA PRUEBA...');
    const result2 = await anaService.processMessage(req.clinicId, '¿Qué horarios tienes?');
    console.log('👤 Pregunta: ¿Qué horarios tienes?');
    console.log('🤖 Respuesta:', result2.reply);
    console.log('📏 Longitud:', result2.reply.length);
    
    // Comparar
    console.log('\n🔍 ¿SON IGUALES LAS RESPUESTAS?');
    console.log(result.reply === result2.reply ? '❌ SÍ - PROBLEMA' : '✅ NO - BIEN');
    
    if (result.reply === result2.reply) {
      console.log('\n🔥 PROBLEMA ENCONTRADO: Ana repite respuestas');
      console.log('🔍 Vamos a revisar el servicio...');
    }
    
  } catch (error) {
    console.error('🔥 Error:', error.message);
  }
}

testRealAna();
