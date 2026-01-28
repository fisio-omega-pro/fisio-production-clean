const { model } = require('../config/vertexai');
const crm = require('./crmService');

const processMessage = async (clinicId, userPhone, userMessage, channel = 'web') => {
  try {
    const info = await crm.getClinicaByIdOrSlug(clinicId);
    if (!info) throw new Error("ID de clínica no válido");

    const prompt = `Eres Ana, la consultora estratégica de la clínica "${info.nombre_clinica}".
    Contexto: Precio sesión ${info.config_ia?.precio_sesion}€, Fianza ${info.config_ia?.fianza_reserva}€.
    Misión: Ayudar al profesional con datos reales y empatía clínica.
    Pregunta del profesional: ${userMessage}`;

    // Estructura oficial Vertex AI 1.5
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("IA devolvió respuesta vacía");

    // Guardado de rastro en CRM
    await crm.guardarLog({ clinic_id: clinicId, tlf: userPhone, usr: userMessage, ia: text, channel });

    return { reply: text };
  } catch (error) {
    console.error("🔥 ERROR MOTOR ANA:", error.message);
    return { reply: "Estoy procesando los datos de tu clínica, pero Google Vertex ha tardado más de lo esperado. ¿Podemos retomar la pregunta?" };
  }
};

module.exports = { processMessage };∫