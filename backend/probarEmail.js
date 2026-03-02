// PRUEBA MANUAL DE EMAIL - EJECUTAR DIRECTAMENTE
const nodemailer = require('nodemailer');

async function probarEmailManual() {
  console.log('🧪 [PRUEBA MANUAL] Enviando email de prueba...');
  
  try {
    // PASO 1: Configurar transportador (necesitas contraseña de aplicación)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'fisiotoolsaas@gmail.com',
        pass: 'PON_AQUI_LA_CONTRASEÑA_DE_APLICACIÓN' // 16 caracteres
      }
    });
    
    // PASO 2: Verificar conexión
    console.log('📧 Verificando conexión con Gmail...');
    await transporter.verify();
    console.log('✅ Conexión verificada exitosamente');
    
    // PASO 3: Enviar email de prueba
    const info = await transporter.sendMail({
      from: 'FisioTool Pro <fisiotoolsaas@gmail.com>',
      to: 'aunquedemanera@gmail.com',
      subject: '🧪 PRUEBA MANUAL - FisioTool Email Service',
      html: `
        <h2>🧪 EMAIL DE PRUEBA MANUAL</h2>
        <p>Si recibes este email, el servicio de email funciona correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Sistema:</strong> FisioTool Pro</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Este es un email de prueba enviado manualmente con Nodemailer + Gmail.
        </p>
      `
    });
    
    console.log('✅ Email enviado exitosamente');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Error en prueba manual:', error);
    console.log('💡 Soluciones posibles:');
    console.log('1. Generar contraseña de aplicación en Gmail');
    console.log('2. Verificar que la contraseña tenga 16 caracteres');
    console.log('3. Activar verificación en 2 pasos');
    
    return { success: false, error: error.message };
  }
}

// Ejecutar prueba
if (require.main === module) {
  probarEmailManual();
}

module.exports = { probarEmailManual };
