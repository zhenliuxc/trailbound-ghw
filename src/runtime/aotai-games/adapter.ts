import type { MiniApi } from '../contracts';
import type { GameDom } from '../dom';
import { AOTAI_GAMES, AotaiState, aotaiGameId, sceneFile, stateOf, actAotai, moveAotai, releaseAotai, tickAotai, keyAotai } from './model';
import { AotaiGameView, viewOf } from './view';

export function createAotaiGames(dom: GameDom): MiniApi {
  const { get: $, text } = dom;
  return {
    create(entry, options) {
      if (!aotaiGameId(entry.id)) throw new Error('鳌太线画作不存在');
      return new AotaiState(entry.id, options.reduced);
    },
    act: (s, input) => actAotai(stateOf(s), input), move: (s, input) => moveAotai(stateOf(s), input), release: s => releaseAotai(stateOf(s)), tick: (s, dt) => tickAotai(stateOf(s), dt),
    draw(_svg, _parent, entry) { if (!aotaiGameId(entry.id)) throw new Error('鳌太线画作不存在'); return new AotaiGameView(entry.id, dom.document); },
    paint: (refs, s) => viewOf(refs).paint(stateOf(s)),
    instruction: entry => aotaiGameId(entry.id) ? AOTAI_GAMES[entry.id].prompt : '', status: s => stateOf(s).feedback,
    outcome(state, entry) { const s = stateOf(state), spec = AOTAI_GAMES[s.id]; return { id: s.id, edition: entry.edition, earned: s.play.complete && s.settledAt !== null, interaction: s.gesture, memory: spec.memory, title: spec.badge }; },
    assets: entry => ({ scene: aotaiGameId(entry.id) ? sceneFile(entry.id) : undefined }),
    mount: (refs, context) => viewOf(refs).mount(context.host, context.cache), dispose(refs) { viewOf(refs).dispose(); $('micro-panel').removeAttribute('data-aotai'); },
    point: (refs, input) => viewOf(refs).input(input), key: (s, key, phase) => keyAotai(stateOf(s), key, phase),
    present(state, refs) {
      const s = stateOf(state), spec = AOTAI_GAMES[s.id], view = viewOf(refs);
      $('micro-panel').dataset.aotai = s.kind;
      if (s.session.kind === 'takin') { $('micro-panel').dataset.encounterPhase = s.session.phase.kind; $('micro-panel').dataset.activeSeconds = s.age.toFixed(1); }
      text('micro-title', spec.title); text('micro-instruction', view.contentState === 'ready' ? s.settledAt !== null ? '' : spec.prompt : view.contentState === 'error' ? '画作暂未展开，可以重试或继续山路。' : '山间画作正在展开……');
      text('micro-result', view.contentState === 'ready' && s.feedback !== spec.prompt ? s.feedback : ''); text('micro-skip', '继续山路 →');
      $('micro-surface').setAttribute('aria-label', spec.prompt + ' ' + spec.keys + ' R 重试。'); $('micro-surface').setAttribute('aria-busy', String(view.contentState === 'loading'));
    },
  };
}
