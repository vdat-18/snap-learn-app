const CACHE_NAME = 'snaplearn-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json'
];

// Install event: cache essential assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching essential assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(error => {
        console.warn('[ServiceWorker] Some assets failed to cache:', error);
      });
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and external requests
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached response if available
      if (response) {
        return response;
      }

      // Try to fetch from network
      return fetch(event.request)
        .then(response => {
          // Only cache successful responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            // Cache HTML, JS, CSS, images, fonts
            const url = new URL(event.request.url);
            const shouldCache = /\.(html|js|css|svg|png|jpg|jpeg|gif|woff|woff2)$/i.test(url.pathname) ||
                              url.pathname === '/' ||
                              url.pathname === '/index.html';
            
            if (shouldCache) {
              cache.put(event.request, responseToCache);
            }
          });

          return response;
        })
        .catch(error => {
          console.log('[ServiceWorker] Fetch failed; returning offline page:', error);
          // Return a simple offline response
          return new Response('Offline - content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
    })
  );
});

// Message event: for skip waiting functionality
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
