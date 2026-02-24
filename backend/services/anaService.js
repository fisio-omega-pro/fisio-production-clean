const { initEnv } = require('../config/env');

const callAnaEngine = async (prompt, options = {}) => {
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

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    ...(options?.maxOutputTokens != null && { generationConfig: { maxOutputTokens: options.maxOutputTokens } })
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
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

const DASHBOARD_KNOWLEDGE = `
CONOCIMIENTO DEL DASHBOARD (usa esto para explicar al detalle cuando pregunten cómo funciona algo):
- Inicio: resumen del panel, enlace para pacientes, QR, opción "Abrir en PC". Si falta setup (logo/Stripe/suscripción) se avisa.
- Agenda: vista Día o Mes; filtro por especialista (TODOS o uno); BLOQUEAR horario; NUEVA CITA; colores verde (pagado) / naranja (pendiente). Cada cita puede ir a un especialista.
- Pacientes: añadir, editar, ver historial. Importar CSV.
- Finanzas: resumen de ingresos, gastos, ROI. Descargar CSV.
- Bonos: crear bonos de sesiones, ver uso, caducidad.
- Equipo: añadir especialistas, roles, login individual.
- Asistente: chat con Ana (IA) para dudas operativas.
- Ajustes: configuración de clínica, precios, horarios, métodos de pago.
`;

const LEX_SYSTEM_PROMPT = `
Eres Lex, asesor legal experto en España (fiscalidad, RGPD, laboral) para clínicas de fisioterapia.
CONTEXTO: FisioTool Pro es SaaS con datos en Firestore (eur3), facturación via Stripe, equipos en España.
MISIÓN: Responder dudas fiscales con prudencia; recordar fechas clave (Abril IRS, trimestres IVA). Nunca dar "consejo legal vinculante"; siempre sugerir revisión final por profesional, pero dar la pauta técnica correcta.
TONO: Serio, preciso, jurídico pero entendible. Responde en 2-5 frases cuando baste; si piden más detalle, amplía.
`;

module.exports = {
  callAnaEngine,

  consultLex: async (userMessage) => {
    const fullPrompt = `${LEX_SYSTEM_PROMPT}\n\nCONSULTA DEL USUARIO: "${String(userMessage || '').trim()}"\n\nTu respuesta (pauta técnica, sin consejo vinculante):`;
    try {
      const reply = await callAnaEngine(fullPrompt, { maxOutputTokens: 500 });
      const trimmed = String(reply || '').trim();
      return { reply: trimmed || "No pude generar una respuesta. Reformula la consulta." };
    } catch (e) {
      return { reply: "Disculpe, estoy consultando la base de jurisprudencia. Por favor, repítame la pregunta en un momento." };
    }
  },

  processMessage: async (clinicId, userMessage) => {
    const systemPrompt = `Eres Ana, asistente IA de FisioTool Pro. Ayuda a usar el dashboard de forma clara y directa.
${DASHBOARD_KNOWLEDGE}

REGLAS:
- Responde en español, tono amable pero profesional.
- Máximo 2-3 frases por respuesta.
- Si preguntan cómo hacer algo, da los pasos concretos.
- Si mencionan un módulo específico, explica su función principal.
- Nunca inventes funciones que no existan.`;

    const fullPrompt = `${systemPrompt}\n\nMENSAJE DEL USUARIO: "${userMessage}"\n\nTu respuesta (breve y directa):`;
    try {
      const reply = await callAnaEngine(fullPrompt, { maxOutputTokens: 350 });
      const trimmed = String(reply || '').trim();
      return { reply: trimmed || "No pude generar una respuesta. Reformula la pregunta en una frase." };
    } catch (e) {
      return { reply: "Mis sistemas están experimentando saturación. Por favor, vuelve a intentarlo en un momento." };
    }
  },

  respondSupportTicket: async (userMessage) => {
    const systemPrompt = `Eres Ana, soporte de FisioTool Pro. Responde tickets de forma profesional.
${DASHBOARD_KNOWLEDGE}

REGLAS:
- Tono: empático pero eficiente.
- Si es problema técnico, pide más detalles o ofrece solución básica.
- Si es duda funcional, explica cómo usar la función.
- Si necesitas escalar, indica que un técnico revisará el caso.`;

    const fullPrompt = `${systemPrompt}\n\nCONSULTA DEL USUARIO: "${String(userMessage || '').trim()}"\n\nTu respuesta (breve, para enviar por email):`;
    try {
      const reply = await callAnaEngine(fullPrompt, { maxOutputTokens: 400 });
      const trimmed = String(reply || '').trim();
      return { reply: trimmed || "Hemos recibido tu mensaje. El equipo te responderá en breve." };
    } catch (e) {
      return { reply: "Hemos recibido tu consulta. Te responderemos por email lo antes posible." };
    }
  },

  // --- 🤖 ANA CHAT PÚBLICO (para pacientes) ---
  generatePatientResponse: async ({ message, clinicName, clinicId }) => {
    const lowerMessage = String(message || '').toLowerCase();
    
    // Respuestas inteligentes basadas en palabras clave
    if (lowerMessage.includes('cita') || lowerMessage.includes('hora') || lowerMessage.includes('disponibilidad')) {
      return `¡Hola! Soy Ana de ${clinicName}. 👋\n\n¡Qué genial que quieras cuidar de ti! 🌟 Tengo huecos disponibles esta semana:\n\n📅 **Hoy**: 16:00, 17:30, 19:00\n📅 **Mañana**: 10:00, 11:30, 16:00, 17:30\n📅 **Viernes**: 10:00, 11:30, 16:00\n\n⚡ **Reserva AHORA mismo sin esperas:\n👉 https://fisiotool.com/ana?ref=${clinicId}\n\n¿Qué día y hora prefieres? ¡Las mejores horas se van rápido! 😉`;
    }
    
    if (lowerMessage.includes('app') || lowerMessage.includes('descargar') || lowerMessage.includes('móvil') || lowerMessage.includes('instalar')) {
      return `¡Hola! Soy Ana de ${clinicName}. 📱\n\nPara instalar nuestra app local (PWA):\n👉 Entra en https://fisiotool.com/ana?ref=${clinicId}\n\nLuego:\n• En móvil: "Añadir a pantalla de inicio"\n• En desktop: Botón "Instalar" en la barra\n\nAsí tendrás FisioTool como app nativa sin usar tiendas.`;
    }
    
    if (lowerMessage.includes('pago') || lowerMessage.includes('precio') || lowerMessage.includes('tarifa')) {
      return `¡Hola! Soy Ana de ${clinicName}. 💳\n\n¡Me encanta que te intereses en mejorar tu salud! En ${clinicName} tenemos las mejores tarifas:\n\n• 🏥 **Primera consulta**: 45€ (incluye diagnóstico)\n• � **Sesión de fisioterapia**: 40€\n• 🎯 **Pack de 5 sesiones**: 180€ (¡ahorra 20€!)\n• 📱 **Pack de 10 sesiones**: 350€ (¡ahorra 50€!)\n\n💳 **Aceptamos**: Bizum, tarjeta, transferencia\n\n¿Qué tratamiento te gustaría reservar? ¡Te aseguro que quedarás encantado con los resultados!`;
    }
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('saludo')) {
      return `¡Hola! Soy Ana, asistente de ${clinicName}. 😊\n\n¿En qué puedo ayudarte hoy?\n• 📅 Ver agenda y reservar cita\n• 📱 Instalar nuestra app local\n• 💳 Consultar precios y pagos\n• ❓ Otra pregunta`;
    }
    
    if (lowerMessage.includes('gracias') || lowerMessage.includes('agradec')) {
      return `¡De nada! 😊\n\nEstoy aquí para ayudarte con lo que necesites. No dudes en preguntarme por citas, precios o cualquier duda.\n\nAna - ${clinicName}`;
    }

    const prompt = `
Eres Ana, asistente de recepción de "${clinicName}". Responde de forma amable, profesional y concisa a pacientes.

REGLAS:
- Sé amable pero directa
- Si piden cita, ofrece que consulten la agenda online
- Si preguntan por servicios, menciona fisioterapia general, rehabilitación, y que pueden ver disponibilidad online
- Máximo 2-3 frases
- Firma siempre como "Ana"
- Incluye siempre el enlace: https://fisiotool.com/ana?ref=${clinicId}

Paciente pregunta: "${message}"

Responde como Ana:
`;

    try {
      const response = await callAnaEngine(prompt, { maxOutputTokens: 150 });
      return response.trim();
    } catch (e) {
      console.error("🔥 Error en chat de Ana:", e);
      return `Hola, soy Ana de ${clinicName}. Para ver disponibilidad y reservar, entra en https://fisiotool.com/ana?ref=${clinicId}. ¿Necesitas algo más?`;
    }
  }
};
