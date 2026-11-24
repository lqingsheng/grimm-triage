import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CASES } from '../src/cases.js';
import { PORTRAITS, portraitSvg } from '../src/portraits.js';

test('every case has a portrait with an accessible label', () => {
  for (const c of CASES) {
    const p = PORTRAITS[c.id];
    assert.ok(p, `${c.id}: missing portrait in src/portraits.js`);
    assert.ok(typeof p.label === 'string' && p.label.trim().length >= 10, `${c.id}: portrait label too short`);
    assert.ok(typeof p.art === 'string' && p.art.trim().length > 0, `${c.id}: portrait art is empty`);
    const svg = portraitSvg(c.id);
    assert.match(svg, /^<svg [^>]*viewBox="0 0 64 64"/, `${c.id}: not an inline SVG`);
    assert.match(svg, /role="img"/, `${c.id}: SVG needs role="img"`);
    assert.ok(svg.includes(`aria-label="${p.label}"`), `${c.id}: SVG aria-label must match the label`);
    assert.ok(svg.endsWith('</svg>'), `${c.id}: SVG not closed`);
  }
});

test('every portrait belongs to a case (no orphans)', () => {
  const ids = new Set(CASES.map((c) => c.id));
  for (const id of Object.keys(PORTRAITS)) assert.ok(ids.has(id), `portrait ${id} has no matching case`);
});

test('portraits are self-contained: no external assets, links, scripts or nested <svg>', () => {
  for (const [id, { art }] of Object.entries(PORTRAITS)) {
    assert.doesNotMatch(art, /href|url\(|https?:|<image|<use|<script|<foreignObject|<svg|<text|\son\w+=/i, `${id}: art must be plain shapes only`);
  }
});

test('portraitSvg returns empty string for an unknown id', () => {
  assert.equal(portraitSvg('no-such-monster'), '');
});
