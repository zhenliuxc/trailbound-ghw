import type { MiniApi } from '../../contracts';
import type { GameDom } from '../../dom';
import { actShoulder, hoverShoulder, keyShoulder, MEMORY, PROMPT, ShoulderState, shoulderState, tickShoulder } from './model';
import { ART_ROOT, ShoulderView, shoulderView } from './view';

export function createSaiwanShoulder(dom: GameDom): MiniApi {
  const { get: $, text } = dom;
  return {
    input: 'direct', soundTheme: 'footsteps',
    create: (_entry, options) => new ShoulderState(options.reduced),
    act: (state, input) => actShoulder(shoulderState(state), input),
    move: (state, input) => hoverShoulder(shoulderState(state), input),
    hover: (state, input) => hoverShoulder(shoulderState(state), input),
    release(state) { shoulderState(state).hover = false; return state; },
    tick: (state, dt) => tickShoulder(shoulderState(state), dt),
    draw: () => new ShoulderView(dom.document),
    paint: (refs, state) => shoulderView(refs).paint(shoulderState(state)),
    instruction: () => PROMPT, status: state => shoulderState(state).feedback,
    outcome(state, entry) { const s = shoulderState(state); return { id: s.id, edition: entry.edition, earned: s.play.complete && s.play.completedAt !== null, interaction: 'tap', memory: MEMORY, title: '转角见海' }; },
    assets: () => ({ scene: ART_ROOT + 'panorama.webp', front: ART_ROOT + 'terrain.webp', hint: ART_ROOT + 'shoulder.webp' }),
    mount: (refs, context) => shoulderView(refs).mount(context.host, context.cache),
    dispose(refs) { shoulderView(refs).dispose(); delete $('micro-panel').dataset.coastMemory; delete $('micro-panel').dataset.coastPhase; delete $('micro-panel').dataset.coastStep; },
    point: (refs, input) => shoulderView(refs).input(input),
    key: (state, key, phase) => keyShoulder(shoulderState(state), key, phase),
    present(state, refs) {
      const s = shoulderState(state), view = shoulderView(refs), panel = $('micro-panel');
      panel.dataset.coastMemory = 'saiwan-steps'; panel.dataset.coastPhase = s.phase.kind; panel.dataset.coastStep = String(s.step);
      text('micro-place', '麦理浩径 · 西湾山'); text('micro-title', '登高望海');
      text('micro-instruction', s.phase.kind === 'ready' ? PROMPT : '跟着山路登高，看海湾在山肩外展开。');
      text('micro-result', view.contentState === 'error' ? '画作暂未展开，可以重试或继续山径。' : view.contentState === 'loading' ? '山肩外的海风，正吹开这一页。' : s.feedback);
      text('micro-skip', '继续山径 →');
      $('micro-surface').setAttribute('aria-label', '轻点山路，人物会自动登高，停下望海。键盘 Enter 或空格开始，R 重试。');
      $('micro-surface').setAttribute('aria-busy', String(view.contentState === 'loading'));
    },
  };
}
