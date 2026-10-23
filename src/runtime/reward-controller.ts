import type { AssetEntry, GameKind, ImageCache, JournalArtPresentation, JourneyStatus, Moment, MomentCatalog, SoundPlayer } from './contracts';
import type { GameDom } from './dom';
import { EventBindings } from './dom';
import type { SceneManager, SceneSession } from './scene-manager';

interface RewardOptions {
  dom: GameDom;
  scenes: SceneManager;
  catalog: MomentCatalog;
  cache?: ImageCache;
  audio: SoundPlayer;
  reduced: boolean;
  gameKind(id: string): GameKind | undefined;
  refresh(): void;
  stopLoop(): void;
  autoCollect?: boolean;
  presentArt?(image: HTMLImageElement, moment: Moment): JournalArtPresentation | null;
  onCollected?(moment: Moment): boolean | void;
}

/** Presents already-earned memories. It never writes a journal entry or awards gameplay. */
export function createRewardController(options: RewardOptions) {
  const { dom, scenes, catalog: D } = options, { get: $ } = dom;
  const bindings = new EventBindings();
  let current: Moment | null = null;
  let session: SceneSession | null = null;
  let collecting = false;
  let flight: Animation | null = null;
  let bodyOverflow = '';
  let imageEntry: AssetEntry | null = null;
  let imageListener: ((entry: AssetEntry) => void) | null = null;

  function close(resume = true) {
    if (!current) return;
    const wasMini = !!options.gameKind(current.id), closing = session;
    current = null; session = null; collecting = false;
    flight?.cancel(); flight = null;
    if (imageEntry && imageEntry.onChange === imageListener) imageEntry.onChange = null;
    imageEntry = null; imageListener = null;
    $('wind-keepsake').hidden = true; $('reward-overlay').hidden = true;
    $('app-main').removeAttribute('inert'); dom.document.body.style.overflow = bodyOverflow;
    scenes.leave(closing, resume); options.refresh();
    if (resume) {
      $('walk-toggle').focus({ preventScroll: true });
      if (wasMini && !options.reduced && !options.autoCollect) $('journey-stage').animate?.([{ opacity: .6, transform: 'scale(.985)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 450, easing: 'ease-out' });
    }
  }
  function show(moment: Moment, returnStatus: JourneyStatus) {
    if (!D.hasTag(moment) || options.autoCollect && (!moment.earned || moment.edition !== 3)) return false;
    if (current) close(false);
    current = moment; collecting = false;
    session = scenes.enter('reward', returnStatus);
    const game = options.gameKind(moment.id);
    $('reward-overlay').setAttribute('data-wind', String(!!game));
    $('reward-overlay').setAttribute('data-collecting', 'false');
    $('reward-overlay').setAttribute('data-auto', String(!!options.autoCollect));
    $<HTMLButtonElement>('reward-continue').disabled = false;
    $('reward-continue').hidden = !!options.autoCollect;
    $('reward-continue').textContent = game ? '收进手帐，继续走 →' : '收好徽章 →';
    const file = D.tagArt(moment), cached = options.cache?.request(file, 'high') || null;
    const display = () => {
      if (current !== moment) return;
      let image = $<HTMLImageElement>('reward-art');
      if (options.presentArt && current) {
        const framed = cached?.state === 'ready' ? options.presentArt(cached.image, current) : null;
        const source = framed?.src || file;
        if (source && image.getAttribute('src') !== source) image.setAttribute('src', source);
      } else if (cached?.state === 'ready' && cached.image !== image) {
        image.removeAttribute('id'); cached.image.id = 'reward-art';
        cached.image.setAttribute('class', 'reward-art'); image.replaceWith(cached.image); image = cached.image;
      }
      if (!cached && file) image.setAttribute('src', file);
      image.setAttribute('alt', (moment.tag || moment.title) + ' · 手绘水彩徽章');
      image.hidden = !!cached && cached.state !== 'ready';
      $('reward-loading').hidden = !cached || cached.state === 'ready';
      $('reward-loading').textContent = cached?.state === 'error' ? '画作暂未加载，可收好后在手帐查看。' : '正在展开手绘纪念…';
    };
    if (cached) { imageEntry = cached; imageListener = display; cached.onChange = display; }
    display();
    $('reward-title').textContent = moment.tag || moment.title;
    $('reward-place').textContent = moment.place; $('reward-copy').textContent = D.item(moment.id).result;
    $('reward-overlay').hidden = false; $('app-main').setAttribute('inert', '');
    bodyOverflow = dom.document.body.style.overflow || ''; dom.document.body.style.overflow = 'hidden';
    options.stopLoop(); options.refresh();
    if (options.autoCollect) { $('reward-dialog').setAttribute('tabindex', '-1'); $('reward-dialog').focus({ preventScroll: true }); }
    else $('reward-continue').focus({ preventScroll: true });
    options.audio.mini?.(game || 'memory', 'reveal');
    if (options.autoCollect && !dom.document.hidden) collect();
    return true;
  }
  function collect() {
    if (!current || collecting) return;
    if (options.onCollected?.(current) === false) {
      $('reward-continue').hidden = false; $('reward-continue').textContent = '重试保存';
      $('reward-continue').focus({ preventScroll: true }); return;
    }
    if (options.autoCollect) $('reward-continue').hidden = true;
    const game = options.gameKind(current.id);
    options.audio.mini?.(game || 'memory', 'collect');
    const targetElement = $(options.autoCollect ? 'reward-overlay' : 'reward-dialog');
    if (!targetElement.animate || !options.autoCollect && (!game || options.reduced)) { close(); return; }
    collecting = true; const moment = current;
    $<HTMLButtonElement>('reward-continue').disabled = true;
    $('reward-overlay').setAttribute('data-collecting', 'true'); $('wind-keepsake').hidden = !!options.autoCollect;
    let animation: Animation;
    try {
      if (options.autoCollect) {
        const hold = options.reduced ? 1200 : 1500, fade = options.reduced ? 180 : 950;
        animation = flight = targetElement.animate([{ opacity: 1 }, { opacity: 1, offset: hold / (hold + fade) }, { opacity: 0 }], { duration: hold + fade, easing: 'ease-in-out', fill: 'forwards' });
      } else {
        const box = $('reward-dialog').getBoundingClientRect(), target = $('wind-keepsake').getBoundingClientRect();
        const dx = target.left + target.width / 2 - box.left - box.width / 2, dy = target.top + target.height / 2 - box.top - box.height / 2;
        animation = flight = targetElement.animate([{ transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 }, { transform: 'translate(0,-16px) scale(1.025) rotate(-2deg)', opacity: 1, offset: .2 }, { transform: `translate(${dx}px,${dy}px) scale(.08) rotate(6deg)`, opacity: 0 }], { duration: 680, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards' });
      }
    } catch { close(); return; }
    const finish = () => { if (current === moment && flight === animation) close(); };
    animation.finished.then(finish, finish);
  }
  bindings.listen($('reward-continue'), 'click', collect);
  function visibilityChanged() {
    if (!options.autoCollect || !current) return;
    if (dom.document.hidden) flight?.pause?.();
    else if (flight) flight.play?.();
    else if ($('reward-continue').hidden) collect();
  }
  if (options.autoCollect) dom.document.addEventListener('visibilitychange', visibilityChanged);
  return {
    get current() { return current; },
    get open() { return current !== null; },
    show, close, collect,
    handleKey(event: KeyboardEvent) {
      if (!current) return false;
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      else if (event.key === 'Tab') { event.preventDefault(); $($('reward-continue').hidden ? 'reward-dialog' : 'reward-continue').focus({ preventScroll: true }); }
      return true;
    },
    destroy() { close(false); bindings.destroy(); dom.document.removeEventListener('visibilitychange', visibilityChanged); },
  };
}
