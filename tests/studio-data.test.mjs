import test from 'node:test';
import assert from 'node:assert/strict';
import { blankDraft, MAX_PALETTES, paletteCss, paletteJson, restoreStudio, RETENTION } from '../app/custom/studio-data.ts';

const now = 1900000000000;
const draft = { name: 'Ocean', colours: [{ id: 'one', name: 'Primary', hex: '#0B6B6D' }] };
const entry = { ...draft, id: 'saved-one', updatedAt: now - 1000 };
const encoded = (extra = {}) => JSON.stringify({ version: 1, draft, draftUpdatedAt: now - 1000, saved: [entry], ...extra });

test('restores a saved draft and its named snapshot across a browser reload', () => {
  assert.deepEqual(restoreStudio(encoded(), now), { draft, saved: [entry] });
});
test('expires the draft and each saved palette independently at seven days', () => {
  assert.deepEqual(restoreStudio(encoded({ draftUpdatedAt: now - RETENTION }), now), { draft: blankDraft(), saved: [entry] });
  assert.deepEqual(restoreStudio(encoded({ saved: [{ ...entry, updatedAt: now - RETENTION }] }), now), { draft, saved: [] });
});
test('rejects malformed storage and unknown storage versions', () => {
  assert.throws(() => restoreStudio('{broken', now));
  assert.throws(() => restoreStudio('{"version":2}', now));
  assert.deepEqual(restoreStudio(null, now), { draft: blankDraft(), saved: [] });
});
test('invalid colour values, duplicate identifiers and excessive colours cannot enter the studio', () => {
  for (const colours of [[{ ...draft.colours[0], hex: 'red' }], [draft.colours[0], draft.colours[0]], Array.from({ length: 33 }, (_, i) => ({ ...draft.colours[0], id: String(i) }))]) {
    assert.deepEqual(restoreStudio(encoded({ draft: { ...draft, colours }, saved: [{ ...entry, colours }] }), now), { draft: blankDraft(), saved: [] });
  }
});
test('bounds saved palettes and rejects invalid timestamps', () => {
  const saved = Array.from({ length: MAX_PALETTES + 2 }, (_, i) => ({ ...entry, id: String(i) }));
  assert.equal(restoreStudio(encoded({ saved }), now).saved.length, MAX_PALETTES);
  assert.equal(restoreStudio(encoded({ saved: [{ ...entry, updatedAt: now + 1 }] }), now).saved.length, 0);
});
test('CSS token names remain valid and unique with duplicate or unusual colour names', () => {
  const css = paletteCss({ name: 'Custom', colours: [{ id: 'a', name: 'Main; } body {', hex: '#aabbcc' }, { id: 'b', name: 'Main; } body {', hex: '#001122' }, { id: 'c', name: '🌈', hex: '#FFFFFF' }] });
  assert.equal(css, ':root {\n  --palette-1-main-body: #AABBCC;\n  --palette-2-main-body: #001122;\n  --palette-3-colour: #FFFFFF;\n}\n');
});
test('JSON export retains names and colour order without browser-specific identifiers', () => {
  assert.deepEqual(JSON.parse(paletteJson(draft)), { name: 'Ocean', colours: [{ name: 'Primary', hex: '#0B6B6D' }] });
});
