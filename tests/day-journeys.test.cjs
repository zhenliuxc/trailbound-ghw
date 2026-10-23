const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
const code = buildSync({ stdin: { contents: 'export * from "./src/journey/day-route"; export * from "./src/content/day-routes"; export * from "./src/content/catalog";', resolveDir: process.cwd() }, bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const box = { exports: {} }; vm.runInThisContext(`(function(module,exports){${code}\n})`)(box, box.exports);
const { DayJourney, DayTrail, DAY_ROUTES, CHAPTERS } = box.exports;
const expectations = {
  changping: { games: ['changping-branch-reflection', 'changping-bell-cord', 'changping-valley-path', 'changping-autumn-print'], photos: ['forest', 'valley', 'muluozi'], finish: '喇嘛寺' },
  mogan: { games: ['bamboo-drop', 'bamboo-step', 'bamboo-leaf'], photos: ['bamboo', 'forest', 'stream'], finish: '大坑侧山林' },
  westlake: { games: ['westlake-floating-leaf', 'westlake-stones', 'westlake-tea', 'westlake-eaves'], photos: ['creek', 'path', 'village'], finish: '龙井村' },
};
function advance(journey, kind) {
  for (let i = 0; i < 20000 && journey.phase.kind !== kind; i++) journey.tick(.05);
  assert.equal(journey.phase.kind, kind);
}
for (const [id, expected] of Object.entries(expectations)) {
  test(`${id}: walk the full day, visit photos and collect each memory once`, () => {
    const journey = new DayJourney(new DayTrail(DAY_ROUTES[id])), photos = [], games = [];
    journey.toggle();
    for (let i = 0; i < 20000 && journey.phase.kind !== 'finished'; i++) {
      journey.tick(.05);
      if (journey.phase.kind === 'photo') { photos.push(journey.phase.place.id); journey.closePhoto(true); }
      if (journey.phase.kind === 'game') { games.push(journey.phase.event.entry); journey.closeGame(journey.phase.event.entry, true); }
    }
    assert.equal(journey.phase.kind, 'finished');
    assert.deepEqual(photos, expected.photos); assert.deepEqual(games, expected.games);
    assert.equal(journey.earned.size, expected.games.length); assert.equal(journey.progress, 1);
    assert.equal(journey.trail.route.places.at(journey.returning ? 0 : -1).name, expected.finish);
    const endpoint = journey.trail.route.waypoints.at(journey.returning ? 0 : -1);
    assert.deepEqual(journey.point, { x: endpoint.x, y: endpoint.y });
    journey.toggle(); journey.tick(1); assert.equal(journey.phase.kind, 'finished');
  });
  test(`${id}: a photo pauses travel, browsing it does not advance the route`, () => {
    const journey = new DayJourney(new DayTrail(DAY_ROUTES[id])); journey.toggle(); advance(journey, 'photo');
    const place = journey.phase.place, arrival = journey.at;
    journey.tick(30); assert.equal(journey.at, arrival);
    journey.closePhoto(false); assert.equal(journey.phase.kind, 'paused');
    journey.openPhoto(place); assert.equal(journey.phase.arrival, false); journey.closePhoto(true);
    assert.equal(journey.phase.kind, 'paused'); assert.equal(journey.at, arrival);
  });
  test(`${id}: skipping a game earns nothing; a different entry cannot complete it`, () => {
    const journey = new DayJourney(new DayTrail(DAY_ROUTES[id])); journey.toggle();
    for (let i = 0; i < 20000 && journey.phase.kind !== 'game'; i++) { journey.tick(.05); if (journey.phase.kind === 'photo') journey.closePhoto(true); }
    const phase = journey.phase; assert.equal(phase.kind, 'game');
    journey.closeGame('unrelated-entry', true); assert.equal(journey.phase, phase); assert.equal(journey.earned.size, 0);
    journey.closeGame(phase.event.entry, false); assert.equal(journey.phase.kind, 'paused'); assert.equal(journey.earned.size, 0);
    journey.toggle(); for (let i = 0; i < 30; i++) journey.tick(.05); assert.equal(journey.phase.kind, 'walking');
  });
}
test('all seven route covers resolve to separate chapters; Zhejiang descriptions identify their places', () => {
  assert.equal(new Set(CHAPTERS.map(chapter => chapter.id)).size, 7);
  for (const id of Object.keys(expectations)) {
    const chapter = CHAPTERS.find(chapter => chapter.id === id);
    assert.equal(chapter.mapPage, `${id}-walk.html`); assert.equal(chapter.artPage, `${id}-art.html`);
  }
  assert.equal(DAY_ROUTES.mogan.region, '浙江 · 德清'); assert.equal(DAY_ROUTES.westlake.region, '浙江 · 杭州');
});
test('Changping turns at Muluozi and discovers the leaf only on the homeward leg', () => {
  const journey = new DayJourney(new DayTrail(DAY_ROUTES.changping)); journey.toggle();
  const encounters = [];
  for (let i = 0; i < 20000 && journey.phase.kind !== 'finished'; i++) {
    journey.tick(.05);
    if (journey.phase.kind === 'photo') {
      if (journey.phase.place.id === 'muluozi') {
        assert.equal(journey.progress, .5);
        assert.equal(journey.returning, true);
        assert.equal(journey.visited.size, 3);
      }
      journey.closePhoto(true);
    }
    if (journey.phase.kind === 'game') {
      encounters.push([journey.phase.event.entry, journey.returning]);
      if (journey.returning) { assert.ok(journey.ahead(50).y > journey.point.y); assert.ok(journey.slope < 0); }
      journey.closeGame(journey.phase.event.entry, true);
    }
  }
  assert.deepEqual(encounters.map(e => e[1]), [false, false, false, true]);
  assert.equal(journey.minute, 16 * 60 + 30);
});
