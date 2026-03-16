import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'momentunatope@gmail.com');
    await page.fill('[data-testid="password"]', 'tu-contraseña');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('Dashboard carga correctamente', async ({ page }) => {
    // Verificar que el dashboard cargue
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    
    // Verificar navegación principal
    await expect(page.locator('[data-testid="nav-home"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-agenda"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-pacientes"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-finanzas"]')).toBeVisible();
    
    console.log('✅ Dashboard cargó correctamente');
  });

  test('Navegación entre secciones funciona', async ({ page }) => {
    // Probar navegación
    const sections = ['home', 'agenda', 'pacientes', 'finanzas'];
    
    for (const section of sections) {
      await page.click(`[data-testid="nav-${section}"]`);
      await page.waitForTimeout(1000);
      
      // Verificar que la sección se cargó
      await expect(page.locator(`[data-testid="${section}-view"]`)).toBeVisible();
    }
    
    console.log('✅ Navegación funciona correctamente');
  });

  test('Configuración de Ana funciona', async ({ page }) => {
    // Ir a configuración de Ana
    await page.click('[data-testid="nav-config-ana"]');
    
    // Verificar que cargue la configuración
    await expect(page.locator('[data-testid="ana-config"]')).toBeVisible();
    
    // Cambiar nombre de Ana
    await page.fill('[data-testid="ana-name"]', 'Sofía');
    await page.click('[data-testid="save-config"]');
    
    // Verificar que se guardó
    await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
    
    console.log('✅ Configuración de Ana funciona');
  });
});
