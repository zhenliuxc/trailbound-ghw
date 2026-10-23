type Point = { x: number; y: number };
export type VisualRoutePoint = readonly [x: number, y: number, elevation?: number | null];
interface Knot extends Point { progress: number; elevation: number | null }
interface ArcStep { t: number; distance: number }
interface Segment {
  start: Knot;
  end: Knot;
  controlA: Point;
  controlB: Point;
  startDistance: number;
  length: number;
  arc: ArcStep[];
  command: string;
}
export interface VisualRouteSample extends Point {
  elevation: number | null;
  /** Direction on the curve, in SVG coordinates and radians. */
  heading: number;
  tangentX: number;
  tangentY: number;
}
export interface VisualRouteOptions {
  points: readonly VisualRoutePoint[];
  /** Original cumulative route distance divided by its total distance. */
  progress: readonly number[];
  anchors?: readonly number[];
  tolerance?: number;
  cornerRadius?: number;
}
export interface VisualRoute {
  path: string;
  length: number;
  /** Curve samples for renderers that accept a polyline. */
  points: readonly VisualRoutePoint[];
  progress: readonly number[];
  sample(progress: number): VisualRouteSample;
  pathUntil(progress: number): string;
  heading(progress: number, lookAhead?: number): number;
}

const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);
const mix = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const coordinate = (point: Point) => `${point.x.toFixed(3)},${point.y.toFixed(3)}`;
const command = (a: Point, b: Point, end: Point) => `C${coordinate(a)} ${coordinate(b)} ${coordinate(end)}`;

function sourceAt(source: readonly Knot[], progress: number): Knot {
  const first = source[0], last = source[source.length - 1];
  if (progress <= first.progress) return { ...first, progress };
  if (progress >= last.progress) return { ...last, progress };
  let low = 1, high = source.length - 1;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (source[middle].progress < progress) low = middle + 1;
    else high = middle;
  }
  const a = source[low - 1], b = source[low], t = (progress - a.progress) / (b.progress - a.progress);
  return { ...mix(a, b, t), progress, elevation: a.elevation === null || b.elevation === null ? null : a.elevation + (b.elevation - a.elevation) * t };
}

function simplify(source: readonly Knot[], anchors: readonly number[], tolerance: number): Knot[] {
  const protectedProgress = new Set([0, 1, ...anchors.map(value => clamp(value, 0, 1))]);
  const merged = new Map(source.map(point => [point.progress, point]));
  for (const progress of protectedProgress) merged.set(progress, sourceAt(source, progress));
  const points = [...merged.values()].sort((a, b) => a.progress - b.progress);
  const protectedIndices = points.flatMap((point, index) => protectedProgress.has(point.progress) ? [index] : []);
  const keep = new Set(protectedIndices), stack: [number, number][] = [];
  for (let i = 1; i < protectedIndices.length; i++) stack.push([protectedIndices[i - 1], protectedIndices[i]]);
  while (stack.length) {
    const range = stack.pop();
    if (!range) break;
    const [start, end] = range, a = points[start], b = points[end];
    const dx = b.x - a.x, dy = b.y - a.y, squaredLength = dx * dx + dy * dy;
    let greatest = tolerance * tolerance, furthest = -1;
    for (let i = start + 1; i < end; i++) {
      const point = points[i], t = squaredLength ? clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / squaredLength, 0, 1) : 0;
      const squaredDistance = (point.x - a.x - t * dx) ** 2 + (point.y - a.y - t * dy) ** 2;
      if (squaredDistance > greatest) { greatest = squaredDistance; furthest = i; }
    }
    if (furthest >= 0) { keep.add(furthest); stack.push([start, furthest], [furthest, end]); }
  }
  return points.filter((_, index) => keep.has(index));
}

/** Coordinate-wise monotone slopes keep each cubic inside its segment bounds. */
function tangent(points: readonly Knot[], index: number): Point {
  const point = points[index], before = points[Math.max(0, index - 1)], after = points[Math.min(points.length - 1, index + 1)];
  const incomingLength = distance(before, point), outgoingLength = distance(point, after);
  if (!incomingLength) return outgoingLength ? { x: (after.x - point.x) / outgoingLength, y: (after.y - point.y) / outgoingLength } : { x: 0, y: 0 };
  if (!outgoingLength) return { x: (point.x - before.x) / incomingLength, y: (point.y - before.y) / incomingLength };
  const slope = (axis: 'x' | 'y') => {
    const incoming = (point[axis] - before[axis]) / incomingLength, outgoing = (after[axis] - point[axis]) / outgoingLength;
    return incoming * outgoing > 0 ? 2 * incoming * outgoing / (incoming + outgoing) : 0;
  };
  return { x: slope('x'), y: slope('y') };
}

function curveAt(segment: Segment, t: number): Point {
  const u = 1 - t;
  return {
    x: u ** 3 * segment.start.x + 3 * u * u * t * segment.controlA.x + 3 * u * t * t * segment.controlB.x + t ** 3 * segment.end.x,
    y: u ** 3 * segment.start.y + 3 * u * u * t * segment.controlA.y + 3 * u * t * t * segment.controlB.y + t ** 3 * segment.end.y,
  };
}

function curveTangent(segment: Segment, t: number): Point {
  const u = 1 - t;
  const x = 3 * u * u * (segment.controlA.x - segment.start.x) + 6 * u * t * (segment.controlB.x - segment.controlA.x) + 3 * t * t * (segment.end.x - segment.controlB.x);
  const y = 3 * u * u * (segment.controlA.y - segment.start.y) + 6 * u * t * (segment.controlB.y - segment.controlA.y) + 3 * t * t * (segment.end.y - segment.controlB.y);
  const magnitude = Math.hypot(x, y);
  if (magnitude > 1e-8) return { x: x / magnitude, y: y / magnitude };
  const chord = distance(segment.start, segment.end);
  return chord ? { x: (segment.end.x - segment.start.x) / chord, y: (segment.end.y - segment.start.y) / chord } : { x: 1, y: 0 };
}

function tAtDistance(segment: Segment, value: number): number {
  if (!segment.length) return 0;
  const target = clamp(value, 0, segment.length);
  let low = 1, high = segment.arc.length - 1;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (segment.arc[middle].distance < target) low = middle + 1;
    else high = middle;
  }
  const a = segment.arc[low - 1], b = segment.arc[low], fraction = (target - a.distance) / (b.distance - a.distance || 1);
  return a.t + (b.t - a.t) * fraction;
}

/** Build once per projection; route state keeps its original progress and events. */
export function createVisualRoute(options: VisualRouteOptions): VisualRoute {
  const source: Knot[] = [];
  if (!options.points.length || options.points.length !== options.progress.length) throw new RangeError('A visual route needs matching points and progress.');
  for (const [index, point] of options.points.entries()) {
    const progress = options.progress[index], previous = source[source.length - 1];
    if (!Number.isFinite(point[0]) || !Number.isFinite(point[1]) || !Number.isFinite(progress) || progress < 0 || progress > 1 || (previous && progress < previous.progress)) throw new RangeError('Visual route coordinates and ordered progress must be finite.');
    const knot = { x: point[0], y: point[1], progress, elevation: typeof point[2] === 'number' && Number.isFinite(point[2]) ? point[2] : null };
    if (previous?.progress === progress) source[source.length - 1] = knot;
    else source.push(knot);
  }
  const anchors = (options.anchors ?? []).filter(Number.isFinite);
  const knots = simplify(source, anchors, Math.max(0, options.tolerance ?? 8));
  const tangents = knots.map((_, index) => tangent(knots, index)), segments: Segment[] = [];
  const sampledPoints: VisualRoutePoint[] = [], sampledProgress: number[] = [];
  const first = knots[0], move = `M${coordinate(first)}`, prefixes = [move];
  let length = 0;
  sampledPoints.push([first.x, first.y, sourceAt(source, 0).elevation]); sampledProgress.push(0);
  for (let i = 1; i < knots.length; i++) {
    const start = knots[i - 1], end = knots[i], span = distance(start, end), handle = Math.min(Math.max(0, options.cornerRadius ?? 12), span / 3);
    const control = (point: Point, direction: Point, sign: number): Point => {
      const scale = handle / Math.max(1, Math.hypot(direction.x, direction.y));
      return { x: clamp(point.x + sign * direction.x * scale, Math.min(start.x, end.x), Math.max(start.x, end.x)), y: clamp(point.y + sign * direction.y * scale, Math.min(start.y, end.y), Math.max(start.y, end.y)) };
    };
    const controlA = control(start, tangents[i - 1], 1), controlB = control(end, tangents[i], -1);
    const segment: Segment = { start, end, controlA, controlB, startDistance: length, length: 0, arc: [{ t: 0, distance: 0 }], command: command(controlA, controlB, end) };
    const steps = Math.max(6, Math.ceil(span / 3));
    let previous: Point = start;
    for (let step = 1; step <= steps; step++) {
      const t = step / steps, point = curveAt(segment, t);
      segment.length += distance(previous, point);
      segment.arc.push({ t, distance: segment.length }); previous = point;
    }
    for (const step of segment.arc.slice(1)) {
      const point = curveAt(segment, step.t), fraction = segment.length ? step.distance / segment.length : step.t;
      const progress = start.progress + (end.progress - start.progress) * fraction;
      sampledPoints.push([point.x, point.y, sourceAt(source, progress).elevation]); sampledProgress.push(progress);
    }
    length += segment.length; segments.push(segment); prefixes.push(`${prefixes[prefixes.length - 1]} ${segment.command}`);
  }
  function atProgress(progress: number) {
    const value = clamp(progress, 0, 1);
    let low = 0, high = segments.length - 1;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (segments[middle].end.progress < value) low = middle + 1;
      else high = middle;
    }
    const segment = segments[low], fraction = (value - segment.start.progress) / (segment.end.progress - segment.start.progress);
    const travelled = clamp(fraction, 0, 1) * segment.length;
    return { index: low, segment, t: tAtDistance(segment, travelled), distance: segment.startDistance + travelled };
  }
  function atDistance(value: number): Point {
    const target = clamp(value, 0, length);
    let low = 0, high = segments.length - 1;
    while (low < high) {
      const middle = (low + high) >>> 1, segment = segments[middle];
      if (segment.startDistance + segment.length < target) low = middle + 1;
      else high = middle;
    }
    const segment = segments[low];
    return curveAt(segment, tAtDistance(segment, target - segment.startDistance));
  }
  return {
    path: prefixes[prefixes.length - 1], length, points: sampledPoints, progress: sampledProgress,
    sample(progress) {
      const current = atProgress(progress), point = curveAt(current.segment, current.t), tangent = curveTangent(current.segment, current.t);
      return { ...point, elevation: sourceAt(source, clamp(progress, 0, 1)).elevation, heading: Math.atan2(tangent.y, tangent.x), tangentX: tangent.x, tangentY: tangent.y };
    },
    pathUntil(progress) {
      if (progress >= 1) return prefixes[prefixes.length - 1];
      if (progress <= 0) return move;
      const { index, segment, t } = atProgress(progress);
      const a = mix(segment.start, segment.controlA, t), b = mix(segment.controlA, segment.controlB, t), c = mix(segment.controlB, segment.end, t);
      const ab = mix(a, b, t), bc = mix(b, c, t);
      return `${prefixes[index]} ${command(a, ab, mix(ab, bc, t))}`;
    },
    heading(progress, lookAhead = 28) {
      const current = atProgress(progress), window = Math.max(1, lookAhead);
      const end = Math.min(length, current.distance + window), start = Math.max(0, Math.min(current.distance, length - window));
      const a = atDistance(start), b = atDistance(end);
      if (distance(a, b) > .01) return Math.atan2(b.y - a.y, b.x - a.x);
      const tangent = curveTangent(current.segment, current.t);
      return Math.atan2(tangent.y, tangent.x);
    },
  };
}
