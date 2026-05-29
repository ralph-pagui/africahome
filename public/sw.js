const CACHE_VERSION = 'v4';
const CACHE_NAME = `africahome-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/logo.jpg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache).catch(() => {
          console.log('SW: Some assets failed to cache during install, continuing...');
        });
      })
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Skip API calls and external resources — don't cache them
  if (url.pathname.startsWith('/api') || url.origin !== self.location.origin) return;

  const isDocument = event.request.destination === 'document' || url.pathname === '/';
  const isScript = event.request.destination === 'script';

  // Network-First for HTML/JS to avoid old cached versions during redeployments
  if (isDocument || isScript) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;
            if (isDocument) return caches.match('/');
            return new Response('', { status: 408, statusText: 'Offline' });
          });
        })
    );
    return;
  }

  // Cache-First for static assets (images, styles, fonts, icons)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        return new Response('', { status: 408, statusText: 'Offline' });
      })
  );
});

self.addEventListener('activate', event => {
  // Clean old caches
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(
        names.filter(name => name.startsWith('africahome-') && name !== CACHE_NAME)
          .map(name => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});
