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

  // ✅ MODELO DINÁMICO DESDE SECRET MANAGER
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`;

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
  },

  // 🏢 NUEVA: Triage específico para formulario Corporate (siempre lead, siempre borrador)
  processCorporateLead: async (lead) => {
    const safe = (v) => String(v ?? '').trim();
    const companyName = safe(lead.companyName);
    const contactName = safe(lead.contactName);
    const email = safe(lead.email);
    const phone = safe(lead.phone);
    const clinicsCount = safe(lead.clinicsCount);
    const practitionersCount = safe(lead.practitionersCount);
    const services = Array.isArray(lead.services) ? lead.services.map((x) => safe(x)).filter(Boolean) : [];
    const locations = safe(lead.locations);
    const timeline = safe(lead.timeline);
    const preferredContact = safe(lead.preferredContact);
    const notes = safe(lead.notes);

    const prompt = `Eres Ana, asesora comercial y operativa de FisioTool Pro.

CONTEXTO:
Esto NO es un email inbound, es un lead captado desde el formulario "Corporate" de la landing.
Tu misión es ayudar al CEO (Augusto) con un resumen ejecutivo y un borrador de respuesta.
IMPORTANTE:
- NUNCA clasifiques como SPAM por incluir palabras como "prueba", "test" o similares.
- Para Corporate, asume LEAD_PROSPECTO salvo que sea claramente malicioso (porn/spam de links/crypto).
- No se envía nada al lead automáticamente: solo propones el borrador.

LEAD:
Empresa: ${companyName}
Contacto: ${contactName}
Email: ${email}
Teléfono: ${phone}
Sedes: ${clinicsCount}
Especialistas: ${practitionersCount}
Servicios: ${services.join(', ')}
Ubicaciones: ${locations}
Plazo: ${timeline}
Preferencia contacto: ${preferredContact}
Notas: ${notes}

INSTRUCCIONES:
1) Clasificación: URGENTE | IMPORTANTE | NORMAL
   - URGENTE si (sedes>=3 o especialistas>=10) o si plazo es 0-30d.
2) Tipo: LEAD_PROSPECTO
3) Resumen ejecutivo: 3-6 bullets muy concretos.
4) Preguntas clave para avanzar (máx 6) adaptadas a multiclínica/multi-servicio.
5) Borrador de respuesta (email) profesional y conciso, proponiendo una llamada/demo y pidiendo datos faltantes.

Responde SOLO en JSON:
{
  "clasificacion": "URGENTE|IMPORTANTE|NORMAL",
  "tipo": "LEAD_PROSPECTO",
  "resumen": "bullets",
  "preguntas_clave": ["..."],
  "respuesta": "borrador de email"
}`;

    const defaultQuestions = () => ([
      '¿Cuántas sedes y servicios deben gestionarse en el mismo panel (y qué jerarquía de permisos necesitáis)?',
      '¿Qué integraciones son imprescindibles (ERP, facturación, contabilidad, CRM, BI) y en qué formato queréis exportaciones?',
      '¿Cómo queréis gestionar agenda por especialidad/sede (recursos, salas, equipos) y reglas de cobro/no-show?',
      '¿Necesitáis migración desde vuestro sistema actual (Excel/otro software) y cuántos pacientes/citas históricas?',
      '¿Qué requerimientos legales/compliance tenéis (RGPD, consentimientos, auditoría, logs, roles)?',
      '¿Cuál es el objetivo de la demo: reducir no-shows, centralizar sedes, reporting por unidad, automatización comercial?',
    ]);

    const defaultDraft = (questions) => {
      const q = (questions || defaultQuestions()).slice(0, 6);
      const greetingName = contactName || 'equipo';
      return [
        `Hola ${greetingName},`,
        ``,
        `Soy Ana de FisioTool Pro. Gracias por tu interés en el plan Corporate para ${companyName || 'vuestro grupo'}.`,
        `Por lo que indicas (${clinicsCount} sedes, ${practitionersCount} especialistas y servicios mixtos), lo más eficiente es hacer una llamada breve (15–20 min) para mapear requisitos y devolverte una propuesta concisa.`,
        ``,
        `Para prepararla, ¿me confirmas por favor:`,
        ...q.map((x) => `- ${x}`),
        ``,
        `Si te encaja, dime 2 franjas horarias (y zona horaria) y te agendo una demo.`,
        ``,
        `Un saludo,`,
        `Ana · FisioTool Pro`,
      ].join('\n');
    };

    const normalizeQuestions = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value.map((x) => safe(x)).filter(Boolean);
      const s = safe(value);
      if (!s) return [];
      // Split por líneas o bullets
      return s
        .split(/\n|•|- |\u2022/g)
        .map((x) => safe(x).replace(/^\d+[\)\.\-]\s*/,''))
        .filter(Boolean)
        .slice(0, 6);
    };

    const coerceClasificacion = (v) => {
      const s = safe(v).toUpperCase();
      if (s === 'URGENTE' || s === 'IMPORTANTE' || s === 'NORMAL') return s;
      return 'IMPORTANTE';
    };

    try {
      const reply = await callAnaEngine(prompt);
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      const raw = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      const preguntas =
        normalizeQuestions(raw.preguntas_clave) ||
        normalizeQuestions(raw.preguntasClave) ||
        normalizeQuestions(raw.preguntas) ||
        [];

      const normalized = {
        clasificacion: coerceClasificacion(raw.clasificacion),
        tipo: 'LEAD_PROSPECTO',
        resumen: safe(raw.resumen) || `Lead Corporate: ${companyName} (${clinicsCount} sedes, ${practitionersCount} especialistas)`,
        preguntas_clave: preguntas.length ? preguntas : defaultQuestions(),
        respuesta: safe(raw.respuesta) || defaultDraft(preguntas.length ? preguntas : defaultQuestions())
      };

      return normalized;
    } catch (e) {
      return {
        clasificacion: "IMPORTANTE",
        tipo: "LEAD_PROSPECTO",
        resumen: `Lead Corporate sin IA: ${companyName} (${clinicsCount} sedes, ${practitionersCount} especialistas)`,
        preguntas_clave: defaultQuestions(),
        respuesta: defaultDraft(defaultQuestions())
      };
    }
  },

  // 📧 NUEVA FUNCIONALIDAD: Procesar emails entrantes
  processIncomingEmail: async (from, subject, body) => {
    const prompt = `Eres Ana, asistente IA de FisioTool Pro. Clasifica este email y decide qué hacer:

EMAIL RECIBIDO:
De: ${from}
Asunto: ${subject}
Cuerpo: ${body}

INSTRUCCIONES:
1. Clasifica como: URGENTE | IMPORTANTE | NORMAL | SPAM
2. Determina el tipo: LEAD_PROSPECTO | SUGERENCIA | QUEJA | SOPORTE | SPAM
3. Genera una respuesta profesional (si procede)
4. Indica si notificar al admin (true/false)

Responde SOLO en formato JSON:
{
  "clasificacion": "URGENTE|IMPORTANTE|NORMAL|SPAM",
  "tipo": "LEAD_PROSPECTO|SUGERENCIA|QUEJA|SOPORTE|SPAM",
  "respuesta": "texto de respuesta o null si no procede",
  "notificar_admin": true/false,
  "resumen": "resumen breve para el admin"
}`;

    try {
      const reply = await callAnaEngine(prompt);
      // Intentar parsear JSON (Gemini puede devolver markdown)
      const jsonMatch = reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      // Si no se puede parsear, respuesta por defecto
      return {
        clasificacion: "NORMAL",
        tipo: "SOPORTE",
        respuesta: null,
        notificar_admin: true,
        resumen: `Email de ${from}: ${subject}`
      };
    } catch (e) {
      console.error("🔥 Error procesando email con Ana:", e);
      return {
        clasificacion: "NORMAL",
        tipo: "SOPORTE",
        respuesta: null,
        notificar_admin: true,
        resumen: `Email sin procesar de ${from}`
      };
    }
  },

  // 📧 NUEVA FUNCIONALIDAD: Generar email de prospección
  generateProspectEmail: async (leadInfo) => {
    const prompt = `Eres Ana, representante de FisioTool Pro. Genera un email de prospección profesional y persuasivo para:

LEAD INFO:
Nombre: ${leadInfo.nombre || 'Sin nombre'}
Clínica: ${leadInfo.clinica || 'Sin especificar'}
Contexto: ${leadInfo.contexto || 'Prospección fría'}

INSTRUCCIONES:
- Sé profesional pero cercana
- Destaca valor de FisioTool Pro (gestión moderna de clínicas de fisioterapia)
- Incluye CTA claro (agendar demo, más info)
- Máximo 150 palabras
- Firma como "Ana, FisioTool Pro"

Responde SOLO el texto del email:`;

    try {
      const reply = await callAnaEngine(prompt);
      return reply.trim();
    } catch (e) {
      console.error("🔥 Error generando email de prospección:", e);
      return `Hola,

Soy Ana de FisioTool Pro. Ayudamos a clínicas de fisioterapia a digitalizar y optimizar su gestión.

¿Te interesaría conocer cómo podemos ayudarte?

Saludos,
Ana - FisioTool Pro`;
    }
  }
};
