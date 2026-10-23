/** One authored high-trail vignette. Metres express this slice, not GPX accuracy. */
export const CLIMB_LENGTH = 28;
export const CLIMB_WORLD_LENGTH = 1900;
export const CLIMB_PIXELS_PER_METRE = CLIMB_WORLD_LENGTH / CLIMB_LENGTH;

export interface ClimbPose { x: number; y: number; grade: number; heading: number }
export interface ClimbPoint { x: number; y: number }

const clamp = (value: number): number => Math.max(0, Math.min(1, value));
const smooth = (value: number): number => { const t = clamp(value); return t * t * (3 - 2 * t); };

/** The drawing, boot contact, props and effort all sample this same hillside. */
export function climbGroundY(x: number): number {
  const t = x / CLIMB_WORLD_LENGTH;
  // Most climbing happens before the shoulder; the last few metres become a ledge.
  return 555 - 180 * t - 58 * smooth((t - .15) / .6)
    + Math.sin(t * Math.PI * 4) * 5.5;
}

export function climbPose(distance: number): ClimbPose {
  const x = clamp(distance / CLIMB_LENGTH) * CLIMB_WORLD_LENGTH;
  const before = climbGroundY(x - 3), after = climbGroundY(x + 3);
  const slope = (after - before) / 6;
  return { x, y: climbGroundY(x), grade: -slope, heading: Math.atan2(slope, 1) };
}

/** The foreground shoulder clears after the first twelve metres. */
export function gorgeOpenness(distance: number): number {
  return smooth((distance / CLIMB_LENGTH - .40) / .31);
}

/** Rendering extends the hillside beyond both ends without inventing more progress. */
export function climbPath(start = -600, end = CLIMB_WORLD_LENGTH + 1000, step = 24): ClimbPoint[] {
  const points: ClimbPoint[] = [];
  for (let x = start; x < end; x += step) points.push({ x, y: climbGroundY(x) });
  points.push({ x: end, y: climbGroundY(end) });
  return points;
}
