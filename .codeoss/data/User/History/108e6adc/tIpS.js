// CEREBRO DE EMERGENCIA (MODO DIAGNÓSTICO)
// Esto no usa Google. Solo responde para probar la conexión.

const processMessage = async (clinicId, userPhone, userMessage, channel = 'web') => {
  console.log(`🧠 [ANA CEREBRO] Recibido: "${userMessage}" desde ${clinicId}`);
  
  // Respuesta simulada inmediata
  const reply = `Conexión restablecida. Soy Ana (Modo Recuperación). He recibido tu mensaje: "${userMessage}". Mi cerebro de Google se está reiniciando, pero la línea es segura.`;

  return { reply };
};

module.exports = { processMessage };