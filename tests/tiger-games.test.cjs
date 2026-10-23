// Prepared with the implementation. Do not execute until the user authorizes testing.
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../dist/runtime.js');
const D = require('../dist/discoveries.js');
const create = (id, reduced = false) => R.createTigerState(D.item(id), reduced);
const act = (s, action, value, extra = {}) => R.inputTiger(s, { action, value, ...extra });
function advance(s, seconds) { for (let t = 0; t < seconds - 1e-8; t += .05) s = R.tickTiger(s, Math.min(.05, seconds - t)); return s; }
function tapCard(s, i) { return act(act(s, 'depth-card', i, { phase: 'press' }), 'depth-card', i, { phase: 'release' }); }
function put(s, i, x, y) { return act(act(s, 'select-piece', i), 'pack-cell', undefined, { x, y }); }
function phrase() { let s = create('gorge-sparkle'); s = act(s, 'note', 0); return act(s, 'note', 10); }

test('Tiger keeps the four original collectible identities', () => {
  assert.deepEqual(Object.keys(R.TIGER_GAMES), ['gorge-goat', 'gorge-eagle', 'gorge-sparkle', 'tiger-bell-first']);
  for (const id of Object.keys(R.TIGER_GAMES)) assert.equal(D.item(id).route, 'tiger');
});
test('waiting and blank presses never earn any of the four paintings', () => {
  for (const id of Object.keys(R.TIGER_GAMES)) {
    let s = create(id); s = act(s, 'outside', undefined, { phase: 'press' }); s = act(s, 'outside', undefined, { phase: 'release' });
    s = advance(s, 20); assert.equal(s.play.complete, false, id); assert.equal(s.done, false, id);
  }
});
test('depth requires comparison and the whole order; taps and drags reorder actual cards', () => {
  let s = create('gorge-goat');
  s = tapCard(s, 1); s = tapCard(s, 0);
  assert.deepEqual(s.depth.order, [0, 2, 3, 1]);
  s = act(s, 'depth-card', 3, { phase: 'press' });
  s = act(s, 'depth-card', 1, { phase: 'release', dragged: true });
  assert.deepEqual(s.depth.order, [0, 1, 2, 3]);
  s = act(s, 'check-depth'); assert.equal(s.play.complete, false);
  s = act(s, 'view', 1); s = act(s, 'check-depth'); assert.equal(s.play.complete, true);
});
test('a wrong complete depth order remains editable', () => {
  let s = act(create('gorge-goat'), 'view', 1); s = act(s, 'check-depth');
  assert.equal(s.play.complete, false); assert.equal(s.depth.seen, 3);
  const before = s.depth.order.slice(); s = act(s, 'depth-card', 2, { phase: 'press' }); s = R.releaseTiger(s);
  assert.deepEqual(s.depth.order, before); assert.equal(s.depth.held, -1);
});
test('packing rejects collisions, out of bounds and premature closing', () => {
  let s = put(create('gorge-eagle'), 0, 0, 0);
  s = put(s, 1, 0, 1); assert.equal(s.bag.poses[1].cell, null);
  s = put(s, 1, 4, 3); assert.equal(s.bag.poses[1].cell, null);
  s = act(s, 'close-bag'); assert.equal(s.play.complete, false);
  assert.deepEqual(s.bag.poses[0].cell, { x: 0, y: 0 });
});
test('five packed belongings still need the deliberate closing action', () => {
  let s = create('gorge-eagle');
  for (const [i, x, y] of [[0, 0, 0], [1, 1, 0], [2, 1, 1], [3, 3, 1], [4, 3, 2]]) s = put(s, i, x, y);
  assert.equal(s.bag.poses.filter(p => p.cell).length, 5); assert.equal(s.play.complete, false);
  s = act(s, 'close-bag'); assert.equal(s.bag.closed, true); assert.equal(s.play.complete, true);
});
test('rotation uses actual shape cells, and removal reopens space', () => {
  const initial = R.itemCells(4, 0);
  assert.deepEqual(R.itemCells(4, 4), initial);
  let s = act(create('gorge-eagle'), 'select-piece', 0); s = act(s, 'rotate');
  assert.equal(R.canPack(s, 0, { x: 3, y: 0 }), false);
  s = put(s, 0, 1, 0); assert.deepEqual(s.bag.poses[0].cell, { x: 1, y: 0 });
  s = act(s, 'take-out'); assert.equal(s.bag.poses[0].cell, null);
});
test('cancelling or dropping outside preserves the old packed pose', () => {
  let s = put(create('gorge-eagle'), 0, 0, 0);
  s = act(s, 'pack-piece', 0, { phase: 'press', x: .4, y: .5 });
  s = R.inputTiger(s, { action: 'outside', x: -5, y: -5 }, true);
  s = act(s, 'outside', undefined, { phase: 'release', dragged: true });
  assert.deepEqual(s.bag.poses[0].cell, { x: 0, y: 0 });
  s = act(s, 'pack-piece', 0, { phase: 'press', x: .5, y: .5 }); s = R.releaseTiger(s);
  assert.equal(s.bag.held, null); assert.deepEqual(s.bag.poses[0].cell, { x: 0, y: 0 });
});
test('score needs two voices and a global rest, not just a rest in one row', () => {
  let s = create('gorge-sparkle');
  for (let i = 0; i < 8; i++) s = act(s, 'note', i);
  s = act(s, 'note', 8); assert.equal(R.scoreReady(s), false);
  s = act(s, 'note', 7); assert.equal(R.scoreReady(s), true);
});
test('score audition completes without awarding until the player saves', () => {
  let s = phrase(); s = act(s, 'save-score'); assert.equal(s.play.complete, false);
  s = act(s, 'audition'); assert.equal(s.events.at(-1).type, 'score-water');
  s = advance(s, R.BEAT_SECONDS * 8 + .05);
  assert.equal(s.score.audition, s.score.revision); assert.equal(s.play.complete, false);
  assert(s.events.some(e => e.type === 'score-drop' && e.index === 2));
  s = act(s, 'save-score'); assert.equal(s.play.complete, true);
});
test('stopping, editing and undoing cannot reuse an earlier score audition', () => {
  let s = act(phrase(), 'audition'); s = advance(s, .8); s = act(s, 'audition');
  assert.equal(s.score.audition, -1);
  s = act(s, 'audition'); s = advance(s, 4); s = act(s, 'note', 5);
  s = act(s, 'save-score'); assert.equal(s.play.complete, false);
  s = act(s, 'undo'); assert.equal(s.score.audition, -1);
  s = act(s, 'save-score'); assert.equal(s.play.complete, false);
});
test('a wrong trail branch blocks other branches until the player returns', () => {
  let s = advance(create('tiger-bell-first'), .5);
  assert.equal(s.events.at(-1).x, .08);
  s = act(s, 'branch', 1); assert.equal(s.bells.wrong, true);
  s = act(s, 'branch', 0); assert.equal(s.bells.junction, 0);
  s = act(s, 'listen-bell'); assert.equal(s.events.at(-1).index, 0);
  s = act(s, 'return'); s = act(s, 'branch', 0); s = act(s, 'listen-bell');
  assert.equal(s.bells.junction, 1); assert.equal(s.events.at(-1).x, .92);
});
test('finding the mule does not award for waiting; letting it pass does', () => {
  let s = create('tiger-bell-first', true); s = act(s, 'branch', 0); s = act(s, 'branch', 1); s = advance(s, 10);
  assert.equal(s.bells.junction, 2); assert.equal(s.play.complete, false);
  s = act(s, 'let-pass'); assert.equal(s.play.complete, true); s = advance(s, .7); assert.equal(s.done, true);
});
