import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const manifest = JSON.parse(read('manifest.webmanifest'));
const html = read('index.html');
const swSource = read('sw.js');

// A relative URL that stays inside the deploy folder: no scheme, no leading slash, no "..".
const isRelative = (url) => !/^[a-z]+:|^\/|(^|\/)\.\.(\/|$)/i.test(url);
const HEX = /^#[0-9a-f]{6}$/i;

// PNG width and height from the IHDR chunk.
function pngSize(path) {
  const buf = readFileSync(new URL(path, root));
  assert.equal(buf.toString('hex', 0, 8), '89504e470d0a1a0a', `${path}: not a PNG`);
  return `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`;
}

test('manifest is valid JSON with the fields browsers need to install the app', () => {
  for (const key of ['name', 'short_name', 'start_url', 'scope', 'display', 'theme_color', 'background_color', 'icons']) {
    assert.ok(manifest[key], `manifest.${key} is missing`);
  }
  assert.ok(manifest.short_name.length <= 12, 'short_name should fit under a home-screen icon (<= 12 chars)');
  assert.ok(['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display));
  assert.match(manifest.theme_color, HEX);
  assert.match(manifest.background_color, HEX);
  assert.match(manifest.description, /Not a medical device/, 'install prompt keeps the disclaimer');
  for (const key of ['id', 'start_url', 'scope']) assert.ok(isRelative(manifest[key]), `${key} must be relative`);
});

test('manifest icons exist, are relative, and cover 192, 512 and maskable', () => {
  for (const icon of manifest.icons) {
    assert.ok(isRelative(icon.src), `${icon.src} must be relative`);
    assert.ok(existsSync(new URL(icon.src, root)), `${icon.src} does not exist`);
    if (icon.type === 'image/png') assert.equal(pngSize(icon.src), icon.sizes, `${icon.src}: real size differs from manifest`);
    if (icon.type === 'image/svg+xml') {
      const svg = read(icon.src);
      assert.doesNotMatch(svg, /href|url\((?!#)|https?:\/\/(?!www\.w3\.org)|<script|<image/i, `${icon.src}: must be self-contained`);
    }
  }
  const png = (size, purpose) => manifest.icons.some((i) => i.type === 'image/png' && i.sizes === size && i.purpose.split(' ').includes(purpose));
  assert.ok(png('192x192', 'any'), 'needs a 192x192 PNG icon');
  assert.ok(png('512x512', 'any'), 'needs a 512x512 PNG icon');
  assert.ok(png('512x512', 'maskable'), 'needs a 512x512 maskable PNG icon');
});

test('index.html links the manifest, theme colour and icons, and registers sw.js by relative path', () => {
  assert.match(html, /<link rel="manifest" href="manifest\.webmanifest"/);
  assert.ok(html.includes(`<meta name="theme-color" content="${manifest.theme_color}"`), 'theme-color must match the manifest');
  assert.match(html, /<link rel="apple-touch-icon" href="icons\/apple-touch-icon\.png"/);
  assert.match(html, /navigator\.serviceWorker\.register\('sw\.js'\)/);
  // The one allowed absolute URL is the optional Umami statistics script (task 19, test/analytics.test.js).
  for (const [, url] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    if (url === 'https://cloud.umami.is/script.js') continue;
    assert.ok(isRelative(url), `index.html: ${url} must be relative`);
  }
});

// ---- service worker, run in a small fake ServiceWorkerGlobalScope ----
const ORIGIN = 'https://grimm.example';
const BASE = `${ORIGIN}/app/`; // a sub-folder deploy, to prove nothing assumes the domain root

function fakeScope({ cacheNames = [], network = async () => { throw new TypeError('offline'); } } = {}) {
  const stores = new Map(cacheNames.map((n) => [n, new Map()]));
  const deleted = [];
  const abs = (r) => new URL(typeof r === 'string' ? r : r.url, BASE).href.split('?')[0];
  const cacheFor = (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    const store = stores.get(name);
    return {
      addAll: async (reqs) => { for (const r of reqs) store.set(abs(r), { url: abs(r), ok: true, clone() { return this; } }); },
      put: async (r, res) => { store.set(abs(r), res); },
      match: async (r) => store.get(abs(r)),
    };
  };
  const listeners = {};
  const self = {
    location: new URL(`${BASE}sw.js`),
    addEventListener: (type, fn) => { listeners[type] = fn; },
    skipWaiting: async () => {},
    clients: { claim: async () => {} },
  };
  const caches = {
    open: async (name) => cacheFor(name),
    keys: async () => [...stores.keys()],
    delete: async (name) => { deleted.push(name); return stores.delete(name); },
  };
  class FakeRequest { constructor(url, init) { this.url = new URL(url, BASE).href; this.init = init; } }
  const context = vm.createContext({ self, caches, fetch: network, Request: FakeRequest, URL, Promise, console });
  vm.runInContext(swSource, context, { filename: 'sw.js' });
  const fire = async (type, extra = {}) => {
    let done;
    let response;
    const event = { ...extra, waitUntil: (p) => { done = p; }, respondWith: (p) => { response = p; } };
    listeners[type](event);
    await done;
    return response;
  };
  return { context, stores, deleted, fire, listeners };
}

const sw = fakeScope();
const PRECACHE = [...vm.runInContext('PRECACHE_URLS', sw.context)];
const CACHE_NAME = vm.runInContext('CACHE_NAME', sw.context);

test('service worker precaches index.html, styles.css, the manifest, its icons and every file in src/', () => {
  const srcFiles = readdirSync(new URL('src/', root)).filter((f) => !f.startsWith('.')).map((f) => `src/${f}`);
  assert.ok(srcFiles.length >= 6);
  const expected = ['./', 'index.html', 'styles.css', 'manifest.webmanifest', ...manifest.icons.map((i) => i.src), 'icons/apple-touch-icon.png', ...srcFiles];
  for (const url of expected) assert.ok(PRECACHE.includes(url), `PRECACHE_URLS is missing ${url}`);
  for (const url of PRECACHE) {
    assert.ok(isRelative(url), `${url} must be relative`);
    if (url !== './') assert.ok(existsSync(new URL(url, root)), `${url} is precached but does not exist`);
  }
  assert.equal(new Set(PRECACHE).size, PRECACHE.length, 'PRECACHE_URLS has duplicates');
});

test('every relative import in src/ is precached (no module can be missing offline)', () => {
  for (const file of PRECACHE.filter((u) => u.startsWith('src/'))) {
    for (const [, spec] of read(file).matchAll(/from\s+'(\.[^']+)'/g)) {
      const target = new URL(spec, new URL(file, 'https://x/')).pathname.slice(1);
      assert.ok(PRECACHE.includes(target), `${file} imports ${target}, which is not precached`);
    }
  }
});

test('cache name is versioned', () => {
  assert.match(CACHE_NAME, /^grimm-triage-v\d+$/);
});

test('install fills the versioned cache with every precache URL, bypassing the HTTP cache', async () => {
  const s = fakeScope();
  await s.fire('install');
  const store = s.stores.get(CACHE_NAME);
  for (const url of PRECACHE) assert.ok(store.has(new URL(url, BASE).href), `${url} not cached on install`);
  assert.ok(swSource.includes("cache: 'reload'"));
});

test('activate deletes old grimm-triage caches only', async () => {
  const s = fakeScope({ cacheNames: ['grimm-triage-v0', CACHE_NAME, 'someone-elses-cache'] });
  await s.fire('activate');
  assert.deepEqual(s.deleted, ['grimm-triage-v0']);
  assert.deepEqual([...s.stores.keys()].sort(), [CACHE_NAME, 'someone-elses-cache'].sort());
});

test('fetch serves precached files offline and falls back to index.html for navigations', async () => {
  const s = fakeScope(); // network always throws: fully offline
  await s.fire('install');
  const get = (path, mode = 'cors') => s.fire('fetch', { request: { method: 'GET', mode, url: new URL(path, BASE).href } });
  assert.equal((await get('src/triage.js')).url, `${BASE}src/triage.js`);
  assert.equal((await get('?utm=x', 'navigate')).url, BASE, 'start URL with a query string still opens offline');
  assert.equal((await get('some/deep/link', 'navigate')).url, `${BASE}index.html`);
  await assert.rejects(get('not-precached.png'), /offline/);
  // Cross-origin and non-GET requests are left to the browser.
  assert.equal(await s.fire('fetch', { request: { method: 'GET', mode: 'cors', url: 'https://other.example/x.js' } }), undefined);
  assert.equal(await s.fire('fetch', { request: { method: 'POST', mode: 'cors', url: `${BASE}index.html` } }), undefined);
});
