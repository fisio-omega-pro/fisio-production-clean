const { VertexAI } = require('@google-cloud/vertexai');
const { PROJECT_ID, REGION } = require('./env');
const path = require('path');

// Localizamos la ruta física de tu llave JSON
const keyPath = path.join(__dirname, 'key.json');

const vertex_ai = new VertexAI({ 
  project: PROJECT_ID, 
  location: REGION,
  // 🛡️ Forzamos a Ana a usar la llave física 'key.json'
  googleAuthOptions: {
    keyFilename: keyPath
  }
});

const model = vertex_ai.getGenerativeModel({ 
  model: 'gemini-1.5-flash-001', 
  generationConfig: { 
    maxOutputTokens: 2048, 
    temperature: 0.2 
  }
});

module.exports = { model };