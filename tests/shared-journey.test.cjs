const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
const D = require('../dist/discoveries.js');
const J = require('../dist/journal.js');

const source = buildSync({ stdin: {
  contents: 'export * from "./src/runtime/journal-store"; export * from "./src/runtime/frame-loop"; export * from "./src/runtime/projection"; export * from "./src/journey/art-session";',
  resolveDir: process.cwd(),
}, bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const box = { exports: {} };
vm.runInThisContext(`(function(module,exports){${source}\n})`)(box, box.exports);
const { createJournalStore, createFrameLoop, createProjection, coverCamera, artMessage, readArtMessage } = box.exports;

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
function moment(id, now = 1) {
  const entry = D.item(id);
  return { key: `${id}-${now}`, id, route: entry.route, edition: 3, earned: true, artVersion: 4,
    title: entry.name, tag: entry.tag, place: entry.place, memory: '第一次留下的回忆', createdAt: now, icon: entry.icon };
}

test('a mounted journal preserves another page’s later save and the first memory on replay', () => {
  const disk = storage(), options = { catalog: D, data: J, storage: disk };
  const home = createJournalStore(options), game = createJournalStore(options);
  assert.deepEqual(home.read(), []);
  assert.equal(game.save(moment('meadow-bird')).kind, 'stored');
  assert.equal(home.save(moment('meadow-butterfly')).kind, 'stored');
  assert.deepEqual(home.read().map(item => item.id), ['meadow-bird', 'meadow-butterfly']);
  const replay = home.save({ ...moment('meadow-bird', 2), memory: '不应覆盖首次回忆' });
  assert.equal(replay.kind, 'stored'); assert.equal(replay.existing, true);
  assert.equal(game.read()[0].memory, '第一次留下的回忆'); assert.equal(game.read()[0].createdAt, 1);
});

test('quota failure and an unfinished game do not add a collected memory', () => {
  const disk = storage(), store = createJournalStore({ catalog: D, data: J, storage: disk });
  assert.equal(store.save({ ...moment('meadow-bird'), earned: false }).kind, 'error');
  disk.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.equal(store.save(moment('meadow-bird')).kind, 'error');
  assert.deepEqual(store.read(), []);
});

test('closing a previous iframe or a different game cannot collect the current encounter', () => {
  const previous = { session: 'first', entry: 'coast-shell' };
  const current = { session: 'second', entry: 'coast-shell' };
  assert.equal(readArtMessage(artMessage(previous, 'close', 1), current), null);
  assert.equal(readArtMessage(artMessage({ ...current, entry: 'coast-sand' }, 'collected', 1), current), null);
  assert.equal(readArtMessage({ ...artMessage(current, 'collected', 1), collected: 1.5 }, current), null);
  assert.equal(readArtMessage({ type: 'close', collected: 1 }, current), null);
  assert.equal(readArtMessage(artMessage(current, 'collected', 1), current).collected, 1);
});

test('pausing and resuming resets the clock and discards an already queued old callback', () => {
  let id = 0, active = true;
  const pending = new Map(), updates = [];
  const clock = createFrameLoop({ request: fn => { pending.set(++id, fn); return id; }, cancel: key => pending.delete(key),
    active: () => active, maxDelta: .05, update: dt => updates.push(dt) });
  const run = time => { const [key, callback] = pending.entries().next().value; pending.delete(key); callback(time); };
  clock.ensure(); clock.ensure(); assert.equal(pending.size, 1);
  run(100); run(110); assert.deepEqual(updates, [0, .01]);
  const late = [...pending.values()][0]; clock.stop(); late(5000); assert.equal(updates.length, 2);
  clock.ensure(); run(6000); run(10000); assert.deepEqual(updates.slice(-2), [0, .05]);
  active = false; run(10016); assert.equal(pending.size, 0);
});

test('portrait and landscape drawing hit the same world point as the artwork', () => {
  for (const [width, height] of [[390, 700], [844, 320], [1440, 820]]) {
    const camera = coverCamera(width, height, { width: 1000, height: 667 }, { x: 590, y: 275 });
    const point = { x: 590, y: 400 }, hit = camera.toWorld(camera.toScreen(point));
    assert.ok(Math.abs(hit.x - point.x) < 1e-9 && Math.abs(hit.y - point.y) < 1e-9);
    assert.ok(camera.x <= 0 && camera.y <= 0);
    assert.ok(camera.x + 1000 * camera.scale >= width - 1e-9);
    assert.ok(camera.y + 667 * camera.scale >= height - 1e-9);
  }
  const mountain = createProjection(23, -80, .6, .8);
  assert.deepEqual(mountain.toScreen({ x: 100, y: 200 }), { x: 83, y: 80 });
  assert.deepEqual(mountain.toWorld({ x: 83, y: 80 }), { x: 100, y: 200 });
});
