import type { GameEvent, GameKind, MiniInput, MiniState } from '../contracts';
import { createEncounter, targetEncounter, tickEncounter, passageClear, type TakinEncounter } from './takin';
import { PAINTED_PROPS } from './painterly-art';
import { SnowballWorld, SNOW_GOAL, SNOW_START, type SnowPoint } from './snowball';

export const AOTAI_GAMES = {
  'snow-tracks': { kind: 'snowball', game: 'sling', title: '石海滚雪球', badge: '石海纹理', prompt: '从雪球向右下方轻拖，松手，让它滚进石槽尽头的雪窝。', keys: '方向键调整推送方向，Enter 推出雪球。', memory: '我轻轻推了一团雪，看它沿石槽滚下，碰起一点雪粉，最后稳稳停在雪窝里。石海里也藏着这样的小趣味。', scene: 'stone-sea', place: '鳌山 · 冬日石海' },
  'snow-lichen': { kind: 'wind', game: 'wind', title: '踏风上梁', badge: '秦岭长脊', prompt: '按住小人上山；风强时松手，在岩后歇一下，再继续。', keys: '按住空格或 Enter 前行，松开歇脚。', memory: '飞机梁的风掀起围巾。我在岩后歇了片刻，等风缓下来，再一步步登上山梁，看见更远的秦岭。', scene: 'ridge', place: '飞机梁 · 冬日连峰' },
  'aotai-takin-first': { kind: 'takin', game: 'footsteps', title: '冬林初遇', badge: '秦岭初遇', prompt: '退到宽处，让出山路。', keys: '按住身后地面缓慢退行，松手停下。方向键也可选择下一步，松开停下。', memory: '雪林里，一大一小正要经过。我退到路旁，看小牛慢慢追上母亲。等脚印远去，我也重新背起自己的旅途。', scene: 'forest', place: '2800营地 · 冬日林缘' },
  'aotai-camp-night': { kind: 'camp', game: 'packing', title: '雪夜搭营', badge: '雪夜营灯', prompt: '把两根松开的帐绳拖到地钉处系紧，再点亮帐门里的营灯。', keys: '左右键选帐绳，Enter 抓住，方向键移动，Enter 系紧；再按 Enter 点灯。', memory: '大石河的夜风慢慢吹来。我系紧帐绳，点亮一盏小灯。帐篷稳下来，雪色也有了一点温暖；明早再去看下一道山脊。', scene: 'forest', place: '大石河 · 冬夜营地' },
} satisfies Record<string, { kind: 'snowball' | 'wind' | 'takin' | 'camp'; game: GameKind; title: string; badge: string; prompt: string; keys: string; memory: string; scene: string; place: string }>;
export type AotaiGameId = keyof typeof AOTAI_GAMES;
export const aotaiGameId = (id: string): id is AotaiGameId => Object.hasOwn(AOTAI_GAMES, id);
export const AOTAI_IDS = Object.keys(AOTAI_GAMES).filter(aotaiGameId);
export const sceneFile = (id: AotaiGameId): string => `scenes/aotai-painterly-v1/${AOTAI_GAMES[id].scene === 'forest' ? 'winter-encounter' : AOTAI_GAMES[id].scene}.webp`;
export interface Point { x: number; y: number }
export interface Rect extends Point { width: number; height: number }
type BallMotion = { kind: 'ready' } | { kind: 'aiming'; to: Point } | { kind: 'rolling'; elapsed: number; stable: number; impacts: number } | { kind: 'retry'; elapsed: number };
type Snowball = { kind: 'snowball'; world: SnowballWorld; motion: BallMotion; aim: Point };
type Wind = { kind: 'wind'; progress: number; holding: boolean; rested: boolean; stride: number; gust: number };
type RopeIndex = 0 | 1;
type RopePhase = { kind: 'ropes'; tied: 'none' | 'left' | 'right'; focus: RopeIndex; drag: { index: RopeIndex; point: Point } | null } | { kind: 'lamp'; pressed: boolean } | { kind: 'lit'; elapsed: number };
type Camp = { kind: 'camp'; phase: RopePhase };
export class AotaiState implements MiniState {
  readonly route = 'aotai'; readonly game: GameKind; readonly kind: string;
  age = 0; acted = false; dragging = false; gesture = 'tap'; done = false; x = .5; y = .5; portrait = false;
  events: GameEvent[] = []; serial = 0; feedback: string; settledAt: number | null = null;
  play: { type: string; progress: number; complete: boolean; completedAt: number | null; reduced: boolean };
  session: Snowball | Wind | TakinEncounter | Camp;
  constructor(readonly id: AotaiGameId, reduced: boolean) {
    const spec = AOTAI_GAMES[id]; this.game = spec.game; this.kind = spec.kind; this.feedback = spec.prompt;
    this.play = { type: 'aotai-memory-v2', progress: 0, complete: false, completedAt: null, reduced };
    switch (spec.kind) {
      case 'snowball': this.session = { kind: 'snowball', world: new SnowballWorld(), motion: { kind: 'ready' }, aim: { x: 100, y: 28 } }; break;
      case 'wind': this.session = { kind: 'wind', progress: 0, holding: false, rested: false, stride: 0, gust: 0 }; break;
      case 'takin': this.session = createEncounter(); break;
      case 'camp': this.session = { kind: 'camp', phase: { kind: 'ropes', tied: 'none', focus: 0, drag: null } }; break;
    }
  }
}
export function stateOf(s: MiniState): AotaiState { if (!(s instanceof AotaiState)) throw new Error('鳌太线互动状态不匹配'); return s; }
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const near = (a: Point, b: Point, radius: number) => Math.hypot(a.x - b.x, a.y - b.y) <= radius;
export const inside = (p: Point, r: Rect) => p.x >= r.x && p.y >= r.y && p.x <= r.x + r.width && p.y <= r.y + r.height;
export function layout(s: AotaiState) {
  const height = s.portrait ? 1240 : 720, offset = s.portrait ? 320 : 0;
  const tentHeight = 470 * PAINTED_PROPS.tent.height / PAINTED_PROPS.tent.width;
  const tent = { x: 310, y: height * (s.portrait ? .68 : .79) - tentHeight, width: 470, height: tentHeight };
  const pegs: readonly [Point, Point] = [{ x: 145, y: tent.y + tent.height * .94 }, { x: 895, y: tent.y + tent.height * .95 }];
  const roots: readonly [Point, Point] = [{ x: tent.x + tent.width * .22, y: tent.y + tent.height * .51 }, { x: tent.x + tent.width * .81, y: tent.y + tent.height * .49 }];
  const loose: readonly [Point, Point] = [{ x: 315, y: tent.y + tent.height * .93 }, { x: 785, y: tent.y + tent.height * .98 }];
  const lamp = { x: tent.x + tent.width * .44, y: tent.y + tent.height * .38 };
  return { width: 1000, height, snowOffset: offset, tent, pegs, roots, loose, lamp };
}
export const WIND_SHELTER_PROGRESS = .44;
export function windPointAt(t: number, portrait: boolean): Point {
  const height = portrait ? 1240 : 720;
  return { x: 170 + t * 650, y: height * (.78 - t * 235 / 720 - Math.sin(t * Math.PI) * 25 / 720) };
}
export function windPoint(s: AotaiState): Point { return windPointAt(s.session.kind === 'wind' ? s.session.progress : 0, s.portrait); }
export const windStrength = (age: number): number => { const phase = age % 5.8; return phase < 2.6 ? .17 : phase < 4.4 ? .88 : .3; };
export const ropeTied = (p: RopePhase, index: RopeIndex): boolean => p.kind !== 'ropes' || p.tied === (index === 0 ? 'left' : 'right');
function emit(s: AotaiState, type: string, x = .5, index = 0): void { s.events.push({ serial: ++s.serial, type, x, index }); if (s.events.length > 12) s.events.shift(); }
function settle(s: AotaiState, feedback: string): void {
  if (s.settledAt !== null) return;
  s.settledAt = s.age; s.feedback = feedback; s.dragging = false; s.play.progress = 1; emit(s, 'pack-place');
}
function launch(s: AotaiState, drag: SnowPoint): void {
  const p = s.session; if (p.kind !== 'snowball') return;
  if (Math.hypot(drag.x, drag.y) < 24) { p.motion = { kind: 'ready' }; s.feedback = '轻轻向右下方推一下雪球，再松手。'; return; }
  p.world.launch(drag); p.motion = { kind: 'rolling', elapsed: 0, stable: 0, impacts: p.world.impacts }; s.acted = true; s.gesture = 'drag'; s.feedback = '雪球滚起来了。'; emit(s, 'sling-release', .2);
}
function tieRope(s: AotaiState): void {
  const p = s.session; if (p.kind !== 'camp') return;
  const phase = p.phase; if (phase.kind !== 'ropes') return;
  const drag = phase.drag; if (!drag) return;
  const l = layout(s);
  if (!near(drag.point, l.pegs[drag.index], 70)) { phase.drag = null; s.feedback = '把绳头拉到地钉旁，再松手系紧。'; return; }
  s.acted = true; s.gesture = 'drag'; emit(s, 'pack-place', drag.index ? .85 : .15);
  if (phase.tied !== 'none') { p.phase = { kind: 'lamp', pressed: false }; s.play.progress = .7; s.feedback = '帐篷稳下来了，点亮帐门里的营灯。'; }
  else { phase.tied = drag.index === 0 ? 'left' : 'right'; phase.focus = drag.index === 0 ? 1 : 0; phase.drag = null; s.play.progress = .35; s.feedback = '一根系好了，再拉紧另一根帐绳。'; }
}
function lightLamp(s: AotaiState): void {
  const p = s.session; if (p.kind !== 'camp' || p.phase.kind !== 'lamp') return;
  p.phase = { kind: 'lit', elapsed: 0 }; emit(s, 'aotai-camp-quiet'); s.acted = true; s.play.progress = .9; s.feedback = '营灯亮了，夜风慢慢安静下来。'; emit(s, 'depth-paper');
}
export function actAotai(s: AotaiState, input: MiniInput): AotaiState {
  if (s.settledAt !== null || typeof input.x !== 'number' || typeof input.y !== 'number') return s;
  const p = s.session, at = { x: input.x, y: input.y }, l = layout(s);
  if (input.phase === 'press') {
    switch (p.kind) {
      case 'snowball': if (p.motion.kind === 'ready' && near(at, { x: SNOW_START.x, y: SNOW_START.y + l.snowOffset }, 75)) { p.motion = { kind: 'aiming', to: at }; s.dragging = true; } break;
      case 'wind': if (near(at, { x: windPoint(s).x, y: windPoint(s).y - 55 }, 100)) { p.holding = true; s.dragging = true; s.acted = true; } break;
      case 'takin': if (targetEncounter(p, { x: at.x / 1000, y: at.y / l.height })) { s.dragging = true; s.acted = true; s.gesture = 'hold'; } break;
      case 'camp': if (p.phase.kind === 'ropes') {
        const index = near(at, l.loose[0], 72) ? 0 : near(at, l.loose[1], 72) ? 1 : null;
        if (index !== null && !ropeTied(p.phase, index)) { p.phase.drag = { index, point: at }; p.phase.focus = index; s.dragging = true; }
      } else if (p.phase.kind === 'lamp') p.phase.pressed = near(at, l.lamp, 76); break;
    }
  } else if (input.phase === 'release') {
    switch (p.kind) {
      case 'snowball': if (p.motion.kind === 'aiming') launch(s, { x: at.x - SNOW_START.x, y: at.y - l.snowOffset - SNOW_START.y }); break;
      case 'wind': p.holding = false; break;
      case 'takin': p.target = null; break;
      case 'camp': if (p.phase.kind === 'ropes' && p.phase.drag) { p.phase.drag.point = at; tieRope(s); } else if (p.phase.kind === 'lamp' && p.phase.pressed && near(at, l.lamp, 76)) lightLamp(s); break;
    }
    s.dragging = false;
  }
  return s;
}
export function moveAotai(s: AotaiState, input: MiniInput): AotaiState {
  if (s.settledAt !== null || typeof input.x !== 'number' || typeof input.y !== 'number') return s;
  const p = s.session;
  if (p.kind === 'snowball' && p.motion.kind === 'aiming') p.motion.to = { x: input.x, y: input.y };
  else if (p.kind === 'takin' && s.dragging) targetEncounter(p, { x: input.x / 1000, y: input.y / layout(s).height });
  else if (p.kind === 'camp' && p.phase.kind === 'ropes' && p.phase.drag) p.phase.drag.point = { x: input.x, y: input.y };
  return s;
}
export function releaseAotai(s: AotaiState): AotaiState {
  s.dragging = false; const p = s.session;
  if (p.kind === 'snowball' && p.motion.kind === 'aiming') p.motion = { kind: 'ready' };
  else if (p.kind === 'wind') p.holding = false;
  else if (p.kind === 'takin') p.target = null;
  else if (p.kind === 'camp') { if (p.phase.kind === 'ropes') p.phase.drag = null; if (p.phase.kind === 'lamp') p.phase.pressed = false; }
  return s;
}
export function tickAotai(s: AotaiState, dt: number): AotaiState {
  if (dt <= 0 || !Number.isFinite(dt)) return s;
  s.age += dt; const p = s.session;
  if (s.settledAt === null) switch (p.kind) {
    case 'snowball': if (p.motion.kind === 'rolling') {
      p.world.tick(dt); p.motion.elapsed += dt;
      if (p.world.impacts !== p.motion.impacts) { p.motion.impacts = p.world.impacts; emit(s, 'altar-place', p.world.point.x / 1000); }
      const ball = p.world.point; s.play.progress = clamp((ball.x - SNOW_START.x) / (SNOW_GOAL.x - SNOW_START.x), 0, .94);
      if (near(ball, SNOW_GOAL, 49) && p.world.speed < 1.7) p.motion.stable += dt; else p.motion.stable = 0;
      if (p.motion.stable > .6) settle(s, '雪球停在雪窝里，石海也安静下来。');
      else if (ball.y > 900 || ball.x < 20 || ball.x > 1010 || p.motion.elapsed > 12) { p.motion = { kind: 'retry', elapsed: 0 }; s.feedback = '再轻推一次，让雪球顺着石槽走。'; }
    } else if (p.motion.kind === 'retry') { p.motion.elapsed += dt; if (p.motion.elapsed > 1) { p.world.reset(); p.motion = { kind: 'ready' }; s.play.progress = 0; } } break;
    case 'wind': {
      const gust = windStrength(s.age); if (p.gust <= .6 && gust > .6) emit(s, 'aotai-gust'); p.gust = gust;
      if (!p.holding && p.progress >= .34 && p.progress <= .5 && p.gust > .6) { p.rested = true; s.feedback = '在岩后歇一下，风缓了再按住小人出发。'; }
      if (p.holding) {
        const speed = p.gust > .6 ? .018 : .15, next = Math.min(p.rested ? 1 : .48, p.progress + speed * dt);
        p.stride += (next - p.progress) * 17; p.progress = next;
        s.feedback = p.gust > .6 ? '风强了，松手在岩后歇一下。' : '一步一步，远山正在展开。';
        if (p.progress >= .48 && !p.rested) s.feedback = '松开，在岩后歇一下，等风缓下来。';
      }
      s.play.progress = p.progress;
      if (p.progress >= 1 && p.rested && s.acted) { p.holding = false; settle(s, '登上山梁，秦岭在眼前展开。'); }
      break;
    }
    case 'takin': {
      const result = tickEncounter(p, dt, layout(s).height, s.play.reduced);
      if (result.hoof) emit(s, 'aotai-hoof', p.phase.kind === 'calf' ? .94 - p.phase.progress : .8, Math.floor(p.footsteps));
      if (result.breath) emit(s, 'aotai-breath', .72);
      if (result.cloth) emit(s, 'aotai-cloth', p.actor.x);
      const phase = p.phase;
      s.play.progress = phase.kind === 'opening' ? .02 : phase.kind === 'yielding' ? .08 : phase.kind === 'adult' ? .15 + phase.progress * .3 : phase.kind === 'calf-reveal' ? .5 : phase.kind === 'calf' ? .55 + phase.progress * .3 : .9;
      s.feedback = phase.kind === 'opening' ? '风雪里，传来沉重的踩雪声。' : phase.kind === 'yielding' || phase.kind === 'adult' ? passageClear(p.actor, layout(s).height) ? '停在宽处，等它经过。' : p.actor.x < .36 ? '再向平台里面退一点，主路还没让开。' : AOTAI_GAMES[s.id].prompt : phase.kind === 'calf-reveal' || phase.kind === 'calf' ? '雪幕里还有一组脚步，继续留在宽处。' : '脚步声远了，雪地上留下交错的足迹。';
      if (result.complete && s.acted) settle(s, '山路重新安静下来，把这次相遇留在手帐。');
      break;
    }
    case 'camp': if (p.phase.kind === 'lit') { p.phase.elapsed += dt; if (p.phase.elapsed >= (s.play.reduced ? 1 : 2.5)) settle(s, '帐绳系稳，营灯亮起。把这一夜的温暖收进手帐。'); } break;
  }
  if (s.settledAt !== null && s.age - s.settledAt >= (s.play.reduced ? .7 : 2)) { s.play.complete = true; s.play.completedAt = s.age; s.done = true; }
  return s;
}
export function keyAotai(s: AotaiState, key: string, phase: 'down' | 'up'): AotaiState | null {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(key)) return null;
  const p = s.session, confirm = key === 'Enter' || key === ' ', left = key === 'ArrowLeft', right = key === 'ArrowRight', up = key === 'ArrowUp', down = key === 'ArrowDown';
  if (phase === 'up') { if (p.kind === 'wind' && confirm) p.holding = false; if (p.kind === 'takin') p.target = null; return s; }
  if (s.settledAt !== null) return s;
  switch (p.kind) {
    case 'snowball': if (p.motion.kind === 'ready') { p.aim.x = clamp(p.aim.x + (right ? 20 : left ? -20 : 0), -100, 170); p.aim.y = clamp(p.aim.y + (down ? 20 : up ? -20 : 0), -120, 100); if (confirm) launch(s, p.aim); } break;
    case 'wind': if (confirm) { p.holding = true; s.acted = true; } break;
    case 'takin': if (!confirm && targetEncounter(p, { x: p.actor.x + (left ? -.12 : right ? .12 : 0), y: p.actor.y + (up ? -.12 : down ? .12 : 0) })) { s.acted = true; s.gesture = 'hold'; } break;
    case 'camp': if (p.phase.kind === 'ropes') {
      const phase = p.phase, l = layout(s);
      if (phase.drag) {
        phase.drag.point.x += left ? -48 : right ? 48 : 0; phase.drag.point.y += up ? -48 : down ? 48 : 0;
        if (confirm) tieRope(s);
      } else if (confirm) { if (!ropeTied(phase, phase.focus)) phase.drag = { index: phase.focus, point: { ...l.loose[phase.focus] } }; }
      else if (left || right) phase.focus = right ? 1 : 0;
    } else if (p.phase.kind === 'lamp' && confirm) lightLamp(s); break;
  }
  return s;
}
