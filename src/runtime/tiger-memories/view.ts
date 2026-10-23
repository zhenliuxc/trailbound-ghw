import type { ImageCache, MiniInput, MiniViewRefs } from '../contracts';
import { MAP_WALK_FILE, MAP_WALK_FRAMES } from '../map-walk-art';
import { badgeFile, sceneFile, clamp, type MemoryKind, type MemoryState, type Point, type Rect } from './model';
import { coverage, frameCenter, frameFits, layout, PAINT_REGIONS, PALETTE, riverImageRect, roadFromStage, roadToStage } from './layout';
import { ROAD_LENGTH, ROAD_POINTS, ROAD_STATIONS, roadAt, roadWalk, roadWalkingProgress } from './road';

type Ctx = CanvasRenderingContext2D;
function polygon(ctx: Ctx, points: readonly Point[], r: Rect): void {
  points.forEach((p, i) => { const x = r.x + p.x * r.width, y = r.y + p.y * r.height; if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); }); ctx.closePath();
}
function paintImage(ctx: Ctx, image: CanvasImageSource, r: Rect): void { ctx.drawImage(image, r.x, r.y, r.width, r.height); }
function imagePart(ctx: Ctx, image: HTMLImageElement, source: Rect, target: Rect): void {
  ctx.drawImage(image, source.x * image.naturalWidth / 1000, source.y * image.naturalHeight / 750, source.width * image.naturalWidth / 1000, source.height * image.naturalHeight / 750, target.x, target.y, target.width, target.height);
}
function paperPath(ctx: Ctx, r: Rect): void {
  ctx.beginPath(); ctx.moveTo(r.x + 3, r.y + 2); ctx.lineTo(r.x + r.width - 3, r.y); ctx.lineTo(r.x + r.width, r.y + r.height - 4); ctx.lineTo(r.x + 2, r.y + r.height); ctx.closePath();
}
function paper(ctx: Ctx, r: Rect, outline = '#b9b196', shadow = false): void {
  ctx.save(); if (shadow) { ctx.shadowColor = '#253e393d'; ctx.shadowBlur = 13; ctx.shadowOffsetY = 5; }
  paperPath(ctx, r); ctx.fillStyle = '#f4efdf'; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.strokeStyle = outline; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
}
function ink(ctx: Ctx, text: string, at: Point, size = 17): void { ctx.fillStyle = '#6b7761'; ctx.font = `${size}px "PingFang SC",sans-serif`; ctx.textAlign = 'center'; ctx.fillText(text, at.x, at.y); }

export class MemoryView implements MiniViewRefs {
  readonly tiger = true;
  readonly canvas: HTMLCanvasElement;
  contentState: 'loading' | 'ready' | 'error' = 'loading';
  disposed = false;
  images: { scene: HTMLImageElement; badge: HTMLImageElement; actor: HTMLImageElement | null; rapids: HTMLImageElement | null } | null = null;
  private observer: ResizeObserver | null = null;
  private host: HTMLElement | null = null;
  private state: MemoryState | null = null;
  private brushCanvas: HTMLCanvasElement;
  private paintedStrokes = -1;
  private paintedPoints = -1;
  private portraitValue = false;
  private cssWidth = 1000;
  constructor(readonly kind: MemoryKind, private readonly doc: Document) {
    this.canvas = doc.createElement('canvas'); this.canvas.className = 'tiger-memory-canvas'; this.canvas.setAttribute('aria-hidden', 'true');
    this.brushCanvas = doc.createElement('canvas'); this.brushCanvas.width = 640; this.brushCanvas.height = 480;
  }
  get portrait(): boolean { return this.portraitValue; }
  private resize(): void {
    if (!this.host || this.disposed) return;
    const rect = this.host.getBoundingClientRect(), ratio = Math.min(2, window.devicePixelRatio || 1, Math.sqrt(3000000 / Math.max(1, rect.width * rect.height)));
    this.cssWidth = Math.max(1, rect.width);
    this.portraitValue = window.innerWidth <= 600 || rect.height / Math.max(1, rect.width) > 1.05;
    this.canvas.width = Math.max(1, Math.round(rect.width * ratio)); this.canvas.height = Math.max(1, Math.round(rect.height * ratio));
    if (this.state) this.paint(this.state);
  }
  async mount(host: HTMLElement, cache?: ImageCache): Promise<void> {
    this.host = host; host.append(this.canvas); this.resize();
    this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host);
    const load = async (file: string): Promise<HTMLImageElement> => {
      const entry = cache?.request(file, 'high');
      if (entry) { await entry.promise; if (entry.state !== 'ready') throw new Error('画作暂未能展开'); return entry.image; }
      const image = new Image(); image.src = file; await image.decode(); return image;
    };
    try {
      if (!this.canvas.getContext('2d')) throw new Error('画面暂不支持绘制');
      const [scene, badge, actor, rapids] = await Promise.all([load(sceneFile(this.kind)), load(badgeFile(this.kind)), this.kind === 'bends' ? load(MAP_WALK_FILE) : Promise.resolve(null), this.kind === 'bends' ? load(sceneFile('river')) : Promise.resolve(null)]);
      if (this.disposed) return;
      this.images = { scene, badge, actor, rapids }; this.contentState = 'ready'; if (this.state) this.paint(this.state);
    } catch { if (!this.disposed) { this.contentState = 'error'; if (this.state) this.paint(this.state); } }
  }
  input(input: MiniInput): MiniInput {
    if (this.kind === 'bends' && this.state && typeof input.x === 'number' && typeof input.y === 'number') {
      const viewport = this.canvas, l = layout(this.state, viewport);
      const world = roadFromStage(this.state, { x: input.x * l.width, y: input.y * l.height }, viewport);
      return { ...input, ...roadToStage(this.state, world) };
    }
    const height = this.portraitValue ? this.kind === 'bends' ? 1040 : 1260 : 750, scale = Math.min(this.canvas.width / 1000, this.canvas.height / height);
    const dx = (this.canvas.width - 1000 * scale) / 2, dy = (this.canvas.height - height * scale) / 2;
    return { ...input, x: typeof input.x === 'number' ? (input.x * this.canvas.width - dx) / scale : undefined, y: typeof input.y === 'number' ? (input.y * this.canvas.height - dy) / scale : undefined };
  }
  private brushLayer(s: MemoryState): HTMLCanvasElement {
    const p = s.session; if (p.kind !== 'waterfall') return this.brushCanvas;
    const points = p.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
    if (this.paintedStrokes === p.strokes.length && this.paintedPoints === points) return this.brushCanvas;
    this.paintedStrokes = p.strokes.length; this.paintedPoints = points;
    const ctx = this.brushCanvas.getContext('2d'); if (!ctx) return this.brushCanvas;
    ctx.clearRect(0, 0, 640, 480); ctx.save(); ctx.beginPath();
    for (const region of PAINT_REGIONS) polygon(ctx, region, { x: 0, y: 0, width: 640, height: 480 });
    ctx.clip(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const stroke of p.strokes) {
      const first = stroke.points[0]; if (!first) continue;
      ctx.strokeStyle = PALETTE[stroke.color]; ctx.fillStyle = PALETTE[stroke.color]; ctx.globalAlpha = .6; ctx.lineWidth = 640 * .136;
      ctx.beginPath(); ctx.moveTo(first.x * 640, first.y * 480);
      for (const point of stroke.points.slice(1)) ctx.lineTo(point.x * 640, point.y * 480);
      if (stroke.points.length === 1) { ctx.arc(first.x * 640, first.y * 480, 640 * .068, 0, Math.PI * 2); ctx.fill(); } else ctx.stroke();
      ctx.globalAlpha = .12; ctx.lineWidth = 640 * .153; ctx.stroke();
    }
    ctx.restore(); return this.brushCanvas;
  }
  private paintedScene(ctx: Ctx, s: MemoryState, r: Rect): void {
    if (!this.images) return;
    paintImage(ctx, this.images.scene, r);
    ctx.save(); ctx.beginPath(); for (const region of PAINT_REGIONS) polygon(ctx, region, r); ctx.clip();
    ctx.globalAlpha = .87; ctx.fillStyle = '#f4efdf'; ctx.fillRect(r.x, r.y, r.width, r.height); ctx.globalAlpha = 1;
    paintImage(ctx, this.brushLayer(s), r);
    ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .85; paintImage(ctx, this.images.scene, r); ctx.restore();
  }
  private river(ctx: Ctx, s: MemoryState, wave = s.wave, image = this.images?.scene, r = riverImageRect(s.portrait)): void {
    if (!image) return;
    paintImage(ctx, image, r);
    if (s.play.reduced) return;
    const opacity = ctx.globalAlpha;
    ctx.save(); ctx.beginPath();
    polygon(ctx, [{ x: .06, y: .53 }, { x: .4, y: .47 }, { x: .5, y: .45 }, { x: .6, y: .46 }, { x: .8, y: .54 }, { x: 1, y: .55 }, { x: 1, y: 1 }, { x: .62, y: 1 }, { x: .45, y: .84 }, { x: .13, y: .74 }], r);
    polygon(ctx, [{ x: .427, y: .585 }, { x: .449, y: .498 }, { x: .489, y: .454 }, { x: .555, y: .477 }, { x: .623, y: .512 }, { x: .653, y: .565 }, { x: .735, y: .591 }, { x: .766, y: .675 }, { x: .736, y: .73 }, { x: .65, y: .74 }, { x: .54, y: .704 }, { x: .462, y: .663 }], r);
    ctx.clip('evenodd'); ctx.globalAlpha = opacity * .34;
    for (let i = 0; i < 12; i++) {
      const y = .46 + i * .045, sy = y * image.naturalHeight, h = .045 * image.naturalHeight;
      const shift = Math.sin(wave * 1.8 - i * .6) * (1 + i * .13);
      ctx.drawImage(image, 0, sy, image.naturalWidth, Math.min(h, image.naturalHeight - sy), r.x + shift, r.y + y * r.height + Math.sin(wave * 1.3 - i) * 1.8, r.width, h / image.naturalHeight * r.height + 2);
    }
    ctx.globalAlpha = opacity * .42; ctx.strokeStyle = '#f5f5e4'; ctx.lineWidth = 1.3;
    for (let i = 0; i < 30; i++) {
      const t = (wave * .12 + i * .137) % 1, x = .75 + Math.sin(i * 23.6) * .15 + t * .08, y = .55 + t * .44;
      ctx.beginPath(); ctx.ellipse(r.x + x * r.width, r.y + y * r.height, 2 + t * 7, .7 + t, .3, .1, 2.7); ctx.stroke();
    }
    ctx.restore();
  }
  private waterDrops(ctx: Ctx, s: MemoryState): void {
    if (s.play.reduced) return;
    ctx.save(); ctx.strokeStyle = '#f4f5e8'; ctx.lineWidth = 1.2; ctx.globalAlpha = .45;
    for (let i = 0; i < 21; i++) {
      const t = (s.wave * .35 + i * .139) % 1;
      const x = 105 + t * 105 + Math.sin(i * 4.8) * (5 + t * 7), y = 25 + t * 470;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 1, y + 5 + t * 7); ctx.stroke();
    }
    ctx.restore();
  }
  private roadJourney(ctx: Ctx, s: MemoryState, l: ReturnType<typeof layout>): void {
    if (!this.images || s.session.kind !== 'bends') return;
    const phase = s.session.phase, walk = roadWalk(phase), drawn = phase.kind === 'drawing' ? phase.progress : 1, unit = 1000 / this.cssWidth;
    ctx.save(); ctx.translate(l.scene.x, l.scene.y); ctx.scale(l.scene.width / 1000, l.scene.height / 750);
    const stroke = (progress: number) => {
      ctx.beginPath(); ctx.moveTo(ROAD_POINTS[0].x, ROAD_POINTS[0].y);
      for (const station of ROAD_STATIONS) { if (station.progress > progress) break; ctx.lineTo(station.point.x, station.point.y); }
      const tip = roadAt(progress); ctx.lineTo(tip.x, tip.y);
    };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (phase.kind === 'drawing') {
      stroke(1); ctx.globalAlpha = .95; ctx.strokeStyle = '#fcf7e7'; ctx.lineWidth = 10; ctx.stroke();
      ctx.globalAlpha = .92; ctx.strokeStyle = '#557759'; ctx.lineWidth = 3.2; ctx.setLineDash([8, 7]); ctx.stroke(); ctx.setLineDash([]);
    }
    if (drawn > 0) {
      stroke(drawn); ctx.globalAlpha = .95; ctx.strokeStyle = '#f8f4e7'; ctx.lineWidth = 10; ctx.stroke();
      ctx.globalAlpha = 1; ctx.strokeStyle = '#547159'; ctx.lineWidth = 4.8; ctx.stroke();
      ctx.globalAlpha = .55; ctx.fillStyle = '#ece6d4';
      for (let i = 2; i < ROAD_STATIONS.length; i += 3) { const at = ROAD_STATIONS[i]; if (at.progress > drawn) break; ctx.beginPath(); ctx.ellipse(at.point.x + Math.sin(i) * 1.5, at.point.y, 1.2, .5, i, 0, 7); ctx.fill(); }
    }
    if (phase.kind === 'drawing') {
      const tip = phase.keyboard ? phase.cursor : roadAt(drawn);
      ctx.globalAlpha = .95; ctx.strokeStyle = '#53715a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tip.x, tip.y); ctx.lineTo(tip.x + 12, tip.y - 17); ctx.lineTo(tip.x + 16, tip.y - 14); ctx.lineTo(tip.x + 3, tip.y + 1); ctx.closePath(); ctx.stroke();
    }
    ctx.restore();
    if (phase.kind === 'drawing') {
      for (const progress of [.17, .52, .84]) {
        if (progress <= drawn) continue;
        const at = roadAt(progress), point = roadToStage(s, at, this.canvas);
        ctx.save(); ctx.translate(point.x, point.y); ctx.rotate(at.heading); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-5 * unit, -5 * unit); ctx.lineTo(2 * unit, 0); ctx.lineTo(-5 * unit, 5 * unit);
        ctx.strokeStyle = '#fff9e9'; ctx.lineWidth = 5 * unit; ctx.stroke(); ctx.strokeStyle = '#355d43'; ctx.lineWidth = 2 * unit; ctx.stroke(); ctx.restore();
      }
      const label = (text: string, progress: number, below: boolean) => {
        const at = roadToStage(s, roadAt(progress), this.canvas), gap = 12 * unit, height = 28 * unit;
        ctx.save(); ctx.font = `600 ${13 * unit}px "PingFang SC",sans-serif`;
        const width = ctx.measureText(text).width + 20 * unit;
        const rect = { x: clamp(at.x - width / 2, 8 * unit, l.width - width - 8 * unit), y: below ? at.y + gap : at.y - gap - height, width, height };
        paper(ctx, rect, '#99ab8a', true); ctx.fillStyle = '#35573f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, rect.x + width / 2, rect.y + height / 2);
        ctx.fillStyle = '#f9f5e5'; ctx.strokeStyle = '#456c4e'; ctx.lineWidth = 2 * unit;
        ctx.beginPath(); ctx.arc(at.x, at.y, 5 * unit, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (below) { ctx.beginPath(); ctx.arc(at.x, at.y, 2 * unit, 0, Math.PI * 2); ctx.fillStyle = '#456c4e'; ctx.fill(); }
        else { ctx.beginPath(); ctx.moveTo(at.x, at.y - 2 * unit); ctx.lineTo(at.x, at.y - 18 * unit); ctx.lineTo(at.x + 10 * unit, at.y - 15 * unit); ctx.lineTo(at.x, at.y - 10 * unit); ctx.stroke(); }
        ctx.restore();
      };
      label(drawn > .01 ? '起点' : '起点 · 从这里画', 0, true); label('终点 · 山肩', 1, false);
    }
    const actor = this.images.actor, at = roadAt(walk);
    const moving = phase.kind === 'walking' && roadWalkingProgress(phase.elapsed + .02) > walk + .00001;
    if (actor) {
      const frame = MAP_WALK_FRAMES[moving && !s.play.reduced ? Math.floor(walk * ROAD_LENGTH / 12) % 8 : 1], [sx, sy, w, h, fx, fy] = frame;
      const scale = (60 - walk * 9) / h * l.scene.width / 1000, facing = Math.cos(at.heading) < 0 ? -1 : 1;
      ctx.save(); ctx.translate(l.scene.x + at.x * l.scene.width / 1000, l.scene.y + at.y * l.scene.height / 750);
      if (phase.kind === 'drawing') ctx.translate(-15, 5);
      ctx.fillStyle = '#38473b35'; ctx.beginPath(); ctx.ellipse(0, 1, 12, 3, 0, 0, 7); ctx.fill();
      ctx.rotate(clamp(Math.sin(at.heading) * facing * .08, -.06, .04)); ctx.scale(scale * facing, scale);
      ctx.drawImage(actor, sx, sy, w, h, -fx, -fy, w, h); ctx.restore();
    }
    if (phase.kind === 'river' && this.images.rapids) {
      const fade = clamp(phase.elapsed / (s.play.reduced ? .3 : 1), 0, 1), cover = Math.max(1, l.height / 750);
      const zoom = s.play.reduced ? 1 : 1 + Math.min(phase.elapsed, 4.8) * .006;
      const width = 1000 * cover * zoom, height = 750 * cover * zoom;
      ctx.save(); ctx.globalAlpha = fade * fade * (3 - 2 * fade);
      this.river(ctx, s, phase.elapsed * 1.35, this.images.rapids, { x: (1000 - width) * .55, y: (l.height - height) * .5, width, height }); ctx.restore();
    }
  }
  private pairs(ctx: Ctx, s: MemoryState): void {
    if (!this.images || s.session.kind !== 'inn') return;
    const p = s.session, l = layout(s);
    if (s.portrait) { ctx.save(); ctx.fillStyle = '#e7e0ca'; ctx.fillRect(0, 750, 1000, 510); ctx.globalAlpha = .18; paintImage(ctx, this.images.scene, { x: 0, y: 750, width: 1000, height: 750 }); ctx.restore(); }
    for (const [index, r] of l.cards.entries()) {
      const visible = p.open.includes(index) || p.matched.includes(index);
      paper(ctx, r, p.focus === index ? '#8e9b7b' : '#d4c9ad', true);
      ctx.save(); paperPath(ctx, { x: r.x + 7, y: r.y + 7, width: r.width - 14, height: r.height - 14 }); ctx.clip();
      if (visible) {
        const crop = p.order[index] === 0 ? { x: 340, y: 235, width: 290, height: 260 } : { x: 8, y: 200, width: 240, height: 245 };
        imagePart(ctx, this.images.scene, crop, { x: r.x + 7, y: r.y + 7, width: r.width - 14, height: r.height - 14 });
      } else {
        ctx.globalAlpha = .17; paintImage(ctx, this.images.scene, r); ctx.globalAlpha = 1;
        ctx.strokeStyle = '#9ca58a'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(r.x + r.width * .2, r.y + r.height * .65); ctx.lineTo(r.x + r.width * .44, r.y + r.height * .3); ctx.lineTo(r.x + r.width * .62, r.y + r.height * .54); ctx.lineTo(r.x + r.width * .76, r.y + r.height * .36); ctx.stroke();
      }
      if (p.matched.includes(index)) { ctx.fillStyle = '#f3ebba17'; ctx.fillRect(r.x, r.y, r.width, r.height); }
      ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = p.matched.length / 4 * .12; ctx.fillStyle = '#203957'; ctx.fillRect(0, 0, 1000, 510); ctx.restore();
  }
  private painting(ctx: Ctx, s: MemoryState): void {
    if (s.session.kind !== 'waterfall') return;
    const l = layout(s), p = s.session; this.waterDrops(ctx, s);
    if (s.portrait) { ctx.fillStyle = '#e8e6d7'; ctx.fillRect(0, 750, 1000, 510); }
    paper(ctx, l.sketch, '#d3c6a8', true); this.paintedScene(ctx, s, l.sketchImage);
    ctx.save(); ctx.strokeStyle = '#71806b'; ctx.globalAlpha = .45; ctx.lineWidth = 1;
    const filled = coverage(s);
    PAINT_REGIONS.forEach((region, i) => { if (filled[i] >= .62) return; ctx.beginPath(); polygon(ctx, region, l.sketchImage); ctx.stroke(); }); ctx.restore();
    for (const [i, at] of l.swatches.entries()) {
      ctx.save(); ctx.translate(at.x, at.y); ctx.beginPath();
      for (let n = 0; n <= 30; n++) { const a = n / 30 * Math.PI * 2, r = 24 + Math.sin(n * 2.3) * 2; if (!n) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.fillStyle = PALETTE[i]; ctx.fill(); if (p.color === i) { ctx.strokeStyle = '#fef9e4'; ctx.lineWidth = 3; ctx.stroke(); }
      ctx.restore();
    }
    if (p.keyboard) { ctx.save(); ctx.strokeStyle = '#516d59'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(l.sketchImage.x + p.brush.x * l.sketchImage.width, l.sketchImage.y + p.brush.y * l.sketchImage.height, 12, 0, 7); ctx.stroke(); ctx.restore(); }
  }
  paint(s: MemoryState): void {
    this.state = s; if (this.disposed) return;
    const ctx = this.canvas.getContext('2d'); if (!ctx) return;
    const l = layout(s, s.kind === 'bends' ? this.canvas : undefined), scale = Math.min(this.canvas.width / l.width, this.canvas.height / l.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); ctx.fillStyle = '#ede9da'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(scale, 0, 0, scale, (this.canvas.width - l.width * scale) / 2, (this.canvas.height - l.height * scale) / 2);
    if (this.contentState !== 'ready' || !this.images) { ink(ctx, this.contentState === 'error' ? '画作暂未展开，可以重试或继续走。' : '山与江正在展开……', { x: 500, y: l.height / 2 }, 24); return; }
    if (s.kind === 'river') {
      this.river(ctx, s, s.session.kind === 'river' && s.session.shot ? s.session.shot.wave : s.wave);
      const center = s.session.kind === 'river' && s.session.shot ? s.session.shot.center : frameCenter(s);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1000, l.height); ctx.arc(center.x, center.y, l.radius, 0, 7, true); ctx.fillStyle = '#233a3455'; ctx.fill('evenodd');
      ctx.beginPath(); ctx.arc(center.x, center.y, l.radius, 0, 7); ctx.lineWidth = 2.5; ctx.strokeStyle = frameFits(s) ? '#f2e2a5' : '#f3edd8'; ctx.stroke(); ctx.restore();
    } else {
      paintImage(ctx, this.images.scene, l.scene);
      if (s.kind === 'bends') this.roadJourney(ctx, s, l);
      if (s.kind === 'inn') this.pairs(ctx, s);
      if (s.kind === 'waterfall') this.painting(ctx, s);
    }
    if (s.flow.kind === 'complete') {
      const q = clamp((s.age - (s.play.completedAt ?? s.age)) / (s.play.reduced ? .2 : 1), 0, 1), size = Math.min(510, l.height * .62), x = (1000 - size) / 2, y = (l.height - size) / 2;
      ctx.save(); ctx.fillStyle = `rgba(34,53,44,${q * .42})`; ctx.fillRect(0, 0, 1000, l.height); ctx.globalAlpha = q;
      const capture = this.captureImage;
      if (capture?.complete && capture.naturalWidth) ctx.drawImage(capture, x, y, size, size);
      ctx.restore();
    }
  }
  private captureImage: HTMLImageElement | null = null;
  capture(s: MemoryState): string | null {
    if (!this.images || this.disposed) return null;
    const canvas = this.doc.createElement('canvas'); canvas.width = canvas.height = 576;
    const ctx = canvas.getContext('2d'); if (!ctx) return null;
    ctx.drawImage(this.images.badge, 0, 0, 576, 576);
    if (s.session.kind === 'waterfall') {
      ctx.save(); ctx.beginPath(); ctx.arc(288, 288, 249, 0, 7); ctx.clip();
      this.paintedScene(ctx, s, { x: -88, y: -6, width: 752, height: 564 }); ctx.restore();
    } else if (s.session.kind === 'river' && s.session.shot) {
      const l = layout(s), at = s.session.shot.center;
      ctx.save(); ctx.beginPath(); ctx.arc(288, 288, 249, 0, 7); ctx.clip(); ctx.translate(288, 288); ctx.scale(249 / l.radius, 249 / l.radius); ctx.translate(-at.x, -at.y); this.river(ctx, s, s.session.shot.wave); ctx.restore();
    }
    try {
      for (const quality of [.88, .78, .65]) { const url = canvas.toDataURL('image/webp', quality); if (url.startsWith('data:image/webp;base64,') && url.length < 400000) { this.captureImage = new Image(); this.captureImage.src = url; return url; } }
    } catch { return null; }
    return null;
  }
  reset(): void { this.paintedStrokes = this.paintedPoints = -1; this.captureImage = null; }
  dispose(): void { this.disposed = true; this.observer?.disconnect(); this.observer = null; this.canvas.remove(); this.images = null; this.state = null; this.captureImage = null; this.canvas.width = this.canvas.height = this.brushCanvas.width = this.brushCanvas.height = 1; }
}
export function viewOf(refs: MiniViewRefs): MemoryView { if (!(refs instanceof MemoryView)) throw new Error('虎跳峡互动画面不匹配'); return refs; }
