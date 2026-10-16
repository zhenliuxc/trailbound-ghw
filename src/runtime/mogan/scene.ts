import type * as Pixi from 'pixi.js';
import type { AssetEntry, GameAssets, ImageCache, MiniViewRefs, SvgFactory } from '../contracts';
import type { LegacySling, MoganKind, MoganState } from './rules';
import type { MoganFrame, Resource, Shape, SpritePose } from './scene-model';
import { moganFrame } from './scene-model';
import { MOGAN_PROPS, SHARED_PROPS } from './assets';
import { HINT_ART, createPixiHints, createSvgHints } from '../hint-art';

export const MOGAN_BACKGROUND = 'scenes/mogan-v1.webp';
export const MOGAN_ROUTE_ASSETS = [MOGAN_BACKGROUND, 'sprites/bamboo-cup-v2.webp', MOGAN_PROPS.file, SHARED_PROPS.file, HINT_ART.file];
export function moganAssets(game: MoganKind): GameAssets {
  return { scene: MOGAN_BACKGROUND, actor: game === 'rain' ? 'sprites/bamboo-cup-v2.webp' : game === 'footsteps' ? MOGAN_PROPS.file : SHARED_PROPS.file, hint: HINT_ART.file, ...(game === 'footsteps' ? {} : { front: MOGAN_PROPS.file }) };
}
interface Region { x: number; y: number; w: number; h: number }
interface Source { file: string; width: number; height: number; frames?: readonly Region[] }
function source(game: MoganKind, resource: Resource): Source {
  if (resource === 'scene') return { file: MOGAN_BACKGROUND, width: 1280, height: 720 };
  if (resource === 'front' || game === 'footsteps') return MOGAN_PROPS;
  return game === 'rain' ? { file: 'sprites/bamboo-cup-v2.webp', width: 386, height: 480 } : SHARED_PROPS;
}
function region(game: MoganKind, pose: SpritePose) { const image = source(game, pose.resource); return pose.frame === undefined ? { x: 0, y: 0, w: image.width, h: image.height } : image.frames![pose.frame]; }
const attrs = (node: Element, values: Record<string, string | number>) => { for (const [name, value] of Object.entries(values)) if (node.getAttribute(name) !== String(value)) node.setAttribute(name, String(value)); };
let sequence = 0;

interface Fallback { paint(frame: MoganFrame, height: number): void; dispose(): void }
function fallback(svg: SvgFactory, parent: Element, game: MoganKind): Fallback {
  const root = svg('g', {}, parent), defs = svg('defs', {}, root), clipId = 'mogan-water-' + ++sequence;
  const clip = svg('clipPath', { id: clipId }, defs), clipEllipse = svg('ellipse', {}, clip);
  const background = svg('g', {}, root), ambient = svg('g', {}, root), actors = svg('g', {}, root), water = svg('g', { 'clip-path': 'url(#' + clipId + ')' }, root), effects = svg('g', {}, root);
  const hints = createSvgHints(svg, root);
  const paper = svg('rect', { x: 0, y: 0, width: 800, height: 800, fill: '#fff8e6', opacity: 0 }, root);
  const nodes = new Map<string, SVGElement>(), pools = new Map<Element, SVGElement[]>();
  let lastOrder = '';
  function shapes(layer: Element, items: Shape[]) {
    const pool = pools.get(layer) || []; pools.set(layer, pool);
    items.forEach((shape, i) => {
      const tag = shape.type === 'line' ? 'polyline' : shape.type;
      let node = pool[i];
      if (node?.tagName.toLowerCase() !== tag) { const next = svg(tag, {}, layer); node?.remove(); pool[i] = node = next; }
      if (!node) pool[i] = node = svg(tag, {}, layer);
      attrs(node, { opacity: Math.max(0, Math.min(1, shape.alpha)), fill: shape.stroke ? 'none' : shape.color, stroke: shape.stroke ? shape.color : 'none', 'stroke-width': shape.stroke || 0, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', display: '' });
      if (shape.type === 'ellipse') attrs(node, { cx: shape.x, cy: shape.y, rx: Math.max(0, shape.rx), ry: Math.max(0, shape.ry) });
      else if (shape.type === 'rect') attrs(node, { x: shape.x, y: shape.y, width: shape.w, height: shape.h });
      else attrs(node, { points: shape.points.map(p => p.x + ',' + p.y).join(' ') });
    });
    for (let i = items.length; i < pool.length; i++) attrs(pool[i], { display: 'none' });
  }
  return {
    paint(frame, height) {
      parent.setAttribute('viewBox', '0 0 800 ' + height); attrs(root, { opacity: frame.alpha });
      for (const node of nodes.values()) attrs(node, { display: 'none' });
      for (const pose of frame.sprites) {
        const spec = source(game, pose.resource), box = region(game, pose);
        let node = nodes.get(pose.key);
        if (!node) {
          node = svg('svg', { overflow: 'hidden', preserveAspectRatio: 'none', viewBox: [box.x, box.y, box.w, box.h].join(' ') }, pose.key === 'background' ? background : actors);
          svg('image', { href: spec.file, width: spec.width, height: spec.height }, node); nodes.set(pose.key, node);
        }
        const height = pose.width * box.h / box.w;
        attrs(node, { x: -pose.anchorX * pose.width, y: -pose.anchorY * height, width: pose.width, height, display: '', opacity: Math.min(1, pose.alpha), transform: 'translate(' + pose.x + ' ' + pose.y + ') rotate(' + pose.rotation * 180 / Math.PI + ') scale(' + (pose.flip ? -1 : 1) + ' 1)' });
      }
      const order = frame.sprites.filter(pose => pose.key !== 'background').map(pose => pose.key).join('|');
      if (order !== lastOrder) { for (const pose of frame.sprites) if (pose.key !== 'background') actors.appendChild(nodes.get(pose.key)!); lastOrder = order; }
      shapes(ambient, frame.ambient); shapes(water, frame.water); shapes(effects, frame.effects);
      hints.paint(frame.hints);
      if (frame.clip) attrs(clipEllipse, { cx: frame.clip.x, cy: frame.clip.y, rx: frame.clip.rx, ry: frame.clip.ry });
      attrs(paper, { height, opacity: frame.paper * .26 });
    },
    dispose() { hints.dispose(); root.remove(); nodes.clear(); pools.clear(); },
  };
}
interface Renderer { paint(frame: MoganFrame, height: number, displayWidth: number): void; dispose(): void; canvas: HTMLCanvasElement }
interface RenderNode { node: Pixi.Sprite | Pixi.MeshPlane; original?: Float32Array; texture: Pixi.Texture }
async function renderer(P: typeof Pixi, host: HTMLElement, game: MoganKind, resources: Map<Resource, AssetEntry>, hintAsset: AssetEntry | null, height: number, displayWidth: number, cancelled: () => boolean, onLost: () => void): Promise<Renderer | null> {
  const app = new P.Application();
  // Render for the displayed CSS size, rather than allocating a 1600px canvas
  // for every narrow phone. Logical gameplay coordinates remain 800 units wide.
  const resolution = (width: number) => Math.min(2, Math.max(.5, width / 800 * Math.min(2, globalThis.devicePixelRatio || 1)));
  let disposed = false;
  const textures = new Map<Resource, Pixi.Texture>(), crops = new Map<string, Pixi.Texture>(), nodes = new Map<string, RenderNode>();
  let lastOrder = '';
  let hints: ReturnType<typeof createPixiHints> | null = null;
  const background = new P.Container(), ambient = new P.Graphics(), actors = new P.Container(), water = new P.Graphics(), mask = new P.Graphics(), effects = new P.Graphics(), paper = new P.Graphics();
  function dispose() {
    if (disposed) return; disposed = true;
    hints?.dispose(); hints = null;
    try { app.destroy(true, { children: true }); } catch { /* init can be interrupted */ }
    for (const crop of crops.values()) crop.destroy(false);
    for (const texture of textures.values()) texture.destroy(true);
    crops.clear(); textures.clear(); nodes.clear();
  }
  try {
    await app.init({ width: 800, height, resolution: resolution(displayWidth), autoDensity: true, antialias: true, autoStart: false, preference: 'webgl', backgroundAlpha: 0 });
    if (cancelled()) { dispose(); return null; }
    app.stage.eventMode = 'none'; app.stage.addChild(background, ambient, actors, water, mask, effects, paper); water.mask = mask;
    hints = createPixiHints(P, app.stage, hintAsset, () => { if (!disposed) app.render(); });
    app.stage.addChild(paper);
    for (const [key, entry] of resources) {
      const texture = P.Texture.from(entry.image, true); textures.set(key, texture);
      // The packaged Pixi browser build may omit the optional Prepare extension.
      // Its WebGL texture system still uploads synchronously when explicitly bound.
      if (app.renderer.prepare) await app.renderer.prepare.upload(texture);
      else (app.renderer as Pixi.WebGLRenderer).texture.bind(texture);
      if (cancelled()) { dispose(); return null; }
    }
    app.canvas.className = 'mini-game-canvas mogan-canvas'; app.canvas.setAttribute('aria-hidden', 'true'); app.canvas.setAttribute('data-ready', 'true');
    app.canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); dispose(); onLost(); });
    host.appendChild(app.canvas);
    function shapes(graphic: Pixi.Graphics, items: Shape[]) {
      graphic.clear();
      for (const shape of items) {
        if (shape.type === 'ellipse') graphic.ellipse(shape.x, shape.y, Math.max(0, shape.rx), Math.max(0, shape.ry));
        else if (shape.type === 'rect') graphic.rect(shape.x, shape.y, shape.w, shape.h);
        else { if (!shape.points.length) continue; graphic.moveTo(shape.points[0].x, shape.points[0].y); for (const p of shape.points.slice(1)) graphic.lineTo(p.x, p.y); }
        const style = { color: parseInt(shape.color.slice(1), 16), alpha: Math.max(0, Math.min(1, shape.alpha)) };
        if (shape.stroke) graphic.stroke({ ...style, width: shape.stroke, cap: 'round', join: 'round' }); else graphic.fill(style);
      }
    }
    return {
      canvas: app.canvas,
      paint(frame, height, displayWidth) {
        if (disposed) return;
        const scale = resolution(displayWidth);
        if (app.screen.height !== height || Math.abs(app.renderer.resolution - scale) > .015) app.renderer.resize(800, height, scale);
        app.stage.alpha = frame.alpha;
        for (const record of nodes.values()) record.node.visible = false;
        for (const pose of frame.sprites) {
          const box = region(game, pose), id = pose.resource + ':' + (pose.frame ?? 'full');
          let texture = crops.get(id);
          if (!texture) { const parent = textures.get(pose.resource); if (!parent) continue; texture = pose.frame === undefined ? parent : new P.Texture({ source: parent.source, frame: new P.Rectangle(box.x, box.y, box.w, box.h) }); if (pose.frame !== undefined) crops.set(id, texture); }
          let record = nodes.get(pose.key);
          if (!record) {
            const node = pose.frame === 3 ? new P.MeshPlane({ texture, verticesX: 7, verticesY: 5 }) : new P.Sprite(texture);
            record = { node, texture, ...(node instanceof P.MeshPlane ? { original: new Float32Array(node.geometry.getBuffer('aPosition').data) } : {}) };
            (pose.key === 'background' ? background : actors).addChild(node); nodes.set(pose.key, record);
          }
          const node = record.node;
          node.visible = true; node.position.set(pose.x, pose.y); node.pivot.set(box.w * pose.anchorX, box.h * pose.anchorY);
          node.scale.set(pose.width / box.w * (pose.flip ? -1 : 1), pose.width / box.w); node.rotation = pose.rotation; node.alpha = Math.min(1, pose.alpha);
          if (record.original && node instanceof P.MeshPlane) {
            const buffer = node.geometry.getBuffer('aPosition'), values = buffer.data;
            for (let i = 0; i < values.length; i += 2) { values[i] = record.original[i]; values[i + 1] = record.original[i + 1] + Math.sin(record.original[i] / box.w * Math.PI * 2) * pose.bend * record.original[i + 1] / box.h; }
            buffer.update();
          }
        }
        const order = frame.sprites.filter(pose => pose.key !== 'background').map(pose => pose.key).join('|');
        if (order !== lastOrder) { let i = 0; for (const pose of frame.sprites) if (pose.key !== 'background') actors.setChildIndex(nodes.get(pose.key)!.node, i++); lastOrder = order; }
        shapes(ambient, frame.ambient); shapes(water, frame.water); shapes(effects, frame.effects);
        hints?.paint(frame.hints);
        mask.clear(); if (frame.clip) mask.ellipse(frame.clip.x, frame.clip.y, frame.clip.rx, frame.clip.ry).fill(0xffffff);
        paper.clear(); if (frame.paper) paper.rect(0, 0, 800, height).fill({ color: 0xfff8e6, alpha: frame.paper * .26 });
        app.render();
      }, dispose,
    };
  } catch (error) { console.warn('Mogan renderer uses the watercolor fallback:', error); dispose(); return null; }
}
export interface MoganRefs extends MiniViewRefs {
  mogan: true; game: MoganKind; parent: Element; fallback: Fallback; height: number; displayWidth: number; loaded: boolean;
  gpu: Renderer | null; resize: ResizeObserver | null; latest: MoganState | null; host: HTMLElement | null;
}
export function drawMogan(svg: SvgFactory, parent: Element, game: MoganKind): MoganRefs {
  parent.removeAttribute('visibility');
  parent.setAttribute('viewBox', '0 0 800 800');
  return { mogan: true, game, parent, fallback: fallback(svg, parent, game), height: 800, displayWidth: 800, loaded: false, gpu: null, resize: null, latest: null, host: null, waitsForArt: true, contentState: 'loading', disposed: false };
}
export function paintMogan(refs: MoganRefs, state: MoganState, legacy: LegacySling) {
  if (refs.disposed) return; refs.latest = state;
  if (!refs.loaded) return;
  const frame = moganFrame(state, refs.height, legacy);
  if (refs.gpu) {
    try { refs.gpu.paint(frame, refs.height, refs.displayWidth); refs.parent.setAttribute('visibility', 'hidden'); return; }
    catch { refs.gpu.dispose(); refs.gpu = null; }
  }
  refs.parent.setAttribute('visibility', 'visible'); refs.fallback.paint(frame, refs.height);
}
export async function mountMogan(refs: MoganRefs, host: HTMLElement, cache: ImageCache | undefined, pixi: unknown, legacy: LegacySling) {
  refs.host = host;
  const resize = () => {
    if (refs.disposed) return; const box = host.getBoundingClientRect();
    refs.displayWidth = box.width > 0 ? box.width : 800;
    refs.height = box.width > 0 ? Math.max(320, Math.round(800 * box.height / box.width)) : 800;
    if (refs.latest) paintMogan(refs, refs.latest, legacy);
  };
  resize();
  if (globalThis.ResizeObserver) { refs.resize = new ResizeObserver(resize); refs.resize.observe(host); }
  const resources = new Map<Resource, AssetEntry>(), assets = moganAssets(refs.game);
  const hintAsset = cache?.request(assets.hint, 'high') || null;
  for (const key of ['scene', 'actor', 'front'] as const) {
    const file = assets[key]; if (!file) continue;
    const entry = cache?.request(file, 'high');
    if (!entry) { refs.contentState = 'error'; return; }
    resources.set(key, entry);
  }
  await Promise.all([...resources.values()].map(entry => entry.promise));
  if (refs.disposed) return;
  if ([...resources.values()].some(entry => entry.state !== 'ready')) { refs.contentState = 'error'; return; }
  refs.loaded = true;
  if (refs.latest) paintMogan(refs, refs.latest, legacy);
  const P = pixi as typeof Pixi | undefined;
  if (typeof P?.Application === 'function') {
    // Let the opening input event finish before allocating a WebGL context.
    // Starting it in that event's microtask can stall Chromium's input acknowledgement.
    await new Promise<void>(resolve => setTimeout(resolve, 0));
    if (refs.disposed) return;
    refs.gpu = await renderer(P, host, refs.game, resources, hintAsset, refs.height, refs.displayWidth, () => !!refs.disposed, () => {
      refs.gpu = null;
      if (!refs.disposed && refs.latest) paintMogan(refs, refs.latest, legacy);
    });
  }
  if (refs.disposed) { refs.gpu?.dispose(); refs.gpu = null; return; }
  refs.contentState = 'ready';
  if (refs.latest) paintMogan(refs, refs.latest, legacy);
}
export function disposeMogan(refs: MoganRefs) {
  if (refs.disposed) return; refs.disposed = true;
  refs.resize?.disconnect(); refs.resize = null; refs.gpu?.dispose(); refs.gpu = null;
  refs.fallback.dispose(); refs.latest = null; refs.host = null;
  refs.parent.removeAttribute('visibility');
}
