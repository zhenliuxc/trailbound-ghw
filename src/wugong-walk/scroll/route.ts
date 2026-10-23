import { clamp, curve, distance, mix, type Point } from '../model';

export const SCROLL = { width: 3400, height: 1900 };
export type ScrollStopId = 'start' | 'slope' | 'meadow' | 'camp' | 'horse' | 'summit' | 'end';
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
const knots = [
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

const mountainCrest = curve([
  [-600, 1380], [0, 1350], [250, 1300], [480, 1000], [700, 740],
  [900, 435], [1060, 475], [1200, 575], [1400, 485], [1530, 510],
  [1710, 640], [1900, 515], [2050, 540], [2230, 615], [2420, 490],
  [2570, 350], [2710, 280], [2870, 385], [3010, 605], [3200, 850], [4000, 1370],
].map(([x, y]) => ({ x, y })), 14);

export class ScrollTrail {
  readonly points = curve(knots.map(([x, y]) => ({ x, y })), 12);
  readonly ridge = mountainCrest;
  readonly lengths: number[] = [0];
  readonly length: number;
  readonly campTravel: number;
  readonly summitTravel: number;
  readonly valleyTravel: number;
  readonly templeTravel: number;
  readonly sites: Readonly<Record<ScrollStopId, ScrollStop>>;
  readonly stops: readonly ScrollStop[];
  constructor() {
    for (let i = 1; i < this.points.length; i++) this.lengths.push(this.lengths[i - 1] + distance(this.points[i - 1], this.points[i]));
    this.length = this.lengths[this.lengths.length - 1];
    const stop = (id: ScrollStopId, name: string, day: 1 | 2, x: number, y: number): ScrollStop => {
      const travel = this.nearest({ x, y }).travel;
      return { id, name, day, travel, point: this.sample(travel) };
    };
    this.sites = {
      start: stop('start', '东江村 · 起点', 1, 300, 1510),
      slope: stop('slope', '绝望坡', 1, 1030, 550),
      meadow: stop('meadow', '高山草甸', 1, 1290, 670),
      camp: stop('camp', '观音宕／星空营地 · 过夜', 1, 1710, 690),
      horse: stop('horse', '吊马桩', 2, 2240, 660),
      summit: stop('summit', '金顶', 2, 2710, 340),
      end: stop('end', '石鼓寺／景区大门 · 终点', 2, 2350, 1660),
    };
    this.stops = Object.values(this.sites);
    this.campTravel = this.sites.camp.travel; this.summitTravel = this.sites.summit.travel;
    this.valleyTravel = this.nearest({ x: 2880, y: 680 }).travel;
    this.templeTravel = this.nearest({ x: 2680, y: 1130 }).travel;
  }
  stage(travel: number): ScrollStage {
    if (travel < 100) return 'village';
    if (travel < this.sites.slope.travel - 160) return 'forest';
    if (travel < this.sites.slope.travel + 100) return 'slope';
    if (travel < this.campTravel - 120) return 'meadow';
    if (travel < this.campTravel + 100) return 'camp';
    if (travel < this.summitTravel - 150) return 'ridge';
    if (travel <= this.summitTravel) return 'summit';
    if (travel < this.valleyTravel) return 'descent';
    if (travel < this.templeTravel) return 'valley';
    return travel < this.length - 120 ? 'temple' : 'end';
  }
  sample(travel: number): Point {
    const d = clamp(travel, 0, this.length);
    let low = 0, high = this.lengths.length - 1;
    while (low + 1 < high) { const middle = (low + high) >> 1; if (this.lengths[middle] < d) low = middle; else high = middle; }
    const t = (d - this.lengths[low]) / Math.max(.001, this.lengths[high] - this.lengths[low]);
    return { x: mix(this.points[low].x, this.points[high].x, t), y: mix(this.points[low].y, this.points[high].y, t) };
  }
  nearest(point: Point): { travel: number; gap: number } {
    let travel = 0, gap = Infinity;
    for (let i = 0; i < this.points.length - 1; i++) {
      const a = this.points[i], b = this.points[i + 1], dx = b.x - a.x, dy = b.y - a.y;
      const t = clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / Math.max(.001, dx * dx + dy * dy));
      const delta = Math.hypot(point.x - a.x - dx * t, point.y - a.y - dy * t);
      if (delta < gap) { gap = delta; travel = mix(this.lengths[i], this.lengths[i + 1], t); }
    }
    return { travel, gap };
  }
  heading(travel: number): number {
    const a = this.sample(travel - 18), b = this.sample(travel + 24);
    return Math.atan2(b.y - a.y, b.x - a.x);
  }
  angle(travel: number): number {
    const a = this.sample(travel - 14), b = this.sample(travel + 18);
    return Math.atan2(b.y - a.y, Math.abs(b.x - a.x));
  }
  bend(travel: number): number {
    const delta = this.heading(travel + 22) - this.heading(travel - 22);
    return Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta)));
  }
  soleOffset(travel: number, contactX: number): number {
    const a = this.sample(travel - 10), b = this.sample(travel + 10);
    return clamp((b.y - a.y) / Math.max(8, Math.abs(b.x - a.x)), -.75, .75) * contactX;
  }
  crestAt(x: number): number {
    let low = 0, high = this.ridge.length - 1;
    while (low + 1 < high) { const middle = (low + high) >> 1; if (this.ridge[middle].x < x) low = middle; else high = middle; }
    const a = this.ridge[low], b = this.ridge[high];
    return mix(a.y, b.y, clamp((x - a.x) / Math.max(.001, b.x - a.x)));
  }
  distantAt(x: number): number {
    const shoulder = (this.crestAt(x - 160) + this.crestAt(x + 180)) / 2;
    return Math.min(this.crestAt(x) - 95, shoulder - 125 - Math.sin(x / 285) * 28);
  }
}
