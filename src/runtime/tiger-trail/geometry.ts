/** Scene-space geometry, deliberately not a geographic track or route coordinate source. */
import { curve } from '../../journey/geometry';
export interface Point { x: number; y: number }
export interface TrailGeometry {
  points: readonly Point[];
  cumulative: readonly number[];
  length: number;
}
export interface TrailPoint extends Point { distance: number; segment: number; heading: number }
export interface TrailProjection extends TrailPoint { offset: number }

export const WORLD = Object.freeze({ width: 1000, height: 720 });
/** Footpath centres measured on the 1478 × 1064 generated watercolor, not GPS. */
const PAINTED_CLIMB = [
  [380, 1010], [298, 965], [225, 916], [176, 878], [165, 844], [191, 813],
  [270, 783], [364, 745], [452, 705], [535, 667], [615, 632], [662, 605],
  [659, 583], [608, 560], [537, 538], [463, 515], [385, 492], [309, 470],
  [268, 448], [267, 425], [308, 404], [368, 385], [425, 367], [478, 345],
  [521, 320], [549, 298], [563, 278], [589, 265], [626, 259], [653, 260],
] satisfies readonly (readonly [number, number])[];
export const CLIMB_PATH: readonly Point[] = curve(PAINTED_CLIMB.map(([x, y]) => ({ x: x * WORLD.width / 1478, y: y * WORLD.height / 1064 })), 7);

/** Follows the visible ledge in tiger-longdong-v2; scene coordinates, not a GPS trace. */
export const PASSAGE_PATH: readonly Point[] = [
  { x: 90, y: 447 }, { x: 220, y: 432 }, { x: 335, y: 420 },
  { x: 405, y: 410 }, { x: 530, y: 396 }, { x: 650, y: 385 },
  { x: 760, y: 374 },
];

/** A transition drawing, not a surveyed route down to the river. */
export const DESCENT_PATH: readonly Point[] = [
  { x: 230, y: 118 }, { x: 500, y: 172 }, { x: 640, y: 240 },
  { x: 350, y: 308 }, { x: 255, y: 370 }, { x: 590, y: 430 },
  { x: 730, y: 500 }, { x: 585, y: 573 }, { x: 680, y: 631 },
];

export const clamp = (value: number, low: number, high: number): number => Math.max(low, Math.min(high, value));
export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

export function makeTrail(points: readonly Point[]): TrailGeometry {
  const cumulative = [0];
  for (let i = 1; i < points.length; i++) cumulative.push(cumulative[i - 1] + distance(points[i - 1], points[i]));
  return { points, cumulative, length: cumulative[cumulative.length - 1] || 0 };
}

export const CLIMB_TRAIL = makeTrail(CLIMB_PATH);
export const PASSAGE_TRAIL = makeTrail(PASSAGE_PATH);
export const DESCENT_TRAIL = makeTrail(DESCENT_PATH);

export function pointAt(trail: TrailGeometry, at: number): TrailPoint {
  const d = clamp(Number.isFinite(at) ? at : 0, 0, trail.length);
  let index = 0;
  while (index < trail.points.length - 2 && trail.cumulative[index + 1] <= d) index++;
  const a = trail.points[index] || { x: 0, y: 0 }, b = trail.points[index + 1] || a;
  const length = distance(a, b), ratio = length > 0 ? (d - (trail.cumulative[index] || 0)) / length : 0;
  return { x: a.x + (b.x - a.x) * ratio, y: a.y + (b.y - a.y) * ratio,
    distance: d, segment: index, heading: Math.atan2(b.y - a.y, b.x - a.x) };
}

/** Projection is restricted in arc length so adjacent hairpins cannot teleport the walker. */
export function projectToTrail(trail: TrailGeometry, point: Point, from = 0, to = trail.length): TrailProjection {
  const low = clamp(from, 0, trail.length), high = clamp(Math.max(low, to), 0, trail.length);
  const first = pointAt(trail, low);
  let result: TrailProjection = { ...first, offset: distance(point, first) };
  for (let i = 0; i < trail.points.length - 1; i++) {
    const start = trail.cumulative[i], end = trail.cumulative[i + 1];
    if (end < low || start > high || end <= start) continue;
    const a = trail.points[i], b = trail.points[i + 1], length = end - start;
    const raw = ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / (length * length);
    const ratio = clamp(raw, Math.max(0, (low - start) / length), Math.min(1, (high - start) / length));
    const x = a.x + (b.x - a.x) * ratio, y = a.y + (b.y - a.y) * ratio;
    const offset = Math.hypot(point.x - x, point.y - y);
    if (offset < result.offset - .0001) result = { x, y, offset, distance: start + ratio * length,
      segment: i, heading: Math.atan2(b.y - a.y, b.x - a.x) };
  }
  return result;
}

export function turnAhead(trail: TrailGeometry, at: number, within = 48): number {
  const a = pointAt(trail, at), b = pointAt(trail, Math.min(trail.length, at + within));
  return Math.abs(Math.atan2(Math.sin(b.heading - a.heading), Math.cos(b.heading - a.heading)));
}

export function clampCamera(camera: { x: number; y: number; zoom: number }): { x: number; y: number; zoom: number } {
  const zoom = clamp(Number.isFinite(camera.zoom) ? camera.zoom : 1, 1, 1.8);
  const halfW = WORLD.width / zoom / 2, halfH = WORLD.height / zoom / 2;
  return { zoom, x: clamp(Number.isFinite(camera.x) ? camera.x : 500, halfW, WORLD.width - halfW),
    y: clamp(Number.isFinite(camera.y) ? camera.y : 360, halfH, WORLD.height - halfH) };
}
