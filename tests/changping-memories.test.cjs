const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
const code = buildSync({ entryPoints: ['src/runtime/changping-memories/model.ts'], bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const box = { exports: {} }; vm.runInThisContext(`(function(module,exports){${code}\n})`)(box, box.exports);
const { ChangpingMemoryState, CHANGPING_MEMORY_IDS, leafFrame } = box.exports;
const create = suffix => new ChangpingMemoryState({ id: `changping-${suffix}` }, false);
const wait = (s, seconds) => { for (let t = 0; t < seconds; t += .05) s.tick(.05); };
const drag = (s, from, to) => { s.input({ x: from[0], y: from[1], phase: 'press' }); s.input({ x: to[0], y: to[1] }, true); s.input({ phase: 'release' }); };
test('all four memories require an operation; idle time cannot earn a badge', () => {
  for (const id of CHANGPING_MEMORY_IDS) { const s = new ChangpingMemoryState({ id }, false); wait(s, 120); assert.equal(s.done, false); assert.equal(s.play.progress, 0); }
});
test('recognize two actual mirrored shapes, with a forgiving retry on a wrong choice', () => {
  const s = create('branch-reflection'); s.input({ x: .22, y: .7 }); wait(s, 2);
  assert.equal(s.play.progress, 0);
  s.input({ x: .78, y: .7 }); wait(s, 1.4); assert.equal(s.scene.round, 1);
  s.input({ x: .22, y: .7 }); wait(s, 5);
  assert.equal(s.play.complete, true); assert.equal(s.scene.found, 2);
});
test('only the top cord can open; releasing a tug keeps the first completed loop', () => {
  const s = create('bell-cord'); drag(s, [.26, .61], [.12, .35]); assert.equal(s.scene.opened, 0);
  drag(s, [.74, .55], [.86, .39]); assert.equal(s.scene.opened, 1); assert.equal(s.done, false);
  drag(s, [.26, .61], [.23, .59]); assert.equal(s.scene.opened, 1);
  drag(s, [.26, .61], [.14, .4]); wait(s, 4); assert.equal(s.play.complete, true);
});
test('the page must connect before the Q hiker walks, and the reveal finishes before reward', () => {
  const s = create('valley-path'); drag(s, [.5, .1], [.5, .5]); assert.equal(s.phase, 'play');
  drag(s, [.5, .9], [.5, .81]); assert.equal(s.phase, 'play');
  drag(s, [.5, .9], [.5, .81]); assert.equal(s.phase, 'reveal');
  wait(s, 3); assert.ok(s.scene.walked > 0); assert.equal(s.done, false);
  wait(s, 5.5); assert.equal(s.scene.walked, 1); assert.equal(s.play.complete, true);
});
test('cancelled page gestures release the page without awarding a memory', () => {
  const s = create('valley-path'); s.input({ x: .5, y: .9 }); s.input({ x: .5, y: .72 }, true); s.release(false);
  wait(s, 10); assert.equal(s.phase, 'play'); assert.equal(s.done, false);
});
function rub(s, width, height) {
  const f = leafFrame(width, height);
  const point = (x, y) => ({ x: (f.x + x * f.size) / width, y: (f.y + y * f.size) / height, viewWidth: width, viewHeight: height });
  s.input({ ...point(.45, .15), phase: 'press' });
  for (let y = .18; y < .87; y += .065) for (let i = 0; i <= 20; i++) s.input(point(.18 + i * .032, y), true);
  s.input({ phase: 'release' });
}
test('rubbing retains the drawn strokes and earns a badge on portrait and landscape screens', () => {
  for (const [w, h] of [[390, 540], [1200, 600], [760, 245]]) {
    const s = create('autumn-print'); rub(s, w, h); assert.equal(s.phase, 'reveal');
    const strokes = JSON.stringify(s.scene.strokes); wait(s, 4);
    assert.equal(s.play.complete, true); assert.equal(JSON.stringify(s.scene.strokes), strokes);
    assert.ok(s.scene.strokes[0].length > 50);
  }
});
test('taps and scratching outside the paper leaf cannot replace rubbing', () => {
  const s = create('autumn-print');
  for (let i = 0; i < 50; i++) { s.input({ x: .5, y: .57 }); s.release(); }
  assert.equal(s.play.progress, 0);
  drag(s, [.02, .02], [.98, .02]); assert.equal(s.play.progress, 0);
});
test('keyboard branch choices and reduced motion retain the same completion rules', () => {
  const s = new ChangpingMemoryState({ id: 'changping-branch-reflection' }, true);
  s.key('3', 'down'); s.key('3', 'up'); wait(s, 1.3);
  s.key('1', 'down'); s.key('1', 'up'); wait(s, 3);
  assert.equal(s.play.complete, true);
});
