// Solución temporal para probar el botón
// 1. Abre el dashboard en el navegador
// 2. Abre la consola (F12)
// 3. Pega este código para sobreescribir la API

console.log('🔧 [FIX] Aplicando parche temporal...');

// Sobreescribir la URL del API para asegurar que conecte
window.originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url.includes('/api/')) {
    const newUrl = url.replace(/https:\/\/[^\/]+/, 'https://fisio-backend-omega-740657183492.europe-west1.run.app');
    console.log('🔄 [FIX] Redirigiendo:', url, '→', newUrl);
    return window.originalFetch(newUrl, options);
  }
  return window.originalFetch(url, options);
};

// Test de conexión
console.log('🧪 [FIX] Probando conexión...');
fetch('https://fisio-backend-omega-740657183492.europe-west1.run.app/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({email: 'test', password: 'test'})
})
.then(response => console.log('✅ [FIX] Conexión exitosa:', response.status))
.catch(error => console.error('❌ [FIX] Error de conexión:', error));

console.log('✅ [FIX] Parche aplicado. Ahora intenta hacer login.');
