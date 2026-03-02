// Verificar el hash exacto
const checkHash = async () => {
  try {
    const { db } = require('./config/firebase');
    const clinicId = 'Bx1kJ81WL8JI04wvjrUM';
    
    const clinicDoc = await db.collection('clinicas').doc(clinicId).get();
    const clinic = clinicDoc.data();
    
    console.log('🔍 ANÁLISIS DEL PASSWORD:');
    console.log('✅ Email:', clinic.email);
    console.log('✅ Password hash:', clinic.password);
    console.log('✅ Length:', clinic.password.length);
    console.log('✅ Empieza con:', clinic.password.substring(0, 10));
    
    // Probar bcrypt
    try {
      const bcrypt = require('bcrypt');
      console.log('✅ bcrypt disponible');
      
      // Probar con una contraseña común
      const testPasswords = ['123456', 'password', 'admin', 'fisio123', 'gracia'];
      
      for (const testPwd of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPwd, clinic.password);
          if (isValid) {
            console.log('🎉 CONTRASEÑA ENCONTRADA:', testPwd);
            return;
          }
        } catch (e) {
          // continue
        }
      }
      
      console.log('❌ No se encontró contraseña común');
    } catch (e) {
      console.log('❌ bcrypt no disponible:', e.message);
    }
    
  } catch (e) {
    console.error('🔥 Error:', e.message);
  }
};

checkHash();
