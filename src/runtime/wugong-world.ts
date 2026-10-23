import { createVisualRoute } from './visual-route';
import type { VisualRoute, VisualRoutePoint, VisualRouteSample } from './visual-route';
import type { MapView } from './map-viewport';

export const WUGONG_BOUNDS: Readonly<MapView> = Object.freeze({ x: 0, y: 0, w: 3600, h: 900 });

export interface WugongPathKnot {
  readonly progress: number;
  readonly x: number;
  readonly y: number;
  /** Illustrative ascent in world units, not surveyed metres. */
  readonly elevation: number;
}

export const WUGONG_PATH_KNOTS: readonly WugongPathKnot[] = [
  { progress: 0, x: 170, y: 705, elevation: 0 },
  { progress: .06, x: 420, y: 670, elevation: 42 },
  { progress: .12, x: 560, y: 580, elevation: 105 },
  { progress: .19, x: 880, y: 610, elevation: 168 },
  { progress: .25, x: 1170, y: 535, elevation: 204 },
  { progress: .34, x: 1540, y: 580, elevation: 251 },
  { progress: .5, x: 2050, y: 450, elevation: 353 },
  { progress: .62, x: 2390, y: 520, elevation: 408 },
  { progress: .78, x: 2770, y: 390, elevation: 502 },
  { progress: .9, x: 3100, y: 430, elevation: 565 },
  { progress: 1, x: 3450, y: 315, elevation: 640 },
];

export type WugongPhaseId = 'forest' | 'climb' | 'meadow' | 'ridge' | 'summit';

export interface WugongPhaseDefinition {
  readonly id: WugongPhaseId;
  readonly title: string;
  readonly start: number;
  readonly end: number;
  /** Art-directed climbing effort, from level ground (0) to steep ground (1). */
  readonly slope: number;
}

const summitPhase: WugongPhaseDefinition = { id: 'summit', title: '金顶山巅', start: .88, end: 1, slope: .72 };

export const WUGONG_PHASES: readonly WugongPhaseDefinition[] = [
  { id: 'forest', title: '林间起步', start: 0, end: .12, slope: .3 },
  { id: 'climb', title: '石阶上坡', start: .12, end: .24, slope: .92 },
  { id: 'meadow', title: '草甸舒展', start: .24, end: .48, slope: .2 },
  { id: 'ridge', title: '山脊云海', start: .48, end: .88, slope: .48 },
  summitPhase,
];

export interface WugongPhase extends WugongPhaseDefinition {
  readonly cloudReveal: number;
  readonly leanDegrees: number;
  readonly strideScale: number;
}

interface WugongStopSite {
  readonly title: string;
  readonly fraction: number;
  readonly radius: number;
}

export type WugongStop = WugongStopSite & (
  | { readonly id: 'camp'; readonly kind: 'resting'; readonly actions: readonly ['rest'] }
  | { readonly id: 'view-rock'; readonly kind: 'viewpoint'; readonly actions: readonly ['cloudsea', 'photo', 'sketch'] }
  | { readonly id: 'summit'; readonly kind: 'summit'; readonly actions: readonly ['summit'] }
);

export type WugongStopAction = WugongStop['actions'][number];

export const WUGONG_STOPS: readonly WugongStop[] = [
  { id: 'camp', title: '草甸营地', fraction: .34, radius: .025, kind: 'resting', actions: ['rest'] },
  { id: 'view-rock', title: '云海观景石', fraction: .55, radius: .028, kind: 'viewpoint', actions: ['cloudsea', 'photo', 'sketch'] },
  { id: 'summit', title: '金顶停一停', fraction: .97, radius: .03, kind: 'summit', actions: ['summit'] },
];

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));

function smoothstep(start: number, end: number, value: number): number {
  const t = clamp((value - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
}

/** The application supplies its existing route progress; this curve only changes its drawing. */
export function createWugongRoute(): VisualRoute {
  const points: VisualRoutePoint[] = WUGONG_PATH_KNOTS.map(knot => [knot.x, knot.y, knot.elevation]);
  const progress = WUGONG_PATH_KNOTS.map(knot => knot.progress);
  return createVisualRoute({ points, progress, anchors: progress, tolerance: 0, cornerRadius: 90 });
}

export function wugongPhase(progress: number): WugongPhase {
  const p = clamp(progress, 0, 1);
  let phase = summitPhase;
  let previous = WUGONG_PHASES[0];
  for (const candidate of WUGONG_PHASES) {
    if (p < candidate.end) {
      phase = candidate;
      break;
    }
    previous = candidate;
  }
  const blend = smoothstep(phase.start, phase.start + .025, p);
  const slope = previous.slope + (phase.slope - previous.slope) * blend;
  return {
    ...phase,
    slope,
    cloudReveal: smoothstep(.46, .58, p),
    leanDegrees: 1.5 + slope * 5.5,
    strideScale: 1 - slope * .22,
  };
}

/** A target crop without a clock or gait offset. The application owns camera easing. */
export function wugongViewport(width: number, height: number, progress: number, point: Pick<VisualRouteSample, 'x' | 'y'>): MapView {
  const screenWidth = Number.isFinite(width) && width > 0 ? width : 720;
  const screenHeight = Number.isFinite(height) && height > 0 ? height : 480;
  const ratio = screenWidth / screenHeight;
  const w = screenWidth >= 900 ? clamp(screenWidth * .82, 900, 1250) : clamp(screenWidth * 1.12, 430, 600);
  const h = w / ratio;
  const reveal = smoothstep(.46, .58, clamp(progress, 0, 1));
  const minX = WUGONG_BOUNDS.x - 160;
  const maxX = WUGONG_BOUNDS.x + WUGONG_BOUNDS.w + 160 - w;
  const minY = WUGONG_BOUNDS.y - 100;
  const maxY = WUGONG_BOUNDS.y + WUGONG_BOUNDS.h + 100 - h;
  return {
    x: clamp(point.x + 80 - w / 2, minX, maxX),
    y: maxY < minY ? (minY + maxY) / 2 : clamp(point.y - h * (.58 + reveal * .04), minY, maxY),
    w,
    h,
  };
}

/** At most one contextual stop appears; entering its range does not collect anything. */
export function wugongNearby(progress: number): WugongStop | null {
  const p = clamp(progress, 0, 1);
  let nearest: WugongStop | null = null;
  let shortest = Infinity;
  for (const stop of WUGONG_STOPS) {
    const distance = Math.abs(p - stop.fraction);
    if (distance <= stop.radius + Number.EPSILON && distance < shortest) {
      nearest = stop;
      shortest = distance;
    }
  }
  return nearest;
}
