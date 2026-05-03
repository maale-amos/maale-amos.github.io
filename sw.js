// Maale Amos Service Worker v3
var CACHE_VERSION = 'maale-amos-v3';
var CORE_URLS = [
  '/maale-amos/',
  '/maale-amos/index.html',
  '/maale-amos/manifest.json',
  '/maale-amos/data.json',
  '/maale-amos/phones.json',
  '/maale-amos/images/logo.png'
];

// Install: pre-cache core
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function(c) {
      return c.addAll(CORE_URLS).catch(function() { return null; });
    })
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) {
        if (k !== CACHE_VERSION) return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

// Fetch: network-first for HTML/JSON (always fresh), cache-first for assets
self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  // Skip cross-origin (Google APIs, fonts CDN, hebcal etc.) - just network
  if (url.origin !== self.location.origin) {
    e.respondWith(fetch(req).catch(function() { return caches.match(req); }));
    return;
  }

  // HTML & JSON: network-first with cache fallback
  if (req.headers.get('accept').indexOf('text/html') !== -1 ||
      url.pathname.endsWith('.json')) {
    e.respondWith(
      fetch(req)
        .then(function(res) {
          var clone = res.clone();
          caches.open(CACHE_VERSION).then(function(c) { c.put(req, clone); });
          return res;
        })
        .catch(function() { return caches.match(req).then(function(r) { return r || caches.match('/maale-amos/index.html'); }); })
    );
    return;
  }

  // Other assets: cache-first
  e.respondWith(
    caches.match(req).then(function(cached) {
      return cached || fetch(req).then(function(res) {
        if (res.ok) {
          var clone = res.clone();
          caches.open(CACHE_VERSION).then(function(c) { c.put(req, clone); });
        }
        return res;
      });
    })
  );
});
