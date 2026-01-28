/**
 * 🗺️ RUTAS DE LA API (backend/routes/apiRoutes.js)
 * Define los endpoints públicos y privados del sistema.
 */

const express = require('express');
const router = express.Router();

// Importamos los Controladores que ya creaste
const clinicController = require('../controllers/clinicController');
const chatController = require('../controllers/chatController');

// Importamos el Middleware de seguridad
const auth = require('../middleware/auth');
const crmService = require('../services/crmService'); // Necesario para la config pública

// ==========================================
// 🔓 RUTAS PÚBLICAS (Abiertas al mundo)
// ==========================================

// 1. Registro de nuevas clínicas
router.post('/register', clinicController.register);

// 2. Chat con Ana (Web)
router.post('/chat/:clinicId', chatController.handleWebChat);

// 3. Configuración Pública (Vital para que el frontend cargue logo, tlf, horarios...)
router.get('/config/:clinicId', async (req, res, next) => {
  try {
    const clinica = await crmService.getClinicaByIdOrSlug(req.params.clinicId);
    if (!clinica) return res.status(404).json({ error: "Clínica no encontrada" });
    
    // Solo devolvemos datos NO sensibles (nada de contraseñas ni ingresos)
    res.json({
      id: clinica.id,
      nombre_clinica: clinica.nombre_clinica,
      phone: clinica.phone || "",
      address: clinica.direcciones?.[0]?.calle || "Ubicación por confirmar",
      weekly_schedule: clinica.weekly_schedule,
      mi_codigo_referido: clinica.mi_codigo_referido,
      default_duration_min: clinica.default_duration_min
    });
  } catch (e) { next(e); }
});

// ==========================================
// 🔒 RUTAS PRIVADAS (Solo con Token JWT)
// ==========================================

// Aplicamos el cerrojo de seguridad a todo lo que venga debajo
router.use(auth);

// 4. Datos del Dashboard (Solo para el dueño)
router.get('/dashboard/pacientes', clinicController.getPacientes);
router.get('/dashboard/equipo', clinicController.getEquipo);
router.get('/dashboard/balance', clinicController.getBalance);

// 5. Onboarding de Stripe (Para cobrar)
// Nota: Necesitamos importar el paymentService en el controlador si queremos usar esta ruta,
// o crear un controlador específico. Por ahora, si no usas el onboarding manual, 
// estas 3 de arriba son las esenciales.

module.exports = router;