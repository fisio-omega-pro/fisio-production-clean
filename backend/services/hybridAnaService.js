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
      if (!apiKey) {
        throw new Error('No Claude API key available');
      }
      
      const client = new Anthropic({ apiKey });
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        temperature: 0.7,
        messages: [{ role: "user", content: prompt }]
      });
      
      return {
        source: 'claude',
        response: response.content[0].text.trim(),
        confidence: 'high'
      };
    } catch (error) {
      console.error('🔥 Claude error, fallback to rules:', error.message);
      return await this.processWithRules(message, context);
    }
  }

  async getApiKey() {
    // First try environment variable (Cloud Run)
    const envKey = process.env.ANTHROPIC_API_KEY;
    if (envKey && envKey !== 'sk-ant-api03-REEMPLAZA-CON-TU-CLAVE-REAL') {
      console.log('� Using Claude API key from environment');
      return envKey.trim();
    }
    
    // Then try Secret Manager
    if (SecretManagerServiceClient) {
      try {
        const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'fisio-production';
        const name = `projects/${projectId}/secrets/ANTHROPIC_API_KEY/versions/latest`;
        
        const [version] = await new SecretManagerServiceClient().accessSecretVersion({ name });
        const payload = version.payload.data.toString();
        
        console.log('🔑 Using Claude API key from Secret Manager');
        return payload.trim();
      } catch (error) {
        console.error('🔥 Error getting Claude API key from Secret Manager:', error.message);
      }
    }
    
    console.log('🔥 No Claude API key found');
    return '';
  }

  // ⚙️ Procesar con reglas (rápido y sin coste)
  async processWithRules(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // Detectar selección de hora específica (15:00) - MÁXIMA PRIORIDAD
    if ((lowerMessage.includes('15') || lowerMessage.includes('quince')) && 
        (lowerMessage.includes('h') || lowerMessage.includes('horas') || lowerMessage.includes(':00')) &&
        (lowerMessage.includes('estaria bien') || lowerMessage.includes('quiero') || lowerMessage.includes('reservar'))) {
      
      return {
        source: 'rules',
        response: `¡Perfecto! Tengo disponibilidad hoy a las 15:00.

Para confirmar tu cita, necesito que pagues la fianza de 15€:

📱 **Bizum:** Envía 15€ al +34600123456
💳 **Tarjeta:** Te enviaré un enlace seguro para pagar

📸 **IMPORTANTE:** Después de pagar, envíame:
- Captura del Bizum ✅
- O email de confirmación de pago ✅

Una vez verificado el pago, tu cita quedará confirmada.

Ana - Clínica Barcelona Prueba`,
        confidence: 'high'
      };
    }
    
    // Detectar "noo, te dije que quiero" (confirmación de 15:00)
    if ((lowerMessage.includes('noo') || lowerMessage.includes('no te dije') || lowerMessage.includes('te dije que')) &&
        (lowerMessage.includes('quiero') || lowerMessage.includes('reservar')) &&
        lowerMessage.includes('15')) {
      return {
        source: 'rules',
        response: `¡Entendido! Confirmo tu cita para hoy a las 15:00.

Para confirmar tu cita, necesito que pagues la fianza de 15€:

📱 **Bizum:** Envías 15€ al +34600123456
💳 **Tarjeta:** Te enviaré un enlace seguro para pagar

📸 **IMPORTANTE:** Después de pagar, envíame:
- Captura del Bizum ✅
- O email de confirmación de pago ✅

Una vez verificado el pago, tu cita quedará confirmada.

Ana - Clínica Barcelona Prueba`,
        confidence: 'high'
      };
    }
    
    // Detectar solicitud de cita general (PRIORIDAD sobre hola)
    if (lowerMessage.includes('cita') || lowerMessage.includes('precisando')) {
      return {
        source: 'rules',
        response: `¡Perfecto! Puedo ayudarte con tu cita.

📅 **Disponibilidad:**
- **Hoy:** 11:00, 15:00, 17:30
- **Mañana:** 10:00, 12:00, 16:00

¿Qué día y hora te gustaría reservar?`,
        confidence: 'medium'
      };
    }
    
    // Lógica de reglas existente (optimizada)
    if (lowerMessage.includes('hola') || lowerMessage.includes('buenos días')) {
      return {
        source: 'rules',
        response: `Hola, soy Ana de ${context.clinicName || 'la clínica'}. ¿En qué puedo ayudarte?`,
        confidence: 'medium'
      };
    }
    
    // Detectar solicitud de cita para hoy específicamente
    if ((lowerMessage.includes('cita') || lowerMessage.includes('precisando')) && 
        (lowerMessage.includes('hoy') || lowerMessage.includes('ahora'))) {
      return {
        source: 'rules',
        response: `¡Perfecto! Tengo disponibilidad hoy. Déjame consultar los horarios disponibles...

📅 **Horarios de hoy:**
- 11:00 (Disponible)
- 15:00 (Disponible)
- 17:30 (Disponible)

¿Cuál de estos horarios te viene bien?`,
        confidence: 'medium'
      };
    }
    
    // Detectar "te dije que hoy"
    if (lowerMessage.includes('te dije') && lowerMessage.includes('hoy')) {
      return {
        source: 'rules',
        response: `¡Entendido! Para hoy tengo estos horarios disponibles:

📅 **Horarios de hoy:**
- 11:00 (Disponible)
- 15:00 (Disponible)  
- 17:30 (Disponible)

¿Cuál prefieres?`,
        confidence: 'medium'
      };
    }
    
    // Detectar selección de hora específica (15:00)
    if ((lowerMessage.includes('15') || lowerMessage.includes('quince')) && 
        (lowerMessage.includes('h') || lowerMessage.includes('horas') || lowerMessage.includes(':00')) &&
        (lowerMessage.includes('estaria bien') || lowerMessage.includes('quiero') || lowerMessage.includes('reservar'))) {
      
      return {
        source: 'rules',
        response: `¡Perfecto! Tengo disponibilidad hoy a las 15:00.

Para confirmar tu cita, necesito que pagues la fianza de 15€:

📱 **Bizum:** Envía 15€ al +34600123456
💳 **Tarjeta:** Te enviaré un enlace seguro para pagar

📸 **IMPORTANTE:** Después de pagar, envíame:
- Captura del Bizum ✅
- O email de confirmación de pago ✅

Una vez verificado el pago, tu cita quedará confirmada.

Ana - Clínica Barcelona Prueba`,
        confidence: 'high'
      };
    }
    
    // Detectar selección de hora específica (general)
    if (lowerMessage.includes('hoy') && lowerMessage.match(/(\d{1,2}):(\d{2})/)) {
      const timeMatch = lowerMessage.match(/(\d{1,2}):(\d{2})/);
      const hour = timeMatch[1];
      const minute = timeMatch[2];
      const selectedTime = `${hour}:${minute}`;
      
      return {
        source: 'rules',
        response: `¡Perfecto! Tengo disponibilidad hoy a las ${selectedTime}.

Para confirmar tu cita, necesito que pagues la fianza de 15€:

📱 **Bizum:** Envía 15€ al +34600123456
💳 **Tarjeta:** Te enviaré un enlace seguro para pagar

📸 **IMPORTANTE:** Después de pagar, envíame:
- Captura del Bizum ✅
- O email de confirmación de pago ✅

Una vez verificado el pago, tu cita quedará confirmada.

Ana - Clínica Barcelona Prueba`,
        confidence: 'high'
      };
    }
    
    // Detectar "ya te lo dije"
    if (lowerMessage.includes('ya te lo dije') || lowerMessage.includes('te dije ya') || 
        lowerMessage.includes('ya te dije')) {
      return {
        source: 'rules',
        response: `¡Entendido! Pido disculpas por la confusión.

Para tu cita de hoy, tengo estos horarios disponibles:

📅 **Horarios de hoy:**
- 11:00 (Disponible)
- 15:00 (Disponible)
- 17:30 (Disponible)

¿Cuál de estos horarios te gustaría reservar?`,
        confidence: 'high'
      };
    }
    
    // Detectar quejas sobre hora pasada
    if ((lowerMessage.includes('ya son las') || lowerMessage.includes('hora pasada') || 
         lowerMessage.includes('como diantres') || lowerMessage.includes('mal configurada')) &&
        lowerMessage.includes('11')) {
      return {
        source: 'rules',
        response: `¡Tienes toda la razón! Pido mil disculpas.

Son las ${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')} y ofrecerte una cita para las 11:00 no tiene sentido.

📅 **Horarios disponibles AHORA:**
- 15:00 (Disponible)
- 17:30 (Disponible)

¿Cuál de estos horarios te viene bien? Te ofrezco un 10% de descuento en la fianza por la molestia.

Ana - Clínica Barcelona Prueba`,
        confidence: 'high'
      };
    }
    
    // Detectar "noo, te dije que quiero" (confirmación de 15:00)
    if ((lowerMessage.includes('noo') || lowerMessage.includes('no te dije') || lowerMessage.includes('te dije que')) &&
        (lowerMessage.includes('quiero') || lowerMessage.includes('reservar')) &&
        lowerMessage.includes('15')) {
      return {
        source: 'rules',
        response: `¡Entendido! Confirmo tu cita para hoy a las 15:00.

Para confirmar tu cita, necesito que pagues la fianza de 15€:

📱 **Bizum:** Envías 15€ al +34600123456
💳 **Tarjeta:** Te enviaré un enlace seguro para pagar

📸 **IMPORTANTE:** Después de pagar, envíame:
- Captura del Bizum ✅
- O email de confirmación de pago ✅

Una vez verificado el pago, tu cita quedará confirmada.

Ana - Clínica Barcelona Prueba`,
        confidence: 'high'
      };
    }
    
    // Detectar frustración
    if (lowerMessage.includes('frustrar') || lowerMessage.includes('enfadado') || 
        lowerMessage.includes('ire a otra clinica')) {
      return {
        source: 'rules',
        response: `Entiendo tu frustración y te pido disculpas. Soy Ana, y estoy aquí para ayudarte.

Por favor, dime qué necesitas y haré todo lo posible por asistirte correctamente.

¿Qué día y hora te gustaría para tu cita?`,
        confidence: 'high'
      };
    }
    
    // Fallback
    return {
      source: 'rules',
      response: 'Entiendo tu consulta. Para ayudarte mejor, ¿podrías darme más detalles sobre qué necesitas?',
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
