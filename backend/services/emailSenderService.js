const nodemailer = require('nodemailer');
const { initEnv } = require('../config/env');

const sendEmail = async (to, subject, text, type = 'ANA') => {
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
      from: `"${type === 'ANA' ? 'Ana' : 'FisioTool Info'}" <${credentials.user}>`, 
      to, 
      subject, 
      text 
    });
    console.log(`✅ [MAIL] Enviado desde ${credentials.user} a ${to}`);
  } catch (e) { console.error("🔥 Error envío mail:", e.message); }
};
module.exports = { sendEmail };
