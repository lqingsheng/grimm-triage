// Service worker: precaches the whole app so Grimm Triage works offline after the first visit.
// Registered from index.html. Every path is relative to this file, so the app works at a domain
// root (Vercel) or in a sub-folder (GitHub Pages).
//
// Bump CACHE_VERSION whenever any precached file changes: the new worker then installs a fresh
// cache and the activate step deletes the old one. test/pwa.test.js checks that PRECACHE_URLS
// lists every file in src/.

const CACHE_PREFIX = 'grimm-triage-';
const CACHE_VERSION = 'v8';
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  'index.html',
  'styles.css',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/maskable.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
  'src/analytics.js',
  'src/app.js',
  'src/cases.js',
  'src/deskhelp.js',
  'src/haunt.js',
  'src/i18n.js',
  'src/lesson.js',
  'src/night.js',
  'src/portraits.js',
  'src/shift.js',
  'src/sound.js',
  'src/triage.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // cache: 'reload' skips the HTTP cache so a new version never precaches stale files.
      .then((cache) => cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

// Delete caches from older versions of this app (same prefix, different name). Caches owned by
// anything else on the origin are left alone.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

// Cache first for this app's own files; anything not precached goes to the network and a
// successful same-origin response is added to the cache. Cross-origin requests (the Umami
// statistics script and its beacons) are never handled or cached, so blocking them changes nothing. Page navigations fall back to the cached
// index.html, so a reload while offline still opens the game.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(respond(request));
});

async function respond(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok && response.type === 'basic') await cache.put(request, response.clone());
    return response;
  } catch (err) {
    if (request.mode === 'navigate') {
      const shell = await cache.match('index.html');
      if (shell) return shell;
    }
    throw err;
  }
}
