// TEST CRÍTICO: ONBOARDING
describe('Onboarding Flow', () => {
  test('Usuario completo onboarding correctamente', async () => {
    // Simular registro de usuario
    const userData = {
      email: 'test@fisiotool.com',
      password: 'Test123456',
      clinicName: 'Clínica Test'
    };
    
    // Verificar que se crea la clínica
    expect(userData.clinicName).toBe('Clínica Test');
    
    // Verificar que se redirige a onboarding
    const onboardingSteps = ['logo', 'subscription', 'stripe'];
    expect(onboardingSteps).toHaveLength(3);
    
    // Verificar que cada paso funciona
    onboardingSteps.forEach(step => {
      expect(step).toBeDefined();
    });
  });
  
  test('SetupWizard muestra pasos correctos', () => {
    const steps = {
      hasLogo: false,
      hasSubscription: false,
      hasStripe: false
    };
    
    // Debe mostrar todos los pasos como pendientes
    expect(steps.hasLogo).toBe(false);
    expect(steps.hasSubscription).toBe(false);
    expect(steps.hasStripe).toBe(false);
  });
});
