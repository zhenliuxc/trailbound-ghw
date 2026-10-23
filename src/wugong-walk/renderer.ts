import { clamp, HIKER_SCALE, mix, SCENE, type Landscape, type Point, type Trail, type WalkModel } from './model';
import { drawHiker } from './character';
import { drawMeadowTuft, drawTree, groundCover, randomSequence } from './vegetation';
import { WalkCamera, type CameraMode, type FrameProjection } from './camera';
import { SceneBackdrop } from './backdrop';
import type { EnvironmentFrame } from './environment';

interface Prop { kind: 'tree' | 'rock' | 'tent' | 'cabin' | 'seat' | 'gate'; point: Point; scale: number; variant: number }
interface Grass { point: Point; scale: number; seed: number; shade: number; variant: number; near: boolean }
const tau = Math.PI * 2;
function line(ctx: CanvasRenderingContext2D, points: readonly Point[], color: string, width: number): void {
  if (!points.length) return;
  ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
  for (const p of points.slice(1)) ctx.lineTo(p.x, p.y);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
}
function fill(ctx: CanvasRenderingContext2D, d: string, color: string, stroke = '', width = .65): void {
  const p = new Path2D(d); ctx.fillStyle = color; ctx.fill(p);
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(p); }
}
function oval(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string): void {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, tau); ctx.fillStyle = color; ctx.fill();
}

export class WalkRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly camera = new WalkCamera();
  private readonly background: SceneBackdrop;
  private readonly props: Prop[] = [];
  private readonly sprites = new Map<string, { canvas: HTMLCanvasElement; bytes: number }>();
  private spriteBytes = 0;
  private disposed = false;
  private signal: AbortSignal | null = null;
  private readonly grass: Grass[] = [];
  get cameraMode(): CameraMode { return this.camera.mode; }
  get detailStatus(): 'ready' | 'refining' | 'fallback' { return this.background.status; }
  constructor(readonly canvas: HTMLCanvasElement, readonly landscape: Landscape, readonly trail: Trail) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('这个浏览器暂时无法展开山路画面');
    this.ctx = ctx;
    this.background = new SceneBackdrop(landscape, trail);
    this.placeProps();
  }
  private placeProps(): void {
    const random = randomSequence(17102617);
    for (const [i, fraction] of [.07, .16, .32, .43, .53, .59].entries()) {
      const side = i === 1 || i === 4 ? -1 : 1;
      const point = this.trail.beside(this.trail.stops[0].travel * fraction / .65, side * (.05 + random() * .02), .025);
      this.props.push({ kind: 'tree', point, scale: .87 + random() * .22 - fraction * .35, variant: i });
    }
    this.props.push({ kind: 'tree', point: this.trail.beside(this.trail.stops[0].travel * .40, .025, .035), scale: .82, variant: 6 });
    let distantGrass = 0;
    for (const [i, mark] of this.background.marks.entries()) {
      if (mark.kind !== 'meadow' || i % 29 || distantGrass >= 55) continue;
      const point = mark.points[0];
      if (point.x < 10 || point.x > SCENE.width - 10 || point.y < 150 || point.y > 800 || this.trail.nearest(point).gap < 18) continue;
      this.grass.push({ point, scale: .12 + random() * .10, seed: random() * tau, shade: 5, variant: i % 8, near: false }); distantGrass++;
    }
    for (let i = 0; i < 180; i++) {
      const travel = mix(this.trail.stops[0].travel, this.trail.length - 12, random());
      const world = this.trail.sampleWorld(travel);
      const root = this.landscape.onSurface({ x: world.x + (i % 3 ? 1 : -1) * (.025 + random() * .06), z: world.z + .015 + random() * .02 });
      const hx = (this.landscape.height(root.x + .012, root.z) - this.landscape.height(root.x - .012, root.z)) / .024;
      const hz = (this.landscape.height(root.x, root.z + .012) - this.landscape.height(root.x, root.z - .012)) / .024;
      const cover = groundCover(root.x, root.z, this.landscape.height(root.x, root.z), hx, hz);
      if (cover.meadow < .2) continue;
      const point = this.landscape.project(root);
      if (Math.hypot(point.x - this.trail.seat.x, point.y - this.trail.seat.y) < 15) continue;
      this.grass.push({ point, scale: .23 + random() * .17, seed: random() * tau, shade: Math.round(cover.light * 7), variant: i % 8, near: true });
      if (i % 7 === 0) this.props.push({ kind: 'rock', point: { x: point.x + 8, y: point.y + 5 }, scale: .28 + random() * .2, variant: i % 2 });
    }
    for (let i = 0; i < 8; i++) {
      const travel = mix(this.trail.summitTravel, this.trail.length, .46 + i * .065), world = this.trail.sampleWorld(travel);
      if (this.landscape.height(world.x, world.z) > 1.2) continue;
      const side = i % 2 ? -1 : 1;
      this.props.push({ kind: 'tree', point: this.trail.beside(travel, side * (.035 + random() * .03), .024), scale: .48 + random() * .28, variant: i + 7 });
    }
    for (const [i, dx] of [-.13, .14, -.055].entries()) this.props.push({ kind: 'tent', point: this.trail.beside(this.trail.campTravel, dx, -.035 - (i % 2) * .025), scale: .58 - i * .07, variant: i % 2 });
    this.props.push({ kind: 'seat', point: { x: this.trail.seat.x + .6, y: this.trail.seat.y - .4 }, scale: HIKER_SCALE, variant: 0 });
    this.props.push({ kind: 'cabin', point: { x: this.trail.start.x - 31, y: this.trail.start.y + 23 }, scale: .77, variant: 0 });
    this.props.push({ kind: 'cabin', point: { x: this.trail.start.x + 26, y: this.trail.start.y + 37 }, scale: .43, variant: 1 });
    this.props.push({ kind: 'gate', point: this.trail.end, scale: .72, variant: 0 });
    this.props.sort((a, b) => a.point.y - b.point.y);
  }
  setCameraMode(mode: CameraMode): void { this.camera.setMode(mode); this.background.changeMode(mode); }
  suspend(hidden: boolean): void { this.background.suspend(hidden); }
  async resize(width: number, height: number, signal: AbortSignal): Promise<void> {
    this.signal = signal;
    const spriteLimit = (width < 760 ? 12 : 24) * 1024 * 1024;
    while (this.spriteBytes > spriteLimit) {
      const first = this.sprites.entries().next().value;
      if (!first) break;
      this.sprites.delete(first[0]); this.spriteBytes -= first[1].bytes; first[1].canvas.width = 0; first[1].canvas.height = 0;
    }
    const budget = width < 760 ? 2_000_000 : 5_000_000;
    const ratio = Math.min(2, window.devicePixelRatio || 1, Math.sqrt(budget / (width * height))) * .999;
    this.canvas.width = Math.max(1, Math.floor(width * ratio)); this.canvas.height = Math.max(1, Math.floor(height * ratio));
    this.camera.resize(width, height, ratio);
    await this.background.prepareOverview(this.camera.frame, signal);
  }
  private propSprite(prop: Prop, density: number): HTMLCanvasElement {
    const key = `${prop.kind}-${prop.variant}-${density}`;
    const cached = this.sprites.get(key); if (cached) { this.sprites.delete(key); this.sprites.set(key, cached); return cached.canvas; }
    const canvas = document.createElement('canvas'); canvas.width = Math.ceil(96 * density); canvas.height = Math.ceil(104 * density);
    const ctx = canvas.getContext('2d'); if (!ctx) return canvas;
    ctx.scale(density, density); ctx.translate(48, 66); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (prop.kind === 'tree') {
      drawTree(ctx, prop.variant);
    } else if (prop.kind === 'rock' || prop.kind === 'seat') {
      oval(ctx, 4, 4, 25, 4, '#294d4923');
      if (prop.kind === 'seat') {
        fill(ctx, 'M-10-7L5-12L14-7L13-1L1 4L-10 0Z', '#a3b5a4', '#698d7d');
        fill(ctx, 'M-10-7L5-12L14-7L1-2Z', '#d1d8bd', '#89a18a');
        line(ctx, [{ x: -6, y: -5 }, { x: 1, y: -8 }, { x: 6, y: -6 }], '#e9e6ca', .7);
      } else {
        fill(ctx, 'M-22 0L-16-14L-3-24L13-20L23-7L19 3L2 7Z', '#a6b7aa', '#6f9286');
        fill(ctx, 'M-20-1L-14-13L-3-22L12-19L0-9Z', '#d0d7bd');
        line(ctx, [{ x: 0, y: -9 }, { x: 6, y: 1 }, { x: 18, y: -3 }], '#8da394', .7);
      }
    } else if (prop.kind === 'tent') {
      oval(ctx, 3, 5, 32, 5, '#33574b26');
      fill(ctx, 'M-27 2L-6-29L25-16L34 8L4 16Z', prop.variant ? '#89a7a0' : '#bbab80', '#7d9179');
      fill(ctx, 'M-27 2L-6-29L4 16Z', prop.variant ? '#c0d0be' : '#ded0a5', '#8d9a7a');
      fill(ctx, 'M-17 4L-6-17L-1 10Z', prop.variant ? '#5d897e' : '#96966a', '#83936e');
      line(ctx, [{ x: -6, y: -29 }, { x: 25, y: -16 }, { x: 34, y: 8 }], '#e3dec0', 1.1);
      line(ctx, [{ x: -34, y: 8 }, { x: -6, y: -29 }], '#aab28e', .7);
      line(ctx, [{ x: 25, y: -16 }, { x: 42, y: 10 }], '#aab28e', .7);
    } else if (prop.kind === 'cabin') {
      oval(ctx, 5, 15, 35, 6, '#33554c26');
      fill(ctx, 'M-27-14L0-24L29-13V23L0 33L-27 22Z', '#bdc6aa', '#688b77');
      fill(ctx, 'M0-2L29-13V23L0 33Z', '#94ac95');
      fill(ctx, 'M-35-18L0-42L36-17L0-1Z', '#708e7b', '#527b69');
      fill(ctx, 'M-35-18L0-42L0-1Z', '#a7b99a');
      fill(ctx, 'M-18 22V-3L-6 1V27Z', '#6d8d77', '#547761');
      fill(ctx, 'M9 4L22-1V12L9 17Z', '#d4d6b3', '#71947b');
      line(ctx, [{ x: 15, y: 2 }, { x: 15, y: 14 }], '#78937b', .8);
      line(ctx, [{ x: -23, y: 26 }, { x: -5, y: 32 }], '#d8d5b7', 2.4);
    } else {
      fill(ctx, 'M-21 1V-29L-16-32L-15 4M17 6V-25L23-28L24 4', '#adbea7', '#6c8f7b');
      fill(ctx, 'M-29-33L0-45L30-31L1-22Z', '#73917f', '#567e6d');
      fill(ctx, 'M-24-26L1-18L26-26V-20L1-12L-24-20Z', '#c8d0b1', '#7c9b81');
    }
    const bytes = canvas.width * canvas.height * 4, limit = (this.camera.frame.width < 760 ? 12 : 24) * 1024 * 1024;
    while (this.spriteBytes + bytes > limit && this.sprites.size) {
      const first = this.sprites.entries().next().value;
      if (!first) break;
      this.sprites.delete(first[0]); this.spriteBytes -= first[1].bytes; first[1].canvas.width = 0; first[1].canvas.height = 0;
    }
    this.sprites.set(key, { canvas, bytes }); this.spriteBytes += bytes; return canvas;
  }
  paint(model: WalkModel, environment: EnvironmentFrame, reduced: boolean, dt = 0): FrameProjection {
    if (this.disposed || !this.signal) return this.camera.frame;
    const ctx = this.ctx, v = this.camera.advance(model, dt, reduced);
    ctx.setTransform(v.pixelRatio, 0, 0, v.pixelRatio, 0, 0);
    ctx.fillStyle = '#bed0ce'; ctx.fillRect(0, 0, v.width, v.height);
    ctx.translate(v.x, v.y); ctx.scale(v.scale, v.scale);
    this.background.paint(ctx, v, this.signal, reduced ? { ...environment, elapsed: 0 } : environment);
    const objectScale = mix(clamp(.72 / v.overviewScale, 1, 1.8), 1, v.close);
    const figureScale = HIKER_SCALE * mix(clamp(.86 / v.overviewScale, .95, 2.1), 1, v.close);
    const requestedDensity = v.scale * v.pixelRatio * objectScale;
    const density = requestedDensity <= 2 ? 2 : requestedDensity <= 4 ? 4 : 6.4;
    const visible = (point: Point, radius: number) => point.x + radius > v.bounds.x && point.x - radius < v.bounds.x + v.bounds.width && point.y + radius > v.bounds.y && point.y - radius < v.bounds.y + v.bounds.height;
    const paintProp = (prop: Prop) => {
      const scale = prop.scale * (prop.kind === 'tree' ? Math.min(1.18, objectScale) : objectScale);
      if (!visible(prop.point, 80 * scale)) return;
      ctx.drawImage(this.propSprite(prop, density), prop.point.x - 48 * scale, prop.point.y - 66 * scale, 96 * scale, 104 * scale);
    };
    for (const prop of this.props) if (prop.point.y <= model.point.y) paintProp(prop);
    for (const grass of this.grass) if (grass.point.y <= model.point.y && visible(grass.point, 28)) this.paintGrass(grass, model, environment, reduced, objectScale);
    drawHiker(ctx, model, figureScale, reduced, environment.wind);
    this.background.restoreForeground(ctx, model.trail.sampleWorld(model.travel), { x: model.point.x - 19 * figureScale, y: model.point.y - 48 * figureScale, width: 38 * figureScale, height: 54 * figureScale }, v.close > .25);
    for (const prop of this.props) if (prop.point.y > model.point.y) paintProp(prop);
    for (const grass of this.grass) if (grass.point.y > model.point.y && visible(grass.point, 28)) this.paintGrass(grass, model, environment, reduced, objectScale);
    this.paintAtmosphere(v, environment, reduced);
    return v;
  }
  private paintAtmosphere(v: FrameProjection, e: EnvironmentFrame, reduced: boolean): void {
    const ctx = this.ctx;
    ctx.save(); ctx.setTransform(v.pixelRatio, 0, 0, v.pixelRatio, 0, 0);
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = `rgba(83,110,133,${e.night * .34 + e.cloud * .075 + e.wet * .035})`; ctx.fillRect(0, 0, v.width, v.height);
    if (e.warmth > .01) { ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(239,193,124,${e.warmth * .27})`; ctx.fillRect(0, 0, v.width, v.height); }
    ctx.globalCompositeOperation = 'source-over';
    ctx.translate(v.x, v.y); ctx.scale(v.scale, v.scale);
    for (const [i, x] of [-60, 510, 1190].entries()) {
      const drift = reduced ? 0 : Math.sin(e.elapsed * .035 + i) * (28 + e.wind * 18);
      ctx.save(); ctx.translate(x + drift, 540 + i * 84); ctx.scale(270, 32 + e.fog * 24);
      const mist = ctx.createRadialGradient(0, 0, 0, 0, 0, 1); mist.addColorStop(0, `rgba(232,239,226,${.025 + e.fog * .14})`); mist.addColorStop(.5, `rgba(229,236,223,${e.fog * .07})`); mist.addColorStop(1, '#e5ecdf00'); ctx.fillStyle = mist; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
    }
    if (e.rain > .03) {
      ctx.setTransform(v.pixelRatio, 0, 0, v.pixelRatio, 0, 0);
      const count = Math.round((v.width < 760 ? 65 : 125) * e.rain), span = v.height + 45;
      ctx.strokeStyle = `rgba(221,234,226,${.13 + e.rain * .21})`; ctx.lineWidth = .65; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 0; i < count; i++) {
        const x = ((i * 173.7 + (reduced ? 0 : e.elapsed * 17 * e.wind)) % (v.width + 50)) - 25;
        const y = ((i * 91.3 + (reduced ? 0 : e.elapsed * (205 + i % 5 * 13))) % span) - 25;
        const length = reduced ? 3 : 6 + i % 5; ctx.moveTo(x, y); ctx.lineTo(x - e.wind * 3, y + length);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  private paintGrass(grass: Grass, model: WalkModel, environment: EnvironmentFrame, reduced: boolean, objectScale: number): void {
    const ctx = this.ctx;
    const wave = model.clock * .9 - grass.point.x * .008 - grass.point.y * .005;
    const wind = reduced ? 0 : environment.wind * (1.7 + Math.sin(wave) * 1.2 + Math.sin(wave * 1.7 + grass.seed) * .25);
    const proximity = grass.near ? clamp((12 - Math.hypot(grass.point.x - model.point.x, grass.point.y - model.point.y)) / 12) * clamp(Math.abs(model.speed) / 4) : 0;
    const bend = wind + proximity * (grass.point.x < model.point.x ? -5 : 5);
    const scale = grass.scale * Math.min(1.2, objectScale);
    ctx.save(); ctx.translate(grass.point.x, grass.point.y); ctx.scale(scale, scale);
    drawMeadowTuft(ctx, grass.shade, grass.variant, bend);
    ctx.restore();
  }
  destroy(): void {
    this.disposed = true; this.background.destroy();
    for (const sprite of this.sprites.values()) { sprite.canvas.width = 0; sprite.canvas.height = 0; }
    this.sprites.clear(); this.spriteBytes = 0; this.canvas.width = 0; this.canvas.height = 0;
  }
}
