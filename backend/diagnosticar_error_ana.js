const { db } = require('./config/firebase');

async function diagnosticarErrorAna() {
  try {
    console.log('🔍 DIAGNÓSTICO ERROR - ANA NO ENCUENTRA CLÍNICA');
    console.log('='.repeat(60));
    
    // 1. Buscar todas las clínicas activas
    const clinicasSnapshot = await db.collection('clinicas').get();
    console.log('📊 Total clínicas en BD:', clinicasSnapshot.size);
    
    clinicasSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log('🏥 Clínica:', data.nombre_clinica, '| Email:', data.email, '| Status:', data.status, '| ID:', doc.id);
    });
    
    // 2. Buscar usuarios registrados recientemente
    const usersSnapshot = await db.collection('users').limit(10).get();
    console.log('👥 Últimos usuarios registrados:', usersSnapshot.size);
    
    usersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log('👤 Usuario:', data.email, '| Clínica ID:', data.clinic_id, '| Rol:', data.role);
    });
    
    // 3. Verificar si hay colección de users
    console.log('\n🔍 Verificando estructura de la BD...');
    
    // 4. Buscar la clínica del email que registraste
    console.log('\n📧 Buscando clínica de tu registro...');
    
    // Buscar en auth users también
    try {
      const authUsers = await db.collection('auth_users').limit(5).get();
      console.log('🔐 Auth users encontrados:', authUsersSnapshot.size);
      
      authUsers.docs.forEach(doc => {
        const data = doc.data();
        console.log('🔐 Auth User:', data.email, '| Clínica:', data.clinic_id);
      });
    } catch (e) {
      console.log('ℹ️ No hay colección auth_users');
    }
    
    // 5. Verificar si Ana está buscando en la colección correcta
    console.log('\n🤖 Verificando lógica de Ana...');
    
  } catch (error) {
    console.error('🔥 Error en diagnóstico:', error);
  }
}

diagnosticarErrorAna();
