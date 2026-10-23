import type { GameEvent, MiniInput, MiniState } from '../../contracts';
import type { Point2D } from '../../projection';

export const SAND = [{x:65,y:225},{x:250,y:260},{x:490,y:325},{x:760,y:400},{x:970,y:450},{x:950,y:545},{x:750,y:620},{x:500,y:580},{x:280,y:470},{x:90,y:350}];
export const QUIET_TIME = 4.5, WASH_TIME = 3.2;
export const shoreY = (x: number): number => 145 + x * .25;
export const PROMPT = '在沙面上拖动画一画，停笔后让潮水收走。';
type Phase = { kind: 'ready' } | { kind: 'drawing'; stroke: Point2D[] }
  | { kind: 'pause'; quiet: number } | { kind: 'washing'; elapsed: number } | { kind: 'memory'; elapsed: number };

export class TideState implements MiniState {
  readonly id = 'coast-shell'; readonly route = 'maclehose'; readonly kind = 'ripple';
  age = 0; acted = false; dragging = false; gesture = 'look'; done = false; x = 500; y = 420;
  readonly play: MiniState['play']; readonly strokes: Point2D[][] = []; readonly events: GameEvent[] = [];
  phase: Phase = { kind: 'ready' }; length = 0; points = 0; cursorVisible = false; private serial = 0;
  constructor(reduced: boolean) { this.play = { type: 'coast-sand-18', progress: 0, complete: false, completedAt: null, reduced }; }
  event(type: string): void { this.events.push({ serial: ++this.serial, type, x: this.x / 1000 }); if (this.events.length > 8) this.events.shift(); }
}
export function tideState(state: MiniState): TideState {
  if (!(state instanceof TideState)) throw new Error('沙滩画笔状态不匹配');
  return state;
}
export function onSand(point: Point2D): boolean {
  let inside = false;
  for (let i = 0, j = SAND.length - 1; i < SAND.length; j = i++) {
    const a = SAND[i], b = SAND[j];
    if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
function at(input: MiniInput): Point2D | null {
  return typeof input.x === 'number' && typeof input.y === 'number' && Number.isFinite(input.x) && Number.isFinite(input.y) ? { x: input.x, y: input.y } : null;
}
function endStroke(state: TideState): void {
  if (state.phase.kind !== 'drawing') return;
  state.dragging = false; state.phase = state.strokes.length ? { kind: 'pause', quiet: 0 } : { kind: 'ready' };
}
export function actTide(state: TideState, input: MiniInput): TideState {
  if (input.phase === 'release') { endStroke(state); return state; }
  if (!['ready', 'pause'].includes(state.phase.kind)) return state;
  const point = input.assist ? { x: state.x, y: state.y } : at(input);
  if (!point || !onSand(point) || state.points >= 6000) return state;
  if (!input.key) state.cursorVisible = false;
  const stroke = [point]; state.strokes.push(stroke); state.points++;
  state.x = point.x; state.y = point.y; state.phase = { kind: 'drawing', stroke }; state.dragging = true;
  return state;
}
export function moveTide(state: TideState, input: MiniInput): TideState {
  if (state.phase.kind !== 'drawing') return state;
  const point = at(input);
  if (!point || !onSand(point)) { endStroke(state); return state; }
  const previous = state.phase.stroke[state.phase.stroke.length - 1];
  const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
  if (distance < .5 || state.points >= 6000) return state;
  state.phase.stroke.push(point); state.points++; state.length += distance;
  state.x = point.x; state.y = point.y; state.acted = true; state.gesture = 'drag';
  state.play.progress = Math.min(.65, state.length / 160 * .65);
  return state;
}
export function cancelTide(state: TideState): TideState {
  if (state.phase.kind === 'drawing') {
    state.strokes.pop(); state.length = 0; state.points = 0;
    for (const stroke of state.strokes) {
      state.points += stroke.length;
      for (let i = 1; i < stroke.length; i++) state.length += Math.hypot(stroke[i].x - stroke[i - 1].x, stroke[i].y - stroke[i - 1].y);
    }
    state.phase = state.strokes.length ? { kind: 'pause', quiet: 0 } : { kind: 'ready' };
    state.play.progress = Math.min(.65, state.length / 160 * .65);
  } else if (state.phase.kind === 'pause') state.phase.quiet = 0;
  state.dragging = false;
  return state;
}
export function tickTide(state: TideState, dt: number): TideState {
  if (state.done || !Number.isFinite(dt) || dt <= 0) return state;
  dt = Math.min(.1, dt); state.age += dt;
  const phase = state.phase;
  if (phase.kind === 'pause') {
    phase.quiet += dt;
    if (state.length >= 80 && phase.quiet >= QUIET_TIME) { state.phase = { kind: 'washing', elapsed: 0 }; state.event('water'); }
  } else if (phase.kind === 'washing') {
    phase.elapsed += dt; state.play.progress = .65 + .35 * Math.min(1, phase.elapsed / WASH_TIME);
    if (phase.elapsed >= WASH_TIME) {
      state.phase = { kind: 'memory', elapsed: 0 }; state.play.progress = 1;
      state.play.complete = true; state.play.completedAt = state.age; state.event('complete');
    }
  } else if (phase.kind === 'memory') { phase.elapsed += dt; state.done = phase.elapsed >= 1.2; }
  return state;
}
export function tideFeedback(state: TideState): string {
  switch (state.phase.kind) {
    case 'ready': return PROMPT;
    case 'drawing': return '笔迹留在沙面上，慢慢画。';
    case 'pause': return state.length < 80 ? '再画长一点，让这一笔留在沙面。' : '还可以接着画，下一道浪还没到。';
    case 'washing': return '潮水漫过笔迹，再轻轻退去。';
    case 'memory': return '沙面重新平整，这一笔留进回忆里。';
    default: { const exhaustive: never = state.phase; return exhaustive; }
  }
}
export function keyTide(state: TideState, key: string, phase: 'down' | 'up'): TideState | null {
  if (key === ' ') {
    if (phase === 'up') endStroke(state);
    else if (state.phase.kind !== 'drawing') { state.cursorVisible = true; actTide(state, { x: state.x, y: state.y, phase: 'press', key: true }); }
    return state;
  }
  if (key === 'Enter') { if (phase === 'down') { state.cursorVisible = true; state.phase.kind === 'drawing' ? endStroke(state) : actTide(state, { x: state.x, y: state.y, phase: 'press', key: true }); } return state; }
  const direction = key === 'ArrowLeft' ? {x:-16,y:0} : key === 'ArrowRight' ? {x:16,y:0} : key === 'ArrowUp' ? {x:0,y:-16} : key === 'ArrowDown' ? {x:0,y:16} : null;
  if (!direction) return null;
  state.cursorVisible = true;
  if (phase === 'down') {
    const point = { x: state.x + direction.x, y: state.y + direction.y };
    if (onSand(point)) { if (state.phase.kind === 'drawing') moveTide(state, point); else { state.x = point.x; state.y = point.y; } }
  }
  return state;
}
