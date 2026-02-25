const axios = require('axios');
const { initEnv } = require('../config/env');

const sendWhatsAppTemplate = async (to, templateName, variables) => {
  try {
    const env = await initEnv();
    const token = env.WHATSAPP_TOKEN;
    const phoneId = env.PHONE_NUMBER_ID;

    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    
    // Construimos los parámetros dinámicos según la nueva normativa de Meta
    const components = [{
      type: "body",
      parameters: variables.map(v => ({
        type: "text",
        text: v
      }))
    }];

    const data = {
      messaging_product: "whatsapp",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: { code: "es" },
        components: components
      }
    };

    const config = {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    };

    const response = await axios.post(url, data, config);
    console.log(`✅ [WHATSAPP] Plantilla ${templateName} enviada a ${to}`);
    return response.data;

  } catch (error) {
    console.error("🔥 [WHATSAPP ERROR]:", error.response ? error.response.data : error.message);
    throw error;
  }
};

module.exports = { sendWhatsAppTemplate };
