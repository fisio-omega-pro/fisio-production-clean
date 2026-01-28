/**
 * 🎮 CLINIC CONTROLLER
 * Gestiona el ciclo de vida de la clínica: Registro, Autenticación y Datos del Dashboard.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, Timestamp } = require('../config/firebase');
const { JWT_SECRET } = require('../config/env');
const paymentService = require('../services/paymentService');
const { generarSlug, generarCodigoReferido } = require('../utils/helpers');

// --- 1. REGISTRO DE NUEVA CLÍNICA ---
const register = async (req, res, next) => {
  try {
    const d = req.body;
    
    // Validación básica
    if (!d.email || !d.password || !d.nombre_clinica) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    const email = d.email.toLowerCase().trim();
    
    // 1. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(d.password, salt);

    // 2. Generar Identificadores
    let slug = generarSlug(d.nombre_clinica);
    // Verificar si el slug existe (simplificado: agregamos random si hay duda)
    const exists = await db.collection('clinicas').where('slug', '==', slug).count().get();
    if (exists.data().count > 0) slug += `-${Math.floor(Math.random() * 1000)}`;

    const miCodigoReferido = generarCodigoReferido();

    // 3. Objeto de Datos
    const newClinic = {
      nombre_clinica: d.nombre_clinica,
      slug,
      email,
      password: hashedPassword,
      precio_sesion: Number(d.precio) || 100,
      fianza_reserva: Number(d.fianza) || 15,
      default_duration_min: Number(d.duracion) || 45,
      created_at: Timestamp.now(),
      status: 'pendiente_pago', // Hasta que pague en Stripe
      mi_codigo_referido: miCodigoReferido,
      plan: d.plan || 'solo'
    };

    // 4. Guardar en BD
    const ref = await db.collection('clinicas').add(newClinic);
    const clinicId = ref.id;

    // 5. Generar Token de Acceso
    const token = jwt.sign({ clinicId }, JWT_SECRET, { expiresIn: '30d' });

    // 6. Crear Checkout de Stripe (Suscripción)
    const sessionPayment = await paymentService.createSubscriptionSession(
      clinicId, email, d.plan, req
    );

    res.json({
      success: true,
      token,
      payment_url: sessionPayment.url, // El frontend redirigirá aquí
      dashboard_url: `/dashboard?id=${clinicId}&token=${token}` // Fallback
    });

  } catch (error) {
    next(error); // Pasa el error al middleware errorHandler
  }
};

// --- 2. DATOS DEL DASHBOARD (PACIENTES) ---
const getPacientes = async (req, res, next) => {
  try {
    // req.clinicId viene del middleware 'auth' (Seguro)
    const snap = await db.collection('pacientes')
      .where('clinic_id', '==', req.clinicId)
      .orderBy('creado_el', 'desc')
      .get();
      
    const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(lista);
  } catch (error) {
    next(error);
  }
};

// --- 3. DATOS DEL DASHBOARD (EQUIPO) ---
const getEquipo = async (req, res, next) => {
  try {
    const snap = await db.collection('clinicas').doc(req.clinicId)
      .collection('especialistas').get();
      
    const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(lista);
  } catch (error) {
    next(error);
  }
};

// --- 4. DATOS DEL DASHBOARD (BALANCE) ---
const getBalance = async (req, res, next) => {
  try {
    const snap = await db.collection('citas')
      .where('clinic_id', '==', req.clinicId).get();
      
    let real = 0, potencial = 0;
    
    snap.forEach(doc => {
      const c = doc.data();
      // En una v2 esto debería sumar el precio real guardado en la cita
      const precio = 100; 
      
      if (c.status === 'confirmada') real += precio;
      else if (c.status === 'pendiente_pago') potencial += precio;
    });

    res.json({
      real,
      potencial,
      roi: real > 0 ? ((real / (real + potencial)) * 100).toFixed(0) : 0
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  getPacientes,
  getEquipo,
  getBalance
};