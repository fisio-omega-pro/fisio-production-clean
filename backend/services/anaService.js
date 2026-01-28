const { initEnv } = require('../config/env');

const callAnaEngine = async (prompt) => {
  const env = await initEnv();
  const apiKey = env.GOOGLE_AI_KEY;

  if (!apiKey) {
    return "Error: No tengo acceso a mi llave maestra. Revisa GOOGLE_AI_KEY en el Búnker.";
  }

  // 🚨 MODELO QUE LA CUENTA DE PAGO DEL USUARIO SOPORTA
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("🔥 Error de Google API (Cuota de nuevo):", data);
      throw new Error(`Fallo de conexión: ${data.error?.message}`);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
  } catch (error) {
    throw error;
  }
};

// ... (Resto de funciones: Contenido y Prompts)

module.exports = {
  processMessage: async (clinicId, userMessage) => {
    let context = "[TU ADN COGNITIVO COMPLETO AQUÍ]"; // Asumo que el ADN está pegado correctamente
    context += "\n\nAPLICACIÓN: Eres Ana, la cara de FisioTool Pro. Usa tu autoridad en la conducta para ser empática y resolutiva.";
    try {
      const reply = await callAnaEngine(`${context}\n\nCONSULTA: "${userMessage}"`);
      return { reply };
    } catch (e) { return { reply: "Mis sistemas están experimentando saturación. Por favor, vuelve a intentarlo en un momento." }; }
  },

  processAdminConsultation: async (userMessage) => {
    let context = "[TU ADN COGNITIVO COMPLETO AQUÍ]"; // Asumo que el ADN está pegado correctamente
    context += "\n\nAPLICACIÓN: Eres la CFO y Directora Legal de FisioTool Pro. Asesora con rigor fiscal y estrategia 'Shark'.";
    try {
      const reply = await callAnaEngine(`${context}\n\nCONSULTA: "${userMessage}"`);
      return { reply };
    } catch (e) { return { reply: "Error de conexión en el cerebro legal." }; }
    }
};
