const Anthropic = require('@anthropic-ai/sdk');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const geminiService = require('./geminiService');

class ClaudeService {
  // ... (getApiKey remains the same)
  async getApiKey() {
    const envKey = process.env.ANTHROPIC_API_KEY;
    if (envKey && envKey.trim() && !envKey.includes('REEMPLAZA')) return envKey.trim();

    try {
      const secretClient = new SecretManagerServiceClient();
      const projectId = process.env.PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'fisiotool-pro-2026';
      const name = `projects/${projectId}/secrets/ANTHROPIC_API_KEY/versions/latest`;
      const [version] = await secretClient.accessSecretVersion({ name });
      const payload = version.payload.data.toString();
      return payload.trim();
    } catch (error) {
      return '';
    }
  }

  async generateResponse(prompt, options = {}) {
    try {
      const apiKey = await this.getApiKey();

      if (!apiKey || apiKey.length < 10) {
        console.log('🧪 No Claude Key. Using Gemini fallback.');
        return await geminiService.generateResponse(prompt);
      }

      console.log('🚀 Trying Claude API...');
      const client = new Anthropic({ apiKey });

      const message = await client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: options.maxTokens || 1000,
        messages: [{ role: "user", content: prompt }]
      });

      return message.content[0].text;
    } catch (error) {
      console.log('⚠️ Claude Failed. Using Gemini fallback. Error:', error.message);
      try {
        return await geminiService.generateResponse(prompt);
      } catch (geminiError) {
        console.error('🔥 All AI Engines failed:', geminiError.message);
        return this._simulateClaudeResponse(prompt);
      }
    }
  }

  _simulateClaudeResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();

    // Extraer mensaje del usuario del prompt
    console.log('🧠 [CLAUDE SIM] Prompt completo:', prompt);
    const userMessageMatch = prompt.match(/MENSAJE DEL USUARIO: "([^"]+)"/);
    console.log('🧠 [CLAUDE SIM] Match:', userMessageMatch);
    const userMessage = userMessageMatch ? userMessageMatch[1] : prompt;
    console.log('🧠 [CLAUDE SIM] UserMessage extraído:', userMessage);
    const lowerUserMessage = userMessage.toLowerCase();

    // Extraer hora actual del prompt
    const timeMatch = prompt.match(/Hora actual: (\d{1,2}):(\d{2})/);
    const currentHour = timeMatch ? parseInt(timeMatch[1]) : new Date().getHours();
    const currentMinute = timeMatch ? parseInt(timeMatch[2]) : new Date().getMinutes();
    console.log('🧠 [CLAUDE SIM] Hora actual:', `${currentHour}:${currentMinute}`);

    // Detectar preguntas sobre huso horario (MÁXIMA PRIORIDAD)
    if (lowerUserMessage.includes('huso horario') ||
      lowerUserMessage.includes('zona horaria') ||
      lowerUserMessage.includes('que hora es') ||
      lowerUserMessage.includes('son las') && lowerUserMessage.includes('españa')) {
      return `Trabajo con la hora local de España (Europa/Madrid). 

Actualmente son las ${currentHour}:${currentMinute.toString().padStart(2, '0')} hora española.

Mi sistema está configurado para usar siempre la hora de tu clínica en España para evitar confusiones con las citas.

¿Necesitas ayuda con algo específico?

Ana - Clínica Barcelona Prueba [OMEGA-V4]`;
    }

    // Detectar preguntas directas (ALTA PRIORIDAD)
    if (lowerUserMessage.includes('pregunta categorica') ||
      lowerUserMessage.includes('responde') ||
      lowerUserMessage.includes('pregunta directa') ||
      lowerUserMessage.includes('contesta') ||
      lowerUserMessage.includes('dime') && lowerUserMessage.includes('claro')) {
      return `Entiendo que necesito responder directamente a tu pregunta.

Soy Ana, asistente de Fisiotool, y estoy aquí para ayudarte con tus citas y necesidades de fisioterapia.

¿Cuál es tu pregunta específica? Te responderé de forma clara y directa.

Ana - Clínica Barcelona Prueba [OMEGA-V4]`;
    }

    // Detectar frustración o quejas (MÁXIMA PRIORIDAD)
    if (lowerUserMessage.includes('no me has respondido') ||
      lowerUserMessage.includes('respondido bien') ||
      lowerUserMessage.includes('imbecil') ||
      lowerUserMessage.includes('frustrado') ||
      lowerUserMessage.includes('no funciona') ||
      lowerUserMessage.includes('mal servicio') ||
      lowerUserMessage.includes('bot') ||
      lowerUserMessage.includes('estupido') ||
      lowerUserMessage.includes('no entiendes') ||
      lowerUserMessage.includes('no me entiendes')) {
      return `¡Entiendo tu frustración y te pido mil disculpas!

Soy Ana, y estoy aquí para ayudarte de verdad. Si no he respondido correctamente, es porque estoy aprendiendo a entender mejor tus necesidades.

¿Qué necesitas específicamente? Te ayudaré de inmediato con tu cita o cualquier otra cosa.

Ana - Clínica Barcelona Prueba [OMEGA-V4]`;
    }

    // Simulación inteligente basada en el mensaje del usuario
    if (lowerUserMessage.includes('cita') || lowerUserMessage.includes('necesito')) {
      return `¡Hola! Soy Ana de Fisiotool. Entiendo que necesitas una cita.

📅 **Disponibilidad:**
- **Hoy:** 11:00, 15:00, 17:30
- **Mañana:** 10:00, 12:00, 16:00

¿Qué día y hora te gustaría reservar? Puedo ayudarte a encontrar el momento perfecto para ti.

Ana - Clínica Barcelona Prueba [OMEGA-V4]`;
    }

    if (lowerUserMessage.includes('hola') || lowerUserMessage.includes('buenos')) {
      return `¡Hola! Soy Ana, tu asistente de Fisiotool. 

Estoy aquí para ayudarte con todo lo que necesites:
- Reservar citas
- Consultar disponibilidad
- Información sobre tratamientos
- Seguimiento de tu therapy

¿En qué puedo ayudarte hoy?

Ana - Clínica Barcelona Prueba [OMEGA-V4]`;
    }

    if (lowerUserMessage.includes('gracias') || lowerUserMessage.includes('adiós')) {
      return `¡De nada! Estoy aquí para lo que necesites.

Si necesitas cualquier otra cosa, no dudes en preguntarme. ¡Tu bienestar es mi prioridad!

Ana - Clínica Barcelona Prueba [OMEGA-V4]`;
    }


    // Detectar si menciona hora específica (más simple y efectivo)
    const userTimeMatch = lowerUserMessage.match(/(\d{1,2}):(\d{2})/) ||
      lowerUserMessage.match(/(\d{1,2})h/) ||
      lowerUserMessage.match(/a las\s+(\d{1,2})/);

    console.log('🧠 [CLAUDE SIM] Time match:', userTimeMatch);
    console.log('🧠 [CLAUDE SIM] Exclusiones:', {
      sonLas: lowerUserMessage.includes('son las'),
      husoHorario: lowerUserMessage.includes('huso horario'),
      zonaHoraria: lowerUserMessage.includes('zona horaria')
    });

    if (userTimeMatch &&
      !lowerUserMessage.includes('son las') &&
      !lowerUserMessage.includes('huso horario') &&
      !lowerUserMessage.includes('zona horaria')) {

      const hour = parseInt(userTimeMatch[1]);
      const minute = userTimeMatch[2] ? parseInt(userTimeMatch[2]) : 0;

      console.log('🧠 [CLAUDE SIM] Hora detectada:', hour, minute);
      console.log('🧠 [CLAUDE SIM] Hora actual:', currentHour, currentMinute);

      // Si es hora pasada
      if (hour < currentHour || (hour === currentHour && minute < currentMinute)) {
        return `¡Tienes toda la razón! Son las ${currentHour}:${currentMinute.toString().padStart(2, '0')} y la hora ${userTimeMatch[0]} ya pasó.

📅 **Horarios disponibles AHORA:**
- 15:00 (Disponible)
- 17:30 (Disponible)

¿Cuál de estos horarios te viene bien? Te ofrezco un 10% de descuento en la fianza por la molestia.

Ana - Clínica Barcelona Prueba [OMEGA-V4]`;
      }

      // Si es hora futura
      if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
        return `¡Perfecto! Tengo disponibilidad hoy a las ${userTimeMatch[0]}.

Para confirmar tu cita, necesito que pagues la fianza de 15€:

📱 **Bizum:** Envía 15€ al +34600123456
💳 **Tarjeta:** Te enviaré un enlace seguro para pagar

📸 **IMPORTANTE:** Después de pagar, envíame:
- Captura del Bizum ✅
- O email de confirmación de pago ✅

Una vez verificado el pago, tu cita quedará confirmada.

Ana - Clínica Barcelona Prueba [OMEGA-V4]`;
      }
    }

    // Si no es hora específica, respuesta contextual
    if (lowerUserMessage.includes('cita') || lowerUserMessage.includes('necesito')) {
      return `¡Hola! Soy Ana de Fisiotool. Entiendo que necesitas una cita.

📅 **Disponibilidad:**
- **Hoy:** 11:00, 15:00, 17:30
- **Mañana:** 10:00, 12:00, 16:00

¿Qué día y hora te gustaría reservar? Puedo ayudarte a encontrar el momento perfecto para ti.

Ana - Clínica Barcelona Prueba [OMEGA-V4]`;
    }

    return `Entiendo tu mensaje. Soy Ana tu asistente de Fisiotool.

Puedo ayudarte con:
- 📅 Reservar citas
- 💆 Información sobre tratamientos  
- 📋 Seguimiento de tu terapia
- 💳 Procesos de pago

¿Qué necesitas específicamente? Estoy aquí para ayudarte.

Ana - Clínica Barcelona Prueba`;
  }

  async generateConversationResponse(messages, options = {}) {
    try {
      const apiKey = await this.getApiKey();
      const client = new Anthropic({ apiKey });

      const message = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: options.maxTokens || 1000,
        messages: messages,
        temperature: 0.7
      });

      return message.content[0].text;
    } catch (error) {
      console.error('🔥 Claude Conversation Error:', error.message);
      throw new Error('Error en Claude conversación');
    }
  }
}

module.exports = new ClaudeService();
