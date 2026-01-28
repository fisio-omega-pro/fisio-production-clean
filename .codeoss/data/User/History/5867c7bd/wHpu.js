const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { PORT } = require('./config/env');
const apiRoutes = require('./routes/apiRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. CORS TOTAL (Blindado para Cloud Shell)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// 2. MONITOR DE LOGS (Para saber qué llega)
app.use((req, res, next) => {
  console.log(`📡 [LOG] ${req.method} ${req.path}`);
  next();
});

// 3. PARSERS (Antes de las rutas)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. RUTAS DE API (VITAL: Antes de los archivos estáticos)
app.use('/api', apiRoutes);

// 5. ARCHIVOS ESTÁTICOS (Frontend)
const nextOutPath = path.join(__dirname, '../public-next/out');
if (fs.existsSync(nextOutPath)) {
  app.use(express.static(nextOutPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) return res.status(404).json({ error: "API no encontrada" });
    
    let target = req.path === '/' ? 'index.html' : req.path;
    if (!path.extname(target)) target += '.html';
    
    const fullPath = path.join(nextOutPath, target);
    res.sendFile(fs.existsSync(fullPath) ? fullPath : path.join(nextOutPath, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SERVIDOR OMEGA EN PUERTO ${PORT} - MODO CRISIS`);
});