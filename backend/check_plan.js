const checkPlan = async () => {
  try {
    const { db } = require('./config/firebase');
    const clinicId = 'Bx1kJ81WL8JI04wvjrUM';
    
    const clinicSnap = await db.collection('clinicas').doc(clinicId).get();
    const clinic = clinicSnap.data();
    
    console.log('🏥 Clínica:', clinic.nombre_clinica);
    console.log('💳 Plan actual:', clinic.plan);
    console.log('💰 Suscripción activa:', clinic.subscription_active);
    
    const plan = String(clinic.plan || 'solo').toLowerCase();
    const PLANS_MULTI_CLINIC = ['business', 'clinic', 'corporate'];
    const hasMultiClinicPlan = PLANS_MULTI_CLINIC.includes(plan);
    
    console.log('🔍 ¿Tiene plan multi-sede?', hasMultiClinicPlan ? 'SÍ' : 'NO');
    console.log('📋 Planes válidos:', PLANS_MULTI_CLINIC.join(', '));
    
    if (hasMultiClinicPlan) {
      console.log('⚠️ PROBLEMA: Tu plan', plan, 'está en la lista de multi-sede');
      console.log('🎯 Por eso ves directamente la gestión de sedes');
    } else {
      console.log('✅ Correcto: Tu plan', plan, 'NO está en multi-sede');
      console.log('🎯 Deberías ver el botón de upgrade');
    }
  } catch (e) {
    console.error('🔥 Error:', e.message);
  }
};

checkPlan();
