import { clamp, curve, distance, mix, type Point } from '../../journey/geometry';
import { TRAIL_KNOTS, CREST_KNOTS, SCROLL_SITES, VALLEY_POINT, TEMPLE_POINT, type ScrollStopId, type ScrollStage, type ScrollStop } from '../../content/wugong-map';
export { SCROLL, PLACE_MARKERS, STAGES } from '../../content/wugong-map';
export type { ScrollStopId, ScrollStage, ScrollStop } from '../../content/wugong-map';

const mountainCrest = curve(CREST_KNOTS.map(([x, y]) => ({ x, y })), 14);

export class ScrollTrail {
  readonly points = curve(TRAIL_KNOTS.map(([x, y]) => ({ x, y })), 12);
  readonly ridge = mountainCrest;
  readonly lengths: number[] = [0];
  readonly length: number;
  readonly campTravel: number;
  readonly summitTravel: number;
  readonly valleyTravel: number;
  readonly templeTravel: number;
  readonly sites: Readonly<Record<ScrollStopId, ScrollStop>>;
  readonly stops: readonly ScrollStop[];
  constructor() {
    for (let i = 1; i < this.points.length; i++) this.lengths.push(this.lengths[i - 1] + distance(this.points[i - 1], this.points[i]));
    this.length = this.lengths[this.lengths.length - 1];
    const stop = (id: ScrollStopId, name: string, day: 1 | 2, x: number, y: number): ScrollStop => {
      const travel = this.nearest({ x, y }).travel;
      return { id, name, day, travel, point: this.sample(travel) };
    };
    this.sites = {
      start: stop(...SCROLL_SITES.start),
      slope: stop(...SCROLL_SITES.slope),
      meadow: stop(...SCROLL_SITES.meadow),
      camp: stop(...SCROLL_SITES.camp),
      horse: stop(...SCROLL_SITES.horse),
      summit: stop(...SCROLL_SITES.summit),
      end: stop(...SCROLL_SITES.end),
    };
    this.stops = Object.values(this.sites);
    this.campTravel = this.sites.camp.travel; this.summitTravel = this.sites.summit.travel;
    this.valleyTravel = this.nearest(VALLEY_POINT).travel;
    this.templeTravel = this.nearest(TEMPLE_POINT).travel;
  }
  stage(travel: number): ScrollStage {
    if (travel < 100) return 'village';
    if (travel < this.sites.slope.travel - 160) return 'forest';
    if (travel < this.sites.slope.travel + 100) return 'slope';
    if (travel < this.campTravel - 120) return 'meadow';
    if (travel < this.campTravel + 100) return 'camp';
    if (travel < this.summitTravel - 150) return 'ridge';
    if (travel <= this.summitTravel) return 'summit';
    if (travel < this.valleyTravel) return 'descent';
    if (travel < this.templeTravel) return 'valley';
    return travel < this.length - 120 ? 'temple' : 'end';
  }
  sample(travel: number): Point {
    const d = clamp(travel, 0, this.length);
    let low = 0, high = this.lengths.length - 1;
    while (low + 1 < high) { const middle = (low + high) >> 1; if (this.lengths[middle] < d) low = middle; else high = middle; }
    const t = (d - this.lengths[low]) / Math.max(.001, this.lengths[high] - this.lengths[low]);
    return { x: mix(this.points[low].x, this.points[high].x, t), y: mix(this.points[low].y, this.points[high].y, t) };
  }
  nearest(point: Point): { travel: number; gap: number } {
    let travel = 0, gap = Infinity;
    for (let i = 0; i < this.points.length - 1; i++) {
      const a = this.points[i], b = this.points[i + 1], dx = b.x - a.x, dy = b.y - a.y;
      const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / Math.max(.001, dx * dx + dy * dy));
      const delta = Math.hypot(point.x - a.x - dx * t, point.y - a.y - dy * t);
      if (delta < gap) { gap = delta; travel = mix(this.lengths[i], this.lengths[i + 1], t); }
    }
    return { travel, gap };
  }
  heading(travel: number): number {
    const a = this.sample(travel - 18), b = this.sample(travel + 24);
    return Math.atan2(b.y - a.y, b.x - a.x);
  }
  angle(travel: number): number {
    const a = this.sample(travel - 14), b = this.sample(travel + 18);
    return Math.atan2(b.y - a.y, Math.abs(b.x - a.x));
  }
  bend(travel: number): number {
    const delta = this.heading(travel + 22) - this.heading(travel - 22);
    return Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta)));
  }
  soleOffset(travel: number, contactX: number): number {
    const a = this.sample(travel - 10), b = this.sample(travel + 10);
    return clamp((b.y - a.y) / Math.max(8, Math.abs(b.x - a.x)), -.75, .75) * contactX;
  }
  crestAt(x: number): number {
    let low = 0, high = this.ridge.length - 1;
    while (low + 1 < high) { const middle = (low + high) >> 1; if (this.ridge[middle].x < x) low = middle; else high = middle; }
    const a = this.ridge[low], b = this.ridge[high];
    return mix(a.y, b.y, clamp((x - a.x) / Math.max(.001, b.x - a.x)));
  }
  distantAt(x: number): number {
    const shoulder = (this.crestAt(x - 160) + this.crestAt(x + 180)) / 2;
    return Math.min(this.crestAt(x) - 95, shoulder - 125 - Math.sin(x / 285) * 28);
  }
}
