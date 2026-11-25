// Keeps the meeting system working without internet.
// Bump VERSION whenever index.html changes so phones pick up the new copy.
const VERSION = "v13";
const CACHE = "strategy-meetings-" + VERSION;
const FILES = [
  "./",
  "index.html",
  "logo.jpg",
  "icon-192.png",
  "icon-512.png",
  "manifest.json",
  "fonts/assistant-hebrew.woff2",
  "fonts/assistant-latin.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// network first (so updates arrive), falling back to the saved copy when offline
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" })  // always ask the server, never a stale browser copy
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
  );
});
