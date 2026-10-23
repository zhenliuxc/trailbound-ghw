import { GLIMPSE_POINTS, type GlimpsePointId, type PhotoFrame } from '../../content/look-here';
import type { DayJourney, DayTrail } from '../day-route';
import type { MapProjection } from '../map-camera';
import { GlimpseVisits } from './model';
import { element, gear, paperButton } from './paper';
import { animateWhileVisible, type CancelMotion } from '../visible-motion';
import { exitPanel, type Panel } from './editor';
import { createLocalGlimpse } from './local';
import { createGlimpseView } from './view';

interface GlimpseOptions {
  map: HTMLElement; trail: DayTrail; signal: AbortSignal;
  available(): boolean;
  capture(frame: PhotoFrame): Promise<string>;
  beforeOpen(): void; afterClose(): void;
  ready(): boolean;
  reduced(): boolean;
  following(): boolean;
}

export function createGlimpseController(options: GlimpseOptions) {
  const { map, signal } = options;
  const visits = new GlimpseVisits(options.trail);
  const app = createLocalGlimpse(options.capture);
  const layers = element('div', map, 'glimpse-world');
  const dialog = element('dialog', document.body, 'glimpse-dialog'); dialog.setAttribute('aria-labelledby', 'glimpse-title');
  const section = element('section', dialog, 'glimpse-sheet');
  let current: GlimpsePointId | null = null, disposed = false;
  let trigger: HTMLElement | null = null, bodyOverflow = '';
  let historyOwned = false, historyClosing = false, closing = false;
  let cancelMotion: CancelMotion = () => {};
  let finishClose: (() => void) | null = null;
  const historyId = crypto.randomUUID();
  const settings = gear(map, () => open({ kind: 'settings' }, settings)); settings.classList.add('glimpse-map-settings'); settings.disabled = true;
  const papers = GLIMPSE_POINTS.map(point => {
    const button = paperButton(layers, () => { if (current === point.id && !app.solitude) open({ kind: 'note', point }, button); });
    button.dataset.point = point.id;
    let start: { x: number; y: number; id: number } | null = null, dragged = false;
    button.addEventListener('pointerdown', event => { dragged = false; start = { x: event.clientX, y: event.clientY, id: event.pointerId }; }, { signal });
    button.addEventListener('pointermove', event => { if (start && start.id === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) dragged = true; }, { signal });
    button.addEventListener('pointercancel', () => { dragged = true; start = null; }, { signal });
    button.addEventListener('click', event => { if (event.detail > 0 && dragged) { event.preventDefault(); event.stopImmediatePropagation(); } start = null; }, { signal, capture: true });
    return { point, button };
  });
  const view = createGlimpseView({ section, app, go, requestClose, close, solitudeChanged(stored) {
    for (const { button } of papers) button.hidden = true;
    if (app.solitude) { trigger = settings; close(); if (!stored) settings.setAttribute('aria-label', '设置，独行偏好本次有效但未能保存'); }
  } });
  function render() {
    const panel = app.panel; if (!panel) return;
    dialog.dataset.view = panel.kind; view.render(panel, app.generation);
  }
  function pushHistory() { history.pushState({ glimpseLocal: historyId }, '', location.href); historyOwned = true; }
  function open(next: Panel, source: HTMLElement) {
    if (disposed || dialog.open || historyClosing || !options.available()) return;
    trigger = source; options.beforeOpen(); app.show(next); bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; pushHistory(); render(); dialog.showModal(); titleFocus();
    cancelMotion = animateWhileVisible(dialog, [{ opacity: 0 }, { opacity: 1 }], { duration: options.reduced() ? 80 : 250, easing: 'ease-out' }, () => {});
  }
  function titleFocus() { section.querySelector<HTMLElement>('#glimpse-title')?.focus({ preventScroll: true }); }
  function go(next: Panel, focusId?: string) {
    if (app.saving || closing) return;
    const changedView = app.panel?.kind !== next.kind;
    app.show(next); render();
    const focus = focusId ? document.getElementById(focusId) : null;
    if (focus && section.contains(focus)) focus.focus({ preventScroll: true }); else titleFocus();
    if (changedView) dialog.scrollTo({ top: 0, behavior: 'instant' });
  }
  function close(fromHistory = false) {
    if (!app.panel || closing || app.saving) return;
    closing = true; app.invalidate(); cancelMotion();
    let faded = false;
    finishClose = () => {
      if (disposed || !faded || historyClosing) return;
      finishClose = null;
      app.show(null); dialog.close(); section.replaceChildren(); document.body.style.overflow = bodyOverflow; closing = false;
      options.afterClose();
      const focus = trigger?.isConnected && !trigger.hidden && !app.solitude ? trigger : settings;
      focus.focus({ preventScroll: true }); trigger = null;
    };
    if (historyOwned && !fromHistory) { historyClosing = true; historyOwned = false; history.back(); }
    else historyOwned = false;
    cancelMotion = animateWhileVisible(dialog, [{ opacity: 1 }, { opacity: 0 }], { duration: options.reduced() ? 80 : 180, easing: 'ease-in' }, () => { faded = true; finishClose?.(); });
  }
  function requestClose(fromHistory = false) {
    if (app.saving || closing) { if (fromHistory && app.saving) pushHistory(); return; }
    const next = exitPanel(app.panel);
    if (next) { if (fromHistory) pushHistory(); go(next); return; }
    close(fromHistory);
  }
  window.addEventListener('popstate', () => {
    if (historyClosing) { historyClosing = false; finishClose?.(); return; }
    if (dialog.open && historyOwned) { historyOwned = false; requestClose(true); }
  }, { signal });
  dialog.addEventListener('cancel', event => { event.preventDefault(); requestClose(); }, { signal });
  dialog.addEventListener('keydown', event => {
    event.stopPropagation();
    if ((event.key === 'Home' || event.key === 'End') && event.target instanceof Element
      && !event.target.closest('input, textarea, select, [contenteditable]')) {
      event.preventDefault();
      dialog.scrollTo({ top: event.key === 'Home' ? 0 : dialog.scrollHeight, behavior: 'instant' });
    }
  }, { signal });
  return {
    get open() { return dialog.open; },
    update(journey: DayJourney, projection: MapProjection, dt: number, exploring: boolean) {
      settings.disabled = !options.ready();
      current = visits.update(journey.at, dt, exploring);
      for (const { point, button } of papers) {
        const p = projection.toScreen(point.paper);
        button.style.left = `${p.x}px`; button.style.top = `${p.y}px`;
        const halfWidth = Number.parseFloat(getComputedStyle(button).width) / 2 + 8;
        button.hidden = app.solitude || !options.following() || current !== point.id || !exploring && journey.phase.kind !== 'paused'
          || p.x < halfWidth || p.x > projection.width - halfWidth || p.y < 100 || p.y > projection.height - 65;
      }
    },
    dispose() {
      if (disposed) return; disposed = true; app.invalidate(); cancelMotion(); finishClose = null;
      if (dialog.open) { dialog.close(); document.body.style.overflow = bodyOverflow; }
      app.dispose(); settings.remove(); layers.remove(); dialog.remove();
    },
  };
}
