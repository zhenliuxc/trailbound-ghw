import type { Point } from '../journey/geometry';

// Display coordinates are a schematic oblique view. Elevation drives walking,
// independently of the direction in which a northbound descent is drawn.
export const PLACES = {
  tangkou: { name: '塘口村', x: 240, y: 1840, elevation: 1730, rank: 0 },
  yaopeng: { name: '药棚', x: 470, y: 1480, elevation: 2800, rank: 2 },
  camp2900: { name: '2900营地', x: 700, y: 1240, elevation: 2990, rank: 2 },
  penjing: { name: '盆景园', x: 910, y: 1060, elevation: 3250, rank: 1 },
  baiqi: { name: '白起庙', x: 1100, y: 1010, elevation: 3290, rank: 1 },
  aoshan: { name: '鳌山 · 导航架', x: 1320, y: 810, elevation: 3475, rank: 0 },
  xipaoma: { name: '西跑马梁', x: 1450, y: 920, elevation: 3370, rank: 1 },
  yaowang: { name: '药王庙', x: 1570, y: 970, elevation: 3360, rank: 2 },
  maijie: { name: '麦秸岭', x: 1810, y: 800, elevation: 3490, rank: 1 },
  shuiwo: { name: '水窝子', x: 2070, y: 1170, elevation: 3100, rank: 0 },
  feiji: { name: '飞机梁', x: 2310, y: 810, elevation: 3480, rank: 1 },
  liang: { name: '梁一至梁三峰', x: 2540, y: 950, elevation: 3300, rank: 2 },
  camp2800: { name: '2800营地', x: 2780, y: 1270, elevation: 2900, rank: 0 },
  nantian: { name: '南天门', x: 2990, y: 1060, elevation: 3200, rank: 2 },
  pyramid: { name: '金字塔', x: 3220, y: 800, elevation: 3400, rank: 0 },
  xiyuan: { name: '西塬', x: 3470, y: 1090, elevation: 3200, rank: 2 },
  taibailiang: { name: '太白梁 · 九重石海', x: 3720, y: 670, elevation: 3520, rank: 0 },
  dashihe: { name: '大石河', x: 3980, y: 1190, elevation: 3170, rank: 0 },
  dongyuan: { name: '东塬', x: 4160, y: 1020, elevation: 3300, rank: 2 },
  wanxian: { name: '万仙阵', x: 4400, y: 760, elevation: 3560, rank: 1 },
  leigong: { name: '雷公庙', x: 4610, y: 820, elevation: 3530, rank: 2 },
  dongpaoma: { name: '东跑马梁', x: 4800, y: 730, elevation: 3500, rank: 1 },
  dayehai: { name: '大爷海', x: 4990, y: 780, elevation: 3590, rank: 1 },
  baxian: { name: '拔仙台', x: 5050, y: 480, elevation: 3767, rank: 0 },
  dawengong: { name: '大文公庙', x: 5280, y: 930, elevation: 3495, rank: 1 },
  xiaowengong: { name: '小文公庙', x: 5510, y: 1100, elevation: 3430, rank: 2 },
  shangban: { name: '上板寺', x: 5730, y: 1230, elevation: 3200, rank: 2 },
  xiaban: { name: '下板寺', x: 5900, y: 1430, elevation: 2780, rank: 1 },
  tangyu: { name: '汤峪方向 · 出山', x: 6220, y: 1660, elevation: 700, rank: 0 },
} satisfies Record<string, Point & { name: string; elevation: number; rank: number }>;
export type PlaceId = keyof typeof PLACES;
export const MAIN_ORDER = [
  'tangkou', 'yaopeng', 'camp2900', 'penjing', 'baiqi', 'aoshan', 'xipaoma', 'yaowang', 'maijie', 'shuiwo',
  'feiji', 'liang', 'camp2800', 'nantian', 'pyramid', 'xiyuan', 'taibailiang', 'dashihe', 'dongyuan',
  'wanxian', 'leigong', 'dongpaoma', 'dayehai', 'dawengong', 'xiaowengong', 'shangban', 'xiaban', 'tangyu',
] satisfies PlaceId[];
export const CAMP_IDS = ['penjing', 'shuiwo', 'camp2800', 'dashihe'] satisfies PlaceId[];
export const OVERVIEW_BOUNDS = { left: 40, right: 6430, top: 250, bottom: 2450 };

export const CREST = [
  [-1800, 1650], [-650, 1470], [150, 1450], [480, 1260], [910, 960], [1100, 920],
  [1320, 680], [1570, 850], [1810, 665], [2070, 1050], [2310, 680], [2540, 830],
  [2780, 1130], [2990, 940], [3220, 660], [3470, 980], [3720, 530], [3980, 1070],
  [4160, 910], [4400, 630], [4610, 700], [4800, 610], [5050, 350], [5280, 820],
  [5510, 980], [5730, 1110], [5900, 1310], [6220, 1550], [6900, 1710], [8500, 1900],
].map(([x, y]) => ({ x, y }));
export const SUMMIT_KNOTS = [PLACES.dayehai, { x: 5090, y: 640 }, PLACES.baxian];
