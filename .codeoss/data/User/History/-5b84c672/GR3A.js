/**
 * 💳 PAYMENT SERVICE - GESTOR FINANCIERO OMEGA
 * Abstrae la complejidad de Stripe y gestiona el flujo de suscripciones.
 */

const { stripe, PLANES } = require('../config/stripe');
const { getDynamicHost } = require('../utils/helpers');

/**
 * Crea una sesión de suscripción para una nueva clínica.
 * Incluye 30 días de prueba y captura de metadatos para el Webhook.
 */
const createSubscriptionSession = async (clinicId, email, plan = 'solo', req) => {
  const host = getDynamicHost(req);

  // MODO DESARROLLO / OFFLINE
  if (!stripe) {
    console.warn("⚠️ [PAYMENT] Operando en modo OFFLINE. Redirigiendo a Dashboard.");
    // Redirección directa al dashboard en modo desarrollo
    return { 
      url: `${host}/dashboard?id=${clinicId}&status=dev_active`,
      simulated: true 
    };
  }

  // MODO PRODUCCIÓN (Stripe Real)
  try {
    const priceId = PLANES[plan] || PLANES['solo'];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 30,
        metadata: { clinic_id: clinicId }
      },
      // URL de éxito: Donde va el fisio tras pagar
      success_url: `${host}/dashboard?id=${clinicId}&pago=ok&session_id={CHECKOUT_SESSION_ID}`,
      // URL de cancelación: Si cierra la ventana de Stripe
      cancel_url: `${host}/setup?error=pago_cancelado`,
      metadata: { 
        clinic_id: clinicId, 
        tipo: 'suscripcion' 
      }
    });

    return { url: session.url, simulated: false };
  } catch (error) {
    console.error("❌ [STRIPE_ERROR]:", error.message);
    throw new Error("No se pudo inicializar la pasarela de pago.");
  }
};

module.exports = {
  createSubscriptionSession
};∫