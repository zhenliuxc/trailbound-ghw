export { EVENTS } from '../content/tiger';
import type { LandmarkSymbol } from '../journey/landmark-symbol';
import { HIGH_ROAD_KNOTS, RIVER_BRANCH_KNOTS, RIVER_COURSE_KNOTS, TIGER_SITES, CLIMB_START_POINT, type CheckpointId, type PlaceId } from '../content/tiger-map';
export { TIGER_WORLD, CHECKPOINT_IDS } from '../content/tiger-map';
export type { CheckpointId, PlaceId, Leg } from '../content/tiger-map';
import { clamp, curve, distance, mix, type Point } from '../journey/geometry';

export type { TigerEventId as EventId } from '../content/tiger';
export const isCheckpoint = (id: PlaceId): id is CheckpointId => id === 'start' || id === 'bends' || id === 'halfway' || id === 'waterfall' || id === 'tinas' || id === 'river';
export interface Place { readonly id: PlaceId; readonly name: string; readonly at: number; readonly leg: 'high' | 'down'; readonly point: Point; readonly symbol: LandmarkSymbol; readonly labelSide: 'above' | 'below' | 'left' | 'right' }

/** Art-directed positions preserve the high road and the same-path river return, not GPS scale. */
export class TigerPath {
  readonly points: readonly Point[];
  readonly lengths = [0];
  readonly length: number;
  constructor(knots: readonly (readonly [number, number])[]) {
    this.points = curve(knots.map(([x, y]) => ({ x, y })), 10);
    for (let i = 1; i < this.points.length; i++) this.lengths.push(this.lengths[i - 1] + distance(this.points[i - 1], this.points[i]));
    this.length = this.lengths[this.lengths.length - 1];
  }
  sample(at: number): Point {
    const value = clamp(at, 0, this.length); let i = 1;
    while (i < this.lengths.length - 1 && this.lengths[i] < value) i++;
    const a = this.points[i - 1], b = this.points[i], t = (value - this.lengths[i - 1]) / Math.max(.001, this.lengths[i] - this.lengths[i - 1]);
    return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) };
  }
  heading(at: number): number { const a = this.sample(at - 12), b = this.sample(at + 30); return Math.atan2(b.y - a.y, b.x - a.x); }
  nearest(point: Point): number {
    let at = 0, gap = Infinity;
    this.points.forEach((p, i) => { const next = distance(p, point); if (next < gap) { gap = next; at = this.lengths[i]; } });
    return at;
  }
}

export const highRoad = new TigerPath(HIGH_ROAD_KNOTS);
export const riverBranch = new TigerPath(RIVER_BRANCH_KNOTS);
export const riverCourse = curve(RIVER_COURSE_KNOTS.map(([x, y]) => ({ x, y })), 10);

const site = (id: PlaceId, name: string, leg: 'high' | 'down', x: number, y: number, symbol: Place['symbol'], labelSide: Place['labelSide'] = 'below'): Place => {
  const path = leg === 'high' ? highRoad : riverBranch, at = path.nearest({ x, y });
  return { id, name, leg, at, point: path.sample(at), symbol, labelSide };
};
export const PLACES: readonly Place[] = TIGER_SITES.map(spec => site(...spec));
export function place(id: PlaceId): Place { const found = PLACES.find(p => p.id === id); if (!found) throw new Error(`虎跳峡地点缺失：${id}`); return found; }
export const CLIMB_START = highRoad.nearest(CLIMB_START_POINT);
export const CLIMB_END = place('bends').at;
export const RIVER_PHOTO_AT = riverBranch.length - 55;
export const WATERFALL_GAME_AT = place('waterfall').at + 135;

