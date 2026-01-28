const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const crmService = require('../services/crmService');

// ==========================================
// 🔓 RUTAS PÚBLICAS
// ==========================================

router.post('/register', clinicController.register);

// Configuración pública para la Landing/App de reserva
router.get('/config/:clinicId', async (req, res, next) => {
  try {
    const clinica = await crmService.getClinicaByIdOrSlug(req.params.clinicId);
    if (!clinica) return res.status(404).json({ error: "Clínica no encontrada" });
    res.json({
      id: clinica.id,
      nombre: clinica.nombre_clinica,
      horario: clinica.horario,
      config: clinica.config_ia
    });
  } catch (e) { next(e); }
});

// ==========================================
// 🔒 RUTAS PRIVADAS (DASHBOARD)
// ==========================================
router.use(auth); // A partir de aquí todo requiere Token

router.get('/dashboard/pacientes', clinicController.getPacientes);
router.get('/dashboard/equipo', clinicController.getEquipo);
router.get('/dashboard/balance', clinicController.getBalance);

// Esta es la ruta que llama el AsistenteView.tsx del Dashboard
router.post('/chat/dashboard', chatController.handleWebChat);

module.exports = router;