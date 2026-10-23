import type { ImageCache, JourneyStatus, MiniApi, MiniInput, MiniOutcome, MiniPlatform, MiniState, MiniViewRefs, MomentCatalog, MomentEntry, SoundPlayer, SvgFactory } from './contracts';
import type { GameDom } from './dom';
import { EventBindings } from './dom';
import { createMiniGameView } from './mini-game-view';
import type { SceneManager, SceneSession } from './scene-manager';

export interface FinishedMini {
  state: MiniState;
  entry: MomentEntry;
  outcome: MiniOutcome;
  returnStatus: JourneyStatus;
}
interface MiniOptions {
  dom: GameDom;
  scenes: SceneManager;
  api: MiniApi;
  platform?: MiniPlatform;
  pixi?: unknown;
  svg: SvgFactory;
  cache?: ImageCache;
  catalog: MomentCatalog;
  audio: SoundPlayer;
  reduced: boolean;
  weather?(): string;
  sound(): boolean;
  toggleSound(): Promise<void>;
  stopLoop(): void;
  ensureLoop(): void;
  refresh(): void;
  /** Returns true when an earned reward has taken over the scene. */
  onFinished(finished: FinishedMini): boolean;
  /** Route chapters can advance after an exit, without awarding unfinished scenes. */
  onClosed?(id: string, earned: boolean, resume: boolean): void;
}

/** Common lifecycle: enter → input/update/render → completed outcome → leave/destroy. */
export function createMiniGameController(options: MiniOptions) {
  const { dom, scenes, platform: games, catalog: D } = options, { get: $, text } = dom;
  const bindings = new EventBindings();
  const registered = new Map<string, MiniApi>();
  let api = options.api;
  let current: MiniState | null = null;
  let currentEntry: MomentEntry | null = null;
  let refs: MiniViewRefs | null = null;
  let session: SceneSession | null = null;
  let pendingPoint: MiniInput | null = null;
  let pointer: { id: number; x: number; y: number; drag: boolean } | null = null;
  let soundSerial = 0;
  let genericCompletionSound = false;
  // The view reads the currently selected adapter, including explicitly registered new games.
  const view = createMiniGameView({ dom, api: { ...options.api, status: state => api.status(state) }, platform: games, sound: options.sound });
  const surface = $('micro-surface');
  const soundTheme = () => api.soundTheme ?? current?.game;
  const directInput = () => api.input === 'direct' || !!refs?.directInput;

  function interactive() { return !!current && scenes.isTop(session) && !scenes.background && !dom.document.hidden; }
  function paint() { if (current && refs) api.paint(refs, current, options.reduced); }
  function updateStatus() {
    if (!current || !refs) return;
    view.update(current, refs);
    api.present?.(current, refs);
    const theme = soundTheme();
    if (theme) {
      if (current.game === 'wind' && games && !refs.directInput) options.audio.wind?.(games.flow(current).energy, current.play.complete);
      for (const event of current.events || []) if (event.serial > soundSerial) {
        options.audio.mini?.(theme, event.type, { x: event.x, index: event.index ?? (current.caught || current.gates) });
        soundSerial = event.serial;
      }
    }
  }
  function clearPointer() {
    pendingPoint = null;
    const previous = pointer; pointer = null;
    if (previous) try { if (surface.hasPointerCapture?.(previous.id)) surface.releasePointerCapture(previous.id); } catch { /* Pointer capture can already have ended. */ }
  }
  function pause() {
    clearPointer();
    if (current) current = api.release(current);
  }
  function inputReady(input: MiniInput = {}) {
    if (!interactive() || !current || !refs) return false;
    if ((refs.mogan || refs.tiger || refs.directInput) && refs.contentState !== 'ready') return false;
    if (refs.art && !view.artReady(refs)) return false;
    if ((current.game === 'wind' || current.game === 'clouds') && refs.contentState !== 'ready') return false;
    if (refs.story && refs.contentState !== 'ready' && (input.action === 'shutter' || input.assist && current.game === 'greet' && current.stage === 'camera')) return false;
    return true;
  }
  function perform(input: MiniInput = {}) {
    if (!inputReady(input) || !current) return;
    const next = api.act(current, input);
    if (next === current) return;
    current = next;
    if (!current.game && !directInput()) {
      paint();
      options.audio.interact?.(current.kind, { x: current.x, icon: D.item(current.id).icon, playType: current.play.type });
    }
    updateStatus(); options.refresh();
  }
  function begin(entry: MomentEntry, returnStatus?: JourneyStatus) {
    if (current) finish(false, false);
    options.stopLoop();
    session = scenes.enter('minigame', returnStatus);
    api = registered.get(entry.id) || options.api;
    current = api.create(entry, { reduced: options.reduced, weather: options.weather?.() });
    currentEntry = entry;
    soundSerial = 0; genericCompletionSound = false; pendingPoint = null; view.reset();
    $<HTMLButtonElement>('mini-retry').disabled = false;
    $('micro-art').replaceChildren(); refs = api.draw(options.svg, $('micro-art'), entry);
    if (api.input === 'direct') refs.directInput = true;
    refs.waitsForArt = !!(refs.art || refs.story || refs.mogan || refs.tiger || refs.directInput || current.game === 'wind');
    if (refs.waitsForArt) refs.contentState = 'loading';
    surface.setAttribute('aria-busy', String(refs.waitsForArt)); paint();
    $('wugong-tools').hidden = true; $('art-tools').hidden = true;
    $('mogan-tools').hidden = !refs.mogan;
    $('tiger-tools').hidden = !refs.tiger;
    $('micro-panel').setAttribute('data-tiger', String(!!refs.tiger));
    $('micro-panel').setAttribute('data-mogan', String(!!refs.mogan));
    $('micro-panel').setAttribute('data-art-game', String(!!refs.art));
    $('micro-panel').setAttribute('data-game', current.game || '');
    $('micro-panel').setAttribute('data-direct', String(directInput()));
    $('wind-hud').hidden = !current.game || !!refs.art || !!refs.mogan || !!refs.tiger || !!refs.directInput;
    const labels = { wind: '武功山 · 借风', clouds: '武功山 · 拨云见山', altar: '武功山 · 金顶石语', greet: '武功山 · 风口相遇', creek: '九溪 · 推叶', rain: '莫干山 · 接雨' };
    $('mini-place-label').textContent = current.game && current.game in labels ? labels[current.game as keyof typeof labels] : '';
    $('mini-controls').hidden = !current.game && !directInput();
    options.cache?.request(entry.artV5 || entry.artV4 || entry.badge, 'high');
    text('micro-place', entry.place + ' · ' + entry.condition); text('micro-title', entry.name);
    text('micro-instruction', api.instruction(entry));
    const keyHints = { puzzle: '1–6 选片，方向键选格，Enter 放下。', match: '方向键选卡，Enter 选中或交换。', sling: '方向键调整，按住空格蓄力、松开发射。', greet: '方向键取景，＋／－调整远近，空格拍照。', clouds: '方向键选择云朵，空格或 Enter 吹散。' };
    const keyHint = current.game && current.game in keyHints ? keyHints[current.game as keyof typeof keyHints] : '';
    surface.setAttribute('aria-label', (dom.get('micro-instruction').textContent || '') + (keyHint ? ' 键盘辅助：' + keyHint : ''));
    updateStatus(); $('micro-panel').hidden = false; options.refresh();
    const assets = api.assets?.(entry) || current.game && (games?.artAssets[current.game] || games?.wugongAssets[current.game] || games?.waterAssets[current.game]);
    const scene = assets && assets.scene || 'scenes/' + entry.route + '-v1.webp';
    const actor = entry.id === 'meadow-bird' ? 'sprites/wugong-swallow-kite-v1.webp' : assets && assets.actor;
    const front = entry.id === 'meadow-bird' ? 'sprites/wugong-meadow-grass-v1.webp' : current.game === 'creek' ? assets && assets.stone : assets && assets.front;
    const sceneAsset = options.cache?.request(scene, 'high') || null;
    const actorAsset = actor ? options.cache?.request(actor, 'high') || null : null;
    const frontAsset = front ? options.cache?.request(front, 'high') || null : null;
    const hintAsset = assets && assets.hint ? options.cache?.request(assets.hint, 'high') || null : null;
    const openingRefs = refs;
    if (openingRefs.waitsForArt && !api.mount) {
      openingRefs.contentState = sceneAsset ? 'loading' : 'error';
      const assetsToWait = [sceneAsset, actorAsset, frontAsset].filter((asset): asset is NonNullable<typeof asset> => !!asset);
      Promise.all(assetsToWait.map(asset => asset.promise)).then(items => {
        if (openingRefs.disposed || refs !== openingRefs) return;
        openingRefs.contentState = sceneAsset && items.every(item => item.state === 'ready') && (!actor || actorAsset) && (!front || frontAsset) ? 'ready' : 'error';
        surface.setAttribute('aria-busy', 'false'); updateStatus();
      });
    }
    if (api.mount) {
      const adapter = api;
      Promise.resolve().then(() => {
        if (!openingRefs.disposed && refs === openingRefs) return adapter.mount?.(openingRefs, { pixi: options.pixi, host: surface, cache: options.cache, entry });
      }).catch(() => {
        if (openingRefs.disposed || refs !== openingRefs) return;
        openingRefs.contentState = 'error'; surface.setAttribute('aria-busy', 'false'); paint(); updateStatus();
      });
    } else games?.mount(openingRefs, options.pixi, surface, sceneAsset, actorAsset, frontAsset, hintAsset);
    surface.focus({ preventScroll: true }); options.ensureLoop();
  }
  function finish(record = true, resume = true) {
    if (!current || !currentEntry || !refs || !session) return;
    const finished = current, closingRefs = refs, closing = session, entry = currentEntry;
    pause();
    const outcome = record && finished.play.complete === true ? api.outcome(finished, entry) : null;
    current = null; currentEntry = null; refs = null; session = null;
    try { if (api.dispose) api.dispose(closingRefs); else games?.dispose(closingRefs); }
    catch { /* Renderer cleanup must not trap the player in an exiting scene. */ }
    closingRefs.disposed = true;
    $('micro-panel').hidden = true; options.stopLoop();
    let rewardShown = false;
    if (outcome) rewardShown = options.onFinished({ state: finished, entry, outcome, returnStatus: closing.returnStatus });
    scenes.leave(closing, resume && !rewardShown);
    options.onClosed?.(finished.id, finished.play.complete === true, resume);
    options.refresh();
    if (resume && !rewardShown) $('walk-toggle').focus({ preventScroll: true });
  }
  function update(dt: number) {
    if (!interactive() || !current || !refs) return;
    if ((refs.mogan || refs.tiger || refs.directInput) && refs.contentState !== 'ready') { updateStatus(); paint(); return; }
    if (pendingPoint) { current = api.move(current, pendingPoint); pendingPoint = null; }
    current = api.tick(current, dt);
    if (!soundTheme() && current.play.complete && !genericCompletionSound) { genericCompletionSound = true; options.audio.mini?.('memory', 'complete'); }
    updateStatus(); paint();
    if (current.done) finish(true);
  }
  function point(event: PointerEvent): MiniInput {
    const rect = surface.getBoundingClientRect();
    const p = { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
    return refs && api.point ? api.point(refs, p) : refs && games ? games.point(refs, p) : p;
  }
  function retry() {
    if (!interactive() || !current || !currentEntry || current.play.complete || !refs) return;
    const entry = currentEntry; pause();
    if (refs.waitsForArt && refs.contentState === 'error') {
      const returnStatus = session?.returnStatus;
      finish(false, false); begin(entry, returnStatus); return;
    }
    current = api.create(entry, { reduced: options.reduced, weather: options.weather?.() }); soundSerial = 0; genericCompletionSound = false;
    updateStatus(); paint(); surface.focus({ preventScroll: true }); options.ensureLoop();
  }
  function action(name: string, value?: number) {
    if (!interactive() || !current || !refs) return;
    if ((refs.mogan || refs.tiger || refs.directInput) && refs.contentState !== 'ready') return;
    if (refs.art && !view.artReady(refs)) return;
    pause(); perform({ action: name, value });
  }
  function cancelGesture() { pause(); paint(); updateStatus(); }
  function keydown(event: KeyboardEvent) {
    if (!interactive() || !current || !refs) return;
    if ((current.game || directInput()) && event.key.toLowerCase() === 'r') { event.preventDefault(); retry(); return; }
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    const arrows: Record<string, [number, number]> = { ArrowLeft: [-.08, 0], ArrowRight: [.08, 0], ArrowUp: [0, -.1], ArrowDown: [0, .1] };
    if (api.key) {
      if (event.repeat && !arrows[event.key]) { event.preventDefault(); return; }
      if (!inputReady()) return;
      const next = api.key(current, event.key, 'down');
      if (next) { event.preventDefault(); current = next; paint(); updateStatus(); options.ensureLoop(); }
      return;
    }
    if (refs.art) {
      const supported = !!arrows[event.key] || ['Enter', ' '].includes(event.key) || current.game === 'puzzle' && /^[1-6]$/.test(event.key);
      if (!supported) return;
      event.preventDefault();
      if (!view.artReady(refs) || event.repeat && !arrows[event.key] || !games) return;
      current = games.artKey(current, event.key); paint(); updateStatus(); options.ensureLoop(); return;
    }
    if (arrows[event.key]) {
      event.preventDefault(); if (!inputReady()) return;
      const [dx, dy] = arrows[event.key];
      current = api.release(api.move(current, { x: current.x + dx, y: current.y + dy, key: true, dx, dy }));
      paint(); updateStatus(); options.ensureLoop(); return;
    }
    if (current.game !== 'clouds' && current.game !== 'greet') return;
    let name: string | null = null;
    if (event.key === 'Enter' || event.key === ' ') name = current.game === 'clouds' ? 'blow' : current.stage === 'camera' ? 'shutter' : current.stage === 'review' && !current.capture?.ok ? 'retake' : 'advance';
    else if (current.game === 'greet' && ['+', '=', '-', '_'].includes(event.key)) name = ['-', '_'].includes(event.key) ? 'zoom-out' : 'zoom-in';
    if (!name) return;
    event.preventDefault(); if (!event.repeat) action(name);
  }
  function bind() {
    bindings.listen($('micro-skip'), 'click', () => finish());
    bindings.listen(surface, 'click', event => { if (event.detail > 0) return; perform({ assist: true }); });
    bindings.listen(surface, 'keydown', keydown);
    bindings.listen(surface, 'keyup', event => {
      if (interactive() && current && (refs?.mogan || refs?.tiger || refs?.directInput) && api.key && inputReady()) {
        const next = api.key(current, event.key, 'up');
        if (next) { event.preventDefault(); current = next; paint(); updateStatus(); options.ensureLoop(); }
        return;
      }
      if (!interactive() || !current || !refs?.art || event.key !== ' ' || !games) return;
      event.preventDefault(); if (!view.artReady(refs)) return;
      current = games.artKey(current, event.key, 'up'); paint(); updateStatus(); options.ensureLoop();
    });
    bindings.listen(surface, 'pointerdown', event => {
      if (!inputReady() || pointer || event.isPrimary === false || event.button !== undefined && event.button !== 0 || !current) return;
      event.stopPropagation?.(); pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, drag: false };
      surface.setPointerCapture?.(event.pointerId);
      if (current.game || directInput()) perform({ ...point(event), ...(refs?.art || refs?.mogan || refs?.tiger || directInput() || current.game === 'clouds' ? { phase: 'press' as const } : {}) });
    });
    bindings.listen(surface, 'pointermove', event => {
      if (!interactive() || !current) return;
      if (!pointer) {
        if (event.pointerType === 'mouse' && api.hover && inputReady()) {
          const next = api.hover(current, point(event));
          if (next !== current) { current = next; options.ensureLoop(); }
        }
        return;
      }
      if (pointer.id !== event.pointerId) return;
      event.stopPropagation?.();
      if (Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) > 8) pointer.drag = true;
      if (!pointer.drag) return;
      const input = { ...point(event), gesture: 'drag' as const };
      if (current.game || directInput()) { pendingPoint = input; options.ensureLoop(); return; }
      if (!current.acted) {
        const rect = surface.getBoundingClientRect();
        perform({ x: (pointer.x - rect.left) / rect.width, y: (pointer.y - rect.top) / rect.height, gesture: 'drag' });
      }
      if (current) current = api.move(current, input);
      updateStatus(); paint();
    });
    bindings.listen(surface, 'pointerup', event => {
      if (!interactive() || !pointer || pointer.id !== event.pointerId || !current) return;
      event.stopPropagation?.();
      const dragged = pointer.drag, input = { ...point(event), gesture: dragged ? 'drag' as const : 'tap' as const };
      if (refs?.art || refs?.mogan || refs?.tiger || refs?.directInput || current.game === 'clouds') {
        pendingPoint = null;
        if (dragged && refs && (view.artReady(refs) || (refs.mogan || refs.tiger || refs.directInput || current.game === 'clouds') && refs.contentState === 'ready')) current = api.move(current, input);
        perform({ ...input, phase: 'release', dragged });
      } else if (dragged) { pendingPoint = null; current = api.release(api.move(current, input)); }
      else perform(input);
      pointer = null;
      if (surface.hasPointerCapture?.(event.pointerId)) surface.releasePointerCapture(event.pointerId);
      paint();
    });
    bindings.listen(surface, 'pointercancel', cancelGesture);
    bindings.listen(surface, 'lostpointercapture', event => { if (pointer?.id === event.pointerId) cancelGesture(); });
    bindings.listen(surface, 'blur', () => {
      if (current?.sling?.charge) cancelGesture();
      if (refs?.mountain || refs?.directInput) { cancelGesture(); return; }
      // Key-up may land on a toolbar button after Tab/click. Clear movement keys
      // without cancelling a shutter hold that just started on that button.
      if (current?.game?.startsWith('tiger-') && api.key) {
        const heldKeys = current.game === 'tiger-climb' ? ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter'] : ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        for (const key of heldKeys) {
          current = api.key(current, key, 'up') || current;
        }
        paint(); updateStatus();
      }
    });
    bindings.listen($('mini-retry'), 'click', retry);
    bindings.listen($('mini-sound'), 'click', async () => { await options.toggleSound(); updateStatus(); });
    bindings.listen($('art-actions'), 'click', event => {
      const button = (event.target as HTMLElement).closest?.<HTMLButtonElement>('button[data-action]');
      const name = button?.getAttribute('data-action'); if (button && !button.disabled && name) action(name);
    });
    for (const id of ['wugong-primary', 'wugong-secondary']) bindings.listen($(id), 'click', () => { const name = $(id).getAttribute('data-action'); if (name) action(name); });
    bindings.listen($('wugong-zoom-in'), 'click', () => action('zoom-in'));
    bindings.listen($('wugong-zoom-out'), 'click', () => action('zoom-out'));
  }
  bind();
  return {
    get state() { return current; },
    get active() { return current !== null; },
    get soundTheme() { return soundTheme(); },
    begin, finish, update, pause, retry, action,
    /** New typed adapters can be installed without adding a dispatch branch to app.js. */
    registerGame(ids: readonly string[], adapter: MiniApi) { for (const id of ids) registered.set(id, adapter); },
    destroy() { finish(false, false); bindings.destroy(); registered.clear(); },
  };
}
