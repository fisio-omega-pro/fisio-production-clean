const { db } = require('./config/firebase');

async function verificarPasosCompletados() {
  try {
    console.log('🔍 VERIFICANDO QUE LOS 3 PASOS SE COMPLETARON');
    console.log('='.repeat(60));
    
    const clinicDoc = await db.collection('clinicas').doc('VkZQrWpagjryISYfx2lU').get();
    const data = clinicDoc.data();
    
    console.log('🏥 Clínica:', data.nombre_clinica);
    console.log('📧 Email:', data.email);
    
    console.log('\n📋 VERIFICACIÓN DE PASOS:');
    
    // PASO 1: LOGO
    const paso1Logo = data.logo_url && !data.logo_url.includes('placeholder');
    console.log('✅ PASO 1 - LOGO:', paso1Logo ? 'COMPLETADO ✅' : 'PENDIENTE ❌');
    console.log('   📁 Logo URL:', data.logo_url || 'SIN LOGO');
    
    // PASO 2: SUSCRIPCIÓN
    const paso2Suscripcion = data.subscription_active;
    console.log('✅ PASO 2 - SUSCRIPCIÓN:', paso2Suscripcion ? 'COMPLETADO ✅' : 'PENDIENTE ❌');
    console.log('   💳 Estado:', data.subscription_active ? 'ACTIVA' : 'INACTIVA');
    
    // PASO 3: STRIPE
    const paso3Stripe = !!data.stripe_account_id;
    console.log('✅ PASO 3 - CUENTA BANCARIA:', paso3Stripe ? 'COMPLETADO ✅' : 'PENDIENTE ❌');
    console.log('   🏦 Stripe Account:', data.stripe_account_id || 'SIN CUENTA');
    
    // VERIFICACIÓN FINAL
    const todosCompletados = paso1Logo && paso2Suscripcion && paso3Stripe;
    
    console.log('\n🎯 RESULTADO FINAL:');
    console.log('='.repeat(40));
    
    if (todosCompletados) {
      console.log('🎉 ¡TODOS LOS PASOS COMPLETADOS CORRECTAMENTE!');
      console.log('✅ Onboarding finalizado con éxito');
      console.log('🚀 Dashboard completamente funcional');
      console.log('🏥 Clínica lista para operar');
    } else {
      console.log('⚠️ HAY PASOS PENDIENTES');
      console.log('❌ El onboarding no está completo');
    }
    
    console.log('\n📊 ESTADO DETALLADO:');
    console.log('🔹 Logo:', paso1Logo ? '✅' : '❌');
    console.log('🔹 Suscripción:', paso2Suscripcion ? '✅' : '❌');
    console.log('🔹 Stripe:', paso3Stripe ? '✅' : '❌');
    console.log('🔹 Total:', todosCompletados ? '✅ COMPLETO' : '❌ INCOMPLETO');
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

verificarPasosCompletados();
