module.exports = {
  PROJECT_ID: 'spatial-victory-480409-b7',
  REGION: 'europe-west1',
  JWT_SECRET: process.env.JWT_SECRET || 'fisiotool_supreme_secret_2026',
  VERIFY_TOKEN: process.env.VERIFY_TOKEN || 'fisio_prod_secure_2026',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  PHONE_NUMBER_ID: process.env.PHONE_NUMBER_ID,
  EMAIL_USER: "ana@fisiotool.com",
  EMAIL_PASS: process.env.EMAIL_PASS,
  PORT: process.env.PORT || 8080
};