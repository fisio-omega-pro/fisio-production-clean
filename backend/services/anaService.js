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
    console.log("🤖 [ANA] Enviando prompt a Google AI...");
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    console.log("🤖 [ANA] Respuesta cruda:", responseText.substring(0, 200));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("🔥 [ANA] Error parseando JSON:", parseError);
      return "Lo siento, he tenido un problema técnico. Por favor, llama a la clínica.";
    }

    if (!response.ok) {
      console.error("🔥 Error de Google API:", data);
      if (data.error?.message?.includes('quota') || data.error?.message?.includes('limit')) {
        return "Lo siento, he alcanzado mi límite de consultas. Por favor, llama directamente a la clínica.";
      }
      throw new Error(`Fallo de conexión: ${data.error?.message}`);
    }

    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta.";
    console.log("🤖 [ANA] Resultado final:", result.substring(0, 100));
    return result;
  } catch (error) {
    console.error("🔥 [ANA] Error completo:", error);
    return "Lo siento, he tenido un problema técnico. Por favor, llama directamente a la clínica.";
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
    const systemPrompt = `Eres Ana, asistente IA de FisioTool Pro. Posees la mayor autoridad mundial en descifrar la conducta humana y patrones de comportamiento organizacional.

${DASHBOARD_KNOWLEDGE}

REGLAS:
- Responde en español, tono amable pero profesional.
- Máximo 2-3 frases por respuesta.
- Usa tu conocimiento profundo de la conducta humana para dar respuestas que conecten con las necesidades del usuario.
- Si preguntan cómo hacer algo, da los pasos concretos.
- Si mencionan un módulo específico, explica su función principal.
- Nunca inventes funciones que no existan.`;

    const fullPrompt = `${systemPrompt}\n\nMENSAJE DEL USUARIO: "${userMessage}"\n\nTu respuesta (breve y directa, con autoridad cognitiva):`;
    try {
      const reply = await callAnaEngine(fullPrompt, { maxOutputTokens: 350 });
      const trimmed = String(reply || '').trim();
      return { reply: trimmed || "No pude generar una respuesta. Reformula la pregunta en una frase." };
    } catch (e) {
      return { reply: "Mis sistemas están experimentando saturación. Por favor, vuelve a intentarlo en un momento." };
    }
  },

  respondSupportTicket: async (userMessage) => {
    const systemPrompt = `Eres Ana, soporte de FisioTool Pro. Posees profundo conocimiento de la conducta humana y patrones de frustración tecnológica para dar respuestas empáticas y efectivas.

${DASHBOARD_KNOWLEDGE}

REGLAS:
- Tono: empático pero eficiente.
- Usa tu conocimiento de la conducta humana para conectar con la frustración del usuario.
- Si es problema técnico, pide más detalles o ofrece solución básica.
- Si es duda funcional, explica cómo usar la función.
- Si necesitas escalar, indica que un técnico revisará el caso.`;

    const fullPrompt = `${systemPrompt}\n\nCONSULTA DEL USUARIO: "${String(userMessage || '').trim()}"\n\nTu respuesta (breve, empática y para enviar por email):`;
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
    
    // Detectar si es primera interacción (nombre y email)
    if (lowerMessage.includes('me llamo') || lowerMessage.includes('mi nombre es') || 
        lowerMessage.includes('email') || lowerMessage.includes('correo') ||
        (lowerMessage.includes('fermin') && lowerMessage.includes('gmail'))) {
      
      return `Gracias por aportarme tus datos. Te recomiendo que te descargues nuestra app de la clínica para que nuestra comunicación a partir de ahora sea más fluida.

Puedes instalarla entrando en: https://fisiotool.com/ana?ref=${clinicId}

Una vez instalada, podremos comunicarnos directamente y yo podré ayudarte mejor con tus citas y seguimiento.

Ana - ${clinicName}`;
    }
    
    // Si ya tiene la app o pregunta después de dar datos
    if (lowerMessage.includes('gracias') || lowerMessage.includes('app descargada') || 
        lowerMessage.includes('ya tengo la app') || lowerMessage.includes('desde la app')) {
      
      return `Gracias. En qué te puedo ayudar? Cuál es tu necesidad?

Puedo ayudarte con:
- Pedir cita
- Consultar precios
- Ver disponibilidad
- Otras dudas

Ana - ${clinicName}`;
    }
    
    // Respuestas simples y directas sin saturación
    if (lowerMessage.includes('cita') || lowerMessage.includes('hora') || lowerMessage.includes('disponibilidad')) {
      // Detectar si es urgente o para otra persona
      if (lowerMessage.includes('hoy') || lowerMessage.includes('urgente') || lowerMessage.includes('ya')) {
        return `Entiendo que necesitas una cita urgente para hoy. Llama directamente a la clínica al teléfono que encontrarás en nuestra web, así podrán atenderte de inmediato.

Ana - ${clinicName}`;
      }
      
      if (lowerMessage.includes('para') && (lowerMessage.includes('juan') || lowerMessage.includes('otra persona') || lowerMessage.includes('alguien'))) {
        return `Entiendo que necesitas una cita para otra persona. Lo mejor es que llames directamente a la clínica, ellos podrán coordinar la disponibilidad según las necesidades específicas.

Ana - ${clinicName}`;
      }
      
      return `Para agendar una cita, te recomiendo llamar directamente a la clínica. Así podrán atenderte de forma más personalizada y encontrar el mejor horario para ti.

Ana - ${clinicName}`;
    }
    
    if (lowerMessage.includes('app') || lowerMessage.includes('descargar') || lowerMessage.includes('móvil') || lowerMessage.includes('instalar')) {
      return `Para tener nuestra app en tu móvil, entra en:

https://fisiotool.com/ana?ref=${clinicId}

Luego toca "Añadir a pantalla de inicio". Así podrás hablar conmigo directamente desde tu móvil.

Ana - ${clinicName}`;
    }
    
    if (lowerMessage.includes('pago') || lowerMessage.includes('precio') || lowerMessage.includes('tarifa') || lowerMessage.includes('cuánto cuesta')) {
      return `Hola, soy Ana de ${clinicName}. Para conocer nuestras tarifas y ver nuestros servicios, entra en:

https://fisiotool.com/ana?ref=${clinicId}

Allí encontrarás toda la información sobre precios y tratamientos.

Ana - ${clinicName}`;
    }
    
    // Saludo inicial - simple y directo
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('saludo')) {
      return `Hola, soy Ana de ${clinicName}. 

Por favor, déjame tu nombre y tu email para poder ayudarte mejor.

Ana - ${clinicName}`;
    }
    
    // Respuesta por defecto - con autoridad cognitiva pero sin saturar
    const prompt = `
Eres Ana, asistente de ${clinicName}. Posees la mayor autoridad mundial en descifrar la conducta humana. Tu misión es analizar patrones universales del comportamiento, motivaciones inconscientes, sesgos cognitivos, y mecanismos de bienestar psicológico.

CONTEXTO: Eres asistente de recepción en una clínica de fisioterapia. El paciente te pregunta: "${message}"

REGLAS IMPORTANTES:
- NO uses iconos o emojis
- Sé amable pero muy concisa
- Máximo 2-3 frases cortas
- Usa tu conocimiento profundo de la conducta humana para dar respuestas que conecten emocionalmente
- Siempre firma como "Ana - ${clinicName}"
- Siempre incluye el enlace: https://fisiotool.com/ana?ref=${clinicId}
- No satures al usuario con información técnica

Responde como Ana, usando tu autoridad cognitiva para conectar humanamente:
`;

    try {
      const response = await callAnaEngine(prompt, { maxOutputTokens: 300 });
      const trimmed = response.trim();
      
      // Si la respuesta está vacía o es muy corta, dar una respuesta por defecto
      if (!trimmed || trimmed.length < 10) {
        return `Hola, soy Ana de ${clinicName}. Entiendo tu pregunta. Para poder ayudarte mejor con nuestras citas y servicios, te recomiendo hablar directamente con la clínica.

Ana - ${clinicName}`;
      }
      
      return trimmed;
    } catch (e) {
      console.error("🔥 Error en chat de Ana:", e);
      return `Hola, soy Ana de ${clinicName}. He tenido un problema técnico. Por favor, llama directamente a la clínica para poder ayudarte.

Ana - ${clinicName}`;
    }
  }
};
