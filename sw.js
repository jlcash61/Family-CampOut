const CACHE_NAME = 'campout-site-v1.2.4';
const OFFLINE_ASSETS = [
  '/',
  '/index.html',
  '/rules.html',
  '/map.html',
  '/waterzone.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
  '/images/jelleyStone Family 1.2.png',
  '/images/jelleyStone FamilyHD.png'
  
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request, { redirect: 'follow' }).then(networkResponse => {
        // Handle redirected responses safely
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type === 'opaqueredirect'
        ) {
          return caches.match('/index.html');
        }

        return networkResponse;
      }).catch(() => {
        // Final offline fallback
        return caches.match('/index.html');
      });
    })
  );
});

