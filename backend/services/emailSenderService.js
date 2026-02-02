const nodemailer = require('nodemailer');
const { initEnv } = require('../config/env');

const sendEmail = async (options) => {
  // Soportar tanto el formato antiguo como el nuevo
  let to, subject, text, html, type, attachments;
  
  if (typeof options === 'object' && options.to) {
    // Nuevo formato: sendEmail({ to, subject, html, type })
    ({ to, subject, text, html, type = 'ANA', attachments } = options);
  } else {
    // Formato antiguo: sendEmail(to, subject, text, type)
    to = arguments[0];
    subject = arguments[1];
    text = arguments[2];
    type = arguments[3] || 'ANA';
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
    const mailOptions = { 
      from: `"${type === 'ANA' ? 'Ana - FisioTool Pro' : 'FisioTool Info'}" <${credentials.user}>`, 
      to, 
      subject
    };
    
    // Agregar texto o HTML según lo que esté disponible
    if (html) mailOptions.html = html;
    if (text) mailOptions.text = text;
    if (attachments) mailOptions.attachments = attachments;
    
    await transporter.sendMail(mailOptions);
    console.log(`✅ [MAIL] Enviado desde ${credentials.user} a ${to}`);
  } catch (e) { 
    console.error("🔥 Error envío mail:", e.message); 
    throw e;
  }
};
module.exports = { sendEmail };
