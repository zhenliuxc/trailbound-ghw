import { animateWhileVisible, type CancelMotion } from './visible-motion';

export interface DiscoveryCue { readonly line: string; readonly motif: string }

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
  position(at: { x: number; y: number }, width: number, height: number): void {
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
