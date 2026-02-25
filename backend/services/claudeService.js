const Anthropic = require('@anthropic-ai/sdk');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class ClaudeService {
  async getApiKey() {
    // PRIORIDAD 1: Environment variable (producción y desarrollo)
    const envKey = process.env.ANTHROPIC_API_KEY;
    if (envKey && envKey.trim()) {
      console.log('✅ Using ANTHROPIC_API_KEY from environment');
      return envKey.trim();
    }
    
    // PRIORIDAD 2: Secret Manager (solo si no hay env var)
    try {
      const secretClient = new SecretManagerServiceClient();
      const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'fisio-production';
      const name = `projects/${projectId}/secrets/ANTHROPIC_API_KEY/versions/latest`;
      
      const [version] = await secretClient.accessSecretVersion({ name });
      const payload = version.payload.data.toString();
      
      console.log('✅ Using ANTHROPIC_API_KEY from Secret Manager');
      return payload.trim();
    } catch (error) {
      console.error('🔥 Error getting Claude API key from Secret Manager:', error.message);
      return '';
    }
  }

  async generateResponse(prompt, options = {}) {
    try {
      const apiKey = await this.getApiKey();
      
      // MODO DESARROLLO: Si no hay API key real, simular respuesta
      if (!apiKey || apiKey.includes('test-key')) {
        console.log('🧪 Claude en modo desarrollo (simulado)');
        return this._simulateClaudeResponse(prompt);
      }
      
      const client = new Anthropic({ apiKey });
      
      const message = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: options.maxTokens || 1000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return message.content[0].text;
    } catch (error) {
      console.error('🔥 Claude API Error:', error.message);
      // Fallback a simulación si falla la API
      console.log('🧪 Claude fallback a modo simulado');
      return this._simulateClaudeResponse(prompt);
    }
  }

  _simulateClaudeResponse(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Simulación inteligente basada en el prompt
    if (lowerPrompt.includes('cita') || lowerPrompt.includes('necesito')) {
      return `¡Hola! Soy Ana de Fisiotool. Entiendo que necesitas una cita.

📅 **Disponibilidad:**
- **Hoy:** 11:00, 15:00, 17:30
- **Mañana:** 10:00, 12:00, 16:00

¿Qué día y hora te gustaría reservar? Puedo ayudarte a encontrar el momento perfecto para ti.

Ana - Clínica Barcelona Prueba`;
    }
    
    if (lowerPrompt.includes('hola') || lowerPrompt.includes('buenos')) {
      return `¡Hola! Soy Ana, tu asistente de Fisiotool. 

Estoy aquí para ayudarte con todo lo que necesites:
- Reservar citas
- Consultar disponibilidad
- Información sobre tratamientos
- Seguimiento de tu terapia

¿En qué puedo ayudarte hoy?

Ana - Clínica Barcelona Prueba`;
    }
    
    if (lowerPrompt.includes('gracias') || lowerPrompt.includes('adiós')) {
      return `¡De nada! Estoy aquí para lo que necesites.

Si necesitas cualquier otra cosa, no dudes en preguntarme. ¡Tu bienestar es mi prioridad!

Ana - Clínica Barcelona Prueba`;
    }
    
    // Respuesta por defecto inteligente
    return `Entiendo tu mensaje. Soy Ana, tu asistente de Fisiotool.

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
