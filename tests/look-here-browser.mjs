// Local-only browser fixture. Serve on a separate origin; never ship with dist.
import { createPrivatePhotoStore, PRIVATE_PHOTO_DB, GlimpseApplication, createGlimpsePreferenceStore, createGlimpseView, GLIMPSE_POINTS } from './current.js';
import { createPrivatePhotoStore as createLegacyStore } from './legacy.js';

const fixture = await (await fetch('./v1.json')).json();
const report = document.querySelector('#report');
const result = (name, ok, detail = '') => {
  const line = document.createElement('p'); line.textContent = `${ok ? 'PASS' : 'FAIL'} ${name} ${detail}`;
  report.append(line); if (!ok) throw new Error(name);
};
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const rows = fixture.photos;
document.querySelector('#storage').onclick = async () => {
  const legacy = createLegacyStore(indexedDB), current = createPrivatePhotoStore(indexedDB);
  try {
    for (const photo of rows) result(`旧实现写入 ${photo.id}`, (await legacy.save(photo)).kind === 'stored');
    const read = await current.read();
    result('新实现读取旧快照', read.kind === 'loaded' && rows.every(row => equal(read.photos.find(p => p.id === row.id), row)));
    const next = { ...rows[1], id: 'fixture-architecture-new', body: '新代码写入，final4 仍可读取。' };
    await current.save(next); await current.save(next);
    await current.close();
    const refreshed = createPrivatePhotoStore(indexedDB), reread = await refreshed.read();
    result('重开连接及同 ID 去重', reread.kind === 'loaded' && reread.photos.filter(p => p.id === next.id).length === 1);
    const oldRead = await legacy.read();
    result('final4 回退读取新记录', oldRead.kind === 'loaded' && equal(oldRead.photos.find(p => p.id === next.id), next));
    const raw = await new Promise((yes, no) => { const req = indexedDB.open(PRIVATE_PHOTO_DB, 1); req.onsuccess = () => yes(req.result); req.onerror = () => no(req.error); });
    await new Promise((yes, no) => {
      const tx = raw.transaction('photos', 'readwrite'); tx.objectStore('photos').put({ id: 'fixture-damaged-keep', kind: 'broken', body: '保留损坏行' });
      tx.oncomplete = yes; tx.onabort = tx.onerror = () => no(tx.error);
    });
    const tolerant = await refreshed.read();
    result('坏行不阻断有效旧图', tolerant.kind === 'loaded' && !tolerant.photos.some(p => p.id === 'fixture-damaged-keep') && rows.every(row => tolerant.photos.some(p => p.id === row.id)));
    const damaged = await new Promise((yes, no) => { const req = raw.transaction('photos', 'readonly').objectStore('photos').get('fixture-damaged-keep'); req.onsuccess = () => yes(req.result); req.onerror = () => no(req.error); });
    result('坏行未被删除或改写', damaged?.body === '保留损坏行');
    raw.close(); await refreshed.close();
    result('存档兼容检查完成', true, '未升级数据库；未清空任何存储。');
  } catch (error) { result('浏览器存档检查', false, String(error)); }
  finally { await legacy.close(); await current.close(); }
};
document.querySelector('#failure').onclick = () => {
  const dialog = document.createElement('dialog'); dialog.className = 'glimpse-dialog'; dialog.setAttribute('aria-labelledby', 'glimpse-title');
  const section = document.createElement('section'); section.className = 'glimpse-sheet'; dialog.append(section); document.body.append(dialog);
  let fail = true;
  const available = createPrivatePhotoStore(indexedDB), unavailable = createPrivatePhotoStore(null);
  const app = new GlimpseApplication({
    photos: { read: () => available.read(), save: photo => fail ? unavailable.save(photo) : available.save(photo), close: () => available.close() },
    preferences: createGlimpsePreferenceStore(null), sceneVersion: 'fixture-capture', capture: async () => rows[0].image,
    id: () => 'fixture-save-retry', now: () => 1792620900000, saved: () => result('保存成功通知', true),
  });
  const close = () => { dialog.close(); dialog.remove(); app.dispose(); };
  const go = panel => { app.show(panel); dialog.dataset.view = panel.kind; view.render(panel, app.generation); };
  const view = createGlimpseView({ section, app, go, close, requestClose: close, solitudeChanged: () => {} });
  const toolbar = document.createElement('div'), restore = document.createElement('button');
  restore.textContent = '测试：恢复存储并允许重试'; toolbar.append(restore); dialog.prepend(toolbar);
  restore.onclick = () => { fail = false; restore.disabled = true; };
  go({ kind: 'compose', draft: { ...app.fresh(GLIMPSE_POINTS[0]), image: rows[0].image, body: '失败后应保留的配文' } });
  dialog.showModal();
};
