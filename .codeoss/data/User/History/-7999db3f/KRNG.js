const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const crmService = require('../services/crmService');

// --- RUTAS PÚBLICAS ---
router.post('/register', clinicController.register);
router.get('/config/:clinicId', async (req, res, next) => {
  try {
    const clinica = await crmService.getClinicaByIdOrSlug(req.params.clinicId);
    if (!clinica) return res.status(404).json({ error: "Clínica no encontrada" });
    res.json({
      id: clinica.id,
      nombre_clinica: clinica.nombre_clinica,
      weekly_schedule: clinica.horario
    });
  } catch (e) { next(e); }
});

// --- RUTAS PRIVADAS (Requieren Token) ---
router.use(auth);

// Nueva ruta específica para el asistente del dashboard
router.post('/chat/dashboard', chatController.handleWebChat);

router.get('/dashboard/pacientes', clinicController.getPacientes);
router.get('/dashboard/balance', clinicController.getBalance);

module.exports = router;