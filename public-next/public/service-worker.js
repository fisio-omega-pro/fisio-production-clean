/**
 * 🚀 FISIOTOOL PRO - SERVICE WORKER v2.0
 * Estrategia: Cache-First para assets + Network-First para API
 * Funcionalidad offline completa para PWA real
 */

const CACHE_NAME = 'fisiotool-v2';
const STATIC_CACHE = 'fisiotool-static-v2';
const API_CACHE = 'fisiotool-api-v2';
const IMAGE_CACHE = 'fisiotool-images-v2';

// Assets que se cachean inmediatamente en install
const STATIC_ASSETS = [
  '/',
  '/ana',
  '/manifest.json',
  '/logo_fisiotool.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ============================================
// INSTALL - Precachear assets estáticos
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker v2.0...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ============================================
// ACTIVATE - Limpiar caches antiguas
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(
        cacheNames.map(cacheName => {
          if (![STATIC_CACHE, API_CACHE, IMAGE_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ============================================
// FETCH - Estrategias de cache por tipo
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  
  const url = new URL(request.url);
  
  // Ignorar chrome extensions y devtools
  if (url.protocol === 'chrome-extension:' || url.port === '9229') return;
  
  // API: Network-First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
  }
  // Imágenes: Cache-First
  else if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  }
  // Assets estáticos: Cache-First
  else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  }
  // Default: Network
  else {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
  }
});

// Cache-First strategy
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (e) {
    return new Response('Offline', { status: 503 });
  }
}

// Network-First strategy
async function networkFirst(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (e) {
    const cached = await cache.match(request);
    if (cached) {
      const headers = new Headers(cached.headers);
      headers.set('X-SW-Cache', 'true');
      return new Response(cached.body, { status: cached.status, headers });
    }
    return new Response(JSON.stringify({ error: 'Offline' }), { 
      status: 503, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}

function isStaticAsset(url) {
  return /\.(js|css|html|json|woff|woff2|ttf|png|jpg|jpeg|svg|ico)$/i.test(url.pathname) ||
         url.pathname === '/' || url.pathname === '/ana';
}

// Push notifications support
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'FisioTool Pro', {
      body: data.body || 'Nueva notificación',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png'
    })
  );
});

console.log('[SW] Service Worker v2.0 cargado');
