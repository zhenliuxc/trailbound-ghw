import { GaitPlanner } from './gait';

export interface Point { x: number; y: number }
export interface WorldPoint { x: number; z: number }
export interface SurfaceContact {
  readonly travel: number; readonly side: -1 | 1;
  readonly world: Readonly<WorldPoint>; readonly point: Readonly<Point>;
  readonly heading: number; readonly soleAngle: number;
}
export type VisitId = 'slope' | 'meadow' | 'camp' | 'horse' | 'summit' | 'end';
export type WalkSection = 'forest' | 'ridge';
export interface TrailStop { readonly id: VisitId; readonly point: Point; readonly travel: number }
export interface GroundRibbon { readonly points: readonly Point[]; readonly depth: number; readonly kind: 'active' | 'step' }
export interface TerrainData {
  columns: number; rows: number;
  xMin: number; xMax: number; zMin: number; zMax: number;
  heights: readonly number[]; horizon: readonly number[];
}

export const SCENE = { width: 1520, height: 860 };
export const HIKER_SCALE = .62;
export const clamp = (value: number, low = 0, high = 1): number => Math.max(low, Math.min(high, value));
export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
export const smooth = (value: number): number => { const t = clamp(value); return t * t * (3 - 2 * t); };
export const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

export function parseTerrain(value: unknown): TerrainData {
  if (typeof value !== 'object' || value === null || !('version' in value) || value.version !== 1 ||
    !('columns' in value) || typeof value.columns !== 'number' || !Number.isInteger(value.columns) || value.columns < 2 || value.columns > 600 ||
    !('rows' in value) || typeof value.rows !== 'number' || !Number.isInteger(value.rows) || value.rows < 2 || value.rows > 700 ||
    !('xMin' in value) || typeof value.xMin !== 'number' || !Number.isFinite(value.xMin) ||
    !('xMax' in value) || typeof value.xMax !== 'number' || !Number.isFinite(value.xMax) || value.xMax <= value.xMin ||
    !('zMin' in value) || typeof value.zMin !== 'number' || !Number.isFinite(value.zMin) ||
    !('zMax' in value) || typeof value.zMax !== 'number' || !Number.isFinite(value.zMax) || value.zMax <= value.zMin ||
    !('heights' in value) || !Array.isArray(value.heights) || value.heights.length !== value.columns * value.rows ||
    !('horizon' in value) || !Array.isArray(value.horizon) || value.horizon.length !== value.columns) {
    throw new Error('武功山地形数据格式不完整');
  }
  const heights: number[] = [], horizon: number[] = [];
  for (const height of value.heights) {
    if (typeof height !== 'number' || !Number.isFinite(height) || height < -500 || height > 9000) throw new Error('山体高程数据无法读取');
    heights.push(height);
  }
  for (const depth of value.horizon) {
    if (typeof depth !== 'number' || !Number.isFinite(depth) || depth < value.zMin || depth > value.zMax) throw new Error('山脊边界数据无法读取');
    horizon.push(depth);
  }
  return { columns: value.columns, rows: value.rows, xMin: value.xMin, xMax: value.xMax, zMin: value.zMin, zMax: value.zMax, heights, horizon };
}

function scenicTerrain(source: TerrainData): TerrainData {
  const heights = source.heights.map((value, index) => {
    const x = source.xMin + (index % source.columns) / (source.columns - 1) * (source.xMax - source.xMin);
    const z = source.zMin + Math.floor(index / source.columns) / (source.rows - 1) * (source.zMax - source.zMin);
    const focus = smooth((x + .63) / .13) * (1 - smooth((x - .46) / .10));
    const hill = (center: number, width: number, amount: number) => amount * Math.exp(-(((x - center) / width) ** 2));
    const relief = hill(-.48, .09, -42) + hill(-.24, .12, 46) + hill(.035, .095, -68) + hill(.27, .075, 34) + hill(.405, .065, -52);
    return value + relief * focus * Math.exp(-(((z + .74) / .43) ** 2));
  });
  const horizon = source.horizon.map((edge, column) => {
    const x = source.xMin + column / (source.columns - 1) * (source.xMax - source.xMin);
    if (x < -.63 || x > .56) return edge;
    let highest = -Infinity, bestZ = edge + .075;
    for (let row = 0; row < source.rows; row++) {
      const z = source.zMin + row / (source.rows - 1) * (source.zMax - source.zMin);
      if (z < -.9 || z > .1) continue;
      const h = heights[row * source.columns + column];
      if (h > highest) { highest = h; bestZ = z; }
    }
    return bestZ - .075;
  });
  return { ...source, heights, horizon };
}

export function createLandscape(source: TerrainData) {
  const data = scenicTerrain(source);
  function horizontalScale(x: number): number { return 1 + .65 * clamp((x + .63) / .18); }
  function spreadX(x: number): number {
    const u = Math.max(0, x + .63);
    return x + .65 * (u < .18 ? u * u / .36 : u - .09);
  }
  function metres(x: number, z: number): number {
    const u = clamp((x - data.xMin) / (data.xMax - data.xMin)) * (data.columns - 1);
    const v = clamp((z - data.zMin) / (data.zMax - data.zMin)) * (data.rows - 1);
    const i = Math.floor(u), j = Math.floor(v), i1 = Math.min(i + 1, data.columns - 1), j1 = Math.min(j + 1, data.rows - 1);
    return mix(mix(data.heights[j * data.columns + i], data.heights[j * data.columns + i1], u - i),
      mix(data.heights[j1 * data.columns + i], data.heights[j1 * data.columns + i1], u - i), v - j);
  }
  function height(x: number, z: number): number { return (metres(x, z) - 150) / 1000; }
  function project({ x, z }: WorldPoint): Point {
    return { x: 590 + (spreadX(x) * .975 + z * .222) * 338, y: 115 + .76 * (595 + (z * .975 - x * .222) * 173 - height(x, z) * 272) };
  }
  function crest(x: number): WorldPoint {
    let bestZ = -.9, highest = -Infinity;
    for (let i = 0; i <= 160; i++) {
      const z = -.9 + i / 160;
      const h = height(x, z);
      if (h > highest) { highest = h; bestZ = z; }
    }
    return { x, z: bestZ + .025 };
  }
  function onSurface(point: WorldPoint): WorldPoint {
    const x = clamp(point.x, data.xMin, data.xMax);
    const u = (x - data.xMin) / (data.xMax - data.xMin) * (data.columns - 1), i = Math.floor(u);
    const edge = mix(data.horizon[i], data.horizon[Math.min(i + 1, data.columns - 1)], u - i);
    return { x, z: clamp(Math.max(point.z, edge + .018), data.zMin, data.zMax) };
  }
  return { data, metres, height, project, crest, onSurface, horizontalScale };
}
export type Landscape = ReturnType<typeof createLandscape>;

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

function switchbacks(a: Point, b: Point, turns: number, breadth: number): Point[] {
  const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
  const points: Point[] = [];
  for (let i = 0; i <= turns; i++) {
    const t = i / turns, shift = breadth * (i % 2 ? 1 : -1) * Math.sin(Math.PI * t);
    points.push({ x: mix(a.x, b.x, t) - dy / length * shift, y: mix(a.y, b.y, t) + dx / length * shift });
  }
  return points;
}

export function createTrail(landscape: Landscape) {
  const ridge = (x: number): WorldPoint => { const p = landscape.crest(x); return { x, z: p.z + .035 }; };
  const startWorld = { x: -1.49, z: .94 }, slopeWorld = ridge(-1.02), campWorld = ridge(-.63);
  const seatWorld = { x: campWorld.x + .026, z: campWorld.z + .035 };
  function groundCurve(knots: readonly WorldPoint[]): WorldPoint[] {
    const rounded = curve(knots.map(p => ({ x: p.x, y: p.z })), 18);
    const result: WorldPoint[] = [];
    for (let i = 0; i < rounded.length - 1; i++) {
      const a = rounded[i], b = rounded[i + 1], count = Math.max(1, Math.ceil(distance(a, b) / .004));
      for (let j = 0; j < count; j++) result.push(landscape.onSurface({ x: mix(a.x, b.x, j / count), z: mix(a.y, b.y, j / count) }));
    }
    const last = rounded[rounded.length - 1]; result.push(landscape.onSurface({ x: last.x, z: last.y }));
    return result;
  }
  const approach = switchbacks({ x: startWorld.x, y: startWorld.z }, { x: slopeWorld.x, y: slopeWorld.z }, 9, .075).map(p => ({ x: p.x, z: p.y }));
  const approachWorld = groundCurve([...approach, ridge(-.96), ridge(-.89), ridge(-.82), ridge(-.75), ridge(-.68), campWorld, seatWorld]);
  const ridgeWorld = groundCurve([seatWorld, ...[-.55, -.48, -.40, -.34, -.22, -.12, .02, .14, .23, .30, .38, .43, .55].map(ridge)]);
  const endWorld = { x: .50, z: 2.1 };
  const descentWorld = groundCurve([ridge(.55), { x: .67, z: -.11 }, { x: .78, z: .18 }, { x: .81, z: .50 }, { x: .74, z: .86 }, { x: .62, z: 1.2 }, { x: .58, z: 1.65 }, endWorld]);
  const world = [...approachWorld, ...ridgeWorld.slice(1), ...descentWorld.slice(1)];
  const points = world.map(landscape.project);
  const start = points[0], slope = landscape.project(slopeWorld), camp = landscape.project(campWorld), seat = landscape.project(seatWorld);
  const meadow = landscape.project(ridge(-.82));
  const horse = landscape.project(ridge(.14)), summit = landscape.project(ridge(.55)), end = landscape.project(endWorld);
  const lengths = [0];
  for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + distance(points[i - 1], points[i]));
  const length = lengths[lengths.length - 1];
  function bracket(travel: number): { low: number; high: number; t: number } {
    const d = clamp(travel, 0, length);
    let low = 0, high = lengths.length - 1;
    while (low + 1 < high) { const mid = (low + high) >> 1; if (lengths[mid] < d) low = mid; else high = mid; }
    const t = (d - lengths[low]) / Math.max(.001, lengths[high] - lengths[low]);
    return { low, high, t };
  }
  function sampleWorld(travel: number): WorldPoint {
    const { low, high, t } = bracket(travel);
    return { x: mix(world[low].x, world[high].x, t), z: mix(world[low].z, world[high].z, t) };
  }
  const sample = (travel: number): Point => landscape.project(sampleWorld(travel));
  function gradeAt(travel: number): number {
    const a = sampleWorld(travel - 5), b = sampleWorld(travel + 5);
    const metres = Math.hypot((b.x - a.x) * 3780, (b.z - a.z) * 3515);
    return clamp((landscape.metres(b.x, b.z) - landscape.metres(a.x, a.z)) / Math.max(1, metres), -.65, .85);
  }
  function nearest(point: Point): { travel: number; gap: number } {
    let travel = 0, gap = Infinity;
    for (let i = 0; i < points.length; i++) { const delta = distance(points[i], point); if (delta < gap) { gap = delta; travel = lengths[i]; } }
    return { travel, gap };
  }
  const campTravel = lengths[approachWorld.length - 1];
  const summitTravel = lengths[approachWorld.length + ridgeWorld.length - 2];
  const stops: readonly TrailStop[] = [{ id: 'slope', point: slope, travel: nearest(slope).travel }, { id: 'meadow', point: meadow, travel: nearest(meadow).travel }, { id: 'camp', point: seat, travel: campTravel }, { id: 'horse', point: horse, travel: nearest(horse).travel }, { id: 'summit', point: summit, travel: summitTravel }, { id: 'end', point: end, travel: length }];
  const ribbons: GroundRibbon[] = [];
  function ribbon(corners: readonly WorldPoint[], kind: GroundRibbon['kind']): void {
    const surface = corners.map(landscape.onSurface);
    ribbons.push({ points: surface.map(landscape.project), depth: Math.max(...surface.map(p => p.z * .975 - p.x * .222)), kind });
  }
  function road(path: readonly WorldPoint[]): void {
    for (let i = 1; i < path.length; i++) ribbon([path[i - 1], path[i]], 'active');
  }
  road(world);
  for (let d = 20; d < stops[0].travel - 8; d += 10) {
    const a = sampleWorld(d - .35), b = sampleWorld(d + .35), l = Math.max(.0001, Math.hypot(b.x - a.x, b.z - a.z));
    const dx = -(b.z - a.z) / l * .008, dz = (b.x - a.x) / l * .008;
    ribbon([{ x: a.x + dx, z: a.z + dz }, { x: b.x + dx, z: b.z + dz }, { x: b.x - dx, z: b.z - dz }, { x: a.x - dx, z: a.z - dz }], 'step');
  }
  const roadOrder = { active: 1, step: 2 };
  ribbons.sort((a, b) => a.depth - b.depth || roadOrder[a.kind] - roadOrder[b.kind]);
  const beside = (travel: number, dx: number, dz: number): Point => { const p = sampleWorld(travel); return landscape.project(landscape.onSurface({ x: p.x + dx, z: p.z + dz })); };
  function headingAt(travel: number, direction: 1 | -1 = 1): number {
    const a = sample(travel - direction * 3), b = sample(travel + direction * 5);
    return Math.atan2(b.y - a.y, b.x - a.x);
  }
  function bendAt(travel: number): number {
    const a = headingAt(travel - 5), b = headingAt(travel + 5);
    return Math.abs(Math.atan2(Math.sin(b - a), Math.cos(b - a)));
  }
  function contactAt(travel: number, side: -1 | 1): SurfaceContact {
    const d = clamp(travel, 0, length), p = sampleWorld(d), a = sampleWorld(d - 2), b = sampleWorld(d + 2);
    const norm = Math.max(.00001, Math.hypot(b.x - a.x, b.z - a.z));
    const nx = -(b.z - a.z) / norm, nz = (b.x - a.x) / norm;
    const center = landscape.project(p), probe = landscape.project(landscape.onSurface({ x: p.x + nx * .003, z: p.z + nz * .003 }));
    const width = .003 * clamp(HIKER_SCALE / Math.max(.05, distance(center, probe)), .16, 2);
    const world = landscape.onSurface({ x: p.x + nx * width * side, z: p.z + nz * width * side });
    const heading = headingAt(d);
    return { travel: d, side, world, point: landscape.project(world), heading, soleAngle: clamp(-Math.atan(gradeAt(d)) * Math.cos(heading) * .82, -.42, .42) };
  }
  function swingContact(from: SurfaceContact, to: SurfaceContact, t: number): SurfaceContact {
    const travel = mix(from.travel, to.travel, t), a = sampleWorld(from.travel), b = sampleWorld(to.travel), p = sampleWorld(travel);
    const world = landscape.onSurface({ x: p.x + mix(from.world.x - a.x, to.world.x - b.x, t), z: p.z + mix(from.world.z - a.z, to.world.z - b.z, t) });
    return { travel, side: to.side, world, point: landscape.project(world), heading: headingAt(travel), soleAngle: mix(from.soleAngle, to.soleAngle, t) };
  }
  return { points, lengths, length, campTravel, summitTravel, sample, sampleWorld, gradeAt, headingAt, bendAt, contactAt, swingContact, nearest, start, meadow, camp, seat, slope, horse, summit, end, stops, ribbons, beside };
}
export type Trail = ReturnType<typeof createTrail>;

type CampMode =
  | { kind: 'arriving'; elapsed: number } | { kind: 'unpacking'; elapsed: number } | { kind: 'sitting'; elapsed: number } | { kind: 'resting'; elapsed: number }
  | { kind: 'standing'; elapsed: number } | { kind: 'packing'; elapsed: number } | { kind: 'summit'; elapsed: number } | { kind: 'finished'; elapsed: number };
type StopResult = { kind: 'visit'; id: VisitId; resume: CampMode | { kind: 'walking'; target: number } }
  | { kind: 'pause'; target: number } | { kind: 'finish' };
type LiveWalkMode = { kind: 'ready' } | { kind: 'walking'; target: number } | { kind: 'paused'; target: number }
  | CampMode | { kind: 'stopping'; elapsed: number; result: StopResult };
export type WalkMode = LiveWalkMode | { kind: 'visiting'; id: VisitId; resume: LiveWalkMode };

export class WalkModel {
  mode: WalkMode = { kind: 'ready' };
  travel = 0;
  speed = 0;
  clock = 0;
  day: 1 | 2 = 1;
  direction: 1 | -1 = 1;
  private readonly gait: GaitPlanner;
  private readonly visited = new Set<VisitId>();
  private departure: VisitId | null = null;
  constructor(readonly trail: Trail, public section: WalkSection = 'forest') {
    this.travel = section === 'ridge' ? trail.campTravel : 0; this.departure = section === 'ridge' ? 'camp' : null;
    this.day = section === 'ridge' ? 2 : 1;
    this.gait = new GaitPlanner(trail, HIKER_SCALE, this.travel);
  }
  get angle(): number { return this.gait.angle; }
  get turnSide(): number { return this.gait.turnSide; }
  get phase(): number { return this.gait.phase; }
  get lean(): number { return this.gait.lean; }
  get slope(): number { return this.gait.slope; }
  get support(): Readonly<Point> { return this.gait.support; }
  get feet() { return this.gait.feet; }
  get grounded(): boolean { return this.gait.grounded; }
  get moving(): boolean { return this.mode.kind !== 'visiting' && (this.mode.kind === 'walking' || Math.abs(this.speed) > .15); }
  get point(): Point { return this.trail.sample(this.travel); }
  private get pose(): LiveWalkMode { return this.mode.kind === 'visiting' ? this.mode.resume : this.mode; }
  get seated(): number { const pose = this.pose; return pose.kind === 'sitting' ? smooth(pose.elapsed / 1.25) : pose.kind === 'standing' ? 1 - smooth(pose.elapsed / 1.2) : pose.kind === 'resting' ? 1 : 0; }
  get packOff(): number { const pose = this.pose; return pose.kind === 'unpacking' ? smooth(pose.elapsed / 1.5) : pose.kind === 'packing' ? 1 - smooth(pose.elapsed / 1.4) : ['sitting', 'resting', 'standing'].includes(pose.kind) ? 1 : 0; }
  get drinking(): number {
    const pose = this.pose;
    if (pose.kind !== 'resting') return 0;
    const t = pose.elapsed % 13;
    return t < 1.3 ? 0 : t < 2.3 ? smooth(t - 1.3) : t < 4 ? 1 : t < 5 ? 1 - smooth(t - 4) : 0;
  }
  get stage(): 'forest' | 'meadow' | 'camp' | 'ridge' | 'summit' | 'descent' | 'end' {
    return this.travel > this.trail.length - 18 ? 'end' : this.travel > this.trail.summitTravel + 12 ? 'descent' : this.travel > this.trail.summitTravel - 18 ? 'summit' : this.travel > this.trail.campTravel + 18 ? 'ridge' : this.travel > this.trail.campTravel - 24 ? 'camp' : this.travel >= this.trail.stops[0].travel ? 'meadow' : 'forest';
  }
  get incline(): 'uphill' | 'downhill' | 'level' { return this.slope > .06 ? 'uphill' : this.slope < -.06 ? 'downhill' : 'level'; }
  hasVisited(id: VisitId): boolean { return this.visited.has(id); }
  openVisit(id: VisitId): void {
    if (!this.visited.has(id) || this.mode.kind === 'visiting') return;
    this.mode = { kind: 'visiting', id, resume: this.mode }; this.speed = 0; this.gait.takeContacts();
  }
  closeVisit(continueWalk: boolean): void {
    if (this.mode.kind !== 'visiting') return;
    const resume = this.mode.resume;
    this.mode = resume.kind === 'walking' || resume.kind === 'paused' ? { kind: continueWalk ? 'walking' : 'paused', target: resume.target } : resume;
  }
  walkTo(target = this.trail.length): void {
    if (['visiting', 'stopping', 'arriving', 'unpacking', 'sitting', 'resting', 'standing', 'packing'].includes(this.mode.kind)) return;
    this.mode = { kind: 'walking', target: clamp(target, 0, this.trail.length) };
  }
  pause(): void {
    if (this.mode.kind === 'walking') this.mode = { kind: 'paused', target: this.mode.target };
    else if (this.mode.kind === 'visiting' && this.mode.resume.kind === 'walking') this.mode.resume = { kind: 'paused', target: this.mode.resume.target };
    this.speed = 0;
  }
  continueFromCamp(): void { if (this.mode.kind === 'resting') { this.day = 2; this.mode = { kind: 'standing', elapsed: 0 }; } }
  toggle(): void { if (this.mode.kind === 'walking') this.pause(); else if (this.mode.kind === 'paused') this.walkTo(this.mode.target); else if (this.mode.kind === 'ready' || this.mode.kind === 'summit') this.walkTo(); else if (this.mode.kind === 'resting') this.continueFromCamp(); }
  reset(section: WalkSection = this.section): void {
    this.section = section; this.departure = section === 'ridge' ? 'camp' : null;
    this.mode = { kind: 'ready' }; this.travel = section === 'ridge' ? this.trail.campTravel : 0; this.speed = 0; this.clock = 0; this.day = section === 'ridge' ? 2 : 1; this.direction = 1; this.visited.clear();
    this.gait.reset(this.travel);
  }
  takeContacts(): number { return this.gait.takeContacts(); }
  tick(dt: number): void {
    if (this.mode.kind === 'visiting') return;
    this.clock += dt;
    if (this.mode.kind === 'walking' && Math.abs(this.mode.target - this.travel) > .2) this.direction = this.mode.target < this.travel ? -1 : 1;
    if (this.mode.kind === 'walking') {
      const intended = this.mode.target;
      if (this.departure && Math.abs(this.travel - this.trail.campTravel) > 2) this.departure = null;
      const stops = this.trail.stops.filter(stop => stop.id !== this.departure && !this.visited.has(stop.id) && stop.travel >= Math.min(this.travel, intended) - .2 && stop.travel <= Math.max(this.travel, intended) + .2);
      const stop = intended >= this.travel ? stops[0] : stops[stops.length - 1];
      const target = stop ? stop.travel : intended;
      const remaining = target - this.travel;
      const limit = (this.stage === 'forest' ? 11.3 : 12.5) * HIKER_SCALE * (1 - Math.max(0, this.slope) * .30 - Math.max(0, -this.slope) * .18) * (1 - clamp(this.trail.bendAt(this.travel) / 1.2) * .27);
      const heading = this.trail.headingAt(this.travel, this.direction), turn = Math.abs(Math.atan2(Math.sin(heading - this.angle), Math.cos(heading - this.angle)));
      const turnSpeed = smooth((Math.PI * .73 - turn) / (Math.PI * .42));
      const targetSpeed = clamp(remaining * 3.3, -limit * turnSpeed, limit * turnSpeed);
      this.speed = mix(this.speed, targetSpeed, 1 - Math.exp(-dt * 5));
      const movement = this.speed * dt;
      this.travel = clamp(this.travel + movement, 0, this.trail.length);
      if ((Math.abs(remaining) < .18 && Math.abs(this.speed) < 1) || (remaining >= 0 && movement >= remaining) || (remaining < 0 && movement <= remaining)) {
        this.travel = target; this.speed = 0;
        if (stop) {
          const continuation = Math.abs(intended - target) < .3 ? (this.direction === 1 ? this.trail.length : 0) : intended;
          this.mode = { kind: 'stopping', elapsed: 0, result: { kind: 'visit', id: stop.id, resume: stop.id === 'camp' ? { kind: 'arriving', elapsed: 0 } : stop.id === 'summit' ? { kind: 'summit', elapsed: 0 } : stop.id === 'end' ? { kind: 'finished', elapsed: 0 } : { kind: 'walking', target: continuation } } };
        } else this.mode = { kind: 'stopping', elapsed: 0, result: this.travel > this.trail.length - .3 ? { kind: 'finish' } : { kind: 'pause', target: this.trail.length } };
      }
    } else if (this.mode.kind === 'paused') {
      this.speed = mix(this.speed, 0, 1 - Math.exp(-dt * 12));
      this.travel = clamp(this.travel + this.speed * dt, 0, this.trail.length);
    } else {
      this.speed = 0;
      const mode = this.mode;
      switch (mode.kind) {
        case 'ready': break;
        case 'stopping': mode.elapsed += dt; break;
        case 'arriving': mode.elapsed += dt; if (mode.elapsed >= .8) this.mode = { kind: 'unpacking', elapsed: 0 }; break;
        case 'unpacking': mode.elapsed += dt; if (mode.elapsed >= 1.5) this.mode = { kind: 'sitting', elapsed: 0 }; break;
        case 'sitting': mode.elapsed += dt; if (mode.elapsed >= 1.25) this.mode = { kind: 'resting', elapsed: 0 }; break;
        case 'resting': mode.elapsed += dt; break;
        case 'standing': mode.elapsed += dt; if (mode.elapsed >= 1.2) this.mode = { kind: 'packing', elapsed: 0 }; break;
        case 'packing': mode.elapsed += dt; if (mode.elapsed >= 1.4) this.mode = { kind: 'walking', target: this.trail.length }; break;
        case 'finished': mode.elapsed += dt; break;
        case 'summit': mode.elapsed += dt; break;
        default: { const unhandled: never = mode; return unhandled; }
      }
    }
    this.gait.advance(dt, { travel: this.travel, speed: this.speed, direction: this.direction, walking: this.mode.kind === 'walking', resting: ['unpacking', 'sitting', 'resting', 'standing', 'packing', 'summit', 'finished'].includes(this.mode.kind) });
    if (this.mode.kind === 'stopping' && this.mode.elapsed >= .12 && this.gait.grounded) {
      const result = this.mode.result;
      if (result.kind === 'visit') { this.visited.add(result.id); this.mode = { kind: 'visiting', id: result.id, resume: result.resume }; }
      else if (result.kind === 'finish') this.mode = { kind: 'finished', elapsed: 0 };
      else this.mode = { kind: 'paused', target: result.target };
    }
  }
}
