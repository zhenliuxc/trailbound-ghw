import type { DayRoute, DayRouteId, Waypoint } from '../journey/day-route';
import { DAY_PHOTOS as photos } from './day-photos';

const p = (x: number, y: number, elevation: number): Waypoint => ({ x, y, elevation });
const water = '<path d="M4 22q10-8 20 0t20 0M5 32q10-8 20 0t20 0M9 42q8-6 16 0t16 0"/>';
const leaf = '<path d="M10 41Q5 10 40 9Q42 37 10 41ZM10 41l24-25M17 32l-1-12M24 26l10 1"/>';
const mountain = '<path d="m3 43 14-26 9 14 10-22 12 34H3ZM12 27l5 4 4-5"/>';
const steps = '<path d="M4 43h13V32h11V21h14V9M8 34h9M21 22h7M34 11h8"/>';
const tea = '<path d="M10 27h27q-1 17-14 17T10 27ZM37 29q14-2 8 9h-9M17 20q-7-6 0-13M27 20q-7-6 0-13"/>';

export const DAY_ROUTES = {
  changping: {
    id: 'changping', name: '四姑娘山长坪沟', region: '四川 · 阿坝', title: '走过十月彩林，望见山谷尽头。',
    subtitle: '喇嘛寺 → 枯树滩 → 干海子 → 木骡子 · 原路返回', note: '沿溪走进彩林，在木骡子折返。',
    ending: '回到喇嘛寺，带回枝影、铃声、远山与一片秋色。', itinerary: 'out-and-back',
    world: { width: 3000, height: 1900 }, startMinute: 8 * 60 + 30, durationMinute: 8 * 60,
    waypoints: [p(770,1660,3250),p(900,1540,3290),p(1070,1530,3340),p(1160,1380,3400),p(1320,1310,3470),p(1420,1150,3500),p(1300,1030,3520),p(1450,900,3540),p(1640,910,3570),p(1780,800,3590),p(1785,670,3630),p(1990,620,3660),p(2190,620,3690),p(2320,500,3720),p(2480,430,3760)],
    places: [
      { id: 'lama', name: '喇嘛寺', knot: 0, feature: 'temple', symbol: 'temple' },
      { id: 'forest', name: '原始森林', knot: 2, feature: 'forest', symbol: 'forest', photo: photos['changping-forest'] },
      { id: 'deadtrees', name: '枯树滩', knot: 4, feature: 'water', symbol: 'snag' },
      { id: 'valley', name: '溪谷', knot: 6, feature: 'water', symbol: 'stream', labelSide: 'left', photo: photos['changping-valley'] },
      { id: 'lower-meadow', name: '下干海子', knot: 7, feature: 'meadow', symbol: 'dry-basin', labelSide: 'right' },
      { id: 'upper-meadow', name: '上干海子', knot: 9, feature: 'meadow', symbol: 'dry-basin', labelSide: 'left' },
      { id: 'redrock', name: '红石阵', knot: 11, feature: 'redrock', symbol: 'redrock', labelSide: 'right' },
      { id: 'muluozi', name: '木骡子', knot: 14, feature: 'meadow', symbol: 'alpine-meadow', photo: photos['changping-meadow'] },
    ],
    events: [
      { entry: 'changping-branch-reflection', knot: 4, place: '长坪沟 · 枯树滩', line: '溪声轻下来，枝桠在浅水里又长了一次。', motif: water },
      { entry: 'changping-bell-cord', knot: 8, place: '长坪沟 · 干海子马道休息处', line: '休息处的布垫上，一枚小铃被叠起的绳圈压住。', motif: '<path d="M13 35h26l-4-19q-9-10-17 0ZM10 36h32M22 41q4 5 8 0M24 8V4h5v4"/>' },
      { entry: 'changping-valley-path', knot: 13, place: '长坪沟 · 木骡子林缘', line: '林子将要让开，手帐里的小径还差一段。', motif: mountain },
      { entry: 'changping-autumn-print', knot: 5, leg: 'return', place: '长坪沟 · 返程彩林栈道', line: '下午的光落在纸上，一片落叶露出细细的叶脉。', motif: leaf },
    ],
    weather: [{ from: 0, kind: 'fog', name: '十月 · 晨雾彩林' }, { from: .15, kind: 'clear', name: '薄云渐开' }, { from: .4, kind: 'wind', name: '午间 · 草甸山风' }, { from: .61, kind: 'clear', name: '返程 · 午后暖光' }],
    sources: [{ name: '四姑娘山管理局 · 长坪沟', url: 'https://www.sgns.cn/understand/cpg' }],
  },
  mogan: {
    id: 'mogan', name: '莫干山竹林步道', region: '浙江 · 德清', title: '听着竹声，走过雨后的古道。',
    subtitle: '莫干岭西坡 → 竹林石阶 → 岭口 → 大坑侧山林', note: '竹叶接住雨滴，脚步慢慢穿过青绿。',
    ending: '走到大坑侧山林，把竹声与雨后的古道留下。',
    world: { width: 3000, height: 1900 }, startMinute: 9 * 60, durationMinute: 3 * 60,
    waypoints: [p(360,1500,340),p(510,1350,375),p(710,1400,400),p(780,1210,435),p(960,1160,465),p(1030,990,500),p(1260,1020,530),p(1370,850,560),p(1550,760,590),p(1740,830,570),p(1860,1040,520),p(2090,1030,485),p(2220,1190,450),p(2460,1260,420),p(2660,1390,395)],
    places: [
      { id: 'west', name: '莫干岭西坡', knot: 0, feature: 'gate', symbol: 'trailhead' },
      { id: 'bamboo', name: '竹林', knot: 2, feature: 'bamboo', symbol: 'bamboo', photo: photos['mogan-bamboo'] },
      { id: 'stone', name: '古道石阶', knot: 5, feature: 'ridge', symbol: 'steps' },
      { id: 'pass', name: '莫干岭口', knot: 8, feature: 'ridge', symbol: 'pass' },
      { id: 'forest', name: '林间步道', knot: 10, feature: 'forest', symbol: 'forest', photo: photos['mogan-path'] },
      { id: 'stream', name: '山涧', knot: 13, feature: 'water', symbol: 'stream', photo: photos['mogan-stream'] },
      { id: 'dakeng', name: '大坑侧山林', knot: 14, feature: 'forest', symbol: 'forest' },
    ],
    events: [
      { entry: 'bamboo-drop', knot: 3, place: '莫干山 · 莫干岭竹林', line: '雨停了一会儿，叶尖还在落下清亮的水珠。', motif: water },
      { entry: 'bamboo-step', knot: 6, place: '莫干山 · 莫干岭古道', line: '雨后的落叶伏在石阶上，古道在竹林里拐了个弯。', motif: steps },
      { entry: 'bamboo-leaf', knot: 11, place: '莫干山 · 大坑侧山林', line: '竹梢一齐转向远山，一阵风从林隙里经过。', motif: leaf },
    ],
    weather: [{ from: 0, kind: 'rain', name: '细雨 · 竹林' }, { from: .29, kind: 'fog', name: '雨歇 · 薄雾' }, { from: .62, kind: 'clear', name: '林隙微光' }],
    sources: [{ name: '湖州发布 · 莫干山古道背景资料', url: 'https://www.thepaper.cn/newsDetail_forward_2597949' }],
  },
  westlake: {
    id: 'westlake', name: '九溪龙井', region: '浙江 · 杭州', title: '沿着溪水，走进春日的茶园。',
    subtitle: '九溪烟树 → 九溪十八涧 → 龙井茶园 → 龙井村', note: '听溪水绕过石头，茶香在前面的村里。',
    ending: '龙井村的一盏茶，把今天的溪声留得更久一点。',
    world: { width: 3000, height: 1900 }, startMinute: 9 * 60, durationMinute: 2.5 * 60,
    waypoints: [p(660,1580,70),p(810,1460,76),p(1030,1460,80),p(1180,1280,88),p(1390,1330,95),p(1560,1170,106),p(1400,1050,115),p(1490,880,127),p(1700,800,135),p(1930,860,148),p(2160,740,160),p(2300,610,172),p(2150,510,185),p(2270,380,195),p(2460,330,205)],
    places: [
      { id: 'yan-shu', name: '九溪烟树', knot: 0, feature: 'water', symbol: 'lake' },
      { id: 'creek', name: '九溪溪谷', knot: 2, feature: 'water', symbol: 'stream', photo: photos['westlake-creek'] },
      { id: 'path', name: '九溪十八涧', knot: 5, feature: 'forest', symbol: 'stepping-stones', photo: photos['westlake-path'] },
      { id: 'tea', name: '龙井茶园', knot: 10, feature: 'tea', symbol: 'tea' },
      { id: 'village', name: '龙井村', knot: 14, feature: 'village', symbol: 'village', photo: photos['westlake-tea'] },
    ],
    events: [
      { entry: 'westlake-floating-leaf', knot: 3, place: '九溪龙井 · 九溪溪谷', line: '一片落叶在溪石旁打转，还没有找到下游的水路。', motif: leaf },
      { entry: 'westlake-stones', knot: 7, place: '九溪龙井 · 十八涧石径', line: '浅水从石头之间绕过，近处和远处是不同的声音。', motif: water },
      { entry: 'westlake-tea', knot: 10, place: '九溪龙井 · 龙井茶园', line: '嫩芽和新叶在晨光里透亮，茶垄铺过缓缓的山坡。', motif: leaf },
      { entry: 'westlake-eaves', knot: 13, place: '九溪龙井 · 龙井村口', line: '村口的茶盏冒起热气，可以在这里歇一会儿。', motif: tea },
    ],
    weather: [{ from: 0, kind: 'fog', name: '春日 · 溪谷薄雾' }, { from: .25, kind: 'clear', name: '树隙晴光' }, { from: .7, kind: 'clear', name: '午前 · 茶园微风' }],
    sources: [{ name: '杭州政协网 · 九溪至龙井徒步线', url: 'https://www.hzzx.gov.cn/cshz/content/2024-07/08/content_8755727.htm' }],
  },
} satisfies Record<DayRouteId, DayRoute>;

export function dayRouteFor(id: string | undefined): DayRoute | null {
  if (id === 'changping' || id === 'mogan' || id === 'westlake') return DAY_ROUTES[id];
  return null;
}
