const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { buildSync } = require('esbuild');

function load(name) {
  const result = buildSync({ entryPoints: [path.join(__dirname, '../src/wugong-walk', name)], bundle: true, write: false, format: 'cjs', target: 'es2022' });
  const module = { exports: {} };
  vm.runInThisContext(`(function(module,exports){${result.outputFiles[0].text}\n})`)(module, module.exports);
  return module.exports;
}
const { ScrollTrail, SCROLL, PLACE_MARKERS } = load('scroll/route.ts');
const { ScrollJourney } = load('scroll/journey.ts');
const { SceneEnvironment } = load('environment.ts');
const { layoutLandmarkLabels } = load('../journey/landmark-label.ts');
const { LANDMARK_SIZE } = load('../journey/landmark-symbol.ts');
const { ScrollCamera } = load('scroll/camera.ts');

function advance(model, until, limit = 50000) {
  for (let frame = 0; frame < limit; frame++) { if (until(model)) return; if (model.mode.kind === 'encounter') model.closeEncounter(true); else if (model.mode.kind === 'visiting') model.closeVisit(true); else model.tick(1 / 30); }
  assert.fail(`not reached: ${model.mode.kind}, day ${model.day}, travel ${model.travel}`);
}

test('seven genuine arrivals connect Dongjiang, camp, summit and the scenic gate', () => {
  const trail = new ScrollTrail();
  assert.deepEqual(trail.stops.map(stop => stop.id), ['start', 'slope', 'meadow', 'camp', 'horse', 'summit', 'end']);
  assert.deepEqual(trail.stops.map(stop => stop.day), [1, 1, 1, 1, 2, 2, 2]);
  assert.deepEqual({ ...trail.sites.start.point }, { x: 300, y: 1510 });
  assert.deepEqual({ ...trail.sites.end.point }, { x: 2350, y: 1660 });
  assert.ok(trail.sites.summit.point.y < trail.sites.camp.point.y);
  assert.ok(trail.sites.end.point.y > trail.sites.start.point.y);
  assert.ok(trail.length > 4000);
  assert.ok(trail.sites.end.point.x < trail.sites.summit.point.x, 'the scenic descent returns toward the foreground, rather than extending the ridge');
  assert.ok(trail.summitTravel < trail.valleyTravel && trail.valleyTravel < trail.templeTravel && trail.templeTravel < trail.length);
  for (let i = 1; i < trail.stops.length; i++) assert.ok(trail.stops[i].travel > trail.stops[i - 1].travel);
});

test('ridge traversal and the separate descent remain on the mountain surface', () => {
  const trail = new ScrollTrail();
  for (let travel = 0; travel <= trail.length; travel += 4) {
    const foot = trail.sample(travel), crest = trail.crestAt(foot.x);
    assert.ok(foot.y - crest >= 10, `road leaves the near ridge at ${travel}`);
    assert.ok(foot.y - crest < 1500, `road drifts away from the mountain at ${travel}`);
    assert.ok(trail.distantAt(foot.x) <= crest - 82, `far mountain crosses the near ridge at ${travel}`);
    assert.ok(trail.nearest(foot).gap < .001, 'the walking point must lie on the visible path');
  }
});

test('the default follow frame keeps the hiker in view with room above and below', () => {
  for (const [width, height] of [[1214, 414], [368, 370]]) {
    const trail = new ScrollTrail(), journey = new ScrollJourney(trail), camera = new ScrollCamera();
    camera.resize(width, height);
    const view = camera.advance(journey, 1 / 30, false), foot = view.toScreen(journey.point);
    assert.equal(camera.mode, 'follow');
    assert.ok(foot.x >= width * .2 && foot.x <= width * .65);
    assert.ok(foot.y >= height * .6 && foot.y < height - 45);
  }
});

test('the entire trip walks both days, rests overnight and finishes after the gate photo', () => {
  const trail = new ScrollTrail(), model = new ScrollJourney(trail), arrivals = [], eventStops = [], poses = new Set();
  let climbed = 0, descended = 0, sleeping = 0;
  model.walkTo();
  for (let frame = 0; frame < 50000 && model.mode.kind !== 'finished'; frame++) {
    model.tick(1 / 30); poses.add(model.mode.kind);
    if (model.day === 1) assert.ok(model.travel <= trail.campTravel);
    if (model.day === 2 && model.moving) { if (model.angle < -.15) climbed++; if (model.angle > .15) descended++; }
    if (model.mode.kind === 'sleeping') sleeping += 1 / 30;
    if (model.mode.kind === 'visiting') { arrivals.push([model.day, model.mode.id]); model.closeVisit(true); }
    else if (model.mode.kind === 'encounter') { eventStops.push(model.mode.id); model.closeEncounter(true); }
    else if (model.canSleep) model.sleep();
    else if (model.mode.kind === 'summit') model.toggle();
  }
  assert.equal(model.mode.kind, 'finished'); assert.equal(model.day, 2); assert.equal(model.travel, trail.length);
  assert.deepEqual(arrivals, [[1, 'start'], [1, 'slope'], [1, 'meadow'], [1, 'camp'], [2, 'horse'], [2, 'summit'], [2, 'end']]);
  assert.deepEqual(eventStops, ['leaves', 'kite', 'stars', 'clouds', 'stones', 'return']);
  for (const pose of ['arriving', 'unpacking', 'sitting', 'resting', 'sleeping', 'waking', 'standing', 'packing']) assert.ok(poses.has(pose), pose);
  assert.ok(sleeping >= 4.9); assert.ok(climbed > 100 && descended > 100);
  assert.equal(model.collections, 0, 'arrivals and sleep must not award hand-drawn journal entries');
});

test('clicking a future point cannot bypass the camp or invent a visited place', () => {
  const trail = new ScrollTrail(), model = new ScrollJourney(trail);
  model.openVisit('summit'); assert.equal(model.mode.kind, 'ready');
  model.collectEvent('stones'); assert.equal(model.collections, 0);
  model.walkTo(trail.length); assert.equal(model.mode.target, trail.campTravel);
  for (let i = 0; i < 30000 && !model.canSleep; i++) {
    model.tick(1 / 30);
    if (model.mode.kind === 'visiting') model.closeVisit(true);
    else if (model.mode.kind === 'encounter') model.closeEncounter(true);
  }
  assert.equal(model.day, 1); assert.equal(model.travel, trail.campTravel);
  model.walkTo(trail.length); assert.equal(model.mode.kind, 'resting');
  model.tick(40); assert.equal(model.day, 1); assert.equal(model.hasVisited('horse'), false);
});

test('photos freeze travel and time; closing a card keeps a deliberate pause', () => {
  const model = new ScrollJourney(new ScrollTrail()), environment = new SceneEnvironment(model);
  model.walkTo(); advance(model, current => current.mode.kind === 'visiting');
  const stopped = [model.travel, model.clock, environment.frame.label];
  model.tick(5); environment.advance(5, model);
  assert.deepEqual([model.travel, model.clock, environment.frame.label], stopped);
  model.closeVisit(false); assert.equal(model.mode.kind, 'paused');
  model.tick(1); assert.equal(model.travel, stopped[0]);
});

test('camp night becomes a day-two dawn before packing and walking', () => {
  const model = new ScrollJourney(new ScrollTrail()), environment = new SceneEnvironment(model);
  model.walkTo();
  for (let frame = 0; frame < 25000 && !model.canSleep; frame++) { model.tick(1 / 30); if (model.mode.kind === 'visiting') model.closeVisit(true); else if (model.mode.kind === 'encounter') model.closeEncounter(true); }
  model.sleep(); model.tick(2.5); environment.reset(model);
  assert.ok(environment.frame.hour > 20 && environment.frame.night > .8);
  advance(model, current => current.day === 2); environment.reset(model);
  assert.equal(model.mode.kind, 'waking'); assert.ok(environment.frame.hour > 5 && environment.frame.hour < 7);
  assert.match(environment.frame.label, /^第二天/);
  assert.equal(model.travel, model.trail.campTravel);
});

test('only visited game events count, and collecting the same event twice counts once', () => {
  const model = new ScrollJourney(new ScrollTrail()); model.walkTo();
  advance(model, current => current.mode.kind === 'visiting');
  model.collectEvent('kite'); assert.equal(model.collections, 0);
  model.closeVisit(true); advance(model, current => current.mode.kind === 'visiting');
  assert.equal(model.mode.id, 'slope'); model.closeVisit(true);
  advance(model, current => current.mode.kind === 'visiting'); assert.equal(model.mode.id, 'meadow');
  model.collectEvent('kite'); assert.equal(model.collections, 0, 'a photo arrival cannot unlock a game reward');
  model.closeVisit(true); advance(model, current => current.mode.kind === 'encounter');
  assert.equal(model.mode.id, 'kite'); model.collectEvent('kite'); model.collectEvent('kite');
  assert.equal(model.collections, 1); assert.equal(model.hasCollected('kite'), true);
  model.reset(); assert.equal(model.collections, 0); assert.equal(model.hasVisited('start'), false);
  assert.equal(model.day, 1); assert.equal(model.travel, 0);
});

test('overview names remain readable next to their fixed terrain anchors', () => {
  const trail = new ScrollTrail();
  for (const width of [298, 368, 642, 1214]) {
    const height = 370, scale = Math.min(width / SCROLL.width, height / SCROLL.height);
    const top = (height - SCROLL.height * scale) / 2;
    const labels = trail.stops.map(stop => ({ id: stop.id, x: stop.point.x * scale, y: top + stop.point.y * scale,
      width: PLACE_MARKERS[stop.id].name.length * 11, height: PLACE_MARKERS[stop.id].caption ? 30 : 18, side: 'below' }));
    const anchors = structuredClone(labels);
    const positions = layoutLandmarkLabels(labels, width, height, (width < 460 ? LANDMARK_SIZE.compact : LANDMARK_SIZE.overview) / 2);
    assert.deepEqual(labels, anchors, 'label layout cannot relocate a place on the mountain');
    assert.equal(positions.size, 7, `${width}px overview must name all seven places`);
    const placed = [...positions.entries()];
    for (const [i, [id, position]] of placed.entries()) {
      const { rect } = position;
      assert.ok(rect.x >= 8 && rect.x + rect.width <= width - 8);
      assert.ok(rect.y >= 8 && rect.y + rect.height <= height - 8);
      assert.ok(Math.abs(position.dx) <= 36 && Math.abs(position.dy) <= 36, `${id} must stay near its symbol`);
      for (const [otherId, other] of placed.slice(0, i)) assert.ok(rect.x >= other.rect.x + other.rect.width || rect.x + rect.width <= other.rect.x || rect.y >= other.rect.y + other.rect.height || rect.y + rect.height <= other.rect.y,
        `${width}px: ${otherId} overlaps ${id}`);
    }
  }
});


test('closing a photo continues the trail and encounters have their own pause and completion', () => {
  const model = new ScrollJourney(new ScrollTrail()), environment = new SceneEnvironment(model);
  model.walkTo();
  advance(model, current => current.mode.kind === 'visiting' && current.mode.id === 'meadow');
  assert.equal(model.hasEncountered('kite'), false);
  model.closeVisit(true); assert.equal(model.mode.kind, 'walking');
  model.tick(.1); assert.equal(model.mode.kind, 'walking'); assert.equal(model.collections, 0);
  advance(model, current => current.mode.kind === 'encounter');
  assert.equal(model.mode.id, 'kite');
  environment.reset(model); const stopped = [model.travel, model.clock, environment.frame.label];
  model.tick(10); environment.advance(10, model);
  assert.deepEqual([model.travel, model.clock, environment.frame.label], stopped);
  model.closeEncounter(true); assert.equal(model.collections, 0); assert.equal(model.mode.kind, 'walking');
});
