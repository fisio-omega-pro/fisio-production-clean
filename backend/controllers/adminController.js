const { db, Timestamp } = require('../config/firebase');
const anaService = require('../services/anaService');
const { scanInvoice } = require('../services/visionService');
const { initEnv } = require('../config/env');

// --- 🏛️ MODO DIOS: ESTADÍSTICAS CONSOLIDADAS ---
const getGlobalStats = async (req, res, next) => {
  try {
    const [clinics, alerts, expenses, suggestions, contratosSnap] = await Promise.all([
      db.collection('clinicas').get(),
      db.collection('foundry_alerts').get(),
      db.collection('foundry_llc_expenses').get(),
      db.collection('sugerencias').get(),
      db.collection('contratos').orderBy('createdAt', 'desc').limit(50).get()
    ]);

    const PLAN_PRICE = {
      solo: 100,
      professional: 100,
      pro: 100,
      team: 300,
      business: 300,
      clinic: 300,
      corporate: 500,
    };
    const normalizePlan = (v) => String(v || '').trim().toLowerCase() || 'solo';
    const planToTipo = (plan) => (plan === 'solo' || plan === 'professional' || plan === 'pro' ? 'solo' : 'multi');
    const toIsoMonth = (ts) => {
      try {
        if (!ts) return '';
        let d;
        if (ts.toDate) d = ts.toDate();
        else if (typeof ts === 'string') d = new Date(ts);
        else if (ts._seconds) d = new Date(ts._seconds * 1000);
        else d = new Date(ts);
        if (Number.isNaN(d.getTime())) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
      } catch {
        return '';
      }
    };

    let mrr = 0;
    const byPlan = {};
    const mrrByPlan = {};
    clinics.forEach((doc) => {
      const raw = doc.data() || {};
      const plan = normalizePlan(raw.plan);
      const price = PLAN_PRICE[plan] ?? 100;
      mrr += price;
      byPlan[plan] = (byPlan[plan] || 0) + 1;
      mrrByPlan[plan] = (mrrByPlan[plan] || 0) + price;
    });
    
    let totalExp = 0;
    expenses.forEach(d => totalExp += (d.data().importe_detectado || 0));

    res.json({
      success: true,
      stats: { 
        totalClinicas: clinics.size, 
        mrr: `${mrr}€`, 
        beneficioNeto: `${(mrr - totalExp).toFixed(2)}€`,
        totalExpenses: `${totalExp.toFixed(2)}€`,
        pendingSuggestions: suggestions.size,
        byPlan,
        mrrByPlan,
      },
      // 🔒 Seguridad: nunca exponer hashes/credenciales (p.ej. `password`) en Foundry
      clinicas: clinics.docs.map((d) => {
        const raw = d.data() || {};
        // eslint-disable-next-line no-unused-vars
        const { password, ...safe } = raw;
        const plan = normalizePlan(safe.plan);
        return {
          id: d.id,
          ...safe,
          plan,
          // Compat con filtros actuales de Foundry
          tipo: safe.tipo ? String(safe.tipo).trim().toLowerCase() : planToTipo(plan),
          fecha_registro: safe.fecha_registro ? String(safe.fecha_registro) : (toIsoMonth(safe.created_at || safe.legal?.fecha || safe.updated_at) || ''),
        };
      }),
      contratos: contratosSnap.docs.map((d) => {
        const raw = d.data() || {};
        // Solo lo imprescindible para Foundry
        return {
          id: d.id,
          contractNumber: raw.contractNumber,
          nombre: raw.nombre_clinica,
          email: raw.email,
          plan: normalizePlan(raw.plan),
          fecha: raw.createdAt || raw.acceptedAt || null
        };
      }),
      alerts: alerts.docs.map(d => ({id:d.id, ...d.data()}))
    });
  } catch (e) { next(e); }
};

// --- 💡 BUZÓN DE SUGERENCIAS (Punto 2) ---
const saveSuggestion = async (req, res) => {
  try {
    // Aceptar distintas shapes (robustez)
    const raw = (req.body && (req.body.text ?? req.body.mensaje ?? req.body.message)) ?? '';
    const text = String(raw || '').trim();
    if (!text) return res.status(400).json({ success: false, error: 'texto requerido' });
    await db.collection('sugerencias').add({
      clinic_id: req.clinicId,
      mensaje: text,
      status: 'pendiente',
      fecha: Timestamp.now()
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// --- ⚙️ AJUSTES DE PERFIL (Punto 12) ---
const updateSettings = async (req, res) => {
  try {
    const { nombre, email } = req.body;
    await db.collection('clinicas').doc(req.clinicId).update({
      nombre_clinica: nombre,
      email: email.toLowerCase().trim(),
      updated_at: Timestamp.now()
    });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const handleAdminChat = async (req, res) => {
  try {
    const { reply } = await anaService.processAdminConsultation(req.body.message);
    res.json({ success: true, reply });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const diagnoseAna = async (req, res) => {
  try {
    const env = await initEnv();
    const keyRaw = env.GOOGLE_AI_KEY || '';
    const keyTrim = keyRaw.trim();
    const model = env.GOOGLE_AI_MODEL || '';
    if (!keyTrim) return res.status(500).json({ ok: false, error: 'GOOGLE_AI_KEY vacío' });
    if (!model) return res.status(500).json({ ok: false, error: 'GOOGLE_AI_MODEL vacío' });
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${keyTrim}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'ping' }] }] })
    });
    const data = await response.json();
    if (!response.ok) {
      return res.json({
        ok: false,
        model,
        keyLength: keyTrim.length,
        keyHasWhitespace: keyRaw !== keyTrim,
        error: data?.error || data
      });
    }
    return res.json({
      ok: true,
      model,
      keyLength: keyTrim.length,
      keyHasWhitespace: keyRaw !== keyTrim,
      reply: data?.candidates?.[0]?.content?.parts?.[0]?.text || null
    });
  } catch (e) { return res.status(500).json({ ok: false, error: e.message }); }
};

const saveAlert = async (req, res) => {
  try {
    await db.collection('foundry_alerts').add({ ...req.body, creado_el: Timestamp.now() });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const deleteAlert = async (req, res) => {
  try {
    await db.collection('foundry_alerts').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const processInvoice = async (req, res) => {
  try {
    const { rawText, importe, moneda } = await scanInvoice(req.file.buffer);
    await db.collection('foundry_llc_expenses').add({
      importe_detectado: importe, moneda, texto_completo: rawText, fecha: Timestamp.now()
    });
    res.json({ success: true, importe, moneda, text: rawText });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// 📧 GESTIÓN DEL INBOX DE ANA
const getAnaInbox = async (req, res) => {
  try {
    const snapshot = await db.collection('ana_inbox')
      .orderBy('fecha', 'desc')
      .limit(50)
      .get();
    
    const emails = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ success: true, emails });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const sendProspectEmail = async (req, res) => {
  try {
    const { to, leadInfo } = req.body;
    const { sendEmail } = require('../services/emailSenderService');
    
    // Generar email con IA
    const emailBody = await anaService.generateProspectEmail(leadInfo || {});
    
    // Enviar
    await sendEmail(to, 'Te presento FisioTool Pro', emailBody, 'ANA');
    
    // Guardar en historial
    await db.collection('ana_sent_emails').add({
      to,
      subject: 'Te presento FisioTool Pro',
      body: emailBody,
      leadInfo,
      fecha: Timestamp.now()
    });
    
    res.json({ success: true, preview: emailBody });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

const triggerEmailCheck = async (req, res) => {
  try {
    const { readEmails } = require('../services/emailReaderService');
    await readEmails();
    res.json({ success: true, message: 'Revisión de emails iniciada' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// --- 📄 CONTRATOS (Repositorio Legal) ---
const getContrato = async (req, res) => {
  try {
    const id = String(req.params.id || '').trim();
    if (!id) return res.status(400).json({ error: 'ID requerido' });
    const doc = await db.collection('contratos').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Contrato no encontrado' });
    const data = doc.data() || {};
    return res.json({
      success: true,
      contrato: {
        id: doc.id,
        contractNumber: data.contractNumber || null,
        nombre: data.nombre_clinica || null,
        email: data.email || null,
        plan: data.plan || null,
        acceptedAt: data.acceptedAt || data.createdAt || null,
        text: data.text || ''
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

module.exports = { 
  getGlobalStats, handleAdminChat, diagnoseAna, saveAlert, deleteAlert, processInvoice, saveSuggestion, updateSettings,
  getAnaInbox, sendProspectEmail, triggerEmailCheck, getContrato,
  importLeads: async (req,res) => res.json({success:true}),
  handleIncomingResponse: async (req,res) => res.json({success:true})
};
