const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
const code = buildSync({ stdin: { contents: 'export * from "./src/journey/day-route"; export * from "./src/content/day-routes"; export * from "./src/content/look-here"; export * from "./src/journey/look-here/model"; export * from "./src/runtime/private-photo-store";', resolveDir: process.cwd() }, bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const box = { exports: {} }; vm.runInThisContext(`(function(module,exports){${code}\n})`)(box, box.exports);
const { DayTrail, DayJourney, DAY_ROUTES, GlimpseVisits, GLIMPSE_POINTS, photoFrame, visibleCharacterCount, normalizePhotoText, parsePrivatePhoto, createPrivatePhotoStore } = box.exports;
test('exploration ignores pause/background time and only exposes the current point', () => {
  const trail = new DayTrail(DAY_ROUTES.westlake), visits = new GlimpseVisits(trail), distance = trail.knotDistances[4];
  for (let i = 0; i < 600; i++) assert.equal(visits.update(distance, .05, false), null);
  for (let i = 0; i < 239; i++) assert.equal(visits.update(distance, .05, true), null);
  for (let i = 0; i < 3; i++) visits.update(distance, .05, true);
  assert.equal(visits.update(distance, 0, false), 'jx-creek');
  assert.equal(visits.update(0, 0, true), null);
  assert.equal(visits.update(trail.knotDistances[11], 0, true), null);
  assert.equal(visits.update(distance, 0, false), 'jx-creek');
});
test('normal Jiuxi travel reaches both notes without winning a game or adding rewards', () => {
  const trail = new DayTrail(DAY_ROUTES.westlake), journey = new DayJourney(trail), visits = new GlimpseVisits(trail), seen = new Set(), games = [], availableSeconds = new Map();
  journey.toggle();
  for (let i = 0; i < 20000 && journey.phase.kind !== 'finished'; i++) {
    journey.tick(.05); const point = visits.update(journey.at, .05, journey.phase.kind === 'walking'); if (point) seen.add(point);
    if (point && journey.phase.kind === 'walking') availableSeconds.set(point, (availableSeconds.get(point) ?? 0) + .05);
    if (journey.phase.kind === 'photo') journey.closePhoto(true);
    if (journey.phase.kind === 'game') { games.push(journey.phase.event.entry); journey.closeGame(journey.phase.event.entry, false); journey.toggle(); }
  }
  assert.equal(journey.phase.kind, 'finished'); assert.deepEqual([...seen], ['jx-creek', 'jx-tea']);
  assert.equal(journey.earned.size, 0); assert.equal(games.length, 4);
  for (const point of GLIMPSE_POINTS) assert.ok(availableSeconds.get(point.id) >= 8, `${point.id}: give a walking player time to notice and open the paper`);
});
test('every crop stays 4:3 inside its own safe area across anchor and zoom boundaries', () => {
  for (const point of GLIMPSE_POINTS) for (const anchor of [-1, 0, 1, 2, 50]) for (const zoom of [-2, 1, 1.1, 1.2, 1.3, 4, NaN]) {
    const frame = photoFrame(point, anchor, zoom), bounds = point.bounds;
    assert.equal(frame.width / frame.height, 4 / 3);
    assert.ok(frame.x >= bounds.x && frame.y >= bounds.y);
    assert.ok(frame.x + frame.width <= bounds.x + bounds.width && frame.y + frame.height <= bounds.y + bounds.height);
  }
});
test('caption counts visible graphemes without truncating private text', () => {
  assert.equal(visibleCharacterCount('溪水\n👨‍👩‍👧‍👦e\u0301'), 5);
  assert.equal(visibleCharacterCount('叶'.repeat(81)), 81);
  assert.equal(normalizePhotoText(' \t溪\r\n水  '), '溪\n水');
  assert.equal(normalizePhotoText('<img src=x onerror=alert(1)>'), '<img src=x onerror=alert(1)>');
});
test('anonymous snapshots strip any stale name and reject non-local media', () => {
  const photo = { id: 'draft-1', kind: 'private-local', route: 'westlake', point: 'jx-creek', sceneVersion: 'jiuxi-spring-map-1', createdAt: 1, image: 'data:image/webp;base64,AAAA', body: '', anchor: 0, zoom: 1, attribution: { kind: 'anonymous', name: '松间客' } };
  assert.deepEqual(parsePrivatePhoto(photo).attribution, { kind: 'anonymous' });
  assert.equal(parsePrivatePhoto({ ...photo, image: 'https://example.com/private.webp' }), null);
  assert.equal(parsePrivatePhoto({ ...photo, zoom: NaN }), null);
  assert.equal(parsePrivatePhoto({ ...photo, attribution: { kind: 'pen-name', name: '山径官方' } }), null);
});
test('unavailable storage reports failure instead of pretending a photo was saved', async () => {
  const store = createPrivatePhotoStore(null);
  assert.equal((await store.read()).kind, 'error');
  assert.equal((await store.save({})).kind, 'error');
  const valid = { id: 'unavailable-draft', kind: 'private-local', route: 'westlake', point: 'jx-creek', sceneVersion: 'jiuxi-spring-map-1', createdAt: 1, image: 'data:image/webp;base64,AAAA', body: '溪水', anchor: 0, zoom: 1, attribution: { kind: 'anonymous' } };
  const result = await store.save(valid);
  assert.equal(result.kind, 'error'); assert.match(result.message, /没保存成功/);
  await store.close();
});
