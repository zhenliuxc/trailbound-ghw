import type { MiniApi } from '../contracts';
import type { GameDom } from '../dom';
import { EventBindings } from '../dom';
import { MEMORY_SPECS, memoryId, sceneFile, stateOf } from './model';
import { actMemory, attachMemoryCapture, createMemory, keyMemory, moveMemory, releaseMemory, tickMemory } from './rules';
import { MemoryView, viewOf } from './view';

export function createTigerMemoryGames(dom: GameDom, onAction: (action: string) => void) {
  const { get: $, text } = dom, bindings = new EventBindings();
  let active: MemoryView | null = null;
  const captureButton = dom.document.createElement('button'); captureButton.type = 'button'; captureButton.textContent = '重试留下这幅画'; captureButton.hidden = true; $('tiger-actions').append(captureButton);
  bindings.listen(captureButton, 'click', () => onAction('retry-capture'));
  bindings.listen($('micro-surface'), 'blur', () => { if (active && !active.disposed) onAction('cancel-brush'); });
  const adapter: MiniApi = {
    create(entry, options) { if (!memoryId(entry.id)) throw new Error('虎跳峡互动没有对应的画作'); active?.reset(); return createMemory(entry.id, options.reduced); },
    act: (s, input) => actMemory(stateOf(s), input),
    move: (s, input) => moveMemory(stateOf(s), input),
    release: s => releaseMemory(stateOf(s)),
    tick(state, dt) {
      let s = tickMemory(stateOf(state), dt); s.portrait = s.session.kind === 'river' && s.session.shot ? s.session.shot.portrait : active?.portrait ?? s.portrait;
      if (s.flow.kind === 'capturing' && active?.contentState === 'ready') s = attachMemoryCapture(s, active.capture(s));
      return s;
    },
    draw(_svg, _parent, entry) { if (!memoryId(entry.id)) throw new Error('虎跳峡画作不存在'); return new MemoryView(MEMORY_SPECS[entry.id].kind, dom.document); },
    paint(refs, state) { const view = viewOf(refs), s = stateOf(state); active = view; s.portrait = s.session.kind === 'river' && s.session.shot ? s.session.shot.portrait : view.portrait; view.paint(s); },
    instruction: entry => memoryId(entry.id) ? MEMORY_SPECS[entry.id].prompt : '',
    status: s => stateOf(s).feedback,
    outcome(state, entry) { const s = stateOf(state); return { id: s.id, edition: entry.edition, earned: s.play.complete && s.flow.kind === 'complete', interaction: s.gesture, memory: MEMORY_SPECS[s.id].memory, title: MEMORY_SPECS[s.id].badge, ...(s.flow.kind === 'complete' && (s.kind === 'waterfall' || s.kind === 'river') ? { captureArt: s.flow.art, artSource: 'capture' } : {}) }; },
    assets: entry => ({ scene: memoryId(entry.id) ? sceneFile(MEMORY_SPECS[entry.id].kind) : undefined }),
    mount: (refs, context) => viewOf(refs).mount(context.host, context.cache),
    dispose(refs) { viewOf(refs).dispose(); active = null; $('micro-panel').removeAttribute('data-memory'); $('micro-panel').removeAttribute('data-memory-acted'); $('micro-panel').removeAttribute('data-road-phase'); captureButton.hidden = true; },
    point: (refs, input) => viewOf(refs).input(input),
    key: (s, key, phase) => keyMemory(stateOf(s), key, phase),
    present(state, refs) {
      const s = stateOf(state), view = viewOf(refs), spec = MEMORY_SPECS[s.id];
      const panel = $('micro-panel'); panel.dataset.memory = s.kind; panel.dataset.memoryActed = String(s.acted); panel.dataset.phase = s.play.complete ? 'memory' : s.acted ? 'play' : 'invite';
      text('micro-title', spec.title); text('micro-instruction', view.contentState === 'ready' ? spec.prompt : view.contentState === 'error' ? '画作暂未展开，可以重试或继续走。' : '手绘正在展开……');
      text('micro-result', s.feedback); text('micro-skip', '继续旅程 →');
      if (s.session.kind === 'bends') {
        panel.dataset.roadPhase = s.session.phase.kind;
        if (s.session.phase.kind === 'drawing' && !s.acted && view.contentState === 'ready') text('micro-result', '画一个 S 弯，再看看山下的江。');
        else if (s.session.phase.kind !== 'drawing' && view.contentState === 'ready') text('micro-instruction', '');
      }
      $('micro-surface').setAttribute('aria-label', spec.prompt + ' ' + spec.keys + (s.kind === 'bends' ? '' : ' R 重试。')); $('micro-surface').setAttribute('aria-busy', String(view.contentState === 'loading'));
      $('tiger-tools').hidden = s.flow.kind !== 'capture-error'; $('tiger-trail-lens').hidden = true; $('tiger-frame-strip').hidden = true;
      captureButton.hidden = s.flow.kind !== 'capture-error';
    },
  };
  return { adapter, destroy() { bindings.destroy(); captureButton.remove(); } };
}
