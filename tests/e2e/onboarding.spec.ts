import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow E2E', () => {
  test('Usuario completo onboarding exitosamente', async ({ page }) => {
    // Ir a la página de registro
    await page.goto('/setup');
    
    // Paso 1: Información básica
    await page.fill('[data-testid="clinic-name"]', 'Clínica Test E2E');
    await page.fill('[data-testid="email"]', 'test@e2e.com');
    await page.fill('[data-testid="password"]', 'Test123456!');
    await page.fill('[data-testid="phone"]', '600123456');
    
    // Paso 2: Dirección
    await page.fill('[data-testid="address"]', 'Calle Test 123');
    await page.fill('[data-testid="city"]', 'Madrid');
    await page.fill('[data-testid="postal-code"]', '28001');
    
    // Paso 3: Horario
    await page.selectOption('[data-testid="opening-time"]', '08:00');
    await page.selectOption('[data-testid="closing-time"]', '14:00');
    
    // Paso 4: Aceptar términos
    await page.check('[data-testid="accept-terms"]');
    
    // Paso 5: Enviar formulario
    await page.click('[data-testid="submit-register"]');
    
    // Esperar redirección a Stripe
    await page.waitForURL('**/checkout.stripe.com/**');
    
    // Verificar que estamos en Stripe
    expect(page.url()).toContain('checkout.stripe.com');
    
    // Simular pago exitoso (en testing real usaríamos Stripe test)
    console.log('✅ Onboarding completado hasta Stripe');
  });

  test('SetupWizard muestra pasos correctos', async ({ page }) => {
    // Simular login de usuario con onboarding incompleto
    await page.goto('/dashboard');
    
    // Verificar que muestra el SetupWizard
    await expect(page.locator('[data-testid="setup-wizard"]')).toBeVisible();
    
    // Verificar los 3 pasos
    await expect(page.locator('[data-testid="step-logo"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-subscription"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-stripe"]')).toBeVisible();
    
    // Verificar que están incompletos
    await expect(page.locator('[data-testid="step-logo"] .incomplete')).toBeVisible();
    await expect(page.locator('[data-testid="step-subscription"] .incomplete')).toBeVisible();
    await expect(page.locator('[data-testid="step-stripe"] .incomplete')).toBeVisible();
    
    console.log('✅ SetupWizard verificado correctamente');
  });
});
