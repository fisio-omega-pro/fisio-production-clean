const { model } = require('../config/vertexai');
const crm = require('./crmService');

const processMessage = async (clinicId, userPhone, userMessage, channel = 'web') => {
  try {
    // Si no hay clinicId, usamos uno de test para no romper el flujo
    const targetId = clinicId || "test_clinic";
    
    console.log(`🤖 Ana pensando para ${targetId}...`);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Eres Ana. Saluda y responde corto: ${userMessage}` }] }],
    });

    const response = await result.response;
    const text = response.text();

    return { reply: text };
  } catch (error) {
    console.error("🔥 ERROR VERTEX AI:", error.message);
    return { reply: "Conexión con Google Vertex fallida. Revisa cuotas de API." };
  }
};

module.exports = { processMessage };