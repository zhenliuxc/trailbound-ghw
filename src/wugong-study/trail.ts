export type Point = Readonly<{ x: number; y: number }>;

export const SCENE = { width: 1672, height: 941 } satisfies {
  width: number;
  height: number;
};

const CONTROL_POINTS: readonly [Point, Point, ...Point[]] = [
  { x: 30, y: 906 },
  { x: 180, y: 835 },
  { x: 350, y: 770 },
  { x: 530, y: 680 },
  { x: 700, y: 591 },
  { x: 850, y: 520 },
  { x: 1000, y: 455 },
  { x: 1120, y: 421 },
  { x: 1190, y: 397 },
  { x: 1230, y: 375 },
  { x: 1252, y: 335 },
  { x: 1260, y: 286 },
  { x: 1295, y: 240 },
  { x: 1380, y: 211 },
  { x: 1430, y: 199 },
  { x: 1470, y: 171 },
  { x: 1491, y: 139 },
  { x: 1495, y: 86 },
  { x: 1454, y: 42 },
];

type TrailPoint = Point & Readonly<{ distance: number }>;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const mix = (a: number, b: number, amount: number): number =>
  a + (b - a) * amount;

function curve(a: Point, b: Point, c: Point, d: Point, t: number): Point {
  const t2 = t * t;
  const t3 = t2 * t;
  const coordinate = (p0: number, p1: number, p2: number, p3: number): number =>
    0.5 * ((2 * p1) + (-p0 + p2) * t
      + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
      + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  return {
    x: coordinate(a.x, b.x, c.x, d.x),
    y: coordinate(a.y, b.y, c.y, d.y),
  };
}

export class PaintedTrail {
  readonly points: readonly [TrailPoint, ...TrailPoint[]];
  readonly length: number;
  readonly start: number;
  readonly end: number;

  constructor() {
    const first: TrailPoint = { ...CONTROL_POINTS[0], distance: 0 };
    const points: [TrailPoint, ...TrailPoint[]] = [first];
    let previous = first;
    let distance = 0;
    for (let index = 0; index < CONTROL_POINTS.length - 1; index += 1) {
      const b = CONTROL_POINTS[index] ?? CONTROL_POINTS[0];
      const c = CONTROL_POINTS[index + 1] ?? b;
      const a = CONTROL_POINTS[index - 1] ?? b;
      const d = CONTROL_POINTS[index + 2] ?? c;
      const steps = Math.max(8, Math.ceil(Math.hypot(c.x - b.x, c.y - b.y) / 6));
      for (let step = 1; step <= steps; step += 1) {
        const point = curve(a, b, c, d, step / steps);
        distance += Math.hypot(point.x - previous.x, point.y - previous.y);
        previous = { ...point, distance };
        points.push(previous);
      }
    }
    this.points = points;
    this.length = distance;
    this.start = 170;
    this.end = this.nearest({ x: 1470, y: 171 }, 0, distance).distance;
  }

  at(distance: number): Point {
    const bounded = clamp(distance, 0, this.length);
    let low = 0;
    let high = this.points.length - 1;
    while (high - low > 1) {
      const middle = Math.floor((low + high) / 2);
      const point = this.points[middle] ?? this.points[0];
      if (point.distance < bounded) low = middle;
      else high = middle;
    }
    const a = this.points[low] ?? this.points[0];
    const b = this.points[high] ?? a;
    const amount = b.distance === a.distance ? 0 : (bounded - a.distance) / (b.distance - a.distance);
    return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
  }

  tangent(distance: number, direction = 1): Point {
    const a = this.at(distance - 14 * direction);
    const b = this.at(distance + 30 * direction);
    const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { x: (b.x - a.x) / length, y: (b.y - a.y) / length };
  }

  nearest(position: Point, start = this.start, end = this.end): TrailPoint & { offset: number } {
    let nearest = { ...this.at(start), distance: start, offset: Number.POSITIVE_INFINITY };
    for (let index = 1; index < this.points.length; index += 1) {
      const a = this.points[index - 1] ?? this.points[0];
      const b = this.points[index] ?? a;
      if (b.distance < start || a.distance > end) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const squared = dx * dx + dy * dy;
      const lower = squared === 0 ? 0 : clamp((start - a.distance) / (b.distance - a.distance), 0, 1);
      const upper = squared === 0 ? 1 : clamp((end - a.distance) / (b.distance - a.distance), 0, 1);
      const amount = clamp(squared === 0 ? 0 : ((position.x - a.x) * dx + (position.y - a.y) * dy) / squared, lower, upper);
      const x = a.x + dx * amount;
      const y = a.y + dy * amount;
      const offset = Math.hypot(position.x - x, position.y - y);
      if (offset < nearest.offset) nearest = {
        x, y, offset,
        distance: mix(a.distance, b.distance, amount),
      };
    }
    return nearest;
  }
}
