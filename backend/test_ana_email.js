const { sendEmail } = require('./services/emailSenderService');
const { initEnv } = require('./config/env');

async function testAnaEmail() {
  try {
    console.log('🧪 Probando email de ANA (que debería funcionar)...');
    
    const env = await initEnv();
    const adminEmail = String(env.ADMIN_EMAIL || 'fisiotoolsaas@gmail.com').trim();
    
    console.log('📧 Enviando email desde ANA a:', adminEmail);
    
    const result = await sendEmail({
      to: adminEmail,
      subject: '🤖 PRUEBA ANA - Email desde asistente',
      text: 'Este es un email de prueba desde Ana para verificar que funciona correctamente.\n\nSi recibes este email, significa que Ana puede enviar emails.\n\nFecha: ' + new Date().toLocaleString('es-ES'),
      type: 'ANA' // Esto usará ANA_MAIL
    });
    
    if (result.ok) {
      console.log('✅ Email de ANA enviado exitosamente!');
      console.log('📧 Revisa fisiotoolsaas@gmail.com');
    } else {
      console.log('❌ Error con ANA:', result.error);
    }
  } catch (error) {
    console.error('🔥 Error con ANA:', error.message);
  }
}

testAnaEmail();
