// PLANTILLA PROFESIONAL PARA RECUPERACIÓN DE PACIENTES
const { baseEmailHtml, escapeHtml } = require('./emailTemplates');

function generateRecaptacionEmail({ 
  patientName, 
  clinicName, 
  assistantName, 
  appUrl, 
  clinicPhone,
  clinicEmail 
}) {
  const safePatientName = escapeHtml(patientName);
  const safeClinicName = escapeHtml(clinicName);
  const safeAssistantName = escapeHtml(assistantName);
  const safeAppUrl = escapeHtml(appUrl);
  const safeClinicPhone = escapeHtml(clinicPhone);
  const safeClinicEmail = escapeHtml(clinicEmail);

  const bodyHtml = `
    <div class="block-w">
      <h1 class="h1">Hola ${safePatientName}, ¿cómo estás?</h1>
      <p class="p">Te extrañamos en <strong>${safeClinicName}</strong>. Ha pasado tiempo desde tu última visita y nos gustaría saber cómo estás.</p>
    </div>

    <div class="block-w2">
      <h3 class="h1" style="font-size: 18px; margin-bottom: 12px;">💡 Novedad: App móvil de ${safeClinicName}</h3>
      <p class="p">Ahora puedes gestionar tus citas desde nuestra aplicación móvil:</p>
      <div style="background: #f3f7ff; border: 1px solid #dbe7ff; border-radius: 14px; padding: 16px; margin: 16px 0;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 16px;">📅</span>
          <span style="margin-left: 8px; font-weight: 600;">Reserva tus citas cuando quieras</span>
        </div>
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 16px;">🔔</span>
          <span style="margin-left: 8px; font-weight: 600;">Recibe recordatorios automáticos</span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="font-size: 16px;">💬</span>
          <span style="margin-left: 8px; font-weight: 600;">Comunicación directa con nosotros</span>
        </div>
      </div>
    </div>

    <div class="block-w">
      <p class="p">¿Te gustaría retomar tus tratamientos?</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${safeAppUrl}" class="cta" style="display: inline-block; background: #0066ff; color: #fff !important; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 800; font-size: 14px;">
          Descargar App de ${safeClinicName}
        </a>
      </div>
      <p class="p">O simplemente responde a este email y te ayudaremos a encontrar el mejor momento para tu visita.</p>
    </div>

    <div class="block-w2">
      <p class="p" style="margin: 0;">
        <strong>Un saludo,</strong><br>
        ${safeAssistantName} - ${safeClinicName}<br>
        <span style="color: #6b7280; font-size: 12px;">🤖 Powered by FisioTool</span>
      </p>
      <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p class="p" style="margin: 0; font-size: 12px; color: #6b7280;">
          📞 <strong>Contacto:</strong> ${safeClinicPhone}<br>
          📧 <strong>Email:</strong> ${safeClinicEmail}
        </p>
      </div>
    </div>
  `;

  const footerNoteHtml = `
    Este email te llega a través de FisioTool, la plataforma inteligente de gestión de ${safeClinicName}. 
    Si no quieres recibir más comunicaciones, puedes responder a este email solicitando tu baja.
  `;

  return baseEmailHtml({
    title: `Hola ${safePatientName}, te extrañamos en ${safeClinicName}`,
    preheader: `Somos ${safeClinicName} y te contactamos a través de FisioTool`,
    bodyHtml,
    footerNoteHtml,
    unsubscribeUrl: null
  });
}

module.exports = {
  generateRecaptacionEmail
};
