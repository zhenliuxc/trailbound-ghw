import type { ImageCache, MiniInput, MiniViewRefs } from '../contracts';
import { boatRope, crabPoint, DOCK, HEIGHT, logClear, POST, WIDTH, type CoastMemoryId, type CoastMemoryState, type Point } from './model';
import { BIRDS, birdsongLayout, type Birdsong } from './birdsong';
import { coverCamera } from '../projection';

interface Frame { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
const FRAMES = {
  crab: { x: 43, y: 166, width: 502, height: 272 },
  horizontal: { x: 581, y: 238, width: 684, height: 178 },
  vertical: { x: 1308, y: 10, width: 139, height: 572 },
  boat: { x: 37, y: 653, width: 686, height: 278 },
  rope: { x: 769, y: 611, width: 426, height: 340 },
  post: { x: 1253, y: 601, width: 242, height: 392 },
} satisfies Record<string, Frame>;
export const PROPS = 'scenes/maclehose-games-v5/props.webp';
export const PHONE_SCENE = 'scenes/maclehose-echo-v9/forest-phone.webp';
export const propsFile = (id: CoastMemoryId): string => id === 'maclehose-woodland-echo' ? 'scenes/maclehose-echo-v9/birds.webp' : PROPS;
export const sceneFile = (id: CoastMemoryId): string => id === 'maclehose-woodland-echo' ? 'scenes/maclehose-echo-v9/forest.webp' : `scenes/maclehose-games-v5/${id === 'coast-pier' ? 'pier' : 'beach'}.webp`;
const BIRD_FRAMES = [
  { x: 0, y: 64, width: 550, height: 540, footX: 355, footY: 504 },
  { x: 570, y: 64, width: 480, height: 540, footX: 174, footY: 493 },
  { x: 1050, y: 64, width: 486, height: 540, footX: 188, footY: 493 },
];
type Ctx = CanvasRenderingContext2D;
function pencil(ctx: Ctx, a: Point, b: Point): void {
  const angle = Math.atan2(b.y - a.y, b.x - a.x); ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [color, width] of [['#fff9e4c9', 6], ['#716e56b0', 2]] satisfies readonly (readonly [string, number])[]) {
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo((a.x + b.x) / 2 + 8, (a.y + b.y) / 2, b.x, b.y);
    ctx.moveTo(b.x - Math.cos(angle - .6) * 13, b.y - Math.sin(angle - .6) * 13); ctx.lineTo(b.x, b.y); ctx.lineTo(b.x - Math.cos(angle + .6) * 13, b.y - Math.sin(angle + .6) * 13); ctx.stroke();
  }
  ctx.restore();
}
export class CoastMemoryView implements MiniViewRefs {
  readonly directInput = true; readonly canvas: HTMLCanvasElement;
  contentState: 'loading' | 'ready' | 'error' = 'loading'; disposed = false;
  private readonly pending = new AbortController(); private observer: ResizeObserver | null = null; private host: HTMLElement | null = null;
  private scene: HTMLImageElement | null = null; private phoneScene: HTMLImageElement | null = null; private props: HTMLImageElement | null = null; private state: CoastMemoryState | null = null;
  private readonly repeat: HTMLButtonElement | null;
  private focus: Point | null = null; private paintedAt = 0;
  constructor(readonly id: CoastMemoryId, private readonly doc: Document, onAction: (name: string) => void) {
    this.canvas = doc.createElement('canvas'); this.canvas.className = 'coast-memory-canvas'; this.canvas.setAttribute('aria-hidden', 'true');
    this.repeat = id === 'maclehose-woodland-echo' ? doc.createElement('button') : null;
    if (this.repeat) {
      const repeat = this.repeat; repeat.type = 'button'; repeat.className = 'coast-echo-repeat'; repeat.textContent = '再听一遍'; repeat.disabled = true;
      repeat.addEventListener('pointerdown', event => event.stopPropagation(), { signal: this.pending.signal });
      repeat.addEventListener('keydown', event => { if (event.key === ' ' || event.key === 'Enter') event.stopPropagation(); }, { signal: this.pending.signal });
      repeat.addEventListener('click', event => { event.stopPropagation(); onAction('echo-repeat'); }, { signal: this.pending.signal });
    }
  }
  private resize(): void {
    if (!this.host || this.disposed) return;
    const rect = this.host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1, Math.sqrt(2400000 / Math.max(1, rect.width * rect.height)));
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr)); this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    if (this.state) this.paint(this.state);
  }
  async mount(host: HTMLElement, cache?: ImageCache): Promise<void> {
    this.host = host; host.append(this.canvas); if (this.repeat) this.doc.getElementById('mini-controls')?.append(this.repeat); this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host); this.resize();
    const { signal } = this.pending;
    const load = (file: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
      const entry = cache?.request(file, 'high'); let image: HTMLImageElement | null = null;
      const clean = () => { signal.removeEventListener('abort', abort); if (image) image.onload = image.onerror = null; };
      const abort = () => { clean(); reject(new DOMException('已离开海岸画作', 'AbortError')); };
      if (signal.aborted) { abort(); return; } signal.addEventListener('abort', abort, { once: true });
      if (entry) void entry.promise.then(asset => { if (signal.aborted) return; clean(); if (asset.state === 'ready') resolve(asset.image); else reject(new Error('海岸画作暂未展开')); });
      else { image = this.doc.createElement('img'); image.decoding = 'async'; image.onload = () => { if (!image) return; clean(); resolve(image); }; image.onerror = () => { clean(); reject(new Error('海岸画作暂未展开')); }; image.src = file; }
    });
    try { const [scene, props, phone] = await Promise.all([load(sceneFile(this.id)), load(propsFile(this.id)), this.id === 'maclehose-woodland-echo' ? load(PHONE_SCENE) : Promise.resolve(null)]); if (this.disposed || signal.aborted) return; this.scene = scene; this.props = props; this.phoneScene = phone; this.contentState = 'ready'; }
    catch { if (!this.disposed && !signal.aborted) this.contentState = 'error'; }
    if (!this.disposed) { host.setAttribute('aria-busy', String(this.contentState === 'loading')); if (this.state) this.paint(this.state); }
  }
  input(input: MiniInput): MiniInput {
    const rect = this.host?.getBoundingClientRect();
    if (!rect || typeof input.x !== 'number' || typeof input.y !== 'number') return input;
    const point = this.id === 'maclehose-woodland-echo'
      ? { x: input.x * WIDTH, y: input.y * birdsongLayout(rect.width, rect.height).height }
      : coverCamera(rect.width, rect.height, { width: WIDTH, height: HEIGHT }, this.focus ?? { x: WIDTH / 2, y: HEIGHT / 2 }).toWorld({ x: input.x * rect.width, y: input.y * rect.height });
    return { ...input, ...point, viewWidth: rect.width, viewHeight: rect.height };
  }
  private sprite(ctx: Ctx, name: keyof typeof FRAMES, at: Point, width: number, height: number, rotation = 0): void {
    if (!this.props) return; const frame = FRAMES[name], scale = Math.min(width / frame.width, height / frame.height), w = frame.width * scale, h = frame.height * scale;
    ctx.save(); ctx.translate(at.x, at.y); ctx.rotate(rotation); ctx.drawImage(this.props, frame.x, frame.y, frame.width, frame.height, -w / 2, -h / 2, w, h); ctx.restore();
  }
  private shadow(ctx: Ctx, at: Point, rx: number, ry: number): void { ctx.save(); ctx.fillStyle = '#675d3b24'; ctx.beginPath(); ctx.ellipse(at.x + 2, at.y + 6, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  private driftwood(ctx: Ctx, s: CoastMemoryState): void {
    const p = s.session; if (p.kind !== 'driftwood') return;
    ctx.save(); ctx.fillStyle = '#8b745342';
    for (let i = 0; i < Math.floor(p.crab * 36); i++) { const at = crabPoint(i / 36); for (const side of [-1, 1]) { ctx.beginPath(); ctx.ellipse(at.x, at.y + side * 18, 2.8, 1.4, side * .6, 0, Math.PI * 2); ctx.fill(); } }
    for (const [index, log] of p.logs.entries()) {
      this.shadow(ctx, { x: log.x, y: log.y + log.height * .22 }, log.width * .53, log.height * .19);
      this.sprite(ctx, log.axis, log, log.width, log.height);
      if (p.drag?.index === index) { ctx.strokeStyle = '#90775342'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(log.x - 12, log.y + log.height / 2 + 9); ctx.quadraticCurveTo(log.x, log.y + log.height / 2 + 13, log.x + 12, log.y + log.height / 2 + 9); ctx.stroke(); }
    }
    const at = crabPoint(p.crab), gait = s.play.reduced || !p.moving ? 0 : Math.sin(s.age * 17);
    this.shadow(ctx, { x: at.x, y: at.y + 12 }, 35, 6); this.sprite(ctx, 'crab', at, 92, 56, gait * .018);
    if (!s.acted || !s.dragging && p.crab < .03) { const log = p.logs.find(log => !logClear(log)); if (log) pencil(ctx, { x: log.x + log.width / 2 + 20, y: log.y - 20 }, { x: log.x + log.width / 2 + 20, y: log.y + 38 }); }
    ctx.restore();
  }
  private rope(ctx: Ctx, a: Point, b: Point, taut: boolean): void {
    ctx.save(); ctx.lineCap = 'round';
    for (const [color, width] of [['#79684eaa', 5], ['#e0c89f', 3], ['#f7e6c76b', 1]] satisfies readonly (readonly [string, number])[]) {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + (taut ? 4 : 15), b.x, b.y); ctx.stroke();
    }
    ctx.restore();
  }
  private mooring(ctx: Ctx, s: CoastMemoryState): void {
    const p = s.session; if (p.kind !== 'mooring') return;
    const phase = p.phase, boat = p.boat, reduced = s.play.reduced;
    ctx.save();
    for (let i = 0; i < 16; i++) { const x = 460 + i * 31 % 470, y = 220 + i * 59 % 380; ctx.strokeStyle = '#f6f4dc48'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 28, y + (reduced ? 0 : Math.sin(s.age * .6 + i) * 2.4), x + 57, y - 1); ctx.stroke(); }
    ctx.fillStyle = '#2e77714a'; ctx.beginPath(); ctx.ellipse(boat.x + 7, boat.y + 21, 103, 16, -.04, 0, Math.PI * 2); ctx.fill();
    const speed = phase.kind === 'sailing' ? Math.hypot(phase.velocity.x, phase.velocity.y) : 0;
    if (!reduced) for (let i = 0; i < 3; i++) { const t = (s.age * .24 + i / 3) % 1; ctx.strokeStyle = `rgba(240,240,214,${(1 - t) * (speed > 8 ? .38 : .14)})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(boat.x + 7, boat.y + 22, 100 + t * 42, 15 + t * 13, -.04, 0, Math.PI * 2); ctx.stroke(); }
    this.sprite(ctx, 'boat', boat, 202, 86, reduced || s.dragging ? 0 : Math.sin(s.age * 1.05) * .006);
    const root = boatRope(boat);
    if (phase.kind === 'rope') {
      if (phase.holding) this.rope(ctx, root, phase.end, false);
      this.sprite(ctx, 'rope', phase.holding ? phase.end : root, 37, 31);
      if (!phase.holding) pencil(ctx, { x: root.x - 10, y: root.y - 25 }, { x: POST.x + 19, y: POST.y - 5 });
    } else if (phase.kind === 'tied') this.rope(ctx, root, { x: POST.x, y: POST.y + 4 }, true);
    else { this.sprite(ctx, 'rope', root, 35, 30); if (!s.acted) pencil(ctx, { x: boat.x - 100, y: boat.y + 64 }, { x: DOCK.x + 25, y: DOCK.y + 65 }); }
    this.sprite(ctx, 'post', POST, 36, 56);
    if (phase.kind === 'tied') { ctx.strokeStyle = '#e8d5ac'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(POST.x, POST.y + 3, 14, 5, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }
  private birdsong(ctx: Ctx, s: CoastMemoryState, p: Birdsong): void {
    if (!this.props) return;
    const cue = p.cue, layout = birdsongLayout(this.canvas.width, this.canvas.height);
    for (const bird of BIRDS) {
      const frame = BIRD_FRAMES[bird], perch = layout.perches[bird], calling = cue?.bird === bird;
      const pulse = calling ? Math.sin(Math.min(1, cue.age / .85) * Math.PI) : 0;
      ctx.save(); ctx.translate(perch.x, perch.y);
      const idle = s.play.reduced ? 0 : Math.sin(s.age * .7 + bird) * .006;
      ctx.rotate(s.play.reduced ? 0 : idle + pulse * (bird === 0 ? -.075 : .075));
      ctx.scale(layout.scale, layout.scale);
      ctx.drawImage(this.props, frame.x, frame.y, frame.width, frame.height, -frame.footX, -frame.footY, frame.width, frame.height);
      ctx.restore();
      if (calling) {
        const side = bird === 0 ? 1 : -1;
        ctx.save(); ctx.strokeStyle = cue.source === 'answer' ? '#547866' : '#576653'; ctx.lineWidth = 2.1; ctx.lineCap = 'round'; ctx.globalAlpha = s.play.reduced ? .9 : .3 + pulse * .7;
        for (let i = 0; i < 2; i++) {
          const x = perch.x + side * (50 + i * 10) * layout.scale / .25, y = perch.y - 101 * layout.scale / .25;
          ctx.beginPath(); ctx.moveTo(x, y - 6 - i * 3); ctx.quadraticCurveTo(x + side * 9, y, x, y + 6 + i * 3); ctx.stroke();
        }
        ctx.restore();
      }
    }
    if (!s.play.reduced) {
      ctx.save(); ctx.strokeStyle = '#b8bd86a8'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const x = 95 + i * 193, y = 130 + i % 2 * 400, drift = Math.sin(s.age * .75 + i) * 5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 12 + drift, y - 7, x + 23 + drift, y - 3); ctx.stroke();
      }
      ctx.restore();
    }
  }
  paint(s: CoastMemoryState): void {
    this.state = s; if (this.disposed) return; const ctx = this.canvas.getContext('2d'); if (!ctx) { this.contentState = 'error'; return; }
    const echo = s.session.kind === 'birdsong', layout = birdsongLayout(this.canvas.width, this.canvas.height), height = echo ? layout.height : HEIGHT;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (echo) ctx.setTransform(this.canvas.width / WIDTH, 0, 0, this.canvas.height / height, 0, 0);
    else {
      const target = s.session.kind === 'driftwood' ? { x: crabPoint(s.session.crab).x + 135, y: 440 }
        : s.session.kind === 'mooring' ? { x: (s.session.boat.x + DOCK.x) / 2 - 25, y: 390 } : { x: WIDTH / 2, y: HEIGHT / 2 };
      const elapsed = Math.max(0, s.age - this.paintedAt);
      if (!this.focus || s.age < this.paintedAt || s.play.reduced) this.focus = target;
      else if (!s.dragging) {
        const blend = 1 - Math.exp(-elapsed * 3);
        this.focus = { x: this.focus.x + (target.x - this.focus.x) * blend, y: this.focus.y + (target.y - this.focus.y) * blend };
      }
      this.paintedAt = s.age;
      const camera = coverCamera(this.canvas.width, this.canvas.height, { width: WIDTH, height: HEIGHT }, this.focus);
      ctx.setTransform(camera.scale, 0, 0, camera.scale, camera.x, camera.y);
    }
    ctx.fillStyle = '#e9e5d0'; ctx.fillRect(0, 0, WIDTH, height);
    const scene = echo && layout.portrait ? this.phoneScene : this.scene;
    if (scene) {
      if (echo && !layout.portrait) ctx.drawImage(scene, layout.camera.x, layout.camera.y, WIDTH * layout.camera.scale, HEIGHT * layout.camera.scale);
      else if (echo) { const cover = Math.max(WIDTH / scene.naturalWidth, height / scene.naturalHeight), w = scene.naturalWidth * cover, h = scene.naturalHeight * cover; ctx.drawImage(scene, (WIDTH - w) / 2, (height - h) / 2, w, h); }
      else ctx.drawImage(scene, 0, 0, WIDTH, height);
    }
    if (this.repeat && s.session.kind === 'birdsong') this.repeat.disabled = this.contentState !== 'ready' || s.play.complete || ['breath', 'leaving', 'finished'].includes(s.session.phase.kind);
    if (this.contentState === 'ready') {
      if (s.session.kind === 'driftwood') this.driftwood(ctx, s);
      else if (s.session.kind === 'mooring') this.mooring(ctx, s);
      else this.birdsong(ctx, s, s.session);
    }
  }
  dispose(): void { if (this.disposed) return; this.disposed = true; this.pending.abort(); this.observer?.disconnect(); this.canvas.remove(); this.repeat?.remove(); this.canvas.width = this.canvas.height = 1; this.scene = this.props = this.phoneScene = null; this.state = null; this.host = null; }
}
export function viewOf(refs: MiniViewRefs): CoastMemoryView { if (!(refs instanceof CoastMemoryView)) throw new Error('海岸画作界面不匹配'); return refs; }
