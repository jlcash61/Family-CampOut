const CACHE = 'familycampout-v17';
const ASSETS = [
  '/',                 // clean URL → index.html
  '/index',
  '/map',
  '/rules',
  '/waterzone',
  '/style.css',
  '/icons/icon-512.png',
  '/images/jelleyStoneMap.png',
  '/images/jelleyStoneMapHD.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => { return cache.addAll(ASSETS); })
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

  if (event.request.mode === 'navigate') {
    event.respondWith(
      // ① cache first
      caches.match(event.request).then(async cached => {
        if (cached) return cached;          // offline OK ✅

        // ② Not cached → try network (online case)
        try {
          const fresh = await fetch(event.request);
          // ③ Stash a copy for next time
          const cache = await caches.open(CACHE);
          cache.put(event.request, fresh.clone());
          return fresh;
        } catch (err) {
          // ④ Network failed & no cached copy → fallback to home
          return caches.match('/index.html');
        }
      })
    );
    return;
  }

  // Static assets – leave cache-first as you have it
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});

