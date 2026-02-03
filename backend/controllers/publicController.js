const { db, Timestamp } = require('../config/firebase');
const { initEnv } = require('../config/env');
const { sendEmail } = require('../services/emailSenderService');
const { baseEmailHtml, escapeHtml } = require('../services/emailTemplates');

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
      notes,
      ip,
      userAgent,
      createdAt: Timestamp.now(),
    };

    const ref = await db.collection('corporate_leads').add(lead);

    const env = await initEnv();
    const to = (env.INFO_MAIL && env.INFO_MAIL.user) ? env.INFO_MAIL.user : (env.ADMIN_EMAIL || 'fisiotoolsaas@gmail.com');

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
        ${notes ? `<p class="p"><strong>Notas:</strong><br/>${escapeHtml(notes).replace(/\n/g,'<br/>')}</p>` : ''}
        <p class="muted">Lead ID: ${escapeHtml(ref.id)} · IP: ${escapeHtml(ip)}</p>
      </div>
    `;

    const html = baseEmailHtml({
      title: 'Nuevo lead Corporate',
      preheader: `${companyName} · ${clinicsCount} sedes · ${practitionersCount} especialistas`,
      bodyHtml,
      footerNoteHtml: 'Este email ha sido generado automáticamente desde el formulario Corporate de FisioTool Pro.'
    });

    // INFO email para ventas/administración
    await sendEmail({
      to,
      subject: `Lead Corporate: ${companyName} (${clinicsCount} sedes · ${practitionersCount} especialistas)`,
      html,
      text: `Nuevo lead Corporate\nEmpresa: ${companyName}\nContacto: ${contactName}\nEmail: ${email}\nTel: ${phone}\nSedes: ${clinicsCount}\nEspecialistas: ${practitionersCount}\nServicios: ${services.join(', ')}\nNotas: ${notes}\nLead ID: ${ref.id}\n`,
      type: 'INFO'
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

