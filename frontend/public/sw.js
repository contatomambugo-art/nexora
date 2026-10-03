// Service worker mínimo: guarda o "casco" do app para abrir offline.
// NUNCA faz cache de outras origens (listas M3U, streams, proxy) nem de requisições Range.
const V = 'nexora-v1';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(['./', './manifest.webmanifest', './icons/icon-192.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || r.headers.has('range')) return;
  if (r.mode === 'navigate') { // rede primeiro; offline cai no último index
    e.respondWith(fetch(r).then((res) => { const c = res.clone(); caches.open(V).then((x) => x.put('./', c)); return res; }).catch(() => caches.match('./')));
    return;
  }
  e.respondWith(caches.match(r).then((hit) => { // assets com hash: cache + atualiza em segundo plano
    const net = fetch(r).then((res) => { if (res.ok) { const c = res.clone(); caches.open(V).then((x) => x.put(r, c)); } return res; }).catch(() => hit);
    return hit || net;
  }));
});
