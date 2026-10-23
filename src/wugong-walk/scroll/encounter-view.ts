import type { TrailEvent } from './events';

export class EncounterView {
  private active: TrailEvent | null = null;
  constructor(private readonly dialog: HTMLDialogElement, signal: AbortSignal, onPlay: () => void, onSkip: (continueWalk: boolean) => void) {
    const play = dialog.querySelector('#ww-event-play'), skip = dialog.querySelector('#ww-event-skip'), close = dialog.querySelector('#ww-event-close');
    if (!play || !skip || !close) throw new Error('沿途邂逅入口无法读取');
    play.addEventListener('click', onPlay, { signal });
    skip.addEventListener('click', () => onSkip(true), { signal });
    close.addEventListener('click', () => onSkip(false), { signal });
    dialog.addEventListener('cancel', event => { event.preventDefault(); onSkip(false); }, { signal });
  }
  sync(event: TrailEvent | null, collected = false): void {
    if (!event) { this.active = null; if (this.dialog.open) this.dialog.close(); return; }
    if (this.active?.id === event.id) return;
    this.active = event;
    const title = this.dialog.querySelector('#ww-event-title'), story = this.dialog.querySelector('#ww-event-story'), place = this.dialog.querySelector('#ww-event-place'), play = this.dialog.querySelector('#ww-event-play');
    if (!title || !story || !place || !play) throw new Error('沿途邂逅内容无法读取');
    title.textContent = event.title; story.textContent = event.story; place.textContent = event.place;
    play.textContent = collected ? `再玩一次 · ${event.action}` : event.action;
    this.dialog.dataset.event = event.id;
    if (!this.dialog.open) this.dialog.showModal();
  }
  destroy(): void { this.active = null; if (this.dialog.open) this.dialog.close(); }
}
