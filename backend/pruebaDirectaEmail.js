// PRUEBA DIRECTA - CONFIGURA Y EJECUTA
const nodemailer = require('nodemailer');

async function pruebaDirecta() {
  console.log('🧪 [PRUEBA DIRECTA] Configurando email...');
  
  // PASO 1: PON TU CONTRASEÑA DE APLICACIÓN AQUÍ
  const CONTRASEÑA_APLICACIÓN = 'PON_AQUI_LA_CONTRASEÑA_DE_16_CARACTERES';
  
  if (CONTRASEÑA_APLICACIÓN === 'PON_AQUI_LA_CONTRASEÑA_DE_16_CARACTERES') {
    console.log('❌ ERROR: Debes configurar la contraseña de aplicación Gmail');
    console.log('📝 Pasos:');
    console.log('1. Ve a https://myaccount.google.com/');
    console.log('2. Seguridad → Verificación en 2 pasos (activar)');
    console.log('3. Seguridad → Contraseñas de aplicaciones');
    console.log('4. Generar nueva contraseña para "FisioTool Email Service"');
    console.log('5. Copiar los 16 caracteres y ponerlos en la variable CONTRASEÑA_APLICACIÓN');
    return;
  }
  
  try {
    // PASO 2: CONFIGURAR TRANSPORTADOR
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'fisiotoolsaas@gmail.com',
        pass: CONTRASEÑA_APLICACIÓN
      }
    });
    
    console.log('📧 Verificando conexión con Gmail...');
    await transporter.verify();
    console.log('✅ Conexión verificada exitosamente');
    
    // PASO 3: ENVIAR EMAIL DE PRUEBA
    const info = await transporter.sendMail({
      from: 'FisioTool Pro <fisiotoolsaas@gmail.com>',
      to: 'aunquedemanera@gmail.com',
      subject: '🧪 PRUEBA DIRECTA - FisioTool Email Service',
      html: `
        <h2>🧪 EMAIL DE PRUEBA DIRECTA</h2>
        <p>Si recibes este email, el servicio de email funciona correctamente.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Sistema:</strong> FisioTool Pro</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          Este es un email de prueba enviado directamente con Nodemailer + Gmail.<br>
          Si lo recibes, el sistema está listo para enviar emails de bonos.
        </p>
      `
    });
    
    console.log('✅ Email enviado exitosamente');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    console.log('🎉 ¡ÉXITO! Revisa tu email aunquedemanera@gmail.com');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Soluciones posibles:');
    console.log('1. Verifica que la contraseña de aplicación sea correcta');
    console.log('2. Asegúrate de tener activada la verificación en 2 pasos');
    console.log('3. Confirma que la contraseña tenga exactamente 16 caracteres');
  }
}

// EJECUTAR PRUEBA
pruebaDirecta();

module.exports = { pruebaDirecta };
