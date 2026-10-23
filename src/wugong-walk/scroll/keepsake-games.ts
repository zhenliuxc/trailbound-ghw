export const FOREST_LEAVES_ID = 'wugong-forest-leaves';
export const HOMEWARD_PAGES_ID = 'wugong-homeward-pages';
export type KeepsakeId = typeof FOREST_LEAVES_ID | typeof HOMEWARD_PAGES_ID;
export const FOREST_ART = 'scenes/wugong-forest-leaves-v1/forest-v1.webp';
export const RETURN_ART = 'scenes/wugong-v1.webp';

export class LeafPairs {
  readonly deck: readonly number[];
  readonly matched = new Set<number>();
  open: number[] = [];
  constructor(random: () => number = Math.random) {
    const deck = [0, 1, 2, 3, 0, 1, 2, 3];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    this.deck = deck;
  }
  get complete(): boolean { return this.matched.size === 8; }
  choose(index: number): 'idle' | 'picked' | 'miss' | 'pair' | 'complete' {
    if (!Number.isInteger(index) || index < 0 || index >= 8 || this.complete || this.matched.has(index) || this.open.includes(index)) return 'idle';
    if (this.open.length === 2) this.open = [];
    this.open.push(index);
    if (this.open.length < 2) return 'picked';
    if (this.deck[this.open[0]] !== this.deck[index]) return 'miss';
    for (const card of this.open) this.matched.add(card);
    this.open = []; return this.complete ? 'complete' : 'pair';
  }
}

export const JOURNEY_PAGES = [
  { title: '林间上坡', file: FOREST_ART },
  { title: '高山草甸', file: 'badges/wugong-grass-letter-v4.webp' },
  { title: '观音宕入夜', file: 'scenes/wugong-camp-night-v1/night-v1.webp' },
  { title: '登上金顶', file: 'scenes/wugong-altar-v1.webp' },
] as const;

export class JourneyPages {
  readonly order = [2, 0, 3, 1];
  selected: number | null = null;
  get complete(): boolean { return this.order.every((page, i) => page === i); }
  swap(a: number, b: number): boolean {
    if (this.complete || a === b || !Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a > 3 || b > 3) return false;
    [this.order[a], this.order[b]] = [this.order[b], this.order[a]]; this.selected = null; return true;
  }
  choose(index: number): void {
    if (this.complete || !Number.isInteger(index) || index < 0 || index > 3) return;
    if (this.selected === null) this.selected = index;
    else { const from = this.selected; this.selected = null; this.swap(from, index); }
  }
}
