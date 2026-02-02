const { db, Timestamp } = require('../config/firebase');
const admin = require('firebase-admin');
const paymentService = require('../services/paymentService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Stripe = require('stripe');

// 🚨 FUNCIÓN CRÍTICA: BLINDAJE LEGAL (AUDIT LOG)
const createAuditLog = async (clinicId, userId, action, resourceId) => {
    try {
        await db.collection('audit_logs').add({
            clinicId,
            userId,
            action, // EJ: CREATE_PATIENT, VIEW_NOTE, DELETE_APPOINTMENT
            resourceId,
            timestamp: Timestamp.now()
        });
    } catch(e) {
        console.error("CRITICAL: Failed to create audit log.", e.message);
    }
};

// --- APLICACIÓN DE AUDITORÍA A FUNCIONES SENSIBLES ---

// 1. REGISTRO (Nueva Clínica)
const register = async (req, res, next) => {
  try {
    const d = req.body;
    const { initEnv } = require('../config/env');
    const env = await initEnv();
    const hash = await bcrypt.hash(d.password, 10);
    const plan = d.plan || 'pro';
    const now = Timestamp.now();
    const legalAccepted = !!d.aceptacion_legal;
    const ip = String((req.headers['x-forwarded-for'] || req.ip || '')).split(',')[0].trim();
    const userAgent = String(req.headers['user-agent'] || '');

    const ref = await db.collection('clinicas').add({
      nombre_clinica: d.nombre,
      email: d.email.toLowerCase().trim(),
      password: hash,
      plan,
      status: 'activo',
      subscription_active: false,
      is_blind: d.is_blind || false,
      config_ia: {
        precio: d.precio_sesion || 50,
        fianza: d.fianza || 15,
        acepta_bonos: !!d.acepta_bonos,
        modo_caza_activo: false
      },
      // Auditoría legal mínima
      legal: {
        aceptado: legalAccepted,
        fecha: now,
        ip,
        userAgent
      },
      created_at: now
    });
    // 🚨 LOG: Nueva entidad creada
    await createAuditLog(ref.id, ref.id, 'CREATE_CLINIC', ref.id);

    // 📄 Contrato + Email de bienvenida (best-effort, no bloquea registro)
    if (legalAccepted) {
      try {
        const { archiveContract, sendWelcomeEmail } = require('../services/contractService');
        const contract = await archiveContract({
          clinicId: ref.id,
          nombre_clinica: d.nombre,
          email: d.email.toLowerCase().trim(),
          plan,
          req
        });
        await sendWelcomeEmail({
          email: d.email.toLowerCase().trim(),
          nombre_clinica: d.nombre,
          contractNumber: contract.contractNumber
        });
        await createAuditLog(ref.id, ref.id, 'ACCEPT_TERMS_AND_CONTRACT', contract.id);
      } catch (e) {
        console.error('⚠️ [ONBOARDING] Error contrato/bienvenida:', e.message);
      }
    }

    const token = jwt.sign({ clinicId: ref.id }, env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, clinicId: ref.id });
  } catch (error) { next(error); }
};

// 1b. LOGIN (Acceso a Dashboard)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email y contraseña requeridos' });

    const { initEnv } = require('../config/env');
    const env = await initEnv();

    const snap = await db.collection('clinicas')
      .where('email', '==', String(email).toLowerCase().trim())
      .limit(1)
      .get();

    if (snap.empty) return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });

    const doc = snap.docs[0];
    const data = doc.data() || {};
    const ok = await bcrypt.compare(String(password), String(data.password || ''));
    if (!ok) return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });

    const token = jwt.sign({ clinicId: doc.id }, env.JWT_SECRET, { expiresIn: '30d' });
    return res.json({ success: true, token, clinicId: doc.id });
  } catch (error) { next(error); }
};

// 🔐 RECUPERACIÓN DE CONTRASEÑA (pública)
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const { createResetRequest, sendResetEmail } = require('../services/passwordResetService');
    const result = await createResetRequest(email);

    // Siempre devolvemos success true para no filtrar existencia de cuentas
    if (result.ok && result.token) {
      // Best effort: si falla el email, no revelamos información sensible
      try { await sendResetEmail(String(email || ''), result.token); } catch (_) {}
    }

    return res.json({ success: true });
  } catch (e) { next(e); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) return res.status(400).json({ success: false, error: 'Token y contraseña requeridos' });
    if (String(newPassword).length < 6) return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres' });

    const hash = await bcrypt.hash(String(newPassword), 10);
    const { consumeResetToken } = require('../services/passwordResetService');
    const result = await consumeResetToken(token, hash);
    if (!result.ok) return res.status(400).json({ success: false, error: result.error });
    return res.json({ success: true });
  } catch (e) { next(e); }
};

// 2. CREAR CITA
const createAppointment = async (req, res) => {
    try {
        const ref = await db.collection('citas').add({ ...req.body, clinic_id: req.clinicId });
        // 🚨 LOG: Creación de cita sensible
        await createAuditLog(req.clinicId, req.userId || req.clinicId, 'CREATE_APPOINTMENT', ref.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 3. GUARDAR NOTA DE PACIENTE (El punto más crítico para HIPAA)
const savePatientNote = async (req, res) => {
    try {
        // Lógica de guardado de nota (aquí iría el código real)
        // 🚨 LOG: Acceso y Modificación de Historial
        await createAuditLog(req.clinicId, req.userId || req.clinicId, 'MODIFY_PATIENT_RECORD', req.body.patientId);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 4. ACCESO AL DASHBOARD
const getDashboardData = async (req, res, next) => {
    try {
        // 🚨 LOG: Acceso al Dashboard
        await createAuditLog(req.clinicId, req.userId || req.clinicId, 'VIEW_DASHBOARD', req.clinicId);
        // ... (resto de la lógica de datos)
        const [clinicDoc, equipoSnap, pacientesSnap, citasSnap, bonosSnap] = await Promise.all([
          db.collection('clinicas').doc(req.clinicId).get(),
          db.collection('clinicas').doc(req.clinicId).collection('equipo').get(),
          db.collection('pacientes').where('clinic_id', '==', req.clinicId).get(),
          db.collection('citas').where('clinic_id', '==', req.clinicId).get(),
          db.collection('bonos').where('clinic_id', '==', req.clinicId).get()
        ]);
        // ... (retorno de datos)
        const data = clinicDoc.data();
        let equipo = equipoSnap.docs.map(d => ({id: d.id, ...d.data()}));
        if (equipo.length === 0) {
          equipo = [{ id: 'admin-lead', nombre: data.nombre_clinica, especialidad: 'Dirección', avatarUrl: data.logo_url, isOwner: true }];
        }
        res.json({ 
          success: true, 
          data: { 
            configStatus: { hasLogo: !!data.logo_url, hasStripe: data.stripe_status === 'active', hasSubscription: !!data.subscription_active },
            clinicData: { id: req.clinicId, ...data },
            equipo: equipo, pacientes: pacientesSnap.docs.map(d => ({id: d.id, ...d.data()})),
            agenda: citasSnap.docs.map(d => ({id: d.id, ...d.data()})),
            bonos: bonosSnap.docs.map(d => ({id: d.id, ...d.data()})),
            balance: { real: 0, potencial: 0, roi: 0, tendenciaMensual: 12 }
          } 
        });
    } catch (e) { next(e); }
};

// 🚨 EXPORTACIÓN DE FUNCIONES CONSOLIDADAS
module.exports = { 
  register, login, forgotPassword, resetPassword, getDashboardData, savePatientNote, createAppointment,
  saveLogo: async (req,res) => { await db.collection('clinicas').doc(req.clinicId).update({ logo_url: req.body.publicUrl }); res.json({success:true}); },
  saveCobrosConfig: async (req,res) => res.json({success:true}),
  addSede: async (req,res) => { res.json({success:true}); },
  saveSpecialist: async (req,res) => res.json({success:true}),
  importPatients: async (req,res) => res.json({success:true}),
  activateBonos: async (req,res) => res.json({success:true}),
  createBono: async (req,res) => res.json({success:true}),
  launchCampaign: async (req,res) => res.json({success:true}),
  startStripeConnect: async (req,res) => res.json({url:'#'}),
  finalizeStripeConnect: async (req,res) => res.json({success:true}),
  createUpgradeSession: async (req,res) => res.json({url:'#'}),
  verifyPayment: async (req,res) => res.json({success:true}),
  handleStripeWebhook: async (req,res) => res.json({received:true})
};
