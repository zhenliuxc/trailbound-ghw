import type { LandmarkSymbol } from '../journey/landmark-symbol';
import type { Point } from '../journey/geometry';

export const WORLD = { width: 3000, height: 2550 };
export const PLACE_ORDER = ['longke', 'saiwanShan', 'saiwan', 'hamtin', 'taiLongAu', 'chekKeng', 'pakTamAu'] as const;
export type PlaceId = typeof PLACE_ORDER[number];
export type CheckpointId = PlaceId;
export const CHECKPOINT_IDS = PLACE_ORDER;
// A scenic rest on the illustrated uphill path, not an additional real-world landmark.
export const WOODLAND_REST = { x: 1749, y: 768 };
export const SAIWAN_SHOULDER = { x: 1782, y: 1458 };
export interface Place extends Point { readonly name: string; readonly elevation: number; readonly symbol: LandmarkSymbol; readonly side: 'above' | 'below' | 'left' | 'right'; readonly site: Point }

// Art-directed coast positions and raised summits, not a GPS projection.
export const PLACES = {
  longke: { name: '浪茄', x: 2250, y: 2325, elevation: 5, symbol: 'beach', side: 'below', site: {x:2187,y:2337} },
  saiwanShan: { name: '西湾山', x: 1665, y: 1260, elevation: 314, symbol: 'viewpoint', side: 'left', site: {x:1626,y:1221} },
  saiwan: { name: '西湾', x: 2070, y: 1515, elevation: 8, symbol: 'beach', side: 'left', site: {x:2004,y:1470} },
  hamtin: { name: '咸田湾', x: 2265, y: 1050, elevation: 6, symbol: 'beach', side: 'right', site: {x:2202,y:1020} },
  taiLongAu: { name: '大浪坳', x: 1410, y: 405, elevation: 225, symbol: 'pass', side: 'above', site: {x:1365,y:414} },
  chekKeng: { name: '赤径', x: 1035, y: 582, elevation: 6, symbol: 'pier', side: 'left', site: {x:1005,y:609} },
  pakTamAu: { name: '北潭凹', x: 465, y: 690, elevation: 140, symbol: 'trailhead', side: 'below', site: {x:465,y:735} },
} satisfies Record<PlaceId, Place>;

export const COAST_KNOTS: readonly (readonly [number, number])[] = [
  [750,775],[724,750],[704,726],[665,718],[676,680],[631,653],[651,622],[602,590],
  [620,552],[574,520],[594,486],[553,451],[555,420],
  [587,431],[611,452],[627,480],[652,489],[665,515],[690,505],
  [714,484],[729,453],[721,424],[743,406],[752,382],[744,364],[755,350],
  [735,328],[695,337],[675,306],[636,300],[618,270],[583,256],[569,222],
  [525,210],[526,176],[488,166],[470,135],
  [449,160],[430,172],[420,202],[388,211],[367,202],[345,194],
  [307,208],[294,225],[255,220],[227,231],[196,249],[155,230],
];
