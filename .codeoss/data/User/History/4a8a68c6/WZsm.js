/**
 * 💳 PAYMENT SERVICE - GESTOR FINANCIERO
 * Abstrae la complejidad de Stripe.
 */

const { stripe, PLANES } = require('../config/stripe');
const { getDynamicHost } = require('../utils/helpers');

// --- 1. CREAR SUSCRIPCIÓN (ALTA CLÍNICA) ---
const createSubscriptionSession = async (clinicId, email, plan = 'solo', req) => {
  if (!stripe) {
    return { url: `/dashboard?id=${clinicId}&token=DEV_TOKEN&simulated=true` };
  }

  const priceId = PLANES[plan] || PLANES['solo'];
  const host = getDynamicHost(req);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    subscription_data: {
      trial_period_days: 30,
      metadata: { clinic_id: clinicId }
    },
    success_url: `${host}/dashboard?id=${clinicId}&pago=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${host}/setup?error=pago_cancelado`,
    metadata: { 
      clinic_id: clinicId, 
      tipo: 'suscripcion' 
    }
  });

  return { url: session.url };
};

// --- 2. ONBOARDING STRIPE CONNECT (PARA FISIOS) ---
const createConnectLink = async (clinicId, email, currentConnectId, req) => {
  if (!stripe) return { url: "#stripe-offline" };

  let accountId = currentConnectId;

  // Si no tiene cuenta, creamos una Express
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    accountId = account.id;
    // NOTA: El controller deberá guardar este accountId en Firebase
  }

  const host = getDynamicHost(req);
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${host}/dashboard?stripe=retry`,
    return_url: `${host}/dashboard?stripe=success`,
    type: 'account_onboarding',
  });

  return { url: link.url, accountId }; // Devolvemos ID para guardarlo
};

module.exports = {
  createSubscriptionSession,
  createConnectLink
};