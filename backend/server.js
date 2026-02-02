const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { initEnv } = require('./config/env');
const helmet = require('helmet');
const apiRoutes = require('./routes/apiRoutes');

async function initialize() {
  await initEnv();
  
  // 🔓 APERTURA DE CORS PARA PRODUCCIÓN (VERCEL)
  app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-foundry-key']
  }));

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use('/api', apiRoutes);
  app.get('/', (req, res) => res.status(200).send('FISIOTOOL PRO ONLINE v2.0'));

  // 📧 CRON JOB: Ana revisa su inbox cada 5 minutos
  const { readEmails } = require('./services/emailReaderService');
  setInterval(async () => {
    console.log('📧 [CRON] Ana revisando inbox...');
    try {
      await readEmails();
    } catch (e) {
      console.error('🔥 [CRON] Error en revisión de emails:', e.message);
    }
  }, 5 * 60 * 1000); // 5 minutos
  
  // Primera revisión inmediata al iniciar
  setTimeout(() => readEmails().catch(e => console.error('🔥 Error en primera revisión:', e)), 10000);

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MOTOR OMEGA ONLINE | PUERTO: ${PORT}`);
    console.log(`📧 CRON DE ANA ACTIVADO (revisa inbox cada 5 min)`);
  });
}

initialize().catch(e => {
  console.error("🔥 FALLO AL INICIAR:", e.message);
  process.exit(1);
});
