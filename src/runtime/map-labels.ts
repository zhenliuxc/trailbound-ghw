export interface MapLabelPoint { x: number; y: number }
/** Screen-space rectangle, measured from its top-left corner in CSS pixels. */
export interface MapLabelBox extends MapLabelPoint { width: number; height: number }
export interface MapLabel {
  id: string;
  anchor: MapLabelPoint;
  width: number;
  height: number;
  clearance: number;
  preferredSide: 'top' | 'bottom';
  preferredOffset?: MapLabelPoint;
  priority: number;
  required?: boolean;
}
/** x/y locate the label centre; offset keeps its placement relative to its anchor. */
export interface MapLabelPlacement extends MapLabelPoint {
  visible: boolean;
  offset: MapLabelPoint;
}
interface MapLabelLayout {
  width: number;
  height: number;
  boxes: readonly MapLabelBox[];
  labels: readonly MapLabel[];
  previous?: ReadonlyMap<string, MapLabelPlacement>;
}

const edge = 10, gap = 6;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const overlaps = (a: MapLabelBox, b: MapLabelBox) =>
  a.x < b.x + b.width + gap && a.x + a.width + gap > b.x &&
  a.y < b.y + b.height + gap && a.y + a.height + gap > b.y;

/** Place higher priorities first. Only labels without a free rectangle are hidden. */
export function layoutMapLabels(layout: MapLabelLayout): Map<string, MapLabelPlacement> {
  const placements = new Map<string, MapLabelPlacement>();
  const occupied = [...layout.boxes];
  const labels = [...layout.labels].sort((a, b) => b.priority - a.priority || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const label of labels) {
    const vertical = label.clearance + label.height / 2 + gap;
    const horizontal = label.clearance + label.width / 2 + gap;
    const side = label.preferredSide === 'top' ? -1 : 1;
    const offsets: MapLabelPoint[] = [];
    const remembered = layout.previous?.get(label.id);
    if (remembered?.visible) offsets.push(remembered.offset);
    if (label.preferredOffset) offsets.push(label.preferredOffset);
    for (const direction of [side, -side]) {
      for (const shift of [0, -.3, .3, -.6, .6]) offsets.push({ x: label.width * shift, y: direction * vertical });
    }
    for (const direction of [-1, 1]) {
      for (const shift of [0, -.35, .35]) offsets.push({ x: direction * horizontal, y: label.height * shift });
    }
    let placement: MapLabelPlacement = { x: label.anchor.x, y: label.anchor.y, visible: false, offset: { x: 0, y: 0 } };
    for (const offset of offsets) {
      const x = clamp(label.anchor.x + offset.x, edge + label.width / 2, layout.width - edge - label.width / 2);
      const y = clamp(label.anchor.y + offset.y, edge + label.height / 2, layout.height - edge - label.height / 2);
      const box = { x: x - label.width / 2, y: y - label.height / 2, width: label.width, height: label.height };
      if (box.x < edge || box.y < edge || box.x + box.width > layout.width - edge || box.y + box.height > layout.height - edge) continue;
      const anchorBox = { x: label.anchor.x - label.clearance, y: label.anchor.y - label.clearance, width: label.clearance * 2, height: label.clearance * 2 };
      if (overlaps(box, anchorBox) || occupied.some(other => overlaps(box, other))) continue;
      placement = { x, y, visible: true, offset: { x: x - label.anchor.x, y: y - label.anchor.y } };
      break;
    }
    if (!placement.visible && label.required) {
      let nearest = Infinity;
      const anchorBox = { x: label.anchor.x - label.clearance, y: label.anchor.y - label.clearance, width: label.clearance * 2, height: label.clearance * 2 };
      // Named endpoints get the nearest free space beyond the local candidates.
      for (let y = edge + label.height / 2; y <= layout.height - edge - label.height / 2; y += 16) {
        for (let x = edge + label.width / 2; x <= layout.width - edge - label.width / 2; x += 16) {
          const distance = (x - label.anchor.x) ** 2 + (y - label.anchor.y) ** 2;
          if (distance >= nearest) continue;
          const box = { x: x - label.width / 2, y: y - label.height / 2, width: label.width, height: label.height };
          if (overlaps(box, anchorBox) || occupied.some(other => overlaps(box, other))) continue;
          nearest = distance;
          placement = { x, y, visible: true, offset: { x: x - label.anchor.x, y: y - label.anchor.y } };
        }
      }
    }
    if (placement.visible) occupied.push({ x: placement.x - label.width / 2, y: placement.y - label.height / 2, width: label.width, height: label.height });
    placements.set(label.id, placement);
  }
  return placements;
}
