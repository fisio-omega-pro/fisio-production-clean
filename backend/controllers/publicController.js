const { db, Timestamp } = require('../config/firebase');
const { initEnv } = require('../config/env');
const { sendEmail } = require('../services/emailSenderService');
const { baseEmailHtml, escapeHtml } = require('../services/emailTemplates');
const anaService = require('../services/anaService');
const { getReadStream } = require('../services/storageService');

function isValidEmail(email) {
  const s = String(email || '').trim();
  // Simple y robusto para formulario
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

const submitCorporateLead = async (req, res) => {
  try {
    const b = req.body || {};

    // Honeypot anti-spam: si viene relleno, aceptamos silenciosamente
    if (String(b.website || '').trim()) return res.json({ success: true });

    const companyName = String(b.companyName || '').trim();
    const contactName = String(b.contactName || '').trim();
    const email = String(b.email || '').trim().toLowerCase();
    const phone = String(b.phone || '').trim();
    const clinicsCount = Number(b.clinicsCount || 0);
    const practitionersCount = Number(b.practitionersCount || 0);
    const services = Array.isArray(b.services) ? b.services.map((x) => String(x).trim()).filter(Boolean) : [];
    const servicesOther = String(b.servicesOther || '').trim();
    const currentSoftware = String(b.currentSoftware || '').trim();
    const monthlyPatients = b.monthlyPatients == null || b.monthlyPatients === '' ? null : Number(b.monthlyPatients);
    const locations = String(b.locations || '').trim();
    const timeline = String(b.timeline || '').trim();
    const preferredContact = String(b.preferredContact || '').trim();
    const timezone = String(b.timezone || '').trim();
    const availability = String(b.availability || '').trim();
    const notes = String(b.notes || '').trim();

    if (!companyName || !contactName || !email) {
      return res.status(400).json({ success: false, error: 'Empresa, contacto y email son obligatorios.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Email inválido.' });
    }
    if (!Number.isFinite(clinicsCount) || clinicsCount <= 0) {
      return res.status(400).json({ success: false, error: 'Número de sedes inválido.' });
    }
    if (!Number.isFinite(practitionersCount) || practitionersCount <= 0) {
      return res.status(400).json({ success: false, error: 'Número de especialistas inválido.' });
    }
    if (monthlyPatients != null && (!Number.isFinite(monthlyPatients) || monthlyPatients < 0)) {
      return res.status(400).json({ success: false, error: 'Pacientes/mes inválido.' });
    }

    const ip = String((req.headers['x-forwarded-for'] || req.ip || '')).split(',')[0].trim();
    const userAgent = String(req.headers['user-agent'] || '');

    const lead = {
      type: 'corporate',
      companyName,
      contactName,
      email,
      phone,
      clinicsCount,
      practitionersCount,
      services,
      servicesOther: services.includes('Otro') ? servicesOther : '',
      currentSoftware,
      monthlyPatients,
      locations,
      timeline,
      preferredContact,
      timezone,
      availability,
      notes,
      ip,
      userAgent,
      createdAt: Timestamp.now(),
    };

    const ref = await db.collection('corporate_leads').add(lead);

    const env = await initEnv();
    // ✅ Política acordada: cualquier alerta/lead importante SIEMPRE al admin Gmail
    const adminEmail = env.ADMIN_EMAIL || 'fisiotoolsaas@gmail.com';

    // --- Ana triage (resumen + borrador). No se envía al lead automáticamente ---
    const subject = `Lead Corporate: ${companyName} (${clinicsCount} sedes · ${practitionersCount} especialistas)`;
    const bodyText =
      `Empresa: ${companyName}\n` +
      `Contacto: ${contactName}\n` +
      `Email: ${email}\n` +
      (phone ? `Teléfono: ${phone}\n` : '') +
      `Sedes: ${clinicsCount}\n` +
      `Especialistas: ${practitionersCount}\n` +
      (services.length ? `Servicios: ${services.join(', ')}${services.includes('Otro') && servicesOther ? ` (${servicesOther})` : ''}\n` : '') +
      (locations ? `Ubicaciones: ${locations}\n` : '') +
      (currentSoftware ? `Software actual: ${currentSoftware}\n` : '') +
      (monthlyPatients != null ? `Pacientes/mes: ${monthlyPatients}\n` : '') +
      (timeline ? `Plazo: ${timeline}\n` : '') +
      (preferredContact ? `Preferencia: ${preferredContact}\n` : '') +
      (timezone ? `Zona horaria: ${timezone}\n` : '') +
      (availability ? `Disponibilidad: ${availability}\n` : '') +
      (notes ? `Notas: ${notes}\n` : '');

    let analysis = null;
    try {
      analysis = await anaService.processCorporateLead({
        companyName,
        contactName,
        email,
        phone,
        clinicsCount,
        practitionersCount,
        services,
        locations,
        timeline,
        preferredContact,
        timezone,
        availability,
        notes
      });
    } catch (_) {
      analysis = null;
    }

    // Guardar en el "inbox" interno de Ana para revisión/consenso
    try {
      await db.collection('ana_inbox').add({
        channel: 'corporate_form',
        lead_id: ref.id,
        from: email,
        subject,
        body: bodyText.substring(0, 500),
        clasificacion: (analysis && analysis.clasificacion) ? analysis.clasificacion : 'IMPORTANTE',
        tipo: 'LEAD_PROSPECTO',
        respuesta_generada: analysis && analysis.respuesta ? analysis.respuesta : null,
        notificar_admin: true,
        resumen: analysis && analysis.resumen ? analysis.resumen : `${companyName} solicita contacto Corporate`,
        preguntas_clave: Array.isArray(analysis?.preguntas_clave) ? analysis.preguntas_clave : [],
        fecha: new Date().toISOString(),
        respondido: false
      });
    } catch (e) {
      console.error('[CORPORATE_LEAD] Error guardando en ana_inbox:', e.message);
    }

    const bodyHtml = `
      <h1 class="h1">Nuevo lead Corporate</h1>
      <p class="p"><strong>${escapeHtml(companyName)}</strong> ha solicitado contacto.</p>
      <div class="box">
        <p class="p"><strong>Contacto:</strong> ${escapeHtml(contactName)}</p>
        <p class="p"><strong>Email:</strong> ${escapeHtml(email)}</p>
        ${phone ? `<p class="p"><strong>Teléfono:</strong> ${escapeHtml(phone)}</p>` : ''}
        <p class="p"><strong>Sedes:</strong> ${escapeHtml(clinicsCount)}</p>
        <p class="p"><strong>Especialistas:</strong> ${escapeHtml(practitionersCount)}</p>
        ${services.length ? `<p class="p"><strong>Servicios:</strong> ${escapeHtml(services.join(', '))}${services.includes('Otro') && servicesOther ? ` (${escapeHtml(servicesOther)})` : ''}</p>` : ''}
        ${locations ? `<p class="p"><strong>Ubicaciones:</strong> ${escapeHtml(locations)}</p>` : ''}
        ${currentSoftware ? `<p class="p"><strong>Software actual:</strong> ${escapeHtml(currentSoftware)}</p>` : ''}
        ${monthlyPatients != null ? `<p class="p"><strong>Pacientes/mes:</strong> ${escapeHtml(monthlyPatients)}</p>` : ''}
        ${timeline ? `<p class="p"><strong>Plazo:</strong> ${escapeHtml(timeline)}</p>` : ''}
        ${preferredContact ? `<p class="p"><strong>Preferencia:</strong> ${escapeHtml(preferredContact)}</p>` : ''}
        ${timezone ? `<p class="p"><strong>Zona horaria:</strong> ${escapeHtml(timezone)}</p>` : ''}
        ${availability ? `<p class="p"><strong>Disponibilidad:</strong> ${escapeHtml(availability)}</p>` : ''}
        ${notes ? `<p class="p"><strong>Notas:</strong><br/>${escapeHtml(notes).replace(/\n/g, '<br/>')}</p>` : ''}
        <p class="muted">Lead ID: ${escapeHtml(ref.id)} · IP: ${escapeHtml(ip)}</p>
      </div>
      ${analysis?.resumen ? `<div style="height:14px"></div><div class="box"><p class="p"><strong>Resumen ejecutivo (Ana):</strong><br/>${escapeHtml(analysis.resumen).replace(/\n/g, '<br/>')}</p></div>` : ''}
      ${Array.isArray(analysis?.preguntas_clave) && analysis.preguntas_clave.length ? `<div style="height:14px"></div><div class="box"><p class="p"><strong>Preguntas clave (Ana):</strong></p><ul class="p" style="margin:0; padding-left:18px">${analysis.preguntas_clave.slice(0, 6).map(q => `<li>${escapeHtml(q)}</li>`).join('')}</ul></div>` : ''}
      ${analysis?.respuesta ? `<div style="height:14px"></div><div class="box"><p class="p"><strong>Borrador de respuesta (para consensuar):</strong><br/>${escapeHtml(analysis.respuesta).replace(/\n/g, '<br/>')}</p><p class="muted">Nota: no se enviará ninguna respuesta automática sin tu OK.</p></div>` : `<div style="height:14px"></div><p class="muted">Ana no generó borrador (sin IA configurada). Puedes responder manualmente.</p>`}
    `;

    const html = baseEmailHtml({
      title: 'Nuevo lead Corporate',
      preheader: `${companyName} · ${clinicsCount} sedes · ${practitionersCount} especialistas`,
      bodyHtml,
      footerNoteHtml: 'Este email ha sido generado automáticamente desde el formulario Corporate de FisioTool Pro.'
    });

    // INFO email para ventas/administración
    await sendEmail({
      to: adminEmail,
      subject: `[ANA] ${subject}`,
      html,
      text: `Nuevo lead Corporate\nEmpresa: ${companyName}\nContacto: ${contactName}\nEmail: ${email}\nTel: ${phone}\nSedes: ${clinicsCount}\nEspecialistas: ${practitionersCount}\nServicios: ${services.join(', ')}\nNotas: ${notes}\nLead ID: ${ref.id}\n`,
      // Enviamos desde el buzón corporativo de Ana para que todo pase por su control
      type: 'ANA'
    });

    return res.json({ success: true, id: ref.id });
  } catch (e) {
    console.error('[CORPORATE_LEAD] Error:', e.message);
    return res.status(500).json({ success: false, error: 'Error interno' });
  }
};

// --- 🤖 ANA CHAT PÚBLICO (para pacientes) ---
const getClinicInfo = async (req, res) => {
  try {
    const ref = String(req.query.ref || req.query.clinicId || '').trim();
    if (!ref) return res.status(400).json({ success: false, error: 'ref requerido' });

    const doc = await db.collection('clinicas').doc(ref).get();
    if (!doc.exists) return res.status(404).json({ success: false, error: 'Clínica no encontrada' });

    const data = doc.data() || {};
    const anaFoto = data.ana_photo_path
      ? `/api/public/ana-photo/${ref}?v=${data.ana_photo_v || 0}`
      : (data.ana_photo || null);
    return res.json({
      success: true,
      data: {
        nombre_clinica: data.nombre_clinica || data.nombre || '',
        nombre: data.nombre_clinica || data.nombre || '',
        logo_url: data.logo_url || null,
        ana_nombre: data.ana_name || 'Ana',
        ana_color: data.ana_color || '#075E54',
        ana_foto: anaFoto,
        ana_usa_logo_clinica: !!data.ana_use_clinic_logo,
        ana_welcome: data.ana_welcome || null
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};

const anaChat = async (req, res) => {
  try {
    const { message, clinicId } = req.body || {};

    // 🚀 HARD-LOG DE ENTRADA (Experto recommendation)
    console.log('🚀 DEBUG: Request received for clinic:', clinicId, 'API_KEY_PRESENT:', !!process.env.ANTHROPIC_API_KEY);
    console.log('🚀 DEBUG: Message:', message);
    console.log('🚀 DEBUG: Headers:', JSON.stringify(req.headers, null, 2));

    if (!message || !clinicId) {
      return res.status(400).json({ success: false, error: 'Mensaje y clinicId requeridos' });
    }

    // Verificar que la clínica existe y está activa
    const clinicDoc = await db.collection('clinicas').doc(clinicId).get();
    if (!clinicDoc.exists) {
      return res.status(404).json({ success: false, error: 'Clínica no encontrada' });
    }

    const clinicData = clinicDoc.data() || {};
    // Temporarily disable subscription check for testing
    // if (!clinicData.subscription_active) {
    //   return res.status(403).json({ success: false, error: 'Clínica no activa' });
    // }

    // Generar respuesta con Ana
    const { history = [], userName, userEmail, userPhone } = req.body;
    const result = await anaService.generatePatientResponse({
      message: String(message).trim(),
      clinicName: clinicData.nombre_clinica || clinicData.nombre || 'la clínica',
      clinicId,
      history,
      userName,
      userEmail,
      userPhone
    });

    const responseText = typeof result === 'string' ? result : result.response;
    const paymentLink = typeof result === 'object' ? result.paymentLink : null;

    console.log('🚀 DEBUG: Ana result successfully generated');
    console.log('🚀 DEBUG: Response preview:', responseText?.substring(0, 100));

    return res.json({
      success: true,
      response: responseText,
      ...(paymentLink ? { paymentLink } : {})
    });
  } catch (e) {
    console.error('🔥 [ANA CHAT] Full Error:', e);
    console.error('🔥 [ANA CHAT] Message:', e.message);
    console.error('🔥 [ANA CHAT] Stack:', e.stack);

    // Si es error de JSON, dar respuesta útil
    if (e.message.includes('JSON.parse')) {
      return res.status(500).json({
        success: false,
        response: 'Error técnico en el procesamiento. Por favor, intenta de nuevo con un mensaje más simple.'
      });
    }

    return res.status(500).json({
      success: false,
      response: 'Lo siento, estoy teniendo problemas técnicos. Por favor, llama a la clínica.'
    });
  }
};

/**
 * 🎯 ANA PROSPECTO CHAT - Para leads que quieren conocer FisioTool
 */
const anaProspectoChat = async (req, res) => {
  try {
    const { message, userName, userEmail } = req.body || {};

    if (!message) {
      return res.status(400).json({ success: false, error: 'Mensaje requerido' });
    }

    console.log('🎯 [ANA PROSPECTO] Mensaje recibido:', message);

    // Importar ProspectoSkill y SkillEngine
    const ProspectoSkill = require('../services/skills/prospectoSkill');
    const { SkillEngine } = require('../services/anaSkillEngine');
    const { getOrCreateSession, addMessage } = require('../services/conversationMemoryService');
    
    // Crear engine y registrar skill
    const engine = new SkillEngine();
    const prospectoSkill = new ProspectoSkill();
    engine.registerSkill(prospectoSkill);
    
    // Crear sesión para el prospecto
    const userIdentifier = userEmail || `prospect_${Date.now()}`;
    const session = await getOrCreateSession('global_prospects', userIdentifier, 'web');
    
    // Clasificar intent usando el engine
    const classification = await engine.classifyIntent(message, {
      lastIntent: session.context?.lastIntent,
      lastSkill: session.context?.lastSkill
    });
    
    console.log('🎯 [ANA PROSPECTO] Intent clasificado:', classification.intentId, 'Confidence:', classification.confidence);
    
    // Formatear historial de sesión para Claude
    const sessionHistory = (session.history || []).slice(-12)
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: String(msg.content || msg.text || '')
      }))
      .filter(m => m.content.trim().length > 0);

    // Ejecutar skill con historial conversacional
    const result = await prospectoSkill.execute(classification.intentId, {
      ...classification.entities,
      message
    }, {
      userName: userName || null,
      userEmail: userEmail || null,
      conversationHistory: sessionHistory
    });
    
    // Guardar en memoria
    await addMessage(session.sessionId, 'user', message, { intent: classification.intentId });
    await addMessage(session.sessionId, 'assistant', result.text, {
      skill: 'prospecto',
      intent: classification.intentId,
      confidence: result.confidence
    });
    
    console.log('🎯 [ANA PROSPECTO] Respuesta generada:', result.text.substring(0, 100));

    return res.json({
      success: true,
      response: result.text,
      metadata: result.metadata
    });
  } catch (e) {
    console.error('🔥 [ANA PROSPECTO] Error:', e);
    console.error('🔥 [ANA PROSPECTO] Stack:', e.stack);
    return res.status(500).json({
      success: false,
      response: 'Lo siento, estoy teniendo problemas técnicos. Por favor, intenta de nuevo.'
    });
  }
};

const healthCheck = async (req, res) => {
  const checks = { firestore: false, claude: false, stripe: false };
  try {
    await db.collection('clinicas').limit(1).get();
    checks.firestore = true;
  } catch (_) {}
  checks.claude = !!process.env.ANTHROPIC_API_KEY;
  checks.stripe = !!process.env.STRIPE_SECRET_KEY;
  const allOk = Object.values(checks).every(Boolean);
  return res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ok' : 'degraded',
    checks,
    ts: new Date().toISOString()
  });
};

module.exports = {
  submitCorporateLead,
  getClinicInfo,
  healthCheck,
  anaChat,
  anaProspectoChat,
  getClinicLogo: async (req, res) => {
    try {
      const clinicId = String(req.params.clinicId || '').trim();
      if (!clinicId) return res.status(400).send('clinicId requerido');

      const doc = await db.collection('clinicas').doc(clinicId).get();
      if (!doc.exists) return res.status(404).send('not found');
      const data = doc.data() || {};
      const path = String(data.logo_path || '').trim();
      if (!path) return res.status(404).send('no logo');

      const ext = path.split('.').pop()?.toLowerCase();
      const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      const stream = getReadStream(path);
      stream.on('error', () => res.status(404).end());
      stream.pipe(res);
    } catch (e) {
      return res.status(500).send('error');
    }
  },

  getVapidPublicKey: async (req, res) => {
    try {
      const { initEnv } = require('../config/env');
      const env = await initEnv();
      if (!env.VAPID_PUBLIC_KEY) return res.status(503).json({ error: 'Push not configured' });
      return res.json({ publicKey: env.VAPID_PUBLIC_KEY });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },

  savePushSubscription: async (req, res) => {
    try {
      const { subscription, clinicId, email, nombre } = req.body;
      if (!subscription || !clinicId || !email) {
        return res.status(400).json({ error: 'subscription, clinicId y email son requeridos' });
      }
      const { savePushSubscription } = require('../services/pushNotificationService');
      const r = await savePushSubscription({ clinicId, email, nombre, subscription });
      return res.json(r);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },

  getAnaPhoto: async (req, res) => {
    try {
      const clinicId = String(req.params.clinicId || '').trim();
      if (!clinicId) return res.status(400).send('clinicId requerido');

      const doc = await db.collection('clinicas').doc(clinicId).get();
      if (!doc.exists) return res.status(404).send('not found');
      const data = doc.data() || {};
      const path = String(data.ana_photo_path || '').trim();
      if (!path) return res.status(404).send('no photo');

      const ext = path.split('.').pop()?.toLowerCase();
      const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      const stream = getReadStream(path);
      stream.on('error', () => res.status(404).end());
      stream.pipe(res);
    } catch (e) {
      return res.status(500).send('error');
    }
  }
};

