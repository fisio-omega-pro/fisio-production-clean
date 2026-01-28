/**
 * 📢 NOTIFY SERVICE - LA VOZ DEL SISTEMA
 * Gestiona el envío de Emails (Nodemailer) y WhatsApps (Meta Cloud API).
 */

const nodemailer = require('nodemailer');
const axios = require('axios');
const { 
  EMAIL_USER, EMAIL_PASS, 
  WHATSAPP_TOKEN, PHONE_NUMBER_ID 
} = require('../config/env');

// Configuración SMTP (Gmail/Hosting)
const transporter = nodemailer.createTransport({
  host: "mail.fisiotool.com", // Ajusta si usas Gmail u otro
  port: 465,
  secure: true,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

// --- 1. ENVÍO DE WHATSAPP ---
const sendWhatsapp = async (to, text) => {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.warn("⚠️ [NOTIFY] WhatsApp no configurado. Mensaje no enviado.");
    return;
  }
  
  try {
    await axios.post(
      `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: text }
      },
      { headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}` } }
    );
  } catch (error) {
    console.error("❌ [NOTIFY] Error enviando WhatsApp:", error.response?.data || error.message);
  }
};

// --- 2. ENVÍO DE EMAIL ---
const sendEmail = async (to, subject, htmlContent) => {
  if (!EMAIL_PASS) {
    console.warn("⚠️ [NOTIFY] Email PASS no configurado. Correo omitido.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Ana de FisioTool" <${EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent
    });
    console.log(`📧 [NOTIFY] Email enviado a ${to}`);
  } catch (error) {
    console.error("❌ [NOTIFY] Error enviando Email:", error.message);
  }
};

module.exports = {
  sendWhatsapp,
  sendEmail
};