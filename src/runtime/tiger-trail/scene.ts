import type * as Pixi from 'pixi.js';
import type { AssetEntry, GameAssets, ImageCache, MiniInput, MiniViewRefs, SvgFactory } from '../contracts';
import type { TrailInput, TrailKind, TrailState } from './rules';
import { WORLD } from './geometry';
import { MAP_WALK_FILE, MAP_WALK_FRAMES } from '../map-walk-art';

/** The painted stage is deliberately 2D. A path and the view share one transform. */
type Point = { x: number; y: number };
type Camera = Point & { zoom: number };
type Resource = 'scene' | 'actor';
type Resources = Map<Resource, AssetEntry>;
type Rect = { x: number; y: number; width: number; height: number };
interface Projection { scale: number; x: number; y: number; width: number; height: number }
interface Actor { at: Point; width: number; frame: number; rotation: number; alpha: number; mirror: 1 | -1 }
interface Frame {
  camera: Camera; projection: Projection; age: number; wave: number; reduced: boolean;
  actor: Actor | null;
  river: boolean; passage: boolean; rest: boolean; capture: boolean;
}

const FILES = {
  high: 'scenes/tiger-climb-walk-v3.webp', river: 'scenes/tiger-river-v2.webp',
  rest: 'scenes/tiger-halfway-v2.webp', passage: 'scenes/tiger-longdong-v2.webp',
  hiker: MAP_WALK_FILE,
};
export const TIGER_TRAIL_ROUTE_ASSETS = Object.values(FILES);
export function tigerTrailAssets(game: TrailKind): GameAssets {
  const scene = game === 'tiger-climb' ? FILES.high : game === 'tiger-river' ? FILES.river : game === 'tiger-rest' ? FILES.rest : FILES.passage;
  return { scene, ...(game === 'tiger-climb' || game === 'tiger-passage' ? { actor: FILES.hiker } : {}) };
}
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const smooth = (n: number) => { const q = clamp(n, 0, 1); return q * q * (3 - 2 * q); };
const attrs = (node: Element, values: Record<string, string | number>) => {
  for (const [key, value] of Object.entries(values)) if (node.getAttribute(key) !== String(value)) node.setAttribute(key, String(value));
};
function imageRect(entry: AssetEntry): Rect {
  const ratio = (entry.image.naturalWidth || 1280) / (entry.image.naturalHeight || 720);
  const width = Math.max(WORLD.width, WORLD.height * ratio), height = width / ratio;
  return { x: (WORLD.width - width) / 2, y: (WORLD.height - height) / 2, width, height };
}
function project(camera: Camera, height: number): Projection {
  const scale = Math.max(1, height / WORLD.height) * clamp(camera.zoom, 1, 1.8);
  const vw = WORLD.width / scale, vh = height / scale;
  // A portrait crop follows the walker; wide screens retain the same artwork ratio.
  const cx = vw < WORLD.width ? clamp(camera.x, vw / 2, WORLD.width - vw / 2) : WORLD.width / 2;
  const cy = vh < WORLD.height ? clamp(camera.y, vh / 2, WORLD.height - vh / 2) : WORLD.height / 2;
  return { scale, x: WORLD.width / 2 - cx * scale, y: height / 2 - cy * scale, width: WORLD.width, height };
}
function walkingFrame(stride: number) {
  return Math.floor(Math.max(0, stride) / 4) % 8;
}
function stageFrame(state: TrailState, height: number, capture = false): Frame {
  const climb = state.game === 'tiger-climb', river = state.game === 'tiger-river', passage = state.game === 'tiger-passage';
  const camera = { ...state.camera }, progress = climb ? state.climb.progress : passage ? state.passage.progress : river ? state.river.descentProgress : 0;
  const request = capture ? state.river.captureRequest : null;
  if (request) Object.assign(camera, request.camera);
  else if (passage) {
    // A short scenic passage: the walker follows the painted ledge, with no extra
    // route overlay, input challenge, or collectible attached to this transition.
    camera.x = state.passage.position.x + 90; camera.y = state.passage.position.y - 50; camera.zoom = 1.12 - progress * .05;
  } else if (river && state.river.phase === 'descent') {
    const q = smooth(progress); camera.y -= (1 - q) * 110; camera.zoom += (1 - q) * .18;
  }
  let actor: Actor | null = null;
  if (climb) {
    const facing = Math.cos(state.climb.heading) < 0 ? -1 : 1;
    actor = { at: state.climb.position, width: 38 - smooth(progress) * 10, frame: walkingFrame(state.climb.distance), rotation: clamp(Math.sin(state.climb.heading) * facing * .10, -.08, .06), alpha: 1, mirror: facing };
  }
  else if (passage) actor = { at: state.passage.position, width: 40 - progress * 10, frame: walkingFrame(state.passage.distance), rotation: -.025, alpha: 1, mirror: Math.cos(state.passage.heading) < 0 ? -1 : 1 };
  return {
    camera, projection: project(camera, height), age: request?.age ?? state.age,
    wave: request?.waveClock ?? (river ? state.river.waveClock : state.age),
    reduced: !!state.play.reduced, actor, river, passage, rest: state.game === 'tiger-rest', capture,
  };
}

// Water remains within the painted river; the mountain texture never ripples.
// These stage masks are art directions, not a replacement for the geographic route.
const HIGH_FLOW: Point[] = [
  { x: .674, y: .654 }, { x: .675, y: .682 }, { x: .680, y: .710 }, { x: .705, y: .744 },
  { x: .721, y: .772 }, { x: .745, y: .811 }, { x: .777, y: .841 }, { x: .828, y: .876 },
  { x: .878, y: .911 }, { x: .919, y: .946 }, { x: .957, y: .983 }, { x: .980, y: 1 },
];
const HIGH_WATER: Point[] = [
  ...HIGH_FLOW.map(p => ({ x: p.x - (.0015 + (p.y - .65) * .024), y: p.y })),
  ...HIGH_FLOW.slice().reverse().map(p => ({ x: p.x + (.0015 + (p.y - .65) * .024), y: p.y })),
];
const RIVER_WATER: Point[] = [
  { x: 0, y: .54 }, { x: .15, y: .532 }, { x: .29, y: .526 }, { x: .36, y: .516 }, { x: .46, y: .512 },
  { x: .56, y: .513 }, { x: .65, y: .521 }, { x: .72, y: .523 }, { x: .82, y: .541 }, { x: .87, y: .565 },
  { x: 1, y: .584 }, { x: 1, y: 1 }, { x: 0, y: 1 },
];
// The boulders stay part of the untouched painting underneath the moving water.
const RIVER_ROCKS: readonly (readonly Point[])[] = [
  [{ x: .497, y: .647 }, { x: .52, y: .600 }, { x: .540, y: .584 }, { x: .548, y: .548 }, { x: .568, y: .516 }, { x: .589, y: .521 }, { x: .610, y: .545 }, { x: .638, y: .565 }, { x: .675, y: .588 }, { x: .707, y: .618 }, { x: .724, y: .664 }, { x: .713, y: .701 }, { x: .657, y: .716 }, { x: .600, y: .699 }, { x: .551, y: .673 }],
  [{ x: 0, y: .55 }, { x: .041, y: .537 }, { x: .083, y: .536 }, { x: .120, y: .566 }, { x: .156, y: .612 }, { x: .156, y: .637 }, { x: .097, y: .644 }, { x: 0, y: .641 }],
  [{ x: .736, y: .731 }, { x: .745, y: .699 }, { x: .781, y: .705 }, { x: .805, y: .709 }, { x: .850, y: .681 }, { x: .875, y: .711 }, { x: .862, y: .727 }, { x: .850, y: .754 }, { x: .809, y: .777 }, { x: .759, y: .766 }],
  [{ x: .874, y: .790 }, { x: .887, y: .755 }, { x: .910, y: .735 }, { x: .933, y: .746 }, { x: .965, y: .762 }, { x: 1, y: .770 }, { x: 1, y: .886 }, { x: .958, y: .864 }, { x: .900, y: .837 }],
  [{ x: 0, y: .874 }, { x: .042, y: .868 }, { x: .094, y: .875 }, { x: .139, y: .874 }, { x: .195, y: .858 }, { x: .234, y: .858 }, { x: .272, y: .867 }, { x: .326, y: .858 }, { x: .365, y: .879 }, { x: .397, y: .936 }, { x: .424, y: 1 }, { x: 0, y: 1 }],
  [{ x: .509, y: .516 }, { x: .523, y: .502 }, { x: .539, y: .507 }, { x: .553, y: .52 }],
  [{ x: .637, y: .53 }, { x: .644, y: .509 }, { x: .654, y: .510 }, { x: .665, y: .531 }],
  [{ x: .710, y: .539 }, { x: .724, y: .514 }, { x: .740, y: .513 }, { x: .755, y: .536 }],
];
const FALL_FLOW: Point[] = [
  { x: .234, y: .025 }, { x: .260, y: .12 }, { x: .290, y: .24 }, { x: .308, y: .34 }, { x: .330, y: .43 },
  { x: .357, y: .51 }, { x: .376, y: .563 }, { x: .401, y: .613 }, { x: .421, y: .704 },
  { x: .447, y: .794 }, { x: .479, y: .885 }, { x: .505, y: .956 }, { x: .521, y: 1 },
];
// The thin wet channel is isolated from dry rock. Its gap at the ledge also keeps
// the walking surface steady while the water above and below it flows.
const FALL_WATER: Point[] = [
  ...FALL_FLOW.map(p => ({ x: p.x - (p.y < .5 ? .004 : .008), y: p.y })),
  ...FALL_FLOW.slice().reverse().map(p => ({ x: p.x + (p.y < .5 ? .005 : .010), y: p.y })),
];
const FALL_LEDGE: Point[] = [{ x: .32, y: .565 }, { x: .46, y: .565 }, { x: .46, y: .605 }, { x: .32, y: .605 }];
function waterPolygon(frame: Frame, rect: Rect): Point[] { return (frame.river ? RIVER_WATER : frame.passage ? FALL_WATER : HIGH_WATER).map(p => ({ x: rect.x + p.x * rect.width, y: rect.y + p.y * rect.height })); }
function waterHoles(frame: Frame, rect: Rect): Point[][] {
  return (frame.river ? RIVER_ROCKS : frame.passage ? [FALL_LEDGE] : []).map(rock => rock.map(p => ({ x: rect.x + p.x * rect.width, y: rect.y + p.y * rect.height })));
}
function within(p: Point, polygon: readonly Point[]) {
  let yes = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) yes = !yes;
  }
  return yes;
}
function waves(frame: Frame, rect: Rect): Array<{ x: number; y: number; length: number; alpha: number; bend: number }> {
  const polygon = waterPolygon(frame, rect), holes = waterHoles(frame, rect), count = frame.river ? 38 : frame.rest ? 0 : frame.passage ? 14 : 16;
  const time = frame.reduced ? 1.7 : frame.wave;
  const result: Array<{ x: number; y: number; length: number; alpha: number; bend: number }> = [];
  for (let i = 0; i < count; i++) {
    const q = ((time * (frame.river ? .095 : frame.passage ? .18 : .035) + i * .137) % 1 + 1) % 1;
    const flow = frame.passage ? FALL_FLOW : HIGH_FLOW;
    const section = Math.min(flow.length - 2, Math.floor(q * (flow.length - 1))), t = q * (flow.length - 1) - section;
    const a = flow[section], b = flow[section + 1];
    const x = frame.river ? rect.x + (.43 + q * .4 + Math.sin(i * 5.71) * (.02 + q * .14)) * rect.width : rect.x + (a.x + (b.x - a.x) * t) * rect.width;
    const y = frame.river ? rect.y + (.51 + q * .5) * rect.height : rect.y + (a.y + (b.y - a.y) * t) * rect.height;
    if (!within({ x, y }, polygon) || holes.some(hole => within({ x, y }, hole))) continue;
    result.push({ x, y, length: (frame.river ? 12 : frame.passage ? 9 : 5) + q * (frame.river ? 30 : 8), alpha: Math.sin(q * Math.PI) * (frame.river ? .45 : frame.passage ? .25 : .35), bend: 3 + Math.sin(time * 1.2 + i) * 2 });
  }
  return result;
}
function actorCrop(entry: AssetEntry, frame: number): Rect {
  const [x, y, width, height] = MAP_WALK_FRAMES[frame];
  return { x, y, width, height };
}
// Anchors measured from the packaged eight-frame sheet, not from transparent cell edges.
const HIKER_ANCHORS = MAP_WALK_FRAMES.map(([, , width, height, footX, footY]) => ({ x: footX / width, y: footY / height }));

interface Fallback { root: SVGElement; paint(frame: Frame, resources: Resources): void; dispose(): void }
let svgSequence = 0;
function fallback(svg: SvgFactory, parent: Element, game: TrailKind): Fallback {
  const root = svg('g', { class: 'tiger-trail-fallback' }, parent), defs = svg('defs', {}, root);
  const clipId = 'tiger-trail-water-' + ++svgSequence;
  const waterClip = svg('mask', { id: clipId, maskUnits: 'userSpaceOnUse', maskContentUnits: 'userSpaceOnUse', x: 0, y: 0, width: WORLD.width, height: WORLD.height }, defs);
  const waterShape = svg('polygon', { fill: 'white' }, waterClip);
  const rockShapes = RIVER_ROCKS.map(() => svg('polygon', { fill: 'black' }, waterClip));
  const paper = svg('rect', { x: 0, y: 0, width: WORLD.width, height: 720, fill: '#f3edda' }, root);
  const world = svg('g', {}, root), background = svg('image', { href: tigerTrailAssets(game).scene! }, world);
  const river = svg('g', { mask: 'url(#' + clipId + ')' }, world);
  const waveNodes = Array.from({ length: 38 }, () => svg('path', { fill: 'none', stroke: '#fff6d9', 'stroke-linecap': 'round', 'stroke-width': 2.1 }, river));
  const shadow = svg('ellipse', { fill: '#243b32', opacity: .2 }, world), hiker = svg('g', {}, world);
  const crop = svg('svg', { overflow: 'hidden', preserveAspectRatio: 'none' }, hiker), actor = svg('image', { href: FILES.hiker }, crop);
  const loading = svg('text', { x: 500, y: 360, 'data-loading': 'true', 'text-anchor': 'middle', fill: '#476152', 'font-family': 'Georgia, Songti SC, serif', 'font-size': 19 }, root);
  loading.textContent = '江谷画作正在展开…';
  return {
    root,
    paint(frame, resources) {
      const p = frame.projection; attrs(parent, { viewBox: '0 0 ' + p.width + ' ' + p.height, preserveAspectRatio: 'none' });
      attrs(paper, { height: p.height }); attrs(loading, { y: p.height / 2, display: resources.has('scene') ? 'none' : '' });
      attrs(world, { transform: 'translate(' + p.x + ' ' + p.y + ') scale(' + p.scale + ')' });
      const scene = resources.get('scene'); if (!scene) return;
      const rect = imageRect(scene); attrs(background, { ...rect, preserveAspectRatio: 'none' });
      attrs(waterShape, { points: waterPolygon(frame, rect).map(v => v.x + ',' + v.y).join(' ') });
      const holes = waterHoles(frame, rect);
      for (let i = 0; i < rockShapes.length; i++) attrs(rockShapes[i], holes[i] ? { points: holes[i].map(v => v.x + ',' + v.y).join(' '), display: '' } : { display: 'none' });
      const lines = waves(frame, rect);
      for (let i = 0; i < waveNodes.length; i++) {
        const line = lines[i]; attrs(waveNodes[i], line ? { display: '', opacity: line.alpha, 'stroke-width': frame.passage ? 1.05 : 2.1,
          d: 'M' + line.x + ' ' + line.y + ' q' + (frame.passage ? line.length * .14 : line.length * .45) + ' ' + (frame.passage ? line.length * .5 : -line.bend) + ' ' + (frame.passage ? line.length * .45 : line.length) + ' ' + (frame.passage ? line.length : 0) } : { display: 'none' });
      }
      const art = resources.get('actor');
      if (frame.actor && art) {
        const pose = frame.actor, region = actorCrop(art, pose.frame), ah = pose.width * region.height / region.width, anchor = HIKER_ANCHORS[pose.frame];
        attrs(hiker, { display: '', transform: 'translate(' + pose.at.x + ' ' + pose.at.y + ') rotate(' + pose.rotation * 180 / Math.PI + ') scale(' + pose.mirror + ' 1)' });
        attrs(crop, { viewBox: [region.x, region.y, region.width, region.height].join(' '), x: -pose.width * anchor.x, y: -ah * anchor.y, width: pose.width, height: ah });
        attrs(actor, { width: art.image.naturalWidth, height: art.image.naturalHeight });
        attrs(shadow, { display: '', cx: pose.at.x, cy: pose.at.y + 2, rx: 12, ry: 3.5 });
      } else { attrs(hiker, { display: 'none' }); attrs(shadow, { display: 'none' }); }
    },
    dispose() { root.remove(); },
  };
}

/** Keep the actual chosen picture inside the journal's per-image storage budget. */
function encodeCapture(source: HTMLCanvasElement): string {
  const budget = 300000;
  for (const quality of [.82, .70, .58]) {
    const url = source.toDataURL('image/webp', quality);
    if (url.length <= budget && /^data:image\/(?:webp|png|jpeg);base64,/.test(url)) return url;
  }
  // Some browsers return PNG for an unsupported WebP encoder. JPEG and a smaller
  // frozen copy preserve the composition without depending on WebP support.
  for (const side of [800, 640, 480, 320]) {
    const scale = Math.min(1, side / Math.max(source.width, source.height));
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(source.width * scale)); canvas.height = Math.max(1, Math.round(source.height * scale));
    const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas is unavailable.');
    context.fillStyle = '#f3edda'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(source, 0, 0, canvas.width, canvas.height);
    for (const format of ['image/webp', 'image/jpeg']) {
      const url = canvas.toDataURL(format, side >= 640 ? .7 : .62);
      if (url.length <= budget && /^data:image\/(?:webp|png|jpeg);base64,/.test(url)) return url;
    }
  }
  throw new Error('The frozen painting exceeds the journal image budget.');
}
interface Renderer { canvas: HTMLCanvasElement; paint(frame: Frame): void; capture(frame: Frame): string; dispose(): void }
async function renderer(P: typeof Pixi, host: HTMLElement, resources: Resources, initialHeight: number, displayWidth: () => number, cancelled: () => boolean, onLost: () => void): Promise<Renderer | null> {
  const app = new P.Application(), textures = new Map<Resource, Pixi.Texture>(), crops: Pixi.Texture[] = [];
  let disposed = false;
  const resolution = (height: number) => Math.max(.25, Math.min(2, displayWidth() / WORLD.width * Math.min(2, globalThis.devicePixelRatio || 1), Math.sqrt(3000000 / (WORLD.width * height))));
  const scene = new P.Container(), paper = new P.Graphics(), world = new P.Container();
  const waterMask = new P.Sprite(P.Texture.EMPTY), whitewater = new P.Graphics(), shadow = new P.Graphics();
  let maskTexture: Pixi.Texture | null = null, maskKey = '';
  let background: Pixi.Sprite | null = null, water: Pixi.MeshPlane | null = null, original: Float32Array | null = null, hiker: Pixi.Sprite | null = null;
  const loss = (event: Event) => { event.preventDefault(); dispose(); onLost(); };
  function dispose() {
    if (disposed) return; disposed = true;
    try { app.canvas?.removeEventListener('webglcontextlost', loss); } catch { /* Initialisation may not have produced a canvas. */ }
    try { app.destroy(true, { children: true }); } catch { /* A cancelled init has nothing to destroy. */ }
    for (const texture of crops) texture.destroy(false);
    for (const texture of textures.values()) texture.destroy(true);
    maskTexture?.destroy(true); maskTexture = null;
    textures.clear(); crops.length = 0;
  }
  try {
    await app.init({ width: WORLD.width, height: initialHeight, resolution: resolution(initialHeight), autoDensity: true, antialias: true, autoStart: false, preference: 'webgl', backgroundAlpha: 0 });
    if (cancelled()) { dispose(); return null; }
    app.stage.eventMode = 'none'; app.stage.addChild(scene); scene.addChild(paper, world);
    for (const [key, entry] of resources) {
      const texture = P.Texture.from(entry.image, true); textures.set(key, texture);
      if (app.renderer.prepare) await app.renderer.prepare.upload(texture);
      else (app.renderer as Pixi.WebGLRenderer).texture.bind(texture);
      if (cancelled()) { dispose(); return null; }
    }
    const sceneTexture = textures.get('scene')!;
    background = new P.Sprite(sceneTexture); world.addChild(background);
    water = new P.MeshPlane({ texture: sceneTexture, verticesX: 28, verticesY: 20 });
    original = new Float32Array(water.geometry.getBuffer('aPosition').data); water.alpha = .72;
    world.addChild(water, waterMask, whitewater, shadow); water.mask = waterMask; whitewater.mask = waterMask;
    const art = resources.get('actor'), actorTexture = textures.get('actor');
    if (art && actorTexture) {
      for (let i = 0; i < 8; i++) { const r = actorCrop(art, i); crops.push(new P.Texture({ source: actorTexture.source, frame: new P.Rectangle(r.x, r.y, r.width, r.height) })); }
      hiker = new P.Sprite(crops[0]); hiker.anchor.set(.5, .88); world.addChild(hiker);
    }
    app.canvas.className = 'mini-game-canvas tiger-trail-canvas'; app.canvas.setAttribute('aria-hidden', 'true'); app.canvas.setAttribute('data-ready', 'true');
    app.canvas.addEventListener('webglcontextlost', loss); host.appendChild(app.canvas);
    function setWaterMask(frame: Frame, rect: Rect) {
      const key = frame.river ? 'river' : frame.passage ? 'passage' : 'high'; if (maskKey === key) return;
      const canvas = document.createElement('canvas'); canvas.width = WORLD.width; canvas.height = WORLD.height;
      const context = canvas.getContext('2d'); if (!context) throw new Error('The river mask could not be made.');
      const polygon = (points: readonly Point[]) => {
        context.beginPath(); context.moveTo(points[0].x, points[0].y);
        for (const p of points.slice(1)) context.lineTo(p.x, p.y); context.closePath(); context.fill();
      };
      context.fillStyle = '#ffffff'; polygon(waterPolygon(frame, rect));
      // Destination-out also handles foreground rocks that cross the bank. Pixi's
      // vector cut() requires fully enclosed holes and cannot represent those edges.
      context.globalCompositeOperation = 'destination-out'; for (const hole of waterHoles(frame, rect)) polygon(hole);
      const previous = maskTexture; maskTexture = P.Texture.from(canvas, true); waterMask.texture = maskTexture; previous?.destroy(true); maskKey = key;
    }
    function paint(frame: Frame) {
      if (disposed) return;
      const projection = frame.projection, res = resolution(projection.height);
      if (app.screen.height !== projection.height || Math.abs(app.renderer.resolution - res) > .01) app.renderer.resize(WORLD.width, projection.height, res);
      paper.clear().rect(0, 0, WORLD.width, projection.height).fill(0xf3edda);
      world.scale.set(projection.scale); world.position.set(projection.x, projection.y);
      const rect = imageRect(resources.get('scene')!); background!.position.set(rect.x, rect.y); background!.width = rect.width; background!.height = rect.height;
      const activeWater = !frame.rest;
      water!.visible = activeWater; whitewater.visible = activeWater; waterMask.visible = activeWater;
      if (activeWater) {
        setWaterMask(frame, rect);
        water!.position.set(rect.x, rect.y); water!.width = rect.width; water!.height = rect.height;
        const buffer = water!.geometry.getBuffer('aPosition'), values = buffer.data;
        for (let i = 0; i < values.length; i += 2) {
          const x = original![i], y = original![i + 1], q = y / sceneTexture.height;
          values[i] = x + (frame.reduced ? 0 : Math.sin(y * .043 + frame.wave * 1.3) * (frame.river ? 2.4 : frame.passage ? .38 : 1.05) * q);
          values[i + 1] = y + (frame.reduced ? 0 : Math.sin(x * .034 + y * .01 - frame.wave * 1.8) * (frame.river ? 1.9 : frame.passage ? .55 : .7) * q);
        }
        buffer.update(); whitewater.clear();
        for (const wave of waves(frame, rect)) whitewater.moveTo(wave.x, wave.y)
          .quadraticCurveTo(wave.x + wave.length * (frame.passage ? .14 : .45), wave.y + (frame.passage ? wave.length * .5 : -wave.bend), wave.x + wave.length * (frame.passage ? .45 : 1), wave.y + (frame.passage ? wave.length : 0))
          .stroke({ color: 0xfff7dd, width: frame.river ? 2.1 : frame.passage ? 1.05 : 1.3, alpha: wave.alpha, cap: 'round' });
      }
      shadow.clear(); if (hiker) {
        hiker.visible = !!frame.actor;
        if (frame.actor) {
          const a = frame.actor, anchor = HIKER_ANCHORS[a.frame]; hiker.texture = crops[a.frame]; hiker.anchor.set(anchor.x, anchor.y); hiker.position.set(a.at.x, a.at.y); hiker.width = a.width; hiker.scale.y = Math.abs(hiker.scale.x); hiker.scale.x = Math.abs(hiker.scale.x) * a.mirror; hiker.rotation = a.rotation; hiker.alpha = a.alpha;
          shadow.ellipse(a.at.x, a.at.y + 2, 12, 3.5).fill({ color: 0x243b32, alpha: .2 });
        }
      }
      app.render();
    }
    return {
      canvas: app.canvas, paint, dispose,
      capture(frame) {
        if (disposed) throw new Error('The painted scene has closed.');
        paint({ ...frame, capture: true });
        // Extraction is synchronous: the river and camera cannot advance between
        // the chosen moment and the frozen pixels. Encoding happens on that copy.
        const canvas = app.renderer.extract.canvas({ target: scene, frame: new P.Rectangle(0, 0, WORLD.width, frame.projection.height), resolution: Math.min(1, 960 / Math.max(WORLD.width, frame.projection.height)), clearColor: '#f3edda', antialias: true }) as HTMLCanvasElement;
        return encodeCapture(canvas);
      },
    };
  } catch (error) { console.warn('Tiger trail uses its painted SVG fallback:', error); dispose(); return null; }
}

export interface TigerTrailRefs extends MiniViewRefs {
  tiger: true; tigerTrail: true; game: TrailKind; parent: Element; fallback: Fallback;
  gpu: Renderer | null; resources: Resources; loaded: boolean; height: number; displayWidth: number;
  latest: TrailState | null; host: HTMLElement | null; resize: ResizeObserver | null;
  captureBusy: boolean; generation: number; embedded: Map<string, string>;
}
export function drawTigerTrail(svg: SvgFactory, parent: Element, game: TrailKind): TigerTrailRefs {
  parent.removeAttribute('visibility'); attrs(parent, { viewBox: '0 0 1000 720', preserveAspectRatio: 'xMidYMid meet' });
  return { tiger: true, tigerTrail: true, game, parent, fallback: fallback(svg, parent, game), gpu: null, resources: new Map(), loaded: false, height: 720, displayWidth: 1000, latest: null, host: null, resize: null, captureBusy: false, generation: 0, embedded: new Map(), waitsForArt: true, contentState: 'loading', disposed: false };
}
export function paintTigerTrail(refs: TigerTrailRefs, state: TrailState) {
  if (refs.disposed) return; refs.latest = state;
  const frame = stageFrame(state, refs.height);
  if (refs.gpu) {
    try { refs.gpu.paint(frame); refs.parent.setAttribute('visibility', 'hidden'); return; }
    catch { refs.gpu.dispose(); refs.gpu = null; }
  }
  refs.parent.removeAttribute('visibility'); refs.fallback.paint(frame, refs.resources);
  const loading = refs.fallback.root.querySelector('[data-loading]');
  if (loading) loading.textContent = refs.contentState === 'error' ? '画作暂未展开，可以重试或继续行程。' : '江谷画作正在展开…';
}
export function tigerTrailViewport(refs: TigerTrailRefs, state: TrailState | null = refs.latest): TrailInput {
  const p = project(state?.camera || { x: 500, y: 360, zoom: 1 }, refs.height);
  return { action: 'viewport', viewWidth: p.width / p.scale, viewHeight: p.height / p.scale };
}
export function tigerTrailPoint(refs: TigerTrailRefs, point: MiniInput): TrailInput {
  if (!refs.latest) return point;
  const p = stageFrame(refs.latest, refs.height).projection;
  return { ...point, x: ((point.x ?? 0) * p.width - p.x) / p.scale, y: ((point.y ?? 0) * p.height - p.y) / p.scale,
    viewWidth: p.width / p.scale, viewHeight: p.height / p.scale,
    ...(point.dx === undefined ? {} : { dx: point.dx * p.width / p.scale }), ...(point.dy === undefined ? {} : { dy: point.dy * p.height / p.scale }) };
}
export async function mountTigerTrail(refs: TigerTrailRefs, host: HTMLElement, cache: ImageCache | undefined, pixi: unknown) {
  if (refs.disposed) return;
  const generation = ++refs.generation; refs.host = host;
  refs.gpu?.dispose(); refs.gpu = null; refs.loaded = false; refs.resources.clear(); refs.contentState = 'loading';
  const cancelled = () => !!refs.disposed || refs.generation !== generation;
  const resize = () => {
    if (cancelled()) return; const box = host.getBoundingClientRect();
    refs.displayWidth = box.width > 0 ? box.width : 1000;
    refs.height = box.width > 0 && box.height > 0 ? Math.max(1, Math.round(WORLD.width * box.height / box.width)) : 720;
    if (refs.latest) paintTigerTrail(refs, refs.latest);
  };
  resize(); refs.resize?.disconnect();
  if (globalThis.ResizeObserver) { refs.resize = new ResizeObserver(resize); refs.resize.observe(host); }
  const assets = tigerTrailAssets(refs.game), pending: Array<[Resource, AssetEntry]> = [];
  for (const key of ['scene', 'actor'] as const) {
    const file = assets[key]; if (!file) continue;
    const entry = cache?.request(file, 'high'); if (!entry) { refs.contentState = 'error'; return; } pending.push([key, entry]);
  }
  await Promise.all(pending.map(([, entry]) => entry.promise));
  if (cancelled()) return;
  if (pending.some(([, entry]) => entry.state !== 'ready')) { refs.contentState = 'error'; return; }
  refs.resources = new Map(pending); refs.loaded = true;
  const P = pixi as typeof Pixi | undefined;
  if (typeof P?.Application === 'function') {
    await new Promise<void>(resolve => setTimeout(resolve, 0)); if (cancelled()) return;
    refs.gpu = await renderer(P, host, refs.resources, refs.height, () => refs.displayWidth, cancelled, () => {
      refs.gpu = null; if (!refs.disposed && refs.latest) paintTigerTrail(refs, refs.latest);
    });
  }
  if (cancelled()) { refs.gpu?.dispose(); refs.gpu = null; return; }
  refs.contentState = 'ready'; if (refs.latest) paintTigerTrail(refs, refs.latest);
}

async function svgCapture(refs: TigerTrailRefs, frame: Frame): Promise<string> {
  refs.fallback.paint({ ...frame, capture: true }, refs.resources);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); svg.setAttribute('viewBox', '0 0 1000 ' + refs.height);
  const scale = Math.min(1, 960 / Math.max(WORLD.width, refs.height));
  svg.setAttribute('width', String(Math.round(WORLD.width * scale))); svg.setAttribute('height', String(Math.round(refs.height * scale)));
  const clone = refs.fallback.root.cloneNode(true) as SVGElement; clone.querySelectorAll('[data-capture-hide]').forEach(node => node.remove()); svg.appendChild(clone);
  for (const node of clone.querySelectorAll('image')) {
    const href = node.getAttribute('href'); if (!href) continue;
    let embedded = refs.embedded.get(href);
    if (!embedded) {
      const key = (Object.entries(tigerTrailAssets(refs.game)) as Array<[Resource, string]>).find(([, file]) => file === href)?.[0];
      const image = key && refs.resources.get(key)?.image; if (!image) { node.remove(); continue; }
      const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas is unavailable.');
      context.drawImage(image, 0, 0); embedded = canvas.toDataURL('image/png'); refs.embedded.set(href, embedded);
    }
    node.setAttribute('href', embedded);
  }
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new Image(); await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('The frozen painting could not be rendered.')); image.src = url; });
    const canvas = document.createElement('canvas'); canvas.width = Math.round(WORLD.width * scale); canvas.height = Math.round(refs.height * scale);
    const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas is unavailable.');
    context.drawImage(image, 0, 0, canvas.width, canvas.height); return encodeCapture(canvas);
  } finally { URL.revokeObjectURL(url); }
}
/** The caller attaches this exact image to the corresponding captureRequest id. */
export async function captureTigerTrail(refs: TigerTrailRefs, state: TrailState = refs.latest!): Promise<string | null> {
  if (refs.disposed || !refs.loaded || !state || refs.captureBusy) return null;
  refs.captureBusy = true; const generation = refs.generation;
  try {
    const frame = stageFrame(state, refs.height, true), url = refs.gpu ? refs.gpu.capture(frame) : await svgCapture(refs, frame);
    return refs.disposed || generation !== refs.generation ? null : url;
  } catch (error) { console.warn('The river photograph could not be saved:', error); return null; }
  finally { refs.captureBusy = false; if (!refs.disposed && refs.latest) paintTigerTrail(refs, refs.latest); }
}
export function disposeTigerTrail(refs: TigerTrailRefs) {
  if (refs.disposed) return; refs.disposed = true; refs.generation++;
  refs.resize?.disconnect(); refs.resize = null; refs.gpu?.dispose(); refs.gpu = null;
  refs.fallback.dispose(); refs.resources.clear(); refs.embedded.clear(); refs.latest = null; refs.host = null; refs.parent.removeAttribute('visibility');
}
