import { clamp, mix, type Point } from '../journey/geometry';
import { CLIMB_END, CLIMB_START, highRoad, isCheckpoint, place, PLACES, RIVER_PHOTO_AT, riverBranch, WATERFALL_GAME_AT } from './route';
import type { CheckpointId, Leg } from '../content/tiger-map';
import type { TigerEventId as EventId } from '../content/tiger';

type LiveMode = { kind: 'ready' } | { kind: 'walking' } | { kind: 'paused' } | { kind: 'resting'; elapsed: number } | { kind: 'sleeping'; elapsed: number } | { kind: 'waking'; elapsed: number } | { kind: 'junction' } | { kind: 'finished' };
type Arrival = { kind: 'photo'; id: CheckpointId } | { kind: 'game'; id: EventId } | { kind: 'junction' } | { kind: 'finished' };
export type TigerMode = LiveMode | { kind: 'stopping'; elapsed: number; arrival: Arrival } | { kind: 'photo'; id: CheckpointId; resume: LiveMode } | { kind: 'game'; id: EventId };

export class TigerJourney {
  mode: TigerMode = { kind: 'ready' };
  leg: Leg = 'high';
  at = 0;
  day: 1 | 2 = 1;
  phase = 0;
  clock = 0;
  speed = 0;
  heading = 0;
  readonly visited = new Set<CheckpointId>();
  readonly encountered = new Set<EventId>();
  readonly earned = new Set<EventId>();
  get path() { return this.leg === 'high' ? highRoad : riverBranch; }
  get point(): Point { return this.path.sample(this.at); }
  get moving(): boolean { return this.mode.kind === 'walking' && this.speed > .1; }
  get atInn(): boolean { return this.day === 1 && Math.abs(this.at - place('halfway').at) < 1 && this.leg === 'high'; }
  get progress(): number { return this.leg === 'high' ? this.at / highRoad.length : this.leg === 'down' ? this.at / riverBranch.length : 1 - this.at / riverBranch.length; }
  get minute(): number {
    if (this.mode.kind === 'sleeping') return mix(19 * 60, 23 * 60, clamp(this.mode.elapsed / 5));
    if (this.day === 1) return 9 * 60 + Math.min(1, this.at / place('halfway').at) * 9 * 60;
    if (this.leg !== 'high') return 11 * 60 + (this.leg === 'return' ? 110 + this.progress * 90 : this.progress * 95);
    return 7 * 60 + Math.max(0, (this.at - place('halfway').at) / (highRoad.length - place('halfway').at)) * 210;
  }
  toggle(): void {
    if (this.mode.kind === 'walking') this.pause();
    else if (this.mode.kind === 'ready' || this.mode.kind === 'paused') this.mode = this.atInn ? { kind: 'resting', elapsed: this.encountered.has('inn-pairs') ? 6 : 0 } : { kind: 'walking' };
    else if (this.mode.kind === 'resting') {
      if (!this.encountered.has('inn-pairs')) this.arrive({ kind: 'game', id: 'inn-pairs' });
      else this.mode = { kind: 'sleeping', elapsed: 0 };
    }
  }
  pause(): void { if (this.mode.kind === 'walking' || this.mode.kind === 'resting') { this.mode = { kind: 'paused' }; this.speed = 0; } }
  openPhoto(id: CheckpointId): void {
    if (!this.visited.has(id) || !['ready', 'walking', 'paused', 'resting', 'junction', 'finished'].includes(this.mode.kind)) return;
    const resume = this.mode;
    if (resume.kind === 'ready' || resume.kind === 'walking' || resume.kind === 'paused' || resume.kind === 'resting' || resume.kind === 'junction' || resume.kind === 'finished') this.mode = { kind: 'photo', id, resume };
  }
  closePhoto(continueWalk: boolean): void {
    if (this.mode.kind !== 'photo') return;
    const { id, resume } = this.mode;
    if (resume.kind !== 'walking' && resume.kind !== 'paused' && resume.kind !== 'ready') { this.mode = resume; return; }
    if (id === 'halfway' && this.day === 1) this.mode = continueWalk ? { kind: 'resting', elapsed: 0 } : { kind: 'paused' };
    else this.mode = continueWalk ? { kind: 'walking' } : { kind: 'paused' };
  }
  closeGame(collected: boolean): boolean {
    if (this.mode.kind !== 'game') return false;
    const id = this.mode.id;
    if (collected) this.earned.add(id);
    const moved = id === 'climb' && collected;
    if (moved) this.at = CLIMB_END - 110;
    if (id === 'river-frame') { this.leg = 'return'; this.at = riverBranch.length; }
    this.mode = id === 'inn-pairs' && collected ? { kind: 'resting', elapsed: 6 } : collected ? { kind: 'walking' } : { kind: 'paused' };
    this.speed = 0; return moved;
  }
  chooseBranch(take: boolean): void {
    if (this.mode.kind !== 'junction') return;
    if (take) { this.leg = 'down'; this.at = 0; this.mode = { kind: 'walking' }; }
    else this.mode = { kind: 'finished' };
  }
  private arrive(arrival: Arrival): void {
    this.speed = 0;
    switch (arrival.kind) {
      case 'photo': this.visited.add(arrival.id); this.mode = { kind: 'photo', id: arrival.id, resume: { kind: 'walking' } }; break;
      case 'game': this.encountered.add(arrival.id); this.mode = { kind: 'game', id: arrival.id }; break;
      case 'junction': this.mode = { kind: 'junction' }; break;
      case 'finished': this.mode = { kind: 'finished' }; break;
    }
  }
  tick(dt: number): void {
    if (!Number.isFinite(dt) || dt <= 0) return;
    this.clock += dt;
    const mode = this.mode;
    if (mode.kind === 'resting' || mode.kind === 'sleeping' || mode.kind === 'waking') {
      mode.elapsed += dt;
      if (mode.kind === 'resting' && mode.elapsed >= 6 && !this.encountered.has('inn-pairs')) this.arrive({ kind: 'game', id: 'inn-pairs' });
      else if (mode.kind === 'resting' && mode.elapsed >= 10) this.mode = { kind: 'sleeping', elapsed: 0 };
      if (mode.kind === 'sleeping' && mode.elapsed >= 5) { this.day = 2; this.mode = { kind: 'waking', elapsed: 0 }; }
      if (mode.kind === 'waking' && mode.elapsed >= 4.2) this.mode = { kind: 'walking' };
      return;
    }
    if (mode.kind === 'stopping') { mode.elapsed += dt; if (mode.elapsed >= .55) this.arrive(mode.arrival); return; }
    if (mode.kind !== 'walking') return;
    let target = this.leg === 'return' ? 0 : this.path.length;
    let arrival: Arrival = this.leg === 'high' ? { kind: 'junction' } : { kind: 'finished' };
    const offer = (at: number, event: Arrival) => { if (at >= this.at - .1 && at <= target) { target = at; arrival = event; } };
    if (this.leg !== 'return') {
      if (this.leg === 'high' && !this.encountered.has('climb')) offer(CLIMB_START, { kind: 'game', id: 'climb' });
      if (this.leg === 'high' && this.day === 2 && !this.encountered.has('waterfall-paint')) offer(WATERFALL_GAME_AT, { kind: 'game', id: 'waterfall-paint' });
      if (this.leg === 'down' && !this.encountered.has('river-frame')) offer(riverBranch.length, { kind: 'game', id: 'river-frame' });
      for (const p of PLACES) if (isCheckpoint(p.id) && p.leg === this.leg && !this.visited.has(p.id)) offer(p.id === 'river' ? RIVER_PHOTO_AT : p.at, { kind: 'photo', id: p.id });
    }
    const remaining = Math.abs(target - this.at), direction = this.leg === 'return' ? -1 : 1;
    const slope = Math.sin(this.path.heading(this.at)) * direction;
    const desired = Math.min(slope < -.2 ? 12 : slope > .2 ? 15.5 : 17.5, Math.sqrt(remaining * 25));
    this.speed = mix(this.speed, desired, 1 - Math.exp(-dt * 5));
    const delta = Math.min(remaining, this.speed * dt); this.at += delta * direction;
    this.phase += delta / (slope < -.2 ? 22 : slope > .2 ? 25 : 28);
    const angle = this.path.heading(this.at) + (direction < 0 ? Math.PI : 0);
    const turn = Math.atan2(Math.sin(angle - this.heading), Math.cos(angle - this.heading));
    this.heading += turn * (1 - Math.exp(-dt * 4));
    if (remaining < .8) { this.at = target; this.mode = { kind: 'stopping', elapsed: 0, arrival }; this.speed = 0; }
  }
}
