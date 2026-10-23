import { Container, Graphics } from 'pixi.js';
import type { DayTrail } from '../../journey/day-route';
import type { Point2D } from '../../runtime/projection';
import { curve } from '../../journey/geometry';
import { line, noise, roundedLand } from './primitives';
import { crossingStones, grove, landscapeLayers, points, ridge, rock, trailPoint, walkingPath, watercourse, waystone } from './ground';
import type { LandscapeEffects } from './effects';
import { drawMoganPath } from './mogan-path';
import { MoganWeather } from './mogan-weather';
import { StreamMotion } from './stream-motion';

export function drawMogan(world: Container, trail: DayTrail): LandscapeEffects {
  const { back, terrain, water, planting, road, sites } = landscapeLayers(world);
  const currents = new Graphics(), waterStones = new Graphics(), sunlight = new Graphics();
  const nearBamboo = new Container(), waterDrops = new Graphics(), wetStones = new Graphics();
  world.addChildAt(sunlight, world.getChildIndex(water));
  world.addChildAt(currents, world.getChildIndex(planting));
  world.addChildAt(waterStones, world.getChildIndex(planting));
  world.addChildAt(nearBamboo, world.getChildIndex(road));
  world.addChildAt(waterDrops, world.getChildIndex(road));
  world.addChildAt(wetStones, world.getChildIndex(sites));
  ridge(back, points([[-1800, 630], [-700, 280], [50, 430], [700, 170], [1330, 365], [2100, 150], [2850, 310], [3800, 220], [5000, 590]]), '#bccdc0');
  ridge(terrain, points([[-1500, 1080], [-440, 620], [180, 755], [610, 420], [1120, 310], [1630, 530], [2130, 290], [2680, 580], [3500, 420], [4500, 1000]]), '#a4ba9b');
  ridge(terrain, points([[-1000, 1480], [-90, 1080], [450, 875], [760, 650], [1080, 450], [1310, 625], [1550, 745], [1750, 610], [2070, 460], [2450, 730], [2920, 1000], [4000, 1350]]), '#92ad86');

  // Two slopes meet at the saddle; the trail climbs the west face and descends east.
  roundedLand(terrain, points([[-500, 1680], [160, 1180], [620, 900], [1080, 455], [1210, 920], [940, 1260], [720, 1800], [40, 2180]]), '#b2c399');
  roundedLand(terrain, points([[1080, 460], [1300, 625], [1550, 745], [1460, 1100], [1250, 1500], [940, 1830], [720, 1800], [940, 1260], [1210, 920]]), '#789a79');
  roundedLand(terrain, points([[1550, 745], [1780, 610], [2070, 460], [2180, 850], [2540, 1120], [2710, 1560], [2090, 1900], [1760, 1280]]), '#aec095');
  roundedLand(terrain, points([[2070, 470], [2460, 730], [2990, 1030], [3590, 1410], [3420, 2240], [2710, 1560], [2540, 1120], [2180, 850]]), '#839f7e');

  for (let i = 0; i < 6; i++) {
    terrain.moveTo(-250 + i * 26, 1520 + i * 100)
      .bezierCurveTo(240 + i * 18, 1190 + i * 91, 600 + i * 38, 1250 + i * 48, 1070 + i * 38, 730 + i * 112)
      .stroke({ color: '#d0d7b2', width: 3, alpha: .29 });
    terrain.moveTo(2085 + i * 30, 720 + i * 115)
      .bezierCurveTo(2280, 1090 + i * 85, 2880, 1020 + i * 110, 3320, 1490 + i * 86)
      .stroke({ color: '#617f69', width: 3, alpha: .22 });
  }
  for (const [x, y, dx] of [[870, 870, -440], [1250, 1160, -190], [1910, 950, 290], [2600, 1120, 500]]) {
    terrain.moveTo(x, y).bezierCurveTo(x + dx * .2, y + 130, x + dx * .65, y + 250, x + dx, y + 520)
      .stroke({ color: '#6b8c71', width: 20, alpha: .12 });
  }

  ridge(terrain, points([[-1200, 2290], [-180, 1790], [420, 1900], [880, 1730], [1310, 1640], [1770, 1850], [2130, 1910], [2590, 1690], [3150, 1830], [4150, 1730]]), '#a2b58b');
  for (let i = 0; i < 5; i++) {
    terrain.moveTo(-200, 1950 + i * 90).bezierCurveTo(620, 2190 + i * 35, 1030, 1610 + i * 120, 1910, 2100 + i * 80)
      .stroke({ color: '#d3d7b4', width: 3, alpha: .2 });
  }

  const pass = trail.sample(trail.knotDistances[8]), streamAt = trail.knotDistances[13], stream = trail.sample(streamAt);
  roundedLand(terrain, points([[pass.x - 110, pass.y + 20], [pass.x - 65, pass.y - 36], [pass.x + 35, pass.y - 34], [pass.x + 120, pass.y + 30], [pass.x + 30, pass.y + 60]]), '#c5cba7');
  const creek = curve(points([[2240, 950], [2320, 1050], [2370, 1160], [stream.x, stream.y], [2540, 1440], [2770, 1660], [2920, 1920], [3400, 2260]]), 14);
  const tributary = curve(points([[3100, 1120], [2850, 1280], [2710, 1480], [2540, 1440]]), 14);
  line(terrain, creek, '#628574', 110, .16);
  line(terrain, creek, '#b1c7ab', 67, .5);
  watercourse(water, creek, 23, false); watercourse(water, tributary, 12, false);
  const pool = { x: 2540, y: 1440 };
  roundedLand(water, points([[2505, 1409], [2540, 1412], [2578, 1439], [2570, 1470], [2537, 1465], [2505, 1442]]), '#88ada4');
  roundedLand(water, points([[2518, 1422], [2542, 1420], [2566, 1439], [2555, 1456], [2537, 1453], [2514, 1440]]), '#b7cdb8');
  const rapids: Point2D[] = [stream];
  for (let i = 8; i < creek.length - 6; i += 11) {
    const p = creek[i], stone = { x: p.x + (i % 2 ? 19 : -19), y: p.y + 4 };
    rock(waterStones, stone.x, stone.y, 14 + noise(i) * 8, true); rapids.push(stone);
  }

  roundedLand(planting, points([[180, 1430], [280, 1050], [600, 790], [960, 570], [1150, 730], [1060, 1090], [780, 1330], [460, 1580]]), '#618d64', .18);
  roundedLand(planting, points([[1120, 1170], [1320, 1000], [1440, 1050], [1400, 1380], [1080, 1600], [880, 1550]]), '#5a8060', .19);
  roundedLand(planting, points([[1810, 930], [1990, 700], [2210, 880], [2290, 1110], [2170, 1190], [1980, 1080]]), '#668c64', .17);

  const groves = [
    [-100, 1430, 220, 230], [320, 1130, 230, 180], [610, 800, 220, 145], [960, 620, 180, 125],
    [980, 1390, 200, 170], [1210, 1130, 145, 170], [1460, 1390, 180, 180], [1720, 980, 180, 140],
    [2010, 750, 230, 150], [2210, 960, 185, 180], [2580, 1000, 250, 150], [2820, 1260, 200, 140],
    [320, 1770, 250, 130], [750, 1940, 230, 150], [1230, 1760, 230, 170], [1800, 1700, 240, 170],
    [2280, 1540, 180, 130], [2920, 1830, 230, 160], [3220, 1560, 230, 200],
  ];
  for (const [i, [x, y, width, height]] of groves.entries()) {
    grove(planting, trail, { x, y, width, height, seed: i + 71, count: 10 }, i % 5 === 4 ? 'woodland' : 'bamboo', [creek, tributary]);
  }
  for (let i = 0; i < 14; i++) {
    const at = trail.length * (i + .5) / 14, p = trailPoint(trail, at, i % 2 ? -125 : 150);
    grove(planting, trail, { ...p, width: 105, height: 70, seed: i + 100, count: 6 }, i > 9 ? 'woodland' : 'bamboo', [creek, tributary]);
  }

  const crossing = { at: streamAt, halfLength: 33 };
  walkingPath(road, trail, 'stone', [crossing]);
  crossingStones(sites, trail, crossing);
  drawMoganPath(trail, road, sites, wetStones, sunlight);
  for (const knot of [0, 8, 14]) waystone(sites, trail.sample(trail.knotDistances[knot]), knot === 14 ? -1 : 1);
  for (let i = 0; i < 22; i++) {
    const p = trailPoint(trail, trail.length * (i + .5) / 22, i % 2 ? 32 : -31);
    rock(sites, p.x, p.y, 8 + noise(i + 4) * 12, true);
  }
  sites.roundRect(pass.x - 69, pass.y + 28, 43, 9, 3).fill('#9caa8c');
  sites.roundRect(pass.x - 68, pass.y + 24, 43, 7, 3).fill('#c3c9aa');
  const weather = new MoganWeather({ waterDrops, wetStones, sunlight, plants: nearBamboo, ground: planting, trail, streams: [creek, tributary] });
  const flow = new StreamMotion(currents, { streams: [
    { points: creek, width: 23, rapids },
    { points: tributary, width: 12, rapids: [] },
  ], pools: [{ center: pool, radius: 48 }] });
  return { paint(frame) { weather.paint(frame); flow.paint(frame); } };
}
