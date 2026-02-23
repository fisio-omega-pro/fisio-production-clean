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

const { validatePasswordStrength } = require('../utils/security');

// 1. REGISTRO (Nueva Clínica)
const register = async (req, res, next) => {
  try {
    const d = req.body;
    const pwCheck = validatePasswordStrength(d.password);
    if (!pwCheck.ok) return res.status(400).json({ success: false, error: pwCheck.error });
    const { initEnv } = require('../config/env');
    const env = await initEnv();
    const hash = await bcrypt.hash(d.password, 10);
    const plan = d.plan || 'pro';
    const now = Timestamp.now();
    const legalAccepted = !!d.aceptacion_legal;
    const timezone = String(d.timezone || d.tz || 'Europe/Brussels').trim() || 'Europe/Brussels';
    const referralCodeInput = String(d.referral_code || d.referralCode || d.ref || '').trim().toUpperCase();
    const ip = String((req.headers['x-forwarded-for'] || req.ip || '')).split(',')[0].trim();
    const userAgent = String(req.headers['user-agent'] || '');

    const genReferralCode = () => Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
    let referral_code = '';
    for (let i = 0; i < 6; i++) {
      const candidate = genReferralCode();
      // best-effort: evitar colisiones
      const exists = await db.collection('clinicas').where('referral_code', '==', candidate).limit(1).get();
      if (exists.empty) { referral_code = candidate; break; }
    }
    if (!referral_code) referral_code = genReferralCode();

    // Resolver referidor (si viene código)
    let referred_by_clinic_id = null;
    let referred_by_code = null;
    if (referralCodeInput) {
      const refSnap = await db.collection('clinicas').where('referral_code', '==', referralCodeInput).limit(1).get();
      if (!refSnap.empty) {
        referred_by_clinic_id = refSnap.docs[0].id;
        referred_by_code = referralCodeInput;
      }
    }

    const telefono = String(d.telefono || '').trim();
    const prefijo_telefono = String(d.prefijo_telefono || '+34').trim();

    const ref = await db.collection('clinicas').add({
      nombre_clinica: d.nombre,
      email: d.email.toLowerCase().trim(),
      password: hash,
      plan,
      status: 'activo',
      subscription_active: false,
      is_blind: d.is_blind || false,
      timezone,
      telefono: telefono ? `${prefijo_telefono}${telefono}` : '',
      prefijo_telefono,
      referral_code,
      referred_by_clinic_id,
      referred_by_code,
      referred_at: referred_by_clinic_id ? now : null,
      config_ia: {
        precio: d.precio_sesion || 50,
        fianza: d.fianza || 15,
        acepta_bonos: !!d.acepta_bonos,
        precio_bono_5: Number(d.precio_bono_5) || 225,
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

    // 📈 Best-effort: incrementar contador del referidor
    if (referred_by_clinic_id) {
      try {
        await db.collection('clinicas').doc(referred_by_clinic_id).set({
          referrals_count: admin.firestore.FieldValue.increment(1),
          referrals_last_at: now,
        }, { merge: true });
        await createAuditLog(referred_by_clinic_id, referred_by_clinic_id, 'REFERRAL_NEW_SIGNUP', ref.id);
      } catch (_) {}
    }

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

    // Tras aceptar términos: Stripe checkout.
    // Primeros 50 → trial 30 días (0€ hoy, tarjeta capturada, cobra mes 2).
    // A partir del 51 → cobro inmediato 100€/mes.
    // Referidos → cupón 50% independientemente.
    let payment_url = null;
    let payment_error = null;
    try {
      const paymentService = require('../services/paymentService');
      const regPlan = String(d.plan || 'solo').trim().toLowerCase() || 'solo';
      let referrerStripeCustomerId = null;
      if (referred_by_clinic_id) {
        const refClinic = await db.collection('clinicas').doc(referred_by_clinic_id).get();
        if (refClinic.exists) referrerStripeCustomerId = (refClinic.data() || {}).stripe_customer_id || null;
      }
      const countSnap = await db.collection('clinicas').count().get();
      const totalClinics = (typeof countSnap.data === 'function' ? countSnap.data() : {})?.count ?? 0;
      const trialCap = Number((await initEnv()).FREE_TRIAL_CAP) || 50;
      const allowTrial = totalClinics <= trialCap;
      if (allowTrial) {
        console.log(`🎁 [REGISTER] Clínica nº ${totalClinics}/${trialCap} → Stripe trial 30 días (0€ hoy)`);
      }
      const { url } = await paymentService.createSubscriptionSession(ref.id, d.email.toLowerCase().trim(), regPlan, req, {
        referrerStripeCustomerId,
        allowTrial,
      });
      payment_url = url || null;
    } catch (e) {
      const stripeMsg = String(e?.message || e || '');
      console.error('🔥 [REGISTER] Fallo al crear sesión Stripe:', stripeMsg);
      payment_error = stripeMsg;
    }

    res.json({ success: true, token, clinicId: ref.id, payment_url, payment_error });
  } catch (error) { next(error); }
};

// 1b. LOGIN (Acceso a Dashboard)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    console.log(`🔐 [LOGIN] Intento: email=${email}, passwordLength=${password?.length || 0}`);
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email y contraseña requeridos' });

    const { initEnv } = require('../config/env');
    const env = await initEnv();
    const normalizedEmail = String(email).toLowerCase().trim();
    console.log(`🔐 [LOGIN] Email normalizado: ${normalizedEmail}`);

    const snap = await db.collection('clinicas')
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    console.log(`🔐 [LOGIN] Clinicas encontradas: ${snap.size}`);
    if (!snap.empty) {
      const doc = snap.docs[0];
      const data = doc.data() || {};
      console.log(`🔐 [LOGIN] Clinica ID: ${doc.id}`);
      console.log(`🔐 [LOGIN] Password hash exists: ${!!data.password}`);
      const ok = await bcrypt.compare(String(password), String(data.password || ''));
      console.log(`🔐 [LOGIN] Password match: ${ok}`);
      if (!ok) return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
      const token = jwt.sign({ clinicId: doc.id }, env.JWT_SECRET, { expiresIn: '30d' });
      console.log(`🔐 [LOGIN] Login exitoso para ${doc.id}`);
      return res.json({ success: true, token, clinicId: doc.id });
    }

    const staffDoc = await db.collection('staff_logins').doc(normalizedEmail).get();
    if (!staffDoc.exists) return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
    const staffData = staffDoc.data() || {};
    const clinicId = String(staffData.clinic_id || '').trim();
    const specialistId = String(staffData.specialist_id || '').trim();
    if (!clinicId || !specialistId) return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
    const staffPassword = String(staffData.password || '').trim();
    let ok = false;
    if (staffPassword) {
      ok = await bcrypt.compare(String(password), staffPassword);
    } else {
      const clinicDoc = await db.collection('clinicas').doc(clinicId).get();
      if (!clinicDoc.exists) return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
      const clinicData = clinicDoc.data() || {};
      ok = await bcrypt.compare(String(password), String(clinicData.password || ''));
    }
    if (!ok) return res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
    const token = jwt.sign({ clinicId, specialistId }, env.JWT_SECRET, { expiresIn: '30d' });
    return res.json({ success: true, token, clinicId, specialistId });
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
    const pwCheck = validatePasswordStrength(newPassword);
    if (!pwCheck.ok) return res.status(400).json({ success: false, error: pwCheck.error });

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
        // Referidos: asegurar que la clínica tenga código (best-effort)
        let referralCode = String(data?.referral_code || '').trim().toUpperCase();
        if (!referralCode) {
          const genReferralCode = () => Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
          for (let i = 0; i < 6; i++) {
            const candidate = genReferralCode();
            const exists = await db.collection('clinicas').where('referral_code', '==', candidate).limit(1).get();
            if (exists.empty) { referralCode = candidate; break; }
          }
          if (!referralCode) referralCode = genReferralCode();
          try {
            await db.collection('clinicas').doc(req.clinicId).set({ referral_code: referralCode, updated_at: Timestamp.now() }, { merge: true });
          } catch (_) {}
        }
        // Stats de referidos (simple)
        let referredCount = 0;
        try {
          const referredSnap = await db.collection('clinicas').where('referred_by_clinic_id', '==', req.clinicId).get();
          referredCount = referredSnap.size || 0;
        } catch (_) {}
        let equipo = equipoSnap.docs.map(d => ({id: d.id, ...d.data()}));
        if (equipo.length === 0) {
          equipo = [{ id: 'admin-lead', nombre: data.nombre_clinica, especialidad: 'Dirección', avatarUrl: data.logo_url, isOwner: true }];
        }
        let agendaRaw = citasSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const specialistId = String(req.specialistId || '').trim() || null;
        if (specialistId) {
          agendaRaw = agendaRaw.filter((c) => String(c.specialist_id || '') === specialistId);
          const onlyMe = equipo.filter((e) => e.id === specialistId);
          if (onlyMe.length) equipo = onlyMe;
        }
        const currentUser = { specialistId: specialistId || null, isOwner: !specialistId };
        // 🔒 Nunca exponer hashes/credenciales al cliente
        // eslint-disable-next-line no-unused-vars
        const { password, ...safeClinic } = (data || {});
        // Balance simple (real/potencial) a partir de citas + precio de sesión configurado
        const precioSesion = Number((data?.config_ia && data.config_ia.precio) || 50);
        let real = 0;
        let potencial = 0;
        agendaRaw.forEach((c) => {
          const amount = Number(c.precio_sesion || precioSesion || 0);
          const pagado = !!c.pagado || String(c.estado || '').toLowerCase() === 'pagado' || String(c.estado || '').toLowerCase() === 'pagada';
          if (pagado) real += amount;
          else potencial += amount;
        });
        const plan = String(data?.plan || 'solo').toLowerCase();
        const planPrice = plan === 'corporate' ? 500 : plan === 'team' ? 300 : 100;
        const roi = planPrice > 0 ? Math.round((real / planPrice) * 100) : 0;

        res.json({ 
          success: true, 
          data: { 
            configStatus: { hasLogo: !!data.logo_url, hasStripe: data.stripe_status === 'active', hasSubscription: !!data.subscription_active },
            clinicData: { id: req.clinicId, ...safeClinic },
            equipo,
            pacientes: pacientesSnap.docs.map(d => ({id: d.id, ...d.data()})),
            agenda: agendaRaw,
            bonos: bonosSnap.docs.map(d => ({id: d.id, ...d.data()})),
            balance: { real, potencial, roi, tendenciaMensual: 12 },
            referrals: { code: referralCode, count: referredCount },
            currentUser
          } 
        });
    } catch (e) { next(e); }
};

// Referidos: endpoint dedicado (para el tab Referidos)
const getReferrals = async (req, res, next) => {
  try {
    const clinicDoc = await db.collection('clinicas').doc(req.clinicId).get();
    if (!clinicDoc.exists) return res.status(404).json({ success: false, error: 'Clínica no encontrada' });
    const data = clinicDoc.data() || {};
    const code = String(data.referral_code || '').trim().toUpperCase();
    const referredSnap = await db.collection('clinicas').where('referred_by_clinic_id', '==', req.clinicId).limit(50).get();
    const referred = referredSnap.docs.map((d) => {
      const x = d.data() || {};
      return {
        id: d.id,
        nombre_clinica: x.nombre_clinica || null,
        email: x.email || null,
        plan: x.plan || null,
        created_at: x.created_at || null,
      };
    });
    return res.json({ success: true, code, count: referredSnap.size || 0, referred });
  } catch (e) { next(e); }
};

// Legal sidebar: estado real (best-effort)
const getLegalStatus = async (req, res, next) => {
  try {
    const clinicDoc = await db.collection('clinicas').doc(req.clinicId).get();
    if (!clinicDoc.exists) return res.status(404).json({ success: false, error: 'Clínica no encontrada' });
    const c = clinicDoc.data() || {};

    let contratosCount = 0;
    try {
      const contratosSnap = await db.collection('contratos').where('clinicId', '==', req.clinicId).limit(50).get();
      contratosCount = contratosSnap.size || 0;
    } catch (_) {}

    const legal = c.legal || {};
    const status = {
      acceptedTerms: !!legal.aceptado,
      acceptedAt: legal.fecha || null,
      hasStripe: c.stripe_status === 'active',
      hasSubscription: !!c.subscription_active,
      hasLogo: !!c.logo_url,
      plan: c.plan || null,
      contratosCount,
      modoRecaptacion: !!c.config_ia?.modo_caza_activo,
    };

    // “Obligaciones” derivadas (reales, basadas en estado)
    const obligations = [];
    if (!status.acceptedTerms) obligations.push({ level: 'warn', title: 'Términos/RGPD sin aceptar', hint: 'Completa el alta legal en Setup.' });
    if (!status.hasStripe) obligations.push({ level: 'warn', title: 'Stripe pendiente', hint: 'Conecta Stripe cuando tu cuenta esté aprobada.' });
    if (!status.hasSubscription) obligations.push({ level: 'info', title: 'Licencia pendiente', hint: 'Puedes operar en modo limitado hasta activar la licencia.' });
    if (!status.hasLogo) obligations.push({ level: 'info', title: 'Logo pendiente', hint: 'Sube tu logo para reforzar marca y confianza.' });
    if (status.modoRecaptacion) obligations.push({ level: 'ok', title: 'Recaptación activa', hint: 'Ana enviará emails a pacientes inactivos (con límites).' });

    return res.json({ success: true, status, obligations });
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

const PLANS_MULTI_CLINIC = ['team', 'business', 'clinic', 'corporate'];

const addSede = async (req, res, next) => {
  try {
    const clinicDoc = await db.collection('clinicas').doc(req.clinicId).get();
    if (!clinicDoc.exists) return res.status(404).json({ success: false, error: 'Clínica no encontrada' });
    const plan = String((clinicDoc.data() || {}).plan || 'solo').toLowerCase();
    if (!PLANS_MULTI_CLINIC.includes(plan)) {
      return res.status(403).json({
        success: false,
        error: 'La gestión de varias sedes está disponible en el plan Business (300€). Mejora tu plan para activarla.',
      });
    }
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
    const specialist = req.body?.specialist || req.body || {};
    const id = String(specialist.id || '').trim();
    const loginEmail = String(specialist.login_email || specialist.loginEmail || '').trim().toLowerCase() || null;
    const isOwner = !req.specialistId;
    let sendPasswordSetupEmail = false;

    const payload = {
      nombre: String(specialist.nombre || '').trim(),
      especialidad: String(specialist.especialidad || '').trim(),
      avatarUrl: String(specialist.avatarUrl || '').trim() || null,
      isOwner: !!specialist.isOwner,
      updated_at: Timestamp.now()
    };
    if (!payload.nombre) return res.status(400).json({ success: false, error: 'nombre requerido' });

    const col = db.collection('clinicas').doc(req.clinicId).collection('equipo');
    let finalId = id;
    if (id) {
      if (isOwner && loginEmail !== undefined) {
        payload.login_email = loginEmail || null;
        const currentDoc = await col.doc(id).get();
        const current = (currentDoc.data() || {});
        const previousEmail = String(current.login_email || '').trim().toLowerCase() || null;
        if (previousEmail && previousEmail !== (loginEmail || '')) {
          try { await db.collection('staff_logins').doc(previousEmail).delete(); } catch (_) {}
        }
        if (loginEmail) {
          await db.collection('staff_logins').doc(loginEmail).set({
            clinic_id: req.clinicId,
            specialist_id: id,
            updated_at: Timestamp.now()
          }, { merge: true });
          if (previousEmail !== loginEmail) sendPasswordSetupEmail = true;
        } else if (previousEmail) {
          try { await db.collection('staff_logins').doc(previousEmail).delete(); } catch (_) {}
        }
      }
      await col.doc(id).set(payload, { merge: true });
    } else {
      if (isOwner && loginEmail) payload.login_email = loginEmail;
      const ref = await col.add({ ...payload, created_at: Timestamp.now() });
      finalId = ref.id;
      if (isOwner && loginEmail) {
        await db.collection('staff_logins').doc(loginEmail).set({
          clinic_id: req.clinicId,
          specialist_id: finalId,
          updated_at: Timestamp.now()
        }, { merge: true });
        sendPasswordSetupEmail = true;
      }
    }

    if (sendPasswordSetupEmail && loginEmail) {
      try {
        const { createResetRequest, sendResetEmail } = require('../services/passwordResetService');
        const result = await createResetRequest(loginEmail);
        if (result.ok && result.token) await sendResetEmail(loginEmail, result.token);
      } catch (e) { console.error('saveSpecialist: email configura contraseña', e.message); }
    }

    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'UPSERT_SPECIALIST', finalId || 'new');
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

const deactivateBonos = async (req, res, next) => {
  try {
    await db.collection('clinicas').doc(req.clinicId).update({
      'config_ia.acepta_bonos': false,
      'config_ia.bonos_updated_at': Timestamp.now(),
      updated_at: Timestamp.now()
    });
    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'DEACTIVATE_BONOS', req.clinicId);
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

// Ejecutar recaptación ahora (para pruebas/operativa)
const runRecaptacionNow = async (req, res, next) => {
  try {
    const { runRecaptacionForClinic } = require('../services/recaptacionAutopilotService');
    const maxPerRun = Number(req.body?.maxPerRun || 5);
    const r = await runRecaptacionForClinic(req.clinicId, { maxPerRun });
    return res.json({ success: true, ...r });
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

    const frontendBase = String(env.FRONTEND_URL || process.env.FRONTEND_URL || 'https://www.fisiotool.com').replace(/\/+$/, '');

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
    const requested = String(req.body?.plan || '').trim();
    const current = String(clinic.plan || 'solo').trim();
    const plan = requested || (current.toLowerCase() === 'corporate' ? 'corporate' : 'team');
    const subId = String(clinic.stripe_subscription_id || '').trim();

    // Si ya tiene suscripción activa: upgrade con prorrateo (Stripe cobra solo la parte proporcional)
    if (subId && clinic.subscription_active) {
      const { url } = await paymentService.upgradeExistingSubscription(subId, plan, req);
      await createAuditLog(req.clinicId, req.userId || req.clinicId, 'STRIPE_UPGRADE_PRORATION', plan);
      return res.json({ success: true, url });
    }

    // Sin suscripción previa: Checkout nuevo (alta o re-alta). Trial solo si total fisios ≤ FREE_TRIAL_CAP.
    let allowTrial = true;
    try {
      const { initEnv } = require('../config/env');
      const countSnap = await db.collection('clinicas').count().get();
      const totalClinics = (typeof countSnap.data === 'function' ? countSnap.data() : {})?.count ?? 0;
      const trialCap = (await initEnv()).FREE_TRIAL_CAP ?? 50;
      allowTrial = totalClinics <= trialCap;
    } catch (_) {}
    const { url } = await paymentService.createSubscriptionSession(req.clinicId, clinic.email, plan, req, { allowTrial });
    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'STRIPE_UPGRADE_SESSION', plan);
    return res.json({ success: true, url });
  } catch (e) { next(e); }
};

// Darse de baja: cancela la suscripción al final del periodo (el usuario mantiene acceso hasta esa fecha)
const cancelSubscription = async (req, res, next) => {
  try {
    const clinicDoc = await db.collection('clinicas').doc(req.clinicId).get();
    if (!clinicDoc.exists) return res.status(404).json({ success: false, error: 'Clínica no encontrada' });
    const clinic = clinicDoc.data() || {};
    const subId = String(clinic.stripe_subscription_id || '').trim();
    if (!subId) return res.status(400).json({ success: false, error: 'No tienes suscripción activa para cancelar' });

    const { canceled, cancel_at } = await paymentService.cancelSubscriptionAtPeriodEnd(subId);
    if (!canceled) return res.status(400).json({ success: false, error: 'No se pudo programar la cancelación' });

    await db.collection('clinicas').doc(req.clinicId).set({
      subscription_cancel_at_period_end: true,
      subscription_cancel_at: cancel_at || null,
      updated_at: Timestamp.now(),
    }, { merge: true });
    await createAuditLog(req.clinicId, req.userId || req.clinicId, 'STRIPE_CANCEL_AT_PERIOD_END', subId);

    return res.json({ success: true, cancel_at: cancel_at || null });
  } catch (e) { next(e); }
};

// Cobro de cita o bono: genera enlace Checkout (pago único) con transferencia a la cuenta Connect de la clínica
const createCitaBonoCheckout = async (req, res, next) => {
  try {
    const clinicDoc = await db.collection('clinicas').doc(req.clinicId).get();
    if (!clinicDoc.exists) return res.status(404).json({ success: false, error: 'Clínica no encontrada' });
    const clinic = clinicDoc.data() || {};
    const accountId = String(clinic.stripe_account_id || '').trim();
    if (!accountId) return res.status(400).json({ success: false, error: 'Vincula primero tu cuenta bancaria en Pagos' });

    const amountEuros = Number(req.body?.amount) || 0;
    const amountCents = Math.round(amountEuros * 100);
    if (amountCents < 100) return res.status(400).json({ success: false, error: 'Importe mínimo 1€ (envía amount en euros, ej: 50 para 50€)' });
    const concepto = String(req.body?.concepto || req.body?.concept || 'Sesión FisioTool').trim().slice(0, 200);

    const { url, error } = await paymentService.createOneTimePaymentSession(amountCents, accountId, concepto, req);
    if (error) return res.status(400).json({ success: false, error });
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
      const plan = String(session?.metadata?.plan || '').trim() || null;
      await clinicRef.set({
        subscription_active: true,
        stripe_customer_id: session.customer || clinic.stripe_customer_id || null,
        stripe_subscription_id: session.subscription || clinic.stripe_subscription_id || null,
        ...(plan ? { plan } : {}),
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
        const plan = String(session?.metadata?.plan || '').trim() || null;
        const updates = {
          subscription_active: true,
          stripe_customer_id: session.customer || null,
          stripe_subscription_id: session.subscription || null,
          stripe_subscription_status: 'active',
          ...(plan ? { plan } : {}),
          updated_at: Timestamp.now()
        };
        await db.collection('clinicas').doc(clinicId).set(updates, { merge: true });
        await createAuditLog(clinicId, clinicId, 'STRIPE_CHECKOUT_COMPLETED', String(session.id || ''));
      }
    }

    // Referidos: al pagar una factura de suscripción, si el metadata tiene referente_id_stripe, aplicar cupón al referente
    if (event.type === 'invoice.paid') {
      const factura = event.data.object;
      if (factura.subscription && factura.amount_paid > 0) {
        try {
          const { initEnv: initEnvRef } = require('../config/env');
          const subs = await stripe.subscriptions.retrieve(factura.subscription);
          const refCustomerId = subs.metadata?.referente_id_stripe;
          if (refCustomerId) {
            const env = await initEnvRef();
            const coupon = String(env.STRIPE_REFERRAL_COUPON || 'REFERRAL50').trim();
            const list = await stripe.subscriptions.list({ customer: refCustomerId, status: 'active', limit: 1 });
            if (list.data.length > 0) {
              await stripe.subscriptions.update(list.data[0].id, { coupon });
              await createAuditLog('system', 'stripe_webhook', 'REFERRAL_COUPON_APPLIED', refCustomerId);
            }
          }
        } catch (refErr) {
          console.warn('⚠️ [WEBHOOK] Referral coupon apply:', refErr?.message || refErr);
        }
      }
    }

    // Si se cancela la suscripción (o se actualiza, p. ej. upgrade con prorrateo o cancel_at_period_end), reflejarlo
    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const sub = event.data.object;
      const clinicId = String(sub?.metadata?.clinic_id || '').trim();
      if (clinicId) {
        const status = String(sub?.status || '').trim().toLowerCase();
        const active = status === 'active' || status === 'trialing';
        const plan = String(sub?.metadata?.plan || '').trim() || null;
        const cancelAtPeriodEnd = !!sub?.cancel_at_period_end;
        const cancelAt = sub?.cancel_at || (cancelAtPeriodEnd ? sub?.current_period_end : null) || null;
        await db.collection('clinicas').doc(clinicId).set({
          subscription_active: active,
          stripe_subscription_status: status,
          stripe_subscription_id: sub?.id || null,
          subscription_cancel_at_period_end: cancelAtPeriodEnd,
          subscription_cancel_at: cancelAt || null,
          ...(plan ? { plan } : {}),
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
  deactivateBonos,
  createBono,
  launchCampaign,
  runRecaptacionNow,
  getReferrals,
  getLegalStatus,
  startStripeConnect,
  finalizeStripeConnect,
  createUpgradeSession,
  cancelSubscription,
  createCitaBonoCheckout,
  verifyPayment,
  handleStripeWebhook
};
