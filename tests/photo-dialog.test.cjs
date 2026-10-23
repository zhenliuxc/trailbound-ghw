const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const vm = require('node:vm');

const code = buildSync({ entryPoints: ['src/journey/photo-dialog.ts'], bundle: true, write: false, format: 'cjs' }).outputFiles[0].text;

function fixture() {
  const doc = new EventTarget(); doc.hidden = false;
  class Node extends EventTarget {
    constructor() {
      super(); this.ownerDocument = doc; this.style = { setProperty() {} }; this.dataset = {};
      this.hidden = false; this.open = false; this.attributes = new Map();
    }
    setAttribute(key, value) { this.attributes.set(key, value); }
    showModal() { this.open = true; }
    close() { if (this.open) { this.open = false; this.dispatchEvent(new Event('close')); } }
    animate() { return { finished: new Promise(() => {}), play() {}, pause() {}, cancel() {} }; }
  }
  const nodes = new Map(['', 'image', 'title', 'caption', 'source', 'license', 'continue', 'state', 'message', 'retry', 'close'].map(part => ['test-photo' + (part ? '-' + part : ''), new Node()]));
  doc.getElementById = key => nodes.get(key) ?? null;
  const box = { exports: {} };
  vm.runInNewContext(code, { module: box, exports: box.exports, document: doc, window: { clearTimeout, setTimeout }, performance });
  const lifecycle = new AbortController(), closed = [];
  const photos = box.exports.createPhotoDialog({ prefix: 'test', signal: lifecycle.signal, reduced: () => false, onClose: value => closed.push(value) });
  return { photos, lifecycle, closed, node: part => nodes.get('test-photo' + (part ? '-' + part : '')) };
}
const photo = { file: 'one.webp', title: '原作', caption: '地点实景', alt: '山海', author: '作者', source: 'https://example.com/photo', license: 'CC0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/' };

test('a late image response cannot replace the next checkpoint, and retry keeps its attribution', () => {
  const f = fixture();
  f.photos.show({ name: '西湾', checkpoint: 'saiwan', photo });
  const firstLoad = f.node('image').onload;
  f.photos.show({ name: '咸田湾', checkpoint: 'hamtin', photo: { ...photo, file: 'two.webp', author: '另一位作者', position: '60% 40%' } });
  firstLoad(); assert.equal(f.node('image').hidden, true);
  f.node('image').onerror(); assert.equal(f.node('retry').hidden, false);
  f.node('retry').dispatchEvent(new Event('click')); f.node('image').onload();
  assert.equal(f.node('image').src, 'two.webp'); assert.equal(f.node('image').hidden, false);
  assert.equal(f.node('source').textContent, '另一位作者'); assert.equal(f.node('image').style.objectPosition, '60% 40%');
  f.lifecycle.abort();
});

test('continue advances once, while disposal cancels callbacks without resuming a route', () => {
  const f = fixture();
  f.photos.show({ name: '西湾', checkpoint: 'saiwan', photo });
  f.node('continue').dispatchEvent(new Event('click'));
  f.node('').dispatchEvent(new Event('close'));
  assert.deepEqual(f.closed, [true]); assert.equal(f.photos.open, false);
  f.photos.show({ name: '咸田湾', checkpoint: 'hamtin', photo });
  const response = f.node('image').onload;
  f.lifecycle.abort(); response();
  assert.equal(f.photos.open, false); assert.equal(f.node('image').hidden, true); assert.deepEqual(f.closed, [true]);
});
