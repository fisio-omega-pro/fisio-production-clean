const { db } = require('./config/firebase');

async function rectificarAna() {
  try {
    console.log('🔧 ELIMINANDO ANA ANTIGUA...');
    
    // Eliminar configuración antigua
    await db.collection('clinicas').doc('VkZQrWpagjryISYfx2lU').update({
      ana_nombre: null,
      ana_mensaje: null,
      ana_foto: null,
      ana_color: null,
      ana_activa: null
    });
    
    console.log('❌ Ana antigua eliminada');
    
    console.log('🔧 CREANDO ANA NUEVA CON GEMINI 2.5...');
    
    // Crear nueva configuración
    await db.collection('clinicas').doc('VkZQrWpagjryISYfx2lU').update({
      ana_nombre: 'Ana',
      ana_mensaje: 'Hola Soy Ana, tu asistente virtual de Momentun. Estoy aquí para ayudarte con todo lo que necesites.',
      ana_color: '#075E54',
      ana_activa: true,
      ana_foto: 'https://storage.googleapis.com/fisiotool-backend-uploads/ana/VkZQrWpagjryISYfx2lU/ana-photo.jpg',
      ana_model: 'gemini-2.5-flash',
      ana_version: '2.0'
    });
    
    console.log('✅ Ana nueva creada con Gemini 2.5-flash');
    console.log('🎯 Configuración actualizada para todos los usuarios');
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

rectificarAna();
