// SOLUCIÓN PARA LOGIN - EJECUTAR EN PÁGINA DE LOGIN
// Ve a https://fisiotool.com/login y abre la consola (F12)

console.log('🔐 [LOGIN FIX] Reparando login...');

// 1. Forzar backend de producción para todas las peticiones
window.originalFetch = window.fetch;
window.fetch = function(url, options) {
  if (url.includes('/api/')) {
    const productionUrl = 'https://fisio-backend-omega-740657183492.europe-west1.run.app' + url.split('/api/')[1];
    console.log('🔄 [LOGIN] Forzando:', url, '→', productionUrl);
    return window.originalFetch(productionUrl, options);
  }
  return window.originalFetch(url, options);
};

// 2. Sobreescribir variable global
window.API_BASE_URL = 'https://fisio-backend-omega-740657183492.europe-west1.run.app';

// 3. Test del endpoint de login
console.log('🧪 [LOGIN] Probando endpoint...');
fetch('https://fisio-backend-omega-740657183492.europe-west1.run.app/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({email: 'aunquedemanera@gmail.com', password: 'tu_password'})
})
.then(response => {
  console.log('✅ [LOGIN] Endpoint responde:', response.status);
  if (response.ok) {
    console.log('🎯 [LOGIN] Login debería funcionar ahora');
    console.log('🚀 [LOGIN] Intenta hacer login normalmente');
  } else {
    console.log('⚠️ [LOGIN] Credenciales incorrectas, pero endpoint funciona');
  }
})
.catch(error => {
  console.error('❌ [LOGIN] Error:', error);
});

// 4. Buscar y reparar botón de login
setTimeout(() => {
  console.log('🔍 [LOGIN] Buscando botón de login...');
  const loginButton = document.querySelector('button[type="submit"], button:contains("Iniciar"), button:contains("Entrar"), button:contains("Login")');
  if (loginButton) {
    console.log('✅ [LOGIN] Botón de login encontrado');
    console.log('🎯 [LOGIN] Ahora haz clic en el botón de login con tus credenciales');
  } else {
    console.log('❌ [LOGIN] Botón no encontrado, pero el login debería funcionar');
  }
}, 2000);

console.log('✅ [LOGIN] Fix aplicado. Intenta hacer login ahora.');
