import { isPhotoPointId, type PhotoPointId } from '../../runtime/private-photo';

export const GLIMPSE_PREFERENCE_KEY = 'trailbound-glimpse-local-v1';
export const GLIMPSE_PREFERENCE_SCHEMA_VERSION = 1;
export interface GlimpsePreferences {
  readonly solitude: boolean;
  readonly hidden: readonly PhotoPointId[];
}
export interface GlimpsePreferenceStore {
  read(): GlimpsePreferences;
  save(value: GlimpsePreferences): boolean;
}
export function parseGlimpsePreferences(value: unknown): GlimpsePreferences {
  if (!value || typeof value !== 'object') return { solitude: false, hidden: [] };
  return {
    solitude: 'solitude' in value && value.solitude === true,
    hidden: 'hidden' in value && Array.isArray(value.hidden) ? [...new Set(value.hidden.filter(isPhotoPointId))] : [],
  };
}
export function createGlimpsePreferenceStore(storage: Pick<Storage, 'getItem' | 'setItem'> | null): GlimpsePreferenceStore {
  return {
    read() {
      try { return parseGlimpsePreferences(JSON.parse(storage?.getItem(GLIMPSE_PREFERENCE_KEY) ?? 'null')); }
      catch { return parseGlimpsePreferences(null); }
    },
    save(value) {
      if (!storage) return false;
      try { storage.setItem(GLIMPSE_PREFERENCE_KEY, JSON.stringify(value)); return true; }
      catch { return false; }
    },
  };
}
