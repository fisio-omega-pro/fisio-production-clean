const { sendEmail } = require('./services/emailSenderService');
const { initEnv } = require('./config/env');

async function testEmail() {
  try {
    console.log('🧪 Probando sistema de emails con credenciales actualizadas...');
    
    const env = await initEnv();
    const adminEmail = String(env.ADMIN_EMAIL || 'fisiotoolsaas@gmail.com').trim();
    
    console.log('📧 Enviando email de prueba a:', adminEmail);
    
    const result = await sendEmail({
      to: adminEmail,
      subject: '🧪 PRUEBA DE EMAIL - Sistema de Soporte Funcionando',
      text: 'Este es un email de prueba para verificar que el sistema de soporte esta funcionando correctamente.\n\nSUGERENCIAS: Llegaran con formato calmado y constructivo\nALERTAS: Llegaran con formato urgente y prioridad alta\nCONSULTAS: Llegaran con notificacion de respuesta automatica\n\nEl sistema esta diferenciando correctamente los tipos de solicitudes.\n\nFecha de prueba: ' + new Date().toLocaleString('es-ES') + '\n\n¡El sistema de soporte esta 100% operativo!',
      type: 'INFO'
    });
    
    if (result.ok) {
      console.log('✅ Email enviado exitosamente!');
      console.log('📧 Revisa fisiotoolsaas@gmail.com');
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('🔥 Error:', error.message);
  }
}

testEmail();
