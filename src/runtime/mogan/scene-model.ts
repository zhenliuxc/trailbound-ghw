import { CUP, RAIN_PHRASE, clamp, ease, leafTip, stepFoot, stepTiming, stepSpot, stonePose } from './rules';
import type { LegacySling, MoganKind, MoganState, Point, StepsState } from './rules';
import { MOGAN_PROPS, SHARED_PROPS } from './assets';
import { hintPose } from '../hint-art';
import type { HintPose } from '../hint-art';

export type Resource = 'scene' | 'actor' | 'front';
export interface SpritePose {
  key: string; resource: Resource; frame?: number; x: number; y: number; width: number;
  anchorX: number; anchorY: number; rotation: number; alpha: number; flip: boolean; bend: number;
}
export type Shape =
  | { type: 'ellipse'; x: number; y: number; rx: number; ry: number; color: string; alpha: number; stroke?: number }
  | { type: 'line'; points: Point[]; color: string; alpha: number; stroke: number }
  | { type: 'rect'; x: number; y: number; w: number; h: number; color: string; alpha: number; stroke?: number };
export interface MoganFrame {
  sprites: SpritePose[]; ambient: Shape[]; water: Shape[]; effects: Shape[]; hints: HintPose[];
  clip: { x: number; y: number; rx: number; ry: number } | null; alpha: number; paper: number;
}
export const stageBounds = (height: number) => { const side = Math.min(800, height * .98); return { x: (800 - side) / 2, y: (height - side) / 2, w: side, h: side }; };
function ellipse(list: Shape[], x: number, y: number, rx: number, ry: number, color: string, alpha = 1, stroke?: number) { list.push({ type: 'ellipse', x, y, rx, ry, color, alpha, stroke }); }
function line(list: Shape[], points: Point[], color: string, stroke: number, alpha = 1) { list.push({ type: 'line', points, color, stroke, alpha }); }
function sprite(frame: MoganFrame, key: string, resource: Resource, at: Point, width: number, options: Partial<Pick<SpritePose, 'frame' | 'anchorX' | 'anchorY' | 'rotation' | 'alpha' | 'flip' | 'bend'>> = {}) {
  frame.sprites.push({ key, resource, x: at.x, y: at.y, width, anchorX: .5, anchorY: .5, rotation: 0, alpha: 1, flip: false, bend: 0, ...options });
}
function rain(frame: MoganFrame, s: Extract<MoganState, { game: 'rain' }>, height: number) {
  const r = s.rain, x = r.cupX * 800, y = CUP.mouthY * height;
  for (let i = 0; i < 6; i++) {
    const tip = leafTip(i, s.age, !!s.play.reduced);
    // The frame records the real terminal leaf tip. This same point emits the drop.
    sprite(frame, 'rain-leaf-' + i, 'front', { x: tip.x * 800, y: tip.y * height }, 148,
      { frame: 3, anchorX: MOGAN_PROPS.tip.x, anchorY: MOGAN_PROPS.tip.y, alpha: .93 });
  }
  const next = leafTip(RAIN_PHRASE[Math.min(7, r.caught)], s.age, !!s.play.reduced), growing = clamp(1 - r.nextIn / .85);
  if (!r.drop && !s.play.complete) {
    ellipse(frame.effects, next.x * 800, next.y * height + 2, 2.3 + growing * 3.3, 3.5 + growing * 5, '#d0e5d8', .92);
    ellipse(frame.effects, next.x * 800 - 1, next.y * height, 1.1, 2, '#fffcee', .95);
    if (s.acted) line(frame.ambient, [{ x: next.x * 800 - 14, y: y + 3 }, { x: next.x * 800 - 2, y: y + 1 }, { x: next.x * 800 + 13, y: y + 3 }], '#e8eee2', 1.5, .35);
  }
  const shadowY = y + CUP.width * 480 / 386 * (1 - CUP.anchorY);
  ellipse(frame.ambient, x + 3, shadowY + 3, 57, 9, '#224b42', .14);
  sprite(frame, 'cup', 'actor', { x, y }, CUP.width, { anchorY: CUP.anchorY });
  frame.clip = { x, y, rx: CUP.mouthRadius - 3, ry: 18 };
  const waterY = y + 4 - r.caught * .5;
  ellipse(frame.water, x, waterY, CUP.waterRadius, CUP.waterDepth, '#6aab99', .26 + r.caught * .025);
  ellipse(frame.water, x, waterY, CUP.waterRadius - 2, CUP.waterDepth - 2, '#e3efd5', .52, 1);
  for (const e of s.events) {
    const age = s.age - e.age;
    if (e.type !== 'catch' || age < 0 || age > .8) continue;
    const q = age / .8, impactX = x + (e.offsetX ?? 0) * 800;
    ellipse(frame.water, impactX * (1 - q) + x * q, waterY, 3 + q * 41, 2 + q * 15, '#fff6d7', 1 - q, 1.6);
    if (!s.play.reduced) for (let j = 0; j < 5; j++) {
      ellipse(frame.effects, impactX + (j - 2) * q * 12, y - Math.sin(q * Math.PI) * (14 + j % 2 * 8), 1.3, 2.1, '#e6f2dc', (1 - q) * .85);
    }
  }
  if (r.drop && !s.play.complete) {
    const d = r.drop;
    ellipse(frame.effects, d.x * 800, d.y * height, 4.5, 8, '#bedfd5', .98);
    ellipse(frame.effects, d.x * 800 - 1, d.y * height - 2, 1.2, 3.5, '#fffceb', .93);
  }
}
function footsteps(frame: MoganFrame, s: StepsState, height: number) {
  const step = s.steps, target = Math.min(9, step.index), timing = stepTiming(s), resource: Resource = 'actor';
  // Perspective changes size uniformly, so the granite slab never squashes.
  for (let ordinal = Math.min(9, step.index + 6); ordinal >= Math.max(0, step.index - 1); ordinal--) {
    const p = stonePose(s, ordinal, height);
    if (p.y > height * 1.35) continue;
    sprite(frame, 'stone-' + ordinal, resource, p, p.width, { frame: 0, alpha: .56 + p.q * .4 });
    const landed = ordinal < step.index;
    if (landed || ordinal === target && !s.play.complete) {
      const left = stepFoot(ordinal) === 'left', x = p.x + (left ? -1 : 1) * p.width * .135, y = p.y - p.width * .05;
      const ready = !s.acted || step.clock >= timing.open;
      sprite(frame, 'shoe-' + ordinal, resource, { x, y }, p.width * .112,
        { frame: left ? 1 : 2, anchorY: .78, rotation: left ? -.035 : .035, alpha: landed ? .76 : ready ? .98 : .42 + timing.progress * .16 });
      if (!landed && !step.recovery) {
        const spot = stepSpot(s, height);
        frame.hints.push(hintPose('next-footstep', { x: spot.x + (left ? -1 : 1) * spot.rx * .5, y: spot.y }, clamp(p.width * .17, 64, 100), left ? 0 : Math.PI, ready ? .95 : .2));
      }
    }
  }
  // Near bamboo frames the path, rather than floating over the current stair.
  sprite(frame, 'path-branch-left', resource, { x: 0, y: height * .15 }, 210, { frame: 3, anchorX: .15, anchorY: .2, rotation: -.2, alpha: .75, bend: s.play.reduced ? 0 : Math.sin(s.age * .8) * 4 });
  sprite(frame, 'path-branch-right', resource, { x: 800, y: height * .32 }, 180, { frame: 3, anchorX: .15, anchorY: .2, rotation: .2, flip: true, alpha: .8, bend: s.play.reduced ? 0 : Math.sin(s.age * .9 + 1) * 4 });
  const recent = s.events.filter(e => e.type === 'step-land').at(-1), age = recent ? s.age - recent.age : 9;
  if (recent && age < .55 && !s.play.reduced) {
    const p = stonePose(s, recent.index ?? 0, height), x = p.x + ((recent.index ?? 0) % 2 ? 1 : -1) * p.width * .135;
    const y = p.y - p.width * .04;
    for (const side of [-1, 1]) line(frame.effects, [{ x: x + side * 16, y: y + 9 }, { x: x + side * 25, y: y + 7 }, { x: x + side * 32, y: y + 10 }], '#e5e9d5', 2, .55 * (1 - age / .55));
  }
}
function sling(frame: MoganFrame, s: Extract<MoganState, { game: 'sling' }>, height: number, legacy: LegacySling) {
  const b = stageBounds(height), toWorld = (p: Point) => ({ x: b.x + p.x * b.w, y: b.y + p.y * b.h }), q = s.sling;
  for (const [i, obstacle] of legacy.obstacles.entries()) {
    const source = SHARED_PROPS.frames[6], at = toWorld(obstacle);
    sprite(frame, 'bamboo-stalk-' + i, 'actor', at, obstacle.h * b.w * source.w / source.h, { frame: 6, anchorX: 0, anchorY: 0 });
  }
  const target = toWorld(legacy.target), labelFrame = SHARED_PROPS.frames[7];
  sprite(frame, 'paper-label', 'actor', target, legacy.target.h * b.w * labelFrame.w / labelFrame.h, { frame: 7, anchorX: 0, anchorY: 0 });
  const forkFrame = SHARED_PROPS.frames[4], forkWidth = .26 * b.w * forkFrame.w / forkFrame.h;
  const fork = { x: b.x + legacy.slingOrigin.x * b.w, y: b.y + .685 * b.h };
  sprite(frame, 'bamboo-fork', 'actor', fork, forkWidth, { frame: 4, anchorY: 0 });
  let pouch = legacy.aimPouch(s);
  if (q.stage !== 'ready') {
    const t = s.play.reduced ? 10 : s.age - (q.releasedAt ?? q.at), spring = Math.exp(-t * 11) * Math.cos(t * 26);
    pouch = { x: legacy.slingOrigin.x + (pouch.x - legacy.slingOrigin.x) * spring, y: legacy.slingOrigin.y + (pouch.y - legacy.slingOrigin.y) * spring };
  }
  const ends = [{ x: fork.x - forkWidth * .33, y: fork.y + b.h * .0156 }, toWorld(pouch), { x: fork.x + forkWidth * .33, y: fork.y + b.h * .0156 }];
  line(frame.effects, ends, '#5c634b', 3, .93); line(frame.effects, ends.map(p => ({ x: p.x, y: p.y - 1 })), '#e8dab4', .85, .83);
  const leaf = q.shot || legacy.aimPouch(s), angle = q.shot ? Math.atan2(q.shot.vy, q.shot.vx || .001) * .3 : -.25;
  sprite(frame, 'paper-leaf', 'actor', toWorld(leaf), .057 * b.w, { frame: 5, rotation: angle + (s.play.reduced ? 0 : q.stage === 'flight' ? Math.sin(s.age * 8) * .06 : 0) });
  if (q.stage === 'ready' && !q.aiming && !s.play.complete) {
    const handle = toWorld(leaf);
    frame.hints.push(hintPose('pull-paper-leaf', { x: handle.x - 16, y: handle.y + 10 }, 88, -.55, s.play.reduced ? .9 : .82 + Math.sin(s.age * 1.5) * .08));
  }
  if (q.stage === 'ready' && !s.play.complete) for (const [i, p] of legacy.preview(s, 18).entries()) {
    const world = toWorld(p); ellipse(frame.effects, world.x, world.y, 2, 2, '#fff9dc', .75 * (1 - i / 23));
  }
  if (q.trail.length > 1 && !s.play.reduced) line(frame.effects, q.trail.map(toWorld), '#fff4d7', 1.3, .25);
  sprite(frame, 'sling-canopy-left', 'front', { x: 30, y: height * .08 }, 235, { frame: 3, anchorX: .12, anchorY: .1, alpha: .75, bend: s.play.reduced ? 0 : Math.sin(s.age * .85) * 6 });
  sprite(frame, 'sling-canopy-right', 'front', { x: 800, y: height * .11 }, 215, { frame: 3, anchorX: .15, anchorY: .1, flip: true, alpha: .8, bend: s.play.reduced ? 0 : Math.sin(s.age * .7 + 1) * 5 });
  const caught = s.events.filter(e => e.type === 'sling-catch').at(-1), age = caught ? s.age - caught.age : 9;
  if (caught && age < 1.5) {
    const center = toWorld(caught), amount = s.play.reduced ? .6 : age / 1.5;
    ellipse(frame.effects, center.x, center.y, 12 + amount * 54, 10 + amount * 37, '#f7e2ad', 1 - amount, 1.6);
  }
}
export function moganFrame(s: MoganState, height: number, legacy: LegacySling): MoganFrame {
  const elapsed = s.play.complete ? s.age - (s.play.completedAt ?? s.age) : 0;
  const frame: MoganFrame = { sprites: [], ambient: [], water: [], effects: [], hints: [], clip: null, alpha: s.play.reduced ? 1 : .5 + .5 * ease(s.age / .65), paper: s.play.complete ? (s.play.reduced ? 1 : ease((elapsed - .65) / 1.2)) : 0 };
  sprite(frame, 'background', 'scene', { x: 400, y: height / 2 }, Math.max(800, height * 1280 / 720));
  // Follow the journey's virtual weather; clear scenes keep only leaf-tip water.
  if (s.weather === 'fog') {
    frame.ambient.push({ type: 'rect', x: 0, y: 0, w: 800, h: height, color: '#e3eadc', alpha: .23 });
    ellipse(frame.ambient, 455, height * .42, 500, height * .14, '#f1f3e9', .19);
  } else if (s.weather === 'rain' || s.weather === 'storm') {
    frame.ambient.push({ type: 'rect', x: 0, y: 0, w: 800, h: height, color: '#728c82', alpha: s.weather === 'storm' ? .28 : .16 });
    if (!s.play.reduced) for (let i = 0; i < 14; i++) {
      const px = (i * 91 + s.age * 5) % 840 - 20, py = (i * 69 + s.age * 105) % height;
      line(frame.effects, [{ x: px, y: py }, { x: px - 1, y: py + 8 }], '#edf5e3', 1, .16);
    }
  }
  if (s.game === 'rain') rain(frame, s, height);
  else if (s.game === 'footsteps') footsteps(frame, s, height);
  else sling(frame, s, height, legacy);
  return frame;
}
export const chapterNames: Record<MoganKind, string> = { rain: '竹涛一阵', footsteps: '古道留痕', sling: '林隙远山' };
