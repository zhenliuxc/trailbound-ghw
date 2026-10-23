export type Bird = 0 | 1 | 2;
export const BIRDS = [0, 1, 2] satisfies readonly Bird[];
export const PHRASES = [[0, 2], [1, 0, 2]] satisfies readonly (readonly Bird[])[];
export const PERCHES = [{ x: 220, y: 322 }, { x: 500, y: 262 }, { x: 780, y: 339 }];
export function birdsongLayout(width: number, height: number) {
  const portrait = height > width;
  const sceneHeight = 1000 * height / Math.max(1, width);
  const cover = Math.max(1, sceneHeight / 1500), left = (1000 - 1000 * cover) / 2, top = (sceneHeight - 1500 * cover) / 2;
  const camera = coverCamera(1000, sceneHeight, { width: 1000, height: 667 }, { x: 500, y: 255 });
  const scale = portrait ? .38 * cover : .25 * camera.scale;
  const perches = portrait ? [{ x: 220 * cover + left, y: 334.5 * cover + top }, { x: 500, y: 882 * cover + top }, { x: 780 * cover + left, y: 750 * cover + top }] : PERCHES.map(camera.toScreen);
  return { portrait, height: sceneHeight, scale, perches, headOffset: 45 * scale / .25, camera };
}
type EchoPhase = { kind: 'arriving'; elapsed: number }
  | { kind: 'listening'; cursor: number; wait: number }
  | { kind: 'answering'; idle: number }
  | { kind: 'breath'; elapsed: number }
  | { kind: 'leaving'; elapsed: number }
  | { kind: 'finished' };
export interface Birdsong {
  kind: 'birdsong'; round: 0 | 1; matched: number; phase: EchoPhase;
  cue: { bird: Bird; age: number; source: 'call' | 'answer' } | null;
  repeated: boolean;
}
export function createBirdsong(): Birdsong {
  return { kind: 'birdsong', round: 0, matched: 0, phase: { kind: 'arriving', elapsed: 0 }, cue: null, repeated: false };
}
export function repeatBirdsong(p: Birdsong): void {
  if (p.phase.kind === 'leaving' || p.phase.kind === 'finished' || p.phase.kind === 'breath') return;
  p.phase = { kind: 'listening', cursor: p.matched, wait: .55 }; p.cue = null;
}
export function answerBird(p: Birdsong, bird: Bird): boolean {
  if (p.phase.kind !== 'answering') return false;
  const phrase = PHRASES[p.round];
  if (phrase[p.matched] !== bird) {
    p.repeated = true; repeatBirdsong(p); return false;
  }
  p.matched++; p.cue = { bird, age: 0, source: 'answer' }; p.repeated = false;
  p.phase = p.matched < phrase.length ? { kind: 'answering', idle: 0 }
    : p.round === 0 ? { kind: 'breath', elapsed: 0 } : { kind: 'leaving', elapsed: 0 };
  return true;
}
export function tickBirdsong(p: Birdsong, dt: number): Bird | null {
  if (p.cue) { p.cue.age += dt; if (p.cue.age >= .85) p.cue = null; }
  const phase = p.phase;
  switch (phase.kind) {
    case 'arriving':
      phase.elapsed += dt; if (phase.elapsed >= 1.15) repeatBirdsong(p); break;
    case 'listening': {
      phase.wait -= dt;
      if (phase.wait > 0) break;
      const bird = PHRASES[p.round][phase.cursor];
      if (bird === undefined) p.phase = { kind: 'answering', idle: 0 };
      else { phase.cursor++; phase.wait = 1.2; p.cue = { bird, age: 0, source: 'call' }; return bird; }
      break;
    }
    case 'answering':
      phase.idle += dt; if (phase.idle >= 10) repeatBirdsong(p); break;
    case 'breath':
      phase.elapsed += dt;
      if (phase.elapsed >= 1.65) { p.round = 1; p.matched = 0; p.repeated = false; p.phase = { kind: 'listening', cursor: 0, wait: .5 }; }
      break;
    case 'leaving':
      phase.elapsed += dt; if (phase.elapsed >= 2) p.phase = { kind: 'finished' }; break;
    case 'finished': break;
    default: { const exhaustive: never = phase; return exhaustive; }
  }
  return null;
}
export function birdsongFeedback(p: Birdsong): string {
  switch (p.phase.kind) {
    case 'arriving': return '海浪声远了，林间传来一小段鸣叫。';
    case 'listening': return p.repeated ? '再听剩下这一段，已经回应过的留着。' : p.round === 0 ? '先听两声，看看是哪两只小鸟。' : '这次多了一声，先看它们依次鸣叫。';
    case 'answering': return p.matched ? '记住了这一声，接着回应。' : '轮到你了，按刚才的顺序轻点小鸟。';
    case 'breath': return '回应上了，树枝上又响起一段短句。';
    case 'leaving': case 'finished': return '鸣叫在林间接上了，海风还在山口等你。';
    default: { const exhaustive: never = p.phase; return exhaustive; }
  }
}
import { coverCamera } from '../projection';

