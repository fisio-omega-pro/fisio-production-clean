/**
 * 💬 CHAT CONTROLLER v2.0 - MOTOR OMEGA
 * Gestiona la Consultoría Estratégica Ana 24/7 para el profesional.
 */

const anaService = require('../services/anaService');
const { db } = require('../config/firebase');

const handleWebChat = async (req, res, next) => {
  try {
    // 1. Extraer Identidad (inyectada por el middleware verifyToken)
    const { clinicId } = req; 
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "El mensaje está vacío." });
    }

    // 2. Recuperar Teléfono del Admin (para el log de CRM)
    // Buscamos los datos del dueño de la clínica
    const clinicDoc = await db.collection('clinicas').doc(clinicId).get();
    if (!clinicDoc.exists) return res.status(404).json({ error: "Clínica no encontrada." });
    
    const adminPhone = clinicDoc.data().email; // Usamos email como ID si no hay tlf admin

    console.log(`🤖 [ANA CONSULTING] Procesando solicitud para clínica: ${clinicId}`);

    // 3. Llamada al Cerebro (Modo 'consultoria')
    // Le pasamos el clinicId para que Ana tenga el contexto de SU clínica
    const result = await anaService.processMessage(
      clinicId, 
      adminPhone, 
      message, 
      'dashboard_consulting' 
    );

    // 4. Respuesta al Frontend
    res.json({
      success: true,
      reply: result.reply,
      ts: new Date().toISOString()
    });

  } catch (error) {
    console.error("🔥 [CHAT_CONTROLLER] Error en el flujo de consulta:", error);
    next(error);
  }
};

module.exports = {
  handleWebChat
};