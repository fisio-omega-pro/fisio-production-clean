// PROBAR SISTEMA HÍBRIDO INTELIGENTE
const testHybridEmail = async () => {
  try {
    const { sendEmail } = require('./services/emailSenderService');
    
    console.log('🔄 Probando sistema híbrido...');
    
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
https://fisiotool.com/app

Un saludo,
lucia - FisioTool Pro
🤖 Powered by FisioTool
📞 +34 900 000 000`,
      type: 'ANA',
      clinicName: 'FisioTool Pro' // Nombre para el remitente híbrido
    });
    
    console.log('✅ RESULTADO DEL SISTEMA HÍBRIDO:');
    console.log(result);
    
    if (result.ok) {
      console.log('🎉 ¡EMAIL ENVIADO CORRECTAMENTE!');
      console.log('📧 Remitente: "FisioTool Pro via FisioTool" <admind@fisiotool.com>');
      console.log('📨 Destinatario: aunquedemanera@gmail.com');
    }
    
  } catch (e) {
    console.error('🔥 Error:', e.message);
  }
};

testHybridEmail();
