const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const clinicController = require('../controllers/clinicController');
const chatController = require('../controllers/chatController');

// --- 🔓 RUTAS PÚBLICAS (ACCESO LIBRE) ---
router.post('/register', clinicController.register); // Alta de clínica
router.post('/chat/public', chatController.handleChat); // Chat para pacientes (web pública)

// Ruta de diagnóstico (Vital para comprobar conexión)
router.get('/ping', (req, res) => res.json({ status: 'OK', engine: 'OMEGA' }));

// --- 🔒 RUTAS PRIVADAS (REQUIEREN TOKEN) ---
router.use(auth); // El portero entra en acción aquí

// Chat del Dashboard (Contexto Admin)
router.post('/chat/dashboard', chatController.handleChat);

// Datos del Dashboard
router.get('/dashboard/data', clinicController.getDashboardData);

module.exports = router;