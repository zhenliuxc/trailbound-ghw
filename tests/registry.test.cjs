const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const { harness } = require('./dom-harness.cjs');
const D = require('../dist/discoveries.js');
const Mini = require('../dist/mini-games.js');
const Art = require('../dist/art-games.js');
const Micro = require('../dist/micro-moments.js');

const source = buildSync({ stdin: {
  contents: ['journey/game-registry', 'runtime/legacy-game-registry', 'runtime/mini-game-controller',
    'runtime/scene-manager', 'runtime/dom', 'content/catalog'].map(file => `export * from "./src/${file}";`).join('\n'),
  resolveDir: process.cwd(),
}, bundle: true, write: false, format: 'cjs', packages: 'external' }).outputFiles[0].text;
function host(route, { legacy = false, legacyArt = Art, platform = Mini } = {}) {
  const h = harness(undefined, { initializeApp: false, artEntry: 'meadow-bird', images: true });
  const createElement = h.document.createElement;
  h.document.createElement = tag => {
    const element = createElement(tag);
    if (tag === 'canvas') element.getContext = () => null;
    return element;
  };
  const box = { exports: {} };
  new Function('module', 'exports', 'require', 'document', 'Image', source)(box, box.exports, require, h.document, h.window.Image);
  const { installRouteGames, installLegacyHomeGames, createMiniGameController, createSceneManager, createDom, chapterFor } = box.exports;
  const dom = createDom(h.document), finished = [], closed = [], views = [];
  let status = 'walking';
  const scenes = createSceneManager({ status: () => status, pause() { status = 'paused'; }, resume() { status = 'walking'; }, hidden: () => h.document.hidden });
  // Only canvas/GPU rendering is replaced. Registration, DOM controls, rules, and outcomes are real.
  const renderless = api => ({ ...api,
    draw(...args) { const refs = api.draw(...args); views.push(refs); return refs; },
    paint() {}, mount(refs) { refs.contentState = 'ready'; },
  });
  const svg = (tag, attrs, parent) => {
    const node = h.document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs || {})) node.setAttribute(key, value);
    parent?.appendChild(node); return node;
  };
  const mini = createMiniGameController({ dom, scenes, api: renderless(Mini.enhance(Micro)), platform,
    svg, catalog: D, audio: {}, reduced: false, sound: () => false, toggleSound: async () => {},
    stopLoop() {}, ensureLoop() {}, refresh() {},
    onFinished(result) { finished.push(result); return false; },
    onClosed(id, earned, resume) { closed.push({ id, earned, resume }); },
  });
  const registration = { action: mini.action, registerGame(ids, adapter) { mini.registerGame(ids, renderless(adapter)); } };
  const registry = legacy ? installLegacyHomeGames({ mini: registration, dom, platform, legacy: legacyArt })
    : installRouteGames({ chapter: chapterFor(route), mini: registration, dom, audio: {}, platform });
  return { h, mini, registry, scenes, finished, closed, views,
    async open(id) { mini.begin(D.item(id)); await Promise.resolve(); mini.update(.01); },
    tick(seconds) { for (let i = 0; i < seconds * 40; i++) mini.update(.025); },
    key(key, phase = 'down') { h.$('micro-surface').emit(phase === 'down' ? 'keydown' : 'keyup', { key }); },
    destroy() { mini.destroy(); registry.destroy(); registry.destroy(); },
  };
}

test('coast overrides launch the shoulder walk and collect only after a deliberate start', async () => {
  const f = host('maclehose');
  await f.open('coast-sand');
  assert.equal(f.mini.state.kind, 'saiwan-steps');
  assert.equal(f.h.$('micro-title').textContent, '登高望海');
  assert.equal(f.registry.kindFor('coast-sand'), 'footsteps');
  assert.equal(f.registry.allows('coast-sand'), true);
  assert.equal(f.registry.allows('meadow-bird'), false);
  f.tick(20); assert.equal(f.mini.state.play.complete, false); assert.equal(f.finished.length, 0);
  f.key('Enter'); f.tick(5);
  assert.equal(f.mini.state.phase.kind, 'climbing');
  assert.ok(f.registry.musicFor(f.mini.state, { mode: 'moment', momentGame: 'footsteps' }).coastOpenness > .1);
  f.tick(12);
  assert.equal(f.finished.length, 1); assert.equal(f.finished[0].outcome.earned, true);
  assert.equal(f.finished[0].outcome.title, '转角见海'); assert.equal(f.mini.active, false);
  f.tick(20); assert.equal(f.finished.length, 1); f.destroy();
});

test('the later tide registration keeps drawn strokes and awards the tide memory once', async () => {
  const f = host('maclehose'); await f.open('coast-shell');
  assert.equal(f.h.$('micro-title').textContent, '留给下一道浪的一笔');
  f.key(' '); for (let i = 0; i < 6; i++) f.key('ArrowRight'); f.key(' ', 'up');
  assert.equal(f.mini.state.strokes.length, 1); assert.equal(f.mini.state.length, 96);
  f.tick(10);
  assert.equal(f.finished.length, 1); assert.equal(f.finished[0].outcome.title, '潮汐收笔');
  assert.equal(f.finished[0].outcome.earned, true); f.destroy();
});

test('Changping installs its current interaction while rejecting the retired day event as an entry', async () => {
  const f = host('changping'); await f.open('changping-branch-reflection');
  assert.equal(f.mini.state.kind, 'changping-memory'); assert.equal(f.h.$('micro-title').textContent, '枯枝认影');
  assert.equal(f.registry.allows('changping-branch-reflection'), true); assert.equal(f.registry.allows('valley-moss'), false);
  f.key('3'); f.tick(1.4); f.key('1'); f.tick(6);
  assert.equal(f.finished.length, 1); assert.equal(f.finished[0].outcome.title, '枯林水镜');
  assert.equal(f.finished[0].outcome.earned, true); f.destroy();
});

test('the day host uses leaf clearing while the legacy home retains stone timing and its bound toolbar action', async () => {
  const modern = host('mogan'); await modern.open('bamboo-step');
  assert.equal(modern.mini.state.kind, 'day-memory'); assert.equal(modern.mini.state.scene.kind, 'steps');
  assert.equal(modern.h.$('micro-title').textContent, '拂开落叶，沿古道上山'); modern.destroy();
  const old = host('mogan', { legacy: true }); await old.open('bamboo-step');
  assert.equal(old.mini.state.game, 'footsteps'); assert.equal(old.mini.state.steps.slow, false);
  old.h.click('mogan-slow'); assert.equal(old.mini.state.steps.slow, true);
  old.h.click('mogan-slow'); assert.equal(old.mini.state.steps.slow, false);
  assert.equal(old.finished.length, 0); old.destroy();
  assert.equal(old.views.at(-1).disposed, true);
  assert.equal(old.h.$('mogan-slow').listeners.click.length, 0);
  assert.equal(old.h.$('tiger-actions').listeners.click.length, 0);
  assert.equal(old.h.$('micro-surface').listeners.pointerdown.length, 0);
});

test('the dedicated tiger page starts at the river but the old home keeps its descent action', async () => {
  const modern = host('tiger'); await modern.open('tiger-middle-river-frame-v1');
  assert.equal(modern.registry.allows('tiger-middle-river-frame-v1'), true);
  assert.equal(modern.mini.state.river.phase, 'river');
  assert.equal(modern.registry.kindFor('tiger-middle-river-frame-v1'), 'tiger-river'); modern.destroy();
  const old = host('tiger', { legacy: true }); await old.open('tiger-middle-river-frame-v1');
  assert.equal(old.mini.state.river.phase, 'descent');
  const button = old.h.$('tiger-actions').querySelector('[data-trail-action="continue-to-river"]');
  assert.equal(button.disabled, false); old.h.$('tiger-actions').emit('click', { target: button });
  assert.equal(old.mini.state.river.phase, 'river');
  old.mini.finish(); assert.equal(old.finished.length, 0);
  assert.deepEqual(old.closed.at(-1), { id: 'tiger-middle-river-frame-v1', earned: false, resume: true }); old.destroy();
});

test('tiger memory IDs use the current interaction and clean up their additional controls', async () => {
  const f = host('tiger'), before = f.h.$('tiger-actions').children.length;
  await f.open('tiger-inn-pairs-v4');
  assert.equal(f.mini.state.session.kind, 'inn'); assert.equal(f.h.$('micro-title').textContent, '记住山色');
  assert.equal(f.registry.kindFor('tiger-inn-pairs-v4'), 'tiger-rest');
  f.key('Enter'); assert.deepEqual(f.mini.state.session.open, [0]);
  f.scenes.suspend(); f.key('ArrowRight'); assert.equal(f.mini.state.session.focus, 0);
  f.destroy(); assert.equal(f.finished.length, 0);
  assert.equal(f.h.$('tiger-actions').children.length, before - 1);
  assert.equal(f.views.at(-1).disposed, true);
});

test('reward kind fallback preserves host-specific unknown and optional legacy behavior', async () => {
  const platform = { ...Mini, kinds: { ...Mini.kinds, 'bamboo-step': 'rain', 'tiger-middle-river-frame-v1': 'wind', 'gorge-goat': 'rain', custom: 'puzzle' } };
  const old = host('mogan', { legacy: true, platform }); await old.open('bamboo-step');
  assert.equal(old.registry.kindFor('bamboo-step'), 'footsteps'); assert.equal(old.registry.kindFor('gorge-goat'), 'depth');
  assert.equal(old.registry.kindFor('tiger-middle-river-frame-v1'), 'tiger-river');
  assert.equal(old.registry.kindFor('custom'), 'puzzle'); assert.equal(old.registry.kindFor(null), undefined); old.destroy();
  const withoutArt = host('mogan', { legacy: true, platform, legacyArt: null });
  assert.equal(withoutArt.registry.has('bamboo-step'), false); assert.equal(withoutArt.registry.kindFor('bamboo-step'), 'rain'); withoutArt.destroy();
  const tiger = host('tiger', { platform }); assert.equal(tiger.registry.kindFor('custom'), undefined); tiger.destroy();
  const wugong = host('wugong', { platform }); assert.equal(wugong.registry.kindFor('custom'), 'puzzle');
  await wugong.open('meadow-butterfly'); assert.equal(wugong.mini.state.game, 'clouds'); wugong.destroy();
});
