export interface Point { x: number; y: number }

export const clamp = (value: number, low = 0, high = 1): number => Math.max(low, Math.min(high, value));
export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
export const smooth = (value: number): number => { const t = clamp(value); return t * t * (3 - 2 * t); };
export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

export function curve(knots: readonly Point[], subdivisions = 15): Point[] {
  if (knots.length < 2) return [...knots];
  const points: Point[] = [];
  const sample = (a: number, b: number, c: number, d: number, t: number): number =>
    .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  for (let i = 0; i < knots.length - 1; i++) {
    const a = knots[Math.max(0, i - 1)], b = knots[i], c = knots[i + 1], d = knots[Math.min(knots.length - 1, i + 2)];
    for (let j = 0; j < subdivisions; j++) points.push({ x: sample(a.x, b.x, c.x, d.x, j / subdivisions), y: sample(a.y, b.y, c.y, d.y, j / subdivisions) });
  }
  points.push(knots[knots.length - 1]);
  return points;
}
