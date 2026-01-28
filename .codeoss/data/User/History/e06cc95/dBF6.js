/**
 * 🧠 CONFIGURACIÓN DEL NÚCLEO DE IA (GOOGLE VERTEX AI)
 * Modelo: Gemini 1.5 Flash 002 (Versión estable optimizada para Europa)
 * Ubicación: europe-west1 (Bélgica)
 */

const { VertexAI, HarmCategory, HarmBlockThreshold } = require('@google-cloud/vertexai');
const { PROJECT_ID, REGION } = require('./env');

// Inicialización del Cliente Vertex AI
const vertex_ai = new VertexAI({ 
  project: PROJECT_ID, 
  location: REGION 
});

/**
 * 🛠 DEFINICIÓN DE HERRAMIENTAS (FUNCTION CALLING)
 * Permite a la IA interactuar con el ecosistema de Fisiotool.
 */
const TOOLS_DEFINITIONS = [
  {
    function_declarations: [
      {
        name: "agendar_cita",
        description: "Reserva una cita médica en el sistema tras confirmar disponibilidad.",
        parameters: {
          type: "OBJECT",
          properties: {
            fecha: { 
              type: "STRING", 
              description: "Fecha y hora en formato ISO 8601 (YYYY-MM-DD HH:mm)" 
            },
            nombre: { 
              type: "STRING", 
              description: "Nombre completo del paciente" 
            },
            email: { 
              type: "STRING", 
              description: "Email de contacto para confirmación" 
            }
          },
          required: ["fecha", "nombre", "email"]
        }
      },
      {
        name: "crear_alerta_medica",
        description: "Notifica urgentemente al fisioterapeuta ante síntomas de riesgo (Banderas Rojas).",
        parameters: {
          type: "OBJECT",
          properties: {
            motivo: { 
              type: "STRING", 
              description: "Descripción detallada del signo de alarma detectado." 
            }
          },
          required: ["motivo"]
        }
      }
    ]
  }
];

/**
 * 🛡 CONFIGURACIÓN DE SEGURIDAD
 * Restringe contenido inadecuado manteniendo la utilidad médica.
 */
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH, // Permitimos cierta latitud para terminología médica
  }
];

// Instanciación del Modelo Generativo con la versión certificada
// backend/config/vertexai.js
const { VertexAI } = require('@google-cloud/vertexai');
const { PROJECT_ID, REGION } = require('./env');

const vertex_ai = new VertexAI({ project: PROJECT_ID, location: REGION });

const model = vertex_ai.getGenerativeModel({ 
  model: 'gemini-2.0-flash-001', // <--- ESTE ES EL MOTOR OMEGA (Gemini 2.0 Flash)
  generationConfig: { 
    maxOutputTokens: 2048, 
    temperature: 0.2 
  }
});

module.exports = { model };

module.exports = {
  model,
  vertex_ai // Exportamos el cliente por si se requiere inicializar otros modelos (ej. Pro o Embedding)
};