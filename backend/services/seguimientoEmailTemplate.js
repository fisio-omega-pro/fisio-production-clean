const { baseEmailHtml, escapeHtml } = require('./emailTemplates');

function generateSeguimientoEmail({
  patientName,
  clinicName,
  assistantName,
  appUrl,
  clinicPhone,
  clinicEmail,
  sessionDate
}) {
  const safe = (s) => escapeHtml(s);

  const bodyHtml = `
    <div class="block-w">
      <h1 class="h1">¿Cómo te encuentras, ${safe(patientName)}?</h1>
      <p class="p">
        Soy ${safe(assistantName)} de <strong>${safe(clinicName)}</strong>. Han pasado un par de días
        desde tu última sesión${sessionDate ? ` del ${safe(sessionDate)}` : ''} y quería saber cómo te estás recuperando.
      </p>
    </div>

    <div class="block-w2">
      <h3 class="h1" style="font-size: 17px; margin-bottom: 10px;">🩺 Es normal que notes…</h3>
      <div class="box" style="margin-bottom: 12px;">
        <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
          <span style="font-size: 15px; margin-right: 10px;">✅</span>
          <span style="font-size: 13px; color: #374151;">Cierta sensación de tensión o ligero dolor muscular (es parte del proceso)</span>
        </div>
        <div style="display: flex; align-items: flex-start; margin-bottom: 8px;">
          <span style="font-size: 15px; margin-right: 10px;">✅</span>
          <span style="font-size: 13px; color: #374151;">Mayor movilidad o sensación de alivio respecto a antes</span>
        </div>
        <div style="display: flex; align-items: flex-start;">
          <span style="font-size: 15px; margin-right: 10px;">⚠️</span>
          <span style="font-size: 13px; color: #374151;">Si el dolor aumenta considerablemente, contáctanos — te ayudamos a ajustar el tratamiento</span>
        </div>
      </div>
    </div>

    <div class="block-w">
      <p class="p">¿Listo para tu próxima sesión? Puedes reservarla fácilmente desde nuestra app:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${safe(appUrl)}" class="cta" style="display: inline-block; background: #0066ff; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 14px;">
          📅 Reservar mi próxima cita
        </a>
      </div>
      <p class="p" style="color: #6b7280; font-size: 13px; text-align: center;">
        O simplemente responde a este email y te buscamos el hueco perfecto.
      </p>
    </div>

    <div class="block-w2">
      <p class="p" style="margin: 0;">
        <strong>Un saludo,</strong><br>
        ${safe(assistantName)} — ${safe(clinicName)}<br>
        <span style="color: #6b7280; font-size: 12px;">🤖 Asistente virtual · Powered by FisioTool</span>
      </p>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p class="p" style="margin: 0; font-size: 12px; color: #6b7280;">
          📞 <strong>Contacto:</strong> ${safe(clinicPhone)}<br>
          📧 <strong>Email:</strong> ${safe(clinicEmail)}
        </p>
      </div>
    </div>
  `;

  const footerNoteHtml = `
    Este email de seguimiento te llega a través de FisioTool, la plataforma inteligente de gestión de ${safe(clinicName)}.
    Si no quieres recibir más comunicaciones, puedes responder a este email solicitando tu baja.
  `;

  return baseEmailHtml({
    title: `¿Cómo te encuentras, ${safe(patientName)}? — ${safe(clinicName)}`,
    preheader: `${safe(assistantName)} de ${safe(clinicName)} quiere saber cómo estás tras tu última sesión`,
    bodyHtml,
    footerNoteHtml,
    unsubscribeUrl: null
  });
}

module.exports = { generateSeguimientoEmail };
