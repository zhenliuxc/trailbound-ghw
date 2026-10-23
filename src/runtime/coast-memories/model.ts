import type { GameEvent, GameKind, MiniInput, MiniState } from '../contracts';
import { answerBird, BIRDS, birdsongFeedback, birdsongLayout, createBirdsong, PERCHES, repeatBirdsong, tickBirdsong, type Bird, type Birdsong } from './birdsong';

export const COAST_MEMORIES = {
  'maclehose-sideways-crab': { kind: 'driftwood', game: 'packing', title: '给它让一条沙路', badge: '横着也能到', prompt: '把挡路的漂木拖到旁边沙地，让螃蟹自己经过。', keys: '数字 1、2、3 选择漂木，方向键挪动，R 重试。', memory: '西湾的沙地上，一只小螃蟹正在找路。我挪开几根漂木，看它横着走过，留下一串浅浅的脚印。' },
  'coast-pier': { kind: 'mooring', game: 'creek', title: '把小船轻轻泊好', badge: '赤径慢潮', prompt: '拖动小船靠近左侧渡头，松手停稳，再把绳圈套到系桩。', keys: '方向键移动小船，Enter 停船；靠泊后 Enter 拿绳，方向键挪动，Enter 系好。R 重试。', memory: '赤径的水慢下来。我把纸上的小船轻轻送到渡头，套好绳圈，看倒影在船边重新聚拢。' },
  'maclehose-woodland-echo': { kind: 'birdsong', game: 'bells', title: '林间回声', badge: '山坳回声', prompt: '先听小鸟的短句，再按顺序轻点回应。', keys: '数字 1、2、3 对应左、中、右的小鸟；空格重听，R 重试。静音可看抬头和枝叶提示。', memory: '离开咸田湾，往大浪坳的林缘歇了歇。纸上的小鸟依次鸣叫，我记住一小段顺序，轻轻回应，才发现海浪声已经远了。' },
} satisfies Record<string, { kind: 'driftwood' | 'mooring' | 'birdsong'; game: GameKind; title: string; badge: string; prompt: string; keys: string; memory: string }>;
export type CoastMemoryId = keyof typeof COAST_MEMORIES;
export const coastMemoryId = (id: string): id is CoastMemoryId => Object.hasOwn(COAST_MEMORIES, id);
export const COAST_MEMORY_IDS = Object.keys(COAST_MEMORIES).filter(coastMemoryId);
export const WIDTH = 1000, HEIGHT = 667;
export interface Point { x: number; y: number }
export interface Log extends Point { readonly axis: 'horizontal' | 'vertical'; readonly width: number; readonly height: number }
interface LogDrag { index: number; offset: Point }
export interface Driftwood { kind: 'driftwood'; logs: Log[]; crab: number; moving: boolean; focus: number; drag: LogDrag | null }
type BoatPhase = { kind: 'sailing'; velocity: Point; lastMove: number; released: boolean; stable: number; travel: number; drag: Point | null }
  | { kind: 'landing'; from: Point; elapsed: number }
  | { kind: 'rope'; end: Point; holding: boolean }
  | { kind: 'tied'; elapsed: number };
export interface Mooring { kind: 'mooring'; boat: Point; phase: BoatPhase }
export const DOCK = { x: 507, y: 355 }, POST = { x: 361, y: 301 };
export const boatRope = (boat: Point): Point => ({ x: boat.x - 69, y: boat.y - 19 });
export const crabPoint = (progress: number): Point => ({ x: 185 + 710 * progress, y: 365 + 105 * progress + Math.sin(Math.PI * progress) * 6 });
const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));
const distance = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);
const validPoint = (input: MiniInput): Point | null => typeof input.x === 'number' && Number.isFinite(input.x) && typeof input.y === 'number' && Number.isFinite(input.y) ? { x: input.x, y: input.y } : null;
const radius = (input: MiniInput): number => Math.max(18, 22 * WIDTH / Math.max(220, input.viewWidth ?? WIDTH));

export class CoastMemoryState implements MiniState {
  readonly route = 'maclehose'; readonly game: GameKind; readonly kind: string;
  age = 0; acted = false; dragging = false; gesture = 'tap'; done = false; x = .5; y = .5;
  events: GameEvent[] = []; serial = 0; feedback: string;
  play: { type: string; progress: number; complete: boolean; completedAt: number | null; reduced: boolean };
  session: Driftwood | Mooring | Birdsong;
  constructor(readonly id: CoastMemoryId, reduced: boolean) {
    const spec = COAST_MEMORIES[id]; this.game = spec.game; this.kind = spec.kind; this.feedback = spec.prompt;
    this.play = { type: 'coast-memory-5', progress: 0, complete: false, completedAt: null, reduced };
    this.session = spec.kind === 'birdsong' ? createBirdsong() : spec.kind === 'driftwood' ? { kind: 'driftwood', crab: 0, moving: false, focus: 0, drag: null, logs: [
      { x: 400, y: 404, width: 24, height: 96, axis: 'vertical' },
      { x: 590, y: 437, width: 218, height: 56, axis: 'horizontal' },
      { x: 780, y: 470, width: 24, height: 96, axis: 'vertical' },
    ] } : { kind: 'mooring', boat: { x: 600, y: 480 }, phase: { kind: 'sailing', velocity: { x: 0, y: 0 }, lastMove: 0, released: false, stable: 0, travel: 0, drag: null } };
  }
}
export function stateOf(state: MiniState): CoastMemoryState { if (!(state instanceof CoastMemoryState)) throw new Error('海岸互动状态不匹配'); return state; }
function emit(s: CoastMemoryState, type: string, x: number): void { s.events.push({ serial: ++s.serial, type, x: x / WIDTH }); if (s.events.length > 10) s.events.shift(); }
function complete(s: CoastMemoryState, feedback: string): void { s.play.complete = true; s.play.progress = 1; s.play.completedAt = s.age; s.dragging = false; s.feedback = feedback; emit(s, 'complete', .5 * WIDTH); }
function echoReply(s: CoastMemoryState, p: Birdsong, bird: Bird): void {
  if (answerBird(p, bird)) { s.acted = true; s.gesture = 'tap'; s.events.push({ serial: ++s.serial, type: 'coast-bird-answer', x: PERCHES[bird].x / WIDTH, index: bird }); }
  s.feedback = birdsongFeedback(p);
}
export function logBlocks(log: Log, at: Point): boolean { return Math.abs(log.x - at.x) < log.width / 2 + 46 && Math.abs(log.y - at.y) < log.height / 2 + 28; }
export function logClear(log: Log): boolean { for (let i = 0; i <= 50; i++) if (logBlocks(log, crabPoint(i / 50))) return false; return true; }
function logsOverlap(a: Log, b: Log): boolean { return Math.abs(a.x - b.x) < (a.width + b.width) / 2 + 6 && Math.abs(a.y - b.y) < (a.height + b.height) / 2 + 6; }
export function sandBottom(x: number): number { return x < 500 ? 475 + (x - 280) * .5 : x < 760 ? 585 + (x - 500) * .14 : 621.4 - (x - 760) * .18; }
function moveLog(s: CoastMemoryState, p: Driftwood, index: number, target: Point): void {
  const log = p.logs[index], start = { x: log.x, y: log.y }, span = distance(start, target), steps = Math.max(1, Math.ceil(span / 12));
  for (let i = 1; i <= steps; i++) {
    const x = clamp(start.x + (target.x - start.x) * i / steps, 280 + log.width / 2, 945 - log.width / 2);
    const y = clamp(start.y + (target.y - start.y) * i / steps, 205 + x * .25 + log.height / 2, sandBottom(x) - log.height / 2);
    const next = { ...log, x, y };
    if (p.logs.some((other, j) => j !== index && logsOverlap(next, other)) || logBlocks(next, crabPoint(p.crab))) break;
    log.x = x; log.y = y;
  }
  if (distance(log, start) > 1) { s.acted = true; s.gesture = 'drag'; }
}
function moveBoat(s: CoastMemoryState, p: Mooring, target: Point): void {
  if (p.phase.kind !== 'sailing') return;
  const before = p.boat, next = { x: clamp(target.x, 493, 896), y: clamp(target.y, 335, 582) }, dt = Math.max(.025, s.age - p.phase.lastMove);
  p.phase.velocity = { x: clamp((next.x - before.x) / dt, -200, 200), y: clamp((next.y - before.y) / dt, -200, 200) };
  p.phase.lastMove = s.age; p.phase.travel += distance(before, next); p.phase.released = false; p.boat = next;
  s.acted = true; s.gesture = 'drag';
}
function released(s: CoastMemoryState, input: MiniInput): CoastMemoryState {
  const p = s.session, at = validPoint(input);
  if (p.kind === 'driftwood') { p.drag = null; }
  else if (p.kind === 'mooring' && p.phase.kind === 'sailing' && p.phase.drag) {
    p.phase.drag = null; p.phase.released = true; p.phase.velocity.x *= .08; p.phase.velocity.y *= .08;
    s.feedback = distance(p.boat, DOCK) < 46 ? '松开了，让船在渡头旁慢慢停稳。' : '再靠近一点，左侧的渡头就在前面。';
  } else if (p.kind === 'mooring' && p.phase.kind === 'rope' && p.phase.holding) {
    if (at) p.phase.end = at;
    if (distance(p.phase.end, POST) <= Math.max(43, radius(input))) { p.phase = { kind: 'tied', elapsed: 0 }; s.play.progress = .94; s.feedback = '绳圈套好了，小船在水面上轻轻晃。'; emit(s, 'coast-rope-tied', POST.x); }
    else { p.phase.holding = false; p.phase.end = boatRope(p.boat); s.feedback = '把船头的绳圈拖到渡头上的木桩，再松手。'; }
  }
  s.dragging = false; return s;
}
export function actCoast(s: CoastMemoryState, input: MiniInput): CoastMemoryState {
  if (s.play.complete) return s;
  if (s.session.kind === 'birdsong') {
    const p = s.session;
    if (input.action === 'echo-repeat') { repeatBirdsong(p); s.feedback = birdsongFeedback(p); return s; }
    const at = validPoint(input);
    if (input.phase !== 'press' || !at) return s;
    const layout = birdsongLayout(input.viewWidth ?? WIDTH, input.viewHeight ?? HEIGHT), pad = Math.max(65 * layout.scale / .25, radius(input));
    const bird = BIRDS.find(bird => distance(at, { x: layout.perches[bird].x, y: layout.perches[bird].y - layout.headOffset }) <= pad);
    if (bird !== undefined) echoReply(s, p, bird);
    return s;
  }
  if (input.phase === 'release') { moveCoast(s, input); return released(s, input); }
  const at = validPoint(input); if (!at || input.phase !== 'press') return s;
  s.x = at.x / WIDTH; s.y = at.y / HEIGHT;
  const p = s.session, pad = radius(input);
  if (p.kind === 'driftwood') {
    const candidates = p.logs.map((log, index) => ({ log, index })).filter(({ log }) => Math.abs(log.x - at.x) < log.width / 2 + pad && Math.abs(log.y - at.y) < log.height / 2 + pad).sort((a, b) => distance(a.log, at) - distance(b.log, at));
    const picked = candidates[0]; if (!picked) return s;
    p.focus = picked.index; p.drag = { index: picked.index, offset: { x: at.x - picked.log.x, y: at.y - picked.log.y } }; s.dragging = true; s.feedback = '轻轻挪开，给它留出能横着经过的空隙。'; emit(s, 'coast-wood-pick', at.x);
  } else if (p.phase.kind === 'sailing' && Math.abs(at.x - p.boat.x) < 100 + pad && Math.abs(at.y - p.boat.y) < 44 + pad) {
    p.phase.drag = { x: at.x - p.boat.x, y: at.y - p.boat.y }; p.phase.velocity = { x: 0, y: 0 }; p.phase.released = false; s.dragging = true; s.feedback = '靠近左侧渡头，再松手。';
  } else if (p.phase.kind === 'rope' && distance(at, boatRope(p.boat)) < 27 + pad) {
    p.phase.holding = true; p.phase.end = at; s.dragging = true; s.feedback = '把绳圈套到渡头上的木桩。'; emit(s, 'coast-rope-pick', at.x);
  }
  return s;
}
export function moveCoast(s: CoastMemoryState, input: MiniInput): CoastMemoryState {
  const at = validPoint(input); if (!at || s.play.complete) return s;
  const p = s.session; s.x = at.x / WIDTH; s.y = at.y / HEIGHT;
  if (p.kind === 'driftwood' && p.drag) moveLog(s, p, p.drag.index, { x: at.x - p.drag.offset.x, y: at.y - p.drag.offset.y });
  else if (p.kind === 'mooring') {
    if (p.phase.kind === 'sailing' && p.phase.drag) moveBoat(s, p, { x: at.x - p.phase.drag.x, y: at.y - p.phase.drag.y });
    else if (p.phase.kind === 'rope' && p.phase.holding) p.phase.end = { x: clamp(at.x, 30, 950), y: clamp(at.y, 180, 600) };
  }
  return s;
}
export function cancelCoast(s: CoastMemoryState): CoastMemoryState {
  const p = s.session; s.dragging = false;
  if (p.kind === 'driftwood') p.drag = null;
  else if (p.kind === 'mooring' && p.phase.kind === 'sailing') { p.phase.drag = null; p.phase.released = false; p.phase.velocity = { x: 0, y: 0 }; p.phase.stable = 0; }
  else if (p.kind === 'mooring' && p.phase.kind === 'rope') { p.phase.holding = false; p.phase.end = boatRope(p.boat); }
  return s;
}
export function tickCoast(s: CoastMemoryState, dt: number): CoastMemoryState {
  if (s.done || !Number.isFinite(dt) || dt <= 0) return s; dt = Math.min(.05, dt); s.age += dt;
  if (s.play.complete) { s.done = s.play.completedAt !== null && s.age - s.play.completedAt >= 1.7; return s; }
  const p = s.session;
  if (p.kind === 'driftwood') {
    const next = Math.min(1, p.crab + dt * .073); p.moving = s.acted && !p.logs.some(log => logBlocks(log, crabPoint(next)));
    if (p.moving) p.crab = next;
    const cleared = p.logs.filter(logClear).length; s.play.progress = Math.min(.94, cleared * .17 + p.crab * .43);
    if (s.acted && !s.dragging) s.feedback = p.moving ? '路让出来了，它正沿着沙地慢慢经过。' : '前面还有一根漂木，再给它让一点空间。';
    if (p.crab === 1 && !s.dragging) complete(s, '它走过去了，沙地上留下浅浅的足迹。');
  } else if (p.kind === 'mooring') {
    const phase = p.phase;
    if (phase.kind === 'sailing') {
      if (!phase.drag) { const damping = Math.exp(-dt * 7); phase.velocity.x *= damping; phase.velocity.y *= damping; p.boat.x = clamp(p.boat.x + phase.velocity.x * dt, 493, 896); p.boat.y = clamp(p.boat.y + phase.velocity.y * dt, 335, 582); }
      s.play.progress = s.acted ? clamp((1 - distance(p.boat, DOCK) / 340) * .65, .02, .65) : 0;
      const near = distance(p.boat, DOCK) < 43 && Math.hypot(phase.velocity.x, phase.velocity.y) < 14;
      phase.stable = phase.released && phase.travel > 100 && near ? phase.stable + dt : 0;
      if (phase.stable >= .65) { p.phase = { kind: 'landing', from: { ...p.boat }, elapsed: 0 }; s.feedback = '船靠稳了，船头还放着一个绳圈。'; emit(s, 'coast-boat-touch', p.boat.x); }
    } else if (phase.kind === 'landing') {
      phase.elapsed += dt; const t = Math.min(1, phase.elapsed / .7), ease = t * t * (3 - 2 * t); p.boat = { x: phase.from.x + (DOCK.x - phase.from.x) * ease, y: phase.from.y + (DOCK.y - phase.from.y) * ease };
      if (t === 1) { p.phase = { kind: 'rope', end: boatRope(p.boat), holding: false }; s.play.progress = .78; s.feedback = '把船头的绳圈拖到木桩上，系好这段慢潮。'; }
    } else if (phase.kind === 'tied') { phase.elapsed += dt; if (phase.elapsed >= 1.4) complete(s, '绳结稳了，村落与小船的倒影慢慢聚拢。'); }
  } else {
    const bird = tickBirdsong(p, dt);
    if (bird !== null) s.events.push({ serial: ++s.serial, type: 'coast-bird-call', x: PERCHES[bird].x / WIDTH, index: bird });
    s.play.progress = Math.min(.94, ((p.round === 0 ? 0 : 2) + p.matched) / 5 * .94);
    s.feedback = birdsongFeedback(p);
    if (p.phase.kind === 'finished' && s.acted) complete(s, s.feedback);
  }
  if (s.events.length > 10) s.events.splice(0, s.events.length - 10);
  return s;
}
export function keyCoast(s: CoastMemoryState, key: string, phase: 'down' | 'up'): CoastMemoryState | null {
  if (phase === 'up' || s.play.complete) return null;
  const arrows: Record<string, Point> = { ArrowLeft: { x: -18, y: 0 }, ArrowRight: { x: 18, y: 0 }, ArrowUp: { x: 0, y: -18 }, ArrowDown: { x: 0, y: 18 } }, direction = arrows[key], p = s.session;
  if (p.kind === 'birdsong') {
    const bird = key === '1' ? 0 : key === '2' ? 1 : key === '3' ? 2 : null;
    if (bird !== null) { echoReply(s, p, bird); return s; }
    if (key === ' ' || key === 'Enter') { repeatBirdsong(p); s.feedback = birdsongFeedback(p); return s; }
    return null;
  }
  if (p.kind === 'driftwood') {
    if (/^[1-3]$/.test(key)) { p.focus = Number(key) - 1; return s; }
    if (!direction) return null; const log = p.logs[p.focus]; moveLog(s, p, p.focus, { x: log.x + direction.x, y: log.y + direction.y }); return s;
  }
  if (p.phase.kind === 'sailing') {
    if (direction) { moveBoat(s, p, { x: p.boat.x + direction.x, y: p.boat.y + direction.y }); p.phase.velocity = { x: 0, y: 0 }; return s; }
    if (key === 'Enter' || key === ' ') { p.phase.released = true; p.phase.velocity = { x: 0, y: 0 }; return s; }
  } else if (p.phase.kind === 'rope') {
    if (key === 'Enter' || key === ' ') { if (!p.phase.holding) { p.phase.holding = true; s.dragging = true; s.acted = true; } else released(s, { x: p.phase.end.x, y: p.phase.end.y }); return s; }
    if (direction && p.phase.holding) { p.phase.end = { x: clamp(p.phase.end.x + direction.x, 30, 950), y: clamp(p.phase.end.y + direction.y, 180, 600) }; return s; }
  }
  return null;
}
