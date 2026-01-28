const { model } = require('../config/vertexai');
const crm = require('./crmService');

const processMessage = async (clinicId, userPhone, userMessage, channel = 'web') => {
  try {
    const info = await crm.getClinicaByIdOrSlug(clinicId);
    const nombreClinica = info ? info.nombre_clinica : "FisioTool";

    const prompt = `Eres Ana, la consultora estratégica de la clínica "${nombreClinica}".
    Tu misión es ayudar al profesional a escalar su negocio con respuestas brillantes.
    Pregunta del profesional: ${userMessage}`;

    // --- MANIOBRA OMEGA: Formateo de Array con Roles ---
    const contents = [
      {
        role: "user", // <--- LA CLAVE QUE ME DISTE
        parts: [{ text: prompt }]
      }
    ];

    console.log("🤖 Ana está pensando en Bélgica...");

    const result = await model.generateContent({ contents });
    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("Respuesta vacía");

    return { reply: text };
  } catch (error) {
    console.error("🔥 ERROR MOTOR ANA:", error.message);
    return { reply: "Hola, soy Ana. Mi conexión con el motor de Google ha tenido un hipo, pero ya estoy aquí. ¿Qué querías analizar?" };
  }
};

module.exports = { processMessage };