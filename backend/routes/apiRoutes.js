const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const clinicController = require('../controllers/clinicController');
const adminController = require('../controllers/adminController');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// --- 🔓 RUTAS PÚBLICAS ---
router.post('/chat/ana-test', chatController.handleWebChat);
router.post('/register', clinicController.register);
router.post('/webhooks/stripe', express.raw({type: 'application/json'}), clinicController.handleStripeWebhook);

// --- 🏛️ THE FOUNDRY (ADMIN) ---
router.get('/admin/stats-globales', adminController.getGlobalStats);
router.post('/admin/chat-legal', adminController.handleAdminChat);
router.post('/admin/save-alert', adminController.saveAlert);
router.delete('/admin/delete-alert/:id', adminController.deleteAlert);
router.post('/admin/scan-invoice', upload.single('invoice'), adminController.processInvoice);

// --- 🛡️ ZONA PRIVADA (TOKEN) ---
router.use(auth);

router.get('/dashboard/data', clinicController.getDashboardData);
router.post('/dashboard/save-logo', clinicController.saveLogo);
router.post('/dashboard/save-cobros', clinicController.saveCobrosConfig);
router.post('/dashboard/save-suggestion', adminController.saveSuggestion);
router.post('/dashboard/update-settings', adminController.updateSettings);
router.post('/dashboard/add-sede', clinicController.addSede);
router.post('/dashboard/save-specialist', clinicController.saveSpecialist);
router.post('/dashboard/import-patients', clinicController.importPatients);
router.post('/dashboard/activate-bonos', clinicController.activateBonos);
router.post('/dashboard/create-bono', clinicController.createBono);
router.post('/dashboard/launch-campaign', clinicController.launchCampaign);
router.post('/dashboard/stripe-connect', clinicController.startStripeConnect);
router.post('/dashboard/stripe-verify', clinicController.finalizeStripeConnect);
router.post('/dashboard/upgrade-plan', clinicController.createUpgradeSession);
router.post('/dashboard/payment-verify', clinicController.verifyPayment);
router.post('/chat/dashboard', chatController.handleChat);

module.exports = router;
