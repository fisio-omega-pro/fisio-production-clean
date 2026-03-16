const { db } = require('./config/firebase');

async function debugPwaFilter() {
  try {
    console.log('🔍 Debug del filtro de pacientes...');
    
    const clinicId = 'VkZQrWpagjryISYfx2lU';
    const snap = await db.collection('clinicas').doc(clinicId).collection('pacientes').get();
    
    const patients = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('👥 Total pacientes:', patients.length);
    
    patients.forEach((p, index) => {
      console.log('\n📋 Paciente ' + (index + 1) + ':');
      console.log('👤 Nombre:', p.nombre);
      console.log('📧 Email:', p.email);
      console.log('🔍 Email existe:', !!p.email);
      console.log('✅ Email válido:', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email));
    });
    
    // Filtrar como lo hace el código original
    const validPatients = patients.filter(p => p.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email));
    
    console.log('\n✅ Pacientes válidos: ' + validPatients.length);
    validPatients.forEach(p => {
      console.log('📧', p.email);
    });
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

debugPwaFilter();
