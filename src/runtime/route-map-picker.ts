import type { RouteId, RouteSummary } from './contracts';
import { ROUTE_MAP_GEOMETRY as geometry } from './route-map-geometry.generated';
import { layoutMapLabels } from './map-labels';
import { ROUTE_ATLAS } from '../content/route-atlas';
import { landmarkSymbol } from '../journey/landmark-symbol';

const NS = 'http://www.w3.org/2000/svg';
interface Point { readonly x: number; readonly y: number }
const PLACEMENT = {
  wugong: { x: -55, y: 52 }, tiger: { x: -102, y: 48 }, aotai: { x: 0, y: -48 },
  maclehose: { x: 100, y: 52 }, changping: { x: -95, y: -11 },
  mogan: { x: 86, y: -32 }, westlake: { x: 86, y: 34 },
} satisfies Record<RouteId, Point>;

export interface RouteMapPickerOptions {
  readonly root: HTMLElement;
  readonly routes: readonly RouteSummary[];
  readonly selected: RouteId | null;
  readonly onChoose: (id: RouteId) => void;
}
export interface RouteMapPicker {
  setSelected(id: RouteId | null): void;
  destroy(): void;
}
interface Marker {
  readonly id: RouteId;
  readonly button: HTMLButtonElement;
  readonly line: SVGPathElement;
  readonly dot: SVGCircleElement;
}

export function createRouteMapPicker(options: RouteMapPickerOptions): RouteMapPicker {
  const { root, routes, onChoose } = options, doc = root.ownerDocument;
  const lifecycle = new AbortController(), { signal } = lifecycle;
  let selected = options.selected, disposed = false;
  function svg<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
    return doc.createElementNS(NS, tag);
  }
  const frame = doc.createElement('div'); frame.className = 'atlas-frame';
  const map = svg('svg'); map.classList.add('atlas-map'); map.setAttribute('aria-hidden', 'true');
  const definitions = svg('defs');
  definitions.innerHTML = '<linearGradient id="atlas-wash" x2=".75" y2="1"><stop stop-color="#e9e5ce"/><stop offset=".45" stop-color="#dce2c6"/><stop offset="1" stop-color="#b7cdb6"/></linearGradient><pattern id="atlas-grain" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r=".6" fill="#738165" opacity=".12"/><circle cx="7" cy="8" r=".5" fill="#fffceb" opacity=".6"/></pattern>';
  const clip = svg('clipPath'); clip.id = 'atlas-land-clip';
  const clipOutline = svg('path'); clipOutline.setAttribute('d', geometry.landPath); clip.append(clipOutline); definitions.append(clip); map.append(definitions);
  const land = svg('g'); land.classList.add('atlas-land');
  const shore = svg('path'); shore.setAttribute('d', geometry.landPath); shore.classList.add('atlas-shore');
  const coast = svg('path'); coast.setAttribute('d', geometry.landPath); coast.classList.add('atlas-coast');
  const outline = svg('path'); outline.setAttribute('d', geometry.landPath); outline.classList.add('atlas-outline');
  const terrain = svg('g'); terrain.setAttribute('clip-path', 'url(#atlas-land-clip)');
  for (const region of geometry.relief) {
    const area = svg('path'); area.setAttribute('d', region.path); area.classList.add('atlas-relief', `atlas-relief-${region.kind}`); terrain.append(area);
    if (region.marks) {
      const marks = svg('path'); marks.setAttribute('d', region.marks); marks.classList.add('atlas-mountains'); terrain.append(marks);
    }
  }
  for (const river of geometry.rivers) {
    const water = svg('path'); water.setAttribute('d', river); water.classList.add('atlas-river'); terrain.append(water);
  }
  const grain = svg('path'); grain.setAttribute('d', geometry.landPath); grain.setAttribute('fill', 'url(#atlas-grain)');
  land.append(shore, coast, outline, terrain, grain);
  for (const label of geometry.labels) {
    const text = svg('text'); text.setAttribute('x', String(label.x)); text.setAttribute('y', String(label.y));
    text.classList.add('atlas-geography', `atlas-geography-${label.kind}`); text.textContent = label.name; land.append(text);
  }
  map.append(land); frame.append(map);
  const compass = doc.createElement('span'); compass.className = 'atlas-compass'; compass.setAttribute('aria-hidden', 'true');
  compass.innerHTML = '<span>北</span><svg viewBox="0 0 32 40" fill="none"><path d="m16 4-8 28 8-6 8 6Z" stroke="currentColor"/><path d="M16 4v22l-8 6Z" fill="currentColor"/><path d="M3 21h26" stroke="currentColor" opacity=".35"/></svg>'; frame.append(compass);
  const leaders = svg('g'), dots = svg('g'); map.append(leaders, dots);
  const status = doc.createElement('p'); status.className = 'atlas-status'; status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const markers: Marker[] = [], ids = new Set<RouteId>();
  for (const route of routes) {
    if (ids.has(route.id) || !(route.id in ROUTE_ATLAS)) throw new Error('路线地图目录无法读取');
    ids.add(route.id);
    const label = ROUTE_ATLAS[route.id], button = doc.createElement('button');
    button.type = 'button'; button.id = `route-${route.id}`; button.className = 'atlas-place';
    button.setAttribute('aria-label', `${route.name} · ${label.region} · 查看旅程封面`);
    button.setAttribute('aria-controls', 'journey-stage'); button.dataset.route = route.id;
    const symbol = doc.createElement('span'); symbol.className = 'atlas-place-symbol'; symbol.innerHTML = landmarkSymbol(label.symbol);
    const words = doc.createElement('span'); words.className = 'atlas-place-words';
    const name = doc.createElement('strong'); name.textContent = label.name;
    const place = doc.createElement('small'); place.textContent = label.region; words.append(name, place); button.append(symbol, words);
    button.addEventListener('click', () => onChoose(route.id), { signal });
    frame.append(button);
    const line = svg('path'); line.classList.add('atlas-leader'); leaders.append(line);
    const dot = svg('circle'); dot.classList.add('atlas-dot'); dot.setAttribute('r', '3.5');
    dot.addEventListener('click', () => onChoose(route.id), { signal }); dots.append(dot);
    const highlight = (active: boolean) => { line.classList.toggle('is-hovered', active); dot.classList.toggle('is-hovered', active); };
    button.addEventListener('pointerenter', () => highlight(true), { signal });
    button.addEventListener('pointerleave', () => highlight(false), { signal });
    button.addEventListener('focus', () => highlight(true), { signal });
    button.addEventListener('blur', () => highlight(false), { signal });
    markers.push({ id: route.id, button, line, dot });
  }
  if (ids.size !== Object.keys(ROUTE_ATLAS).length) throw new Error('路线地图缺少地点');
  root.replaceChildren(frame, status);

  function setSelected(id: RouteId | null): void {
    selected = id;
    for (const marker of markers) {
      const active = marker.id === id;
      marker.button.setAttribute('aria-pressed', String(active));
      marker.line.classList.toggle('is-selected', active); marker.dot.classList.toggle('is-selected', active);
    }
    status.textContent = id ? `已选 ${ROUTE_ATLAS[id].name}，旅程封面已展开。` : '点一处山野，展开这趟旅程。';
  }
  function layout(): void {
    if (disposed) return;
    const width = frame.clientWidth;
    if (width <= 0) return;
    const narrow = width < 520, viewportHeight = doc.defaultView?.innerHeight ?? 900;
    let height = narrow ? Math.max(430, width + 20) : Math.max(440, Math.min(650, viewportHeight - 260, width * .66));
    frame.dataset.layout = narrow ? 'narrow' : 'wide';
    const [[left, top], [right, bottom]] = geometry.bounds;
    const landWidth = right - left, landHeight = bottom - top;
    const scale = Math.min((width - (narrow ? 100 : 150)) / landWidth, (height - (narrow ? 150 : 70)) / landHeight);
    const origin = { x: (narrow ? 20 : (width - landWidth * scale) / 2) - left * scale, y: (narrow ? 58 : 14) - top * scale };
    land.setAttribute('transform', `translate(${origin.x} ${origin.y}) scale(${scale})`);
    const anchors = (id: RouteId): Point => ({ x: origin.x + geometry.anchors[id].x * scale, y: origin.y + geometry.anchors[id].y * scale });
    if (narrow) height = anchors('westlake').y + 234;
    frame.style.height = `${height}px`; map.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const leftColumn = Math.min(100, Math.max(58, anchors('tiger').x - 60));
    const compactPositions = {
      aotai: { x: Math.min(width - 156, anchors('aotai').x), y: anchors('changping').y - 82 },
      changping: { x: leftColumn, y: anchors('changping').y - 22 }, tiger: { x: leftColumn, y: anchors('tiger').y + 86 },
      mogan: { x: width - 58, y: anchors('mogan').y - 46 },
      westlake: { x: width - 58, y: anchors('westlake').y + 58 },
      wugong: { x: width - 58, y: anchors('westlake').y + 124 },
      maclehose: { x: width * .5, y: anchors('westlake').y + 190 },
    } satisfies Record<RouteId, Point>;
    const positions = layoutMapLabels({ width, height,
      boxes: markers.map(marker => { const p = anchors(marker.id), radius = narrow ? 3 : 8; return { x: p.x - radius, y: p.y - radius, width: radius * 2, height: radius * 2 }; }),
      labels: markers.map(marker => ({ id: marker.id, anchor: anchors(marker.id), width: marker.button.offsetWidth, height: marker.button.offsetHeight,
        clearance: narrow ? 3 : 6, preferredOffset: narrow ? { x: compactPositions[marker.id].x - anchors(marker.id).x, y: compactPositions[marker.id].y - anchors(marker.id).y } : PLACEMENT[marker.id],
        preferredSide: ['tiger', 'wugong', 'westlake', 'maclehose'].includes(marker.id) ? 'bottom' as const : 'top' as const,
        priority: { aotai: 120, mogan: 110, westlake: 110, changping: 108, tiger: 107, wugong: 106, maclehose: 105 }[marker.id], required: true })),
    });
    for (const marker of markers) {
      const anchor = anchors(marker.id), desired = positions.get(marker.id) ?? anchor;
      const halfWidth = marker.button.offsetWidth / 2, halfHeight = marker.button.offsetHeight / 2;
      const center = { x: Math.max(halfWidth + 13, Math.min(width - halfWidth - 13, desired.x)), y: Math.max(halfHeight + 8, Math.min(height - halfHeight - 8, desired.y)) };
      marker.button.style.left = `${center.x}px`; marker.button.style.top = `${center.y}px`;
      const edge = { x: Math.max(center.x - halfWidth, Math.min(center.x + halfWidth, anchor.x)), y: Math.max(center.y - halfHeight, Math.min(center.y + halfHeight, anchor.y)) };
      marker.line.setAttribute('d', `M${anchor.x},${anchor.y}L${edge.x},${edge.y}`);
      marker.dot.setAttribute('cx', String(anchor.x)); marker.dot.setAttribute('cy', String(anchor.y));
    }
  }
  const observer = new ResizeObserver(layout); observer.observe(frame);
  doc.defaultView?.addEventListener('resize', layout, { signal });
  setSelected(selected); layout();
  return { setSelected, destroy() { if (disposed) return; disposed = true; lifecycle.abort(); observer.disconnect(); } };
}
