const anaService = require('../services/anaService');

const handleChat = async (req, res, next) => {
  try {
    const agent = String(req.body?.agent || '').trim().toLowerCase();
    const message = String(req.body?.message || '').trim();

    if (!message) return res.status(400).json({ success: false, error: 'Mensaje requerido' });
    if (message.length > 1000) return res.status(400).json({ success: false, error: 'Mensaje demasiado largo (máx 1000 caracteres)' });

    if (agent === 'lex') {
      const result = await anaService.consultLex(message);
      return res.json({ success: true, reply: result.reply });
    }

    // Extraer y sanitizar historial del frontend (máx 12 turnos, 500 chars por mensaje)
    const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
    const conversationHistory = rawHistory
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && (m.content || m.text))
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content || m.text || '').trim().slice(0, 500)
      }))
      .filter(m => m.content.length > 0)
      .slice(-12);

    const result = await anaService.processMessage(req.clinicId, message, conversationHistory);
    res.json({ success: true, reply: result.reply });
  } catch (error) { next(error); }
};

const handleWebChat = async (req, res, next) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ success: false, error: 'Mensaje requerido' });
    if (message.length > 1000) return res.status(400).json({ success: false, error: 'Mensaje demasiado largo' });
    const result = await anaService.processMessage(null, message);
    res.json({ success: true, reply: result.reply });
  } catch (error) { next(error); }
};

module.exports = { handleChat, handleWebChat };
