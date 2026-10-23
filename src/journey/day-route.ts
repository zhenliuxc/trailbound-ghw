import type { Point2D, Size2D } from '../runtime/projection';
import type { PlacePhoto } from './photo-dialog';
import type { DiscoveryCue } from './discovery-transition';
import type { LandmarkSymbol } from './landmark-symbol';
import type { LandmarkLabelSide } from './landmark-label';
import { clamp, curve, distance, mix } from '../wugong-walk/model';

export type DayRouteId = 'changping' | 'mogan' | 'westlake';
export type Feature = 'gate' | 'temple' | 'forest' | 'water' | 'redrock' | 'meadow' | 'bamboo' | 'ridge' | 'tea' | 'village';
export interface Waypoint extends Point2D { readonly elevation: number }
export interface DayPlace {
  readonly id: string;
  readonly name: string;
  readonly knot: number;
  readonly feature: Feature;
  readonly symbol: LandmarkSymbol;
  readonly labelSide?: LandmarkLabelSide;
  readonly photo?: PlacePhoto;
}
export interface DayEvent extends DiscoveryCue {
  readonly entry: string;
  readonly place: string;
  readonly knot: number;
  readonly leg?: 'return';
}
export interface DayRoute {
  readonly id: DayRouteId;
  readonly name: string;
  readonly region: string;
  readonly title: string;
  readonly subtitle: string;
  readonly note: string;
  readonly ending: string;
  readonly world: Size2D;
  readonly waypoints: readonly [Waypoint, Waypoint, ...Waypoint[]];
  readonly places: readonly [DayPlace, DayPlace, ...DayPlace[]];
  readonly events: readonly DayEvent[];
  readonly weather: readonly { readonly from: number; readonly name: string; readonly kind: 'clear' | 'fog' | 'rain' | 'wind' }[];
  readonly startMinute: number;
  readonly durationMinute: number;
  readonly itinerary?: 'out-and-back';
  readonly sources: readonly { readonly name: string; readonly url: string }[];
}

/** Map landmarks, walking and event timing share one sampled trail. */
export class DayTrail {
  readonly points: readonly Point2D[];
  readonly lengths = [0];
  readonly knotDistances: readonly number[];
  readonly length: number;
  constructor(readonly route: DayRoute) {
    this.points = curve([...route.waypoints], 14);
    for (let i = 1; i < this.points.length; i++) this.lengths.push(this.lengths[i - 1] + distance(this.points[i - 1], this.points[i]));
    this.length = this.lengths[this.lengths.length - 1];
    this.knotDistances = route.waypoints.map(point => {
      let best = 0;
      for (let i = 1; i < this.points.length; i++) if (distance(point, this.points[i]) < distance(point, this.points[best])) best = i;
      return this.lengths[best];
    });
  }
  sample(at: number): Point2D {
    const value = clamp(at, 0, this.length);
    let lo = 1, hi = this.lengths.length - 1;
    while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (this.lengths[mid] < value) lo = mid + 1; else hi = mid; }
    const a = this.points[lo - 1], b = this.points[lo], t = (value - this.lengths[lo - 1]) / Math.max(.001, this.lengths[lo] - this.lengths[lo - 1]);
    return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) };
  }
  heading(at: number): number { const a = this.sample(at - 12), b = this.sample(at + 38); return Math.atan2(b.y - a.y, b.x - a.x); }
  elevation(at: number): number {
    let i = 1; while (i < this.knotDistances.length - 1 && this.knotDistances[i] < at) i++;
    const t = clamp((at - this.knotDistances[i - 1]) / Math.max(1, this.knotDistances[i] - this.knotDistances[i - 1]));
    return mix(this.route.waypoints[i - 1].elevation, this.route.waypoints[i].elevation, t);
  }
  slope(at: number): number { return (this.elevation(at + 45) - this.elevation(at - 45)) / 90; }
}

type FreePhase = { readonly kind: 'ready' | 'walking' | 'paused' | 'finished' };
type Stop = { readonly at: number } & ({ readonly kind: 'photo'; readonly place: DayPlace } | { readonly kind: 'game'; readonly event: DayEvent } | { readonly kind: 'finish' });
export type DayPhase = FreePhase | { kind: 'stopping'; elapsed: number; stop: Stop }
  | { kind: 'photo'; place: DayPlace; arrival: boolean; resume: FreePhase }
  | { kind: 'game'; event: DayEvent };

export class DayJourney {
  phase: DayPhase = { kind: 'ready' };
  distance = 0; clock = 0; speed = 0; stride = 0; idle = 0; heading: number;
  readonly visited = new Set<string>();
  readonly encountered = new Set<string>();
  readonly earned = new Set<string>();
  readonly stops: readonly Stop[];
  private cursor = 0;
  constructor(readonly trail: DayTrail) {
    this.heading = trail.heading(0);
    const stops: Stop[] = trail.route.places.filter(place => place.photo).map(place => ({ kind: 'photo', place, at: trail.knotDistances[place.knot] }));
    stops.push(...trail.route.events.map((event): Stop => ({ kind: 'game', event, at: event.leg === 'return' ? this.length - trail.knotDistances[event.knot] : trail.knotDistances[event.knot] })));
    stops.sort((a, b) => a.at - b.at);
    this.stops = [...stops, { kind: 'finish', at: this.length }];
  }
  get length(): number { return this.trail.length * (this.trail.route.itinerary === 'out-and-back' ? 2 : 1); }
  get returning(): boolean { return this.trail.route.itinerary === 'out-and-back' && this.distance >= this.trail.length; }
  get direction(): number { return this.returning ? -1 : 1; }
  get at(): number { return this.returning ? this.length - this.distance : this.distance; }
  ahead(by: number): Point2D { return this.trail.sample(this.at + by * this.direction); }
  get forwardHeading(): number { return this.trail.heading(this.at + 18 * this.direction) + (this.returning ? Math.PI : 0); }
  get slope(): number { return this.trail.slope(this.at) * this.direction; }
  get point(): Point2D { return this.trail.sample(this.at); }
  get progress(): number { return clamp(this.distance / this.length); }
  get moving(): boolean { return this.phase.kind === 'walking' && this.speed > .1; }
  get minute(): number { return this.trail.route.startMinute + this.progress * this.trail.route.durationMinute; }
  get weather() { return this.trail.route.weather.filter(weather => weather.from <= this.progress).at(-1) ?? { name: '晴', kind: 'clear' }; }
  get section(): string {
    const places = this.trail.route.places;
    let i = 1; while (i < places.length - 1 && this.trail.knotDistances[places[i].knot] <= this.at) i++;
    return this.returning ? `返程 · ${places[i].name} → ${places[i - 1].name}` : `${places[i - 1].name} → ${places[i].name}`;
  }
  toggle(): void { if (this.phase.kind === 'ready' || this.phase.kind === 'paused') { this.phase = { kind: 'walking' }; this.idle = 0; } else this.pause(); }
  pause(): void { if (this.phase.kind === 'walking') { this.phase = { kind: 'paused' }; this.speed = 0; } }
  openPhoto(place: DayPlace): void {
    if (!place.photo || !this.visited.has(place.id)) return;
    const phase = this.phase;
    if (phase.kind === 'ready' || phase.kind === 'walking' || phase.kind === 'paused' || phase.kind === 'finished') { this.phase = { kind: 'photo', place, arrival: false, resume: phase }; this.speed = 0; }
  }
  closePhoto(continueWalk: boolean): void {
    if (this.phase.kind !== 'photo') return;
    const phase = this.phase;
    if (phase.arrival) this.cursor++;
    this.phase = phase.arrival ? { kind: continueWalk ? 'walking' : 'paused' } : phase.resume;
  }
  closeGame(entry: string, collected: boolean): void {
    if (this.phase.kind !== 'game' || this.phase.event.entry !== entry) return;
    this.encountered.add(entry); if (collected) this.earned.add(entry);
    this.cursor++; this.speed = 0; this.phase = { kind: collected ? 'walking' : 'paused' };
  }
  tick(dt: number): void {
    if (dt <= 0 || !Number.isFinite(dt)) return;
    this.clock += dt;
    if (this.phase.kind === 'paused') { this.idle += dt; return; }
    if (this.phase.kind === 'stopping') {
      this.phase.elapsed += dt; if (this.phase.elapsed < .5) return;
      const { stop } = this.phase;
      if (stop.kind === 'photo') { this.visited.add(stop.place.id); this.phase = { kind: 'photo', place: stop.place, arrival: true, resume: { kind: 'walking' } }; }
      else if (stop.kind === 'game') this.phase = { kind: 'game', event: stop.event };
      else this.phase = { kind: 'finished' };
      return;
    }
    if (this.phase.kind !== 'walking') return;
    const stop = this.stops[this.cursor], remaining = Math.max(0, stop.at - this.distance), slope = this.slope;
    const target = Math.min(slope > .15 ? 26 : slope < -.15 ? 30 : 35, Math.sqrt(remaining * 38));
    this.speed = mix(this.speed, target, 1 - Math.exp(-dt * 5));
    const delta = Math.min(remaining, this.speed * dt); this.distance += delta; this.stride += delta / (slope > .15 ? 22 : 28);
    const angle = this.trail.heading(this.at) + (this.returning ? Math.PI : 0), turn = Math.atan2(Math.sin(angle - this.heading), Math.cos(angle - this.heading));
    this.heading += turn * (1 - Math.exp(-dt * 3.5));
    if (remaining < .7) { this.distance = stop.at; this.speed = 0; this.phase = { kind: 'stopping', elapsed: 0, stop }; }
  }
}
