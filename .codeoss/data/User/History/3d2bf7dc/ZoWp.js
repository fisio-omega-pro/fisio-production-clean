/**
 * 💬 CHAT CONTROLLER
 * Gestiona la interacción con Ana (IA) desde la web.
 */

const anaService = require('../services/anaService');

const handleWebChat = async (req, res, next) => {
  try {
    const { clinicId } = req.params; // Viene de la URL /api/chat/:clinicId
    const { message, patient_tlf } = req.body;

    if (!message || !patient_tlf) {
      return res.status(400).json({ error: "Mensaje y teléfono requeridos." });
    }

    // Llamamos al cerebro
    const result = await anaService.processMessage(
      clinicId, 
      patient_tlf, 
      message, 
      'web' // Indicamos que el canal es WEB
    );

    res.json(result);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleWebChat
};