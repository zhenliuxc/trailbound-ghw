import type { SceneManager, SceneSession } from './scene-manager';
import { wugongNearby } from './wugong-world';
import type { WugongStop } from './wugong-world';
import { WUGONG_REST_FILE, WUGONG_REST_WIDTH, WUGONG_REST_HEIGHT, WUGONG_REST_FRAMES } from './wugong-rest-art';

type VistaId = 'ridge' | 'summit' | 'clouds';
interface SketchPoint { x: number; y: number }
interface WugongStopsOptions {
  document: Document;
  host: HTMLElement;
  scenes: SceneManager;
  reduced: boolean;
  onChange(): void;
  onAction(action: 'rest' | 'photo' | 'sketch', checkpointId?: string): void;
}
export interface WugongStopsFrame {
  progress: number;
  elapsed: number;
  dt: number;
  blocked: boolean;
  walking: boolean;
  phaseTitle: string;
  unlockedPhotos: readonly string[];
  overview?: boolean;
}
type Presentation = { kind: 'stop' | 'sketch'; place: WugongStop; session: SceneSession; focus: HTMLElement | null }
  | { kind: 'vista'; id: VistaId; automatic: boolean; age: number; session: SceneSession; focus: HTMLElement | null };
const STOP_COPY = {
  camp: { invitation: '在营地坐一会儿', copy: '山路在这里缓下来。放下背包，陪草尖上的风坐一会儿。' },
  'view-rock': { invitation: '去观景石看看', copy: '在石边停一停。云海、沿途实景和一张小画，都可以慢慢看。' },
  summit: { invitation: '在金顶停一会儿', copy: '最后一段山路，金顶已在眼前。停下看看来时的山脊，再慢慢走到终点。' },
} satisfies Record<WugongStop['id'], { invitation: string; copy: string }>;
const VISTAS = {
  ridge: { title: '翻过山肩，云海展开', copy: '脚步停一下。风越过近处的草坡，远山在云间显出来。', art: 'scenes/wugong-cloudsea-v1.webp' },
  summit: { title: '金顶就在眼前', copy: '山路还剩最后一段。沿着风，望向走过的群山。', art: 'scenes/wugong-v1.webp' },
  clouds: { title: '在云边坐一会儿', copy: '云缓缓从山坳里流过，草尖接住了山脊上的风。', art: 'scenes/wugong-cloudsea-v1.webp' },
} satisfies Record<VistaId, { title: string; copy: string; art: string }>;
const OVERVIEW_POINTS = [{ x: 12, y: 72 }, { x: 48, y: 54 }, { x: 91, y: 60 }, { x: 132, y: 34 }, { x: 176, y: 26 }, { x: 212, y: 12 }];

/** Map stops own a pause session; photographs, games and rewards remain with the app. */
export function createWugongStops(options: WugongStopsOptions) {
  const { document, host, scenes, reduced, onChange, onAction } = options;
  function html<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, parent: HTMLElement) {
    const node = document.createElement(tag); node.className = className; parent.append(node); return node;
  }
  function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>, parent: Element) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    parent.append(node); return node;
  }
  const hud = html('section', 'wugong-map-hud', host);
  hud.setAttribute('aria-label', '武功山山路');
  const chapter = html('div', 'wugong-map-chapter', hud);
  const kicker = html('small', '', chapter); kicker.textContent = '武功山 · 中庵至金顶';
  const chapterTitle = html('strong', '', chapter); chapterTitle.textContent = '林间起步';
  const nearButton = html('button', 'wugong-near-stop', chapter); nearButton.type = 'button'; nearButton.hidden = true;
  const overview = html('figure', 'wugong-mini-overview', hud);
  const mini = svg('svg', { viewBox: '0 0 224 94', role: 'img', 'aria-label': '中庵至金顶全程概览' }, overview);
  const road = OVERVIEW_POINTS.map((point, index) => {
    const previous = OVERVIEW_POINTS[index - 1];
    if (!previous) return `M${point.x} ${point.y}`;
    const middle = (previous.x + point.x) / 2;
    return `C${middle} ${previous.y} ${middle} ${point.y} ${point.x} ${point.y}`;
  }).join(' ');
  svg('path', { d: road, fill: 'none', stroke: '#e9dfc3', 'stroke-width': '7', 'stroke-linecap': 'round' }, mini);
  svg('path', { d: road, fill: 'none', stroke: '#b19b73', 'stroke-width': '2.5', 'stroke-linecap': 'round' }, mini);
  for (const [x, y] of [[12, 72], [212, 12]]) svg('circle', { cx: String(x), cy: String(y), r: '3', fill: '#607e60' }, mini);
  const traveller = svg('circle', { cx: '12', cy: '72', r: '4', fill: '#9c7754', stroke: '#fffaf0', 'stroke-width': '2' }, mini);
  const miniLabels = ['林间', '石阶', '草甸', '山脊', '金顶'];
  for (const [index, label] of miniLabels.entries()) {
    const node = svg('text', { x: String(18 + index * 46), y: '91', 'text-anchor': 'middle' }, mini); node.textContent = label;
  }
  const caption = html('figcaption', '', overview); caption.textContent = '中庵 · 起点　→　金顶 · 终点';
  const overlay = html('section', 'wugong-stop-overlay', host); overlay.hidden = true;
  overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', '山路停留');
  let presentation: Presentation | null = null, latest: WugongStopsFrame | null = null;
  let nearby: WugongStop | null = null, lastProgress: number | null = null, disposed = false;
  let panelCleanup: (() => void) | null = null;
  let stopDrawing: (() => void) | null = null;
  const sketchStrokes: SketchPoint[][] = [];
  const seen = new Set<VistaId>(), pending = new Set<'ridge' | 'summit'>();

  function clearPanel() { panelCleanup?.(); panelCleanup = null; overlay.replaceChildren(); }
  function cleanup(callback: () => void) { const previous = panelCleanup; panelCleanup = () => { previous?.(); callback(); }; }
  function pose(parent: HTMLElement, kind: keyof typeof WUGONG_REST_FRAMES, className: string) {
    const frame = WUGONG_REST_FRAMES[kind];
    const crop = svg('svg', { viewBox: `${frame.x} ${frame.y} ${frame.width} ${frame.height}`, class: className, role: 'img', 'aria-label': kind === 'sit' ? '背包放在身旁，坐在石边的徒步小人' : '停在山脊上远眺的徒步小人' }, parent);
    const image = svg('image', { href: WUGONG_REST_FILE, width: String(WUGONG_REST_WIDTH), height: String(WUGONG_REST_HEIGHT) }, crop);
    const fail = () => { crop.style.display = 'none'; }; image.addEventListener('error', fail); cleanup(() => image.removeEventListener('error', fail));
    return crop;
  }
  function close(resume = true, notify = true, restoreFocus = true) {
    const previous = presentation; if (!previous) return;
    presentation = null; overlay.hidden = true; clearPanel();
    scenes.leave(previous.session, resume);
    if (notify && !disposed) onChange();
    if (restoreFocus && previous.focus?.isConnected) previous.focus.focus({ preventScroll: true });
  }
  function button(parent: HTMLElement, label: string, action: () => void, className = '') {
    const node = html('button', `wugong-stop-action ${className}`, parent); node.type = 'button'; node.textContent = label;
    node.onclick = action; return node;
  }
  function heading(card: HTMLElement, title: string, copy: string) {
    const closeButton = button(card, '×', () => close(), 'wugong-stop-close'); closeButton.setAttribute('aria-label', '回到山路');
    const eyebrow = html('small', 'wugong-stop-kicker', card); eyebrow.textContent = '山径 · 停一停';
    const titleNode = html('h2', '', card); titleNode.textContent = title;
    const paragraph = html('p', 'wugong-stop-copy', card); paragraph.textContent = copy;
    overlay.setAttribute('aria-label', title);
    return paragraph;
  }
  function handoff(action: 'photo', checkpointId: string) {
    if (!latest?.unlockedPhotos.includes(checkpointId)) return;
    close(false, false, false);
    onAction(action, checkpointId);
    if (!disposed) onChange();
  }
  function paintStop(place: WugongStop) {
    clearPanel(); overlay.className = 'wugong-stop-overlay';
    const card = html('div', 'wugong-stop-card', overlay);
    const copy = heading(card, place.title, STOP_COPY[place.id].copy);
    const camp = place.id === 'camp' ? html('div', 'wugong-camp-scene', card) : null;
    if (camp) { camp.hidden = true; pose(camp, 'sit', 'wugong-camp-person'); }
    const actions = html('div', 'wugong-stop-actions', card);
    if (place.id === 'camp') {
      const sit = button(actions, '放下背包，坐下休息', () => {
        sit.disabled = true; sit.textContent = '已经坐下，慢慢歇一会儿';
        if (camp) camp.hidden = false;
        card.setAttribute('data-resting', 'true'); copy.textContent = '坐在草甸边，背包靠在身旁。风慢慢穿过草尖，山路可以等一等。';
        onAction('rest'); if (!disposed) onChange();
      });
    } else {
      if (place.id === 'view-rock') button(actions, '看一会儿云海', () => {
        const previous = presentation; if (!previous) return;
        presentation = { kind: 'vista', id: 'clouds', automatic: false, age: 0, session: previous.session, focus: previous.focus };
        paintVista('clouds'); onChange();
      });
      const checkpointId = place.id === 'summit' ? 'wugong-golden' : 'wugong-clouds';
      const unlocked = latest?.unlockedPhotos.includes(checkpointId) ?? false;
      button(actions, unlocked ? '查看沿途真实照片' : '抵达金顶后解锁实景', () => handoff('photo', checkpointId)).disabled = !unlocked;
      button(actions, '画一笔，留住眼前风景', () => {
        const previous = presentation; if (!previous) return;
        presentation = { kind: 'sketch', place, session: previous.session, focus: previous.focus }; paintSketch(place); onChange();
      });
    }
    button(actions, '继续行走', () => close(), 'wugong-stop-continue');
  }
  function paintSketch(place: WugongStop) {
    clearPanel(); overlay.className = 'wugong-stop-overlay wugong-sketch';
    const card = html('div', 'wugong-stop-card wugong-sketch-card', overlay);
    const hint = heading(card, '把眼前山脊画下来', '按住鼠标或手指拖动画线。淡淡的山脊只是参考，可以自由画。这张草稿保留到本次路线重玩前。');
    hint.setAttribute('aria-live', 'polite');
    const canvas = html('canvas', 'wugong-sketch-paper', card); canvas.width = 960; canvas.height = 600; canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', '山脊速写纸，按住鼠标或手指拖动画线');
    let pen: { id: number; stroke: SketchPoint[] } | null = null;
    const tools = html('div', 'wugong-sketch-tools', card);
    const undo = button(tools, '撤回上一笔', () => { finish(); sketchStrokes.pop(); redraw(); });
    const erase = button(tools, '重新画', () => { finish(); sketchStrokes.splice(0); redraw(); });
    button(tools, '回到停留处', () => {
      const previous = presentation; if (!previous) return;
      presentation = { kind: 'stop', place, session: previous.session, focus: previous.focus }; paintStop(place); onChange();
    }, 'wugong-stop-continue');
    const context = canvas.getContext('2d');
    if (!context) { canvas.hidden = true; undo.disabled = true; erase.disabled = true; hint.textContent = '这台设备暂时无法打开速写纸。仍可以回到观景石看云海，或继续行走。'; return; }
    function redraw() {
      if (!context) return;
      context.clearRect(0, 0, 960, 600); context.fillStyle = '#fbf7e9'; context.fillRect(0, 0, 960, 600);
      context.lineCap = 'round'; context.lineJoin = 'round'; context.lineWidth = 1.5; context.strokeStyle = '#85927755';
      context.beginPath(); context.moveTo(55, 370); context.bezierCurveTo(160, 375, 210, 220, 315, 285); context.bezierCurveTo(405, 325, 485, 155, 560, 230); context.bezierCurveTo(660, 325, 750, 225, 905, 300); context.stroke();
      context.strokeStyle = '#526b59'; context.fillStyle = '#526b59'; context.lineWidth = 2.5;
      for (const stroke of sketchStrokes) {
        const first = stroke[0]; if (!first) continue;
        context.beginPath(); context.moveTo(first.x * 960, first.y * 600);
        for (const point of stroke.slice(1)) context.lineTo(point.x * 960, point.y * 600);
        if (stroke.length === 1) { context.arc(first.x * 960, first.y * 600, 1.25, 0, Math.PI * 2); context.fill(); } else context.stroke();
      }
      undo.disabled = sketchStrokes.length === 0; erase.disabled = sketchStrokes.length === 0;
    }
    function point(event: PointerEvent): SketchPoint {
      const rect = canvas.getBoundingClientRect();
      return { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) };
    }
    function canDraw() { return presentation?.kind === 'sketch' && !latest?.blocked && !document.hidden && scenes.isTop(presentation.session); }
    function finish() {
      const current = pen; pen = null;
      if (current && canvas.hasPointerCapture(current.id)) canvas.releasePointerCapture(current.id);
    }
    function down(event: PointerEvent) {
      if (pen || event.button !== 0 || !event.isPrimary || !canDraw()) return;
      event.preventDefault(); canvas.focus({ preventScroll: true });
      const stroke = [point(event)]; sketchStrokes.push(stroke); pen = { id: event.pointerId, stroke };
      canvas.setPointerCapture(event.pointerId); redraw();
    }
    function move(event: PointerEvent) {
      if (!pen || event.pointerId !== pen.id) return;
      if (!canDraw()) { finish(); return; } event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) { finish(); return; }
      const coalesced = event.getCoalescedEvents?.();
      for (const sample of coalesced?.length ? coalesced : [event]) {
        const next = point(sample), previous = pen.stroke.at(-1);
        if (!previous || Math.hypot(next.x - previous.x, next.y - previous.y) > .0008) pen.stroke.push(next);
      }
      redraw();
    }
    function end(event: PointerEvent) { if (pen?.id === event.pointerId) finish(); }
    function visibility() { if (document.hidden) finish(); }
    function key(event: KeyboardEvent) { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); undo.click(); } }
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move);
    const endEvents = ['pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave'] satisfies (keyof HTMLElementEventMap)[];
    for (const name of endEvents) canvas.addEventListener(name, end);
    canvas.addEventListener('keydown', key); document.addEventListener('visibilitychange', visibility); document.defaultView?.addEventListener('blur', finish);
    stopDrawing = finish;
    cleanup(() => {
      finish(); stopDrawing = null; canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move);
      for (const name of endEvents) canvas.removeEventListener(name, end);
      canvas.removeEventListener('keydown', key); document.removeEventListener('visibilitychange', visibility); document.defaultView?.removeEventListener('blur', finish);
    });
    redraw(); canvas.focus({ preventScroll: true });
  }
  function paintVista(id: VistaId) {
    clearPanel(); overlay.className = 'wugong-stop-overlay wugong-vista';
    overlay.setAttribute('data-vista', id); overlay.setAttribute('data-reduced', String(reduced));
    const landscape = html('div', 'wugong-vista-landscape', overlay);
    const image = html('img', 'wugong-vista-art', landscape); image.alt = ''; image.decoding = 'async';
    const failure = html('p', 'wugong-vista-error', landscape); failure.hidden = true;
    failure.textContent = '远景画作暂未加载。仍可以在这里停一会儿，或回到山路。';
    const failed = () => { if (disposed) return; image.hidden = true; failure.hidden = false; };
    image.addEventListener('error', failed); image.src = VISTAS[id].art;
    panelCleanup = () => image.removeEventListener('error', failed);
    html('div', 'wugong-vista-haze wugong-vista-haze-far', landscape);
    html('div', 'wugong-vista-haze wugong-vista-haze-near', landscape);
    const grass = html('img', 'wugong-vista-grass', landscape); grass.alt = '';
    grass.onerror = () => { grass.hidden = true; }; grass.src = 'sprites/wugong-meadow-grass-v1.webp';
    const previousCleanup = panelCleanup; panelCleanup = () => { previousCleanup?.(); grass.onerror = null; };
    pose(landscape, 'view', 'wugong-vista-person');
    const card = html('div', 'wugong-stop-card wugong-vista-caption', overlay);
    heading(card, VISTAS[id].title, VISTAS[id].copy);
    button(card, '回到山路', () => close(), 'wugong-stop-continue');
    const control = card.querySelector('button'); control?.focus({ preventScroll: true });
  }
  function openStop(place: WugongStop) {
    if (disposed || presentation || !latest || latest.blocked) return;
    const active = document.activeElement;
    presentation = { kind: 'stop', place, session: scenes.enter('photo'), focus: active instanceof HTMLElement ? active : null };
    overlay.hidden = false; nearButton.hidden = true; paintStop(place);
    overlay.querySelector('button')?.focus({ preventScroll: true }); onChange();
  }
  function openVista(id: 'ridge' | 'summit') {
    const active = document.activeElement;
    presentation = { kind: 'vista', id, automatic: true, age: 0, session: scenes.enter('photo'), focus: active instanceof HTMLElement ? active : null };
    seen.add(id); pending.delete(id); overlay.hidden = false; nearButton.hidden = true; paintVista(id); onChange();
  }
  function onNearby() { if (nearby) openStop(nearby); }
  function onKey(event: KeyboardEvent) {
    if (!presentation || !scenes.isTop(presentation.session)) return;
    event.stopPropagation();
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const controls = [...overlay.querySelectorAll<HTMLElement>('button:not(:disabled),canvas[tabindex]')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  nearButton.addEventListener('click', onNearby); overlay.addEventListener('keydown', onKey);

  function update(frame: WugongStopsFrame) {
    if (disposed) return; latest = frame;
    const progress = Math.max(0, Math.min(1, frame.progress));
    chapterTitle.textContent = frame.phaseTitle;
    overview.setAttribute('data-expanded', String(!!frame.overview));
    const portion = progress * (OVERVIEW_POINTS.length - 1), index = Math.min(OVERVIEW_POINTS.length - 2, Math.floor(portion));
    const a = OVERVIEW_POINTS[index], b = OVERVIEW_POINTS[index + 1];
    if (a && b) {
      const t = portion - index, u = 1 - t, middle = (a.x + b.x) / 2;
      const x = u * u * u * a.x + 3 * u * u * t * middle + 3 * u * t * t * middle + t * t * t * b.x;
      const y = (u * u * u + 3 * u * u * t) * a.y + (3 * u * t * t + t * t * t) * b.y;
      traveller.setAttribute('cx', String(x)); traveller.setAttribute('cy', String(y));
    }
    mini.setAttribute('aria-label', `中庵至金顶全程概览，已走${Math.round(progress * 100)}%`);
    for (const [id, gate] of [['ridge', .48], ['summit', .91]] satisfies [ 'ridge' | 'summit', number ][]) {
      if (lastProgress === null && progress >= gate) seen.add(id);
      else if (lastProgress !== null && lastProgress < gate && progress >= gate && !seen.has(id)) pending.add(id);
    }
    lastProgress = progress;
    if (presentation) {
      const current = presentation, paused = frame.blocked || !scenes.isTop(current.session);
      overlay.hidden = paused; overlay.setAttribute('data-frozen', String(paused));
      if (paused) stopDrawing?.();
      if (!paused && current.kind === 'vista') {
        current.age += Math.max(0, Math.min(.1, frame.dt));
        overlay.style.setProperty('--wugong-vista-clock', `${current.age.toFixed(3)}s`);
        if (current.automatic && !reduced && current.age >= 5) close();
      }
    } else if (!frame.blocked && frame.walking && !frame.overview) {
      const next = pending.values().next().value;
      if (next) openVista(next);
    }
    nearby = wugongNearby(progress);
    nearButton.hidden = frame.blocked || !!presentation || !!frame.overview || !nearby;
    if (nearby) nearButton.textContent = STOP_COPY[nearby.id].invitation;
    hud.setAttribute('data-blocked', String(frame.blocked || !!presentation));
  }
  function reset() {
    close(false, false, false); latest = null; nearby = null; lastProgress = null; seen.clear(); pending.clear();
    sketchStrokes.splice(0);
    nearButton.hidden = true; chapterTitle.textContent = '林间起步';
  }
  return {
    update, reset,
    openNearby: onNearby,
    get active() { return presentation !== null; },
    destroy() {
      if (disposed) return; disposed = true; reset();
      nearButton.removeEventListener('click', onNearby); overlay.removeEventListener('keydown', onKey);
      hud.remove(); overlay.remove();
    },
  };
}
