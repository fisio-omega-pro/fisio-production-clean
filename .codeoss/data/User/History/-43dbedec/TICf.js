const anaService = require('../services/anaService');

const handleWebChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    // Si req.clinicId no existe (porque es ruta pública), usamos un ID de test
    const clinicId = req.clinicId || "public_test";
    const userEmail = "usuario_interactivo";

    if (!message) return res.status(400).json({ error: "Mensaje vacío" });

    console.log(`📡 [PROCESANDO CHAT] Mensaje: ${message.substring(0,20)}...`);

    const result = await anaService.processMessage(clinicId, userEmail, message, 'web');

    res.json({
      success: true,
      reply: result.reply
    });

  } catch (error) {
    console.error("🔥 FALLO EN CONTROLADOR CHAT:", error);
    // IMPORTANTE: Devolvemos JSON para que el frontend no lance "Failed to fetch"
    res.status(500).json({ success: false, reply: "Ana está reiniciando sus sistemas. Inténtalo de nuevo en 5 segundos." });
  }
};

module.exports = { handleWebChat };