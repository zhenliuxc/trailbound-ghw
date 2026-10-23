import type { GameEvent, MiniInput, MiniState, MomentEntry } from '../contracts.js';
import { WALK_LENGTH, sampleWalk } from './world.js';
import type { WalkPose } from './world.js';
import { CLIMB_LENGTH, climbPose, gorgeOpenness } from './climb-layout';

export const WALK_ENTRY_ID = 'tiger-28-bends-v1';
/** World distance follows the same path used by the feet and camera. */
export const WALK_SPEED = 1.25;

export type WalkCameraStage = 'slope' | 'shoulder' | 'gorge' | 'view';
interface WalkPointer {
  x: number;
  y: number;
  startX: number;
  startY: number;
  startedAt: number;
  walkingBefore: boolean;
  dragged: boolean;
  holdActive: boolean;
}

export interface MountainWalkState extends MiniState {
  game: 'tiger-climb';
  distance: number;
  speed: number;
  walking: boolean;
  held: boolean;
  pose: WalkPose;
  look: { yaw: number; pitch: number };
  reached: boolean;
  cameraStage: WalkCameraStage;
  gorgeOpenness: number;
  feedback: string;
  events: GameEvent[];
  serial: number;
  /** A travelled-distance clock keeps visible steps and their sounds together. */
  nextStep: number;
  steps: number;
  pointer: WalkPointer | null;
  keys: string[];
}

const HOLD_DELAY = .27;
const STEP_LENGTH = .72;
const MAX_YAW = 1.05;
const MIN_PITCH = -.28;
const MAX_PITCH = .24;
const clamp = (value: number, low = 0, high = 1): number => Math.max(low, Math.min(high, value));
const hasPoint = (point: MiniInput): point is MiniInput & { x: number; y: number } => Number.isFinite(point.x) && Number.isFinite(point.y);
const normalizedPoint = (point: { x: number; y: number }): { x: number; y: number } => ({ x: clamp(point.x), y: clamp(point.y) });

function cameraStage(distance: number): WalkCameraStage {
  const progress = distance / CLIMB_LENGTH;
  return progress < .3 ? 'slope' : progress < .57 ? 'shoulder' : progress < .88 ? 'gorge' : 'view';
}

function stageFeedback(state: MountainWalkState): string {
  if (state.reached) return '走过山肩，金沙江在脚下展开。停下来看看，亲手拍下喜欢的画面再收进手帐。';
  if (!state.walking) return '停下来看看。轻点继续，按住慢行，拖动看看山谷。';
  return ({
    slope: '沿坡慢慢走。轻点停下，拖动画面看看身旁的山。',
    shoulder: '山路绕过近处岩壁，前方的峡谷正在展开。',
    gorge: '越过山肩，金沙江与对岸山体渐渐显露。随时可以停下看景。',
    view: '前面就是歇脚看江的地方，慢慢走过去。',
  })[state.cameraStage];
}

export function createMountainWalk(entry: MomentEntry, options: { reduced: boolean; weather?: string; initialProgress?: number }): MountainWalkState {
  const progress = Number.isFinite(options.initialProgress) ? clamp(options.initialProgress ?? 0) : 0;
  const distance = progress * CLIMB_LENGTH;
  const reached = progress >= 1;
  return {
    id: entry.id, route: 'tiger', kind: 'tiger-climb', game: 'tiger-climb', age: 0,
    acted: false, dragging: false, gesture: 'tap', done: false, x: .5, y: .5,
    play: { type: 'tiger-climb', progress, complete: false, completedAt: null, reduced: options.reduced },
    distance, speed: 0, walking: !reached, held: false, pose: sampleWalk(progress * WALK_LENGTH),
    look: { yaw: 0, pitch: 0 }, reached, cameraStage: cameraStage(distance), gorgeOpenness: gorgeOpenness(distance),
    feedback: reached ? '又回到了山肩的看江处。拍下喜欢的画面，才会收进手帐。' : '沿坡慢慢走。轻点停走，按住慢行，拖动看看山谷。',
    events: [], serial: 0, nextStep: (Math.floor(distance / STEP_LENGTH + .5) + .5) * STEP_LENGTH,
    steps: Math.floor(distance / STEP_LENGTH), pointer: null, keys: [],
  };
}

function copy(state: MountainWalkState): MountainWalkState {
  return { ...state, play: { ...state.play }, pose: { ...state.pose, position: { ...state.pose.position } },
    look: { ...state.look }, pointer: state.pointer ? { ...state.pointer } : null,
    keys: state.keys.slice(), events: state.events.slice(-31) };
}

function emit(state: MountainWalkState, type: string, index?: number): void {
  state.events.push({ serial: ++state.serial, type, x: .42, ...(index === undefined ? {} : { index }) });
  if (state.events.length > 32) state.events.shift();
}

function setWalking(state: MountainWalkState, walking: boolean): void {
  const previous = state.walking || state.speed > .01;
  state.walking = walking && !state.reached && !state.play.complete;
  if (!state.walking) {
    state.speed = 0;
    if (previous) emit(state, 'trail-stop');
  }
  state.feedback = stageFeedback(state);
}

function clearGesture(state: MountainWalkState): void {
  state.held = false;
  state.dragging = false;
  state.pointer = null;
}

function keepView(state: MountainWalkState): void {
  if (!state.reached) return;
  setWalking(state, false);
  clearGesture(state);
  state.keys = [];
  state.acted = true;
  state.play.complete = true;
  state.play.progress = 1;
  state.play.completedAt = state.age;
  state.feedback = '把走过山肩、望见金沙江的这一刻，收进手帐。';
  emit(state, 'complete');
}

/** A quick tap changes the walking intent; holding and looking are distinct gestures. */
export function inputMountainWalk(state: MountainWalkState, input: MiniInput): MountainWalkState {
  if (state.done || state.play.complete) return state;
  const action = input.action || '';
  if (action) {
    if (!['toggle-walk', 'pause-walk', 'resume-walk', 'look-reset', 'keep', 'collect'].includes(action)) return state;
    const next = copy(state);
    clearGesture(next);
    next.acted = true;
    if (action === 'keep' || action === 'collect') {
      if (!next.reached) return state;
      keepView(next);
    } else if (action === 'look-reset') {
      next.look = { yaw: 0, pitch: 0 };
      next.feedback = stageFeedback(next);
    } else setWalking(next, action === 'resume-walk' || action === 'toggle-walk' && !next.walking);
    return next;
  }
  if (input.phase === 'press') {
    if (!hasPoint(input)) return state;
    const point = normalizedPoint(input), next = copy(state);
    next.pointer = { ...point, startX: point.x, startY: point.y, startedAt: next.age,
      walkingBefore: next.walking, dragged: false, holdActive: false };
    next.held = true;
    next.dragging = false;
    next.x = point.x;
    next.y = point.y;
    return next;
  }
  if (input.phase === 'release') {
    if (!state.pointer) return state;
    const next = copy(state), pointer = next.pointer!;
    next.acted = true;
    if (pointer.dragged || input.dragged) {
      setWalking(next, false);
      next.gesture = 'drag';
    } else if (pointer.holdActive || next.age - pointer.startedAt >= HOLD_DELAY) {
      setWalking(next, false);
      next.gesture = 'hold';
    } else {
      setWalking(next, !pointer.walkingBefore);
      next.gesture = 'tap';
    }
    clearGesture(next);
    return next;
  }
  // Enter/assist activations from accessibility tools have no pointer pair.
  if (input.assist || input.gesture === 'tap') {
    const next = copy(state);
    next.acted = true;
    setWalking(next, !next.walking);
    return next;
  }
  return state;
}

export function moveMountainWalk(state: MountainWalkState, input: MiniInput): MountainWalkState {
  if (state.done || state.play.complete || !state.pointer || !hasPoint(input)) return state;
  const next = copy(state), point = normalizedPoint(input), pointer = next.pointer!;
  const dx = point.x - pointer.x, dy = point.y - pointer.y;
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return state;
  next.look.yaw = clamp(next.look.yaw - dx * 2.25, -MAX_YAW, MAX_YAW);
  next.look.pitch = clamp(next.look.pitch + dy * .75, MIN_PITCH, MAX_PITCH);
  pointer.x = point.x;
  pointer.y = point.y;
  pointer.dragged = true;
  pointer.holdActive = false;
  next.dragging = true;
  next.acted = true;
  next.gesture = 'drag';
  next.x = point.x;
  next.y = point.y;
  setWalking(next, false);
  return next;
}

/** Backgrounding, focus loss and toolbar changes must never leave held walking active. */
export function releaseMountainWalk(state: MountainWalkState): MountainWalkState {
  if (!state.walking && state.speed === 0 && !state.held && !state.pointer && !state.keys.length) return state;
  const next = copy(state);
  setWalking(next, false);
  clearGesture(next);
  next.keys = [];
  return next;
}

export function tickMountainWalk(state: MountainWalkState, dt: number): MountainWalkState {
  if (state.done || !Number.isFinite(dt) || dt <= 0) return state;
  const next = copy(state), elapsed = Math.min(.1, dt);
  next.age += elapsed;
  if (next.play.complete) {
    next.done = next.age - (next.play.completedAt ?? next.age) >= (next.play.reduced ? .25 : .8);
    return next;
  }
  if (next.pointer && next.held && !next.pointer.dragged && !next.pointer.holdActive && next.age - next.pointer.startedAt >= HOLD_DELAY) {
    next.pointer.holdActive = true;
    next.acted = true;
    next.gesture = 'hold';
    setWalking(next, true);
  }
  const lookDirection = Number(next.keys.includes('ArrowRight')) - Number(next.keys.includes('ArrowLeft'));
  if (lookDirection) next.look.yaw = clamp(next.look.yaw + lookDirection * elapsed * .58, -MAX_YAW, MAX_YAW);
  if (!next.walking || next.reached || next.pointer?.dragged) return next;

  const targetSpeed = WALK_SPEED / (1 + Math.max(0, climbPose(next.distance).grade) * .6);
  next.speed += (targetSpeed - next.speed) * (1 - Math.exp(-elapsed * 3.5));
  next.distance = Math.min(CLIMB_LENGTH, next.distance + next.speed * elapsed);
  next.play.progress = clamp(next.distance / CLIMB_LENGTH);
  next.pose = sampleWalk(next.play.progress * WALK_LENGTH);
  next.gorgeOpenness = gorgeOpenness(next.distance);
  const stage = cameraStage(next.distance);
  if (stage !== next.cameraStage) {
    next.cameraStage = stage;
    next.feedback = stageFeedback(next);
  }
  while (next.distance >= next.nextStep && next.nextStep < CLIMB_LENGTH) {
    emit(next, 'trail-step', next.steps++);
    next.nextStep += STEP_LENGTH;
  }
  if (next.distance >= CLIMB_LENGTH) {
    next.reached = true;
    next.cameraStage = 'view';
    setWalking(next, false);
    clearGesture(next);
    next.keys = [];
    next.play.progress = 1;
    // Arrival enables collecting; it does not itself create a journal entry.
    emit(next, 'trail-arrive');
    next.feedback = stageFeedback(next);
  }
  return next;
}

const KEY_ALIASES: Record<string, string> = { a: 'ArrowLeft', d: 'ArrowRight', w: 'ArrowUp', s: 'ArrowDown', Spacebar: ' ' };

export function keyMountainWalk(state: MountainWalkState, key: string, phase: 'down' | 'up' = 'down'): MountainWalkState | null {
  const normalized = KEY_ALIASES[key] || KEY_ALIASES[key.toLowerCase()] || key;
  const arrow = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(normalized);
  const supported = arrow || [' ', 'Enter', 'Home', 'Escape'].includes(normalized);
  if (!supported) return null;
  if (state.done || state.play.complete) return state;
  if (phase === 'up') {
    if (!arrow || !state.keys.includes(normalized)) return state;
    const next = copy(state);
    next.keys = next.keys.filter(item => item !== normalized);
    return next;
  }
  if (normalized === ' ') return inputMountainWalk(state, { action: 'toggle-walk' });
  if (normalized === 'Enter') return state.reached ? inputMountainWalk(state, { action: 'keep' }) : inputMountainWalk(state, { action: 'toggle-walk' });
  if (normalized === 'Home') return inputMountainWalk(state, { action: 'look-reset' });
  if (normalized === 'Escape') return inputMountainWalk(state, { action: 'pause-walk' });
  const next = copy(state);
  if (!next.keys.includes(normalized)) next.keys.push(normalized);
  next.acted = true;
  next.gesture = 'keyboard';
  if (normalized === 'ArrowUp') setWalking(next, true);
  if (normalized === 'ArrowDown') setWalking(next, false);
  return next;
}
