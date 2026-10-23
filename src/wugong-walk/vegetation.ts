import { clamp, mix, smooth, type Landscape, type Point, type Trail, type WorldPoint } from './model';

type Color = readonly [number, number, number];
interface Cover { light: number; fog: number; forest: number; meadow: number; color: Color }
export type GroundMark =
  | { kind: 'canopy'; point: Point; depth: number; scale: number; shade: number; haze: number; variant: number }
  | { kind: 'tussock'; point: Point; depth: number; scale: number; shade: number; variant: number }
  | { kind: 'meadow'; points: readonly [Point, Point, Point]; depth: number; color: string; width: number }
  | { kind: 'stroke'; points: readonly [Point, Point, ...Point[]]; depth: number; color: string; width: number }
  | { kind: 'surface'; points: readonly [Point, Point, Point, ...Point[]]; depth: number; color: string };

export function randomSequence(seed: number): () => number {
  let n = seed >>> 0;
  return () => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return n / 4294967296; };
}
function hash(x: number, z: number): number {
  let n = Math.imul(x, 374761393) + Math.imul(z, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function noise(x: number, z: number): number {
  const i = Math.floor(x), j = Math.floor(z), u = smooth(x - i), v = smooth(z - j);
  return mix(mix(hash(i, j), hash(i + 1, j), u), mix(hash(i, j + 1), hash(i + 1, j + 1), u), v);
}
function blend(a: Color, b: Color, t: number): Color { return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]; }
function rgb(color: Color): string { return `rgb(${color.map(Math.round).join(',')})`; }

export function groundCover(x: number, z: number, height: number, hx: number, hz: number): Cover {
  const normal = Math.hypot(hx, hz, 1), upright = 1 / normal;
  const light = .21 + clamp((hx * .67 + .70 - hz * .22) / normal) * .79;
  const patch = noise(x * 3.1 + 8, z * 3.1 - 6), detail = noise(x * 21.7, z * 21.7);
  const treeLine = 1.15 + (patch - .5) * .30 + (noise(x * 7, z * 7) - .5) * .09;
  const forest = smooth((treeLine - height) / .24) * (.34 + .66 * smooth((upright - .19) / .46));
  const alpine = smooth((height - treeLine + .19) / .30);
  const meadow = alpine * smooth((upright - .13) / .52);
  const soil = smooth((upright - .10) / .46) * (.14 + alpine * .80);
  const rock: Color = [mix(45, 154, light), mix(69, 177, light), mix(91, 181, light)];
  const grass: Color = [mix(65, 171, light), mix(91, 183, light), mix(77, 129, light)];
  const gold: Color = [mix(84, 182, light), mix(101, 181, light), mix(77, 128, light)];
  const leaves: Color = [mix(37, 124, light), mix(63, 145, light), mix(64, 115, light)];
  const fog = clamp((-.25 - z) * .23, 0, .32);
  const sward = smooth((noise(x * 9.4 + z * .7, z * 5.8) - .25) / .55);
  const ground = blend(blend(rock, blend(grass, gold, sward * .27 + smooth((patch - .40) / .46) * .14), soil), leaves, forest * .94);
  const grain = (detail - .5) * (forest * 8 + meadow * 3) + Math.sin(x * 215 + z * 168) * .32;
  const color = blend(ground, [169, 189, 191], fog);
  return { light, fog, forest, meadow, color: [color[0] + grain, color[1] + grain, color[2] + grain] };
}

export function createGroundMarks(landscape: Landscape, trail: Trail): GroundMark[] {
  const random = randomSequence(17102642), marks: GroundMark[] = [];
  const roadCells = new Set<string>(), roadCell = .018;
  for (let d = 0; d <= trail.length; d += 1.5) {
    const p = trail.sampleWorld(d), x = Math.floor(p.x / roadCell), z = Math.floor(p.z / roadCell);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) roadCells.add(`${x + i}:${z + j}`);
  }
  const nearRoad = (p: WorldPoint) => roadCells.has(`${Math.floor(p.x / roadCell)}:${Math.floor(p.z / roadCell)}`);
  const { data } = landscape, step = .044;
  for (let gz = data.zMin; gz < data.zMax; gz += step) for (let gx = data.xMin; gx < data.xMax; gx += step) {
    const x = gx + random() * step, z = gz + random() * step;
    const column = Math.round(clamp((x - data.xMin) / (data.xMax - data.xMin)) * (data.columns - 1));
    if (z < data.horizon[column] + .025) continue;
    if (nearRoad({ x, z })) continue;
    const h = landscape.height(x, z), hx = (landscape.height(x + .014, z) - landscape.height(x - .014, z)) / .028;
    const hz = (landscape.height(x, z + .014) - landscape.height(x, z - .014)) / .028;
    const cover = groundCover(x, z, h, hx, hz), point = landscape.project({ x, z });
    const depth = z * .975 - x * .222;
    if (cover.forest > .22 && random() < cover.forest * .91) {
      marks.push({ kind: 'canopy', point, depth, scale: (.68 + random() * .51) * clamp(.88 + z * .07, .73, 1.14), shade: Math.round(cover.light * 7), haze: Math.round(cover.fog * 5), variant: Math.floor(random() * 6) });
    } else if (cover.meadow > .18 && random() < .20 + cover.meadow * .77) {
      const norm = Math.max(.01, Math.hypot(hx, hz)), tx = hz / norm, tz = -hx / norm;
      const breadth = .006 + random() * .009;
      const middle = landscape.project(landscape.onSurface({ x: x + tx * breadth, z: z + tz * breadth }));
      const end = landscape.project(landscape.onSurface({ x: x + tx * breadth * 2, z: z + tz * breadth * 2 }));
      const tint: Color = random() < .56 ? [193, 198, 143] : [62, 91, 73];
      marks.push({ kind: 'meadow', points: [point, middle, end], depth, color: rgb(blend(cover.color, tint, .10 + random() * .09)), width: .35 + random() * .38 });
      const density = noise(x * 14 + 3, z * 11 - 2);
      const count = density > .63 ? 7 : density > .35 ? 4 : 2;
      for (let tuft = 0; tuft < count; tuft++) {
        const root = landscape.onSurface({ x: x + (random() - .5) * .038, z: z + (random() - .5) * .038 });
        if (nearRoad(root)) continue;
        const scale = tuft === 0 ? .15 + random() * .13 + density * .04 : .065 + random() * .10;
        marks.push({ kind: 'tussock', point: landscape.project(root), depth: root.z * .975 - root.x * .222, scale, shade: Math.round(cover.light * 7), variant: Math.floor(random() * 8) });
      }
    }
  }
  marks.push(...ridgeDetails(landscape, trail, nearRoad));
  marks.push(...trailsideDetails(landscape, trail));
  return marks.sort((a, b) => a.depth - b.depth);
}

function trailsideDetails(landscape: Landscape, trail: Trail): GroundMark[] {
  const marks: GroundMark[] = [], random = randomSequence(17101927);
  const depth = (p: WorldPoint) => p.z * .975 - p.x * .222;
  for (let d = 8; d < trail.length - 6; d += 3.1) {
    if (Math.abs(d - trail.campTravel) < 13) continue;
    const p = trail.sampleWorld(d), a = trail.sampleWorld(d - 1.6), b = trail.sampleWorld(d + 1.6);
    const norm = Math.max(.0001, Math.hypot(b.x - a.x, b.z - a.z));
    const nx = -(b.z - a.z) / norm, nz = (b.x - a.x) / norm;
    for (const side of [-1, 1]) {
      const offset = (.008 + random() * .008) * side;
      const root = landscape.onSurface({ x: p.x + nx * offset, z: p.z + nz * offset });
      const screen = landscape.project(root), h = landscape.height(root.x, root.z);
      const hx = (landscape.height(root.x + .012, root.z) - landscape.height(root.x - .012, root.z)) / .024;
      const hz = (landscape.height(root.x, root.z + .012) - landscape.height(root.x, root.z - .012)) / .024;
      const cover = groundCover(root.x, root.z, h, hx, hz), size = .001 + random() * .0022;
      if (random() < .64) {
        const corners = [[-1, -.3], [-.35, -1], [1, -.2], [.7, 1], [-.5, .9]].map(([x, z]) => landscape.onSurface({ x: root.x + x * size, z: root.z + z * size }));
        const points = corners.map(landscape.project), shade = depth(root) + .002;
        marks.push({ kind: 'surface', points: [points[0], points[1], points[2], points[3], points[4]], depth: shade, color: rgb(blend(cover.color, [158, 168, 151], .45)) });
        marks.push({ kind: 'stroke', points: [points[0], points[1], points[2]], depth: shade + .001, color: '#d7d8bca0', width: .32 });
      }
      if (cover.meadow > .20) {
        marks.push({ kind: 'tussock', point: screen, depth: depth(root) + .003, scale: .16 + random() * .14, shade: Math.round(cover.light * 7), variant: Math.floor(random() * 8) });
        if (random() < .22) {
          const a = landscape.onSurface({ x: root.x + nx * .003, z: root.z + nz * .003 });
          const shoulder = landscape.onSurface({ x: root.x + nx * .007 + (b.x - p.x) * .3, z: root.z + nz * .007 + (b.z - p.z) * .3 });
          const c = landscape.onSurface({ x: root.x - nx * .003, z: root.z - nz * .003 });
          marks.push({ kind: 'surface', points: [landscape.project(a), landscape.project(shoulder), landscape.project(c)], depth: depth(root), color: rgb(blend(cover.color, [154, 145, 113], .18)) });
        }
      } else if (cover.forest > .30 && random() < .32) {
        marks.push({ kind: 'canopy', point: screen, depth: depth(root), scale: .19 + random() * .15, shade: Math.round(cover.light * 7), haze: Math.round(cover.fog * 5), variant: Math.floor(random() * 6) });
      }
    }
  }
  return marks;
}

function ridgeDetails(landscape: Landscape, trail: Trail, nearRoad: (point: WorldPoint) => boolean): GroundMark[] {
  const marks: GroundMark[] = [], random = randomSequence(17101781);
  const depth = (p: WorldPoint) => p.z * .975 - p.x * .222;
  function stroke(a: WorldPoint, b: WorldPoint, c: WorldPoint, color: string, width: number): void {
    if ([a, b, c].some(nearRoad)) return;
    const p = landscape.onSurface(a), q = landscape.onSurface(b), r = landscape.onSurface(c);
    marks.push({ kind: 'stroke', points: [landscape.project(p), landscape.project(q), landscape.project(r)], depth: Math.max(depth(p), depth(q), depth(r)), color, width });
  }
  for (let gx = -.80; gx < .80; gx += .027) for (let gz = -.94; gz < 1.14; gz += .027) {
    const p = { x: gx + random() * .027, z: gz + random() * .027 };
    if (landscape.onSurface(p).z > p.z || nearRoad(p)) continue;
    const h = landscape.height(p.x, p.z);
    if (h < 1.06) continue;
    const hx = (landscape.height(p.x + .025, p.z) - landscape.height(p.x - .025, p.z)) / .05;
    const hz = (landscape.height(p.x, p.z + .025) - landscape.height(p.x, p.z - .025)) / .05;
    const cover = groundCover(p.x, p.z, h, hx, hz), norm = Math.max(.01, Math.hypot(hx, hz));
    const tx = hz / norm, tz = -hx / norm, length = .009 + random() * .017;
    const edge = smooth((.82 - Math.abs(p.x)) / .15) * smooth((1.16 - p.z) / .28);
    if (random() > edge * .85) continue;
    if (cover.meadow > .23) {
      const q = { x: p.x + tx * length, z: p.z + tz * length }, r = { x: q.x + tx * length, z: q.z + tz * length };
      stroke(p, q, r, rgb(blend(cover.color, random() > .4 ? [185, 193, 133] : [76, 106, 76], .22)), .35 + random() * .25);
      if (random() < cover.meadow * .40) {
        const root = landscape.project(p), height = 1.0 + random() * 1.3;
        for (let blade = 0; blade < 3; blade++) {
          const x = root.x + (blade - 1) * .6;
          marks.push({ kind: 'stroke', points: [{ x, y: root.y }, { x: x + .25, y: root.y - height * .6 }, { x: x + .6 + (blade - 1) * .6, y: root.y - height }], depth: depth(p), color: blade === 1 ? '#bcc48b72' : '#738d6470', width: .30 });
        }
      }
    } else if (Math.hypot(hx, hz) > .8 && random() < .70) {
      const q = { x: p.x + tx * length, z: p.z + tz * length }, r = { x: q.x + tx * length * .65 - hx / norm * .005, z: q.z + tz * length * .65 - hz / norm * .005 };
      stroke(p, q, r, cover.light > .58 ? '#c4cec078' : '#4e6e7050', .30 + random() * .30);
      if (random() < .35) {
        const a = landscape.project(p), b = landscape.project(q), c = landscape.project({ x: q.x - hx / norm * .008, z: q.z - hz / norm * .008 });
        marks.push({ kind: 'surface', points: [a, b, c], depth: Math.max(depth(p), depth(q)), color: cover.light > .58 ? '#b3c1b72e' : '#3c606426' });
      }
    }
  }
  for (let channel = 0; channel < 30; channel++) {
    const x = -.71 + channel / 29 * 1.42 + (random() - .5) * .02, crest = landscape.crest(x);
    let p = landscape.onSurface({ x, z: crest.z + .085 + random() * .12 });
    for (let step = 0; step < 65; step++) {
      const hx = (landscape.height(p.x + .012, p.z) - landscape.height(p.x - .012, p.z)) / .024;
      const hz = (landscape.height(p.x, p.z + .012) - landscape.height(p.x, p.z - .012)) / .024;
      const norm = Math.hypot(hx, hz);
      if (norm < .28 || p.z > 1.1 || Math.abs(p.x) > .82 || landscape.height(p.x, p.z) < 1.05) break;
      const q = { x: p.x - hx / norm * .009, z: p.z - hz / norm * .009 }, r = { x: p.x - hx / norm * .018, z: p.z - hz / norm * .018 };
      if (landscape.onSurface(r).z > r.z || landscape.height(r.x, r.z) > landscape.height(p.x, p.z) + .002) break;
      stroke(p, q, r, '#3459611b', .34 + step / 65 * .25);
      const offset = { x: hz / norm * .0022, z: -hx / norm * .0022 };
      stroke({ x: p.x + offset.x, z: p.z + offset.z }, { x: q.x + offset.x, z: q.z + offset.z }, { x: r.x + offset.x, z: r.z + offset.z }, '#c3d0bd22', .25);
      p = r;
    }
  }
  for (let d = trail.campTravel + 4; d < trail.length - 4; d += 4.5) {
    const p = trail.sampleWorld(d), a = trail.sampleWorld(d - 1), b = trail.sampleWorld(d + 1), norm = Math.max(.0001, Math.hypot(b.x - a.x, b.z - a.z));
    const side = random() > .5 ? 1 : -1, offset = .017 + random() * .015;
    const root = landscape.onSurface({ x: p.x - (b.z - a.z) / norm * offset * side, z: p.z + (b.x - a.x) / norm * offset * side });
    const size = .003 + random() * .004;
    const q = landscape.onSurface({ x: root.x + size, z: root.z - size * .4 }), r = landscape.onSurface({ x: root.x + size * .7, z: root.z + size * .8 });
    marks.push({ kind: 'surface', points: [landscape.project(root), landscape.project(q), landscape.project(r)], depth: Math.max(depth(root), depth(q), depth(r)), color: random() > .5 ? '#9aa994b0' : '#c3cbb0c0' });
  }
  return marks;
}

const meadowShapes = Array.from({ length: 8 }, (_, variant) => {
  const random = randomSequence(17102671 + variant * 97);
  return Array.from({ length: 9 }, (_, i) => ({
    root: (i - 4) * .85 + (random() - .5) * .8,
    spread: (i - 4) * 1.4 + (random() - .5) * 4,
    height: 7 + random() * 10 + (i > 2 && i < 6 ? 3 : 0),
    width: .35 + random() * .5,
    seedHead: i === 3 && variant % 3 === 0,
  }));
});
const meadowColors = Array.from({ length: 8 }, (_, shade) => {
  const light = shade / 7;
  return {
    shadow: rgb([mix(60, 109, light), mix(86, 135, light), mix(64, 91, light)]),
    leaf: rgb([mix(76, 142, light), mix(103, 159, light), mix(69, 104, light)]),
    tip: rgb([mix(107, 182, light), mix(124, 186, light), mix(78, 126, light)]),
    straw: rgb([mix(122, 187, light), mix(130, 178, light), mix(84, 117, light)]),
  };
});

export function drawMeadowTuft(ctx: CanvasRenderingContext2D, shade: number, variant: number, wind = 0): void {
  const blades = meadowShapes[variant], colors = meadowColors[shade];
  ctx.save(); ctx.globalAlpha *= .88; ctx.lineCap = 'round';
  ctx.strokeStyle = colors.shadow; ctx.lineWidth = .65;
  ctx.beginPath(); ctx.moveTo(-4, .7); ctx.quadraticCurveTo(0, 1.2, 4.5, .3); ctx.stroke();
  for (const [i, blade] of blades.entries()) {
    const { root, height, spread, width } = blade, bend = wind * height / 16;
    const tip = root + spread + bend;
    ctx.fillStyle = i % 4 === 0 ? colors.straw : i % 3 === 0 ? colors.tip : i % 2 ? colors.leaf : colors.shadow;
    ctx.beginPath(); ctx.moveTo(root - width * .5, .5);
    ctx.bezierCurveTo(root + spread * .18 + bend * .18 - width, -height * .3, tip - .6, -height * .85, tip, -height);
    ctx.bezierCurveTo(tip - .25, -height * .65, root + spread * .15 + bend * .10 + width, -height * .26, root + width * .5, .5);
    ctx.closePath(); ctx.fill();
    if (blade.seedHead) {
      ctx.strokeStyle = colors.straw; ctx.lineWidth = .4;
      ctx.beginPath(); ctx.moveTo(tip, -height + .5); ctx.lineTo(tip + .6, -height - 3); ctx.stroke();
      for (let grain = 0; grain < 4; grain++) {
        const x = tip + .2 + grain * .12, y = -height - grain * .7;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (grain % 2 ? .9 : -.8), y - .6); ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function foliagePath(seed: number): Path2D {
  const random = randomSequence(seed), points: Point[] = [];
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2, radius = .84 + random() * .19;
    points.push({ x: Math.cos(a) * radius, y: Math.sin(a) * radius });
  }
  const path = new Path2D();
  for (let i = 0; i < points.length; i++) {
    const a = points[(i + points.length - 1) % points.length], b = points[i], c = points[(i + 1) % points.length], d = points[(i + 2) % points.length];
    if (i === 0) path.moveTo(b.x, b.y);
    path.bezierCurveTo(b.x + (c.x - a.x) / 6, b.y + (c.y - a.y) / 6, c.x - (d.x - b.x) / 6, c.y - (d.y - b.y) / 6, c.x, c.y);
  }
  path.closePath(); return path;
}

function foliage(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, light: number, fog: number, seed: number): void {
  const random = randomSequence(seed), path = foliagePath(seed);
  const air: Color = [169, 189, 191];
  const shade = blend([mix(39, 95, light), mix(64, 121, light), mix(64, 98, light)], air, fog);
  const base = blend([mix(49, 128, light), mix(77, 147, light), mix(69, 113, light)], air, fog);
  const lit = blend([mix(70, 151, light), mix(94, 163, light), mix(78, 123, light)], air, fog);
  ctx.save(); ctx.translate(x, y); ctx.scale(rx, ry);
  const wash = ctx.createLinearGradient(-.6, -.8, .5, .8); wash.addColorStop(0, rgb(lit)); wash.addColorStop(.52, rgb(base)); wash.addColorStop(1, rgb(shade));
  ctx.fillStyle = wash; ctx.fill(path); ctx.clip(path);
  for (let i = 0; i < 11; i++) {
    const px = -.95 + random() * 1.9, py = -.9 + random() * 1.7;
    ctx.globalAlpha = .15 + random() * .13;
    ctx.fillStyle = i % 3 ? rgb(lit) : rgb(shade);
    ctx.beginPath(); ctx.ellipse(px, py, .13 + random() * .24, .055 + random() * .14, -.25, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawCanopy(ctx: CanvasRenderingContext2D, shade: number, haze: number, variant: number): void {
  const light = shade / 7, fog = haze / 5;
  ctx.fillStyle = 'rgba(28,55,49,.10)'; ctx.beginPath(); ctx.ellipse(2.4, 1.4, 8.2, 2.5, -.2, 0, Math.PI * 2); ctx.fill();
  foliage(ctx, -.5, -3.1, 8.6, 5.2, light, fog, 152 + variant * 31);
  foliage(ctx, -3.1, -5.2, 4.4, 3.2, light + .035, fog, 398 + variant * 17);
}

export function drawTree(ctx: CanvasRenderingContext2D, variant: number): void {
  const random = randomSequence(7813 + variant * 53), height = 43 + random() * 12;
  ctx.fillStyle = '#244a3f1c'; ctx.beginPath(); ctx.ellipse(6, 2, 18, 3.4, -.2, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#737f69'; ctx.beginPath(); ctx.moveTo(-2.1, 1); ctx.lineTo(-1, -height * .73); ctx.lineTo(1.1, -height * .73); ctx.lineTo(2.6, .2); ctx.closePath(); ctx.fill();
  ctx.lineCap = 'round'; ctx.lineWidth = 1.35; ctx.strokeStyle = '#7e8a70';
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.bezierCurveTo(1, -18, -7, -23, -9, -height * .68); ctx.moveTo(0, -19); ctx.quadraticCurveTo(5, -23, 9, -height * .77); ctx.stroke();
  const clumps: readonly [number, number, number, number][] = [
    [8, -.56, 13, 10], [-10, -.65, 14, 11], [9, -.78, 12, 10], [-5, -.86, 14, 12], [0, -.58, 12, 8],
  ];
  for (const [i, clump] of clumps.entries()) {
    foliage(ctx, clump[0] + (random() - .5) * 5, height * clump[1], clump[2] * (.83 + random() * .22), clump[3], .57 + i * .035, 0, 610 + variant * 89 + i * 37);
  }
  ctx.strokeStyle = '#b4b49080'; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(-.65, -2); ctx.lineTo(-.4, -14); ctx.stroke();
  ctx.strokeStyle = '#6e8a5e80'; ctx.lineWidth = .8;
  ctx.beginPath(); ctx.moveTo(-5, 1); ctx.quadraticCurveTo(-7, -1, -6, -4); ctx.moveTo(4, 1); ctx.quadraticCurveTo(6, -2, 8, -4); ctx.stroke();
}
