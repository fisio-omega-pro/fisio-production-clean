const { sendPwaInvitation } = require('./controllers/clinicController');

async function enviarPwaDebug() {
  try {
    console.log('🔧 Enviando email PWA con debug...');
    
    const req = {
      clinicId: 'VkZQrWpagjryISYfx2lU',
      userId: 'VkZQrWpagjryISYfx2lU',
      body: {
        patientIds: ['all']
      }
    };
    
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
    
    await sendPwaInvitation(req, res, (error) => {
      if (error) {
        console.error('🔥 Error en sendPwaInvitation:', error);
      } else {
        console.log('✅ Email PWA enviado exitosamente');
      }
    });
    
  } catch (error) {
    console.error('🔥 Error en prueba:', error);
  }
}

enviarPwaDebug();
