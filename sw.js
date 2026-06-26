const CACHE_NAME = 'activakids-v1';
const ARCHIVOS = [
  '/activakids/',
  '/activakids/index.html',
  '/activakids/manifest.json',
  '/activakids/icon-192.png',
  '/activakids/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800;900&family=Nunito:wght@700;800;900&display=swap'
];

// Instalar: guarda los archivos en caché
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARCHIVOS))
  );
  self.skipWaiting();
});

// Activar: limpia cachés viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: sirve desde caché si no hay internet
self.addEventListener('fetch', e => {
  // Las llamadas a Firebase siempre van a la red
  if (e.request.url.includes('firebaseio.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('Sin conexión', { status: 503 })));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        const copia = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, copia));
        return response;
      }).catch(() => caches.match('/activakids/index.html'));
    })
  );
});
