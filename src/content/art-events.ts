import { DAY_ROUTES } from './day-routes';
import type { ChapterId } from './catalog';
import { WUGONG_EVENTS } from './wugong';
import { EVENTS } from './tiger';
import { CUES as AOTAI_CUES } from './aotai';
import { CUES as COAST_CUES } from './maclehose';

interface ArtEvent { readonly entry: string; readonly place: string }
/** The map and the art page resolve event identity and location from the same content. */
export const ART_EVENTS: Readonly<Record<ChapterId, readonly ArtEvent[]>> = {
  wugong: [WUGONG_EVENTS.kite, WUGONG_EVENTS.encounter, WUGONG_EVENTS.clouds, WUGONG_EVENTS.stones],
  tiger: Object.values(EVENTS),
  aotai: Object.values(AOTAI_CUES),
  maclehose: Object.values(COAST_CUES),
  changping: DAY_ROUTES.changping.events,
  mogan: DAY_ROUTES.mogan.events,
  westlake: DAY_ROUTES.westlake.events,
};
