// Simular el envío directo sin autenticación para prueba
const { sendPwaInvitation } = require('./controllers/clinicController');
const { db } = require('./config/firebase');

async function testPwaDirect() {
  try {
    console.log('🔧 Enviando email PWA directamente...');
    
    // Crear mock request
    const req = {
      clinicId: 'VkZQrWpagjryISYfx2lU',
      userId: 'VkZQrWpagjryISYfx2lU',
      body: {
        patientIds: ['all'] // Enviar a todos
      }
    };
    
    // Crear mock response
    let responseData = null;
    const res = {
      status: (code) => ({
        json: (data) => {
          responseData = { status: code, data };
          console.log('📊 Respuesta:', responseData);
          return responseData;
        }
      }),
      json: (data) => {
        responseData = { status: 200, data };
        console.log('📊 Respuesta:', responseData);
        return responseData;
      }
    };
    
    // Ejecutar la función directamente
    await sendPwaInvitation(req, res, (error) => {
      if (error) {
        console.error('🔥 Error en sendPwaInvitation:', error);
      } else {
        console.log('✅ Email PWA enviado exitosamente');
      }
    });
    
  } catch (error) {
    console.error('🔥 Error en prueba directa:', error);
  }
}

testPwaDirect();
