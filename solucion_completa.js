// SOLUCIÓN COMPLETA AUTOMÁTICA
// Copia y pega esto en la consola del dashboard

console.log('🚀 [SOLUCIÓN COMPLETA] Iniciando reparación total...');

// 1. Forzar backend de producción
window.originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url.includes('/api/')) {
    const productionUrl = 'https://fisio-backend-omega-740657183492.europe-west1.run.app' + url.split('/api/')[1];
    console.log('🔄 [FIX] Backend forzado:', url, '→', productionUrl);
    return window.originalFetch(productionUrl, options);
  }
  return window.originalFetch(url, options);
};

// 2. Forzar variable de entorno
window.API_BASE_URL = 'https://fisio-backend-omega-740657183492.europe-west1.run.app';

// 3. Test de conexión
console.log('🧪 [TEST] Probando conexión...');
fetch('https://fisio-backend-omega-740657183492.europe-west1.run.app/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({email: 'test', password: 'test'})
})
.then(response => {
  console.log('✅ [TEST] Conexión OK:', response.status);
  
  // 4. Test del botón
  setTimeout(() => {
    console.log('🔍 [BOTÓN] Buscando botón de upgrade...');
    const botones = document.querySelectorAll('button, [role="button"]');
    let botonUpgrade = null;
    
    botones.forEach(boton => {
      if (boton.textContent && boton.textContent.includes('Multi-Sede')) {
        botonUpgrade = boton;
        console.log('✅ [BOTÓN] Botón encontrado:', boton.textContent);
      }
    });
    
    if (botonUpgrade) {
      console.log('🎯 [BOTÓN] Haciendo clic automático en 3 segundos...');
      setTimeout(() => {
        console.log('🚀 [BOTÓN] ¡CLIC!');
        botonUpgrade.click();
      }, 3000);
    } else {
      console.log('❌ [BOTÓN] No encontrado. Refresca la página (F5) y ejecuta esto de nuevo.');
    }
  }, 2000);
  
})
.catch(error => {
  console.error('❌ [TEST] Error:', error);
});

console.log('✅ [SOLUCIÓN] Reparación completada. Espera resultados...');
