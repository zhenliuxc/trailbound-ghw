export const CAMP_STARS_ID = 'wugong-camp-stars';
export const CAMP_NIGHT_ART = 'scenes/wugong-camp-night-v1/night-v1.webp';

export interface CampStar { readonly x: number; readonly y: number }
export type StarLink = readonly [number, number];
export const CAMP_STARS: readonly CampStar[] = [
  { x: .04, y: .23 }, { x: .21, y: .12 }, { x: .37, y: .36 },
  { x: .54, y: .45 }, { x: .82, y: .14 }, { x: .96, y: .73 }, { x: .69, y: .91 },
  { x: .10, y: .86 }, { x: .51, y: .03 }, { x: .97, y: .34 },
];
export const CAMP_STAR_LINKS: readonly StarLink[] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]];

export type CampStarState = { kind: 'watching' } |
  { kind: 'playing'; selected: number | null; links: readonly StarLink[] } |
  { kind: 'complete' } | { kind: 'collected' };
export type StarFeedback = 'selected' | 'joined' | 'miss' | 'repeat' | 'complete' | 'idle';
const sameLink = (a: StarLink, b: StarLink) => a[0] === b[0] && a[1] === b[1] || a[0] === b[1] && a[1] === b[0];

export class CampStars {
  state: CampStarState = { kind: 'watching' };
  get links(): readonly StarLink[] {
    return this.state.kind === 'playing' ? this.state.links : this.state.kind === 'watching' ? [] : CAMP_STAR_LINKS;
  }
  begin(): void { if (this.state.kind === 'watching') this.state = { kind: 'playing', selected: null, links: [] }; }
  choose(index: number): StarFeedback {
    const state = this.state;
    if (state.kind !== 'playing') return 'idle';
    if (state.selected === null || state.selected === index) {
      this.state = { ...state, selected: state.selected === index ? null : index }; return 'selected';
    }
    return this.join(state.selected, index);
  }
  join(from: number, to: number): StarFeedback {
    const state = this.state;
    if (state.kind !== 'playing') return 'idle';
    const link: StarLink = [from, to];
    if (!CAMP_STAR_LINKS.some(expected => sameLink(expected, link))) return 'miss';
    if (state.links.some(existing => sameLink(existing, link))) { this.state = { ...state, selected: to }; return 'repeat'; }
    const links = [...state.links, link];
    if (links.length === CAMP_STAR_LINKS.length) { this.state = { kind: 'complete' }; return 'complete'; }
    this.state = { kind: 'playing', selected: to, links }; return 'joined';
  }
  undo(): void {
    if (this.state.kind === 'playing') this.state = { kind: 'playing', selected: null, links: this.state.links.slice(0, -1) };
  }
  retry(): void { if (this.state.kind === 'playing') this.state = { kind: 'playing', selected: null, links: [] }; }
  collect(): boolean {
    if (this.state.kind !== 'complete') return false;
    this.state = { kind: 'collected' }; return true;
  }
}
