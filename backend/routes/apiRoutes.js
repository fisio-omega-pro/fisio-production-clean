const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const clinicController = require('../controllers/clinicController');
const adminController = require('../controllers/adminController');
const chatController = require('../controllers/chatController');
const publicController = require('../controllers/publicController');
const auth = require('../middleware/auth');
const { initEnv } = require('../config/env');

const requireFoundryKey = (req, res, next) => {
  initEnv()
    .then((env) => {
      const expectedRaw = String(env.ADMIN_FOUNDRY_KEY || '').trim();
      // Permitir rotación sin downtime: "NUEVA,ANTIGUA"
      const expectedKeys = expectedRaw
        .split(',')
        .map((s) => String(s || '').trim())
        .filter(Boolean);
      const provided = String(req.headers['x-foundry-key'] || '').trim();

      if (!provided) return res.status(401).json({ error: 'No autorizado' });
      const hasRealKeyConfigured = expectedKeys.length > 0;
      if (!hasRealKeyConfigured) return res.status(503).json({ error: 'Foundry no configurado' });
      if (!expectedKeys.includes(provided)) return res.status(401).json({ error: 'No autorizado' });
      return next();
    })
    .catch(next);
};

const ensureHandler = (fn, name) => {
  if (typeof fn === 'function') return fn;
  return (req, res) => res.status(501).json({ error: `Handler no disponible: ${name}` });
};

// --- 🔓 RUTAS PÚBLICAS ---
router.post('/login', ensureHandler(clinicController.login, 'login'));
router.post('/auth/forgot-password', ensureHandler(clinicController.forgotPassword, 'forgotPassword'));
router.post('/auth/reset-password', ensureHandler(clinicController.resetPassword, 'resetPassword'));
router.post('/register', ensureHandler(clinicController.register, 'register'));
router.post('/public/corporate-lead', ensureHandler(publicController.submitCorporateLead, 'submitCorporateLead'));
router.get('/public/logo/:clinicId', ensureHandler(publicController.getClinicLogo, 'getClinicLogo'));
// Stripe webhook (body RAW se configura en server.js antes de bodyParser.json)
router.post('/webhooks/stripe', ensureHandler(clinicController.handleStripeWebhook, 'handleStripeWebhook'));

// --- 🏛️ THE FOUNDRY (ADMIN) ---
router.get('/admin/stats-globales', requireFoundryKey, ensureHandler(adminController.getGlobalStats, 'getGlobalStats'));
router.post('/admin/chat-legal', requireFoundryKey, ensureHandler(adminController.handleAdminChat, 'handleAdminChat'));
router.get('/admin/ana-diagnose', requireFoundryKey, ensureHandler(adminController.diagnoseAna, 'diagnoseAna'));
router.post('/admin/save-alert', requireFoundryKey, ensureHandler(adminController.saveAlert, 'saveAlert'));
router.delete('/admin/delete-alert/:id', requireFoundryKey, ensureHandler(adminController.deleteAlert, 'deleteAlert'));

// 📧 ENDPOINTS DE EMAIL DE ANA
router.get('/admin/ana-inbox', requireFoundryKey, ensureHandler(adminController.getAnaInbox, 'getAnaInbox'));
router.post('/admin/send-prospect-email', requireFoundryKey, ensureHandler(adminController.sendProspectEmail, 'sendProspectEmail'));
router.post('/admin/trigger-email-check', requireFoundryKey, ensureHandler(adminController.triggerEmailCheck, 'triggerEmailCheck'));
router.post('/admin/run-caza-autopilot', requireFoundryKey, ensureHandler(adminController.runCazaAutopilotNow, 'runCazaAutopilotNow'));
router.post('/admin/run-recaptacion-autopilot', requireFoundryKey, ensureHandler(adminController.runRecaptacionAutopilotNow, 'runRecaptacionAutopilotNow'));
router.post('/admin/run-deposit-reminders', requireFoundryKey, ensureHandler(adminController.runDepositRemindersNow, 'runDepositRemindersNow'));
router.post('/admin/campaign', requireFoundryKey, ensureHandler(adminController.setCampaign, 'setCampaign'));
router.post('/admin/leads/:id/status', requireFoundryKey, ensureHandler(adminController.updateLeadStatus, 'updateLeadStatus'));
router.post('/admin/scan-invoice', requireFoundryKey, upload.single('invoice'), ensureHandler(adminController.processInvoice, 'processInvoice'));
router.get('/admin/expense-file/:id', requireFoundryKey, ensureHandler(adminController.getExpenseFile, 'getExpenseFile'));
router.post('/admin/import-leads', requireFoundryKey, upload.single('file'), ensureHandler(adminController.importLeads, 'importLeads'));
router.post('/admin/upload-contrato', requireFoundryKey, upload.single('contrato'), ensureHandler(adminController.uploadContrato, 'uploadContrato'));
router.get('/admin/contratos/:id', requireFoundryKey, ensureHandler(adminController.getContrato, 'getContrato'));

// --- 🛡️ ZONA PRIVADA (TOKEN) ---
router.use(auth);

router.get('/dashboard/data', ensureHandler(clinicController.getDashboardData, 'getDashboardData'));
router.get('/dashboard/patient-history', ensureHandler(clinicController.getPatientHistory, 'getPatientHistory'));
router.get('/dashboard/referrals', ensureHandler(clinicController.getReferrals, 'getReferrals'));
router.get('/dashboard/legal-status', ensureHandler(clinicController.getLegalStatus, 'getLegalStatus'));
router.post('/dashboard/save-logo', ensureHandler(clinicController.saveLogo, 'saveLogo'));
router.post('/dashboard/upload-logo', upload.single('logo'), ensureHandler(clinicController.uploadLogo, 'uploadLogo'));
router.post('/dashboard/save-cobros', ensureHandler(clinicController.saveCobrosConfig, 'saveCobrosConfig'));
router.post('/dashboard/appointment', ensureHandler(clinicController.createAppointment, 'createAppointment'));
router.post('/dashboard/save-note', ensureHandler(clinicController.savePatientNote, 'savePatientNote'));
router.post('/dashboard/save-suggestion', ensureHandler(adminController.saveSuggestion, 'saveSuggestion'));
router.post('/dashboard/create-ticket', ensureHandler(adminController.createTicket, 'createTicket'));
router.post('/dashboard/update-settings', ensureHandler(adminController.updateSettings, 'updateSettings'));
router.post('/dashboard/add-sede', ensureHandler(clinicController.addSede, 'addSede'));
router.post('/dashboard/save-specialist', ensureHandler(clinicController.saveSpecialist, 'saveSpecialist'));
router.post('/dashboard/import-patients', ensureHandler(clinicController.importPatients, 'importPatients'));
router.post('/dashboard/activate-bonos', ensureHandler(clinicController.activateBonos, 'activateBonos'));
router.post('/dashboard/deactivate-bonos', ensureHandler(clinicController.deactivateBonos, 'deactivateBonos'));
router.post('/dashboard/create-bono', ensureHandler(clinicController.createBono, 'createBono'));
router.post('/dashboard/launch-campaign', ensureHandler(clinicController.launchCampaign, 'launchCampaign'));
router.post('/dashboard/run-recaptacion', ensureHandler(clinicController.runRecaptacionNow, 'runRecaptacionNow'));
router.post('/dashboard/stripe-connect', ensureHandler(clinicController.startStripeConnect, 'startStripeConnect'));
router.post('/dashboard/stripe-verify', ensureHandler(clinicController.finalizeStripeConnect, 'finalizeStripeConnect'));
router.post('/dashboard/upgrade-plan', ensureHandler(clinicController.createUpgradeSession, 'createUpgradeSession'));
router.post('/dashboard/cancel-subscription', ensureHandler(clinicController.cancelSubscription, 'cancelSubscription'));
router.post('/dashboard/cobrar-cita-bono', ensureHandler(clinicController.createCitaBonoCheckout, 'createCitaBonoCheckout'));
router.post('/dashboard/payment-verify', ensureHandler(clinicController.verifyPayment, 'verifyPayment'));
router.post('/chat/dashboard', ensureHandler(chatController.handleChat, 'handleChat'));

module.exports = router;
