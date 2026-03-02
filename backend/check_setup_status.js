// Verificar qué falta para el setup
const checkSetupStatus = async () => {
  try {
    const { db } = require('./config/firebase');
    const clinicId = 'Bx1kJ81WL8JI04wvjrUM';
    
    const clinicDoc = await db.collection('clinicas').doc(clinicId).get();
    const clinic = clinicDoc.data();
    
    console.log('🔍 ESTADO DEL SETUP:');
    console.log('✅ logo_url:', clinic.logo_url);
    console.log('✅ logo_url incluye placeholder?:', clinic.logo_url?.includes('placeholder'));
    console.log('✅ stripe_account_id:', clinic.stripe_account_id);
    console.log('✅ subscription_active:', clinic.subscription_active);
    
    // Verificar pacientes
    const pacientesSnapshot = await db.collection('pacientes')
      .where('clinic_id', '==', clinicId)
      .limit(1)
      .get();
    
    console.log('✅ pacientes_count:', pacientesSnapshot.size);
    
    // Diagnóstico
    const needsStripe = !clinic.stripe_account_id;
    const needsLogo = !clinic.logo_url || clinic.logo_url.includes('placeholder');
    const needsPatients = pacientesSnapshot.size === 0;
    const needsSubscription = !clinic.subscription_active;
    
    console.log('🔍 DIAGNÓSTICO:');
    console.log('❌ needsStripe:', needsStripe);
    console.log('❌ needsLogo:', needsLogo);
    console.log('❌ needsPatients:', needsPatients);
    console.log('❌ needsSubscription:', needsSubscription);
    console.log('🚫 isBlocked:', !!(needsStripe || needsLogo || needsPatients || needsSubscription));
    
  } catch (e) {
    console.error('🔥 Error:', e.message);
  }
};

checkSetupStatus();
