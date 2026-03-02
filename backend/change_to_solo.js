const changeToSoloForPayment = async () => {
  try {
    const { db } = require('./config/firebase');
    const clinicId = 'Bx1kJ81WL8JI04wvjrUM';
    
    console.log('🔄 Cambiando a plan SOLO para que veas el botón de pago...');
    
    await db.collection('clinicas').doc(clinicId).update({
      plan: 'solo',
      subscription_active: false,
      stripe_subscription_id: '',
      updated_at: require('firebase-admin').firestore.Timestamp.now()
    });
    
    console.log('✅ Cambiado a SOLO - ahora verás el botón de pago');
    console.log('🎯 Refresca el dashboard (F5) y ve a Mis Clinicas');
    console.log('💰 Verás el botón para pagar el plan Multi-Sede');
    
  } catch (e) {
    console.error('🔥 Error:', e.message);
  }
};

changeToSoloForPayment();
