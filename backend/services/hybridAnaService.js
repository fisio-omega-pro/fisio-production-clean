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

    // ⚡ Solo casos MUY simples usan reglas
    if (this.isSimpleRequest(lowerMessage)) {
      return { useClaude: false, reason: 'simple_request' };
    }

    // 🤖 CLAUDE ES EL PRINCIPAL - Para todo lo demás
    return { useClaude: true, reason: 'claude_primary' };
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

  // ⚡ ¿Es una solicitud MUY simple? (solo saludos y despedidas)
  isSimpleRequest(message) {
    const simplePatterns = [
      /^hola$/i,
      /^adios$/i,
      /^gracias$/i,
      /^buenos.*dias$/i,
      /^buenas.*tardes$/i,
      /^buenas.*noches$/i,
      /^hasta.*luego$/i
    ];

    return simplePatterns.some(pattern => pattern.test(message));
  }

  // 🚀 Procesar mensaje con sistema híbrido
  async processMessage(message, context = {}) {
    // 1. Revisar REGLAS DE ORO primero (BIENVENIDA, PAGOS, etc.)
    const ruleResult = await this.processWithRules(message, context);
    if (ruleResult && ruleResult.source === 'rules' && ruleResult.confidence === 'high') {
      return ruleResult;
    }

    // 2. Si no hay regla clara, decidir si usar AI
    const decision = await this.shouldUseClaude(message, context);

    console.log(`🤖 [HYBRID] Decision: ${decision.useClaude ? 'AI' : 'Rules'} (${decision.reason})`);

    if (decision.useClaude) {
      return await this.processWithClaude(message, context);
    } else {
      return await this.processWithRules(message, context);
    }
  }

  // 🧠 Procesar con AI (Gemini/Claude con historial)
  async processWithClaude(message, context) {
    const currentTime = new Date();
    const clinicInfo = await this.getClinicInfo(context.clinicId);
    const history = context.history || [];

    // Formatear historial para el prompt
    const formattedHistory = history.map(m => `${m.role === 'ana' ? 'Ana' : 'Usuario'}: ${m.text}`).join('\n');

    const prompt = `Eres Ana, asistente experta de ${clinicInfo.nombre}. 
Hora actual: ${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}.

HISTORIAL DE CONVERSACIÓN:
${formattedHistory || '(Sin mensajes previos)'}

MENSAJE ACTUAL DEL USUARIO: "${message}"

INSTRUCCIONES DE IDENTIDAD Y FLUJO:
1. IDENTIDAD: Soy Ana de ${clinicInfo.nombre}. Mi tono es cálido, profesional y directo.
2. NO REPETIR SALUDOS: Si en el historial ya has saludado, NO vuelvas a decir "Hola", "Soy Ana" o presentarte. Ve directamente al grano.
3. CONTEXTO Y CONFIRMACIÓN: Si el usuario confirma algo (ej: "si", "está bien", "por favor"), mira el historial. 
   - SI ESTÁS HABLANDO DE UNA CITA Y EL USUARIO ACEPTA: Debes dar los pasos de pago (Bizum al +34600123456 o Link de tarjeta).
   - SI EL USUARIO PIDE EL ENLACE: Confirma que se lo envías y dale los datos de pago.
4. REGLAS DE NEGOCIO:
   - Citas: Fianza de 15€.
   - Horarios: Solo ofrecer horas futuras.

Responde de forma natural y humana, evitando sonar como un bot repetitivo. Nunca respondas con un simple "¿En qué puedo ayudarte?" si ya hay una conversación en marcha.`;

    try {
      const response = await claudeService.generateResponse(prompt, { maxTokens: 1000 });
      return {
        source: 'ai',
        response: response,
        confidence: 'high'
      };
    } catch (error) {
      console.error('🔥 AI API Error:', error.message);
      throw new Error('Error en AI Service');
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

  // 🕐 Obtener horarios disponibles reales
  getAvailableSlots(currentTime) {
    const currentHour = currentTime.getHours();
    const slots = [];

    // Horarios de hoy (solo posteriores a la hora actual)
    if (currentHour < 11) slots.push('11:00');
    if (currentHour < 15) slots.push('15:00');
    if (currentHour < 17) slots.push('17:30');

    return slots.length > 0 ? slots.join(', ') : 'No hay más horarios hoy';
  }

  // ⚙️ Procesar con reglas (rápido y sin coste)
  async processWithRules(message, context) {
    const lowerMessage = message.toLowerCase();
    console.log(`🔍 [RULES] Evaluating message: "${lowerMessage}"`);

    // 🌸 REGLA DE BIENVENIDA EMPÁTICA (Tras registro)
    if (lowerMessage.includes('me llamo') && lowerMessage.includes('email')) {
      console.log('🌸 [RULES] Welcome rule MATCHED!');

      // 🌸 REGLA DE BIENVENIDA EMPÁTICA (Tras registro)
      if (lowerMessage.includes('me llamo') && lowerMessage.includes('email') && lowerMessage.includes('registra')) {
        const nameMatch = message.match(/me llamo ([^ y]+)/i);
        const userName = nameMatch ? nameMatch[1] : 'paciente';

        return {
          source: 'rules',
          response: `¡Hola ${userName}, qué alegría saludarte! 👋 
        
Ya he guardado tus datos correctamente en ${context.clinicName || 'la clínica'}. Soy Ana, tu asistente personal, y estoy aquí para que todo sea más fácil para ti.

🚀 **UN CONSEJO IMPORTANTE:**
Para que nunca te pierdas un aviso de cita, una alerta o un mensaje mío, te recomiendo mucho que te **instales nuestra App oficial** en tu móvil. 

Es muy sencillo:
1. 👇 Toca el botón azul **"📱 INSTALAR APP"** que verás aquí abajo.
2. Pulsa "Instalar" o "Añadir".
3. ¡Listo! Me tendrás siempre a mano en tu pantalla de inicio.

¿En qué puedo ayudarte hoy para empezar?`,
          confidence: 'high'
        };
      }

      // 💰 REGLA ORO: Confirmación de pago/enlace (Si el usuario acepta)
      if ((lowerMessage.includes('si') || lowerMessage.includes('claro') || lowerMessage.includes('vale') || lowerMessage.includes('por favor')) &&
        !lowerMessage.includes('no')) {

        const historyText = JSON.stringify(context.history || []).toLowerCase();
        if (historyText.includes('enlace') || historyText.includes('fianza') || historyText.includes('pago')) {
          return {
            source: 'rules',
            response: `¡Perfecto! Aquí tienes las opciones para formalizar la reserva de 15€:

📱 **Bizum:** Envía 15€ al +34600123456
💳 **Tarjeta:** Te envío el link de pago seguro en 1 minuto

📸 **IMPORTANTE:** Una vez pagado, envíame la captura por aquí para confirmar tu cita definitivamente.

Ana - Clínica Barcelona Prueba`,
            confidence: 'high'
          };
        }
      }

      // 📱 REGLA PLATA: Ayuda con instalación de app
      if (lowerMessage.includes('instalar') || lowerMessage.includes('app') || lowerMessage.includes('descargar') ||
        lowerMessage.includes('instalo') || lowerMessage.includes('como instalo')) {
        return {
          source: 'rules',
          response: `📱 **GUÍA DE INSTALACIÓN**

**Opción 1: Botón Azul (Recomendado)**
👇 Toca el botón "📱 INSTALAR APP" que está aquí abajo
Luego pulsa "Instalar" o "Añadir a pantalla de inicio"

**Opción 2: Manual**
📱 **Android:** Menú ⋮ > "Añadir a pantalla de inicio"
📱 **iPhone:** Icono compartir ⬆️ > "Añadir a pantalla de inicio"

**¿Por qué instalar?**
✅ Notificaciones instantáneas de citas
✅ Chat más rápido y fluido
✅ Acceso directo sin navegador
✅ Recordatorios automáticos

¿Necesitas ayuda con algún paso específico?`,
          confidence: 'high'
        };
      }

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

      // Detectar patrón "X:00? son las Y:ZZ" (MÁXIMA PRIORIDAD)
      if (lowerMessage.match(/^\d{1,2}:\d{2}\s*\?\s*son\s*las\s*\d{1,2}:\d{2}/i)) {
        const timeMatch = lowerMessage.match(/^\d{1,2}:\d{2}/);
        const timeToCheck = timeMatch ? timeMatch[0] : '11:00';

        return {
          source: 'rules',
          response: `¡Tienes toda la razón! Pido mil disculpas.

Son las ${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')} y ofrecerte una cita para las ${timeToCheck} no tiene sentido.

📅 **Horarios disponibles AHORA:**
- 15:00 (Disponible)
- 17:30 (Disponible)

¿Cuál de estos horarios te viene bien? Te ofrezco un 10% de descuento en la fianza por la molestia.

Ana - Clínica Barcelona Prueba`,
          confidence: 'high'
        };
      }

      // Detectar "cita no procede" o rechazo de hora
      if (lowerMessage.includes('cita no procede') || lowerMessage.includes('no procede') ||
        lowerMessage.includes('no me sirve') || lowerMessage.includes('no quiero')) {
        return {
          source: 'rules',
          response: `¡Entendido! Si la hora de 11:00 no te viene bien, te ofrezco estas alternativas:

📅 **Horarios disponibles hoy:**
- 15:00 (Disponible)
- 17:30 (Disponible)

📅 **Mañana:**
- 10:00 (Disponible)
- 12:00 (Disponible)

¿Cuál de estas opciones te gustaría reservar?`,
          confidence: 'high'
        };
      }

      // Detectar quejas sobre hora pasada (MÁXIMA PRIORIDAD sobre cita general)
      if ((lowerMessage.includes('ya son las') || lowerMessage.includes('hora pasada') ||
        lowerMessage.includes('como diantres') || lowerMessage.includes('mal configurada') ||
        lowerMessage.includes('si son las') || lowerMessage.includes('son ya las') ||
        lowerMessage.includes('y esta cita') || lowerMessage.includes('cita si son ya las')) &&
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


      // Detectar frustración por repetición
      if (lowerMessage.includes('otra vez') || lowerMessage.includes('de nuevo') ||
        lowerMessage.includes('otra vez') || lowerMessage.includes('repites')) {
        return {
          source: 'rules',
          response: `¡Entiendo tu frustración! Pido disculpas por repetirme.

Te ofrezco directamente los horarios disponibles:

📅 **Horarios de hoy:**
- 15:00 (Disponible)
- 17:30 (Disponible)

📅 **Mañana:**
- 10:00 (Disponible)
- 12:00 (Disponible)

¿Cuál de estos horarios te gustaría reservar? Te confirmo la cita al momento.

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
