import { Application, Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js';
import { MAP_WALK_FILE, MAP_WALK_FRAMES, MAP_WALK_SCALE } from '../../runtime/map-walk-art';
import { clamp, mix } from '../model';
import type { EnvironmentFrame } from '../environment';
import { ScrollCamera, type ScrollProjection, type ScrollView } from './camera';
import type { ScrollJourney } from './journey';
import { ScrollTrail } from './route';
import { SchematicMap } from './schematic';
import { ScrollSky } from './sky';
import { CAMP_POSE_FILE, CAMP_POSES, CAMP_POSE_SCALE } from './camp-poses';

interface FigureFrame { texture: Texture; footX: number; footY: number; scale: number; contactX: number }

async function loadTexture(file: string, signal: AbortSignal): Promise<Texture> {
  const image = new Image(); image.decoding = 'async';
  await new Promise<void>((resolve, reject) => {
    const cleanup = () => { image.onload = null; image.onerror = null; signal.removeEventListener('abort', abort); };
    const abort = () => { cleanup(); image.src = ''; reject(new DOMException('Loading aborted', 'AbortError')); };
    image.onload = () => { cleanup(); resolve(); };
    image.onerror = () => { cleanup(); reject(new Error('人物素材暂未加载，点“重新展开山路”再试一次。')); };
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort, { once: true }); image.src = file;
  });
  return Texture.from(image);
}
function subtexture(texture: Texture, x: number, y: number, width: number, height: number): Texture {
  return new Texture({ source: texture.source, frame: new Rectangle(x, y, width, height) });
}
function softTexture(color: string): Texture {
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext('2d'); if (!ctx) return Texture.WHITE;
  ctx.scale(128, 32); ctx.translate(1, 1);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  gradient.addColorStop(0, color); gradient.addColorStop(1, 'transparent'); ctx.fillStyle = gradient; ctx.fillRect(-1, -1, 2, 2);
  return Texture.from(canvas);
}
export class ScrollScene {
  readonly camera = new ScrollCamera();
  private readonly app = new Application();
  private readonly textures: Texture[] = [];
  private readonly world = new Container();
  private readonly landscape: SchematicMap;
  private readonly sky: ScrollSky;
  private readonly atmosphere = new Container();
  private readonly shade = new Graphics();
  private readonly warmth = new Graphics();
  private readonly rain = new Graphics();
  private readonly stars = new Graphics();
  private readonly haze: Sprite[] = [];
  private readonly hiker = new Container();
  private readonly figure = new Sprite();
  private readonly shadow = new Sprite();
  private walk: FigureFrame[] = [];
  private actions: FigureFrame[] = [];
  private width = 1200;
  private height = 600;
  private initialized = false;
  private disposed = false;
  private angle = 0;
  private stillFrame = 1;
  private facing = 1;
  private turnTime = 0;
  constructor(private readonly canvas: HTMLCanvasElement, readonly trail: ScrollTrail) {
    this.landscape = new SchematicMap(trail); this.sky = new ScrollSky(trail);
  }
  get mode(): ScrollView { return this.camera.mode; }
  setMode(mode: ScrollView): void { this.camera.change(mode); }
  async load(signal: AbortSignal): Promise<void> {
    await this.app.init({ canvas: this.canvas, autoStart: false, sharedTicker: false, preference: 'webgl', antialias: true, background: '#f1eee1', autoDensity: true, resolution: Math.min(2, window.devicePixelRatio || 1), width: this.width, height: this.height });
    this.initialized = true; this.app.stop();
    if (signal.aborted || this.disposed) {
      this.app.destroy({ removeView: false }, { children: true }); this.initialized = false;
      throw new DOMException('Loading aborted', 'AbortError');
    }
    const [actions, walking] = await Promise.all([CAMP_POSE_FILE, MAP_WALK_FILE].map(file => loadTexture(file, signal).then(texture => { this.textures.push(texture); return texture; })));
    if (signal.aborted) throw new DOMException('Loading aborted', 'AbortError');
    this.sky.view.addChild(this.stars);
    this.app.stage.addChild(this.sky.view, this.world, this.atmosphere, this.warmth, this.shade, this.landscape.lights, this.rain);
    this.world.addChild(this.landscape.ground, this.landscape.subjects);
    const contactOffsets = [-3.74, 3.74, -.44, -4.92, -5.12, 2.83, -3.49, -4.95];
    this.walk = MAP_WALK_FRAMES.map(([x, y, width, height, footX, footY], i) => ({ texture: subtexture(walking, x, y, width, height), footX, footY, scale: MAP_WALK_SCALE, contactX: contactOffsets[i] }));
    this.actions = CAMP_POSES.map(pose => ({ texture: subtexture(actions, pose.x, pose.y, pose.width, pose.height), footX: pose.footX, footY: pose.footY, scale: CAMP_POSE_SCALE, contactX: 0 }));
    this.shadow.texture = softTexture('#31432a66'); this.textures.push(this.shadow.texture);
    this.shadow.anchor.set(.5); this.shadow.width = 28; this.shadow.height = 6;
    this.hiker.addChild(this.shadow, this.figure); this.landscape.subjects.addChild(this.hiker);
    const mist = softTexture('#eeeeda'); this.textures.push(mist);
    for (let i = 0; i < 8; i++) { const sprite = new Sprite(mist); sprite.anchor.set(.5); sprite.width = 420 + i * 60; sprite.height = 40; this.haze.push(sprite); this.atmosphere.addChild(sprite); }
  }
  resize(width: number, height: number): void {
    this.width = width; this.height = height; this.camera.resize(width, height);
    this.sky.resize(width, height);
    if (this.initialized) {
      const budget = width < 760 ? 1_500_000 : 4_000_000;
      this.app.renderer.resolution = Math.min(2, window.devicePixelRatio || 1, Math.sqrt(budget / (width * height)));
      this.app.renderer.resize(width, height);
    }
    this.warmth.clear().rect(0, 0, width, height).fill('#efc99a');
    this.shade.clear().rect(0, 0, width, height).fill('#233e58');
    this.shade.blendMode = 'multiply';
    this.stars.clear();
    for (let i = 0; i < 38; i++) this.stars.circle((i * 137.3) % width, (i * 61.7) % (height * .48), i % 7 === 0 ? 1.2 : .7).fill({ color: '#f6edcc', alpha: .4 + (i % 4) * .12 });
  }
  private showFigure(sprite: Sprite, frame: FigureFrame): void {
    sprite.texture = frame.texture; sprite.scale.set(frame.scale);
    sprite.pivot.set(frame.footX, frame.footY); sprite.position.set(0, 0);
  }
  private paintHiker(journey: ScrollJourney, dt: number, reduced: boolean): void {
    const pose = journey.pose;
    let a = this.walk[this.stillFrame];
    if (journey.moving) {
      const phase = (journey.phase % 1) * 8, index = Math.floor(phase);
      this.stillFrame = index; a = this.walk[index];
    } else if (pose.kind === 'unpacking') {
      a = this.actions[pose.elapsed < .45 ? 0 : 1];
    } else if (pose.kind === 'sitting') {
      a = this.actions[pose.elapsed < .45 ? 1 : 2];
    } else if (pose.kind === 'standing') {
      a = this.actions[pose.elapsed < .65 ? 2 : 1];
    } else if (pose.kind === 'packing') {
      a = this.actions[pose.elapsed < .65 ? 1 : 0];
    } else if (pose.kind === 'sleeping' || pose.kind === 'waking') {
      a = this.actions[2];
    } else if (pose.kind === 'resting') {
      const t = pose.elapsed % 12;
      a = this.actions[t > 1.6 && t < 3.8 ? 3 : 2];
    }
    this.showFigure(this.figure, a); this.figure.alpha = 1;
    const point = journey.point;
    this.hiker.alpha = pose.kind === 'sleeping' ? 1 - clamp(pose.elapsed / .7) : pose.kind === 'waking' ? clamp(pose.elapsed / 1.5) : 1;
    const lean = journey.moving ? clamp(-journey.angle * .14, -.06, .11) : 0;
    this.angle = mix(this.angle, lean, reduced ? 1 : 1 - Math.exp(-dt * 5));
    this.figure.rotation = this.angle;
    const direction = Math.cos(this.trail.heading(journey.travel));
    if (journey.moving && Math.abs(direction) > .38 && Math.sign(direction) !== this.facing) {
      this.turnTime += dt;
      if (this.turnTime > .24) { this.facing = Math.sign(direction); this.turnTime = 0; }
    } else this.turnTime = 0;
    this.hiker.scale.set(this.facing, 1);
    const contactX = a.contactX;
    const groundY = this.trail.soleOffset(journey.travel, contactX);
    this.hiker.position.set(point.x, point.y + groundY); this.hiker.zIndex = point.y;
    this.shadow.rotation = this.trail.heading(journey.travel); this.shadow.alpha = pose.kind === 'resting' || pose.kind === 'sitting' ? .45 : .7;
  }
  paint(journey: ScrollJourney, environment: EnvironmentFrame, dt: number, reduced: boolean): ScrollProjection {
    const p = this.camera.advance(journey, dt, reduced);
    this.world.position.set(p.x, p.y); this.world.scale.set(p.scale);
    this.landscape.lights.position.set(p.x, p.y); this.landscape.lights.scale.set(p.scale);
    const elapsed = reduced ? 0 : environment.elapsed;
    this.sky.paint(p, environment, reduced);
    this.landscape.paint(environment, reduced, journey);
    this.paintHiker(journey, dt, reduced);
    this.warmth.alpha = environment.warmth * .22;
    this.shade.alpha = environment.night * .66 + environment.cloud * .08;
    this.stars.alpha = environment.night * .8;
    for (const [i, haze] of this.haze.entries()) {
      const at = this.trail.sample((i + .5) / this.haze.length * this.trail.length);
      const point = p.toScreen({ x: at.x + Math.sin(elapsed * .028 + i) * 45, y: at.y + 140 + (i % 2) * 90 });
      const cleared = journey.hasCollected('clouds') ? 1 - clamp((journey.travel - journey.events.clouds.travel) / 340) : 0;
      haze.position.set(point.x, point.y); haze.alpha = (.018 + environment.fog * .32) * (1 - cleared * .70); haze.width = (400 + i * 55) * p.scale; haze.height = (34 + environment.fog * 88) * p.scale;
    }
    this.rain.clear();
    if (environment.rain > .04) {
      const count = Math.floor((this.width < 760 ? 60 : 115) * environment.rain);
      for (let i = 0; i < count; i++) {
        const x = (i * 173.7 + elapsed * 13) % (this.width + 24), y = (i * 91.3 + elapsed * 180) % (this.height + 20);
        this.rain.moveTo(x, y).lineTo(x - 2, y + (reduced ? 3 : 8));
      }
      this.rain.stroke({ color: '#e9eee5', alpha: .58, width: 1 });
    }
    this.app.render(); return p;
  }
  destroy(): void {
    if (this.disposed) return; this.disposed = true;
    if (this.initialized) this.app.destroy({ removeView: false }, { children: true, texture: false, textureSource: false });
    this.sky.destroy();
    for (const texture of this.textures) if (texture !== Texture.WHITE) texture.destroy(true);
  }
}
