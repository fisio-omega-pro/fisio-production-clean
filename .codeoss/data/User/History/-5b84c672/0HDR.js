/**
 * 💳 PAYMENT SERVICE - EL ESCUDO FINANCIERO
 * Gestiona Suscripciones, Fianzas y Stripe Connect Express.
 */
const Stripe = require('stripe');
const { initEnv } = require('../config/env');

let stripeInstance = null;

// Mapa de Precios (IDs de tus productos en Stripe Dashboard)
const PLANS = {
  'solo':   'price_1Sjy5kDRyuQXtENNfJ0YWOfh', // 100€
  'team':   'price_1Sm7MfDRyuQXtENNWCWL4WLH', // 300€
  'clinic': 'price_1Sm7NyDRyuQXtENNYF8wf0oQ'  // 500€
};
price_1Sjy5kDRyuQXtENNfJ0YWOfh
// --- INICIALIZADOR ASÍNCRONO (Carga secretos de Google) ---
const getStripe = async () => {
  if (stripeInstance) return stripeInstance;
  const env = await initEnv();
  if (!env.STRIPE_SECRET_KEY) return null; // Modo Offline
  stripeInstance = Stripe(env.STRIPE_SECRET_KEY);
  return stripeInstance;
};

// --- 🛠️ UTILIDAD: DETECTOR DE HOST ---
const getHost = (req) => {
  if (!req) return 'https://fisiotool.app'; // Fallback producción
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
};

// --- 1. SUSCRIPCIÓN DEL FISIO (30 DÍAS GRATIS) ---
const createSubscriptionSession = async (clinicId, email, plan = 'solo', req) => {
  const stripe = await getStripe();
  const host = getHost(req);

  // MODO OFFLINE (Desarrollo sin claves)
  if (!stripe) {
    console.warn("⚠️ [PAYMENT] Stripe offline. Generando enlace simulado.");
    return { url: `${host}/dashboard?id=${clinicId}&simulated_payment=true` };
  }

  const priceId = PLANS[plan] || PLANS['solo'];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    subscription_data: {
      trial_period_days: 30, // La clave de tu oferta irresistible
      metadata: { clinic_id: clinicId }
    },
    success_url: `${host}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${host}/setup?error=payment_cancelled`,
    metadata: {
      clinic_id: clinicId,
      type: 'suscripcion_mensual'
    }
  });

  return { url: session.url };
};

// --- 2. COBRO DE FIANZA A PACIENTE (ANTI NO-SHOW) ---
const createDepositLink = async (clinicId, citaId, amount, patientEmail, accountId) => {
  const stripe = await getStripe();
  // Si no hay Stripe o el fisio no ha conectado su cuenta bancaria, no podemos cobrar online
  if (!stripe || !accountId) return null; 

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: patientEmail,
    line_items: [{
      price_data: {
        currency: 'eur',
        product_data: { name: 'Fianza Reserva Cita' },
        unit_amount: amount * 100, // En céntimos
      },
      quantity: 1,
    }],
    payment_intent_data: {
      application_fee_amount: 100, // Tu comisión (1€ por ejemplo)
      transfer_data: {
        destination: accountId, // El dinero va a la cuenta del fisio
      },
    },
    mode: 'payment',
    success_url: `https://fisiotool.app/cita-confirmada?id=${citaId}`,
    metadata: {
      clinic_id: clinicId,
      cita_id: citaId,
      type: 'fianza_paciente'
    }
  });

  return session.url;
};

// --- 3. ONBOARDING STRIPE CONNECT (TESORERÍA) ---
const createConnectAccount = async (email, req) => {
  const stripe = await getStripe();
  const host = getHost(req);
  if (!stripe) return null;

  const account = await stripe.accounts.create({
    type: 'express',
    email: email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${host}/dashboard/tesoreria`,
    return_url: `${host}/dashboard/tesoreria?connected=true`,
    type: 'account_onboarding',
  });

  return { accountId: account.id, onboardingUrl: accountLink.url };
};

module.exports = {
  createSubscriptionSession,
  createDepositLink,
  createConnectAccount
};