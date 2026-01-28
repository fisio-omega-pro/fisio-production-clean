/**
 * 🧠 CONFIGURACIÓN DEL MOTOR VERTEX AI
 * Inicializa a Ana con sus herramientas de acción (Function Calling).
 */
const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');

const PROJECT_ID = 'fisiotool-omega-2026';
const REGION = 'us-central1'; // <--- CAMBIO CRÍTICO: Región Central (Evita el 404)
const keyPath = path.join(__dirname, 'key.json');

const vertex_ai = new VertexAI({ 
  project: PROJECT_ID, 
  location: REGION,
  googleAuthOptions: { keyFilename: keyPath }
});

// DEFINICIÓN DE HERRAMIENTAS (Las "manos" de Ana)
const tools = [{
  function_declarations: [
    {
      name: "agendar_reserva",
      description: "Ejecuta una reserva de cita tras validar fecha, nombre y email.",
      parameters: {
        type: "OBJECT",
        properties: {
          fecha: { type: "STRING", description: "Formato YYYY-MM-DD" },
          hora: { type: "STRING", description: "Formato HH:mm" },
          nombre: { type: "STRING", description: "Nombre del paciente" },
          email: { type: "STRING", description: "Email del paciente" }
        },
        required: ["fecha", "hora", "nombre", "email"]
      }
    },
    {
      name: "emitir_alerta_medica",
      description: "Crea una alerta cuando el paciente menciona síntomas de riesgo (Bandera Roja).",
      parameters: {
        type: "OBJECT",
        properties: {
          motivo: { type: "STRING", description: "Descripción del riesgo detectado" }
        },
        required: ["motivo"]
      }
    }
  ]
}];

const model = vertex_ai.getGenerativeModel({ 
  model: 'gemini-1.5-flash-001', // <--- Versión estable en US-CENTRAL1
  tools: tools,
  generationConfig: { 
    maxOutputTokens: 2048, 
    temperature: 0.1 // Mínima temperatura = Máxima precisión profesional
  }
});

module.exports = { model };