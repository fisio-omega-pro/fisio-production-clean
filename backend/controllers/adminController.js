const { db, Timestamp } = require('../config/firebase');
const { initEnv } = require('../config/env');
const anaService = require('../services/anaService');
const { scanInvoice } = require('../services/visionService');

// --- 🏛️ MODO DIOS: ESTADÍSTICAS CONSOLIDADAS ---
const getGlobalStats = async (req, res, next) => {
  try {
    const [clinics, alerts, expenses, suggestions, leads] = await Promise.all([
      db.collection('clinicas').get(),
      db.collection('foundry_alerts').get(),
      db.collection('foundry_llc_expenses').get(),
      db.collection('sugerencias').get(),
      db.collection('foundry_leads').get()
    ]);

    let mrr = 0;
    clinics.forEach(d => mrr += (d.data().plan === 'pro' ? 300 : 100));
    
    let totalExp = 0;
    expenses.forEach(d => totalExp += (d.data().importe_detectado || 0));

    let leadsCount = leads.size;
    let enProceso = 0;
    let interesados = 0;
    leads.forEach(d => {
      const status = d.data().status || 'nuevo';
      if (status === 'en_proceso') enProceso += 1;
      if (status === 'interesado') interesados += 1;
    });

    res.json({
      success: true,
      stats: { 
        totalClinicas: clinics.size, 
        mrr: `${mrr}€`, 
        beneficioNeto: `${(mrr - totalExp).toFixed(2)}€`,
        totalExpenses: `${totalExp.toFixed(2)}€`,
        pendingSuggestions: suggestions.size,
        leadsCount,
        enProceso,
        interesados
      },
      clinicas: clinics.docs.map(d => ({id:d.id, ...d.data()})),
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

// --- 🧪 DIAGNÓSTICO IA (Foundry) ---
const diagnoseAna = async (req, res) => {
  try {
    const env = await initEnv();
    const keyRaw = env.GOOGLE_AI_KEY || '';
    const keyTrim = keyRaw.trim();
    const model = env.GOOGLE_AI_MODEL || '';
    if (!keyTrim) {
      return res.status(500).json({ ok: false, error: 'GOOGLE_AI_KEY vacío' });
    }
    if (!model) {
      return res.status(500).json({ ok: false, error: 'GOOGLE_AI_MODEL vacío' });
    }
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${keyTrim}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "ping" }] }] })
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
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};

module.exports = { 
  getGlobalStats, handleAdminChat, saveAlert, deleteAlert, processInvoice, saveSuggestion, updateSettings, diagnoseAna,
  importLeads: async (req,res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Falta CSV' });
      const raw = req.file.buffer.toString('utf8');
      const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) return res.status(400).json({ error: 'CSV vacío' });
      const first = lines[0];
      const delim = (first.split(';').length > first.split(',').length) ? ';' : ',';
      const headers = first.split(delim).map(h => h.trim().toLowerCase());
      const batch = db.batch();
      let imported = 0;
      const leadType = (req.body?.leadType || 'estandar').toLowerCase();
      lines.slice(1).forEach((line) => {
        const cols = line.split(delim).map(c => c.trim());
        if (!cols.length) return;
        const data = {};
        headers.forEach((h, idx) => { data[h] = cols[idx] || ''; });
        const email = (data.email || data.correo || data.mail || '').toLowerCase().trim();
        const phone = (data.telefono || data.tel || data.phone || data.movil || data['móvil'] || '').trim();
        const name = (data.nombre || data.name || data.paciente || data.cliente || '').trim();
        const docRef = db.collection('foundry_leads').doc();
        batch.set(docRef, {
          ...data,
          email,
          phone,
          name,
          lead_type: leadType,
          status: 'nuevo',
          created_at: Timestamp.now()
        });
        imported += 1;
      });
      await batch.commit();
      res.json({ success: true, imported });
    } catch (e) { res.status(500).json({ error: e.message }); }
  },
  handleIncomingResponse: async (req,res) => res.json({success:true})
};
