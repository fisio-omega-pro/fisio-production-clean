const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const clinicController = require('../controllers/clinicController');
const adminController = require('../controllers/adminController');
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');
const { initEnv } = require('../config/env');

const requireOwner = (req, res, next) => {
  if (req.userRole === 'owner') return next();
  return res.status(403).json({ error: 'Acceso restringido' });
};

const requireFoundryKey = (req, res, next) => {
  initEnv()
    .then((env) => {
      const expected = env.ADMIN_FOUNDRY_KEY;
      const provided = req.headers['x-foundry-key'];
      if (!expected) {
        return res.status(503).json({ error: 'Foundry no configurado' });
      }
      if (!provided || provided !== expected) {
        return res.status(401).json({ error: 'Acceso Foundry denegado' });
      }
      return next();
    })
    .catch(next);
};

// --- 🔓 RUTAS PÚBLICAS ---
router.post('/chat/ana-test', chatController.handleWebChat);
router.post('/register', clinicController.register);
router.post('/login', clinicController.login);
router.post('/webhooks/stripe', express.raw({type: 'application/json'}), clinicController.handleStripeWebhook);

// --- 🏛️ THE FOUNDRY (ADMIN) ---
router.get('/admin/stats-globales', requireFoundryKey, adminController.getGlobalStats);
router.post('/admin/chat-legal', requireFoundryKey, adminController.handleAdminChat);
router.get('/admin/ana-diagnose', requireFoundryKey, adminController.diagnoseAna);
router.post('/admin/save-alert', requireFoundryKey, adminController.saveAlert);
router.delete('/admin/delete-alert/:id', requireFoundryKey, adminController.deleteAlert);
router.post('/admin/scan-invoice', requireFoundryKey, upload.single('invoice'), adminController.processInvoice);
router.post('/admin/import-leads', requireFoundryKey, upload.single('file'), adminController.importLeads);

// --- 🛡️ ZONA PRIVADA (TOKEN) ---
router.use(auth);

router.get('/dashboard/data', clinicController.getDashboardData);
router.post('/dashboard/appointment', clinicController.createAppointment);
router.post('/dashboard/block-schedule', clinicController.createBlock);
router.post('/dashboard/save-logo', requireOwner, clinicController.saveLogo);
router.post('/dashboard/save-cobros', requireOwner, clinicController.saveCobrosConfig);
router.post('/dashboard/save-suggestion', requireOwner, adminController.saveSuggestion);
router.post('/dashboard/update-settings', requireOwner, adminController.updateSettings);
router.post('/dashboard/add-sede', requireOwner, clinicController.addSede);
router.post('/dashboard/save-specialist', requireOwner, clinicController.saveSpecialist);
router.post('/dashboard/import-patients', requireOwner, clinicController.importPatients);
router.post('/dashboard/activate-bonos', requireOwner, clinicController.activateBonos);
router.post('/dashboard/create-bono', requireOwner, clinicController.createBono);
router.post('/dashboard/launch-campaign', requireOwner, clinicController.launchCampaign);
router.post('/dashboard/stripe-connect', requireOwner, clinicController.startStripeConnect);
router.post('/dashboard/stripe-verify', requireOwner, clinicController.finalizeStripeConnect);
router.post('/dashboard/upgrade-plan', requireOwner, clinicController.createUpgradeSession);
router.post('/dashboard/payment-verify', requireOwner, clinicController.verifyPayment);
router.post('/chat/dashboard', requireOwner, chatController.handleChat);

module.exports = router;
