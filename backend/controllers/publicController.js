const { db, Timestamp } = require('../config/firebase');
const { initEnv } = require('../config/env');
const { sendEmail } = require('../services/emailSenderService');
const { baseEmailHtml, escapeHtml } = require('../services/emailTemplates');
const anaService = require('../services/anaService');

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
        ${notes ? `<p class="p"><strong>Notas:</strong><br/>${escapeHtml(notes).replace(/\n/g,'<br/>')}</p>` : ''}
        <p class="muted">Lead ID: ${escapeHtml(ref.id)} · IP: ${escapeHtml(ip)}</p>
      </div>
      ${analysis?.resumen ? `<div style="height:14px"></div><div class="box"><p class="p"><strong>Resumen ejecutivo (Ana):</strong><br/>${escapeHtml(analysis.resumen).replace(/\n/g,'<br/>')}</p></div>` : ''}
      ${Array.isArray(analysis?.preguntas_clave) && analysis.preguntas_clave.length ? `<div style="height:14px"></div><div class="box"><p class="p"><strong>Preguntas clave (Ana):</strong></p><ul class="p" style="margin:0; padding-left:18px">${analysis.preguntas_clave.slice(0,6).map(q=>`<li>${escapeHtml(q)}</li>`).join('')}</ul></div>` : ''}
      ${analysis?.respuesta ? `<div style="height:14px"></div><div class="box"><p class="p"><strong>Borrador de respuesta (para consensuar):</strong><br/>${escapeHtml(analysis.respuesta).replace(/\n/g,'<br/>')}</p><p class="muted">Nota: no se enviará ninguna respuesta automática sin tu OK.</p></div>` : `<div style="height:14px"></div><p class="muted">Ana no generó borrador (sin IA configurada). Puedes responder manualmente.</p>`}
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

module.exports = {
  submitCorporateLead,
};

