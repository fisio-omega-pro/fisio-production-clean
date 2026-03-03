const { db } = require('./config/firebase');

async function verificarLogoClinica() {
  try {
    console.log('🔍 VERIFICANDO LOGO DE LA CLÍNICA');
    console.log('='.repeat(50));
    
    const clinicDoc = await db.collection('clinicas').doc('VkZQrWpagjryISYfx2lU').get();
    const data = clinicDoc.data();
    
    console.log('🏥 Clínica:', data.nombre_clinica);
    console.log('📧 Email:', data.email);
    console.log('🖼️ Logo URL:', data.logo_url);
    console.log('🔗 Logo completo:', data.logo_url ? 'SÍ' : 'NO');
    
    if (data.logo_url) {
      console.log('✅ Logo encontrado en BD');
      console.log('📁 Ruta:', data.logo_url);
      
      // Verificar si es una URL válida
      if (data.logo_url.startsWith('/api/public/logo/')) {
        console.log('✅ Formato de logo correcto (API interna)');
      } else if (data.logo_url.startsWith('http')) {
        console.log('✅ Logo con URL externa');
      } else {
        console.log('⚠️ Formato de logo sospechoso');
      }
    } else {
      console.log('❌ NO HAY LOGO en la base de datos');
      console.log('🔧 Esto puede causar el problema');
    }
    
    // Verificar configuración de Ana
    console.log('\n🤖 CONFIGURACIÓN DE ANA:');
    console.log('📛 Ana Name:', data.ana_name || 'Ana');
    console.log('🎨 Ana Color:', data.ana_color || '#075E54');
    console.log('🖼️ Ana Photo:', data.ana_photo || 'SIN FOTO');
    console.log('🏢 Use Clinic Logo:', data.ana_use_clinic_logo || false);
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

verificarLogoClinica();
