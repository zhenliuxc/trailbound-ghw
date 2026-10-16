import type { GameEvent, MiniInput, MiniState, MomentEntry } from '../contracts';

export const MOGAN_GAMES = Object.freeze({ 'bamboo-drop': 'rain', 'bamboo-step': 'footsteps', 'bamboo-leaf': 'sling' } as const);
export type MoganKind = typeof MOGAN_GAMES[keyof typeof MOGAN_GAMES];
export interface Point { x: number; y: number }
export interface Rect extends Point { w: number; h: number }
export interface MoganEvent extends GameEvent { y: number; age: number; offsetX?: number }
interface Base extends MiniState { route: 'mogan'; game: MoganKind; weather?: string; feedback: string; serial: number; events: MoganEvent[] }
export const CUP = Object.freeze({ width: 132, anchorY: .184, mouthY: .73, mouthRadius: 38 * 1.32, waterRadius: 34 * 1.32, waterDepth: 14 * 1.32 });
// A short eight-note phrase, with a breath in the middle. A missed note is offered again.
export const RAIN_PHRASE = Object.freeze([0, 3, 1, 4, 2, 5, 3, 1]);
export const RAIN_NOTES = Object.freeze([60, 64, 67, 64, 62, 65, 64, 60]);
export interface RainState extends Base {
  game: 'rain';
  rain: { cupX: number; targetX: number; caught: number; nextIn: number; attempt: number; drop: (Point & { speed: number }) | null };
}
export interface StepsState extends Base {
  game: 'footsteps';
  steps: { index: number; clock: number; landedAt: number; recovery: number; slow: boolean; mistakes: number };
}
export interface SlingState extends Base {
  game: 'sling';
  sling: {
    angle: number; power: number; stage: 'ready' | 'flight' | 'miss' | 'caught'; charge: boolean;
    aiming: boolean; shot: (Point & { vx: number; vy: number; spin: number }) | null;
    shots: number; at: number; releasedAt?: number; chargeAt?: number; trail: Point[];
  };
}
export type MoganState = RainState | StepsState | SlingState;
export interface LegacySling {
  create(entry: MomentEntry, options: { reduced: boolean }): SlingState;
  input(state: SlingState, input: MiniInput, mode?: 'tap' | 'move'): SlingState;
  release(state: SlingState): SlingState;
  tick(state: SlingState, dt: number): SlingState;
  key(state: SlingState, key: string, phase?: 'down' | 'up'): SlingState;
  aimPouch(state: SlingState): Point;
  preview(state: SlingState, count?: number): Point[];
  target: Rect;
  obstacles: Rect[];
  slingOrigin: Point;
}
export const MOGAN_TITLES: Record<MoganKind, string> = { rain: '听一筒竹林的雨', footsteps: '沿着石阶慢慢走', sling: '给远山送一枚纸叶' };
export const MOGAN_PROMPTS: Record<MoganKind, string> = {
  rain: '轻点画面开始，移动鼠标或滑动手指，让竹筒接住叶尖的雨滴。',
  footsteps: '轻点脚印出发，等脚印亮起时再点，慢慢走过石阶。',
  sling: '按住纸叶向后拉，松手送过竹隙，落在远山纸签上。',
};
export const MOGAN_MEMORIES: Record<MoganKind, string> = {
  rain: '叶尖先亮起一颗水珠。我挪过竹筒，接住一声又一声轻响；最后一滴落下，竹林里留下了一小段雨的旋律。',
  footsteps: '我跟着石阶的长短，左脚、右脚，慢慢走过雨后的古道。苔色留在石边，十次轻轻的落脚，把山路接成了自己的节奏。',
  sling: '我把一枚纸叶放上竹弓，试着借一小段风。纸叶穿过竹隙，轻轻停在远山纸签上；林子里的那扇窗，也亮了起来。',
};
export const clamp = (n: number, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(n) ? n : a));
export const ease = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };

export function createMoganState(entry: MomentEntry, reduced: boolean, legacy: LegacySling, weather = 'clear'): MoganState {
  const kind = MOGAN_GAMES[entry.id as keyof typeof MOGAN_GAMES];
  if (kind === 'sling') return { ...legacy.create(entry, { reduced }), weather, feedback: '拉住纸叶往后，借一小段风，把它送到竹隙后的纸签。' };
  const base: Base = {
    id: entry.id, route: 'mogan', kind: entry.interaction, game: kind, weather, age: 0, acted: false, dragging: false,
    gesture: 'look', done: false, x: .5, y: .73,
    play: { type: 'minigame', progress: 0, complete: false, completedAt: null, reduced }, serial: 0, events: [], feedback: MOGAN_PROMPTS[kind],
  };
  return kind === 'rain' ? { ...base, game: 'rain', rain: { cupX: .5, targetX: .5, caught: 0, nextIn: .9, attempt: 0, drop: null } }
    : { ...base, game: 'footsteps', steps: { index: 0, clock: 0, landedAt: -10, recovery: 0, slow: false, mistakes: 0 } };
}
function clone(s: RainState | StepsState): RainState | StepsState {
  const shared = { ...s, play: { ...s.play }, events: s.events.slice() };
  return s.game === 'rain' ? { ...shared, game: 'rain', rain: { ...s.rain, drop: s.rain.drop && { ...s.rain.drop } } }
    : { ...shared, game: 'footsteps', steps: { ...s.steps } };
}
function emit(s: Base, type: string, x = .5, y = .5, index = 0) {
  const event = { serial: ++s.serial, type, x, y, index, age: s.age };
  s.events.push(event);
  s.events = s.events.slice(-18);
  return event as MoganEvent;
}
function complete(s: Base) {
  if (s.play.complete) return;
  s.play.complete = true; s.play.progress = 1; s.play.completedAt = s.age;
  emit(s, 'complete');
}
export function leafTip(index: number, age: number, reduced: boolean): Point {
  return { x: .14 + index * .143 + (reduced ? 0 : Math.sin(age * 1.1 + index) * .006), y: .205 + (index % 3) * .027 + (reduced ? 0 : Math.sin(age * .8 + index * 1.7) * .003) };
}
export function stepFoot(index: number): 'left' | 'right' { return index % 2 ? 'right' : 'left'; }
export function stonePose(s: StepsState, ordinal: number, height: number) {
  const moving = s.play.reduced ? 0 : 1 - ease((s.age - s.steps.landedAt) / .48);
  const relative = ordinal - s.steps.index + moving, q = clamp(1 - relative / 6, 0, 1.24);
  return { x: 400 + Math.sin(ordinal * .73) * 24 * q, y: height * (.18 + .67 * Math.pow(q, 1.7)), width: 100 + 555 * Math.pow(q, 1.6), q };
}
/** The visible shoe/ring and the pointer target share this logical origin. */
export function stepSpot(s: StepsState, height: number) {
  const index = Math.min(9, s.steps.index), p = stonePose(s, index, height), foot = stepFoot(index);
  return { x: p.x + (foot === 'left' ? -1 : 1) * p.width * .135, y: p.y - p.width * .11, rx: p.width * .12, ry: p.width * .17, foot };
}
export function stepTiming(s: StepsState) {
  const length = ([1.55, 1.65, 1.95, 1.55, 2.10, 1.65, 1.55, 1.90, 1.60, 2.05][Math.min(9, s.steps.index)]) * (s.steps.slow ? 1.5 : 1);
  const window = s.steps.slow ? .62 : .44;
  return { length, window, open: length - window, close: length + window, progress: clamp(s.steps.clock / length) };
}
export function inputMogan(state: MoganState, p: MiniInput, legacy: LegacySling, mode: 'tap' | 'move' = 'tap'): MoganState {
  if (state.game === 'sling') return legacy.input(state, p, mode);
  if (state.done || state.play.complete) return state;
  if (state.game === 'footsteps' && (mode === 'move' || p.phase === 'press' || p.action === 'outside-step')) return state;
  const s = clone(state), action = p.action || (p.assist ? state.game === 'footsteps' && state.acted ? 'step' : 'begin' : '');
  s.gesture = mode === 'move' ? 'drag' : 'tap';
  if (s.game === 'rain') {
    if (!s.acted) { s.acted = true; emit(s, 'begin'); s.feedback = '竹筒跟着鼠标或指尖走，接住叶尖落下的雨滴。'; }
    if (action === 'left' || action === 'right') s.rain.targetX = clamp(s.rain.targetX + (action === 'left' ? -.09 : .09), .08, .92);
    else if (Number.isFinite(p.x)) s.rain.targetX = clamp(p.x!, .08, .92);
    s.x = s.rain.targetX; s.dragging = mode === 'move';
    return s;
  }
  if (action === 'slow') {
    s.steps.slow = !s.steps.slow; s.steps.clock = 0; s.steps.recovery = 0;
    s.feedback = s.steps.slow ? '把脚步放慢，等脚印轻轻合上。' : '按自己的节奏，继续往上走。';
    return s;
  }
  if (!s.acted) { s.acted = true; s.steps.clock = 0; emit(s, 'begin'); s.feedback = '等脚印亮起，再轻轻点一下。'; return s; }
  const foot = action === 'step' ? stepFoot(s.steps.index) : action === 'left' || action === 'right' ? action : null;
  if (!foot || s.steps.recovery > 0) return s;
  if (foot !== stepFoot(s.steps.index)) { s.feedback = '这一级轮到' + (stepFoot(s.steps.index) === 'left' ? '左脚' : '右脚') + '，换另一只脚试试。'; return s; }
  const timing = stepTiming(s);
  if (s.steps.clock < timing.open) { s.feedback = '再等一点点，脚印合上时落脚。'; return s; }
  if (s.steps.clock > timing.close) return s;
  const index = s.steps.index;
  emit(s, 'step-land', foot === 'left' ? .4 : .6, .77, index);
  s.steps.index++; s.steps.clock = 0; s.steps.landedAt = s.age; s.play.progress = s.steps.index / 10;
  if (s.steps.index === 10) { s.feedback = '十级石阶走过了，竹林里的路还在向前。'; complete(s); }
  else s.feedback = '跟着下一个脚印，亮起时再轻点。';
  return s;
}
function rainTick(s: RainState, dt: number) {
  const r = s.rain, oldCupX = r.cupX;
  r.cupX += (r.targetX - r.cupX) * (1 - Math.exp(-dt * 13));
  if (!s.acted) return;
  if (!r.drop) {
    r.nextIn -= dt;
    if (r.nextIn <= 0) {
      const tip = leafTip(RAIN_PHRASE[r.caught], s.age, !!s.play.reduced);
      r.drop = { ...tip, speed: .29 }; r.attempt++;
    }
    return;
  }
  const d = r.drop, oldY = d.y; d.y += d.speed * dt;
  const crossed = oldY < CUP.mouthY && d.y >= CUP.mouthY;
  // Interpolate the moving mouth at the instant the droplet crosses it.
  // A drop already below the rim is never caught later by moving the cup.
  if (crossed) {
    const t = (CUP.mouthY - oldY) / (d.y - oldY), cupX = oldCupX + (r.cupX - oldCupX) * t;
    if (Math.abs(d.x - cupX) < (CUP.mouthRadius - 5) / 800) {
      const note = r.caught; emit(s, 'catch', d.x, CUP.mouthY, note).offsetX = d.x - cupX;
      r.caught++; s.caught = r.caught; s.play.progress = r.caught / RAIN_PHRASE.length;
      r.drop = null; r.nextIn = r.caught === 4 ? 1.6 : .85;
      s.feedback = r.caught === 4 ? '前半句接住了，听雨声留一个小小的停顿。' : '接住第 ' + r.caught + ' 个声音，下一颗水珠正在叶尖等你。';
      if (r.caught === RAIN_PHRASE.length) { s.feedback = '最后一滴落进竹筒，八个声音合成了这段竹林回忆。'; complete(s); }
      return;
    }
  }
  if (d.y > .94) { emit(s, 'rain-miss', d.x, .94, r.caught); r.drop = null; r.nextIn = 1.1; s.feedback = '这滴落回了石阶。同一个声音还会再来，不用着急。'; }
}
export function tickMogan(state: MoganState, dt: number, legacy: LegacySling): MoganState {
  if (state.game === 'sling') return legacy.tick(state, dt);
  if (state.done || !Number.isFinite(dt) || dt <= 0) return state;
  const s = clone(state); let remaining = Math.min(.25, dt);
  while (remaining > 1e-8) {
    const step = Math.min(remaining, 1 / 120); remaining -= step; s.age += step;
    if (s.play.complete) { s.done = s.age - (s.play.completedAt ?? s.age) >= (s.play.reduced ? .45 : 2.35); continue; }
    if (s.game === 'rain') rainTick(s, step);
    else if (s.acted) {
      if (s.steps.recovery > 0) { s.steps.recovery = Math.max(0, s.steps.recovery - step); continue; }
      if (s.age - s.steps.landedAt < .35) continue;
      s.steps.clock += step;
      if (s.steps.clock > stepTiming(s).close) {
        s.steps.clock = 0; s.steps.recovery = .65; s.steps.mistakes++;
        s.feedback = '在这一级歇一歇，等脚印再合上。走过的路都还在。';
        emit(s, 'step-miss', stepFoot(s.steps.index) === 'left' ? .4 : .6, .77);
      }
    }
  }
  return s;
}
export function releaseMogan(s: MoganState, legacy: LegacySling): MoganState { return s.game === 'sling' ? legacy.release(s) : { ...s, dragging: false }; }
export function keyMogan(s: MoganState, key: string, phase: 'down' | 'up', legacy: LegacySling): MoganState | null {
  if (s.game === 'sling') return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(key) ? legacy.key(s, key, phase) : null;
  if (phase === 'up') return null;
  if (s.game === 'rain' && ['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(key)) return inputMogan(s, { action: ['ArrowLeft', 'a', 'A'].includes(key) ? 'left' : 'right' }, legacy);
  if (s.game === 'footsteps' && ['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D'].includes(key)) return inputMogan(s, { action: ['ArrowLeft', 'a', 'A'].includes(key) ? 'left' : 'right' }, legacy);
  if (key === 'Enter' || key === ' ') return inputMogan(s, { action: s.game === 'footsteps' && s.acted ? 'step' : 'begin' }, legacy);
  return null;
}
