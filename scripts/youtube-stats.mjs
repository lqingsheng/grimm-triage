#!/usr/bin/env node
// Records the Kiroween demo video's YouTube statistics (task 20).
// Run by .github/workflows/youtube-stats.yml; by hand:
//   YOUTUBE_API_KEY=... node scripts/youtube-stats.mjs [--file data/youtube-stats.json]
// The key is read only from the YOUTUBE_API_KEY environment variable, sent only in the
// x-goog-api-key header, and never printed. Node 22, no dependencies.
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { VIDEO_ID, apiUrl, parseStatistics, appendPoint, isoUtc, redact } from './youtube-stats-helpers.mjs';

const TIMEOUT_MS = 30_000;

async function readExisting(file) {
  let text;
  try {
    text = await readFile(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return null; // first run
    throw err;
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`${file} is not valid JSON; refusing to overwrite it`);
  }
}

async function fetchStatistics(key) {
  let res;
  try {
    res = await fetch(apiUrl(VIDEO_ID), {
      headers: { 'x-goog-api-key': key, accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    throw new Error(`YouTube API request failed: ${err.message}`);
  }
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`YouTube API returned HTTP ${res.status} with a body that is not JSON`);
  }
  if (!res.ok) {
    const msg = body?.error?.message || res.statusText || 'no message';
    throw new Error(`YouTube API error HTTP ${res.status}: ${msg}`);
  }
  return parseStatistics(body, VIDEO_ID);
}

async function main() {
  const { values } = parseArgs({ options: { file: { type: 'string', default: 'data/youtube-stats.json' } } });
  const file = resolve(values.file);

  const key = (process.env.YOUTUBE_API_KEY || '').trim();
  if (!key) throw new Error('YOUTUBE_API_KEY is not set (add it as a repository secret)');

  try {
    const existing = await readExisting(file);
    const stats = await fetchStatistics(key);
    const next = appendPoint(existing, { t: isoUtc(new Date()), ...stats });

    await mkdir(dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    await writeFile(tmp, `${JSON.stringify(next, null, 2)}\n`);
    await rename(tmp, file);

    console.log(`Recorded views=${stats.views} likes=${stats.likes} comments=${stats.comments} at ${next.updated} (${next.points.length} points) -> ${values.file}`);
  } catch (err) {
    throw new Error(redact(err.message, key));
  }
}

main().catch((err) => {
  console.error(`youtube-stats: ${err.message}`);
  process.exit(1);
});
