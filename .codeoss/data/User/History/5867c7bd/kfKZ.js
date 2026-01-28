const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { PORT } = require('./config/env');
const apiRoutes = require('./routes/apiRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ==========================================
// 1. CONFIGURACIÓN DE CORS & PREFLIGHT (Optimizada para Túneles/Cloud Shell)
// ==========================================
const corsOptions = {
  origin: true, // Refleja el origen de la petición
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  preflightContinue: false,
  optionsSuccessStatus: 204 // Algunos navegadores antiguos prefieren 204
};

app.use(cors(corsOptions));

// Manejador explícito de OPTIONS para asegurar respuesta inmediata
// Esto resuelve el bloqueo en entornos de proxy agresivos
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-requested-with');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// ==========================================
// 2. MIDDLEWARES DE PARSEO Y MONITORIZACIÓN
// ==========================================
app.use((req, res, next) => {
  console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 3. RUTAS DE API
// ==========================================
app.get('/api/ping', (req, res) => {
  res.json({ success: true, message: "Motor Omega respondiendo correctamente" });
});

app.use('/api', apiRoutes);

// ==========================================
// 4. SERVIR FRONTEND (NEXT.JS STATIC EXPORT)
// ==========================================
const nextOutPath = path.join(__dirname, '../public-next/out');

if (fs.existsSync(nextOutPath)) {
  app.use(express.static(nextOutPath, {
    extensions: ['html'],
    index: 'index.html'
  }));

  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: "Endpoint no encontrado" });
    }

    const cleanPath = req.path.replace(/\/$/, "");
    const filePath = path.join(nextOutPath, cleanPath + '.html');

    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    const indexFilePath = path.join(nextOutPath, cleanPath, 'index.html');
    if (fs.existsSync(indexFilePath)) {
      return res.sendFile(indexFilePath);
    }

    res.sendFile(path.join(nextOutPath, 'index.html'));
  });
} else {
  console.error("❌ ERROR CRÍTICO: La carpeta public-next/out no existe.");
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