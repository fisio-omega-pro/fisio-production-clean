const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { PORT } = require('./config/env');
const apiRoutes = require('./routes/apiRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. CONFIGURACIÓN DE CORS ULTRA-COMPATIBLE (Cero bloqueos en Cloud Shell)
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// 2. MONITOR DE TRÁFICO (Caja Negra)
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] PETICIÓN: ${req.method} ${req.path}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 3. RUTA DE DIAGNÓSTICO (Para probar si el cable funciona)
app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: "Motor Omega respondiendo correctamente" });
});

// 4. RUTAS DE API
app.use('/api', apiRoutes);

// ==========================================
// 5. SERVIR FRONTEND (ENRUTADOR INTELIGENTE NEXT.JS)
// ==========================================
const nextOutPath = path.join(__dirname, '../public-next/out');

if (fs.existsSync(nextOutPath)) {
  app.use(express.static(nextOutPath, {
    extensions: ['html'], // Permite que /dashboard cargue /dashboard.html automáticamente
    index: 'index.html'
  }));

  app.get('*', (req, res) => {
    // Si la petición es para la API, no hacemos nada aquí
    if (req.path.startsWith('/api')) return res.status(404).json({ error: "Endpoint no encontrado" });

    // 1. Intentamos buscar el archivo exacto (ej: /dashboard.html)
    let cleanPath = req.path.replace(/\/$/, ""); // Quita la barra final si existe
    let file = path.join(nextOutPath, cleanPath + '.html');

    if (fs.existsSync(file)) {
      return res.sendFile(file);
    }

    // 2. Intentamos buscar en subcarpetas (ej: /dashboard/index.html)
    let indexFile = path.join(nextOutPath, cleanPath, 'index.html');
    if (fs.existsSync(indexFile)) {
      return res.sendFile(indexFile);
    }

    // 3. Fallback para SPA (Single Page Application)
    res.sendFile(path.join(nextOutPath, 'index.html'));
  });
} else {
  console.error("❌ ERROR CRÍTICO: La carpeta public-next/out no existe. Ejecuta npm run build.");
}

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║   🏎️  MOTOR OMEGA: ACTIVO Y ESCUCHANDO             ║
║   PUERTO: ${PORT}                                     ║
╚═══════════════════════════════════════════════════╝
  `);
});