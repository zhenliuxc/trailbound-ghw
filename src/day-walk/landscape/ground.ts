import { Container, Graphics } from 'pixi.js';
import type { Point2D } from '../../runtime/projection';
import type { DayTrail } from '../../journey/day-route';
import { line, noise, polygon, roundedLand, tree } from './primitives';
import { bambooClump } from './bamboo';

export const points = (pairs: readonly (readonly [number, number])[]): Point2D[] => pairs.map(([x, y]) => ({ x, y }));

export function landscapeLayers(world: Container) {
  const back = new Graphics(), terrain = new Graphics(), water = new Graphics();
  const planting = new Graphics(), road = new Graphics(), sites = new Graphics();
  world.addChild(back, terrain, water, planting, road, sites);
  back.rect(-4000, -3000, 11000, 8500).fill('#dbe5df');
  return { back, terrain, water, planting, road, sites };
}

/** A continuous hillside extends below its ridge, without an exposed oval base. */
export function ridge(g: Graphics, crest: readonly Point2D[], color: string): void {
  g.moveTo(-8000, crest[0].y).lineTo(crest[0].x, crest[0].y);
  for (let i = 0; i < crest.length - 1; i++) {
    const p = crest[i], next = crest[i + 1];
    g.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2);
  }
  const last = crest.at(-1)!;
  g.lineTo(last.x, last.y).lineTo(10000, last.y).lineTo(10000, 8000).lineTo(-8000, 8000).closePath().fill(color);
}

export function rock(g: Graphics, x: number, y: number, size: number, moss = false): void {
  g.ellipse(x + size * .12, y + size * .17, size * .7, size * .23).fill({ color: '#526d60', alpha: .14 });
  roundedLand(g, [
    { x: x - size * .67, y: y + size * .12 }, { x: x - size * .42, y: y - size * .42 },
    { x: x + size * .1, y: y - size * .6 }, { x: x + size * .58, y: y - size * .2 },
    { x: x + size * .72, y: y + size * .2 },
  ], '#9ba894');
  polygon(g, [{ x: x - size * .53, y: y - size * .03 }, { x: x - size * .32, y: y - size * .35 },
    { x: x + size * .12, y: y - size * .48 }, { x: x + size * .42, y: y - size * .21 }, { x, y }], '#c4c9ad', .9);
  if (moss) g.ellipse(x - size * .23, y - size * .2, size * .3, size * .1).fill({ color: '#7f9868', alpha: .8 });
}

export function trailPoint(trail: DayTrail, at: number, offset = 0): Point2D {
  const p = trail.sample(at), heading = trail.heading(at);
  return { x: p.x - Math.sin(heading) * offset, y: p.y + Math.cos(heading) * offset };
}

export function trailSection(trail: DayTrail, from: number, to: number, offset = 0): Point2D[] {
  const count = Math.max(2, Math.ceil((to - from) / 18));
  return Array.from({ length: count + 1 }, (_, i) => trailPoint(trail, from + (to - from) * i / count, offset));
}

export function clearOfPath(p: Point2D, path: readonly Point2D[], radius: number): boolean {
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i], dx = b.x - a.x, dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / Math.max(1, dx * dx + dy * dy)));
    if (Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t) < radius) return false;
  }
  return true;
}

export type Grove = { x: number; y: number; width: number; height: number; count: number; seed: number };
export function grove(g: Graphics, trail: DayTrail, patch: Grove, kind: 'bamboo' | 'woodland', waterways: readonly (readonly Point2D[])[] = []): void {
  const { x, y, width, height, count, seed } = patch;
  roundedLand(g, Array.from({ length: 11 }, (_, i) => {
    const angle = i / 11 * Math.PI * 2, r = .81 + noise(seed * 31 + i) * .2;
    return { x: x + Math.cos(angle) * width * r, y: y + Math.sin(angle) * height * r };
  }), kind === 'bamboo' ? '#729570' : '#739278', .17);
  const plants = Array.from({ length: count }, (_, i) => ({
    x: x + (noise(seed * 13 + i) - .5) * width * 1.8,
    y: y + (noise(seed * 27 + i) - .5) * height * 1.55,
    size: (kind === 'bamboo' ? 73 : 48) + noise(seed * 19 + i) * 35, seed: seed * 17 + i,
  })).sort((a, b) => a.y - b.y);
  for (const plant of plants) {
    const crown = { x: plant.x, y: plant.y - plant.size * .4 };
    const clearance = kind === 'bamboo' ? plant.size * .62 : plant.size * .45;
    if (!clearOfPath(crown, trail.points, clearance + 25)
      || waterways.some(path => !clearOfPath(crown, path, (kind === 'bamboo' ? plant.size * .62 : plant.size * .38) + 24))) continue;
    if (kind === 'bamboo') {
      g.ellipse(plant.x, plant.y + 3, plant.size * .42, plant.size * .11).fill({ color: '#4b6f58', alpha: .14 });
      bambooClump(g, plant.x, plant.y, plant.size, plant.seed);
    }
    else tree(g, plant.x, plant.y, plant.size, false, plant.seed % 2);
  }
}

export function watercourse(g: Graphics, points: readonly Point2D[], width: number, highlights = true): void {
  line(g, points, '#9eaf98', width + 12, .65);
  line(g, points, '#8caeaa', width);
  line(g, points, '#b5cec0', width * .64);
  if (highlights) for (let i = 3; i < points.length - 2; i += 8) {
    const a = points[i], b = points[i + 1];
    line(g, [{ x: a.x + 2, y: a.y - 2 }, { x: b.x + 2, y: b.y - 2 }], '#edf0dc', 2, .65);
  }
}

export interface TrailCrossing { readonly at: number; readonly halfLength: number }
export function walkingPath(g: Graphics, trail: DayTrail, surface: 'stone' | 'earth', crossings: readonly TrailCrossing[] = []): void {
  let from = 0;
  for (const crossing of [...crossings, { at: trail.length, halfLength: 0 }]) {
    const path = trailSection(trail, from, crossing.at - crossing.halfLength);
    line(g, path, '#8f9b83', 14, .62);
    line(g, path, surface === 'stone' ? '#c8cbaf' : '#d6d4b5', 8);
    from = crossing.at + crossing.halfLength;
  }
  for (let at = 14, i = 0; at < trail.length; at += 31, i++) {
    if (crossings.some(crossing => Math.abs(at - crossing.at) < crossing.halfLength + 10)) continue;
    const p = trailPoint(trail, at, (i % 2 ? -1 : 1) * (15 + noise(i + 7) * 7));
    g.ellipse(p.x, p.y, 2 + noise(i) * 3, 1.6).fill({ color: '#879779', alpha: .55 });
    if (i % 6 === 0) rock(g, p.x, p.y + 8, 9, true);
  }
}

export function crossingStones(g: Graphics, trail: DayTrail, crossing: TrailCrossing): void {
  const count = Math.ceil(crossing.halfLength * 2 / 11);
  for (let i = 0; i <= count; i++) {
    const p = trail.sample(crossing.at - crossing.halfLength + crossing.halfLength * 2 * i / count);
    g.ellipse(p.x + 1.5, p.y + 2.2, 7.5, 5.5).fill('#718f83');
    g.ellipse(p.x, p.y, 7.8, 5.2).fill('#d1d2b7');
    g.moveTo(p.x - 4, p.y - 1.3).lineTo(p.x + 2, p.y - 2.3).stroke({ color: '#eff0dc', width: 1.4 });
  }
}

export function waystone(g: Graphics, p: Point2D, side = 1): void {
  const x = p.x + 27 * side, y = p.y - 10;
  g.ellipse(x + 3, y + 4, 12, 4).fill({ color: '#687e65', alpha: .12 });
  g.moveTo(x, y).lineTo(x, y - 35).stroke({ color: '#7d8665', width: 4, cap: 'round' });
  polygon(g, [{ x: x - 11, y: y - 33 }, { x: x + 10, y: y - 33 }, { x: x + 17, y: y - 27 }, { x: x + 10, y: y - 22 }, { x: x - 11, y: y - 22 }], '#b7b58e');
}
