import { chapterFor, type ChapterId } from '../content/catalog';
import { animateWhileVisible, enterDialog, leaveDialog, type CancelMotion } from './visible-motion';
import type { CharacterId } from '../characters/catalog';
import { artMessage, readArtMessage, type ArtSession } from './art-session';

export interface ArtResult { readonly collected: number; readonly entry: string | null }
export class ArtOverlay {
  private readonly dialog: HTMLDialogElement;
  private readonly frame: HTMLIFrameElement;
  private readonly status: HTMLElement;
  private timeout = 0;
  private collected = 0;
  private closing = false;
  private session: ArtSession | null = null;
  private cancelMotion: CancelMotion = () => {};
  private cancelFrameMotion: CancelMotion = () => {};
  constructor(signal: AbortSignal, onClose: (result: ArtResult) => void, prefix: 'ww' | 'meadow' | 'tg' | 'ao' | 'co' | 'day', private readonly options: { soft?: boolean; chapter?: ChapterId; version?: string } = {}) {
    const dialog = document.getElementById(`${prefix}-art`), frame = document.getElementById(`${prefix}-art-frame`), status = document.getElementById(`${prefix}-art-state`);
    if (!(dialog instanceof HTMLDialogElement) || !(frame instanceof HTMLIFrameElement) || !status) throw new Error('手绘与手帐入口无法读取');
    this.dialog = dialog; this.frame = frame; this.status = status;
    const finish = () => {
      this.cancelMotion(); this.cancelFrameMotion();
      window.clearTimeout(this.timeout);
      const session = this.session;
      if (!session) return;
      frame.contentWindow?.postMessage(artMessage(session, 'dispose'), location.origin);
      this.session = null;
      dialog.close(); frame.removeAttribute('src'); frame.hidden = true; onClose({ collected: this.collected, entry: session.entry });
    };
    const close = () => {
      if (!this.open || this.closing) return;
      this.closing = true; window.clearTimeout(this.timeout); this.cancelMotion(); this.cancelFrameMotion();
      if (options.soft) this.cancelMotion = leaveDialog(dialog, matchMedia('(prefers-reduced-motion: reduce)').matches, finish, false);
      else finish();
    };
    document.getElementById(`${prefix}-art-close`)?.addEventListener('click', close, { signal });
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); }, { signal });
    window.addEventListener('message', event => {
      if (event.source !== frame.contentWindow || event.origin !== location.origin || !this.open || this.closing) return;
      const data = readArtMessage(event.data, this.session);
      if (!data) return;
      if ((data.type === 'collected' || data.type === 'close') && this.session?.entry) this.collected = Math.max(this.collected, data.collected);
      if (data.type === 'close') close();
      if (data.type === 'ready') {
        window.clearTimeout(this.timeout); status.hidden = true; frame.hidden = false;
        if (options.soft) this.cancelFrameMotion = animateWhileVisible(frame, [{ opacity: 0 }, { opacity: 1 }], { duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 180 : 650, easing: 'ease-out' }, () => {});
      }
    }, { signal });
    signal.addEventListener('abort', () => this.dispose(), { once: true });
  }
  get open(): boolean { return this.dialog.open; }
  show(entry?: string, place?: string, character?: CharacterId): void {
    if (this.open) return;
    this.collected = 0; this.closing = false;
    this.session = { session: crypto.randomUUID(), entry: entry ?? null };
    this.status.hidden = false; this.status.textContent = entry ? '手绘正在展开…' : '正在翻开旅行手帐…'; this.frame.hidden = true;
    const query = new URLSearchParams({ session: this.session.session }); if (entry) query.set('entry', entry); if (place) query.set('place', place);
    if (character) query.set('character', character);
    if (this.options.version) query.set('v', this.options.version);
    this.frame.src = `${chapterFor(this.options.chapter ?? 'wugong')?.artPage ?? 'wugong-art.html'}?${query}`; this.dialog.showModal();
    if (this.options.soft) this.cancelMotion = enterDialog(this.dialog, matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.timeout = window.setTimeout(() => { if (this.open && !this.status.hidden) this.status.textContent = '手绘暂未展开，可以关闭后重新打开；原手帐仍会保留。'; }, 20000);
  }
  dispose(): void {
    this.closing = true; this.cancelMotion(); this.cancelFrameMotion(); window.clearTimeout(this.timeout);
    if (this.session) this.frame.contentWindow?.postMessage(artMessage(this.session, 'dispose'), location.origin);
    this.session = null; this.dialog.close(); this.frame.removeAttribute('src');
  }
}
