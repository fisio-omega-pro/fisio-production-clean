const { initEnv } = require('../config/env');

const callAnaEngine = async (prompt) => {
  const env = await initEnv();
  const apiKey = env.GOOGLE_AI_KEY;

  if (!apiKey) {
    return "Error: No tengo acceso a mi llave maestra. Revisa GOOGLE_AI_KEY en el Búnker.";
  }

  // 🚨 MODELO POR ENV (obligatorio)
  const model = env.GOOGLE_AI_MODEL;
  if (!model) {
    throw new Error('Falta GOOGLE_AI_MODEL');
  }

  // LOG TEMPORAL (solo para debug)
  console.error("🔎 ANA MODEL EN RUNTIME:", model);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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

const baseCognitiveContext = "[TU ADN COGNITIVO COMPLETO AQUÍ]";

const buildContext = (role, clinicId = null) => {
  let context = baseCognitiveContext;
  if (clinicId) context += `\n\nCLINICA_ID: ${clinicId}`;
  if (role === 'patient') {
    context += "\n\nAPLICACION: Eres Ana para pacientes. Tono empatico, claro y humano. No inventes datos, confirma cuando falte informacion, y guia hacia la reserva o el pago sin presionar. No das diagnosticos medicos.";
    return context;
  }
  if (role === 'clinic') {
    context += "\n\nAPLICACION: Eres Ana para profesionales (fisio/clinica). Responde con precision operativa, explica procesos del panel, y prioriza claridad en agenda, cobros, pacientes y configuracion.";
    return context;
  }
  if (role === 'prospection') {
    context += "\n\nAPLICACION: Eres Ana en prospeccion. Tono profesional, breve y convincente. Califica interes, detecta si hay discapacidad visual y ofrece acceso a /access cuando proceda.";
    return context;
  }
  if (role === 'legal') {
    context += "\n\nAPLICACION: Eres la CFO y Directora Legal de FisioTool Pro. Asesora con rigor fiscal y estrategia, sin sustituir asesoria juridica externa.";
    return context;
  }
  context += "\n\nAPLICACION: Eres Ana, la cara de FisioTool Pro. Usa tu autoridad en la conducta para ser empatica y resolutiva.";
  return context;
};

const processWithRole = async (role, clinicId, userMessage, fallback) => {
  try {
    const context = buildContext(role, clinicId);
    const reply = await callAnaEngine(`${context}\n\nCONSULTA: "${userMessage}"`);
    return { reply };
  } catch (e) {
    return { reply: fallback };
  }
};

module.exports = {
  processMessage: async (clinicId, userMessage) => {
    return processWithRole('patient', clinicId, userMessage, "Mis sistemas están experimentando saturación. Por favor, vuelve a intentarlo en un momento.");
  },
  processPatientMessage: async (clinicId, userMessage) => {
    return processWithRole('patient', clinicId, userMessage, "Mis sistemas están experimentando saturación. Por favor, vuelve a intentarlo en un momento.");
  },
  processClinicMessage: async (clinicId, userMessage) => {
    return processWithRole('clinic', clinicId, userMessage, "No puedo acceder al panel en este momento. Intenta de nuevo en unos minutos.");
  },
  processProspectionMessage: async (userMessage) => {
    return processWithRole('prospection', null, userMessage, "Ahora mismo no puedo procesar esa solicitud. Intenta de nuevo en unos minutos.");
  },
  processAdminConsultation: async (userMessage) => {
    return processWithRole('legal', null, userMessage, "Error de conexión en el cerebro legal.");
  }
};
