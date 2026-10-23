import type { ImageCache, MiniInput, MiniViewRefs } from '../contracts';
import { CHARACTERS, characterId, readCharacterId, type CharacterId, type CharacterFrame } from '../../characters/catalog';
import { layout, ropeTied, sceneFile, windPoint, windPointAt, type AotaiGameId, type AotaiState, type Point, type Rect } from './model';
import { SNOW_FLOOR, SNOW_GOAL, SNOW_RADIUS, SNOW_START } from './snowball';
import { trailY, encounterAdult, encounterCalf, passageClear } from './takin';
import { PAINTED_PROPS, PAINTED_PROPS_FILE } from './painterly-art';
import { paperLayer, snowContact, snowMark, washPaper } from './watercolor';

type Ctx = CanvasRenderingContext2D;
const noise = (i: number) => { const n = Math.sin(i * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
function cover(ctx: Ctx, image: HTMLImageElement, r: Rect, ground?: number): void {
  const scale = Math.max(r.width / image.naturalWidth, r.height / image.naturalHeight), w = image.naturalWidth * scale, h = image.naturalHeight * scale;
  const y = ground === undefined ? r.y + (r.height - h) / 2 : Math.min(r.y, Math.max(r.y + r.height - h, ground - h * .64));
  ctx.drawImage(image, r.x + (r.width - w) / 2, y, w, h);
}
function line(ctx: Ctx, points: readonly Point[]): void { ctx.beginPath(); points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); }
function arrow(ctx: Ctx, a: Point, b: Point, alpha = .7): void {
  const angle = Math.atan2(b.y - a.y, b.x - a.x); ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = '#5e7774'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo((a.x + b.x) / 2 + 2, (a.y + b.y) / 2 - 3, b.x, b.y); ctx.stroke(); line(ctx, [{ x: b.x - Math.cos(angle - .5) * 15, y: b.y - Math.sin(angle - .5) * 15 }, b, { x: b.x - Math.cos(angle + .5) * 15, y: b.y - Math.sin(angle + .5) * 15 }]); ctx.stroke(); ctx.restore();
}
export class AotaiGameView implements MiniViewRefs {
  readonly directInput = true;
  readonly canvas: HTMLCanvasElement;
  contentState: 'loading' | 'ready' | 'error' = 'loading';
  disposed = false;
  private readonly pending = new AbortController();
  private observer: ResizeObserver | null = null;
  private host: HTMLElement | null = null;
  private state: AotaiState | null = null;
  private scene: HTMLImageElement | null = null;
  private props: HTMLImageElement | null = null;
  private actor: HTMLImageElement | null = null;
  private actions: HTMLImageElement | null = null;
  private stone: HTMLCanvasElement | null = null;
  private readonly paper: HTMLCanvasElement;
  private slope: HTMLCanvasElement | null = null;
  private portrait = false;
  private scale = 1; private dx = 0; private dy = 0;
  private viewport: Rect = { x: 0, y: 0, width: 1000, height: 720 };
  private readonly character: CharacterId;
  constructor(readonly id: AotaiGameId, private readonly doc: Document) {
    this.canvas = doc.createElement('canvas'); this.canvas.className = 'aotai-game-canvas'; this.canvas.setAttribute('aria-hidden', 'true');
    this.paper = paperLayer(doc);
    this.character = characterId(new URLSearchParams(doc.defaultView?.location.search).get('character')) ?? readCharacterId();
  }
  private resize(): void {
    if (!this.host || this.disposed) return;
    const rect = this.host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1, Math.sqrt(2800000 / Math.max(1, rect.width * rect.height)));
    this.portrait = rect.height > rect.width;
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr)); this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const height = this.portrait ? 1240 : 720;
    this.scale = Math.min(this.canvas.width / 1000, this.canvas.height / height); this.dx = (this.canvas.width - 1000 * this.scale) / 2; this.dy = (this.canvas.height - height * this.scale) / 2;
    this.viewport = { x: -this.dx / this.scale, y: -this.dy / this.scale, width: this.canvas.width / this.scale, height: this.canvas.height / this.scale };
    if (this.state) this.paint(this.state);
  }
  async mount(host: HTMLElement, cache?: ImageCache): Promise<void> {
    this.host = host; host.append(this.canvas); this.resize(); this.observer = new ResizeObserver(() => this.resize()); this.observer.observe(host);
    const { signal } = this.pending;
    const load = (file: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
      const entry = cache?.request(file, 'high'); let image: HTMLImageElement | null = null;
      const clean = () => { signal.removeEventListener('abort', abort); if (image) image.onload = image.onerror = null; };
      const abort = () => { clean(); reject(new DOMException('画作已收起', 'AbortError')); };
      if (signal.aborted) { abort(); return; } signal.addEventListener('abort', abort, { once: true });
      if (entry) void entry.promise.then(item => { if (signal.aborted) return; clean(); if (item.state === 'ready') resolve(item.image); else reject(new Error('画作暂未展开')); });
      else { image = new Image(); image.decoding = 'async'; image.onload = () => { if (!image) return; clean(); resolve(image); }; image.onerror = () => { clean(); reject(new Error('画作暂未展开')); }; image.src = file; }
    });
    try {
      const appearance = CHARACTERS[this.character];
      const [scene, props, actor, actions, slope] = await Promise.all([
        load(sceneFile(this.id)), this.id !== 'snow-lichen' ? load(PAINTED_PROPS_FILE) : Promise.resolve(null),
        load(appearance.walk.file), this.id === 'aotai-camp-night' ? load(appearance.actions.file) : Promise.resolve(null),
        this.id === 'snow-lichen' ? load('scenes/aotai-painterly-v1/winter-slope.webp') : Promise.resolve(null),
      ]);
      if (this.disposed || signal.aborted) return;
      this.scene = scene; this.props = props; this.actor = actor; this.actions = actions; this.slope = slope ? this.foregroundLayer(slope) : null; this.stone = this.id === 'snow-tracks' ? this.foregroundLayer(scene, true) : null;
      this.contentState = 'ready'; host.setAttribute('aria-busy', 'false'); if (this.state) this.paint(this.state);
    } catch { if (!this.disposed && !signal.aborted) { this.contentState = 'error'; host.setAttribute('aria-busy', 'false'); if (this.state) this.paint(this.state); } }
  }
  input(input: MiniInput): MiniInput { return { ...input, x: typeof input.x === 'number' ? (input.x * this.canvas.width - this.dx) / this.scale : undefined, y: typeof input.y === 'number' ? (input.y * this.canvas.height - this.dy) / this.scale : undefined }; }
  private foregroundLayer(image: HTMLImageElement, stone = false): HTMLCanvasElement {
    const canvas = this.doc.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('山坡画层无法展开');
    ctx.drawImage(image, 0, 0); ctx.globalCompositeOperation = 'destination-in';
    const edge = ctx.createLinearGradient(0, 0, canvas.width, 0); edge.addColorStop(0, 'transparent'); edge.addColorStop(.1, '#fff'); edge.addColorStop(.88, '#fff'); edge.addColorStop(1, 'transparent');
    ctx.fillStyle = edge; ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (stone) { const top = ctx.createLinearGradient(0, 0, 0, canvas.height); top.addColorStop(0, 'transparent'); top.addColorStop(.28, 'transparent'); top.addColorStop(.49, '#fff'); top.addColorStop(.78, '#fff'); top.addColorStop(1, 'transparent'); ctx.fillStyle = top; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    return canvas;
  }
  private characterAt(ctx: Ctx, at: Point, height: number, frame = 2, pose = false, lean = 0): void {
    const appearance = CHARACTERS[this.character], image = pose ? this.actions : this.actor;
    if (!image) return;
    const frames: readonly CharacterFrame[] = pose ? appearance.actions.frames : appearance.walk.frames, spec = frames[frame % frames.length], base = frames[0];
    const scale = height / (base.height * base.scale) * spec.scale;
    snowContact(ctx, at, height * .43, height * .035);
    ctx.save(); ctx.translate(at.x, at.y); ctx.rotate(lean); ctx.filter = 'saturate(.88) contrast(.96)';
    ctx.drawImage(image, spec.x, spec.y, spec.width, spec.height, -spec.footX * scale, -spec.footY * scale, spec.width * scale, spec.height * scale); ctx.restore();
  }
  private snow(ctx: Ctx, s: AotaiState, strength: number): void {
    if (s.play.reduced) return;
    const v = this.viewport, l = layout(s);
    for (let i = 0; i < 28; i++) { const t = (noise(i + 31) + s.age * (.025 + strength * .03)) % 1, x = v.x + (noise(i + 5) * v.width + s.age * strength * 40) % v.width, y = v.y + t * v.height;
      ctx.fillStyle = `rgba(249,249,237,${.32 + strength * .18})`; ctx.beginPath(); ctx.ellipse(x, y, 1.3, 1.8, -.4, 0, Math.PI * 2); ctx.fill(); }
    if (strength > .65) { ctx.strokeStyle = '#eff3e4'; ctx.lineWidth = 1.3; ctx.globalAlpha = .36; for (let i = 0; i < 12; i++) { const y = l.height * .25 + noise(i + 60) * l.height * .48, x = (noise(i + 45) * 1200 + s.age * 120) % 1300 - 160; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 60, y - 12, x + 120, y - 8); ctx.stroke(); } ctx.globalAlpha = 1; }
  }
  private snowball(ctx: Ctx, s: AotaiState): void {
    const p = s.session; if (p.kind !== 'snowball') return;
    const l = layout(s), points = SNOW_FLOOR.map(p => ({ x: p.x, y: p.y + l.snowOffset }));
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    if (this.stone) ctx.drawImage(this.stone, 0, l.snowOffset, 1000, 720);
    const gx = SNOW_GOAL.x, gy = SNOW_GOAL.y + l.snowOffset;
    snowContact(ctx, { x: gx, y: gy + 13 }, 87, 11);
    ctx.strokeStyle = '#fcf5e1ba'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx - 38, gy + 17); ctx.bezierCurveTo(gx - 18, gy + 30, gx + 22, gy + 25, gx + 43, gy + 8); ctx.stroke();
    ctx.fillStyle = '#647779'; ctx.font = '20px "Kaiti SC","STKaiti",serif'; ctx.textAlign = 'center'; ctx.fillText('雪窝', gx + 12, gy + 59);
    const ball = p.world.point, by = ball.y + l.snowOffset;
    snowContact(ctx, { x: ball.x, y: by + SNOW_RADIUS - 2 }, SNOW_RADIUS * 1.7, 4);
    if (this.props) { const f = PAINTED_PROPS.snowball; ctx.save(); ctx.translate(ball.x, by); ctx.rotate(p.world.angle); ctx.drawImage(this.props, f.x, f.y, f.width, f.height, -SNOW_RADIUS, -SNOW_RADIUS, SNOW_RADIUS * 2, SNOW_RADIUS * 2); ctx.restore(); }
    if (p.motion.kind === 'ready') arrow(ctx, { x: SNOW_START.x + 38, y: SNOW_START.y + l.snowOffset - 42 }, { x: SNOW_START.x + 102, y: SNOW_START.y + l.snowOffset - 12 }, .65);
    if (p.motion.kind === 'aiming') arrow(ctx, { x: SNOW_START.x, y: SNOW_START.y + l.snowOffset }, p.motion.to);
    if (p.motion.kind === 'rolling' && p.world.speed > 1.5 && !s.play.reduced) for (let i = 0; i < 7; i++) { ctx.fillStyle = '#f4f5e7a6'; ctx.beginPath(); ctx.arc(ball.x - 18 - noise(i + s.age) * 36, by + 12 - noise(i + 5) * 12, 1.4, 0, Math.PI * 2); ctx.fill(); }
    this.characterAt(ctx, { x: 100, y: points[0].y + 10 }, s.portrait ? 135 : 105); ctx.restore();
  }
  private wind(ctx: Ctx, s: AotaiState): void {
    const p = s.session; if (p.kind !== 'wind') return;
    const l = layout(s);
    ctx.save();
    if (this.slope) ctx.drawImage(this.slope, 0, 0, 1000, l.height);
    for (let i = 0; i < Math.floor(p.progress * 25); i++) { const at = windPointAt(i / 25, s.portrait); snowMark(ctx, { x: at.x + (i % 2 ? 4 : -4), y: at.y + 5 }, 6, -.32); }
    this.characterAt(ctx, windPoint(s), s.portrait ? 145 : 110, p.holding ? Math.floor(p.stride * 8) % 8 : 2, false, p.holding ? .035 + p.gust * .045 : -.025);
    this.snow(ctx, s, p.gust); ctx.restore();
  }
  private animal(ctx: Ctx, frame: Rect, x: number, footY: number, height: number, gait: number, faceLeft = false): void {
    if (!this.props) return; const scale = height / frame.height;
    snowContact(ctx, { x, y: footY }, frame.width * scale * .64, 7);
    ctx.save(); if (faceLeft) { ctx.beginPath(); ctx.rect(-400, -300, 1372, 2100); ctx.clip(); } ctx.translate(x, footY); if (faceLeft) ctx.scale(-1, 1); ctx.rotate(Math.sin(gait) * .007);
    ctx.drawImage(this.props, frame.x, frame.y, frame.width, frame.height, -frame.width * scale / 2, -height, frame.width * scale, height); ctx.restore();
  }
  private takin(ctx: Ctx, s: AotaiState): void {
    const p = s.session; if (p.kind !== 'takin') return;
    const l = layout(s), phase = p.phase, clear = passageClear(p.actor, l.height);
    ctx.save();
    // Snow, the main road and the near lay-by share one watercolor ground plane.
    for (let i = 0; i < 32; i++) { const x = 110 + noise(i + 91) * 330, y = l.height * (.75 + noise(i + 112) * .14); ctx.fillStyle = '#f9f6e720'; ctx.beginPath(); ctx.ellipse(x, y, 2 + noise(i) * 4, 1.3, -.2, 0, Math.PI * 2); ctx.fill(); }
    const adultX = encounterAdult(p), calfX = encounterCalf(p), adultProgress = Math.max(0, (.8 - adultX) / 1.04), calfProgress = Math.max(0, (.94 - calfX) / 1.15);
    for (let animal = 0; animal < 2; animal++) for (let i = 0; i < Math.floor((animal ? calfProgress : adultProgress) * 27); i++) {
      const x = (animal ? .94 : .8) * 1000 - i * 40, y = trailY(x / 1000) * l.height;
      for (const side of [-1, 1]) snowMark(ctx, { x: x + side * 5, y: y + side * 7 }, animal ? 4 : 6, -.17, true);
    }
    const adultWalking = phase.kind === 'opening' || phase.kind === 'adult' && clear;
    const calfWalking = phase.kind === 'calf' && clear;
    const mh = s.portrait ? 235 : 205, ch = mh * .53;
    // A second outline can be noticed before the calf enters the open trail.
    if (!['aftermath', 'returning', 'finished'].includes(phase.kind)) {
      ctx.save(); ctx.globalAlpha = phase.kind === 'calf' ? 1 : phase.kind === 'calf-reveal' ? .2 + Math.min(1, phase.elapsed / 6) * .8 : .13;
      this.animal(ctx, PAINTED_PROPS.calf, calfX * 1000, trailY(calfX) * l.height + 2, ch, calfWalking && !s.play.reduced ? p.footsteps * Math.PI : 0, true); ctx.restore();
    }
    if (adultX > -.21) this.animal(ctx, PAINTED_PROPS.mother, adultX * 1000, trailY(adultX) * l.height, mh, adultWalking && !s.play.reduced ? p.footsteps * Math.PI : 0, true);
    if (phase.kind === 'opening' || phase.kind === 'calf-reveal') { ctx.fillStyle = '#e4e9df38'; ctx.beginPath(); ctx.ellipse(970, l.height * .61, 70, 55, -.1, 0, Math.PI * 2); ctx.fill(); }
    const actor = { x: p.actor.x * 1000, y: p.actor.y * l.height };
    this.characterAt(ctx, actor, s.portrait ? 112 : 90, p.moving ? Math.floor(p.stride * 4) % 8 : 2);
    // Quiet gaze/hoof motion indicates that the animal is waiting for the lane.
    if ((phase.kind === 'yielding' || phase.kind === 'adult' || phase.kind === 'calf') && !clear && !s.play.reduced) {
      const x = (phase.kind === 'calf' ? calfX : adultX) * 1000, y = trailY(x / 1000) * l.height;
      ctx.strokeStyle = '#f7f3e150'; ctx.lineWidth = 2; ctx.beginPath(); const by = y - (phase.kind === 'calf' ? 45 : 92); ctx.moveTo(x - 77, by); ctx.bezierCurveTo(x - 84, by - 5, x - 89, by + Math.sin(s.age * 1.6) * 3, x - 97, by - 2); ctx.stroke();
    }
    this.snow(ctx, s, phase.kind === 'opening' ? .6 - Math.min(1, phase.elapsed / 10) * .4 : .18); ctx.restore();
  }
  private camp(ctx: Ctx, s: AotaiState): void {
    const p = s.session; if (p.kind !== 'camp' || !this.props) return; const l = layout(s), phase = p.phase, t = l.tent;
    const lit = phase.kind === 'lit' ? Math.min(1, phase.elapsed / 1.7) : 0;
    ctx.fillStyle = `rgba(14,30,56,${.66 + lit * .06})`; ctx.fillRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
    snowContact(ctx, { x: t.x + t.width / 2, y: t.y + t.height * .97 }, t.width * .94, 17);
    const drift = s.play.reduced ? 0 : Math.sin(s.age * 4.6) * (phase.kind === 'ropes' ? phase.tied === 'none' ? 4 : 2 : .25);
    ctx.save(); ctx.filter = `brightness(${.62 + lit * .22}) saturate(.8)`;
    const tentArt = PAINTED_PROPS.tent;
    for (let row = 0; row < 8; row++) { const sy = row / 8 * tentArt.height, sh = tentArt.height / 8;
      ctx.drawImage(this.props, tentArt.x, tentArt.y + sy, tentArt.width, Math.min(sh + 1, tentArt.height - sy), t.x + drift * (1 - row / 8), t.y + row / 8 * t.height, t.width, t.height / 8 + 1); }
    ctx.restore();
    for (const index of [0, 1] as const) {
      const tied = ropeTied(phase, index), root = l.roots[index], peg = l.pegs[index], end = tied ? peg : phase.kind === 'ropes' && phase.drag?.index === index ? phase.drag.point : l.loose[index];
      ctx.strokeStyle = '#e6dec1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(root.x + drift * .45, root.y); ctx.quadraticCurveTo((root.x + end.x) / 2, (root.y + end.y) / 2 + (tied ? 0 : 26 + Math.sin(s.age * 5 + index) * 6), end.x, end.y); ctx.stroke();
      ctx.strokeStyle = '#c1c9b1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(peg.x - 3, peg.y + 9); ctx.lineTo(peg.x + 4, peg.y - 11); ctx.lineTo(peg.x + 13, peg.y - 10); ctx.stroke();
      if (!tied) { ctx.strokeStyle = '#f6efdc'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(end.x, end.y, 13, 0, Math.PI * 2); ctx.stroke(); if (phase.kind === 'ropes' && (phase.focus === index || phase.drag?.index === index)) arrow(ctx, { x: end.x + (index ? 19 : -19), y: end.y - 10 }, { x: peg.x, y: peg.y - 16 }, .55); }
    }
    if (phase.kind === 'lamp' && !s.play.reduced) { const r = 21 + Math.sin(s.age * 2) * 2; ctx.strokeStyle = '#eee6ce'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(l.lamp.x - r * .8, l.lamp.y + 20); ctx.quadraticCurveTo(l.lamp.x, l.lamp.y + 24, l.lamp.x + r * .7, l.lamp.y + 20); ctx.stroke(); }
    if (lit > 0) {
      const glow = ctx.createRadialGradient(l.lamp.x, l.lamp.y, 2, l.lamp.x, l.lamp.y, 155); glow.addColorStop(0, `rgba(255,214,128,${lit * .8})`); glow.addColorStop(.27, `rgba(238,179,84,${lit * .37})`); glow.addColorStop(1, 'rgba(233,181,95,0)'); ctx.fillStyle = glow; ctx.fillRect(l.lamp.x - 160, l.lamp.y - 160, 320, 320);
      ctx.fillStyle = `rgba(255,230,161,${lit})`; ctx.beginPath(); ctx.ellipse(l.lamp.x, l.lamp.y + 5, 7, 11, 0, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 25; i++) { ctx.fillStyle = `rgba(249,239,202,${lit * .6})`; ctx.beginPath(); ctx.arc(noise(i + 71) * 1000, noise(i + 49) * l.height * .3, i % 5 ? 1 : 1.6, 0, Math.PI * 2); ctx.fill(); }
    }
    this.characterAt(ctx, { x: 260, y: t.y + t.height + 18 }, s.portrait ? 140 : 110, lit > .5 ? 2 : 0, true);
    this.snow(ctx, s, phase.kind === 'ropes' ? .75 : .2);
  }
  paint(s: AotaiState): void {
    if (this.disposed) return; this.state = s; s.portrait = this.portrait;
    const ctx = this.canvas.getContext('2d'); if (!ctx) return; const l = layout(s), scene = this.scene, v = this.viewport;
    ctx.setTransform(this.scale, 0, 0, this.scale, this.dx, this.dy); ctx.clearRect(v.x, v.y, v.width, v.height); ctx.fillStyle = '#e8ecdf'; ctx.fillRect(v.x, v.y, v.width, v.height);
    if (this.contentState !== 'ready' || !scene) { ctx.font = '24px "PingFang SC",sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#64786e'; ctx.fillText(this.contentState === 'error' ? '画作暂未展开，可以重试或继续山路。' : '山间画作正在展开……', 500, l.height / 2); return; }
    const camera = s.session.kind === 'takin' && !s.play.reduced ? 1 + Math.max(0, 1 - s.age / 10) * .075 : 1;
    ctx.save(); ctx.translate(500, l.height * .7); ctx.scale(camera, camera); ctx.translate(-500, -l.height * .7);
    const progress = s.session.kind === 'wind' ? s.session.progress : 0;
    ctx.save(); const zoom = 1 + progress * .09; ctx.translate(-progress * 28, progress * 20); cover(ctx, scene, { x: v.x, y: v.y - progress * 65, width: v.width * zoom, height: v.height * zoom }, s.session.kind === 'takin' || s.session.kind === 'camp' ? l.height * .67 : undefined); ctx.restore();
    switch (s.session.kind) { case 'snowball': this.snowball(ctx, s); break; case 'wind': this.wind(ctx, s); break; case 'takin': this.takin(ctx, s); break; case 'camp': this.camp(ctx, s); break; }
    ctx.restore();
    washPaper(ctx, this.paper, v);
    if (s.settledAt !== null) { const t = Math.min(1, (s.age - s.settledAt) / 1.6); ctx.fillStyle = `rgba(247,241,221,${t * .12})`; ctx.fillRect(v.x, v.y, v.width, v.height); }
  }
  dispose(): void {
    if (this.disposed) return; this.disposed = true; this.pending.abort(); this.observer?.disconnect(); this.canvas.remove();
    if (this.state?.session.kind === 'snowball') this.state.session.world.dispose();
    this.host = null; this.state = null; this.scene = this.props = this.actor = this.actions = null; this.slope = this.stone = null;
  }
}
export function viewOf(refs: MiniViewRefs): AotaiGameView { if (!(refs instanceof AotaiGameView)) throw new Error('鳌太线画面不存在'); return refs; }
