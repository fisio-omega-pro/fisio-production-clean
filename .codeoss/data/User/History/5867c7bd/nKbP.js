/**
 * 🚀 SERVER MAESTRO - FISIOTOOL OMEGA
 * Arquitectura: Node.js + Express + Firebase + Vertex AI
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { initEnv } = require('./config/env');
const apiRoutes = require('./routes/apiRoutes');
const errorHandler = require('./middleware/errorHandler');

const startServer = async () => {
  // 1. Carga de Secretos (Bloqueante: Si no hay llaves, no arranca)
  const env = await initEnv();
  
  const app = express();

  // 2. Configuración de Red (CORS Total para Cloud Shell)
  app.use(cors({ origin: true, credentials: true }));

  // 3. Webhook de Stripe (Raw Body)
  app.post('/stripe-webhook', express.raw({ type: 'application/json' }), (req, res) => {
    // Aquí iría la lógica de validación de firma con env.STRIPE_WEBHOOK_SECRET
    console.log("💳 [STRIPE] Evento recibido");
    res.json({ received: true });
  });

  // 4. Parsers Globales
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // 5. Rutas API
  app.use('/api', apiRoutes);

  // 6. Servir Frontend (Next.js Export)
  const nextOutPath = path.join(__dirname, '../public-next/out');
  if (fs.existsSync(nextOutPath)) {
    app.use(express.static(nextOutPath));
    
    // Manejador SPA (Single Page Application)
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) return res.status(404).json({ error: "API Endpoint no encontrado" });
      
      // Intento de servir HTML limpio
      let target = req.path === '/' ? 'index.html' : req.path;
      if (!path.extname(target)) target += '.html';
      const file = path.join(nextOutPath, target);
      
      res.sendFile(fs.existsSync(file) ? file : path.join(nextOutPath, 'index.html'));
    });
  } else {
    console.warn("⚠️ [FRONTEND] Carpeta 'out' no encontrada. Ejecuta 'npm run build' en public-next.");
  }

  // 7. Manejo de Errores
  app.use(errorHandler);

  // 8. Arranque
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║   🏎️  MOTOR OMEGA: OPERATIVO                       ║
║   PUERTO: ${env.PORT}                                     ║
║   REGIÓN IA: ${env.REGION} (Soberanía UE)          ║
╚═══════════════════════════════════════════════════╝
    `);
  });
};

startServer().catch(err => {
  console.error("🔥 Error fatal al iniciar el servidor:", err);
});