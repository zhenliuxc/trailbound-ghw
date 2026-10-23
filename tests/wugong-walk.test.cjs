// The real numeric terrain and walking model. Browser rendering is checked separately.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { buildSync } = require('esbuild');

const root = path.join(__dirname, '..');
function loadModule(file) {
  const result = buildSync({ entryPoints: [path.join(root, 'src/wugong-walk', file)], bundle: true, write: false, format: 'cjs', target: 'es2022' });
  const entry = { exports: {} };
  vm.runInThisContext(`(function(module, exports) { ${result.outputFiles[0].text}\n})`)(entry, entry.exports);
  return entry.exports;
}
const { createLandscape, createTrail, parseTerrain, WalkModel } = loadModule('model.ts');
const { SceneEnvironment } = loadModule('environment.ts');
const payload = JSON.parse(fs.readFileSync(path.join(root, 'dist/scenes/wugong-relief-height-v2.json'), 'utf8'));
const terrain = parseTerrain(payload), landscape = createLandscape(terrain), trail = createTrail(landscape);

function advanceUntil(model, predicate, limit = 60_000) {
  for (let i = 0; i < limit; i++) {
    if (predicate(model)) return;
    model.tick(1 / 30);
  }
  assert.fail(`walk did not reach the requested state; mode=${model.mode.kind}, travel=${model.travel}`);
}

test('the complete route reaches the gate after the camp, signpost and summit', () => {
  assert.deepEqual(Array.from(trail.stops, s => s.id), ['slope', 'meadow', 'camp', 'horse', 'summit', 'end']);
  for (let i = 1; i < trail.stops.length; i++) assert.ok(trail.stops[i].travel > trail.stops[i - 1].travel);
  assert.ok(trail.length > trail.summitTravel && trail.summitTravel > trail.campTravel);
  assert.deepEqual({ ...trail.sample(trail.length) }, { ...trail.end });
  assert.equal(terrain.heights[1000], payload.heights[1000], 'source terrain must remain unchanged');
});

test('walks every step from Dongjiang to the gate, with all six arrivals and camp actions', () => {
  const model = new WalkModel(trail), arrivals = [], poses = new Set();
  let uphill = 0, downhill = 0, contacts = 0;
  model.walkTo();
  for (let frame = 0; frame < 60_000 && model.mode.kind !== 'finished'; frame++) {
    model.tick(1 / 30); poses.add(model.mode.kind); contacts += model.takeContacts();
    if (model.moving && model.travel > trail.campTravel && model.travel < trail.summitTravel) {
      if (model.incline === 'uphill') uphill++;
      if (model.incline === 'downhill') downhill++;
    }
    if (model.mode.kind === 'visiting') {
      arrivals.push(model.mode.id);
      const stopped = [model.travel, model.clock]; model.tick(3);
      assert.deepEqual([model.travel, model.clock], stopped, 'reading a photo must stop the walker');
      model.closeVisit(true);
    } else if (model.mode.kind === 'resting') {
      assert.equal(model.seated, 1); assert.equal(model.packOff, 1); assert.equal(model.speed, 0);
      model.continueFromCamp();
    } else if (model.mode.kind === 'summit') model.toggle();
  }
  assert.equal(model.mode.kind, 'finished');
  assert.deepEqual(arrivals, ['slope', 'meadow', 'camp', 'horse', 'summit', 'end']);
  for (const pose of ['arriving', 'unpacking', 'sitting', 'resting', 'standing', 'packing', 'summit']) assert.ok(poses.has(pose), pose);
  assert.equal(model.travel, trail.length);
  assert.ok(uphill > 100 && downhill > 100, `ridge uphill=${uphill}, downhill=${downhill}`);
  assert.ok(contacts > 100);
});

test('the ridge entry starts at camp without fabricating previous visits, and a closed card stays paused', () => {
  const model = new WalkModel(trail, 'ridge');
  assert.equal(model.travel, trail.campTravel);
  assert.equal(model.hasVisited('slope'), false); assert.equal(model.hasVisited('camp'), false);
  model.walkTo(); advanceUntil(model, m => m.mode.kind === 'visiting');
  assert.equal(model.mode.id, 'horse');
  model.closeVisit(false); assert.equal(model.mode.kind, 'paused');
  const travel = model.travel; model.tick(1); assert.equal(model.travel, travel);
  model.toggle(); advanceUntil(model, m => m.mode.kind === 'visiting'); assert.equal(model.mode.id, 'summit');
  model.closeVisit(true); assert.equal(model.mode.kind, 'summit');
  model.toggle(); advanceUntil(model, m => m.mode.kind === 'visiting'); assert.equal(model.mode.id, 'end');
  model.closeVisit(true); assert.equal(model.mode.kind, 'finished');
});

test('walking backward remains bounded and continues toward the original backward target after a photo', () => {
  const model = new WalkModel(trail, 'ridge'); model.walkTo(0);
  advanceUntil(model, m => m.mode.kind === 'visiting'); assert.equal(model.mode.id, 'meadow');
  assert.ok(Math.abs(model.speed) < 10); model.closeVisit(true);
  assert.equal(model.mode.kind, 'walking'); assert.equal(model.mode.target, 0);
  model.pause(); const direction = model.direction; model.tick(.5); assert.equal(model.direction, direction);
});

test('replaying starts at the selected section and clears only this walk’s visit state', () => {
  const model = new WalkModel(trail, 'ridge'); model.walkTo();
  advanceUntil(model, m => m.mode.kind === 'visiting'); assert.equal(model.hasVisited('horse'), true);
  model.reset(); assert.equal(model.mode.kind, 'ready'); assert.equal(model.travel, trail.campTravel); assert.equal(model.hasVisited('horse'), false);
  model.reset('forest'); assert.equal(model.travel, 0); assert.equal(model.section, 'forest');
});

test('support feet remain on one terrain anchor and both feet land before a photo opens', () => {
  const model = new WalkModel(trail, 'ridge');
  let previous = model.feet, swings = 0, lockedFrames = 0;
  model.walkTo();
  for (let frame = 0; frame < 20_000 && model.mode.kind !== 'visiting'; frame++) {
    model.tick(1 / 60);
    const feet = model.feet;
    assert.ok(feet.filter(f => f.kind === 'swing').length <= 1, 'walking retains one support foot');
    feet.forEach((foot, i) => {
      const projected = landscape.project(foot.contact.world);
      assert.deepEqual({ ...foot.point }, { ...projected }, 'foot ground point comes from terrain, not an airborne position');
      assert.ok(Number.isFinite(foot.lift) && foot.lift >= 0);
      if (foot.kind === 'swing') swings++;
      if (foot.kind === 'planted' && previous[i].kind === 'planted') {
        assert.deepEqual(foot.contact.world, previous[i].contact.world, 'planted foot must not slide'); lockedFrames++;
      }
    });
    previous = feet;
  }
  assert.equal(model.mode.kind, 'visiting'); assert.equal(model.grounded, true);
  assert.ok(swings > 100 && lockedFrames > 100);
  assert.ok(model.feet.every(f => f.lift === 0 && f.kind === 'planted'));
});

test('pausing in mid-step settles to the road without changing route progress', () => {
  const model = new WalkModel(trail, 'ridge'); model.walkTo();
  advanceUntil(model, m => m.feet.some(f => f.kind === 'swing' && f.lift > .1));
  model.pause(); const at = model.travel;
  for (let i = 0; i < 90; i++) model.tick(1 / 60);
  assert.equal(model.travel, at); assert.equal(model.mode.kind, 'paused');
  assert.ok(model.feet.every(f => f.kind === 'planted' && f.lift === 0));
  const anchors = model.feet.map(f => ({ ...f.contact.world }));
  for (let i = 0; i < 60; i++) model.tick(1 / 60);
  assert.deepEqual(model.feet.map(f => ({ ...f.contact.world })), anchors);
});

test('journey time reaches camp night and transitions to day two, while photo reading freezes it', () => {
  const model = new WalkModel(trail), environment = new SceneEnvironment(model);
  assert.equal(environment.frame.day, 1); assert.equal(environment.frame.hour, 8);
  model.walkTo();
  for (let i = 0; i < 60_000 && model.mode.kind !== 'resting'; i++) {
    model.tick(1 / 30); environment.advance(1 / 30, model);
    if (model.mode.kind === 'visiting') {
      const snapshot = environment.frame; environment.advance(30, model);
      assert.deepEqual(environment.frame, snapshot); model.closeVisit(true);
    }
  }
  assert.equal(model.mode.kind, 'resting');
  for (let i = 0; i < 40 * 30; i++) { model.tick(1 / 30); environment.advance(1 / 30, model); }
  assert.ok(environment.frame.night > .9);
  model.continueFromCamp();
  model.tick(1 / 30); environment.advance(1 / 30, model);
  assert.equal(environment.frame.day, 1, 'the overnight transition keeps day one until the simulated clock passes midnight');
  for (let i = 0; i < 12 * 30; i++) { model.tick(1 / 30); environment.advance(1 / 30, model); }
  assert.equal(environment.frame.day, 2); assert.ok(environment.frame.hour > 5 && environment.frame.hour < 8);
  assert.ok(environment.frame.night < .5);
});

test('manual light and weather change scenery without changing the hike or visited places', () => {
  const model = new WalkModel(trail, 'ridge'), environment = new SceneEnvironment(model);
  const before = { travel: model.travel, mode: model.mode.kind, day: model.day };
  environment.setTime('night'); environment.setWeather('drizzle');
  for (let i = 0; i < 20 * 30; i++) environment.advance(1 / 30, model);
  assert.deepEqual({ travel: model.travel, mode: model.mode.kind, day: model.day }, before);
  assert.equal(model.hasVisited('horse'), false);
  assert.ok(environment.frame.night > .9 && environment.frame.rain > .6);
  assert.equal(environment.frame.weather, 'drizzle');
  model.reset('forest'); environment.setTime('journey'); environment.setWeather('journey'); environment.reset(model);
  assert.equal(environment.frame.day, 1); assert.equal(environment.frame.hour, 8); assert.equal(environment.frame.rain, 0);
});
