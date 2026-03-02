// Verificar el bono de Eva Aguirre sin ordenar
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
    
    // Buscar todos los bonos de la clínica y filtrar
    const bonosSnapshot = await db.collection('bonos')
      .where('clinic_id', '==', clinicId)
      .get();
    
    const bonosEva = bonosSnapshot.docs.filter(doc => 
      doc.data().paciente_id === pacienteId || 
      doc.data().paciente_nombre === 'Eva Aguirre Casas'
    );
    
    if (bonosEva.length === 0) {
      console.log('❌ No se encontró bono para Eva Aguirre');
    } else {
      bonosEva.forEach(doc => {
        const bono = doc.data();
        console.log('✅ BONO ENCONTRADO:');
        console.log('   ID:', doc.id);
        console.log('   Paciente ID:', bono.paciente_id);
        console.log('   Paciente:', bono.paciente_nombre);
        console.log('   Email:', bono.paciente_email);
        console.log('   Status:', bono.status);
        console.log('   Sesiones:', (bono.sesiones_restantes || 0) + '/' + bono.sesiones_totales);
        console.log('   Precio:', bono.precio || 'No definido');
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
