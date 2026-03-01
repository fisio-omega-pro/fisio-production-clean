// Fix crítico: Forzar uso de backend de producción
console.log('🚨 [CRITICAL FIX] Forzando backend de producción...');

// Sobreescribir completamente el fetch para forzar la URL correcta
window.originalFetch = window.fetch;
window.fetch = function(url, options) {
  // Forzar siempre el backend de producción
  if (url.includes('/api/')) {
    const productionUrl = 'https://fisio-backend-omega-740657183492.europe-west1.run.app' + url.split('/api/')[1];
    console.log('🔄 [CRITICAL] Forzando producción:', url, '→', productionUrl);
    return window.originalFetch(productionUrl, options);
  }
  return window.originalFetch(url, options);
};

// También sobreescribir la variable de entorno si existe
if (typeof window !== 'undefined') {
  window.API_BASE_URL = 'https://fisio-backend-omega-740657183492.europe-west1.run.app';
  console.log('✅ [CRITICAL] API_BASE_URL forzado a:', window.API_BASE_URL);
}

// Test inmediato
console.log('🧪 [CRITICAL] Probando conexión forzada...');
fetch('https://fisio-backend-omega-740657183492.europe-west1.run.app/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({email: 'test', password: 'test'})
})
.then(response => {
  console.log('✅ [CRITICAL] Conexión forzada exitosa:', response.status);
  console.log('🎯 [CRITICAL] Ahora intenta hacer login de nuevo');
})
.catch(error => {
  console.error('❌ [CRITICAL] Error en conexión forzada:', error);
});

console.log('🚀 [CRITICAL] Fix aplicado. Intenta login ahora.');
