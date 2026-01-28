const anaService = require('../services/anaService');
const { db } = require('../config/firebase');

const handleWebChat = async (req, res, next) => {
  try {
    // El clinicId viene del TOKEN (req.clinicId), inyectado por el middleware 'auth'
    const clinicId = req.clinicId; 
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: "Mensaje vacío" });
    if (!clinicId) return res.status(401).json({ error: "No se identificó la clínica" });

    // Buscamos el email del admin para el registro del log
    const clinicDoc = await db.collection('clinicas').doc(clinicId).get();
    const adminEmail = clinicDoc.exists ? clinicDoc.data().email : "admin_dashboard";

    // Llamada al cerebro de Ana
    const result = await anaService.processMessage(clinicId, adminEmail, message, 'dashboard');

    res.json({
      success: true,
      reply: result.reply
    });

  } catch (error) {
    console.error("🔥 Error en Chat Controller:", error);
    next(error); // Esto envía el error al errorHandler.js
  }
};

module.exports = { handleWebChat };