import type { MiniApi, MiniPlatform, MiniState, MiniViewRefs } from './contracts';
import type { GameDom } from './dom';

interface ViewOptions { dom: GameDom; api: MiniApi; platform?: MiniPlatform; sound(): boolean }

/** Per-family HUD adaptation lives here; the app no longer knows puzzle/rain/camera tools. */
export function createMiniGameView({ dom, api, platform: games, sound }: ViewOptions) {
  const { get: $, text, html } = dom;
  let actionKey: string | null = null;
  const artReady = (refs: MiniViewRefs) => !!refs.art && refs.contentState === 'ready';

  function storyTools(s: MiniState, refs: MiniViewRefs, flow: ReturnType<MiniPlatform['wugongFlow']>) {
    const controls = flow.controls;
    $('wugong-tools').hidden = !controls;
    if (!controls) return;
    text('wugong-speaker', controls.speaker); text('wugong-line', controls.line);
    const loading = refs.contentState === 'loading', failed = refs.contentState === 'error';
    if ((s.game === 'clouds' || s.stage === 'camera') && (loading || failed)) text('wugong-line', failed ? '画作暂未加载，请点「重新试一次」重新展开。' : '画作正在展开，稍等片刻就能操作。');
    for (const [id, action] of [['wugong-primary', controls.primary], ['wugong-secondary', controls.secondary]] as const) {
      const button = $<HTMLButtonElement>(id); button.hidden = !action;
      if (action) {
        text(id, action.label); button.setAttribute('data-action', action.action);
        button.disabled = !!action.disabled || (action.action === 'shutter' && (loading || failed));
      }
    }
    $('wugong-zoom').hidden = !controls.zoom;
    $<HTMLButtonElement>('wugong-zoom-in').disabled = (s.camera?.zoom ?? 1) >= 1.44;
    $<HTMLButtonElement>('wugong-zoom-out').disabled = (s.camera?.zoom ?? 1) <= .86;
  }
  function artTools(s: MiniState, refs: MiniViewRefs) {
    if (!games) return;
    const flow = games.artFlow(s), waiting = !artReady(refs);
    $('micro-panel').setAttribute('data-phase', flow.phase); $('art-tools').hidden = false;
    text('art-kicker', flow.kicker); text('art-count', flow.counter);
    text('art-title', s.play.complete ? '这一幅，慢慢完整了' : flow.title);
    text('art-cue', waiting ? (refs.contentState === 'error' ? '画作暂未加载，请点「重新试一次」重新展开。' : '水彩画作正在展开，准备好就能操作。') : flow.cue);
    const key = flow.controls.map(c => c.action).join('|');
    if (key !== actionKey) {
      $('art-actions').replaceChildren();
      for (const control of flow.controls) {
        const button = html('button', control.label, $('art-actions'));
        button.type = 'button'; button.setAttribute('data-action', control.action);
      }
      actionKey = key;
    }
    for (const control of flow.controls) {
      const button = $('art-actions').querySelector<HTMLButtonElement>('[data-action="' + control.action + '"]');
      if (!button) continue;
      if (button.textContent !== control.label) button.textContent = control.label;
      button.disabled = waiting || !!control.disabled; button.setAttribute('data-primary', String(!!control.primary));
    }
    const hints = { puzzle: '1–6 选片 · 方向键选格 · Enter 放下', match: '方向键选格 · Enter 选中／交换 · R 重试', sling: '方向键调整 · 按住空格蓄力、松开发射 · R 重试' };
    text('art-key-hint', s.game && s.game in hints ? hints[s.game as keyof typeof hints] : '');
    $('micro-surface').setAttribute('aria-busy', String(refs.contentState === 'loading'));
  }
  function wugong(s: MiniState, refs: MiniViewRefs) {
    if (!games) return;
    const flow = games.wugongFlow(s), panel = $('micro-panel');
    panel.setAttribute('data-phase', flow.phase); panel.setAttribute('data-story-stage', s.stage || '');
    text('wind-stage-name', flow.stage); text('wind-count', flow.counter || flow.count + ' / ' + flow.total + ' ' + flow.unit);
    text('wind-cue', flow.cue); $('wind-steady-fill').style.width = flow.hold * 100 + '%';
    $('wind-hud').setAttribute('data-in-wind', String(!!s.near));
    for (let i = 0; i < 3; i++) $('wind-feather-' + i).setAttribute('data-earned', String(i < (s.gates || 0)));
    if (flow.story) storyTools(s, refs, flow);
    const title = flow.story ? (flow.phase === 'memory' ? '这一刻，值得留下' : flow.phase === 'soar' ? (s.game === 'clouds' ? '草脊，浮出云海' : '下次山里见') : '') : flow.phase === 'invite' ? flow.title : flow.phase === 'caught' ? '这一处，留住了' : flow.phase === 'soar' ? '把一段石语留在心里' : flow.phase === 'memory' ? '这一刻，值得留下' : '';
    $('wind-chapter').hidden = !title; text('wind-chapter-title', title); text('wind-chapter-kicker', flow.kicker);
    text('wind-chapter-copy', flow.phase === 'invite' ? flow.invitation : flow.phase === 'memory' ? '正在展开你的手绘纪念' : s.game === 'greet' ? '相遇很短，笑容留在了画里。' : s.game === 'clouds' ? '雾散在山坳，云仍留在谷中。' : '石头留在原处，回忆带在身边。');
  }
  function wind(s: MiniState, refs: MiniViewRefs) {
    if (!games) return;
    const flow = games.flow(s), gates = s.gates || 0, stage = games.windNames[Math.min(2, gates)];
    $('micro-panel').setAttribute('data-phase', flow.phase); text('wind-stage-name', stage); text('wind-count', flow.counter); text('wind-cue', flow.cue);
    $('wind-steady-fill').style.width = flow.energy * 100 + '%'; $('wind-hud').setAttribute('data-in-wind', String(!!s.windNear));
    for (let i = 0; i < 3; i++) $('wind-feather-' + i).setAttribute('data-earned', String(i < gates));
    const title = flow.phase === 'invite' ? '借一阵草甸的风' : flow.phase === 'caught' ? flow.cue : flow.phase === 'soar' ? '把风借给远方' : flow.phase === 'memory' ? '这一刻，值得留下' : '';
    text('wind-chapter-title', title); $('wind-chapter').hidden = !title;
    text('wind-chapter-kicker', flow.phase === 'invite' ? '武功山 · 山野小事' : flow.phase === 'caught' ? stage : '草浪来信');
    text('wind-chapter-copy', flow.phase === 'invite' ? '让草浪告诉你，风往哪里去。' : flow.phase === 'caught' ? (gates === 1 ? '侧风会带动纸鸢，顺着风带继续飞。' : '山脊已在身后，缓缓放线，借远处的气流。') : flow.phase === 'memory' ? '正在展开你的手绘纪念' : '纸鸢越过山脊，云海在眼前展开。');
    if (refs.contentState !== 'ready') text('wind-cue', refs.contentState === 'error' ? '纸鸢画作暂未加载，点「重新试一次」重新展开。' : '水彩纸鸢正在展开，准备好就能起飞。');
  }
  function water(s: MiniState) {
    if (!games) return;
    const flow = games.waterFlow(s), rain = s.game === 'rain';
    $('micro-panel').setAttribute('data-phase', flow.phase === 'settle' ? 'soar' : flow.phase);
    text('wind-stage-name', rain ? '把雨接成一首歌' : ['初入浅溪', '绕过青石', '漂向下游'][Math.min(2, s.gates || 0)]);
    text('wind-count', flow.count + ' / ' + flow.total + (rain ? ' 滴雨' : ' 处水口'));
    text('wind-cue', flow.cue); $('wind-steady-fill').style.width = s.play.progress * 100 + '%';
    $('wind-hud').setAttribute('data-in-wind', String(flow.pulse > 0));
    for (let i = 0; i < 3; i++) $('wind-feather-' + i).setAttribute('data-earned', String(i < (s.gates || 0)));
    const title = flow.phase === 'invite' ? (rain ? '听一筒竹林的雨' : '陪一片叶子顺流而下') : flow.phase === 'memory' ? '这一刻，值得留下' : flow.phase === 'settle' ? (rain ? '八滴雨，一段回声' : '把溪声寄向远方') : '';
    $('wind-chapter').hidden = !title; text('wind-chapter-title', title);
    text('wind-chapter-kicker', rain ? '莫干山 · 竹雨成曲' : '九溪 · 一叶顺流');
    text('wind-chapter-copy', flow.phase === 'invite' ? (rain ? '看叶尖蓄水，让竹筒等在雨滴下面。' : '水纹有方向，轻轻拨水，绕过青石。') : flow.phase === 'memory' ? '正在展开你的手绘纪念' : rain ? '雨滴在竹筒里，留下最后一圈涟漪。' : '落叶慢慢漂远，溪水还在轻轻流。');
  }
  function update(s: MiniState, refs: MiniViewRefs) {
    if (refs.mogan || refs.tiger || refs.directInput) { /* Registered adapters own their play controls. */ }
    else if (s.game && games?.artAssets[s.game]) artTools(s, refs);
    else if (s.game && games?.wugongAssets[s.game]) wugong(s, refs);
    else if (s.game === 'wind') wind(s, refs);
    else if (s.game) water(s);
    if (s.game || refs.directInput) {
      $<HTMLButtonElement>('mini-retry').disabled = s.play.complete;
      text('mini-sound', sound() ? '声音 · 开' : '声音 · 点击开启'); $('mini-sound').setAttribute('aria-pressed', String(sound()));
    }
    const progress = Math.round(s.play.progress * 100);
    $('micro-progress').setAttribute('aria-valuenow', String(progress)); $('micro-progress-fill').style.width = progress + '%';
    const status = refs.art && !artReady(refs) ? $('art-cue').textContent || '' : s.game === 'clouds' && refs.contentState !== 'ready' ? (refs.contentState === 'error' ? '云海暂未加载，请点「重新试一次」。' : '云海正在展开…') : api.status(s) + (s.game === 'clouds' ? ' · ' + (s.gates || 0) + ' / 3' : '');
    text('micro-result', status);
  }
  return { update, reset() { actionKey = null; }, artReady };
}
