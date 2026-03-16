const { sendEmail } = require('./services/emailService');

async function enviarEmailSimple() {
  try {
    console.log('🔧 ENVIANDO EMAIL ULTRA-SIMPLE PARA IPHONE...');
    
    const pacientes = [
      { nombre: 'Usuario Test', email: 'fisiotoolsaas@gmail.com' },
      { nombre: 'Usuario Test 2', email: 'fisiotool@gmail.com' }
    ];
    
    const clinicName = 'Momentun';
    const pwaUrl = 'https://fisiotool.com/ana?ref=VkZQrWpagjryISYfx2lU';
    
    for (const paciente of pacientes) {
      const subject = `📱 App de ${clinicName}`;
      
      const textContent = `Hola ${paciente.nombre},

Te invitamos a instalar la app de ${clinicName}.

¿Qué puedes hacer?
• Reservar citas
• Hablar con Ana
• Pagar online
• Recordatorios

INSTALAR APP AQUÍ:
${pwaUrl}?from=email

El equipo de ${clinicName}`;

      await sendEmail({
        to: paciente.email,
        subject,
        text: textContent,
        type: 'ANA',
        clinicName
      });
      
      console.log('✅ Email simple enviado a:', paciente.email);
    }
    
    console.log('🎉 Emails simples enviados');
    
  } catch (error) {
    console.error('🔥 Error:', error);
  }
}

enviarEmailSimple();
