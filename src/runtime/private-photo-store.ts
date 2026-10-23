import { parsePrivatePhoto, type PrivatePhoto, type PhotoReadResult, type PhotoSaveResult, type PrivatePhotoStore } from './private-photo';
export { normalizePhotoText, visibleCharacterCount, parsePrivatePhoto } from './private-photo';
export type { PrivatePhoto, PhotoAttribution, PhotoReadResult, PhotoSaveResult, PrivatePhotoStore } from './private-photo';

export const PRIVATE_PHOTO_DB = 'trailbound-private-photos-v1';
export const PRIVATE_PHOTO_DB_VERSION = 1;
export const PRIVATE_PHOTO_CHANGED = 'trailbound-private-photo-saved';

export function createPrivatePhotoStore(factory: IDBFactory | null): PrivatePhotoStore {
  let opening: Promise<IDBDatabase> | null = null;
  function open(): Promise<IDBDatabase> {
    if (opening) return opening;
    opening = new Promise((resolve, reject) => {
      if (!factory) { reject(new Error('浏览器未提供本地照片存储')); return; }
      const request = factory.open(PRIVATE_PHOTO_DB, PRIVATE_PHOTO_DB_VERSION);
      request.onupgradeneeded = () => { request.result.createObjectStore('photos', { keyPath: 'id' }); };
      request.onsuccess = () => { request.result.onversionchange = () => { request.result.close(); opening = null; }; resolve(request.result); };
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('请合上其他旧版本页面后重试'));
    });
    opening.catch(() => { opening = null; });
    return opening;
  }
  return {
    async read(): Promise<PhotoReadResult> {
      try {
        const db = await open();
        const photos = await new Promise<PrivatePhoto[]>((resolve, reject) => {
          const request = db.transaction('photos', 'readonly').objectStore('photos').getAll();
          request.onerror = () => reject(request.error);
          request.onsuccess = () => {
            const rows: unknown = request.result;
            resolve(Array.isArray(rows) ? rows.map(parsePrivatePhoto).filter((photo): photo is PrivatePhoto => photo !== null).sort((a, b) => b.createdAt - a.createdAt) : []);
          };
        });
        return { kind: 'loaded', photos };
      } catch { return { kind: 'error', message: '本机私藏暂时无法读取，原有照片没有被删除。可以重试。' }; }
    },
    async save(photo: PrivatePhoto): Promise<PhotoSaveResult> {
      const snapshot = parsePrivatePhoto(photo);
      if (!snapshot) return { kind: 'error', message: '这张照片还没准备好，请重新拍下这一眼。' };
      try {
        const db = await open();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction('photos', 'readwrite');
          tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
          tx.objectStore('photos').put(snapshot);
        });
        return { kind: 'stored', photo: snapshot };
      } catch { return { kind: 'error', message: '这张照片还没保存成功，请腾出空间后重试。编辑内容仍留在这里。' }; }
    },
    async close() { const pending = opening; opening = null; if (pending) { try { (await pending).close(); } catch { /* Failed opens own no connection. */ } } },
  };
}
