const anaService = require('../services/anaService');

const handleChat = async (req, res, next) => {
  try {
    const agent = String(req.body?.agent || '').trim().toLowerCase();
    const message = req.body?.message || '';
    if (agent === 'lex') {
      const result = await anaService.consultLex(message);
      return res.json({ success: true, reply: result.reply });
    }
    const result = await anaService.processMessage(req.clinicId, message);
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
