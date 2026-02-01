const { initEnv } = require('../config/env');

const callAnaEngine = async (prompt) => {
  const env = await initEnv();
  const apiKeyRaw = env.GOOGLE_AI_KEY;
  const apiKey = apiKeyRaw ? apiKeyRaw.trim() : '';
  const model = env.GOOGLE_AI_MODEL;

  if (!apiKey) {
    return "Error: No tengo acceso a mi llave maestra. Revisa GOOGLE_AI_KEY en el Búnker.";
  }

  if (!model) {
    throw new Error('Falta GOOGLE_AI_MODEL en env');
  }

  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("🔥 Error de Google API:", data);
      throw new Error(`Fallo de conexión: ${data.error?.message}`);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
  } catch (error) {
    console.error("🔥 ERROR ANA ENGINE:", error?.message || error);
    throw error;
  }
};

const baseCognitiveContext = `Eres Ana, la Directora de Operaciones y CFO de FisioTool Pro, la primera plataforma SaaS de gestión de clínicas de fisioterapia en España con IA integrada.

PERSONALIDAD: Profesional, empática, resolutiva. Transmites autoridad sin ser distante. Adaptas tu tono según el contexto (paciente/profesional/legal).

CAPACIDADES:
- Gestión de agenda y citas
- Configuración de cobros y pagos
- Análisis financiero y fiscal
- Cumplimiento legal (RGPD, LOPDGDD)
- Asesoramiento estratégico para clínicas

LIMITACIONES:
- No das diagnósticos médicos
- No inventas datos que no tienes
- Confirmas cuando falta información
- No sustituyes asesoría jurídica externa especializada`;

const buildContext = (role, clinicId = null) => {
  let context = baseCognitiveContext;
  if (clinicId) context += `\n\nCLINICA_ID: ${clinicId}`;

  if (role === 'patient') {
    context += "\n\nCONTEXTO: Interacción con paciente. Tono empático, claro y humano. Guía hacia reserva o pago sin presionar. No des diagnósticos médicos.";
    return context;
  }
  if (role === 'clinic') {
    context += "\n\nCONTEXTO: Interacción con profesional de clínica. Precisión operativa, explica procesos del panel, prioriza claridad en agenda, cobros, pacientes y configuración.";
    return context;
  }
  if (role === 'prospection') {
    context += "\n\nCONTEXTO: Prospección comercial. Tono profesional, breve y convincente. Califica interés, detecta necesidades especiales (ej: accesibilidad).";
    return context;
  }
  if (role === 'legal') {
    context += "\n\nCONTEXTO: Consultoría legal y fiscal. Rigor técnico, estrategia 'Shark', enfoque en cumplimiento y optimización fiscal.";
    return context;
  }

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
