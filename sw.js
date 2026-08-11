// Bump this version string whenever index.html / react-bundle.js / icons change,
// so returning users get the fresh copy instead of a stale cached one.
var CACHE_NAME = 'jcb-hisab-v6';

var ASSETS = [
  './',
  './index.html',
  './react-bundle.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME; })
            .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Network-first, falling back to cache: when online, always serve the latest
// deployed version and refresh the cache; when offline, serve the last
// successfully cached copy so the app still opens.
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then(function (networkResponse) {
      var clone = networkResponse.clone();
      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(event.request, clone);
      });
      return networkResponse;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});
