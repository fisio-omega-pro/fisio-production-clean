// Reiniciar el módulo para que cargue los cambios
delete require.cache[require.resolve('./controllers/clinicController')];
const { sendPwaInvitation } = require('./controllers/clinicController');

async function probarFuncionActualizada() {
  try {
    console.log('🔧 Probando función actualizada...');
    
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
          console.log('📊 Resultado:', responseData);
          return responseData;
        }
      }),
      json: (data) => {
        responseData = { status: 200, data };
        console.log('📊 Resultado:', responseData);
        return responseData;
      }
    };
    
    await sendPwaInvitation(req, res, (error) => {
      if (error) {
        console.error('🔥 Error:', error);
      } else {
        console.log('✅ Función actualizada probada');
      }
    });
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

probarFuncionActualizada();
