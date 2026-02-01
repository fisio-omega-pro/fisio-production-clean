const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const clinicController = require('../controllers/clinicController');
const adminController = require('../controllers/adminController');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const { initEnv } = require('../config/env');

const requireFoundryKey = (req, res, next) => {
  initEnv()
    .then((env) => {
      const expected = (env.ADMIN_FOUNDRY_KEY || '').trim();
      const provided = String(req.headers['x-foundry-key'] || '').trim();
      if (!expected) return res.status(503).json({ error: 'Foundry no configurado' });
      if (!provided || provided !== expected) return res.status(401).json({ error: 'No autorizado' });
      return next();
    })
    .catch(next);
};

const ensureHandler = (fn, name) => {
  if (typeof fn === 'function') return fn;
  return (req, res) => res.status(501).json({ error: `Handler no disponible: ${name}` });
};

// --- 🔓 RUTAS PÚBLICAS ---
router.post('/chat/ana-test', ensureHandler(chatController.handleWebChat, 'handleWebChat'));
router.post('/register', ensureHandler(clinicController.register, 'register'));
router.post('/webhooks/stripe', express.raw({type: 'application/json'}), ensureHandler(clinicController.handleStripeWebhook, 'handleStripeWebhook'));

// --- 🏛️ THE FOUNDRY (ADMIN) ---
router.get('/admin/stats-globales', requireFoundryKey, ensureHandler(adminController.getGlobalStats, 'getGlobalStats'));
router.post('/admin/chat-legal', requireFoundryKey, ensureHandler(adminController.handleAdminChat, 'handleAdminChat'));
router.get('/admin/ana-diagnose', requireFoundryKey, ensureHandler(adminController.diagnoseAna, 'diagnoseAna'));
router.post('/admin/save-alert', requireFoundryKey, ensureHandler(adminController.saveAlert, 'saveAlert'));
router.delete('/admin/delete-alert/:id', requireFoundryKey, ensureHandler(adminController.deleteAlert, 'deleteAlert'));
router.post('/admin/scan-invoice', requireFoundryKey, upload.single('invoice'), ensureHandler(adminController.processInvoice, 'processInvoice'));

// --- 🛡️ ZONA PRIVADA (TOKEN) ---
router.use(auth);

router.get('/dashboard/data', ensureHandler(clinicController.getDashboardData, 'getDashboardData'));
router.post('/dashboard/save-logo', ensureHandler(clinicController.saveLogo, 'saveLogo'));
router.post('/dashboard/save-cobros', ensureHandler(clinicController.saveCobrosConfig, 'saveCobrosConfig'));
router.post('/dashboard/save-suggestion', ensureHandler(adminController.saveSuggestion, 'saveSuggestion'));
router.post('/dashboard/update-settings', ensureHandler(adminController.updateSettings, 'updateSettings'));
router.post('/dashboard/add-sede', ensureHandler(clinicController.addSede, 'addSede'));
router.post('/dashboard/save-specialist', ensureHandler(clinicController.saveSpecialist, 'saveSpecialist'));
router.post('/dashboard/import-patients', ensureHandler(clinicController.importPatients, 'importPatients'));
router.post('/dashboard/activate-bonos', ensureHandler(clinicController.activateBonos, 'activateBonos'));
router.post('/dashboard/create-bono', ensureHandler(clinicController.createBono, 'createBono'));
router.post('/dashboard/launch-campaign', ensureHandler(clinicController.launchCampaign, 'launchCampaign'));
router.post('/dashboard/stripe-connect', ensureHandler(clinicController.startStripeConnect, 'startStripeConnect'));
router.post('/dashboard/stripe-verify', ensureHandler(clinicController.finalizeStripeConnect, 'finalizeStripeConnect'));
router.post('/dashboard/upgrade-plan', ensureHandler(clinicController.createUpgradeSession, 'createUpgradeSession'));
router.post('/dashboard/payment-verify', ensureHandler(clinicController.verifyPayment, 'verifyPayment'));
router.post('/chat/dashboard', ensureHandler(chatController.handleChat, 'handleChat'));

module.exports = router;
