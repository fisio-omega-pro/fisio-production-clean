// CONFIGURACIÓN INMEDIATA - EMAIL REAL CON NODEMAILER
const nodemailer = require('nodemailer');

// Configuración para testing inmediato
const config = {
  service: 'gmail',
  auth: {
    user: 'fisiotoolsaas@gmail.com',
    pass: 'CONTRASEÑA_DE_APLICACIÓN' // Necesitas generar esto
  }
};

// Instrucciones para generar contraseña de aplicación Gmail:
const instructions = `
🔧 CONFIGURACIÓN GMAIL PARA NODEMAILER:

1. ENTRAR A CUENTA GOOGLE:
   - Ir a: https://myaccount.google.com/
   - Login con: fisiotoolsaas@gmail.com

2. ACTIVAR VERIFICACIÓN EN 2 PASOS:
   - Seguridad → Verificación en 2 pasos
   - Activar si no está activa

3. GENERAR CONTRASEÑA DE APLICACIÓN:
   - Seguridad → Contraseñas de aplicaciones
   - Seleccionar: "Otro (nombre personalizado)"
   - Nombre: "FisioTool Email Service"
   - Generar contraseña de 16 caracteres
   - Copiar contraseña (ej: abcd efgh ijkl mnop)

4. CONFIGURAR EN EL SISTEMA:
   - Reemplazar 'CONTRASEÑA_DE_APLICACIÓN' con la contraseña generada
   - Instalar dependencia: npm install nodemailer
   - Probar envío inmediato

⚠️ IMPORTANTE:
- Usar contraseña de aplicación, NO contraseña normal
- La contraseña tiene 16 caracteres con espacios
- Sin esto, Gmail rechazará el envío
`;

console.log(instructions);

// Email Service REAL
const sendEmailREAL = async ({ to, subject, html, text }) => {
  try {
    // Crear transportador
    const transporter = nodemailer.createTransporter(config);
    
    // Verificar conexión
    await transporter.verify();
    console.log('✅ Conexión Gmail verificada');
    
    // Enviar email
    const info = await transporter.sendMail({
      from: 'FisioTool Pro <fisiotoolsaas@gmail.com>',
      to: to,
      subject: subject,
      html: html,
      text: text
    });
    
    console.log('✅ Email enviado exitosamente');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { success: false, error: error.message };
  }
};

// Email de prueba para bonos
const sendBonoEmailPRUEBA = async ({ to, pacienteNombre, sesiones, precio, pagoUrl }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Tu bono de fisioterapia</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
        .bono-card { background: #f8f9fa; border: 2px solid #007bff; border-radius: 10px; padding: 20px; margin: 20px 0; }
        .cta-button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .testing-banner { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 10px; margin: 10px 0; text-align: center; }
      </style>
    </head>
    <body>
      <div class="testing-banner">
        <strong>🧪 EMAIL DE PRUEBA REAL</strong><br>
        Este email se envía con Nodemailer + Gmail para testing inmediato
      </div>
      
      <div class="header">
        <h1 style="color: #007bff;">FisioTool Pro</h1>
        <h2>Tu bono de fisioterapia está listo 💪</h2>
      </div>
      
      <p>Hola <strong>${pacienteNombre}</strong>,</p>
      <p>¡Buenas noticias! Tu bono de sesiones de fisioterapia ha sido creado y está listo para activar.</p>
      
      <div class="bono-card">
        <h3 style="color: #007bff; margin-top: 0;">🎫 DETALLES DE TU BONO</h3>
        <p><strong>Sesiones incluidas:</strong> ${sesiones} sesiones</p>
        <p><strong>Precio total:</strong> €${precio}</p>
        <p><strong>Estado:</strong> Pendiente de activación</p>
      </div>
      
      <p>Para activar tu bono, haz clic en el siguiente botón:</p>
      
      <div style="text-align: center;">
        <a href="${pagoUrl}" class="cta-button">
          PAGAR MI BONO AHORA →
        </a>
      </div>
      
      <p>Una vez realizado el pago, tu bono se activará automáticamente.</p>
      
      <p>¡Nos vemos pronto!</p>
      <p><strong>El equipo de FisioTool Pro</strong></p>
      
      <hr>
      <p style="font-size: 12px; color: #666;">
        Email de prueba enviado con Nodemailer + Gmail.<br>
        Si recibes esto, el sistema de email funciona correctamente.
      </p>
    </body>
    </html>
  `;
  
  return await sendEmailREAL({
    to: to,
    subject: `🧪 PRUEBA: Tu bono de ${sesiones} sesiones de fisioterapia`,
    html: html,
    text: `Hola ${pacienteNombre}, tu bono de ${sesiones} sesiones está listo. Paga aquí: ${pagoUrl}`
  });
};

module.exports = { sendEmailREAL, sendBonoEmailPRUEBA, config, instructions };
