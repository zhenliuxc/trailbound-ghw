import type { Graphics } from 'pixi.js';
import type { Point2D } from '../../runtime/projection';
import { noise } from './primitives';

function leaf(g: Graphics, root: Point2D, tip: Point2D, width: number, color: string): void {
  const dx = tip.x - root.x, dy = tip.y - root.y, length = Math.hypot(dx, dy);
  const nx = -dy / length * width, ny = dx / length * width;
  g.moveTo(root.x, root.y)
    .quadraticCurveTo(root.x + dx * .43 + nx, root.y + dy * .43 + ny, tip.x, tip.y)
    .quadraticCurveTo(root.x + dx * .55 - nx * .6, root.y + dy * .55 - ny * .6, root.x, root.y)
    .fill(color);
}

/** Returns a visible leaf tip in the same coordinates, for rain beads and falling drops. */
export function bambooClump(g: Graphics, x: number, y: number, height: number, seed: number): Point2D {
  let dropTip: Point2D = { x, y: y - height };
  const stalks = height >= 120 ? 5 : 3, middle = (stalks - 1) / 2;
  for (let stalk = 0; stalk < stalks; stalk++) {
    const bx = x + (stalk - middle) * height * .095;
    const h = height * (.76 + noise(seed + stalk) * .24), top = y - h;
    const lean = (stalk - middle) * height * .055 + (noise(seed * 3 + stalk) - .5) * height * .06;
    const width = height * (.022 + noise(seed + stalk * 2) * .008);
    g.moveTo(bx, y).quadraticCurveTo(bx, y - h * .5, bx + lean, top)
      .stroke({ color: stalk % 2 ? '#4e7857' : '#638b5c', width, cap: 'round' });
    g.moveTo(bx - width * .22, y - 2).quadraticCurveTo(bx - width * .22, y - h * .5, bx + lean - width * .22, top + 2)
      .stroke({ color: '#bac99a', width: width * .25, alpha: .8 });
    for (let node = 1; node < 6; node++) {
      const t = node / 6, sx = bx + lean * t * t, sy = y - h * t;
      g.moveTo(sx - width * .6, sy).lineTo(sx + width * .6, sy)
        .stroke({ color: '#d0d6aa', width: Math.max(1, height * .009), alpha: .85 });
      g.moveTo(sx - width * .55, sy + 1.5).lineTo(sx + width * .5, sy + 1.5)
        .stroke({ color: '#4d7251', width: .9, alpha: .7 });
    }
    for (let branch = 0; branch < 3; branch++) {
      const side = (stalk + branch) % 2 ? 1 : -1, t = .85 - branch * .2;
      const sx = bx + lean * t * t, sy = y - h * t;
      const span = side * height * (.2 + noise(seed + branch) * .055), rise = height * .07;
      g.moveTo(sx, sy).quadraticCurveTo(sx + span * .4, sy - rise, sx + span, sy - rise)
        .stroke({ color: '#688657', width: Math.max(1, height * .009), alpha: .85 });
      for (let blade = 0; blade < 5; blade++) {
        const along = .2 + blade * .16;
        const root = { x: sx + span * along, y: sy - rise * along * (2 - along) };
        const tip = {
          x: root.x + side * height * (.11 + blade * .012),
          y: root.y + height * (blade % 2 ? .11 : -.095),
        };
        leaf(g, root, tip, height * (.025 + noise(seed + blade) * .009),
          branch === 0 ? blade % 2 ? '#99b677' : '#83a367' : blade % 2 ? '#72965f' : '#5d8459');
        if (stalk === stalks - 1 && branch === 1 && blade === 3) dropTip = tip;
      }
    }
  }
  return dropTip;
}
