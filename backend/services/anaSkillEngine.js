/**
 * 🤖 ANA SKILL ENGINE - Sistema Modular de Inteligencia
 * 
 * Arquitectura:
 * - Cada Skill es un experto en un dominio específico
 * - SkillEngine clasifica intents y enruta al skill apropiado
 * - Skills reportan outcome al HiveMind para aprendizaje colectivo
 * - Respuestas garantizadas: cortas, concisas, inteligentes
 */

const { db, Timestamp } = require('../config/firebase');
const { registerCollectiveExperience } = require('./hiveMindService');

// ============================================
// SKILL ENGINE - Clasificador y Enrutador
// ============================================
class SkillEngine {
  constructor() {
    this.skills = new Map();
    this.intentPatterns = new Map();
    this.confidenceThreshold = 0.75;
  }

  /**
   * Registra un skill en el motor
   */
  registerSkill(skill) {
    this.skills.set(skill.id, skill);
    // Registrar patrones del skill para clasificación rápida
    skill.intents.forEach(intent => {
      intent.patterns.forEach(pattern => {
        this.intentPatterns.set(pattern.toLowerCase(), {
          skillId: skill.id,
          intentId: intent.id,
          confidence: intent.confidence || 0.8
        });
      });
    });
    console.log(`✅ Skill registrado: ${skill.name} (${skill.id})`);
  }

  /**
   * Clasifica el mensaje y determina el intent con confidence score
   */
  async classifyIntent(message, context = {}) {
    const lowerMessage = message.toLowerCase();
    const scores = [];

    // 1. Pattern matching rápido
    this.intentPatterns.forEach((mapping, pattern) => {
      if (lowerMessage.includes(pattern)) {
        scores.push({
          skillId: mapping.skillId,
          intentId: mapping.intentId,
          confidence: mapping.confidence,
          method: 'pattern'
        });
      }
    });

    // 2. NLP Básico para frases complejas
    const nlpResult = this.analyzeWithNLP(lowerMessage);
    if (nlpResult) {
      scores.push(nlpResult);
    }

    // 3. Contexto conversacional (si existe historial)
    if (context.lastIntent && context.lastSkill) {
      scores.push({
        skillId: context.lastSkill,
        intentId: context.lastIntent,
        confidence: 0.6,
        method: 'context'
      });
    }

    // 4. Seleccionar mejor match
    if (scores.length === 0) {
      return {
        skillId: 'fallback',
        intentId: 'unknown',
        confidence: 0,
        entities: this.extractEntities(message)
      };
    }

    // Agrupar por skill y calcular confidence agregado
    const skillScores = {};
    scores.forEach(score => {
      if (!skillScores[score.skillId]) {
        skillScores[score.skillId] = { total: 0, count: 0, intents: {} };
      }
      skillScores[score.skillId].total += score.confidence;
      skillScores[score.skillId].count++;
      
      if (!skillScores[score.skillId].intents[score.intentId]) {
        skillScores[score.skillId].intents[score.intentId] = { total: 0, count: 0 };
      }
      skillScores[score.skillId].intents[score.intentId].total += score.confidence;
      skillScores[score.skillId].intents[score.intentId].count++;
    });

    // Encontrar skill ganador
    let bestSkill = null;
    let bestScore = 0;
    Object.entries(skillScores).forEach(([skillId, data]) => {
      const avgConfidence = data.total / data.count;
      if (avgConfidence > bestScore) {
        bestScore = avgConfidence;
        bestSkill = skillId;
      }
    });

    // Encontrar intent ganador dentro del skill
    const skillData = skillScores[bestSkill];
    let bestIntent = null;
    let bestIntentScore = 0;
    Object.entries(skillData.intents).forEach(([intentId, data]) => {
      const avgConfidence = data.total / data.count;
      if (avgConfidence > bestIntentScore) {
        bestIntentScore = avgConfidence;
        bestIntent = intentId;
      }
    });

    return {
      skillId: bestSkill,
      intentId: bestIntent,
      confidence: bestScore,
      entities: this.extractEntities(message),
      allScores: skillScores
    };
  }

  /**
   * NLP básico para análisis semántico
   */
  analyzeWithNLP(message) {
    // Detectar intenciones implícitas
    const patterns = {
      'agenda.checkAvailability': [
        /^(?:tienes?|hay)\s+(?:hueco|hora|cita|disponibilidad)/i,
        /(?:quiero|necesito|me gustar[íi]a)\s+(?:pedir|solicitar|reservar)\s+(?:una\s+)?cita/i,
        /(?:cu[áa]ndo\s+(?:puedo|podr[íi]a)\s+venir)/i
      ],
      'agenda.requestSlot': [
        /(?:a\s+las?|para\s+las?)\s*\d{1,2}(?::\d{2})?\s*(?:h|horas?)?/i,
        /\d{1,2}[:h]\d{2}/i
      ],
      'pagos.query': [
        /(?:cu[áa]nto\s+(?:cuesta|vale|es)|precio|tarifa)/i,
        /(?:c[óo]mo\s+pago|fianza|bizum|tarjeta)/i
      ],
      'saludos.greeting': [
        /^(?:hola|buenos\s+(?:d[ií]as|tardes|noches)|saludos?|hey|buenas)/i
      ],
      'infoClinica.team': [
        /(?:qui[eé]n|quienes)\s+(?:trabaja|es|son|atender[áa])/i,
        /(?:fisioterapeuta|especialista|profesional|equipo)/i
      ],
      'infoClinica.services': [
        /(?:qu[eé]\s+(?:servicios|tratamientos|hac[eé]is|hacen)|para\s+qu[eé]\s+sirve)/i
      ]
    };

    for (const [intentId, regexes] of Object.entries(patterns)) {
      for (const regex of regexes) {
        if (regex.test(message)) {
          const [skillId, intent] = intentId.split('.');
          return {
            skillId,
            intentId: intent,
            confidence: 0.85,
            method: 'nlp'
          };
        }
      }
    }

    return null;
  }

  /**
   * Extracción de entidades (fecha, hora, nombres, etc)
   */
  extractEntities(message) {
    const entities = {
      dates: [],
      times: [],
      emails: [],
      phones: [],
      names: [],
      numbers: []
    };

    // Fechas: "mañana", "hoy", "lunes", "15/03"
    const datePatterns = [
      /\b(hoy|mañana|pasado\s+mañana)\b/i,
      /\b(lunes|martes|mi[ée]rcoles|jueves|viernes|s[áa]bado|domingo)\b/i,
      /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/g
    ];
    datePatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) entities.dates.push(...matches);
    });

    // Horas: "10:30", "10h", "a las 10"
    const timeMatches = message.match(/(\d{1,2})[:h](\d{2})?|\ba\s+las?\s+(\d{1,2})\b/gi);
    if (timeMatches) entities.times.push(...timeMatches);

    // Emails
    const emailMatches = message.match(/[\w.-]+@[\w.-]+\.\w+/gi);
    if (emailMatches) entities.emails.push(...emailMatches);

    // Teléfonos (españoles)
    const phoneMatches = message.match(/(?:\+34)?\s*(?:\d{3}\s*){3}/g);
    if (phoneMatches) entities.phones.push(...phoneMatches);

    return entities;
  }

  /**
   * Procesa mensaje: clasifica → enruta → ejecuta → registra aprendizaje
   */
  async processMessage(message, context = {}) {
    const startTime = Date.now();
    
    try {
      // 1. CLASIFICAR
      const classification = await this.classifyIntent(message, context);
      console.log(`🎯 Intent detectado: ${classification.skillId}.${classification.intentId} (${(classification.confidence * 100).toFixed(1)}%)`);

      // 2. OBTENER SKILL
      const skill = this.skills.get(classification.skillId);
      if (!skill) {
        const fallback = this.skills.get('fallback');
        return await fallback.execute('unknown', message, context, {});
      }

      // 3. EJECUTAR SKILL
      const result = await skill.execute(
        classification.intentId,
        message,
        context,
        classification.entities
      );

      // 4. REGISTRAR EN HIVE MIND (aprendizaje colectivo)
      const processingTime = Date.now() - startTime;
      await this.registerExperience(classification, result, context, processingTime);

      // 5. RETORNAR CON METADATA
      return {
        ...result,
        _meta: {
          skill: classification.skillId,
          intent: classification.intentId,
          confidence: classification.confidence,
          processingTime,
          entities: classification.entities
        }
      };

    } catch (error) {
      console.error('🔥 [SkillEngine] Error:', error);
      return {
        text: 'Disculpa, tuve un problema procesando tu mensaje. ¿Podrías intentarlo de nuevo?',
        type: 'error',
        _meta: { error: error.message }
      };
    }
  }

  /**
   * Registra experiencia en HiveMind para aprendizaje
   */
  async registerExperience(classification, result, context, processingTime) {
    try {
      const outcome = result.success !== false ? 'success' : 'fallback_needed';
      
      await registerCollectiveExperience(context.clinicId, {
        type: 'skill_execution',
        skill: classification.skillId,
        intent: classification.intentId,
        confidence: classification.confidence,
        outcome,
        processingTime,
        context: [
          classification.intentId,
          classification.skillId,
          `confidence_${Math.floor(classification.confidence * 10) / 10}`
        ],
        solution: result.text?.substring(0, 100),
        impact_score: classification.confidence > 0.9 ? 8 : 5
      });
    } catch (e) {
      console.error('⚠️ [SkillEngine] Error registrando experiencia:', e.message);
    }
  }
}

// ============================================
// SKILL BASE CLASS
// ============================================
class Skill {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.intents = [];
    this.responseTemplates = new Map();
  }

  /**
   * Define un intent con sus patrones de reconocimiento
   */
  addIntent(id, patterns, confidence = 0.8) {
    this.intents.push({ id, patterns: Array.isArray(patterns) ? patterns : [patterns], confidence });
    return this;
  }

  /**
   * Añade template de respuesta para un intent
   */
  addResponse(intentId, template, conditions = {}) {
    if (!this.responseTemplates.has(intentId)) {
      this.responseTemplates.set(intentId, []);
    }
    this.responseTemplates.get(intentId).push({ template, conditions });
    return this;
  }

  /**
   * Método principal de ejecución (override en subclases)
   */
  async execute(intentId, message, context, entities) {
    throw new Error('Skill must implement execute()');
  }

  /**
   * Renderiza template con variables
   */
  render(template, variables) {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
    });
    return result;
  }

  /**
   * Selecciona respuesta apropiada según condiciones
   */
  selectResponse(intentId, context) {
    const templates = this.responseTemplates.get(intentId);
    if (!templates || templates.length === 0) {
      return '¿En qué puedo ayudarte?';
    }

    // Si solo hay uno, usarlo
    if (templates.length === 1) return templates[0].template;

    // Seleccionar según condiciones
    for (const { template, conditions } of templates) {
      if (Object.keys(conditions).length === 0) return template;
      
      // Evaluar condiciones simples
      let matches = true;
      for (const [key, value] of Object.entries(conditions)) {
        if (context[key] !== value) {
          matches = false;
          break;
        }
      }
      if (matches) return template;
    }

    return templates[0].template;
  }
}

// ============================================
// EXPORTS
// ============================================
module.exports = {
  SkillEngine,
  Skill
};
