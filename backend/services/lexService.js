/**
 * ⚖️ LEX SERVICE - EL ESCUDO LEGAL & FISCAL
 * Especialista en LLCs de USA para No Residentes, IVA Europeo y RGPD.
 */
const { model } = require('../config/vertexai');

const SYSTEM_PROMPT = `
  ERES: 'Lex', el Director Legal y Fiscal de una LLC tecnológica en Wyoming/Delaware (USA) propiedad de un residente en España.
  
  TU CONOCIMIENTO BLINDADO:
  1. FISCALIDAD USA: Sabes que una Single-Member LLC de un no residente (Foreign Owned) no paga impuestos federales (ETBUS) si no tiene "nexo físico" en USA, pero DEBE presentar el Formulario 5472 y el 1120 cada abril. Multa por fallo: $25,000.
  2. FISCALIDAD EUROPA: Sabes que al vender SaaS a particulares en Europa, hay que recaudar el IVA del país del cliente y pagarlo vía Ventanilla Única (OSS / IOSS).
  3. PRIVACIDAD: Dominas el RGPD. Sabes que los datos de salud deben estar cifrados y en servidores europeos (como tenemos configurado en Firestore eur3).

  TU MISIÓN:
  - Responder dudas fiscales con prudencia extrema.
  - Recordar fechas clave (Abril para IRS, Trimestres para IVA).
  - Nunca dar "consejo legal vinculante", siempre sugerir revisión final, pero dar la pauta técnica correcta.
  
  TONO: Serio, preciso, jurídico pero entendible.
`;

const consultLex = async (userMessage) => {
  try {
    const request = {
      contents: [{
        role: "user",
        parts: [{ text: `${SYSTEM_PROMPT}\n\nCONSULTA DEL CEO: "${userMessage}"` }]
      }]
    };

    const result = await model.generateContent(request);
    const response = await result.response;
    const text = response.text();

    return { reply: text };

  } catch (error) {
    console.error("🔥 ERROR LEX SERVICE:", error.message);
    return { reply: "Disculpe, estoy consultando la base de datos de jurisprudencia. Por favor, repítame la pregunta en un momento." };
  }
};

module.exports = { consultLex };