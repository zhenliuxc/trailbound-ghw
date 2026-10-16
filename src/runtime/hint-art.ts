import type * as Pixi from 'pixi.js';
import type { AssetEntry, SvgFactory } from './contracts';
import { HINT_ART } from './hint-asset';

export { HINT_ART } from './hint-asset';
export interface HintPose { key: string; x: number; y: number; width: number; rotation: number; alpha: number }
interface CreekState { age: number; gates: number; play: { complete: boolean; reduced?: boolean } }
interface Point { x: number; y: number }

/** The painted tip, rather than the image's transparent box, points at the action. */
export function hintPose(key: string, at: Point, width = 96, rotation = 0, alpha = 1): HintPose {
  return { key, x: at.x, y: at.y, width, rotation, alpha };
}
export function creekHints(s: CreekState, gates: readonly Point[], height: number): HintPose[] {
  const target = gates[s.gates];
  if (!target || s.play.complete) return [];
  const alpha = s.play.reduced ? .94 : .87 + Math.sin(s.age * 1.5) * .07;
  return [hintPose('next-water-mouth', { x: target.x * 800, y: target.y * height }, 100, 0, alpha)];
}
/** Two open, uneven water strokes show the real passage height without enclosing it. */
export function creekHintStrokes(s: CreekState, gates: readonly Point[], height: number) {
  const target = gates[s.gates];
  if (!target || s.play.complete) return [];
  const x = target.x * 800, y = target.y * height;
  return [-1, 1].map(side => [
    { x: x - 28, y: y + side * height * .14 },
    { x: x - 12, y: y + side * height * .14 - 2 },
    { x: x + 9, y: y + side * height * .14 + 1 },
    { x: x + 30, y: y + side * height * .14 - 1 },
  ]);
}

const pencilPaths = [
  [[20, 61], [84, 60], [151, 52], [220, 44], [295, 44], [380, 45]],
  [[332, 16], [348, 29], [380, 45], [347, 61], [329, 78]],
];
const attrs = (node: Element, values: Record<string, string | number>) => {
  for (const [key, value] of Object.entries(values)) if (node.getAttribute(key) !== String(value)) node.setAttribute(key, String(value));
};

/** Retained SVG nodes keep the same watercolor cue when WebGL is unavailable. */
export function createSvgHints(svg: SvgFactory, parent: Element) {
  const root = svg('g', { 'pointer-events': 'none', 'aria-hidden': 'true', 'data-hint-style': 'watercolor-brush' }, parent);
  const nodes = new Map<string, SVGElement>();
  let disposed = false;
  return {
    paint(poses: readonly HintPose[]) {
      if (disposed) return;
      for (const node of nodes.values()) attrs(node, { display: 'none' });
      for (const pose of poses) {
        let node = nodes.get(pose.key);
        if (!node) {
          node = svg('g', {}, root); nodes.set(pose.key, node);
          const pencil = svg('g', {}, node);
          for (const [color, width] of [['#fff9e9', 17], ['#647955', 7]] as const) {
            for (const points of pencilPaths) svg('polyline', { points: points.map(p => p.join(',')).join(' '), fill: 'none', stroke: color, 'stroke-width': width, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, pencil);
          }
          const image = svg('image', { width: HINT_ART.width, height: HINT_ART.height, preserveAspectRatio: 'xMidYMid meet' }, node);
          image.addEventListener('load', () => { if (!disposed) attrs(pencil, { display: 'none' }); });
          image.addEventListener('error', () => { if (!disposed) { attrs(image, { display: 'none' }); attrs(pencil, { display: '' }); } });
          // Attach events before assigning href so a cached image cannot win the race.
          image.setAttribute('href', HINT_ART.file);
        }
        attrs(node, { display: '', opacity: pose.alpha, transform: 'translate(' + pose.x + ' ' + pose.y + ') rotate(' + pose.rotation * 180 / Math.PI + ') scale(' + pose.width / HINT_ART.width + ') translate(' + -HINT_ART.tip.x * HINT_ART.width + ' ' + -HINT_ART.tip.y * HINT_ART.height + ')' });
      }
    },
    dispose() { if (disposed) return; disposed = true; root.remove(); nodes.clear(); },
  };
}

/** One decoded texture and retained sprites; optional art never blocks the game. */
export function createPixiHints(P: typeof Pixi, parent: Pixi.Container, entry?: AssetEntry | null, changed?: () => void) {
  const root = new P.Container(); root.label = 'watercolor-hints'; root.eventMode = 'none'; parent.addChild(root);
  const nodes = new Map<string, { root: Pixi.Container; sprite: Pixi.Sprite; pencil: Pixi.Graphics }>();
  let disposed = false, texture: Pixi.Texture | null = null;
  if (entry) entry.promise.then(item => {
    if (disposed || item.state !== 'ready') return;
    try {
      texture = P.Texture.from(item.image, true);
      for (const node of nodes.values()) { node.sprite.texture = texture; node.sprite.visible = true; node.pencil.visible = false; }
      changed?.();
    } catch { /* Keep the quiet pencil cue if optional artwork cannot be decoded. */ }
  }).catch(() => { /* A failed optional cue must not interrupt play. */ });
  return {
    paint(poses: readonly HintPose[]) {
      if (disposed) return;
      for (const node of nodes.values()) node.root.visible = false;
      for (const pose of poses) {
        let node = nodes.get(pose.key);
        if (!node) {
          const group = new P.Container(), pencil = new P.Graphics(), sprite = new P.Sprite(texture || P.Texture.EMPTY);
          for (const [color, width] of [[0xfff9e9, 17], [0x647955, 7]]) for (const points of pencilPaths) {
            pencil.moveTo(points[0][0], points[0][1]);
            for (const point of points.slice(1)) pencil.lineTo(point[0], point[1]);
            pencil.stroke({ color, width, cap: 'round', join: 'round' });
          }
          sprite.visible = !!texture; pencil.visible = !texture;
          group.addChild(pencil, sprite); root.addChild(group);
          nodes.set(pose.key, node = { root: group, sprite, pencil });
        }
        node.root.visible = true; node.root.position.set(pose.x, pose.y); node.root.rotation = pose.rotation;
        node.root.pivot.set(HINT_ART.tip.x * HINT_ART.width, HINT_ART.tip.y * HINT_ART.height);
        node.root.scale.set(pose.width / HINT_ART.width); node.root.alpha = pose.alpha;
      }
    },
    dispose() {
      if (disposed) return; disposed = true;
      root.destroy({ children: true }); texture?.destroy(true); texture = null; nodes.clear();
    },
  };
}
