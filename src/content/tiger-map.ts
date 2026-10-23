import type { LandmarkSymbol } from '../journey/landmark-symbol';

export const TIGER_WORLD = { width: 3600, height: 1900 };
export type CheckpointId = 'start' | 'bends' | 'halfway' | 'waterfall' | 'tinas' | 'river';
export type PlaceId = CheckpointId | 'naxi' | 'tea' | 'teacher';
export const CHECKPOINT_IDS: readonly CheckpointId[] = ['start', 'bends', 'halfway', 'waterfall', 'tinas', 'river'];
export type Leg = 'high' | 'down' | 'return';
type Site = readonly [id: PlaceId, name: string, leg: 'high' | 'down', x: number, y: number, symbol: LandmarkSymbol, labelSide?: 'above' | 'below' | 'left' | 'right'];

export const HIGH_ROAD_KNOTS: readonly (readonly [number, number])[] = [
  [190, 1440], [320, 1350], [465, 1290], [570, 1190], [690, 1110],
  [800, 1060], [875, 965], [780, 935], [940, 855], [855, 815], [1020, 740], [940, 700], [1100, 625],
  [1210, 650], [1300, 720], [1430, 800], [1550, 810], [1690, 770], [1830, 710], [1990, 710],
  [2110, 735], [2250, 705], [2380, 750], [2490, 760], [2580, 820], [2690, 855], [2790, 945], [2880, 1000],
];
export const RIVER_BRANCH_KNOTS: readonly (readonly [number, number])[] = [
  [2880, 1000], [3000, 995], [3100, 1030], [3140, 1080], [3045, 1115], [3180, 1165], [3090, 1200], [3210, 1250],
];
export const RIVER_COURSE_KNOTS: readonly (readonly [number, number])[] = [
  [-400, 1940], [200, 1770], [750, 1670], [1250, 1580], [1750, 1500], [2210, 1470], [2680, 1460], [3090, 1445], [3520, 1240], [4100, 930],
];

export const TIGER_SITES: readonly Site[] = [
  ['start', '桥头', 'high', 190, 1440, 'village', 'below'],
  ['naxi', '纳西雅阁', 'high', 570, 1190, 'inn', 'above'],
  ['bends', '二十八道拐', 'high', 1100, 625, 'switchbacks', 'above'],
  ['tea', '茶马客栈', 'high', 1550, 810, 'inn'],
  ['halfway', '中途客栈', 'high', 1990, 710, 'inn', 'above'],
  ['waterfall', '龙洞瀑布', 'high', 2490, 760, 'waterfall', 'above'],
  ['tinas', '中峡客栈', 'high', 2880, 1000, 'inn', 'left'],
  ['teacher', '张老师小路', 'down', 3100, 1030, 'trailhead', 'right'],
  ['river', '中虎跳 · 江边', 'down', 3210, 1250, 'rapids'],
];
export const CLIMB_START_POINT = { x: 800, y: 1060 };
