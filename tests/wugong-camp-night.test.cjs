const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const catalog = require('../dist/discoveries.js');
const journal = require('../dist/journal.js');

function load(name) {
  const result = buildSync({ entryPoints: [path.join(__dirname, '../src/wugong-walk/scroll', name)], bundle: true, write: false, format: 'cjs', target: 'es2022' });
  const module = { exports: {} };
  vm.runInThisContext(`(function(module,exports){${result.outputFiles[0].text}\n})`)(module, module.exports);
  return module.exports;
}
const { CampStars, CAMP_STAR_LINKS, CAMP_STARS_ID } = load('camp-stars.ts');
const { rememberCampStars } = load('camp-journal.ts');
const { ScrollTrail } = load('route.ts');
const { ScrollJourney } = load('journey.ts');
const art = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jKioAAAAASUVORK5CYII=';
class MemoryStorage { value = null; getItem() { return this.value; } setItem(_key, value) { this.value = value; } }

test('a night view, wrong lines and repeated lines do not complete or award the game', () => {
  const game = new CampStars();
  assert.equal(game.collect(), false); assert.equal(game.join(0, 1), 'idle');
  game.begin(); assert.equal(game.join(0, 8), 'miss'); assert.equal(game.links.length, 0);
  assert.equal(game.join(0, 1), 'joined'); assert.equal(game.join(1, 0), 'repeat');
  assert.equal(game.links.length, 1); assert.equal(game.collect(), false);
  assert.equal(game.state.kind, 'playing');
});

test('the same shape can be joined in either direction, undone and completed exactly once', () => {
  const game = new CampStars(); game.begin();
  game.choose(0); assert.equal(game.choose(1), 'joined');
  game.undo(); assert.equal(game.links.length, 0); assert.equal(game.state.selected, null);
  const reversed = [...CAMP_STAR_LINKS].reverse();
  for (const [i, [a, b]] of reversed.entries()) assert.equal(game.join(b, a), i === 6 ? 'complete' : 'joined');
  assert.equal(game.state.kind, 'complete'); assert.equal(game.links.length, 7);
  assert.equal(game.collect(), true); assert.equal(game.collect(), false);
  assert.equal(game.state.kind, 'collected');
});

test('the camp memory persists the earned watercolor and keeps its first date and words on replay', () => {
  const storage = new MemoryStorage();
  const saved = rememberCampStars(catalog, journal, storage, art, 1000);
  assert.equal(saved.kind, 'stored'); assert.equal(saved.existing, false);
  const original = storage.value, first = catalog.loadMoments(storage);
  assert.equal(first.length, 1); assert.equal(first[0].id, CAMP_STARS_ID);
  assert.equal(first[0].place, '武功山 · 观音宕／星空营地'); assert.equal(first[0].earned, true);
  assert.equal(catalog.tagArt(first[0]), art);
  const replay = rememberCampStars(catalog, journal, storage, art, 5000);
  assert.equal(replay.kind, 'stored'); assert.equal(replay.existing, true);
  assert.equal(storage.value, original); assert.equal(catalog.loadMoments(storage)[0].createdAt, 1000);
  assert.equal(journal.page(catalog.loadMoments(storage), 'wugong').entries.length, 1);
});

test('bad artwork and unavailable storage report failure without replacing the old notebook', () => {
  const storage = new MemoryStorage(); rememberCampStars(catalog, journal, storage, art, 1000); const original = storage.value;
  assert.equal(rememberCampStars(catalog, journal, storage, 'data:image/svg+xml,<svg/>', 2000).kind, 'error');
  assert.equal(storage.value, original);
  assert.equal(rememberCampStars(catalog, journal, null, art, 2000).kind, 'error');
  assert.equal(catalog.create('mogan', 1).slots.some(slot => slot.id === CAMP_STARS_ID), false);
  assert.equal(catalog.create('wugong', 1).slots.some(slot => slot.id === CAMP_STARS_ID), false, 'the walking journey owns this manual arrival');
});

function reachNight(model) {
  model.walkTo();
  for (let i = 0; i < 12000; i++) {
    if (model.mode.kind === 'encounter' && model.mode.id === 'stars') return;
    if (model.mode.kind === 'visiting') model.closeVisit(true);
    else if (model.mode.kind === 'encounter') model.closeEncounter(true);
    else model.tick(1 / 30);
  }
  assert.fail('camp night did not appear');
}

test('the short preview walks into camp and night only follows sitting and the camp photo', () => {
  const trail = new ScrollTrail(), model = new ScrollJourney(trail, 'camp-night');
  assert.ok(model.travel < trail.campTravel); assert.equal(model.hasVisited('start'), false);
  assert.equal(model.hasVisited('camp'), false); assert.equal(model.collections, 0);
  reachNight(model);
  assert.equal(model.travel, trail.campTravel); assert.equal(model.hasVisited('camp'), true);
  assert.equal(model.pose.kind, 'resting'); assert.ok(model.hour > 20);
  const before = [model.clock, model.travel, model.hour]; model.tick(60);
  assert.deepEqual([model.clock, model.travel, model.hour], before);
  assert.equal(model.collections, 0);
});

test('skipping stars allows a real overnight and dawn departure without an invented collection', () => {
  const model = new ScrollJourney(new ScrollTrail(), 'camp-night'); reachNight(model);
  model.closeEncounter(false); assert.equal(model.canSleep, true); model.sleep();
  assert.equal(model.mode.kind, 'sleeping'); model.tick(5.1);
  assert.equal(model.mode.kind, 'waking'); assert.equal(model.day, 2); assert.ok(model.hour % 24 < 7);
  model.tick(2.1); assert.equal(model.mode.kind, 'standing'); model.tick(1.3); model.tick(1.4);
  assert.equal(model.mode.kind, 'walking'); const previous = model.travel; model.tick(.5); assert.ok(model.travel > previous);
  assert.equal(model.collections, 0); assert.equal(model.hasCollected('stars'), false);
});

test('collecting the camp event once resumes at the same camp and reset clears the current walk', () => {
  const model = new ScrollJourney(new ScrollTrail(), 'camp-night'); reachNight(model);
  model.collectEvent('stars'); model.collectEvent('stars'); assert.equal(model.collections, 1);
  model.closeEncounter(false); const location = model.travel; model.sleep(); model.tick(5.1);
  assert.equal(model.travel, location); assert.equal(model.day, 2);
  model.reset(); assert.equal(model.hasCollected('stars'), false); assert.equal(model.day, 1);
  assert.ok(model.travel < model.trail.campTravel);
});
