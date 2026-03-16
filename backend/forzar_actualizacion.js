const { db } = require('./config/firebase');

async function forzarActualizacion() {
  try {
    console.log('🔧 FORZANDO ACTUALIZACIÓN COMPLETA...');
    
    // Eliminar primero
    await db.collection('clinicas').doc('VkZQrWpagjryISYfx2lU').update({
      ana_nombre: null,
      ana_mensaje: null,
      ana_foto: null,
      ana_color: null,
      ana_activa: null,
      ana_model: null,
      ana_version: null
    });
    
    console.log('❌ Configuración antigua eliminada');
    
    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Crear nueva configuración
    await db.collection('clinicas').doc('VkZQrWpagjryISYfx2lU').update({
      ana_nombre: 'Ana',
      ana_mensaje: 'Hola Soy Ana, tu asistente virtual de Momentun. Estoy aquí para ayudarte con todo lo que necesites.',
      ana_color: '#075E54',
      ana_activa: true,
      ana_foto: 'https://storage.googleapis.com/fisiotool-backend-uploads/ana/VkZQrWpagjryISYfx2lU/ana-photo.jpg',
      ana_model: 'gemini-2.5-flash',
      ana_version: '2.0',
      ana_usa_logo_clinica: false,
      last_updated: new Date()
    });
    
    console.log('✅ Nueva Ana configurada');
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

forzarActualizacion();
