console.log("🔥 ¡ESTOY VIVO! Server.js iniciado - PRUEBA DE FUEGO DEL EXPERTO");
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

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

// Orígenes permitidos para CORS (siempre aplicados; no dependen de env)
const CORS_ALLOW_ORIGINS = [
  'https://www.fisiotool.com',
  'https://fisiotool.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (CORS_ALLOW_ORIGINS.includes(origin)) return true;
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return true;
  return false;
}

// 🏥 Health check SÍNCRONO: responde ANTES de que initialize() cargue secretos/rutas.
// Cloud Run envía health checks nada más arrancar el contenedor; si no responde, marca 502.
let serverReady = false;
app.get('/diagnostics/health', (req, res) => {
  res.status(200).json({
    status: serverReady ? 'ready' : 'starting',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 🔒 CORS: cabeceras en TODAS las respuestas (sin depender de initEnv ni async).
// Esto garantiza que incluso si initialize() no ha terminado o ha fallado,
// las respuestas POST/GET tendrán CORS headers y el navegador no las bloqueará.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-foundry-key');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }
  next();
});

async function initialize(options = {}) {
  const { listen = true, startCron = true } = options;
  const env = await initEnv();

  // Cloud Run / proxies
  app.set('trust proxy', 1);

  // 🔒 CORS para el resto de peticiones: lista fija + env (CORS_ORIGINS / FRONTEND_URL)
  const defaultProdOrigins = ['https://www.fisiotool.com', 'https://fisiotool.com'];
  let corsOriginsRaw = String(env.CORS_ORIGINS || process.env.CORS_ORIGINS || '').trim();
  
  // En desarrollo, siempre permitir localhost
  if (process.env.NODE_ENV !== 'production') {
    corsOriginsRaw = '*';
  } else if (!corsOriginsRaw && env.FRONTEND_URL) {
    const base = String(env.FRONTEND_URL).replace(/\/+$/, '');
    const withWww = base.includes('www.') ? base : base.replace(/^(https?:\/\/)/, '$1www.');
    const withoutWww = base.replace(/^(https?:\/\/)www\./, '$1');
    corsOriginsRaw = [base, withWww, withoutWww].filter((u, i, a) => a.indexOf(u) === i).join(',');
  }
  if (!corsOriginsRaw) corsOriginsRaw = '*';
  
  const allowList = corsOriginsRaw === '*'
    ? null
    : [...defaultProdOrigins, ...corsOriginsRaw.split(',').map((s) => s.trim()).filter(Boolean)].filter((u, i, a) => a.indexOf(u) === i);
  const corsOrigin =
    corsOriginsRaw === '*'
      ? '*'
      : (origin, cb) => {
        if (!origin) return cb(null, true);
        if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return cb(null, true);
        if (allowList && allowList.includes(origin)) return cb(null, true);
        if (isOriginAllowed(origin)) return cb(null, true);
        return cb(new Error('CORS blocked'), false);
      };

  app.use(cors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-foundry-key'],
    credentials: true
  }));

  // 🔒 Headers de seguridad (X-Frame-Options, X-Content-Type-Options, HSTS, etc.)
  app.use(helmet({
    contentSecurityPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    xFrameOptions: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
  }));
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });

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

  // 🧱 Rate limiting: general API y límite estricto en auth (anti brute-force)
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 15,
    message: { error: 'Demasiados intentos. Espera 15 minutos e inténtalo de nuevo.' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });
  app.use('/api', apiLimiter);
  app.use('/api/login', authLimiter);
  app.use('/api/register', authLimiter);
  app.use('/api/auth/forgot-password', authLimiter);

  // 📋 Log de peticiones (método, ruta, IP, status, duración) — sin cuerpos ni tokens
  app.use((req, res, next) => {
    const start = Date.now();
    const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim();
    res.on('finish', () => {
      const duration = Date.now() - start;
      const log = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${duration}ms ${ip}`;
      if (res.statusCode >= 500) console.error(`🔥 ${log}`);
      else if (res.statusCode >= 400) console.warn(`⚠️ ${log}`);
      else if (process.env.NODE_ENV !== 'production') console.log(`📋 ${log}`);
    });
    next();
  });

  // 🏦 Endpoint especial para Stripe Connect profesional (sin auth por diseño Stripe)
  app.post('/vincular-banco-profesional', express.json(), async (req, res) => {
    try {
      const clinicController = require('./controllers/clinicController');
      await clinicController.vincularBancoProfesional(req, res, () => { });
    } catch (error) {
      console.error('🔥 [STRIPE_CONNECT] Error en endpoint /vincular-banco-profesional:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  });

  // 🪝 Webhook para Stripe Connect (eventos de cuentas conectadas)
  app.post('/webhook/stripe-connect', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const clinicController = require('./controllers/clinicController');
      await clinicController.handleStripeConnectWebhook(req, res, () => { });
    } catch (error) {
      console.error('🔥 [WEBHOOK] Error en endpoint /webhook/stripe-connect:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  // Health check (sin autenticación)
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      message: 'Backend funcionando correctamente'
    });
  });

  app.get('/', (req, res) => res.status(200).send('FISIOTOOL PRO ONLINE'));

  app.use('/api', apiRoutes);
  
  if (startCron) {
    // 📧 CRON JOB: Ana revisa su inbox cada 5 minutos
    const { readEmails } = require('./services/emailReaderService');
    const { sendEmail } = require('./services/emailSenderService');
    const { runCazaAutopilot } = require('./services/cazaAutopilotService');
    const { runRecaptacionAutopilot } = require('./services/recaptacionAutopilotService');
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

      // 🎯 CAZA: autopiloto de prospección por email (si campaignActive=true)
      try {
        const r = await runCazaAutopilot();
        if (r && r.sent) console.log(`🎯 [CRON] CAZA autopiloto: enviados=${r.sent}`);
      } catch (e) {
        console.error('🔥 [CRON] Error en CAZA autopiloto:', e.message);
      }

      // 🚀 RECAPTACIÓN: campañas por clínica (si modo_caza_activo=true)
      try {
        const r = await runRecaptacionAutopilot();
        if (r && r.sent) console.log(`🚀 [CRON] Recaptación: enviados=${r.sent} clinicas=${r.clinics}`);
      } catch (e) {
        console.error('🔥 [CRON] Error en recaptación:', e.message);
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

// Arranque: escuchar ANTES de initEnv() para que OPTIONS (CORS) responda aunque Secret Manager falle o tarde
const PORT = process.env.PORT || 8080;

// Forzar arranque siempre en producción
console.log('🚀 INICIANDO SERVIDOR FORZADO');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MOTOR OMEGA ESCUCHANDO | PUERTO: ${PORT} (CORS listo para todas las respuestas)`);
  initialize({ listen: false })
    .then(() => {
      serverReady = true;
      console.log(`📋 Rutas y middleware cargados`);
    })
    .catch(e => {
      console.error("🔥 FALLO AL CARGAR RUTAS:", e.message);
      console.error("🔄 Reintentando en 5s... (el servidor sigue escuchando para CORS y health)");
      setTimeout(() => {
        initialize({ listen: false })
          .then(() => { serverReady = true; console.log('📋 Rutas cargadas en segundo intento'); })
          .catch(e2 => console.error('🔥 Segundo intento fallido:', e2.message));
      }, 5000);
    });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 [PROCESS] unhandledRejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🔥 [PROCESS] uncaughtException:', err.message, err.stack);
});

module.exports = { app, initialize };
