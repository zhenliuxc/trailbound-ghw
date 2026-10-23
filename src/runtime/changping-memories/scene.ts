import type { ImageCache, MiniInput, MiniViewRefs } from '../contracts';
import { CHARACTERS, readCharacterId } from '../../characters/catalog';
import { badgeFrameSvg } from '../journal-badge';
import { CORD_ENDS, leafFrame, PATH_PAGE, SHADOW_ANSWER, SHADOW_X, type ChangpingMemoryId, type Point, ChangpingMemoryState } from './model';

export const AUTUMN_ASSETS = {
  creek: 'scenes/day-route-v2/changping.webp',
  horse: 'scenes/changping-autumn-v1/horse-rest.webp',
  valley: 'scenes/changping-autumn-v1/valley.webp',
  props: 'scenes/changping-autumn-v1/props.webp',
};
export function backgroundFor(id: ChangpingMemoryId): string {
  return id === 'changping-branch-reflection' ? AUTUMN_ASSETS.creek : id === 'changping-valley-path' ? AUTUMN_ASSETS.valley : AUTUMN_ASSETS.horse;
}
function cover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, w: number, h: number, focus = .5, focusY = .5): void {
  const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
  ctx.drawImage(image, -(image.naturalWidth * scale - w) * focus, (h - image.naturalHeight * scale) * focusY, image.naturalWidth * scale, image.naturalHeight * scale);
}

/** Each illustrated object uses the same normalized space as pointer hit areas. */
export class ChangpingMemoryView implements MiniViewRefs {
  readonly directInput = true;
  contentState: 'loading' | 'ready' | 'error' = 'loading';
  disposed = false;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private observer: ResizeObserver | null = null;
  private readonly images = new Map<string, HTMLImageElement>();
  private readonly character = CHARACTERS[readCharacterId()];
  private width = 1000; private height = 700;
  private latest: ChangpingMemoryState | null = null;
  private readonly layer = document.createElement('canvas');
  private readonly mask = document.createElement('canvas');
  private maskRevision = -1;
  private readonly frame = new Image();
  constructor(readonly id: ChangpingMemoryId) { this.frame.src = `data:image/svg+xml,${encodeURIComponent(badgeFrameSvg())}`; }
  async mount(host: HTMLElement, cache?: ImageCache): Promise<void> {
    const canvas = document.createElement('canvas'); canvas.className = 'mini-game-canvas day-memory-canvas'; canvas.setAttribute('aria-hidden', 'true');
    this.canvas = canvas; this.ctx = canvas.getContext('2d'); if (!this.ctx) throw new Error('画作无法展开');
    const files = [backgroundFor(this.id), AUTUMN_ASSETS.props, this.character.walk.file];
    const resources = await Promise.all(files.map(file => cache?.request(file, 'high')?.promise));
    if (this.disposed) return;
    if (resources.some(asset => asset?.state !== 'ready')) { this.contentState = 'error'; return; }
    resources.forEach((asset, i) => { if (asset) this.images.set(files[i], asset.image); });
    host.append(canvas); this.contentState = 'ready'; host.setAttribute('aria-busy', 'false');
    const resize = () => {
      const box = host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      this.width = Math.max(1, box.width); this.height = Math.max(1, box.height);
      canvas.width = Math.round(this.width * dpr); canvas.height = Math.round(this.height * dpr);
      this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0); this.maskRevision = -1;
      if (this.latest) this.paint(this.latest);
    };
    this.observer = new ResizeObserver(resize); this.observer.observe(host); resize();
  }
  input(p: MiniInput): MiniInput { return { ...p, viewWidth: this.width, viewHeight: this.height }; }
  dispose(): void { this.disposed = true; this.observer?.disconnect(); this.canvas?.remove(); this.images.clear(); }
  private prop(ctx: CanvasRenderingContext2D, cell: number, x: number, y: number, size: number, rotation = 0, mirror = false): void {
    const image = this.images.get(AUTUMN_ASSETS.props); if (!image) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); if (mirror) ctx.scale(-1, 1);
    ctx.drawImage(image, cell % 3 * 512, Math.floor(cell / 3) * 512, 512, 512, -size / 2, -size / 2, size, size); ctx.restore();
  }
  private paper(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
    ctx.save(); ctx.shadowColor = '#31403640'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#f4eddc'; ctx.beginPath(); ctx.moveTo(x, y + 3); ctx.lineTo(x + w * .31, y);
    ctx.lineTo(x + w * .68, y + 2); ctx.lineTo(x + w, y - 1); ctx.lineTo(x + w - 2, y + h);
    ctx.lineTo(x + w * .4, y + h - 2); ctx.lineTo(x + 2, y + h + 1); ctx.closePath(); ctx.fill(); ctx.restore();
    const props = this.images.get(AUTUMN_ASSETS.props);
    if (props) { ctx.save(); ctx.globalAlpha = .5; ctx.drawImage(props, 1024, 512, 512, 512, x, y, w, h); ctx.restore(); }
  }
  private caption(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number): void {
    ctx.save(); ctx.font = `${size}px "Songti SC", "Noto Serif SC", serif`; ctx.fillStyle = '#505a47'; ctx.textAlign = 'center'; ctx.fillText(text, x, y); ctx.restore();
  }
  paint(s: ChangpingMemoryState): void {
    this.latest = s;
    const ctx = this.ctx; if (!ctx || this.contentState !== 'ready' || this.disposed) return;
    this.draw(ctx, s, this.width, this.height, false);
    if (s.keyboard && s.phase === 'play') {
      ctx.save(); ctx.strokeStyle = '#faf4df'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x * this.width, s.y * this.height, 8, 0, Math.PI * 2); ctx.stroke(); ctx.strokeStyle = '#53674d'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
    }
  }
  private draw(ctx: CanvasRenderingContext2D, s: ChangpingMemoryState, w: number, h: number, badge: boolean): void {
    const bg = this.images.get(backgroundFor(this.id)); if (!bg) return;
    const u = Math.min(w, h * 1.3), t = s.reduced ? 0 : s.age;
    ctx.clearRect(0, 0, w, h); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    const valleyFocus = s.scene.kind === 'path' ? .5 - s.scene.walked * .2 : .5;
    cover(ctx, bg, w, h, s.scene.kind === 'cords' ? w < h ? .92 : .68 : s.scene.kind === 'branches' ? .3 : .5, valleyFocus);
    if (s.scene.kind === 'branches') {
      const scene = s.scene;
      const wash = ctx.createLinearGradient(0, h * .45, 0, h); wash.addColorStop(0, '#d9e3d600'); wash.addColorStop(.35, '#d8e1d6dd'); wash.addColorStop(1, '#abbeb8ef');
      ctx.fillStyle = wash; ctx.fillRect(0, h * .45, w, h * .55);
      if (!badge) {
        const pw = Math.min(w * .38, h * .4), ph = Math.min(h * .36, pw * 1.1);
        this.paper(ctx, w * .5 - pw / 2, h * .07, pw, ph);
        this.prop(ctx, scene.round === 0 ? 1 : 2, w * .5, h * .07 + ph * .49, ph * .87);
        this.caption(ctx, '找找它的倒影', w * .5, h * .07 + ph * .93, Math.max(11, Math.min(16, u * .025)));
      }
      for (const [i, x] of SHADOW_X.entries()) {
        const answer = SHADOW_ANSWER[scene.round], isMatch = i === answer;
        const frame = isMatch ? scene.round === 0 ? 1 : 2 : i === (answer + 1) % 3 ? scene.round === 0 ? 2 : 1 : scene.round === 0 ? 1 : 2;
        const size = Math.min(w * .23, h * .36);
        ctx.save(); ctx.translate(x * w, .7 * h); ctx.scale(1, -1);
        ctx.globalAlpha = scene.selected === i && s.mistake > 0 ? .32 : .76;
        this.prop(ctx, frame, 0, 0, size, 0, !isMatch && frame === (scene.round === 0 ? 1 : 2)); ctx.restore();
        ctx.strokeStyle = scene.selected === i && s.mistake === 0 ? '#f4e4ba' : '#ecf0e0a0'; ctx.lineWidth = 1.4;
        for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.ellipse(x * w + Math.sin(t * .6 + j) * 3, h * (.8 + j * .025), size * (.3 + j * .08), 3 + j, -.08, 0, Math.PI * 2); ctx.stroke(); }
        if (!badge) this.caption(ctx, String(i + 1), x * w, h * .93, Math.max(13, u * .026));
      }
    } else if (s.scene.kind === 'cords') {
      const scene = s.scene;
      const stroke = (points: readonly Point[], color: string, width: number) => {
        const draw = (dy: number) => { ctx.beginPath(); ctx.moveTo(points[0].x * w, points[0].y * h + dy); for (let i = 1; i + 2 < points.length; i += 3) ctx.bezierCurveTo(points[i].x * w, points[i].y * h + dy, points[i + 1].x * w, points[i + 1].y * h + dy, points[i + 2].x * w, points[i + 2].y * h + dy); };
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#3e332633'; ctx.lineWidth = width + 3; draw(2); ctx.stroke();
        ctx.strokeStyle = color; ctx.lineWidth = width; draw(0); ctx.stroke(); ctx.strokeStyle = '#eee2b672'; ctx.lineWidth = width * .25; draw(-1); ctx.stroke();
      };
      const bellSize = u * .24, swing = s.phase === 'reveal' ? Math.sin(s.reveal * 7) * .13 * Math.exp(-s.reveal * .8) : 0;
      this.prop(ctx, 0, w * .5, h * .79, bellSize, swing);
      if (scene.opened < 2) {
        const end = scene.held === 1 ? { x: CORD_ENDS[1].x + (scene.end.x - CORD_ENDS[1].x) * (scene.opened === 0 ? .12 : 1), y: CORD_ENDS[1].y + (scene.end.y - CORD_ENDS[1].y) * (scene.opened === 0 ? .12 : 1) } : CORD_ENDS[1];
        stroke([{ x: .5, y: .73 }, { x: .35, y: .63 }, { x: .69, y: .4 }, { x: .7, y: .62 }, { x: .72, y: .79 }, { x: .37, y: .78 }, end], '#9d8253', Math.max(4.5, u * .012));
      } else stroke([{ x: .5, y: .72 }, { x: .38, y: .65 }, { x: .25, y: .45 }, { x: .15, y: .4 }], '#9d8253', Math.max(4.5, u * .012));
      if (scene.opened === 0) {
        const end = scene.held === 0 ? scene.end : CORD_ENDS[0];
        stroke([{ x: .5, y: .72 }, { x: .7, y: .59 }, { x: .27, y: .38 }, { x: .3, y: .65 }, { x: .33, y: .84 }, { x: .63, y: .74 }, end], '#936650', Math.max(5, u * .014));
      } else stroke([{ x: .5, y: .72 }, { x: .65, y: .65 }, { x: .77, y: .38 }, { x: .86, y: .39 }], '#936650', Math.max(5, u * .014));
      if (s.phase === 'play' && !badge) {
        for (let i = scene.opened; i < 2; i++) { const end = scene.held === i && i === scene.opened ? scene.end : CORD_ENDS[i]; ctx.fillStyle = i === 0 ? '#865b47' : '#957849'; ctx.beginPath(); ctx.ellipse(end.x * w, end.y * h, Math.max(8, u * .016), Math.max(7, u * .012), -.3, 0, Math.PI * 2); ctx.fill(); }
        if (!s.acted) this.caption(ctx, '顺着绳子，找到上面的绳头', w * .5, h * .93, Math.max(12, Math.min(17, u * .028)));
      }
      if (s.phase === 'reveal') {
        ctx.save(); ctx.strokeStyle = '#c5a158'; ctx.lineWidth = 1.5; ctx.globalAlpha = .65 * Math.exp(-s.reveal * .55);
        for (const direction of [-1, 1]) { ctx.beginPath(); ctx.ellipse(w * .5, h * .78, bellSize * (.48 + s.reveal * .04), bellSize * .28, 0, direction < 0 ? 2.5 : -.6, direction < 0 ? 3.7 : .6); ctx.stroke(); } ctx.restore();
      }
    } else if (s.scene.kind === 'path') {
      const scene = s.scene, fade = s.phase === 'reveal' ? Math.max(0, 1 - s.reveal / 1.2) : 1;
      const x = w * PATH_PAGE.x, y = h * PATH_PAGE.y, pw = w * PATH_PAGE.width, ph = h * PATH_PAGE.height;
      if (fade > 0 && !badge) {
        ctx.save(); ctx.globalAlpha = fade; this.paper(ctx, x - 4, y + scene.offset * h - 4, pw + 8, ph + 8);
        ctx.beginPath(); ctx.rect(x, y + scene.offset * h, pw, ph); ctx.clip(); ctx.translate(0, scene.offset * h); cover(ctx, bg, w, h, .5, valleyFocus); ctx.restore();
        if (s.phase === 'play') { this.caption(ctx, '↕', w * .86, Math.min(h * .94, y + scene.offset * h + ph * .4), Math.max(20, u * .045)); }
      }
      const progress = scene.walked, scale = Math.max(w / bg.naturalWidth, h / bg.naturalHeight), cropX = (bg.naturalWidth * scale - w) / 2, cropY = (bg.naturalHeight * scale - h) * valleyFocus;
      const px = .465 + .125 * Math.sin(progress * Math.PI / 2), py = .82 - .22 * progress;
      const hx = px * bg.naturalWidth * scale - cropX, hy = py * bg.naturalHeight * scale - cropY + (s.phase === 'play' ? scene.offset * h : 0);
      const person = this.images.get(this.character.walk.file);
      if (person && !badge) {
        const moving = s.phase === 'reveal' && progress < 1, frame = this.character.walk.frames[moving ? Math.floor(s.reveal * 7) % 8 : 2];
        const size = Math.max(28, Math.min(76, u * .105)) * (1 - progress * .28), factor = size / frame.height;
        ctx.fillStyle = '#48513a33'; ctx.beginPath(); ctx.ellipse(hx, hy, size * .18, size * .055, 0, 0, Math.PI * 2); ctx.fill();
        ctx.drawImage(person, frame.x, frame.y, frame.width, frame.height, hx - frame.footX * factor, hy - frame.footY * factor, frame.width * factor, frame.height * factor);
      }
    } else {
      const scene = s.scene;
      ctx.fillStyle = '#d8b2732a'; ctx.fillRect(0, 0, w, h);
      this.paper(ctx, w * .17, h * .19, w * .66, h * .75);
      // The leaf and the rubbing mask share an aspect-preserving frame.
      const frame = leafFrame(w, h), size = frame.size, x = frame.x + size / 2, y = frame.y + size / 2;
      ctx.save(); ctx.globalAlpha = .13; this.prop(ctx, 3, x, y, size); ctx.restore();
      const revision = scene.strokes.reduce((count, stroke) => count + stroke.length, 0);
      if (this.maskRevision !== revision || this.layer.width !== Math.ceil(w) || this.layer.height !== Math.ceil(h)) {
        this.layer.width = this.mask.width = Math.ceil(w); this.layer.height = this.mask.height = Math.ceil(h);
        const ink = this.layer.getContext('2d'), mask = this.mask.getContext('2d');
        if (ink && mask) {
          this.prop(ink, 3, x, y, size);
          mask.lineWidth = size * .17; mask.lineCap = 'round'; mask.lineJoin = 'round'; mask.strokeStyle = '#000';
          for (const stroke of scene.strokes) if (stroke.length > 1) { mask.beginPath(); mask.moveTo(frame.x + stroke[0].x * size, frame.y + stroke[0].y * size); for (const p of stroke.slice(1)) mask.lineTo(frame.x + p.x * size, frame.y + p.y * size); mask.stroke(); }
          ink.globalCompositeOperation = 'destination-in'; ink.drawImage(this.mask, 0, 0); ink.globalCompositeOperation = 'source-over';
        }
        this.maskRevision = revision;
      }
      ctx.drawImage(this.layer, 0, 0);
      ctx.save(); ctx.strokeStyle = '#be8b3d2c'; ctx.lineWidth = Math.max(2, u * .006); ctx.lineCap = 'round';
      for (const stroke of scene.strokes) if (stroke.length > 1) { ctx.beginPath(); ctx.moveTo(frame.x + stroke[0].x * size, frame.y + stroke[0].y * size); for (const p of stroke.slice(1)) ctx.lineTo(frame.x + p.x * size, frame.y + p.y * size); ctx.stroke(); } ctx.restore();
      if (!badge) this.caption(ctx, s.phase === 'play' ? '十月 · 长坪沟' : '把秋色留在纸上', w * .5, h * .9, Math.max(12, Math.min(17, u * .027)));
      if (s.dragging && !badge) {
        ctx.save(); ctx.translate(s.x * w, s.y * h); ctx.rotate(-.6); ctx.fillStyle = '#c49b51'; ctx.fillRect(-3, -u * .13, 8, u * .13); ctx.fillStyle = '#e1c691'; ctx.fillRect(-3, -u * .105, 8, u * .065); ctx.restore();
      }
    }
  }
  capture(s: ChangpingMemoryState): string | undefined {
    if (this.contentState !== 'ready') return undefined;
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 640;
    const ctx = canvas.getContext('2d'); if (!ctx) return undefined;
    ctx.save(); ctx.beginPath(); ctx.arc(320, 320, 280, 0, Math.PI * 2); ctx.clip();
    this.draw(ctx, s, 640, 640, true); ctx.restore();
    if (this.frame.complete && this.frame.naturalWidth) ctx.drawImage(this.frame, 0, 0, 640, 640);
    else { ctx.strokeStyle = '#d4bf89'; ctx.lineWidth = 15; ctx.beginPath(); ctx.arc(320, 320, 288, 0, Math.PI * 2); ctx.stroke(); }
    return canvas.toDataURL('image/webp', .86);
  }
}
