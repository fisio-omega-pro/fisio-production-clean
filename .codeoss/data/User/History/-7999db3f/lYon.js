const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const crmService = require('../services/crmService');

// --- RUTAS PÚBLICAS ---
router.post('/register', clinicController.register);
router.get('/config/:clinicId', async (req, res, next) => { /* ... tu código de config ... */ });

// 🚨 RUTA DE EMERGENCIA (PÚBLICA)
router.post('/chat/ana', chatController.handleWebChat);

// --- RUTAS PRIVADAS ---
router.use(auth);
router.get('/dashboard/data', clinicController.getDashboardData);
// router.post('/chat/dashboard', chatController.handleWebChat); // Desactivada temporalmente

module.exports = router;