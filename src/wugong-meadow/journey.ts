import * as THREE from 'three';
import type { EnvironmentJourney } from '../wugong-walk/environment';
import type { RouteStopId, WugongTerrain } from './terrain';

type TravelMode = { kind: 'ready' } | { kind: 'walking' } | { kind: 'paused' }
  | { kind: 'camp'; elapsed: number } | { kind: 'finished' };
export type JourneyMode = TravelMode | { kind: 'visiting'; id: RouteStopId; resume: TravelMode };

export class WugongJourney {
  mode: JourneyMode = { kind: 'ready' };
  distance = 0;
  speed = 0;
  day: 1 | 2 = 1;
  private readonly visited = new Set<RouteStopId>();
  private origin = 0;
  private readonly before = new THREE.Vector3();
  private readonly ahead = new THREE.Vector3();
  constructor(readonly terrain: WugongTerrain) {}
  get environment(): EnvironmentJourney {
    return {
      day: this.day, travel: this.distance,
      trail: { length: this.terrain.length, campTravel: this.terrain.campDistance, summitTravel: this.terrain.summitDistance },
      mode: this.mode.kind === 'camp' ? { kind: 'resting', elapsed: this.mode.elapsed } : this.mode,
    };
  }
  hasVisited(id: RouteStopId): boolean { return this.visited.has(id); }
  toggle(): void {
    if (this.mode.kind === 'visiting') return;
    if (this.mode.kind === 'finished') { this.reset(); return; }
    if (this.mode.kind === 'walking') { this.mode = { kind: 'paused' }; return; }
    if (this.mode.kind === 'camp') { this.day = 2; this.mode = { kind: 'walking' }; return; }
    if (this.origin === 0 && !this.visited.has('start')) { this.visit('start'); return; }
    this.mode = { kind: 'walking' };
  }
  private visit(id: RouteStopId): void {
    this.visited.add(id); this.speed = 0;
    const resume: TravelMode = id === 'end' ? { kind: 'finished' } : id === 'camp' && this.day === 1 ? { kind: 'camp', elapsed: 0 } : { kind: 'walking' };
    this.mode = { kind: 'visiting', id, resume };
  }
  openStop(id: RouteStopId): void {
    if (this.mode.kind === 'visiting') return;
    const stop = this.terrain.stops.find(stop => stop.id === id);
    if (!this.visited.has(id) && stop && Math.abs(stop.distance - this.distance) < .1) { this.visit(id); return; }
    this.mode = { kind: 'visiting', id, resume: this.mode }; this.speed = 0;
  }
  closeVisit(proceed: boolean): void {
    if (this.mode.kind !== 'visiting') return;
    const { resume } = this.mode;
    this.mode = resume.kind === 'walking' && !proceed ? { kind: 'paused' } : resume;
  }
  pause(): void { if (this.mode.kind === 'walking') this.mode = { kind: 'paused' }; }
  startAtCamp(): void {
    this.origin = this.terrain.campDistance; this.distance = this.origin; this.day = 2;
    this.visited.clear(); this.visited.add('camp'); this.speed = 0; this.mode = { kind: 'paused' };
  }
  reset(): void {
    this.origin = 0; this.distance = 0; this.speed = 0; this.day = 1; this.visited.clear(); this.mode = { kind: 'ready' }; this.toggle();
  }
  advance(dt: number): void {
    if (this.mode.kind === 'visiting' || this.mode.kind === 'ready' || this.mode.kind === 'finished') { this.speed = 0; return; }
    if (this.mode.kind === 'camp') { this.mode.elapsed += dt; this.speed = 0; return; }
    this.terrain.sample(this.distance - .5, this.before); this.terrain.sample(this.distance + .5, this.ahead);
    const grade = (this.ahead.y - this.before.y) / Math.max(.1, Math.hypot(this.ahead.x - this.before.x, this.ahead.z - this.before.z));
    const target = this.mode.kind === 'walking' ? 1.12 / (1 + Math.max(0, grade) * 1.2 + Math.max(0, -grade) * .55) : 0;
    this.speed += (target - this.speed) * (1 - Math.exp(-dt * 5));
    const destination = Math.min(this.terrain.length, this.distance + this.speed * dt);
    const stop = this.terrain.stops.find(stop => stop.distance >= this.origin && !this.visited.has(stop.id) && stop.distance <= destination);
    this.distance = stop ? stop.distance : destination;
    if (stop) this.visit(stop.id);
    else if (this.distance >= this.terrain.length) { this.speed = 0; this.mode = { kind: 'finished' }; }
  }
}
