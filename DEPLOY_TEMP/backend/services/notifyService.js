const nodemailer = require('nodemailer');
const { initEnv } = require('../config/env');

const sendFoundryAlert = async (email, title, daysLeft) => {
  const env = await initEnv();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'fisiotoolsaas@gmail.com', pass: env.EMAIL_PASS }
  });

  const mailOptions = {
    from: '"Ana | The Foundry" <fisiotoolsaas@gmail.com>',
    to: email,
    subject: `⚠️ ALERTA LEGAL: ${title} (${daysLeft} días restantes)`,
    html: `
      <div style="font-family: sans-serif; background: #05070a; color: #fff; padding: 40px; border-radius: 20px;">
        <h2 style="color: #d4af37;">Protocolo de Vigilancia Activo</h2>
        <p>Detecto que se acerca el plazo para: <strong>${title}</strong>.</p>
        <p style="font-size: 24px; font-weight: bold;">Quedan ${daysLeft} días.</p>
        <hr style="border: 0; border-top: 1px solid #222; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">Este es un aviso automático de tu Directora de Inteligencia en The Foundry.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendFoundryAlert };
