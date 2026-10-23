import { createVisualRoute, type VisualRoute, type VisualRoutePoint } from './visual-route';
import type { MapView } from './map-viewport';

// These are composition coordinates. Original route progress, photographs and events stay authoritative.
const knots = [
  { progress: 0, x: 118, y: 462 },
  { progress: .08, x: 180, y: 434 },
  { progress: .16, x: 174, y: 377 },
  { progress: .25, x: 285, y: 335 },
  { progress: .38, x: 358, y: 350 },
  { progress: .5, x: 434, y: 278 },
  { progress: .64, x: 502, y: 280 },
  { progress: .78, x: 557, y: 224 },
  { progress: .88, x: 542, y: 175 },
  { progress: 1, x: 598, y: 126 },
];

export function createWugongOverviewRoute(bounds: MapView = { x: 0, y: 0, w: 720, h: 600 }): VisualRoute {
  const points: VisualRoutePoint[] = knots.map(knot => [
    bounds.x + bounds.w * knot.x / 720,
    bounds.y + bounds.h * knot.y / 600,
  ]);
  return createVisualRoute({
    points,
    progress: knots.map(knot => knot.progress),
    anchors: [0, .25, .5, 1],
    tolerance: 0,
    cornerRadius: 26,
  });
}

export type WugongWaypointKind = 'start' | 'meadow' | 'clouds' | 'end';
export interface WugongWaypoint {
  kind: WugongWaypointKind;
  name: string;
  fraction: number;
  stateId: string;
  checkpointId: string | null;
}

export const WUGONG_WAYPOINTS: readonly WugongWaypoint[] = [
  { kind: 'start', name: '中庵 · 起点', fraction: 0, stateId: 'wugong-start', checkpointId: null },
  { kind: 'meadow', name: '山脊草甸', fraction: .25, stateId: 'wugong-meadow', checkpointId: 'wugong-meadow' },
  { kind: 'clouds', name: '云海观景', fraction: .5, stateId: 'wugong-clouds', checkpointId: 'wugong-clouds' },
  { kind: 'end', name: '金顶 · 终点', fraction: 1, stateId: 'wugong-end', checkpointId: 'wugong-golden' },
];
