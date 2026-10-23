import { Graphics, Text, type Container } from 'pixi.js';
import { curve, distance, mix, type Point } from '../wugong-walk/model';
import { highRoad, place, riverBranch, riverCourse, type PlaceId } from './route';

export const noise = (seed: number): number => {
  const value = Math.sin(seed * 12.9898 + 3.7) * 43758.5453;
  return value - Math.floor(value);
};
export function trace(g: Graphics, points: readonly Point[]): Graphics {
  if (!points.length) return g;
  g.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) g.lineTo(points[i].x, points[i].y);
  return g;
}
const spline = (knots: readonly (readonly [number, number])[]): Point[] => curve(knots.map(([x, y]) => ({ x, y })), 10);
const crest = spline([
  [-550, 1470], [-180, 1150], [220, 890], [480, 655], [765, 450], [960, 375],
  [1100, 265], [1310, 410], [1540, 365], [1760, 305], [1990, 405], [2300, 315],
  [2520, 465], [2750, 485], [2990, 560], [3290, 660], [3930, 830],
]);
function yAt(points: readonly Point[], x: number): number {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    if (a.x <= x && x <= b.x) return mix(a.y, b.y, (x - a.x) / Math.max(.001, b.x - a.x));
  }
  return x < points[0].x ? points[0].y : points[points.length - 1].y;
}

const falls = place('waterfall').point;
export const WATERFALL = spline([
  [falls.x - 42, falls.y - 165], [falls.x - 21, falls.y - 100], [falls.x - 4, falls.y - 25],
  [falls.x + 9, falls.y + 45], [falls.x + 42, falls.y + 155], [falls.x + 62, falls.y + 270],
]);
function buildingBase(id: PlaceId, width: number): Point {
  const site = place(id), road = site.leg === 'high' ? highRoad : riverBranch, angle = road.heading(site.at);
  const setback = 40 + width * .1;
  return { x: site.point.x + Math.sin(angle) * setback - 8, y: site.point.y - Math.cos(angle) * setback - 8 };
}
const inn = buildingBase('halfway', 78);
export const INN_LIGHTS = [-28, -13, 2, 17, 32].map(x => ({ x: inn.x + x, y: inn.y - 26 }));

function rock(g: Graphics, x: number, y: number, size: number, seed: number): void {
  g.ellipse(x + size * .2, y + size * .22, size * 1.1, size * .38).fill({ color: '#344f48', alpha: .18 });
  trace(g, [{ x: x - size, y: y + size * .1 }, { x: x - size * .65, y: y - size * .5 },
    { x: x + size * .2, y: y - size * .63 }, { x: x + size, y: y - size * .1 },
    { x: x + size * .72, y: y + size * .35 }]).closePath().fill(seed % 3 ? '#abb2a0' : '#c0bca5');
  trace(g, [{ x: x - size * .65, y: y - size * .5 }, { x: x + size * .2, y: y - size * .63 },
    { x: x + size * .35, y: y - size * .12 }, { x: x - size * .82, y: y + size * .08 }]).closePath().fill({ color: '#e1d9be', alpha: .48 });
  g.moveTo(x + size * .2, y - size * .55).lineTo(x + size * .36, y + size * .1).stroke({ color: '#75877a', width: .9, alpha: .7 });
}

function shrub(g: Graphics, x: number, y: number, size: number, seed: number): void {
  g.ellipse(x + 2, y + 2, size * 1.1, size * .35).fill({ color: '#4d6b52', alpha: .14 });
  g.moveTo(x, y).lineTo(x - 1, y - size * .7).stroke({ color: '#7a8262', width: 1.5 });
  for (let i = 0; i < 3; i++) {
    g.ellipse(x + (i - 1) * size * .48, y - size * (.45 + (i === 1 ? .33 : .05)), size * .64, size * .4)
      .fill({ color: seed % 4 ? '#738663' : '#9ea57c', alpha: .75 });
    g.ellipse(x + (i - 1) * size * .48 - 1, y - size * (.65 + (i === 1 ? .33 : .05)), size * .38, size * .13)
      .fill({ color: '#bcc39a', alpha: .35 });
  }
}

function building(g: Graphics, id: PlaceId, width: number, floors: number): void {
  const { x, y } = buildingBase(id, width), depth = 14, height = floors * 18;
  g.ellipse(x + 3, y + 8, width * .72, 12).fill({ color: '#405b48', alpha: .15 });
  trace(g, [{ x: x - width * .65, y: y + 3 }, { x: x + width * .65, y: y + 3 },
    { x: x + width * .58, y: y + 17 }, { x: x - width * .63, y: y + 17 }]).closePath().fill('#999f84');
  g.rect(x - width / 2, y - height, width, height).fill('#e2d7ba');
  trace(g, [{ x: x + width / 2, y }, { x: x + width / 2 + depth, y: y - 10 },
    { x: x + width / 2 + depth, y: y - height - 10 }, { x: x + width / 2, y: y - height }]).closePath().fill('#b4b79a');
  trace(g, [{ x: x - width / 2 - 7, y: y - height }, { x: x - width / 2 + 11, y: y - height - 15 },
    { x: x + width / 2 + 8, y: y - height - 15 }, { x: x + width / 2 + 20, y: y - height - 6 },
    { x: x + width / 2 + 5, y: y - height + 3 }]).closePath().fill('#687e6e');
  g.moveTo(x - width / 2 + 11, y - height - 15).lineTo(x + width / 2 + 8, y - height - 15).stroke({ color: '#b2b69b', width: 2 });
  for (let row = 0; row < floors; row++) {
    for (let col = 0; col < Math.floor(width / 15); col++) {
      g.rect(x - width / 2 + 8 + col * 15, y - height + 6 + row * 18, 6, 8).fill('#7f927c');
    }
  }
  g.rect(x - 4, y - 13, 8, 13).fill('#667d68');
  if (floors > 1) {
    g.rect(x - width / 2 - 6, y - 20, width + 12, 3).fill('#939e80');
    for (let i = 0; i < 7; i++) g.moveTo(x - width / 2 - 4 + i * width / 6, y - 20).lineTo(x - width / 2 - 4 + i * width / 6, y - 8).stroke({ color: '#7c8d71', width: 1.4 });
    g.moveTo(x - width / 2 - 5, y - 8).lineTo(x + width / 2 + 5, y - 8).stroke({ color: '#7c8d71', width: 1.4 });
  }
}

function drawPaths(g: Graphics): void {
  for (const road of [highRoad, riverBranch]) {
    const branch = road === riverBranch;
    const edge = road.points.map(p => ({ x: p.x, y: p.y + 6 }));
    trace(g, edge).stroke({ color: '#485f51', alpha: .29, width: branch ? 9 : 11, cap: 'round', join: 'round' });
    trace(g, road.points).stroke({ color: '#b3b9a4', width: branch ? 7 : 9, cap: 'round', join: 'round' });
    trace(g, road.points).stroke({ color: '#cbd0be', width: branch ? 3 : 4, alpha: .8, cap: 'round', join: 'round' });
    for (let d = 11, index = 0; d < road.length; index++, d += 17 + noise(index + 810) * 30) {
      const p = road.sample(d), a = road.heading(d), normal = { x: -Math.sin(a), y: Math.cos(a) };
      const offset = (noise(index + 17) - .5) * 3;
      g.ellipse(p.x + normal.x * offset, p.y + normal.y * offset, .7 + noise(index) * .8, .5)
        .fill({ color: '#7e8f7c', alpha: .38 });
      if (index % 4 === 0) rock(g, p.x + normal.x * 10, p.y + normal.y * 10, 1.8 + noise(index + 3) * 2, index);
    }
  }
  // Low stone parapets follow the exposed sections and never cross the path.
  for (const [start, end] of [[.55, .7], [.76, .87]] as const) {
    const ledge: Point[] = [];
    for (let d = highRoad.length * start; d < highRoad.length * end; d += 10) {
      const p = highRoad.sample(d); ledge.push({ x: p.x, y: p.y + 10 });
    }
    trace(g, ledge).stroke({ color: '#7b8975', width: 5, alpha: .7, cap: 'round', join: 'round' });
    trace(g, ledge.map(p => ({ x: p.x, y: p.y - 2 }))).stroke({ color: '#cbd0b4', width: 2, alpha: .8 });
  }
}

/** Static vector geometry is built once; water, light and camera use separate layers. */
export function drawTigerLandscape(world: Container, movingWater: Graphics): void {
  const sky = new Graphics(); world.addChild(sky);
  sky.rect(-1800, -1800, 7400, 5500).fill('#e4ece5');
  sky.rect(-1800, -1800, 7400, 1700).fill('#d7e5e1');
  for (let band = 0; band < 3; band++) {
    const ridge = spline([[-800, 210 + band * 100], [-100, 95 + band * 100], [350, 185 + band * 80],
      [760, 80 + band * 75], [1200, 150 + band * 95], [1650, 25 + band * 100],
      [2100, 140 + band * 90], [2640, 70 + band * 95], [3150, 185 + band * 90], [4300, 230 + band * 120]]);
    trace(sky, [...ridge, { x: 4300, y: 2400 }, { x: -800, y: 2400 }]).closePath().fill(['#cfddd5', '#bdcfc4', '#aabdac'][band]);
  }
  const mountain = new Graphics(); world.addChild(mountain);
  const upperBank = riverCourse.map(p => ({ x: p.x, y: p.y - 104 }));
  trace(mountain, [...crest, ...upperBank.slice().reverse()]).closePath().fill('#a6b194');
  for (let i = 0; i < 15; i++) {
    const x = 65 + i * 232, top = yAt(crest, x) + 22, floor = yAt(riverCourse, x + 140) - 106;
    const bend = 28 + noise(i) * 58, width = 80 + noise(i + 9) * 72;
    trace(mountain, spline([[x, top], [x + bend, mix(top, floor, .33)], [x + 65, mix(top, floor, .65)],
      [x + 145, floor], [x + 145 - width, floor - 28], [x - width * .6, mix(top, floor, .53)], [x - width * .3, top + 48]]))
      .closePath().fill({ color: i % 3 ? '#829781' : '#718a79', alpha: .42 });
    trace(mountain, spline([[x + 8, top + 34], [x + bend + 18, mix(top, floor, .35)], [x + 95, floor - 45]]))
      .stroke({ color: '#c7c7a5', alpha: .5, width: 8 + noise(i + 11) * 15, cap: 'round' });
    for (let cut = 0; cut < 4; cut++) {
      const offset = cut * 14;
      trace(mountain, spline([[x + offset - width * .4, top + 80 + cut * 25], [x + bend + offset - width * .4, mix(top, floor, .59)], [x + 80 + offset, floor - 12]]))
        .stroke({ color: '#5d786c', alpha: .18, width: cut % 2 ? 1 : 2, cap: 'round' });
    }
  }
  for (let band = 1; band < 7; band++) {
    const contour: Point[] = [];
    for (let x = -100; x <= 3720; x += 40) {
      const fraction = band / 8, top = yAt(crest, x), floor = yAt(riverCourse, x) - 115;
      contour.push({ x, y: mix(top, floor, fraction) + Math.sin(x * .007 + band) * 14 });
    }
    trace(mountain, contour).stroke({ color: band % 2 ? '#e1d9b8' : '#657f6c', alpha: .16, width: 1.5 });
  }
  // The lower mountain is exposed gorge rock, with a lighter lip at the water.
  const cliff = riverCourse.map(p => ({ x: p.x, y: p.y - 220 - Math.sin(p.x * .009) * 25 }));
  trace(mountain, [...cliff, ...upperBank.slice().reverse()]).closePath().fill({ color: '#657f73', alpha: .44 });
  trace(mountain, upperBank).stroke({ color: '#b7b8a0', width: 22, alpha: .85, cap: 'round', join: 'round' });
  for (let i = 4; i < riverCourse.length - 4; i += 3) {
    const p = riverCourse[i];
    trace(mountain, spline([[p.x - 28, p.y - 208], [p.x - 6, p.y - 163], [p.x + 9, p.y - 111]]))
      .stroke({ color: '#4e6b61', width: 2, alpha: .3 });
  }
  const water = new Graphics(); world.addChild(water);
  trace(water, riverCourse).stroke({ color: '#4b756e', width: 174, alpha: .4, cap: 'round', join: 'round' });
  trace(water, riverCourse).stroke({ color: '#7a9f95', width: 142, cap: 'round', join: 'round' });
  trace(water, riverCourse.map(p => ({ x: p.x, y: p.y - 20 }))).stroke({ color: '#b0bf9e', width: 62, alpha: .42, cap: 'round', join: 'round' });
  trace(water, riverCourse.map(p => ({ x: p.x, y: p.y + 42 }))).stroke({ color: '#658d84', width: 28, alpha: .45, cap: 'round', join: 'round' });
  for (let i = 5; i < riverCourse.length - 5; i += 3) {
    const p = riverCourse[i], side = i % 2 ? -1 : 1;
    rock(water, p.x + (noise(i + 21) - .5) * 34, p.y + side * (77 + noise(i) * 14), 5 + noise(i + 6) * 10, i);
  }
  for (const [x, size] of [[900, 16], [1730, 12], [3060, 18], [3265, 32], [3335, 12]]) {
    const y = yAt(riverCourse, x) + 9;
    water.ellipse(x - 6, y + 4, size * 1.8, size * .44).stroke({ color: '#e6e6c9', width: 2.4, alpha: .65 });
    rock(water, x, y, size, x);
  }
  world.addChild(movingWater);
  const opposite = new Graphics(); world.addChild(opposite);
  const lowerBank = riverCourse.map(p => ({ x: p.x, y: p.y + 103 }));
  trace(opposite, [...lowerBank, { x: 4400, y: 3000 }, { x: -900, y: 3000 }]).closePath().fill('#8ca18c');
  trace(opposite, lowerBank).stroke({ color: '#b8bba0', width: 17, alpha: .6, cap: 'round', join: 'round' });
  for (let i = 8; i < riverCourse.length - 5; i += 10) {
    const p = riverCourse[i];
    trace(opposite, spline([[p.x, p.y + 112], [p.x - 70, p.y + 200], [p.x + 30, p.y + 380], [p.x + 175, p.y + 600],
      [p.x - 115, p.y + 600], [p.x - 175, p.y + 250]])).closePath().fill({ color: '#617f72', alpha: .4 });
  }
  for (const [x, size] of [[650, 330], [1330, 375], [2260, 300], [3380, 330]]) {
    const base = yAt(riverCourse, x) + 480, summit = base - size;
    trace(opposite, spline([[x - size, base + 150], [x - size * .47, summit + 155], [x - 40, summit + 54],
      [x + 15, summit], [x + 84, summit + 85], [x + size * .62, summit + 180], [x + size, base + 150]]))
      .closePath().fill('#6e8a7b');
    trace(opposite, [{ x: x - 40, y: summit + 54 }, { x: x + 15, y: summit }, { x: x + 84, y: summit + 85 },
      { x: x + 37, y: summit + 70 }, { x: x + 24, y: summit + 98 }, { x: x - 4, y: summit + 64 }, { x: x - 58, y: summit + 101 }])
      .closePath().fill('#e1e7d7');
    trace(opposite, spline([[x + 15, summit + 30], [x + 47, summit + 165], [x + 165, base + 110]]))
      .stroke({ color: '#b9c4a6', alpha: .35, width: 7 });
  }
  const detail = new Graphics(); world.addChild(detail);
  const trailPoints = [...highRoad.points, ...riverBranch.points];
  for (let i = 0; i < 940; i++) {
    const x = 20 + noise(i + 10) * 3460, top = yAt(crest, x) + 75, bank = yAt(riverCourse, x) - 265;
    const y = mix(top, bank, noise(i + 600));
    const nearTrail = trailPoints.some(p => distance(p, { x, y }) < 22);
    if (nearTrail || y < top || y > bank) continue;
    if (i % 4 === 0) rock(detail, x, y, 3 + noise(i + 14) * 9, i);
    else shrub(detail, x, y, 4 + noise(i + 18) * 9, i);
  }
  // Small cultivated shelves around the lower village, rather than scattered lawn.
  for (let row = 0; row < 5; row++) {
    const x = 265 + row * 39, y = 1365 - row * 43;
    trace(detail, spline([[x - 55, y], [x + 1, y - 9], [x + 66, y - 2], [x + 53, y + 20], [x - 45, y + 24]]))
      .closePath().fill({ color: row % 2 ? '#b6bd8c' : '#929f77', alpha: .75 });
    detail.moveTo(x - 42, y + 23).quadraticCurveTo(x + 2, y + 8, x + 53, y + 19).stroke({ color: '#d1ceb0', width: 2, alpha: .7 });
  }
  const runnel = spline([[falls.x + 62, falls.y + 270], [falls.x + 110, falls.y + 355], [falls.x + 150, yAt(riverCourse, falls.x + 150) - 94]]);
  trace(detail, runnel).stroke({ color: '#a5beb0', width: 4, alpha: .75, cap: 'round' });
  trace(detail, WATERFALL).stroke({ color: '#607f76', width: 18, alpha: .27, cap: 'round' });
  trace(detail, WATERFALL).stroke({ color: '#deeadc', width: 8, alpha: .83, cap: 'round' });
  trace(detail, WATERFALL.map(p => ({ x: p.x - 2, y: p.y }))).stroke({ color: '#f0f1df', width: 2, alpha: .65 });
  drawPaths(detail);
  for (const [id, width, floors] of [['start', 40, 1], ['naxi', 51, 2], ['tea', 48, 2], ['halfway', 78, 2], ['tinas', 55, 2], ['teacher', 31, 1]] satisfies [PlaceId, number, number][]) building(detail, id, width, floors);
  const riverStop = place('river').point;
  trace(detail, [{ x: riverStop.x - 29, y: riverStop.y + 12 }, { x: riverStop.x + 31, y: riverStop.y + 12 }]).stroke({ color: '#86937c', width: 5, cap: 'round' });
  for (const dx of [-25, 0, 25]) detail.moveTo(riverStop.x + dx, riverStop.y + 13).lineTo(riverStop.x + dx, riverStop.y + 1).stroke({ color: '#667e6b', width: 2 });
  for (const [text, x, y, rotation] of [['哈巴雪山侧', 1650, 245, -.03], ['玉龙雪山侧', 2110, 1830, -.08], ['金沙江', 1565, 1575, -.13]] as const) {
    const label = new Text({ text, style: { fontFamily: 'Songti SC, STSong, serif', fontSize: text === '金沙江' ? 24 : 26, fill: '#f2efdc', letterSpacing: 5 } });
    label.position.set(x, y); label.rotation = rotation; label.alpha = .82; world.addChild(label);
  }
}
