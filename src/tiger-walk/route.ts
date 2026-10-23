export { EVENTS } from '../content/tiger';
import type { LandmarkSymbol } from '../journey/landmark-symbol';
import { clamp, curve, distance, mix, type Point } from '../wugong-walk/model';

export const TIGER_WORLD = { width: 3600, height: 1900 };
export type CheckpointId = 'start' | 'bends' | 'halfway' | 'waterfall' | 'tinas' | 'river';
export type PlaceId = CheckpointId | 'naxi' | 'tea' | 'teacher';
export type { TigerEventId as EventId } from '../content/tiger';
export const CHECKPOINT_IDS: readonly CheckpointId[] = ['start', 'bends', 'halfway', 'waterfall', 'tinas', 'river'];
export const isCheckpoint = (id: PlaceId): id is CheckpointId => id === 'start' || id === 'bends' || id === 'halfway' || id === 'waterfall' || id === 'tinas' || id === 'river';
export type Leg = 'high' | 'down' | 'return';
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

export const highRoad = new TigerPath([
  [190, 1440], [320, 1350], [465, 1290], [570, 1190], [690, 1110],
  [800, 1060], [875, 965], [780, 935], [940, 855], [855, 815], [1020, 740], [940, 700], [1100, 625],
  [1210, 650], [1300, 720], [1430, 800], [1550, 810], [1690, 770], [1830, 710], [1990, 710],
  [2110, 735], [2250, 705], [2380, 750], [2490, 760], [2580, 820], [2690, 855], [2790, 945], [2880, 1000],
]);
export const riverBranch = new TigerPath([
  [2880, 1000], [3000, 995], [3100, 1030], [3140, 1080], [3045, 1115], [3180, 1165], [3090, 1200], [3210, 1250],
]);
export const riverCourse = curve([
  [-400, 1940], [200, 1770], [750, 1670], [1250, 1580], [1750, 1500], [2210, 1470], [2680, 1460], [3090, 1445], [3520, 1240], [4100, 930],
].map(([x, y]) => ({ x, y })), 10);

const site = (id: PlaceId, name: string, leg: 'high' | 'down', x: number, y: number, symbol: Place['symbol'], labelSide: Place['labelSide'] = 'below'): Place => {
  const path = leg === 'high' ? highRoad : riverBranch, at = path.nearest({ x, y });
  return { id, name, leg, at, point: path.sample(at), symbol, labelSide };
};
export const PLACES: readonly Place[] = [
  site('start', '桥头', 'high', 190, 1440, 'village', 'below'),
  site('naxi', '纳西雅阁', 'high', 570, 1190, 'inn', 'above'),
  site('bends', '二十八道拐', 'high', 1100, 625, 'switchbacks', 'above'),
  site('tea', '茶马客栈', 'high', 1550, 810, 'inn'),
  site('halfway', '中途客栈', 'high', 1990, 710, 'inn', 'above'),
  site('waterfall', '龙洞瀑布', 'high', 2490, 760, 'waterfall', 'above'),
  site('tinas', '中峡客栈', 'high', 2880, 1000, 'inn', 'left'),
  site('teacher', '张老师小路', 'down', 3100, 1030, 'trailhead', 'right'),
  site('river', '中虎跳 · 江边', 'down', 3210, 1250, 'rapids'),
];
export function place(id: PlaceId): Place { const found = PLACES.find(p => p.id === id); if (!found) throw new Error(`虎跳峡地点缺失：${id}`); return found; }
export const CLIMB_START = highRoad.nearest({ x: 800, y: 1060 });
export const CLIMB_END = place('bends').at;
export const RIVER_PHOTO_AT = riverBranch.length - 55;
export const WATERFALL_GAME_AT = place('waterfall').at + 135;

