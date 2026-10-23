import type { JournalData, Moment, MomentCatalog } from './contracts';
export { createPrivatePhotoStore, PRIVATE_PHOTO_CHANGED } from './private-photo-store';
export type { PrivatePhoto, PhotoAttribution, PrivatePhotoStore } from './private-photo-store';

export type JournalSaveResult =
  | { kind: 'stored'; existing: boolean; change: 'added' | 'upgraded' | 'unchanged'; moments: Moment[] }
  | { kind: 'error'; message: string };

interface JournalStoreOptions {
  catalog: MomentCatalog;
  data: JournalData;
  storage: Storage | null;
}

/** Read before merging so a mounted page cannot overwrite a newer iframe save. */
export function createJournalStore({ catalog, data, storage }: JournalStoreOptions) {
  const read = () => catalog.loadMoments(storage);
  function save(moment: Moment): JournalSaveResult {
    if (!catalog.hasTag(moment) || moment.edition === 3 && !moment.earned) {
      return { kind: 'error', message: '完成互动后才会记入手帐。' };
    }
    const result = data.remember(read(), moment);
    if (result.status === 'full') return { kind: 'error', message: '手帐已满，原有回忆已保留。可以先留在这里看看画。' };
    if (result.status !== 'unchanged' && !catalog.saveMoments(storage, result.moments)) {
      return { kind: 'error', message: '暂时无法保存手帐，可以重试。' };
    }
    return { kind: 'stored', existing: result.status === 'unchanged', change: result.status, moments: result.moments };
  }
  return { read, save };
}
