import { clamp, mix, smooth, type Point } from '../model';
import { ScrollTrail, type ScrollStopId } from './route';
import { trailEvents, type TrailEvent, type TrailEventId } from './events';

type CampKind = 'arriving' | 'unpacking' | 'sitting' | 'resting' | 'sleeping' | 'waking' | 'standing' | 'packing' | 'summit' | 'finished';
type CampPose = { [K in CampKind]: { kind: K; elapsed: number } }[CampKind];
type LiveMode = { kind: 'ready' } | { kind: 'walking'; target: number } | { kind: 'paused'; target: number } | CampPose;
type ResumeMode = Extract<LiveMode, { kind: 'walking' | 'paused' | 'resting' | 'summit' | 'finished' }>;
type Arrival = { kind: 'photo'; id: ScrollStopId } | { kind: 'event'; id: TrailEventId };
export type ScrollMode = LiveMode | { kind: 'stopping'; arrival: Arrival; target: number; elapsed: number } |
  { kind: 'visiting'; id: ScrollStopId; resume: ResumeMode } | { kind: 'encounter'; id: TrailEventId; resume: ResumeMode };

export class ScrollJourney {
  day: 1 | 2 = 1;
  mode: ScrollMode = { kind: 'ready' };
  travel = 0;
  speed = 0;
  clock = 0;
  phase = 0;
  private contacts = 0;
  private campPhoto = false;
  private readonly visited = new Set<ScrollStopId>();
  private readonly collected = new Set<TrailEventId>();
  private readonly encountered = new Set<TrailEventId>();
  readonly events: Readonly<Record<TrailEventId, TrailEvent>>;
  readonly eventStops: readonly TrailEvent[];
  constructor(readonly trail: ScrollTrail, private readonly section: 'full' | 'camp-night' = 'full') {
    this.events = trailEvents(trail); this.eventStops = Object.values(this.events).filter(event => event.trigger !== 'archive').sort((a, b) => a.travel - b.travel);
    this.travel = this.section === 'camp-night' ? trail.campTravel - 145 : 0;
  }
  get point(): Point { return this.trail.sample(this.travel); }
  get stage() { return this.trail.stage(this.travel); }
  get hour(): number {
    const pose = this.pose;
    if (pose.kind === 'sleeping') return 20.6 + smooth(pose.elapsed / 5) * 2.9;
    if (this.day === 2) return 29.9 + clamp((this.travel - this.trail.campTravel) / (this.trail.summitTravel - this.trail.campTravel)) * 3.1 + clamp((this.travel - this.trail.summitTravel) / (this.trail.length - this.trail.summitTravel)) * 4.5;
    const rest = pose.kind === 'resting' ? smooth(pose.elapsed / 18) * 2.4 : 0;
    return 8 + clamp(this.travel / this.trail.campTravel) * 10.2 + rest;
  }
  get pose(): LiveMode | { kind: 'stopping' } { return this.mode.kind === 'visiting' || this.mode.kind === 'encounter' ? this.mode.resume : this.mode; }
  get moving(): boolean { return this.mode.kind === 'walking' && this.speed > .4; }
  get angle(): number { return this.trail.angle(this.travel); }
  hasVisited(id: ScrollStopId): boolean { return this.visited.has(id); }
  hasCollected(id: TrailEventId): boolean { return this.collected.has(id); }
  hasEncountered(id: TrailEventId): boolean { return this.encountered.has(id); }
  collectEvent(id: TrailEventId): void {
    if (this.encountered.has(id)) this.collected.add(id);
  }
  get collections(): number { return this.collected.size; }
  get canSleep(): boolean { return this.mode.kind === 'resting' && this.campPhoto && this.encountered.has('stars'); }
  walkTo(target = this.day === 1 ? this.trail.campTravel : this.trail.length): void {
    if (!['ready', 'paused', 'walking', 'summit'].includes(this.mode.kind)) return;
    // This segment proceeds forward; replay is explicit, never a teleport to a point.
    this.mode = { kind: 'walking', target: clamp(target, this.travel, this.day === 1 ? this.trail.campTravel : this.trail.length) };
  }
  toggle(): void {
    if (this.mode.kind === 'walking') this.pause();
    else if (this.mode.kind === 'paused') this.walkTo(this.mode.target);
    else if (this.mode.kind === 'ready') this.walkTo();
    else if (this.mode.kind === 'summit') this.walkTo();
    else if (this.canSleep) this.sleep();
  }
  sleep(): void { if (this.canSleep && this.day === 1) this.mode = { kind: 'sleeping', elapsed: 0 }; }
  pause(): void {
    if (this.mode.kind === 'walking') this.mode = { kind: 'paused', target: this.mode.target };
    this.speed = 0;
  }
  openVisit(id: ScrollStopId): void {
    if (!this.visited.has(id)) return;
    const pose = this.mode;
    if (pose.kind !== 'walking' && pose.kind !== 'paused' && pose.kind !== 'resting' && pose.kind !== 'summit' && pose.kind !== 'finished') return;
    const resume: ResumeMode = pose;
    this.mode = { kind: 'visiting', id, resume }; this.speed = 0;
  }
  closeVisit(continueWalk: boolean): void {
    if (this.mode.kind !== 'visiting') return;
    const resume = this.mode.resume;
    this.mode = resume.kind === 'walking' || resume.kind === 'paused' ? { kind: continueWalk ? 'walking' : 'paused', target: resume.target } : resume;
  }
  openEvent(id: TrailEventId): void {
    const event = this.events[id], resume = this.mode;
    if (event.trigger === 'archive') return;
    if (this.travel < event.travel - .1 || this.day < event.day) return;
    if (event.trigger === 'camp' && !this.campPhoto) return;
    if (resume.kind !== 'walking' && resume.kind !== 'paused' && resume.kind !== 'resting' && resume.kind !== 'summit' && resume.kind !== 'finished') return;
    this.encountered.add(id); this.speed = 0; this.mode = { kind: 'encounter', id, resume };
  }
  closeEncounter(continueWalk: boolean): void {
    if (this.mode.kind !== 'encounter') return;
    const resume = this.mode.resume;
    this.mode = resume.kind === 'walking' || resume.kind === 'paused' ? { kind: continueWalk ? 'walking' : 'paused', target: resume.target } : resume;
  }
  reset(): void {
    this.mode = { kind: 'ready' }; this.day = 1; this.travel = this.section === 'camp-night' ? this.trail.campTravel - 145 : 0; this.speed = 0; this.phase = 0; this.clock = 0;
    this.campPhoto = false; this.contacts = 0; this.visited.clear(); this.collected.clear(); this.encountered.clear();
  }
  takeContacts(): number { const count = this.contacts; this.contacts = 0; return count; }
  tick(dt: number): void {
    if (this.mode.kind === 'visiting' || this.mode.kind === 'encounter' || !Number.isFinite(dt) || dt <= 0) return;
    this.clock += dt;
    const mode = this.mode;
    if (mode.kind === 'walking') {
      const photo = this.trail.stops.find(stop => !this.visited.has(stop.id) && stop.travel >= this.travel - .02 && stop.travel <= mode.target + .02);
      const event = this.eventStops.find(stop => stop.trigger === 'trail' && stop.day === this.day && !this.encountered.has(stop.id) && stop.travel >= this.travel - .02 && stop.travel <= mode.target + .02);
      const next: { arrival: Arrival; travel: number } | null = event && (!photo || event.travel < photo.travel)
        ? { arrival: { kind: 'event', id: event.id }, travel: event.travel }
        : photo ? { arrival: { kind: 'photo', id: photo.id }, travel: photo.travel } : null;
      const target = next?.travel ?? mode.target, remaining = target - this.travel;
      const uphill = Math.max(0, -Math.sin(this.angle)), downhill = Math.max(0, Math.sin(this.angle));
      const limit = (this.stage === 'forest' || this.stage === 'slope' ? 18 : 24) * (1 - uphill * .25 - downhill * .15) * (1 - Math.min(.28, this.trail.bend(this.travel) * .35));
      const velocity = Math.min(limit, Math.sqrt(Math.max(0, remaining) * 26));
      this.speed = mix(this.speed, velocity, 1 - Math.exp(-dt * 5));
      const step = Math.min(Math.max(0, remaining), this.speed * dt);
      this.travel += step;
      const oldContact = Math.floor(this.phase * 2);
      this.phase += step / (uphill > .25 || downhill > .32 ? 28 : 34);
      this.contacts += Math.max(0, Math.floor(this.phase * 2) - oldContact);
      if (remaining < .12 || step >= remaining) {
        this.travel = target; this.speed = 0;
        if (next) this.mode = { kind: 'stopping', arrival: next.arrival, target: mode.target, elapsed: 0 };
        else this.mode = { kind: 'paused', target: this.trail.length };
      }
      return;
    }
    this.speed = 0;
    switch (mode.kind) {
      case 'ready': case 'paused': return;
      case 'stopping':
        mode.elapsed += dt;
        if (mode.elapsed > .55) {
          const arrival = mode.arrival;
          if (arrival.kind === 'event') {
            this.encountered.add(arrival.id);
            this.mode = { kind: 'encounter', id: arrival.id, resume: { kind: 'walking', target: mode.target } };
          } else {
            this.visited.add(arrival.id);
            const resume: ResumeMode = arrival.id === 'summit' ? { kind: 'summit', elapsed: 0 } : arrival.id === 'end' ? { kind: 'finished', elapsed: 0 } : { kind: 'walking', target: mode.target };
            this.mode = arrival.id === 'camp' ? { kind: 'arriving', elapsed: 0 } : { kind: 'visiting', id: arrival.id, resume };
          }
        }
        return;
      case 'sleeping':
        mode.elapsed += dt;
        if (mode.elapsed >= 5) { this.day = 2; this.mode = { kind: 'waking', elapsed: 0 }; }
        return;
      case 'waking': mode.elapsed += dt; if (mode.elapsed > 2) this.mode = { kind: 'standing', elapsed: 0 }; return;
      case 'standing': mode.elapsed += dt; if (mode.elapsed > 1.2) this.mode = { kind: 'packing', elapsed: 0 }; return;
      case 'packing': mode.elapsed += dt; if (mode.elapsed > 1.3) this.mode = { kind: 'walking', target: this.trail.length }; return;
      case 'summit': case 'finished': mode.elapsed += dt; return;
      case 'arriving': mode.elapsed += dt; if (mode.elapsed > 1) this.mode = { kind: 'unpacking', elapsed: 0 }; return;
      case 'unpacking': mode.elapsed += dt; if (mode.elapsed > 1.8) this.mode = { kind: 'sitting', elapsed: 0 }; return;
      case 'sitting': mode.elapsed += dt; if (mode.elapsed > 1.1) this.mode = { kind: 'resting', elapsed: 0 }; return;
      case 'resting':
        mode.elapsed += dt;
        if (!this.campPhoto && mode.elapsed > 6.5) {
          this.campPhoto = true; this.mode = { kind: 'visiting', id: 'camp', resume: { kind: 'resting', elapsed: mode.elapsed } };
        } else if (this.campPhoto && mode.elapsed > 16.5 && !this.encountered.has('stars')) {
          this.openEvent('stars');
        }
        return;
      default: { const unhandled: never = mode; return unhandled; }
    }
  }
}
