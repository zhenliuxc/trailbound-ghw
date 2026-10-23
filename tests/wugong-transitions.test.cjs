const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');

function setup() {
  const doc = new EventTarget(); doc.hidden = false;
  const animations = [], timers = new Map(); let nextTimer = 0, now = 0;
  function element() {
    return { ownerDocument: doc, dataset: {}, hidden: false, style: { setProperty() {} }, append(child) { this.child = child; }, remove() {},
      animate(frames, timing) {
        let finish;
        const animation = { frames, timing, paused: 0, played: 0, cancelled: 0,
          finished: new Promise(resolve => { finish = resolve; }), finish: () => finish(),
          pause() { this.paused++; }, play() { this.played++; }, cancel() { this.cancelled++; },
        }; animations.push(animation); return animation;
      },
    };
  }
  doc.createElement = element;
  const context = { document: doc, performance: { now: () => now },
    window: { setTimeout(callback, duration) { const id = ++nextTimer; timers.set(id, { callback, duration }); return id; }, clearTimeout(id) { timers.delete(id); } },
  };
  const load = file => {
    const code = buildSync({ entryPoints: [file], bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
    const module = { exports: {} }; vm.runInNewContext(`(function(module,exports){${code}\n})`, context)(module, module.exports); return module.exports;
  };
  const visibility = hidden => { doc.hidden = hidden; doc.dispatchEvent(new Event('visibilitychange')); };
  return { ...load('src/wugong-walk/visible-motion.ts'), ...load('src/wugong-walk/scroll/discovery-transition.ts'), animations, timers, visibility, element, advance: ms => { now += ms; } };
}

test('all six journey games have a distinct discovery before opening, without an extra button', async () => {
  const s = setup(), abort = new AbortController(), map = s.element();
  const transition = new s.DiscoveryTransition(map, abort.signal, s.DISCOVERY_SCENES), opened = [];
  assert.deepEqual(Object.keys(s.DISCOVERY_SCENES).sort(), ['clouds', 'kite', 'leaves', 'return', 'stars', 'stones']);
  assert.equal(new Set(Object.values(s.DISCOVERY_SCENES).map(scene => scene.line)).size, 6);
  transition.show('leaves', false, () => opened.push('leaves'));
  assert.equal(transition.pending, true); assert.equal(map.child.hidden, false);
  assert.match(map.child.innerHTML, /一片叶子，轻轻落在脚边。/); assert.doesNotMatch(map.child.innerHTML, /<button/);
  assert.deepEqual(opened, []);
  s.animations[0].finish(); await Promise.resolve();
  assert.deepEqual(opened, ['leaves']); assert.equal(transition.pending, false); assert.equal(map.child.hidden, true);
});

test('cancelling or replacing a discovery prevents late game openings', async () => {
  const s = setup(), abort = new AbortController(), transition = new s.DiscoveryTransition(s.element(), abort.signal, s.DISCOVERY_SCENES), opened = [];
  transition.show('leaves', false, () => opened.push('leaves'));
  transition.show('kite', false, () => opened.push('kite'));
  s.animations[0].finish(); await Promise.resolve(); assert.deepEqual(opened, []);
  abort.abort(); s.animations[1].finish(); await Promise.resolve();
  assert.deepEqual(opened, []); assert.equal(transition.pending, false);
});

test('memory remains open until its fade finishes; backgrounding pauses rather than restarts it', async () => {
  const s = setup(), dialog = s.element(); let closed = 0;
  s.leaveDialog(dialog, false, () => { closed++; });
  const animation = s.animations[0];
  assert.equal(closed, 0); assert.equal(animation.timing.duration, 2450);
  assert.equal(animation.frames[1].opacity, 1); assert.equal(animation.frames.at(-1).opacity, 0);
  assert.equal(animation.frames.some(frame => frame.transform), false);
  s.visibility(true); assert.equal(animation.paused, 1); assert.equal(dialog.dataset.motionPaused, 'true'); assert.equal(closed, 0);
  s.visibility(false); assert.equal(animation.played, 2); assert.equal(s.animations.length, 1);
  animation.finish(); await Promise.resolve(); assert.equal(closed, 1);
  animation.finish(); await Promise.resolve(); assert.equal(closed, 1);
});

test('exiting during a memory fade cancels its pending continuation', async () => {
  const s = setup(); let resumed = 0;
  const cancel = s.leaveDialog(s.element(), false, () => { resumed++; });
  cancel(); s.animations[0].finish(); await Promise.resolve(); assert.equal(resumed, 0);
});

test('reduced motion retains time to see the earned badge, with opacity only', async () => {
  const s = setup(); let closed = false;
  s.leaveDialog(s.element(), true, () => { closed = true; });
  assert.equal(closed, false); assert.equal(s.animations[0].timing.duration, 1380);
  assert.equal(s.animations[0].frames.some(frame => frame.transform), false);
  s.animations[0].finish(); await Promise.resolve(); assert.equal(closed, true);
});

test('fallback completion counts visible time and can still be cancelled', () => {
  const s = setup(), dialog = s.element(); dialog.animate = undefined; let closed = 0;
  const cancel = s.leaveDialog(dialog, false, () => { closed++; });
  s.advance(900); s.visibility(true); assert.equal(s.timers.size, 0);
  s.advance(10000); s.visibility(false);
  assert.equal([...s.timers.values()][0].duration, 1550);
  cancel(); assert.equal(s.timers.size, 0); assert.equal(closed, 0);
});
