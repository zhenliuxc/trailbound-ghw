import { FOREST_ART, FOREST_LEAVES_ID, HOMEWARD_PAGES_ID, JOURNEY_PAGES, JourneyPages, LeafPairs, RETURN_ART, type KeepsakeId } from './keepsake-games';
import type { CampSaveResult } from './camp-journal';
import { circularBadge } from '../badge-art';
import { enterDialog, leaveDialog, type CancelMotion } from '../visible-motion';

interface KeepsakeOptions {
  readonly signal: AbortSignal;
  readonly onClose: (result: { collected: boolean; continueWalk: boolean }) => void;
  readonly onCollect: (id: KeepsakeId, art: string) => CampSaveResult;
  readonly onCue: (cue: 'turn' | 'match' | 'collect') => void;
}

const LEAVES = [
  'M30 60C7 43 8 19 34 6C54 25 55 47 30 60Z',
  'M30 60C8 52 19 38 12 28C20 26 15 13 30 5C45 13 40 26 48 28C41 38 52 52 30 60Z',
  'M30 60C11 49 17 20 47 7C49 32 45 52 30 60Z',
  'M30 60L13 49L19 42L8 32L21 31L18 18L28 24L32 6L37 25L49 18L44 32L55 36L43 44L48 53Z',
];

function leaf(type: number): string {
  const colors = ['#78945c', '#a2ad65', '#bd9b60', '#789889'];
  return `<svg viewBox="0 0 64 72" aria-hidden="true"><path d="${LEAVES[type]}" fill="${colors[type]}" stroke="#64764f" stroke-width=".9"/><path d="M29 67Q32 44 32 17M32 49l-13-8m13 0 12-10M32 33l-10-8m10 0 8-8" fill="none" stroke="#ecedbc" stroke-width="1.1" stroke-linecap="round"/></svg>`;
}

export class TrailKeepsakes {
  private readonly dialog = document.createElement('dialog');
  private readonly images = new Map<KeepsakeId, HTMLImageElement>();
  private id: KeepsakeId = FOREST_LEAVES_ID;
  private leaves = new LeafPairs();
  private pages = new JourneyPages();
  private capture: string | null = null;
  private collected = false;
  private saveAttempted = false;
  private saveError: string | null = null;
  private cancelMotion: CancelMotion = () => {};
  private drag: { pointer: number; from: number; x: number; y: number } | null = null;
  constructor(private readonly options: KeepsakeOptions) {
    const { signal } = options;
    this.dialog.id = 'ww-trail-keepsake'; this.dialog.className = 'trail-keepsake';
    this.dialog.setAttribute('aria-labelledby', 'keepsake-title');
    this.dialog.innerHTML = `<header><div><small class="keepsake-place"></small><h2 id="keepsake-title"></h2></div><button type="button" data-keepsake="close" aria-label="关闭小画，停在山路">×</button></header>
      <div class="keepsake-layout"><figure class="keepsake-painting"><img alt="武功山旅途手绘"></figure><section class="keepsake-paper"><p class="keepsake-instruction"></p><div class="keepsake-cards" role="group"></div><p class="keepsake-status" role="status" aria-live="polite"></p></section></div>
      <footer><button type="button" data-keepsake="retry">重新玩</button><button type="button" data-keepsake="skip">这次继续走</button><button type="button" data-keepsake="collect" hidden>重试保存</button></footer>`;
    document.body.append(this.dialog);
    this.button('close').addEventListener('click', () => this.close(false), { signal });
    this.button('skip').addEventListener('click', () => this.close(true), { signal });
    this.button('collect').addEventListener('click', () => this.collect(), { signal });
    this.button('retry').addEventListener('click', () => { this.leaves = new LeafPairs(); this.pages = new JourneyPages(); this.capture = null; this.saveAttempted = false; this.saveError = null; this.render(); }, { signal });
    this.dialog.addEventListener('cancel', event => { event.preventDefault(); this.close(false); }, { signal });
    const cards = this.element('.keepsake-cards');
    cards.addEventListener('pointerdown', event => {
      if (this.id !== HOMEWARD_PAGES_ID || !(event.target instanceof Element)) return;
      const card = event.target.closest<HTMLButtonElement>('[data-card]');
      if (card && event.button === 0) this.drag = { pointer: event.pointerId, from: Number(card.dataset.card), x: event.clientX, y: event.clientY };
    }, { signal });
    cards.addEventListener('pointerup', event => {
      const drag = this.drag; this.drag = null;
      if (!drag || drag.pointer !== event.pointerId || Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 12) return;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLButtonElement>('[data-card]');
      if (target && this.pages.swap(drag.from, Number(target.dataset.card))) { event.preventDefault(); this.options.onCue('turn'); this.render(); this.focusCard(Number(target.dataset.card)); }
    }, { signal });
    cards.addEventListener('pointercancel', () => { this.drag = null; }, { signal });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.drag = null;
      else if (this.open && !this.collected) this.render();
    }, { signal });
    for (const [id, file] of [[FOREST_LEAVES_ID, FOREST_ART], [HOMEWARD_PAGES_ID, RETURN_ART]] as const) {
      const image = new Image(); image.decoding = 'async';
      image.onload = () => { if (this.open && this.id === id) this.render(); };
      image.onerror = () => { if (this.open && this.id === id) this.element('.keepsake-status').textContent = '小画未能加载，可以稍后再来。'; };
      image.src = file; this.images.set(id, image);
    }
  }
  get open(): boolean { return this.dialog.open; }
  private element(selector: string): HTMLElement {
    const element = this.dialog.querySelector(selector);
    if (!(element instanceof HTMLElement)) throw new Error(`旅途小画缺少 ${selector}`);
    return element;
  }
  private button(name: string): HTMLButtonElement {
    const element = this.element(`[data-keepsake="${name}"]`);
    if (!(element instanceof HTMLButtonElement)) throw new Error(`旅途小画按钮缺少 ${name}`);
    return element;
  }
  show(id: KeepsakeId): void {
    if (this.open) return;
    this.id = id; this.leaves = new LeafPairs(); this.pages = new JourneyPages(); this.capture = null; this.collected = false; this.saveAttempted = false; this.saveError = null;
    this.render(); this.dialog.showModal(); this.cancelMotion = enterDialog(this.dialog, matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  private get complete(): boolean { return this.id === FOREST_LEAVES_ID ? this.leaves.complete : this.pages.complete; }
  private render(): void {
    const forest = this.id === FOREST_LEAVES_ID, complete = this.complete;
    this.dialog.dataset.game = forest ? 'leaves' : 'pages'; this.dialog.dataset.state = this.collected ? 'collected' : complete ? 'complete' : 'playing';
    this.element('#keepsake-title').textContent = forest ? '林间的叶影' : '回望来路';
    this.element('.keepsake-place').textContent = forest ? '第一天 · 上山林间' : '第二天 · 福星谷下山林间';
    this.element('.keepsake-instruction').textContent = complete ? '这一页，记下来了。' : forest ? '翻开两张纸叶，找到四对相同的叶形。' : '拖动小画，按走过的顺序排好。也可以点两幅交换。';
    const image = this.images.get(this.id), painting = this.dialog.querySelector('.keepsake-painting img');
    if (painting instanceof HTMLImageElement) { painting.src = this.capture ?? image?.src ?? ''; painting.alt = forest ? '林间上坡的水彩纪念画' : '完整旅程的武功山草甸水彩纪念画'; painting.hidden = !image?.naturalWidth; }
    const cards = this.element('.keepsake-cards'); cards.replaceChildren(); cards.hidden = complete;
    if (!complete && forest) for (const [index, type] of this.leaves.deck.entries()) {
      const face = this.leaves.open.includes(index) || this.leaves.matched.has(index), card = document.createElement('button');
      card.type = 'button'; card.dataset.card = String(index); card.dataset.face = String(face); card.dataset.matched = String(this.leaves.matched.has(index));
      card.setAttribute('aria-label', `纸叶 ${index + 1}${face ? ` · 叶形 ${type + 1}` : ' · 未翻开'}`);
      card.innerHTML = face ? leaf(type) : '<span aria-hidden="true">叶影</span>'; card.disabled = this.leaves.matched.has(index);
      card.addEventListener('click', () => { const result = this.leaves.choose(index); if (result === 'idle') return; this.options.onCue(result === 'pair' || result === 'complete' ? 'match' : 'turn'); this.render(); this.focusCard(index); if (result === 'miss') this.element('.keepsake-status').textContent = '形状不同，记住它们，再翻下一张。'; }); cards.append(card);
    }
    if (!complete && !forest) for (const [index, page] of this.pages.order.entries()) {
      const info = JOURNEY_PAGES[page], card = document.createElement('button'); card.type = 'button'; card.dataset.card = String(index);
      card.setAttribute('aria-label', `第 ${index + 1} 幅 · ${info.title}`); card.setAttribute('aria-pressed', String(this.pages.selected === index));
      card.innerHTML = `<small>${index + 1}</small><img src="${info.file}" alt="${info.title}" draggable="false"><span>${info.title}</span>`;
      card.addEventListener('click', event => { if (event.defaultPrevented) return; this.pages.choose(index); this.options.onCue(this.pages.complete ? 'match' : 'turn'); this.render(); this.focusCard(index); }); cards.append(card);
    }
    if (complete && !this.capture && image?.naturalWidth) this.makeCapture(image);
    this.element('.keepsake-status').textContent = this.saveError ?? (this.collected ? '已收进手帐' : complete ? '正在收好这一页…' : forest ? `已找到 ${this.leaves.matched.size / 2} / 4 对` : this.pages.selected === null ? '林间 → 草甸 → 营地 → 金顶' : '再点一幅交换位置');
    this.button('retry').hidden = complete; this.button('skip').hidden = this.collected;
    this.button('collect').hidden = !this.saveError;
    if (complete && this.capture && this.open && !document.hidden && !this.saveAttempted) this.collect();
  }
  private focusCard(index: number): void {
    if (this.complete) { this.element('.keepsake-status').setAttribute('tabindex', '-1'); this.element('.keepsake-status').focus({ preventScroll: true }); return; }
    const chosen = this.dialog.querySelector(`[data-card="${index}"]`);
    const available = chosen instanceof HTMLButtonElement && !chosen.disabled ? chosen : this.dialog.querySelector('.keepsake-cards button:not(:disabled)');
    if (available instanceof HTMLButtonElement) available.focus({ preventScroll: true });
  }
  private makeCapture(image: HTMLImageElement): void {
    const canvas = circularBadge(image); if (!canvas) return;
    this.capture = canvas.toDataURL('image/webp', .88);
    const picture = this.dialog.querySelector('.keepsake-painting img'); if (picture instanceof HTMLImageElement) picture.src = this.capture;
  }
  private collect(): void {
    if (!this.complete || !this.capture || this.collected) return;
    this.saveAttempted = true; this.saveError = null;
    const result = this.options.onCollect(this.id, this.capture);
    if (result.kind === 'error') { this.saveError = result.message; this.render(); return; }
    this.collected = true; this.options.onCue('collect'); this.render(); this.scheduleClose();
  }
  private scheduleClose(): void {
    this.cancelMotion();
    this.cancelMotion = leaveDialog(this.dialog, matchMedia('(prefers-reduced-motion: reduce)').matches, () => this.close(true));
  }
  private close(continueWalk: boolean): void { if (!this.open) return; this.cancelMotion(); this.drag = null; this.dialog.close(); this.options.onClose({ collected: this.collected, continueWalk }); }
  destroy(): void { this.cancelMotion(); for (const image of this.images.values()) { image.onload = null; image.onerror = null; } this.dialog.remove(); }
}
