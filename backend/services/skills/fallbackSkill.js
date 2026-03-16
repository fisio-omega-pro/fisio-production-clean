/**
 * 🆘 FALLBACK SKILL - Último recurso inteligente
 * 
 * Cuando ningún skill entiende el mensaje, este skill:
 * - Intenta deducir intención con NLP avanzado
 * - Sugiere opciones claras
 * - Escalona a humano si es necesario
 * - Aprende del fallo para mejorar
 */

const { Skill } = require('../anaSkillEngine');

class FallbackSkill extends Skill {
  constructor() {
    super('fallback', 'Fallback Inteligente', 'Último recurso cuando nadie entiende');

    // Intents de fallback
    this.addIntent('confused', [
      'no entiendo', 'cómo', 'qué', '?', '???', 'no sé', 'ayuda',
      'funciona esto', 'explicame', 'no capto'
    ], 0.7);

    this.addIntent('complex', [
      'tengo dudas', 'varias cosas', 'complicado', 'difícil',
      'no es fácil', 'varias preguntas'
    ], 0.6);

    this.addIntent('unknown', [], 0); // Catch-all
  }

  async execute(intentId, message, context, entities) {
    const clinicId = context.clinicId;
    const clinicName = context.clinicName || 'la clínica';
    
    // Analizar mensaje para sugerir mejor opción
    const suggestion = this.analyzeForSuggestion(message);
    
    // Si detectamos algo útil, sugerir skill correcto
    if (suggestion.confidence > 0.6) {
      return {
        text: `¿Quieres ${suggestion.text}?`,
        type: 'fallback_suggestion',
        success: true,
        suggestedSkill: suggestion.skill,
        suggestedIntent: suggestion.intent
      };
    }
    
    // Si parece una pregunta médica
    if (this.isMedicalQuestion(message)) {
      return {
        text: `Entiendo tu pregunta sobre salud. Como asistente de ${clinicName}, solo gestiono citas y pagos.\n\nPara dudas médicas, es mejor que consultes directamente con el fisioterapeuta. ¿Te reservo cita?`,
        type: 'fallback_medical',
        success: true,
        escalationRecommended: true
      };
    }
    
    // Fallback genérico con opciones claras
    return {
      text: `Soy Ana, asistente de ${clinicName}.\n\nPuedo ayudarte con:\n📅 Pedir/modificar cita\n💳 Pagar fianza\n💰 Consultar precios\n👨‍⚕️ Info del equipo\n📍 Horario y ubicación\n\n¿Qué necesitas?`,
      type: 'fallback_generic',
      success: true,
      menuOptions: ['cita', 'pago', 'precio', 'info', 'horario']
    };
  }

  /**
   * Intenta deducir qué quería el usuario
   */
  analyzeForSuggestion(message) {
    const lower = message.toLowerCase();
    
    // Patrones implícitos de agenda
    if (lower.match(/(me duele|tengo dolor|molestia|lesión|accidente|operación)/)) {
      return {
        skill: 'agenda',
        intent: 'checkAvailability',
        text: 'reservar una cita para valorar eso',
        confidence: 0.75
      };
    }
    
    // Patrones de pago
    if (lower.match(/(dinero|euros|€|transferencia|bizum|tarjeta bancaria|banco)/)) {
      return {
        skill: 'pagos',
        intent: 'paymentMethods',
        text: 'saber cómo pagar',
        confidence: 0.8
      };
    }
    
    // Patrones de info
    if (lower.match(/(llegar|cómo voy|dirección|mapa|donde está|situado)/)) {
      return {
        skill: 'infoClinica',
        intent: 'location',
        text: 'saber dónde estamos',
        confidence: 0.85
      };
    }
    
    // Patrones de equipo
    if (lower.match(/(especialista concreto|fisio bueno|recomiendame|mejor)/)) {
      return {
        skill: 'infoClinica',
        intent: 'team',
        text: 'que te recomiende un especialista',
        confidence: 0.7
      };
    }
    
    return { confidence: 0 };
  }

  /**
   * Detecta si es pregunta médica (fuera de scope)
   */
  isMedicalQuestion(message) {
    const medicalTerms = [
      'tratamiento', 'diagnóstico', 'cura', 'cura', 'medicamento',
      'pastillas', 'ejercicios', 'dolencia', 'patología', 'terapia',
      'rehabilitación', 'fisioterapia', 'masaje', 'electrodos',
      'ultrasonidos', 'láser', 'ondas de choque', 'manual',
      'osteopatía', 'punción', 'acupuntura'
    ];
    
    const lower = message.toLowerCase();
    return medicalTerms.some(term => lower.includes(term));
  }
}

module.exports = { FallbackSkill };
