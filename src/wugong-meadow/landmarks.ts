import { chapters, visits } from '../wugong-walk/visits';
import type { RouteStopId } from './terrain';

export const stopIcons: Record<RouteStopId, string> = {
  start: '<path d="m3 11 9-7 9 7M5 10v10h14V10M10 20v-6h4v6"/>',
  slope: '<path d="M3 20h18M4 17l5-7 4 3 6-10M15 4h5v5"/>',
  meadow: '<path d="M3 20h18M6 19c1-6-1-8-3-10m9 10c-3-9 1-13 4-15m1 15c-1-4 1-7 4-8"/><circle cx="5" cy="5" r="1.5"/>',
  camp: '<path d="m3 20 9-16 9 16ZM8 20l4-8 4 8M9 3l6 1"/>',
  horse: '<path d="M12 3v19M4 6h13l4 3-4 3H4Zm3 10H3l-2 2 2 2h14v-4Z"/>',
  summit: '<path d="m2 21 7-12 5 7 3-6 6 11ZM12 10V2l8 3-8 3"/>',
  end: '<path d="M4 21V7m16 14V7M2 6h20M6 3h12M7 21V11h10v10M2 21h20"/>',
};
export function stopInfo(id: RouteStopId): typeof visits.end {
  if (id === 'camp') return { ...visits.camp, paragraphs: [visits.camp.paragraphs[0], '在草甸间歇脚，等夜色慢慢落下。第二天继续前往吊马桩和金顶，再从景区下山。'] };
  if (id !== 'start') return visits[id];
  return {
    ...visits.end, title: '东江村', subtitle: '第一天，从山脚出发',
    paragraphs: ['从东江村踏上这条两天一夜的经典反穿。先沿林间山路爬升，再走进开阔草甸，经过绝望坡，前往观音宕／星空营地。', '第二天继续穿过起伏山脊，经吊马桩登金顶，最后沿景区山路下山，在景区大门结束。'],
    caption: '武功山山脊区域实景，用作行程介绍，非东江村定点照片。',
  };
}

function node(id: string): HTMLElement {
  const element = document.getElementById(id); if (!element) throw new Error(`景点介绍缺少 ${id}`); return element;
}
function link(id: string): HTMLAnchorElement {
  const element = node(id); if (!(element instanceof HTMLAnchorElement)) throw new Error('景点来源链接无法读取'); return element;
}
export class LandmarkCard {
  private readonly dialog: HTMLDialogElement;
  private readonly image: HTMLImageElement;
  private active: RouteStopId | null = null;
  constructor(onClose: (proceed: boolean) => void, signal: AbortSignal, onArt: (entry: string, place: string) => void) {
    const dialog = node('meadow-visit'), image = node('meadow-photo');
    if (!(dialog instanceof HTMLDialogElement) || !(image instanceof HTMLImageElement)) throw new Error('景点照片卡片无法打开');
    this.dialog = dialog; this.image = image;
    const close = (proceed: boolean) => { this.active = null; this.dialog.close(); onClose(proceed); };
    node('meadow-visit-close').addEventListener('click', () => close(false), { signal });
    node('meadow-visit-proceed').addEventListener('click', () => close(true), { signal });
    node('meadow-visit-art').addEventListener('click', () => {
      if (!this.active || this.dialog.dataset.arrived !== 'true') return;
      const chapter = chapters[this.active]; if (chapter) onArt(chapter.id, chapter.place);
    }, { signal });
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(false); }, { signal });
    image.addEventListener('load', () => { node('meadow-photo-state').hidden = true; image.hidden = false; }, { signal });
    image.addEventListener('error', () => { node('meadow-photo-state').textContent = '照片暂时未能加载，介绍仍可阅读。'; node('meadow-photo-state').hidden = false; image.hidden = true; node('meadow-photo-retry').hidden = false; }, { signal });
    node('meadow-photo-retry').addEventListener('click', () => {
      if (!this.active) return;
      node('meadow-photo-retry').hidden = true; node('meadow-photo-state').textContent = '实景照片正在展开…';
      image.src = `${stopInfo(this.active).file}?retry=${Date.now()}`;
    }, { signal });
  }
  sync(id: RouteStopId | null, arrived: boolean, action: string): void {
    if (this.active === id) return;
    this.active = id;
    if (!id) { this.dialog.close(); return; }
    const info = stopInfo(id);
    node('meadow-visit-title').textContent = info.title; node('meadow-visit-subtitle').textContent = info.subtitle;
    node('meadow-visit-body').replaceChildren(...info.paragraphs.map(text => { const p = document.createElement('p'); p.textContent = text; return p; }));
    node('meadow-photo-caption').textContent = info.caption;
    const source = link('meadow-photo-source'); source.href = info.source; source.textContent = `${info.author} · 原始照片`;
    const license = link('meadow-photo-license'); license.href = info.licenseUrl; license.textContent = info.license;
    link('meadow-visit-source').href = info.introduction;
    this.image.hidden = true; this.image.alt = info.alt; node('meadow-photo-state').hidden = false; node('meadow-photo-state').textContent = '实景照片正在展开…'; node('meadow-photo-retry').hidden = true;
    this.image.src = info.file;
    node('meadow-visit-proceed').textContent = action;
    const chapter = chapters[id], art = node('meadow-visit-art');
    art.hidden = !arrived || !chapter;
    if (chapter) art.textContent = `手绘互动 · ${chapter.label}`;
    this.dialog.dataset.stop = id; this.dialog.dataset.arrived = String(arrived);
    if (!this.dialog.open) this.dialog.showModal();
    node('meadow-visit-scroll').scrollTop = 0;
  }
  dispose(): void { if (this.dialog.open) this.dialog.close(); }
}

