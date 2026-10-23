import type { GameEvent, GameKind, MiniState } from '../contracts';

export type MemoryKind = 'bends' | 'inn' | 'waterfall' | 'river';
export interface Point { x: number; y: number }
export interface Rect extends Point { width: number; height: number }
export const MEMORY_SPECS = {
  'tiger-bends-puzzle-v4': { kind: 'bends', game: 'tiger-climb', title: '转过山弯', badge: '山弯初见', prompt: '从起点沿箭头描过 S 弯，画到山肩后松手出发。', keys: '方向键移笔，按住空格或 Enter 落笔，松开后启程；R 重试。', memory: '我沿着山坡画下一道 S 弯，小人循着山路走上山肩。山弯转过，金沙江的白浪在峡谷里奔流，江声慢慢涌了上来。' },
  'tiger-inn-pairs-v4': { kind: 'inn', game: 'tiger-rest', title: '记住山色', badge: '半山灯火', prompt: '翻开四张画片，找到两对相同的风景。', keys: '方向键选画片，Enter 翻开。', memory: '在中途客栈的桌边认出两对山影与窗灯。山色暗下来，窗里亮起暖光，今晚就在这里歇脚。' },
  'tiger-waterfall-paint-v4': { kind: 'waterfall', game: 'tiger-passage', title: '涂一页山色', badge: '崖间飞瀑', prompt: '蘸一点颜色，把岩壁与草木两处留白涂上山色。', keys: '1–3 选颜料；方向键移动笔，按住空格落笔。', memory: '在龙洞瀑布附近停下，用自己选的颜色涂过岩壁和草木。水声落在山径边，山色留在这一页。' },
  'tiger-river-roundframe-v4': { kind: 'river', game: 'tiger-river', title: '把江声留下', badge: '江声入峡', prompt: '拖动圆形取景窗，把巨石和白浪一起装进去，松手拍下。', keys: '方向键移动取景窗，Enter 拍下；巨石和近旁白浪都要入窗。', memory: '沿张老师小路来到中虎跳江边，把江心巨石和它旁边的一段白浪一起放进圆窗，留下当时亲手选定的构图。' },
} satisfies Record<string, { kind: MemoryKind; game: GameKind; title: string; badge: string; prompt: string; keys: string; memory: string }>;
export type MemoryId = keyof typeof MEMORY_SPECS;
export const memoryId = (id: string): id is MemoryId => Object.hasOwn(MEMORY_SPECS, id);
export const MEMORY_IDS = Object.keys(MEMORY_SPECS).filter(memoryId);
export const sceneFile = (kind: MemoryKind) => `scenes/tiger-memories-v4/${kind}.webp`;
export const badgeFile = (kind: MemoryKind) => `badges/tiger-memories-v4/${kind}.webp`;
export const clamp = (value: number, low: number, high: number) => Math.max(low, Math.min(high, value));
export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export const inside = (p: Point, r: Rect) => p.x >= r.x && p.y >= r.y && p.x <= r.x + r.width && p.y <= r.y + r.height;

export type MemoryFlow = { kind: 'playing' } | { kind: 'settling'; at: number } | { kind: 'capturing' } | { kind: 'capture-error' } | { kind: 'complete'; art: string };
export type RoadPhase =
  | { kind: 'drawing'; progress: number; pen: { kind: 'up' } | { kind: 'down'; last: Point }; cursor: Point; keyboard: boolean }
  | { kind: 'walking'; elapsed: number; progress: number }
  | { kind: 'river'; elapsed: number };
export interface RoadMemory { kind: 'bends'; phase: RoadPhase }
export interface Pairs { kind: 'inn'; order: readonly number[]; open: number[]; matched: number[]; turnAt: number | null; focus: number }
export interface BrushStroke { color: number; points: Point[] }
export interface Paint { kind: 'waterfall'; color: number; strokes: BrushStroke[]; coverage: [number[], number[]]; brush: Point; drawing: boolean; keyHeld: boolean; keyboard: boolean; reveal: number }
export interface Frame { kind: 'river'; center: Point; drag: { offset: Point; moved: boolean } | null; adjusted: boolean; shot: { center: Point; wave: number; portrait: boolean } | null }
export type MemorySession = RoadMemory | Pairs | Paint | Frame;

export class MemoryState implements MiniState {
  readonly route = 'tiger';
  readonly kind: MemoryKind;
  readonly game: GameKind;
  age = 0; acted = false; dragging = false; gesture = 'tap'; done = false; x = .5; y = .5;
  play: { type: string; progress: number; complete: boolean; completedAt: number | null; reduced: boolean } = { type: 'tiger-memory', progress: 0, complete: false, completedAt: null, reduced: false };
  events: GameEvent[] = []; serial = 0; feedback: string;
  flow: MemoryFlow = { kind: 'playing' };
  portrait = false;
  wave = 0;
  session: MemorySession;
  constructor(readonly id: MemoryId, reduced: boolean, order: readonly number[] = [0, 1, 1, 0]) {
    const spec = MEMORY_SPECS[id]; this.kind = spec.kind; this.game = spec.game; this.feedback = spec.prompt; this.play.reduced = reduced;
    switch (spec.kind) {
      case 'bends': this.session = { kind: 'bends', phase: { kind: 'drawing', progress: 0, pen: { kind: 'up' }, cursor: { x: 178 * 1000 / 724, y: 479 * 750 / 543 }, keyboard: false } }; break;
      case 'inn': this.session = { kind: 'inn', order, open: [], matched: [], turnAt: null, focus: 0 }; break;
      case 'waterfall': this.session = { kind: 'waterfall', color: 0, strokes: [], coverage: [[], []], brush: { x: .35, y: .45 }, drawing: false, keyHeld: false, keyboard: false, reveal: 0 }; break;
      case 'river': this.session = { kind: 'river', center: { x: .23, y: .3 }, drag: null, adjusted: false, shot: null }; break;
    }
  }
}

export function fork(s: MemoryState): MemoryState {
  const n = new MemoryState(s.id, s.play.reduced); Object.assign(n, s);
  n.play = { ...s.play }; n.events = s.events.slice(-15);
  switch (s.session.kind) {
    case 'bends': n.session = { ...s.session, phase: s.session.phase.kind === 'drawing' ? { ...s.session.phase, pen: s.session.phase.pen.kind === 'down' ? { kind: 'down', last: { ...s.session.phase.pen.last } } : { kind: 'up' }, cursor: { ...s.session.phase.cursor } } : { ...s.session.phase } }; break;
    case 'inn': n.session = { ...s.session, open: s.session.open.slice(), matched: s.session.matched.slice() }; break;
    case 'waterfall': n.session = { ...s.session, brush: { ...s.session.brush }, strokes: s.session.strokes.slice(), coverage: [s.session.coverage[0].slice(), s.session.coverage[1].slice()] }; break;
    case 'river': n.session = { ...s.session, center: { ...s.session.center }, drag: s.session.drag ? { ...s.session.drag } : null }; break;
  }
  return n;
}
export function stateOf(base: MiniState): MemoryState { if (!(base instanceof MemoryState)) throw new Error('虎跳峡互动状态不匹配'); return base; }
export function emit(s: MemoryState, type: string, index = 0): void { s.events.push({ serial: ++s.serial, type, x: .5, index }); }
export function settle(s: MemoryState): void { if (s.flow.kind === 'playing') { s.flow = { kind: 'settling', at: s.age }; s.dragging = false; } }
