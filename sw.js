// sw.js  (version bump => v5.1)
const CACHE = 'familycampout-v5.1';
const ASSETS = [
  '/',                 // clean URL → index.html
  '/index.html',
  '/map.html',
  '/rules.html',
  '/waterzone.html',
  '/style.css',
  '/icons/icon-512.png',
  '/images/jelleyStoneMap.png',
  '/images/jelleyStoneMapHD.png'
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
    caches.match(event.request).then(async (cached) => {
      if (cached) return cached;                 // ① serve from cache (offline-safe)

      // ② not in cache → try network
      try {
        const fresh = await fetch(event.request);
        // ③ stash the fresh copy for future offline use
        const cache = await caches.open(CACHE);
        cache.put(event.request, fresh.clone());
        return fresh;
      } catch (err) {
        // ④ network failed & no cached copy → fallback to home shell
        return caches.match('/index.html');
      }
    })
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
