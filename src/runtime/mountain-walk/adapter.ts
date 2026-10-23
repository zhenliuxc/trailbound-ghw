import type { MiniApi, MiniState, MiniViewRefs } from '../contracts';
import type { GameDom } from '../dom';
import { EventBindings } from '../dom';
import { WALK_ENTRY_ID, createMountainWalk, inputMountainWalk, moveMountainWalk, releaseMountainWalk,
  tickMountainWalk, keyMountainWalk } from './rules';
import type { MountainWalkState } from './rules';
import { drawMountainWalk, paintMountainWalk, mountMountainWalk, disposeMountainWalk, mountainWalkPoint } from './scene';
import type { MountainWalkRefs } from './scene';

interface PhotographState extends MountainWalkState { photoArt?: string }
interface Options {
  dom: GameDom;
  onAction(name: string, value?: number): void;
  routeProgress?: { read(): number; write(sceneProgress: number): void };
}
const INSTRUCTION = '轻点停走，按住慢行，拖动看看山谷。';
const KEY_HINT = '空格停走，左右键看景，上键前行、下键停下；Home 回正视线，到看江处按 Enter 收好。';
const CHAPTERS = { slope: '沿坡前行', shoulder: '绕过岩壁', gorge: '峡谷展开', view: '停下看江' };

/** A walking chapter; the player observes and pauses rather than tracing a line. */
export function createMountainWalkGame({ dom, onAction, routeProgress }: Options) {
  const { get: $, text, html } = dom, bindings = new EventBindings();
  let refs: MountainWalkRefs | null = null, actionKey = '', photoKey = '';
  function photo(state: PhotographState, keep = false): PhotographState {
    const taking = !keep || !state.photoArt;
    const url = taking ? refs?.engine?.capture(state) : state.photoArt;
    if (!url) return { ...state, walking: false, speed: 0, feedback: '这一帧暂时没能留下，可以再拍一次，或继续看景。' };
    const captured = { ...state, photoArt: url, acted: true, walking: false, speed: 0,
      feedback: '拍下了眼前的山谷。到看江处后，可以把这张画面收进手帐。' };
    if (taking) {
      captured.serial = state.serial + 1;
      captured.events = [...state.events.slice(-31), { serial: captured.serial, type: 'shutter', x: .5 }];
    }
    return keep ? { ...inputMountainWalk(captured, { action: 'keep' }), photoArt: url } : captured;
  }
  function present(base: MiniState, view: MiniViewRefs) {
    const s = base as PhotographState, r = view as MountainWalkRefs, waiting = r.contentState !== 'ready'; refs = r;
    $('micro-panel').setAttribute('data-trail', 'true'); $('micro-panel').setAttribute('data-mountain', 'true');
    $('micro-panel').setAttribute('data-phase', waiting ? 'loading' : s.play.complete ? 'memory' : s.reached ? 'view' : s.walking ? 'walk' : 'look');
    $('tiger-tools').hidden = false; $('tiger-trail-lens').hidden = true;
    text('micro-title', '山肩见江 · 手绘高路行走'); text('micro-instruction', INSTRUCTION);
    text('tiger-key-hint', KEY_HINT); text('tiger-count', '二十八道拐 · ' + CHAPTERS[s.cameraStage]);
    text('micro-result', waiting ? r.contentState === 'error' ? '这段山路没能展开，可以重试，也可以继续旅程。' : '山路、岩壁与江谷正在展开……' : s.feedback);
    text('micro-skip', '回到旅程 →');
    $('micro-surface').setAttribute('aria-label', INSTRUCTION + ' 键盘辅助：' + KEY_HINT);
    $('micro-surface').setAttribute('aria-busy', String(r.contentState === 'loading'));
    const controls = [
      { action: 'shutter', label: s.photoArt ? '再拍一张' : '拍下眼前风景', primary: false },
      { action: 'look-reset', label: '回正视线', primary: false },
      ...(s.reached ? [{ action: 'keep', label: s.photoArt ? '把这张画面收好' : '拍下江景，收进手帐', primary: true }] : []),
    ];
    const key = controls.map(c => c.action).join(',');
    if (key !== actionKey) {
      $('tiger-actions').replaceChildren();
      for (const control of controls) { const b = html('button', control.label, $('tiger-actions')); b.type = 'button'; b.dataset.walkAction = control.action; }
      actionKey = key;
    }
    for (const control of controls) {
      const button = $('tiger-actions').querySelector<HTMLButtonElement>('[data-walk-action="' + control.action + '"]');
      if (!button) continue;
      button.disabled = waiting || s.play.complete; button.textContent = control.label; button.dataset.primary = String(control.primary);
    }
    const strip = $('tiger-frame-strip'); strip.hidden = !s.photoArt;
    if ((s.photoArt || '') !== photoKey) {
      strip.replaceChildren();
      if (s.photoArt) {
        const frame = html('figure', null, strip, 'mountain-photograph');
        const img = html('img', null, frame); img.src = s.photoArt; img.alt = '刚刚拍下的山间景色';
        html('figcaption', '这次亲手留下的画面', frame);
      }
      photoKey = s.photoArt || '';
    }
  }
  const adapter: MiniApi = {
    create(entry, options) {
      actionKey = ''; photoKey = '';
      return createMountainWalk(entry, { ...options, initialProgress: routeProgress?.read() ?? 0 });
    },
    act(state, input) {
      const s = state as PhotographState;
      if (input.action === 'shutter') return photo(s);
      if ((input.action === 'keep' || input.action === 'collect') && s.reached) return photo(s, true);
      return inputMountainWalk(s, input);
    },
    move: (state, input) => moveMountainWalk(state as MountainWalkState, input),
    release: state => releaseMountainWalk(state as MountainWalkState),
    tick(state, dt) {
      const previous = state as MountainWalkState;
      const next = tickMountainWalk(previous, dt);
      if (next.distance > previous.distance) routeProgress?.write(next.play.progress);
      return next;
    },
    draw: (svg, parent) => drawMountainWalk(svg, parent),
    paint: (view, state) => { refs = view as MountainWalkRefs; paintMountainWalk(refs, state as MountainWalkState); },
    instruction: () => INSTRUCTION, status: state => (state as MountainWalkState).feedback,
    outcome(state, entry) {
      const s = state as PhotographState;
      return { id: s.id, edition: entry.edition, earned: s.play.complete && !!s.photoArt, interaction: s.gesture,
        memory: '跟着山路走上高处，绕过近处的岩肩，金沙江和对岸山体逐渐展开。我停下来，亲手留下眼前的画面。',
        title: entry.tag, ...(s.photoArt ? { captureArt: s.photoArt, artSource: 'capture' as const } : {}) };
    },
    assets: () => ({ scene: 'scenes/tiger-high-v2.webp', actor: 'sprites/tiger-hiker-side-v1.webp', front: 'sprites/tiger-cliff-v2.webp' }),
    mount: (view, context) => mountMountainWalk(view as MountainWalkRefs, context.host, context.cache, context.pixi),
    dispose(view) {
      disposeMountainWalk(view as MountainWalkRefs); refs = null;
      $('micro-panel').removeAttribute('data-mountain'); $('micro-panel').removeAttribute('data-trail');
      $('tiger-frame-strip').replaceChildren(); $('tiger-frame-strip').hidden = true;
    },
    point: (view, point) => mountainWalkPoint(view as MountainWalkRefs, point),
    key(state, key, phase) {
      const s = state as PhotographState;
      if (key === 'Enter' && phase === 'down' && s.reached && !s.play.complete) return photo(s, true);
      return keyMountainWalk(s, key, phase);
    }, present,
  };
  bindings.listen($('tiger-actions'), 'click', event => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-walk-action]');
    if (button && !button.disabled && button.dataset.walkAction) onAction(button.dataset.walkAction);
  });
  return { adapter, entryId: WALK_ENTRY_ID, destroy: () => bindings.destroy() };
}
