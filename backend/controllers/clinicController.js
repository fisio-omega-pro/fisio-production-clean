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
    const ref = await db.collection('clinicas').add({
      nombre_clinica: d.nombre, email: d.email.toLowerCase().trim(), password: hash, plan: 'pro', status: 'activo',
      subscription_active: false, is_blind: d.is_blind || false, config_ia: { precio: 50, fianza: 15, acepta_bonos: false, modo_caza_activo: false },
      created_at: Timestamp.now()
    });
    // 🚨 LOG: Nueva entidad creada
    await createAuditLog(ref.id, ref.id, 'CREATE_CLINIC', ref.id);
    
    // 📄 GENERAR CONTRATO Y ENVIAR EMAIL DE ONBOARDING
    try {
      const { createAndArchiveContract, sendOnboardingEmail } = require('../services/contractService');
      const userData = {
        nombre: d.nombre,
        email: d.email.toLowerCase().trim(),
        nombre_clinica: d.nombre,
        fecha: new Date().toISOString()
      };
      const { contractHTML } = await createAndArchiveContract(ref.id, userData);
      await sendOnboardingEmail(userData, contractHTML);
      console.log(`✅ Contrato y onboarding completados para ${userData.email}`);
    } catch (contractError) {
      console.error('⚠️ Error en generación de contrato, pero registro exitoso:', contractError.message);
      // No falla el registro si hay error en el contrato
    }
    
    const token = jwt.sign({ clinicId: ref.id }, env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, clinicId: ref.id });
  } catch (error) { next(error); }
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

// 🔐 RECUPERACIÓN DE CONTRASEÑA
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });
    
    const { sendPasswordResetEmail } = require('../services/passwordResetService');
    const result = await sendPasswordResetEmail(email);
    res.json(result);
  } catch (error) { next(error); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token y nueva contraseña requeridos' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    const { resetPasswordWithToken } = require('../services/passwordResetService');
    const result = await resetPasswordWithToken(token, newPassword);
    
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    
    res.json(result);
  } catch (error) { next(error); }
};

// 🚨 EXPORTACIÓN DE FUNCIONES CONSOLIDADAS
module.exports = { 
  register, getDashboardData, savePatientNote, createAppointment, forgotPassword, resetPassword,
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
