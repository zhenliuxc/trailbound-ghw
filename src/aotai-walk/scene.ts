import { MapCamera, mapCharacterScale, type MapProjection, type MapView } from '../journey/map-camera';
import { Application, Container, Graphics } from 'pixi.js';
import { DEFAULT_CHARACTER, type CharacterId } from '../characters/catalog';
import { CharacterFigure, CharacterLibrary, type CharacterSprite } from '../characters/pixi';
import { clamp } from '../journey/geometry';
import type { AotaiJourney } from './chapter';
import { path } from './geography';
import { PLACES } from '../content/aotai-map';
import { landscape } from './terrain';
import { overviewCamera } from './camera';

export type AotaiView = MapView;
export type Projection = MapProjection;
const noise = (i: number) => { const n = Math.sin(i * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
export class AotaiScene {
  private readonly app = new Application();
  private readonly world = new Container();
  private readonly terrain = new Container();
  private terrainAspect = 1; private terrainScale = 1;
  private readonly sky = new Graphics();
  private readonly weather = new Graphics();
  private readonly shade = new Graphics();
  private readonly lamp = new Graphics();
  private readonly walker = new Container();
  private readonly transport = new Graphics();
  private readonly figure = new CharacterFigure();
  private readonly people = new CharacterLibrary();
  private walk: readonly CharacterSprite[] = [];
  private rest: readonly CharacterSprite[] = [];
  private selected: CharacterId = DEFAULT_CHARACTER;
  private initialized = false; private disposed = false;
  private width = 1200; private height = 700;
  private readonly camera = new MapCamera();
  private facing = 1; private turnTime = 0; private frame = 0;
  get mode(): AotaiView { return this.camera.mode; }
  set mode(mode: AotaiView) { this.camera.mode = mode; }
  constructor(private readonly canvas: HTMLCanvasElement) {}
  get character(): CharacterId { return this.selected; }
  private use(pack: Awaited<ReturnType<CharacterLibrary['load']>>): void { this.walk = pack.walk; this.rest = pack.actions; this.selected = pack.id; this.figure.reset(); }
  async setCharacter(id: CharacterId, signal: AbortSignal): Promise<void> { const pack = await this.people.load(id, signal); if (this.disposed || signal.aborted) throw new DOMException('已离开山路', 'AbortError'); this.use(pack); }
  async load(signal: AbortSignal): Promise<void> {
    await this.app.init({ canvas: this.canvas, autoStart: false, sharedTicker: false, preference: 'webgl', antialias: true, autoDensity: true, resolution: Math.min(2, devicePixelRatio || 1), width: this.width, height: this.height, background: '#e0e9e8' });
    this.initialized = true; this.app.stop();
    if (this.disposed || signal.aborted) { this.app.destroy({ removeView: false }, { children: true }); this.initialized = false; throw new DOMException('已离开山路', 'AbortError'); }
    const pack = await this.people.initial(signal); if (this.disposed || signal.aborted) throw new DOMException('已离开山路', 'AbortError'); this.use(pack);
    this.app.stage.addChild(this.sky, this.world, this.shade, this.weather); this.world.addChild(this.terrain); landscape(this.terrain, 1, 1); this.world.addChild(this.lamp);
    const shadow = new Graphics().ellipse(0, 1, 12, 3).fill({ color: '#304942', alpha: .2 }); this.walker.addChild(shadow, this.figure); this.world.addChild(this.walker, this.transport);
    this.transport.roundRect(-22, -27, 44, 22, 5).fill('#76918a');
    this.transport.roundRect(-17, -23, 30, 10, 2).fill('#d7e4d9');
    this.transport.circle(-12, -4, 5).circle(13, -4, 5).fill('#50695e');
  }
  resize(width: number, height: number): void {
    this.width = width; this.height = height; this.camera.resize(width, height);
    if (this.initialized) { this.app.renderer.resolution = Math.min(2, devicePixelRatio || 1, Math.sqrt(3000000 / Math.max(1, width * height))); this.app.renderer.resize(width, height); }
  }
  paint(journey: AotaiJourney, dt: number, reduced: boolean): Projection {
    const overview = this.mode === 'overview' ? overviewCamera(this.width, this.height) : null;
    const z = overview ? overview.scaleX : this.width < 650 ? .73 : Math.min(1.1, this.height / 640), zy = overview?.scaleY ?? z;
    const detailAspect = zy / z;
    if (Math.abs(this.terrainAspect - detailAspect) > .001 || this.terrainScale !== z) { for (const child of this.terrain.removeChildren()) child.destroy(); landscape(this.terrain, detailAspect, z); this.terrainAspect = detailAspect; this.terrainScale = z; }
    const p = journey.point, ahead = path.sample(journey.at + 95), target = overview?.center ?? { x: p.x + (ahead.x - p.x) * .55 + this.width * .07 / z, y: p.y - this.height * .05 / zy };
    const projection = this.camera.project({ center: target, scaleX: z, scaleY: zy }, dt, reduced);
    this.world.scale.set(projection.scaleX, projection.scaleY); this.world.position.set(projection.x, projection.y);
    this.sky.clear().rect(0, 0, this.width, this.height).fill('#e0e9e8');
    this.sky.circle(this.width * .75, this.height * .12, 35).fill({ color: '#f7edca', alpha: .57 });
    if (journey.moving) this.frame = Math.floor(journey.stride % 1 * this.walk.length);
    const resting = journey.resting, phase = journey.phase;
    const pose = resting ? phase.kind === 'dawn' ? phase.elapsed < 1.6 ? 3 : phase.elapsed < 3.2 ? 1 : 0 : phase.kind === 'resting' && phase.elapsed < 1.2 ? 0 : phase.kind === 'resting' && phase.elapsed < 2.4 ? 1 : phase.kind === 'resting' && phase.elapsed > 5 ? 3 : 2 : this.frame;
    this.figure.show(resting ? this.rest[pose] : this.walk[this.frame], dt, resting, reduced);
    const side = Math.cos(journey.heading);
    if (journey.moving && Math.abs(side) > .45 && Math.sign(side) !== this.facing) { this.turnTime += dt; if (this.turnTime > .25) { this.facing = Math.sign(side); this.turnTime = 0; } } else this.turnTime = 0;
    const size = mapCharacterScale(projection);
    this.walker.position.set(p.x, p.y); this.walker.scale.set(this.facing * size.x, size.y);
    this.figure.rotation = journey.moving ? clamp(path.slope(journey.at) * .11 * this.facing, -.09, .09) : 0;
    this.walker.visible = phase.kind !== 'transfer'; this.transport.visible = phase.kind === 'transfer';
    this.transport.position.set(p.x, p.y); this.transport.scale.set(size.x, size.y);
    this.lamp.clear(); if (journey.night > .1 && journey.camp) { const c = PLACES[journey.camp]; this.lamp.ellipse(c.x - 46, c.y + 5 / detailAspect, 6, 9 / detailAspect).fill({ color: '#f2ce83', alpha: journey.night * .8 }); }
    this.shade.clear().rect(0, 0, this.width, this.height).fill({ color: '#1f354f', alpha: journey.night * .69 });
    this.weather.clear();
    const fogBand = journey.mist ? .8 : .1, fog = .035 + fogBand * .13;
    for (let i = 0; i < 6; i++) { const x = ((i * 343 + (reduced ? 0 : journey.clock * 3)) % (this.width + 500)) - 250, y = 85 + i % 3 * 58; this.weather.ellipse(x, y, 160 + i * 13, 22 + i * 2).fill({ color: '#f5f5e9', alpha: fog }); }
    if (journey.night > .3) for (let i = 0; i < 48; i++) this.weather.circle(noise(i + 23) * this.width, noise(i + 98) * this.height * .37, i % 7 ? .7 : 1.2).fill({ color: '#f7ebcc', alpha: journey.night * .65 });
    if (!reduced && journey.at > path.at('baiqi') && journey.at < path.at('xiaban')) for (let i = 0; i < (journey.mist ? 26 : 9); i++) { const t = reduced ? i / 26 : (i * .137 + journey.clock * .025) % 1; this.weather.circle((noise(i + 32) * this.width + t * 60) % this.width, t * this.height, i % 4 ? .8 : 1.5).fill({ color: '#f7f8ed', alpha: .6 }); }
    this.app.render(); return projection;
  }
  destroy(): void { if (this.disposed) return; this.disposed = true; if (this.initialized) this.app.destroy({ removeView: false }, { children: true, texture: false, textureSource: false }); this.people.destroy(); }
}
