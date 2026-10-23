import type { GameEvent, MiniInput, MiniState, MomentEntry } from '../contracts.js';
import { CLIMB_TRAIL, PASSAGE_TRAIL, WORLD, clamp, pointAt, turnAhead } from './geometry.js';
import type { Point, TrailGeometry } from './geometry.js';

export type TrailKind = 'tiger-climb' | 'tiger-river' | 'tiger-rest' | 'tiger-passage';
export const TRAIL_GAMES: Record<string, TrailKind> = {
  'tiger-28-bends-v1': 'tiger-climb',
  'tiger-middle-river-frame-v1': 'tiger-river',
  'tiger-halfway-view-v1': 'tiger-rest',
  'tiger-longdong-passage-v1': 'tiger-passage',
};
export const TITLES: Record<TrailKind, string> = {
  'tiger-climb': '二十八道拐 · 山路慢行',
  'tiger-river': '中虎跳江边 · 留下这一江激流',
  'tiger-rest': '中途客栈 · 在山腰歇一会儿',
  'tiger-passage': '龙洞瀑布 · 沿崖经过',
};
export const PROMPTS: Record<TrailKind, string> = {
  'tiger-climb': '按住画面往山上走，松手停下看风景。',
  'tiger-river': '拖动画面取景，按下快门；选一帧喜欢的，定格这幅画。',
  'tiger-rest': '拖动画面看看对岸山景，歇好了就继续走。',
  'tiger-passage': '水帘落在沿崖小径旁。停一会儿看看，也可以继续行程。',
};

export interface TrailCamera { x: number; y: number; zoom: number }
export interface TrailCapture { id: number; url: string; age: number; waveClock: number; camera: TrailCamera }
export interface TrailCaptureRequest { id: number; age: number; waveClock: number; camera: TrailCamera }
export interface TrailInput extends MiniInput { viewWidth?: number; viewHeight?: number }
export interface TrailWalk {
  distance: number;
  progress: number;
  position: Point;
  heading: number;
  speed: number;
  held: boolean;
  arrivedAt: number | null;
  nextStep: number;
}
export interface TrailState extends MiniState {
  game: TrailKind;
  events: GameEvent[];
  serial: number;
  feedback: string;
  camera: TrailCamera;
  viewport: { width: number; height: number };
  climb: TrailWalk;
  passage: TrailWalk;
  rest: { panX: number };
  river: {
    phase: 'descent' | 'river';
    descentProgress: number;
    waveClock: number;
    captures: TrailCapture[];
    selected: number;
    selectionLocked: boolean;
    captureRequest: TrailCaptureRequest | null;
    captureSerial: number;
    burst: boolean;
    burstRemaining: number;
    nextCaptureAt: number;
  };
  pointer: Point | null;
  keys: string[];
}

const MAX_CAPTURES = 5;
const ARROWS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
const MOVEMENT_KEYS: Record<string, string> = { a: 'ArrowLeft', d: 'ArrowRight', w: 'ArrowUp', s: 'ArrowDown' };
const keyName = (key: string): string => MOVEMENT_KEYS[key.toLowerCase()] || key;
const hasPoint = (p: MiniInput): p is MiniInput & Point => Number.isFinite(p.x) && Number.isFinite(p.y);
const scenePoint = (p: Point): Point => ({ x: clamp(p.x, 0, WORLD.width), y: clamp(p.y, 0, WORLD.height) });

function walkStart(trail: TrailGeometry): TrailWalk {
  const start = pointAt(trail, 0);
  return { distance: 0, progress: 0, position: { x: start.x, y: start.y }, heading: start.heading,
    speed: 0, held: false, arrivedAt: null, nextStep: 0 };
}

export function createTrailState(entry: MomentEntry, options: { reduced: boolean; weather?: string; riverArrival?: 'descent' | 'river' }): TrailState {
  const game = TRAIL_GAMES[entry.id] || 'tiger-rest';
  const zoom = game === 'tiger-river' ? 1.25 : game === 'tiger-rest' ? 1.12 : game === 'tiger-climb' ? 1.52 : 1;
  const start = pointAt(CLIMB_TRAIL, 0);
  return { id: entry.id, route: 'tiger', kind: game, game, age: 0, acted: false, dragging: false,
    gesture: 'tap', done: false, x: .5, y: .5, play: { type: game, progress: 0, complete: false,
      completedAt: null, reduced: options.reduced }, events: [], serial: 0, feedback: PROMPTS[game],
    camera: { x: game === 'tiger-climb' ? start.x + 105 : 500, y: game === 'tiger-climb' ? start.y - 88 : 360, zoom },
    viewport: { width: WORLD.width / zoom, height: WORLD.height / zoom },
    climb: walkStart(CLIMB_TRAIL), passage: walkStart(PASSAGE_TRAIL), rest: { panX: 0 },
    river: { phase: options.riverArrival === 'river' ? 'river' : 'descent', descentProgress: options.riverArrival === 'river' || options.reduced ? 1 : 0, waveClock: 0,
      captures: [], selected: -1, selectionLocked: false, captureRequest: null, captureSerial: 0,
      burst: false, burstRemaining: 0, nextCaptureAt: 0 }, pointer: null, keys: [] };
}

function copy(state: TrailState): TrailState {
  return { ...state, play: { ...state.play }, camera: { ...state.camera }, viewport: { ...state.viewport },
    climb: { ...state.climb, position: { ...state.climb.position } },
    passage: { ...state.passage, position: { ...state.passage.position } },
    rest: { ...state.rest }, river: { ...state.river, captures: state.river.captures.slice(),
      captureRequest: state.river.captureRequest ? { ...state.river.captureRequest, camera: { ...state.river.captureRequest.camera } } : null },
    pointer: state.pointer ? { ...state.pointer } : null, keys: state.keys.slice(), events: state.events.slice(-31) };
}

function emit(state: TrailState, type: string, x = .5, index?: number): void {
  state.events.push({ serial: ++state.serial, type, x: clamp(x, 0, 1), ...(index === undefined ? {} : { index }) });
  if (state.events.length > 32) state.events.shift();
}

function stopWalking(state: TrailState): void {
  for (const walk of [state.climb, state.passage]) { walk.held = false; walk.speed = 0; }
  state.pointer = null; state.keys = []; state.dragging = false;
}

function finish(state: TrailState): void {
  stopWalking(state); state.play.complete = true; state.play.progress = 1; state.play.completedAt = state.age;
  state.river.burst = false; state.river.burstRemaining = 0; state.river.captureRequest = null;
  emit(state, 'complete');
}

function requestCapture(state: TrailState): boolean {
  const river = state.river;
  if (river.phase !== 'river' || river.captureRequest || river.captures.length >= MAX_CAPTURES) return false;
  river.captureRequest = { id: ++river.captureSerial, age: state.age, waveClock: river.waveClock, camera: { ...state.camera } };
  state.acted = true;
  emit(state, 'shutter', .5, river.captureRequest.id);
  return true;
}

/** The renderer owns image extraction; a pending request freezes only the composition metadata here. */
export function attachTrailCapture(state: TrailState, url: string, requestId?: number): TrailState {
  const request = state.river.captureRequest;
  if (state.done || state.play.complete || state.game !== 'tiger-river' || state.river.phase !== 'river' || !request ||
      (requestId !== undefined && request.id !== requestId)) return state;
  if (!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(url) || url.length > 300000) {
    return rejectTrailCapture(state, request.id);
  }
  const next = copy(state);
  next.river.captures.push({ ...request, camera: { ...request.camera }, url });
  if (!next.river.selectionLocked) next.river.selected = next.river.captures.length - 1;
  next.river.captureRequest = null;
  next.play.progress = .5;
  next.feedback = next.river.captures.length === MAX_CAPTURES ? '五帧都在这里了。选一张喜欢的，收进手帐。' : '这一帧留下了。可以换个构图再拍，也可以选好收进手帐。';
  if (next.river.captures.length >= MAX_CAPTURES) { next.river.burst = false; next.river.burstRemaining = 0; }
  emit(next, 'frame-ready', .5, next.river.selected);
  return next;
}

export function rejectTrailCapture(state: TrailState, requestId?: number): TrailState {
  if (!state.river.captureRequest || (requestId !== undefined && state.river.captureRequest.id !== requestId)) return state;
  const next = copy(state);
  next.river.captureRequest = null; next.river.burst = false; next.river.burstRemaining = 0;
  next.feedback = '这一帧没能保存，可以再拍一次；已经拍好的画面还在。';
  return next;
}

function beginWalk(state: TrailState, point: Point): void {
  const walk = state.climb;
  if (walk.arrivedAt !== null) return;
  walk.held = true; state.pointer = point;
  state.feedback = PROMPTS[state.game];
  state.acted = true; state.dragging = true; state.gesture = 'hold';
}

function rememberViewport(state: TrailState, input: TrailInput): void {
  if (Number.isFinite(input.viewWidth) && input.viewWidth! > 0) state.viewport.width = Math.min(WORLD.width, input.viewWidth!);
  if (Number.isFinite(input.viewHeight) && input.viewHeight! > 0) state.viewport.height = Math.min(WORLD.height, input.viewHeight!);
}

function viewCamera(state: TrailState, camera: TrailCamera): TrailCamera {
  const halfW = Math.min(WORLD.width, state.viewport.width) / 2;
  const halfH = Math.min(WORLD.height, state.viewport.height) / 2;
  return { zoom: clamp(camera.zoom, 1, 1.8), x: clamp(camera.x, halfW, WORLD.width - halfW),
    y: clamp(camera.y, halfH, WORLD.height - halfH) };
}

function pan(state: TrailState, point: Point): void {
  if (!state.pointer) return;
  const dx = point.x - state.pointer.x, dy = point.y - state.pointer.y;
  const before = state.camera;
  state.camera = viewCamera(state, { ...before, x: before.x - dx, y: before.y - dy });
  // The input is already in world coordinates. Rebase the held point as the view moves.
  state.pointer = { x: point.x + state.camera.x - before.x, y: point.y + state.camera.y - before.y };
  state.rest.panX = (state.camera.x - 500) / 500;
  state.dragging = true; state.acted = true; state.gesture = 'drag';
}

export function moveTrail(state: TrailState, input: MiniInput): TrailState {
  if (state.done || state.play.complete || state.game === 'tiger-climb' || !hasPoint(input)) return state;
  const next = copy(state), point = scenePoint(input);
  rememberViewport(next, input);
  if (next.pointer && (next.game === 'tiger-rest' || next.river.phase === 'river')) pan(next, point);
  else return state;
  return next;
}

export function inputTrail(state: TrailState, input: MiniInput): TrailState {
  if (input.action === 'viewport') {
    const next = copy(state); rememberViewport(next, input);
    if (next.game === 'tiger-rest' || next.game === 'tiger-river') next.camera = viewCamera(next, next.camera);
    return next;
  }
  if (state.done || state.play.complete) return state;
  if (input.phase === 'release' && !input.action) return releaseTrail(state);
  const next = copy(state), action = input.action || '';
  rememberViewport(next, input);
  if (input.phase === 'press' && !action) {
    if (!hasPoint(input)) return state;
    const point = scenePoint(input);
    if (next.game === 'tiger-climb') beginWalk(next, point);
    else if (next.game === 'tiger-rest' || next.river.phase === 'river') {
      next.pointer = point; next.dragging = true; next.acted = true; next.gesture = 'drag';
    }
    return next;
  }
  // Toolbar actions are one-shot activations, never pointer-down and pointer-up duplicates.
  if (input.phase === 'press') return state;
  if (next.game === 'tiger-rest' || next.game === 'tiger-passage') {
    if (action === 'continue') { stopWalking(next); next.done = true; next.acted = true;
      next.play.complete = false; next.play.completedAt = null; next.feedback = '继续沿高路行进。'; return next; }
  }
  if (next.game === 'tiger-climb') return state;
  if (next.game === 'tiger-river') {
    if (action === 'continue-to-river' && next.river.phase === 'descent') {
      next.river.phase = 'river'; next.river.descentProgress = 1; next.acted = true;
      next.feedback = PROMPTS[next.game]; emit(next, 'river-arrive'); return next;
    }
    if (next.river.phase !== 'river') return state;
    if (action === 'shutter') {
      if (!requestCapture(next)) next.feedback = next.river.captures.length >= MAX_CAPTURES ? '已有五帧，先选一张收好，或重新取景。' : '正在留下这一帧。';
      return next;
    }
    if (action === 'burst') {
      if (next.river.burst) { next.river.burst = false; next.river.burstRemaining = 0; next.feedback = '连拍停下了，选一帧喜欢的。'; return next; }
      const remaining = MAX_CAPTURES - next.river.captures.length - (next.river.captureRequest ? 1 : 0);
      if (remaining <= 0) { next.feedback = '已有五帧，选一张喜欢的，或重新取景。'; return next; }
      next.river.burst = true; next.river.burstRemaining = remaining;
      if (requestCapture(next)) next.river.burstRemaining--;
      next.river.nextCaptureAt = next.age + .65;
      next.feedback = '连拍中，最多留下五帧；也可以再按一次停下。'; return next;
    }
    if (action === 'stop-burst') {
      next.river.burst = false; next.river.burstRemaining = 0;
      next.feedback = '连拍停下了，选一帧喜欢的。'; return next;
    }
    if (action === 'select-frame' && Number.isInteger(input.value) && input.value! >= 0 && input.value! < next.river.captures.length) {
      next.river.selected = input.value!; next.river.selectionLocked = true; next.river.burst = false; next.river.burstRemaining = 0;
      next.feedback = '选中了这一帧。喜欢的话，就收进手帐。'; next.acted = true; return next;
    }
    if (action === 'keep' || action === 'collect') {
      if (next.river.captureRequest || next.river.burst) { next.feedback = '先停下连拍，选一帧喜欢的画面。'; return next; }
      const selected = next.river.captures[next.river.selected];
      if (!selected?.url) { next.feedback = '先按快门留下画面，再选一帧收进手帐。'; return next; }
      next.acted = true; next.feedback = '这一江激流和自己的构图，留在了手帐里。'; finish(next); return next;
    }
    if (action === 'retake' || action === 'clear-frames') {
      next.river.captures = []; next.river.selected = -1; next.river.selectionLocked = false; next.river.captureRequest = null;
      next.river.burst = false; next.river.burstRemaining = 0; next.play.progress = 0;
      next.feedback = '重新取景。之前已经收好的手帐不会改变。'; return next;
    }
  }
  if (action === 'zoom' && Number.isFinite(input.value) && (next.game === 'tiger-river' || next.game === 'tiger-rest')) {
    const zoom = clamp(input.value!, 1, 1.8), ratio = next.camera.zoom / zoom;
    next.viewport.width = Math.min(WORLD.width, next.viewport.width * ratio);
    next.viewport.height = Math.min(WORLD.height, next.viewport.height * ratio);
    next.camera = viewCamera(next, { ...next.camera, zoom }); next.acted = true;
    next.rest.panX = (next.camera.x - 500) / 500; return next;
  }
  return state;
}

export function releaseTrail(state: TrailState): TrailState {
  if (!state.pointer && !state.keys.length && !state.climb.held && !state.passage.held && !state.river.burst) return state;
  const next = copy(state); stopWalking(next);
  // The controller also uses release on pause/exit: no queued burst may continue on its own.
  next.river.burst = false; next.river.burstRemaining = 0;
  return next;
}

function advanceClimb(state: TrailState, dt: number): void {
  const walk = state.climb, trail = CLIMB_TRAIL;
  if (walk.arrivedAt !== null) return;
  if (!walk.held && !state.keys.length) { walk.speed = 0; return; }
  const direction = pointAt(trail, walk.distance + 12).heading;
  const uphill = Math.max(0, -Math.sin(direction)), bend = Math.min(1, turnAhead(trail, walk.distance, 28) / 1.4);
  const pace = 78 * (1 - uphill * .27) * (1 - bend * .37);
  walk.speed += (pace - walk.speed) * (1 - Math.exp(-dt * 7));
  const travelled = Math.min(walk.speed * dt, trail.length - walk.distance);
  walk.distance += travelled;
  const position = pointAt(trail, walk.distance);
  const behind = pointAt(trail, walk.distance - 6), ahead = pointAt(trail, walk.distance + 10);
  const heading = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
  walk.heading += Math.atan2(Math.sin(heading - walk.heading), Math.cos(heading - walk.heading)) * (1 - Math.exp(-dt * 10));
  walk.position = { x: position.x, y: position.y }; walk.progress = walk.distance / trail.length;
  state.play.progress = walk.progress * .94; state.x = position.x / WORLD.width; state.y = position.y / WORLD.height;
  if (travelled > 0) {
    walk.nextStep -= travelled;
    if (walk.nextStep <= 0) { walk.nextStep += 20; emit(state, 'trail-step', state.x, Math.floor(walk.distance / 20)); }
  }
  if (trail.length - walk.distance <= .2) {
    const end = pointAt(trail, trail.length);
    walk.distance = trail.length; walk.progress = 1; walk.position = { x: end.x, y: end.y };
    walk.arrivedAt = state.age; stopWalking(state);
    state.feedback = '转上山肩了。停下脚步，看看谷底的金沙江。';
    emit(state, 'trail-arrive', end.x / WORLD.width);
  }
}

export function tickTrail(state: TrailState, dt: number): TrailState {
  if (state.done || !Number.isFinite(dt) || dt <= 0) return state;
  const next = copy(state), elapsed = Math.min(.12, dt); next.age += elapsed;
  if (next.play.complete) { next.done = next.age - (next.play.completedAt ?? next.age) >= (next.play.reduced ? .25 : .85); return next; }
  if (next.game === 'tiger-climb') {
    const walk = next.climb;
    const steps = Math.max(1, Math.ceil(elapsed / (1 / 60)));
    for (let i = 0; i < steps; i++) advanceClimb(next, elapsed / steps);
    const follow = next.play.reduced ? 1 : 1 - Math.exp(-elapsed * 3.8);
    const target = walk.arrivedAt !== null ? { x: 590, y: 355, zoom: 1.02 } : {
      x: clamp(walk.position.x + 105, 0, WORLD.width), y: clamp(walk.position.y - 88, 0, WORLD.height), zoom: 1.52 - walk.progress * .15 };
    next.camera.x += (target.x - next.camera.x) * follow;
    next.camera.y += (target.y - next.camera.y) * follow;
    next.camera.zoom += (target.zoom - next.camera.zoom) * follow;
    if (walk.arrivedAt !== null && next.age - walk.arrivedAt >= (next.play.reduced ? .65 : 2.1)) finish(next);
  }
  if (next.game === 'tiger-passage') {
    const walk = next.passage;
    walk.progress = next.play.reduced ? 1 : Math.min(1, walk.progress + elapsed / 7);
    walk.distance = walk.progress * PASSAGE_TRAIL.length;
    const position = pointAt(PASSAGE_TRAIL, walk.distance);
    walk.position = { x: position.x, y: position.y }; walk.heading = position.heading;
    if (walk.progress >= 1 && walk.arrivedAt === null) walk.arrivedAt = next.age;
    walk.speed = walk.arrivedAt !== null ? 0 : PASSAGE_TRAIL.length / 7;
    // A scenic transition is never a completed challenge or a collectible reward.
    next.play.progress = 0; next.play.complete = false;
  }
  if (next.game === 'tiger-river') {
    if (next.river.phase === 'descent') next.river.descentProgress = Math.min(1, next.river.descentProgress + elapsed / 3.4);
    else {
      next.river.waveClock += elapsed;
      if (next.river.burst && next.river.burstRemaining > 0 && !next.river.captureRequest && next.age >= next.river.nextCaptureAt) {
        if (requestCapture(next)) next.river.burstRemaining--;
        next.river.nextCaptureAt = next.age + .65;
      }
      if (next.river.burstRemaining <= 0 && !next.river.captureRequest) next.river.burst = false;
    }
  }
  if ((next.game === 'tiger-rest' || next.game === 'tiger-river' && next.river.phase === 'river') && next.keys.length) {
    const dx = Number(next.keys.includes('ArrowRight')) - Number(next.keys.includes('ArrowLeft'));
    const dy = Number(next.keys.includes('ArrowDown')) - Number(next.keys.includes('ArrowUp'));
    next.camera = viewCamera(next, { ...next.camera, x: next.camera.x + dx * elapsed * 180 / next.camera.zoom,
      y: next.camera.y + dy * elapsed * 180 / next.camera.zoom });
    next.rest.panX = (next.camera.x - 500) / 500;
  }
  return next;
}

export function keyTrail(state: TrailState, key: string, phase: 'down' | 'up' = 'down'): TrailState | null {
  const normalized = keyName(key);
  if (ARROWS.includes(normalized) || state.game === 'tiger-climb' && (normalized === ' ' || normalized === 'Enter')) {
    const next = copy(state);
    next.keys = phase === 'up' ? next.keys.filter(item => item !== normalized) : [...new Set([...next.keys, normalized])];
    if (phase === 'down' && !next.done && !next.play.complete) { next.acted = true; next.gesture = 'keyboard'; }
    if (!next.keys.length && !next.climb.held) { next.climb.speed = 0; next.passage.speed = 0; }
    return next;
  }
  if (phase === 'up') return ['Enter', ' ', '+', '=', '-', '_', 'b', 'B', 'k', 'K'].includes(key) ? state : null;
  if (state.done || state.play.complete) return null;
  if (key === 'Enter' || key === ' ') {
    if (state.game === 'tiger-rest' || state.game === 'tiger-passage') return inputTrail(state, { action: 'continue' });
    return inputTrail(state, { action: state.river.phase === 'descent' ? 'continue-to-river' : 'shutter' });
  }
  if ((key === '+' || key === '=') && (state.game === 'tiger-river' || state.game === 'tiger-rest')) return inputTrail(state, { action: 'zoom', value: state.camera.zoom + .15 });
  if ((key === '-' || key === '_') && (state.game === 'tiger-river' || state.game === 'tiger-rest')) return inputTrail(state, { action: 'zoom', value: state.camera.zoom - .15 });
  if ((key === 'b' || key === 'B') && state.game === 'tiger-river') return inputTrail(state, { action: 'burst' });
  if ((key === 'k' || key === 'K') && state.game === 'tiger-river') return inputTrail(state, { action: 'keep' });
  if (/^[1-5]$/.test(key) && state.game === 'tiger-river') return inputTrail(state, { action: 'select-frame', value: Number(key) - 1 });
  return null;
}
