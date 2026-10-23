import type { Point2D } from '../runtime/projection';
import type { MapProjection, MapView } from './map-camera';
import { landmarkSymbol, LANDMARK_SIZE, type LandmarkSymbol } from './landmark-symbol';
import { layoutLandmarkLabels, visibleLandmarkSymbols, type LandmarkLabel, type LandmarkLabelSide, type LandmarkPlacement, type LandmarkRect } from './landmark-label';

export interface MapPlaceLabel<Id extends string> {
  readonly id: Id;
  readonly name: string;
  readonly point: Point2D;
  readonly caption?: string;
  readonly labelSide?: LandmarkLabelSide;
  readonly ariaLabel?: string;
}
export interface MapLandmark<Id extends string> extends MapPlaceLabel<Id> {
  readonly symbol: LandmarkSymbol;
  readonly importance?: 'primary' | 'secondary';
}
interface LandmarkState { readonly visible: boolean; readonly enabled: boolean; readonly visited: boolean }

/** Route hosts own availability and arrival. This layer owns only markers and nearby names. */
export class LandmarkLayer<Id extends string> {
  private readonly markers;
  private measureKey = '';
  private positions = new Map<string, LandmarkPlacement>();
  private shownSymbols = new Set<string>();
  constructor(private readonly options: {
    readonly container: HTMLElement;
    readonly places: readonly MapLandmark<Id>[];
    readonly className: string;
    readonly signal: AbortSignal;
    readonly onSelect: (id: Id) => void;
  }) {
    this.markers = options.places.map(place => {
      const element = document.createElement('button');
      element.type = 'button'; element.className = `trail-landmark ${options.className}`;
      element.dataset.place = place.id; element.dataset.stop = place.id; element.dataset.symbol = place.symbol;
      element.setAttribute('aria-label', place.ariaLabel ?? `${place.name}${place.caption ? ` · ${place.caption}` : ''}`);
      element.innerHTML = landmarkSymbol(place.symbol);
      const label = document.createElement('span'); label.className = 'trail-landmark-name'; label.textContent = place.name;
      if (place.caption) { const caption = document.createElement('small'); caption.textContent = place.caption; label.append(caption); }
      element.append(label); options.container.append(element);
      element.addEventListener('click', () => options.onSelect(place.id), { signal: options.signal });
      return { place, element, label, width: 0, height: 0 };
    });
  }

  setCaption(id: Id, text: string, ariaLabel: string): void {
    const marker = this.markers.find(marker => marker.place.id === id);
    if (!marker) return;
    marker.element.setAttribute('aria-label', ariaLabel);
    const caption = marker.label.querySelector('small') ?? document.createElement('small');
    if (caption.textContent === text) return;
    caption.textContent = text; marker.label.append(caption);
    this.measureKey = '';
  }

  update(projection: Pick<MapProjection, 'width' | 'height' | 'toScreen'>, view: MapView, state: (place: MapLandmark<Id>) => LandmarkState): LandmarkRect[] {
    const { container } = this.options;
    container.dataset.landmarkView = view;
    const compact = projection.width < 460;
    container.dataset.landmarkCompact = String(compact);
    const radius = (view === 'follow' ? LANDMARK_SIZE.follow : compact ? LANDMARK_SIZE.compact : LANDMARK_SIZE.overview) / 2;
    const key = `${view}:${projection.width}:${projection.height}`;
    if (this.measureKey !== key) {
      this.measureKey = key;
      this.positions.clear(); this.shownSymbols.clear();
      for (const marker of this.markers) { marker.element.hidden = false; marker.label.hidden = false; }
      for (const marker of this.markers) { marker.width = marker.label.offsetWidth; marker.height = marker.label.offsetHeight; }
    }
    const labels: LandmarkLabel[] = [], occupied: LandmarkRect[] = [];
    const visible = [];
    for (const marker of this.markers) {
      const at = projection.toScreen(marker.place.point), status = state(marker.place);
      marker.element.hidden = !status.visible || at.x < radius || at.x > projection.width - radius
        || at.y < 40 || at.y > projection.height - 54 || at.x > projection.width - 166 && at.y < 78;
      marker.element.disabled = !status.enabled; marker.element.dataset.visited = String(status.visited);
      marker.element.style.left = `${at.x}px`; marker.element.style.top = `${at.y}px`;
      if (marker.element.hidden) continue;
      visible.push({ marker, at, secondary: view === 'overview' && marker.place.importance === 'secondary' && !status.enabled });
    }
    this.shownSymbols = visibleLandmarkSymbols(visible.map(({ marker, at, secondary }) => ({ id: marker.place.id, ...at, secondary })), radius * 2, this.shownSymbols);
    for (const { marker, at } of visible) {
      const shown = this.shownSymbols.has(marker.place.id);
      marker.element.dataset.symbolVisible = String(shown);
      labels.push({ id: marker.place.id, x: at.x, y: at.y, width: marker.width, height: marker.height, side: marker.place.labelSide ?? 'below', iconRadius: shown ? radius : 0 });
      if (shown) occupied.push({ x: at.x - radius, y: at.y - radius, width: radius * 2, height: radius * 2 });
    }
    this.positions = layoutLandmarkLabels(labels, projection.width, projection.height, radius, { previous: this.positions });
    for (const marker of this.markers) {
      const position = this.positions.get(marker.place.id);
      marker.label.hidden = !position;
      if (!position) continue;
      marker.element.dataset.labelSide = position.side;
      marker.label.style.translate = `${position.dx}px ${position.dy}px`;
      occupied.push(position.rect);
    }
    return occupied;
  }
}
