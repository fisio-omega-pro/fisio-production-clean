// Verificar el bono de Eva Aguirre
const checkBono = async () => {
  try {
    const { db } = require('./config/firebase');
    const clinicId = 'Bx1kJ81WL8JI04wvjrUM';
    
    // Primero buscar el paciente
    const pacienteSnapshot = await db.collection('pacientes')
      .where('clinic_id', '==', clinicId)
      .where('nombre', '==', 'Eva Aguirre Casas')
      .limit(1)
      .get();
    
    if (pacienteSnapshot.empty) {
      console.log('❌ No se encontró el paciente Eva Aguirre');
      return;
    }
    
    const pacienteId = pacienteSnapshot.docs[0].id;
    console.log('✅ Paciente encontrado ID:', pacienteId);
    
    // Ahora buscar bonos por paciente_id
    const bonosSnapshot = await db.collection('bonos')
      .where('clinic_id', '==', clinicId)
      .where('paciente_id', '==', pacienteId)
      .orderBy('created_at', 'desc')
      .limit(1)
      .get();
    
    if (bonosSnapshot.empty) {
      console.log('❌ No se encontró bono para este paciente');
    } else {
      bonosSnapshot.forEach(doc => {
        const bono = doc.data();
        console.log('✅ BONO ENCONTRADO:');
        console.log('   ID:', doc.id);
        console.log('   Paciente ID:', bono.paciente_id);
        console.log('   Paciente:', bono.paciente_nombre);
        console.log('   Email:', bono.paciente_email);
        console.log('   Status:', bono.status);
        console.log('   Sesiones:', bono.sesiones_restantes + '/' + bono.sesiones_totales);
        console.log('   Precio:', bono.precio);
        console.log('   Pago generado:', bono.pago_generado);
        console.log('   Pago URL:', bono.pago_url || '❌ NO GENERADO');
        console.log('   Creado:', bono.created_at?.toDate());
      });
    }
    
  } catch (e) {
    console.error('🔥 Error:', e.message);
  }
};

checkBono();
