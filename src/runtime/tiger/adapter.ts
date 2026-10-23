import type { MiniApi, MiniState, MiniViewRefs } from '../contracts';
import type { GameDom } from '../dom';
import { EventBindings } from '../dom';
import { ITEMS, MEMORIES, PROMPTS, TIGER_GAMES, TITLES, VOICES, createTigerState, inputTiger, keyTiger, releaseTiger, scoreReady, tickTiger } from './rules';
import type { TigerKind, TigerState } from './rules';
import { disposeTiger, drawTiger, mountTiger, paintTiger, tigerAssets, tigerPoint } from './scene';
import type { TigerRefs } from './scene';

const KEY_HINTS: Record<TigerKind, string> = {
  depth: 'A／D 换观景处；1–4 选画片，左右键移动；Enter 查看排序。',
  packing: '1–5 选物件，方向键选格，Enter 放下；Q 旋转，Delete 取出，C 合包。',
  score: '方向键选节拍，Enter 开关；P 试听，Z 撤回，S 留下。',
  bells: '左右键选山路，下键返回；Enter 再听一次或让驮队先过。',
};
interface Options { dom: GameDom; onAction(name: string, value?: number): void }
export function createTigerGames({ dom, onAction }: Options) {
  const { get: $, text, html } = dom, bindings = new EventBindings();
  let actionKey = '';
  function present(base: MiniState, view: MiniViewRefs) {
    const s = base as TigerState, refs = view as TigerRefs, waiting = refs.contentState !== 'ready';
    $('tiger-tools').hidden = false;
    $('micro-panel').setAttribute('data-phase', waiting ? 'loading' : s.play.complete ? 'memory' : s.acted ? 'play' : 'invite');
    text('micro-title', TITLES[s.game]);
    const feedback = waiting ? refs.contentState === 'error' ? '画作未能展开，点「重新试一次」可重新加载，也可以继续走。' : '江谷画作正在展开，准备好就能操作。' : s.feedback;
    text('micro-result', feedback); text('tiger-key-hint', KEY_HINTS[s.game]);
    $('micro-surface').setAttribute('aria-busy', String(refs.contentState === 'loading'));
    let focus = '';
    if (s.game === 'score') { const row = Math.floor(s.score.cursor / 8), beat = s.score.cursor % 8; focus = ' 当前选择：' + VOICES[row] + '第' + (beat + 1) + '拍，' + (s.score.notes[row][beat] ? '有声音。' : '空白。'); }
    if (s.game === 'packing') focus = ' 当前格：第' + (s.bag.cursor.x + 1) + '列、第' + (s.bag.cursor.y + 1) + '行。' + (s.bag.selected >= 0 ? '已选' + ITEMS[s.bag.selected].name + '。' : '');
    $('micro-surface').setAttribute('aria-label', PROMPTS[s.game] + ' ' + KEY_HINTS[s.game] + ' R 重试。' + focus);
    const controls: { action: string; label: string; disabled?: boolean; primary?: boolean }[] = [];
    if (s.game === 'depth') {
      text('tiger-count', (s.depth.seen === 3 ? '两个观景处已看过' : '再看看另一边') + ' · 四张画片');
      controls.push({ action: 'check-depth', label: '看看排好了吗', primary: true });
    } else if (s.game === 'packing') {
      const count = s.bag.poses.filter(p => p.cell).length, selected = s.bag.selected;
      text('tiger-count', count + ' / 5 件已收好' + (selected >= 0 ? ' · ' + ITEMS[selected].name : ''));
      controls.push({ action: 'rotate', label: '旋转物件 ↻', disabled: selected < 0 }, { action: 'take-out', label: '取出来', disabled: selected < 0 || !s.bag.poses[selected].cell }, { action: 'close-bag', label: '合上背包', disabled: count < 5, primary: true });
    } else if (s.game === 'score') {
      const voices = s.score.notes.filter(row => row.some(Boolean)).length, rests = Array.from({ length: 8 }, (_, i) => i).filter(i => s.score.notes.every(row => !row[i])).length;
      text('tiger-count', voices + ' 种声音 · ' + rests + ' 拍留白' + (s.score.audition === s.score.revision ? ' · 已完整试听' : s.score.playing ? ' · 试听中' : ''));
      controls.push({ action: 'audition', label: s.score.playing ? '停止试听' : '试听八拍' }, { action: 'undo', label: '撤回一笔', disabled: !s.score.history.length }, { action: 'save-score', label: '留下这段瀑声', disabled: !scoreReady(s) || s.score.playing || s.score.audition !== s.score.revision, primary: true });
    } else {
      text('tiger-count', s.bells.junction === 2 ? '已经遇见山路旅伴' : (s.bells.junction + 1) + ' / 2 个转弯' + (s.bells.wrong ? ' · 先沿原路返回' : ' · 铃纹与声音同向'));
      if (s.bells.junction < 2) controls.push({ action: 'listen-bell', label: '再听一次铃声' });
      else controls.push({ action: 'let-pass', label: '让驮队先过', primary: true });
    }
    const key = s.game + ':' + controls.map(c => c.action).join(',');
    if (key !== actionKey) {
      $('tiger-actions').replaceChildren();
      for (const control of controls) { const b = html('button', control.label, $('tiger-actions')); b.type = 'button'; b.setAttribute('data-action', control.action); }
      actionKey = key;
    }
    for (const control of controls) {
      const button = $('tiger-actions').querySelector<HTMLButtonElement>('[data-action="' + control.action + '"]');
      if (!button) continue; if (button.textContent !== control.label) button.textContent = control.label;
      button.disabled = waiting || s.play.complete || !!control.disabled; button.setAttribute('data-primary', String(!!control.primary));
    }
  }
  const adapter: MiniApi = {
    create: (entry, options) => createTigerState(entry, options.reduced),
    act: (s, p) => inputTiger(s as TigerState, p), move: (s, p) => inputTiger(s as TigerState, p, true),
    release: s => releaseTiger(s as TigerState), tick: (s, dt) => tickTiger(s as TigerState, dt),
    draw: (svg, parent, entry) => drawTiger(svg, parent, TIGER_GAMES[entry.id as keyof typeof TIGER_GAMES]),
    paint: (refs, state) => paintTiger(refs as TigerRefs, state as TigerState),
    instruction: entry => PROMPTS[TIGER_GAMES[entry.id as keyof typeof TIGER_GAMES]], status: s => (s as TigerState).feedback,
    outcome(state, entry) {
      const s = state as TigerState;
      let memory = MEMORIES[s.game];
      if (s.game === 'score' && s.play.complete) memory += ' 我的编排：' + s.score.notes.map((row, i) => VOICES[i] + '在第' + row.map((on, j) => on ? j + 1 : 0).filter(Boolean).join('、') + '拍').filter((_, i) => s.score.notes[i].some(Boolean)).join('；') + '。';
      return { id: s.id, edition: entry.edition, earned: s.play.complete === true, interaction: s.gesture, memory, title: s.play.complete ? entry.tag : entry.name };
    },
    assets: entry => tigerAssets(TIGER_GAMES[entry.id as keyof typeof TIGER_GAMES]),
    mount: (refs, context) => mountTiger(refs as TigerRefs, context.host, context.cache),
    dispose: refs => disposeTiger(refs as TigerRefs), point: (refs, p) => tigerPoint(refs as TigerRefs, p),
    key: (s, key, phase) => keyTiger(s as TigerState, key, phase), present,
  };
  bindings.listen($('tiger-actions'), 'click', event => {
    const button = (event.target as HTMLElement).closest?.<HTMLButtonElement>('button[data-action]'), action = button?.getAttribute('data-action');
    if (button && !button.disabled && action) onAction(action);
  });
  return { adapter, destroy: () => bindings.destroy() };
}
