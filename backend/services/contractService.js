const { db, Timestamp } = require('../config/firebase');
const { sendEmail } = require('./emailSenderService');

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
  const text =
    `Hola ${nombre_clinica},\n\n` +
    `Soy Ana.\n` +
    `Tu cuenta ya está creada y operativa.\n\n` +
    `Tu contrato de suscripción: ${contractNumber}\n\n` +
    `HOJA DE RUTA (5 minutos):\n` +
    `1) Entra al dashboard: https://fisiotool.com/login\n` +
    `2) Configura cobros (Stripe/Bizum) en tu panel.\n` +
    `3) Añade tu primer paciente.\n` +
    `4) Crea tu primera cita.\n` +
    `5) Habla con Ana dentro del dashboard para automatizar agenda.\n\n` +
    `Si necesitas ayuda, responde a este email.\n\n` +
    `— Ana, Directora de Operaciones\n`;

  await sendEmail(email, subject, text, 'ANA');
}

module.exports = {
  archiveContract,
  sendWelcomeEmail
};

