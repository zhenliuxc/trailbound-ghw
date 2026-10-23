import { WUGONG_EVENTS } from '../../content/wugong';
export type { WugongEventId as TrailEventId } from '../../content/wugong';
import type { WugongEventId as TrailEventId } from '../../content/wugong';
import type { Point } from '../model';
import type { ScrollTrail } from './route';

export interface TrailEvent {
  readonly id: TrailEventId;
  readonly entry: string;
  readonly title: string;
  readonly place: string;
  readonly story: string;
  readonly action: string;
  readonly day: 1 | 2;
  readonly trigger: 'trail' | 'camp' | 'archive';
  readonly travel: number;
  readonly point: Point;
}

export function trailEvents(trail: ScrollTrail): Readonly<Record<TrailEventId, TrailEvent>> {
  const site = (travel: number) => ({ travel, point: trail.sample(travel) });
  return {
    leaves: { ...WUGONG_EVENTS.leaves, ...site(trail.sites.slope.travel * .50) },
    kite: { ...WUGONG_EVENTS.kite, ...site((trail.sites.meadow.travel + trail.campTravel) / 2) },
    encounter: { ...WUGONG_EVENTS.encounter, ...site(trail.campTravel) },
    stars: { ...WUGONG_EVENTS.stars, ...site(trail.campTravel) },
    clouds: { ...WUGONG_EVENTS.clouds, ...site(trail.campTravel + (trail.sites.horse.travel - trail.campTravel) * .5) },
    stones: { ...WUGONG_EVENTS.stones, ...site(trail.summitTravel + 240) },
    return: { ...WUGONG_EVENTS.return, ...site((trail.summitTravel + 240 + trail.length) / 2) },
  };
}
