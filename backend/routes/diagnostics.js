const express = require('express');
const router = express.Router();
const { initEnv } = require('../config/env');

// ✅ Health check seguro (sin info sensible)
router.get('/health', async (req, res) => {
  try {
    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      node_version: process.version,
      service: process.env.K_SERVICE || 'local'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
    });
  }
});

// 🔒 Diagnóstico extendido (requiere Foundry Key)
router.get('/env', async (req, res) => {
  try {
    const provided = String(req.headers['x-foundry-key'] || '').trim();
    const env = await initEnv();
    const expectedRaw = String(env.ADMIN_FOUNDRY_KEY || '').trim();
    const expectedKeys = expectedRaw
      .split(',')
      .map((s) => String(s || '').trim())
      .filter(Boolean);
    if (!expectedKeys.length) return res.status(503).json({ error: 'Foundry no configurado' });
    // Importante: /diagnostics/env NO acepta clave de emergencia, solo clave(s) real(es)
    if (!provided || !expectedKeys.includes(provided)) return res.status(401).json({ error: 'No autorizado' });

    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      node_version: process.version,
      env_check: {
        has_google_ai_key: !!env.GOOGLE_AI_KEY,
        has_google_ai_model: !!env.GOOGLE_AI_MODEL,
        has_jwt_secret: !!env.JWT_SECRET,
        has_foundry_key: !!env.ADMIN_FOUNDRY_KEY,
        has_ana_mail: !!env.ANA_MAIL?.user,
        has_info_mail: !!env.INFO_MAIL?.user
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

module.exports = router;
