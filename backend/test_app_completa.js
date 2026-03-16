console.log('🔧 PROBANDO APP COMPLETA CON EL ARREGLO...');

// Simular petición completa del frontend
const testCompleto = async () => {
  try {
    // 1. Petición del frontend al API route
    const frontendResponse = await fetch('http://localhost:3000/api/public/ana-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hola Ana, ¿qué puedes hacer por mí?',
        clinicId: 'VkZQrWpagjryISYfx2lU'
      })
    });
    
    const data = await frontendResponse.json();
    console.log('✅ Respuesta completa:', data);
    console.log('🎯 ¿Tiene reply?', data.reply ? 'SÍ' : 'NO');
    
    // 2. Segunda prueba
    const response2 = await fetch('http://localhost:3000/api/public/ana-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '¿Qué horarios tienes?',
        clinicId: 'VkZQrWpagjryISYfx2lU'
      })
    });
    
    const data2 = await response2.json();
    console.log('✅ Segunda respuesta:', data2.reply);
    
    // 3. Comparar
    console.log('\n🔍 ¿SON DIFERENTES?');
    console.log(data.reply === data2.reply ? '❌ IGUALES - PROBLEMA' : '✅ DIFERENTES - ARREGLADO');
    
  } catch (error) {
    console.error('🔥 Error:', error.message);
  }
};

setTimeout(testCompleto, 2000);
