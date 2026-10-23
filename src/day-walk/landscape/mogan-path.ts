import type { Graphics } from 'pixi.js';
import type { DayTrail } from '../../journey/day-route';
import type { Point2D } from '../../runtime/projection';
import { rock, trailPoint, trailSection } from './ground';
import { line, noise, polygon, roundedLand } from './primitives';

function stoneSlab(g: Graphics, wet: Graphics, trail: DayTrail, at: number, seed: number): void {
  const p = trail.sample(at), heading = trail.heading(at), dx = Math.cos(heading), dy = Math.sin(heading);
  const width = 6 + noise(seed) * 2.4, depth = 4.2 + noise(seed + 7) * 1.4;
  const onStone = (across: number, along: number): Point2D => ({ x: p.x - dy * across + dx * along, y: p.y + dx * across + dy * along });
  const surface = [onStone(-width, -depth), onStone(width * .9, -depth * .85), onStone(width, depth), onStone(-width * .85, depth * .9)];
  polygon(g, surface.map(point => ({ x: point.x + 1.5, y: point.y + 2.5 })), '#728776', .72);
  polygon(g, surface, seed % 2 ? '#bbc4a7' : '#c9cbb1');
  line(g, [surface[0], surface[1]], '#e0dfc2', 1.5, .8);
  line(g, [surface[2], onStone(width * .45, depth)], '#819768', 2.3, .8);
  line(wet, [onStone(-width * .65, -depth * .2), onStone(width * .45, depth * .12)], '#edf0d8', 1.6, .48);
}

export function drawMoganPath(trail: DayTrail, road: Graphics, sites: Graphics, wet: Graphics, sunlight: Graphics): void {
  // Small flights leave broad landings at bends; the walking curve remains their centerline.
  const flights = [
    { start: trail.knotDistances[3] + 42, count: 4 },
    { start: trail.knotDistances[4] + 35, count: 5 },
    { start: trail.knotDistances[5] + 55, count: 4 },
    { start: trail.knotDistances[6] + 40, count: 5 },
    { start: trail.knotDistances[9] + 44, count: 4 },
  ];
  for (const [f, flight] of flights.entries()) {
    for (let i = 0; i < flight.count; i++) stoneSlab(road, wet, trail, flight.start + i * 17, f * 13 + i);
    for (let i = 0; i < 7; i++) {
      const p = trailPoint(trail, flight.start + i * 11, 24 + noise(i + f) * 3);
      rock(sites, p.x, p.y, 8 + noise(i * 3 + f) * 4, true);
    }
  }
  for (const knot of [4, 6, 8, 10]) {
    const at = trail.knotDistances[knot];
    const landing = [trailPoint(trail, at - 16, -8), trailPoint(trail, at + 18, -8), trailPoint(trail, at + 20, 10), trailPoint(trail, at - 14, 10)];
    roundedLand(road, landing, '#bec7a9');
    line(road, trailSection(trail, at - 14, at + 17), '#dadac0', 1.7, .35);
  }
  for (let i = 0; i < 28; i++) {
    const at = trail.knotDistances[1] + (trail.knotDistances[12] - trail.knotDistances[1]) * i / 28;
    const side = i % 2 ? 1 : -1, p = trailPoint(trail, at, side * (18 + noise(i) * 16));
    const radius = 5 + noise(i + 44) * 5;
    wet.ellipse(p.x, p.y + 2, radius + 2, radius * .35).fill({ color: '#658b83', alpha: .27 });
    wet.moveTo(p.x - radius * .5, p.y).quadraticCurveTo(p.x, p.y + 2, p.x + radius * .6, p.y - .5)
      .stroke({ color: '#e2e7ca', width: 1.2, alpha: .48 });
    if (i % 3 === 0) {
      sites.moveTo(p.x + 10, p.y + 3).quadraticCurveTo(p.x + 16, p.y - 5, p.x + 25, p.y - 5)
        .quadraticCurveTo(p.x + 20, p.y + 3, p.x + 10, p.y + 3).fill({ color: '#83966b', alpha: .75 });
      sites.moveTo(p.x - 9, p.y + 5).quadraticCurveTo(p.x - 16, p.y - 2, p.x - 20, p.y)
        .quadraticCurveTo(p.x - 17, p.y + 8, p.x - 9, p.y + 5).fill({ color: '#9eaa79', alpha: .7 });
    }
  }
  for (let i = 0; i < 18; i++) {
    const at = trail.knotDistances[7] + (trail.knotDistances[14] - trail.knotDistances[7]) * i / 18;
    const p = trailPoint(trail, at, i % 2 ? -45 : 42), size = 18 + noise(i + 3) * 21;
    roundedLand(sunlight, [
      { x: p.x - size, y: p.y + 9 }, { x: p.x - size * .2, y: p.y - 7 },
      { x: p.x + size * .8, y: p.y - 11 }, { x: p.x + size, y: p.y + 1 },
      { x: p.x + size * .2, y: p.y + 9 },
    ], '#e4e5b8', .23);
  }
}
