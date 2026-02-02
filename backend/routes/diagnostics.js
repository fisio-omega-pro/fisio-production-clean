const express = require('express');
const router = express.Router();
const { initEnv } = require('../config/env');

// Endpoint de diagnóstico (sin autenticación)
router.get('/health', async (req, res) => {
  try {
    const env = await initEnv();
    
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      node_version: process.version,
      env_check: {
        has_google_ai_key: !!env.GOOGLE_AI_KEY,
        has_jwt_secret: !!env.JWT_SECRET,
        has_foundry_key: !!env.ADMIN_FOUNDRY_KEY,
        foundry_key_length: env.ADMIN_FOUNDRY_KEY ? env.ADMIN_FOUNDRY_KEY.length : 0,
        has_ana_mail: !!env.ANA_MAIL?.user,
        has_info_mail: !!env.INFO_MAIL?.user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
