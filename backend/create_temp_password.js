// Crear una contraseña temporal
const createTempPassword = async () => {
  try {
    const bcrypt = require('bcrypt');
    const { db, Timestamp } = require('./config/firebase');
    const clinicId = 'Bx1kJ81WL8JI04wvjrUM';
    
    // Crear hash para contraseña temporal
    const tempPassword = 'fisio123';
    const hash = await bcrypt.hash(tempPassword, 10);
    
    console.log('🔐 CONTRASEÑA TEMPORAL:');
    console.log('✅ Password:', tempPassword);
    console.log('✅ Hash:', hash);
    
    // Guardar el hash en la clínica
    await db.collection('clinicas').doc(clinicId).update({
      password: hash,
      updated_at: Timestamp.now()
    });
    
    console.log('✅ Contraseña temporal guardada en Firebase');
    console.log('🎉 AHORA PUEDES ENTRAR CON:');
    console.log('   Email: aunquedemanera@gmail.com');
    console.log('   Password: fisio123');
    
  } catch (e) {
    console.error('🔥 Error:', e.message);
  }
};

createTempPassword();
