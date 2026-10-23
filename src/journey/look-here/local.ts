import { GLIMPSE_SCENE_VERSION, type PhotoFrame } from '../../content/look-here';
import { createPrivatePhotoStore, PRIVATE_PHOTO_CHANGED } from '../../runtime/journal-store';
import { GlimpseApplication } from './application';
import { createGlimpsePreferenceStore } from './preferences';

export function createLocalGlimpse(capture: (frame: PhotoFrame) => Promise<string>): GlimpseApplication {
  let factory: IDBFactory | null = null, storage: Storage | null = null;
  try { factory = window.indexedDB; } catch { /* Walking and reading do not require storage. */ }
  try { storage = window.localStorage; } catch { /* Preferences remain session-local. */ }
  return new GlimpseApplication({
    photos: createPrivatePhotoStore(factory), preferences: createGlimpsePreferenceStore(storage),
    sceneVersion: GLIMPSE_SCENE_VERSION, capture, id: () => crypto.randomUUID(), now: () => Date.now(),
    saved: () => window.dispatchEvent(new Event(PRIVATE_PHOTO_CHANGED)),
  });
}
