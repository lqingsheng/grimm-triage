// Triage Desk inline help (task 16): strings, the resource checklist, markup and accessibility.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HELP_FIELDS, HELP_KEYS, RESOURCE_WEIGHT, countResources, helpButtonHtml, helpPanelHtml } from '../src/deskhelp.js';
import { RESOURCE_COUNTS, RESOURCE_NOT } from '../src/lesson.js';
import { STRINGS, LANGS, t } from '../src/i18n.js';

const CJK = /[\u4e00-\u9fff]/;
const FIELDS = Object.keys(HELP_FIELDS);
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const trFor = (lang) => (k, v) => t(k, lang, v);

test('help covers exactly the five judgement fields, each wrapped in index.html', () => {
  assert.deepEqual(FIELDS.sort(), ['highRisk', 'needsLifesaving', 'newConfusion', 'pain', 'resources']);
  for (const f of FIELDS) {
    const block = html.match(new RegExp(`<div class="field" data-field="${f}">\\s*<label[^>]*>([\\s\\S]*?)</label>\\s*</div>`));
    assert.ok(block, `${f}: missing .field wrapper`);
    assert.match(block[1], new RegExp(`name="${f}"`), `${f}: the wrapper holds its own input`);
  }
});

test('every help key exists in English and Chinese, and every key the help uses is listed', () => {
  const helpKeys = Object.keys(STRINGS).filter((k) => k.startsWith('help.'));
  for (const k of helpKeys) {
    assert.ok(STRINGS[k].en?.trim(), `${k}: no English`);
    assert.ok(STRINGS[k]['zh-CN']?.trim(), `${k}: no Chinese`);
    assert.match(STRINGS[k]['zh-CN'], CJK, `${k}: Chinese is not Chinese`);
  }
  for (const k of HELP_KEYS) assert.ok(STRINGS[k], `missing string ${k}`);
  for (const lang of LANGS) {
    for (const f of FIELDS) {
      const out = helpButtonHtml(f, trFor(lang)) + helpPanelHtml(f, trFor(lang), { open: true, ticked: RESOURCE_COUNTS });
      assert.doesNotMatch(out, /\b(help|lesson|calc)\.[\w.]+/, `${lang}/${f}: an untranslated key leaked`);
      assert.doesNotMatch(out, /\{\w+\}/, `${lang}/${f}: an unfilled placeholder`);
    }
  }
});

test('the checklist uses the same keys and strings as the shift-report lesson', () => {
  for (const lang of LANGS) {
    const panel = helpPanelHtml('resources', trFor(lang), { open: true });
    const boxes = [...panel.matchAll(/data-resource="(\w+)"/g)].map((m) => m[1]);
    assert.deepEqual(boxes, RESOURCE_COUNTS, 'one checkbox per countable resource, in the lesson order');
    for (const k of RESOURCE_COUNTS) assert.ok(panel.includes(t(`lesson.counts.${k}`, lang)), `${lang}: ${k} text`);
    for (const k of RESOURCE_NOT) assert.ok(panel.includes(`<li>${t(`lesson.not.${k}`, lang)}</li>`), `${lang}: not-counted ${k}`);
  }
  assert.deepEqual(Object.keys(RESOURCE_WEIGHT), ['complex']);
  assert.ok(RESOURCE_COUNTS.includes('complex'));
});

test('the checklist count equals the sum of ticked items (complex = 2) for every combination', () => {
  const n = RESOURCE_COUNTS.length;
  for (let mask = 0; mask < 2 ** n; mask += 1) {
    const ticked = RESOURCE_COUNTS.filter((_, i) => mask & (1 << i));
    const expected = ticked.length + (ticked.includes('complex') ? 1 : 0);
    assert.equal(countResources(ticked), expected, ticked.join(','));
    assert.equal(countResources([...ticked, ...ticked]), expected, 'each type counts once');
  }
  assert.equal(countResources(['labs', 'oral', 'refill', 'nonsense']), 1, 'items that do not count are ignored');
  assert.equal(countResources([]), 0);
});

test('help buttons have aria-expanded, aria-controls pointing at their panel, and a translated name', () => {
  for (const lang of LANGS) {
    for (const f of FIELDS) {
      for (const open of [false, true]) {
        const btn = helpButtonHtml(f, trFor(lang), open);
        const panel = helpPanelHtml(f, trFor(lang), { open });
        assert.match(btn, /^<button type="button" class="help-btn"/);
        assert.ok(btn.includes(`aria-expanded="${open}"`), `${f}: aria-expanded`);
        const controls = btn.match(/aria-controls="([^"]+)"/)?.[1];
        assert.equal(controls, HELP_FIELDS[f].id);
        assert.ok(panel.includes(`id="${controls}"`), `${f}: aria-controls must point at the panel`);
        assert.ok(btn.includes(`aria-label="${t('help.button', lang, { field: t(HELP_FIELDS[f].label, lang) })}"`), `${f}: accessible name`);
        assert.match(btn, /<span aria-hidden="true">ⓘ<\/span>/, 'the symbol is hidden from screen readers');
        assert.equal(panel.includes(' hidden'), !open, `${f}: hidden when closed`);
        assert.match(panel, new RegExp(`role="region" aria-labelledby="${controls}-title"`));
        assert.match(panel, new RegExp(`<h3 id="${controls}-title">`));
      }
    }
  }
});

test('the checklist keeps ticked boxes and shows the running total', () => {
  const panel = helpPanelHtml('resources', trFor('en'), { open: true, ticked: ['labs', 'complex'] });
  assert.equal((panel.match(/ checked>/g) ?? []).length, 2);
  assert.ok(panel.includes('Ticked: 3'));
  assert.match(panel, /<fieldset class="resource-check"><legend>/);
  assert.match(panel, /class="resource-total" aria-live="polite"/);
  for (const m of panel.matchAll(/<input type="checkbox"[^>]*>/g)) assert.doesNotMatch(m[0], /name=/, 'checklist boxes are not submitted with the form');
  assert.ok(panel.includes(STRINGS['help.resources.rule'].en));
  assert.equal(STRINGS['help.resources.rule'].en, 'Count different types of resources, not tests: a blood count and electrolytes are one resource (labs).');
});

test('help content says what the task asks for', () => {
  const en = (f) => helpPanelHtml(f, trFor('en'), { open: true });
  assert.match(en('pain'), /0 is no pain, 10 is the worst pain you can imagine/);
  assert.match(en('pain'), /FLACC/);
  assert.match(en('pain'), /consider ESI 2 at step B\. This game always assigns ESI 2 at 7 or more\./);
  assert.match(en('highRisk'), /would I give my last open bed to this patient\?/);
  assert.equal((en('highRisk').match(/<li>/g) ?? []).length, 12);
  assert.match(en('needsLifesaving'), /Not life-saving on their own/);
  assert.match(en('newConfusion'), /AVPU field/);
});

test('no links, images or animation: works offline and in reduced-motion mode', () => {
  for (const lang of LANGS) {
    for (const f of FIELDS) {
      const out = helpButtonHtml(f, trFor(lang)) + helpPanelHtml(f, trFor(lang), { open: true });
      assert.doesNotMatch(out, /href=|https?:|<img|<svg|<script|style=|\son\w+=/, `${lang}/${f}`);
    }
  }
  const helpCss = css.slice(css.indexOf('/* Triage Desk inline help'), css.indexOf('.resource-total')).replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(helpCss.length > 200);
  assert.doesNotMatch(helpCss, /animation|transition/);
  assert.match(helpCss, /\.help-btn \{[^}]*min-width: 44px; min-height: 44px/, '44 px touch target');
  assert.match(helpCss, /\.help-panel \{[^}]*grid-column: 1 \/ -1/, 'the panel spans the row under the field');
});

test('app.js wires the help: toggling, the checklist filling the number, and Escape to close', () => {
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /setAttribute\('aria-expanded', String\(open\)\)/);
  assert.match(app, /input\[name="resources"\]'\)\.value = count/);
  assert.match(app, /e\.key !== 'Escape'/);
  const setLang = app.slice(app.indexOf('function setLang'), app.indexOf('\n}\n', app.indexOf('function setLang')));
  assert.match(setLang, /renderDeskHelp\(\)/, 'help re-renders in the new language');
});
