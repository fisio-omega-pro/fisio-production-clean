/**
 * 💳 MOTOR DE PAGOS (STRIPE)
 * Gestiona la conexión con la pasarela financiera.
 * Soporta modo "Offline" si no se configuran las claves (útil para desarrollo).
 */

const Stripe = require('stripe');
const { STRIPE_SECRET_KEY } = require('./env');

let stripeInstance = null;

if (STRIPE_SECRET_KEY) {
  try {
    stripeInstance = Stripe(STRIPE_SECRET_KEY);
    console.log("✅ [STRIPE] Motor financiero conectado.");
  } catch (error) {
    console.error("⚠️ [STRIPE] Error al inicializar librería:", error.message);
  }
} else {
  console.warn("⚠️ [STRIPE] Clave secreta no encontrada. Modo OFFLINE activo (Pagos deshabilitados).");
}

// Mapeo de Productos Soberano (IDs fijos de tu Dashboard de Stripe)
// Si cambias los precios en Stripe, actualiza estos IDs aquí.
const PLANES = {
  'solo':   'price_1Sjy5kDRyuQXtENNfJ0YWOfh', // 100€
  'team':   'price_1Sm7MfDRyuQXtENNWCWL4WLH', // 300€
  'clinic': 'price_1Sm7NyDRyuQXtENNYF8wf0oQ'  // 500€
};

module.exports = {
  stripe: stripeInstance,
  PLANES
};