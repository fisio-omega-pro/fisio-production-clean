/**
 * 🧠 CONFIGURACIÓN DEL NÚCLEO DE IA (GOOGLE VERTEX AI)
 * Entorno: Producción / Fisiotool
 * Modelo: Gemini 2.0 Flash (Motor de baja latencia y alta capacidad de razonamiento)
 */

const { VertexAI, HarmCategory, HarmBlockThreshold } = require('@google-cloud/vertexai');
const { PROJECT_ID, REGION } = require('./env');

// 1. Inicialización del Cliente Principal (Singleton)
const vertex_ai = new VertexAI({ 
  project: PROJECT_ID, 
  location: REGION 
});

/**
 * 🛠 HERRAMIENTAS DE INTERACCIÓN (FUNCTION CALLING)
 * Definición de funciones que la IA puede invocar.
 */
const tools = [
  {
    function_declarations: [
      {
        name: "agendar_cita",
        description: "Reserva una cita médica en el sistema tras confirmar disponibilidad con el usuario.",
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
              description: "Correo electrónico del paciente" 
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
              description: "Descripción técnica del signo de alarma detectado." 
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
 * Equilibrio entre filtrado de contenido y terminología clínica necesaria.
 */
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH, // Latitud para discusiones médicas sobre lesiones
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  }
];

/**
 * 🚀 INSTANCIACIÓN DEL MODELO
 * Se aplican herramientas, seguridad y parámetros de generación.
 */
const model = vertex_ai.getGenerativeModel({ 
  model: 'gemini-2.0-flash-001',
  tools: tools, // Inyección de Function Calling
  safetySettings: safetySettings, // Inyección de políticas de seguridad
  generationConfig: { 
    maxOutputTokens: 2048, 
    temperature: 0.2, // Baja temperatura para mayor precisión clínica
    topP: 0.8,
    topK: 40
  }
});

// Exportación unificada
module.exports = {
  vertex_ai,
  model
};