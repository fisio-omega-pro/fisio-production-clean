// Inicializar Firebase como la aplicación principal
const { db, Timestamp } = require('./config/firebase');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');

async function crearClinicaPrueba() {
  try {
    console.log('🏥 Creando clínica de prueba para Stripe Connect...');
    
    // Generar datos de prueba
    const emailPrueba = 'clinica-barcelona-prueba-2026@outlook.com';
    const passwordPrueba = 'Password123!';
    const nombreClinica = 'Clínica Barcelona Prueba';
    
    // Hash de la contraseña
    const hash = await bcrypt.hash(passwordPrueba, 10);
    
    // Generar referral code único
    const genReferralCode = () => Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    let referral_code = '';
    for (let i = 0; i < 6; i++) {
      const candidate = genReferralCode();
      const exists = await db.collection('clinicas').where('referral_code', '==', candidate).limit(1).get();
      if (exists.empty) { referral_code = candidate; break; }
    }
    if (!referral_code) referral_code = genReferralCode();
    
    const now = Timestamp.now();
    
    // Crear clínica
    const ref = await db.collection('clinicas').add({
      nombre_clinica: nombreClinica,
      email: emailPrueba.toLowerCase().trim(),
      password: hash,
      plan: 'pro',
      status: 'activo',
      subscription_active: false,
      is_blind: false,
      timezone: 'Europe/Madrid',
      telefono: '+34600123456',
      prefijo_telefono: '+34',
      referral_code,
      referred_by_clinic_id: null,
      referred_by_code: null,
      referred_at: null,
      config_ia: {
        precio: 50,
        fianza: 15,
        acepta_bonos: true,
        precio_bono_5: 225,
        modo_caza_activo: false
      },
      legal: {
        aceptado: true,
        fecha: now,
        ip: '127.0.0.1',
        userAgent: 'Test Script'
      },
      created_at: now,
      logo_url: null,
      stripe_status: null,
      stripe_account_id: null,
      stripe_email: null
    });
    
    console.log('✅ Clínica creada con éxito!');
    console.log('📋 Datos de acceso:');
    console.log(`📧 Email: ${emailPrueba}`);
    console.log(`🔑 Password: ${passwordPrueba}`);
    console.log(`🆔 Clinic ID: ${ref.id}`);
    console.log(`🎯 Referral Code: ${referral_code}`);
    console.log('');
    console.log('🔗 URL para probar:');
    console.log(`https://fisiotool.com/dashboard`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Esta clínica será eliminada después de las pruebas.');
    
    return {
      success: true,
      clinicId: ref.id,
      email: emailPrueba,
      password: passwordPrueba,
      referralCode: referral_code
    };
    
  } catch (error) {
    console.error('❌ Error creando clínica de prueba:', error);
    return { success: false, error: error.message };
  }
}

// Función para eliminar la clínica después de las pruebas
async function eliminarClinicaPrueba(clinicId) {
  try {
    console.log(`🗑️  Eliminando clínica de prueba: ${clinicId}`);
    
    // Eliminar documentos relacionados
    const collections = [
      'pacientes',
      'citas',
      'notas_paciente',
      'bonos',
      'equipos',
      'audit_logs',
      'stripe_connect_profesionales'
    ];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).where('clinic_id', '==', clinicId).get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      if (!snapshot.empty) {
        await batch.commit();
        console.log(`📁 Eliminados ${snapshot.size} documentos de ${collectionName}`);
      }
    }
    
    // Eliminar la clínica principal
    await db.collection('clinicas').doc(clinicId).delete();
    console.log('✅ Clínica eliminada con éxito');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error eliminando clínica:', error);
    return { success: false, error: error.message };
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  crearClinicaPrueba()
    .then(result => {
      if (result.success) {
        console.log('\n🎯 Para eliminar esta clínica después de las pruebas, ejecuta:');
        console.log(`node -e "require('./crear-clinica-prueba.js').eliminarClinicaPrueba('${result.clinicId}')"`);  
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { crearClinicaPrueba, eliminarClinicaPrueba };
