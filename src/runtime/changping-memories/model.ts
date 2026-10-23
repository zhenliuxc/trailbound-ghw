import type { MiniInput, MiniState, MomentEntry } from '../contracts';

import { CHANGPING_MEMORIES, changpingMemoryId, type ChangpingMemoryId } from '../../content/changping-memories';
export { CHANGPING_MEMORIES, CHANGPING_MEMORY_IDS, changpingMemoryId } from '../../content/changping-memories';
export type { ChangpingMemoryId } from '../../content/changping-memories';
export interface Point { x: number; y: number }
export const SHADOW_X = [.22, .5, .78] as const;
export const SHADOW_ANSWER = [2, 0] as const;
export const CORD_ENDS: readonly Point[] = [{ x: .74, y: .55 }, { x: .26, y: .61 }];
export const PATH_PAGE = { x: .08, y: .62, width: .84, height: .36 };
export function leafFrame(width: number, height: number) {
  const size = Math.min(width * .58, height * .62);
  return { x: width * .5 - size / 2, y: height * .57 - size / 2, size };
}
const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
const near = (a: Point, b: Point, radius = .1) => Math.hypot(a.x - b.x, a.y - b.y) <= radius;
export function insideLeaf(x: number, y: number): boolean {
  return ((x - .5) / .34) ** 2 + ((y - .5) / .44) ** 2 < 1;
}
export const PRINT_CELLS = Array.from({ length: 15 * 18 }, (_, i) => ({
  x: (i % 15 + .5) / 15,
  y: (Math.floor(i / 15) + .5) / 18,
})).filter(p => insideLeaf(p.x, p.y));
type Scene =
  | { kind: 'branches'; round: 0 | 1; found: number; selected: number | null; settle: number }
  | { kind: 'cords'; opened: number; held: number | null; tug: number; end: Point }
  | { kind: 'path'; offset: number; grab: { y: number; offset: number } | null; walked: number }
  | { kind: 'print'; strokes: Point[][]; cells: Set<number>; current: Point[] | null };

export class ChangpingMemoryState implements MiniState {
  readonly kind = 'changping-memory';
  readonly route = 'changping';
  readonly id: ChangpingMemoryId;
  readonly scene: Scene;
  readonly play = { type: 'changping-memory', progress: 0, complete: false, completedAt: null as number | null };
  phase: 'play' | 'reveal' = 'play';
  age = 0; acted = false; dragging = false; gesture = 'tap'; done = false; x = .5; y = .65;
  reveal = 0; sounds = 0; mistake = 0; keyboard = false;
  private rubbingSoundAt = 0;
  private width = 1000; private height = 700;
  feedback: string;
  constructor(entry: MomentEntry, readonly reduced: boolean) {
    if (!changpingMemoryId(entry.id)) throw new Error('无法读取长坪沟互动');
    this.id = entry.id;
    const spec = CHANGPING_MEMORIES[this.id]; this.feedback = spec.prompt;
    switch (spec.kind) {
      case 'branches': this.scene = { kind: 'branches', round: 0, found: 0, selected: null, settle: 0 }; break;
      case 'cords': this.scene = { kind: 'cords', opened: 0, held: null, tug: 0, end: { ...CORD_ENDS[0] } }; break;
      case 'path': this.scene = { kind: 'path', offset: .18, grab: null, walked: 0 }; break;
      case 'print': this.scene = { kind: 'print', strokes: [], cells: new Set(), current: null }; break;
    }
  }
  private finish(): void {
    if (this.phase !== 'play') return;
    this.phase = 'reveal'; this.reveal = 0; this.dragging = false; this.play.progress = 1; this.sounds++;
    this.feedback = this.scene.kind === 'branches' ? '认出来了。让溪水再晃一会儿。' : this.scene.kind === 'cords' ? '铃响了，山谷里传来轻轻的回声。' : this.scene.kind === 'path' ? '路接好了。沿着纸上的小径，走进开阔处。' : '这一片秋色，会连同你的笔触留在手帐里。';
  }
  input(p: MiniInput, move = false): this {
    if (this.phase !== 'play' || this.done) return this;
    if (p.phase === 'release') return this.release();
    this.width = p.viewWidth ?? this.width; this.height = p.viewHeight ?? this.height;
    const x = clamp(p.x ?? this.x), y = clamp(p.y ?? this.y);
    this.x = x; this.y = y; this.gesture = move ? 'drag' : 'tap';
    const s = this.scene;
    switch (s.kind) {
      case 'branches': {
        if (move || s.settle > 0) break;
        const selected = SHADOW_X.findIndex(cx => Math.abs(x - cx) < .12 && Math.abs(y - .7) < .2);
        if (selected < 0) break;
        this.acted = true; s.selected = selected;
        if (selected === SHADOW_ANSWER[s.round]) {
          s.found++; s.settle = 1.25; this.play.progress = s.found / 2; this.sounds++;
          this.feedback = s.found === 1 ? '是这一枝。再看看那根弯弯的枝桠。' : '两种枝影都认出来了。';
        } else { this.mistake = 1.1; this.feedback = '看看分叉的方向，再试一枝。'; }
        break;
      }
      case 'cords': {
        if (!move) {
          const index = CORD_ENDS.findIndex((end, i) => i >= s.opened && near({ x, y }, end, .12));
          if (index < 0) break;
          this.acted = true; this.dragging = true; s.held = index; s.end = { x, y };
        } else if (this.dragging && s.held !== null) {
          s.end = { x, y };
          if (s.held !== s.opened) { s.tug = .9; this.feedback = '这根还被压着，先看看上面的绳头。'; break; }
          const opened = s.opened === 0 ? x > .8 && y < .46 : x < .2 && y < .48;
          if (opened) {
            s.opened++; s.held = null; this.dragging = false; this.play.progress = s.opened / 2; this.sounds++;
            if (s.opened === 2) this.finish();
            else this.feedback = '上面的一圈松开了，再拉开左边的绳头。';
          }
        }
        break;
      }
      case 'path': {
        if (!move && x > PATH_PAGE.x && x < PATH_PAGE.x + PATH_PAGE.width && y > PATH_PAGE.y + s.offset && y < PATH_PAGE.y + PATH_PAGE.height + s.offset) {
          s.grab = { y, offset: s.offset }; this.dragging = true; this.acted = true;
        } else if (move && s.grab && this.dragging) {
          s.offset = clamp(s.grab.offset + y - s.grab.y, -.16, .22);
          this.play.progress = clamp(1 - Math.abs(s.offset) / .18) * .85;
          this.feedback = Math.abs(s.offset) < .035 ? '两段路接上了，松手出发。' : CHANGPING_MEMORIES[this.id].prompt;
        }
        break;
      }
      case 'print': {
        const frame = leafFrame(this.width, this.height);
        const px = (x * this.width - frame.x) / frame.size, py = (y * this.height - frame.y) / frame.size;
        if (!move) { this.dragging = true; this.acted = true; s.current = []; s.strokes.push(s.current); }
        if (!this.dragging || !s.current || !insideLeaf(px, py)) break;
        const last = s.current.at(-1);
        if (last && near(last, { x: px, y: py }, .006)) break;
        if (s.current.length < 1600 && s.strokes.length < 120) s.current.push({ x: px, y: py });
        if (last) {
          const steps = Math.max(1, Math.ceil(Math.hypot(px - last.x, py - last.y) / .012));
          for (let j = 0; j <= steps; j++) this.rub({ x: last.x + (px - last.x) * j / steps, y: last.y + (py - last.y) * j / steps });
        }
        if (last) this.rub({ x: px, y: py });
        if (last && this.age - this.rubbingSoundAt > .35) { this.sounds++; this.rubbingSoundAt = this.age; }
        this.play.progress = Math.min(.98, s.cells.size / PRINT_CELLS.length / .65);
        this.feedback = this.play.progress >= .98 ? '叶脉已显出，松手把秋色留下。' : '顺着叶形轻擦，细细的叶脉正在显出来。';
        break;
      }
    }
    return this;
  }
  private rub(p: Point): void {
    if (this.scene.kind !== 'print') return;
    PRINT_CELLS.forEach((cell, i) => { if (near(p, cell, .085) && this.scene.kind === 'print') this.scene.cells.add(i); });
  }
  release(commit = true): this {
    this.dragging = false;
    if (this.scene.kind === 'cords') this.scene.held = null;
    if (this.scene.kind === 'path') {
      const hadGrab = this.scene.grab !== null; this.scene.grab = null;
      if (commit && hadGrab && Math.abs(this.scene.offset) < .035) { this.scene.offset = 0; this.finish(); }
    }
    if (this.scene.kind === 'print') {
      this.scene.current = null;
      if (commit && this.scene.cells.size / PRINT_CELLS.length >= .65) this.finish();
    }
    return this;
  }
  tick(dt: number): this {
    if (!Number.isFinite(dt) || dt <= 0 || this.done) return this;
    const step = Math.min(dt, .1); this.age += step; this.mistake = Math.max(0, this.mistake - step);
    const s = this.scene;
    if (s.kind === 'cords') s.tug = Math.max(0, s.tug - step);
    if (s.kind === 'branches' && s.settle > 0) {
      s.settle = Math.max(0, s.settle - step);
      if (s.settle === 0) { if (s.found === 2) this.finish(); else { s.round = 1; s.selected = null; } }
    }
    if (this.phase === 'reveal') {
      this.reveal += step;
      if (s.kind === 'path') s.walked = clamp(this.reveal / (this.reduced ? 2.6 : 6.5));
      const duration = s.kind === 'path' ? this.reduced ? 4 : 8 : this.reduced ? 1.5 : 3.5;
      if (this.reveal >= duration) { this.done = true; this.play.complete = true; this.play.completedAt = this.age; }
    }
    return this;
  }
  key(key: string, phase: 'down' | 'up'): this | null {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter', '1', '2', '3'].includes(key)) return null;
    this.keyboard = true;
    if (phase === 'up') { if (key === ' ' || key === 'Enter') this.release(); return this; }
    if (this.scene.kind === 'branches' && ['1', '2', '3'].includes(key)) return this.input({ x: SHADOW_X[Number(key) - 1], y: .7 });
    if (key === ' ' || key === 'Enter') { if (!this.dragging) this.input({ x: this.x, y: this.y }); return this; }
    const x = clamp(this.x + (key === 'ArrowRight' ? .035 : key === 'ArrowLeft' ? -.035 : 0));
    const y = clamp(this.y + (key === 'ArrowDown' ? .035 : key === 'ArrowUp' ? -.035 : 0));
    if (this.dragging) this.input({ x, y }, true); else { this.x = x; this.y = y; }
    return this;
  }
}
