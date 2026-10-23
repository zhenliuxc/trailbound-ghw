import { Container, FillGradient, Graphics } from 'pixi.js';
import { clamp, curve, type Point } from '../model';
import type { EnvironmentFrame } from '../environment';
import { SCROLL, type ScrollTrail } from './route';
import type { ScrollJourney } from './journey';

type Coordinate = readonly [number, number];

function line(graphics: Graphics, points: readonly Point[]): Graphics {
  graphics.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) graphics.lineTo(point.x, point.y);
  return graphics;
}

function shape(points: readonly Coordinate[], color: string, alpha = 1): Graphics {
  const outline = curve(points.map(([x, y]) => ({ x, y })), 10);
  return line(new Graphics(), outline).closePath().fill({ color, alpha });
}

/** A reusable vector map. Terrain and walking use the same world coordinates. */
export class SchematicMap {
  readonly ground = new Container();
  readonly subjects = new Container({ sortableChildren: true });
  readonly lights = new Container();
  private readonly windBands: Graphics[] = [];
  private readonly grass: Graphics[] = [];
  private readonly trees: { shape: Graphics; phase: number }[] = [];
  private readonly cloudShadows: { shape: Graphics; x: number; phase: number }[] = [];
  private readonly wetRoad = new Graphics();
  private readonly puddles = new Graphics();
  private readonly leaves = new Graphics();
  private readonly birds = new Graphics();
  private readonly kite = new Graphics();
  private readonly campLight = new Graphics();
  private readonly distant = new Graphics();

  constructor(private readonly trail: ScrollTrail) {
    this.landforms();
    this.contours();
    this.woodland();
    this.meadow();
    this.campsite();
    this.landmarks();
    this.road();
    this.weatherDetails();
  }

  private landforms(): void {
    const left = -10000, right = SCROLL.width + 10000, floor = 8000;
    const crest: Point[] = [{ x: left, y: this.trail.crestAt(left) }];
    crest.push(...this.trail.ridge);
    crest.push({ x: right, y: this.trail.crestAt(right) });
    const far: Point[] = [];
    for (let x = left; x <= right; x += 70) far.push({ x, y: this.trail.distantAt(x) });
    line(this.distant, curve(far, 10)).lineTo(right, floor).lineTo(left, floor).closePath().fill('#ffffff');
    this.ground.addChild(this.distant);
    const mountain = line(new Graphics(), crest).lineTo(right, floor).lineTo(left, floor).closePath();
    mountain.fill(new FillGradient({
      start: { x: 0, y: 300 }, end: { x: 0, y: 1900 }, textureSpace: 'global',
      colorStops: [{ offset: 0, color: '#c7d4a0' }, { offset: .45, color: '#b7c795' }, { offset: 1, color: '#a8bc91' }],
    }));
    this.ground.addChild(mountain);
    this.ground.addChild(line(new Graphics(), crest).stroke({ color: '#edf0cd', width: 3, alpha: .46, cap: 'round' }));
    // Soft valley washes and short branching lines keep the map legible at both scales.
    // Avoid independently closed slope panels: their edges read as floating triangles.
    const valleyWash = new FillGradient({
      type: 'radial', center: { x: .5, y: .5 }, innerRadius: 0, outerRadius: .5,
      colorStops: [{ offset: 0, color: '#658b6e44' }, { offset: 1, color: '#658b6e00' }],
    });
    for (const [x, y, rx, ry] of [[600, 1480, 350, 400], [1150, 1170, 300, 480], [1820, 1280, 480, 500], [2560, 1450, 320, 550]] satisfies [number, number, number, number][]) {
      this.ground.addChild(new Graphics().ellipse(x, y, rx, ry).fill(valleyWash));
    }
    for (const x of [520, 950, 1380, 1740, 2110, 2460, 2710, 3020]) {
      const y = this.trail.crestAt(x);
      const ridge = new Graphics().moveTo(x - 5, y + 18)
        .bezierCurveTo(x - 24, y + 94, x + 6, y + 143, x - 32, y + 218);
      ridge.stroke({ color: '#eef0cb', alpha: .35, width: 6, cap: 'round' }); this.ground.addChild(ridge);
      const gully = new Graphics().moveTo(x + 70, y + 205)
        .bezierCurveTo(x + 44, y + 300, x + 96, y + 373, x + 78, y + 463)
        .moveTo(x + 78, y + 463).bezierCurveTo(x + 124, y + 420, x + 134, y + 362, x + 168, y + 342);
      gully.stroke({ color: '#739277', alpha: .21, width: 2, cap: 'round' }); this.ground.addChild(gully);
    }
    const foothills = curve([
      [-600, 1780], [0, 1700], [700, 1500], [1200, 1600], [1800, 1480],
      [2200, 1720], [2800, 1670], [4000, 1750],
    ].map(([x, y]) => ({ x, y })), 10);
    const foreground = new Graphics().moveTo(left, 1780);
    for (const point of foothills) foreground.lineTo(point.x, point.y);
    this.ground.addChild(foreground.lineTo(right, 1750).lineTo(right, floor).lineTo(left, floor).closePath().fill({ color: '#9cb692', alpha: .40 }));
  }

  private contours(): void {
    // Short elevation arcs describe each shoulder without copying the walking route.
    for (const x of [600, 950, 1380, 1740, 2110, 2460, 2710]) for (let row = 0; row < 6; row++) {
      const y = this.trail.crestAt(x);
      const drop = 120 + row * 74, breadth = 60 + row * 23;
      const contour = new Graphics().moveTo(x - breadth, y + drop)
        .bezierCurveTo(x - breadth * .3, y + drop - 36, x + breadth * .7, y + drop - 24, x + breadth + 25, y + drop + 27);
      contour.stroke({ color: '#6f8d73', width: 1.1, alpha: .17, cap: 'round' }); this.ground.addChild(contour);
    }
  }

  private tree(x: number, y: number, size: number, front = false): void {
    const tree = new Graphics();
    tree.ellipse(0, 1, size * .40, size * .13).fill({ color: '#405e4d', alpha: .12 });
    tree.moveTo(0, 1).lineTo(0, -size * .55).stroke({ color: '#7a8060', width: size * .075, cap: 'round' });
    tree.ellipse(-size * .12, -size * .62, size * .34, size * .39).fill('#78966d');
    tree.ellipse(size * .16, -size * .71, size * .30, size * .40).fill('#8fa87a');
    tree.ellipse(-size * .10, -size * .84, size * .24, size * .26).fill('#a3b88a');
    tree.moveTo(-size * .13, -size * .69).quadraticCurveTo(-size * .04, -size * .92, size * .13, -size * .92).stroke({ color: '#ced8b0', alpha: .5, width: 1.4, cap: 'round' });
    const baseY = Math.max(y, this.trail.crestAt(x) + 15);
    tree.position.set(x, baseY); tree.zIndex = front ? baseY : baseY - 20;
    this.subjects.addChild(tree);
    this.trees.push({ shape: tree, phase: x * .035 + y * .02 });
  }

  private woodland(): void {
    const groves = new Graphics();
    for (const [from, to] of [[10, this.trail.sites.slope.travel - 110], [this.trail.summitTravel + 460, this.trail.length - 25]]) {
      for (let d = from; d < to; d += 34) {
        const at = this.trail.sample(d), i = Math.floor(d / 34), side = i % 2 ? -1 : 1;
        const x = at.x + side * (40 + i % 4 * 14), y = at.y + (i % 3 - 1) * 24;
        if (i % 3 === 0) groves.ellipse(x, y + 2, 69, 25).fill({ color: '#88a37b', alpha: .20 });
        this.tree(x, y, 31 + i % 5 * 5);
      }
    }
    this.ground.addChild(groves);
    for (const d of [this.trail.sites.slope.travel * .3, this.trail.sites.slope.travel * .7, this.trail.templeTravel + 190]) {
      const at = this.trail.sample(d); this.tree(at.x + 36, at.y + 26, 67, true);
    }
  }

  private meadow(): void {
    for (let d = this.trail.sites.slope.travel; d < this.trail.summitTravel; d += 34) {
      const at = this.trail.sample(d), i = Math.floor(d / 34), side = i % 2 ? -1 : 1;
      const x = at.x + side * (20 + i % 4 * 14), y = Math.max(at.y + side * (30 + i % 4 * 18), this.trail.crestAt(x) + 12);
      const patch = new Graphics();
      patch.ellipse(0, 0, 15 + i % 4 * 5, 4).fill({ color: '#829c68', alpha: .22 });
      patch.moveTo(-12, 0).quadraticCurveTo(-6, -8, 4, -7).quadraticCurveTo(1, -2, -8, 0).fill({ color: '#9aab72', alpha: .7 });
      patch.moveTo(-2, 0).quadraticCurveTo(5, -10, 14, -8).quadraticCurveTo(11, -1, -2, 0).fill({ color: '#a9b984', alpha: .8 });
      patch.position.set(x, y); this.ground.addChild(patch); this.grass.push(patch);
    }
    for (let i = 0; i < 10; i++) {
      const at = this.trail.sample(this.trail.sites.slope.travel + (this.trail.summitTravel - this.trail.sites.slope.travel) * i / 10);
      const wind = new Graphics(), x = at.x, y = this.trail.crestAt(x) - 25;
      wind.moveTo(x - 45, y + 10).bezierCurveTo(x - 10, y - 3, x + 20, y + 1, x + 56, y - 9);
      wind.stroke({ color: '#f8f7e9', width: 2.1, alpha: .45, cap: 'round' });
      this.windBands.push(wind); this.ground.addChild(wind);
    }
    for (let i = 0; i < 12; i++) {
      const at = this.trail.sample(150 + i * (this.trail.length - 300) / 12);
      const rock = new Graphics().moveTo(-9, 0).lineTo(-5, -7).lineTo(3, -8).lineTo(9, -1).lineTo(5, 2).closePath().fill('#a6afa1');
      rock.moveTo(-5, -7).lineTo(1, -2).lineTo(9, -1).stroke({ color: '#e2e4d0', width: 1 });
      rock.position.set(at.x - 25, Math.max(at.y + 18, this.trail.crestAt(at.x - 25) + 12)); this.ground.addChild(rock);
    }
  }

  private campsite(): void {
    const end = this.trail.sites.camp.point;
    this.ground.addChild(new Graphics().ellipse(end.x - 10, end.y + 20, 112, 22).fill({ color: '#e0dab6', alpha: .8 }));
    for (const [x, dy, size] of [[end.x - 105, -26, 49], [end.x + 92, 22, 38]] satisfies [number, number, number][]) {
      const tent = new Graphics(), y = Math.max(this.trail.crestAt(x) + 18, end.y + dy);
      tent.ellipse(0, 2, size * .6, size * .14).fill({ color: '#50634a', alpha: .12 });
      tent.moveTo(-size * .55, 0).lineTo(-size * .14, -size * .6).lineTo(size * .55, -size * .16).lineTo(size * .26, size * .12).closePath().fill('#d8ba80').stroke({ color: '#8c8f69', width: 1.1 });
      tent.moveTo(-size * .55, 0).lineTo(-size * .14, -size * .6).lineTo(size * .06, size * .06).closePath().fill('#eddaaa');
      tent.moveTo(-size * .42, 0).lineTo(-size * .16, -size * .40).lineTo(-size * .04, size * .04).closePath().fill('#7c8e6b');
      tent.position.set(x, y); tent.zIndex = y; this.subjects.addChild(tent);
    }
    const lampX = end.x - 105, lampY = Math.max(this.trail.crestAt(lampX) + 18, end.y - 26);
    this.campLight.ellipse(lampX, lampY + 1, 54, 13).fill({ color: '#f4d18c', alpha: .3 });
    this.campLight.roundRect(lampX - 10, lampY - 12, 10, 12, 2).fill('#f4d18c');
    this.campLight.ellipse(lampX, lampY - 8, 19, 13).fill({ color: '#f6dc9b', alpha: .16 });
    this.campLight.alpha = 0; this.lights.addChild(this.campLight);
  }

  private landmarks(): void {
    const village = this.trail.sites.start.point;
    for (const [dx, dy, size] of [[-63, -15, 32], [35, 25, 24], [-22, -67, 27]] satisfies [number, number, number][]) {
      const house = new Graphics();
      house.roundRect(-size * .5, -size * .6, size, size * .6, 2).fill('#e6dfc2');
      house.moveTo(-size * .67, -size * .54).lineTo(0, -size * .98).lineTo(size * .67, -size * .54).closePath().fill('#7d8d7c');
      house.rect(-size * .1, -size * .35, size * .23, size * .35).fill('#899679');
      house.position.set(village.x + dx, village.y + dy); house.zIndex = village.y + dy; this.subjects.addChild(house);
    }
    const summit = this.trail.sites.summit.point;
    const altar = new Graphics().ellipse(0, 3, 33, 10).fill('#a9b2a0');
    altar.roundRect(-16, -20, 32, 22, 3).fill('#c7c9b1').stroke({ color: '#899784', width: 1.3 });
    altar.moveTo(-21, -20).lineTo(0, -35).lineTo(21, -20).closePath().fill('#99a48e');
    altar.moveTo(-6, -12).lineTo(6, -12).moveTo(-6, -7).lineTo(6, -7).stroke({ color: '#899784', width: 1 });
    altar.position.set(summit.x + 48, summit.y - 6); altar.zIndex = summit.y - 6; this.subjects.addChild(altar);
    const templeAt = this.trail.sample(this.trail.templeTravel), temple = new Graphics();
    temple.roundRect(-25, -21, 50, 23, 2).fill('#d8d4b9');
    temple.moveTo(-36, -21).quadraticCurveTo(0, -43, 36, -21).lineTo(26, -15).lineTo(-26, -15).closePath().fill('#778e7c');
    temple.rect(-6, -13, 12, 15).fill('#899681'); temple.position.set(templeAt.x - 42, templeAt.y - 5); temple.zIndex = templeAt.y - 5; this.subjects.addChild(temple);
    const end = this.trail.sites.end.point;
    const gate = new Graphics().roundRect(-34, -47, 7, 48, 1).roundRect(27, -47, 7, 48, 1).fill('#b5bc9f');
    gate.moveTo(-43, -45).quadraticCurveTo(0, -56, 43, -45).lineTo(32, -38).lineTo(-32, -38).closePath().fill('#748b70');
    gate.roundRect(-18, -39, 36, 10, 2).fill('#ddd6b3');
    gate.position.set(end.x + 35, end.y - 10); gate.zIndex = end.y - 10; this.subjects.addChild(gate);
  }

  private road(): void {
    // A narrow worn trail, with irregular stone and grass edges. No lane borders.
    this.ground.addChild(line(new Graphics(), this.trail.points).stroke({ color: '#809274', width: 8, alpha: .30, cap: 'round', join: 'round' }));
    const stones = new Graphics(), verge = new Graphics();
    for (let d = 0; d < this.trail.length; d += 15) {
      const stage = this.trail.stage(d), steps = d > this.trail.summitTravel || stage === 'summit';
      const forest = stage === 'forest' || stage === 'village', i = Math.floor(d / 15);
      const section = [0, 5, 10, 15].map(offset => this.trail.sample(d + offset));
      line(stones, section).stroke({ color: steps ? '#b3b8ab' : forest ? '#9da28e' : '#b4bca0', width: 4.5 + Math.sin(d * .13) * .7, alpha: .90, cap: 'round', join: 'round' });
      const at = this.trail.sample(d + 5), heading = this.trail.heading(d), nx = -Math.sin(heading), ny = Math.cos(heading);
      if (steps) {
        stones.moveTo(at.x - nx * 3, at.y - ny * 3).lineTo(at.x + nx * 3, at.y + ny * 3).stroke({ color: '#7a877a', width: 1.25, alpha: .76, cap: 'round' });
      } else if (i % 2 === 0) {
        stones.ellipse(at.x + nx * 1.3, at.y + ny * 1.3, 1.7, 1).fill({ color: '#d6d9c7', alpha: .65 });
      }
      if (!steps && i % 3 === 0) {
        const side = i % 2 ? -1 : 1, x = at.x + nx * 5 * side, y = at.y + ny * 5 * side;
        verge.moveTo(x - 2, y + 1).quadraticCurveTo(x + 1, y - 4, x + 5, y - 2).quadraticCurveTo(x + 2, y, x - 2, y + 1).fill({ color: '#81976d', alpha: .7 });
      }
    }
    this.ground.addChild(stones, verge);
  }

  private weatherDetails(): void {
    line(this.wetRoad, this.trail.points).stroke({ color: '#617b79', width: 6, alpha: .48, cap: 'round', join: 'round' });
    this.wetRoad.alpha = 0; this.ground.addChild(this.wetRoad);
    const wash = new FillGradient({ type: 'radial', center: { x: .5, y: .5 }, innerRadius: 0, outerRadius: .5,
      colorStops: [{ offset: 0, color: '#446c7359' }, { offset: 1, color: '#446c7300' }] });
    for (let i = 0; i < 9; i++) {
      const x = 150 + i * 380, y = this.trail.crestAt(x) + 160;
      const shape = new Graphics().ellipse(0, 0, 190, 80).fill(wash); shape.position.set(x, y);
      this.cloudShadows.push({ shape, x, phase: i * 2.3 }); this.ground.addChild(shape);
    }
    this.subjects.addChild(this.puddles, this.leaves, this.birds, this.kite);
    this.kite.moveTo(0, -12).lineTo(8, 0).lineTo(0, 13).lineTo(-8, 0).closePath().fill('#cf9871').stroke({ color: '#877b5d', width: 1 });
    this.kite.moveTo(0, 13).quadraticCurveTo(12, 24, 5, 36).stroke({ color: '#b7a578', width: 1.1 }); this.kite.zIndex = 2000;
  }

  paint(environment: EnvironmentFrame, reduced: boolean, journey: ScrollJourney): void {
    const elapsed = reduced ? 0 : environment.elapsed, wind = environment.wind;
    const sleep = journey.pose.kind === 'sleeping' ? Math.max(.12, 1 - journey.pose.elapsed / 4) : 1;
    this.campLight.alpha = environment.night * .88 * sleep;
    this.distant.tint = environment.distantTop;
    for (const { shape, x, phase } of this.cloudShadows) {
      const at = x + Math.sin(elapsed * .035 + phase) * 110;
      shape.position.set(at, this.trail.crestAt(at) + 165);
      shape.alpha = environment.cloud * (.35 + Math.sin(elapsed * .08 + phase) * .15) * (1 - environment.night * .65);
    }
    this.wetRoad.alpha = environment.wet * .9;
    for (const [i, patch] of this.grass.entries()) { patch.skew.x = reduced ? 0 : Math.sin(elapsed * .95 - patch.x * .014 + i * .5) * .18 * wind; patch.tint = environment.wet > .25 ? '#d6e1c6' : '#ffffff'; }
    for (const { shape, phase } of this.trees) shape.skew.x = reduced ? 0 : Math.sin(elapsed * .65 + phase) * .014 * wind;
    for (const [i, band] of this.windBands.entries()) {
      band.alpha = reduced ? .4 : .24 + (.5 + Math.sin(elapsed * .5 + i * 1.6) * .5) * .42 * wind;
      band.x = reduced ? 0 : Math.sin(elapsed * .36 + i * 1.6) * 7 * wind;
    }
    this.puddles.clear(); this.leaves.clear(); this.birds.clear();
    if (environment.wet > .10) for (let i = 0; i < 24; i++) {
      const d = 90 + i * (this.trail.length - 180) / 24, at = this.trail.sample(d);
      if (this.trail.stage(d) !== 'forest' && d < this.trail.summitTravel) continue;
      const x = at.x + 7, y = at.y + 3, phase = reduced ? .5 : (elapsed * .8 + i * .37) % 1;
      this.puddles.ellipse(x, y, 5, 1.8).fill({ color: '#cadbd5', alpha: environment.wet * .8 });
      if (environment.rain > .1) this.puddles.ellipse(x, y, 2 + phase * 6, .6 + phase * 2).stroke({ color: '#e9eee0', width: .65, alpha: (1 - phase) * environment.rain * .8 });
    }
    this.puddles.zIndex = journey.point.y - 1;
    const forest = journey.stage === 'forest' || journey.stage === 'temple' || journey.stage === 'valley';
    if (forest && environment.night < .2) for (let i = 0; i < 7; i++) {
      const t = reduced ? i / 7 : (elapsed * .07 + i * .14) % 1;
      const x = journey.point.x - 100 + i * 29 + Math.sin(t * 5 + i) * 24 * wind, y = journey.point.y - 105 + t * 115;
      this.leaves.ellipse(x, y, 3.5, 1.7).fill({ color: i % 2 ? '#8c9a67' : '#c7bd86', alpha: Math.sin(t * Math.PI) * .65 });
    }
    this.leaves.zIndex = journey.point.y + 60;
    const cycle = reduced ? 4 : elapsed % 26;
    if (cycle < 7 && environment.rain < .3 && environment.night < .2) for (let i = 0; i < 3; i++) {
      const x = journey.point.x - 180 + cycle * 65 + i * 20, y = this.trail.crestAt(x) - 55 - Math.sin(cycle + i) * 8;
      const wing = Math.sin(elapsed * 8 + i) * 4;
      this.birds.moveTo(x - 5, y - wing).quadraticCurveTo(x - 2, y - 4, x, y).quadraticCurveTo(x + 2, y - 4, x + 5, y - wing).stroke({ color: '#66817a', width: 1.2, alpha: .65 });
    }
    this.birds.zIndex = 2000;
    const kiteAt = this.trail.sample(journey.events.kite.travel + 55);
    this.kite.visible = journey.hasCollected('kite') && environment.rain < .25 && Math.abs(journey.travel - journey.events.kite.travel) < 300;
    this.kite.position.set(kiteAt.x + Math.sin(elapsed * .8) * 9, this.trail.crestAt(kiteAt.x) - 45 + Math.sin(elapsed * 1.1) * 5);
    this.kite.rotation = reduced ? 0 : Math.sin(elapsed * .65) * .12;
  }
}
