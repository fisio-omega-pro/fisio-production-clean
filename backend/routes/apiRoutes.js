const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const clinicController = require('../controllers/clinicController');
const adminController = require('../controllers/adminController');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const { initEnv } = require('../config/env');

const ensureHandler = (fn, name) => {
  if (typeof fn === 'function') return fn;
  return (req, res) => res.status(501).json({ error: `Handler no disponible: ${name}` });
};

const requireOwner = (req, res, next) => {
  if (req.userRole === 'owner') return next();
  return res.status(403).json({ error: 'Acceso restringido' });
};

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
router.post('/admin/import-leads', requireFoundryKey, upload.single('file'), ensureHandler(adminController.importLeads, 'importLeads'));

// --- 🛡️ ZONA PRIVADA (TOKEN) ---
router.use(auth);

router.get('/dashboard/data', ensureHandler(clinicController.getDashboardData, 'getDashboardData'));
router.post('/dashboard/appointment', ensureHandler(clinicController.createAppointment, 'createAppointment'));
router.post('/dashboard/block-schedule', ensureHandler(clinicController.createBlock, 'createBlock'));
router.post('/dashboard/save-logo', requireOwner, ensureHandler(clinicController.saveLogo, 'saveLogo'));
router.post('/dashboard/save-cobros', requireOwner, ensureHandler(clinicController.saveCobrosConfig, 'saveCobrosConfig'));
router.post('/dashboard/save-suggestion', requireOwner, ensureHandler(adminController.saveSuggestion, 'saveSuggestion'));
router.post('/dashboard/update-settings', requireOwner, ensureHandler(adminController.updateSettings, 'updateSettings'));
router.post('/dashboard/add-sede', requireOwner, ensureHandler(clinicController.addSede, 'addSede'));
router.post('/dashboard/save-specialist', requireOwner, ensureHandler(clinicController.saveSpecialist, 'saveSpecialist'));
router.post('/dashboard/import-patients', requireOwner, ensureHandler(clinicController.importPatients, 'importPatients'));
router.post('/dashboard/activate-bonos', requireOwner, ensureHandler(clinicController.activateBonos, 'activateBonos'));
router.post('/dashboard/create-bono', requireOwner, ensureHandler(clinicController.createBono, 'createBono'));
router.post('/dashboard/launch-campaign', requireOwner, ensureHandler(clinicController.launchCampaign, 'launchCampaign'));
router.post('/dashboard/stripe-connect', requireOwner, ensureHandler(clinicController.startStripeConnect, 'startStripeConnect'));
router.post('/dashboard/stripe-verify', requireOwner, ensureHandler(clinicController.finalizeStripeConnect, 'finalizeStripeConnect'));
router.post('/dashboard/upgrade-plan', requireOwner, ensureHandler(clinicController.createUpgradeSession, 'createUpgradeSession'));
router.post('/dashboard/payment-verify', requireOwner, ensureHandler(clinicController.verifyPayment, 'verifyPayment'));
router.post('/chat/dashboard', ensureHandler(chatController.handleChat, 'handleChat'));

module.exports = router;
