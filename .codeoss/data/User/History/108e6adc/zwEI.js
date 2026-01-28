/**
 * 🧠 ANA SERVICE - CEREBRO REAL (CONECTADO A VERTEX AI)
 */
const { model } = require('../config/vertexai');
const crm = require('./crmService');

const processMessage = async (clinicId, userPhone, userMessage, channel = 'web') => {
  try {
    let nombreClinica = "FisioTool";
    let contexto = "Eres un asistente útil.";

    // 1. Intentamos recuperar datos reales de la clínica
    if (clinicId && clinicId !== 'emergency_id') {
      try {
        const info = await crm.getClinica(clinicId);
        if (info) {
          nombreClinica = info.nombre_clinica;
          contexto = `
            Eres Ana, la consultora estratégica de la clínica "${nombreClinica}".
            Precios: ${info.config_ia?.precio || 50}€. 
            Fianza: ${info.config_ia?.fianza || 15}€.
            Misión: Ayudar al profesional a gestionar su negocio y responder dudas sobre rentabilidad.
          `;
        }
      } catch (e) {
        console.warn("⚠️ No se pudo cargar info clínica, usando genérico.");
      }
    }

    // 2. Construcción del Prompt para Google
    const prompt = `${contexto}\n\nPregunta del usuario: "${userMessage}"`;

    console.log(`🤖 Ana pensando para ${nombreClinica}...`);

    // 3. Llamada a Vertex AI (Formato Estricto)
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const response = await result.response;
    const text = response.text();

    // 4. Guardar Log (Sin bloquear)
    if (clinicId) {
      crm.db.collection('chats').add({
        clinic_id: clinicId,
        msg: userMessage,
        reply: text,
        ts: new Date()
      }).catch(err => console.error("Error guardando log", err));
    }

    return { reply: text };

  } catch (error) {
    console.error("🔥 ERROR REAL VERTEX AI:", error.message);
    // Si falla Google, damos un mensaje elegante en lugar de romper
    return { reply: "Mis sistemas neuronales están recalibrando la conexión con Google. Por favor, pregúntame de nuevo en 10 segundos." };
  }
};

module.exports = { processMessage };