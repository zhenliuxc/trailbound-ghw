import { clamp, curve, distance, mix, type Point } from '../journey/geometry';

import { CREST, PLACES, MAIN_ORDER, SUMMIT_KNOTS, type PlaceId } from '../content/aotai-map';
export { PLACES, MAIN_ORDER, CAMP_IDS, OVERVIEW_BOUNDS, CREST } from '../content/aotai-map';
export type { PlaceId } from '../content/aotai-map';

export function surfaceCrest(x: number): number {
  let i = 1; while (i < CREST.length - 1 && CREST[i].x < x) i++;
  const a = CREST[i - 1], b = CREST[i]; return mix(a.y, b.y, (x - a.x) / (b.x - a.x));
}

export class AotaiPath {
  readonly points: Point[] = [];
  readonly lengths: number[] = [];
  readonly stations: { readonly id: PlaceId; readonly at: number }[] = [];
  readonly length: number;
  private readonly stops = new Map<PlaceId, number>();
  constructor() {
    const subdivisions = 18, main = curve(MAIN_ORDER.map(id => PLACES[id]), subdivisions);
    let travelled = 0;
    const append = (point: Point) => {
      const previous = this.points[this.points.length - 1];
      if (previous) travelled += distance(previous, point);
      this.points.push(point); this.lengths.push(travelled);
    };
    const station = (id: PlaceId) => { this.stations.push({ id, at: travelled }); if (!this.stops.has(id)) this.stops.set(id, travelled); };
    for (let i = 0; i < main.length; i++) {
      append(main[i]);
      if (i % subdivisions !== 0) continue;
      const id = MAIN_ORDER[i / subdivisions]; station(id);
      if (id !== 'dayehai') continue;
      const summit = curve(SUMMIT_KNOTS, 16);
      summit.slice(1).forEach(append); station('baxian');
      summit.slice(0, -1).reverse().forEach(append); station('dayehai');
    }
    this.length = travelled;
  }
  at(id: PlaceId): number { const at = this.stops.get(id); if (at === undefined) throw new Error(`山路缺少地点 ${id}`); return at; }
  between(from: PlaceId, to: PlaceId, t: number): number { return mix(this.at(from), this.at(to), t); }
  sample(at: number): Point {
    const value = clamp(at, 0, this.length); let i = 1;
    while (i < this.lengths.length - 1 && this.lengths[i] < value) i++;
    const a = this.points[i - 1], b = this.points[i], t = (value - this.lengths[i - 1]) / Math.max(.001, this.lengths[i] - this.lengths[i - 1]);
    return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) };
  }
  elevation(at: number): number {
    const value = clamp(at, 0, this.length); let i = 1;
    while (i < this.stations.length - 1 && this.stations[i].at < value) i++;
    const a = this.stations[i - 1], b = this.stations[i];
    return mix(PLACES[a.id].elevation, PLACES[b.id].elevation, (value - a.at) / Math.max(.001, b.at - a.at));
  }
  slope(at: number): number { return (this.elevation(at + 30) - this.elevation(at - 25)) / 55; }
  heading(at: number): number { const a = this.sample(at - 15), b = this.sample(at + 40); return Math.atan2(b.y - a.y, b.x - a.x); }
  section(at: number): string {
    let index = 1; while (index < this.stations.length - 1 && this.stations[index].at <= at + 1) index++;
    return `${PLACES[this.stations[index - 1].id].name} → ${PLACES[this.stations[index].id].name}`;
  }
}
export const path = new AotaiPath();
