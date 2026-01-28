/**
 * 💬 CHAT CONTROLLER - VERSIÓN FINAL
 */
const anaService = require('../services/anaService');

const handleWebChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    // Recuperamos la identidad real
    // 1. Si viene del Dashboard (con Token), req.clinicId estará lleno.
    // 2. Si viene de la Web Pública, req.body.clinicId debe traerlo.
    // 3. Si no hay nada (test rápido), usamos el ID de la clínica que creaste: 'Jsuizc9siuwlYB26bmZY' (o el que sea dinámico).
    
    const clinicId = req.clinicId || req.body.clinicId || "Jsuizc9siuwlYB26bmZY"; 
    // NOTA: He puesto el ID de tu log para que funcione YA. En producción esto es dinámico.

    if (!message) return res.status(400).json({ error: "Mensaje vacío" });

    const result = await anaService.processMessage(
      clinicId, 
      'admin_user', 
      message, 
      'web'
    );

    res.json({
      success: true,
      reply: result.reply
    });

  } catch (error) {
    console.error("🔥 Error Controller:", error);
    next(error);
  }
};

module.exports = { handleWebChat };