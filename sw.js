/**************************************************************
 *           Service-worker for 2025 Family CampOut      
 *
 *  ▸  Pre-caches the core HTML, CSS, icons, and map images
 *  ▸  Handles two categories of requests:
 *        1.  “navigate” (page loads / link clicks)
 *        2.  Everything else (static assets)
 *
 *  Version bump strategy:  Change the CACHE string -> forces a new
 *  cache on install and purges the old one in activate().
 **************************************************************/

/*  ➤ 1.  Cache name
 *      — Bump this any time you change any file listed in ASSETS
 *        or add/remove something from the service-worker code itself.
 */
const CACHE = 'familycampout-v6';

/*  ➤ 2.  Files to precache during the install step
 *      — Paths are absolute from the site root (leading “/”).
 *      — Every file must exist on the server at deploy time.
 */
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

/* --------------------------------------------------------------------
 *  INSTALL  — runs once per browser per version *while online*.
 *             If ANY fetch in cache.addAll() fails (e.g., 404),
 *             the entire SW becomes 'redundant' and never activates.
 * ------------------------------------------------------------------*/
self.addEventListener('install', event => {
  event.waitUntil(
    // 1.  Open (or create) the named cache
    caches.open(CACHE)
      // 2.  Add every URL in ASSETS in a single atomic step
      .then(cache => cache.addAll(ASSETS))
  );
  // 3.  Force this new worker to move into the 'waiting' phase
  //     immediately instead of waiting for open pages to close.
  self.skipWaiting();
});

/* --------------------------------------------------------------------
 *  ACTIVATE  — runs after install, or when a new SW takes control.
 *              Common tasks: clear old caches, claim clients.
 * ------------------------------------------------------------------*/
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()                   // get every cache in Storage
      .then(keys =>
        // delete all caches whose names do NOT match current CACHE
        Promise.all(
          keys.filter(k => k !== CACHE)
            .map(k => caches.delete(k))
        )
      )
  );
  // Immediately start controlling pages without requiring a reload
  self.clients.claim();
});

/* --------------------------------------------------------------------
 *  FETCH  — fires on *every* network request made by pages the SW
 *           controls (HTML navigation, images, CSS, JS, etc.).
 * ------------------------------------------------------------------*/
self.addEventListener('fetch', event => {

  /* ******************** 1. Navigation requests ********************
 *  event.request.mode === 'navigate' covers:
 *    ▸ clicking <a href="...">
 *    ▸ typing a URL in the bar
 *    ▸ refreshing the page
 *
 *  Strategy here (CACHE → NETWORK → FALLBACK):
 *    ①  Look for the requested page in the cache first
 *        • If found, return it immediately (works offline)
 *    ②  Not in cache?  Fetch it from the network
 *        • When online, show the fresh copy
 *        • Clone & store that copy in CACHE so it’s available offline
 *    ③  If the network fetch fails (offline/timeout) **and**
 *        the page was never cached, fall back to the cached
 *        home page (`/index.html`) as a last-ditch shell.
 ******************************************************************/

  /****************  A. Navigation requests  ****************/
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request).then(async cached => {

        /* 1️⃣  If we already have the page in cache, serve it instantly */
        if (cached) return cached;

        /* 2️⃣  Not cached ⇒ try the network */
        try {
          const fresh = await fetch(event.request);

          /* 2a.  Save a clone of the network response so the page
           *      will be available offline the *next* time */
          const cache = await caches.open(CACHE);
          cache.put(event.request, fresh.clone());

          /* 2b.  Show the live page */
          return fresh;

        } catch (err) {

          /* 3️⃣  Network failed (offline) and no cached copy →
           *      fall back to the cached home page shell */
          return caches.match('/index.html');
        }
      })
    );
    return;  // important: stop here so we don’t run the asset block
  }

  /* ******************** 2. Static assets **************************
   *  For CSS, JS, images, etc. we prefer cache-first:
   *    ▸ Faster repeat loads
   *    ▸ Still works offline if the asset was precached (or requested
   *      and stored by the browser earlier)
   *    ▸ Falls back to network if not in cache (first visit / update)
   ******************************************************************/
  event.respondWith(
    caches.match(event.request).then(
      resp => resp || fetch(event.request)  // cache hit → resp; else fetch
    )
  );
});
