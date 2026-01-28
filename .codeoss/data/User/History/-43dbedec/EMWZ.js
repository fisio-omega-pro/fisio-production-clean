/**
 * 💬 CHAT CONTROLLER - MODO BYPASS
 * Gestiona la conexión de emergencia.
 */
const anaService = require('../services/anaService');

// El nombre de la función es CRÍTICO: handleWebChat
const handleWebChat = async (req, res, next) => {
  try {
    const { message } = req.body;
    
    // Si no hay mensaje, no molestamos a Ana
    if (!message) return res.status(400).json({ error: "Mensaje vacío