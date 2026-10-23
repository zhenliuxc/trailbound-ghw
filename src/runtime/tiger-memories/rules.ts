import type { MiniInput } from '../contracts';
import { MemoryState, MEMORY_SPECS, clamp, distance, emit, fork, inside, settle, type MemoryId, type Point } from './model';
import { BRUSH, coverage, frameCenter, frameFits, layout, moveFrame, PAINT_CELLS, roadFromStage } from './layout';
import { ROAD_LENGTH, ROAD_RIVER_SECONDS, ROAD_WALK_SECONDS, roadAt, roadWalkingProgress, traceRoad } from './road';

const point = (input: MiniInput): Point | null => typeof input.x === 'number' && typeof input.y === 'number' && Number.isFinite(input.x) && Number.isFinite(input.y) ? { x: input.x, y: input.y } : null;
export function createMemory(id: MemoryId, reduced: boolean): MemoryState {
  const order = [0, 0, 1, 1];
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  return new MemoryState(id, reduced, order);
}

function beginRoad(s: MemoryState, at: Point): void {
  const p = s.session; if (p.kind !== 'bends' || p.phase.kind !== 'drawing') return;
  const phase = p.phase; phase.cursor = at;
  if (distance(at, roadAt(phase.progress)) > (s.portrait ? 58 : 36)) { s.feedback = '从已经画好的路头接着画就好。'; return; }
  phase.pen = { kind: 'down', last: at }; s.dragging = true;
}
function drawRoad(s: MemoryState, at: Point): void {
  const p = s.session; if (p.kind !== 'bends' || p.phase.kind !== 'drawing') return;
  const phase = p.phase, before = phase.progress;
  if (phase.pen.kind !== 'down') return;
  const next = traceRoad(before, phase.pen.last, at, s.portrait ? 48 : 26);
  phase.progress = next.progress; phase.cursor = at;
  phase.pen = next.connected ? { kind: 'down', last: at } : { kind: 'up' };
  s.dragging = next.connected;
  if (next.progress > before + .0001) { if (!s.acted) emit(s, 'depth-paper'); s.acted = true; s.gesture = 'drag'; }
  s.play.progress = phase.progress * .55;
  s.feedback = phase.progress >= .99 ? '山路画好了，松手就出发。' : next.connected ? '顺着这道山弯，慢慢往上画。' : '这段已经留下了，从路头接着画。';
}
function finishRoad(s: MemoryState): void {
  const p = s.session; if (p.kind !== 'bends' || p.phase.kind !== 'drawing') return;
  const phase = p.phase, placed = phase.pen.kind === 'down' && phase.progress >= .99;
  phase.pen = { kind: 'up' }; s.dragging = false;
  if (placed) { p.phase = { kind: 'walking', elapsed: 0, progress: 0 }; s.feedback = '沿着刚画好的山路，走上山肩。'; emit(s, 'pack-place'); }
}
function flipCard(s: MemoryState, index: number): void {
  const p = s.session;
  if (p.kind !== 'inn' || p.turnAt !== null || p.matched.includes(index) || p.open.includes(index)) return;
  p.open.push(index); s.acted = true; s.feedback = '再找找相同的那一张。'; emit(s, 'depth-paper', index);
  if (p.open.length !== 2) return;
  if (p.order[p.open[0]] === p.order[p.open[1]]) {
    p.matched.push(...p.open); p.open = []; s.play.progress = p.matched.length / 4;
    s.feedback = p.matched.length === 4 ? '山影与窗灯，都记住了。' : '找到一对了，还有两张。'; emit(s, 'pack-place', index);
    if (p.matched.length === 4) settle(s);
  } else { p.turnAt = s.age; s.feedback = '这两张不同，再翻翻看。'; }
}

function paintPoint(s: MemoryState, at: Point, start = false): void {
  const p = s.session; if (p.kind !== 'waterfall') return;
  const r = layout(s).sketchImage, next = { x: clamp((at.x - r.x) / r.width, 0, 1), y: clamp((at.y - r.y) / r.height, 0, 1) };
  const lastStroke = p.strokes[p.strokes.length - 1], old = lastStroke?.points[lastStroke.points.length - 1] ?? p.brush; p.brush = next;
  if (!inside(at, r)) { p.drawing = false; return; }
  if (!p.drawing && !start) return;
  if (!start && lastStroke?.color === p.color && distance(old, next) < .003) return;
  const begin = start || !p.strokes.length || p.strokes[p.strokes.length - 1].color !== p.color;
  if (begin) { p.strokes.push({ color: p.color, points: [next] }); }
  else {
    const last = p.strokes[p.strokes.length - 1];
    if (last.points.length >= 500) p.strokes.push({ color: p.color, points: [old, next] });
    else p.strokes[p.strokes.length - 1] = { color: last.color, points: [...last.points, next] };
  }
  p.drawing = true; s.acted = true; s.gesture = 'drag';
  const samples = Math.max(1, Math.ceil(distance(begin ? next : old, next) / (BRUSH * .35)));
  for (let j = 0; j <= samples; j++) {
    const t = j / samples, a = begin ? next : old, sample = { x: a.x + (next.x - a.x) * t, y: a.y + (next.y - a.y) * t };
    PAINT_CELLS.forEach((cells, region) => cells.forEach((cell, index) => { if (distance(cell, sample) <= BRUSH && !p.coverage[region].includes(index)) p.coverage[region].push(index); }));
  }
  const filled = coverage(s); s.play.progress = filled.reduce((sum, value) => sum + Math.min(1, value / .62), 0) / 2;
  s.feedback = filled.every(value => value >= .62) ? '这一页山色，留下来了。' : filled[0] >= .62 ? '岩壁有颜色了，再涂涂草木。' : filled[1] >= .62 ? '草木有颜色了，再涂涂岩壁。' : '把颜色轻轻涂在纸上的两处留白。';
  if (start) emit(s, 'depth-paper');
  if (filled.every(value => value >= .62)) { p.drawing = false; p.keyHeld = false; settle(s); }
}
function shoot(s: MemoryState): void {
  const p = s.session; if (p.kind !== 'river') return;
  if (!p.adjusted || !frameFits(s)) { s.feedback = '把巨石的上缘和旁边的白浪，都留在圆窗里。'; return; }
  p.shot = { center: frameCenter(s), wave: s.wave, portrait: s.portrait }; s.acted = true; s.play.progress = 1; emit(s, 'shutter'); settle(s);
}

export function actMemory(state: MemoryState, input: MiniInput): MemoryState {
  const s = fork(state);
  if (input.action === 'retry-capture' && s.flow.kind === 'capture-error') { s.flow = { kind: 'capturing' }; return s; }
  if (s.flow.kind !== 'playing') return state;
  const at = point(input), l = layout(s), p = s.session;
  if (!at) return state;
  if (input.phase === 'press') {
    switch (p.kind) {
      case 'bends': if (p.phase.kind === 'drawing') { p.phase.keyboard = false; beginRoad(s, roadFromStage(s, at)); } break;
      case 'inn': break;
      case 'waterfall': {
        p.keyboard = false;
        const color = l.swatches.findIndex(c => distance(c, at) <= (s.portrait ? 76 : 48));
        if (color >= 0) { p.color = color; emit(s, 'depth-paper'); }
        else if (inside(at, l.sketchImage)) paintPoint(s, at, true);
        break;
      }
      case 'river': {
        const center = frameCenter(s);
        if (distance(at, center) <= l.radius + 35) p.drag = { offset: { x: center.x - at.x, y: center.y - at.y }, moved: false };
        break;
      }
    }
  } else if (input.phase === 'release') {
    switch (p.kind) {
      case 'bends': drawRoad(s, roadFromStage(s, at)); finishRoad(s); break;
      case 'inn': { const index = l.cards.findIndex(card => inside(at, card)); if (index >= 0) { p.focus = index; flipCard(s, index); } break; }
      case 'waterfall': p.drawing = false; break;
      case 'river': { const moved = p.drag?.moved; p.drag = null; if (moved) shoot(s); break; }
    }
    s.dragging = false;
  }
  return s;
}

export function moveMemory(state: MemoryState, input: MiniInput): MemoryState {
  if (state.flow.kind !== 'playing') return state;
  const at = point(input); if (!at) return state;
  const s = fork(state), p = s.session;
  switch (p.kind) {
    case 'bends': drawRoad(s, roadFromStage(s, at)); break;
    case 'inn': break;
    case 'waterfall': if (p.drawing) paintPoint(s, at); break;
    case 'river': if (p.drag) {
      const center = { x: at.x + p.drag.offset.x, y: at.y + p.drag.offset.y }, before = frameCenter(s);
      p.center = moveFrame(s, center);
      if (distance(before, frameCenter(s)) > .2) { p.drag.moved = true; p.adjusted = true; s.acted = true; s.gesture = 'drag'; }
      s.feedback = frameFits(s) ? '巨石和白浪入窗了，松手留下这一刻。' : '再移一移圆窗，把巨石和白浪一起装进去。';
    } break;
  }
  return s;
}
export function releaseMemory(state: MemoryState): MemoryState {
  const s = fork(state), p = s.session; s.dragging = false;
  if (p.kind === 'bends' && p.phase.kind === 'drawing') p.phase.pen = { kind: 'up' };
  if (p.kind === 'waterfall') { p.drawing = false; p.keyHeld = false; }
  if (p.kind === 'river') p.drag = null;
  return s;
}
export function tickMemory(state: MemoryState, dt: number): MemoryState {
  if (!Number.isFinite(dt) || dt <= 0 || state.done) return state;
  const s = fork(state), p = s.session; s.age += Math.min(dt, .1);
  if (p.kind !== 'river' || !p.shot) s.wave += s.play.reduced ? 0 : Math.min(dt, .1);
  if (p.kind === 'bends' && s.flow.kind === 'playing') {
    const phase = p.phase;
    if (phase.kind === 'walking') {
      const before = Math.floor(phase.progress * ROAD_LENGTH / 34);
      phase.elapsed += Math.min(dt, .1); phase.progress = roadWalkingProgress(phase.elapsed);
      s.play.progress = .55 + phase.progress * .30;
      const step = Math.floor(phase.progress * ROAD_LENGTH / 34);
      if (step > before) emit(s, 'road-step', step);
      if (phase.elapsed >= ROAD_WALK_SECONDS) { p.phase = { kind: 'river', elapsed: 0 }; s.feedback = '山弯转过，金沙江的激流就在峡谷下方。'; emit(s, 'river-arrive'); }
    } else if (phase.kind === 'river') {
      phase.elapsed = Math.min(ROAD_RIVER_SECONDS, phase.elapsed + Math.min(dt, .1));
      s.play.progress = .85 + phase.elapsed / ROAD_RIVER_SECONDS * .10;
      if (phase.elapsed >= ROAD_RIVER_SECONDS) settle(s);
    }
  }
  if (p.kind === 'inn' && p.turnAt !== null && s.age - p.turnAt > (s.play.reduced ? .35 : .85)) { p.open = []; p.turnAt = null; }
  if (p.kind === 'waterfall') {
    if (p.keyHeld && s.flow.kind === 'playing') { const r = layout(s).sketchImage; paintPoint(s, { x: r.x + p.brush.x * r.width, y: r.y + p.brush.y * r.height }); }
    if (s.flow.kind !== 'playing') p.reveal = clamp(p.reveal + dt * 1.4, 0, 1);
  }
  if (s.flow.kind === 'settling' && s.age - s.flow.at >= (s.play.reduced ? .3 : 1.1)) s.flow = { kind: 'capturing' };
  if (s.flow.kind === 'complete' && s.play.completedAt !== null && s.age - s.play.completedAt > (s.play.reduced ? .3 : 1.15)) s.done = true;
  return s;
}
export function attachMemoryCapture(state: MemoryState, art: string | null): MemoryState {
  if (state.flow.kind !== 'capturing') return state;
  const s = fork(state);
  if (!art) { s.flow = { kind: 'capture-error' }; s.feedback = '画面暂未能保存，可重试留下这幅画，或继续旅程。'; return s; }
  s.flow = { kind: 'complete', art }; s.play.complete = true; s.play.progress = 1; s.play.completedAt = s.age;
  s.feedback = MEMORY_SPECS[s.id].badge + '，这一刻值得留下。'; emit(s, 'complete'); return s;
}

export function keyMemory(state: MemoryState, key: string, phase: 'down' | 'up'): MemoryState | null {
  const arrow = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] } satisfies Record<string, number[]>)[key];
  if (!arrow && !['Enter', ' ', '1', '2', '3'].includes(key)) return null;
  if (state.flow.kind !== 'playing') return state;
  const s = fork(state), p = s.session;
  if (phase === 'up') { if (p.kind === 'bends' && (key === ' ' || key === 'Enter')) finishRoad(s); if (key === ' ' && p.kind === 'waterfall') { p.keyHeld = false; p.drawing = false; } return s; }
  switch (p.kind) {
    case 'bends': {
      if (p.phase.kind !== 'drawing') break;
      p.phase.keyboard = true;
      if (arrow) {
        const at = { x: clamp(p.phase.cursor.x + arrow[0] * 12, 0, 1000), y: clamp(p.phase.cursor.y + arrow[1] * 12, 0, 750) };
        if (p.phase.pen.kind === 'down') drawRoad(s, at); else p.phase.cursor = at;
      } else if ((key === ' ' || key === 'Enter') && p.phase.pen.kind === 'up') beginRoad(s, p.phase.cursor);
      break;
    }
    case 'inn': if (arrow) p.focus = (p.focus + (arrow[0] || arrow[1]) + 4) % 4; else if (key === 'Enter' || key === ' ') flipCard(s, p.focus); break;
    case 'waterfall': {
      p.keyboard = true;
      if (/^[1-3]$/.test(key)) { p.color = Number(key) - 1; p.drawing = false; }
      else if (arrow) { p.brush = { x: clamp(p.brush.x + arrow[0] * .045, 0, 1), y: clamp(p.brush.y + arrow[1] * .045, 0, 1) }; }
      else if (key === ' ') {
        p.keyHeld = true; const r = layout(s).sketchImage; paintPoint(s, { x: r.x + p.brush.x * r.width, y: r.y + p.brush.y * r.height }, !p.drawing);
      }
      break;
    }
    case 'river':
      if (arrow) { const center = frameCenter(s); p.center = moveFrame(s, { x: center.x + arrow[0] * 24, y: center.y + arrow[1] * 24 }); p.adjusted = true; s.acted = true; }
      else if (key === 'Enter' || key === ' ') shoot(s);
      break;
  }
  return s;
}
