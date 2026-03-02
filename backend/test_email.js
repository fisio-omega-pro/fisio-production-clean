// ENVIAR EMAIL DE PRUEBA DESDE SISTEMA DE RECUPERACIÓN
const sendTestEmail = async () => {
  try {
    const { sendEmail } = require('./services/emailSenderService');
    
    console.log('🔄 Enviando email de prueba...');
    
    const result = await sendEmail({
      to: 'aunquedemanera@gmail.com',
      subject: 'Hola Augusto, ¿cómo estás? Te extrañamos en FisioTool Pro',
      text: `Hola Augusto,

Soy lucia de FisioTool Pro. Ha pasado tiempo desde tu última visita y nos gustaría saber cómo estás.

💡 **Novedad**: Ahora puedes gestionar tus citas desde nuestra app móvil:
• 📅 Reserva tus citas cuando quieras
• 🔔 Recibe recordatorios automáticos
• 💬 Habla directamente con nosotros

¿Te gustaría retomar tus tratamientos? Puedes responder este email o descargar la app:
[URL DE TU APP PWA]

Un saludo,
lucia
FisioTool Pro
📞 [Teléfono de la clínica]`,
      type: 'ANA',
      clinicEmail: 'fisiotoolsaas@gmail.com' // Tu email configurado
    });
    
    console.log('✅ RESULTADO DEL ENVÍO:');
    console.log(result);
    
  } catch (e) {
    console.error('🔥 Error:', e.message);
  }
};

sendTestEmail();
