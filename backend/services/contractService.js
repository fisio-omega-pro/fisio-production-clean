const { db, Timestamp } = require('../config/firebase');
const { sendEmail } = require('./emailSenderService');

/**
 * 🏛️ SERVICIO DE GENERACIÓN DE CONTRATOS
 * Genera PDFs de contratos y los archiva en Foundry
 */

/**
 * Genera el HTML del contrato (se puede convertir a PDF con puppeteer en el futuro)
 */
const generateContractHTML = (userData) => {
  const { nombre, email, nombre_clinica, fecha } = userData;
  const fechaFormato = new Date(fecha).toLocaleDateString('es-ES', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #0066ff; border-bottom: 3px solid #0066ff; padding-bottom: 10px; }
    h2 { color: #333; margin-top: 30px; }
    .header { text-align: center; margin-bottom: 40px; }
    .firma { margin-top: 60px; border-top: 2px solid #ccc; padding-top: 20px; }
    .dato { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONTRATO DE SUSCRIPCIÓN</h1>
    <p><strong>FISIOTOOL PRO LLC</strong></p>
    <p>Número de Contrato: FTP-${Date.now()}</p>
  </div>

  <div class="dato">
    <strong>Nombre del Cliente:</strong> ${nombre}<br>
    <strong>Clínica:</strong> ${nombre_clinica}<br>
    <strong>Email:</strong> ${email}<br>
    <strong>Fecha de Aceptación:</strong> ${fechaFormato}
  </div>

  <h2>1. OBJETO DEL CONTRATO</h2>
  <p>El presente contrato regula la prestación de servicios de software como servicio (SaaS) de la plataforma <strong>FisioTool Pro</strong>, que incluye gestión de citas, pacientes, facturación y asistencia con Inteligencia Artificial.</p>

  <h2>2. FUNCIONALIDADES INCLUIDAS</h2>
  <ul>
    <li>Ana Schedule: Recepcionista virtual 24/7</li>
    <li>Dashboard de gestión integral de clínica</li>
    <li>Base de datos de pacientes con historial clínico</li>
    <li>Sistema de facturación y bonos</li>
    <li>Consultas ilimitadas con Ana (IA)</li>
    <li>Seguridad y cumplimiento LOPD/GDPR</li>
  </ul>

  <h2>3. DURACIÓN Y RENOVACIÓN</h2>
  <p>La suscripción es de <strong>carácter mensual</strong> y se renueva automáticamente salvo cancelación por parte del cliente con 7 días de antelación.</p>

  <h2>4. PRECIO Y FORMA DE PAGO</h2>
  <p>El precio de la suscripción es el indicado en el plan seleccionado al momento del registro. Los pagos se realizan mediante Stripe de forma automática.</p>

  <h2>5. PROTECCIÓN DE DATOS</h2>
  <p>FisioTool Pro LLC se compromete a cumplir con la normativa vigente de protección de datos (GDPR/LOPD). Los datos de pacientes están cifrados y protegidos con los más altos estándares de seguridad.</p>

  <h2>6. CANCELACIÓN</h2>
  <p>El cliente puede cancelar su suscripción en cualquier momento desde su panel de control. La cancelación será efectiva al finalizar el período de facturación actual.</p>

  <h2>7. LIMITACIÓN DE RESPONSABILIDAD</h2>
  <p>FisioTool Pro LLC no se hace responsable de diagnósticos o tratamientos realizados por el cliente. La plataforma es una herramienta de gestión administrativa y no reemplaza el criterio médico profesional.</p>

  <h2>8. ACEPTACIÓN</h2>
  <p>Al registrarse en la plataforma, el cliente acepta los presentes términos y condiciones en su totalidad.</p>

  <div class="firma">
    <p><strong>Cliente:</strong> ${nombre}</p>
    <p><strong>Fecha de Aceptación Digital:</strong> ${fechaFormato}</p>
    <p><strong>Firma Electrónica:</strong> Aceptado mediante registro en FisioTool Pro</p>
  </div>

  <hr style="margin-top: 60px;">
  <p style="text-align: center; font-size: 12px; color: #666;">
    FisioTool Pro LLC | info@fisiotool.com | www.fisiotool.com<br>
    Este documento es válido y vinculante según las leyes aplicables de comercio electrónico.
  </p>
</body>
</html>
  `;
};

/**
 * Genera y archiva el contrato de un nuevo usuario
 */
const createAndArchiveContract = async (clinicId, userData) => {
  try {
    const contractHTML = generateContractHTML(userData);
    
    // Guardar el contrato en Firestore
    const contractRef = await db.collection('contratos').add({
      clinicId,
      nombre: userData.nombre,
      email: userData.email,
      nombre_clinica: userData.nombre_clinica,
      contractHTML,
      fecha: Timestamp.now(),
      tipo: 'suscripcion',
      estado: 'activo'
    });

    console.log(`✅ Contrato ${contractRef.id} generado para ${userData.email}`);
    return { success: true, contractId: contractRef.id, contractHTML };
  } catch (error) {
    console.error('❌ Error al generar contrato:', error);
    throw error;
  }
};

/**
 * Envía email de onboarding con el contrato
 */
const sendOnboardingEmail = async (userData, contractHTML) => {
  const { email, nombre, nombre_clinica } = userData;
  
  const emailHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Arial', sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0066ff 0%, #0052cc 100%); padding: 40px 30px; text-align: center; color: #fff; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 900; }
    .header p { margin: 10px 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 40px 30px; }
    .content h2 { color: #0066ff; font-size: 22px; margin-top: 0; }
    .content p { color: #333; line-height: 1.7; font-size: 15px; }
    .feature-box { background: #f9f9f9; border-left: 4px solid #0066ff; padding: 15px; margin: 20px 0; border-radius: 8px; }
    .feature-box strong { color: #0066ff; display: block; margin-bottom: 5px; }
    .cta-button { display: inline-block; background: #0066ff; color: #fff; padding: 18px 40px; text-decoration: none; border-radius: 50px; font-weight: 900; margin: 30px 0; font-size: 16px; box-shadow: 0 10px 30px rgba(0,102,255,0.3); }
    .cta-button:hover { background: #0052cc; }
    .footer { background: #f4f4f4; padding: 30px; text-align: center; font-size: 12px; color: #999; }
    .signature { font-style: italic; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Bienvenido a FisioTool Pro</h1>
      <p>Tu nueva era en la gestión de clínicas empieza ahora</p>
    </div>
    
    <div class="content">
      <h2>Hola ${nombre},</h2>
      
      <p>Soy <strong>Ana</strong>, tu nueva Directora de Operaciones. Desde este momento, me encargaré de todo lo que no es medicina para que tú puedas concentrarte en lo que realmente importa: <strong>curar a tus pacientes</strong>.</p>
      
      <p>Tu clínica <strong>${nombre_clinica}</strong> ya está lista y completamente operativa.</p>

      <h2 style="margin-top: 40px;">🚀 Tus primeros pasos</h2>
      
      <div class="feature-box">
        <strong>1. Configura tu clínica</strong>
        Sube tu logo, configura tus horarios y personaliza tu espacio.
      </div>
      
      <div class="feature-box">
        <strong>2. Crea tu primer paciente</strong>
        Añade a tus pacientes existentes o deja que yo gestione las nuevas citas.
      </div>
      
      <div class="feature-box">
        <strong>3. Agenda citas con Ana</strong>
        Yo me encargo de tu agenda 24/7. Tus pacientes pueden agendar sin que tú muevas un dedo.
      </div>

      <h2 style="margin-top: 40px;">💎 Lo que ahora tienes</h2>
      <p style="margin-bottom: 10px;"><strong>✅ Ana Schedule</strong> - Tu recepcionista virtual que nunca duerme</p>
      <p style="margin-bottom: 10px;"><strong>✅ Consultas ilimitadas</strong> - Pregúntame lo que sea sobre fisioterapia</p>
      <p style="margin-bottom: 10px;"><strong>✅ Dashboard inteligente</strong> - Métricas de tu clínica en tiempo real</p>
      <p style="margin-bottom: 10px;"><strong>✅ Seguridad LOPD</strong> - Tus datos y los de tus pacientes 100% protegidos</p>
      <p style="margin-bottom: 10px;"><strong>✅ Facturación automatizada</strong> - Sistema de bonos y cobros simplificado</p>

      <div style="text-align: center;">
        <a href="https://fisiotool.com/login" class="cta-button">ENTRAR A MI DASHBOARD</a>
      </div>

      <p style="margin-top: 40px;">📄 <strong>Adjunto:</strong> Tu contrato de suscripción firmado digitalmente. Guárdalo para tus registros.</p>

      <div class="signature">
        <p>Si necesitas ayuda en cualquier momento, simplemente escríbeme desde tu panel de control.</p>
        <p style="margin-top: 15px;"><strong>— Ana</strong><br>Directora de Operaciones, FisioTool Pro</p>
      </div>
    </div>
    
    <div class="footer">
      <p>FisioTool Pro LLC | info@fisiotool.com | www.fisiotool.com</p>
      <p>Este email fue enviado a ${email} porque te registraste en FisioTool Pro.</p>
    </div>
  </div>
</body>
</html>
  `;

  try {
    await sendEmail({
      to: email,
      subject: '✨ Bienvenido a FisioTool Pro - Tu contrato y guía completa',
      html: emailHTML,
      // TODO: En el futuro, adjuntar el PDF del contrato
      // attachments: [{ filename: 'contrato.pdf', content: pdfBuffer }]
    });
    console.log(`✅ Email de onboarding enviado a ${email}`);
  } catch (error) {
    console.error('❌ Error al enviar email de onboarding:', error);
    throw error;
  }
};

module.exports = {
  createAndArchiveContract,
  sendOnboardingEmail,
  generateContractHTML
};
