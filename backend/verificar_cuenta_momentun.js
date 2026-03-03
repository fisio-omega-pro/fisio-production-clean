const { db } = require('./config/firebase');

async function verificarCuentaMomentun() {
  try {
    console.log('🔍 VERIFICANDO ESTADO DE CUENTA MOMENTUNATOPE@GMAIL.COM');
    console.log('='.repeat(60));
    
    // Buscar la cuenta
    const clinicasSnapshot = await db.collection('clinicas').where('email', '==', 'momentunatope@gmail.com').get();
    
    if (clinicasSnapshot.empty) {
      console.log('❌ CUENTA NO ENCONTRADA');
      console.log('📝 La cuenta momentunatope@gmail.com NO existe en la base de datos');
      console.log('🎯 OPCIONES:');
      console.log('   1️⃣ Crear una nueva cuenta con email diferente');
      console.log('   2️⃣ Recrear la cuenta con el mismo email');
      return;
    }
    
    const clinicDoc = clinicasSnapshot.docs[0];
    const clinicData = clinicDoc.data();
    
    console.log('✅ CUENTA ENCONTRADA:');
    console.log('🏥 Nombre:', clinicData.nombre_clinica);
    console.log('📧 Email:', clinicData.email);
    console.log('🆔 ID:', clinicDoc.id);
    console.log('💳 Suscripción:', clinicData.subscription_active ? 'ACTIVA' : 'INACTIVA');
    console.log('🏦 Stripe:', clinicData.stripe_account_id ? 'CONFIGURADO' : 'SIN CONFIGURAR');
    console.log('🖼️ Logo:', clinicData.logo_url ? 'SUBIDO' : 'SIN LOGO');
    console.log('📊 Status:', clinicData.status);
    
    // Verificar usuarios asociados
    const usersSnapshot = await db.collection('users').where('email', '==', 'momentunatope@gmail.com').get();
    console.log('👤 Usuarios asociados:', usersSnapshot.size);
    
    if (usersSnapshot.size > 0) {
      usersSnapshot.docs.forEach(doc => {
        const userData = doc.data();
        console.log('   👤 Usuario ID:', doc.id, '| Rol:', userData.role);
      });
    }
    
    console.log('\n🎯 RECOMENDACIÓN:');
    if (clinicData.subscription_active && clinicData.stripe_account_id && clinicData.logo_url) {
      console.log('✅ Tu cuenta está COMPLETA y FUNCIONAL');
      console.log('🔑 Puedes usarla directamente');
    } else {
      console.log('⚠️ Tu cuenta existe pero está INCOMPLETA');
      console.log('🔧 Debes completar el onboarding');
    }
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

verificarCuentaMomentun();
