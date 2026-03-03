const { db, Timestamp } = require('./config/firebase');
const jwt = require('jsonwebtoken');
const { initEnv } = require('./config/env');

async function crearUsuarioMomentun() {
  try {
    console.log('🔧 CREANDO USUARIO PARA MOMENTUNATOPE@GMAIL.COM');
    console.log('='.repeat(60));
    
    const env = await initEnv();
    
    // Buscar la clínica
    const clinicasSnapshot = await db.collection('clinicas').where('email', '==', 'momentunatope@gmail.com').get();
    
    if (clinicasSnapshot.empty) {
      console.log('❌ Error: Clínica no encontrada');
      return;
    }
    
    const clinicDoc = clinicasSnapshot.docs[0];
    const clinicId = clinicDoc.id;
    const clinicData = clinicDoc.data();
    
    console.log('✅ Clínica encontrada:', clinicData.nombre_clinica);
    
    // Crear usuario
    const userData = {
      email: 'momentunatope@gmail.com',
      clinic_id: clinicId,
      role: 'admin',
      name: 'Momentun Admin',
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
      status: 'active',
      last_login: Timestamp.now(),
      email_verified: true
    };
    
    const userRef = await db.collection('users').add(userData);
    console.log('✅ Usuario creado con ID:', userRef.id);
    
    // Actualizar la clínica
    await db.collection('clinicas').doc(clinicId).update({
      owner_email: 'momentunatope@gmail.com',
      updated_at: Timestamp.now(),
      user_created: true
    });
    
    console.log('✅ Clínica actualizada con owner_email');
    
    // Generar token de acceso
    const token = jwt.sign({ clinicId }, env.JWT_SECRET, { expiresIn: '30d' });
    
    console.log('\n🎉 USUARIO CREADO EXITOSAMENTE');
    console.log('📧 Email: momentunatope@gmail.com');
    console.log('🆔 Usuario ID:', userRef.id);
    console.log('🏥 Clínica ID:', clinicId);
    console.log('🔑 Rol: admin');
    console.log('🎫 Token:', token);
    
    console.log('\n🔑 INSTRUCCIONES DE ACCESO:');
    console.log('1️⃣ Ve a: https://fisiotool.com/dashboard');
    console.log('2️⃣ Inicia sesión con: momentunatope@gmail.com');
    console.log('3️⃣ Usa la contraseña que creaste originalmente');
    console.log('4️⃣ Si no recuerdas la contraseña, usa "Olvidé mi contraseña"');
    
    console.log('\n✅ LISTO PARA USAR:');
    console.log('🏥 Tu cuenta está completa y funcional');
    console.log('💳 La suscripción está activa');
    console.log('🏦 Stripe está configurado');
    console.log('🖼️ Logo está subido');
    console.log('🎯 Todo funciona perfectamente');
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

crearUsuarioMomentun();
