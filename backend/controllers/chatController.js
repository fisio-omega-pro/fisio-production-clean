const anaService = require('../services/anaService');

const handleChat = async (req, res, next) => {
  try {
    const agent = String(req.body?.agent || '').trim().toLowerCase();
    const message = req.body?.message || '';
    if (agent === 'lex') {
      const result = await anaService.consultLex(message);
      return res.json({ success: true, reply: result.reply });
    }
    // Extraer historial del frontend para contexto conversacional
    const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
    const conversationHistory = rawHistory
      .filter(m => m && m.role && m.content)
      .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.content) }))
      .slice(-12);
    const result = await anaService.processMessage(req.clinicId, message, conversationHistory);
    res.json({ success: true, reply: result.reply });
  } catch (error) { next(error); }
};

const handleWebChat = async (req, res, next) => {
  try {
    // La ruta de bypass de voz e invidentes
    const result = await anaService.processMessage(null, req.body.message);
    res.json({ success: true, reply: result.reply });
  } catch (error) { next(error); }
};

module.exports = { handleChat, handleWebChat };
