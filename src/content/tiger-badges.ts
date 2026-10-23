/** Original artwork is retained; these circles exclude its old pointed gold frames. */
export const TIGER_BADGE_ART = {
  bends: { file: 'badges/tiger-memories-v4/bends.webp', x: .5, y: .5, radius: .4 },
  inn: { file: 'badges/tiger-memories-v4/inn.webp', x: .5, y: .5, radius: .4 },
  waterfall: { file: 'badges/tiger-memories-v4/waterfall.webp', x: .5, y: .48, radius: .4 },
  river: { file: 'badges/tiger-memories-v4/river.webp', x: .5, y: .48, radius: .4 },
};

export const TIGER_BADGE_ENTRIES = {
  'tiger-bends-puzzle-v4': TIGER_BADGE_ART.bends,
  'tiger-inn-pairs-v4': TIGER_BADGE_ART.inn,
  'tiger-waterfall-paint-v4': TIGER_BADGE_ART.waterfall,
  'tiger-river-roundframe-v4': TIGER_BADGE_ART.river,
};

export const TIGER_LEGACY_BADGE_TILES = {
  'gorge-goat': { column: 0, row: 1 },
  'gorge-eagle': { column: 1, row: 1 },
  'gorge-sparkle': { column: 2, row: 1 },
};

export function tigerBadgeArt(id: string) {
  switch (id) {
    case 'tiger-bends-puzzle-v4': return TIGER_BADGE_ENTRIES[id];
    case 'tiger-inn-pairs-v4': return TIGER_BADGE_ENTRIES[id];
    case 'tiger-waterfall-paint-v4': return TIGER_BADGE_ENTRIES[id];
    case 'tiger-river-roundframe-v4': return TIGER_BADGE_ENTRIES[id];
    default: return null;
  }
}

export function tigerLegacyBadgeTile(id: string) {
  switch (id) {
    case 'gorge-goat': return TIGER_LEGACY_BADGE_TILES[id];
    case 'gorge-eagle': return TIGER_LEGACY_BADGE_TILES[id];
    case 'gorge-sparkle': return TIGER_LEGACY_BADGE_TILES[id];
    default: return null;
  }
}
