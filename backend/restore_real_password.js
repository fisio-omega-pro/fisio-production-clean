// Restaurar contraseña real del usuario
const restoreRealPassword = async () => {
  try {
    const bcrypt = require('bcrypt');
    const { db, Timestamp } = require('./config/firebase');
    const clinicId = 'Bx1kJ81WL8JI04wvjrUM';
    
    // Tu contraseña real
    const realPassword = 'Laqueselio69%';
    const hash = await bcrypt.hash(realPassword, 10);
    
    console.log('🔐 RESTAURANDO CONTRASEÑA REAL:');
    console.log('✅ Password:', realPassword);
    console.log('✅ Nuevo hash:', hash);
    
    // Guardar el hash en la clínica
    await db.collection('clinicas').doc(clinicId).update({
      password: hash,
      updated_at: Timestamp.now()
    });
    
    console.log('✅ Contraseña real restaurada en Firebase');
    console.log('🎉 AHORA PUEDES ENTRAR CON:');
    console.log('   Email: aunquedemanera@gmail.com');
    console.log('   Password: Laqueselio69%');
    console.log('   Y te llevará directamente al dashboard');
    
  } catch (e) {
    console.error('🔥 Error:', e.message);
  }
};

restoreRealPassword();
