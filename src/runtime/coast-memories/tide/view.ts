import type { ImageCache, MiniInput, MiniViewRefs } from '../../contracts';
import { coverCamera, type Point2D } from '../../projection';
import { SAND, shoreY, WASH_TIME, type TideState } from './model';

export const TIDE_SCENE = 'scenes/maclehose-games-v5/beach.webp';
export const tideCamera = (width: number, height: number) => coverCamera(width, height, { width: 1000, height: 667 }, { x: 590, y: 275 });
type Ctx = CanvasRenderingContext2D;

export class TideView implements MiniViewRefs {
  readonly directInput = true; readonly canvas: HTMLCanvasElement;
  contentState: 'loading' | 'ready' | 'error' = 'loading'; disposed = false;
  private observer: ResizeObserver | null = null; private host: HTMLElement | null = null;
  private image: HTMLImageElement | null = null; private state: TideState | null = null;
  private width = 1000; private height = 667; private pending = new AbortController();
  constructor(private readonly doc: Document) {
    this.canvas = doc.createElement('canvas'); this.canvas.className = 'coast-memory-canvas'; this.canvas.setAttribute('aria-hidden', 'true');
  }
  private resize(): void {
    if (!this.host || this.disposed) return;
    const rect = this.host.getBoundingClientRect(); this.width = Math.max(1, rect.width); this.height = Math.max(1, rect.height);
    const dpr = Math.min(2, this.doc.defaultView?.devicePixelRatio || 1, Math.sqrt(2600000 / (this.width * this.height)));
    this.canvas.width = Math.max(1, Math.round(this.width * dpr)); this.canvas.height = Math.max(1, Math.round(this.height * dpr));
    if (this.state) this.paint(this.state);
  }
  async mount(host: HTMLElement, cache?: ImageCache): Promise<void> {
    this.host = host; host.append(this.canvas); this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host); this.resize();
    try {
      const asset = cache?.request(TIDE_SCENE, 'high');
      if (asset) {
        const loaded = await asset.promise;
        if (loaded.state !== 'ready') throw new Error('海滩画作暂未展开');
        this.image = loaded.image;
      } else this.image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = this.doc.createElement('img'), { signal } = this.pending;
        const cleanup = () => { image.onload = image.onerror = null; signal.removeEventListener('abort', abort); };
        const abort = () => { cleanup(); reject(new DOMException('已离开海滩', 'AbortError')); };
        if (signal.aborted) { abort(); return; }
        signal.addEventListener('abort', abort, { once: true }); image.decoding = 'async';
        image.onload = () => { cleanup(); resolve(image); }; image.onerror = () => { cleanup(); reject(new Error('海滩画作暂未展开')); }; image.src = TIDE_SCENE;
      });
      if (!this.disposed) this.contentState = this.canvas.getContext('2d') ? 'ready' : 'error';
    } catch { if (!this.disposed) this.contentState = 'error'; }
    if (!this.disposed) { host.setAttribute('aria-busy', 'false'); if (this.state) this.paint(this.state); }
    else this.image = null;
  }
  input(input: MiniInput): MiniInput {
    if (typeof input.x !== 'number' || typeof input.y !== 'number') return input;
    return { ...input, ...tideCamera(this.width, this.height).toWorld({ x: input.x * this.width, y: input.y * this.height }) };
  }
  private sand(ctx: Ctx): void {
    ctx.beginPath(); SAND.forEach((point, i) => i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.closePath();
  }
  private path(ctx: Ctx, stroke: readonly Point2D[]): void {
    if (!stroke.length) return;
    ctx.beginPath(); ctx.moveTo(stroke[0].x, stroke[0].y);
    if (stroke.length === 1) ctx.lineTo(stroke[0].x + .5, stroke[0].y);
    for (let i = 1; i < stroke.length; i++) {
      const point = stroke[i], next = stroke[i + 1];
      if (next) ctx.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }
  private ink(ctx: Ctx, state: TideState): void {
    ctx.save(); ctx.lineJoin = ctx.lineCap = 'round';
    for (const [color, width, dx, dy] of [['#87694242',6,1,1.5], ['#89633f',3.7,0,0], ['#5e482b99',1.3,0,.3], ['#fff0caaa',.8,-.7,-1.5]] satisfies readonly (readonly [string, number, number, number])[]) {
      ctx.save(); ctx.translate(dx, dy); ctx.strokeStyle = color; ctx.lineWidth = width;
      for (const stroke of state.strokes) this.path(ctx, stroke);
      ctx.restore();
    }
    ctx.restore();
  }
  paint(state: TideState): void {
    this.state = state; if (this.disposed) return;
    const ctx = this.canvas.getContext('2d'); if (!ctx) { this.contentState = 'error'; return; }
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const camera = tideCamera(this.width, this.height), ratio = this.canvas.width / this.width;
    ctx.setTransform(camera.scale * ratio, 0, 0, camera.scale * ratio, camera.x * ratio, camera.y * ratio);
    ctx.fillStyle = '#eee4c6'; ctx.fillRect(0, 0, 1000, 667);
    if (this.image) ctx.drawImage(this.image, 0, 0, 1000, 667);
    if (state.phase.kind === 'memory') return;
    ctx.save(); this.sand(ctx); ctx.clip();
    if (state.phase.kind === 'washing') {
      const t = Math.min(1, state.phase.elapsed / WASH_TIME);
      if (state.play.reduced) { ctx.globalAlpha = 1 - t; this.ink(ctx, state); }
      else {
        const reach = Math.min(1, t / .58), level = t < .58 ? reach : 1 - (t - .58) / .42;
        const front = (x: number, advance: number) => shoreY(x) + advance * 470 + Math.sin(x * .025 + state.age) * 4;
        ctx.save(); ctx.beginPath(); ctx.moveTo(0, front(0, reach));
        for (let x = 0; x <= 1000; x += 20) ctx.lineTo(x, front(x, reach));
        ctx.lineTo(1000, 700); ctx.lineTo(0, 700); ctx.closePath(); ctx.clip(); this.ink(ctx, state); ctx.restore();
        ctx.restore(); ctx.save();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(1000, 0); ctx.lineTo(1000, 550);
        for (const point of SAND.slice(6)) ctx.lineTo(point.x, point.y);
        ctx.lineTo(0, 320); ctx.closePath(); ctx.clip();
        ctx.globalAlpha = Math.min(1, t * 10, (1 - t) * 10);
        ctx.beginPath(); ctx.moveTo(0, shoreY(0) - 15);
        for (let x = 0; x <= 1000; x += 20) ctx.lineTo(x, shoreY(x) - 15);
        for (let x = 1000; x >= 0; x -= 20) ctx.lineTo(x, front(x, level));
        ctx.closePath();
        const water = ctx.createLinearGradient(0, 170, 0, 650);
        water.addColorStop(0, '#83c5bc00'); water.addColorStop(.4, '#94cbb948'); water.addColorStop(1, '#c6dcc95c');
        ctx.fillStyle = water; ctx.fill();
        ctx.beginPath(); for (let x = 0; x <= 1000; x += 10) x ? ctx.lineTo(x, front(x, level)) : ctx.moveTo(x, front(x, level));
        ctx.shadowColor = '#fff8e999'; ctx.shadowBlur = 7; ctx.strokeStyle = '#fff8e9c9'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke();
      }
    } else this.ink(ctx, state);
    ctx.restore();
    if (state.cursorVisible && state.phase.kind !== 'washing') {
      ctx.strokeStyle = '#655439c9'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(state.x - 4, state.y); ctx.lineTo(state.x + 4, state.y); ctx.moveTo(state.x, state.y - 4); ctx.lineTo(state.x, state.y + 4); ctx.stroke();
    }
  }
  dispose(): void { this.disposed = true; this.pending.abort(); this.observer?.disconnect(); this.canvas.remove(); this.canvas.width = this.canvas.height = 1; this.host = null; this.image = null; this.state = null; }
}
export function tideView(refs: MiniViewRefs): TideView {
  if (!(refs instanceof TideView)) throw new Error('沙滩画笔界面不匹配');
  return refs;
}
