import { CAMP_NIGHT_ART, CAMP_STARS, CAMP_STAR_LINKS, CampStars, type StarFeedback, type StarLink } from './camp-stars';
import type { CampSaveResult } from './camp-journal';
import { circularBadge } from '../badge-art';
import type { EnvironmentFrame } from '../environment';
import { enterDialog, leaveDialog, type CancelMotion } from '../visible-motion';

interface CampNightOptions {
  readonly signal: AbortSignal;
  readonly onClose: (result: { collected: boolean; sleep: boolean }) => void;
  readonly onCollect: (art: string) => CampSaveResult;
  readonly onSound: () => void;
}
const SVG_NS = 'http://www.w3.org/2000/svg';

export class CampNight {
  private readonly dialog = document.createElement('dialog');
  private readonly image = new Image();
  private readonly starButtons: HTMLButtonElement[] = [];
  private readonly lines = document.createElementNS(SVG_NS, 'path');
  private readonly liveLine = document.createElementNS(SVG_NS, 'path');
  private model = new CampStars();
  private imageReady = false;
  private imageFailed = false;
  private cloudy = false;
  private reduced = false;
  private capture: string | null = null;
  private saveAttempted = false;
  private saveError: string | null = null;
  private drag: { pointer: number; from: number; x: number; y: number } | null = null;
  private cancelMotion: CancelMotion = () => {};
  private music: HTMLAudioElement | null = null;
  private paper: HTMLAudioElement | null = null;
  private sound = false;

  constructor(private readonly options: CampNightOptions) {
    const { signal } = options;
    this.dialog.id = 'ww-camp-night'; this.dialog.className = 'camp-night';
    this.dialog.setAttribute('aria-labelledby', 'camp-night-title');
    this.dialog.innerHTML = `<section class="camp-night-scene">
      <img class="camp-night-art" src="${CAMP_NIGHT_ART}" alt="草帽、蓝衣红围巾的 Q 版旅人坐在观音宕草甸营地，帐篷透出暖光，远处山脊连着夜空">
      <div class="camp-night-cloud" aria-hidden="true"></div><div class="camp-night-lamplight" aria-hidden="true"></div>
      <header class="camp-night-heading"><p>第一夜 · 观音宕</p><h2 id="camp-night-title">把今夜的星星记下来</h2><p class="camp-night-story"></p></header>
      <div class="camp-night-tools"><button type="button" data-camp="sound" aria-pressed="false">声音 · 关</button><button type="button" data-camp="close" aria-label="回到营地，暂不休息">×</button></div>
      <figure class="camp-star-note" hidden><figcaption>照着星图连线</figcaption><svg viewBox="-40 -35 1080 570" aria-label="照着这幅星形连线"></svg></figure>
      <div class="camp-star-field" role="group" aria-label="连接夜空里的星星" hidden><svg viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true"></svg></div>
      <article class="camp-night-keepsake" hidden><figure><img alt="我在观音宕连出的星图与营地夜色"></figure><h3>观音宕星夜</h3></article>
      <div class="camp-night-fold" aria-hidden="true"><span>星夜入帐</span><small>已收进旅行手帐</small></div>
    </section>
    <footer class="camp-night-footer"><div><p class="camp-night-status" role="status" aria-live="polite"></p><p class="camp-night-hint"></p></div><div class="camp-night-actions"><button type="button" data-camp="retry-image" hidden>重新展开手绘</button><button type="button" data-camp="undo" hidden>撤回一笔</button><button type="button" data-camp="retry" hidden>重新连</button><button type="button" data-camp="skip">今晚先休息</button><button type="button" data-camp="primary" class="camp-night-primary" hidden>重试保存</button></div></footer>`;
    document.body.append(this.dialog);
    this.buildStars(); this.loadImage();
    this.button('primary').addEventListener('click', () => this.collect(), { signal });
    this.button('close').addEventListener('click', () => this.close(false), { signal });
    this.button('skip').addEventListener('click', () => this.close(true), { signal });
    this.button('sound').addEventListener('click', options.onSound, { signal });
    this.button('undo').addEventListener('click', () => { this.model.undo(); this.render(); }, { signal });
    this.button('retry').addEventListener('click', () => { this.model.retry(); this.render(); }, { signal });
    this.button('retry-image').addEventListener('click', () => this.loadImage(), { signal });
    this.dialog.addEventListener('cancel', event => { event.preventDefault(); this.close(false); }, { signal });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { this.pauseAudio(); this.drag = null; this.liveLine.setAttribute('d', ''); }
      else if (this.open) { if (this.sound) void this.setSound(true).catch(() => {}); this.render(); }
    }, { signal });
  }
  private element(selector: string): HTMLElement {
    const element = this.dialog.querySelector(selector);
    if (!(element instanceof HTMLElement)) throw new Error(`营地界面缺少 ${selector}`);
    return element;
  }
  private button(name: string): HTMLButtonElement {
    const element = this.element(`[data-camp="${name}"]`);
    if (!(element instanceof HTMLButtonElement)) throw new Error(`营地按钮无法读取 ${name}`);
    return element;
  }
  get open(): boolean { return this.dialog.open; }
  show(weather: EnvironmentFrame['weather'], reduced: boolean, sound: boolean): void {
    if (this.open) return;
    this.model = new CampStars(); this.capture = null; this.saveAttempted = false; this.saveError = null;
    this.cloudy = weather !== 'clear'; this.reduced = reduced;
    this.dialog.dataset.weather = weather; this.dialog.dataset.reduced = String(reduced);
    this.render(); this.dialog.showModal(); this.cancelMotion = enterDialog(this.dialog, reduced);
    if (sound) void this.setSound(true).catch(() => {});
    if (!this.cloudy && this.imageReady) this.starButtons[0]?.focus({ preventScroll: true });
    else this.button('skip').focus({ preventScroll: true });
  }
  private loadImage(): void {
    this.imageReady = false; this.imageFailed = false; this.dialog.dataset.media = 'loading';
    this.image.onload = () => {
      this.imageReady = true; this.imageFailed = false; this.dialog.dataset.media = 'ready';
      const picture = this.dialog.querySelector('.camp-night-art'); if (picture instanceof HTMLImageElement) picture.src = this.image.src;
      if (this.open) this.render();
    };
    this.image.onerror = () => { this.imageReady = false; this.imageFailed = true; this.dialog.dataset.media = 'error'; if (this.open) this.render(); };
    this.image.src = CAMP_NIGHT_ART;
    if (this.open) this.render();
  }
  private buildStars(): void {
    const field = this.element('.camp-star-field'), svg = field.querySelector('svg');
    const note = this.dialog.querySelector('.camp-star-note svg');
    if (!(svg instanceof SVGSVGElement) || !(note instanceof SVGSVGElement)) throw new Error('营地星图无法展开');
    this.lines.classList.add('camp-star-lines'); this.liveLine.classList.add('camp-star-live'); svg.append(this.lines, this.liveLine);
    const example = document.createElementNS(SVG_NS, 'path'); example.setAttribute('d', this.path(CAMP_STAR_LINKS)); note.append(example);
    for (const [index, star] of CAMP_STARS.entries()) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'camp-star';
      button.style.left = `${star.x * 100}%`; button.style.top = `${star.y * 100}%`;
      button.setAttribute('aria-label', `星点 ${index + 1}`); button.setAttribute('aria-pressed', 'false'); button.dataset.star = String(index);
      button.innerHTML = '<span aria-hidden="true"></span>'; this.starButtons.push(button); field.append(button);
      button.addEventListener('click', event => { if (event.detail === 0) this.feedback(this.model.choose(index)); }, { signal: this.options.signal });
      if (index < 7) { const point = document.createElementNS(SVG_NS, 'circle'); point.setAttribute('cx', String(star.x * 1000)); point.setAttribute('cy', String(star.y * 500)); point.setAttribute('r', '12'); note.append(point); }
    }
    field.addEventListener('pointerdown', event => {
      if (this.model.state.kind !== 'playing' || event.button > 0 || !event.isPrimary) return;
      const index = this.nearStar(event.clientX, event.clientY);
      if (index === null) return;
      event.preventDefault(); this.starButtons[index]?.focus({ preventScroll: true });
      this.drag = { pointer: event.pointerId, from: index, x: event.clientX, y: event.clientY }; field.setPointerCapture(event.pointerId);
    }, { signal: this.options.signal });
    field.addEventListener('pointermove', event => {
      if (!this.drag || this.drag.pointer !== event.pointerId) return;
      const box = field.getBoundingClientRect(), star = CAMP_STARS[this.drag.from];
      this.liveLine.setAttribute('d', `M${star.x * 1000},${star.y * 500}L${(event.clientX - box.left) / box.width * 1000},${(event.clientY - box.top) / box.height * 500}`);
    }, { signal: this.options.signal });
    field.addEventListener('pointerup', event => {
      const drag = this.drag; if (!drag || drag.pointer !== event.pointerId) return;
      this.drag = null; this.liveLine.setAttribute('d', '');
      const to = this.nearStar(event.clientX, event.clientY);
      if (to === null) return;
      const moved = Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 8;
      this.feedback(to !== drag.from && moved ? this.model.join(drag.from, to) : this.model.choose(to));
    }, { signal: this.options.signal });
    field.addEventListener('pointercancel', () => { this.drag = null; this.liveLine.setAttribute('d', ''); }, { signal: this.options.signal });
  }
  private nearStar(x: number, y: number): number | null {
    const box = this.element('.camp-star-field').getBoundingClientRect(); let nearest: number | null = null, gap = 27;
    for (const [index, star] of CAMP_STARS.entries()) {
      const d = Math.hypot(x - box.left - star.x * box.width, y - box.top - star.y * box.height);
      if (d < gap) { gap = d; nearest = index; }
    }
    return nearest;
  }
  private path(links: readonly StarLink[]): string {
    return links.map(([a, b]) => `M${CAMP_STARS[a].x * 1000},${CAMP_STARS[a].y * 500}L${CAMP_STARS[b].x * 1000},${CAMP_STARS[b].y * 500}`).join('');
  }
  private feedback(result: StarFeedback): void {
    if (result === 'complete') this.capture = this.captureArt();
    this.render();
    if (result === 'miss') this.element('.camp-night-status').textContent = '这条线和纸上的星形不一样，换一颗试试。';
    else if (result === 'repeat') this.element('.camp-night-status').textContent = '这一笔已经记下了，接着看看旁边的星星。';
  }
  private captureArt(): string | null {
    if (!this.imageReady) return null;
    const canvas = circularBadge(this.image, { camp: true }); if (!canvas) return null;
    const context = canvas.getContext('2d'); if (!context) return null;
    context.strokeStyle = '#f1e5b3'; context.lineWidth = 1.5; context.globalAlpha = .8; context.beginPath();
    const point = (index: number) => ({ x: (CAMP_STARS[index].x * .40 + .42) * canvas.width, y: (CAMP_STARS[index].y * .24 + .17) * canvas.height });
    for (const [a, b] of CAMP_STAR_LINKS) { const from = point(a), to = point(b); context.moveTo(from.x, from.y); context.lineTo(to.x, to.y); }
    context.stroke(); context.globalAlpha = 1; context.fillStyle = '#fff4ca';
    for (let i = 0; i < 7; i++) { const star = point(i); context.beginPath(); context.arc(star.x, star.y, 3, 0, Math.PI * 2); context.fill(); }
    return canvas.toDataURL('image/webp', .88);
  }
  private render(): void {
    if (this.model.state.kind === 'watching' && this.imageReady && !this.cloudy) this.model.begin();
    const state = this.model.state, playing = state.kind === 'playing', complete = state.kind === 'complete', collected = state.kind === 'collected';
    this.dialog.dataset.phase = state.kind;
    this.element('.camp-star-note').hidden = !playing; this.element('.camp-star-field').hidden = !playing;
    this.element('.camp-night-keepsake').hidden = !complete && !collected;
    this.lines.setAttribute('d', this.path(this.model.links));
    for (const [index, button] of this.starButtons.entries()) {
      button.setAttribute('aria-pressed', String(state.kind === 'playing' && state.selected === index));
      button.classList.toggle('is-linked', this.model.links.some(link => link.includes(index)));
    }
    this.button('undo').hidden = !playing; this.button('undo').disabled = !this.model.links.length;
    this.button('retry').hidden = !playing; this.button('retry').disabled = !this.model.links.length;
    this.button('retry-image').hidden = !this.imageFailed;
    this.button('primary').hidden = !this.saveError;
    this.button('primary').disabled = !this.capture;
    this.button('primary').textContent = '重试保存';
    this.button('skip').hidden = collected; this.button('skip').textContent = '先休息';
    const art = this.dialog.querySelector('.camp-night-keepsake img');
    if (art instanceof HTMLImageElement) art.src = this.capture ?? CAMP_NIGHT_ART;
    const title = this.element('#camp-night-title'), story = this.element('.camp-night-story');
    title.textContent = this.cloudy ? '今夜，听山风' : collected ? '这一夜，收好了' : complete ? '星星连起来了' : '把今夜的星星记下来';
    story.textContent = this.cloudy ? '云遮住了星空，今晚听山风。' : '';
    this.element('.camp-night-status').textContent = this.saveError ?? (this.imageFailed ? '小画未能加载，可以重试或先休息。' : collected ? '已收进手帐' : complete ? '正在收好这一夜…' : playing ? `${this.model.links.length} / 7 笔` : this.cloudy ? '今夜多云' : '夜色正在展开…');
    this.element('.camp-night-hint').textContent = playing ? '点击两颗星连线，或拖动。' : '';
    if (complete && this.capture && this.open && !document.hidden && !this.saveAttempted) this.collect();
  }
  private collect(): void {
    if (this.model.state.kind !== 'complete' || !this.capture) return;
    this.saveAttempted = true; this.saveError = null;
    const result = this.options.onCollect(this.capture);
    if (result.kind === 'error') { this.saveError = result.message; this.render(); return; }
    if (!this.model.collect()) return;
    this.render();
    if (this.sound && !document.hidden) { this.paper ??= new Audio('audio/wugong-paper-v1.mp3'); this.paper.volume = .17; void this.paper.play().catch(() => {}); }
    this.cancelMotion(); this.cancelMotion = leaveDialog(this.dialog, this.reduced, () => this.close(true));
  }
  async setSound(enabled: boolean): Promise<void> {
    this.sound = enabled; this.button('sound').textContent = enabled ? '声音 · 开' : '声音 · 关'; this.button('sound').setAttribute('aria-pressed', String(enabled));
    if (!enabled || !this.open || document.hidden) { this.pauseAudio(); return; }
    this.music ??= new Audio('audio/wugong-reverie-v1.mp3'); this.music.loop = true; this.music.volume = .12;
    await this.music.play();
    if (!this.sound || !this.open || document.hidden) this.pauseAudio();
  }
  pauseAudio(): void { this.music?.pause(); this.paper?.pause(); }
  private close(sleep: boolean): void {
    if (!this.open) return;
    this.cancelMotion(); this.drag = null; this.liveLine.setAttribute('d', ''); this.pauseAudio();
    const collected = this.model.state.kind === 'collected'; this.dialog.close(); this.options.onClose({ collected, sleep });
  }
  destroy(): void {
    this.cancelMotion(); this.pauseAudio(); this.image.onload = null; this.image.onerror = null;
    this.dialog.close(); this.dialog.remove();
  }
}
