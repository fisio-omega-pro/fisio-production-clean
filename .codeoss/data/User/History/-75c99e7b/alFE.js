/**
 * 🚀 SERVER MAESTRO - FISIOTOOL V2
 * Punto de entrada de la aplicación. Arquitectura Hexagonal/Capas.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Importaciones de Configuración
const { PORT, STRIPE_WEBHOOK_SECRET } = require('./config/env');
const { stripe } = require('./config/stripe');
const { db, Timestamp } = require('./config/firebase');

// Importaciones de Rutas y Middleware
const apiRoutes = require('./routes/apiRoutes');
const errorHandler = require('./middleware/errorHandler');

// Inicialización de Express
const app = express();
app.use(cors());

// ==========================================
// 1. WEBHOOKS (ANTES DE PARSEAR JSON)
// ==========================================
// Stripe necesita el cuerpo RAW para verificar la firma digital.
// Por eso definimos esto ANTES de app.use(express.json())
app.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`❌ [STRIPE] Error de firma: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejo de eventos asíncrono
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { tipo, cita_id, clinic_id } = session.metadata || {};

      if (tipo === 'reserva_cita' && cita_id) {
        await db.collection('citas').doc(cita_id).update({
          status: 'confirmada',
          tipo_pago: 'Stripe Online',
          pagado_el: Timestamp.now()
        });
        console.log(`✅ [PAGO] Cita confirmada: ${cita_id}`);
      } 
      else if (tipo === 'suscripcion' && clinic_id) {
        await db.collection('clinicas').doc(clinic_id).update({
          status: 'activo',
          suscripcion_id: session.subscription,
          activado_el: Timestamp.now()
        });
        console.log(`🚀 [SUSCRIPCIÓN] Clínica activada: ${clinic_id}`);
      }
    }
    res.json({ received: true });
  } catch (error) {
    console.error("🔥 [STRIPE] Error procesando evento:", error);
    res.status(500).send("Error interno");
  }
});

// ==========================================
// 2. MIDDLEWARE GLOBAL
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 3. RUTAS DE LA API
// ==========================================
app.use('/api', apiRoutes);

// ==========================================
// 4. FRONTEND (NEXT.JS STATIC EXPORT)
// ==========================================
// Buscamos la carpeta 'out' en la raíz del proyecto (subiendo un nivel desde backend/)
const nextOutPath = path.join(__dirname, '../public-next/out');

if (fs.existsSync(nextOutPath)) {
  app.use(express.static(nextOutPath));

  // Manejador "Catch-All" para SPA (Single Page Application)
  // Si no es una API ni un archivo estático, devuelve index.html
  app.get('*', (req, res) => {
    // Protección para no interceptar llamadas API fallidas
    if (req.path.startsWith('/api')) return res.status(404).json({ error: "Endpoint no encontrado" });
    
    // Lógica para servir HTMLs limpios (ej: /dashboard -> /dashboard.html)
    let target = req.path === '/' ? 'index.html' : req.path;
    if (!path.extname(target)) target += '.html';
    
    const fullPath = path.join(nextOutPath, target);
    if (fs.existsSync(fullPath)) {
      res.sendFile(fullPath);
    } else {
      res.sendFile(path.join(nextOutPath, 'index.html'));
    }
  });
} else {
  console.warn("⚠️ [FRONTEND] No se encontró la carpeta 'public-next/out'. Solo API operativa.");
}

// ==========================================
// 5. GESTIÓN DE ERRORES Y ARRANQUE
// ==========================================
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════════════╗
║    🏎️  FISIOTOOL PRO - BACKEND OMEGA           ║
║    Estado: ONLINE                              ║
║    Puerto: ${PORT}                                ║
║    Modo: ${process.env.NODE_ENV || 'Desarrollo'}                  ║
╚════════════════════════════════════════════════╝
  `);
});