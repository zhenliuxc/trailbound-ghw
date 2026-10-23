import { LANDMARK_SIZE } from './landmark-symbol';
export type LandmarkLabelSide = 'above' | 'below' | 'left' | 'right';
export interface LandmarkLabel {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly side: LandmarkLabelSide;
  readonly iconRadius?: number;
}
export interface LandmarkRect { x: number; y: number; width: number; height: number }
export interface LandmarkPlacement { side: LandmarkLabelSide; dx: number; dy: number; rect: LandmarkRect }
const overlaps = (a: LandmarkRect, b: LandmarkRect): boolean => a.x < b.x + b.width + 3 && a.x + a.width + 3 > b.x
  && a.y < b.y + b.height + 3 && a.y + a.height + 3 > b.y;

/** Move names locally around their fixed symbols; never move a place off its terrain. */
export function layoutLandmarkLabels(labels: readonly LandmarkLabel[], width: number, height: number, radius: number, options: {
  readonly reserved?: readonly LandmarkRect[];
  readonly previous?: ReadonlyMap<string, LandmarkPlacement>;
} = {}): Map<string, LandmarkPlacement> {
  const occupied: LandmarkRect[] = [...(options.reserved ?? []), ...labels.flatMap(label => {
    const r = label.iconRadius ?? radius;
    return r > 0 ? [{ x: label.x - r, y: label.y - r, width: r * 2, height: r * 2 }] : [];
  })];
  occupied.push({ x: width - 166, y: 0, width: 166, height: 78 });
  occupied.push({ x: 8, y: height - 54, width: Math.min(270, width * .74), height: 46 });
  const result = new Map<string, LandmarkPlacement>();
  const sides: readonly LandmarkLabelSide[] = ['above', 'below', 'left', 'right'];
  for (const label of labels) {
    const candidates: Pick<LandmarkPlacement, 'side' | 'dx' | 'dy'>[] = [];
    const previous = options.previous?.get(label.id);
    if (previous) candidates.push(previous);
    for (const shift of [0, -12, 12, -24, 24, -36, 36]) {
      for (const side of [label.side, ...sides.filter(side => side !== label.side)]) {
        const horizontal = side === 'left' || side === 'right';
        candidates.push({ side, dx: horizontal ? 0 : shift, dy: horizontal ? shift : 0 });
      }
    }
    for (const { side, dx, dy } of candidates) {
      const gap = LANDMARK_SIZE.labelGap;
      const x = label.x + dx + (side === 'left' ? -gap - label.width : side === 'right' ? gap : -label.width / 2);
      const y = label.y + dy + (side === 'above' ? -gap - label.height : side === 'below' ? gap : -label.height / 2);
      const rect = { x, y, width: label.width, height: label.height };
      if (x < 8 || x + label.width > width - 8 || y < 8 || y + label.height > height - 8 || occupied.some(other => overlaps(rect, other))) continue;
      occupied.push(rect); result.set(label.id, { side, dx, dy, rect }); break;
    }
  }
  return result;
}

interface SymbolAnchor { readonly id: string; readonly x: number; readonly y: number; readonly secondary: boolean }
/** On dense overviews, a secondary place keeps its name until its full symbol fits. */
export function visibleLandmarkSymbols(anchors: readonly SymbolAnchor[], diameter: number, previous: ReadonlySet<string>): Set<string> {
  const placed = anchors.filter(anchor => !anchor.secondary);
  const shown = new Set(placed.map(anchor => anchor.id));
  for (const anchor of anchors.filter(anchor => anchor.secondary)) {
    const spacing = diameter + (previous.has(anchor.id) ? 1 : 3);
    if (placed.some(other => Math.hypot(other.x - anchor.x, other.y - anchor.y) < spacing)) continue;
    placed.push(anchor); shown.add(anchor.id);
  }
  return shown;
}
