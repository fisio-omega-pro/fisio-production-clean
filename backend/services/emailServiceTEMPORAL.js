// Servicio TEMPORAL con Nodemailer (Gmail)
const nodemailer = require('nodemailer');

// Configuración temporal con Gmail
const createEmailTester = async () => {
  try {
    console.log(`📧 [NODEMAILER] Creando transportador de email...`);
    
    // Configuración para Gmail (testing)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: 'fisiotoolsaas@gmail.com',      // Email de envío
        pass: 'tu_contraseña_de_app'          // Contraseña de aplicación Gmail
      }
    });
    
    // Verificar conexión
    await transporter.verify();
    console.log(`✅ [NODEMAILER] Conexión verificada con Gmail`);
    
    return transporter;
    
  } catch (error) {
    console.error('❌ [NODEMAILER] Error configurando email:', error);
    return null;
  }
};

const sendBonoPaymentLinkTEMPORAL = async ({ to, pacienteNombre, sesiones, precio, pagoUrl, clinicName }) => {
  try {
    console.log(`📧 [NODEMAILER] Enviando email temporal a ${to}`);
    
    // Emails de testing permitidos
    const emailsTesting = [
      'aunquedemanera@gmail.com',
      'fisiotoolsaas@gmail.com',
      'test@fisiotool.com'
    ];
    
    if (!emailsTesting.includes(to)) {
      return { success: false, message: 'Email no permitido para testing' };
    }
    
    // Crear transportador
    const transporter = await createEmailTester();
    if (!transporter) {
      return { success: false, message: 'No se pudo configurar el envío de email' };
    }
    
    // Email HTML
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tu bono de fisioterapia</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #007bff; }
          .content { padding: 30px 0; }
          .bono-card { background: #f8f9fa; border: 2px solid #007bff; border-radius: 10px; padding: 20px; margin: 20px 0; }
          .details { margin: 20px 0; }
          .detail-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .cta-button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px 0; border-top: 1px solid #eee; color: #666; font-size: 14px; }
          .testing-banner { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 10px; margin: 10px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="testing-banner">
          <strong>🧪 EMAIL DE TESTING TEMPORAL</strong><br>
          Enviado con Nodemailer + Gmail para testing inmediato
        </div>
        
        <div class="header">
          <h1 style="color: #007bff; margin: 0;">${clinicName}</h1>
          <h2 style="color: #333; margin: 10px 0;">Tu bono de fisioterapia está listo 💪</h2>
        </div>
        
        <div class="content">
          <p>Hola <strong>${pacienteNombre}</strong>,</p>
          <p>¡Buenas noticias! Tu bono de sesiones de fisioterapia ha sido creado y está listo para activar.</p>
          
          <div class="bono-card">
            <h3 style="color: #007bff; margin-top: 0;">🎫 DETALLES DE TU BONO</h3>
            <div class="details">
              <div class="detail-item">
                <span>Sesiones incluidas:</span>
                <strong>${sesiones} sesiones</strong>
              </div>
              <div class="detail-item">
                <span>Precio total:</span>
                <strong>€${precio}</strong>
              </div>
              <div class="detail-item">
                <span>Estado:</span>
                <strong>Pendiente de activación</strong>
              </div>
            </div>
          </div>
          
          <p>Para activar tu bono y empezar a usar tus sesiones, simplemente realiza el pago a través del siguiente botón:</p>
          
          <div style="text-align: center;">
            <a href="${pagoUrl}" class="cta-button">
              PAGAR MI BONO AHORA →
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Una vez realizado el pago, tu bono se activará automáticamente y podrás agendar tus citas.
            El enlace de pago es válido por 24 horas.
          </p>
          
          <p>¡Nos vemos pronto!</p>
          <p><strong>El equipo de ${clinicName}</strong></p>
        </div>
        
        <div class="footer">
          <p>&copy; 2026 ${clinicName}. Todos los derechos reservados.</p>
          <p><em>Email de testing temporal enviado con Nodemailer.</em></p>
        </div>
      </body>
      </html>
    `;
    
    // Enviar email
    const mailOptions = {
      from: 'FisioTool Pro <fisiotoolsaas@gmail.com>',
      to: to,
      subject: `Tu bono de ${sesiones} sesiones de fisioterapia`,
      html: emailHTML
    };
    
    console.log(`📧 [NODEMAILER] Enviando email real...`);
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ [NODEMAILER] Email enviado exitosamente!`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    
    return { 
      success: true, 
      message: 'Email real enviado con Nodemailer',
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
    
  } catch (error) {
    console.error('❌ [NODEMAILER] Error enviando email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendBonoPaymentLinkTEMPORAL, createEmailTester };
