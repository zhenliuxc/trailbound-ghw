import type { Point } from '../journey/geometry';
import type { LandmarkSymbol } from '../journey/landmark-symbol';

export const SCROLL = { width: 3400, height: 1900 };
export type ScrollStopId = 'start' | 'slope' | 'meadow' | 'camp' | 'horse' | 'summit' | 'end';
export const PLACE_MARKERS = {
  start: { name: '东江村', symbol: 'village', caption: '起点' },
  slope: { name: '绝望坡', symbol: 'switchbacks', caption: '' },
  meadow: { name: '高山草甸', symbol: 'alpine-meadow', caption: '' },
  camp: { name: '观音宕营地', symbol: 'camp', caption: '过夜' },
  horse: { name: '吊马桩', symbol: 'pass', caption: '' },
  summit: { name: '金顶', symbol: 'summit', caption: '' },
  end: { name: '景区大门', symbol: 'gate', caption: '终点' },
} satisfies Record<ScrollStopId, { name: string; symbol: LandmarkSymbol; caption: string }>;
export type ScrollStage = 'village' | 'forest' | 'slope' | 'meadow' | 'camp' | 'ridge' | 'summit' | 'descent' | 'valley' | 'temple' | 'end';
export interface ScrollStop {
  readonly id: ScrollStopId; readonly name: string; readonly day: 1 | 2;
  readonly point: Point; readonly travel: number;
}
export const STAGES: Record<ScrollStage, { label: string; thought: string }> = {
  village: { label: '东江村出发', thought: '从村口整理好背包，沿溪谷走进林间。' },
  forest: { label: '林间上坡 · 向赤脚坳', thought: '绕过山肩，沿林间碎石小路走向赤脚坳。' },
  slope: { label: '绝望坡', thought: '缩短步幅，越过陡坡，回望刚才走过的山谷。' },
  meadow: { label: '高山草甸', thought: '沿起伏的草甸山脊，往观音宕方向走。' },
  camp: { label: '观音宕营地', thought: '山坳里的营地到了，今晚在这里住下。' },
  ridge: { label: '吊马桩山脊', thought: '离开观音宕，沿星空栈道一带的山脊走向吊马桩。' },
  summit: { label: '金顶', thought: '踏上最后一段石阶，金顶就在前方。' },
  descent: { label: '金顶 · 景区下山', thought: '离开金顶，从福星谷方向沿石阶下山。' },
  valley: { label: '福星谷下山', thought: '草甸渐渐退去，山谷和林带重新出现在身边。' },
  temple: { label: '中庵 · 紫极宫', thought: '经过中庵，再沿林间石阶走向石鼓寺和景区大门。' },
  end: { label: '石鼓寺 · 景区大门', thought: '从山脊回到山脚，两天一夜的山路走完了。' },
};

// North-face oblique schematic. The return descends toward the foreground,
// via Fuxinggu and Zhong'an. These are composition points, not GPS geometry.
export const TRAIL_KNOTS = [
  [300, 1510], [350, 1460], [420, 1408], [460, 1320], [550, 1270],
  [570, 1190], [500, 1160], [580, 1080], [650, 1050], [670, 960],
  [760, 920], [785, 825], [720, 800], [820, 720], [880, 650],
  [915, 570], [1030, 550], [1120, 580], [1190, 645], [1290, 670],
  [1400, 590], [1520, 610], [1610, 665], [1710, 690],
  [1810, 640], [1890, 580], [1980, 600], [2060, 650], [2150, 670], [2240, 660],
  [2320, 600], [2420, 590], [2470, 510], [2570, 470], [2630, 390], [2710, 340],
  [2810, 390], [2880, 460], [2820, 530], [2900, 590], [2880, 680],
  [2960, 730], [2950, 820], [2860, 860], [2800, 940], [2860, 1010],
  [2810, 1090], [2680, 1130], [2740, 1220], [2670, 1310], [2580, 1350],
  [2620, 1430], [2500, 1490], [2440, 1580], [2350, 1660],
] satisfies [number, number][];

export const CREST_KNOTS = [
  [-600, 1380], [0, 1350], [250, 1300], [480, 1000], [700, 740],
  [900, 435], [1060, 475], [1200, 575], [1400, 485], [1530, 510],
  [1710, 640], [1900, 515], [2050, 540], [2230, 615], [2420, 490],
  [2570, 350], [2710, 280], [2870, 385], [3010, 605], [3200, 850], [4000, 1370],
] satisfies [number, number][];

type ScrollStopSpec = readonly [id: ScrollStopId, name: string, day: 1 | 2, x: number, y: number];
export const SCROLL_SITES = {
  start: ['start', '东江村 · 起点', 1, 300, 1510],
  slope: ['slope', '绝望坡', 1, 1030, 550],
  meadow: ['meadow', '高山草甸', 1, 1290, 670],
  camp: ['camp', '观音宕／星空营地 · 过夜', 1, 1710, 690],
  horse: ['horse', '吊马桩', 2, 2240, 660],
  summit: ['summit', '金顶', 2, 2710, 340],
  end: ['end', '石鼓寺／景区大门 · 终点', 2, 2350, 1660],
} satisfies Record<ScrollStopId, ScrollStopSpec>;
export const VALLEY_POINT = { x: 2880, y: 680 };
export const TEMPLE_POINT = { x: 2680, y: 1130 };
