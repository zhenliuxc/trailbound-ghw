const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const code = buildSync({ entryPoints: ['src/journey/map-camera.ts'], bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const loaded = { exports: {} };
new Function('module', 'exports', code)(loaded, loaded.exports);
const { MapCamera, mapCharacterScale } = loaded.exports;
const origin = { center: { x: 0, y: 0 }, scaleX: 1, scaleY: 1 };
const target = { center: { x: 800, y: 420 }, scaleX: .35, scaleY: .6 };
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`);

test('follow characters keep the same screen size at mountain, gorge and coast magnifications', () => {
  for (const [width, height] of [[390, 540], [844, 320], [1440, 660]]) {
    for (const [scaleX, scaleY] of [[1.7, 1.7], [.28, .28], [.5, .5], [.12, .264]]) {
      const camera = new MapCamera();
      camera.resize(width, height);
      const p = camera.project({ center: { x: 500, y: 700 }, scaleX, scaleY }, 0, false);
      const size = mapCharacterScale(p);
      near(54 * size.y * p.scaleY, 40);
      near(size.x * p.scaleX, size.y * p.scaleY);
      const foot = p.toScreen({ x: 500, y: 700 });
      near(foot.x, width / 2); near(foot.y, height / 2);
      // A sitting pose stays shorter; scaling never normalizes each animation frame separately.
      near(36 * size.y * p.scaleY, 40 * 2 / 3);
    }
  }
});

test('all maps share a frame-rate-independent approach with no overshoot', () => {
  const views = [];
  for (const fps of [30, 60, 120]) {
    const camera = new MapCamera(); camera.project(origin, 0, false);
    let p;
    for (let i = 0; i < fps; i++) {
      p = camera.project(target, 1 / fps, false);
      assert.ok(p.center.x > 0 && p.center.x < 800);
      assert.ok(p.center.y > 0 && p.center.y < 420);
      assert.ok(p.scaleX >= .35 && p.scaleX <= 1);
    }
    assert.ok(Math.abs(p.toScreen(target.center).x - p.width / 2) < 20, 'the target should settle near its intended screen position within a second');
    views.push(p);
  }
  for (const p of views) { near(p.center.x, views[0].center.x); near(p.center.y, views[0].center.y); near(p.scaleX, views[0].scaleX); }
});

test('overview transitions shrink the character gradually while keeping the drawing undistorted', () => {
  const camera = new MapCamera(); camera.project(origin, 0, false);
  camera.mode = 'overview';
  const opening = camera.project(target, 1 / 60, false);
  assert.ok(opening.actorHeight > 20 && opening.actorHeight < 40);
  let p = opening;
  for (let i = 0; i < 120; i++) {
    p = camera.project(target, 1 / 60, false);
    const size = mapCharacterScale(p);
    near(size.x * p.scaleX, size.y * p.scaleY);
  }
  assert.ok(Math.abs(p.actorHeight - 20) < .01);
  camera.mode = 'follow';
  const returning = camera.project(origin, 1 / 60, false);
  assert.ok(returning.actorHeight > p.actorHeight && returning.actorHeight < 40);
});

test('initial layout, rotation and reduced motion frame the intended place immediately', () => {
  const camera = new MapCamera();
  camera.resize(390, 540);
  let p = camera.project(target, 0, false);
  assert.deepEqual(p.center, target.center);
  camera.resize(844, 320);
  p = camera.project(origin, 0, false);
  assert.deepEqual(p.center, origin.center);
  assert.equal(p.width, 844); assert.equal(p.height, 320);
  camera.mode = 'overview';
  p = camera.project(target, 1 / 60, true);
  assert.deepEqual(p.center, target.center); assert.equal(p.actorHeight, 20);
});

test('paused frames do not drift and drawing and input share the moving projection', () => {
  const camera = new MapCamera();
  const before = camera.project(origin, 0, false);
  const paused = camera.project(target, 0, false);
  assert.deepEqual(paused.center, before.center); assert.equal(paused.scaleX, before.scaleX);
  const p = camera.project(target, 1 / 60, false);
  const world = { x: 760, y: 315 }, restored = p.toWorld(p.toScreen(world));
  near(restored.x, world.x); near(restored.y, world.y);
});

test('a stationary hiker remains visible throughout the overview-to-follow transition', () => {
  const camera = new MapCamera(); camera.resize(443, 614); camera.mode = 'overview';
  const at = { x: 450, y: 1350 };
  const initial = camera.project({ center: { x: 1700, y: 950 }, scaleX: .12, scaleY: .12 }, 0, false).toScreen(at);
  camera.mode = 'follow';
  let previous = initial;
  for (let i = 0; i < 120; i++) {
    const p = camera.project({ center: { x: 510, y: 1200 }, scaleX: 1.3, scaleY: 1.3 }, 1 / 60, false).toScreen(at);
    assert.ok(p.x >= previous.x && p.x <= 143.5);
    assert.ok(p.y >= previous.y && p.y <= 502);
    previous = p;
  }
});
