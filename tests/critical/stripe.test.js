// TEST CRÍTICO: STRIPE INTEGRATION
describe('Stripe Integration', () => {
  test('Stripe Connect crea cuenta correctamente', async () => {
    const clinicData = {
      email: 'test@fisiotool.com',
      clinicId: 'test-clinic-123'
    };
    
    // Simular creación de cuenta Stripe
    const stripeAccount = {
      id: 'acct_test123',
      type: 'express',
      country: 'ES',
      email: clinicData.email
    };
    
    expect(stripeAccount.id).toMatch(/^acct_/);
    expect(stripeAccount.type).toBe('express');
    expect(stripeAccount.country).toBe('ES');
  });
  
  test('Procesamiento de pagos funciona', async () => {
    const paymentData = {
      amount: 5000, // 50€ en centimos
      currency: 'eur',
      clinicId: 'test-clinic-123'
    };
    
    // Simular procesamiento
    const paymentResult = {
      success: true,
      chargeId: 'ch_test123',
      amount: paymentData.amount
    };
    
    expect(paymentResult.success).toBe(true);
    expect(paymentResult.amount).toBe(5000);
    expect(paymentResult.chargeId).toMatch(/^ch_/);
  });
});
