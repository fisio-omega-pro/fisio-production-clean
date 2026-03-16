const COMPANY = {
  name: 'Fisiotool Software LLC',
  website: 'https://www.fisiotool.com',
  address: '1621 Central Ave, Cheyenne, WY 82001, USA',
  copyright: '© 2026 Fisiotool Software LLC'
};

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function baseEmailHtml({ title, preheader, bodyHtml, footerNoteHtml, unsubscribeUrl, textContent }) {
  const safeTitle = escapeHtml(title);
  const safePreheader = escapeHtml(preheader || '');
  const safeTextContent = textContent || '';

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      body { margin:0; padding:0; background:#f5f7fb; color:#0b1220; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif; }
      .container { max-width: 640px; margin: 0 auto; padding: 24px; }
      .card { background:#ffffff; border:1px solid #e8eefc; border-radius:18px; overflow:hidden; box-shadow: 0 10px 30px rgba(2,23,72,.06); }
      .header { background: linear-gradient(135deg,#0066ff 0%,#38bdf8 100%); padding: 26px 26px 20px; }
      .brand { font-weight: 900; letter-spacing: .3px; color:#fff; font-size: 16px; }
      .content { padding: 26px; }
      .block-w, .block-w2 { margin: 0 -26px; padding: 14px 26px; font-size: 14px; line-height: 1.6; color:#111827; }
      .block-w { background: #ffffff; }
      .block-w2 { background: #fcfcfd; }
      .h1 { margin: 0 0 10px; font-size: 22px; font-weight: 900; color:#0b1220; }
      .p { margin: 0 0 14px; font-size: 14px; line-height: 1.6; color:#111827; }
      .muted { color:#6b7280; font-size: 12px; line-height: 1.6; }
      .cta { display:inline-block; background:#0066ff; color:#fff !important; text-decoration:none; padding: 12px 18px; border-radius: 12px; font-weight: 800; font-size: 13px; }
      .box { background:#f3f7ff; border:1px solid #dbe7ff; border-radius: 14px; padding: 14px; }
      .footer { padding: 18px 26px 22px; background:#0b1220; color:rgba(255,255,255,.82); }
      .footer a { color:#93c5fd; text-decoration:none; }
      .hr { height:1px; background: rgba(255,255,255,.12); margin: 14px 0; }
      .preheader { display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; }
    </style>
  </head>
  <body>
    <span class="preheader">${safePreheader}</span>
    <div class="container">
      <div class="card">
        <div class="header">
          <div class="brand">FISIOTOOL PRO</div>
        </div>
        <div class="content">
          ${bodyHtml}
        </div>
        <div class="footer">
          <div><strong>${escapeHtml(COMPANY.name)}</strong></div>
          <div class="muted" style="color:rgba(255,255,255,.72)">${escapeHtml(COMPANY.address)}</div>
          <div class="muted" style="color:rgba(255,255,255,.72)"><a href="${COMPANY.website}">${escapeHtml(COMPANY.website.replace('https://', ''))}</a></div>
          <div class="hr"></div>
          <div class="muted" style="color:rgba(255,255,255,.72)">${escapeHtml(COMPANY.copyright)}</div>
          ${footerNoteHtml ? `<div class="muted" style="color:rgba(255,255,255,.72); margin-top:10px">${footerNoteHtml}</div>` : ''}
          ${unsubscribeUrl ? `<div class="muted" style="color:rgba(255,255,255,.72); margin-top:8px">¿Ya no quieres recibir estos correos? <a href="${unsubscribeUrl}">Darse de baja</a></div>` : ''}
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function pwaInvitationTemplate({ patientName, clinicName, pwaUrl, logoUrl }) {
  const bodyHtml = `
    <div style="max-width: 640px; margin: 0 auto; padding: 24px; font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Arial,sans-serif;">
      <div style="background:#ffffff; border:1px solid #e8eefc; border-radius:18px; overflow:hidden; box-shadow: 0 10px 30px rgba(2,23,72,.06);">
        <div style="background: linear-gradient(135deg,#0066ff 0%,#38bdf8 100%); padding: 26px 26px 20px; text-align: center;">
          ${logoUrl ? `<img src="${logoUrl}" alt="${escapeHtml(clinicName)}" style="max-width: 120px; height: auto; border-radius: 8px; margin-bottom: 15px;" />` : ''}
          <h1 style="color:#fff; font-weight: 900; letter-spacing: .3px; font-size: 16px; margin: 0;">📱 Tu clínica en tu bolsillo</h1>
        </div>
        
        <div style="padding: 26px;">
          <p style="color:#111827; font-size: 14px; line-height: 1.6; margin: 0 0 14px;">Hola <strong>${escapeHtml(patientName)}</strong>,</p>
          
          <p style="color:#111827; font-size: 14px; line-height: 1.6; margin: 0 0 14px;">Para ofrecerte una atención más ágil y cercana, en <strong>${escapeHtml(clinicName)}</strong> hemos activado tu nueva App de salud.</p>
          
          <div style="background:#f3f7ff; border:1px solid #dbe7ff; border-radius: 14px; padding: 14px; margin: 20px 0;">
            <p style="color:#111827; font-size: 14px; line-height: 1.6; margin: 0 0 10px;"><strong>¿Qué puedes hacer con nuestra App?</strong></p>
            <ul style="color:#111827; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 18px;">
              <li style="margin-bottom: 8px;">📅 Reservar y gestionar tus citas al instante</li>
              <li style="margin-bottom: 8px;">💬 Hablar directamente con Ana, tu asistente de salud</li>
              <li style="margin-bottom: 8px;">💳 Pagar tus sesiones de forma segura</li>
              <li style="margin-bottom: 8px;">🔔 Recibir recordatorios para que no te olvides de nada</li>
            </ul>
          </div>
          
          <p style="color:#111827; font-size: 14px; line-height: 1.6; margin: 0 0 14px;">Es muy sencillo: pulsa el botón de abajo desde tu móvil y selecciona <strong>"Añadir a pantalla de inicio"</strong>.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${pwaUrl}?from=email" style="display:inline-block; background:#0066ff; color:#fff !important; text-decoration:none; padding: 15px 25px; border-radius: 12px; font-weight: 800; font-size: 15px;">📱 INSTALAR APP DE ${escapeHtml(clinicName).toUpperCase()}</a>
          </div>
          
          <p style="color:#111827; font-size: 14px; line-height: 1.6; margin: 0 0 14px;">¡Nos vemos pronto!</p>
          <p style="color:#111827; font-size: 14px; line-height: 1.6; margin: 0;">El equipo de <strong>${escapeHtml(clinicName)}</strong></p>
        </div>
        
        <div style="padding: 18px 26px 22px; background:#0b1220; color:rgba(255,255,255,.82); font-size: 12px; line-height: 1.6;">
          <div style="color:rgba(255,255,255,.72); margin-bottom: 10px;">© 2026 Fisiotool Software LLC</div>
          <div style="color:rgba(255,255,255,.72);">Este mensaje ha sido enviado por tu centro de fisioterapia utilizando la tecnología de FisioTool Pro.</div>
        </div>
      </div>
    </div>
  `;

  return baseEmailHtml({
    title: `📱 Instala la App de ${clinicName}`,
    preheader: 'Gestiona tus citas y habla con tu fisioterapeuta desde tu móvil.',
    bodyHtml,
    footerNoteHtml: 'Este mensaje ha sido enviado por tu centro de fisioterapia utilizando la tecnología de FisioTool Pro.',
    textContent: `📱 Tu clínica en tu bolsillo

Hola ${patientName},

Para ofrecerte una atención más ágil y cercana, en ${clinicName} hemos activado tu nueva App de salud.

¿Qué puedes hacer con nuestra App?
📅 Reservar y gestionar tus citas al instante
💬 Hablar directamente con Ana, tu asistente de salud
💳 Pagar tus sesiones de forma segura
🔔 Recibir recordatorios para que no te olvides de nada

Es muy sencillo: pulsa el botón de abajo desde tu móvil y selecciona "Añadir a pantalla de inicio".

📱 INSTALAR APP DE ${clinicName.toUpperCase()}: ${pwaUrl}?from=email

¡Nos vemos pronto!

El equipo de ${clinicName}

---
© 2026 Fisiotool Software LLC
Enviado desde FisioTool Pro`
  });
}

module.exports = {
  baseEmailHtml,
  pwaInvitationTemplate,
  escapeHtml,
  COMPANY
};

