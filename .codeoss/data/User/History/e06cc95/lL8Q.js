const { VertexAI } = require('@google-cloud/vertexai');
const path = require('path');

// Aseguramos que las variables coincidan con env.js
const PROJECT_ID = 'fisiotool-omega-2026';
const REGION = 'us-central1';
const keyPath = path.join(__dirname, 'key.json');

const vertex_ai = new VertexAI({ 
  project: PROJECT_ID, 
  location: REGION,
  googleAuthOptions: { keyFilename: keyPath }
});

// USAMOS EL MODELO MÁS COMPATIBLE DEL MUNDO
const model = vertex_ai.getGenerativeModel({ 
  model: 'gemini-1.0-pro', 
  generationConfig: { 
    maxOutputTokens: 2048, 
    temperature: 0.2 
  }
});

module.exports = { model };