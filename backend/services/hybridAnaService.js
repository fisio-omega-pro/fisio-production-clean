const claudeService = require('./claudeService');

class HybridAnaService {
  constructor() {
    this.simplePatterns = new Map([
      ['hola', 'greeting'],
      ['adios', 'goodbye'],
      ['gracias', 'thanks'],
      ['cita', 'appointment'],
      ['horario', 'schedule'],
      ['pago', 'payment']
    ]);
  }

  // 🔍 Detectar si necesita Claude o puede usar reglas
  async shouldUseClaude(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // 🚨 Casos que SÍ necesitan Claude
    if (this.isComplexConversation(lowerMessage)) {
      return { useClaude: true, reason: 'complex_conversation' };
    }
    
    if (this.needsContextualUnderstanding(lowerMessage, context)) {
      return { useClaude: true, reason: 'contextual_needed' };
    }
    
    if (this.hasEmotionalContent(lowerMessage)) {
      return { useClaude: true, reason: 'emotional_content' };
    }
    
    // ⚡ Casos que pueden usar reglas simples
    if (this.isSimpleRequest(lowerMessage)) {
      return { useClaude: false, reason: 'simple_request' };
    }
    
    // 🤖 Por defecto, usar Claude para seguridad
    return { useClaude: true, reason: 'default_fallback' };
  }

  // 🧠 ¿Es una conversación compleja?
  isComplexConversation(message) {
    const complexPatterns = [
      /porque.*no|por qué.*no/i,
      /no entiendo/i,
      /confundido|confundida/i,
      /explica.*mejor/i,
      /estoy.*frustrado/i,
      /no.*funciona/i,
      /misma.*frecuencia/i,
      /te.*estas.*flipando/i
    ];
    
    return complexPatterns.some(pattern => pattern.test(message));
  }

  // 🕐 ¿Necesita entender contexto temporal/real?
  needsContextualUnderstanding(message, context) {
    const contextualPatterns = [
      /ahora.*son.*las/i,
      /hora.*actual/i,
      /ya.*paso/i,
      /tarde/i,
      /temprano/i,
      /un.*solo.*fisio/i,
      /clinica.*real/i
    ];
    
    return contextualPatterns.some(pattern => pattern.test(message)) ||
           this.needsTimeValidation(message);
  }

  // ⏰ ¿Necesita validar hora real?
  needsTimeValidation(message) {
    const timePatterns = [
      /\d{1,2}:\d{2}/,
      /\d{1,2}\s*(de la|de las)/i,
      /manana/i,
      /hoy/i
    ];
    
    return timePatterns.some(pattern => pattern.test(message));
  }

  // 😊 ¿Tiene contenido emocional?
  hasEmotionalContent(message) {
    const emotionalPatterns = [
      /frustrado/i,
      /enfadado/i,
      /contento/i,
      /feliz/i,
      /gracias/i,
      /por.*favor/i,
      /ayuda/i
    ];
    
    return emotionalPatterns.some(pattern => pattern.test(message));
  }

  // ⚡ ¿Es una solicitud simple?
  isSimpleRequest(message) {
    const simplePatterns = [
      /^hola$/i,
      /^adios$/i,
      /^gracias$/i,
      /cita.*hoy/i,
      /horarios/i,
      /disponibilidad/i
    ];
    
    return simplePatterns.some(pattern => pattern.test(message));
  }

  // 🚀 Procesar mensaje con sistema híbrido
  async processMessage(message, context = {}) {
    const decision = await this.shouldUseClaude(message, context);
    
    console.log(`🤖 [HYBRID] Decision: ${decision.useClaude ? 'Claude' : 'Rules'} (${decision.reason})`);
    
    if (decision.useClaude) {
      return await this.processWithClaude(message, context);
    } else {
      return await this.processWithRules(message, context);
    }
  }

  // 🧠 Procesar con Claude (inteligencia real)
  async processWithClaude(message, context) {
    const currentTime = new Date();
    const clinicInfo = await this.getClinicInfo(context.clinicId);
    
    const prompt = `
Eres Ana, asistente inteligente de ${clinicInfo.nombre}.

CONTEXTO REAL:
- Hora actual: ${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}
- Clínica: ${clinicInfo.nombre}
- Especialistas: ${clinicInfo.especialistas?.join(', ') || 'Un fisioterapeuta'}
- Usuario: ${context.userName || 'Paciente'}

MENSAJE DEL USUARIO: "${message}"

REGLAS IMPORTANTES:
1. Si ofrece horarios, verifica que sean posteriores a la hora actual
2. Solo menciona especialistas que realmente existen en la clínica
3. Responde con empatía y contexto real
4. Si es una queja, discúlpate y ayuda sinceramente

Responde de forma natural, empática y contextual.
`;

    try {
      const apiKey = await this.getApiKey();
      const response = await claudeService.generateResponse(prompt, {
        maxTokens: 500,
        temperature: 0.7,
        apiKey: apiKey
      });
      
      return {
        source: 'claude',
        response: response.trim(),
        confidence: 'high'
      };
    } catch (error) {
      console.error('🔥 Claude error, fallback to rules:', error.message);
      return await this.processWithRules(message, context);
    }
  }

  async getApiKey() {
    try {
      const secretClient = new SecretManagerServiceClient();
      const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'fisio-production';
      const name = `projects/${projectId}/secrets/ANTHROPIC_API_KEY/versions/latest`;
      
      const [version] = await secretClient.accessSecretVersion({ name });
      const payload = version.payload.data.toString();
      
      return payload.trim();
    } catch (error) {
      console.error('🔥 Error getting Claude API key from Secret Manager:', error.message);
      // Fallback to environment variable for local development
      const envKey = process.env.ANTHROPIC_API_KEY;
      if (envKey && envKey !== 'sk-ant-api03-REEMPLAZA-CON-TU-CLAVE-REAL') {
        return envKey.trim();
      }
      return '';
    }
  }

  // ⚙️ Procesar con reglas (rápido y sin coste)
  async processWithRules(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // Lógica de reglas existente (optimizada)
    if (lowerMessage.includes('hola')) {
      return {
        source: 'rules',
        response: `Hola, soy Ana de ${context.clinicName || 'la clínica'}. ¿En qué puedo ayudarte?`,
        confidence: 'medium'
      };
    }
    
    if (lowerMessage.includes('cita') && lowerMessage.includes('hoy')) {
      return {
        source: 'rules',
        response: 'Para citas hoy, necesito saber qué hora te vendría bien. ¿Tienes alguna preferencia?',
        confidence: 'medium'
      };
    }
    
    // Fallback
    return {
      source: 'rules',
      response: 'Entiendo tu consulta. Para ayudarte mejor, ¿podrías darme más detalles?',
      confidence: 'low'
    };
  }

  // 🏥 Obtener información real de la clínica
  async getClinicInfo(clinicId) {
    // Aquí iría la lógica para obtener datos reales de Firestore
    return {
      nombre: 'Clínica de Fisioterapia',
      especialistas: ['Dr. García'], // Un solo fisio como debe ser
      horario: { apertura: '09:00', cierre: '20:00' }
    };
  }
}

module.exports = new HybridAnaService();
