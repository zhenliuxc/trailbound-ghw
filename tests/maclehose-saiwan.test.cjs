const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const code = buildSync({ stdin: { contents: 'export * from "./src/runtime/coast-memories/shoulder/model"; export * from "./src/runtime/coast-memories/shoulder/layout"; export * from "./src/maclehose-walk/route";', resolveDir: process.cwd() }, bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const mod = { exports: {} }; vm.runInThisContext(`(function(module,exports){${code}\n})`)(mod, mod.exports);
const { ShoulderState, tickShoulder, actShoulder, keyShoulder, actorPoint, shoulderCamera, FOOTHOLDS, LOOKOUT, MEMORY, path, SAIWAN_SHOULDER } = mod.exports;
const wait = (s, seconds) => { for (let i = 0; i < Math.ceil(seconds * 60); i++) tickShoulder(s, 1 / 60); return s; };
const tap = (s, at) => actShoulder(s, { ...at, phase: 'press' });
const ready = reduced => new ShoulderState(reduced);

test('waiting or tapping sky and open sea never starts the climb or earns a memory', () => {
  const s = ready(false);
  for (const at of [{ x: 1200, y: 350 }, { x: 800, y: 100 }]) tap(s, at);
  wait(s, 90); assert.equal(s.step, 0); assert.equal(s.phase.kind, 'ready'); assert.equal(s.done, false); assert.equal(s.play.complete, false);
});

test('one broad trail tap automatically climbs every step and reaches the lookout without another action', () => {
  for (const at of [FOOTHOLDS[1], FOOTHOLDS[4], { x: 490, y: 865 }]) {
    const s = ready(false); tap(s, at); wait(s, 7);
    assert.equal(s.phase.kind, 'view'); assert.equal(s.step, 8); assert.deepEqual(actorPoint(s), LOOKOUT);
    assert.deepEqual(s.events.filter(e => e.type === 'coast-step-land').map(e => e.index), [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.equal(s.events.filter(e => e.type === 'coast-sea-reveal').length, 1);
    assert.equal(s.play.complete, false); wait(s, 8); assert.equal(s.done, true);
  }
});

test('repeated clicks cannot jump the walk forward, restart it or skip the standing view', () => {
  const s = ready(false); tap(s, FOOTHOLDS[1]);
  for (let i = 0; i < 20; i++) { tap(s, FOOTHOLDS[4]); tap(s, LOOKOUT); }
  wait(s, .4); const mid = actorPoint(s); assert.ok(mid.x < 505 && mid.x > 445); assert.ok(mid.y < 913 && mid.y > 816);
  assert.equal(s.step, 0); assert.equal(s.play.complete, false);
  wait(s, 7); tap(s, LOOKOUT); assert.equal(s.phase.kind, 'view'); assert.equal(s.play.complete, false);
  wait(s, 8); assert.equal(s.events.filter(e => e.type === 'complete').length, 1); assert.equal(s.done, true);
});

test('the hiker stands at the summit view before a single memory, with no sitting or unpacking stage', () => {
  const s = ready(false), phases = new Set([s.phase.kind]); tap(s, FOOTHOLDS[1]);
  for (let i = 0; i < 7 * 60; i++) { tickShoulder(s, 1 / 60); phases.add(s.phase.kind); }
  assert.equal(s.phase.kind, 'view'); assert.equal(s.play.complete, false); assert.ok(s.cameraProgress > .99);
  wait(s, 3); assert.equal(s.phase.kind, 'view'); assert.equal(s.play.complete, false);
  for (let i = 0; i < 5 * 60; i++) { tickShoulder(s, 1 / 60); phases.add(s.phase.kind); }
  assert.deepEqual([...phases], ['ready', 'climbing', 'view', 'finished']); assert.equal(s.done, true); assert.equal(s.play.progress, 1);
  assert.equal(s.events.some(e => e.type === 'coast-pack-rest'), false); assert.match(MEMORY, /背着包站在高处/);
  const timestamp = s.play.completedAt; wait(s, 60); tap(s, FOOTHOLDS[1]); assert.equal(s.play.completedAt, timestamp);
});

test('a single keyboard action also completes the reduced-motion journey, while waiting still does not', () => {
  for (const key of ['Enter', ' ', 'ArrowUp']) {
    const s = ready(true); wait(s, 60); assert.equal(s.play.complete, false);
    keyShoulder(s, key, 'down'); keyShoulder(s, key, 'up'); wait(s, 7);
    assert.equal(s.phase.kind, 'view'); assert.equal(s.cameraProgress, 1); assert.equal(s.play.complete, false);
    wait(s, 8); assert.equal(s.done, true);
  }
});

test('desktop and phone cameras retain the hiker throughout the automatic climb and standing view', () => {
  for (const [width, height] of [[1000, 563], [350, 554]]) {
    const s = ready(false);
    const initial = shoulderCamera(s, width, height), target = initial.toScreen(FOOTHOLDS[1]);
    tap(s, initial.toWorld(target));
    for (let i = 0; i < 12 * 60; i++) {
      tickShoulder(s, 1 / 60);
      const camera = shoulderCamera(s, width, height), point = camera.toScreen(actorPoint(s));
      assert.ok(point.x > 8 && point.x < width - 8, `x ${point.x}`);
      assert.ok(point.y > 8 && point.y < height - 8, `y ${point.y}`);
    }
    assert.equal(s.phase.kind, 'view'); assert.deepEqual(actorPoint(s), LOOKOUT);
  }
});

test('the encounter belongs on the ascent before the West Bay Mountain photograph', () => {
  const at = path.nearest(SAIWAN_SHOULDER);
  assert.ok(at > path.at('longke')); assert.ok(at < path.at('saiwanShan'));
  assert.ok(path.at('saiwanShan') - at > 150); assert.ok(path.slope(at) > 0);
});

test('the same sound group opens from sheltered wind to sea without adding rain or restarting ambience', () => {
  const Audio = require('../dist/audio.js'), Scene = require('../dist/audio-scenes.js');
  const base = { routeId: 'maclehose', mode: 'moment', momentId: 'coast-sand', momentGame: 'footsteps' };
  const sheltered = Scene.landscape({ ...base, coastOpenness: 0 }), open = Scene.landscape({ ...base, coastOpenness: 1 });
  assert.equal(sheltered.mix.creek, .025); assert.equal(open.mix.creek, .125);
  assert.equal(sheltered.recording.creek.cutoff, 650); assert.equal(open.recording.creek.cutoff, 1800);
  assert.equal(open.mix.drips, 0); assert.ok(open.mix.leaves < sheltered.mix.leaves);
  assert.equal(Audio.selection({ ...base, coastOpenness: 0 }).key, Audio.selection({ ...base, coastOpenness: 1 }).key);
});
