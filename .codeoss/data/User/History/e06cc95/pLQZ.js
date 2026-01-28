const { VertexAI } = require('@google-cloud/vertexai');
const { PROJECT_ID, REGION } = require('./env');

const vertex_ai = new VertexAI({ project: PROJECT_ID, location: REGION });

const model = vertex_ai.getGenerativeModel({ 
  model: 'gemini-1.5-flash-001', // <--- Versión 001 es la 'Universal' para Bélgica
  generationConfig: { 
    maxOutputTokens: 2048, 
    temperature: 0.2 
  }
});

module.exports = { model };