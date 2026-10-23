import type { MapPlaceLabel } from './landmark-layer';
import type { MapProjection, MapView } from './map-camera';
import { layoutLandmarkLabels, type LandmarkPlacement, type LandmarkRect } from './landmark-label';

/** Minor geographic names share the marker layout's occupied space. */
export class LandmarkNameLayer<Id extends string> {
  private readonly names;
  private measureKey = '';
  private positions = new Map<string, LandmarkPlacement>();

  constructor(options: { readonly container: HTMLElement; readonly places: readonly MapPlaceLabel<Id>[] }) {
    this.names = options.places.map(place => {
      const element = document.createElement('span');
      element.className = 'trail-map-name'; element.dataset.place = place.id; element.textContent = place.name;
      if (place.caption) { const small = document.createElement('small'); small.textContent = place.caption; element.append(small); }
      options.container.append(element);
      return { place, element, width: 0, height: 0 };
    });
  }

  update(projection: Pick<MapProjection, 'width' | 'height' | 'toScreen'>, view: MapView, visible: (place: MapPlaceLabel<Id>) => boolean, reserved: readonly LandmarkRect[]): void {
    const key = `${view}:${projection.width}:${projection.height}`;
    if (key !== this.measureKey) {
      this.measureKey = key; this.positions.clear();
      for (const name of this.names) name.element.hidden = false;
      for (const name of this.names) { name.width = name.element.offsetWidth; name.height = name.element.offsetHeight; }
    }
    const candidates = this.names.filter(name => visible(name.place)).flatMap(name => {
      const at = projection.toScreen(name.place.point);
      if (at.x < 0 || at.x > projection.width || at.y < 40 || at.y > projection.height - 54) return [];
      return [{ id: name.place.id, ...at, width: name.width, height: name.height, side: name.place.labelSide ?? 'below' }];
    });
    this.positions = layoutLandmarkLabels(candidates, projection.width, projection.height, 0, { reserved, previous: this.positions });
    for (const name of this.names) {
      const position = this.positions.get(name.place.id);
      name.element.hidden = !position;
      if (!position) continue;
      name.element.style.left = `${position.rect.x}px`; name.element.style.top = `${position.rect.y}px`;
    }
  }
}
