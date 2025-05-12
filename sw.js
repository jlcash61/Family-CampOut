const CACHE_NAME = 'campout-site-v1.2.2';
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
    fetch(event.request, { redirect: 'follow' })
      .catch(() => caches.match(event.request))
      .then(response => response || caches.match('/index.html'))
  );
});

