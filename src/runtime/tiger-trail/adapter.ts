import type { MiniApi, MiniState, MiniViewRefs } from '../contracts';
import type { GameDom } from '../dom';
import { EventBindings } from '../dom';
import { TRAIL_GAMES, TITLES, PROMPTS, createTrailState, inputTrail, moveTrail, releaseTrail,
  tickTrail, keyTrail, attachTrailCapture, rejectTrailCapture } from './rules';
import type { TrailKind, TrailState } from './rules';
import { captureTigerTrail, disposeTigerTrail, drawTigerTrail, mountTigerTrail, paintTigerTrail,
  tigerTrailAssets, tigerTrailPoint, tigerTrailViewport } from './scene';
import type { TigerTrailRefs } from './scene';

const KEYS: Record<TrailKind, string> = {
  'tiger-climb': '按住空格或方向键前进，松开停下；走到山肩会自动留下记忆。',
  'tiger-river': '方向键取景，＋／－调整远近；空格拍照，B 连拍，1–5 选片，K 定格。',
  'tiger-rest': '方向键看看山景；Enter 继续走。',
  'tiger-passage': 'Enter 继续走。',
};
const MEMORIES: Record<TrailKind, string> = {
  'tiger-climb': '沿二十八道拐的一段折返小径走上高处，山壁逐渐退开，金沙江落在深深的谷底。',
  'tiger-river': '沿张老师小路来到中虎跳江边，白浪掠过江中巨石。我选下这一帧，把自己的构图和奔流的一刻留在手帐里。',
  'tiger-rest': '在中途客栈歇了歇，看看峡谷对面的山。',
  'tiger-passage': '沿高路经过龙洞瀑布，水声短暂靠近，又落在身后。',
};
interface Options { dom: GameDom; riverArrived?: boolean; onAction(name: string, value?: number): void }
interface CaptureResult { generation: number; id: string; request: number; url: string | null }

/** Async extraction never mutates a stale immutable rules state. Tick consumes its result. */
export function createTigerTrailGames({ dom, onAction, riverArrived = false }: Options) {
  const { get: $, text, html } = dom, bindings = new EventBindings();
  let generation = 0, pending: CaptureResult | null = null, busy = false;
  let actionKey = '', framesKey = '', current: TrailState | null = null;
  let activeRefs: TigerTrailRefs | null = null;
  let shutterPointer: number | null = null, shutterHeldAt = 0, holdingBurst = false, ignoreClick = false;
  const strip = $('tiger-frame-strip');
  const zoom = $<HTMLInputElement>('tiger-trail-zoom');
  const withViewport = (state: TrailState) => activeRefs && !activeRefs.disposed
    ? inputTrail(state, tigerTrailViewport(activeRefs, state)) : state;

  function renderFrames(s: TrailState) {
    strip.hidden = s.game !== 'tiger-river' || !s.river.captures.length;
    const key = s.id + ':' + s.river.captures.map(frame => frame.id).join(',');
    if (key !== framesKey) {
      strip.replaceChildren();
      s.river.captures.forEach((frame, index) => {
        const button = html('button', null, strip, 'tiger-frame'); button.type = 'button';
        button.dataset.frame = String(index); button.setAttribute('aria-label', '选择第 ' + (index + 1) + ' 帧');
        const picture = html('img', null, button); picture.src = frame.url; picture.alt = '刚刚拍下的江景，第 ' + (index + 1) + ' 帧';
        html('span', String(index + 1), button);
      });
      framesKey = key;
    }
    strip.querySelectorAll<HTMLButtonElement>('button[data-frame]').forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === s.river.selected));
      button.disabled = s.play.complete;
    });
  }
  function present(base: MiniState, view: MiniViewRefs) {
    const s = base as TrailState, refs = view as TigerTrailRefs, waiting = refs.contentState !== 'ready'; current = s;
    $('tiger-tools').hidden = false;
    $('micro-panel').setAttribute('data-trail', 'true');
    $('micro-panel').setAttribute('data-trail-game', s.game);
    $('micro-panel').setAttribute('data-phase', waiting ? 'loading' : s.play.complete ? 'memory' : s.game === 'tiger-river' ? s.river.phase : s.acted ? 'play' : 'invite');
    text('micro-title', TITLES[s.game]); text('tiger-key-hint', KEYS[s.game]);
    text('micro-result', waiting ? refs.contentState === 'error' ? '画作未能展开，可以重新加载，或继续旅程。' : '山与江正在展开……' : s.feedback);
    text('micro-skip', s.game === 'tiger-river' ? '返回高路 →' : '继续走 →');
    $('micro-surface').setAttribute('aria-busy', String(refs.contentState === 'loading'));
    $('micro-surface').setAttribute('aria-label', PROMPTS[s.game] + ' ' + KEYS[s.game] + ' R 重试。');
    const controls: { action: string; label: string; disabled?: boolean; primary?: boolean }[] = [];
    if (s.game === 'tiger-climb') {
      text('tiger-count', s.climb.arrivedAt !== null ? '山肩 · 江在脚下' : s.climb.progress < .32 ? '沿着石壁，慢慢起步' : s.climb.progress < .7 ? '转过山弯，继续向上' : '山肩将近，峡谷渐渐展开');
    } else if (s.game === 'tiger-rest') {
      text('tiger-count', '中途客栈 · 看山歇脚'); controls.push({ action: 'continue', label: '歇好了，继续走', primary: true });
    } else if (s.game === 'tiger-passage') {
      text('tiger-count', '龙洞瀑布 · 沿高路经过'); controls.push({ action: 'continue', label: '继续沿高路走', primary: true });
    } else if (s.river.phase === 'descent') {
      text('tiger-count', '张老师小路 ↓ 中虎跳江边 · 行程示意');
      controls.push({ action: 'continue-to-river', label: '来到江边，看看激流', primary: true });
    } else {
      text('tiger-count', s.river.captureRequest ? '正在留下这一帧…' : s.river.burst ? '连拍中 · 最多五帧' : s.river.captures.length ? '已拍 ' + s.river.captures.length + ' 帧 · 点小图选一张' : '拖动取景 · 轻按拍照，按住连拍');
      controls.push({ action: 'shutter', label: '拍下这一刻', primary: true, disabled: !!s.river.captureRequest || s.river.captures.length >= 5 });
      if (s.river.burst) controls.push({ action: 'stop-burst', label: '停止连拍' });
      if (s.river.captures.length) controls.push({ action: 'retake', label: '重新取景', disabled: !!s.river.captureRequest },
        { action: 'keep', label: '定格这一帧', primary: true, disabled: !!s.river.captureRequest || s.river.burst || s.river.selected < 0 });
    }
    const key = s.id + ':' + controls.map(c => c.action).join(',');
    if (key !== actionKey) {
      $('tiger-actions').replaceChildren();
      for (const control of controls) {
        const b = html('button', control.label, $('tiger-actions')); b.type = 'button'; b.dataset.trailAction = control.action;
      }
      actionKey = key;
    }
    for (const control of controls) {
      const button = $('tiger-actions').querySelector<HTMLButtonElement>('[data-trail-action="' + control.action + '"]');
      if (!button) continue;
      if (button.textContent !== control.label) button.textContent = control.label;
      button.disabled = waiting || s.play.complete || !!control.disabled;
      button.setAttribute('data-primary', String(!!control.primary));
    }
    const zoomVisible = s.game === 'tiger-river' && s.river.phase === 'river';
    $('tiger-trail-lens').hidden = !zoomVisible;
    zoom.disabled = waiting || s.play.complete;
    if (dom.document.activeElement !== zoom) zoom.value = String(s.camera.zoom);
    renderFrames(s);
  }
  const adapter: MiniApi = {
    create(entry, options) {
      generation++; pending = null; busy = false; actionKey = ''; framesKey = '';
      shutterPointer = null; holdingBurst = false; ignoreClick = false;
      return createTrailState(entry, { ...options, riverArrival: riverArrived ? 'river' : 'descent' });
    },
    act: (state, point) => inputTrail(withViewport(state as TrailState), point),
    move: (state, point) => moveTrail(state as TrailState, point),
    release(state) { shutterPointer = null; holdingBurst = false; return releaseTrail(state as TrailState); },
    tick(state, dt) {
      let s = withViewport(state as TrailState);
      if (pending && pending.generation === generation && pending.id === s.id) {
        const result = pending; pending = null;
        s = result.url ? attachTrailCapture(s, result.url, result.request) : rejectTrailCapture(s, result.request);
      }
      if (shutterPointer !== null && !holdingBurst && s.age - shutterHeldAt >= .45) {
        holdingBurst = true; s = inputTrail(s, { action: 'burst' });
      }
      return tickTrail(s, dt);
    },
    draw: (svg, parent, entry) => drawTigerTrail(svg, parent, TRAIL_GAMES[entry.id]),
    paint(view, state) {
      const refs = view as TigerTrailRefs, s = state as TrailState;
      activeRefs = refs;
      paintTigerTrail(refs, s);
      const request = s.river.captureRequest;
      if (!request || busy || pending || refs.captureBusy || refs.contentState !== 'ready') return;
      busy = true; const started = generation;
      void captureTigerTrail(refs, s).then(url => {
        if (generation === started && !refs.disposed) pending = { generation: started, id: s.id, request: request.id, url };
      }, () => {
        if (generation === started && !refs.disposed) pending = { generation: started, id: s.id, request: request.id, url: null };
      }).finally(() => { if (generation === started) busy = false; });
    },
    instruction: entry => PROMPTS[TRAIL_GAMES[entry.id]],
    status: state => (state as TrailState).feedback,
    outcome(state, entry) {
      const s = state as TrailState, captured = s.game === 'tiger-river' ? s.river.captures[s.river.selected]?.url : null;
      return { id: s.id, edition: entry.edition, earned: s.play.complete, interaction: s.gesture,
        memory: MEMORIES[s.game], title: s.play.complete ? entry.tag : entry.name,
        ...(captured ? { captureArt: captured, artSource: 'capture' as const } : {}) };
    },
    assets: entry => tigerTrailAssets(TRAIL_GAMES[entry.id]),
    mount: (refs, context) => mountTigerTrail(refs as TigerTrailRefs, context.host, context.cache, context.pixi),
    dispose(refs) {
      generation++; pending = null; busy = false; current = null; activeRefs = null; shutterPointer = null; holdingBurst = false;
      strip.replaceChildren(); strip.hidden = true; $('tiger-trail-lens').hidden = true;
      $('micro-panel').removeAttribute('data-trail'); $('micro-panel').removeAttribute('data-trail-game'); disposeTigerTrail(refs as TigerTrailRefs);
    },
    point: (refs, point) => tigerTrailPoint(refs as TigerTrailRefs, point),
    key: (state, key, phase) => keyTrail(withViewport(state as TrailState), key, phase), present,
  };
  const actions = $('tiger-actions');
  bindings.listen(actions, 'click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-trail-action]');
    const action = button?.dataset.trailAction;
    if (!button || button.disabled || !action) return;
    if (action === 'shutter' && ignoreClick && event.detail > 0) { ignoreClick = false; return; }
    onAction(action);
  });
  bindings.listen(actions, 'pointerdown', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-trail-action="shutter"]');
    if (!button || button.disabled || !current || event.button !== 0) return;
    onAction('shutter');
    shutterPointer = event.pointerId; shutterHeldAt = current.age; holdingBurst = false; ignoreClick = true;
    actions.setPointerCapture(event.pointerId);
  });
  const endShutter = (event: PointerEvent) => {
    if (shutterPointer !== event.pointerId) return;
    const wasBurst = holdingBurst; shutterPointer = null; holdingBurst = false;
    if (actions.hasPointerCapture(event.pointerId)) actions.releasePointerCapture(event.pointerId);
    if (wasBurst) onAction('stop-burst');
  };
  bindings.listen(actions, 'pointerup', endShutter);
  bindings.listen(actions, 'pointercancel', endShutter);
  bindings.listen(actions, 'lostpointercapture', endShutter);
  bindings.listen(strip, 'click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-frame]');
    if (button && !button.disabled) onAction('select-frame', Number(button.dataset.frame));
  });
  bindings.listen(zoom, 'input', () => onAction('zoom', Number(zoom.value)));
  return { adapter, destroy: () => bindings.destroy() };
}
