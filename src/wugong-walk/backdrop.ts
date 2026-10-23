import { clamp, type GroundRibbon, type Landscape, type Trail, type WorldPoint } from './model';
import { MAP_EXTENT, type CameraMode, type FrameProjection, type SceneBounds } from './camera';
import { createGroundMarks, drawCanopy, drawMeadowTuft, groundCover, randomSequence, type GroundMark } from './vegetation';
import { paintTerrainTriangle } from './terrain-paint';
import type { EnvironmentFrame } from './environment';

interface Raster { canvas: HTMLCanvasElement; bounds: SceneBounds; density: number }
interface Demand { bounds: SceneBounds; density: number; generation: number }
interface Art { canvas: HTMLCanvasElement; bytes: number }
const binSize = 96;
const yieldWork = () => new Promise<void>(resolve => window.setTimeout(resolve, 0));
const contains = (outer: SceneBounds, inner: SceneBounds, margin = 0): boolean =>
  outer.x <= inner.x - margin && outer.y <= inner.y - margin && outer.x + outer.width >= inner.x + inner.width + margin && outer.y + outer.height >= inner.y + inner.height + margin;
function release(raster: Raster | null): void { if (raster) { raster.canvas.width = 0; raster.canvas.height = 0; } }
function ridgeNoise(x: number, seed: number): number {
  const index = Math.floor(x), fraction = x - index;
  const height = (i: number) => { const n = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return n - Math.floor(n); };
  return height(index) + (height(index + 1) - height(index)) * fraction;
}

export class SceneBackdrop {
  private overview: Raster | null = null;
  private detail: Raster | null = null;
  private pending: Demand | null = null;
  private serial: Promise<void> = Promise.resolve();
  private initialization: Promise<void> | null = null;
  private positions = new Float32Array(0);
  private colors = new Uint8Array(0);
  private luminance = new Float32Array(0);
  private depths = new Float32Array(0);
  private readonly bins = new Map<string, number[]>();
  private readonly art = new Map<string, Art>();
  private artBytes = 0;
  private generation = 0;
  private overviewPending = 0;
  private compact = false;
  private suspended = document.hidden;
  private disposed = false;
  private failed = false;
  private readonly distantRidges: Path2D[] = [];
  readonly marks: GroundMark[];
  get status(): 'ready' | 'refining' | 'fallback' { return this.failed ? 'fallback' : this.pending ? 'refining' : 'ready'; }
  constructor(private readonly landscape: Landscape, private readonly trail: Trail) {
    this.marks = createGroundMarks(landscape, trail);
    for (let layer = 0; layer < 2; layer++) {
      const seed = 23 + layer * 17;
      const ridge = (x: number) => 211 + layer * 46 - (ridgeNoise(x / 275, seed) * .62 + ridgeNoise(x / 105, seed + 3) * .25 + ridgeNoise(x / 39, seed + 7) * .10 + ridgeNoise(x / 13, seed + 11) * .03) * (108 - layer * 16);
      const path = new Path2D(); path.moveTo(-3200, ridge(-3200));
      for (let x = -3192; x <= 4800; x += 8) path.lineTo(x, ridge(x));
      path.lineTo(4800, 4000); path.lineTo(-3200, 4000); path.closePath(); this.distantRidges.push(path);
    }
  }
  private valid(generation: number, signal: AbortSignal): boolean { return !signal.aborted && !this.disposed && generation === this.generation; }
  private async pause(signal: AbortSignal, needed: () => boolean = () => !this.disposed): Promise<void> {
    while (this.suspended && !signal.aborted && needed()) await new Promise<void>(resolve => window.setTimeout(resolve, 80));
  }
  private async prepareMesh(signal: AbortSignal): Promise<void> {
    const { data } = this.landscape, count = data.columns * data.rows;
    this.positions = new Float32Array(count * 2); this.colors = new Uint8Array(count * 3); this.depths = new Float32Array(count); this.luminance = new Float32Array(count);
    const dx = (data.xMax - data.xMin) / (data.columns - 1), dz = (data.zMax - data.zMin) / (data.rows - 1);
    for (let j = 0; j < data.rows; j++) {
      if (signal.aborted || this.disposed) return;
      for (let i = 0; i < data.columns; i++) {
        const index = j * data.columns + i, x = data.xMin + i * dx, z = data.zMin + j * dz;
        const point = this.landscape.project({ x, z }); this.positions[index * 2] = point.x; this.positions[index * 2 + 1] = point.y;
        const left = Math.max(0, i - 3), right = Math.min(i + 3, data.columns - 1), back = Math.max(0, j - 3), front = Math.min(j + 3, data.rows - 1);
        const hx = (data.heights[j * data.columns + right] - data.heights[j * data.columns + left]) / (1000 * (right - left) * dx);
        const hz = (data.heights[front * data.columns + i] - data.heights[back * data.columns + i]) / (1000 * (front - back) * dz);
        const color = groundCover(x, z, (data.heights[index] - 150) / 1000, hx, hz).color;
        for (let k = 0; k < 3; k++) this.colors[index * 3 + k] = Math.round(clamp(color[k], 0, 255));
        this.luminance[index] = this.colors[index * 3] * .2126 + this.colors[index * 3 + 1] * .7152 + this.colors[index * 3 + 2] * .0722;
        this.depths[index] = z * .975 - x * .222;
      }
      if (j % 16 === 15) { await yieldWork(); await this.pause(signal); }
    }
    for (let j = 0; j < data.rows - 1; j++) {
      if (signal.aborted || this.disposed) return;
      for (let i = 0; i < data.columns - 1; i++) {
        if (data.zMin + j * dz < data.horizon[i]) continue;
        const id = j * data.columns + i;
        const a = id * 2, b = a + 2, d = a + data.columns * 2, c = d + 2;
        const x0 = Math.floor((Math.min(this.positions[a], this.positions[b], this.positions[c], this.positions[d]) - 12) / binSize);
        const x1 = Math.floor((Math.max(this.positions[a], this.positions[b], this.positions[c], this.positions[d]) + 12) / binSize);
        const y0 = Math.floor((Math.min(this.positions[a + 1], this.positions[b + 1], this.positions[c + 1], this.positions[d + 1]) - 12) / binSize);
        const y1 = Math.floor((Math.max(this.positions[a + 1], this.positions[b + 1], this.positions[c + 1], this.positions[d + 1]) + 12) / binSize);
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const key = `${x}:${y}`, bucket = this.bins.get(key);
          if (bucket) bucket.push(id); else this.bins.set(key, [id]);
        }
      }
      if (j % 24 === 23) { await yieldWork(); await this.pause(signal); }
    }
  }
  private plan(bounds: SceneBounds, maxPixels: number, preferred: number): Demand {
    const density = Math.min(preferred, 4094 / bounds.width, 4094 / bounds.height, Math.sqrt(maxPixels / (bounds.width * bounds.height))) * .998;
    return { bounds, density, generation: ++this.generation };
  }
  async prepareOverview(frame: FrameProjection, signal: AbortSignal): Promise<void> {
    this.compact = frame.width < 760; this.failed = false;
    const visible = frame.overviewBounds, x = Math.min(visible.x, MAP_EXTENT.x), y = Math.min(visible.y, MAP_EXTENT.y);
    const bounds = { x, y, width: Math.max(visible.x + visible.width, MAP_EXTENT.x + MAP_EXTENT.width) - x, height: Math.max(visible.y + visible.height, MAP_EXTENT.y + MAP_EXTENT.height) - y };
    const request = this.plan(bounds, this.compact ? 2_500_000 : 5_000_000, Math.max(1.6, frame.overviewScale * frame.pixelRatio * 1.25));
    release(this.detail); this.detail = null;
    for (const art of this.art.values()) { art.canvas.width = 0; art.canvas.height = 0; }
    this.art.clear(); this.artBytes = 0;
    this.overviewPending = request.generation; this.pending = null;
    this.serial = this.serial.catch(() => {}).then(async () => {
      if (!this.valid(request.generation, signal)) return;
      this.initialization ??= this.prepareMesh(signal);
      await this.initialization;
      const result = await this.rasterize(request, 2, signal);
      if (result && this.valid(request.generation, signal)) { release(this.overview); this.overview = result; }
      else release(result);
    }).catch(error => {
      if (!this.valid(request.generation, signal)) return;
      if (this.overview) { this.failed = true; return; }
      throw error;
    }).finally(() => { if (this.overviewPending === request.generation) this.overviewPending = 0; });
    await this.serial;
  }
  private ensureDetail(frame: FrameProjection, signal: AbortSignal): void {
    if (this.suspended || this.disposed || this.failed || this.overviewPending || frame.mode !== 'follow' || frame.close < .94) return;
    const visible = frame.bounds, margin = Math.min(visible.width, visible.height) * .055;
    if (this.detail && contains(this.detail.bounds, visible, margin)) {
      if (this.pending && !contains(this.pending.bounds, visible)) { this.generation++; this.pending = null; }
      return;
    }
    if (this.pending && contains(this.pending.bounds, visible, margin * .5)) return;
    const bounds = { x: visible.x - visible.width * .20, y: visible.y - visible.height * .20, width: visible.width * 1.4, height: visible.height * 1.4 };
    const request = this.plan(bounds, this.compact ? 3_200_000 : 8_000_000, 6.4); this.pending = request;
    this.serial = this.serial.catch(() => {}).then(async () => {
      if (!this.valid(request.generation, signal)) return;
      try {
        const result = await this.rasterize(request, 1, signal);
        if (result && this.valid(request.generation, signal)) { release(this.detail); this.detail = result; }
        else release(result);
      } catch { if (this.valid(request.generation, signal)) this.failed = true; }
      finally { if (this.pending === request) this.pending = null; }
    });
  }
  paint(ctx: CanvasRenderingContext2D, frame: FrameProjection, signal: AbortSignal, environment: EnvironmentFrame): void {
    this.drawSky(ctx, frame.bounds, environment);
    this.paintCached(ctx, frame.close > .25);
    this.ensureDetail(frame, signal);
  }
  private paintCached(ctx: CanvasRenderingContext2D, close: boolean): void {
    const draw = (raster: Raster | null) => { if (raster) { const r = raster.bounds; ctx.drawImage(raster.canvas, r.x, r.y, r.width, r.height); } };
    draw(this.overview);
    if (close) draw(this.detail);
  }
  restoreForeground(ctx: CanvasRenderingContext2D, ground: WorldPoint, bounds: SceneBounds, close: boolean): void {
    const threshold = ground.z * .975 - ground.x * .222 + .012, columns = this.landscape.data.columns;
    const mask = new Path2D(); let count = 0;
    const polygon = (indices: readonly number[]) => {
      const corners: { x: number; y: number; depth: number }[] = [];
      for (let i = 0; i < indices.length; i++) {
        const a = indices[i], b = indices[(i + 1) % indices.length];
        const da = this.depths[a], db = this.depths[b];
        if (da >= threshold) corners.push({ x: this.positions[a * 2], y: this.positions[a * 2 + 1], depth: da });
        if ((da < threshold) !== (db < threshold)) {
          const t = (threshold - da) / (db - da);
          corners.push({ x: this.positions[a * 2] + (this.positions[b * 2] - this.positions[a * 2]) * t, y: this.positions[a * 2 + 1] + (this.positions[b * 2 + 1] - this.positions[a * 2 + 1]) * t, depth: threshold });
        }
      }
      if (corners.length < 3) return;
      let area = 0;
      for (let i = 0; i < corners.length; i++) { const a = corners[i], b = corners[(i + 1) % corners.length]; area += a.x * b.y - b.x * a.y; }
      if (area < 0) corners.reverse();
      mask.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i++) mask.lineTo(corners[i].x, corners[i].y);
      mask.closePath(); count++;
    };
    for (const a of this.cells(bounds, 1)) {
      const b = a + 1, d = a + columns, c = d + 1;
      if (Math.max(this.depths[a], this.depths[b], this.depths[c], this.depths[d]) < threshold) continue;
      polygon([a, b, c]); polygon([a, c, d]);
    }
    if (!count) return;
    ctx.save(); ctx.beginPath(); ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height); ctx.clip(); ctx.clip(mask); this.paintCached(ctx, close); ctx.restore();
  }
  changeMode(mode: CameraMode): void {
    this.failed = false;
    if (mode === 'overview' && this.pending) { this.generation++; this.pending = null; }
  }
  suspend(hidden: boolean): void {
    this.suspended = hidden;
    if (hidden && this.pending) { this.generation++; this.pending = null; }
  }
  private cells(bounds: SceneBounds, step: number): number[] {
    const ids = new Set<number>(), columns = this.landscape.data.columns, rows = this.landscape.data.rows;
    for (let y = Math.floor(bounds.y / binSize); y <= Math.floor((bounds.y + bounds.height) / binSize); y++) for (let x = Math.floor(bounds.x / binSize); x <= Math.floor((bounds.x + bounds.width) / binSize); x++) {
      for (const id of this.bins.get(`${x}:${y}`) ?? []) {
        const i = id % columns, j = Math.floor(id / columns);
        if (i % step === 0 && j % step === 0 && i + step < columns && j + step < rows) ids.add(id);
      }
    }
    return [...ids].sort((a, b) => this.depths[a] - this.depths[b] || a - b);
  }
  private async rasterize(request: Demand, step: number, signal: AbortSignal): Promise<Raster | null> {
    if (!this.valid(request.generation, signal)) return null;
    await this.pause(signal, () => this.valid(request.generation, signal));
    if (!this.valid(request.generation, signal)) return null;
    const { bounds, density } = request, canvas = document.createElement('canvas');
    canvas.width = Math.ceil(bounds.width * density); canvas.height = Math.ceil(bounds.height * density);
    const result = { canvas, bounds, density }, ctx = canvas.getContext('2d');
    if (!ctx) { release(result); throw new Error('山路细节暂时无法展开'); }
    try {
      ctx.scale(density, density); ctx.translate(-bounds.x, -bounds.y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const cells = this.cells(bounds, step), columns = this.landscape.data.columns;
      const marks = this.marks.filter(mark => {
        const p = mark.kind === 'canopy' || mark.kind === 'tussock' ? mark.point : mark.points[0];
        return p.x > bounds.x - 20 && p.x < bounds.x + bounds.width + 20 && p.y > bounds.y - 20 && p.y < bounds.y + bounds.height + 20;
      });
      const roads = this.trail.ribbons.filter(road => road.points.some(p => p.x > bounds.x - 12 && p.x < bounds.x + bounds.width + 12 && p.y > bounds.y - 12 && p.y < bounds.y + bounds.height + 12));
      const data = this.landscape.data;
      const surfaceBias = ((data.zMax - data.zMin) / (data.rows - 1) * .975 + (data.xMax - data.xMin) / (data.columns - 1) * .222) * step;
      const markDepth = (mark: GroundMark) => mark.depth + surfaceBias * (mark.kind === 'canopy' ? .5 : 1);
      marks.sort((a, b) => markDepth(a) - markDepth(b));
      let markIndex = 0, roadIndex = 0;
      const flush = (depth: number) => {
        while (markIndex < marks.length || roadIndex < roads.length) {
          const mark = marks[markIndex], road = roads[roadIndex];
          const groundDepth = mark ? markDepth(mark) : Infinity, roadDepth = road ? road.depth + surfaceBias : Infinity;
          if (Math.min(groundDepth, roadDepth) >= depth) return;
          if (roadDepth <= groundDepth) { this.drawRoad(ctx, road); roadIndex++; }
          else { this.drawMark(ctx, mark, density); markIndex++; }
        }
      };
      const triangle = (a: number, b: number, c: number) => paintTerrainTriangle(ctx, this.positions, this.colors, this.luminance, a, b, c);
      for (let start = 0; start < cells.length; start += 1000) {
        if (!this.valid(request.generation, signal)) { release(result); return null; }
        await this.pause(signal, () => this.valid(request.generation, signal));
        if (!this.valid(request.generation, signal)) { release(result); return null; }
        for (let k = start; k < Math.min(cells.length, start + 1000); k++) {
          const a = cells[k], b = a + step, d = a + columns * step, c = d + step;
          flush(this.depths[a]);
          triangle(a, b, c); triangle(a, c, d);
        }
        await yieldWork();
      }
      if (!this.valid(request.generation, signal)) { release(result); return null; }
      flush(Infinity);
      const random = randomSequence(171031);
      for (let i = 0; i < 14_000; i++) {
        const x = MAP_EXTENT.x + random() * MAP_EXTENT.width, y = MAP_EXTENT.y + random() * MAP_EXTENT.height;
        if (x < bounds.x || x > bounds.x + bounds.width || y < bounds.y || y > bounds.y + bounds.height) continue;
        ctx.fillStyle = i % 3 ? '#d9ddbe0a' : '#35595709'; ctx.fillRect(x, y, .35, .45);
      }
      if (step === 1) this.feather(ctx, canvas.width, canvas.height);
      return result;
    } catch (error) { release(result); throw error; }
  }
  private drawMark(ctx: CanvasRenderingContext2D, mark: GroundMark, density: number): void {
    if (mark.kind === 'meadow') {
      const [a, b, c] = mark.points; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(b.x, b.y, c.x, c.y); ctx.strokeStyle = mark.color; ctx.lineWidth = mark.width; ctx.stroke(); return;
    }
    if (mark.kind === 'stroke') {
      ctx.beginPath(); ctx.moveTo(mark.points[0].x, mark.points[0].y);
      for (let i = 1; i < mark.points.length; i++) ctx.lineTo(mark.points[i].x, mark.points[i].y);
      ctx.strokeStyle = mark.color; ctx.lineWidth = mark.width; ctx.stroke(); return;
    }
    if (mark.kind === 'surface') {
      ctx.beginPath(); ctx.moveTo(mark.points[0].x, mark.points[0].y);
      for (let i = 1; i < mark.points.length; i++) ctx.lineTo(mark.points[i].x, mark.points[i].y);
      ctx.closePath(); ctx.fillStyle = mark.color; ctx.fill(); return;
    }
    const tier = Math.ceil(density * 2) / 2, canopy = mark.kind === 'canopy';
    const key = `${mark.kind}:${tier}:${mark.shade}:${canopy ? mark.haze : 0}:${mark.variant}`;
    const width = canopy ? 24 : 32, height = canopy ? 20 : 28, rootY = canopy ? 12 : 24;
    let art = this.art.get(key);
    if (art) { this.art.delete(key); this.art.set(key, art); }
    else {
      const canvas = document.createElement('canvas'); canvas.width = Math.ceil(width * tier); canvas.height = Math.ceil(height * tier);
      const paint = canvas.getContext('2d'); if (!paint) return;
      paint.scale(tier, tier); paint.translate(width / 2, rootY);
      if (mark.kind === 'canopy') drawCanopy(paint, mark.shade, mark.haze, mark.variant);
      else drawMeadowTuft(paint, mark.shade, mark.variant);
      art = { canvas, bytes: canvas.width * canvas.height * 4 };
      const limit = (this.compact ? 4 : 8) * 1024 * 1024;
      while (this.artBytes + art.bytes > limit && this.art.size) {
        const first = this.art.entries().next().value;
        if (!first) break;
        this.art.delete(first[0]); this.artBytes -= first[1].bytes; first[1].canvas.width = 0; first[1].canvas.height = 0;
      }
      this.art.set(key, art); this.artBytes += art.bytes;
    }
    ctx.drawImage(art.canvas, mark.point.x - width / 2 * mark.scale, mark.point.y - rootY * mark.scale, width * mark.scale, height * mark.scale);
  }
  private feather(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'destination-out';
    const edge = 18;
    for (const side of ['left', 'right', 'top', 'bottom']) {
      const horizontal = side === 'left' || side === 'right', reverse = side === 'right' || side === 'bottom';
      const from = reverse ? (horizontal ? width : height) : 0, to = from + (reverse ? -edge : edge);
      const gradient = horizontal ? ctx.createLinearGradient(from, 0, to, 0) : ctx.createLinearGradient(0, from, 0, to);
      gradient.addColorStop(0, '#ffffffff'); gradient.addColorStop(1, '#ffffff00'); ctx.fillStyle = gradient;
      if (horizontal) ctx.fillRect(Math.min(from, to), 0, edge, height); else ctx.fillRect(0, Math.min(from, to), width, edge);
    }
    ctx.restore();
  }
  private drawSky(ctx: CanvasRenderingContext2D, bounds: SceneBounds, environment: EnvironmentFrame): void {
    const e = environment;
    const sky = ctx.createLinearGradient(0, -180, 0, 420); sky.addColorStop(0, e.skyTop); sky.addColorStop(1, e.skyBottom);
    ctx.fillStyle = sky; ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    const sunX = 170 + clamp((e.hour - 6) / 13) * 1020, sunY = 125 - Math.sin(clamp((e.hour - 6) / 13) * Math.PI) * 170;
    const light = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 450);
    light.addColorStop(0, `rgba(255,230,180,${(.18 + e.warmth * .15) * (1 - e.night) * (1 - e.cloud * .7)})`); light.addColorStop(1, '#f4efd900'); ctx.fillStyle = light; ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    if (e.night > .05) {
      const random = randomSequence(171018);
      ctx.save(); ctx.globalAlpha = e.night * (1 - e.cloud * .85); ctx.fillStyle = '#f2edcf';
      for (let i = 0; i < 76; i++) { const x = -200 + random() * 2070, y = -120 + random() * 260, r = .35 + random() * .55; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
      ctx.beginPath(); ctx.arc(790, 36, 8, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = e.skyTop; ctx.beginPath(); ctx.arc(794, 33, 7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    for (let layer = 0; layer < 3; layer++) {
      const drift = (e.elapsed * (1.6 + layer * .45) * e.wind + layer * 490) % 2200 - 320;
      ctx.save(); ctx.translate(drift, 15 + layer * 48); ctx.scale(220 + layer * 70, 10 + e.cloud * 15);
      ctx.globalAlpha = (.18 + e.cloud * .34) * (1 - e.night * .45);
      const wash = ctx.createRadialGradient(0, 0, .04, 0, 0, 1); wash.addColorStop(0, '#f5f2e8'); wash.addColorStop(.45, '#eef0e47a'); wash.addColorStop(1, '#eef0e400'); ctx.fillStyle = wash; ctx.fillRect(-1, -1, 2, 2); ctx.restore();
    }
    for (const [layer, path] of this.distantRidges.entries()) {
      const air = ctx.createLinearGradient(0, 100, 0, 440); air.addColorStop(0, e.distantTop); air.addColorStop(1, e.distantBottom);
      ctx.save(); ctx.globalAlpha = layer ? 1 : .72; ctx.fillStyle = air; ctx.fill(path); ctx.restore();
    }
  }
  private drawRoad(ctx: CanvasRenderingContext2D, road: GroundRibbon): void {
    const points = road.points;
    if (road.kind === 'active') {
      ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y); ctx.lineTo(points[1].x, points[1].y);
      ctx.strokeStyle = '#d7c9a1'; ctx.lineWidth = 4.2; ctx.stroke(); return;
    }
    ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    ctx.closePath();
    ctx.fillStyle = '#a1a58a';
    ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = .24; ctx.stroke();
  }
  destroy(): void {
    this.disposed = true; this.generation++; this.pending = null; release(this.overview); release(this.detail); this.overview = null; this.detail = null;
    for (const art of this.art.values()) { art.canvas.width = 0; art.canvas.height = 0; }
    this.art.clear(); this.artBytes = 0; this.bins.clear(); this.positions = new Float32Array(0); this.colors = new Uint8Array(0); this.luminance = new Float32Array(0); this.depths = new Float32Array(0);
  }
}
