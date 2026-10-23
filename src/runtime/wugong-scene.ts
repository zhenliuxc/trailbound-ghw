import type { ImageCache } from './contracts';
import type { VisualRoute } from './visual-route';
import { wugongPhase } from './wugong-world';
import { WUGONG_PROP_FILE, WUGONG_PROP_WIDTH, WUGONG_PROP_HEIGHT, WUGONG_PROPS } from './wugong-prop-art';

const NS = 'http://www.w3.org/2000/svg';
export const WUGONG_MAP_ASSETS = ['scenes/wugong-terrain-v1.webp', WUGONG_PROP_FILE, 'scenes/wugong-cloudsea-v1.webp'];
interface SceneOptions {
  document: Document;
  background: SVGGElement;
  foreground: SVGGElement;
  cache: ImageCache | undefined;
  onChange(): void;
  onStop(): void;
}
interface SceneFrame { progress: number; elapsed: number; reduced: boolean; x: number; y: number; visible: boolean }
type PropKind = keyof typeof WUGONG_PROPS;

/** One retained watercolor world. Its foreground shares the player's SVG camera. */
export function createWugongScene(options: SceneOptions) {
  const { document, background, foreground } = options;
  function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent: SVGElement) {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    parent.append(node);
    return node;
  }
  const under = svg('g', { 'data-wugong-layer': 'terrain', 'pointer-events': 'none' }, background);
  svg('rect', { x: -800, y: -800, width: 5200, height: 2500, fill: '#e9ead2' }, under);
  const terrain = svg('image', { href: WUGONG_MAP_ASSETS[0], x: -120, y: -80, width: 3840, height: 1060, preserveAspectRatio: 'xMidYMid slice' }, under);
  const defs = svg('defs', {}, under);
  const gradient = svg('linearGradient', { id: 'wugong-distance-fade', x1: 0, y1: 0, x2: 0, y2: 1, gradientUnits: 'objectBoundingBox' }, defs);
  svg('stop', { offset: 0, 'stop-color': 'white' }, gradient);
  svg('stop', { offset: .5, 'stop-color': 'white' }, gradient);
  svg('stop', { offset: 1, 'stop-color': 'black' }, gradient);
  const mask = svg('mask', { id: 'wugong-distance-mask', maskUnits: 'userSpaceOnUse', x: 1500, y: -250, width: 2300, height: 620 }, defs);
  svg('rect', { x: 1500, y: -250, width: 2300, height: 620, fill: 'url(#wugong-distance-fade)' }, mask);
  const distance = svg('g', { mask: 'url(#wugong-distance-mask)', opacity: 0, 'data-wugong-layer': 'distance' }, under);
  svg('image', { href: WUGONG_MAP_ASSETS[2], x: 1500, y: -250, width: 2300, height: 900, preserveAspectRatio: 'xMidYMid slice' }, distance);
  const behind = svg('g', { 'data-wugong-layer': 'plants-behind' }, background);
  const front = svg('g', { 'data-wugong-layer': 'plants-front' }, foreground);
  const haze = svg('g', { 'pointer-events': 'none', 'data-wugong-layer': 'near-mist' }, foreground);
  const mist = svg('image', { href: WUGONG_MAP_ASSETS[2], x: 1700, y: 50, width: 1900, height: 600, preserveAspectRatio: 'xMidYMid slice', mask: 'url(#wugong-distance-mask)', opacity: 0 }, haze);
  const props: { node: SVGGElement; x: number; y: number; kind: PropKind; front: boolean }[] = [];
  const status = document.createElement('span');
  status.className = 'wugong-art-status'; status.setAttribute('role', 'status');
  background.ownerSVGElement?.parentElement?.append(status);
  let disposed = false;
  const assets = new Map<string, 'loading' | 'ready' | 'failed'>(WUGONG_MAP_ASSETS.map(file => [file, 'loading']));
  const loaders: HTMLImageElement[] = [];

  function prop(kind: PropKind, x: number, y: number, height: number, interactive = false) {
    const frame = WUGONG_PROPS[kind], scale = height / frame.height;
    const group = svg('g', { transform: `translate(${x} ${y})`, 'data-wugong-prop': kind }, behind);
    const crop = svg('svg', { x: -frame.footX * scale, y: -frame.footY * scale, width: frame.width * scale, height, viewBox: `${frame.x} ${frame.y} ${frame.width} ${frame.height}`, overflow: 'hidden', 'pointer-events': interactive ? 'auto' : 'none' }, group);
    svg('image', { href: WUGONG_PROP_FILE, x: 0, y: 0, width: WUGONG_PROP_WIDTH, height: WUGONG_PROP_HEIGHT }, crop);
    if (interactive) {
      group.setAttribute('role', 'button'); group.setAttribute('tabindex', '-1');
      group.setAttribute('aria-label', kind === 'camp' ? '在营地停留' : '在观景石停留');
      group.addEventListener('click', options.onStop);
      group.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); options.onStop(); } });
    }
    props.push({ node: group, x, y, kind, front: false });
  }
  function mount(route: VisualRoute) {
    for (const item of props) item.node.remove();
    props.length = 0;
    for (const [x, y, height] of [[220, 760, 330], [530, 680, 370], [790, 745, 390], [990, 520, 280]]) prop('tree', x, y, height);
    for (const fraction of [.04, .11, .21, .29, .39, .46, .59, .67, .76, .84, .94]) {
      const point = route.sample(fraction);
      prop('grass', point.x + 25, point.y + 24, 58 + fraction * 18);
    }
    const camp = route.sample(.34), rock = route.sample(.55), summit = route.sample(.97);
    prop('camp', camp.x + 50, camp.y - 8, 120, true);
    prop('rock', rock.x + 35, rock.y + 26, 95, true);
    prop('rock', summit.x + 35, summit.y + 24, 105, true);
  }
  function update(frame: SceneFrame) {
    background.style.display = foreground.style.display = frame.visible ? '' : 'none';
    status.hidden = !frame.visible || [...assets.values()].every(value => value === 'ready');
    if (!frame.visible) return;
    status.textContent = [...assets.values()].some(value => value === 'failed') ? '部分山路画作暂未载入，仍可沿路行走与查看照片' : '山路画作正慢慢展开…';
    const phase = wugongPhase(frame.progress), time = frame.reduced ? 0 : frame.elapsed;
    distance.setAttribute('opacity', String(phase.cloudReveal * .84));
    distance.setAttribute('transform', `translate(${Math.sin(time * .035) * 6} 0)`);
    mist.setAttribute('opacity', String(phase.cloudReveal * .16));
    haze.setAttribute('transform', `translate(${Math.sin(time * .07) * 18} ${Math.cos(time * .04) * 3})`);
    for (const item of props) {
      const isFront = frame.y < item.y + 2;
      if (isFront !== item.front) { (isFront ? front : behind).append(item.node); item.front = isFront; }
      const near = Math.abs(frame.x - item.x) < 200;
      if (item.kind === 'camp' || item.kind === 'rock') {
        item.node.setAttribute('tabindex', near ? '0' : '-1');
        item.node.style.pointerEvents = near ? 'auto' : 'none';
      }
      const angle = item.kind === 'grass' && !frame.reduced ? Math.sin(time * .9 + item.x) * 1.2 : 0;
      item.node.setAttribute('transform', `translate(${item.x} ${item.y}) rotate(${angle})`);
    }
  }
  function settled(file: string, ok: boolean) {
    if (disposed) return;
    assets.set(file, ok ? 'ready' : 'failed');
    if (file === WUGONG_MAP_ASSETS[0] && !ok) terrain.setAttribute('visibility', 'hidden');
    options.onChange();
  }
  for (const file of WUGONG_MAP_ASSETS) {
    const entry = options.cache?.request(file, 'high');
    if (entry) entry.promise.then(asset => settled(file, asset.state === 'ready'), () => settled(file, false));
    else {
      const loader = document.createElement('img'); loader.onload = () => settled(file, true); loader.onerror = () => settled(file, false); loader.src = file; loaders.push(loader);
    }
  }
  return { mount, update, destroy() { disposed = true; background.replaceChildren(); foreground.replaceChildren(); status.remove(); for (const loader of loaders) { loader.onload = loader.onerror = null; } } };
}
