// Pure helpers for the YouTube statistics recorder (task 20, scripts/youtube-stats.mjs).
// No network, no file system, no clock: everything here is unit-tested with node --test.

export const VIDEO_ID = '-ohBaZVDCfU';
export const VIDEO_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
export const MAX_POINTS = 1000;

// The API key is never part of this URL: it is sent in the x-goog-api-key header.
export const apiUrl = (videoId = VIDEO_ID) => {
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'statistics');
  url.searchParams.set('id', videoId);
  return url.toString();
};

// ISO 8601 UTC time to the second, e.g. 2026-11-26T15:17:03Z.
export const isoUtc = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) throw new TypeError('isoUtc needs a valid Date');
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

// YouTube sends counts as decimal strings. A count that is absent means YouTube hides it
// (likes hidden by the owner, comments turned off): stored as null, never as 0.
function toCount(value, field) {
  if (value === undefined || value === null) return null;
  const s = String(value);
  if (!/^\d+$/.test(s)) throw new Error(`YouTube API response has an invalid ${field}: ${JSON.stringify(value)}`);
  const n = Number(s);
  if (!Number.isSafeInteger(n)) throw new Error(`YouTube API response has an out-of-range ${field}: ${s}`);
  return n;
}

// The parsed JSON body of videos.list -> { views, likes, comments }. Throws a clear Error for
// an API error body, a missing video or a missing statistics field.
export function parseStatistics(body, videoId = VIDEO_ID) {
  if (body === null || typeof body !== 'object') throw new Error('YouTube API response is not a JSON object');
  if (body.error) {
    const { code, message } = body.error;
    throw new Error(`YouTube API error${code ? ` ${code}` : ''}: ${message || 'no message'}`);
  }
  if (!Array.isArray(body.items)) throw new Error('YouTube API response has no items list');
  const item = body.items.find((it) => it && it.id === videoId);
  if (!item) throw new Error(`Video ${videoId} was not found (private, deleted or wrong id)`);
  const s = item.statistics;
  if (s === null || typeof s !== 'object') throw new Error(`YouTube API response for ${videoId} has no statistics field`);
  return {
    views: toCount(s.viewCount, 'viewCount'),
    likes: toCount(s.likeCount, 'likeCount'),
    comments: toCount(s.commentCount, 'commentCount'),
  };
}

// The newest `max` points, oldest first. Sorting by time first keeps the newest points even
// if the input is out of order.
export function trimPoints(points, max = MAX_POINTS) {
  if (!Number.isInteger(max) || max < 1) throw new RangeError(`max must be a whole number >= 1, got ${max}`);
  const sorted = points.map((p, i) => [p, i]).sort(([a, i], [b, j]) => (a.t < b.t ? -1 : a.t > b.t ? 1 : i - j)).map(([p]) => p);
  return sorted.slice(-max);
}

// Existing file content (or null for a first run) + one new point -> the new file content.
// Never mutates `data`. Refuses content it does not recognise rather than overwrite history.
export function appendPoint(data, point, { videoId = VIDEO_ID, url = VIDEO_URL, max = MAX_POINTS } = {}) {
  let points = [];
  if (data !== null && data !== undefined) {
    if (typeof data !== 'object' || !Array.isArray(data.points)) throw new Error('Existing stats file has no points list; refusing to overwrite it');
    if (data.videoId !== undefined && data.videoId !== videoId) throw new Error(`Existing stats file is for video ${data.videoId}, not ${videoId}`);
    points = data.points;
  }
  if (!point || typeof point.t !== 'string') throw new Error('A point needs a time t');
  const { t, views, likes, comments } = point;
  const next = trimPoints([...points, { t, views, likes, comments }], max);
  return { videoId, url, updated: t, points: next };
}

// Replace every occurrence of `secret` in `text`, so an error message can never print the key.
export const redact = (text, secret) => (secret ? String(text).split(secret).join('***') : String(text));
