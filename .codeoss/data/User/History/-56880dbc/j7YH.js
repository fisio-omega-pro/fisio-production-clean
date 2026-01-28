/**
 * 🎮 CLINIC CONTROLLER v2.0 - BACKEND OMEGA
 * Responsable de la Identidad, Seguridad y Soberanía del Profesional.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, Timestamp } = require('../config/firebase');
const { JWT_SECRET } = require('../config/env');
const paymentService = require('../services/paymentService');
const { generarSlug, generarCodigoReferido, normalizarTelefono } = require('../utils/helpers');

// --- 🚀 REGISTRO DE ALTA GAMA (ONBOARDING) ---
const register = async (req, res, next) => {
  try {
    const d = req.body; // Datos del formulario Ferrari
    
    // 1. Validación de Integridad
    if (!d.email || !d.password || !d.nombre) {
      return res.status(400).json({ error: "Faltan credenciales maestras (Email/Pass/Nombre)." });
    }

    const emailLimpio = d.email.toLowerCase().trim();

    // 2. Seguridad: Cifrado de Grado Militar (Bcrypt)
    const salt = await bcrypt.genSalt(12); // Nivel de seguridad superior
    const hashedPassword = await bcrypt.hash(d.password, salt);

    // 3. Generación de Activos de Propiedad (Soberanía)
    let slug = generarSlug(d.nombre);
    // Verificamos colisión de URL
    const checkSlug = await db.collection('clinicas').where('slug', '==', slug).get();
    if (!checkSlug.empty) slug += `-${Math.floor(1000 + Math.random() * 9000)}`;

    const miCodigoReferido = generarCodigoReferido();

    // 4. Captura de Huella Legal (Blindaje RGPD)
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "0.0.0.0";

    // 5. Construcción del Palacio Digital (Objeto de la Clínica)
    const newClinic = {
      nombre_clinica: d.nombre,
      slug: slug,
      email: emailLimpio,
      password: hashedPassword,
      
      // Ubicación
      direccion: {
        calle: d.calle || "",
        numero: d.numero || "",
        ciudad: d.ciudad || "",
        cp: d.cp || "",
        provincia: d.provincia || ""
      },

      // Operativa (Tiempo de Vida)
      horario: {
        apertura: d.apertura || '09:00',
        cierre: d.cierre || '20:00',
        pausa_mediodia: d.hace_descanso || false,
        pausa_inicio: d.descanso_inicio || '14:00',
        pausa_fin: d.descanso_fin || '16:00'
      },

      // Configuración Ana (Cerebro)
      config_ia: {
        precio_sesion: Number(d.precio_sesion) || 50,
        fianza_reserva: Number(d.fianza) || 15,
        flags_activas: d.flags || [],
        acepta_bonos: d.acepta_bonos || false,
        precio_bono_5: Number(d.precio_bono_5) || 225
      },

      // Metadatos de Negocio
      status: 'pendiente_pago', // Se activará vía Webhook de Stripe
      plan: d.plan || 'solo',
      created_at: Timestamp.now(),
      mi_codigo_referido: miCodigoReferido,
      referido_por: d.codigo_invitacion || null,

      // Blindaje Legal
      contrato_rgpd: {
        aceptado: true,
        fecha: Timestamp.now(),
        version: "1.1",
        ip: clientIp,
        rol: "Responsable del Tratamiento"
      }
    };

    // 6. Escritura en Base de Datos
    const ref = await db.collection('clinicas').add(newClinic);
    const clinicId = ref.id;

    // 7. Emisión de Llave Digital (JWT)
    const token = jwt.sign({ clinicId }, JWT_SECRET, { expiresIn: '30d' });

    // 8. Lanzamiento de Escudo Financiero (Stripe Subscription)
    const sessionStripe = await paymentService.createSubscriptionSession(
      clinicId, 
      emailLimpio, 
      d.plan || 'solo',
      req
    );

    console.log(`✅ [REGISTRO] Nueva clínica fundada: ${d.nombre} (ID: ${clinicId})`);

    // Respondemos con todo lo necesario para que el frontend haga el salto
    res.json({
      success: true,
      token,
      clinicId,
      slug,
      payment_url: sessionStripe.url
    });

  } catch (error) {
    console.error("🔥 [CONTROLADOR] Fallo crítico en el registro:", error);
    next(error);
  }
};

// --- 📊 DASHBOARD: BALANCE Y MÉTRICAS SOBERANAS ---
const getBalance = async (req, res, next) => {
  try {
    // req.clinicId inyectado por middleware verifyToken
    const citasSnap = await db.collection('citas').where('clinic_id', '==', req.clinicId).get();
    
    let ingresosReales = 0;
    let ingresosPotenciales = 0; // Citas que aún no han pagado

    citasSnap.forEach(doc => {
      const cita = doc.data();
      const monto = cita.monto_total || 50; // Fallback
      if (cita.status === 'confirmada' || cita.status === 'pagada') {
        ingresosReales += monto;
      } else if (cita.status === 'pendiente_pago') {
        ingresosPotenciales += monto;
      }
    });

    res.json({
      real: ingresosReales,
      potencial: ingresosPotenciales,
      roi: ingresosReales > 0 ? ((ingresosReales / 100) * 100).toFixed(0) : 0, // Cálculo ROI basado en cuota de 100€
      moneda: 'EUR'
    });
  } catch (error) {
    next(error);
  }
};

// --- 👥 DASHBOARD: GESTIÓN DE PACIENTES ---
const getPacientes = async (req, res, next) => {
  try {
    const snap = await db.collection('pacientes')
      .where('clinic_id', '==', req.clinicId)
      .orderBy('creado_el', 'desc')
      .limit(100)
      .get();

    const lista = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(lista);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  getBalance,
  getPacientes
};