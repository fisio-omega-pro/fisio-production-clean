console.log("🔥 ¡ESTOY VIVO! Server.js iniciado - PRUEBA DE FUEGO DEL EXPERTO");
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuración básica
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

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

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-foundry-key'],
  optionsSuccessStatus: 204
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: { error: 'Too many requests' },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

app.use('/api', apiLimiter);

// Logging detallado de todas las peticiones
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`📋 [${timestamp}] ${req.method} ${req.originalUrl} - IP: ${ip}`);
  next();
});

// Rutas críticas que deben estar disponibles desde el inicio
const setupCriticalRoutes = () => {
  try {
    const clinicController = require('./controllers/clinicController');
    const { db } = require('./config/firebase');
    
    // Endpoint de login (CRÍTICO - debe estar disponible desde el inicio)
    app.post('/api/login', async (req, res) => {
      try {
        console.log('🔐 LOGIN REQUEST DETALLADO:');
        console.log('✅ Headers:', req.headers);
        console.log('✅ Body crudo (JSON.stringify):', JSON.stringify(req.body));
        console.log('✅ Body como objeto:', req.body);
        console.log('✅ Body keys:', Object.keys(req.body));
        console.log('✅ Content-Type:', req.headers['content-type']);
        
        const { email, password } = req.body;
        console.log(`🔐 Email extraído: ${email}`);
        console.log(`🔐 Password extraído: ${password}`);
        console.log(`🔐 Password length: ${password ? password.length : 'null'}`);
        console.log(`🔐 Password type: ${typeof password}`);
        console.log(`🔐 Password es undefined?: ${password === undefined}`);
        console.log(`🔐 Password es null?: ${password === null}`);
        console.log(`🔐 Password es string?: ${typeof password === 'string'}`);
        
        if (!email || !password) {
          console.log('❌ Email o password faltantes');
          console.log('❌ Email existe?', !!email);
          console.log('❌ Password existe?', !!password);
          return res.status(400).json({ 
            success: false, 
            error: 'Email y contraseña requeridos' 
          });
        }
        
        // Buscar clínica por email
        const clinicSnapshot = await db.collection('clinicas')
          .where('email', '==', email.toLowerCase())
          .limit(1)
          .get();
        
        if (clinicSnapshot.empty) {
          console.log('❌ Clínica no encontrada');
          return res.status(401).json({ 
            success: false, 
            error: 'Credenciales incorrectas' 
          });
        }
        
        const clinic = clinicSnapshot.docs[0].data();
        console.log('✅ Clínica encontrada:', clinic.nombre_clinica);
        
        // Validación con hash (usando bcrypt si está disponible, si no comparación directa)
        let passwordValid = false;
        
        if (clinic.password && clinic.password.length === 60) {
          // Password hasheado con bcrypt
          try {
            const bcrypt = require('bcrypt');
            passwordValid = await bcrypt.compare(password, clinic.password);
            console.log('✅ bcrypt.compare result:', passwordValid);
          } catch (e) {
            console.log('❌ Error bcrypt:', e.message);
            // Si bcrypt no está disponible, intentar comparación directa
            passwordValid = clinic.password === password;
            console.log('✅ Comparación directa result:', passwordValid);
          }
        } else {
          // Password en texto plano (fallback)
          passwordValid = clinic.password === password;
          console.log('✅ Password plano, comparación result:', passwordValid);
        }
        
        if (!passwordValid) {
          console.log('❌ Password inválido');
          return res.status(401).json({ 
            success: false, 
            error: 'Credenciales incorrectas' 
          });
        }
        
        console.log('🎉 LOGIN EXITOSO');
        // Login exitoso
        res.json({
          success: true,
          clinic: {
            id: clinicSnapshot.docs[0].id,
            email: clinic.email,
            nombre_clinica: clinic.nombre_clinica,
            config_ia: clinic.config_ia,
            stripe_account_id: clinic.stripe_account_id,
            subscription_active: clinic.subscription_active
          }
        });
        
      } catch (error) {
        console.error('🔥 Error en login:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Error interno del servidor' 
        });
      }
    });
    
    console.log('✅ Rutas críticas configuradas');
  } catch (error) {
    console.error('🔥 Error configurando rutas críticas:', error);
  }
};

// Configurar rutas críticas inmediatamente
setupCriticalRoutes();

// Health check SIEMPRE disponible
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Backend funcionando correctamente'
  });
});

// Ruta básica
app.get('/', (req, res) => {
  res.status(200).send('FISIOTOOL PRO ONLINE');
});

// Cargar rutas después de health check
let serverReady = false;

const initialize = async () => {
  try {
    console.log('🔄 Inicializando módulos...');
    
    // Firebase
    const admin = require('firebase-admin');
    const { db, Timestamp } = require('./config/firebase');
    console.log('✅ Firebase inicializado');
    
    // Env
    const { initEnv } = require('./config/env');
    await initEnv();
    console.log('✅ Variables de entorno cargadas');
    
    // Controllers específicos para dashboard
    const clinicController = require('./controllers/clinicController');
    const auth = require('./middleware/auth');
    const multer = require('multer');
    const upload = multer({ storage: multer.memoryStorage() });
    
    // Middleware de autenticación
    const ensureAuth = (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ error: 'No autorizado' });
      // Aquí iría la validación del token
      req.clinicId = 'Bx1kJ81WL8JI04wvjrUM'; // Temporal para prueba
      req.userId = 'Bx1kJ81WL8JI04wvjrUM';
      next();
    };
    
    const ensureHandler = (handler, name) => (req, res, next) => {
      Promise.resolve(handler(req, res, next)).catch(next);
    };
    
    // Rutas específicas para dashboard
    app.get('/api/dashboard/clinica', ensureAuth, ensureHandler(clinicController.getClinicData, 'getClinicData'));
    app.get('/api/dashboard/bonos', ensureAuth, ensureHandler(clinicController.getBonos, 'getBonos'));
    app.post('/api/dashboard/activate-bonos', ensureAuth, ensureHandler(clinicController.activateBonos, 'activateBonos'));
    app.post('/api/dashboard/deactivate-bonos', ensureAuth, ensureHandler(clinicController.deactivateBonos, 'deactivateBonos'));
    app.post('/api/dashboard/create-bono', ensureAuth, ensureHandler(clinicController.createBono, 'createBono'));
    app.post('/api/dashboard/cobrar-cita-bono', ensureAuth, ensureHandler(clinicController.createCitaBonoCheckout, 'createCitaBonoCheckout'));
    app.get('/api/dashboard/data', ensureAuth, ensureHandler(clinicController.getClinicData, 'getClinicData'));
          return res.status(400).json({ 
            success: false, 
            error: 'Email y contraseña requeridos' 
          });
        }
        
        // Buscar clínica por email
        const clinicSnapshot = await db.collection('clinicas')
          .where('email', '==', email.toLowerCase())
          .limit(1)
          .get();
        
        if (clinicSnapshot.empty) {
          return res.status(401).json({ 
            success: false, 
            error: 'Credenciales incorrectas' 
          });
        }
        
        const clinic = clinicSnapshot.docs[0].data();
        
        // Validación con hash (usando bcrypt si está disponible, si no comparación directa)
        let passwordValid = false;
        
        if (clinic.password && clinic.password.length === 60) {
          // Password hasheado con bcrypt
          try {
            const bcrypt = require('bcrypt');
            passwordValid = await bcrypt.compare(password, clinic.password);
          } catch (e) {
            // Si bcrypt no está disponible, intentar comparación directa
            passwordValid = clinic.password === password;
          }
        } else {
          // Password en texto plano (fallback)
          passwordValid = clinic.password === password;
        }
        
        if (!passwordValid) {
          return res.status(401).json({ 
            success: false, 
            error: 'Credenciales incorrectas' 
          });
        }
        
        // Login exitoso
        res.json({
          success: true,
          clinic: {
            id: clinicSnapshot.docs[0].id,
            email: clinic.email,
            nombre_clinica: clinic.nombre_clinica,
            config_ia: clinic.config_ia,
            stripe_account_id: clinic.stripe_account_id,
            subscription_active: clinic.subscription_active
          }
        });
        
      } catch (error) {
        console.error('🔥 Error en login:', error);
        res.status(500).json({ 
          success: false, 
          error: 'Error interno del servidor' 
        });
      }
    });
    
    console.log('✅ Rutas del dashboard cargadas');
    
    serverReady = true;
    console.log('🚀 Servidor completamente inicializado');
    
  } catch (error) {
    console.error('🔥 Error en inicialización:', error.message);
    // No lanzar el error para que el servidor siga funcionando con health check
  }
};

// Inicializar después de arrancar
setTimeout(() => {
  initialize().catch(e => console.error('🔥 Error crítico:', e));
}, 1000);

// 1. Catch-all para 404 - SIEMPRE devuelve JSON
app.use((req, res, next) => {
  console.log(`🔍 Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.originalUrl}`,
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// 2. Manejador de errores global - SIEMPRE devuelve JSON
app.use((err, req, res, next) => {
  console.error('🔥 Error global:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
    error: err.message,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MOTOR OMEGA ESCUCHANDO | PUERTO: ${PORT}`);
  console.log(`📋 Health check disponible en /api/health`);
});

module.exports = { app, initialize };
