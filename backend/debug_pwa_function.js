const { db } = require('./config/firebase');

async function debugFunctionPwa() {
  try {
    console.log('🔍 Debug de la función sendPwaInvitation...');
    
    const clinicId = 'VkZQrWpagjryISYfx2lU';
    const patientIds = ['all'];
    
    console.log('📋 Parámetros:');
    console.log('clinicId:', clinicId);
    console.log('patientIds:', patientIds);
    
    let patients = [];
    
    if (patientIds === 'all') {
      console.log('🔍 Buscando todos los pacientes...');
      const snap = await db.collection('clinicas').doc(clinicId).collection('pacientes').get();
      patients = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('📊 Pacientes encontrados:', patients.length);
    }
    
    console.log('👥 Lista de pacientes:');
    patients.forEach((p, index) => {
      console.log((index + 1) + '. ' + p.nombre + ' - ' + p.email);
    });
    
    // Filtrar los que tienen email válido
    const validPatients = patients.filter(p => p.email && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(p.email));
    
    console.log('✅ Pacientes con email válido:', validPatients.length);
    validPatients.forEach(p => {
      console.log('📧', p.email);
    });
    
    if (validPatients.length === 0) {
      console.log('❌ No hay pacientes con email válido');
    } else {
      console.log('✅ Todo listo para enviar emails');
    }
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

debugFunctionPwa();
