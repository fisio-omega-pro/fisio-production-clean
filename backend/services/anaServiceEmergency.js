// MODO EMERGENCIA - Ana con respuestas predefinidas mientras se configuran las API keys

const responses = [
  "Hola Soy Ana, tu asistente virtual. Estoy aquí para ayudarte con todo lo que necesites.",
  "Puedo ayudarte a reservar citas, consultar horarios y obtener información sobre tratamientos.",
  "Para reservar una cita, necesito saber qué día te viene bien y qué tratamiento necesitas.",
  "Nuestros horarios son de lunes a viernes de 9:00 a 20:00 y sábados de 9:00 a 14:00.",
  "Puedes pagar con tarjeta, Bizum o transferencia bancaria.",
  "¿En qué más puedo ayudarte hoy?",
  "Para más información, puedes visitar nuestra web o llamarnos al teléfono.",
  "Gracias por contactar con Momentun. Estamos para ayudarte."
];

const processMessage = async (clinicId, userMessage) => {
  try {
    console.log('🤖 [ANA EMERGENCIA] Procesando mensaje:', userMessage);
    
    // Respuesta simple basada en palabras clave
    const message = userMessage.toLowerCase();
    
    if (message.includes('hola') || message.includes('buenos')) {
      return { reply: responses[0] };
    } else if (message.includes('cita') || message.includes('reserv')) {
      return { reply: responses[2] };
    } else if (message.includes('horario') || message.includes('horarios')) {
      return { reply: responses[3] };
    } else if (message.includes('pago') || message.includes('pagar')) {
      return { reply: responses[4] };
    } else if (message.includes('gracias') || message.includes('adiós')) {
      return { reply: "¡De nada! Estamos aquí para lo que necesites." };
    } else {
      // Respuesta aleatoria
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      return { reply: randomResponse };
    }
    
  } catch (error) {
    console.error('🔥 [ANA EMERGENCIA] Error:', error);
    return { reply: "Lo siento, estoy teniendo problemas técnicos. Por favor, inténtalo más tarde." };
  }
};

module.exports = {
  processMessage
};
