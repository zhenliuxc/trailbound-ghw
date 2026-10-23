const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSync } = require('esbuild');
const { Container } = require('pixi.js');

const code = buildSync({
  stdin: { contents: 'export { drawLandscape } from "./src/day-walk/landscape"; export { DayTrail } from "./src/journey/day-route"; export { DAY_ROUTES } from "./src/content/day-routes";', resolveDir: process.cwd() },
  bundle: true, write: false, format: 'cjs', external: ['pixi.js'],
}).outputFiles[0].text;

class Graphics extends Container {
  strokes = []; path = [];
  moveTo(x, y) { this.path = [{ x, y }]; return this; }
  lineTo(x, y) { this.path.push({ x, y }); return this; }
  stroke(style) { this.strokes.push({ ...style, points: [...this.path] }); this.path = []; return this; }
  fill() { this.path = []; return this; }
  poly() { return this; }
  rect() { return this; }
  roundRect() { return this; }
  ellipse() { return this; }
  quadraticCurveTo() { return this; }
  bezierCurveTo() { return this; }
  closePath() { return this; }
}
const box = { exports: {} };
new Function('module', 'exports', 'require', code)(box, box.exports, id => {
  assert.equal(id, 'pixi.js'); return { Graphics, Container };
});
const { drawLandscape, DayTrail, DAY_ROUTES } = box.exports;

function intersectionAt(a, b, c, d) {
  const rx = b.x - a.x, ry = b.y - a.y, sx = d.x - c.x, sy = d.y - c.y;
  const cross = rx * sy - ry * sx;
  if (Math.abs(cross) < .00001) return null;
  const t = ((c.x - a.x) * sy - (c.y - a.y) * sx) / cross;
  const u = ((c.x - a.x) * ry - (c.y - a.y) * rx) / cross;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? t : null;
}

for (const [id, crossingKnots] of [['mogan', [13]], ['westlake', [5, 7]]]) {
  test(`${id}: streams cross the walked trail only at its paved stepping stones`, () => {
    const world = new Container(), trail = new DayTrail(DAY_ROUTES[id]);
    drawLandscape(world, trail.route, trail);
    const strokes = node => [...(node.strokes || []), ...node.children.flatMap(strokes)];
    const channels = strokes(world).filter(stroke => stroke.color === '#8caeaa');
    const crossings = [];
    for (const channel of channels) {
      for (let i = 1; i < trail.points.length; i++) for (let j = 1; j < channel.points.length; j++) {
        const t = intersectionAt(trail.points[i - 1], trail.points[i], channel.points[j - 1], channel.points[j]);
        if (t !== null) crossings.push(trail.lengths[i - 1] + t * (trail.lengths[i] - trail.lengths[i - 1]));
      }
    }
    for (const at of crossings) assert.ok(crossingKnots.some(knot => Math.abs(trail.knotDistances[knot] - at) < 20), `unprotected stream at ${at.toFixed(1)}`);
    for (const knot of crossingKnots) assert.ok(crossings.some(at => Math.abs(trail.knotDistances[knot] - at) < 2), `missing crossing at knot ${knot}`);
  });
}
