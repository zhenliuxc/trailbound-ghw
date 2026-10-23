import { clamp, createLandscape, createTrail, distance, parseTerrain, WalkModel, type Point, type VisitId } from './model';
import { WalkRenderer } from './renderer';
import { type CameraMode, type FrameProjection } from './camera';
import { VisitView } from './visits';
import { parseTimeSetting, parseWeatherSetting, SceneEnvironment } from './environment';
import { ArtOverlay } from '../journey/art-overlay';

function element(id: string): HTMLElement {
  const node = document.getElementById(id);
  if (!node) throw new Error(`武功山样段缺少界面元素：${id}`);
  return node;
}
function button(id: string): HTMLButtonElement {
  const node = element(id);
  if (!(node instanceof HTMLButtonElement)) throw new Error(`武功山样段按钮类型不正确：${id}`);
  return node;
}
const canvasNode = element('ww-canvas');
if (!(canvasNode instanceof HTMLCanvasElement)) throw new Error('武功山样段画布类型不正确');
const frame = element('ww-map'), markerLayer = element('ww-markers'), loading = element('ww-loading'), loadingText = element('ww-loading-text');
const retry = button('ww-retry'), primary = button('ww-walk'), resetButton = button('ww-reset'), soundButton = button('ww-sound');
const overviewButton = button('ww-view-overview'), followButton = button('ww-view-follow'), detailHint = element('ww-detail-hint');
const note = element('ww-note');
const environmentLabel = element('ww-environment-label'), conditions = element('ww-conditions');
const timeSetting = element('ww-time-setting'), weatherSetting = element('ww-weather-setting');
if (!(timeSetting instanceof HTMLSelectElement) || !(weatherSetting instanceof HTMLSelectElement)) throw new Error('山间景象选项无法读取');

const canvas = canvasNode;
const lifecycle = new AbortController();
const { signal } = lifecycle;
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let reduced = reducedQuery.matches, disposed = false;
let renderer: WalkRenderer | null = null, model: WalkModel | null = null;
let environment: SceneEnvironment | null = null, environmentKey = '';
let animation = 0, lastTime = 0, resizeTimer = 0, uiKey = '', firstReady = false;
let projection: FrameProjection | null = null, resizeVersion = 0, cameraUIKey = '';
let awaitingAutostart = new URLSearchParams(location.search).get('walk') === '1';
let sound = false, music: HTMLAudioElement | null = null, cloth: HTMLAudioElement | null = null;
let footsteps: HTMLAudioElement[] = [], footIndex = 0, audioToken = 0;
const markerNodes: { element: HTMLElement; point: Point; dx: number; dy: number; kind: 'start' | 'end' | VisitId }[] = [];
const stopNames: Record<VisitId, string> = { slope: '绝望坡', meadow: '高山草甸', camp: '观音宕 · 营地', horse: '吊马桩', summit: '金顶', end: '景区大门 · 终点' };
const art = new ArtOverlay(signal, () => {
  lastTime = 0; renderer?.suspend(document.hidden);
  if (!disposed && !document.hidden) {
    if (!animation) animation = requestAnimationFrame(frameLoop);
    if (sound && model?.mode.kind !== 'visiting') void music?.play().catch(() => {});
  }
}, 'ww');
function openArt(entry?: string, place?: string): void {
  if (disposed || art.open) return;
  cancelAnimationFrame(animation); animation = 0; lastTime = 0;
  renderer?.suspend(true); music?.pause(); cloth?.pause(); for (const foot of footsteps) foot.pause();
  heldKey = ''; art.show(entry, place);
}
button('ww-journal').addEventListener('click', () => openArt(), { signal });
const visitView = new VisitView(continueWalk => {
  model?.closeVisit(continueWalk); updateUI();
  if (sound && !document.hidden) void music?.play().catch(() => {});
}, signal);
let showingVisit = false;

const icons = {
  start: '<path class="ww-icon-wash" d="M7 15 16 8l9 7v11H7Z"/><path d="m4 15 12-9 12 9M7 14v12h18V14M13 26v-8h6v8M8 11V7h4M4 27h24"/><path class="ww-icon-light" d="M10 16h2m8 0h2"/>',
  slope: '<path class="ww-icon-wash" d="m4 26 8-11 5 4 7-12 5 19Z"/><path d="M4 27h24M5 24l7-9 5 4 7-12M9 25h5v-4h5v-4h5v-4h4"/><path class="ww-icon-gold" d="M6 7h5M8.5 4.5v5"/>',
  meadow: '<path class="ww-icon-wash" d="M4 26Q13 17 28 24v3H4Z"/><path d="M4 27h24M10 26Q10 17 5 14M11 25q0-14 5-17M15 26q1-8 8-12M21 26q-1-5 4-8"/><path class="ww-icon-light" d="M5 19q4-1 6 3M16 17q4-3 7-3"/><circle class="ww-icon-gold" cx="24" cy="7" r="2.5"/>',
  camp: '<path class="ww-icon-wash" d="m4 26 12-19 12 19Z"/><path d="m4 26 12-19 12 19H4Zm8 0 4-10 4 10M16 7l-2-3M16 7l3-3M2 28h28"/><path class="ww-icon-gold" d="M25 3q-4 2-1 5-6-1-4-5M6 6v4M4 8h4"/>',
  horse: '<path class="ww-icon-wash" d="M5 7h19l4 4-4 4H5ZM8 18h17v7H8l-4-3.5Z"/><path d="M16 4v25M5 7h19l4 4-4 4H5V7Zm3 11h17v7H8l-4-3.5L8 18Z"/><path class="ww-icon-light" d="M9 11h10M11 22h10"/>',
  summit: '<path class="ww-icon-wash" d="m3 27 10-17 6 9 4-6 7 14Z"/><path d="m3 27 10-17 6 9 4-6 7 14H3ZM13 10V3l10 3-10 3M9 17l4 3 3-2"/><path class="ww-icon-gold" d="m13 3 10 3-10 3"/>',
  end: '<path class="ww-icon-wash" d="M6 13h20v4H6Zm2 4h4v10H8Zm12 0h4v10h-4Z"/><path d="M4 13 16 6l12 7H4Zm2 4h20M8 17v10M12 17v10M20 17v10M24 17v10M4 28h24"/><path class="ww-icon-gold" d="M16 9v4"/>',
};

function prepareAudio(): void {
  if (music) return;
  music = new Audio('audio/wugong-reverie-v1.mp3'); music.loop = true; music.preload = 'auto'; music.volume = .14;
  cloth = new Audio('audio/wugong-cloth-v1.mp3'); cloth.preload = 'auto'; cloth.volume = .15;
  footsteps = [1, 2, 3, 1, 2, 3].map(i => { const audio = new Audio(`audio/wugong-step-${i}-v1.mp3`); audio.preload = 'auto'; audio.volume = .13; return audio; });
}
async function toggleSound(): Promise<void> {
  const token = ++audioToken;
  if (sound) { sound = false; music?.pause(); for (const foot of footsteps) foot.pause(); cloth?.pause(); soundButton.textContent = '声音 · 关'; soundButton.setAttribute('aria-pressed', 'false'); return; }
  prepareAudio();
  soundButton.disabled = true;
  try {
    await music?.play();
    if (token !== audioToken || disposed || document.hidden) { music?.pause(); return; }
    sound = true; soundButton.textContent = '声音 · 开'; soundButton.setAttribute('aria-pressed', 'true');
    if (model?.mode.kind === 'visiting') music?.pause();
  } catch { sound = false; soundButton.textContent = '声音 · 重试'; soundButton.setAttribute('aria-pressed', 'false'); }
  finally { if (!disposed) soundButton.disabled = false; }
}
function playFootsteps(count: number): void {
  if (!sound || document.hidden || !model?.moving || !footsteps.length || count < 1) return;
  const foot = footsteps[footIndex++ % footsteps.length];
  if (foot.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;
  foot.currentTime = 0; foot.volume = model.stage === 'forest' ? .14 : .09;
  void foot.play().catch(() => {});
}
function updateUI(): void {
  if (!model) return;
  const key = `${model.mode.kind}:${model.stage}:${model.incline}:${model.section}`;
  if (uiKey === key) return;
  const wasUnpacking = uiKey.startsWith('unpacking:'); uiKey = key;
  const mode = model.mode;
  element('ww-title').textContent = model.section === 'ridge' ? '越过山脊，再慢慢下山。' : '从东江村，走过武功山。';
  element('ww-subtitle').textContent = model.section === 'ridge' ? '2天1夜 · 第二天越过山脊' : '2天1夜 · 观音宕过夜，再越过山脊';
  primary.disabled = !firstReady || ['visiting', 'stopping', 'arriving', 'unpacking', 'sitting', 'standing', 'packing'].includes(mode.kind);
  if (mode.kind === 'ready') { primary.textContent = '沿山路出发 →'; note.textContent = model.section === 'ridge' ? '从营地出发，越过金顶，再从景区下山。' : '点山路或起点出发，先沿着山路走到营地。'; }
  else if (mode.kind === 'walking') {
    primary.textContent = '停下来看看';
    note.textContent = model.stage === 'forest' ? '树影落在山路上，慢慢往上走。' : model.stage === 'meadow' ? '走出林缘，顺着草甸转过这个弯。' : model.stage === 'camp' && model.travel < model.trail.campTravel ? '营地就在路边，放慢脚步。' : model.stage === 'end' ? '景区大门就在前面，这一程快走完了。' : model.stage === 'descent' ? '沿景区山路慢慢下山，脚步放稳，山顶渐渐留在身后。' : model.incline === 'uphill' ? '沿山肩往上走，步子放小，山谷慢慢落到身后。' : model.incline === 'downhill' ? '顺着草坡下到鞍部，放慢脚步，下一段山脊就在前面。' : '山脊在脚下延伸，前方还要越过几道山肩。';
  } else if (mode.kind === 'stopping') { primary.textContent = '稳住脚步…'; note.textContent = '收住脚步，站稳后看看这里的风景。'; }
  else if (mode.kind === 'paused') { primary.textContent = '继续走 →'; note.textContent = '停一会儿，看看山坡和远处的沟谷。'; }
  else if (mode.kind === 'visiting') { primary.textContent = '正在看景点'; note.textContent = '到达了，看看这里的实景与故事。'; }
  else if (mode.kind === 'arriving') { primary.textContent = '在营地停稳…'; note.textContent = '到营地了，先站稳，松开肩上的背包。'; }
  else if (mode.kind === 'unpacking') {
    primary.textContent = '放下背包…'; note.textContent = '把背包放在石头旁边。';
    if (!wasUnpacking && sound && cloth && cloth.readyState >= 3) { cloth.currentTime = 0; void cloth.play().catch(() => {}); }
  } else if (mode.kind === 'sitting') { primary.textContent = '慢慢坐下…'; note.textContent = '在营地边的观景石上坐下来。'; }
  else if (mode.kind === 'resting') { primary.textContent = '次日，走向金顶 →'; note.textContent = '背包放在脚边。歇好后，继续越过山脊。'; }
  else if (mode.kind === 'standing') { primary.textContent = '慢慢起身…'; note.textContent = '从观景石上起身，准备继续走。'; }
  else if (mode.kind === 'packing') { primary.textContent = '背好背包…'; note.textContent = '背好背包，沿着山脊走向吊马桩。'; }
  else if (mode.kind === 'summit') { primary.textContent = '沿景区下山 →'; note.textContent = '到金顶了。看看远山，再顺着景区山路下到大门。'; }
  else { primary.textContent = '再走一遍 →'; note.textContent = '到景区大门了。这一程完整走完，回望刚刚越过的山脊。'; }
  resetButton.hidden = mode.kind === 'ready' || mode.kind === 'finished';
  for (const marker of markerNodes) {
    marker.element.classList.toggle('is-reached', marker.kind === 'start' ? model.section === 'forest' && model.travel > 0 : model.hasVisited(marker.kind));
  }
}
function updateVisit(): void {
  const visiting = model?.mode.kind === 'visiting';
  if (visiting && !showingVisit) { music?.pause(); cloth?.pause(); for (const foot of footsteps) foot.pause(); heldKey = ''; }
  showingVisit = visiting;
  visitView.sync(model?.mode.kind === 'visiting' ? model.mode.id : null);
}
function updateEnvironmentUI(): void {
  if (!environment) return;
  const frame = environment.frame;
  if (frame.label === environmentKey) return;
  environmentKey = frame.label; environmentLabel.textContent = frame.label;
  conditions.dataset.weather = frame.night > .5 ? 'night' : frame.weather;
}
function updateCameraUI(): void {
  if (!renderer) return;
  const mode = renderer.cameraMode, status = renderer.detailStatus === 'fallback' ? 'fallback' : mode === 'follow' ? renderer.detailStatus : 'ready';
  const key = `${mode}:${status}:${firstReady}`;
  if (key === cameraUIKey) return;
  cameraUIKey = key;
  overviewButton.disabled = !firstReady; followButton.disabled = !firstReady;
  overviewButton.setAttribute('aria-pressed', String(mode === 'overview')); followButton.setAttribute('aria-pressed', String(mode === 'follow'));
  frame.dataset.view = mode;
  detailHint.hidden = status === 'ready';
  detailHint.textContent = status === 'fallback' ? '细节暂未展开，仍可继续行走' : '山路细节正在展开…';
}
function changeCamera(mode: CameraMode): void {
  if (!renderer || !firstReady) return;
  renderer.setCameraMode(mode); updateCameraUI();
}
function placeMarkers(current: FrameProjection): void {
  for (const marker of markerNodes) {
    const labelScale = clamp(current.scale, .52, 1);
    const placement = current.marker(marker.point, current.mode === 'follow' ? { x: Math.sign(marker.dx) * 68, y: -25 } : { x: marker.dx * labelScale, y: marker.dy * labelScale });
    marker.element.hidden = placement.kind === 'hidden';
    if (placement.kind === 'visible') {
      marker.element.style.left = `${placement.point.x}px`; marker.element.style.top = `${placement.point.y}px`;
    }
  }
}
function mountMarkers(walk: WalkModel): void {
  const trail = walk.trail;
  const definitions = [
    { kind: 'start', name: '东江村 · 起点', point: trail.start, dx: -29, dy: 25, icon: icons.start, action: () => { walk.reset('forest'); environment?.reset(walk); walk.walkTo(); } },
    ...trail.stops.map(stop => ({ kind: stop.id, name: stopNames[stop.id], point: stop.point, dx: stop.id === 'camp' || stop.id === 'summit' ? 31 : stop.id === 'meadow' ? -15 : -34, dy: stop.id === 'camp' ? -62 : stop.id === 'meadow' ? -82 : stop.id === 'horse' ? 44 : -48, icon: icons[stop.id], action: () => { if (walk.hasVisited(stop.id)) walk.openVisit(stop.id); else walk.walkTo(stop.travel); } })),
  ] satisfies { kind: 'start' | VisitId; name: string; point: Point; dx: number; dy: number; icon: string; action: () => void }[];
  for (const stop of definitions) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'ww-marker'; button.dataset.stop = stop.kind;
    button.setAttribute('aria-label', stop.name); button.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true">${stop.icon}</svg>`;
    button.addEventListener('click', () => { if (!firstReady) return; stop.action(); uiKey = ''; updateUI(); updateVisit(); }, { signal });
    markerLayer.append(button); markerNodes.push({ ...stop, element: button });
  }
}
async function resize(): Promise<void> {
  if (!renderer || disposed) return;
  const box = frame.getBoundingClientRect();
  if (box.width <= 0 || box.height <= 0) return;
  const version = ++resizeVersion;
  try { await renderer.resize(box.width, box.height, signal); }
  catch (error) { if (version === resizeVersion) throw error; return; }
  if (disposed || version !== resizeVersion) return;
  if (!firstReady) {
    firstReady = true; loading.hidden = true;
    if (awaitingAutostart && !document.hidden) { model?.walkTo(); awaitingAutostart = false; }
    uiKey = ''; updateUI();
  }
  if (model && environment) { projection = renderer.paint(model, environment.frame, reduced); placeMarkers(projection); updateEnvironmentUI(); }
  updateCameraUI();
}
function frameLoop(now: number): void {
  if (disposed || document.hidden || art.open) { animation = 0; return; }
  const dt = lastTime ? Math.min(.05, Math.max(0, (now - lastTime) / 1000)) : 0; lastTime = now;
  if (model && renderer && environment && firstReady) {
    model.tick(dt); environment.advance(dt, model); playFootsteps(model.takeContacts()); projection = renderer.paint(model, environment.frame, reduced, dt);
    placeMarkers(projection); updateUI(); updateCameraUI(); updateVisit();
    updateEnvironmentUI();
  }
  animation = requestAnimationFrame(frameLoop);
}
function restart(): void { if (!model) return; model.reset(); environment?.reset(model); model.walkTo(); uiKey = ''; updateUI(); updateEnvironmentUI(); }
primary.addEventListener('click', () => { if (!model) return; if (model.mode.kind === 'finished') restart(); else model.toggle(); updateUI(); }, { signal });
resetButton.addEventListener('click', restart, { signal });
soundButton.addEventListener('click', () => { void toggleSound(); }, { signal });
overviewButton.addEventListener('click', () => changeCamera('overview'), { signal });
followButton.addEventListener('click', () => changeCamera('follow'), { signal });
retry.addEventListener('click', () => location.reload(), { signal });
timeSetting.addEventListener('change', () => { environment?.setTime(parseTimeSetting(timeSetting.value)); }, { signal });
weatherSetting.addEventListener('change', () => { environment?.setWeather(parseWeatherSetting(weatherSetting.value)); }, { signal });
canvas.addEventListener('pointerup', event => {
  if (!projection || !model || !firstReady || model.mode.kind === 'visiting' || event.button > 0) return;
  const box = canvas.getBoundingClientRect();
  if (!box.width || !box.height) return;
  const at = projection.sceneFromCanvas({ x: (event.clientX - box.left) * projection.width / box.width, y: (event.clientY - box.top) * projection.height / box.height });
  if (distance(at, model.point) < projection.sceneRadius(23) && model.mode.kind === 'walking') model.pause();
  else { const target = model.trail.nearest(at); if (target.gap < projection.sceneRadius(25)) model.walkTo(target.travel > model.trail.length - 28 ? model.trail.length : target.travel); }
  updateUI();
}, { signal });
let heldKey = '';
document.addEventListener('keydown', event => {
  if (!model || !firstReady || art.open || model.mode.kind === 'visiting' || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement) return;
  if (event.code === 'Space' && (event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement)) return;
  if (event.code === 'Space' || event.code === 'Escape') { event.preventDefault(); if (!event.repeat) { if (event.code === 'Escape') model.pause(); else model.toggle(); updateUI(); } }
  else if (['ArrowUp', 'ArrowRight', 'KeyW', 'KeyD', 'ArrowDown', 'ArrowLeft', 'KeyS', 'KeyA'].includes(event.code)) {
    event.preventDefault(); heldKey = event.code;
    model.walkTo(['ArrowDown', 'ArrowLeft', 'KeyS', 'KeyA'].includes(event.code) ? 0 : model.trail.length); updateUI();
  }
}, { signal });
document.addEventListener('keyup', event => { if (heldKey === event.code) { heldKey = ''; model?.pause(); updateUI(); } }, { signal });
document.addEventListener('visibilitychange', () => {
  lastTime = 0;
  renderer?.suspend(document.hidden);
  if (document.hidden) { model?.pause(); cancelAnimationFrame(animation); animation = 0; music?.pause(); cloth?.pause(); for (const foot of footsteps) foot.pause(); heldKey = ''; updateUI(); }
  else {
    if (firstReady && awaitingAutostart && model?.mode.kind === 'ready') { model.walkTo(); awaitingAutostart = false; }
    if (!art.open) { if (!animation) animation = requestAnimationFrame(frameLoop); if (sound && model?.mode.kind !== 'visiting') void music?.play().catch(() => {}); }
  }
}, { signal });
reducedQuery.addEventListener('change', () => { reduced = reducedQuery.matches; }, { signal });
const observer = new ResizeObserver(() => { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(() => { void resize().catch(showError); }, 110); });
function showError(error: unknown): void {
  if (disposed || signal.aborted) return;
  loading.hidden = false; loadingText.textContent = error instanceof Error ? error.message : '山形暂时未能展开'; retry.hidden = false; primary.disabled = true;
}
async function start(): Promise<void> {
  const response = await fetch('scenes/wugong-relief-height-v2.json', { signal });
  if (!response.ok) throw new Error('山体数据暂时未能加载，请重新展开山路');
  const payload: unknown = await response.json();
  if (disposed) return;
  const landscape = createLandscape(parseTerrain(payload)), trail = createTrail(landscape);
  const section = new URLSearchParams(location.search).get('section') === 'ridge' ? 'ridge' : 'forest';
  model = new WalkModel(trail, section); environment = new SceneEnvironment(model); renderer = new WalkRenderer(canvas, landscape, trail); mountMarkers(model);
  await resize();
  if (disposed) return;
  observer.observe(frame); if (!animation && !document.hidden) animation = requestAnimationFrame(frameLoop);
}
window.addEventListener('pagehide', event => {
  if (event.persisted) { model?.pause(); renderer?.suspend(true); cancelAnimationFrame(animation); animation = 0; lastTime = 0; music?.pause(); cloth?.pause(); for (const foot of footsteps) foot.pause(); updateUI(); return; }
  disposed = true; audioToken++; lifecycle.abort(); observer.disconnect(); cancelAnimationFrame(animation); window.clearTimeout(resizeTimer);
  visitView.destroy(); art.dispose(); renderer?.destroy(); music?.pause(); cloth?.pause(); for (const foot of footsteps) foot.pause();
}, { signal });
window.addEventListener('pageshow', event => {
  if (event.persisted && !disposed) { lastTime = 0; renderer?.suspend(document.hidden || art.open); if (!animation && !document.hidden && !art.open) animation = requestAnimationFrame(frameLoop); updateUI(); }
}, { signal });
void start().catch(showError);
