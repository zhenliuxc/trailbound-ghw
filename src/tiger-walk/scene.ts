import { Application, Container, Graphics } from 'pixi.js';
import { DEFAULT_CHARACTER, type CharacterId } from '../characters/catalog';
import { CharacterFigure, CharacterLibrary, type CharacterSprite } from '../characters/pixi';
import { clamp, mix, type Point } from '../wugong-walk/model';
import type { TigerJourney } from './journey';
import { riverCourse, TIGER_WORLD } from './route';
import { drawTigerLandscape, INN_LIGHTS, noise, WATERFALL } from './terrain';

export type View = 'follow' | 'overview';
export interface Projection { readonly width: number; readonly height: number; readonly scale: number; toScreen(point: Point): Point; fromScreen(point: Point): Point }

export class TigerScene {
  private readonly app = new Application();
  private readonly world = new Container();
  private readonly river = new Graphics();
  private readonly falls = new Graphics();
  private readonly lamps = new Graphics();
  private readonly weather = new Graphics();
  private readonly shade = new Graphics();
  private readonly walker = new Container();
  private readonly figure = new CharacterFigure();
  private readonly shadow = new Graphics();
  private walk: readonly CharacterSprite[] = [];
  private rest: readonly CharacterSprite[] = [];
  private readonly people = new CharacterLibrary();
  private selectedCharacter: CharacterId = DEFAULT_CHARACTER;
  private width = 1200;
  private height = 620;
  private center = { x: 400, y: 1100 };
  private zoom = 1;
  private fresh = true;
  private facing = 1;
  private turnWait = 0;
  private lastFrame = 0;
  private initialized = false;
  private disposed = false;
  mode: View = 'follow';
  constructor(private readonly canvas: HTMLCanvasElement) {}
  get character(): CharacterId { return this.selectedCharacter; }
  private useCharacter(pack: Awaited<ReturnType<CharacterLibrary['load']>>): void {
    this.walk = pack.walk; this.rest = pack.actions; this.selectedCharacter = pack.id;
    this.figure.reset();
  }
  async setCharacter(id: CharacterId, signal: AbortSignal): Promise<void> {
    const pack = await this.people.load(id, signal);
    if (this.disposed || signal.aborted) throw new DOMException('已离开角色选择', 'AbortError');
    this.useCharacter(pack);
  }
  async load(signal: AbortSignal): Promise<void> {
    await this.app.init({ canvas: this.canvas, autoStart: false, sharedTicker: false, preference: 'webgl', antialias: true, background: '#e4e9dd', autoDensity: true, resolution: Math.min(2, devicePixelRatio || 1), width: this.width, height: this.height });
    this.initialized = true; this.app.stop();
    if (this.disposed || signal.aborted) { this.app.destroy({ removeView: false }, { children: true }); this.initialized = false; throw new DOMException('已离开山路', 'AbortError'); }
    const character = await this.people.initial(signal);
    if (this.disposed || signal.aborted) throw new DOMException('已离开山路', 'AbortError');
    this.useCharacter(character);
    this.app.stage.addChild(this.world, this.shade, this.weather);
    drawTigerLandscape(this.world, this.river);
    this.world.addChild(this.falls, this.lamps);
    this.shadow.ellipse(0, 1, 12, 3).fill({ color: '#334b41', alpha: .22 });
    this.walker.addChild(this.shadow, this.figure); this.world.addChild(this.walker);
  }
  resize(width: number, height: number): void {
    this.width = width; this.height = height; this.fresh = true;
    if (this.initialized) { this.app.renderer.resolution = Math.min(2, devicePixelRatio || 1, Math.sqrt((width < 760 ? 1500000 : 4000000) / (width * height))); this.app.renderer.resize(width, height); }
  }
  setView(view: View): void { this.mode = view; }
  snap(): void { this.fresh = true; }
  paint(journey: TigerJourney, dt: number, reduced: boolean): Projection {
    const at = journey.point, fit = Math.min((this.width - 100) / TIGER_WORLD.width, (this.height - 100) / TIGER_WORLD.height);
    const below = riverCourse.reduce((a, b) => Math.abs(a.x - at.x) < Math.abs(b.x - at.x) ? a : b);
    const clearance = Math.max(380, below.y - at.y);
    const intendedZoom = this.mode === 'overview' ? fit : clamp(this.height * .64 / clearance, .28, this.width < 760 ? .9 : 1.1);
    const instant = this.fresh || reduced, smooth = instant ? 1 : 1 - Math.exp(-dt * 3);
    this.zoom = mix(this.zoom, intendedZoom, smooth);
    const ahead = journey.path.sample(journey.at + (journey.leg === 'return' ? -65 : 65));
    const target = this.mode === 'overview' ? { x: TIGER_WORLD.width / 2, y: TIGER_WORLD.height / 2 } : { x: at.x + (ahead.x - at.x) * .4 + this.width * .12 / this.zoom, y: at.y + this.height * .22 / this.zoom };
    this.center = { x: mix(this.center.x, target.x, smooth), y: mix(this.center.y, target.y, smooth) }; this.fresh = false;
    const x = this.width / 2 - this.center.x * this.zoom, y = this.height / 2 - this.center.y * this.zoom, z = this.zoom;
    this.world.scale.set(z); this.world.position.set(x, y);
    this.river.clear();
    for (let i = 0; i < 80; i++) {
      const progress = ((i * .0125 - (reduced ? 0 : journey.clock * .009)) % 1 + 1) % 1;
      const position = progress * (riverCourse.length - 1), index = Math.min(riverCourse.length - 2, Math.floor(position));
      const a = riverCourse[index], b = riverCourse[index + 1], fraction = position - index;
      const x = mix(a.x, b.x, fraction), y = mix(a.y, b.y, fraction) + Math.sin(i * 3.7) * 42;
      this.river.moveTo(x - 10, y).quadraticCurveTo(x + 4, y - 6, x + 24, y - 3).stroke({ color: '#f0edd4', width: i % 3 ? 1.4 : 2.5, alpha: .27 + noise(i) * .18 });
    }
    this.falls.clear();
    for (let i = 0; i < 24; i++) {
      const progress = reduced ? i / 24 : (i / 24 + journey.clock * .14) % 1;
      const index = Math.min(WATERFALL.length - 2, Math.floor(progress * (WATERFALL.length - 1)));
      const a = WATERFALL[index], b = WATERFALL[index + 1], t = progress * (WATERFALL.length - 1) - index;
      const x = mix(a.x, b.x, t) + (i % 3 - 1) * 1.5, y = mix(a.y, b.y, t);
      this.falls.moveTo(x, y).lineTo(x + 1, y + 7).stroke({ color: '#faf7e5', width: i % 3 ? 1 : 1.8, alpha: .65 });
    }
    const rest = ['resting', 'sleeping', 'waking'].includes(journey.mode.kind) || journey.mode.kind === 'paused' && journey.atInn || journey.mode.kind === 'game' && journey.mode.id === 'inn-pairs';
    if (journey.moving) this.lastFrame = Math.floor((journey.phase % 1) * 8);
    const figure = rest ? this.rest[journey.mode.kind === 'waking' ? 1 : 2] : this.walk[this.lastFrame];
    this.figure.show(figure, dt, rest, reduced);
    const side = Math.cos(journey.heading);
    if (journey.moving && Math.abs(side) > .42 && Math.sign(side) !== this.facing) { this.turnWait += dt; if (this.turnWait > .22) { this.facing = Math.sign(side); this.turnWait = 0; } } else this.turnWait = 0;
    const figureZoom = this.mode === 'follow' ? Math.max(1, .65 / z) : 1;
    this.walker.position.set(at.x, at.y); this.walker.scale.set(this.facing * figureZoom, figureZoom); this.figure.rotation = journey.moving ? clamp(Math.sin(journey.heading) * -.09 * this.facing, -.08, .09) : 0;
    const hour = journey.minute / 60, night = journey.mode.kind === 'sleeping' ? mix(.5, 1, clamp(journey.mode.elapsed / 1.4)) : journey.mode.kind === 'waking' ? mix(1, 0, clamp(journey.mode.elapsed / 3.5)) : hour >= 17 ? clamp((hour - 17) / 2) : 0;
    this.lamps.clear();
    if (night > .05) for (const p of INN_LIGHTS) this.lamps.rect(p.x - 3, p.y - 4, 6, 8).fill({ color: '#e7bd78', alpha: night * .9 });
    this.shade.clear().rect(0, 0, this.width, this.height).fill({ color: '#162c48', alpha: night * .63 });
    this.weather.clear();
    for (let i = 0; i < 6; i++) {
      const cx = ((i * 389 + journey.clock * (reduced ? 0 : 3)) % (this.width + 320)) - 160, cy = 25 + i % 3 * 30;
      const size = 50 + i * 6;
      this.weather.moveTo(cx - size, cy + 7).bezierCurveTo(cx - size - 8, cy - 5, cx - size * .65, cy - 13, cx - size * .45, cy - 8)
        .bezierCurveTo(cx - size * .4, cy - 30, cx + size * .12, cy - 33, cx + size * .25, cy - 13)
        .bezierCurveTo(cx + size * .72, cy - 23, cx + size * .95, cy - 7, cx + size, cy + 5)
        .bezierCurveTo(cx + size * .6, cy + 20, cx - size * .72, cy + 18, cx - size, cy + 7)
        .closePath().fill({ color: '#faf6e4', alpha: mix(.15, .055, night) });
    }
    if (night > .2) for (let i = 0; i < 30; i++) this.weather.circle(noise(i + 70) * this.width, noise(i + 90) * this.height * .4, i % 4 ? .7 : 1.1).fill({ color: '#f4edd3', alpha: night * .65 });
    this.app.render();
    return { width: this.width, height: this.height, scale: z, toScreen: p => ({ x: x + p.x * z, y: y + p.y * z }), fromScreen: p => ({ x: (p.x - x) / z, y: (p.y - y) / z }) };
  }
  destroy(): void {
    if (this.disposed) return; this.disposed = true;
    if (this.initialized) this.app.destroy({ removeView: false }, { children: true, texture: false, textureSource: false });
    this.people.destroy();
  }
}
