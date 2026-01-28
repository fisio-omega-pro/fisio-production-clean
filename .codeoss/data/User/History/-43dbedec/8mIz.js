/**
 * 💬 CHAT CONTROLLER v2.0 - MOTOR OMEGA
 * Gestiona la Consultoría Estratégica Ana 24/7 para el profesional.
 */
const anaService = require('../services/anaService');
const { db } = require('../config/firebase');

const handleWebChat = async (req, res, next) => {
  try {
    // 1. Extraer Identidad del Token JWT (Inyectado por middleware verifyToken)
    const { clinicId } = req; 
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "El mensaje está vacío." });
    }

    // 2. Recuperar Identidad del Administrador
    const clinicDoc = await db.collection('clinicas').doc(clinicId).get();
    if (!clinicDoc.exists) {
      return res.status(404).json({ error: "Clínica no encontrada en el sistema OMEGA." });
    }
    
    const clinicData = clinicDoc.data();
    const adminPhone = clinicData.email; // Identificador único para el log

    console.log(`🤖 [ANA ESTRATEGIA] Consultoría activa para: ${clinicData.nombre_clinica}`);

    // 3. Llamada al Cerebro (Modo Consultoría)
    const result = await anaService.processMessage(
      clinicId, 
      adminPhone, 
      message, 
      'dashboard_consulting' 
    );

    // 4. Respuesta Estructurada
    return res.status(200).json({
      success: true,
      reply: result.reply,
      ts: new Date().toISOString()
    });

  } catch (error) {
    console.error("🔥 [CHAT_CONTROLLER] Error fatal:", error.message);
    next(error); // Pasa al gestor de errores global
  }
};

module.exports = { handleWebChat };