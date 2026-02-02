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

    let mrr = 0;
    clinics.forEach(d => mrr += (d.data().plan === 'pro' ? 300 : 100));
    
    let totalExp = 0;
    expenses.forEach(d => totalExp += (d.data().importe_detectado || 0));

    res.json({
      success: true,
      stats: { 
        totalClinicas: clinics.size, 
        mrr: `${mrr}€`, 
        beneficioNeto: `${(mrr - totalExp).toFixed(2)}€`,
        totalExpenses: `${totalExp.toFixed(2)}€`,
        pendingSuggestions: suggestions.size
      },
      // 🔒 Seguridad: nunca exponer hashes/credenciales (p.ej. `password`) en Foundry
      clinicas: clinics.docs.map((d) => {
        const raw = d.data() || {};
        // eslint-disable-next-line no-unused-vars
        const { password, ...safe } = raw;
        return { id: d.id, ...safe };
      }),
      contratos: contratosSnap.docs.map((d) => {
        const raw = d.data() || {};
        // Solo lo imprescindible para Foundry
        return {
          id: d.id,
          contractNumber: raw.contractNumber,
          nombre: raw.nombre_clinica,
          email: raw.email,
          plan: raw.plan,
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
    const { text } = req.body;
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

module.exports = { 
  getGlobalStats, handleAdminChat, diagnoseAna, saveAlert, deleteAlert, processInvoice, saveSuggestion, updateSettings,
  getAnaInbox, sendProspectEmail, triggerEmailCheck,
  importLeads: async (req,res) => res.json({success:true}),
  handleIncomingResponse: async (req,res) => res.json({success:true})
};
