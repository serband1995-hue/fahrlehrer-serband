// OMNIA Start-App: kleiner Service Worker, damit Chrome die App installieren kann.
// Er speichert nichts Privates; er reicht Anfragen nur weiter.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(() => new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<body style="background:#0a1e0e;color:#e8d9a8;font:17px system-ui;display:grid;place-items:center;height:100vh;margin:0;text-align:center">' +
    '<p>Kein Internet.<br>OMNIA braucht eine Verbindung.</p>',
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } })));
});
