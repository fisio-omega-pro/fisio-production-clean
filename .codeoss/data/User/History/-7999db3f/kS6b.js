const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const crmService = require('../services/crmService');

// === RUTAS PÚBLICAS ===
router.post('/register', clinicController.register);
router.get('/config/:clinicId', async (req, res, next) => {
  try {
    const clinica = await crmService.getClinicaByIdOrSlug(req.params.clinicId);
    if (!clinica) return res.status(404).json({ error: "Clínica no encontrada" });
    res.json({
      id: clinica.id,
      nombre_clinica: clinica.nombre_clinica,
      weekly_schedule: clinica.weekly_schedule
    });
  } catch (e) { next(e); }
});

// === RUTAS PROTEGIDAS (JWT) ===
router.use(auth); // A partir de aquí, el portero verifica el token

// 🚨 CORRECCIÓN AQUÍ: Ruta específica para el chat del dashboard
router.post('/chat/dashboard', chatController.handleWebChat); 

router.get('/dashboard/pacientes', clinicController.getPacientes);
router.get('/dashboard/equipo', clinicController.getEquipo);
router.get('/dashboard/balance', clinicController.getBalance);

module.exports = router;