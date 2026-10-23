export { CUES } from '../content/aotai';
import type { LandmarkSymbol } from '../journey/landmark-symbol';
import { clamp, mix, type Point } from '../journey/geometry';
import type { AotaiGameId } from '../runtime/aotai-games/model';

export { path } from './geography';
import { path } from './geography';
import { CAMP_IDS, type PlaceId } from '../content/aotai-map';

export const CHECKPOINTS = {
  aoshan: { name: '白起庙', place: 'baiqi', symbol: 'temple' },
  ridge: { name: '太白梁 · 九重石海', place: 'taibailiang', symbol: 'stone-sea' },
  taibai: { name: '拔仙台', place: 'baxian', symbol: 'summit' },
} satisfies Record<string, { name: string; place: PlaceId; symbol: LandmarkSymbol }>;
export type CheckpointId = keyof typeof CHECKPOINTS;
export const CHECKPOINT_IDS: readonly CheckpointId[] = ['aoshan', 'ridge', 'taibai'];
type GameContinuation = { readonly kind: 'walk' } | { readonly kind: 'camp'; readonly id: PlaceId };
type Step = { readonly at: number } & ({ readonly kind: 'photo'; readonly id: CheckpointId } | { readonly kind: 'game'; readonly id: AotaiGameId; readonly continuation: GameContinuation } | { readonly kind: 'camp'; readonly id: PlaceId } | { readonly kind: 'transfer' });
export const STEPS: readonly Step[] = [
  { at: path.at('penjing'), kind: 'camp', id: 'penjing' },
  { at: path.at('baiqi'), kind: 'photo', id: 'aoshan' },
  { at: path.between('baiqi', 'aoshan', .58), kind: 'game', id: 'snow-tracks', continuation: { kind: 'walk' } },
  { at: path.at('shuiwo'), kind: 'camp', id: 'shuiwo' },
  { at: path.between('feiji', 'liang', .4), kind: 'game', id: 'snow-lichen', continuation: { kind: 'walk' } },
  { at: path.at('camp2800'), kind: 'camp', id: 'camp2800' },
  { at: path.between('camp2800', 'nantian', .25), kind: 'game', id: 'aotai-takin-first', continuation: { kind: 'walk' } },
  { at: path.at('taibailiang'), kind: 'photo', id: 'ridge' },
  { at: path.at('dashihe'), kind: 'game', id: 'aotai-camp-night', continuation: { kind: 'camp', id: 'dashihe' } },
  { at: path.at('baxian'), kind: 'photo', id: 'taibai' },
  { at: path.at('xiaban'), kind: 'transfer' },
];

export type LivePhase = { kind: 'ready' | 'walking' | 'paused' | 'finished' } | { kind: 'resting' | 'night' | 'dawn'; camp: PlaceId; elapsed: number } | { kind: 'transfer'; elapsed: number };
export type Phase = LivePhase | { kind: 'stopping'; elapsed: number } | { kind: 'photo'; id: CheckpointId; arrival: boolean; resume: LivePhase } | { kind: 'game'; id: AotaiGameId; continuation: GameContinuation };
export class AotaiJourney {
  phase: Phase = { kind: 'ready' };
  at = 0; clock = 0; stride = 0; speed = 0; heading = 0; day = 1;
  private cursor = 0;
  readonly visited = new Set<CheckpointId>();
  readonly earned = new Set<AotaiGameId>();
  get point(): Point { return path.sample(this.at); }
  get moving(): boolean { return this.phase.kind === 'walking' && this.speed > .1; }
  get progress(): number { return this.at / path.length; }
  get resting(): boolean { return this.phase.kind === 'resting' || this.phase.kind === 'night' || this.phase.kind === 'dawn'; }
  get camp(): PlaceId | null { const p = this.phase; return p.kind === 'resting' || p.kind === 'night' || p.kind === 'dawn' ? p.camp : null; }
  get mist(): boolean { return this.at > path.at('wanxian') && this.at < path.at('dongpaoma'); }
  private get daylightProgress(): number { const start = this.day === 1 ? 0 : path.at(CAMP_IDS[this.day - 2]); const end = this.day <= CAMP_IDS.length ? path.at(CAMP_IDS[this.day - 1]) : path.length; return clamp((this.at - start) / (end - start)); }
  get night(): number {
    if (this.phase.kind === 'night') return mix(.65, 1, clamp(this.phase.elapsed / 3));
    if (this.phase.kind === 'dawn') return 1 - clamp(this.phase.elapsed / 4);
    return clamp((this.daylightProgress - .72) / .28) * .55;
  }
  get minute(): number {
    if (this.phase.kind === 'night') return 18 * 60 + Math.min(1, this.phase.elapsed / 5.5) * 4 * 60;
    if (this.phase.kind === 'dawn') return 7.5 * 60;
    const morning = this.day === 1 ? 9 : 7.5;
    return (morning + this.daylightProgress * (17 - morning)) * 60;
  }
  toggle(): void {
    switch (this.phase.kind) {
      case 'ready': case 'paused': this.phase = { kind: 'walking' }; break;
      case 'walking': this.phase = { kind: 'paused' }; this.speed = 0; break;
      case 'resting': this.phase = { kind: 'night', camp: this.phase.camp, elapsed: 0 }; break;
    }
  }
  pause(): void { if (this.phase.kind === 'walking') { this.phase = { kind: 'paused' }; this.speed = 0; } }
  openPhoto(id: CheckpointId): void {
    const phase = this.phase;
    if (!this.visited.has(id) || !['ready', 'walking', 'paused', 'finished', 'resting'].includes(phase.kind)) return;
    if (phase.kind === 'ready' || phase.kind === 'walking' || phase.kind === 'paused' || phase.kind === 'finished' || phase.kind === 'resting') { this.phase = { kind: 'photo', id, arrival: false, resume: phase }; this.speed = 0; }
  }
  closePhoto(continueWalk: boolean): void {
    if (this.phase.kind !== 'photo') return;
    const phase = this.phase;
    if (phase.arrival) this.cursor++;
    this.phase = phase.arrival ? { kind: continueWalk ? 'walking' : 'paused' } : phase.resume;
  }
  closeGame(id: AotaiGameId, collected: boolean): void {
    if (this.phase.kind !== 'game' || this.phase.id !== id) return;
    if (collected) this.earned.add(id);
    const continuation = this.phase.continuation;
    this.cursor++; this.speed = 0;
    this.phase = continuation.kind === 'camp' ? { kind: 'resting', camp: continuation.id, elapsed: 0 } : { kind: collected ? 'walking' : 'paused' };
  }
  private arrive(): void {
    const step = STEPS[this.cursor]; if (!step) return;
    this.speed = 0;
    switch (step.kind) {
      case 'photo': this.visited.add(step.id); this.phase = { kind: 'photo', id: step.id, arrival: true, resume: { kind: 'walking' } }; break;
      case 'game': this.phase = { kind: 'game', id: step.id, continuation: step.continuation }; break;
      case 'camp': this.cursor++; this.phase = { kind: 'resting', camp: step.id, elapsed: 0 }; break;
      case 'transfer': this.cursor++; this.phase = { kind: 'transfer', elapsed: 0 }; break;
    }
  }
  tick(dt: number): void {
    if (dt <= 0 || !Number.isFinite(dt)) return;
    this.clock += dt;
    const phase = this.phase;
    if (phase.kind === 'transfer') {
      phase.elapsed += dt;
      const t = clamp(phase.elapsed / 7);
      this.at = mix(path.at('xiaban'), path.length, t * t * (3 - 2 * t));
      if (t === 1) this.phase = { kind: 'finished' };
      return;
    }
    if (phase.kind === 'night' || phase.kind === 'dawn' || phase.kind === 'resting') {
      phase.elapsed += dt;
      if (phase.kind === 'resting' && phase.elapsed >= 7) this.phase = { kind: 'night', camp: phase.camp, elapsed: 0 };
      else if (phase.kind === 'night' && phase.elapsed >= 5.5) { this.day++; this.phase = { kind: 'dawn', camp: phase.camp, elapsed: 0 }; }
      else if (phase.kind === 'dawn' && phase.elapsed >= 5) this.phase = { kind: 'walking' };
      return;
    }
    if (phase.kind === 'stopping') { phase.elapsed += dt; if (phase.elapsed >= .6) this.arrive(); return; }
    if (phase.kind !== 'walking') return;
    const target = STEPS[this.cursor]; if (!target) return;
    const remaining = Math.max(0, target.at - this.at), slope = path.slope(this.at);
    const desired = Math.min(slope > .2 ? 23 : slope < -.2 ? 26 : 30, Math.sqrt(remaining * 34));
    this.speed = mix(this.speed, desired, 1 - Math.exp(-dt * 5));
    const delta = Math.min(remaining, this.speed * dt); this.at += delta; this.stride += delta / (slope > .2 ? 22 : slope < -.2 ? 24 : 28);
    const angle = path.heading(this.at), turn = Math.atan2(Math.sin(angle - this.heading), Math.cos(angle - this.heading)); this.heading += turn * (1 - Math.exp(-dt * 4));
    if (remaining < .7) { this.at = target.at; this.speed = 0; this.phase = { kind: 'stopping', elapsed: 0 }; }
  }
}
