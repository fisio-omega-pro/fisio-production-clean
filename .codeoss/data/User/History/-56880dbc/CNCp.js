/**
 * 🎮 CLINIC CONTROLLER - BACKEND OMEGA
 * Responsable de la Identidad, Seguridad y Datos del Profesional.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, Timestamp } = require('../config/firebase');
const { JWT_SECRET } = require('../config/env');
const paymentService = require('../services/paymentService');
const { generarSlug, generarCodigoReferido } = require('../utils/helpers');

// --- 🚀 1. REGISTRO (ALTA DE CLÍNICA) ---
const register = async (req, res, next) => {
  try {
    const d = req.body;
    
    if (!d.email || !d.password || !d.nombre) {
      return res.status(400).json({ error: "Faltan datos obligatorios." });
    }

    const emailLimpio = d.email.toLowerCase().trim();
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(d.password, salt);

    let slug = generarSlug(d.nombre);
    const checkSlug = await db.collection('clinicas').where('slug', '==', slug).get();
    if (!checkSlug.empty) slug += `-${Math.floor(Math.random() * 1000)}`;

    const miCodigoReferido = generarCodigoReferido();
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "0.0.0.0";

    const newClinic = {
      nombre_clinica: d.nombre,
      slug,
      email: emailLimpio,
      password: hashedPassword,
      direccion: {
        calle: d.calle || "",
        numero: d.numero || "",
        ciudad: d.ciudad || "",
        cp: d.cp || "",
        provincia: d.provincia || ""
      },
      horario: {
        apertura: d.apertura || '09:00',
        cierre: d.cierre || '20:00',
        pausa_mediodia: d.hace_descanso || false,
        pausa_inicio: d.descanso_inicio || '14:00',
        pausa_fin: d.descanso_fin || '16:00'
      },
      config_ia: {
        precio_sesion: Number(d.precio_sesion) || 50,
        fianza_reserva: Number(d.fianza) || 15,
        flags_activas: d.flags || [],
        acepta_bonos: d.acepta_bonos || false,
        precio_bono_5: Number(d.precio_bono_5) || 225
      },
      status: 'pendiente_pago',
      plan: d.plan || 'solo',
      created_at: Timestamp.now(),
      mi_codigo_referido: miCodigoReferido,
      contrato_rgpd: {
        aceptado: true,
        fecha: Timestamp.now(),
        version: "1.1",
        ip: clientIp
      }
    };

    const ref = await db.collection('clinicas').add(newClinic);
    const clinicId = ref.id;
    const token = jwt.sign({ clinicId }, JWT_SECRET, { expiresIn: '30d' });

    // Iniciar pasarela financiera
    const sessionStripe = await paymentService.createSubscriptionSession(
      clinicId, emailLimpio, d.plan || 'solo', req
    );

    res.json({
      success: true,
      token,
      clinicId,
      payment_url: sessionStripe.url
    });

  } catch (error) {
    console.error("🔥 Error en registro:", error);
    next(error);
  }
};

// --- 📊 2. BALANCE FINANCIERO ---
const getBalance = async (req, res, next) => {
  try {
    const citasSnap = await db.collection('citas').where('clinic_id', '==', req.clinicId).get();
    let real = 0, potencial = 0;

    citasSnap.forEach(doc => {
      const c = doc.data();
      const precio = c.monto_total || 50;
      if (c.status === 'confirmada' || c.status === 'pagada') real += precio;
      else if (c.status === 'pendiente_pago') potencial += precio;
    });

    res.json({
      real,
      potencial,
      roi: real > 0 ? ((real / 100) * 100).toFixed(0) : 0,
      moneda: 'EUR'
    });
  } catch (error) { next(error); }
};

// --- 👥 3. LISTADO DE PACIENTES ---
const getPacientes = async (req, res, next) => {
  try {
    const snap = await db.collection('pacientes')
      .where('clinic_id', '==', req.clinicId)
      .orderBy('creado_el', 'desc')
      .get();

    res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) { next(error); }
};

// --- 👩‍⚕️ 4. GESTIÓN DE EQUIPO ---
const getEquipo = async (req, res, next) => {
  try {
    const snap = await db.collection('clinicas').doc(req.clinicId)
      .collection('especialistas').get();
    res.json(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  } catch (error) { next(error); }
};

// EXPORTS UNIFICADOS
module.exports = {
  register,
  getBalance,
  getPacientes,
  getEquipo
};