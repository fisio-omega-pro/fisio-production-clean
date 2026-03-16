const Anthropic = require('@anthropic-ai/sdk');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const geminiService = require('./geminiService');

class ClaudeService {
  async getApiKey() {
    const envKey = process.env.ANTHROPIC_API_KEY;
    if (envKey && envKey.trim() && !envKey.includes('REEMPLAZA')) return envKey.trim();
    try {
      const secretClient = new SecretManagerServiceClient();
      const projectId = process.env.PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'fisiotool-pro-2026';
      const name = `projects/${projectId}/secrets/ANTHROPIC_API_KEY/versions/latest`;
      const [version] = await secretClient.accessSecretVersion({ name });
      return version.payload.data.toString().trim();
    } catch (error) {
      return '';
    }
  }

  /**
   * Genera una respuesta de Claude con soporte completo para:
   * - options.systemPrompt: string - System prompt separado (Anthropic API)
   * - options.conversationHistory: array - [{role: 'user'|'assistant', content: string}]
   * - options.maxTokens: number
   * - options.temperature: number (0-1)
   */
  async generateResponse(prompt, options = {}) {
    try {
      const apiKey = await this.getApiKey();

      if (!apiKey || apiKey.length < 10) {
        console.log('🧪 No Claude Key. Using Gemini fallback.');
        return await geminiService.generateResponse(prompt, {
          systemPrompt: options.systemPrompt,
          conversationHistory: options.conversationHistory
        });
      }

      console.log('🚀 Trying Claude API...');
      const client = new Anthropic({ apiKey });

      // Construir array de mensajes con historial conversacional
      const messages = [];
      if (options.conversationHistory && options.conversationHistory.length > 0) {
        for (const msg of options.conversationHistory) {
          if (msg.role && msg.content) {
            messages.push({ role: msg.role, content: String(msg.content) });
          }
        }
      }
      messages.push({ role: 'user', content: prompt });

      const createParams = {
        model: 'claude-3-5-haiku-20241022',
        max_tokens: options.maxTokens || 1000,
        messages
      };

      // System prompt como campo separado (requerido por Anthropic API)
      if (options.systemPrompt) {
        createParams.system = options.systemPrompt;
      }

      const message = await client.messages.create(createParams);
      return message.content[0].text;

    } catch (error) {
      console.log('⚠️ Claude Failed. Using Gemini fallback. Error:', error.message);
      try {
        return await geminiService.generateResponse(prompt, {
          systemPrompt: options.systemPrompt,
          conversationHistory: options.conversationHistory
        });
      } catch (geminiError) {
        console.error('🔥 All AI Engines failed:', geminiError.message);
        return this._emergencyFallback(prompt, options);
      }
    }
  }

  /**
   * Respuesta de emergencia cuando Claude y Gemini fallan.
   * Usa el systemPrompt para extraer contexto y devolver algo útil.
   */
  _emergencyFallback(prompt, options = {}) {
    const lowerPrompt = (prompt || '').toLowerCase();
    const systemCtx = options.systemPrompt || '';

    // Extraer nombre del asistente y clínica del system prompt
    const anaMatch = systemCtx.match(/^Eres\s+(\w+),/m);
    const anaName = anaMatch ? anaMatch[1] : 'Ana';
    const clinicMatch = systemCtx.match(/(?:asistente IA de|de)\s+([^.]+)\./);
    const clinicName = clinicMatch ? clinicMatch[1].trim() : 'la clínica';

    if (lowerPrompt.includes('hola') || lowerPrompt.includes('buenos') || lowerPrompt.includes('buenas')) {
      return `Hola, soy ${anaName} de ${clinicName}. ¿En qué puedo ayudarte?`;
    }
    if (lowerPrompt.includes('cita') || lowerPrompt.includes('reservar') || lowerPrompt.includes('disponibilidad')) {
      return `Puedo ayudarte con tu cita. ¿Para qué día y hora la necesitas?`;
    }
    if (lowerPrompt.includes('precio') || lowerPrompt.includes('cuánto') || lowerPrompt.includes('coste')) {
      return `Para información detallada sobre precios, contacta directamente con ${clinicName}.`;
    }
    if (lowerPrompt.includes('gracias')) {
      return `De nada. Aquí estoy si necesitas algo más.`;
    }
    return `Estoy teniendo dificultades técnicas momentáneas. Por favor, inténtalo de nuevo en unos minutos.`;
  }

  /**
   * Para conversaciones estructuradas multi-turno (usa claude-3-5-sonnet para mayor calidad)
   */
  async generateConversationResponse(messages, options = {}) {
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey || apiKey.length < 10) {
        throw new Error('No Claude key');
      }
      const client = new Anthropic({ apiKey });

      const createParams = {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: options.maxTokens || 1000,
        messages
      };
      if (options.systemPrompt) {
        createParams.system = options.systemPrompt;
      }

      const message = await client.messages.create(createParams);
      return message.content[0].text;
    } catch (error) {
      console.error('🔥 Claude Conversation Error:', error.message);
      throw new Error('Error en Claude conversación');
    }
  }
}

module.exports = new ClaudeService();
