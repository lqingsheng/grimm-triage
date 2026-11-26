// YouTube statistics recorder (task 20): scripts/youtube-stats-helpers.mjs, the script, the workflow and vercel.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  VIDEO_ID, VIDEO_URL, MAX_POINTS, apiUrl, isoUtc, parseStatistics, trimPoints, appendPoint, redact,
} from '../scripts/youtube-stats-helpers.mjs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const body = (statistics, id = VIDEO_ID) => ({ kind: 'youtube#videoListResponse', items: [{ kind: 'youtube#video', id, statistics }] });
const pt = (i) => ({ t: `2026-11-${String(1 + Math.floor(i / 24)).padStart(2, '0')}T${String(i % 24).padStart(2, '0')}:17:00Z`, views: i, likes: i, comments: 0 });

test('apiUrl: statistics for the demo video, and no key in the URL', () => {
  assert.equal(VIDEO_ID, '-ohBaZVDCfU');
  assert.equal(apiUrl(), 'https://www.googleapis.com/youtube/v3/videos?part=statistics&id=-ohBaZVDCfU');
  assert.doesNotMatch(apiUrl(), /key=/i);
});

test('isoUtc: ISO 8601 UTC to the second', () => {
  assert.equal(isoUtc(new Date(Date.UTC(2026, 10, 26, 15, 17, 3, 456))), '2026-11-26T15:17:03Z');
  assert.throws(() => isoUtc(new Date('nope')), TypeError);
});

test('parseStatistics: counts as numbers', () => {
  assert.deepEqual(
    parseStatistics(body({ viewCount: '1234', likeCount: '56', favoriteCount: '0', commentCount: '7' })),
    { views: 1234, likes: 56, comments: 7 },
  );
});

test('parseStatistics: likes hidden by YouTube is null, not 0', () => {
  const s = parseStatistics(body({ viewCount: '10', commentCount: '2' }));
  assert.equal(s.likes, null);
  assert.notEqual(s.likes, 0);
  assert.equal(parseStatistics(body({ viewCount: '10', likeCount: '0' })).likes, 0, 'a real zero stays 0');
  assert.equal(parseStatistics(body({ viewCount: '10', likeCount: '3' })).comments, null, 'comments turned off is null');
});

test('parseStatistics: a missing statistics field gives a clear error', () => {
  assert.throws(() => parseStatistics({ items: [{ id: VIDEO_ID }] }), /no statistics field/);
  assert.throws(() => parseStatistics({ items: [{ id: VIDEO_ID, statistics: null }] }), /no statistics field/);
});

test('parseStatistics: missing video, API error bodies and malformed counts are clear errors', () => {
  assert.throws(() => parseStatistics({ items: [] }), /-ohBaZVDCfU was not found/);
  assert.throws(() => parseStatistics(body({ viewCount: '1' }, 'other')), /not found/);
  assert.throws(() => parseStatistics({ error: { code: 403, message: 'quota exceeded' } }), /YouTube API error 403: quota exceeded/);
  assert.throws(() => parseStatistics({}), /no items list/);
  assert.throws(() => parseStatistics(null), /not a JSON object/);
  assert.throws(() => parseStatistics(body({ viewCount: '-1' })), /invalid viewCount/);
  assert.throws(() => parseStatistics(body({ viewCount: '12.5' })), /invalid viewCount/);
});

test('appendPoint: first run builds the file shape', () => {
  const p = { t: '2026-11-26T15:17:03Z', views: 10, likes: null, comments: 1 };
  assert.deepEqual(appendPoint(null, p), { videoId: VIDEO_ID, url: VIDEO_URL, updated: p.t, points: [p] });
  assert.equal(VIDEO_URL, 'https://www.youtube.com/watch?v=-ohBaZVDCfU');
});

test('appendPoint: appends, updates `updated`, keeps only t/views/likes/comments, never mutates', () => {
  const old = appendPoint(null, pt(0));
  const frozen = structuredClone(old);
  const next = appendPoint(old, { ...pt(1), extra: 'x' });
  assert.deepEqual(old, frozen);
  assert.equal(next.points.length, 2);
  assert.equal(next.updated, pt(1).t);
  assert.deepEqual(Object.keys(next.points[1]), ['t', 'views', 'likes', 'comments']);
});

test('appendPoint: refuses files it does not recognise instead of wiping history', () => {
  assert.throws(() => appendPoint({ hello: 1 }, pt(0)), /refusing to overwrite/);
  assert.throws(() => appendPoint({ videoId: 'abc', points: [] }, pt(0)), /for video abc/);
  assert.throws(() => appendPoint(null, { views: 1 }), /needs a time/);
});

test('trimming keeps the newest points, at most 1000', () => {
  assert.equal(MAX_POINTS, 1000);
  let data = null;
  for (let i = 0; i < 1005; i++) data = appendPoint(data, pt(i));
  assert.equal(data.points.length, 1000);
  assert.deepEqual(data.points[0], pt(5));
  assert.deepEqual(data.points.at(-1), pt(1004));
  // Out-of-order input: still the newest, oldest first.
  assert.deepEqual(trimPoints([pt(3), pt(1), pt(2), pt(0)], 2), [pt(2), pt(3)]);
  assert.throws(() => trimPoints([], 0), RangeError);
});

test('redact: the key never survives in a message', () => {
  assert.equal(redact('bad key AIzaSECRET here AIzaSECRET', 'AIzaSECRET'), 'bad key *** here ***');
  assert.equal(redact('no key', ''), 'no key');
});

test('script: missing key exits non-zero with a clear message', () => {
  const script = fileURLToPath(new URL('../scripts/youtube-stats.mjs', import.meta.url));
  const env = { ...process.env };
  delete env.YOUTUBE_API_KEY;
  const r = spawnSync(process.execPath, [script, '--file', '/nonexistent/never-written.json'], { env, encoding: 'utf8' });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /YOUTUBE_API_KEY is not set/);
});

test('script: key only from env, only in the x-goog-api-key header, never logged', () => {
  const src = read('scripts/youtube-stats.mjs');
  assert.match(src, /process\.env\.YOUTUBE_API_KEY/);
  assert.match(src, /'x-goog-api-key': key/);
  assert.doesNotMatch(src, /console\.\w+\([^)]*\bkey\b/);
  assert.doesNotMatch(src, /[?&]key=/);
});

test('workflow: schedule, dispatch, write permission, stats branch only, secret only', () => {
  const wf = read('.github/workflows/youtube-stats.yml');
  assert.match(wf, /cron: "17 \*\/3 \* \* \*"/);
  assert.match(wf, /workflow_dispatch:/);
  assert.match(wf, /permissions:\n  contents: write/);
  assert.match(wf, /git push origin HEAD:refs\/heads\/stats/);
  assert.match(wf, /commit -q -m "stats: update YouTube statistics"/);
  assert.match(wf, /git diff --cached --quiet/);
  assert.doesNotMatch(wf, /\bmain\b|\bmaster\b/);
  assert.equal(wf.match(/secrets\.YOUTUBE_API_KEY/g).length, 1);
});

test('vercel.json only turns off deploys of the stats branch', () => {
  assert.deepEqual(JSON.parse(read('vercel.json')), { git: { deploymentEnabled: { stats: false } } });
});

test('the app and service worker never load the stats scripts', () => {
  for (const f of ['index.html', 'sw.js', 'src/app.js']) assert.doesNotMatch(read(f), /youtube-stats/i, f);
});
