/**
 * An authored walking vignette, not a survey of the Tiger Leaping Gorge trail.
 * One world unit is approximately one metre; +Y is up and +X faces the gorge.
 */
export interface Vec3 { x: number; y: number; z: number }
export interface WalkPose { position: Vec3; heading: number; grade: number }

const clamp = (value: number, low = 0, high = 1): number => Math.max(low, Math.min(high, value));
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
const smooth = (value: number): number => { const t = clamp(value); return t * t * (3 - 2 * t); };

// The turn opens toward the river after the near rock shoulder. The unhurried
// switchbacks change both elevation and heading without making a tracing game.
const CONTROL: readonly Vec3[] = [
  { x: -31, y: 29, z: 74 }, { x: -27, y: 31, z: 61 },
  { x: -34, y: 34, z: 45 }, { x: -24, y: 36, z: 34 },
  { x: -21, y: 40, z: 17 }, { x: -8, y: 44, z: 5 },
  { x: -17, y: 48, z: -12 }, { x: -6, y: 51, z: -24 },
  { x: -2, y: 54, z: -43 }, { x: 8, y: 56, z: -56 },
  { x: 11, y: 60, z: -77 }, { x: 20, y: 63, z: -91 },
];

function catmull(a: number, b: number, c: number, d: number, t: number): number {
  return 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
}

function curve(t: number): Vec3 {
  const scaled = clamp(t) * (CONTROL.length - 1);
  const index = Math.min(CONTROL.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const a = CONTROL[Math.max(0, index - 1)];
  const b = CONTROL[index];
  const c = CONTROL[index + 1];
  const d = CONTROL[Math.min(CONTROL.length - 1, index + 2)];
  return {
    x: catmull(a.x, b.x, c.x, d.x, local),
    y: catmull(a.y, b.y, c.y, d.y, local),
    z: catmull(a.z, b.z, c.z, d.z, local),
  };
}

interface PathPoint extends Vec3 { distance: number }
const PATH: PathPoint[] = [];
for (let index = 0, distance = 0; index <= 440; index += 1) {
  const point = curve(index / 440);
  const previous = PATH[index - 1];
  if (previous) distance += Math.hypot(point.x - previous.x, point.y - previous.y, point.z - previous.z);
  PATH.push({ ...point, distance });
}

export const WALK_LENGTH = PATH[PATH.length - 1].distance;

function pointAt(distance: number): Vec3 {
  const target = clamp(distance, 0, WALK_LENGTH);
  let low = 0;
  let high = PATH.length - 1;
  while (low + 1 < high) {
    const middle = (low + high) >> 1;
    if (PATH[middle].distance < target) low = middle;
    else high = middle;
  }
  const a = PATH[low];
  const b = PATH[high];
  const t = (target - a.distance) / Math.max(0.00001, b.distance - a.distance);
  return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), z: mix(a.z, b.z, t) };
}

export function sampleWalk(distance: number): WalkPose {
  const safe = Number.isFinite(distance) ? clamp(distance, 0, WALK_LENGTH) : 0;
  const position = pointAt(safe);
  const before = pointAt(Math.max(0, safe - 0.7));
  const after = pointAt(Math.min(WALK_LENGTH, safe + 0.7));
  const dx = after.x - before.x;
  const dz = after.z - before.z;
  return {
    position,
    heading: Math.atan2(dx, dz),
    grade: (after.y - before.y) / Math.max(0.001, Math.hypot(dx, dz)),
  };
}

/** Small coherent undulations shared by terrain, path edges and vegetation. */
export function terrainGrain(x: number, z: number): number {
  return Math.sin(x * 0.094 + Math.sin(z * 0.031) * 2.4) * 0.53
    + Math.sin(z * 0.137 - x * 0.057) * 0.28
    + Math.sin(x * 0.31 + z * 0.27) * 0.12
    + Math.sin(x * 0.81 - z * 0.69) * 0.07;
}

function trailXAtZ(z: number): number {
  if (z >= PATH[0].z) return PATH[0].x;
  if (z <= PATH[PATH.length - 1].z) return PATH[PATH.length - 1].x;
  // This authored route progresses monotonically toward -Z. Querying its
  // dense centreline keeps the cliff shelf aligned with every walking bend.
  let low = 0;
  let high = PATH.length - 1;
  while (low + 1 < high) {
    const middle = (low + high) >> 1;
    if (PATH[middle].z > z) low = middle;
    else high = middle;
  }
  const a = PATH[low];
  const b = PATH[high];
  return mix(a.x, b.x, clamp((a.z - z) / Math.max(0.00001, a.z - b.z)));
}

function naturalHeight(x: number, z: number): number {
  const along = 29 + clamp((74 - z) / 190) * 36;
  const inland = Math.pow(Math.max(0, (-x - 20) / 95), 1.25) * 80;
  // A real volume hides the river initially; it is not a camera-facing panel.
  const shoulder = Math.exp(-(((x - 15) / 22) ** 2 + ((z - 30) / 33) ** 2)) * 28;
  const nearBank = along + inland + shoulder + terrainGrain(x, z) * (x > 20 ? 3.1 : 2.1);
  if (x < 84) {
    // The high trail sits on a narrow, steep-sided shelf. A broad eased bowl
    // would hide the river behind the near slope even after clearing the rock
    // shoulder; let the cliff descend promptly beyond the walking terrace.
    const initialShelf = 12 + clamp((-z - 15) / 76) * 10;
    // Leave the early rock shoulder intact. Beyond it, the gorge-side edge
    // follows two metres outside the walking centreline rather than leaving
    // a broad shelf that would hide the river through most of the reveal.
    // Blend over 24 m of travel to avoid introducing a transverse rock step.
    const opening = smooth((-z - 8) / 24);
    const cliffStart = mix(initialShelf, trailXAtZ(z) + 2, opening);
    const descent = clamp((x - cliffStart) / (84 - cliffStart));
    const drop = 1 - Math.pow(1 - descent, 3.1);
    return mix(nearBank, -78 + terrainGrain(x, z) * 1.2, drop);
  }
  if (x < 125) return -78 + terrainGrain(x, z) * 0.8;
  const farRise = Math.pow(clamp((x - 125) / 78), 0.77);
  const farCrest = 205 + 29 * Math.sin(z * 0.024) + 15 * Math.sin(z * 0.063 + 1.6);
  return -77 + farRise * farCrest + terrainGrain(x, z) * (3 + farRise * 6);
}

/**
 * Ground is gently graded into the authored trail. All walkers, road ribbons
 * and props use this function so their feet and bases share one surface.
 */
export function groundHeight(x: number, z: number): number {
  const base = naturalHeight(x, z);
  if (x < -47 || x > 32 || z < -103 || z > 86) return base;
  let nearestSquared = Infinity;
  let trailY = base;
  let trailX = x;
  for (let index = 0; index < PATH.length - 1; index += 1) {
    const a = PATH[index];
    const b = PATH[index + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const t = clamp(((x - a.x) * dx + (z - a.z) * dz) / Math.max(0.000001, dx * dx + dz * dz));
    const squared = (x - mix(a.x, b.x, t)) ** 2 + (z - mix(a.z, b.z, t)) ** 2;
    if (squared < nearestSquared) {
      nearestSquared = squared;
      trailY = mix(a.y, b.y, t);
      trailX = mix(a.x, b.x, t);
    }
  }
  const distance = Math.sqrt(nearestSquared);
  // The uphill ground can grade gradually; the gorge side must retain its
  // narrow ledge rather than becoming a wide, artificial viewing platform.
  const blendWidth = x > trailX ? 3.5 : 7.5;
  return mix(trailY, base, smooth((distance - 1.75) / blendWidth));
}
