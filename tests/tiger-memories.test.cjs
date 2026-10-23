const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
const source = buildSync({ stdin: { contents: 'export * from "./src/runtime/tiger-memories/model"; export * from "./src/runtime/tiger-memories/rules"; export * from "./src/runtime/tiger-memories/layout"; export * from "./src/runtime/tiger-memories/road";', resolveDir: process.cwd() }, bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const moduleBox = { exports: {} };
vm.runInThisContext(`(function(module,exports){${source}\n})`)(moduleBox, moduleBox.exports);
const R = moduleBox.exports;
const D = require('../dist/discoveries.js');
const Journal = require('../dist/journal.js');
const art = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9b8AAAAASUVORK5CYII=';
const wait = (state, seconds) => { for (let i = 0; i < seconds * 20; i++) state = R.tickMemory(state, .05); return state; };
const tap = (state, at) => R.actMemory(R.actMemory(state, { ...at, phase: 'press' }), { ...at, phase: 'release', dragged: false });
const key = (state, key) => R.keyMemory(state, key, 'down');
const center = rect => ({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });

test('waiting and tapping blank paper cannot complete any of the four games', () => {
  for (const id of R.MEMORY_IDS) {
    let state = R.createMemory(id, true);
    state = tap(state, { x: 990, y: 10 }); state = wait(state, 30);
    assert.equal(state.play.complete, false, id); assert.equal(state.done, false, id);
  }
});
const drawRoad = (reduced = false, portrait = false) => {
  let state = R.createMemory('tiger-bends-puzzle-v4', reduced); state.portrait = portrait;
  state = R.actMemory(state, { ...R.roadToStage(state, R.roadAt(0)), phase: 'press' });
  for (const point of R.ROAD_POINTS.slice(1)) state = R.moveMemory(state, R.roadToStage(state, point));
  return state;
};
const leaveRoad = state => R.actMemory(state, { ...R.roadToStage(state, R.roadAt(1)), phase: 'release', dragged: true });
test('drawing the full S precedes walking, river playback and the saved badge', () => {
  let state = drawRoad();
  assert.equal(state.session.phase.kind, 'drawing'); assert.ok(state.session.phase.progress > .99);
  assert.equal(state.play.complete, false);
  state = leaveRoad(state); assert.equal(state.session.phase.kind, 'walking');
  state = wait(state, 2); assert.ok(state.session.phase.progress > 0); assert.ok(state.session.phase.progress < 1);
  state = wait(state, R.ROAD_WALK_SECONDS - 2 + .15);
  assert.equal(state.session.phase.kind, 'river'); assert.equal(state.play.complete, false);
  state = wait(state, R.ROAD_RIVER_SECONDS + 1.2); assert.equal(state.flow.kind, 'capturing');
  state = R.attachMemoryCapture(state, art); state = wait(state, 2);
  assert.equal(state.play.complete, true); assert.equal(state.done, true);
});
test('a straight shortcut from the start to the shoulder cannot complete an S', () => {
  let state = R.createMemory('tiger-bends-puzzle-v4', false);
  state = R.actMemory(state, { ...R.roadToStage(state, R.roadAt(0)), phase: 'press' });
  state = R.moveMemory(state, R.roadToStage(state, R.roadAt(1)));
  state = leaveRoad(state); state = wait(state, 30);
  assert.equal(state.session.phase.kind, 'drawing'); assert.ok(state.session.phase.progress < .2);
  assert.equal(state.play.complete, false);
});
test('lifting midway preserves the road and drawing can resume at its visible tip', () => {
  let state = R.createMemory('tiger-bends-puzzle-v4', true);
  state = R.actMemory(state, { ...R.roadToStage(state, R.roadAt(0)), phase: 'press' });
  for (const point of R.ROAD_POINTS.slice(1, 40)) state = R.moveMemory(state, R.roadToStage(state, point));
  const progress = state.session.phase.progress;
  state = R.actMemory(state, { ...R.roadToStage(state, R.roadAt(progress)), phase: 'release', dragged: true });
  state = wait(state, 10); assert.equal(state.session.phase.progress, progress);
  state = R.actMemory(state, { ...R.roadToStage(state, R.roadAt(progress)), phase: 'press' });
  for (const station of R.ROAD_STATIONS.filter(at => at.progress > progress)) state = R.moveMemory(state, R.roadToStage(state, station.point));
  state = leaveRoad(state); assert.equal(state.session.phase.kind, 'walking');
});
test('cancelled gestures never start playback, even after the last road point was drawn', () => {
  let state = R.releaseMemory(drawRoad(true));
  state = wait(state, 30);
  assert.equal(state.session.phase.kind, 'drawing'); assert.ok(state.session.phase.progress > .99);
  assert.equal(state.play.complete, false); assert.equal(state.session.phase.pen.kind, 'up');
});
test('keyboard strokes require actual cursor movement and portrait drawing uses the same road geometry', () => {
  let state = key(R.createMemory('tiger-bends-puzzle-v4', true), ' ');
  state = wait(state, 20); assert.equal(state.session.phase.progress, 0);
  state = key(state, 'ArrowRight'); assert.ok(state.session.phase.progress > 0);
  state = R.keyMemory(state, ' ', 'up'); assert.equal(state.session.phase.kind, 'drawing');
  const portrait = leaveRoad(drawRoad(true, true));
  assert.equal(portrait.session.phase.kind, 'walking'); assert.equal(portrait.portrait, true);
  const midpoint = R.roadAt(.5), visible = R.roadToStage(portrait, midpoint), roundtrip = R.roadFromStage(portrait, visible);
  assert.ok(Math.abs(roundtrip.x - midpoint.x) < .001); assert.ok(Math.abs(roundtrip.y - midpoint.y) < .001);
});
test('the filled road scene covers its container while the complete S remains visible', () => {
  for (const viewport of [{ width: 1325, height: 663 }, { width: 1808, height: 904 }, { width: 309, height: 386 }, { width: 356, height: 445 }]) {
    const state = R.createMemory('tiger-bends-puzzle-v4', false);
    state.portrait = viewport.height > viewport.width;
    for (const progress of [0, .5, 1]) {
      if (progress) state.session.phase = { kind: 'walking', elapsed: 5, progress };
      const l = R.layout(state, viewport), scene = l.scene;
      assert.ok(scene.x <= 0 && scene.y <= 0, 'the image starts outside the visible edges');
      assert.ok(scene.x + scene.width >= l.width - .001 && scene.y + scene.height >= l.height - .001, 'the image covers the far edges');
      for (const point of R.ROAD_POINTS) {
        const at = R.roadToStage(state, point, viewport);
        assert.ok(at.x > 25 && at.x < l.width - 25, 'neither bend is cropped');
        assert.ok(at.y > 54 && at.y < l.height - 45, 'headroom and the start label remain on the painting');
      }
    }
  }
});
test('a filled-container drawing maps back to the same road without changing the hit target', () => {
  for (const viewport of [{ width: 1325, height: 663 }, { width: 309, height: 386 }]) {
    let state = R.createMemory('tiger-bends-puzzle-v4', false);
    state.portrait = viewport.height > viewport.width;
    const input = point => R.roadToStage(state, R.roadFromStage(state, R.roadToStage(state, point, viewport), viewport));
    state = R.actMemory(state, { ...input(R.roadAt(0)), phase: 'press' });
    for (const point of R.ROAD_POINTS.slice(1)) state = R.moveMemory(state, input(point));
    state = R.actMemory(state, { ...input(R.roadAt(1)), phase: 'release', dragged: true });
    assert.equal(state.session.phase.kind, 'walking'); assert.equal(state.play.complete, false);
  }
});
test('the inn requires two matching pairs; wrong pairs turn back without earning a badge', () => {
  let state = R.createMemory('tiger-inn-pairs-v4', true);
  const cards = R.layout(state).cards;
  const order = state.session.order;
  const same = order.findIndex((value, i) => i > 0 && value === order[0]);
  const different = order.findIndex(value => value !== order[0]);
  state = tap(state, center(cards[0])); state = tap(state, center(cards[different]));
  state = wait(state, 1); assert.deepEqual(state.session.open, []); assert.deepEqual(state.session.matched, []);
  state = tap(state, center(cards[0])); state = tap(state, center(cards[same]));
  assert.equal(state.session.matched.length, 2); assert.equal(state.play.complete, false);
  const remaining = [0,1,2,3].filter(i => i !== 0 && i !== same);
  state = tap(state, center(cards[remaining[0]])); state = tap(state, center(cards[remaining[1]]));
  state = wait(state, 1); assert.equal(state.flow.kind, 'capturing');
});
test('watercolor requires strokes over both blanks, not elapsed time or a single dab', () => {
  let state = R.createMemory('tiger-waterfall-paint-v4', true);
  const rect = R.layout(state).sketchImage;
  const toStage = (x,y) => ({ x: rect.x + x * rect.width, y: rect.y + y * rect.height });
  state = tap(state, toStage(.2,.2)); state = wait(state, 20);
  assert.equal(state.play.complete, false); assert.equal(state.flow.kind, 'playing');
  for (let row = 0; row < 12 && state.flow.kind === 'playing'; row++) {
    const y = .05 + row * .08;
    state = R.actMemory(state, { ...toStage(.02,y), phase: 'press' });
    for (let x = .04; x <= .58; x += .025) state = R.moveMemory(state, toStage(x,y));
    state = R.actMemory(state, { ...toStage(.58,y), phase: 'release', dragged: true });
  }
  assert.ok(R.coverage(state).every(value => value >= .62));
  state = wait(state, 1); assert.equal(state.flow.kind, 'capturing');
  assert.ok(state.session.strokes.length > 2); assert.equal(state.play.complete, false);
});
test('cancelled brush gestures stop painting and preserve the colors already applied', () => {
  let state = R.createMemory('tiger-waterfall-paint-v4', true);
  const rect = R.layout(state).sketchImage;
  state = key(state, '2'); state = R.actMemory(state, { x: rect.x + rect.width * .2, y: rect.y + rect.height * .2, phase: 'press' });
  state = R.releaseMemory(state);
  const covered = state.session.coverage.map(cells => [...cells]);
  state = wait(state, 10);
  assert.deepEqual(state.session.coverage, covered); assert.equal(state.session.strokes[0].color, 1); assert.equal(state.play.complete, false);
});
test('the default river view cannot earn a picture; a real drag framing boulder and whitewater can', () => {
  let state = R.createMemory('tiger-river-roundframe-v4', false);
  state = key(state, 'Enter'); assert.equal(state.session.shot, null);
  state = R.actMemory(state, { x: 236, y: 236, phase: 'press' });
  state = R.moveMemory(state, { x: 610, y: 450 });
  assert.equal(state.play.complete, false);
  state = R.actMemory(state, { x: 610, y: 450, phase: 'release', dragged: true });
  assert.deepEqual(state.session.shot.center, { x: 610, y: 450 });
  assert.equal(state.flow.kind, 'settling'); assert.equal(state.play.complete, false);
});
test('portrait framing is reachable and cancellation never acts as a shutter', () => {
  let state = R.createMemory('tiger-river-roundframe-v4', true); state.portrait = true;
  state = R.actMemory(state, { x: 360, y: 378, phase: 'press' }); state = R.moveMemory(state, { x: 617, y: 819 });
  state = R.releaseMemory(state); assert.equal(state.session.shot, null);
  state = R.actMemory(state, { x: 617, y: 819, phase: 'press' }); state = R.moveMemory(state, { x: 620, y: 820 });
  state = R.actMemory(state, { x: 620, y: 820, phase: 'release', dragged: true });
  assert.equal(state.flow.kind, 'settling'); assert.equal(state.session.shot.portrait, true);
});
test('failed image capture cannot award the goal, and retry keeps the completed work', () => {
  let state = wait(leaveRoad(drawRoad(true)), R.ROAD_WALK_SECONDS + R.ROAD_RIVER_SECONDS + 2); state = R.attachMemoryCapture(state,null);
  assert.equal(state.flow.kind,'capture-error'); assert.equal(state.play.complete,false);
  state = R.actMemory(state,{action:'retry-capture'}); state = R.attachMemoryCapture(state,art);
  assert.equal(state.play.complete,true); assert.equal(state.session.phase.kind,'river');
});
test('new memories have distinct round-badge assets and replay keeps the first journal record', () => {
  assert.deepEqual(R.MEMORY_IDS.map(id => D.item(id).tag), ['山弯初见','半山灯火','崖间飞瀑','江声入峡']);
  assert.ok(R.MEMORY_IDS.every(id => D.item(id).badge.startsWith('badges/tiger-memories-v4/')));
  const entry = D.item('tiger-river-roundframe-v4');
  const first = { key: 'first-river', id: entry.id, route: 'tiger', edition: 3, earned: true, title: entry.tag, place: entry.place, tag: entry.tag, icon: entry.icon, memory: '第一次的江声', captureArt: art, artSource: 'capture', createdAt: 100 };
  const result = Journal.remember([first], { ...first, key: 'later', memory: '重玩后的另一帧', createdAt: 200 });
  assert.equal(result.status, 'unchanged'); assert.deepEqual(result.moments, [first]);
});
