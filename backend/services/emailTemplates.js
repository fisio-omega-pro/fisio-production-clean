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

function baseEmailHtml({ title, preheader, bodyHtml, footerNoteHtml, unsubscribeUrl }) {
  const safeTitle = escapeHtml(title);
  const safePreheader = escapeHtml(preheader || '');

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
          <div class="muted" style="color:rgba(255,255,255,.72)"><a href="${COMPANY.website}">${escapeHtml(COMPANY.website.replace('https://',''))}</a></div>
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

module.exports = {
  baseEmailHtml,
  escapeHtml,
  COMPANY
};

