// This app does not use a service worker.
// Keep the file present but inert to avoid third-party ad injection.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Intentionally do nothing.
  return;
});
