/**
 * 💬 CHAT CONTROLLER (FIXED)
 * Gestiona las peticiones del chat y conecta con el servicio de Ana.
 */
const anaService = require('../services/anaService');

// El nombre de la función debe ser EXACTAMENTE 'handleWebChat'
const handleWebChat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Mensaje vacío" });
    }

    console.log(`📡 [CHAT] Recibido: "${message}"`);

    // Llamamos al servicio de emergencia/bypass
    // Usamos IDs ficticios porque estamos en modo prueba de conexión
    const result = await anaService.processMessage(
      'emergency_id', 
      'test_user', 
      message, 
      'web'
    );

    res.json({
      success: true,
      reply: result.reply
    });

  } catch (error) {
    console.error("🔥 Error en Chat Controller:", error);
    next(error);
  }
};

// Exportamos con el nombre exacto que busca apiRoutes.js
module.exports = { handleWebChat };