const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
const { harness } = require('./dom-harness.cjs');
const source = buildSync({ stdin: {
  contents: 'export * from "./src/runtime/mini-game-controller"; export * from "./src/runtime/scene-manager"; export * from "./src/runtime/dom";',
  resolveDir: process.cwd(),
}, bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const box = { exports: {} };
vm.runInThisContext(`(function(module,exports){${source}\n})`)(box, box.exports);
const { createMiniGameController, createSceneManager, createDom } = box.exports;

test('an earned memory retains its painted image when the minigame closes', () => {
  const h = harness(undefined, { initializeApp: false, artEntry: 'changping-autumn-print' });
  const entry = h.window.TrailDiscoveries.item('changping-autumn-print');
  const scenes = createSceneManager({ status: () => 'walking', pause() {}, resume() {}, hidden: () => false });
  let artwork = 'the player’s leaf rubbing', delivered = null, disposed = false;
  const api = {
    create: () => ({ id: entry.id, play: { complete: true, progress: 1 }, done: true }),
    draw: () => ({}), paint() {}, status: () => '', instruction: () => '',
    act: s => s, move: s => s, release: s => s, tick: s => s,
    outcome: s => ({ id: s.id, earned: true, captureArt: artwork }),
    dispose() { artwork = undefined; disposed = true; },
  };
  const controller = createMiniGameController({ dom: createDom(h.document), scenes, api,
    catalog: h.window.TrailDiscoveries, audio: {}, reduced: false, sound: () => false,
    svg() {}, toggleSound: async () => {}, stopLoop() {}, ensureLoop() {}, refresh() {},
    onFinished(result) { delivered = result.outcome; assert.equal(disposed, true); return true; },
  });
  controller.begin(entry); controller.finish();
  assert.equal(delivered?.captureArt, 'the player’s leaf rubbing');
  assert.equal(controller.active, false);
  controller.destroy();
});
