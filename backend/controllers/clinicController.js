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
        const d = req.body || {};
        const fecha = String(d.fecha || '').trim();
        const hora = String(d.hora || '').trim();
        if (!fecha || !hora) return res.status(400).json({ success: false, error: 'fecha y hora requeridos' });

        const payload = {
          clinic_id: req.clinicId,
          nombre: String(d.nombre || '').trim() || 'Paciente',
          telefono: String(d.telefono || '').trim() || '',
          email: String(d.email || '').trim() || '',
          fecha,
          hora,
          specialist_id: String(d.specialistId || d.docId || '').trim() || null,
          estado: String(d.estado || 'pendiente'),
          pagado: !!d.pagado,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        };

        const ref = await db.collection('citas').add(payload);
        // 🚨 LOG: Creación de cita sensible
        await createAuditLog(req.clinicId, req.userId || req.clinicId, 'CREATE_APPOINTMENT', ref.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 3. GUARDAR NOTA DE PACIENTE (El punto más crítico para HIPAA)
const savePatientNote = async (req, res) => {
    try {
        const body = req.body || {};
        const pid = String(body.patientId || body.p || '').trim();
        const text = String(body.content || body.c || '').trim();
        if (!pid || !text) return res.status(400).json({ success: false, error: 'patientId y content requeridos' });

        const patientRef = db.collection('pacientes').doc(pid);
        const patientDoc = await patientRef.get();
        if (!patientDoc.exists) return res.status(404).json({ success: false, error: 'Paciente no encontrado' });
        const pData = patientDoc.data() || {};
        if (String(pData.clinic_id || '') !== String(req.clinicId || '')) {
          return res.status(403).json({ success: false, error: 'No autorizado' });
        }

        await db.collection('pacientes').doc(pid).update({
          last_note: text,
          last_note_at: Timestamp.now(),
          updated_at: Timestamp.now()
        });

        await patientRef.collection('notas').add({
          clinic_id: req.clinicId,
          content: text,
          created_at: Timestamp.now()
        });

        // 🚨 LOG: Modificación de historial
        await createAuditLog(req.clinicId, req.userId || req.clinicId, 'MODIFY_PATIENT_RECORD', pid);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
};

// 3b. HISTORIAL CLÍNICO (para el modal de Agenda)
const getPatientHistory = async (req, res, next) => {
  try {
    const phone = String(req.query?.phone || '').trim();
    const patientId = String(req.query?.patientId || '').trim();

    let patientDoc = null;
    if (patientId) {
      const doc = await db.collection('pacientes').doc(patientId).get();
      if (doc.exists) patientDoc = doc;
    } else if (phone) {
      const snap = await db.collection('pacientes')
        .where('clinic_id', '==', req.clinicId)
        .where('telefono', '==', phone)
        .limit(1)
        .get();
      if (!snap.empty) patientDoc = snap.docs[0];
    } else {
      return res.status(400).json({ success: false, error: 'phone o patientId requeridos' });
    }

    if (!patientDoc || !patientDoc.exists) {
      return res.json({ success: true, paciente: null, historial: [] });
    }

    const paciente = { id: patientDoc.id, ...(patientDoc.data() || {}) };
    if (String(paciente.clinic_id || '') !== String(req.clinicId || '')) {
      return res.status(403).json({ success: false, error: 'No autorizado' });
    }

    const notasSnap = await db.collection('pacientes')
      .doc(patientDoc.id)
      .collection('notas')
      .orderBy('created_at', 'desc')
      .limit(20)
      .get();

    const historial = notasSnap.docs.map((d) => {
      const raw = d.data() || {};
      const ts = raw.created_at;
      const ms =
        ts && typeof ts.toMillis === 'function' ? ts.toMillis()
          : ts && ts._seconds ? ts._seconds * 1000
          : Date.now();
      return {
        id: d.id,
        fecha: ms,
        contenido: String(raw.content || '').trim(),
      };
    });

    return res.json({ success: true, paciente, historial });
  } catch (e) { next(e); }
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
        // 🔒 Nunca exponer hashes/credenciales al cliente
        // eslint-disable-next-line no-unused-vars
        const { password, ...safeClinic } = (data || {});
        res.json({ 
          success: true, 
          data: { 
            configStatus: { hasLogo: !!data.logo_url, hasStripe: data.stripe_status === 'active', hasSubscription: !!data.subscription_active },
            clinicData: { id: req.clinicId, ...safeClinic },
            equipo: equipo, pacientes: pacientesSnap.docs.map(d => ({id: d.id, ...d.data()})),
            agenda: citasSnap.docs.map(d => ({id: d.id, ...d.data()})),
            bonos: bonosSnap.docs.map(d => ({id: d.id, ...d.data()})),
            balance: { real: 0, potencial: 0, roi: 0, tendenciaMensual: 12 }
          } 
        });
    } catch (e) { next(e); }
};

// --- DASHBOARD: OPERACIONES REALES (sin stubs) ---
const saveLogo = async (req, res, next) => {
  try {
    const publicUrl = String(req.body?.publicUrl || '').trim();
    if (!publicUrl) return res.status(400).json({ success: false, error: 'publicUrl requerido' });
    await db.collection('clinicas').doc(req.clinicId).update({
      logo_url: publicUrl,
      logo_path: null,
      updated_at: Timestamp.now()
    });
    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'UPDATE_LOGO', req.clinicId);
    return res.json({ success: true });
  } catch (e) { next(e); }
};

const uploadLogo = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: 'logo requerido' });
    if (file.size > 2 * 1024 * 1024) return res.status(400).json({ success: false, error: 'Archivo demasiado pesado (máx 2MB)' });

    const allowed = new Set(['image/png', 'image/jpeg', 'image/webp']);
    const ct = String(file.mimetype || '').toLowerCase();
    if (!allowed.has(ct)) return res.status(400).json({ success: false, error: 'Formato no soportado (png/jpg/webp)' });

    const ext = ct === 'image/png' ? 'png' : ct === 'image/webp' ? 'webp' : 'jpg';
    const safeId = String(req.clinicId || '').replace(/[^a-zA-Z0-9_-]/g, '');
    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 10);
    const filename = `logos/${safeId}/${stamp}-${rand}.${ext}`;

    const { uploadBuffer } = require('../services/storageService');
    await uploadBuffer({
      filename,
      buffer: file.buffer,
      contentType: ct,
      cacheControl: 'public, max-age=3600'
    });

    const logoUrl = `/api/public/logo/${req.clinicId}`;
    await db.collection('clinicas').doc(req.clinicId).update({
      logo_path: filename,
      logo_url: logoUrl,
      updated_at: Timestamp.now()
    });
    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'UPLOAD_LOGO', filename);

    return res.json({ success: true, logo_url: logoUrl });
  } catch (e) { next(e); }
};

const saveCobrosConfig = async (req, res, next) => {
  try {
    const bizumNumber = String(req.body?.bizumNumber || '').trim();
    if (!bizumNumber) return res.status(400).json({ success: false, error: 'bizumNumber requerido' });
    await db.collection('clinicas').doc(req.clinicId).set({
      config_pagos: { bizum: bizumNumber },
      updated_at: Timestamp.now()
    }, { merge: true });
    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'UPDATE_PAYOUTS', req.clinicId);
    return res.json({ success: true });
  } catch (e) { next(e); }
};

const addSede = async (req, res, next) => {
  try {
    const sede = req.body?.sede || {};
    const sedeDoc = {
      nombre: String(sede.nombre || '').trim() || 'Sede',
      calle: String(sede.calle || '').trim(),
      numero: String(sede.numero || '').trim(),
      cp: String(sede.cp || '').trim(),
      ciudad: String(sede.ciudad || '').trim(),
      provincia: String(sede.provincia || '').trim(),
      principal: false,
      created_at: Timestamp.now()
    };
    await db.collection('clinicas').doc(req.clinicId).update({
      direcciones: admin.firestore.FieldValue.arrayUnion(sedeDoc),
      updated_at: Timestamp.now()
    });
    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'ADD_SEDE', req.clinicId);
    return res.json({ success: true });
  } catch (e) { next(e); }
};

const saveSpecialist = async (req, res, next) => {
  try {
    // Aceptar { specialist: {...} } (frontend) y formato plano (robustez)
    const specialist = req.body?.specialist || req.body || {};
    const id = String(specialist.id || '').trim();
    const payload = {
      nombre: String(specialist.nombre || '').trim(),
      especialidad: String(specialist.especialidad || '').trim(),
      avatarUrl: String(specialist.avatarUrl || '').trim() || null,
      isOwner: !!specialist.isOwner,
      updated_at: Timestamp.now()
    };
    if (!payload.nombre) return res.status(400).json({ success: false, error: 'nombre requerido' });

    const col = db.collection('clinicas').doc(req.clinicId).collection('equipo');
    if (id) await col.doc(id).set(payload, { merge: true });
    else await col.add({ ...payload, created_at: Timestamp.now() });

    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'UPSERT_SPECIALIST', id || 'new');
    return res.json({ success: true });
  } catch (e) { next(e); }
};

const importPatients = async (req, res, next) => {
  try {
    const patients = Array.isArray(req.body?.patients) ? req.body.patients : [];
    if (!Array.isArray(patients) || patients.length === 0) {
      return res.status(400).json({ success: false, error: 'patients[] requerido' });
    }

    let written = 0;
    // Firestore batch limit: 500
    for (let i = 0; i < patients.length; i += 400) {
      const chunk = patients.slice(i, i + 400);
      const batch = db.batch();
      chunk.forEach((p) => {
        const ref = db.collection('pacientes').doc();
        batch.set(ref, {
          clinic_id: req.clinicId,
          nombre: String(p.nombre || '').trim() || 'Paciente',
          telefono: String(p.telefono || '').trim() || '',
          email: String(p.email || '').trim() || '',
          dolencia: String(p.dolencia || '').trim() || 'Consulta inicial',
          status: String(p.status || 'ACTIVO'),
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        });
      });
      await batch.commit();
      written += chunk.length;
    }

    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'IMPORT_PATIENTS', String(written));
    return res.json({ success: true, count: written });
  } catch (e) { next(e); }
};

const activateBonos = async (req, res, next) => {
  try {
    await db.collection('clinicas').doc(req.clinicId).update({
      'config_ia.acepta_bonos': true,
      'config_ia.bonos_updated_at': Timestamp.now(),
      updated_at: Timestamp.now()
    });
    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'ACTIVATE_BONOS', req.clinicId);
    return res.json({ success: true });
  } catch (e) { next(e); }
};

const createBono = async (req, res, next) => {
  try {
    const bono = req.body?.bono || {};
    const pacienteNombre = String(bono.paciente_nombre || '').trim();
    const sesionesTotales = Number(bono.sesiones_totales || 0);
    const fechaVencimiento = String(bono.fecha_vencimiento || '').trim() || null;
    if (!pacienteNombre || !sesionesTotales) return res.status(400).json({ success: false, error: 'bono inválido' });
    const ref = await db.collection('bonos').add({
      clinic_id: req.clinicId,
      paciente_nombre: pacienteNombre,
      sesiones_totales: sesionesTotales,
      sesiones_restantes: sesionesTotales,
      fecha_vencimiento: fechaVencimiento,
      status: 'ACTIVO',
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'CREATE_BONO', ref.id);
    return res.json({ success: true, id: ref.id });
  } catch (e) { next(e); }
};

const launchCampaign = async (req, res, next) => {
  try {
    await db.collection('clinicas').doc(req.clinicId).update({
      'config_ia.modo_caza_activo': true,
      updated_at: Timestamp.now()
    });
    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'LAUNCH_CAMPAIGN', req.clinicId);
    return res.json({ success: true });
  } catch (e) { next(e); }
};

const startStripeConnect = async (req, res, next) => {
  try {
    const { initEnv } = require('../config/env');
    const env = await initEnv();
    const sk = String(env.STRIPE_SK || '').trim();
    if (!sk) return res.status(503).json({ success: false, error: 'Stripe no configurado' });
    if (!sk.startsWith('sk_')) return res.status(503).json({ success: false, error: 'Stripe mal configurado: STRIPE_SECRET_KEY debe empezar por sk_' });

    const clinicRef = db.collection('clinicas').doc(req.clinicId);
    const clinicDoc = await clinicRef.get();
    if (!clinicDoc.exists) return res.status(404).json({ success: false, error: 'Clínica no encontrada' });
    const clinic = clinicDoc.data() || {};
    const stripe = Stripe(sk);

    const frontendBase = String(process.env.FRONTEND_URL || 'https://www.fisiotool.com').replace(/\/+$/, '');

    let accountId = String(clinic.stripe_account_id || '').trim();
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: clinic.email,
        metadata: { clinic_id: req.clinicId },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        }
      });
      accountId = account.id;
      await clinicRef.update({ stripe_account_id: accountId, stripe_status: 'pending', updated_at: Timestamp.now() });
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${frontendBase}/dashboard?stripe=refresh`,
      return_url: `${frontendBase}/dashboard?stripe=return`,
      type: 'account_onboarding'
    });

    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'STRIPE_CONNECT_START', accountId);
    return res.json({ success: true, url: link.url });
  } catch (e) { next(e); }
};

const finalizeStripeConnect = async (req, res, next) => {
  try {
    const { initEnv } = require('../config/env');
    const env = await initEnv();
    const sk = String(env.STRIPE_SK || '').trim();
    if (!sk) return res.status(503).json({ success: false, error: 'Stripe no configurado' });
    if (!sk.startsWith('sk_')) return res.status(503).json({ success: false, error: 'Stripe mal configurado: STRIPE_SECRET_KEY debe empezar por sk_' });
    const stripe = Stripe(sk);

    const clinicRef = db.collection('clinicas').doc(req.clinicId);
    const clinicDoc = await clinicRef.get();
    if (!clinicDoc.exists) return res.status(404).json({ success: false, error: 'Clínica no encontrada' });
    const clinic = clinicDoc.data() || {};
    const accountId = String(clinic.stripe_account_id || '').trim();
    if (!accountId) return res.status(400).json({ success: false, error: 'Stripe no vinculado' });

    const account = await stripe.accounts.retrieve(accountId);
    const active = !!account.charges_enabled;
    await clinicRef.update({ stripe_status: active ? 'active' : 'pending', updated_at: Timestamp.now() });
    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'STRIPE_CONNECT_VERIFY', accountId);
    return res.json({ success: true, stripe_status: active ? 'active' : 'pending', charges_enabled: !!account.charges_enabled, details_submitted: !!account.details_submitted });
  } catch (e) { next(e); }
};

const createUpgradeSession = async (req, res, next) => {
  try {
    const clinicDoc = await db.collection('clinicas').doc(req.clinicId).get();
    if (!clinicDoc.exists) return res.status(404).json({ success: false, error: 'Clínica no encontrada' });
    const clinic = clinicDoc.data() || {};
    const plan = String(clinic.plan || 'solo');
    const { url } = await paymentService.createSubscriptionSession(req.clinicId, clinic.email, plan, req);
    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'STRIPE_UPGRADE_SESSION', plan);
    return res.json({ success: true, url });
  } catch (e) { next(e); }
};

const verifyPayment = async (req, res, next) => {
  try {
    const clinicRef = db.collection('clinicas').doc(req.clinicId);
    const clinicDoc = await clinicRef.get();
    const clinic = clinicDoc.data() || {};

    const sessionId = String(req.body?.sessionId || '').trim();
    if (!sessionId) {
      return res.json({ success: true, subscription_active: !!clinic.subscription_active });
    }

    const { initEnv } = require('../config/env');
    const env = await initEnv();
    const sk = String(env.STRIPE_SK || '').trim();
    if (!sk) return res.status(503).json({ success: false, error: 'Stripe no configurado' });
    if (!sk.startsWith('sk_')) return res.status(503).json({ success: false, error: 'Stripe mal configurado: STRIPE_SECRET_KEY debe empezar por sk_' });
    const stripe = Stripe(sk);

    // Verificación best-effort: si webhook tarda, esto sincroniza la suscripción
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const sessionClinicId = String(session?.metadata?.clinic_id || session?.client_reference_id || '').trim();
    if (sessionClinicId && sessionClinicId !== String(req.clinicId)) {
      return res.status(403).json({ success: false, error: 'Sesión no corresponde a esta clínica' });
    }
    const paid = String(session?.payment_status || '').toLowerCase() === 'paid' || String(session?.status || '').toLowerCase() === 'complete';

    if (paid) {
      await clinicRef.set({
        subscription_active: true,
        stripe_customer_id: session.customer || clinic.stripe_customer_id || null,
        stripe_subscription_id: session.subscription || clinic.stripe_subscription_id || null,
        updated_at: Timestamp.now()
      }, { merge: true });
      await createAuditLog(req.clinicId, req.userId || req.clinicId, 'STRIPE_VERIFY_PAYMENT', sessionId);
      return res.json({ success: true, subscription_active: true });
    }

    return res.json({ success: true, subscription_active: !!clinic.subscription_active });
  } catch (e) { next(e); }
};

const handleStripeWebhook = async (req, res, next) => {
  try {
    const { initEnv } = require('../config/env');
    const env = await initEnv();
    const sk = String(env.STRIPE_SK || '').trim();
    const whSecret = String(env.STRIPE_WEBHOOK_SECRET || '').trim();
    if (!sk || !whSecret) return res.status(503).send('stripe not configured');
    if (!sk.startsWith('sk_')) return res.status(503).send('stripe misconfigured: secret key must start with sk_');

    const stripe = Stripe(sk);
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, whSecret);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Deduplicación simple (idempotencia): evitamos re-procesar el mismo evento
    try {
      const eid = String(event.id || '').trim();
      if (eid) {
        const evRef = db.collection('stripe_events').doc(eid);
        const evDoc = await evRef.get();
        if (evDoc.exists) return res.json({ received: true, duplicate: true });
        await evRef.set({ created_at: Timestamp.now(), type: event.type });
      }
    } catch (_) {
      // best-effort
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const clinicId = String(session?.metadata?.clinic_id || '').trim();
      if (clinicId) {
        const updates = {
          subscription_active: true,
          stripe_customer_id: session.customer || null,
          stripe_subscription_id: session.subscription || null,
          stripe_subscription_status: 'active',
          updated_at: Timestamp.now()
        };
        await db.collection('clinicas').doc(clinicId).set(updates, { merge: true });
        await createAuditLog(clinicId, clinicId, 'STRIPE_CHECKOUT_COMPLETED', String(session.id || ''));
      }
    }

    // Si se cancela la suscripción (o se marca como incompleta), reflejarlo
    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const clinicId = String(sub?.metadata?.clinic_id || '').trim();
      if (clinicId) {
        const status = String(sub?.status || '').trim().toLowerCase();
        const active = status === 'active' || status === 'trialing';
        await db.collection('clinicas').doc(clinicId).set({
          subscription_active: active,
          stripe_subscription_status: status,
          stripe_subscription_id: sub?.id || null,
          updated_at: Timestamp.now()
        }, { merge: true });
        await createAuditLog(clinicId, clinicId, 'STRIPE_SUBSCRIPTION_STATUS', `${sub?.id || ''}:${status}`);
      }
    }

    // Aceptamos el evento
    return res.json({ received: true });
  } catch (e) { next(e); }
};

// 🚨 EXPORTACIÓN DE FUNCIONES CONSOLIDADAS
module.exports = { 
  register,
  login,
  forgotPassword,
  resetPassword,
  getDashboardData,
  savePatientNote,
  getPatientHistory,
  createAppointment,
  saveLogo,
  uploadLogo,
  saveCobrosConfig,
  addSede,
  saveSpecialist,
  importPatients,
  activateBonos,
  createBono,
  launchCampaign,
  startStripeConnect,
  finalizeStripeConnect,
  createUpgradeSession,
  verifyPayment,
  handleStripeWebhook
};
