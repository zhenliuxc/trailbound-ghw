import { Container, Graphics } from 'pixi.js';
import { curve, type Point } from '../wugong-walk/model';
import { CAMP_IDS, CREST, PLACES, path, surfaceCrest } from './geography';

const noise = (i: number) => { const n = Math.sin(i * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
const polygon = (g: Graphics, points: readonly Point[], color: string, alpha = 1) => {
  points.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath().fill({ color, alpha });
};
function ridge(g: Graphics, points: readonly Point[], color: string): void {
  polygon(g, [...curve(points, 10), { x: 11000, y: 7000 }, { x: -5000, y: 7000 }], color);
}
function pine(g: Graphics, x: number, y: number, size: number, aspect: number, color: string): void {
  const h = size * 4 / aspect;
  g.moveTo(x, y - h).quadraticCurveTo(x - size * .55, y - h * .48, x - size, y - h * .26)
    .lineTo(x - size * .5, y - h * .29).quadraticCurveTo(x - size, y - h * .12, x - size * 1.35, y)
    .quadraticCurveTo(x, y + size * .45 / aspect, x + size * 1.3, y)
    .quadraticCurveTo(x + size, y - h * .16, x + size * .5, y - h * .29).lineTo(x + size, y - h * .26)
    .quadraticCurveTo(x + size * .55, y - h * .48, x, y - h).closePath().fill({ color, alpha: .72 });
  g.moveTo(x, y).lineTo(x, y + 3 / aspect).stroke({ color: '#6a7f6c', width: 1, alpha: .65 });
}
function tent(g: Graphics, p: Point, aspect: number): void {
  const x = p.x - 37, y = p.y + 18 / aspect;
  g.ellipse(x, y + 2 / aspect, 42, 12 / aspect).fill({ color: '#75876e', alpha: .18 });
  polygon(g, [{ x: x - 36, y }, { x: x - 9, y: y - 32 / aspect }, { x: x + 17, y }], '#b89d73');
  polygon(g, [{ x: x - 9, y: y - 32 / aspect }, { x: x + 26, y: y - 28 / aspect }, { x: x + 48, y }, { x: x + 17, y }], '#d7bd89');
  polygon(g, [{ x: x - 24, y }, { x: x - 9, y: y - 22 / aspect }, { x: x + 7, y }], '#647a6a');
}

export function landscape(world: Container, aspect: number, scale: number): void {
  const g = new Graphics(); world.addChild(g);
  const far = [
    [-4500, 950], [-1200, 1100], [0, 700], [850, 680], [1450, 320], [2100, 540], [2850, 280],
    [3550, 460], [4200, 180], [4800, 260], [5400, 450], [6000, 500], [6900, 920], [11000, 950],
  ].map(([x, y]) => ({ x, y }));
  ridge(g, far, '#c1cfce');
  ridge(g, far.map(p => ({ x: p.x + 230, y: p.y + 190 })), '#aebfc0');
  ridge(g, CREST, '#d9dfd5');

  ridge(g, CREST.map((p,i) => ({ x: p.x, y: p.y + 360 + noise(i+230)*190 })), '#a7b8ad');
  const massifs = [
    { id: 'aoshan', width: 560 }, { id: 'maijie', width: 490 }, { id: 'feiji', width: 520 },
    { id: 'pyramid', width: 580 }, { id: 'taibailiang', width: 620 }, { id: 'wanxian', width: 510 }, { id: 'baxian', width: 690 },
  ] satisfies { id: keyof typeof PLACES; width: number }[];
  for (const [i, massif] of massifs.entries()) {
    const p = { x: PLACES[massif.id].x, y: surfaceCrest(PLACES[massif.id].x) }, w = massif.width, foot = p.y + 1180;
    g.moveTo(p.x, p.y).bezierCurveTo(p.x + w*.08, p.y + 170, p.x + w*.45, p.y + 390, p.x + w*.35, p.y + 590)
      .bezierCurveTo(p.x + w*.2, p.y + 800, p.x + w*.7, foot - 80, p.x + w*.65, foot)
      .quadraticCurveTo(p.x - w*.1, foot + 120, p.x - w*.5, foot + 220)
      .bezierCurveTo(p.x - w*.55, p.y + 760, p.x - w*.2, p.y + 270, p.x, p.y)
      .closePath().fill({ color: i%2 ? '#95aaa5' : '#aabcb5', alpha: .6 });
    g.moveTo(p.x, p.y + 4).bezierCurveTo(p.x - w*.12, p.y + 110, p.x - w*.2, p.y + 260, p.x - w*.3, p.y + 375)
      .quadraticCurveTo(p.x - w*.2, p.y + 350, p.x - w*.15, p.y + 330)
      .quadraticCurveTo(p.x - w*.23, p.y + 520, p.x - w*.32, p.y + 670)
      .bezierCurveTo(p.x - w*.1, p.y + 500, p.x + w*.1, p.y + 230, p.x, p.y + 4)
      .closePath().fill({ color: '#edf0e6', alpha: .86 });
    g.moveTo(p.x + w*.2, p.y + 270).bezierCurveTo(p.x + w*.36, p.y + 440, p.x + w*.23, p.y + 600, p.x + w*.45, p.y + 860)
      .stroke({ color: '#6c8a84', width: 2, alpha: .2 });
    g.moveTo(p.x - w*.35, p.y + 490).quadraticCurveTo(p.x - w*.42, p.y + 680, p.x - w*.6, p.y + 840)
      .stroke({ color: '#e2e8dd', width: 5, alpha: .5 });
  }
  for (const id of ['shuiwo', 'camp2800', 'dashihe'] as const) {
    const p = PLACES[id];
    g.moveTo(p.x - 60, p.y - 5).bezierCurveTo(p.x + 10, p.y + 310, p.x - 240, p.y + 470, p.x - 90, p.y + 850)
      .bezierCurveTo(p.x - 160, p.y + 650, p.x + 330, p.y + 1100, p.x + 200, p.y + 1380)
      .lineTo(p.x + 500, p.y + 1440).bezierCurveTo(p.x + 450, p.y + 1030, p.x + 90, p.y + 510, p.x + 35, p.y)
      .closePath().fill({ color: '#72928b', alpha: .32 });
    g.moveTo(p.x + 12, p.y + 180).bezierCurveTo(p.x - 70, p.y + 420, p.x + 80, p.y + 520, p.x + 30, p.y + 680)
      .quadraticCurveTo(p.x + 15, p.y + 800, p.x + 140, p.y + 1020).stroke({ color: '#c5d5c8', width: 3.5, alpha: .55 });
  }
  ridge(g, [{ x: -4500, y: 2700 }, { x: 300, y: 2200 }, { x: 1100, y: 2050 }, { x: 1700, y: 2350 }, { x: 2550, y: 1940 }, { x: 3400, y: 2180 }, { x: 4200, y: 2110 }, { x: 5100, y: 1980 }, { x: 6300, y: 2220 }, { x: 11000, y: 2700 }], '#9bac9f');

  for (let i = 0; i < 3450; i++) {
    const x = -500 + noise(i * 3 + 5) * 7600, depth = 60 + noise(i + 70) * 1590;
    const y = surfaceCrest(x) + depth, size = 2.5 + noise(i + 8) * 7;
    const forest = depth > 540 || x < 880 && depth > 170 || x > 5500 && depth > 140 || x > 2650 && x < 2900 && depth > 140;
    if (forest) {
      pine(g, x, y, size, aspect, i % 3 ? '#5e7f76' : '#7e9789');
      if (i%3===0) { const h=size*4/aspect; g.moveTo(x-size*.75,y-h*.55).quadraticCurveTo(x,y-h*.68,x+size*.65,y-h*.52).stroke({color:'#e4e9de',width:1.8,alpha:.84}); }
      if (i%13===0) g.ellipse(x+size*3,y+size, size*5,size*1.5/aspect).fill({color:'#e4e8dd',alpha:.48});
    }
    else {
      const sy = size / aspect;
      polygon(g, [{ x, y: y - sy }, { x: x + size, y: y - sy * .2 }, { x: x + size * .65, y: y + sy * .5 }, { x: x - size, y: y + sy * .2 }], i % 3 ? '#b0bcb4' : '#7d938e', .63);
      if (i % 4 === 0) g.moveTo(x - size, y).lineTo(x, y - sy).lineTo(x + size * .6, y - sy * .5).stroke({ color: '#f1f1e5', width: 2, alpha: .65 });
    }
  }
  // Sparse high-ridge snow, never a white or blue blanket over the valley.
  for (const id of ['aoshan', 'maijie', 'feiji', 'pyramid', 'taibailiang', 'wanxian', 'baxian'] as const) {
    const p = PLACES[id], y = surfaceCrest(p.x);
    g.moveTo(p.x - 19, y + 43).quadraticCurveTo(p.x + 3, y + 4, p.x + 22, y + 29)
      .lineTo(p.x + 42, y + 70).lineTo(p.x + 12, y + 56).lineTo(p.x + 2, y + 73)
      .lineTo(p.x - 7, y + 53).closePath().fill({ color: '#e7e8d8', alpha: .85 });
  }
  const lake = PLACES.dayehai;
  g.ellipse(lake.x - 37, lake.y + 9, 35, 17 / aspect).fill('#698f90');
  g.ellipse(lake.x - 39, lake.y + 5, 27, 10 / aspect).fill('#cbded9');
  for (const id of CAMP_IDS) tent(g, PLACES[id], aspect);

  const trail = new Graphics(); world.addChild(trail);
  const width = Math.max(5.5, Math.min(16, 1.9 / scale));
  const walkingEnd = path.at('xiaban');
  for (const color of ['#607c75', '#c7cec3']) {
    path.points.forEach((p, i) => { if (path.lengths[i] <= walkingEnd) i ? trail.lineTo(p.x, p.y) : trail.moveTo(p.x, p.y); });
    trail.stroke({ color, width: color === '#607c75' ? width + 3 : width, alpha: color === '#607c75' ? .55 : .96, cap: 'round', join: 'round' });
  }
  for (let at = 20; at < walkingEnd; at += 31 + noise(at) * 17) {
    const p = path.sample(at), heading = path.heading(at);
    trail.moveTo(p.x, p.y).lineTo(p.x + Math.cos(heading) * 3, p.y + Math.sin(heading) * 3).stroke({ color: '#8b9987', width: 1, alpha: .65 });
  }
  // A separate dotted connection denotes transport out of the scenic area.
  for (let at = walkingEnd; at < path.length; at += 24) {
    const a = path.sample(at), b = path.sample(Math.min(path.length, at + 11));
    trail.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({ color: '#6f928f', width: width * .8, alpha: .9, cap: 'round' });
  }
  const tower = PLACES.aoshan, h = 32 / aspect;
  trail.moveTo(tower.x - 11, tower.y - 14 / aspect).lineTo(tower.x, tower.y - h - 14 / aspect).lineTo(tower.x + 11, tower.y - 14 / aspect)
    .moveTo(tower.x - 7, tower.y - h * .6 - 14 / aspect).lineTo(tower.x + 7, tower.y - h * .6 - 14 / aspect)
    .stroke({ color: '#667a70', width: 2 });
}
