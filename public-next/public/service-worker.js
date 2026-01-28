// Service Worker Básico para cumplimiento PWA
// No cachea contenido, solo permite la instalación.
self.addEventListener('install', (event) => {
  console.log('FisioTool Service Worker instalado.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('FisioTool Service Worker activado.');
});

// Estrategia: Network-first para asegurar que siempre se obtiene la versión más reciente
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
