import { clamp, mix, type Point } from '../wugong-walk/model';
import type { AotaiGameId } from '../runtime/aotai-games/model';

export { path } from './geography';
import { CAMP_IDS, path, type PlaceId } from './geography';

export const CHECKPOINTS = {
  aoshan: { name: '白起庙', place: 'baiqi', icon: 'house' },
  ridge: { name: '太白梁 · 九重石海', place: 'taibailiang', icon: 'ridge' },
  taibai: { name: '拔仙台', place: 'baxian', icon: 'ridge' },
} satisfies Record<string, { name: string; place: PlaceId; icon: 'house' | 'ridge' | 'flag' }>;
export type CheckpointId = keyof typeof CHECKPOINTS;
export const CHECKPOINT_IDS: readonly CheckpointId[] = ['aoshan', 'ridge', 'taibai'];
export const CUES = {
  'snow-tracks': { entry: 'snow-tracks', place: '鳌山 · 石海', line: '离开白起庙，石海沿着鳌山大梁铺开。', motif: '<path d="m5 31 8-19 12-5 16 12 4 19H12Z M13 12l7 15 21-8M20 27l-8 11M20 27l14 11"/>' },
  'snow-lichen': { entry: 'snow-lichen', place: '飞机梁 · 连峰', line: '爬出水窝子的谷地，一道道山梁在眼前展开。', motif: '<path d="m3 34 9-12 8 5 9-16 7 9 12-5M3 41h45"/>' },
  'aotai-takin-first': { entry: 'aotai-takin-first', place: '2800营地 · 林缘', line: '前方岩后，传来沉重的踩雪声。', motif: '<path d="M8 25q6-13 21-8l7 6v9H12ZM13 32v10M28 32v10M30 17l-2-8M36 23l8-3 3 9-11 3M43 20l1-8"/>' },
  'aotai-camp-night': { entry: 'aotai-camp-night', place: '大石河 · 雪夜营地', line: '走下石海，背风的河谷里可以歇脚了。', motif: '<path d="m5 40 19-30 20 30ZM24 10v30M10 40l14-19 15 19M3 42h44M29 27h7v9h-7Z"/>' },
} satisfies Record<AotaiGameId, { entry: AotaiGameId; place: string; line: string; motif: string }>;
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
