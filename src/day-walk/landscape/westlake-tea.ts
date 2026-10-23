import type { Graphics } from 'pixi.js';
import type { DayTrail } from '../../journey/day-route';
import type { Point2D } from '../../runtime/projection';
import { clearOfPath, trailSection } from './ground';
import { line, noise, polygon, roundedLand, tree } from './primitives';

/** Across the hill (u), then down its face (v): land and planting share this surface. */
function slopePoint(u: number, v: number): Point2D {
  const arch = Math.sin(u * Math.PI);
  return {
    x: 1440 + u * 1810 + v * 105,
    y: 650 - arch * 470 + v * (485 + arch * 180) + v * v * 50,
  };
}

function contour(from: number, to: number, v: number): Point2D[] {
  const count = Math.ceil((to - from) * 100);
  return Array.from({ length: count + 1 }, (_, i) => slopePoint(from + (to - from) * i / count, v));
}

function face(from: number, to: number, top: number, bottom: number): Point2D[] {
  return [...contour(from, to, top), ...contour(from, to, bottom).reverse()];
}

export function drawTeaSlope(terrain: Graphics, planting: Graphics, trail: DayTrail, streams: readonly (readonly Point2D[])[]): void {
  roundedLand(terrain, face(0, 1, 0, 1.12), '#b4c799');
  polygon(terrain, face(.65, 1, 0, 1.12), '#8eab7e', .24);
  polygon(terrain, face(0, 1, .76, 1.12), '#8fa879', .19);
  line(terrain, contour(.05, .93, .02), '#dbe1b5', 5, .3);
  for (const v of [.19, .4, .61, .82, 1.04]) line(terrain, contour(.04, .97, v), '#8ca77b', 2, .17);

  const village = trail.sample(trail.length);
  const canPlant = (p: Point2D): boolean =>
    clearOfPath(p, trail.points, 29)
    && streams.every(stream => clearOfPath(p, stream, 44))
    && Math.hypot((p.x - village.x - 20) / 220, (p.y - village.y - 65) / 215) > 1;

  for (let row = 0; row < 22; row++) {
    const v = .065 + row * .043;
    const divisions = [
      [.07 + Math.sin(row * .36) * .018, .32 + Math.sin(v * 3) * .025],
      [.35 + Math.sin(v * 3) * .025, .64 - v * .025],
      [.67 - v * .025, .95 - Math.sin(row * .27) * .025],
    ];
    for (const [from, to] of divisions) {
      let section: number[] = [];
      const drawSection = () => {
        if (section.length > 1) {
          line(planting, section.map(u => slopePoint(u, v + .015)), '#708c60', 14 + v * 3, .42);
          line(planting, section.map(u => slopePoint(u, v)), row % 3 === 0 ? '#7c9c62' : '#73945e', 12 + v * 3);
          line(planting, section.map(u => slopePoint(u, v - .006)), '#aec68a', 3.5 + v, .85);
        }
        section = [];
      };
      const count = Math.ceil((to - from) * 120);
      for (let i = 0; i <= count; i++) {
        const u = from + (to - from) * i / count, p = slopePoint(u, v);
        if (canPlant(p)) section.push(u); else drawSection();
      }
      drawSection();
      for (let u = from + .012; u < to - .009; u += .027) {
        const p = slopePoint(u, v - .005);
        if (canPlant(p)) planting.ellipse(p.x + noise(row + u * 100) * 3, p.y, 2.7, 1.2)
          .fill({ color: '#d0dda0', alpha: .65 });
      }
    }
  }

  const lane = trailSection(trail, trail.knotDistances[8], trail.knotDistances[13]);
  line(terrain, lane, '#c3caa3', 31, .68);
  for (let at = trail.knotDistances[9]; at < trail.knotDistances[12]; at += 68) {
    const edge = trailSection(trail, at, at + 20, 20);
    line(terrain, edge, '#809570', 3.5, .38);
  }
}

/** A denser forest lip ends at the bend; the normal follow camera reveals the garden beyond it. */
export function drawForestOpening(g: Graphics, trail: DayTrail, streams: readonly (readonly Point2D[])[]): void {
  const trees = [
    [1195, 1060, 136], [1290, 958, 142], [1370, 831, 126], [1480, 748, 130], [1625, 775, 156],
    [1800, 1280, 144], [1870, 1175, 126], [1960, 1090, 112],
  ];
  for (const [i, [x, y, size]] of trees.entries()) {
    const crown = { x, y: y - size * .65 };
    if (!clearOfPath(crown, trail.points, size * .5 + 65)
      || streams.some(stream => !clearOfPath(crown, stream, size * .5 + 24))) continue;
    tree(g, x, y, size, false, i % 2);
  }
  const bend = trail.knotDistances[8];
  for (let i = 0; i < 8; i++) {
    const p = trail.sample(bend - 95 + i * 24);
    g.ellipse(p.x - 25, p.y + 23, 10 + noise(i + 31) * 9, 4)
      .fill({ color: '#c8d3a6', alpha: .3 });
  }
}
