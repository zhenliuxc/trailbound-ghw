import { createDom } from '../runtime/dom';
import { enterDialog, type CancelMotion } from './visible-motion';

export interface PlacePhoto {
  readonly file: string;
  readonly title: string;
  readonly caption: string;
  readonly alt: string;
  readonly author: string;
  readonly license: string;
  readonly licenseUrl: string;
  readonly source: string;
  readonly position?: string;
}

interface PhotoVisit {
  readonly name: string;
  readonly photo: PlacePhoto;
  readonly checkpoint: string;
  readonly continueLabel?: string;
}

interface PhotoDialogOptions {
  prefix: string;
  signal: AbortSignal;
  reduced(): boolean;
  onClose(continueWalk: boolean): void;
}

/** Owns loading, retry, stale callbacks and closing; the route owns the next stop. */
export function createPhotoDialog(options: PhotoDialogOptions) {
  const { get } = createDom(document);
  const node = <T extends HTMLElement = HTMLElement>(part: string) => get<T>(`${options.prefix}-photo${part ? `-${part}` : ''}`);
  const dialog = node<HTMLDialogElement>(''), image = node<HTMLImageElement>('image');
  let visit: PhotoVisit | null = null, ticket = 0, disposed = false;
  let cancelMotion: CancelMotion = () => {};

  function load() {
    if (!visit || disposed) return;
    const photo = visit.photo, request = ++ticket;
    image.hidden = true;
    node('state').hidden = false; node('message').textContent = '实景照片正在展开…'; node('retry').hidden = true;
    image.onload = () => {
      if (disposed || request !== ticket || !dialog.open) return;
      image.hidden = false; node('state').hidden = true;
    };
    image.onerror = () => {
      if (disposed || request !== ticket || !dialog.open) return;
      node('message').textContent = '照片暂未加载，可以重试或继续走。'; node('retry').hidden = false;
    };
    image.src = photo.file;
  }
  function show(next: PhotoVisit) {
    if (disposed) return;
    visit = next;
    const photo = next.photo;
    node('title').textContent = next.name; node('caption').textContent = photo.caption;
    node('source').textContent = photo.author; node('source').setAttribute('href', photo.source); node('source').title = photo.title;
    node('license').textContent = photo.license; node('license').setAttribute('href', photo.licenseUrl);
    node('continue').textContent = next.continueLabel ?? '继续走 →';
    image.alt = photo.alt; image.dataset.checkpoint = next.checkpoint; image.style.objectPosition = photo.position ?? '50% 50%';
    cancelMotion();
    if (!dialog.open) dialog.showModal();
    cancelMotion = enterDialog(dialog, options.reduced());
    load();
  }
  function clear() {
    ticket++; visit = null; cancelMotion(); image.onload = image.onerror = null;
    dialog.close();
  }
  function close(continueWalk: boolean) {
    if (!visit || disposed) return;
    clear(); options.onClose(continueWalk);
  }
  function dispose() { if (disposed) return; disposed = true; clear(); }
  const { signal } = options;
  node('continue').addEventListener('click', () => close(true), { signal });
  node('close').addEventListener('click', () => close(false), { signal });
  node('retry').addEventListener('click', load, { signal });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(false); }, { signal });
  dialog.addEventListener('close', () => { if (!dialog.open) close(false); }, { signal });
  signal.addEventListener('abort', dispose, { once: true });
  return { get open() { return dialog.open; }, show, dispose };
}
