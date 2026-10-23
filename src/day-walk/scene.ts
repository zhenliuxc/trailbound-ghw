import { Application, Container, Graphics } from 'pixi.js';
import { CharacterFigure, CharacterLibrary, type CharacterSprite } from '../characters/pixi';
import { DEFAULT_CHARACTER, type CharacterId } from '../characters/catalog';
import { MapCamera, mapCharacterScale, type MapProjection, type MapView } from '../journey/map-camera';
import { WalkingTurn } from '../journey/walking-turn';
import { clamp } from '../wugong-walk/model';
import type { DayJourney, DayTrail } from '../journey/day-route';
import { drawLandscape, noise } from './landscape';
import type { LandscapeEffects } from './landscape/effects';

export class DayScene {
  private readonly app = new Application();
  private readonly world = new Container();
  private readonly sky = new Graphics();
  private readonly atmosphere = new Graphics();
  private readonly walker = new Container();
  private readonly figure = new CharacterFigure();
  private readonly people = new CharacterLibrary();
  private readonly camera = new MapCamera();
  private readonly turning: WalkingTurn;
  private landscape: LandscapeEffects | undefined;
  private walk: readonly CharacterSprite[] = [];
  private actions: readonly CharacterSprite[] = [];
  private contacts: readonly number[] = [];
  private selected: CharacterId = DEFAULT_CHARACTER;
  private width = 1200; private height = 650;
  private initialized = false; private disposed = false;
  constructor(private readonly canvas: HTMLCanvasElement, private readonly trail: DayTrail) { this.turning = new WalkingTurn(trail.heading(0)); }
  get character(): CharacterId { return this.selected; }
  get mode(): MapView { return this.camera.mode; }
  set mode(value: MapView) { this.camera.mode = value; }
  private use(pack: Awaited<ReturnType<CharacterLibrary['load']>>): void {
    this.walk = pack.walk; this.actions = pack.actions; this.contacts = pack.walk.map(frame => frame.contactX);
    this.selected = pack.id; this.figure.reset(); this.turning.resetFooting();
  }
  async setCharacter(id: CharacterId, signal: AbortSignal): Promise<void> {
    const pack = await this.people.load(id, signal);
    if (this.disposed || signal.aborted) throw new DOMException('已离开选角', 'AbortError'); this.use(pack);
  }
  async load(signal: AbortSignal): Promise<void> {
    await this.app.init({ canvas: this.canvas, autoStart: false, sharedTicker: false, preference: 'webgl', antialias: true, background: '#dce3d1', autoDensity: true, resolution: Math.min(2, devicePixelRatio || 1), width: this.width, height: this.height });
    this.initialized = true; this.app.stop();
    if (this.disposed || signal.aborted) throw new DOMException('已离开山径', 'AbortError');
    const pack = await this.people.initial(signal);
    if (this.disposed || signal.aborted) throw new DOMException('已离开山径', 'AbortError'); this.use(pack);
    this.app.stage.addChild(this.world, this.sky, this.atmosphere);
    this.landscape = drawLandscape(this.world, this.trail.route, this.trail);
    this.walker.addChild(new Graphics().ellipse(0, 1, 12, 3).fill({ color: '#526953', alpha: .18 }), this.figure);
    this.world.addChild(this.walker);
  }
  resize(width: number, height: number): void {
    this.width = width; this.height = height; this.camera.resize(width, height);
    if (this.initialized) { this.app.renderer.resolution = Math.min(2, devicePixelRatio || 1, Math.sqrt(2800000 / Math.max(1, width * height))); this.app.renderer.resize(width, height); }
  }
  paint(journey: DayJourney, dt: number, reduced: boolean): MapProjection {
    const { width, height } = this.trail.route.world, at = journey.point;
    const fit = Math.min((this.width - 60) / width, (this.height - 112) / height);
    const zoom = this.mode === 'overview' ? Math.max(.06, fit) : this.width < 650 ? .5 : .73;
    const ahead = journey.ahead(120), hw = this.width / 2 / zoom, hh = this.height / 2 / zoom;
    const bounded = (value: number, half: number, extent: number) => half * 2 >= extent ? extent / 2 : clamp(value, half, extent - half);
    const center = this.mode === 'overview' ? { x: width / 2, y: height / 2 } : {
      x: bounded(at.x + (ahead.x - at.x) * .35 + this.width * .1 / zoom, hw, width),
      y: bounded(at.y + (ahead.y - at.y) * .25 + this.height * .04 / zoom, hh, height),
    };
    const projection = this.camera.project({ center, scaleX: zoom, scaleY: zoom }, dt, reduced);
    this.world.scale.set(projection.scaleX, projection.scaleY); this.world.position.set(projection.x, projection.y);
    this.landscape?.paint({ time: journey.clock, reducedMotion: reduced, weather: journey.weather.kind });
    this.turning.update({ at: journey.distance, stride: journey.stride, heading: journey.heading, forwardHeading: journey.forwardHeading, slope: journey.slope, moving: journey.moving }, dt, this.contacts, reduced);
    const rest = journey.phase.kind === 'paused' && journey.idle > 3 && Math.abs(this.trail.slope(journey.at)) < .12;
    this.figure.show(rest ? this.actions[2] : this.walk[this.turning.frame], dt, rest, reduced);
    const size = mapCharacterScale(projection);
    this.walker.position.set(at.x, at.y); this.walker.scale.set(size.x, size.y);
    this.figure.scale.set(this.turning.facing, 1); this.figure.rotation = this.turning.lean;
    this.figure.position.set(this.turning.offsetX, this.turning.offsetY);
    this.sky.clear();
    const horizon = Math.max(0, Math.min(60, projection.y + 80 * projection.scaleY));
    if (horizon > 0) this.sky.rect(0, 0, this.width, horizon).fill('#dce5df');
    this.atmosphere.clear();
    const weather = journey.weather.kind, time = reduced ? 0 : journey.clock;
    if (weather === 'fog') for (let i = 0; i < 5; i++) {
      const x = noise(i + 7) * this.width + Math.sin(time * .022 + i) * 12, y = this.height * (.22 + noise(i + 12) * .6);
      this.atmosphere.ellipse(x, y, this.width * .25, 17 + noise(i) * 14).fill({ color: '#f3f2e2', alpha: .11 });
    }
    if (weather === 'rain') for (let i = 0; i < 65; i++) {
      const x = noise(i + 45) * this.width, y = (noise(i + 83) * this.height + time * 100) % this.height;
      this.atmosphere.moveTo(x, y).lineTo(x - 3, y + 13).stroke({ color: '#eaf0db', width: 1, alpha: .3 });
    }
    for (let i = 0; i < 3; i++) {
      const x = this.width * (.25 + i * .33) + Math.sin(time * .013 + i) * 22, y = 25 + i % 2 * 13;
      this.atmosphere.ellipse(x, y, 70, 10).ellipse(x + 30, y - 5, 43, 13).fill({ color: '#faf7ea', alpha: .2 });
    }
    this.atmosphere.rect(0, 0, this.width, this.height).fill({ color: '#e6c78b', alpha: journey.progress * (this.trail.route.id === 'changping' ? .085 : .025) });
    this.app.render(); return projection;
  }
  destroy(): void {
    if (this.disposed) return; this.disposed = true;
    if (this.initialized) this.app.destroy({ removeView: false }, { children: true, texture: false, textureSource: false });
    this.landscape = undefined;
    this.people.destroy();
  }
}
