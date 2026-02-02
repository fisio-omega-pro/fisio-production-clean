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
  const credentials = type === 'ANA' ? env.ANA_MAIL : env.INFO_MAIL;

  const transporter = nodemailer.createTransport({
    host: 'gmadm1033.siteground.biz',
    port: 465,
    secure: true,
    auth: { user: credentials.user, pass: credentials.pass }
  });

  try {
    await transporter.sendMail({ 
      from: `"${type === 'ANA' ? 'Ana · FisioTool Pro' : 'FisioTool Info'}" <${credentials.user}>`, 
      to, 
      subject, 
      ...(html ? { html } : {}),
      ...(text ? { text } : {})
    });
    console.log(`✅ [MAIL] Enviado desde ${credentials.user} a ${to}`);
  } catch (e) { console.error("🔥 Error envío mail:", e.message); }
};
module.exports = { sendEmail };
