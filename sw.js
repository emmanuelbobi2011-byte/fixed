// Remove any previous malicious ad worker and do not register one.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Remove stale caches and registrations.
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));

    // If a previous registration exists, clear it.
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  // Do nothing: no interception, no ad injection.
  return;
});
