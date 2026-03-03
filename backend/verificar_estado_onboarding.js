const { db } = require('./config/firebase');

async function verificarEstadoOnboarding() {
  try {
    console.log('🔍 VERIFICANDO ESTADO REAL DE LA CLÍNICA');
    console.log('='.repeat(50));
    
    const clinicDoc = await db.collection('clinicas').doc('VkZQrWpagjryISYfx2lU').get();
    const data = clinicDoc.data();
    
    console.log('🏥 Clínica:', data.nombre_clinica);
    console.log('📧 Email:', data.email);
    console.log('💳 subscription_active:', data.subscription_active);
    console.log('🏦 stripe_account_id:', data.stripe_account_id);
    console.log('🖼️ logo_url:', data.logo_url);
    
    // Verificar si realmente necesita onboarding
    const needsLogo = !data.logo_url || data.logo_url.includes('placeholder');
    const needsSubscription = !data.subscription_active;
    const needsStripe = !data.stripe_account_id;
    const needsSetup = needsLogo || needsSubscription || needsStripe;
    
    console.log('\n🔍 ANÁLISIS DE ONBOARDING:');
    console.log('needsLogo:', needsLogo);
    console.log('needsSubscription:', needsSubscription);
    console.log('needsStripe:', needsStripe);
    console.log('needsSetup (isBlocked):', needsSetup);
    
    if (!needsSetup) {
      console.log('\n❌ PROBLEMA: La clínica está COMPLETA');
      console.log('🔧 Por eso no muestra el onboarding');
      console.log('💡 Necesitamos FORZAR el onboarding para probar');
      
      // FORZAR el onboarding para pruebas
      console.log('\n🔧 FORZANDO ONBOARDING PARA PRUEBAS...');
      await db.collection('clinicas').doc('VkZQrWpagjryISYfx2lU').update({
        stripe_account_id: null, // Eliminar para forzar onboarding
        logo_url: null, // Eliminar para forzar onboarding
        force_onboarding: true,
        updated_at: new Date()
      });
      
      console.log('✅ Onboarding FORZADO para pruebas');
      console.log('🔄 Refresca el dashboard y deberías ver el onboarding');
      
    } else {
      console.log('\n✅ La clínica DEBERÍA mostrar onboarding');
      console.log('❌ Si no lo muestra, el problema está en el frontend');
    }
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

verificarEstadoOnboarding();
