// Static accessibility checks that run without a browser. The full check (axe-core in headless
// Chromium, both languages) is described in the README; these tests stop regressions in the parts
// that are easy to break by editing a token or a string.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { t, levelName, LANGS } from '../src/i18n.js';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

// :root custom properties with plain #rrggbb values.
const tokens = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\b/gi)].map((m) => [m[1], m[2]]));

// WCAG 2.x relative luminance and contrast ratio.
const channel = (v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

// Text colour for each badge, read from the .badge.lvN rules (default black).
function badgeText(level) {
  const rule = css.match(new RegExp(`\\.badge\\.lv${level}\\s*{([^}]*)}`));
  assert.ok(rule, `styles.css needs a .badge.lv${level} rule`);
  assert.match(rule[1], new RegExp(`background:\\s*var\\(--l${level}\\)`));
  const color = rule[1].match(/color:\s*(#[0-9a-f]{3,6})/i)?.[1] ?? '#000000';
  return color.length === 4 ? `#${[...color.slice(1)].map((c) => c + c).join('')}` : color;
}

test('theme text colours meet WCAG AA (4.5:1) on the darkest and lightest panel backgrounds', () => {
  // The panel is #120e1a at 80% over the body gradient (#2a1838 at the top, --bg below):
  // #1a1220 is that blend at its lightest. Buttons use --btn-bg.
  for (const bg of [tokens.bg, '#1a1220', tokens['btn-bg']]) {
    for (const fg of ['ink', 'muted', 'pumpkin', 'ecto', 'candle']) {
      assert.ok(contrast(tokens[fg], bg) >= 4.5, `--${fg} on ${bg} is ${contrast(tokens[fg], bg).toFixed(2)}:1`);
    }
  }
  assert.ok(contrast(tokens.ink, tokens.blood) >= 4.5, 'ink text on the blood-red pressed buttons');
});

test('ESI badges have AA text contrast for every level', () => {
  for (const l of [1, 2, 3, 4, 5]) {
    const ratio = contrast(badgeText(l), tokens[`l${l}`]);
    assert.ok(ratio >= 4.5, `badge ${l}: ${ratio.toFixed(2)}:1`);
  }
});

test('level-button outlines and the focus ring have 3:1 non-text contrast (WCAG 1.4.11)', () => {
  const line = (l) => (l === 1 ? tokens['l1-line'] : tokens[`l${l}`]);
  assert.match(css, /\.levels button\[data-level="1"\]\s*{\s*border-color:\s*var\(--l1-line\)/);
  for (const l of [1, 2, 3, 4, 5]) {
    const ratio = contrast(line(l), tokens['btn-bg']);
    assert.ok(ratio >= 3, `level ${l} outline: ${ratio.toFixed(2)}:1`);
  }
  for (const bg of [tokens.bg, '#1a1220', tokens.blood]) assert.ok(contrast(tokens.ecto, bg) >= 3, `focus ring on ${bg}`);
  assert.match(css, /:focus-visible\s*{\s*outline:\s*3px solid var\(--focus\)/);
  assert.doesNotMatch(css.replace(/:focus:not\(:focus-visible\)\s*{\s*outline:\s*none;\s*}/, ''), /outline:\s*none/, 'focus outline removed somewhere');
});

test('level-button accessible names contain the visible "number name" text in both languages (WCAG 2.5.3)', () => {
  const words = (s) => s.replace(/[\p{P}\p{S}]/gu, ' ').split(/\s+/).filter(Boolean).join(' ');
  for (const lang of LANGS) {
    for (const l of [1, 2, 3, 4, 5]) {
      const name = t('level.button', lang, { level: l, name: levelName(l, lang) });
      assert.ok(words(name).includes(`${l} ${words(levelName(l, lang))}`), `${lang} level ${l}: "${name}"`);
    }
  }
});

test('every button in index.html has a type and a translated label', () => {
  for (const [tag] of html.matchAll(/<button\b[^>]*>/g)) {
    assert.match(tag, /type="button"|type="submit"/, `${tag} needs a type`);
    assert.match(tag, /data-i18n="|data-lang="/, `${tag} needs a data-i18n label`);
  }
});

test('live feedback regions are labelled status regions, landmarks are labelled, decorations are hidden', () => {
  for (const id of ['feedback', 'calcResult']) {
    const tag = html.match(new RegExp(`<div id="${id}"[^>]*>`))?.[0] ?? '';
    assert.match(tag, /role="status"/, `#${id}`);
    assert.match(tag, /aria-live="polite"/, `#${id}`);
    assert.match(tag, /data-i18n-aria="/, `#${id} needs a translated aria-label`);
  }
  for (const id of ['game', 'calc']) assert.match(html, new RegExp(`<section id="${id}"[^>]*data-i18n-aria="`));
  assert.match(html, /<a class="skip-link" href="#main"/);
  assert.match(html, /<main id="main" tabindex="-1">/);
  assert.match(html, /<div class="fog" aria-hidden="true">/);
  for (const cls of ['vignette', 'stains', 'fx-layer']) assert.match(html, new RegExp(`<div class="${cls}"[^>]*aria-hidden="true"`), `.${cls}`);
  assert.match(html, /<svg class="ecg"[^>]*aria-hidden="true"/);
});

test('every form field is wrapped in a label with translated text', () => {
  const labels = [...html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/g)].map((m) => m[1]);
  const fields = html.match(/<(input|select)\b/g) ?? [];
  assert.equal(labels.filter((l) => /<(input|select)\b/.test(l)).length, fields.length, 'a field is outside its label');
  for (const l of labels) assert.match(l, /data-i18n="calc\./, 'label text must be translated');
});
