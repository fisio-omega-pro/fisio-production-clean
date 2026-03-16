/**
 * 🧠 ANA SKILLS REGISTRY - Registro Central de Skills
 * 
 * Este archivo exporta todos los skills y crea el motor configurado.
 * Es el punto de entrada único para usar el sistema de skills.
 */

const { SkillEngine } = require('./anaSkillEngine');
const { AgendaSkill } = require('./skills/agendaSkill');
const { PagosSkill } = require('./skills/pagosSkill');
const { InfoClinicaSkill } = require('./skills/infoClinicaSkill');
const { SaludosSkill } = require('./skills/saludosSkill');
const { FallbackSkill } = require('./skills/fallbackSkill');

// ============================================
// CREAR MOTOR CONFIGURADO
// ============================================

function createAnaSkillEngine() {
  const engine = new SkillEngine();
  
  // Registrar todos los skills
  engine.registerSkill(new AgendaSkill());
  engine.registerSkill(new PagosSkill());
  engine.registerSkill(new InfoClinicaSkill());
  engine.registerSkill(new SaludosSkill());
  engine.registerSkill(new FallbackSkill());
  
  console.log('🤖 SkillEngine inicializado con', engine.skills.size, 'skills');
  return engine;
}

// Instancia singleton del motor
let skillEngineInstance = null;

function getSkillEngine() {
  if (!skillEngineInstance) {
    skillEngineInstance = createAnaSkillEngine();
  }
  return skillEngineInstance;
}

// ============================================
// API PÚBLICA - Métodos principales
// ============================================

/**
 * Procesa un mensaje del paciente usando el sistema de skills
 * 
 * @param {string} message - Mensaje del usuario
 * @param {object} context - Contexto: clinicId, clinicName, userName, isRecurrent, etc
 * @param {array} history - Historial de conversación opcional
 * @returns {object} Respuesta con metadata
 */
async function processWithSkills(message, context = {}, history = []) {
  const engine = getSkillEngine();
  
  // Enriquecer contexto con historial
  const enrichedContext = {
    ...context,
    lastIntent: history.length > 0 ? history[history.length - 1].intent : null,
    lastSkill: history.length > 0 ? history[history.length - 1].skill : null,
    conversationCount: history.length
  };
  
  const result = await engine.processMessage(message, enrichedContext);
  
  // Formato consistente con el sistema actual
  return {
    text: result.text || result.response,
    response: result.text || result.response,
    type: result.type,
    success: result.success !== false,
    requiresAction: result.requiresAction || false,
    requiresPayment: result.requiresPayment || false,
    requiresVerification: result.requiresVerification || false,
    data: result.data || {},
    _meta: result._meta || {},
    skillUsed: result._meta?.skill || 'fallback',
    intentDetected: result._meta?.intent || 'unknown',
    confidence: result._meta?.confidence || 0
  };
}

/**
 * Clasifica un mensaje sin ejecutar (para debugging/previsualización)
 */
async function classifyMessage(message, context = {}) {
  const engine = getSkillEngine();
  return await engine.classifyIntent(message, context);
}

/**
 * Verifica si el sistema de skills está operativo
 */
function isSkillSystemReady() {
  const engine = getSkillEngine();
  return engine.skills.size >= 5;
}

/**
 * Obtiene lista de skills disponibles
 */
function getAvailableSkills() {
  const engine = getSkillEngine();
  return Array.from(engine.skills.values()).map(skill => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    intentsCount: skill.intents.length
  }));
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Motor principal
  createAnaSkillEngine,
  getSkillEngine,
  
  // API pública
  processWithSkills,
  classifyMessage,
  isSkillSystemReady,
  getAvailableSkills,
  
  // Skills individuales (para testing)
  SkillEngine,
  AgendaSkill,
  PagosSkill,
  InfoClinicaSkill,
  SaludosSkill,
  FallbackSkill
};
