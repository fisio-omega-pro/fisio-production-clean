const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { initEnv } = require('./config/env');
const helmet = require('helmet');
const apiRoutes = require('./routes/apiRoutes');
const errorHandler = require('./middleware/errorHandler');
const rateLimit = require('express-rate-limit');

async function initialize() {
  await initEnv();

  // Cloud Run / proxies
  app.set('trust proxy', 1);
  
  // 🔓 APERTURA DE CORS PARA PRODUCCIÓN (VERCEL)
  app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-foundry-key']
  }));

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  // Rutas de diagnóstico (sin auth)
  const diagnostics = require('./routes/diagnostics');
  app.use('/diagnostics', diagnostics);
  
  // 🧱 Rate limiting básico (protege de abuso)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });
  app.use('/api', apiLimiter);

  app.use('/api', apiRoutes);
  app.get('/', (req, res) => res.status(200).send('FISIOTOOL PRO ONLINE'));

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
  // Error handler al final (después de rutas)
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MOTOR OMEGA ONLINE | PUERTO: ${PORT}`);
    console.log(`📧 CRON DE ANA ACTIVADO (revisa inbox cada 5 min)`);
  });
}

initialize().catch(e => {
  console.error("🔥 FALLO AL INICIAR:", e.message);
  process.exit(1);
});
