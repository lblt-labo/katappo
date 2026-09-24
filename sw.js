var C = 'katappo-v1';
var F = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(C)
      .then(function (c) {
        return Promise.all(F.map(function (u) { return c.add(u).catch(function () {}); }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.filter(function (n) { return n !== C; }).map(function (n) { return caches.delete(n); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(function (r) {
        var cp = r.clone();
        caches.open(C).then(function (c) { return c.put(e.request, cp); }).catch(function () {});
        return r;
      })
      .catch(function () {
        return caches.match(e.request).then(function (m) { return m || caches.match('./index.html'); });
      })
  );
});
