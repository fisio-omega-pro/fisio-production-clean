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
