// Selector de estado de suscripción - Solución Maestra
export const getSubscriptionStatus = (user) => {
  const PLANS_MULTI_CLINIC = ['business', 'clinic', 'corporate'];
  
  const hasPlanPermissions = PLANS_MULTI_CLINIC.includes(user.plan);
  
  // La clave: ¿Es una suscripción real de Stripe?
  const hasRealStripePayment = user.stripeSubscriptionId && 
                               user.stripeSubscriptionId.startsWith('sub_') && 
                               user.stripeSubscriptionId !== 'sub_active' &&
                               user.stripeSubscriptionId !== 'pending_real_payment';

  return {
    canAccessMultiSede: hasPlanPermissions,
    needsToPay: !hasRealStripePayment, // <--- ESTA ES LA CLAVE
    isLegacy: user.stripeSubscriptionId === 'sub_active',
    isPending: user.stripeSubscriptionId === 'pending_real_payment'
  };
};
