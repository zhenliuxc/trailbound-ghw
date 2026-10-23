const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
const source = buildSync({ stdin: { contents: 'export { coverCamera } from "./src/runtime/projection"; export { birdsongLayout } from "./src/runtime/coast-memories/birdsong";', resolveDir: process.cwd() }, bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const moduleBox = { exports: {} };
vm.runInThisContext(`(function(module,exports){${source}\n})`)(moduleBox, moduleBox.exports);
const { coverCamera, birdsongLayout } = moduleBox.exports;

test('portrait and wide cameras keep drawing and pointer positions aligned without stretching props', () => {
  for (const [width, height] of [[414,727], [650,220], [1400,570], [1024,900]]) {
    const camera = coverCamera(width, height, { width: 1000, height: 667 }, { x: 528.5, y: 390 });
    for (const point of [{ x: 361, y: 301 }, { x: 507, y: 355 }, { x: 600, y: 480 }]) {
      const screen = camera.toScreen(point), restored = camera.toWorld(screen);
      assert.ok(Math.abs(restored.x - point.x) < 1e-9);
      assert.ok(Math.abs(restored.y - point.y) < 1e-9);
    }
    const a = camera.toScreen({ x: 500, y: 400 }), b = camera.toScreen({ x: 510, y: 410 });
    assert.ok(Math.abs((b.x - a.x) - (b.y - a.y)) < 1e-9);
    assert.ok(camera.toWorld({ x: 0, y: 0 }).x >= -1e-9);
    assert.ok(camera.toWorld({ x: width, y: height }).y <= 667 + 1e-9);
  }
});

test('all three bird heads stay in the visible scene in phone portrait, phone landscape and desktop', () => {
  for (const [width, height] of [[414,727], [650,160], [1400,570], [1024,900]]) {
    const layout = birdsongLayout(width, height);
    for (const perch of layout.perches) {
      assert.ok(perch.x > 35 && perch.x < 965);
      assert.ok(perch.y - layout.headOffset > 25);
      assert.ok(perch.y - layout.headOffset < layout.height - 20);
    }
  }
});

