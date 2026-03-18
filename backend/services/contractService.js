const { db, Timestamp } = require('../config/firebase');
const { sendEmail } = require('./emailSenderService');
const { baseEmailHtml, escapeHtml } = require('./emailTemplates');

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.trim()) return xf.split(',')[0].trim();
  return req.ip || req.connection?.remoteAddress || '';
}

function generateContractNumber() {
  // Formato legible + suficientemente único
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FTP-${y}${m}${day}-${rand}`;
}

function buildContractText({ contractNumber, nombre_clinica, email, plan }) {
  return (
    `CONTRATO DE SUSCRIPCIÓN - FISIOTOOL PRO\n` +
    `Número: ${contractNumber}\n\n` +
    `Cliente (clínica): ${nombre_clinica}\n` +
    `Email: ${email}\n` +
    `Plan: ${plan}\n\n` +
    `1) Objeto\n` +
    `Acceso y uso de la plataforma FisioTool Pro (SaaS) para gestión de clínica.\n\n` +
    `2) Duración\n` +
    `Suscripción mensual con renovación automática salvo cancelación.\n\n` +
    `3) Protección de datos\n` +
    `Cumplimiento RGPD/LOPD. El responsable del tratamiento de pacientes es la clínica.\n\n` +
    `4) Aceptación\n` +
    `Este contrato se considera aceptado al marcar la casilla de términos durante el registro.\n\n` +
    `Enlaces legales:\n` +
    `- Términos: https://fisiotool.com/terminos\n` +
    `- RGPD/DPA: https://fisiotool.com/rgpd\n`
  );
}

async function archiveContract({ clinicId, nombre_clinica, email, plan, req }) {
  const contractNumber = generateContractNumber();
  const now = Timestamp.now();
  const ip = req ? getClientIp(req) : '';
  const userAgent = req ? String(req.headers['user-agent'] || '') : '';

  const doc = {
    clinicId,
    contractNumber,
    nombre_clinica,
    email,
    plan,
    acceptedAt: now,
    ip,
    userAgent,
    text: buildContractText({ contractNumber, nombre_clinica, email, plan }),
    createdAt: now
  };

  const ref = await db.collection('contratos').add(doc);
  return { id: ref.id, ...doc };
}

async function sendWelcomeEmail({ email, nombre_clinica, contractNumber }) {
  const subject = 'Bienvenido a FisioTool Pro — guía rápida y contrato';
  const dashboardUrl = 'https://fisiotool.com/login';

  const videoUrl = 'https://youtu.be/Bkb8aFPoLMU';
  const text =
    `Hola ${nombre_clinica},\n\n` +
    `Soy Ana, de FisioTool Pro.\n` +
    `Tu cuenta ya está creada y operativa.\n\n` +
    `Contrato de suscripción: ${contractNumber}\n\n` +
    `HOJA DE RUTA (5 minutos):\n` +
    `1) Vídeo de primeros pasos: ${videoUrl}\n` +
    `2) Entra al dashboard: ${dashboardUrl}\n` +
    `3) Configura cobros (Stripe/Bizum).\n` +
    `4) Añade tu primer paciente.\n` +
    `5) Crea tu primera cita.\n` +
    `6) Habla con Ana dentro del dashboard.\n\n` +
    `Soporte: responde a este email.\n\n` +
    `— Ana · Directora de Operaciones\n`;

  const bodyHtml = `
    <div class="h1">Bienvenido, ${escapeHtml(nombre_clinica)}</div>
    <p class="p">Soy <strong>Ana</strong>, tu Directora de Operaciones en FisioTool Pro. Tu cuenta ya está creada y operativa.</p>
    <div class="box">
      <p class="p" style="margin:0"><strong>Contrato:</strong> ${escapeHtml(contractNumber)}</p>
    </div>
    <div style="height:14px"></div>
    <p class="p"><strong>Hoja de ruta (5 minutos):</strong></p>
    <div style="height:10px"></div>
    <a class="cta" href="${videoUrl}" target="_blank" style="background:#FF0000; color:#fff; display:inline-flex; align-items:center; gap:8px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      Ver vídeo de primeros pasos
    </a>
    <div style="height:12px"></div>
    <ol class="p" style="padding-left:18px; margin-top:0">
      <li>Entra al dashboard: <a href="${dashboardUrl}">${escapeHtml(dashboardUrl)}</a></li>
      <li>Configura cobros (Stripe/Bizum) desde tu panel.</li>
      <li>Añade tu primer paciente.</li>
      <li>Crea tu primera cita.</li>
      <li>Habla con Ana dentro del dashboard para automatizar tu agenda.</li>
    </ol>
    <p class="p">Si necesitas ayuda, responde a este email.</p>
    <a class="cta" href="${dashboardUrl}">Entrar al Dashboard</a>
    <div style="height:10px"></div>
    <p class="muted">Este correo es transaccional (alta de cuenta). Puedes gestionar comunicaciones desde soporte si lo necesitas.</p>
  `;

  const html = baseEmailHtml({
    title: subject,
    preheader: `Tu contrato ${contractNumber} y hoja de ruta.`,
    bodyHtml,
    // En transaccionales no ponemos "baja" obligatoria; dejamos nota.
    footerNoteHtml: 'Email transaccional relacionado con tu alta en el servicio.'
  });

  await sendEmail({ to: email, subject, text, html, type: 'ANA' });
}

module.exports = {
  archiveContract,
  sendWelcomeEmail
};

