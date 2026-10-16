import type { MiniApi, MiniState, MiniViewRefs } from '../contracts';
import type { GameDom } from '../dom';
import { EventBindings } from '../dom';
import { MOGAN_GAMES, MOGAN_MEMORIES, MOGAN_PROMPTS, MOGAN_TITLES, createMoganState, inputMogan, keyMogan, releaseMogan, stepSpot, stepTiming, tickMogan } from './rules';
import type { LegacySling, MoganState } from './rules';
import { chapterNames, stageBounds } from './scene-model';
import { disposeMogan, drawMogan, moganAssets, mountMogan, paintMogan } from './scene';
import type { MoganRefs } from './scene';

interface Options { dom: GameDom; legacy: LegacySling; onAction(name: string, value?: number): void }
/** Play happens on the painted objects; only independent settings live outside. */
export function createMoganGames({ dom, legacy, onAction }: Options) {
  const { get: $, text } = dom, bindings = new EventBindings();
  function present(base: MiniState, view: MiniViewRefs) {
    const s = base as MoganState, refs = view as MoganRefs;
    const waiting = refs.contentState !== 'ready', complete = s.play.complete;
    $('mogan-tools').hidden = false;
    $('micro-panel').setAttribute('data-phase', waiting ? 'loading' : complete ? 'memory' : !s.acted ? 'invite' : 'play');
    text('micro-title', MOGAN_TITLES[s.game]);
    text('mogan-kicker', '莫干山 · ' + chapterNames[s.game]);
    text('mogan-count', s.game === 'rain' ? s.rain.caught + ' / 8 声' : s.game === 'footsteps' ? s.steps.index + ' / 10 级' : complete ? '纸叶已送到' : '穿过竹隙，送给远山');
    const status = waiting ? refs.contentState === 'error' ? '画作暂时没有展开，点「重新试一次」可重新加载。' : '竹林画作正在展开，准备好就能出发。' : s.feedback;
    text('mogan-cue', status); text('micro-result', status);
    $('micro-surface').setAttribute('aria-busy', String(refs.contentState === 'loading'));
    $('micro-surface').setAttribute('aria-label', MOGAN_PROMPTS[s.game] + (s.game === 'rain' ? ' 键盘左右方向键或 A、D 移动，Enter 开始，R 重试。' : s.game === 'footsteps' ? ' Enter 或空格点脚印，也可用 A/D 或左右方向键落脚；R 重试。' : ' 方向键调整，空格蓄力、松开发射，R 重试。'));
    $('mogan-settings').hidden = s.game !== 'footsteps' || complete;
    $<HTMLButtonElement>('mogan-slow').disabled = waiting;
    $('mogan-notes').hidden = s.game !== 'rain';
    $('mogan-tools').setAttribute('data-beat', '');
    if (s.game === 'rain') {
      for (const [i, note] of [...$('mogan-notes').children].entries()) { note.setAttribute('data-earned', String(i < s.rain.caught)); note.setAttribute('data-next', String(i === s.rain.caught)); }
    } else if (s.game === 'footsteps') {
      const timing = stepTiming(s), open = s.acted && s.steps.clock >= timing.open && s.steps.clock <= timing.close && !s.steps.recovery && !complete;
      $('mogan-tools').setAttribute('data-beat', open ? 'open' : 'wait');
      $('mogan-slow').setAttribute('aria-pressed', String(s.steps.slow));
      text('mogan-slow', s.steps.slow ? '恢复步速' : '慢一点');
    }
  }
  const adapter: MiniApi = {
    create: (entry, options) => createMoganState(entry, options.reduced, legacy, options.weather),
    act: (s, p) => inputMogan(s as MoganState, p, legacy),
    move: (s, p) => inputMogan(s as MoganState, p, legacy, 'move'),
    hover: (base, p) => {
      const s = base as MoganState;
      return s.game === 'rain' && s.acted && !s.play.complete ? releaseMogan(inputMogan(s, p, legacy, 'move'), legacy) : s;
    },
    release: s => releaseMogan(s as MoganState, legacy),
    tick: (s, dt) => tickMogan(s as MoganState, dt, legacy),
    draw: (svg, parent, entry) => drawMogan(svg, parent, MOGAN_GAMES[entry.id as keyof typeof MOGAN_GAMES]),
    paint: (refs, state) => paintMogan(refs as MoganRefs, state as MoganState, legacy),
    instruction: entry => MOGAN_PROMPTS[MOGAN_GAMES[entry.id as keyof typeof MOGAN_GAMES]],
    status: state => (state as MoganState).feedback,
    outcome(state, entry) { const s = state as MoganState; return { id: s.id, edition: entry.edition, earned: s.play.complete === true, interaction: s.gesture, memory: MOGAN_MEMORIES[s.game], title: s.play.complete ? entry.tag : entry.name }; },
    assets: entry => moganAssets(MOGAN_GAMES[entry.id as keyof typeof MOGAN_GAMES]),
    mount: (refs, context) => mountMogan(refs as MoganRefs, context.host, context.cache, context.pixi, legacy),
    dispose: refs => disposeMogan(refs as MoganRefs),
    point(view, p) {
      const refs = view as MoganRefs;
      if (refs.game === 'footsteps') {
        const s = refs.latest;
        if (!s || s.game !== 'footsteps') return { ...p, action: 'outside-step' };
        const spot = stepSpot(s, refs.height), padding = 22 * 800 / Math.max(1, refs.displayWidth);
        const distance = Math.hypot(((p.x ?? -1) * 800 - spot.x) / Math.max(spot.rx, padding), ((p.y ?? -1) * refs.height - spot.y) / Math.max(spot.ry, padding));
        return { ...p, action: distance <= 1 ? 'step' : 'outside-step' };
      }
      if (refs.game !== 'sling') return p;
      const b = stageBounds(refs.height);
      return { ...p, x: ((p.x ?? 0) * 800 - b.x) / b.w, y: ((p.y ?? 0) * refs.height - b.y) / b.h };
    },
    present,
    key: (s, key, phase) => keyMogan(s as MoganState, key, phase, legacy),
  };
  bindings.listen($('mogan-slow'), 'click', () => onAction('slow'));
  return { adapter, destroy: () => bindings.destroy() };
}
