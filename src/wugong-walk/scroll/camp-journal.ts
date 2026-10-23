import type { JournalData, Moment, MomentCatalog } from '../../runtime/contracts';
import { CAMP_STARS_ID } from './camp-stars';
import type { EnvironmentFrame } from '../environment';
import { createJournalStore, type JournalSaveResult } from '../../runtime/journal-store';

type CaptureCatalog = MomentCatalog & { safeCaptureArt(value: unknown): string | null };
export type CampSaveResult = JournalSaveResult;

export function rememberCampStars(catalog: CaptureCatalog, journal: JournalData, storage: Storage | null, capture: string, now = Date.now()): CampSaveResult {
  return rememberKeepsake(catalog, journal, storage, CAMP_STARS_ID, capture, 'clear', now);
}

export function rememberKeepsake(catalog: CaptureCatalog, journal: JournalData, storage: Storage | null, id: string, capture: string, weather: EnvironmentFrame['weather'], now = Date.now()): CampSaveResult {
  const art = catalog.safeCaptureArt(capture), entry = catalog.item(id);
  if (!art || !entry) return { kind: 'error', message: '这幅手绘还未展开，可以重新加载后再收好。' };
  const moment: Moment = {
    key: `${now}-${id}`, id: entry.id, route: 'wugong', edition: 3, earned: true,
    place: entry.place, title: entry.name, tag: entry.tag, memory: entry.memory, icon: entry.icon,
    artVersion: 5, captureArt: art, artSource: 'capture', createdAt: now,
    weather: weather === 'drizzle' ? 'rain' : weather === 'mist' ? 'fog' : weather === 'cloud' ? null : 'clear',
  };
  return createJournalStore({ catalog, data: journal, storage }).save(moment);
}
