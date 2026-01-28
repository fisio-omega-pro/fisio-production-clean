/**
 * 💳 PAYMENT SERVICE - DIAGNÓSTICO FORENSE
 * Si falla, lista los productos reales de la cuenta para detectar el error.
 */
const Stripe = require('stripe');
const { initEnv } = require('../config/env');

let stripeInstance = null;

// TUS IDs (Los que dices que son correctos)
const PLANS = {
  'solo':   'price_1Sjy5kDRyuQXtENNfJ0YWOfh', 
  'team':   'price_1Sm7MfDRyuQXtENNWCWL4WLH', 
  'clinic': 'price_1Sm7NyDRyuQXtENNYF8wf0oQ'  
};

const getStripe = async () => {
  if (stripeInstance) return stripeInstance;
  const env = await initEnv();
  if (!env.STRIPE_SECRET_KEY) return null;
  
  // LOG DE SEGURIDAD: Vemos qué tipo de llave estamos usando
  const keyType = env.STRIPE_SECRET_KEY.startsWith('sk_live') ? 'PRODUCCIÓN (LIVE)' : 'PRUEBAS (TEST)';
  console.log(`💳 [STRIPE INIT] Usando llave de: ${keyType}`);
  
  stripeInstance = Stripe(env.STRIPE_SECRET_KEY);
  return stripeInstance;
};

const getHost = (req) => {
  if (!req) return 'https://fisiotool.app';
  const host = req.headers.host;
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
};

const createSubscriptionSession = async (clinicId, email, plan = 'solo', req) => {
  const stripe = await getStripe();
  const host = getHost(req);

  if (!stripe) {
    console.warn("⚠️ [PAYMENT] Stripe offline (Sin clave).");
    return { url: `${host}/dashboard?id=${clinicId}&mode=offline` };
  }

  const priceId = PLANS[plan] || PLANS['solo'];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 30,
        metadata: { clinic_id: clinicId }
      },
      success_url: `${host}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${host}/setup?error=payment_cancelled`,
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