// Servicio REAL de Email con SendGrid
const sendgrid = require('@sendgrid/mail');

// Configurar API Key de SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@fisiotool.com';
const FROM_NAME = process.env.FROM_NAME || 'FisioTool Pro';

sendgrid.setApiKey(SENDGRID_API_KEY);

const sendBonoPaymentLinkREAL = async ({ to, pacienteNombre, sesiones, precio, pagoUrl, clinicName, clinicLogo }) => {
  try {
    console.log(`📧 [EMAIL REAL] Enviando email a ${to}`);
    
    // VERIFICACIÓN DE EMAILS DE TESTING
    const emailsTesting = [
      'aunquedemanera@gmail.com',    // Email real funcional
      'fisiotoolsaas@gmail.com',     // Email real funcional
      'test@fisiotool.com'           // Email ficticio para control
    ];
    
    const esEmailTesting = emailsTesting.includes(to);
    
    if (!esEmailTesting) {
      console.log(`📧 [EMAIL] Email ficticio detectado: ${to}`);
      console.log(`   ⚠️  Este email no se enviará realmente`);
      return { success: false, message: 'Email ficticio - no se enviará' };
    }
    
    // Email HTML profesional
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
          .logo { max-width: 120px; height: auto; margin-bottom: 10px; }
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
          <strong>🧪 EMAIL DE TESTING REAL</strong><br>
          Este email se envía através de SendGrid para testing real
        </div>
        
        <div class="header">
          ${clinicLogo ? `<img src="${clinicLogo}" alt="${clinicName}" class="logo">` : `<h1 style="color: #007bff; margin: 0;">${clinicName}</h1>`}
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
          
          <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en responder a este email o contactarnos directamente.</p>
          
          <p>¡Nos vemos pronto!</p>
          <p><strong>El equipo de ${clinicName}</strong></p>
        </div>
        
        <div class="footer">
          <p>&copy; 2026 ${clinicName}. Todos los derechos reservados.</p>
          <p>Este email fue enviado porque solicitaste un bono de fisioterapia.</p>
          <p><em>Este es un email de testing real enviado con SendGrid.</em></p>
        </div>
      </body>
      </html>
    `;
    
    // ENVÍO REAL CON SENDGRID
    const msg = {
      to: to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      subject: `Tu bono de ${sesiones} sesiones de fisioterapia`,
      html: emailHTML
    };
    
    console.log(`📧 [SENDGRID] Enviando email real...`);
    const response = await sendgrid.send(msg);
    
    console.log(`✅ [SENDGRID] Email enviado exitosamente!`);
    console.log(`   Response: ${response[0].statusCode}`);
    console.log(`   Headers: ${JSON.stringify(response[0].headers)}`);
    
    // REGISTRAR LOG
    try {
      const { logEnvioBono } = require('./envioLogService');
      await logEnvioBono({
        tipo: 'email',
        pacienteId: pacienteNombre,
        email: to,
        resultado: 'enviado_real',
        error: null
      });
    } catch (logError) {
      console.error('❌ [EMAIL] Error registrando log:', logError.message);
    }
    
    return { 
      success: true, 
      message: 'Email real enviado con SendGrid',
      response: response[0]
    };
    
  } catch (error) {
    console.error('❌ [SENDGRID] Error enviando email:', error);
    
    // REGISTRAR ERROR
    try {
      const { logEnvioBono } = require('./envioLogService');
      await logEnvioBono({
        tipo: 'email',
        pacienteId: pacienteNombre,
        email: to,
        resultado: 'error',
        error: error.message
      });
    } catch (logError) {
      console.error('❌ [EMAIL] Error registrando log de error:', logError.message);
    }
    
    return { success: false, error: error.message };
  }
};

module.exports = { sendBonoPaymentLinkREAL };
