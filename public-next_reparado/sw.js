// FISIOTOOL PRO - SERVICE WORKER (MOTOR DE NOTIFICACIONES)

self.addEventListener('install', (event) => {
  console.log('🏎️ Service Worker: Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🏎️ Service Worker: Activado y listo para recibir señales');
});

// --- ESCUCHA DE NOTIFICACIONES PUSH ---
self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo_fisiotool.png',
    badge: '/logo_fisiotool.png',
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || '/dashboard'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Aviso de Ana', options)
  );
});

// --- CLIC EN LA NOTIFICACIÓN ---
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
