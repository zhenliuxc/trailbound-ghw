const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const fixture = require('./fixtures/look-here-v1.json');
const code = buildSync({ stdin: { contents: 'export * from "./src/journey/look-here/editor"; export * from "./src/journey/look-here/application"; export * from "./src/journey/look-here/preferences"; export * from "./src/content/look-here";', resolveDir: process.cwd() }, bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;
const mod = { exports: {} }; new Function('module', 'exports', code)(mod, mod.exports);
const { createDraft, editDraft, recommendCaption, exitPanel, photoSnapshot, GlimpseApplication, createGlimpsePreferenceStore, GLIMPSE_POINTS } = mod.exports;
const identity = { id: 'app-draft', createdAt: 123, point: GLIMPSE_POINTS[0], sceneVersion: 'capture-version-at-start' };
const image = fixture.photos[0].image;
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
function setup(overrides = {}) {
  const writes = [], notices = [];
  const photos = { read: async () => ({ kind: 'loaded', photos: fixture.photos }), save: async value => { writes.push(value); return { kind: 'stored', photo: value }; }, close: async () => {} };
  const app = new GlimpseApplication({ photos, preferences: createGlimpsePreferenceStore(null), sceneVersion: identity.sceneVersion, capture: async () => image, id: () => identity.id, now: () => identity.createdAt, saved: () => notices.push('saved'), ...overrides });
  app.show({ kind: 'compose', draft: app.fresh(GLIMPSE_POINTS[0]) });
  return { app, writes, notices };
}
test('new drafts are empty/anonymous; a prior pen name and caption never become defaults', () => {
  const a = createDraft(identity), b = editDraft(editDraft(a, { kind: 'caption', body: '第一张' }), { kind: 'attribution', value: { kind: 'pen-name', name: '茶山客' } });
  assert.equal(a.body, ''); assert.equal(b.body, '第一张');
  const next = createDraft({ ...identity, id: 'second' });
  assert.equal(next.body, ''); assert.equal(next.image, null); assert.deepEqual(next.attribution, { kind: 'anonymous' });
});
test('recommendations require explicit replacement, preserve original on cancellation and allow clearing', () => {
  const original = editDraft(createDraft(identity), { kind: 'caption', body: '自己写的' });
  assert.deepEqual(recommendCaption(original, '推荐文字'), { kind: 'confirm' });
  assert.equal(original.body, '自己写的');
  const confirmed = recommendCaption(original, '推荐文字', true);
  assert.equal(confirmed.draft.body, '推荐文字');
  assert.equal(editDraft(confirmed.draft, { kind: 'caption', body: '' }).body, '');
  assert.equal(recommendCaption(createDraft(identity), '推荐文字').kind, 'applied');
});
test('changing crop invalidates only the captured photo and snapshot retains the capture version', () => {
  const d = editDraft(editDraft(createDraft(identity), { kind: 'caption', body: '  原文\r\n保留  ' }), { kind: 'capture', image });
  const snapshot = photoSnapshot(d);
  assert.equal(snapshot.sceneVersion, 'capture-version-at-start'); assert.equal(snapshot.image, image); assert.equal(snapshot.body, '原文\n保留');
  for (const command of [{ kind: 'anchor', index: 2 }, { kind: 'zoom', value: 1.3 }, { kind: 'retake' }]) {
    const edited = editDraft(d, command); assert.equal(edited.image, null); assert.equal(edited.body, d.body); assert.equal(photoSnapshot(edited), null);
  }
  assert.equal(snapshot.image, image); assert.equal(snapshot.createdAt, 123);
});
test('exit guard protects caption or captured image; cancelling leave resumes the same draft', () => {
  const empty = createDraft(identity);
  assert.equal(exitPanel({ kind: 'compose', draft: empty }), null);
  for (const draft of [editDraft(empty, { kind: 'caption', body: '未保存' }), editDraft(empty, { kind: 'capture', image })]) {
    const leave = exitPanel({ kind: 'preview', draft }); assert.equal(leave.kind, 'leave');
    assert.deepEqual(exitPanel(leave), { kind: 'compose', draft });
  }
});
test('application saves one immutable snapshot for concurrent clicks and announces only confirmed storage', async () => {
  const task = deferred(), writes = [];
  const { app, notices } = setup({ photos: { read: async () => ({ kind: 'loaded', photos: [] }), save: value => { writes.push(value); return task.promise; }, close: async () => {} } });
  app.edit({ kind: 'capture', image }); app.edit({ kind: 'caption', body: '保存原文' });
  const first = app.save(); assert.equal(app.saving, true); assert.equal((await app.save()).kind, 'ignored');
  assert.equal(app.edit({ kind: 'caption', body: '后来输入' }), null); assert.equal(app.show({ kind: 'settings' }), false);
  assert.equal(notices.length, 0); task.resolve({ kind: 'stored', photo: writes[0] });
  assert.equal((await first).kind, 'stored'); assert.equal(writes.length, 1); assert.equal(writes[0].body, '保存原文'); assert.deepEqual(notices, ['saved']);
});
test('storage error retains draft and permits a later retry without false success', async () => {
  let attempts = 0;
  const { app, notices } = setup({ photos: { read: async () => ({ kind: 'loaded', photos: [] }), save: async photo => ++attempts === 1 ? { kind: 'error', message: 'fixture quota failure' } : { kind: 'stored', photo }, close: async () => {} } });
  app.edit({ kind: 'capture', image }); app.edit({ kind: 'caption', body: '仍在编辑' });
  assert.equal((await app.save()).kind, 'error'); assert.equal(app.panel.draft.body, '仍在编辑'); assert.equal(app.saving, false); assert.equal(notices.length, 0);
  assert.equal((await app.save()).kind, 'stored'); assert.equal(attempts, 2); assert.equal(notices.length, 1);
});
test('late capture, album and save responses cannot update a newer/disposed session', async () => {
  const shot = deferred(), album = deferred(), save = deferred();
  const { app, notices } = setup({ capture: () => shot.promise, photos: { read: () => album.promise, save: () => save.promise, close: async () => {} } });
  const token = app.generation, capturing = app.capture({ x: 0, y: 0, width: 4, height: 3 }, token), reading = app.read(token);
  app.show({ kind: 'settings' }); shot.resolve(image); album.resolve({ kind: 'loaded', photos: fixture.photos });
  assert.equal(await capturing, null); assert.equal(await reading, null);
  app.show({ kind: 'compose', draft: app.fresh(GLIMPSE_POINTS[0]) }); app.edit({ kind: 'capture', image });
  const saving = app.save(); app.dispose(); save.resolve({ kind: 'stored', photo: fixture.photos[0] });
  assert.equal((await saving).kind, 'ignored'); assert.equal(app.panel, null); assert.equal(notices.length, 0);
});
test('v1 preferences use only their own key, tolerate bad JSON and keep session choices on write failure', () => {
  const rows = new Map([[fixture.preferencesKey, JSON.stringify(fixture.preferences)], ['unrelated', 'untouched']]);
  const store = createGlimpsePreferenceStore({ getItem: key => rows.get(key) ?? null, setItem: (key, value) => rows.set(key, value) });
  assert.deepEqual(store.read(), fixture.preferences); assert.equal(store.save({ solitude: true, hidden: ['jx-creek'] }), true);
  assert.equal(rows.get('unrelated'), 'untouched');
  rows.set(fixture.preferencesKey, '{invalid'); assert.deepEqual(store.read(), { solitude: false, hidden: [] });
  const { app } = setup(); assert.equal(app.setSolitude(true), false); assert.equal(app.solitude, true);
});
