const createSubscriptionSession = async (clinicId, email, plan = 'solo', req) => {
  // Si no hay Stripe (Modo Desarrollo/Offline)
  if (!stripe) {
    console.log("⚠️ [PAYMENT] Stripe Offline: Generando redirección directa al Dashboard.");
    // Redirigimos al dashboard pasando el ID de la clínica
    return { url: `/dashboard?id=${clinicId}&status=simulated` };
  }

  // ... (resto del código de Stripe igual)
};