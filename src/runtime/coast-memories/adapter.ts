import type { MiniApi } from '../contracts';
import type { GameDom } from '../dom';
import { actCoast, cancelCoast, COAST_MEMORIES, coastMemoryId, CoastMemoryState, keyCoast, logClear, moveCoast, stateOf, tickCoast } from './model';
import { CoastMemoryView, PHONE_SCENE, propsFile, sceneFile, viewOf } from './view';

export function createCoastMemories(dom: GameDom, onAction: (name: string) => void): MiniApi {
  const { get: $, text } = dom;
  return {
    create(entry, options) { if (!coastMemoryId(entry.id)) throw new Error('海岸互动不存在'); return new CoastMemoryState(entry.id, options.reduced); },
    act: (s, input) => actCoast(stateOf(s), input), move: (s, input) => moveCoast(stateOf(s), input), release: s => cancelCoast(stateOf(s)), tick: (s, dt) => tickCoast(stateOf(s), dt),
    draw(_svg, _parent, entry) { if (!coastMemoryId(entry.id)) throw new Error('海岸画作不存在'); return new CoastMemoryView(entry.id, dom.document, onAction); },
    paint: (refs, s) => viewOf(refs).paint(stateOf(s)), instruction: entry => coastMemoryId(entry.id) ? COAST_MEMORIES[entry.id].prompt : '', status: s => stateOf(s).feedback,
    outcome(state, entry) { const s = stateOf(state), spec = COAST_MEMORIES[s.id]; return { id: s.id, edition: entry.edition, earned: s.play.complete && s.play.completedAt !== null, interaction: s.gesture, memory: spec.memory, title: spec.badge }; },
    assets: entry => coastMemoryId(entry.id) ? { scene: sceneFile(entry.id), actor: propsFile(entry.id), ...(entry.id === 'maclehose-woodland-echo' ? { front: PHONE_SCENE } : {}) } : {},
    mount: (refs, context) => viewOf(refs).mount(context.host, context.cache), dispose(refs) { viewOf(refs).dispose(); for (const key of ['coastMemory', 'coastPhase', 'clearedLogs']) delete $('micro-panel').dataset[key]; },
    point: (refs, point) => viewOf(refs).input(point), key: (s, key, phase) => keyCoast(stateOf(s), key, phase),
    present(state, refs) {
      const s = stateOf(state), spec = COAST_MEMORIES[s.id], view = viewOf(refs), panel = $('micro-panel');
      panel.dataset.coastMemory = s.kind; panel.dataset.coastPhase = s.play.complete ? 'complete' : s.session.kind === 'driftwood' ? s.session.moving ? 'passing' : 'waiting' : s.session.phase.kind;
      if (s.session.kind === 'driftwood') panel.dataset.clearedLogs = String(s.session.logs.filter(logClear).length);
      text('micro-title', spec.title); text('micro-instruction', spec.prompt); text('micro-result', view.contentState === 'ready' ? s.feedback : view.contentState === 'error' ? '画作暂未展开，可以重试或继续山径。' : '海岸画作正在展开……'); text('micro-skip', '继续山径 →');
      $('micro-surface').setAttribute('aria-label', spec.prompt + ' 键盘辅助：' + spec.keys); $('micro-surface').setAttribute('aria-busy', String(view.contentState === 'loading'));
    },
  };
}
