import type { MiniInput, MiniState, MomentEntry, RouteId } from '../contracts';

export const DAY_MEMORIES = {
  'valley-moss': { kind: 'reflection', title: '把枝影留在水里', prompt: '轻拖水中的倒影，让岸上的枯树与枝影相接。', memory: '我把错开的枝影轻轻合上，清水里又长出一棵树。' },
  'valley-bridge': { kind: 'lichen', title: '石头上，也有一片森林', prompt: '拖动透镜，慢慢看过红石表面的细小纹理。', memory: '红石的纹理在透镜里展开，山野也藏在很小的地方。' },
  'valley-reflection': { kind: 'vista', title: '走出森林，雪山就在眼前', prompt: '向两边拨开林缘，给远处的雪山让出视野。', memory: '林缘退开，溪谷、草甸和雪山在眼前连成了一幅画。' },
  'bamboo-drop': { kind: 'rain', title: '接一小段竹雨', prompt: '移动竹筒，接住叶尖落下的四滴雨，听它们落成一段短音。', memory: '四滴竹雨落进筒里，一深一浅，像山林写来的短曲。' },
  'bamboo-step': { kind: 'steps', title: '拂开落叶，沿古道上山', prompt: '轻扫石阶上的落叶，露出脚下的路，再看旅人走过山弯。', memory: '拂开雨后的落叶，石阶重新显出轮廓，脚步沿着竹林上山。' },
  'bamboo-leaf': { kind: 'wind', title: '借一阵风，送出叶笺', prompt: '看叶梢的方向，等风朝向远山时轻点，送出一枚叶笺。', memory: '我等来一阵顺风，看一枚叶笺穿过竹隙，慢慢飞向远山。' },
  'westlake-floating-leaf': { kind: 'leaf', title: '推一圈水纹，送落叶过溪', prompt: '轻点落叶后方的水面，用水纹把它推向下游。', memory: '水纹轻轻推着落叶，绕过溪石，带着我的目光漂向下游。' },
  'westlake-stones': { kind: 'stones', title: '踏石听溪', prompt: '轻点前方相连的溪石，让旅人走过浅溪，听脚下的水声。', memory: '我顺着三块相连的溪石走过去，水声在脚边一近一远。' },
  'westlake-tea': { kind: 'tea', title: '一芽两叶，留一页春天', prompt: '认出一枚细嫩的芽和两片嫩叶，点选它们留在手帐里。', memory: '一枚嫩芽和两片新叶，在纸上拼成了今天的春天。' },
  'westlake-eaves': { kind: 'brew', title: '慢慢注水，等一盏茶', prompt: '按住茶盏注水，水面过半后松手，看茶叶慢慢舒展。', memory: '水温让叶子慢慢舒展。村口的一盏茶，收住了今天的溪声。' },
} as const;
export type DayMemoryId = keyof typeof DAY_MEMORIES;
export function dayMemoryId(value: string): value is DayMemoryId { return Object.hasOwn(DAY_MEMORIES, value); }
type Point = { x: number; y: number };
export const STONES: readonly Point[] = [{ x: .34, y: .79 }, { x: .52, y: .69 }, { x: .69, y: .58 }];
export const TEA: readonly (Point & { young: boolean; bud: boolean })[] = [
  { x: .28, y: .46, young: true, bud: true }, { x: .52, y: .46, young: false, bud: false }, { x: .74, y: .46, young: true, bud: false },
  { x: .28, y: .73, young: false, bud: false }, { x: .51, y: .73, young: true, bud: false }, { x: .74, y: .73, young: false, bud: false },
];
export const STEP_LEAVES: readonly Point[] = Array.from({ length: 12 }, (_, i) => ({ x: .38 + i % 4 * .085 + Math.floor(i / 4) * .05, y: .82 - Math.floor(i / 4) * .13 }));
const RAIN = [.28, .67, .43, .72];
const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));
type Scene =
  | { kind: 'reflection'; offset: number; still: number }
  | { kind: 'lichen'; cells: Set<number> }
  | { kind: 'vista'; opened: number }
  | { kind: 'rain'; cup: number; target: number; drop: number; count: number; wait: number }
  | { kind: 'steps'; cleared: Set<number> }
  | { kind: 'wind'; gust: number }
  | { kind: 'leaf'; distance: number; impulse: number }
  | { kind: 'stones'; index: number; walking: number }
  | { kind: 'tea'; picked: Set<number> }
  | { kind: 'brew'; water: number; steep: number; released: boolean };
function sceneFor(id: DayMemoryId): Scene {
  switch (DAY_MEMORIES[id].kind) {
    case 'reflection': return { kind: 'reflection', offset: .23, still: 0 };
    case 'lichen': return { kind: 'lichen', cells: new Set() };
    case 'vista': return { kind: 'vista', opened: 0 };
    case 'rain': return { kind: 'rain', cup: .5, target: .5, drop: .16, count: 0, wait: .8 };
    case 'steps': return { kind: 'steps', cleared: new Set() };
    case 'wind': return { kind: 'wind', gust: 0 };
    case 'leaf': return { kind: 'leaf', distance: 0, impulse: 0 };
    case 'stones': return { kind: 'stones', index: 0, walking: 0 };
    case 'tea': return { kind: 'tea', picked: new Set() };
    case 'brew': return { kind: 'brew', water: 0, steep: 0, released: false };
  }
}
export class DayMemoryState implements MiniState {
  readonly id: DayMemoryId; readonly route: RouteId; readonly kind = 'day-memory';
  readonly scene: Scene;
  readonly play = { type: 'day-memory', progress: 0, complete: false, completedAt: 0 };
  age = 0; acted = false; dragging = false; gesture = 'tap'; done = false; x = .5; y = .65;
  phase: 'play' | 'reveal' = 'play'; reveal = 0; feedback: string; sounds = 0;
  constructor(entry: MomentEntry, readonly reduced: boolean) {
    if (!dayMemoryId(entry.id)) throw new Error('未知山野互动');
    this.id = entry.id; this.route = entry.route; this.scene = sceneFor(this.id); this.feedback = DAY_MEMORIES[this.id].prompt;
  }
  private found(): void { this.phase = 'reveal'; this.reveal = 0; this.dragging = false; this.play.progress = 1; this.feedback = '把这一刻多留一会儿…'; this.sounds++; }
  input(p: MiniInput, move = false): this {
    if (p.phase === 'release') { this.dragging = false; if (this.scene.kind === 'brew' && this.scene.water >= .45) this.scene.released = true; return this; }
    if (this.phase !== 'play' || this.done || p.action === 'outside-scene') return this;
    const previous = this.x; this.x = clamp(p.x ?? this.x); this.y = clamp(p.y ?? this.y); this.acted = true;
    this.dragging = move || p.phase === 'press'; this.gesture = move ? 'drag' : 'tap';
    const s = this.scene;
    switch (s.kind) {
      case 'reflection': if (move && this.y > .48) { s.offset = clamp(s.offset + this.x - previous, -.35, .35); s.still = 0; this.play.progress = 1 - Math.min(1, Math.abs(s.offset) / .23); } break;
      case 'lichen': {
        const u = (this.x - .25) / .5, v = (this.y - .35) / .48;
        if (u >= 0 && u < 1 && v >= 0 && v < 1) { s.cells.add(Math.floor(u * 4) + Math.floor(v * 3) * 4); this.play.progress = s.cells.size / 8; }
        if (s.cells.size >= 8) this.found(); break;
      }
      case 'vista': if (move) { s.opened = clamp(s.opened + Math.abs(this.x - previous) * 1.5); this.play.progress = s.opened; if (s.opened >= 1) this.found(); } break;
      case 'rain': s.target = clamp(this.x, .16, .84); break;
      case 'steps': STEP_LEAVES.forEach((leaf, i) => { if (Math.hypot(this.x - leaf.x, this.y - leaf.y) < .09) s.cleared.add(i); }); this.play.progress = s.cleared.size / 10; if (s.cleared.size >= 10) this.found(); break;
      case 'wind': if (!move && s.gust > .05) this.found(); else this.feedback = '等叶梢朝向远山，再轻点送出。'; break;
      case 'leaf': { const leaf = leafPosition(s.distance); if (this.x < leaf.x + .05 && Math.hypot(this.x - leaf.x, this.y - leaf.y) < .25) { s.impulse = Math.min(1, s.impulse + .48); this.sounds++; this.feedback = '水纹推开了，再从落叶后方送它一程。'; } break; }
      case 'stones': if (!move && s.walking === 0 && s.index < STONES.length && Math.hypot(this.x - STONES[s.index].x, this.y - STONES[s.index].y) < .1) { s.walking = .001; this.sounds++; } break;
      case 'tea': if (!move) { const i = TEA.findIndex(t => Math.hypot(t.x - this.x, t.y - this.y) < .105); if (i >= 0 && TEA[i].young) { if (!s.picked.has(i)) this.sounds++; s.picked.add(i); this.play.progress = s.picked.size / 3; if (s.picked.size === 3) this.found(); } else this.feedback = '嫩芽细长，嫩叶更小、更浅绿。再看看。'; } break;
      case 'brew': if (!s.released) this.dragging = true; break;
    }
    this.play.progress = clamp(this.play.progress); return this;
  }
  release(): this { this.dragging = false; return this; }
  tick(dt: number): this {
    if (this.done) return this; this.age += dt;
    if (this.play.complete) { this.done = this.age - this.play.completedAt >= 1.2; return this; }
    if (this.phase === 'reveal') {
      this.reveal += dt;
      const duration = this.reduced ? 1.5 : this.scene.kind === 'vista' || this.scene.kind === 'steps' || this.scene.kind === 'wind' ? 5 : 2.6;
      if (this.reveal >= duration) { this.play.complete = true; this.play.completedAt = this.age; this.feedback = '已留住这一刻，正在收进手帐…'; }
      return this;
    }
    const s = this.scene;
    if (s.kind === 'wind') s.gust = Math.sin(this.age * .9);
    if (!this.acted) return this;
    if (s.kind === 'reflection' && Math.abs(s.offset) < .035 && !this.dragging) { s.still += dt; if (s.still > .8) this.found(); }
    if (s.kind === 'rain') {
      s.cup += (s.target - s.cup) * (1 - Math.exp(-dt * 12));
      if (s.wait > 0) s.wait -= dt;
      else { s.drop += dt * .23; if (s.drop >= .73) {
        if (Math.abs(s.cup - RAIN[s.count]) < .12) { s.count++; this.sounds++; this.play.progress = s.count / 4; this.feedback = `接住了 ${s.count} 声竹雨`; }
        else this.feedback = '雨落在筒旁了，下一滴还会从这片叶尖落下。';
        s.drop = .16; s.wait = .55; if (s.count === 4) this.found();
      } }
    }
    if (s.kind === 'leaf') { s.distance = clamp(s.distance + s.impulse * dt * .4); s.impulse = Math.max(0, s.impulse - dt * .22); this.play.progress = s.distance; if (s.distance >= 1) this.found(); }
    if (s.kind === 'stones' && s.walking > 0) { s.walking += dt / 1.2; if (s.walking >= 1) { s.walking = 0; s.index++; this.play.progress = s.index / 3; this.feedback = '下一块溪石，就在前面。'; if (s.index === 3) this.found(); } }
    if (s.kind === 'brew') { if (this.dragging && !s.released) s.water = clamp(s.water + dt * .3); if (s.water >= .45 && !s.released) this.feedback = '水面已经过半，可以松手，等茶叶舒展。'; if (s.released) { s.steep += dt; this.feedback = '茶叶慢慢舒展，溪声还在窗外。'; if (s.steep >= 4) this.found(); } this.play.progress = s.released ? .45 + .55 * clamp(s.steep / 4) : Math.min(.45, s.water); }
    return this;
  }
  key(key: string, phase: 'down' | 'up'): this | null {
    const supported = ['Enter',' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
    if (!supported.includes(key)) return null;
    if (phase === 'up') return this.input({ phase: 'release' });
    if (key.startsWith('Arrow')) return this.input({ x: this.x + (key === 'ArrowLeft' ? -.065 : key === 'ArrowRight' ? .065 : 0), y: this.y + (key === 'ArrowUp' ? -.09 : key === 'ArrowDown' ? .09 : 0) }, true).release();
    const s = this.scene;
    if (s.kind === 'reflection') return this.input({ x: this.x - s.offset, y: .65 }, true).release();
    if (s.kind === 'lichen') { const i = Array.from({ length: 12 }, (_, i) => i).find(i => !s.cells.has(i)) ?? 0; return this.input({ x: .25 + (i % 4 + .5) * .125, y: .35 + (Math.floor(i / 4) + .5) * .16 }); }
    if (s.kind === 'vista') return this.input({ x: this.x < .5 ? .9 : .1 }, true).release();
    if (s.kind === 'rain') return this.input({ x: RAIN[Math.min(3,s.count)] });
    if (s.kind === 'steps') { const i = STEP_LEAVES.findIndex((_, i) => !s.cleared.has(i)); return this.input(STEP_LEAVES[Math.max(0,i)], true).release(); }
    if (s.kind === 'leaf') { const p = leafPosition(s.distance); return this.input({ x: p.x - .08, y: p.y }); }
    if (s.kind === 'stones') return this.input(STONES[Math.min(2,s.index)]);
    if (s.kind === 'tea') return this.input(TEA.find((t, i) => t.young && !s.picked.has(i)) ?? {});
    return this.input({ phase: 'press' });
  }
}
export function rainX(state: DayMemoryState): number { return state.scene.kind === 'rain' ? RAIN[Math.min(3, state.scene.count)] : .5; }
export function leafPosition(t: number): Point { return { x: .24 + t * .53, y: .77 - t * .25 + Math.sin(t * Math.PI * 2) * .04 }; }
