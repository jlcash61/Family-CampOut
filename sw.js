const CACHE = 'familycampout-v16';
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
  // Navigation requests: serve the HTML from cache first
  if (event.request.mode === 'navigate') {
  event.respondWith(
    // 1. Try network (works when online & keeps fresh copies)
    fetch(event.request)
      // 2. If network fails (offline) or 404s, fall back to cache
      .catch(() => caches.match(event.request))
      // 3. If the specific page isn’t cached, show the homepage shell
      .then(resp => resp || caches.match('/index.html'))
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
