const CACHE_VERSION = 'v3';
const CACHE_NAME = `africahome-${CACHE_VERSION}`;
const urlsToCache = [
  '/',
  '/logo.jpg'
];

self.addEventListener('install', event => {
  // Skip waiting to activate immediately
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

  // Skip API calls and external resources — don't cache them
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api') || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        // Network fetch with error handling
        return fetch(event.request).then(networkResponse => {
          // Cache successful responses for static assets
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
        // If both cache and network fail, return a basic offline fallback
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
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
