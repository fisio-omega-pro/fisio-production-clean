/**
 * 🚀 SERVER MAESTRO - FISIOTOOL V2 OMEGA
 * Arquitectura de Capas Profesional.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { PORT, STRIPE_WEBHOOK_SECRET } = require('./config/env');
const { stripe } = require('./config/stripe');
const { db, Timestamp } = require('./config/firebase');
const apiRoutes = require('./routes/apiRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
// 🛡️ CONFIGURACIÓN DE CORS PARA TÚNEL GOOGLE CLOUD
app.use(cors({
  origin: function (origin, callback) {
    // Permitimos cualquier origen que venga de cloudshell.dev o localhost
    if (!origin || origin.includes('cloudshell.dev') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // VITAL: Permite que pasen las cookies de sesión de Google
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Manejador específico para peticiones OPTIONS (Pre-flight)
app.options('*', cors());
// 🕵️‍♂️ MONITOR DE TRÁFICO OMEGA (Debug Global)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`📡 [API LOG] ${new Date().toISOString()} | ${req.method} ${req.path}`);
    console.log(`🔑 Auth Header: ${req.headers['authorization'] ? 'Presente' : 'FALTANTE'}`);
  }
  next();
});

// ==========================================
// 1. WEBHOOKS (Cuerpo RAW necesario para Stripe)
// ==========================================
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  if (stripe && STRIPE_WEBHOOK_SECRET) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const { tipo, clinic_id } = session.metadata || {};

        if (tipo === 'suscripcion' && clinic_id) {
          await db.collection('clinicas').doc(clinic_id).update({
            status: 'activo',
            suscripcion_id: session.subscription,
            activado_el: Timestamp.now()
          });
          console.log(`🚀 [WEBHOOK] Clínica activada: ${clinic_id}`);
        }
      }
    } catch (err) {
      console.error(`❌ [WEBHOOK_ERROR]: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
  res.json({ received: true });
});

// ==========================================
// 2. PARSERS (Para el resto de la API)
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 3. RUTAS API
// ==========================================
app.use('/api', apiRoutes);

// ==========================================
// 4. SERVIDOR DE ARCHIVOS ESTÁTICOS (NEXT.JS)
// ==========================================
const nextOutPath = path.join(__dirname, '../public-next/out');

if (fs.existsSync(nextOutPath)) {
  // Servir archivos estáticos directamente (js, css, imágenes)
  app.use(express.static(nextOutPath, { extensions: ['html'] }));

  // Lógica de resolución de rutas para evitar redirecciones a la Home
  app.get('*', (req, res) => {
    // Si la ruta empieza por /api, no hacemos nada (ya debería haber entrado arriba)
    if (req.path.startsWith('/api')) return res.status(404).json({ error: "API no encontrada" });

    // Intentamos servir el archivo .html correspondiente
    // Ejemplo: /dashboard -> /dashboard.html
    let targetFile = req.path === '/' ? 'index.html' : req.path;
    if (!path.extname(targetFile)) {
      targetFile = targetFile.replace(/\/$/, "") + ".html";
    }

    const fullPath = path.join(nextOutPath, targetFile);

    if (fs.existsSync(fullPath)) {
      res.sendFile(fullPath);
    } else {
      // Si el archivo no existe, enviamos index.html y dejamos que Next.js maneje el routing
      res.sendFile(path.join(nextOutPath, 'index.html'));
    }
  });
}

// Red de seguridad para errores
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════╗
║    🏎️  FISIOTOOL PRO - BACKEND OMEGA           ║
║    Estado: ONLINE | Puerto: ${PORT}                ║
╚════════════════════════════════════════════════╝
  `);
});