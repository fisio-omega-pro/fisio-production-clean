const { db, Timestamp } = require('../config/firebase');
const anaService = require('../services/anaService');
const { scanInvoice } = require('../services/visionService');
const { initEnv } = require('../config/env');

// --- helpers ---
const detectDelimiter = (headerLine) => {
  const c = (headerLine.match(/,/g) || []).length;
  const s = (headerLine.match(/;/g) || []).length;
  return s > c ? ';' : ',';
};

const splitCsvLine = (line, delimiter) => {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // escape ""
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && ch === delimiter) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => String(s ?? '').trim());
};

const parseCsv = (text) => {
  const raw = String(text || '');
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter)
    .map((h) => h.toLowerCase().replace(/\s+/g, '_').trim())
    .filter(Boolean);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i], delimiter);
    if (!cols.some((x) => String(x).trim())) continue;
    const obj = {};
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = cols[j] ?? '';
    rows.push(obj);
  }
  return rows;
};

const pick = (row, keys) => {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
};

const normalizeLeadStatus = (v) => {
  const s = String(v || '').trim().toLowerCase();
  if (!s) return 'pendiente';
  if (['pendiente', 'pending', 'nuevo', 'new'].includes(s)) return 'pendiente';
  if (['en_proceso', 'en proceso', 'in_process', 'in process', 'procesando', 'contactado'].includes(s)) return 'en_proceso';
  if (['interesado', 'interested', 'qualified'].includes(s)) return 'interesado';
  if (['convertido', 'converted', 'cliente', 'closed_won'].includes(s)) return 'convertido';
  return s.replace(/\s+/g, '_');
};

const normalizeLeadType = (v) => {
  const s = String(v || '').trim().toLowerCase();
  if (!s) return 'videntes';
  if (['invidentes', 'blind', 'accesible', 'access'].includes(s)) return 'invidentes';
  return 'videntes';
};

// De momento CAZA es email-only (WhatsApp se habilitará más adelante)
const normalizeLeadChannel = (_v) => 'email';

// --- 🏛️ MODO DIOS: ESTADÍSTICAS CONSOLIDADAS ---
const getGlobalStats = async (req, res, next) => {
  try {
    const [clinics, alerts, expenses, expensesListSnap, suggestions, contratosSnap, leadsSnap, prosSnap] = await Promise.all([
      db.collection('clinicas').get(),
      db.collection('foundry_alerts').get(),
      db.collection('foundry_llc_expenses').get(),
      db.collection('foundry_llc_expenses').orderBy('fecha', 'desc').limit(50).get(),
      db.collection('sugerencias').get(),
      db.collection('contratos').orderBy('createdAt', 'desc').limit(50).get(),
      // Leads (para MODO CAZA). Limit para evitar respuestas enormes.
      db.collection('leads').orderBy('created_at', 'desc').limit(2000).get(),
      db.collection('foundry_settings').doc('prospeccion').get(),
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

    const facturas = (expensesListSnap?.docs || []).map((d) => {
      const raw = d.data() || {};
      return {
        id: d.id,
        importe: raw.importe_detectado ?? raw.importe ?? null,
        moneda: raw.moneda ?? 'EUR',
        fecha: raw.fecha ?? raw.created_at ?? null,
        texto: raw.texto_completo ?? raw.text ?? '',
        file_path: raw.file_path ?? null,
        file_mime: raw.file_mime ?? null,
        file_name: raw.file_name ?? null,
      };
    });

    const leads = leadsSnap.docs.map((d) => {
      const raw = d.data() || {};
      const estado = normalizeLeadStatus(raw.estado || raw.status);
      const tipo = normalizeLeadType(raw.tipo || raw.lead_type);
      const canal = normalizeLeadChannel(raw.canal || raw.channel || raw.preferredContact || 'email');
      const ultimaAccion = String(raw.ultima_accion || raw.last_action || '').trim();
      return {
        id: d.id,
        ...raw,
        // Compat UI Foundry (front usa estado/tipo/canal/ultima_accion)
        estado,
        tipo,
        canal,
        ultima_accion: ultimaAccion,
        // Compat data model (back usa status/lead_type)
        status: estado,
        lead_type: tipo,
      };
    });
    const leadsCount = leads.length;
    const enProceso = leads.filter((l) => String(l.estado || l.status || '').toLowerCase() === 'en_proceso').length;
    const interesados = leads.filter((l) => String(l.estado || l.status || '').toLowerCase() === 'interesado').length;
    const convertidos = leads.filter((l) => String(l.estado || l.status || '').toLowerCase() === 'convertido').length;
    const campaignActive = !!(prosSnap && prosSnap.exists && (prosSnap.data() || {}).active);

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
        leadsCount,
        enProceso,
        interesados,
        convertidos,
        campaignActive,
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
      alerts: alerts.docs.map(d => ({id:d.id, ...d.data()})),
      facturas,
      leads
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
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: 'invoice requerido' });
    if (file.size > 10 * 1024 * 1024) return res.status(400).json({ success: false, error: 'Archivo demasiado pesado (máx 10MB)' });

    const { rawText, importe, moneda } = await scanInvoice(file.buffer);

    // Guardar el fichero original en GCS (repositorio legal/contable)
    const ct = String(file.mimetype || '').toLowerCase() || 'application/octet-stream';
    const safeName = String(file.originalname || 'factura')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 160);
    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 10);
    const filename = `llc/expenses/${stamp}-${rand}-${safeName}`;
    let uploadedPath = null;
    try {
      const { uploadBuffer } = require('../services/storageService');
      await uploadBuffer({
        filename,
        buffer: file.buffer,
        contentType: ct,
        cacheControl: 'private, max-age=0, no-cache'
      });
      uploadedPath = filename;
    } catch (e) {
      // Si falla storage, no bloqueamos OCR/archivado en Firestore (best-effort)
      console.error('⚠️ [LLC] No se pudo subir factura a GCS:', e.message);
    }

    const ref = await db.collection('foundry_llc_expenses').add({
      importe_detectado: importe,
      moneda,
      texto_completo: rawText,
      fecha: Timestamp.now(),
      file_path: uploadedPath,
      file_mime: uploadedPath ? ct : null,
      file_name: uploadedPath ? safeName : null,
      file_size: uploadedPath ? (file.size || null) : null,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    });

    res.json({ success: true, id: ref.id, importe, moneda, text: rawText });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// --- 📄 MODO LLC: DESCARGA/LECTURA DE FACTURA (GCS) ---
const getExpenseFile = async (req, res) => {
  try {
    const id = String(req.params?.id || '').trim();
    if (!id) return res.status(400).json({ success: false, error: 'id requerido' });
    const doc = await db.collection('foundry_llc_expenses').doc(id).get();
    if (!doc.exists) return res.status(404).json({ success: false, error: 'Factura no encontrada' });
    const data = doc.data() || {};
    const path = String(data.file_path || '').trim();
    if (!path) return res.status(404).json({ success: false, error: 'Factura sin archivo' });

    const ct = String(data.file_mime || 'application/octet-stream');
    const name = String(data.file_name || `factura-${id}`).replace(/[\r\n"]/g, '').slice(0, 160);

    const { getReadStream } = require('../services/storageService');
    res.setHeader('Content-Type', ct);
    res.setHeader('Cache-Control', 'private, max-age=0, no-cache');
    // inline para PDF/imágenes en navegador, pero descarga si el navegador no soporta
    res.setHeader('Content-Disposition', `inline; filename=\"${name}\"`);

    const stream = getReadStream(path);
    stream.on('error', (err) => {
      console.error('🔥 [LLC] Error leyendo archivo GCS:', err.message);
      if (!res.headersSent) res.status(500).json({ success: false, error: 'No se pudo leer el archivo' });
      else res.end();
    });
    stream.pipe(res);
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

// --- 🎯 MODO CAZA: IMPORTAR LEADS DESDE CSV ---
const importLeads = async (req, res) => {
  try {
    const leadType = String(req.body?.leadType || '').trim().toLowerCase() || 'videntes';
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: 'CSV requerido (file)' });
    const csvText = file.buffer.toString('utf8');
    const rows = parseCsv(csvText);
    if (!rows.length) return res.json({ success: true, imported: 0 });

    const now = Timestamp.now();
    const col = db.collection('leads');

    let imported = 0;
    // batch limit 500
    for (let i = 0; i < rows.length; i += 400) {
      const chunk = rows.slice(i, i + 400);
      const batch = db.batch();
      chunk.forEach((row) => {
        const email = pick(row, ['email', 'mail', 'correo', 'correo_electronico']).toLowerCase();
        const phone = pick(row, ['telefono', 'teléfono', 'phone', 'movil', 'móvil', 'whatsapp']);
        const nombre = pick(row, ['nombre', 'name', 'contacto', 'persona', 'responsable']) || 'Lead';
        const clinica = pick(row, ['clinica', 'clínica', 'nombre_clinica', 'empresa', 'company', 'centro']) || '';
        const ciudad = pick(row, ['ciudad', 'city', 'poblacion', 'población']) || '';
        if (!email && !phone) return;

        const ref = col.doc();
        const tipo = normalizeLeadType(leadType);
        batch.set(ref, {
          lead_type: tipo,
          tipo,
          nombre,
          clinica,
          email,
          telefono: phone,
          ciudad,
          status: 'pendiente',
          estado: 'pendiente',
          canal: 'email',
          ultima_accion: '',
          source: 'csv',
          raw: row,
          created_at: now,
          updated_at: now,
        });
        imported++;
      });
      await batch.commit();
    }

    return res.json({ success: true, imported });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

// --- 🎯 MODO CAZA: CONTROL DE CAMPAÑA (persistente) ---
const setCampaign = async (req, res) => {
  try {
    const active = !!req.body?.active;
    await db.collection('foundry_settings').doc('prospeccion').set({
      active,
      updated_at: Timestamp.now(),
    }, { merge: true });
    return res.json({ success: true, active });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

// --- 🎯 MODO CAZA: ACTUALIZAR ESTADO DE LEAD ---
const updateLeadStatus = async (req, res) => {
  try {
    const id = String(req.params?.id || '').trim();
    if (!id) return res.status(400).json({ success: false, error: 'id requerido' });
    const nextRaw = (req.body && (req.body.estado ?? req.body.status)) ?? '';
    const estado = normalizeLeadStatus(nextRaw);
    const patch = {
      estado,
      status: estado,
      updated_at: Timestamp.now(),
    };
    // Email-only: ignoramos cualquier intento de fijar canal distinto
    patch.canal = 'email';
    if (req.body?.ultima_accion != null) patch.ultima_accion = String(req.body.ultima_accion || '').trim();
    await db.collection('leads').doc(id).set(patch, { merge: true });
    return res.json({ success: true, estado });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

// --- 📄 MODO LLC: SUBIR CONTRATO MANUAL (repositorio legal) ---
const uploadContrato = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, error: 'contrato requerido' });
    if (file.size > 10 * 1024 * 1024) return res.status(400).json({ success: false, error: 'Archivo demasiado pesado (máx 10MB)' });

    const ct = String(file.mimetype || '').toLowerCase();
    const safeName = String(file.originalname || 'contrato').replace(/[^a-zA-Z0-9._-]/g, '_');
    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 10);
    const filename = `contratos/manual/${stamp}-${rand}-${safeName}`;

    const { uploadBuffer } = require('../services/storageService');
    await uploadBuffer({ filename, buffer: file.buffer, contentType: ct, cacheControl: 'private, max-age=0, no-cache' });

    let text = '';
    if (ct.startsWith('text/') || safeName.toLowerCase().endsWith('.txt')) {
      text = file.buffer.toString('utf8').slice(0, 200000);
    }

    const contractNumber = `MANUAL-${stamp}`;
    const ref = await db.collection('contratos').add({
      contractNumber,
      nombre_clinica: 'MANUAL',
      email: '',
      plan: 'llc',
      source: 'manual_upload',
      file_path: filename,
      file_mime: ct,
      text,
      createdAt: Timestamp.now()
    });

    return res.json({ success: true, id: ref.id, contractNumber });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
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
    const { to, leadInfo, leadId } = req.body;
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

    // Si nos pasan leadId, marcamos estado y última acción (best-effort)
    try {
      const id = String(leadId || '').trim();
      if (id) {
        await db.collection('leads').doc(id).set({
          estado: 'en_proceso',
          status: 'en_proceso',
          canal: 'email',
          ultima_accion: `Email enviado (${new Date().toISOString().slice(0, 10)})`,
          updated_at: Timestamp.now(),
        }, { merge: true });
      }
    } catch (_) {}
    
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
  importLeads,
  uploadContrato,
  setCampaign,
  updateLeadStatus,
  getExpenseFile,
  handleIncomingResponse: async (req,res) => res.json({success:true})
};
