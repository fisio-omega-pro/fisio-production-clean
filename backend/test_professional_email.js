// PROBAR PLANTILLA HTML PROFESIONAL
const testProfessionalEmail = async () => {
  try {
    const { sendEmail } = require('./services/emailSenderService');
    const { generateRecaptacionEmail } = require('./services/recaptacionEmailTemplate');
    
    console.log('🔄 Probando plantilla HTML profesional...');
    
    // Generar HTML profesional
    const html = generateRecaptacionEmail({
      patientName: 'Augusto',
      clinicName: 'FisioTool Pro',
      assistantName: 'lucia',
      appUrl: 'https://app.fisiotool.com',
      clinicPhone: '+34 900 000 000',
      clinicEmail: 'info@fisiotool.com'
    });
    
    const result = await sendEmail({
      to: 'aunquedemanera@gmail.com',
      subject: 'Hola Augusto, ¿cómo estás? Te extrañamos en FisioTool Pro',
      text: `Hola Augusto,

Somos FisioTool Pro y te contactamos a través de FisioTool, nuestra plataforma inteligente de gestión.

Hemos visto que hace tiempo que no reservas y nos gustaría saber cómo estás.

💡 **Novedad**: Ahora puedes gestionar tus citas desde nuestra app móvil:
• 📅 Reserva tus citas cuando quieras
• 🔔 Recibe recordatorios automáticos
• 💬 Comunicación directa con nosotros

¿Te gustaría retomar tus tratamientos? Responde este email o descarga la app:
https://app.fisiotool.com

Un saludo,
lucia - FisioTool Pro
🤖 Powered by FisioTool
📞 +34 900 000 000`,
      html, // Plantilla HTML profesional
      type: 'ANA',
      clinicName: 'FisioTool Pro'
    });
    
    console.log('✅ RESULTADO DE LA PLANTILLA PROFESIONAL:');
    console.log(result);
    
    if (result.ok) {
      console.log('🎉 ¡EMAIL PROFESIONAL ENVIADO!');
      console.log('📧 Remitente: "FisioTool Pro via FisioTool" <ana@fisiotool.com>');
      console.log('📨 Destinatario: aunquedemanera@gmail.com');
      console.log('🎨 Diseño: Plantilla HTML profesional con branding');
    }
    
  } catch (e) {
    console.error('🔥 Error:', e.message);
  }
};

testProfessionalEmail();
