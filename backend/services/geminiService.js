const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class GeminiService {
    async getApiKey() {
        // 1. Env Var
        const envKey = process.env.GOOGLE_AI_KEY;
        if (envKey) return envKey;

        // 2. Secret Manager
        try {
            const secretClient = new SecretManagerServiceClient();
            const projectId = process.env.PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || 'fisiotool-pro-2026';
            const name = `projects/${projectId}/secrets/GOOGLE_AI_KEY/versions/latest`;
            const [version] = await secretClient.accessSecretVersion({ name });
            return version.payload.data.toString().trim();
        } catch (error) {
            console.error('🔥 Gemini Key Error:', error.message);
            return '';
        }
    }

    async generateResponse(prompt, options = {}) {
        try {
            const apiKey = await this.getApiKey();
            if (!apiKey) throw new Error('No Google AI API Key');

            const { initEnv } = require('../config/env');
            const env = await initEnv();
            const modelName = env.GOOGLE_AI_MODEL || "gemini-2.0-flash-exp";
            const genAI = new GoogleGenerativeAI(apiKey);

            const modelConfig = { model: modelName };
            if (options.systemPrompt) {
                modelConfig.systemInstruction = options.systemPrompt;
            }

            const model = genAI.getGenerativeModel(modelConfig);

            // Soporte para historial conversacional
            if (options.conversationHistory && options.conversationHistory.length > 0) {
                const history = options.conversationHistory.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: String(msg.content) }]
                }));
                const chat = model.startChat({ history });
                const result = await chat.sendMessage(prompt);
                return result.response.text();
            }

            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error('🔥 Gemini Error:', error.message);
            throw error;
        }
    }
}

module.exports = new GeminiService();
