const { db, Timestamp } = require('../config/firebase');
const anaService = require('../services/anaService');
const { scanInvoice } = require('../services/visionService');

// --- 🏛️ MODO DIOS: ESTADÍSTICAS CONSOLIDADAS ---
const getGlobalStats = async (req, res, next) => {
  try {
    const [clinics, alerts, expenses, suggestions] = await Promise.all([
      db.collection('clinicas').get(),
      db.collection('foundry_alerts').get(),
      db.collection('foundry_llc_expenses').get(),
      db.collection('sugerencias').get()
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

module.exports = { 
  getGlobalStats, handleAdminChat, saveAlert, deleteAlert, processInvoice, saveSuggestion, updateSettings,
  importLeads: async (req,res) => res.json({success:true}),
  handleIncomingResponse: async (req,res) => res.json({success:true})
};
