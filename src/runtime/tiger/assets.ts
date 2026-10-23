import type { TigerKind } from './rules';

export const TIGER_BACKGROUND = 'scenes/tiger-v1.webp';
export const TIGER_PROPS = 'sprites/tiger-props-v2.webp';
export const TIGER_SCENES: Record<TigerKind, string> = { depth: TIGER_BACKGROUND, packing: 'scenes/tiger-rest-v1.webp', score: 'scenes/tiger-waterfall-v1.webp', bells: TIGER_BACKGROUND };
export const TIGER_PAINTINGS: Record<TigerKind, string> = {
  depth: 'badges/tiger-river-below-v4.webp', packing: 'badges/tiger-halfway-rest-v4.webp',
  score: 'badges/tiger-longdong-waterfall-v4.webp', bells: 'badges/tiger-bell-first-v4.webp',
};
// The packaged sheet is normalized to 1280². Frames use the painted bounds, rather than
// assuming an exact third: padding and neighbouring props stay outside the crop.
export const PROP_FRAMES = [
  { x: 28, y: 22, w: 449, h: 431 }, { x: 568, y: 46, w: 145, h: 388 },
  { x: 787, y: 133, w: 465, h: 260 }, { x: 75, y: 477, w: 308, h: 306 },
  { x: 448, y: 521, w: 378, h: 246 }, { x: 862, y: 436, w: 376, h: 375 },
  { x: 40, y: 788, w: 443, h: 449 }, { x: 491, y: 791, w: 467, h: 451 },
  { x: 1005, y: 822, w: 198, h: 390 },
] as const;
export const TIGER_ROUTE_ASSETS = [...new Set([...Object.values(TIGER_SCENES), TIGER_PROPS, ...Object.values(TIGER_PAINTINGS)])];
