import type { ImageCache, MiniInput, MiniViewRefs, SvgFactory } from '../contracts';
import type { MountainWalkState } from './rules';
import { createMountainScene } from './scene-pixi';
import type { MountainEngine } from './scene-pixi';

export { MOUNTAIN_WALK_ASSETS } from './scene-pixi';
export interface MountainWalkRefs extends MiniViewRefs {
  tiger: true; mountain: true; parent: Element; placeholder: SVGElement; status: SVGElement;
  engine: MountainEngine | null; latest: MountainWalkState | null; generation: number;
}
export function drawMountainWalk(svg: SvgFactory, parent: Element): MountainWalkRefs {
  parent.removeAttribute('visibility'); parent.setAttribute('viewBox', '0 0 1000 720'); parent.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  const placeholder = svg('g', {}, parent);
  svg('image', { href: 'scenes/tiger-high-v2.webp', x: -140, y: 0, width: 1280, height: 720, opacity: .62 }, placeholder);
  svg('rect', { x: 190, y: 312, width: 620, height: 80, rx: 14, fill: '#faf6e7', opacity: .92 }, placeholder);
  const status = svg('text', { x: 500, y: 358, 'text-anchor': 'middle', fill: '#4d6554', 'font-size': 19, 'font-family': 'Georgia, Songti SC, serif' }, placeholder);
  status.textContent = '山路正在展开……';
  return { tiger: true, mountain: true, parent, placeholder, status, engine: null, latest: null, generation: 0,
    waitsForArt: true, contentState: 'loading', disposed: false };
}
export function paintMountainWalk(refs: MountainWalkRefs, state: MountainWalkState) {
  if (refs.disposed) return; refs.latest = state;
  if (refs.engine) {
    refs.engine.paint(state); refs.parent.setAttribute('visibility', 'hidden');
  } else {
    refs.parent.removeAttribute('visibility');
    refs.status.textContent = refs.contentState === 'error' ? '这段山路未能展开。可以重试，或继续旅程。' : '山路正在展开……';
  }
}
export async function mountMountainWalk(refs: MountainWalkRefs, host: HTMLElement, cache: ImageCache | undefined, pixi: unknown) {
  const generation = ++refs.generation;
  const cancelled = () => !!refs.disposed || generation !== refs.generation;
  try {
    const engine = await createMountainScene(pixi, host, cache, cancelled, () => {
      if (cancelled()) return;
      refs.engine = null; refs.contentState = 'error';
      if (refs.latest) paintMountainWalk(refs, refs.latest);
    });
    if (cancelled()) { engine?.dispose(); return; }
    refs.engine = engine; refs.contentState = engine ? 'ready' : 'error';
    if (refs.latest) paintMountainWalk(refs, refs.latest);
  } catch {
    if (cancelled()) return;
    refs.contentState = 'error';
    if (refs.latest) paintMountainWalk(refs, refs.latest);
  }
}
export function disposeMountainWalk(refs: MountainWalkRefs) {
  if (refs.disposed) return;
  refs.disposed = true; refs.generation++; refs.engine?.dispose(); refs.engine = null; refs.latest = null;
  refs.parent.removeAttribute('visibility'); refs.placeholder.remove();
}
export const mountainWalkPoint = (_refs: MountainWalkRefs, point: MiniInput): MiniInput => point;
