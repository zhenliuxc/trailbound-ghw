import type { ImageCache } from './contracts';
import { mapWalkFrame } from './map-gait';
import { MAP_WALK_FILE, MAP_WALK_WIDTH, MAP_WALK_HEIGHT, MAP_WALK_SCALE, MAP_WALK_FRAMES } from './map-walk-art';
import { WUGONG_REST_FILE, WUGONG_REST_WIDTH, WUGONG_REST_HEIGHT, WUGONG_REST_FRAMES } from './wugong-rest-art';

export { MAP_WALK_FILE } from './map-walk-art';

export const MAP_CHARACTER_FILE = 'characters/trailbound-chibi-v1.webp';
// Source rectangles and pelvis/sole anchors from art/characters/chibi-v1.json.
const stillFrames: readonly (readonly [number, number, number, number, number, number, number])[] = [
  [0, 0, 362, 376, 217, 371, 349], [362, 0, 362, 376, 198, 370, 348],
  [724, 0, 362, 376, 192, 371, 344], [1086, 0, 362, 376, 184, 370, 347],
];
interface MapCharacterPose { clock: number; walking: boolean; reduced: boolean; action: string; kitMotion?: boolean }
type CharacterAsset = 'loading' | 'ready' | 'failed';

/** A decoded watercolor sheet replaces the old articulated SVG silhouette. */
export function createMapCharacter(document: Document, cache: ImageCache | undefined, onChange: () => void) {
  function required(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing map character placement: ${id}`);
    return element;
  }
  const crop = required('hiker-art-crop');
  const image = required('hiker-art-image');
  const status = required('hiker-art-status');
  const ns = 'http://www.w3.org/2000/svg';
  function node<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>, parent: Element) {
    const element = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
    parent.append(element); return element;
  }
  const defs = node('defs', {}, crop);
  const bodyMask = node('mask', { id: 'hiker-kit-body', maskUnits: 'userSpaceOnUse', x: '0', y: '0', width: '2000', height: '1200' }, defs);
  node('rect', { x: '0', y: '0', width: '2000', height: '1200', fill: 'white' }, bodyMask);
  const packHole = node('path', { fill: 'black' }, bodyMask), scarfHole = node('path', { fill: 'black' }, bodyMask);
  const packClip = node('clipPath', { id: 'hiker-pack-clip', clipPathUnits: 'userSpaceOnUse' }, defs);
  const packShape = node('path', {}, packClip);
  const scarfClip = node('clipPath', { id: 'hiker-scarf-clip', clipPathUnits: 'userSpaceOnUse' }, defs);
  const scarfShape = node('path', {}, scarfClip);
  const pack = node('g', { display: 'none' }, crop), scarf = node('g', { display: 'none' }, crop);
  const packImage = node('image', { x: '0', y: '0', 'clip-path': 'url(#hiker-pack-clip)' }, pack);
  const scarfImage = node('image', { x: '0', y: '0', 'clip-path': 'url(#hiker-scarf-clip)' }, scarf);
  let stillAsset: CharacterAsset = 'loading', walkAsset: CharacterAsset = 'loading';
  let restAsset: CharacterAsset = 'loading';
  let disposed = false, previousFrame = '', previousFile = '';
  let latest: MapCharacterPose = { clock: 0, walking: false, reduced: false, action: 'walk' };

  function paint(pose: MapCharacterPose): void {
    if (disposed) return;
    latest = pose;
    const animate = pose.walking && !pose.reduced && walkAsset === 'ready';
    const useRest = pose.action === 'rest' && restAsset === 'ready';
    const fallbackWalk = stillAsset !== 'ready' && walkAsset === 'ready';
    const useWalk = animate || fallbackWalk;
    const ready = useRest || useWalk || stillAsset === 'ready';
    crop.setAttribute('visibility', ready ? 'visible' : 'hidden');
    const unavailable = pose.walking && !pose.reduced && walkAsset === 'failed';
    status.setAttribute('visibility', ready && !unavailable ? 'hidden' : 'visible');
    status.setAttribute('y', ready ? '31' : '-8');
    status.textContent = unavailable ? '步行画作暂未加载' : stillAsset === 'failed' && walkAsset === 'failed' ? '人物暂未加载' : '人物载入中…';
    if (!ready) return;
    const index = useWalk ? animate ? mapWalkFrame(pose.clock) : 0
      : pose.action === 'photo' ? 2 : pose.action === 'finish' || pose.action === 'ready' ? 0 : 1;
    const file = useRest ? WUGONG_REST_FILE : useWalk ? MAP_WALK_FILE : MAP_CHARACTER_FILE;
    const rest = WUGONG_REST_FRAMES.sit;
    const [x, y, width, height, footX, footY] = useRest ? [rest.x, rest.y, rest.width, rest.height, rest.footX, rest.footY] : useWalk ? MAP_WALK_FRAMES[index] : stillFrames[index];
    const kit = !!pose.kitMotion && animate;
    const fx = x + footX, fy = y + footY;
    if (kit) {
      pack.setAttribute('transform', `rotate(${(Math.sin(pose.clock * 4.2 - .5) * .65).toFixed(3)} ${fx - 93} ${fy - 188})`);
      scarf.setAttribute('transform', `rotate(${(Math.sin(pose.clock * 5.1) * 1.8).toFixed(3)} ${fx - 65} ${fy - 263})`);
    }
    const key = `${file}:${index}:${kit}`;
    if (previousFrame === key) return;
    previousFrame = key;
    if (previousFile !== file) {
      previousFile = file;
      for (const art of [image, packImage, scarfImage]) {
        art.setAttribute('href', file);
        art.setAttribute('width', String(useRest ? WUGONG_REST_WIDTH : useWalk ? MAP_WALK_WIDTH : 1448));
        art.setAttribute('height', String(useRest ? WUGONG_REST_HEIGHT : useWalk ? MAP_WALK_HEIGHT : 1086));
      }
    }
    if (kit) {
      const packPath = `M${fx - 112} ${fy - 260}Q${fx - 148} ${fy - 242} ${fx - 151} ${fy - 176}Q${fx - 157} ${fy - 112} ${fx - 89} ${fy - 109}L${fx - 45} ${fy - 145}L${fx - 61} ${fy - 235}Z`;
      const scarfPath = `M${fx - 65} ${fy - 278}Q${fx - 122} ${fy - 280} ${fx - 149} ${fy - 247}L${fx - 111} ${fy - 249}L${fx - 122} ${fy - 236}L${fx - 62} ${fy - 260}Z`;
      packHole.setAttribute('d', packPath); packShape.setAttribute('d', packPath);
      scarfHole.setAttribute('d', scarfPath); scarfShape.setAttribute('d', scarfPath);
      image.setAttribute('mask', 'url(#hiker-kit-body)');
    } else image.removeAttribute('mask');
    pack.setAttribute('display', kit ? '' : 'none'); scarf.setAttribute('display', kit ? '' : 'none');
    // Walking uses one physical scale for the entire sheet; only its foot anchor changes.
    const scale = useRest ? 54 / rest.height : useWalk ? MAP_WALK_SCALE : 54 / stillFrames[index][6];
    crop.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    crop.setAttribute('x', String(-footX * scale));
    crop.setAttribute('y', String(17.2 - footY * scale));
    crop.setAttribute('width', String(width * scale));
    crop.setAttribute('height', String(height * scale));
  }
  function reveal(kind: 'still' | 'walk' | 'rest', ok: boolean): void {
    if (disposed) return;
    if (kind === 'still') stillAsset = ok ? 'ready' : 'failed';
    else if (kind === 'walk') walkAsset = ok ? 'ready' : 'failed';
    else restAsset = ok ? 'ready' : 'failed';
    paint(latest);
    onChange();
  }
  const loaders: HTMLImageElement[] = [];
  function load(kind: 'still' | 'walk' | 'rest', file: string, width: number, height: number): void {
    const entry = cache?.request(file, 'high');
    if (entry) entry.promise.then(asset => reveal(kind, asset.state === 'ready' && asset.image.naturalWidth === width && asset.image.naturalHeight === height), () => reveal(kind, false));
    else {
      const loader = document.createElement('img'); loader.decoding = 'async';
      loader.onload = () => reveal(kind, loader.naturalWidth === width && loader.naturalHeight === height);
      loader.onerror = () => reveal(kind, false); loader.src = file;
      loaders.push(loader);
    }
  }
  load('still', MAP_CHARACTER_FILE, 1448, 1086);
  load('walk', MAP_WALK_FILE, MAP_WALK_WIDTH, MAP_WALK_HEIGHT);
  load('rest', WUGONG_REST_FILE, WUGONG_REST_WIDTH, WUGONG_REST_HEIGHT);
  return { paint, destroy() { disposed = true; defs.remove(); pack.remove(); scarf.remove(); image.removeAttribute('mask'); for (const loader of loaders) { loader.onload = null; loader.onerror = null; } } };
}
