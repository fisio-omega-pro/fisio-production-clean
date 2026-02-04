const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const { initEnv } = require('./config/env');
const helmet = require('helmet');
const apiRoutes = require('./routes/apiRoutes');
const errorHandler = require('./middleware/errorHandler');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
const { db, Timestamp } = require('./config/firebase');

async function initialize(options = {}) {
  const { listen = true, startCron = true } = options;
  const env = await initEnv();

  // Cloud Run / proxies
  app.set('trust proxy', 1);
  
  // 🔓 APERTURA DE CORS PARA PRODUCCIÓN (VERCEL)
  // Por defecto permitimos todo (legacy). Para endurecer, configura CORS_ORIGINS como CSV:
  // ej: "https://www.fisiotool.com,https://fisiotool.com,https://<tu-proyecto>.vercel.app"
  const corsOriginsRaw = String(process.env.CORS_ORIGINS || env.CORS_ORIGINS || '*').trim();
  const corsOrigin =
    !corsOriginsRaw || corsOriginsRaw === '*'
      ? '*'
      : (origin, cb) => {
          // Permitir requests sin origin (p.ej. server-to-server, curl)
          if (!origin) return cb(null, true);
          const allow = corsOriginsRaw
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          return allow.includes(origin) ? cb(null, true) : cb(new Error('CORS blocked'), false);
        };

  app.use(cors({
    origin: corsOrigin, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-foundry-key']
  }));

  app.use(helmet({ contentSecurityPolicy: false }));

  // ⚠️ Stripe Webhook requiere cuerpo RAW para verificar firma
  // Importante: esto debe ir ANTES del bodyParser.json
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

  const jsonParser = bodyParser.json({ limit: '10mb' });
  const urlParser = bodyParser.urlencoded({ extended: true });
  // Evitar que bodyParser re-consuma el body del webhook de Stripe
  app.use((req, res, next) => {
    if (req.originalUrl && req.originalUrl.startsWith('/api/webhooks/stripe')) return next();
    return jsonParser(req, res, next);
  });
  app.use((req, res, next) => {
    if (req.originalUrl && req.originalUrl.startsWith('/api/webhooks/stripe')) return next();
    return urlParser(req, res, next);
  });

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

  if (startCron) {
    // 📧 CRON JOB: Ana revisa su inbox cada 5 minutos
    const { readEmails } = require('./services/emailReaderService');
    const { sendEmail } = require('./services/emailSenderService');
    setInterval(async () => {
      console.log('📧 [CRON] Ana revisando inbox...');
      try {
        await readEmails();
      } catch (e) {
        console.error('🔥 [CRON] Error en revisión de emails:', e.message);
      }

      // 🧾 LLC: alertas de obligaciones (3/2/1/0 días). Idempotente por diffDays.
      try {
        const snap = await db.collection('foundry_alerts').where('status', '==', 'vigilando').get();
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        for (const doc of snap.docs) {
          const a = doc.data() || {};
          const dateStr = String(a.target_date || a.date || '').trim();
          if (!dateStr) continue;
          const target = new Date(dateStr);
          if (Number.isNaN(target.getTime())) continue;
          target.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (![3, 2, 1, 0].includes(diffDays)) continue;

          const notified = Array.isArray(a.notified_days) ? a.notified_days : [];
          if (notified.includes(diffDays)) continue;

          await sendEmail({
            to: env.ADMIN_EMAIL || 'fisiotoolsaas@gmail.com',
            subject: `⚠️ LLC: ${a.title || 'Obligación'} (${diffDays} día(s))`,
            text: `Plazo legal: quedan ${diffDays} día(s) para "${a.title || 'Obligación'}". Fecha objetivo: ${dateStr}.`,
            type: 'INFO'
          });

          await db.collection('foundry_alerts').doc(doc.id).set({
            notified_days: admin.firestore.FieldValue.arrayUnion(diffDays),
            updated_at: Timestamp.now(),
          }, { merge: true });
        }
      } catch (e) {
        console.error('🔥 [CRON] Error en alertas LLC:', e.message);
      }
    }, 5 * 60 * 1000); // 5 minutos
    
    // Primera revisión inmediata al iniciar
    setTimeout(() => readEmails().catch(e => console.error('🔥 Error en primera revisión:', e)), 10000);
  }

  const PORT = process.env.PORT || 8080;
  // Error handler al final (después de rutas)
  app.use(errorHandler);

  if (listen) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 MOTOR OMEGA ONLINE | PUERTO: ${PORT}`);
      if (startCron) console.log(`📧 CRON DE ANA ACTIVADO (revisa inbox cada 5 min)`);
    });
  }

  return { app, port: PORT };
}

if (require.main === module) {
  initialize().catch(e => {
    console.error("🔥 FALLO AL INICIAR:", e.message);
    process.exit(1);
  });
} else {
  module.exports = { app, initialize };
}
