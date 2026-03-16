import { test, expect } from '@playwright/test';

test.describe('Ana Chat E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'momentunatope@gmail.com');
    await page.fill('[data-testid="password"]', 'tu-contraseña');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('Ana responde correctamente', async ({ page }) => {
    // Ir al chat de Ana
    await page.goto('/ana');
    
    // Enviar mensaje
    await page.fill('[data-testid="chat-input"]', 'Hola Ana, necesito una cita');
    await page.click('[data-testid="send-button"]');
    
    // Esperar respuesta
    await expect(page.locator('[data-testid="ana-response"]')).toBeVisible({ timeout: 5000 });
    
    // Verificar que la respuesta contiene palabras clave
    const response = await page.locator('[data-testid="ana-response"]').textContent();
    expect(response).toContain('cita');
    expect(response).toContain('ayudar');
    
    console.log('✅ Ana respondió correctamente');
  });

  test('Ana maneja múltiples conversaciones', async ({ page }) => {
    await page.goto('/ana');
    
    // Enviar varios mensajes
    const messages = [
      'Hola Ana',
      '¿Qué servicios ofreces?',
      'Necesito información sobre fisioterapia',
      'Gracias por la ayuda'
    ];
    
    for (const message of messages) {
      await page.fill('[data-testid="chat-input"]', message);
      await page.click('[data-testid="send-button"]');
      await page.waitForTimeout(1000); // Esperar entre mensajes
    }
    
    // Verificar que hay múltiples respuestas
    const responses = await page.locator('[data-testid="ana-response"]').count();
    expect(responses).toBeGreaterThan(2);
    
    console.log('✅ Ana manejó múltiples conversaciones');
  });
});
