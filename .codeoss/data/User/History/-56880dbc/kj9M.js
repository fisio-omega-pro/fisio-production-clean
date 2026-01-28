/**
 * 🎮 CLINIC CONTROLLER - GESTIÓN ADMINISTRATIVA
 * Coordina Registro, Dashboard y Datos Maestros.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initEnv } = require('../config/env');
const { db, Timestamp } = require('../config/firebase');
const paymentService = require('../services/paymentService');

// Helper para limpiar texto
const clean = (str) => str ? str.toLowerCase().trim().replace(/[^a-z0-9]/g, '-') : '';

const register = async (req, res, next) => {
  try {
    const d = req.body;
    if (!d.email || !d.password || !d.nombre) throw new Error("Faltan datos obligatorios.");

    // 1. Identidad
    const env = await initEnv();
    const slug = clean(d.nombre) + '-' + Date.now().toString().slice(-4);
    const hashedPassword = await bcrypt.hash(d.password, 10);

    // 2. Construcción del Objeto Clínica (Soberanía)
    const newClinic = {
      nombre_clinica: d.nombre,
      slug: slug,
      email: d.email,
      password: hashedPassword,
      direccion: { 
        calle: d.calle, ciudad: d.ciudad, cp: d.cp, provincia: d.provincia 
      },
      horario: {
        apertura: d.apertura, cierre: d.cierre, 
        pausa: d.hace_descanso ? { inicio: d.descanso_inicio, fin: d.descanso_fin } : null
      },
      config_ia: {
        precio: d.precio_sesion,
        fianza: d.fianza,
        flags: d.flags || [],
        bonos: d.acepta_bonos ? { precio_5: d.precio_bono_5 } : null
      },
      legal: {
        aceptado: true,
        fecha: Timestamp.now(),
        ip: req.ip
      },
      plan: d.plan || 'solo',
      status: 'pendiente_pago',
      created_at: Timestamp.now()
    };

    // 3. Persistencia
    const ref = await db.collection('clinicas').add(newClinic);
    const clinicId = ref.id;

    // 4. Token y Pagos
    const token = jwt.sign({ clinicId }, env.JWT_SECRET, { expiresIn: '30d' });
    const payment = await paymentService.createSubscriptionSession(clinicId, d.email, d.plan, req);

    console.log(`✅ [REGISTRO] Nueva clínica: ${d.nombre} (${clinicId})`);

    res.json({
      success: true,
      token,
      payment_url: payment.url,
      dashboard_url: `/dashboard`
    });

  } catch (error) {
    next(error);
  }
};

const getDashboardData = async (req, res, next) => {
  try {
    // req.clinicId viene del middleware auth
    const [citas, pacientes] = await Promise.all([
      db.collection('citas').where('clinic_id', '==', req.clinicId).get(),
      db.collection('pacientes').where('clinic_id', '==', req.clinicId).limit(50).get()
    ]);

    let stats = { real: 0, potencial: 0 };
    citas.forEach(doc => {
      const c = doc.data();
      if (c.status === 'confirmada') stats.real += (c.precio || 50);
      else if (c.status === 'pendiente_pago') stats.potencial += (c.precio || 50);
    });

    res.json({
      balance: stats,
      pacientes: pacientes.docs.map(d => d.data())
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, getDashboardData };