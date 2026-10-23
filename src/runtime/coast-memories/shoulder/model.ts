import type { GameEvent, MiniInput, MiniState } from '../../contracts';

export const SCENE = { width: 1672, height: 941 };
export interface Point { readonly x: number; readonly y: number }
export const FOOTHOLDS = [
  { x: 505, y: 913 },
  { x: 445, y: 816 },
  { x: 410, y: 718 },
  { x: 450, y: 651 },
  { x: 505, y: 600 },
  { x: 560, y: 575 },
  { x: 760, y: 643 },
  { x: 900, y: 666 },
  { x: 1030, y: 675 },
] as const;
export const LOOKOUT: Point = FOOTHOLDS[FOOTHOLDS.length - 1];
export const PROMPT = '轻点山路，登高望海。';
export const MEMORY = '沿西湾山的石阶登高，转过山肩，白沙海湾与蚺蛇尖一起展开。我背着包站在高处，让海风吹过，把这一眼山海留在手帐里。';
export const clamp = (n: number, min = 0, max = 1): number => Math.max(min, Math.min(max, n));
export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;
export const ease = (t: number): number => { const x = clamp(t); return x * x * (3 - 2 * x); };
export const STEP_TIME = .8;
export const VIEW_TIME = 6;
type Phase = { kind: 'ready'; idle: number }
  | { kind: 'climbing'; to: number; elapsed: number; landed: boolean }
  | { kind: 'view'; elapsed: number }
  | { kind: 'finished' };

export class ShoulderState implements MiniState {
  readonly id = 'coast-sand'; readonly route = 'maclehose'; readonly kind = 'saiwan-steps';
  age = 0; acted = false; dragging = false; gesture = 'tap'; done = false; x = .5; y = .5;
  play: { type: string; progress: number; complete: boolean; completedAt: number | null; reduced: boolean };
  phase: Phase = { kind: 'ready', idle: 0 };
  step = 0; cameraProgress = 0; hover = false; feedback = PROMPT;
  events: GameEvent[] = []; private serial = 0;
  constructor(reduced: boolean) { this.play = { type: 'saiwan-lookout-14', progress: 0, complete: false, completedAt: null, reduced }; }
  emit(type: string, at: number, index = 0): void { this.events.push({ serial: ++this.serial, type, x: clamp(at / SCENE.width), index }); if (this.events.length > 12) this.events.shift(); }
}
export function shoulderState(state: MiniState): ShoulderState { if (!(state instanceof ShoulderState)) throw new Error('西湾山互动状态不匹配'); return state; }
export function accepts(s: ShoulderState, at: Point): boolean {
  if (s.phase.kind !== 'ready') return false;
  for (let i = 1; i < FOOTHOLDS.length; i++) {
    const a = FOOTHOLDS[i - 1], b = FOOTHOLDS[i], dx = b.x - a.x, dy = b.y - a.y;
    const t = clamp(((at.x - a.x) * dx + (at.y - a.y) * dy) / (dx * dx + dy * dy));
    if (Math.hypot(at.x - mix(a.x, b.x, t), at.y - mix(a.y, b.y, t)) <= 90) return true;
  }
  return false;
}
export function actShoulder(s: ShoulderState, input: MiniInput): ShoulderState {
  if (input.phase !== 'press' || s.phase.kind !== 'ready' || typeof input.x !== 'number' || !Number.isFinite(input.x) || typeof input.y !== 'number' || !Number.isFinite(input.y)) return s;
  const at = { x: input.x, y: input.y };
  if (!accepts(s, at)) { s.feedback = '轻点脚边的山路，跟着海风往上走。'; return s; }
  s.acted = true; s.hover = false;
  s.phase = { kind: 'climbing', to: 1, elapsed: 0, landed: false };
  s.feedback = '沿着石阶登高，海风从山肩外吹来。';
  return s;
}
export function hoverShoulder(s: ShoulderState, input: MiniInput): ShoulderState {
  s.hover = typeof input.x === 'number' && typeof input.y === 'number' && accepts(s, { x: input.x, y: input.y }); return s;
}
export function keyShoulder(s: ShoulderState, key: string, phase: 'down' | 'up'): ShoulderState | null {
  if (!['Enter', ' ', 'ArrowUp', 'ArrowRight'].includes(key)) return null;
  if (phase === 'down') actShoulder(s, { phase: 'press', ...FOOTHOLDS[1], key: true });
  return s;
}
export function walkProgress(s: ShoulderState): number { return s.phase.kind === 'climbing' ? (s.step + ease(s.phase.elapsed / STEP_TIME)) / (FOOTHOLDS.length - 1) : s.step / (FOOTHOLDS.length - 1); }
export function actorPoint(s: ShoulderState): Point {
  const phase = s.phase;
  if (phase.kind === 'climbing') { const a = FOOTHOLDS[s.step], b = FOOTHOLDS[phase.to], t = ease(phase.elapsed / STEP_TIME); return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) - (s.play.reduced ? 0 : Math.sin(Math.PI * t) * 4) }; }
  return FOOTHOLDS[s.step];
}
export function tickShoulder(s: ShoulderState, dt: number): ShoulderState {
  if (s.done || !Number.isFinite(dt) || dt <= 0) return s;
  dt = Math.min(.05, dt); s.age += dt;
  if (s.play.complete) { s.done = s.play.completedAt !== null && s.age - s.play.completedAt >= 1; return s; }
  const phase = s.phase;
  switch (phase.kind) {
    case 'ready': phase.idle += dt; break;
    case 'climbing': {
      phase.elapsed += dt;
      if (!phase.landed && phase.elapsed >= STEP_TIME * .82) { phase.landed = true; s.emit('coast-step-land', FOOTHOLDS[phase.to].x, phase.to); }
      if (phase.elapsed >= STEP_TIME) {
        s.step = phase.to;
        s.phase = s.step === FOOTHOLDS.length - 1 ? { kind: 'view', elapsed: 0 } : { kind: 'climbing', to: s.step + 1, elapsed: 0, landed: false };
        s.feedback = s.phase.kind === 'view' ? '站在高处，望见白沙湾与蚺蛇尖。' : s.step < 4 ? '沿着石阶登高，海风从山肩外吹来。' : '转过山肩，海湾慢慢展开。';
        if (s.step === 5) s.emit('coast-sea-reveal', .6 * SCENE.width);
      }
      break;
    }
    case 'view':
      phase.elapsed += dt;
      if (phase.elapsed >= VIEW_TIME) { s.phase = { kind: 'finished' }; s.play.complete = true; s.play.completedAt = s.age; s.play.progress = 1; s.emit('complete', LOOKOUT.x); }
      break;
    case 'finished': break;
    default: { const exhaustive: never = phase; return exhaustive; }
  }
  const target = ease((walkProgress(s) - .18) / .82);
  s.cameraProgress = mix(s.cameraProgress, target, s.play.reduced ? 1 : 1 - Math.exp(-dt * 2.2));
  if (!s.play.complete) s.play.progress = walkProgress(s) * .8 + (s.phase.kind === 'view' ? .18 * clamp(s.phase.elapsed / VIEW_TIME) : 0);
  return s;
}
