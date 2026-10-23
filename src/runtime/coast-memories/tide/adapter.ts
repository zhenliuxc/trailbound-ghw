import type { MiniApi } from '../../contracts';
import type { GameDom } from '../../dom';
import { actTide, cancelTide, keyTide, moveTide, PROMPT, tickTide, tideFeedback, TideState, tideState } from './model';
import { TIDE_SCENE, TideView, tideView } from './view';

export function createTide(dom: GameDom): MiniApi {
  const { get: $, text } = dom;
  return {
    input: 'direct', soundTheme: 'creek',
    create: (_entry, options) => new TideState(options.reduced),
    act: (state, input) => actTide(tideState(state), input), move: (state, input) => moveTide(tideState(state), input),
    release: state => cancelTide(tideState(state)), tick: (state, dt) => tickTide(tideState(state), dt),
    draw: () => new TideView(dom.document), paint: (refs, state) => tideView(refs).paint(tideState(state)),
    assets: () => ({ scene: TIDE_SCENE }), mount: (refs, { host, cache }) => tideView(refs).mount(host, cache),
    point: (refs, input) => tideView(refs).input(input), key: (state, key, phase) => keyTide(tideState(state), key, phase),
    instruction: () => PROMPT, status: state => tideFeedback(tideState(state)),
    outcome(state, entry) {
      const s = tideState(state);
      return { id: s.id, edition: entry.edition, earned: s.play.complete && s.play.completedAt !== null, interaction: 'drag', title: '潮汐收笔', memory: '我在咸田湾的沙面上慢慢画了几笔，看潮水漫过笔迹，再一点点退去。沙面平整了，这一刻却留了下来。' };
    },
    dispose(refs) { tideView(refs).dispose(); for (const key of ['coastMemory', 'coastPhase', 'tideStrokes', 'tidePoints']) delete $('micro-panel').dataset[key]; },
    present(state, refs) {
      const s = tideState(state), panel = $('micro-panel');
      panel.dataset.coastMemory = 'tide'; panel.dataset.coastPhase = s.phase.kind;
      panel.dataset.tideStrokes = String(s.strokes.filter(stroke => stroke.length > 1).length); panel.dataset.tidePoints = String(s.points);
      text('micro-title', '留给下一道浪的一笔'); text('micro-instruction', PROMPT); text('micro-skip', '继续山径 →');
      text('micro-result', refs.contentState === 'ready' ? tideFeedback(s) : refs.contentState === 'error' ? '海滩暂未展开，可以重试或继续山径。' : '海滩水彩正在展开……');
      $('micro-surface').setAttribute('aria-label', PROMPT + ' 键盘辅助：方向键移动笔尖，按住空格画，松开收笔，R 重试。');
    },
  };
}
