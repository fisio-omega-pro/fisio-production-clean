/**
 * 💳 PAYMENT SERVICE - DIAGNÓSTICO FORENSE
 * Si falla, lista los productos reales de la cuenta para detectar el error.
 */
const Stripe = require('stripe');
const { initEnv } = require('../config/env');

let stripeInstance = null;

const normalizePlan = (v) => {
  const s = String(v || '').trim().toLowerCase();
  if (!s) return 'solo';
  if (['pro', 'professional'].includes(s)) return 'solo';
  if (['business', 'clinic'].includes(s)) return 'team';
  if (['team', 'corporate', 'solo'].includes(s)) return s;
  return 'solo';
};

const getStripe = async () => {
  if (stripeInstance) return stripeInstance;
  const env = await initEnv();
  const sk = String(env.STRIPE_SK || env.STRIPE_SECRET_KEY || '').trim();
  if (!sk) return null;
  // Validación defensiva: la secret key debe empezar por sk_
  if (!sk.startsWith('sk_')) {
    console.error('🔥 [STRIPE INIT] Clave inválida: debe empezar por "sk_". Revisa STRIPE_SECRET_KEY en Secret Manager.');
    return null;
  }
  
  // LOG DE SEGURIDAD: Vemos qué tipo de llave estamos usando
  const keyType = sk.startsWith('sk_live') ? 'PRODUCCIÓN (LIVE)' : 'PRUEBAS (TEST)';
  console.log(`💳 [STRIPE INIT] Usando llave de: ${keyType}`);
  
  stripeInstance = Stripe(sk);
  return stripeInstance;
};

const getPriceIdForPlan = async (plan) => {
  const env = await initEnv();
  const p = normalizePlan(plan);
  // Preferir env (configurable). Si no existe, fallback a un price temporal conocido (evita romper).
  const map = {
    solo: String(env.STRIPE_PRICE_SOLO || '').trim(),
    team: String(env.STRIPE_PRICE_TEAM || '').trim(),
    corporate: String(env.STRIPE_PRICE_CORPORATE || '').trim(),
  };
  const configured = map[p];
  if (configured) return configured;
  // Fallback legacy (temporal)
  return 'price_1SdAs2EarlGG7cm4RRmu49VM';
};

const getFrontendBase = async (req) => {
  const env = await initEnv();
  const configured = String(process.env.FRONTEND_URL || env.FRONTEND_URL || '').trim();
  if (configured) return configured.replace(/\/+$/, '');
  // Fallback razonable
  return 'https://www.fisiotool.com';
};

const getHost = (req) => {
  if (!req) return 'https://fisiotool.app';
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
};

const createSubscriptionSession = async (clinicId, email, plan = 'solo', req) => {
  const stripe = await getStripe();
  const frontendBase = await getFrontendBase(req);

  if (!stripe) {
    console.warn("⚠️ [PAYMENT] Stripe offline (Sin clave).");
    return { url: `${frontendBase}/dashboard?id=${clinicId}&mode=offline` };
  }

  const normalized = normalizePlan(plan);
  const priceId = await getPriceIdForPlan(normalized);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      client_reference_id: clinicId,
      metadata: { clinic_id: clinicId, plan: normalized },
      subscription_data: {
        trial_period_days: 30,
        metadata: { clinic_id: clinicId, plan: normalized }
      },
      success_url: `${frontendBase}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendBase}/setup?error=payment_cancelled`,
    });

    return { url: session.url };

  } catch (error) {
    console.error(`🔥 [STRIPE ERROR] Fallo con ID: ${priceId}`);
    console.error(`ERROR REAL: ${error.message}`);

    // --- AUTOPSIA: LISTAR PRECIOS DISPONIBLES ---
    try {
      console.log("🔍 BUSCANDO PRECIOS REALES EN ESTA CUENTA...");
      const prices = await stripe.prices.list({ limit: 5 });
      if (prices.data.length === 0) {
        console.log("❌ LA CUENTA ESTÁ VACÍA. No hay precios creados en este modo.");
      } else {
        console.log("✅ PRECIOS ENCONTRADOS (Copia uno de estos):");
        prices.data.forEach(p => {
          console.log(`   - ID: ${p.id} | Monto: ${p.unit_amount/100} ${p.currency} | Producto: ${p.product}`);
        });
      }
    } catch (e) { console.log("Error listando precios:", e.message); }
    
    // Lanzamos el error para que el frontend sepa que falló
    throw error; 
  }
};

// ... Resto igual ...
const createDepositLink = async () => null;
const createConnectAccount = async () => null;

module.exports = { createSubscriptionSession, createDepositLink, createConnectAccount };