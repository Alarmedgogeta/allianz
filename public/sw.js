// Kill-switch service worker.
// The browser requests /sw.js when a stale SW from a previous project (e.g.
// Create React App) tries to update itself. Serving a 404 causes some SW
// implementations to reload the page in an error-recovery loop.
// By serving this file instead, the old SW installs this version as its
// replacement. On activation it clears all caches and unregisters itself,
// leaving no SW running for future visits.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      await self.clients.claim();
      await self.registration.unregister();
    })(),
  );
});
