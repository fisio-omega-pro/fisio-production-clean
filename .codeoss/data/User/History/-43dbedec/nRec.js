const anaService = require('../services/anaService');

const handleWebChat = async (req, res, next) => {
  try {
    // IMPORTANTE: Extraemos el clinicId que inyectó el middleware 'verifyToken'
    const clinicId = req.clinicId; 
    const { message } = req.body;

    if (!clinicId) return res.status(401).json({ error: "No identificado." });

    const result = await anaService.processMessage(
      clinicId, 
      "admin@fisiotool.com", // Teléfono ficticio para el admin
      message, 
      'dashboard'
    );

    res.json({ success: true, reply: result.reply });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleWebChat };