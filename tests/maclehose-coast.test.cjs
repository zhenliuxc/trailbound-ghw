const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
const code = buildSync({ stdin: { contents: 'export * from "./src/maclehose-walk/chapter"; export * from "./src/maclehose-walk/route"; export * from "./src/runtime/coast-memories/model"; export {createCoastMemories} from "./src/runtime/coast-memories/adapter"; export * from "./src/runtime/coast-memories/shoulder/model"; export {createSaiwanShoulder} from "./src/runtime/coast-memories/shoulder/adapter"; export {TideState} from "./src/runtime/coast-memories/tide/model"; export {createTide} from "./src/runtime/coast-memories/tide/adapter";', resolveDir: process.cwd() }, bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const box = { exports: {} }; vm.runInThisContext(`(function(module,exports){${code}\n})`)(box, box.exports);
const { CoastalJourney, path, CoastMemoryState, coastMemoryId, boatRope, POST, DOCK, logClear, createCoastMemories, createSaiwanShoulder, ShoulderState, FOOTHOLDS, TideState, createTide } = box.exports;
const D = require('../dist/discoveries.js'), Journal = require('../dist/journal.js');
const IDS = ['coast-sand', 'maclehose-sideways-crab', 'coast-shell', 'maclehose-woodland-echo', 'coast-pier'];
const Coast = createCoastMemories({ get() { throw new Error('No DOM rendering in rule checks'); }, text() {} }, () => {});
const Shoulder = createSaiwanShoulder({ get() { throw new Error('No DOM rendering in rule checks'); }, text() {} });
const Tide = createTide({ get() { throw new Error('No DOM rendering in rule checks'); }, text() {} });
const engine = s => s instanceof ShoulderState ? Shoulder : s instanceof TideState ? Tide : Coast;
const fresh = (id, reduced = false) => id === 'coast-sand' ? Shoulder.create(D.item(id), { reduced }) : coastMemoryId(id) ? Coast.create(D.item(id), { reduced }) : Tide.create(D.item(id), { reduced });
const outcome = (s, entry) => engine(s).outcome(s, entry);
const wait = (state, seconds) => { for (let i = 0; i < seconds * 20; i++) state = engine(state).tick(state, .05); return state; };
function dragLog(s, index, to) { const log = s.session.logs[index]; Coast.act(s, { x: log.x, y: log.y, phase: 'press' }); Coast.move(s, to); Coast.act(s, { ...to, phase: 'release' }); }
function park(s) { Coast.act(s, { ...s.session.boat, phase: 'press' }); Coast.move(s, DOCK); Coast.act(s, { ...DOCK, phase: 'release' }); return wait(s, 2); }
function complete(id, state = fresh(id)) {
  if (id === 'coast-sand') {
    Shoulder.act(state, { ...FOOTHOLDS[1], phase: 'press' });
    return wait(state, 18);
  } else if (id === 'coast-shell') {
    Tide.act(state, { x: 350, y: 420, phase: 'press' });
    for (const [x,y] of [[450,400],[550,470],[650,490]]) Tide.move(state, { x, y });
    Tide.act(state, { phase: 'release' });
    return wait(state, 10);
  } else if (id === 'maclehose-sideways-crab') {
    for (let i = 0; i < 3; i++) dragLog(state, i, { x: state.session.logs[i].x, y: 580 });
    return wait(state, 20);
  } else if (id === 'maclehose-woodland-echo') {
    for (const keys of [['1', '3'], ['2', '1', '3']]) {
      for (let i = 0; i < 200 && state.session.phase.kind !== 'answering'; i++) wait(state, .05);
      assert.equal(state.session.phase.kind, 'answering');
      for (const key of keys) Coast.key(state, key, 'down');
    }
  } else {
    state = park(state); const root = boatRope(state.session.boat);
    Coast.act(state, { ...root, phase: 'press' }); Coast.move(state, POST); Coast.act(state, { ...POST, phase: 'release' });
  }
  return wait(state, 5);
}
function travel(collect) {
  const journey = new CoastalJourney(), arrivals = [], phases = new Set(); journey.toggle();
  for (let i = 0; i < 20000 && journey.phase.kind !== 'finished'; i++) {
    const phase = journey.phase; phases.add(phase.kind);
    if (phase.kind === 'photo') { arrivals.push(phase.id); journey.closePhoto(true); }
    else if (phase.kind === 'game') { arrivals.push(phase.id); journey.closeGame(phase.id, collect); }
    else if (phase.kind === 'paused') journey.toggle();
    journey.tick(.05);
  }
  return { journey, arrivals, phases };
}
test('one daylight journey reaches Pak Tam Au after all seven landmark photographs and five separate discoveries', () => {
  const { journey, arrivals, phases } = travel(true);
  assert.equal(journey.phase.kind, 'finished'); assert.equal(journey.at, path.length);
  assert.deepEqual(journey.point, { x: 465, y: 690 });
  assert.deepEqual(arrivals, ['longke', 'coast-sand', 'saiwanShan', 'saiwan', 'maclehose-sideways-crab', 'hamtin', 'coast-shell', 'maclehose-woodland-echo', 'taiLongAu', 'chekKeng', 'coast-pier', 'pakTamAu']);
  assert.deepEqual([...journey.earned], IDS); assert.deepEqual([...journey.visited], ['longke', 'saiwanShan', 'saiwan', 'hamtin', 'taiLongAu', 'chekKeng', 'pakTamAu']);
  assert.equal(journey.minute, 930); assert.equal(phases.has('night'), false);
});
test('skipping discoveries still reaches the finish without inventing collected badges', () => {
  const { journey } = travel(false); assert.equal(journey.phase.kind, 'finished'); assert.equal(journey.earned.size, 0); assert.deepEqual([...journey.encountered], IDS);
});
test('a stale close cannot consume a different discovery or award it later', () => {
  const j = new CoastalJourney(); j.toggle(); while (j.phase.kind !== 'game') { if (j.phase.kind === 'photo') j.closePhoto(true); j.tick(.05); }
  j.closeGame('coast-pier', true); assert.equal(j.phase.id, 'coast-sand'); assert.equal(j.earned.size, 0);
  j.closeGame('coast-sand', false); j.closeGame('coast-sand', true); assert.equal(j.phase.kind, 'paused'); assert.equal(j.earned.size, 0);
});
test('browsing an arrived photograph preserves pause, walking and finished states', () => {
  const j = new CoastalJourney(); j.toggle();
  while (!(j.phase.kind === 'photo' && j.phase.id === 'saiwan')) { if (j.phase.kind === 'game') j.closeGame(j.phase.id, true); else if (j.phase.kind === 'photo') j.closePhoto(true); j.tick(.05); }
  j.closePhoto(false); const at = j.at; j.openPhoto('saiwan'); j.closePhoto(true); assert.equal(j.phase.kind, 'paused'); assert.equal(j.at, at);
  j.toggle(); j.openPhoto('saiwan'); j.closePhoto(true); assert.equal(j.phase.kind, 'walking');
  const finished = travel(true).journey; finished.openPhoto('saiwan'); finished.closePhoto(true); assert.equal(finished.phase.kind, 'finished');
});
test('the start photo opens before climbing and the finish photo does not consume the closing step early', () => {
  const j = new CoastalJourney(); j.toggle();
  while (j.phase.kind !== 'photo') j.tick(.05);
  assert.equal(j.phase.id, 'longke'); assert.equal(j.at, 0);
  j.closePhoto(false); j.openPhoto('longke'); j.closePhoto(true); assert.equal(j.phase.kind, 'paused');
  j.toggle();
  for (let i = 0; i < 20000 && !(j.phase.kind === 'photo' && j.phase.id === 'pakTamAu'); i++) {
    if (j.phase.kind === 'photo') j.closePhoto(true);
    else if (j.phase.kind === 'game') j.closeGame(j.phase.id, false);
    else if (j.phase.kind === 'paused') j.toggle();
    j.tick(.05);
  }
  assert.equal(j.phase.kind, 'photo'); assert.equal(j.phase.id, 'pakTamAu'); assert.equal(j.at, path.length);
  j.closePhoto(false); assert.equal(j.phase.kind, 'paused'); j.openPhoto('pakTamAu'); j.closePhoto(true); assert.equal(j.phase.kind, 'paused');
  j.toggle(); for (let i = 0; i < 20; i++) j.tick(.05);
  assert.equal(j.phase.kind, 'finished'); assert.equal(j.earned.size, 0);
});
test('waiting without input never exits or earns any of the five coastal games', () => {
  for (const id of IDS) { const state = wait(fresh(id), 18); assert.equal(state.done, false, id); assert.equal(outcome(state, D.item(id)).earned, false, id); }
});
test('players can still complete each direct interaction after taking time to read', () => {
  for (const id of IDS) { const state = complete(id, wait(fresh(id), 18)); assert.equal(state.done, true, id); assert.equal(outcome(state, D.item(id)).earned, true, id); }
});
test('all five completed memories use circular badge assets and retain the first journal entry on replay', () => {
  let memories = [];
  for (const id of IDS) {
    const entry = D.item(id), result = outcome(complete(id), entry);
    assert.equal(result.earned, true, id);
    const first = { ...result, key: `first-${id}`, route: 'maclehose', place: entry.place, tag: entry.tag, icon: entry.icon, artVersion: entry.artV5 ? 5 : 4, createdAt: 1 };
    assert.match(D.tagArt(first), /^badges\/maclehose-.*-v(?:4|9)\.webp$/);
    memories = Journal.remember(memories, first).moments;
    const replay = Journal.remember(memories, { ...first, key: `second-${id}`, createdAt: 2, memory: '第二次' });
    assert.equal(replay.status, 'unchanged', id); assert.equal(memories.find(m => m.id === id).createdAt, 1);
  }
  assert.equal(memories.length, 5);
});
test('the crab stops before remaining driftwood and only passes after the actual corridor is clear', () => {
  const s = fresh('maclehose-sideways-crab');
  for (let i = 0; i < 2; i++) dragLog(s, i, { x: s.session.logs[i].x, y: 580 });
  wait(s, 22); assert.equal(s.play.complete, false); assert.equal(s.session.moving, false); assert.ok(s.session.crab > .4 && s.session.crab < .85);
  assert.equal(s.session.logs.filter(logClear).length, 2);
  dragLog(s, 2, { x: 780, y: 580 }); wait(s, 20); assert.equal(s.session.crab, 1); assert.equal(s.done, true); assert.equal(outcome(s, D.item(s.id)).earned, true);
});
test('a fast driftwood drag cannot jump through another piece or enter the sea', () => {
  const s = fresh('maclehose-sideways-crab'); dragLog(s, 0, { x: 780, y: 463 });
  const [a, b] = s.session.logs; assert.ok(Math.abs(a.x - b.x) >= (a.width + b.width) / 2 || Math.abs(a.y - b.y) >= (a.height + b.height) / 2);
  dragLog(s, 0, { x: 800, y: 0 }); assert.ok(a.y - a.height / 2 >= 205 + a.x * .25); assert.equal(s.play.complete, false);
});
test('parking is not a reward; the visible rope must be carried onto the pier post', () => {
  const s = park(fresh('coast-pier')); assert.equal(s.session.phase.kind, 'rope');
  wait(s, 60); assert.equal(outcome(s, D.item(s.id)).earned, false); assert.equal(s.play.progress, .78);
  const root = boatRope(s.session.boat); Coast.act(s, { ...root, phase: 'press' }); Coast.move(s, { x: 560, y: 480 }); Coast.act(s, { x: 560, y: 480, phase: 'release' });
  assert.equal(s.session.phase.kind, 'rope'); assert.equal(s.play.complete, false);
  Coast.act(s, { ...root, phase: 'press' }); Coast.move(s, POST); Coast.act(s, { ...POST, phase: 'release' }); wait(s, 5);
  assert.equal(s.done, true); assert.equal(outcome(s, D.item(s.id)).earned, true);
});
test('a cancelled rope gesture and a tap on empty water cannot award the memory later', () => {
  const idle = fresh('coast-pier'); Coast.act(idle, { x: 650, y: 250, phase: 'press' }); Coast.act(idle, { x: 650, y: 250, phase: 'release' }); wait(idle, 60); assert.equal(idle.play.complete, false);
  const s = park(fresh('coast-pier')), root = boatRope(s.session.boat);
  Coast.act(s, { ...root, phase: 'press' }); Coast.move(s, POST); Coast.release(s); wait(s, 60);
  assert.equal(s.session.phase.kind, 'rope'); assert.equal(s.session.phase.holding, false); assert.equal(outcome(s, D.item(s.id)).earned, false);
});
test('cancelling a boat drag near the pier does not count as releasing it to dock', () => {
  const s = fresh('coast-pier'); Coast.act(s, { ...s.session.boat, phase: 'press' }); Coast.move(s, DOCK); Coast.release(s); wait(s, 20);
  assert.equal(s.session.phase.kind, 'sailing'); assert.equal(s.play.complete, false);
});
test('reduced motion preserves the same completion rules and keyboard interaction works without pointer coordinates', () => {
  const crab = fresh('maclehose-sideways-crab', true);
  for (const key of ['1', '2', '3']) { Coast.key(crab, key, 'down'); for (let i = 0; i < 7; i++) Coast.key(crab, 'ArrowDown', 'down'); }
  wait(crab, 20); assert.equal(crab.done, true); assert.equal(outcome(crab, D.item(crab.id)).earned, true);
  const s = fresh('coast-pier', true); for (let i = 0; i < 17; i++) Coast.key(s, 'ArrowLeft', 'down'); for (let i = 0; i < 6; i++) Coast.key(s, 'ArrowUp', 'down');
  Coast.key(s, 'Enter', 'down'); wait(s, 2); assert.equal(s.session.phase.kind, 'rope'); Coast.key(s, 'Enter', 'down');
  for (let i = 0; i < 4; i++) Coast.key(s, 'ArrowLeft', 'down'); for (let i = 0; i < 2; i++) Coast.key(s, 'ArrowUp', 'down'); Coast.key(s, 'Enter', 'down'); wait(s, 5);
  assert.equal(s.done, true); assert.equal(outcome(s, D.item(s.id)).earned, true);
});

test('woodland echo requires the heard order; empty taps and demonstration clicks do not answer', () => {
  const s = fresh('maclehose-woodland-echo');
  Coast.key(s, '1', 'down'); wait(s, 1); Coast.key(s, '3', 'down');
  assert.equal(s.session.matched, 0);
  wait(s, 4);
  assert.equal(s.session.phase.kind, 'answering');
  Coast.act(s, { x: 80, y: 600, phase: 'press' });
  assert.equal(s.session.matched, 0);
  Coast.key(s, '1', 'down'); assert.equal(s.session.matched, 1);
  Coast.key(s, '2', 'down'); assert.equal(s.session.phase.kind, 'listening');
  assert.equal(s.session.matched, 1); assert.equal(s.play.complete, false);
  wait(s, 3); Coast.key(s, '3', 'down'); wait(s, 6);
  assert.equal(s.session.round, 1); assert.equal(s.session.phase.kind, 'answering');
  assert.equal(s.play.complete, false);
  for (const key of ['2', '1', '3']) Coast.key(s, key, 'down');
  wait(s, 5); assert.equal(outcome(s, D.item(s.id)).earned, true);
});
test('woodland replay retains correct answers and reduced motion accepts the same direct bird hit areas', () => {
  const s = fresh('maclehose-woodland-echo', true); wait(s, 5);
  Coast.act(s, { x: 220, y: 277, phase: 'press' }); assert.equal(s.session.matched, 1);
  Coast.act(s, { action: 'echo-repeat' }); assert.equal(s.session.matched, 1);
  const serial = s.serial; wait(s, 3);
  assert.deepEqual(s.events.filter(e => e.serial > serial && e.type === 'coast-bird-call').map(e => e.index), [2]);
  Coast.act(s, { x: 780, y: 294, phase: 'press' }); wait(s, 6);
  for (const point of [{ x: 500, y: 217 }, { x: 220, y: 277 }, { x: 780, y: 294 }]) Coast.act(s, { ...point, phase: 'press' });
  wait(s, 5); assert.equal(s.done, true); assert.equal(outcome(s, D.item(s.id)).earned, true);
});
test('portrait woodland taps follow the visible perches rather than old landscape targets', () => {
  const s = fresh('maclehose-woodland-echo'); wait(s, 5);
  const tap = point => Coast.act(s, { ...point, viewWidth: 350, viewHeight: 560, phase: 'press' });
  tap({ x: 500, y: 217 }); assert.equal(s.session.matched, 0);
  tap({ x: 201, y: 284 }); tap({ x: 799, y: 727 }); wait(s, 6);
  assert.equal(s.session.round, 1); assert.equal(s.play.complete, false);
  tap({ x: 500, y: 868 }); tap({ x: 201, y: 284 }); tap({ x: 799, y: 727 }); wait(s, 5);
  assert.equal(s.done, true); assert.equal(outcome(s, D.item(s.id)).earned, true);
});
