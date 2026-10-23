import { clamp, distance, type MemoryState, type Point, type Rect } from './model';
import { roadWalk } from './road';

export const PALETTE = ['#a8a778', '#7c998a', '#b99c7c'];
export const BRUSH = .068;
const regionRock: readonly Point[] = [{ x: .08, y: .05 }, { x: .38, y: .02 }, { x: .47, y: .14 }, { x: .4, y: .33 }, { x: .52, y: .5 }, { x: .4, y: .65 }, { x: .24, y: .67 }, { x: .15, y: .42 }];
const regionPlants: readonly Point[] = [{ x: .02, y: .47 }, { x: .2, y: .44 }, { x: .29, y: .63 }, { x: .42, y: .72 }, { x: .5, y: .91 }, { x: .32, y: .99 }, { x: .03, y: .97 }];
export const PAINT_REGIONS = [regionRock, regionPlants];
export function polygonContains(p: Point, polygon: readonly Point[]): boolean {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i], b = polygon[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) result = !result;
  }
  return result;
}
export const PAINT_CELLS = PAINT_REGIONS.map(region => {
  const cells: Point[] = [];
  for (let y = .025; y < 1; y += .05) for (let x = .025; x < 1; x += .05) if (polygonContains({ x, y }, region)) cells.push({ x, y });
  return cells;
});
export const coverage = (s: MemoryState) => s.session.kind === 'waterfall' ? s.session.coverage.map((cells, i) => cells.length / PAINT_CELLS[i].length) : [];

export function layout(s: MemoryState, viewport?: Pick<Rect, 'width' | 'height'>) {
  const height = s.kind === 'bends' && viewport ? 1000 * viewport.height / viewport.width : s.portrait ? s.kind === 'bends' ? 1040 : 1260 : 750;
  const walk = s.session.kind === 'bends' ? roadWalk(s.session.phase) : 0;
  const zoom = s.kind === 'bends' ? Math.max(1, height / 750) * (1.03 - walk * .03) : 1;
  const scene: Rect = s.kind === 'river' ? { x: 0, y: 0, width: 1000, height } : s.kind === 'bends' ? {
    x: clamp(500 - 385 * zoom, 1000 - 1000 * zoom, 0),
    y: clamp(height / 2 - (492 - walk * 25) * zoom, height - 750 * zoom, 0),
    width: 1000 * zoom, height: 750 * zoom,
  } : { x: 0, y: 0, width: 1000, height: 750 };
  const sketch: Rect = s.portrait ? { x: 90, y: 800, width: 680, height: 400 } : { x: 545, y: 350, width: 405, height: 340 };
  const sketchImage: Rect = { x: sketch.x + 20, y: sketch.y + 16, width: sketch.width - 40, height: sketch.height - 42 };
  const swatches = PALETTE.map((_, i) => s.portrait ? { x: 885, y: 865 + i * 135 } : { x: 508, y: 410 + i * 98 });
  const cardWidth = s.portrait ? 175 : 132, cardHeight = cardWidth * .9;
  const cards: Rect[] = Array.from({ length: 4 }, (_, i) => ({ x: (s.portrait ? 105 : 170) + i * (s.portrait ? 205 : 161), y: s.portrait ? 900 : 550, width: cardWidth, height: cardHeight }));
  const radius = s.portrait ? 360 : 236;
  return { width: 1000, height, scene, sketch, sketchImage, swatches, cards, radius };
}

/** Image mapping is shared by rendering, river targets and capture. */
export function riverImageRect(portrait: boolean): Rect {
  const height = portrait ? 1260 : 750, scale = Math.max(1, height / 750);
  return { x: (1000 - 1000 * scale) * .55, y: 0, width: 1000 * scale, height: 750 * scale };
}
export const riverToStage = (p: Point, portrait: boolean): Point => { const r = riverImageRect(portrait); return { x: r.x + p.x * r.width, y: r.y + p.y * r.height }; };
export const stageToRiver = (p: Point, portrait: boolean): Point => { const r = riverImageRect(portrait); return { x: (p.x - r.x) / r.width, y: (p.y - r.y) / r.height }; };
export function frameCenter(s: MemoryState): Point { const at = riverToStage(s.session.kind === 'river' ? s.session.center : { x: .23, y: .3 }, s.portrait), l = layout(s); return { x: clamp(at.x, l.radius, 1000 - l.radius), y: clamp(at.y, l.radius, l.height - l.radius) }; }
export function frameFits(s: MemoryState): boolean {
  if (s.session.kind !== 'river') return false;
  const center = frameCenter(s), radius = layout(s).radius;
  return [{ x: .489, y: .45 }, { x: .765, y: .68 }, { x: .64, y: .81 }, { x: .40, y: .68 }].every(p => distance(center, riverToStage(p, s.portrait)) < radius * .94);
}
export function moveFrame(s: MemoryState, p: Point): Point {
  const l = layout(s), radius = l.radius;
  return stageToRiver({ x: clamp(p.x, radius, l.width - radius), y: clamp(p.y, radius, l.height - radius) }, s.portrait);
}

/** Drawing hit tests use the same mountain projection as the road and hiker. */
export function roadFromStage(s: MemoryState, at: Point, viewport?: Pick<Rect, 'width' | 'height'>): Point { const r = layout(s, viewport).scene; return { x: (at.x - r.x) * 1000 / r.width, y: (at.y - r.y) * 750 / r.height }; }
export function roadToStage(s: MemoryState, at: Point, viewport?: Pick<Rect, 'width' | 'height'>): Point { const r = layout(s, viewport).scene; return { x: r.x + at.x * r.width / 1000, y: r.y + at.y * r.height / 750 }; }
