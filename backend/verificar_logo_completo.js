const { db } = require('./config/firebase');

async function verificarLogoCompleto() {
  try {
    const clinicDoc = await db.collection('clinicas').doc('VkZQrWpagjryISYfx2lU').get();
    const data = clinicDoc.data();
    
    console.log('🏥 CLÍNICA:', data.nombre_clinica);
    console.log('📧 EMAIL:', data.email);
    console.log('');
    console.log('🖼️ LOGO URL:', data.logo_url);
    console.log('📁 TIENE LOGO:', data.logo_url ? '✅ SÍ' : '❌ NO');
    console.log('');
    
    if (data.logo_url) {
      console.log('🔍 URL COMPLETA:', data.logo_url);
      console.log('🌐 URL CON DOMINIO:', 'https://fisio-backend-omega-740657183492.europe-west1.run.app:8081' + data.logo_url);
      
      // Verificar si el archivo existe realmente
      const fs = require('fs');
      const path = require('path');
      
      // Buscar en uploads/logo
      const logoPath = path.join(__dirname, 'uploads', 'logo', 'VkZQrWpagjryISYfx2lU');
      if (fs.existsSync(logoPath)) {
        console.log('✅ ARCHIVO LOCAL EXISTE:', logoPath);
        const stats = fs.statSync(logoPath);
        console.log('📊 TAMAÑO:', stats.size, 'bytes');
        console.log('📅 MODIFICADO:', stats.mtime);
      } else {
        console.log('❌ ARCHIVO LOCAL NO EXISTE:', logoPath);
      }
    }
    
    console.log('');
    console.log('🔍 CONFIGURACIÓN ANA:');
    console.log('🤖 Nombre:', data.ana_name || 'Ana');
    console.log('🎨 Color:', data.ana_color || '#075E54');
    console.log('🖼️ Foto Ana:', data.ana_photo || 'NO');
    console.log('🏢 Usa Logo Clínica:', data.ana_use_clinic_logo);
    
  } catch (error) {
    console.error('🔥 ERROR:', error);
  }
}

verificarLogoCompleto();
