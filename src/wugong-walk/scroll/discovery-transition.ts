import type { Point } from '../model';
import { animateWhileVisible, type CancelMotion } from '../visible-motion';
import type { TrailEventId } from './events';

type DiscoveryId = Exclude<TrailEventId, 'encounter'>;
export interface DiscoveryCue { readonly line: string; readonly motif: string }
export const DISCOVERY_SCENES: Readonly<Record<DiscoveryId, DiscoveryCue>> = {
  leaves: { line: '一片叶子，轻轻落在脚边。', motif: '<path d="M13 39C-3 25 11 6 36 5c1 22-6 38-23 34ZM9 45Q18 26 31 13M18 28l-7-5m12-2 5 1"/>' },
  kite: { line: '转过山肩，风托起了背包边的纸鸢。', motif: '<path d="m26 3 14 16-14 15-13-15L26 3Zm0 0v31M13 19h27M26 34q-10 6-4 10t-7 8M2 14h8M2 26h8"/>' },
  stars: { line: '帐篷的灯暗下来，星星一颗颗亮起。', motif: '<path d="m7 30 7-18 11 10 15-14M14 12l11 10-3 19 14 5 4-20-15-4"/><circle cx="14" cy="12" r="2"/><circle cx="7" cy="30" r="2"/><circle cx="40" cy="8" r="2"/><circle cx="25" cy="22" r="2"/>' },
  clouds: { line: '一片晨云，慢慢让出了远处的山。', motif: '<path d="M4 28c-6-7 1-13 8-11 2-13 22-13 24 0 12-1 13 15 1 15H9M8 43l11-13 8 7 6-10 12 16"/>' },
  stones: { line: '石缝里的光，把山色拼成了一幅画。', motif: '<path d="m5 25 6-15 18-5 13 15-8 20-20 2L5 25Zm6-15 9 16 22-6M20 26l-6 16m6-16 14 14"/>' },
  return: { line: '回到林荫里，翻翻这两天留下的小画。', motif: '<path d="M3 10q11-3 21 3 10-6 21-3v30q-11-3-21 3-10-6-21-3V10Zm21 3v30M9 19l8 1m-8 7 8 1m14-8 8-1m-8 9 8-1"/>' },
};

export class DiscoveryTransition<Id extends string> {
  private readonly layer = document.createElement('div');
  private cancelMotion: CancelMotion = () => {};
  private waiting = false;
  constructor(map: HTMLElement, signal: AbortSignal, private readonly scenes: Readonly<Record<Id, DiscoveryCue>>) {
    this.layer.id = 'ww-discovery'; this.layer.className = 'ww-discovery'; this.layer.hidden = true;
    map.append(this.layer);
    signal.addEventListener('abort', () => { this.cancel(); this.layer.remove(); }, { once: true });
  }
  get pending(): boolean { return this.waiting; }
  position(at: Point, width: number, height: number): void {
    this.layer.style.setProperty('--discovery-x', `${Math.max(12, Math.min(88, at.x / width * 100))}%`);
    this.layer.style.setProperty('--discovery-y', `${Math.max(22, Math.min(65, at.y / height * 100 - 15))}%`);
  }
  show(id: Id, reduced: boolean, open: () => void): void {
    this.cancel(); this.waiting = true;
    const scene = this.scenes[id];
    this.layer.dataset.scene = id; this.layer.dataset.reduced = String(reduced);
    this.layer.innerHTML = `<span class="ww-discovery-motif" aria-hidden="true"><svg viewBox="0 0 50 55">${scene.motif}</svg></span><p role="status" aria-live="polite">${scene.line}</p>`;
    this.layer.hidden = false;
    this.cancelMotion = animateWhileVisible(this.layer, [{ opacity: 0 }, { opacity: 1, offset: .25 }, { opacity: 1, offset: .78 }, { opacity: 0 }], { duration: reduced ? 1600 : 2600, easing: 'ease-in-out' }, () => {
      this.waiting = false; this.layer.hidden = true; open();
    });
  }
  cancel(): void { this.cancelMotion(); this.waiting = false; this.layer.hidden = true; }
}
