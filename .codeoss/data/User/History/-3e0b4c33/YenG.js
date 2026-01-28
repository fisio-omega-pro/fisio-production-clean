/**
 * 🧠 CONFIGURACIÓN DEL CEREBRO (GOOGLE VERTEX AI)
 * Define el modelo, parámetros creativos y las herramientas (Function Calling) que Ana puede usar.
 */

const { VertexAI } = require('@google-cloud/vertexai');
const { PROJECT_ID, REGION } = require('./env');

// Inicialización del Cliente Vertex
const vertex_ai = new VertexAI({ project: PROJECT_ID, location: REGION });

// Definición de Herramientas (Capacidades Motoras de Ana)
// Estas son las acciones que Ana puede "decidir" ejecutar en lugar de hablar.
const TOOLS_DEFINITIONS = [
  {
    function_declarations: [
      {
        name: "agendar_cita",
        description: "Reserva una cita en la agenda tras validar disponibilidad.",
        parameters: {
          type: "OBJECT",
          properties: {
            fecha: { type: "STRING", description: "Fecha y hora en formato YYYY-MM-DD HH:mm" },
            nombre: { type: "STRING", description: "Nombre completo del paciente" },
            email: { type: "STRING", description: "Email válido del paciente (Obligatorio)" }
          },
          required: ["fecha", "nombre", "email"]
        }
      },
      {
        name: "crear_alerta_medica",
        description: "Emite una alerta urgente cuando se detecta una Bandera Roja.",
        parameters: {
          type: "OBJECT",
          properties: {
            motivo: { type: "STRING", description: "Descripción del riesgo (ej: Accidente reciente)" }
          },
          required: ["motivo"]
        }
      }
    ]
  }
];

// Instanciación del Modelo Generativo
const model = vertex_ai.getGenerativeModel({ 
  model: 'gemini-1.5-flash', // Modelo rápido y eficiente
  tools: TOOLS_DEFINITIONS,
  generationConfig: { 
    maxOutputTokens: 2048, 
    temperature: 0.2, // Baja temperatura = Ana es precisa y profesional, no alucina
  }
});

module.exports = {
  model
};