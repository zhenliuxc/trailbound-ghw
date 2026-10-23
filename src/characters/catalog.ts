import { MAP_WALK_FILE, MAP_WALK_FRAMES, MAP_WALK_SCALE, type MapWalkFrame } from '../runtime/map-walk-art';
import { CAMP_POSE_FILE, CAMP_POSES, CAMP_POSE_SCALE } from '../wugong-walk/scroll/camp-poses';
import { BRAIDED_FILE, BRAIDED_WALK_FRAMES, BRAIDED_ACTION_FRAMES, BRAIDED_WALK_SCALE, BRAIDED_ACTION_SCALE, BRAIDED_CONTACT_OFFSETS } from './braided-art';

export interface CharacterFrame {
  readonly x: number; readonly y: number; readonly width: number; readonly height: number;
  readonly footX: number; readonly footY: number; readonly scale: number; readonly contactX: number;
}
interface CharacterAppearance {
  readonly name: string; readonly detail: string; readonly preview: string;
  readonly walk: { readonly file: string; readonly frames: readonly CharacterFrame[] };
  readonly actions: { readonly file: string; readonly frames: readonly CharacterFrame[] };
}
function walkingFrames(frames: readonly MapWalkFrame[], scale: number, contacts: readonly number[]): CharacterFrame[] {
  return frames.map(([x, y, width, height, footX, footY], i) => ({ x, y, width, height, footX, footY, scale, contactX: contacts[i] ?? 0 }));
}
const blueCampRoots = [340, 875, 345, 957];
export const CHARACTERS = {
  blue: {
    name: '蓝衣旅人', detail: '灰蓝外套 · 苔绿背包', preview: 'characters/blue-hiker-preview-v1.webp',
    walk: { file: MAP_WALK_FILE, frames: walkingFrames(MAP_WALK_FRAMES, MAP_WALK_SCALE, [-3.74, 3.74, -.44, -4.92, -5.12, 2.83, -3.49, -4.95]) },
    actions: { file: CAMP_POSE_FILE, frames: CAMP_POSES.map((p, i) => ({ ...p, footX: blueCampRoots[i] - p.x, scale: CAMP_POSE_SCALE, contactX: 0 })) },
  },
  braids: {
    name: '双辫旅人', detail: '米白外套 · 红棕背包', preview: 'characters/braided-hiker-preview-v1.webp',
    walk: { file: BRAIDED_FILE, frames: walkingFrames(BRAIDED_WALK_FRAMES, BRAIDED_WALK_SCALE, BRAIDED_CONTACT_OFFSETS) },
    actions: { file: BRAIDED_FILE, frames: walkingFrames(BRAIDED_ACTION_FRAMES, BRAIDED_ACTION_SCALE, [0, 0, 0, 0]) },
  },
} satisfies Record<string, CharacterAppearance>;
export type CharacterId = keyof typeof CHARACTERS;
export const CHARACTER_IDS: readonly CharacterId[] = ['blue', 'braids'];
export const DEFAULT_CHARACTER: CharacterId = 'blue';
const storageKey = 'trailbound.character.v1';
let sessionChoice: CharacterId | undefined;

export function characterId(value: string | null): CharacterId | undefined {
  return CHARACTER_IDS.find(id => id === value);
}
export function readCharacterId(): CharacterId {
  if (sessionChoice) return sessionChoice;
  try { return characterId(localStorage.getItem(storageKey)) ?? DEFAULT_CHARACTER; }
  catch { return DEFAULT_CHARACTER; }
}
export function rememberCharacter(id: CharacterId): boolean {
  sessionChoice = id;
  try { localStorage.setItem(storageKey, id); return true; }
  catch { return false; }
}
