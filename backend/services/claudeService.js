const Anthropic = require('@anthropic-ai/sdk');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class ClaudeService {
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
      return process.env.ANTHROPIC_API_KEY || '';
    }
  }

  async generateResponse(prompt, options = {}) {
    try {
      const apiKey = await this.getApiKey();
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
      throw new Error('Error en Claude API');
    }
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
