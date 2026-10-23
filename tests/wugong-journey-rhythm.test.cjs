const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const catalog = require('../dist/discoveries.js');
const journal = require('../dist/journal.js');
function load(name) {
  const { outputFiles } = buildSync({ entryPoints: [path.join(__dirname, '../src/wugong-walk', name)], bundle: true, write: false, format: 'cjs', target: 'es2022' });
  const module = { exports: {} }; vm.runInThisContext(`(function(module,exports){${outputFiles[0].text}\n})`)(module, module.exports); return module.exports;
}
const { LeafPairs, JourneyPages, FOREST_LEAVES_ID, HOMEWARD_PAGES_ID } = load('scroll/keepsake-games.ts');
const { ScrollTrail } = load('scroll/route.ts');
const { ScrollJourney } = load('scroll/journey.ts');
const { SceneEnvironment } = load('environment.ts');
const { trailMix } = load('scroll/soundscape.ts');
const { rememberKeepsake } = load('scroll/camp-journal.ts');
const { visits } = load('visits.ts');
const capture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jKioAAAAASUVORK5CYII=';

test('leaf matching requires four distinct real pairs; repeats, mismatches and blank choices cannot finish', () => {
  const game = new LeafPairs(() => .5);
  assert.equal(game.complete, false); assert.equal(game.choose(50), 'idle');
  const first = 0, second = game.deck.findIndex(type => type !== game.deck[first]);
  assert.equal(game.choose(first), 'picked'); assert.equal(game.choose(first), 'idle'); assert.equal(game.choose(second), 'miss');
  assert.equal(game.matched.size, 0); assert.equal(game.complete, false);
  const fresh = new LeafPairs(() => .5);
  for (let type = 0; type < 4; type++) {
    const pair = fresh.deck.map((value, index) => value === type ? index : -1).filter(index => index >= 0);
    assert.equal(pair.length, 2); assert.equal(fresh.choose(pair[0]), 'picked');
    assert.equal(fresh.choose(pair[1]), type === 3 ? 'complete' : 'pair');
  }
  assert.equal(fresh.complete, true); assert.equal(fresh.matched.size, 8); assert.equal(fresh.choose(0), 'idle');
});

test('homeward pages are earned by arranging the actual journey in order', () => {
  const pages = new JourneyPages(); assert.equal(pages.complete, false);
  pages.choose(0); assert.equal(pages.selected, 0); pages.choose(1);
  assert.deepEqual(pages.order, [0, 2, 3, 1]); assert.equal(pages.complete, false);
  assert.equal(pages.swap(1, 3), true); assert.equal(pages.complete, false);
  assert.equal(pages.swap(2, 3), true); assert.equal(pages.complete, true);
  assert.deepEqual(pages.order, [0, 1, 2, 3]); assert.equal(pages.swap(0, 3), false);
});

test('six collections span forest, meadow, night, morning ridge, summit and homeward steps', () => {
  const trail = new ScrollTrail(), journey = new ScrollJourney(trail), events = journey.eventStops;
  assert.deepEqual(events.map(event => event.id), ['leaves', 'kite', 'stars', 'clouds', 'stones', 'return']);
  assert.equal(trail.stage(journey.events.leaves.travel), 'forest');
  assert.equal(trail.stage(journey.events.kite.travel), 'meadow');
  assert.equal(journey.events.stars.travel, trail.campTravel);
  assert.ok(journey.events.clouds.travel > trail.campTravel + 160 && journey.events.clouds.travel < trail.sites.horse.travel - 160);
  assert.ok(journey.events.stones.travel > trail.summitTravel + 140);
  assert.equal(trail.stage(journey.events.return.travel), 'valley');
  for (const event of events.filter(event => event.trigger === 'trail')) {
    for (const photo of trail.stops) assert.ok(Math.abs(event.travel - photo.travel) >= 144.9, `${event.id} clusters with ${photo.id}`);
  }
  assert.equal(journey.events.encounter.trigger, 'archive', 'the archived camp story must not stack with the new night game');
});

test('view-only stops and skipped games never award the two new notebook pages', () => {
  const journey = new ScrollJourney(new ScrollTrail()); journey.walkTo();
  journey.collectEvent('leaves'); journey.collectEvent('return'); assert.equal(journey.collections, 0);
  for (let i = 0; i < 50000 && journey.mode.kind !== 'finished'; i++) {
    journey.tick(1 / 30);
    if (journey.mode.kind === 'visiting') journey.closeVisit(true);
    else if (journey.mode.kind === 'encounter') journey.closeEncounter(true);
    else if (journey.canSleep) journey.sleep();
    else if (journey.mode.kind === 'summit') journey.toggle();
  }
  assert.equal(journey.mode.kind, 'finished'); assert.equal(journey.collections, 0);
  assert.equal(journey.hasEncountered('leaves'), true); assert.equal(journey.hasEncountered('return'), true);
});

test('the full route leaves 10 seconds of walking between interruptions and no quiet stretch over a minute', () => {
  const journey = new ScrollJourney(new ScrollTrail()); journey.walkTo();
  let walking = 0, previous = 0; const gaps = [];
  for (let i = 0; i < 50000 && journey.mode.kind !== 'finished'; i++) {
    if (journey.moving) walking += 1 / 30;
    journey.tick(1 / 30);
    if (journey.mode.kind === 'visiting' || journey.mode.kind === 'encounter') {
      if (journey.mode.id !== 'start' && journey.mode.id !== 'stars') {
        const gap = walking - previous; gaps.push(gap);
        assert.ok(gap >= 10 && gap <= 60, `${journey.mode.id} follows after ${gap.toFixed(1)} seconds`);
      }
      previous = walking;
      if (journey.mode.kind === 'visiting') journey.closeVisit(true); else journey.closeEncounter(true);
    } else if (journey.canSleep) journey.sleep(); else if (journey.mode.kind === 'summit') journey.toggle();
  }
  assert.equal(journey.mode.kind, 'finished'); assert.equal(gaps.length, 11);
});

test('new notebook pages deduplicate independently and retain their first artwork, date and words', () => {
  let value = null; const storage = { getItem: () => value, setItem: (_key, next) => { value = next; } };
  for (const id of [FOREST_LEAVES_ID, HOMEWARD_PAGES_ID]) assert.deepEqual(rememberKeepsake(catalog, journal, storage, id, capture, 'mist', 1000), { kind: 'stored', existing: false });
  const original = value;
  assert.deepEqual(rememberKeepsake(catalog, journal, storage, FOREST_LEAVES_ID, capture, 'clear', 2000), { kind: 'stored', existing: true });
  assert.equal(value, original); assert.equal(catalog.loadMoments(storage).length, 2);
  assert.ok(catalog.loadMoments(storage).every(moment => moment.createdAt === 1000 && moment.captureArt === capture));
  assert.ok(catalog.loadMoments(storage).every(moment => moment.weather === 'fog'), 'map mist must survive the existing journal weather vocabulary');
  assert.equal(rememberKeepsake(catalog, journal, null, HOMEWARD_PAGES_ID, capture, 'clear').kind, 'error');
  assert.equal(catalog.create('mogan', 2).slots.some(slot => [FOREST_LEAVES_ID, HOMEWARD_PAGES_ID].includes(slot.id)), false);
});

test('weather sound follows the visible environment, night suppresses bird-filled woodland and footsteps remain quiet', () => {
  const model = new ScrollJourney(new ScrollTrail()), environment = new SceneEnvironment(model), clear = environment.frame;
  const forest = trailMix('forest', { ...clear, rain: 0, night: 0 }), ridge = trailMix('ridge', { ...clear, rain: 0, night: 0 });
  assert.equal(forest.step, .022); assert.equal(ridge.step, .028); assert.ok(forest.wind < ridge.wind); assert.ok(forest.woodland > 0);
  const rainy = trailMix('forest', { ...clear, rain: .7, night: 0 });
  assert.ok(rainy.rain > forest.rain); assert.ok(rainy.woodland < forest.woodland); assert.ok(rainy.step < forest.step);
  assert.equal(trailMix('forest', { ...clear, night: 1 }).woodland, 0);
});

test('rain leaves a wet trail after clearing; switching to night changes the actual scene colors', () => {
  const journey = new ScrollJourney(new ScrollTrail()), environment = new SceneEnvironment(journey);
  environment.setWeather('drizzle'); for (let i = 0; i < 300; i++) environment.advance(.05, journey);
  assert.ok(environment.frame.rain > .65); assert.ok(environment.frame.wet > .45);
  environment.setWeather('clear'); for (let i = 0; i < 160; i++) environment.advance(.05, journey);
  assert.ok(environment.frame.rain < .05); assert.ok(environment.frame.wet > .25);
  const day = environment.frame; environment.setTime('night'); for (let i = 0; i < 300; i++) environment.advance(.05, journey);
  assert.ok(environment.frame.night > .95); assert.notEqual(environment.frame.skyTop, day.skyTop); assert.notEqual(environment.frame.distantTop, day.distantTop);
});

test('Jinding uses its licensed scenic landscape rather than the visitor-and-stele closeup', () => {
  assert.equal(visits.summit.file, 'photos/wugong-goldendome-v2.jpg');
  assert.equal(visits.summit.author, 'RoundNoName'); assert.equal(visits.summit.license, 'CC BY 4.0');
  assert.ok(visits.summit.caption.includes('2024 年 10 月'));
});
