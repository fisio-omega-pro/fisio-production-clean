/**
 * 💳 PAYMENT SERVICE – FisioTool Pro (LLC USA)
 * Suscripciones (IVA automático, trial 30d, cupón referidos), Connect (vincular banco), cobro cita/bono.
 * Configuración: backend/STRIPE_SETUP.md y Secret Manager (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, price IDs, STRIPE_REFERRAL_COUPON).
 */
const Stripe = require('stripe');
const { initEnv } = require('../config/env');

let stripeInstance = null;

const normalizePlan = (v) => {
  const s = String(v || '').trim().toLowerCase();
  if (!s) return 'solo';
  if (['pro', 'professional'].includes(s)) return 'solo';
  if (['clinic'].includes(s)) return 'team';  // clinic -> team
  if (['team', 'business', 'corporate', 'solo'].includes(s)) return s;
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

// Price IDs: deben venir de Secret Manager (STRIPE_PRICE_SOLO / STRIPE_PRICE_BASE, STRIPE_PRICE_TEAM, STRIPE_PRICE_CORPORATE).
// Fallbacks solo para entornos sin secretos (local/dev); en producción usar siempre Secret Manager.
const FALLBACK_PRICE_IDS = {
  solo: 'price_1T2U1u4vUWb0SJ7OVu9z00oM',
  team: 'price_1T2U4b4vUWb0SJ7OVbGEmZND',
  business: 'price_1T2U4b4vUWb0SJ7OVbGEmZND',  // Mismo precio que team (300€)
  corporate: 'price_1T2U5y4vUWb0SJ7OKMTpIn2t',
};

const getPriceIdForPlan = async (plan) => {
  const env = await initEnv();
  const p = normalizePlan(plan);
  const priceSolo = String(env.STRIPE_PRICE_SOLO || env.STRIPE_PRICE_BASE || '').trim() || FALLBACK_PRICE_IDS.solo;
  const map = {
    solo: priceSolo,
    team: String(env.STRIPE_PRICE_TEAM || '').trim() || FALLBACK_PRICE_IDS.team,
    business: String(env.STRIPE_PRICE_BUSINESS || '').trim() || FALLBACK_PRICE_IDS.business,
    corporate: String(env.STRIPE_PRICE_CORPORATE || '').trim() || FALLBACK_PRICE_IDS.corporate,
  };
  return map[p] || map.solo;
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

const createSubscriptionSession = async (clinicId, email, plan = 'solo', req, options = {}) => {
  const stripe = await getStripe();
  const frontendBase = await getFrontendBase(req);
  const env = await initEnv();

  if (!stripe) {
    console.warn("⚠️ [PAYMENT] Stripe offline (Sin clave).");
    return { url: `${frontendBase}/dashboard?id=${clinicId}&mode=offline` };
  }

  const normalized = normalizePlan(plan);
  const priceId = await getPriceIdForPlan(normalized);
  const referralCoupon = String(env.STRIPE_REFERRAL_COUPON || 'REFERRAL50').trim();
  const allowTrial = options.allowTrial !== false;

  const subscriptionData = {
    metadata: { clinic_id: clinicId, plan: normalized },
  };
  if (allowTrial) subscriptionData.trial_period_days = 30;
  if (normalized === 'solo' && options.referrerStripeCustomerId) {
    subscriptionData.discounts = [{ coupon: referralCoupon }];
    subscriptionData.metadata.referente_id_stripe = options.referrerStripeCustomerId;
  }

  const baseSessionParams = {
    payment_method_types: ['card'],
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    billing_address_collection: 'required',
    client_reference_id: clinicId,
    metadata: { clinic_id: clinicId, plan: normalized },
    subscription_data: subscriptionData,
    success_url: `${frontendBase}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendBase}/setup?error=payment_cancelled`,
  };

  const logPriceDiagnostics = async (err) => {
    console.error(`🔥 [STRIPE ERROR] Fallo con priceId="${priceId}", plan="${normalized}", email="${email}"`);
    console.error(`🔥 [STRIPE ERROR] type=${err?.type || 'unknown'}, code=${err?.code || 'none'}, message=${err?.message || err}`);
    try {
      const prices = await stripe.prices.list({ limit: 5 });
      if (prices.data.length === 0) console.error("❌ LA CUENTA ESTÁ VACÍA. No hay precios creados.");
      else {
        console.log('📋 [STRIPE] Precios disponibles en la cuenta:');
        prices.data.forEach(p => console.log(`   - ID: ${p.id} | ${(p.unit_amount || 0) / 100} ${p.currency} | active=${p.active} | tax_behavior=${p.tax_behavior || 'NOT SET'}`));
      }
    } catch (e) { /* ignore */ }
  };

  try {
    const session = await stripe.checkout.sessions.create({
      ...baseSessionParams,
      tax_id_collection: { enabled: true },
      automatic_tax: { enabled: true },
    });
    return { url: session.url };
  } catch (taxError) {
    const msg = String(taxError?.message || '').toLowerCase();
    if (msg.includes('tax') || msg.includes('automatic_tax') || msg.includes('not enabled')) {
      try {
        const session = await stripe.checkout.sessions.create(baseSessionParams);
        console.log('💳 [STRIPE] Sesión creada sin IVA automático (Stripe Tax no habilitado en la cuenta).');
        return { url: session.url };
      } catch (fallbackError) {
        await logPriceDiagnostics(fallbackError);
        throw fallbackError;
      }
    }
    await logPriceDiagnostics(taxError);
    throw taxError;
  }
};

// Cobro de cita o bono: pago único con transferencia a la cuenta Connect del profesional (comisión 0)
const createOneTimePaymentSession = async (amountCents, stripeAccountIdPro, concepto, req) => {
  const stripe = await getStripe();
  const frontendBase = await getFrontendBase(req);
  if (!stripe) return { url: null, error: 'Stripe no configurado' };
  if (!stripeAccountIdPro || amountCents < 100) return { url: null, error: 'Destino o importe inválido' };

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: { name: concepto || 'Sesión FisioTool' },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      payment_intent_data: {
        transfer_data: { destination: stripeAccountIdPro },
        application_fee_amount: 0,
      },
      success_url: `${frontendBase}/dashboard?pago=ok`,
      cancel_url: `${frontendBase}/dashboard?pago=cancelado`,
    });
    return { url: session.url };
  } catch (e) {
    console.warn('⚠️ [PAYMENT] createOneTimePaymentSession:', e?.message || e);
    return { url: null, error: e?.message || 'Error al crear sesión de pago' };
  }
};

/**
 * Upgrade de suscripción existente con prorrateo (ej: 100€ → 300€ a mitad de mes).
 * Stripe calcula el crédito por los días no usados del plan actual y cobra la parte proporcional del plan nuevo.
 * Devuelve la URL de la factura para que el usuario pague el ajuste, o la URL del dashboard si no hay nada que pagar ya.
 */
const upgradeExistingSubscription = async (subscriptionId, newPlan, req) => {
  const stripe = await getStripe();
  const frontendBase = await getFrontendBase(req);
  if (!stripe || !subscriptionId) return { url: `${frontendBase}/dashboard`, upgraded: false };

  const normalized = normalizePlan(newPlan);
  const newPriceId = await getPriceIdForPlan(normalized);

  try {
    console.log(`🔄 [STRIPE] Upgrading subscription ${subscriptionId} to plan ${normalized}`);

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const itemId = subscription.items?.data?.[0]?.id;
    if (!itemId) {
      console.warn('⚠️ [STRIPE] No subscription item found for', subscriptionId);
      return { url: `${frontendBase}/dashboard`, upgraded: false };
    }

    // Cambiar al nuevo precio con prorrateo inmediato
    // Usamos 'always_invoice' para que Stripe genere la factura al momento
    await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, price: newPriceId }],
      proration_behavior: 'always_invoice',
      metadata: { ...(subscription.metadata || {}), plan: normalized },
    });

    console.log('✅ [STRIPE] Subscription updated, creating/checking invoice...');

    // Intentar buscar una factura abierta o borrador para cobrar el ajuste
    let invoices = await stripe.invoices.list({ subscription: subscriptionId, status: 'open', limit: 1 });
    let invoice = invoices.data[0];

    if (!invoice) {
      invoices = await stripe.invoices.list({ subscription: subscriptionId, status: 'draft', limit: 1 });
      invoice = invoices.data[0];
    }

    if (!invoice) {
      // Si no hay factura pendiente, creamos una para forzar el cobro del prorrateo
      try {
        invoice = await stripe.invoices.create({
          subscription: subscriptionId,
          auto_advance: true,
          customer: subscription.customer
        });
      } catch (invoiceError) {
        console.warn('⚠️ [STRIPE] No se pudo crear factura (quizás prorrateo 0):', invoiceError.message);
      }
    }

    if (invoice && invoice.status === 'draft') {
      try {
        invoice = await stripe.invoices.finalizeInvoice(invoice.id);
      } catch (finalizeError) {
        console.warn('⚠️ [STRIPE] No se pudo finalizar factura:', finalizeError.message);
      }
    }

    // Si hay balace pendiente, mandamos a la pasarela de la factura
    if (invoice && invoice.amount_due > 0 && invoice.hosted_invoice_url) {
      console.log(`💰 [STRIPE] Redirigiendo a factura de pago: ${invoice.hosted_invoice_url}`);
      return { url: invoice.hosted_invoice_url, upgraded: true };
    }

    // Si no hay nada que pagar (0€) o falló la factura, mandamos al Customer Portal 
    // para que vea su nuevo plan o simplemente al dashboard si el portal falla.
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.customer,
        return_url: `${frontendBase}/dashboard?upgraded=1`,
      });
      console.log('✅ [STRIPE] Redirigiendo a Customer Portal (Prorrateo 0€)');
      return { url: portalSession.url, upgraded: true };
    } catch (portalError) {
      console.error('❌ [STRIPE] Error al crear sesión del portal:', portalError.message);
      return { url: `${frontendBase}/dashboard?upgraded=1`, upgraded: true };
    }
  } catch (e) {
    console.error('🔥 [STRIPE] upgradeExistingSubscription error:', e?.message || e);
    throw e;
  }
};

/**
 * Cancela la suscripción al final del periodo de facturación (el usuario sigue teniendo acceso hasta esa fecha).
 * @param {string} subscriptionId - ID de la suscripción en Stripe (sub_xxx)
 * @returns {{ canceled: boolean, cancel_at: number|null }} cancel_at = timestamp Unix del final del periodo
 */
const cancelSubscriptionAtPeriodEnd = async (subscriptionId) => {
  const stripe = await getStripe();
  if (!stripe || !subscriptionId) return { canceled: false, cancel_at: null };
  try {
    const sub = await stripe.subscriptions.update(String(subscriptionId).trim(), {
      cancel_at_period_end: true,
    });
    const cancelAt = sub.cancel_at ? sub.cancel_at : (sub.current_period_end || null);
    return { canceled: true, cancel_at: cancelAt };
  } catch (e) {
    console.warn('⚠️ [STRIPE] cancelSubscriptionAtPeriodEnd:', e?.message || e);
    throw e;
  }
};

/**
 * Cancela la suscripción de forma inmediata (el usuario pierde el acceso al instante).
 * Útil para procesos de borrado total de cuenta.
 * @param {string} subscriptionId - ID de la suscripción en Stripe (sub_xxx)
 * @returns {{ canceled: boolean }}
 */
const cancelSubscriptionImmediately = async (subscriptionId) => {
  const stripe = await getStripe();
  if (!stripe || !subscriptionId) return { canceled: false };
  try {
    await stripe.subscriptions.cancel(String(subscriptionId).trim());
    return { canceled: true };
  } catch (e) {
    console.warn('⚠️ [STRIPE] cancelSubscriptionImmediately:', e?.message || e);
    throw e;
  }
};

const createDepositLink = async () => null;
const createConnectAccount = async () => null;

module.exports = { createSubscriptionSession, createOneTimePaymentSession, upgradeExistingSubscription, cancelSubscriptionAtPeriodEnd, cancelSubscriptionImmediately, createDepositLink, createConnectAccount };