const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const fixture = require('./fixtures/look-here-v1.json');
const source = buildSync({ entryPoints: ['src/runtime/private-photo-store.ts'], bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const mod = { exports: {} }; new Function('module', 'exports', source)(mod, mod.exports);
const { parsePrivatePhoto, PRIVATE_PHOTO_DB } = mod.exports;

test('final4 v1 fixture keeps original image, date, text and attribution without consulting a scene', () => {
  assert.equal(PRIVATE_PHOTO_DB, fixture.database);
  for (const row of fixture.photos) {
    const read = parsePrivatePhoto(JSON.parse(JSON.stringify(row)));
    assert.deepEqual(read, row);
    assert.deepEqual(parsePrivatePhoto(JSON.parse(JSON.stringify(read))), row);
    assert.notEqual(read, row);
    assert.notEqual(read.attribution, row.attribution);
  }
});
test('a damaged record is rejected individually, without mutating the original collection', () => {
  const valid = fixture.photos[1];
  const damaged = [null, {}, { ...valid, image: 'https://invalid.test/photo.png' }, { ...valid, point: 'unknown' }, { ...valid, kind: 'future-photo' }, { ...valid, anchor: 4 }, { ...valid, createdAt: NaN }, { ...valid, attribution: { kind: 'pen-name', name: '未知' } }];
  for (const row of damaged) assert.equal(parsePrivatePhoto(row), null);
  const mixed = [fixture.photos[0], ...damaged, valid];
  const before = structuredClone(mixed);
  assert.deepEqual(mixed.map(parsePrivatePhoto).filter(Boolean), fixture.photos);
  assert.deepEqual(mixed, before);
});
