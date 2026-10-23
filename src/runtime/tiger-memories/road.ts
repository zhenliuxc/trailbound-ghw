import { clamp, distance, type Point, type RoadPhase } from './model';
import { curve } from '../../journey/geometry';

/** A single S follows the two broad bends already painted into the mountain. */
export const ROAD_POINTS = curve([[178, 479], [252, 461], [331, 436], [398, 416], [430, 395], [399, 380], [332, 365], [255, 347], [180, 328], [130, 307], [127, 289], [193, 273], [299, 256], [388, 233]].map(([x, y]) => ({ x: x * 1000 / 724, y: y * 750 / 543 })), 8);
const lengths = [0];
for (let i = 1; i < ROAD_POINTS.length; i++) lengths.push(lengths[i - 1] + distance(ROAD_POINTS[i - 1], ROAD_POINTS[i]));
export const ROAD_LENGTH = lengths[lengths.length - 1];
export const ROAD_STATIONS = ROAD_POINTS.map((point, i) => ({ point, progress: lengths[i] / ROAD_LENGTH }));
const TURN_DISTANCES = [lengths[4 * 8], lengths[10 * 8]];
const WALK_SPEED = ROAD_LENGTH / 8.6;
const TURN_PAUSE = .32;
export const ROAD_WALK_SECONDS = ROAD_LENGTH / WALK_SPEED + TURN_PAUSE * TURN_DISTANCES.length;
export const ROAD_RIVER_SECONDS = 4.8;
export const roadWalk = (phase: RoadPhase): number => phase.kind === 'walking' ? phase.progress : phase.kind === 'river' ? 1 : 0;

export function roadAt(progress: number): Point & { heading: number } {
  const at = clamp(progress, 0, 1) * ROAD_LENGTH; let i = 1;
  while (i < lengths.length - 1 && lengths[i] < at) i++;
  const a = ROAD_POINTS[i - 1], b = ROAD_POINTS[i], t = (at - lengths[i - 1]) / Math.max(.001, lengths[i] - lengths[i - 1]);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, heading: Math.atan2(b.y - a.y, b.x - a.x) };
}
export function roadWalkingProgress(elapsed: number): number {
  let stopped = 0;
  for (const turn of TURN_DISTANCES) {
    const arrive = turn / WALK_SPEED + stopped;
    if (elapsed < arrive) break;
    if (elapsed < arrive + TURN_PAUSE) return turn / ROAD_LENGTH;
    stopped += TURN_PAUSE;
  }
  return clamp((elapsed - stopped) * WALK_SPEED / ROAD_LENGTH, 0, 1);
}

/** Project only onto the nearby, not-yet-drawn part. Crossing the S cannot skip it. */
export function traceRoad(progress: number, from: Point, to: Point, tolerance: number): { progress: number; connected: boolean } {
  const count = Math.max(1, Math.min(256, Math.ceil(distance(from, to) / 8)));
  for (let sample = 1; sample <= count; sample++) {
    const at = { x: from.x + (to.x - from.x) * sample / count, y: from.y + (to.y - from.y) * sample / count };
    const low = Math.max(0, progress * ROAD_LENGTH - tolerance), high = Math.min(ROAD_LENGTH, progress * ROAD_LENGTH + 22);
    let nearest = Infinity, next = progress;
    for (let i = 1; i < ROAD_POINTS.length; i++) {
      if (lengths[i] < low || lengths[i - 1] > high) continue;
      const a = ROAD_POINTS[i - 1], b = ROAD_POINTS[i], len = lengths[i] - lengths[i - 1];
      const t = clamp(((at.x - a.x) * (b.x - a.x) + (at.y - a.y) * (b.y - a.y)) / Math.max(.001, len * len), clamp((low - lengths[i - 1]) / Math.max(.001, len), 0, 1), clamp((high - lengths[i - 1]) / Math.max(.001, len), 0, 1));
      const d = distance(at, { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      if (d < nearest) { nearest = d; next = Math.max(progress, (lengths[i - 1] + t * len) / ROAD_LENGTH); }
    }
    if (nearest > tolerance) return { progress, connected: false };
    progress = next;
  }
  return { progress, connected: true };
}
