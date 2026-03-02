const nodemailer = require('nodemailer');
const { initEnv } = require('../config/env');

/**
 * Soporta:
 * - sendEmail(to, subject, text, type)
 * - sendEmail({ to, subject, text?, html?, type? })
 */
const sendEmail = async (arg1, arg2, arg3, arg4) => {
  let to, subject, text, html, type;
  if (arg1 && typeof arg1 === 'object' && arg1.to) {
    ({ to, subject, text, html, type = 'ANA' } = arg1);
  } else {
    to = arg1;
    subject = arg2;
    text = arg3;
    type = arg4 || 'ANA';
  }

  const env = await initEnv();
  
  // SISTEMA HÍBRIDO INTELIGENTE
  let credentials, fromName;
  if (type === 'ANA') {
    // Usar ana@fisiotool.com (configurado) con nombre híbrido
    credentials = env.ANA_MAIL; // Ya configurado y funciona
    fromName = arg1 && arg1.clinicName ? 
      `${arg1.clinicName} via FisioTool` : 
      'FisioTool Pro';
  } else {
    credentials = env.INFO_MAIL;
    fromName = 'FisioTool Pro';
  }

  const splitRecipients = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.flatMap((x) => splitRecipients(x));
    return String(value)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
  const parseLocalDomain = (email) => {
    const s = String(email || '').trim();
    const at = s.lastIndexOf('@');
    if (at <= 0) return { local: '', domain: '' };
    return { local: s.slice(0, at), domain: s.slice(at + 1).toLowerCase() };
  };

  const isBlockedRecipient = (email) => {
    const raw = String(email || '').trim();
    const norm = normalizeEmail(raw);
    if (!norm.includes('@')) return { blocked: true, reason: 'EMAIL_INVALIDO' };
    const { local, domain } = parseLocalDomain(norm);
    // ✅ Blindaje solicitado: evitar rebotes por plus-addressing interno (SiteGround suele no aceptarlo)
    if (domain === 'fisiotool.com' && local.includes('+') && String(env.ALLOW_FISIOTOOL_PLUS || '') !== '1') {
      return { blocked: true, reason: 'BLOQUEADO_PLUS_FISIOTOOL' };
    }
    return { blocked: false };
  };

  const recipients = splitRecipients(to);
  for (const r of recipients) {
    const check = isBlockedRecipient(r);
    if (check.blocked) {
      const msg = `⛔️ [MAIL] Bloqueado envío a "${r}" (${check.reason}).`;
      console.warn(msg);
      return { ok: false, blocked: true, reason: check.reason, to: r };
    }
  }

  const transporter = nodemailer.createTransport({
    host: 'gmadm1033.siteground.biz',
    port: 465,
    secure: true,
    auth: { user: credentials.user, pass: credentials.pass }
  });

  try {
    const info = await transporter.sendMail({ 
      from: `"${fromName}" <${credentials.user}>`, 
      to, 
      subject, 
      ...(html ? { html } : {}),
      ...(text ? { text } : {})
    });
    console.log(`✅ [MAIL] Enviado desde ${credentials.user} a ${to}`);
    return { ok: true, messageId: info && info.messageId ? info.messageId : null };
  } catch (e) {
    console.error("🔥 Error envío mail:", e.message);
    return { ok: false, error: e.message };
  }
};
module.exports = { sendEmail };
