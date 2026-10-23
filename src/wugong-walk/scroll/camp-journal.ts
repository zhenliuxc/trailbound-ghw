import type { JournalData, Moment, MomentCatalog } from '../../runtime/contracts';
import { CAMP_STARS_ID } from './camp-stars';
import type { EnvironmentFrame } from '../environment';

type CaptureCatalog = MomentCatalog & { safeCaptureArt(value: unknown): string | null };
export type CampSaveResult = { kind: 'stored'; existing: boolean } | { kind: 'error'; message: string };

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
  return storeEarnedMoment(catalog, journal, storage, moment);
}

export function storeEarnedMoment(catalog: MomentCatalog, journal: JournalData, storage: Storage | null, moment: Moment): CampSaveResult {
  if (moment.edition !== 3 || !moment.earned || !catalog.hasTag(moment)) return { kind: 'error', message: '完成互动后才会记入手帐。' };
  const result = journal.remember(catalog.loadMoments(storage), moment);
  if (result.status === 'unchanged') return { kind: 'stored', existing: true };
  if (result.status === 'full') return { kind: 'error', message: '手帐已满，原有回忆已保留。可以先留在这里看看画。' };
  if (!catalog.saveMoments(storage, result.moments)) return { kind: 'error', message: '暂时无法保存手帐，可以重试。' };
  return { kind: 'stored', existing: false };
}
