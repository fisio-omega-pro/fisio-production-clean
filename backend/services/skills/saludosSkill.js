/**
 * 👋 SALUDOS SKILL - Experto en Interacciones Sociales
 * 
 * Capacidades:
 * - Saludos personalizados (nuevo vs recurrente)
 * - Despedidas y cierres
 * - Agradecimientos
 * - Small talk controlado
 * - Detección de emociones
 */

const { Skill } = require('../anaSkillEngine');
const { db } = require('../../config/firebase');

class SaludosSkill extends Skill {
  constructor() {
    super('saludos', 'Interacciones Sociales', 'Experto en saludos y conversación');

    // Intents
    this.addIntent('greeting', [
      'hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'buenas',
      'saludos', 'qué tal', 'holi', 'hello', 'hi'
    ], 0.95);

    this.addIntent('farewell', [
      'adiós', 'hasta luego', 'chao', 'nos vemos', 'bye', 'hasta mañana',
      'gracias hasta luego', 'ok gracias', 'perfecto gracias'
    ], 0.9);

    this.addIntent('thanks', [
      'gracias', 'muchas gracias', 'te agradezco', 'mil gracias', 'perfecto gracias',
      'genial gracias', 'ok gracias'
    ], 0.9);

    this.addIntent('wellbeing', [
      'cómo estás', 'qué tal', 'cómo te va', 'todo bien', 'cómo andas'
    ], 0.7);

    this.addIntent('complaint', [
      'flipas', 'porquería', 'no funciona', 'mal servicio', 'incompetente',
      'no entiendo', 'qué pasa', 'estoy frustrado', 'maldita', 'odio'
    ], 0.85);

    this.addIntent('smallTalk', [
      'qué haces', 'qué tal el día', 'hace buen día', 'hace calor', 'llueve',
      'qué planes', 'fin de semana', 'vacaciones'
    ], 0.6);

    // Templates - se generan dinámicamente según contexto
  }

  async execute(intentId, message, context, entities) {
    const clinicId = context.clinicId;
    const clinicName = context.clinicName || 'la clínica';
    const isRecurrent = context.isRecurrent || false;
    const userName = context.userName || '';
    
    try {
      // Obtener configuración de Ana para esta clínica
      const anaConfig = await this.getAnaConfig(clinicId);
      const anaName = anaConfig.name || 'Ana';
      
      switch (intentId) {
        case 'greeting':
          return this.handleGreeting(anaName, clinicName, isRecurrent, userName, context);
        
        case 'farewell':
          return this.handleFarewell(anaName, clinicName, isRecurrent, context);
        
        case 'thanks':
          return this.handleThanks(anaName, clinicName, context);
        
        case 'wellbeing':
          return this.handleWellbeing(anaName, clinicName, context);
        
        case 'complaint':
          return this.handleComplaint(anaName, clinicName, context);
        
        case 'smallTalk':
          return this.handleSmallTalk(anaName, clinicName, context);
        
        default:
          return this.fallbackResponse(anaName, clinicName);
      }
    } catch (error) {
      console.error('🔥 [SaludosSkill] Error:', error);
      return {
        text: `Hola, soy Ana de ${clinicName}. ¿En qué puedo ayudarte?`,
        type: 'greeting_fallback',
        success: true
      };
    }
  }

  /**
   * Saludo inteligente según tipo de usuario
   */
  handleGreeting(anaName, clinicName, isRecurrent, userName, context) {
    const hour = new Date().getHours();
    let timeGreeting = 'Hola';
    
    if (hour >= 5 && hour < 12) timeGreeting = 'Buenos días';
    else if (hour >= 12 && hour < 20) timeGreeting = 'Buenas tardes';
    else timeGreeting = 'Buenas noches';
    
    // Saludo para usuario recurrente
    if (isRecurrent && userName) {
      const recurrentGreetings = [
        `${timeGreeting} de nuevo ${userName} 👋\n\n¿Cómo estás? ¿Necesitas otra cita?`,
        `¡${userName}! Qué bien verte de nuevo 😊\n\n¿En qué te ayudo hoy?`,
        `${timeGreeting} ${userName}. ¿Todo bien desde la última vez?`
      ];
      
      return {
        text: this.selectRandom(recurrentGreetings),
        type: 'greeting_recurrent',
        success: true,
        data: { isRecurrent: true, userName }
      };
    }
    
    // Saludo para nuevo usuario
    const newGreetings = [
      `${timeGreeting}, soy ${anaName} de ${clinicName} 👋\n\nGestiono citas 24/7. ¿Para cuándo necesitas?`,
      `¡${timeGreeting}! Soy ${anaName}, asistente de ${clinicName} 🤖\n\n¿Qué necesitas?`,
      `${timeGreeting}! ${anaName} aquí 📍\n\nPuedo reservarte cita en segundos. ¿Cuándo te viene bien?`
    ];
    
    return {
      text: this.selectRandom(newGreetings),
      type: 'greeting_new',
      success: true,
      data: { isRecurrent: false }
    };
  }

  /**
   * Despedida adaptativa
   */
  handleFarewell(anaName, clinicName, isRecurrent, context) {
    const farewells = [
      `¡Hasta luego! 👋 ${anaName} de ${clinicName}`,
      `Nos vemos. Aquí estoy cuando me necesites 😊`,
      `Perfecto. Te esperamos en ${clinicName} 📅`,
      `Adiós. ¡Que tengas buen día! ☀️`
    ];
    
    // Si hay cita pendiente, añadir recordatorio
    if (context.pendingAppointment) {
      return {
        text: `¡Perfecto! Nos vemos ${context.pendingAppointment.date} a las ${context.pendingAppointment.time}.\n\nTe espero aquí 👋`,
        type: 'farewell_with_appointment',
        success: true
      };
    }
    
    return {
      text: this.selectRandom(farewells),
      type: 'farewell',
      success: true
    };
  }

  /**
   * Agradecimiento con reciprocidad
   */
  handleThanks(anaName, clinicName, context) {
    const thanksResponses = [
      `¡De nada! 😊 ¿Algo más en lo que pueda ayudarte?`,
      `Un placer ${anaName} de ${clinicName} 👍`,
      `Para eso estoy. ¿Necesitas algo más?`,
      `¡Gracias a ti por confiar en ${clinicName}! 🙏`
    ];
    
    // Si acaba de hacer una reserva, reforzar
    if (context.lastAction === 'reserva_cita') {
      return {
        text: `¡Gracias a ti! ${clinicName} te espera 📅\n\n¿Algo más?`,
        type: 'thanks_post_reservation',
        success: true
      };
    }
    
    return {
      text: this.selectRandom(thanksResponses),
      type: 'thanks',
      success: true
    };
  }

  /**
   * Bienestar personal (limitado)
   */
  handleWellbeing(anaName, clinicName, context) {
    return {
      text: `¡Estoy perfecta! List para ayudarte con tu cita en ${clinicName} 💪\n\n¿Qué necesitas?`,
      type: 'wellbeing_response',
      success: true
    };
  }

  /**
   * Manejo de quejas con empatía
   */
  handleComplaint(anaName, clinicName, context) {
    const complaintResponses = [
      `Entiendo tu frustración. Soy ${anaName} y estoy aquí para solucionarlo 💪\n\n¿Qué ha pasado exactamente?`,
      `Lo siento mucho. Vamos a arreglarlo. Cuéntame qué necesitas 📋`,
      `Tienes razón en estar molesto/a. Ayúdame a entender qué falló para solucionarlo 🔧`
    ];
    
    return {
      text: this.selectRandom(complaintResponses),
      type: 'complaint_handling',
      success: true,
      priority: 'high',
      requiresEscalation: true
    };
  }

  /**
   * Small talk controlado - siempre redirige a utilidad
   */
  handleSmallTalk(anaName, clinicName, context) {
    const smallTalkResponses = [
      `😊 Mientras tú descansas, yo proceso citas.\n\n¿Te reservo una en ${clinicName}?`,
      `¡Todo bien por aquí! Más importante: ¿cómo va tu recuperación? 💪`,
      `Gracias por preguntar. ¿Sabías que puedo reservarte cita en 30 segundos? 📅`
    ];
    
    return {
      text: this.selectRandom(smallTalkResponses),
      type: 'small_talk_redirect',
      success: true
    };
  }

  /**
   * Fallback genérico
   */
  fallbackResponse(anaName, clinicName) {
    return {
      text: `Soy ${anaName} de ${clinicName}. ¿En qué te ayudo?\n\n• Pedir cita\n• Precios\n• Información`,
      type: 'greeting_fallback',
      success: true
    };
  }

  // ============ HELPERS ============

  selectRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  async getAnaConfig(clinicId) {
    try {
      const doc = await db.collection('clinicas').doc(clinicId).get();
      if (doc.exists) {
        const data = doc.data();
        return {
          name: data.ana_name || 'Ana',
          color: data.ana_color || '#075E54',
          welcome: data.ana_welcome || null
        };
      }
      return { name: 'Ana' };
    } catch (e) {
      return { name: 'Ana' };
    }
  }
}

module.exports = { SaludosSkill };
