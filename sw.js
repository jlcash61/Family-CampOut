// sw.js  (version bump => v2)
const CACHE = 'familycampout-v2';
const ASSETS = [
  '/',                 // clean URL → index.html
  '/index.html',
  '/map.html',
  '/rules.html',
  '/waterzone.html',
  '/style.css',
  '/icons/icon-512.png',
  '/images/jelleyStone Family 1.2.png',
  '/images/jelleyStone FamilyHD.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Navigation requests: serve the HTML from cache first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then(resp => resp || fetch(event.request))
    );
    return;
  }
  // Static assets
  event.respondWith(
    caches.match(event.request).then(
      resp => resp || fetch(event.request)
    )
  );
});
