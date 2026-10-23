import { type Container, Graphics } from 'pixi.js';
import type { Point2D } from '../../runtime/projection';
import type { DayTrail } from '../../journey/day-route';
import { curve } from '../../journey/geometry';
import { line, noise, polygon, roundedLand } from './primitives';
import { crossingStones, grove, landscapeLayers, points, ridge, rock, trailPoint, walkingPath, watercourse, waystone } from './ground';
import type { LandscapeEffects } from './effects';
import { drawForestOpening, drawTeaSlope } from './westlake-tea';
import { StreamMotion } from './stream-motion';

function villageHouse(g: Graphics, x: number, y: number, width: number): void {
  g.ellipse(x + 7, y + 7, width * .7, width * .17).fill({ color: '#607b64', alpha: .14 });
  g.rect(x - width * .48, y - 33, width * .96, 34).fill('#e7dfc7');
  polygon(g, points([[x + width * .48, y - 33], [x + width * .68, y - 45], [x + width * .68, y - 10], [x + width * .48, y + 1]]), '#b8bea8');
  polygon(g, points([[x - width * .6, y - 32], [x - width * .28, y - 54], [x + width * .43, y - 54], [x + width * .61, y - 31]]), '#6c817a');
  polygon(g, points([[x + width * .43, y - 54], [x + width * .61, y - 31], [x + width * .8, y - 43], [x + width * .61, y - 62]]), '#5f736c');
  line(g, points([[x - width * .57, y - 31], [x + width * .6, y - 30]]), '#a3ae95', 2);
  for (let i = 0; i < 4; i++) line(g, points([[x - width * .24 + i * width * .17, y - 51], [x - width * .4 + i * width * .23, y - 35]]), '#899b8a', 1.1, .7);
  g.rect(x - 7, y - 23, 14, 24).fill('#78816b');
  for (const side of [-1, 1]) g.rect(x + side * width * .29 - 4, y - 23, 8, 10).fill('#9da994');
}

export function drawWestlake(world: Container, trail: DayTrail): LandscapeEffects {
  const { back, terrain, water, planting, road, sites } = landscapeLayers(world);
  const currents = new Graphics(), waterStones = new Graphics();
  world.addChildAt(currents, world.getChildIndex(planting));
  world.addChildAt(waterStones, world.getChildIndex(planting));
  ridge(back, points([[-1500, 580], [-500, 270], [100, 360], [630, 110], [1250, 270], [1860, 90], [2460, 150], [3100, 75], [4300, 450]]), '#bdcfc0');
  ridge(terrain, points([[-1200, 1110], [-150, 500], [430, 635], [820, 340], [1320, 430], [1800, 300], [2350, 90], [2820, 160], [3670, 400]]), '#9eb897');
  roundedLand(terrain, points([[-1000, 1200], [-80, 610], [430, 630], [820, 345], [1080, 560], [1240, 980], [980, 1260], [430, 1610], [-800, 1910]]), '#a9bf97');
  roundedLand(terrain, points([[820, 345], [1080, 560], [1240, 980], [980, 1260], [430, 1610], [620, 1080], [880, 820]]), '#829f80');
  roundedLand(terrain, points([[1720, 1100], [2170, 880], [2700, 1040], [3300, 780], [3910, 1330], [3630, 2170], [2350, 1950], [2010, 1590]]), '#a3ba8d');
  roundedLand(terrain, points([[2170, 880], [2310, 1210], [2010, 1590], [2350, 1950], [1830, 2220], [1600, 1560], [1720, 1100]]), '#89a680');
  roundedLand(terrain, points([[-500, 2270], [330, 1840], [560, 1530], [860, 1370], [1170, 1110], [1350, 820], [1680, 710], [1990, 830], [2050, 1020], [1710, 1250], [1610, 1510], [1180, 1730], [1020, 2090], [640, 2490]]), '#d0dabc');
  for (let i = 0; i < 6; i++) {
    terrain.moveTo(-130, 1020 + i * 99).bezierCurveTo(290, 860 + i * 110, 640, 880 + i * 65, 870, 600 + i * 72)
      .stroke({ color: '#d7dfbb', width: 3, alpha: .26 });
    terrain.moveTo(2270, 1170 + i * 77).bezierCurveTo(2580, 1260 + i * 102, 2870, 1030 + i * 93, 3420, 1230 + i * 100)
      .stroke({ color: '#6b8b6c', width: 2.8, alpha: .18 });
  }
  ridge(terrain, points([[-1300, 2360], [-250, 1840], [210, 1970], [700, 2240], [1260, 1900], [1830, 1780], [2210, 2130], [2920, 1860], [4100, 2010]]), '#a5bd94');

  const start = trail.sample(0);
  const bank = (knot: number, dx: number, dy: number): Point2D => {
    const p = trail.sample(trail.knotDistances[knot]); return { x: p.x + dx, y: p.y + dy };
  };
  const anchors = [bank(0, 85, 120), bank(2, 30, 90), bank(4, 70, 110), bank(5, 140, 80), bank(6, 210, 60), bank(8, 110, 130), bank(9, 90, 80)];
  const creek = curve([...points([[210, 2430], [350, 2080], [start.x + 62, start.y + 240]]), ...anchors], 14);
  watercourse(water, creek, 34, false);
  const crossings = [5, 7].map(knot => ({ at: trail.knotDistances[knot], halfLength: 29 }));
  const tributaries = crossings.map((crossing, i) => curve([
    trailPoint(trail, crossing.at, -260), trailPoint(trail, crossing.at, -95), trail.sample(crossing.at),
    trailPoint(trail, crossing.at, 55), anchors[i === 0 ? 3 : 4],
  ], 16));
  const eastBranch = curve([bank(9, 500, 350), bank(9, 350, 190), bank(9, 210, 145), anchors[anchors.length - 1]], 14);
  const streams = [creek, ...tributaries, eastBranch];
  for (const branch of [...tributaries, eastBranch]) watercourse(water, branch, 17, false);
  roundedLand(water, points([[start.x + 24, start.y + 65], [start.x + 108, start.y + 42], [start.x + 196, start.y + 112],
    [start.x + 168, start.y + 182], [start.x + 58, start.y + 199], [start.x - 12, start.y + 134]]), '#8fb5ad');
  roundedLand(water, points([[start.x + 36, start.y + 78], [start.x + 106, start.y + 59], [start.x + 176, start.y + 115],
    [start.x + 145, start.y + 164], [start.x + 55, start.y + 172], [start.x + 7, start.y + 130]]), '#b1d0bf');
  const rapids: Point2D[] = [];
  for (let i = 6; i < creek.length - 6; i += 9) {
    const p = creek[i], stone = { x: p.x + (i % 2 ? -22 : 22), y: p.y + 3 };
    rock(waterStones, stone.x, stone.y, 12 + noise(i + 11) * 9, true);
    rapids.push(stone);
  }

  drawTeaSlope(terrain, planting, trail, streams);

  const woodland = [
    [-140, 1550, 270, 260], [180, 1120, 230, 160], [470, 960, 220, 170], [750, 720, 190, 130],
    [1020, 900, 190, 180], [1100, 1170, 180, 145], [470, 1450, 175, 175], [660, 1860, 240, 140],
    [900, 1710, 170, 170], [1260, 1630, 190, 150], [1510, 1390, 140, 140], [1790, 1560, 210, 200],
    [1920, 1250, 180, 170], [2190, 1420, 240, 190], [2630, 1500, 250, 210], [3010, 1220, 290, 200],
    [1220, 580, 180, 120], [1450, 640, 170, 110], [1940, 210, 170, 100], [3180, 610, 210, 150],
    [1130, 2140, 240, 160], [1850, 1980, 240, 170], [2600, 2040, 300, 180],
  ];
  for (const [i, [x, y, width, height]] of woodland.entries()) {
    grove(planting, trail, { x, y, width, height, count: 14, seed: i + 220 }, 'woodland', streams);
  }
  drawForestOpening(planting, trail, streams);

  const village = trail.sample(trail.length);
  roundedLand(terrain, points([[village.x - 150, village.y - 25], [village.x + 40, village.y - 100], [village.x + 210, village.y + 30],
    [village.x + 190, village.y + 200], [village.x - 80, village.y + 230], [village.x - 160, village.y + 95]]), '#d4d6b8');
  for (const [dx, dy] of [[-100, 25], [85, -5], [-115, 115], [-30, 175], [100, 115], [180, 85]]) {
    line(sites, curve([village, { x: village.x + dx * .5, y: village.y + dy * .6 }, { x: village.x + dx, y: village.y + dy }], 8), '#c1c6ab', 10);
    villageHouse(sites, village.x + dx, village.y + dy, 55 + noise(dx + dy) * 18);
  }
  walkingPath(road, trail, 'earth', crossings);
  for (const crossing of crossings) crossingStones(sites, trail, crossing);
  for (const knot of [0, 10, 14]) waystone(sites, trail.sample(trail.knotDistances[knot]), -1);
  for (let i = 0; i < 20; i++) {
    const p = trailPoint(trail, trail.length * (i + .5) / 20, i % 2 ? -25 : 29);
    rock(sites, p.x, p.y, 7 + noise(i + 1) * 9, true);
  }
  return new StreamMotion(currents, { streams: [
    { points: [...creek].reverse(), width: 34, rapids },
    ...tributaries.map((branch, i) => ({ points: branch, width: 17, rapids: [trail.sample(crossings[i].at)] })),
    { points: eastBranch, width: 17, rapids: [] },
  ], pools: [{ center: { x: start.x + 98, y: start.y + 124 }, radius: 115 }] });
}
