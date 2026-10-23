import type { ImageCache, MiniInput, MiniViewRefs } from '../../contracts';
import { CHARACTERS, characterId, readCharacterId, type CharacterId } from '../../../characters/catalog';
import { SHOULDER_POSES } from './pose-art.generated';
import { actorPoint, clamp, FOOTHOLDS, mix, SCENE, STEP_TIME, type Point, type ShoulderState } from './model';
import { shoulderCamera } from './layout';

export const ART_ROOT = 'scenes/maclehose-saiwan-v13/';
type Ctx = CanvasRenderingContext2D;
interface Images { panorama: HTMLImageElement; terrain: HTMLImageElement; shoulder: HTMLImageElement; poses: HTMLImageElement; walk: HTMLImageElement }
export class ShoulderView implements MiniViewRefs {
  readonly directInput = true; readonly canvas: HTMLCanvasElement;
  contentState: 'loading' | 'ready' | 'error' = 'loading'; disposed = false;
  readonly character: CharacterId;
  private readonly lifecycle = new AbortController();
  private observer: ResizeObserver | null = null;
  private host: HTMLElement | null = null; private images: Images | null = null; private state: ShoulderState | null = null;
  private width = 1000; private height = 563;
  constructor(private readonly doc: Document) {
    this.character = characterId(new URLSearchParams(doc.defaultView?.location.search).get('character')) ?? readCharacterId();
    this.canvas = doc.createElement('canvas'); this.canvas.className = 'coast-memory-canvas saiwan-steps-canvas'; this.canvas.setAttribute('aria-hidden', 'true');
  }
  private resize(): void {
    if (!this.host || this.disposed) return;
    const r = this.host.getBoundingClientRect(); this.width = Math.max(1, r.width); this.height = Math.max(1, r.height);
    const ratio = Math.min(2, this.doc.defaultView?.devicePixelRatio || 1, Math.sqrt(2600000 / (this.width * this.height)));
    this.canvas.width = Math.max(1, Math.round(this.width * ratio)); this.canvas.height = Math.max(1, Math.round(this.height * ratio));
    if (this.state) this.paint(this.state);
  }
  async mount(host: HTMLElement, cache?: ImageCache): Promise<void> {
    this.host = host; host.append(this.canvas); this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host); this.resize();
    const { signal } = this.lifecycle;
    const load = (file: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
      const asset = cache?.request(file, 'high'); let image: HTMLImageElement | null = null;
      const clean = () => { signal.removeEventListener('abort', abort); if (image) image.onload = image.onerror = null; };
      const abort = () => { clean(); reject(new DOMException('已离开西湾山', 'AbortError')); };
      if (signal.aborted) { abort(); return; } signal.addEventListener('abort', abort, { once: true });
      if (asset) void asset.promise.then(entry => { if (signal.aborted) return; clean(); if (entry.state === 'ready') resolve(entry.image); else reject(new Error('山海画作暂未展开')); });
      else { image = this.doc.createElement('img'); image.decoding = 'async'; image.onload = () => { if (!image) return; clean(); resolve(image); }; image.onerror = () => { clean(); reject(new Error('山海画作暂未展开')); }; image.src = file; }
    });
    try {
      if (!this.canvas.getContext('2d')) throw new Error('画面暂不支持绘制');
      const [panorama, terrain, shoulder, poses, walk] = await Promise.all([
        load(ART_ROOT + 'panorama.webp'), load(ART_ROOT + 'terrain.webp'), load(ART_ROOT + 'shoulder.webp'),
        load(ART_ROOT + `${this.character}-poses.webp`), load(CHARACTERS[this.character].walk.file),
      ]);
      if (this.disposed || signal.aborted) return;
      this.images = { panorama, terrain, shoulder, poses, walk }; this.contentState = 'ready';
    } catch { if (!this.disposed && !signal.aborted) this.contentState = 'error'; }
    if (!this.disposed) { host.setAttribute('aria-busy', 'false'); if (this.state) this.paint(this.state); }
  }
  input(input: MiniInput): MiniInput {
    if (!this.state || typeof input.x !== 'number' || typeof input.y !== 'number') return input;
    const world = shoulderCamera(this.state, this.width, this.height).toWorld({ x: input.x * this.width, y: input.y * this.height });
    return { ...input, x: world.x, y: world.y, viewWidth: this.width, viewHeight: this.height };
  }
  private person(ctx: Ctx, s: ShoulderState): void {
    if (!this.images) return;
    const phase = s.phase, at = actorPoint(s), poses = SHOULDER_POSES[this.character];
    let index: number, facing = 1, walking = false;
    if (phase.kind === 'climbing') {
      const t = clamp(phase.elapsed / STEP_TIME); facing = FOOTHOLDS[phase.to].x < FOOTHOLDS[s.step].x ? -1 : 1;
      walking = phase.to > 5;
      index = walking ? Math.floor(s.age * 9) % 8 : (phase.to % 2 ? 0 : 2) + (t >= .56 ? 1 : 0);
    } else { index = 4; if (phase.kind === 'ready') facing = -1; }
    const standingHeight = (poses[0].height + poses[1].height + poses[2].height + poses[3].height) / 4;
    const scale = 128 / standingHeight;
    ctx.save(); ctx.translate(at.x, at.y);
    ctx.fillStyle = '#3e514a30'; ctx.beginPath(); ctx.ellipse(0, 3, 21, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.scale(facing, 1);
    if (walking) {
      const appearance = CHARACTERS[this.character].walk, frame = appearance.frames[index], walkScale = 128 / appearance.frames[0].height;
      ctx.drawImage(this.images.walk, frame.x, frame.y, frame.width, frame.height, -frame.footX * walkScale, -frame.footY * walkScale, frame.width * walkScale, frame.height * walkScale);
    } else {
      const frame = poses[index]; ctx.drawImage(this.images.poses, frame.x, frame.y, frame.width, frame.height, -frame.footX * scale, -frame.footY * scale, frame.width * scale, frame.height * scale);
    }
    ctx.restore();
  }
  private footprint(ctx: Ctx, at: Point, strength: number, facing: number): void {
    ctx.save(); ctx.translate(at.x, at.y); ctx.rotate(facing < 0 ? -.35 : .35); ctx.globalAlpha = strength;
    ctx.fillStyle = '#66725c'; ctx.beginPath(); ctx.ellipse(0, -3, 5, 11, .1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f9edcc'; ctx.beginPath(); ctx.ellipse(0, -5, 2.3, 6, .1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  private hints(ctx: Ctx, s: ShoulderState): void {
    if (s.phase.kind === 'ready') {
      const next = FOOTHOLDS[1], hint = s.hover || s.phase.idle > 2.5;
      if (hint) this.footprint(ctx, next, s.hover ? .54 : .28 + (s.play.reduced ? 0 : Math.sin(s.age * 1.5) * .05), next.x - FOOTHOLDS[s.step].x);
    }
  }
  private sea(ctx: Ctx, s: ShoulderState): void {
    if (s.play.reduced) return;
    ctx.save(); ctx.strokeStyle = '#e1f0e979'; ctx.lineWidth = 1;
    for (let i = 0; i < 13; i++) {
      const x = 1290 + i * 87 % 355, y = 323 + i * 13 % 78, drift = Math.sin(s.age * .45 + i) * 3;
      ctx.globalAlpha = .24 + Math.sin(s.age * .6 + i) * .1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 11 + drift, y - 2, x + 28 + drift, y - 1); ctx.stroke();
    }
    ctx.restore();
  }
  paint(s: ShoulderState): void {
    this.state = s; if (this.disposed) return;
    const ctx = this.canvas.getContext('2d'); if (!ctx) { this.contentState = 'error'; return; }
    ctx.setTransform(this.canvas.width / this.width, 0, 0, this.canvas.height / this.height, 0, 0);
    ctx.fillStyle = '#f0ecdc'; ctx.fillRect(0, 0, this.width, this.height);
    if (!this.images) return;
    const camera = shoulderCamera(s, this.width, this.height), reveal = s.cameraProgress;
    ctx.save(); ctx.translate(camera.x, camera.y); ctx.scale(camera.scale, camera.scale);
    ctx.drawImage(this.images.panorama, 0, 0, SCENE.width, SCENE.height); this.sea(ctx, s);
    ctx.save(); ctx.translate(mix(0, -90, reveal), 0); ctx.scale(mix(1.1, 1, reveal), mix(1.1, 1, reveal)); ctx.drawImage(this.images.shoulder, 0, 0, SCENE.width, SCENE.height); ctx.restore();
    ctx.drawImage(this.images.terrain, 0, 0, SCENE.width, SCENE.height);
    this.hints(ctx, s); this.person(ctx, s);
    if (s.phase.kind === 'climbing' && s.phase.landed && !s.play.reduced) {
      const at = actorPoint(s), t = clamp((s.phase.elapsed / STEP_TIME - .82) / .18);
      ctx.save(); ctx.globalAlpha = (1 - t) * .2; ctx.fillStyle = '#c4b694';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(at.x + (i - 1.5) * (5 + t * 7), at.y - t * (3 + i % 2 * 3), 1.2, 0, Math.PI * 2); ctx.fill(); } ctx.restore();
    }
    ctx.restore();
    this.host?.setAttribute('data-scene-ready', String(this.contentState === 'ready'));
  }
  dispose(): void { if (this.disposed) return; this.disposed = true; this.lifecycle.abort(); this.observer?.disconnect(); this.canvas.remove(); this.canvas.width = this.canvas.height = 1; this.images = null; this.state = null; this.host = null; }
}
export function shoulderView(refs: MiniViewRefs): ShoulderView { if (!(refs instanceof ShoulderView)) throw new Error('西湾山画面不匹配'); return refs; }
