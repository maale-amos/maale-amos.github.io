// sw.js — unregister stub (v2 site does NOT use a service worker).
// Purpose: any browser that previously registered the old sw.js will
// now unregister it and clear caches, allowing the new Eleventy site
// to load fresh from GitHub Pages.
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', async () => {
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    const regs = await self.registration.unregister();
  } catch (_) {}
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach(c => c.navigate(c.url));
});
self.addEventListener('fetch', e => {
  // Pass-through: never serve from cache
  e.respondWith(fetch(e.request));
});
