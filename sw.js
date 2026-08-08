// Service worker for Hangman Solver.
// Host this file at the site root (same place as hangman-solver.html) so
// its scope covers the whole site: https://hangman-solver.edgeone.dev/sw.js

const CACHE_NAME = 'hangman-solver-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Stale-while-revalidate: serve from cache immediately if we have it (so it
// works offline / instantly), and update the cache in the background from
// the network for next time. No fixed file list to maintain, since the app
// is a single self-contained HTML file, whatever gets requested gets cached.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cached) => {
        const network = fetch(event.request)
          .then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    )
  );
});
