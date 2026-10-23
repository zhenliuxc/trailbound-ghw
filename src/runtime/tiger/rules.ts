import type { GameEvent, MiniInput, MiniState, MomentEntry } from '../contracts';

export const TIGER_GAMES = Object.freeze({ 'gorge-goat': 'depth', 'gorge-eagle': 'packing', 'gorge-sparkle': 'score', 'tiger-bell-first': 'bells' } as const);
export type TigerKind = typeof TIGER_GAMES[keyof typeof TIGER_GAMES];
export const TITLES: Record<TigerKind, string> = { depth: '江谷回响', packing: '雪山同坐', score: '瀑布来风', bells: '铃声先到' };
export const PROMPTS: Record<TigerKind, string> = {
  depth: '点左右观景处比较远近，再拖动画片，按从近到远排列。',
  packing: '把五件随身物品拖进背包，留出袋口，再合上背包。',
  score: '点格子编一段八拍瀑声：用上两种声音，留一拍空白，再试听。',
  bells: '看铃纹、听方向，点山路岔口，沿铃声找到驮队。',
};
export const MEMORIES: Record<TigerKind, string> = {
  depth: '我在高路边换了两个站位。近崖移得快，远峰几乎不动；石径、金沙江和雪山，终于在四张画片里排出了峡谷的深浅。',
  packing: '客栈的椅子朝着雪山。我把水壶、雨衣、手帐、饭盒和围巾慢慢收进背包，留出袋口，带着这段歇脚继续走。',
  score: '水帘、落滴与谷风，被我编进了八拍小曲。留白的一拍里，江谷仍在回应；这一段瀑声留在了手帐里。',
  bells: '铃声先从山路转角传来。我在两个岔口辨清方向，终于看见赶路人与驮骡；我侧身让路，等他们慢慢经过。',
};
export const DEPTH_NAMES = ['近崖', '脚下石径', '金沙江', '远处雪峰'];
export const VOICES = ['水帘', '落滴', '谷风'];
export const BEAT_SECONDS = .48;
export const BAG = { columns: 5, rows: 4 } as const;
export interface Cell { x: number; y: number }
export const ITEMS = [
  { name: '水壶', frame: 1, cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }] },
  { name: '雨衣', frame: 2, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }] },
  { name: '手帐', frame: 3, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { name: '饭盒', frame: 4, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }] },
  { name: '围巾', frame: 5, cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }] },
] as const;
interface Base extends MiniState { route: 'tiger'; game: TigerKind; feedback: string; serial: number; events: (GameEvent & { age: number })[] }
export interface DepthState extends Base { game: 'depth'; depth: { order: number[]; selected: number; held: number; target: number; view: number; camera: number; seen: number } }
export interface Pose { rotation: number; cell: Cell | null }
export interface PackingState extends Base {
  game: 'packing';
  bag: { poses: Pose[]; selected: number; cursor: Cell; held: { piece: number; grab: Cell; at: Cell } | null; closed: boolean };
}
export interface ScoreState extends Base {
  game: 'score';
  score: { notes: boolean[][]; history: boolean[][][]; revision: number; audition: number; playing: boolean; clock: number; beat: number; cursor: number };
}
export interface BellsState extends Base { game: 'bells'; bells: { junction: number; wrong: boolean; nextCue: number; pulseAt: number; movedAt: number; passing: boolean; nextStep: number } }
export type TigerState = DepthState | PackingState | ScoreState | BellsState;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const copyNotes = (notes: boolean[][]) => notes.map(row => row.slice());

export function createTigerState(entry: MomentEntry, reduced: boolean): TigerState {
  const game = TIGER_GAMES[entry.id as keyof typeof TIGER_GAMES];
  const base: Base = { id: entry.id, route: 'tiger', kind: entry.interaction, game, age: 0, acted: false, dragging: false, gesture: 'look', done: false, x: .5, y: .5, play: { type: 'minigame', progress: 0, complete: false, completedAt: null, reduced }, serial: 0, events: [], feedback: PROMPTS[game] };
  if (game === 'depth') return { ...base, game, depth: { order: [2, 0, 3, 1], selected: -1, held: -1, target: -1, view: 0, camera: 0, seen: 1 } };
  if (game === 'packing') return { ...base, game, bag: { poses: ITEMS.map(() => ({ rotation: 0, cell: null })), selected: -1, cursor: { x: 0, y: 0 }, held: null, closed: false } };
  if (game === 'score') return { ...base, game, score: { notes: VOICES.map(() => Array(8).fill(false)), history: [], revision: 0, audition: -1, playing: false, clock: 0, beat: -1, cursor: 0 } };
  return { ...base, game, bells: { junction: 0, wrong: false, nextCue: .45, pulseAt: -10, movedAt: -10, passing: false, nextStep: .15 } };
}
function clone<T extends TigerState>(s: T): T { return structuredClone(s); }
function emit(s: Base, type: string, x = .5, index = 0) { s.events.push({ serial: ++s.serial, type, x, index, age: s.age }); s.events = s.events.slice(-24); }
function complete(s: Base) { if (s.play.complete) return; s.play.complete = true; s.play.progress = 1; s.play.completedAt = s.age; emit(s, 'complete'); }

export function itemCells(index: number, rotation: number): Cell[] {
  let cells: Cell[] = ITEMS[index].cells.map(c => ({ ...c }));
  for (let i = 0; i < ((rotation % 4) + 4) % 4; i++) {
    cells = cells.map(c => ({ x: -c.y, y: c.x }));
    const minX = Math.min(...cells.map(c => c.x)), minY = Math.min(...cells.map(c => c.y));
    cells = cells.map(c => ({ x: c.x - minX, y: c.y - minY }));
  }
  return cells;
}
export function itemSize(index: number, rotation: number): Cell { const cells = itemCells(index, rotation); return { x: 1 + Math.max(...cells.map(c => c.x)), y: 1 + Math.max(...cells.map(c => c.y)) }; }
export function canPack(s: PackingState, index: number, cell: Cell, rotation = s.bag.poses[index].rotation): boolean {
  if (!Number.isInteger(cell.x) || !Number.isInteger(cell.y)) return false;
  const occupied = new Set<string>();
  s.bag.poses.forEach((p, i) => { if (i !== index && p.cell) for (const c of itemCells(i, p.rotation)) occupied.add((p.cell.x + c.x) + ':' + (p.cell.y + c.y)); });
  return itemCells(index, rotation).every(c => { const x = cell.x + c.x, y = cell.y + c.y; return x >= 0 && y >= 0 && x < BAG.columns && y < BAG.rows && !occupied.has(x + ':' + y); });
}
export function packedPiece(s: PackingState, x: number, y: number): number {
  const col = Math.floor(x), row = Math.floor(y);
  return s.bag.poses.findIndex((p, i) => p.cell && itemCells(i, p.rotation).some(c => p.cell!.x + c.x === col && p.cell!.y + c.y === row));
}
export function scoreReady(s: ScoreState): boolean {
  return s.score.notes.filter(row => row.some(Boolean)).length >= 2 && Array.from({ length: 8 }, (_, i) => i).some(i => s.score.notes.every(row => !row[i]));
}
export function bellDirection(s: BellsState): number { return s.bells.junction === 0 ? 0 : 1; }
function cue(s: BellsState) { s.bells.pulseAt = s.age; s.bells.nextCue = s.bells.wrong ? 2.1 : 1.6; emit(s, 'trail-bell', bellDirection(s) === 0 ? .08 : .92, s.bells.wrong ? 0 : s.bells.junction + 1); }
function changeDepth(s: DepthState, from: number, to: number) {
  if (from < 0 || to < 0 || from === to) return;
  s.depth.order.splice(to, 0, s.depth.order.splice(from, 1)[0]);
  s.depth.selected = to; s.feedback = '按近到远排好四张画片，再看看是否与江谷一致。'; emit(s, 'depth-paper', .15 + to * .23);
}
function place(s: PackingState, index: number, cell: Cell) {
  if (!canPack(s, index, cell)) { s.feedback = '这里放不下：物件不能叠在一起，也不能越过内袋边缘。'; emit(s, 'pack-return'); return; }
  s.bag.poses[index].cell = cell; s.bag.cursor = cell; s.bag.selected = index;
  const count = s.bag.poses.filter(p => p.cell).length;
  s.play.progress = count / ITEMS.length * .85;
  s.feedback = count === ITEMS.length ? '五件都收好了，袋口也留出来了。合上背包，继续走。' : ITEMS[index].name + '放好了，还可以转一转或取出来重放。';
  emit(s, 'pack-place', (cell.x + .5) / BAG.columns);
}
function editScore(s: ScoreState, edit: () => void) {
  s.score.history.push(copyNotes(s.score.notes)); s.score.history = s.score.history.slice(-20); edit();
  s.score.revision++; s.score.audition = -1; s.score.playing = false; s.score.beat = -1; s.score.clock = 0;
  s.play.progress = scoreReady(s) ? .5 : .15;
  s.feedback = scoreReady(s) ? '声音与留白都有了，完整试听一遍，再决定留下。' : '点亮两种声音，至少留一整拍空白，让瀑声有呼吸。';
}
function scoreBeat(s: ScoreState, beat: number) { s.score.beat = beat; s.score.notes.forEach((row, voice) => { if (row[beat]) emit(s, ['score-water', 'score-drop', 'score-wind'][voice], .18 + beat / 7 * .64, beat); }); }

export function inputTiger(state: TigerState, p: MiniInput, move = false): TigerState {
  if (state.done || state.play.complete) return state;
  const action = p.action || '', value = p.value ?? -1;
  if (move) {
    if (state.game === 'packing' && state.bag.held) {
      const s = clone(state);
      if (Number.isFinite(p.x) && Number.isFinite(p.y)) s.bag.held!.at = { x: p.x! - s.bag.held!.grab.x, y: p.y! - s.bag.held!.grab.y };
      s.dragging = true; return s;
    }
    if (state.game === 'depth' && state.depth.held >= 0) { const s = clone(state); s.depth.target = action === 'depth-card' ? value : -1; s.dragging = true; return s; }
    return state;
  }
  if (p.phase === 'press') {
    if (state.game === 'depth' && action === 'depth-card' && value >= 0 && value < 4) {
      const s = clone(state); s.depth.held = value; s.depth.target = value;
      if (s.depth.selected < 0) s.depth.selected = value;
      s.acted = true; s.gesture = 'tap'; return s;
    }
    if (state.game === 'packing' && (action === 'pack-piece' || action === 'pack-cell')) {
      const s = clone(state), index = action === 'pack-piece' ? value : s.bag.selected;
      if (index < 0 || index >= ITEMS.length) return state;
      const old = s.bag.poses[index].cell, fromBag = action === 'pack-piece' && old && Number.isFinite(p.x) && Number.isFinite(p.y);
      const grab = fromBag ? { x: p.x! - old!.x, y: p.y! - old!.y } : { x: .5, y: .5 };
      s.bag.selected = index; s.bag.held = { piece: index, grab, at: { x: (p.x ?? -10) - grab.x, y: (p.y ?? -10) - grab.y } };
      s.acted = true; s.gesture = 'drag'; s.feedback = ITEMS[index].name + ' · 拖进内袋，或先旋转再放。'; emit(s, 'pack-pick'); return s;
    }
    return state;
  }
  const s = clone(state); s.dragging = false; s.gesture = p.gesture || 'tap';
  if (s.game === 'depth') {
    if (action === 'depth-card' && value >= 0 && value < 4) {
      const from = p.dragged && s.depth.held >= 0 ? s.depth.held : s.depth.selected;
      if (from >= 0 && from !== value) changeDepth(s, from, value); else s.depth.selected = value;
      s.depth.held = -1; s.depth.target = -1; s.acted = true;
    } else if (action === 'view' && (value === 0 || value === 1)) {
      s.depth.view = value; s.depth.seen |= 1 << value; s.acted = true; emit(s, 'depth-view', value ? .8 : .2);
      s.feedback = '换个站位：近崖和石径移动得明显，江水较慢，雪峰几乎不动。';
    } else if (action === 'check-depth') {
      s.acted = true;
      if (s.depth.seen !== 3) s.feedback = '再点另一边的观景处，比较一次远近，再来排画片。';
      else if (s.depth.order.some((id, i) => id !== i)) { s.feedback = '江谷的深浅还没排好。换个站位，再看谁移动得更明显。'; emit(s, 'depth-return'); }
      else { s.feedback = '近崖、石径、金沙江、远处雪峰——江谷的纵深排好了。'; complete(s); }
    } else { s.depth.held = -1; s.depth.target = -1; }
    if (!s.play.complete) s.play.progress = (s.depth.seen === 3 ? .2 : .05) + s.depth.order.filter((id, i) => id === i).length * .15;
    return s;
  }
  if (s.game === 'packing') {
    if (s.bag.held) {
      const held = s.bag.held;
      if (action === 'pack-cell' && (p.dragged || p.phase === 'release') || action === 'pack-piece' && p.dragged && Number.isFinite(p.x)) {
        place(s, held.piece, { x: Math.floor((p.x ?? -10) - held.grab.x + .5), y: Math.floor((p.y ?? -10) - held.grab.y + .5) });
      }
      s.bag.held = null; return s;
    }
    if (action === 'select-piece' && value >= 0 && value < ITEMS.length) { s.bag.selected = value; s.feedback = ITEMS[value].name + '已选中，点内袋放下。'; }
    else if (action === 'pack-cell' && s.bag.selected >= 0) place(s, s.bag.selected, { x: Math.floor(p.x ?? s.bag.cursor.x), y: Math.floor(p.y ?? s.bag.cursor.y) });
    else if (action === 'rotate' && s.bag.selected >= 0) {
      const i = s.bag.selected, pose = s.bag.poses[i], rotation = (pose.rotation + 1) % 4;
      if (!pose.cell || canPack(s, i, pose.cell, rotation)) { pose.rotation = rotation; s.feedback = ITEMS[i].name + '转了一个方向。'; emit(s, 'pack-turn'); }
      else s.feedback = '原处转不开，先取出来，再换个方向放。';
    } else if (action === 'take-out' && s.bag.selected >= 0) {
      s.bag.poses[s.bag.selected].cell = null; s.play.progress = s.bag.poses.filter(p => p.cell).length / ITEMS.length * .85;
      s.feedback = ITEMS[s.bag.selected].name + '取出来了，可以重新摆放。'; emit(s, 'pack-pick');
    } else if (action === 'close-bag') {
      if (s.bag.poses.every(pose => pose.cell)) { s.bag.closed = true; s.feedback = '背包合上了。雪山还在窗外，带着轻快的行李继续走。'; emit(s, 'pack-close'); complete(s); }
      else s.feedback = '还有物品没收好，把五件都放进内袋，再合上背包。';
    } else return state;
    s.acted = true; return s;
  }
  if (s.game === 'score') {
    if (action === 'note' && value >= 0 && value < 24) {
      const row = Math.floor(value / 8), beat = value % 8;
      editScore(s, () => { s.score.notes[row][beat] = !s.score.notes[row][beat]; }); s.score.cursor = value; emit(s, 'score-edit', .18 + beat / 7 * .64);
    } else if (action === 'undo' && s.score.history.length) {
      s.score.notes = s.score.history.pop()!; s.score.revision++; s.score.audition = -1; s.score.playing = false; s.score.beat = -1;
      s.feedback = '撤回了上一笔，改动后的瀑声需要重新试听。'; s.play.progress = scoreReady(s) ? .5 : .15;
    } else if (action === 'audition') {
      if (s.score.playing) { s.score.playing = false; s.score.beat = -1; s.feedback = '试听停下了。完整听完一遍，才能留下这一段。'; }
      else { s.score.playing = true; s.score.clock = 0; s.score.audition = -1; scoreBeat(s, 0); s.feedback = '八拍正在走，空白的一拍也会轻轻经过。'; }
    } else if (action === 'save-score') {
      if (!scoreReady(s)) s.feedback = '用上至少两种声音，并留一整拍空白，再完整试听。';
      else if (s.score.playing || s.score.audition !== s.score.revision) s.feedback = '改过的声音，需要从头完整试听一遍。';
      else { s.feedback = '这一段有声音，也有留白。把自己的瀑声收进手帐。'; complete(s); }
    } else return state;
    s.acted = true; return s;
  }
  if (action === 'listen-bell' && s.bells.junction < 2) { cue(s); s.feedback = s.bells.wrong ? '铃声隔着山壁，显得更远了。先沿原路返回岔口。' : '铃纹与声音指向同一边，沿那个方向走。'; }
  else if (action === 'return' && s.bells.wrong) { s.bells.wrong = false; s.bells.movedAt = s.age; s.bells.nextCue = .35; s.feedback = '回到岔口了。听清方向，再选一条山路。'; emit(s, 'trail-step'); }
  else if (action === 'branch' && (value === 0 || value === 1) && s.bells.junction < 2 && !s.bells.wrong) {
    if (value !== bellDirection(s)) { s.bells.wrong = true; s.feedback = '这条小路绕到了山壁，铃声更远了。沿原路返回。'; }
    else { s.bells.junction++; s.play.progress = s.bells.junction * .4; s.feedback = s.bells.junction === 1 ? '铃声更近了。前面还有一个转弯。' : '转角后是赶路人和驮骡。侧身让他们先过吧。'; }
    s.bells.movedAt = s.age; s.bells.nextCue = .4; emit(s, 'trail-step', value ? .8 : .2);
  } else if (action === 'let-pass' && s.bells.junction === 2) { s.bells.passing = true; s.bells.movedAt = s.age; s.feedback = '我在山路边让出身位，铃声和脚步慢慢经过。'; complete(s); }
  else return state;
  s.acted = true; return s;
}

export function releaseTiger(s: TigerState): TigerState {
  if (s.game === 'depth') return { ...s, dragging: false, depth: { ...s.depth, held: -1, target: -1 } };
  if (s.game === 'packing') return { ...s, dragging: false, bag: { ...s.bag, held: null } };
  return s;
}
export function tickTiger(state: TigerState, dt: number): TigerState {
  if (state.done || !Number.isFinite(dt) || dt <= 0) return state;
  const s = clone(state), step = Math.min(.25, dt); s.age += step;
  if (s.play.complete) {
    if (s.game === 'bells' && s.bells.passing) { s.bells.nextStep -= step; if (s.bells.nextStep <= 0) { s.bells.nextStep += .44; emit(s, 'trail-step', .5 - Math.min(.4, (s.age - s.bells.movedAt) * .15), Math.floor((s.age - s.bells.movedAt) / .44)); } }
    s.done = s.age - (s.play.completedAt ?? s.age) >= (s.play.reduced ? .6 : 2.5); return s;
  }
  if (s.game === 'depth') s.depth.camera += (s.depth.view - s.depth.camera) * (s.play.reduced ? 1 : 1 - Math.exp(-step * 6));
  if (s.game === 'score' && s.score.playing) {
    const old = s.score.beat; s.score.clock += step;
    const beat = Math.floor(s.score.clock / BEAT_SECONDS);
    for (let i = old + 1; i <= Math.min(7, beat); i++) scoreBeat(s, i);
    if (beat >= 8) { s.score.playing = false; s.score.beat = -1; s.score.audition = s.score.revision; s.play.progress = scoreReady(s) ? .9 : .3; s.feedback = scoreReady(s) ? '八拍试听完了，喜欢的话，就留下这段瀑声。' : '试听完了，再用上两种声音、留一整拍空白。'; }
  }
  if (s.game === 'bells' && s.bells.junction < 2) { s.bells.nextCue -= step; if (s.bells.nextCue <= 0) cue(s); }
  return s;
}
export function keyTiger(s: TigerState, key: string, phase: 'down' | 'up'): TigerState | null {
  if (phase === 'up' || s.play.complete) return null;
  const index = Number(key) - 1;
  if (s.game === 'depth') {
    if (/^[1-4]$/.test(key)) { const n = clone(s); n.depth.selected = index; n.feedback = DEPTH_NAMES[n.depth.order[index]] + '已选中，用左右键移动画片。'; return n; }
    if (key === 'ArrowLeft' || key === 'ArrowRight') { const n = clone(s), from = n.depth.selected < 0 ? 0 : n.depth.selected; changeDepth(n, from, clamp(from + (key === 'ArrowLeft' ? -1 : 1), 0, 3)); n.acted = true; return n; }
    if (key.toLowerCase() === 'a' || key.toLowerCase() === 'd') return inputTiger(s, { action: 'view', value: key.toLowerCase() === 'a' ? 0 : 1 });
    if (key === 'Enter') return inputTiger(s, { action: 'check-depth' });
  } else if (s.game === 'packing') {
    if (/^[1-5]$/.test(key)) return inputTiger(s, { action: 'select-piece', value: index });
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) { const n = clone(s); n.bag.cursor.x = clamp(n.bag.cursor.x + (key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : 0), 0, 4); n.bag.cursor.y = clamp(n.bag.cursor.y + (key === 'ArrowUp' ? -1 : key === 'ArrowDown' ? 1 : 0), 0, 3); return n; }
    if (key === 'Enter') return inputTiger(s, { action: 'pack-cell', x: s.bag.cursor.x, y: s.bag.cursor.y });
    if (key.toLowerCase() === 'q') return inputTiger(s, { action: 'rotate' });
    if (key === 'Delete' || key === 'Backspace') return inputTiger(s, { action: 'take-out' });
    if (key.toLowerCase() === 'c') return inputTiger(s, { action: 'close-bag' });
  } else if (s.game === 'score') {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) { const n = clone(s), col = n.score.cursor % 8, row = Math.floor(n.score.cursor / 8); n.score.cursor = clamp(row + (key === 'ArrowUp' ? -1 : key === 'ArrowDown' ? 1 : 0), 0, 2) * 8 + clamp(col + (key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? 1 : 0), 0, 7); return n; }
    if (key === 'Enter' || key === ' ') return inputTiger(s, { action: 'note', value: s.score.cursor });
    if (key.toLowerCase() === 'p') return inputTiger(s, { action: 'audition' });
    if (key.toLowerCase() === 'z') return inputTiger(s, { action: 'undo' });
    if (key.toLowerCase() === 's') return inputTiger(s, { action: 'save-score' });
  } else {
    if (key === 'ArrowLeft' || key === 'ArrowRight') return inputTiger(s, { action: 'branch', value: key === 'ArrowLeft' ? 0 : 1 });
    if (key === 'ArrowDown' || key === 'Backspace') return inputTiger(s, { action: 'return' });
    if (key === 'Enter' || key === ' ') return inputTiger(s, { action: s.bells.junction === 2 ? 'let-pass' : 'listen-bell' });
  }
  return null;
}
