const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
function load(file) {
  const code = buildSync({ entryPoints: [file], bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
  const module = { exports: {} }; vm.runInThisContext(`(function(module,exports){${code}\n})`)(module,module.exports); return module.exports;
}
const { TigerJourney } = load('src/tiger-walk/journey.ts');
const route = load('src/tiger-walk/route.ts');
const rules = load('src/runtime/tiger-trail/rules.ts');
const D = require('../dist/discoveries.js');

// These drive the public journey state with scene results, not a browser or a rendered game.
function travel({ branch = true, climb = true, inn = true, waterfall = true, river = true } = {}) {
  const journey = new TigerJourney(), photos = [], games = [], stages = new Set(), returns = [];
  journey.toggle();
  for (let i = 0; i < 40000 && journey.mode.kind !== 'finished'; i++) {
    const mode = journey.mode; stages.add(mode.kind);
    if (mode.kind === 'photo') { photos.push(mode.id); journey.closePhoto(true); }
    else if (mode.kind === 'game') { games.push(mode.id); journey.closeGame(({ climb, 'inn-pairs': inn, 'waterfall-paint': waterfall, 'river-frame': river })[mode.id]); if (journey.mode.kind === 'paused') journey.toggle(); }
    else if (mode.kind === 'junction') journey.chooseBranch(branch);
    else if (journey.leg === 'return') returns.push({ x: journey.point.x, y: journey.point.y, at: journey.at });
    journey.tick(.05);
  }
  return { journey, photos, games, stages, returns };
}

test('complete high road and optional river return preserve named stops and finish back at Tinas', () => {
  const run = travel();
  assert.equal(run.journey.mode.kind, 'finished'); assert.equal(run.journey.day, 2);
  assert.deepEqual(run.photos, ['start','bends','halfway','waterfall','tinas','river']);
  assert.deepEqual(run.games, ['climb','inn-pairs','waterfall-paint','river-frame']); assert.equal(run.journey.earned.size, 4);
  assert.equal(run.journey.leg, 'return'); assert.equal(run.journey.at, 0);
  assert.ok(Math.hypot(run.journey.point.x - 2880, run.journey.point.y - 1000) < 1);
  assert.ok(run.returns.length > 10); assert.ok(run.returns.every((p, i) => i === 0 || p.at <= run.returns[i - 1].at));
});
test('high road can end at Tinas without inventing a riverside visit or reward', () => {
  const run = travel({ branch: false });
  assert.equal(run.journey.mode.kind, 'finished'); assert.equal(run.journey.leg, 'high');
  assert.deepEqual(run.photos, ['start','bends','halfway','waterfall','tinas']);
  assert.deepEqual(run.games, ['climb','inn-pairs','waterfall-paint']); assert.equal(run.journey.earned.size, 3);
});
test('unfinished games award nothing and a skipped river scene still allows the same-path return', () => {
  const run = travel({ climb: false, inn: false, waterfall: false, river: false });
  assert.equal(run.journey.mode.kind, 'finished'); assert.equal(run.journey.leg, 'return');
  assert.equal(run.journey.earned.size, 0); assert.equal(run.journey.at, 0);
  assert.deepEqual(run.games, ['climb','inn-pairs','waterfall-paint','river-frame']);
});
test('Halfway rest, overnight and morning departure are part of the journey without an idle reward', () => {
  const run = travel();
  assert.ok(run.stages.has('resting')); assert.ok(run.stages.has('sleeping')); assert.ok(run.stages.has('waking'));
  assert.equal(run.journey.earned.has('halfway'), false);
});
test('closing a photo pauses; reopening and choosing continue really resumes walking', () => {
  const journey = new TigerJourney(); journey.toggle();
  for (let i = 0; i < 100 && journey.mode.kind !== 'photo'; i++) journey.tick(.05);
  assert.equal(journey.mode.kind, 'photo'); journey.closePhoto(false); assert.equal(journey.mode.kind, 'paused');
  const at = journey.at; for (let i = 0; i < 100; i++) journey.tick(.05); assert.equal(journey.at, at);
  journey.openPhoto('start'); journey.closePhoto(true); assert.equal(journey.mode.kind, 'walking');
  for (let i = 0; i < 40; i++) journey.tick(.05); assert.ok(journey.at > at);
});
test('road and river branch join without a jump and preserve the reverse path', () => {
  assert.deepEqual(route.highRoad.sample(route.highRoad.length), { x: 2880, y: 1000 });
  assert.deepEqual(route.riverBranch.sample(0), { x: 2880, y: 1000 });
  assert.deepEqual(route.riverBranch.sample(route.riverBranch.length), { x: 3210, y: 1250 });
  assert.deepEqual([...route.CHECKPOINT_IDS], ['start','bends','halfway','waterfall','tinas','river']);
  assert.ok(route.CLIMB_START < route.CLIMB_END); assert.ok(route.CLIMB_END < route.place('halfway').at);
});
test('one continuous hold walks the painted bends and automatically earns the memory at the shoulder', () => {
  let state = rules.createTrailState(D.item('tiger-28-bends-v1'), { reduced: true });
  for (let i = 0; i < 100; i++) state = rules.tickTrail(state, .05);
  assert.equal(state.play.complete, false); assert.equal(state.climb.distance, 0);
  state = rules.inputTrail(state, { x: 900, y: 120, phase: 'press' });
  for (let i = 0; i < 3000 && !state.play.complete; i++) state = rules.tickTrail(state, .05);
  assert.equal(state.play.complete, true); assert.notEqual(state.climb.arrivedAt, null);
  assert.deepEqual({ x: Math.round(state.climb.position.x), y: Math.round(state.climb.position.y) }, { x: 442, y: 176 });
  assert.equal(state.climb.held, false);
});
test('releasing a hold stops the hiker; a tap followed by waiting cannot earn the memory', () => {
  let state = rules.createTrailState(D.item('tiger-28-bends-v1'), { reduced: false });
  state = rules.inputTrail(state, { x: 800, y: 400, phase: 'press' });
  state = rules.tickTrail(state, .05); state = rules.releaseTrail(state);
  const stopped = { ...state.climb.position };
  for (let i = 0; i < 200; i++) state = rules.tickTrail(state, .05);
  assert.deepEqual(state.climb.position, stopped); assert.equal(state.climb.speed, 0);
  assert.equal(state.play.complete, false); assert.equal(state.climb.arrivedAt, null);
});
test('space can be held and released to continue the same hill walk', () => {
  let state = rules.createTrailState(D.item('tiger-28-bends-v1'), { reduced: true });
  state = rules.keyTrail(state, ' ', 'down');
  for (let i = 0; i < 20; i++) state = rules.tickTrail(state, .05);
  const walked = state.climb.distance; assert.ok(walked > 0);
  state = rules.keyTrail(state, ' ', 'up');
  for (let i = 0; i < 20; i++) state = rules.tickTrail(state, .05);
  assert.equal(state.climb.distance, walked); assert.equal(state.play.complete, false);
  state = rules.keyTrail(state, ' ', 'down');
  for (let i = 0; i < 3000 && !state.play.complete; i++) state = rules.tickTrail(state, .05);
  assert.equal(state.play.complete, true);
});
test('arriving at the river on the real map starts framing; no image means no earned memory', () => {
  let state = rules.createTrailState(D.item('tiger-middle-river-frame-v1'), { reduced: false, riverArrival: 'river' });
  assert.equal(state.river.phase, 'river'); assert.equal(state.river.captures.length, 0);
  state = rules.inputTrail(state, { action: 'keep' }); assert.equal(state.play.complete, false);
  for (let i = 0; i < 100; i++) state = rules.tickTrail(state, .05);
  assert.equal(state.play.complete, false);
});
