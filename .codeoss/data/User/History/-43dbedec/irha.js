/**
 * 💬 CHAT CONTROLLER
 * Interfaz HTTP para hablar con Ana.
 */
const anaService = require('../services/anaService');

const handleChat = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    let clinicId = req.clinicId; // Si viene del dashboard (con token)
    let phone = "admin"; // Por defecto para el dashboard

    // Si es chat público (paciente), el ID viene en el body
    if (!clinicId && req.body.clinicId) {
      clinicId = req.body.clinicId;
      phone = req.body.phone || "anonimo";
    }

    if (!message) throw new Error("Mensaje vacío.");
    if (!clinicId) throw new Error("Clínica no identificada.");

    console.log(`🤖 [CHAT] Mensaje para clínica ${clinicId}`);

    const response = await anaService.procesarChat(
      clinicId, 
      phone, 
      message, 
      clinicId === req.clinicId ? 'dashboard' : 'web'
    );

    res.json(response);

  } catch (error) {
    next(error);
  }
};

module.exports = { handleChat };