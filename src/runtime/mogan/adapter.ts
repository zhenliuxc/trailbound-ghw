import type { MiniApi, MiniState, MiniViewRefs } from '../contracts';
import type { GameDom } from '../dom';
import { EventBindings } from '../dom';
import { MOGAN_GAMES, MOGAN_MEMORIES, MOGAN_PROMPTS, MOGAN_TITLES, createMoganState, inputMogan, keyMogan, releaseMogan, stepFoot, stepTiming, tickMogan } from './rules';
import type { LegacySling, MoganState } from './rules';
import { chapterNames, stageBounds } from './scene-model';
import { disposeMogan, drawMogan, moganAssets, mountMogan, paintMogan } from './scene';
import type { MoganRefs } from './scene';

interface Options { dom: GameDom; legacy: LegacySling; onAction(name: string, value?: number): void }
/** Three local play adapters reuse the shared scene, reward and storage lifecycle. */
export function createMoganGames({ dom, legacy, onAction }: Options) {
  const { get: $, text } = dom, bindings = new EventBindings();
  let precision = false;
  function present(base: MiniState, view: MiniViewRefs) {
    const s = base as MoganState, refs = view as MoganRefs;
    const waiting = refs.contentState !== 'ready', complete = s.play.complete;
    $('mogan-tools').hidden = false;
    $('micro-panel').setAttribute('data-phase', waiting ? 'loading' : complete ? 'memory' : !s.acted ? 'invite' : 'play');
    text('micro-title', MOGAN_TITLES[s.game]);
    text('mogan-kicker', '莫干山 · ' + chapterNames[s.game]);
    const count = s.game === 'rain' ? s.rain.caught + ' / 8 声' : s.game === 'footsteps' ? s.steps.index + ' / 10 级' : complete ? '纸叶已送到' : '穿过竹隙，送给远山';
    text('mogan-count', count);
    const status = waiting ? refs.contentState === 'error' ? '画作暂时没有展开，点「重新试一次」可重新加载。' : '竹林画作正在展开，准备好就能出发。' : s.feedback;
    text('mogan-cue', status); text('micro-result', status);
    $('micro-surface').setAttribute('aria-busy', String(refs.contentState === 'loading'));
    $('micro-surface').setAttribute('aria-label', MOGAN_PROMPTS[s.game] + (s.game === 'rain' ? ' 键盘左右方向键或 A、D 移动，Enter 开始，R 重试。' : s.game === 'footsteps' ? ' A 或左方向键迈左脚，D 或右方向键迈右脚，Enter 开始，R 重试。' : ' 方向键调整，空格蓄力、松开发射，Enter 发射，R 重试。'));
    $('mogan-rain-controls').hidden = s.game !== 'rain' || !s.acted || complete;
    $('mogan-step-controls').hidden = s.game !== 'footsteps' || !s.acted || complete;
    $('mogan-slow').hidden = s.game !== 'footsteps' || complete;
    $('mogan-tune').hidden = s.game !== 'sling' || complete;
    $('mogan-aim').hidden = s.game !== 'sling' || !precision || complete;
    $('mogan-notes').hidden = s.game !== 'rain';
    const start = $<HTMLButtonElement>('mogan-start');
    start.hidden = complete || s.game !== 'sling' && s.acted;
    start.disabled = waiting || s.game === 'sling' && s.sling.stage !== 'ready';
    text('mogan-start', waiting ? '准备画作…' : s.game === 'rain' ? '开始听雨 →' : s.game === 'footsteps' ? '走上石阶 →' : s.sling.stage === 'flight' ? '纸叶在风里…' : s.sling.stage === 'miss' ? '等纸叶轻轻落下' : '送出纸叶 →');
    start.setAttribute('data-action', s.game === 'sling' ? 'fire' : 'begin');
    for (const id of ['mogan-rain-left', 'mogan-rain-right', 'mogan-foot-left', 'mogan-foot-right', 'mogan-slow', 'mogan-tune']) $<HTMLButtonElement>(id).disabled = waiting || complete;
    if (s.game === 'rain') {
      for (const [i, note] of [...$('mogan-notes').children].entries()) { note.setAttribute('data-earned', String(i < s.rain.caught)); note.setAttribute('data-next', String(i === s.rain.caught)); }
    } else if (s.game === 'footsteps') {
      const next = stepFoot(s.steps.index), timing = stepTiming(s), open = s.steps.clock >= timing.open && !s.steps.recovery;
      for (const foot of ['left', 'right']) {
        $('mogan-foot-' + foot).setAttribute('data-next', String(next === foot));
        $('mogan-foot-' + foot).setAttribute('data-ready', String(next === foot && open));
      }
      $('mogan-slow').setAttribute('aria-pressed', String(s.steps.slow));
      text('mogan-slow', s.steps.slow ? '恢复步速' : '慢一点');
    } else {
      $('mogan-tune').setAttribute('aria-expanded', String(precision));
      text('mogan-tune', precision ? '收起微调 ↑' : '调整角度与力度 ↓');
      for (const [id, value, label] of [['mogan-angle', Math.round(s.sling.angle), '°'], ['mogan-power', Math.round(s.sling.power * 100), '%']] as const) {
        const input = $<HTMLInputElement>(id);
        if (input.value !== String(value)) input.value = String(value);
        input.disabled = waiting || s.sling.stage !== 'ready'; text(id + '-value', value + label);
      }
    }
    text('mogan-key-hint', s.game === 'rain' ? '← → / A D 移动竹筒' : s.game === 'footsteps' ? 'A / ← 左脚 · D / → 右脚' : '方向键调整 · 空格蓄力，松开发射');
  }
  const adapter: MiniApi = {
    create(entry, options) { precision = false; return createMoganState(entry, options.reduced, legacy, options.weather); },
    act: (s, p) => inputMogan(s as MoganState, p, legacy),
    move: (s, p) => inputMogan(s as MoganState, p, legacy, 'move'),
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
    point(refs, p) {
      if ((refs as MoganRefs).game !== 'sling') return p;
      const height = (refs as MoganRefs).height, b = stageBounds(height);
      return { ...p, x: ((p.x ?? 0) * 800 - b.x) / b.w, y: ((p.y ?? 0) * height - b.y) / b.h };
    },
    present,
    key: (s, key, phase) => keyMogan(s as MoganState, key, phase, legacy),
  };
  for (const [id, action] of [['mogan-start', 'begin'], ['mogan-rain-left', 'left'], ['mogan-rain-right', 'right'], ['mogan-foot-left', 'left'], ['mogan-foot-right', 'right'], ['mogan-slow', 'slow']] as const) {
    bindings.listen($(id), 'click', () => onAction(id === 'mogan-start' ? $('mogan-start').getAttribute('data-action') || action : action));
  }
  bindings.listen($('mogan-tune'), 'click', () => { precision = !precision; $('mogan-aim').hidden = !precision; $('mogan-tune').setAttribute('aria-expanded', String(precision)); text('mogan-tune', precision ? '收起微调 ↑' : '调整角度与力度 ↓'); });
  bindings.listen($('mogan-angle'), 'input', event => onAction('angle', Number((event.target as HTMLInputElement).value)));
  bindings.listen($('mogan-power'), 'input', event => onAction('power', Number((event.target as HTMLInputElement).value) / 100));
  return { adapter, destroy: () => bindings.destroy() };
}
