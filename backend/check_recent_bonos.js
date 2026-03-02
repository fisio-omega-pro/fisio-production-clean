// Verificar los bonos más recientes
const checkRecentBonos = async () => {
  try {
    const { db } = require('./config/firebase');
    const clinicId = 'Bx1kJ81WL8JI04wvjrUM';
    
    // Buscar todos los bonos de la clínica ordenados por fecha
    const bonosSnapshot = await db.collection('bonos')
      .where('clinic_id', '==', clinicId)
      .get();
    
    if (bonosSnapshot.empty) {
      console.log('❌ No se encontraron bonos');
      return;
    }
    
    // Ordenar por fecha de creación
    const bonos = bonosSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const dateA = a.created_at?.toDate() || new Date(0);
        const dateB = b.created_at?.toDate() || new Date(0);
        return dateB - dateA;
      });
    
    console.log(`📋 Total de bonos: ${bonos.length}`);
    console.log('='.repeat(50));
    
    bonos.slice(0, 5).forEach((bono, index) => {
      console.log(`\n🎫 BONO #${index + 1} (más reciente)`);
      console.log('   ID:', bono.id);
      console.log('   Paciente:', bono.paciente_nombre);
      console.log('   Email:', bono.paciente_email);
      console.log('   Status:', bono.status);
      console.log('   Sesiones:', (bono.sesiones_restantes || 0) + '/' + bono.sesiones_totales);
      console.log('   Precio:', bono.precio || 'No definido');
      console.log('   Pago generado:', bono.pago_generado);
      console.log('   Pago URL:', bono.pago_url || '❌ NO GENERADO');
      console.log('   Creado:', bono.created_at?.toDate());
      console.log('   Generar pago:', bono.generar_pago);
    });
    
  } catch (e) {
    console.error('🔥 Error:', e.message);
  }
};

checkRecentBonos();
