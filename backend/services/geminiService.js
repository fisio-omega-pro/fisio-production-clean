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

    async generateResponse(prompt) {
        try {
            const apiKey = await this.getApiKey();
            if (!apiKey) throw new Error('No Google AI API Key');

            const genAI = new GoogleGenerativeAI(apiKey);
            const modelName = process.env.GOOGLE_AI_MODEL || "gemini-1.5-flash";
            const model = genAI.getGenerativeModel({ model: modelName });

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('🔥 Gemini Error:', error.message);
            throw error;
        }
    }
}

module.exports = new GeminiService();
