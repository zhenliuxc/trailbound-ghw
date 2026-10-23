import { clamp, distance } from '../model';
import { ArtOverlay } from '../art-overlay';
import { VisitView } from '../visits';
import { parseTimeSetting, parseWeatherSetting, SceneEnvironment } from '../environment';
import { ScrollJourney } from './journey';
import { ScrollScene } from './scene';
import { STAGES, ScrollTrail, type ScrollStopId } from './route';
import { overviewMarkers } from './markers';
import type { ScrollProjection, ScrollView } from './camera';
import type { TrailEventId } from './events';
import { CampNight } from './camp-night';
import { rememberCampStars, rememberKeepsake } from './camp-journal';
import { FOREST_LEAVES_ID, HOMEWARD_PAGES_ID } from './keepsake-games';
import { TrailKeepsakes } from './trail-keepsakes';
import { TrailSoundscape } from './soundscape';
import { DISCOVERY_SCENES, DiscoveryTransition } from './discovery-transition';
import { createCharacterPicker } from '../../characters/picker';

function node(id: string): HTMLElement {
  const element = document.getElementById(id); if (!element) throw new Error(`山路界面缺少：${id}`); return element;
}
function button(id: string): HTMLButtonElement {
  const element = node(id); if (!(element instanceof HTMLButtonElement)) throw new Error(`山路按钮无法读取：${id}`); return element;
}
const canvasNode = node('ww-canvas');
if (!(canvasNode instanceof HTMLCanvasElement)) throw new Error('山路画布无法读取');
const canvas = canvasNode, map = node('ww-map'), loading = node('ww-loading'), message = node('ww-loading-text');
const primary = button('ww-walk'), reset = button('ww-reset'), soundButton = button('ww-sound'), reopen = button('ww-reopen');
const overview = button('ww-view-overview'), follow = button('ww-view-follow');
const note = node('ww-note'), chapter = node('ww-chapter'), environmentLabel = node('ww-environment-label'), conditions = node('ww-conditions');
const tripDay = node('ww-trip-day'), nightCard = node('ww-night'), nightTitle = node('ww-night-title'), nightCopy = node('ww-night-copy');
const time = node('ww-time-setting'), weather = node('ww-weather-setting');
if (!(time instanceof HTMLSelectElement) || !(weather instanceof HTMLSelectElement)) throw new Error('山间景象选项无法读取');
const lifecycle = new AbortController(), { signal } = lifecycle;
const campPreview = new URLSearchParams(location.search).get('section') === 'camp-night';
const trail = new ScrollTrail(), journey = new ScrollJourney(trail, campPreview ? 'camp-night' : 'full'), environment = new SceneEnvironment(journey);
const scene = new ScrollScene(canvas, trail);
const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
let reduced = reducedQuery.matches, disposed = false, ready = false, animation = 0, lastTime = 0;
let projection: ScrollProjection | null = null, uiKey = '', weatherKey = '', resizeTimer = 0;
let autostart = new URLSearchParams(location.search).get('walk') === '1';
let sound = false, audioToken = 0, dialogKey = '';
const soundscape = new TrailSoundscape();
const discovery = new DiscoveryTransition(map, signal, DISCOVERY_SCENES);
let nearestStop: ScrollStopId | null = null;
let activeEvent: TrailEventId | null = null;

function pauseAudio(): void { soundscape.pause(); }
function resumeAudio(): void { if (sound && !document.hidden && !art.open && !camp.open && !keepsakes.open && !characterPicker.open && journey.mode.kind !== 'visiting' && journey.mode.kind !== 'encounter') soundscape.resume(); }
function ensureLoop(): void { if (ready && !disposed && !document.hidden && !art.open && !camp.open && !keepsakes.open && !characterPicker.open && !animation) animation = requestAnimationFrame(tick); }
const keepsakes = new TrailKeepsakes({ signal,
  onClose(result) {
    if (journey.mode.kind === 'encounter' && (journey.mode.id === 'leaves' || journey.mode.id === 'return')) {
      if (result.collected) journey.collectEvent(journey.mode.id);
      journey.closeEncounter(result.continueWalk);
    }
    uiKey = ''; updateUI(); updateVisit(); lastTime = 0; ensureLoop(); resumeAudio();
  },
  onCollect(id, capture) {
    let storage: Storage | null = null; try { storage = localStorage; } catch { /* Saving reports failure while retaining existing memories. */ }
    return rememberKeepsake(window.TrailDiscoveries, window.TrailJournal, storage, id, capture, environment.frame.weather);
  },
  onCue(cue) { soundscape.cue(cue); },
});
const camp = new CampNight({ signal,
  onClose(result) {
    if (journey.mode.kind === 'encounter' && journey.mode.id === 'stars') {
      if (result.collected) journey.collectEvent('stars');
      journey.closeEncounter(false); if (result.sleep) journey.sleep();
    }
    uiKey = ''; updateUI(); updateVisit(); lastTime = 0; ensureLoop(); resumeAudio();
  },
  onCollect(capture) {
    let storage: Storage | null = null; try { storage = localStorage; } catch { /* Save reports the unavailable storage without losing old records. */ }
    return rememberCampStars(window.TrailDiscoveries, window.TrailJournal, storage, capture);
  },
  onSound() { void toggleSound(); },
});
const art = new ArtOverlay(signal, result => {
  const event = activeEvent; activeEvent = null;
  if (event && journey.mode.kind === 'encounter' && journey.mode.id === event) {
    if (result.collected > 0) journey.collectEvent(event);
    journey.closeEncounter(result.collected > 0);
  }
  uiKey = ''; updateUI(); updateVisit(); lastTime = 0; ensureLoop(); resumeAudio();
}, 'ww', { soft: true });
const characterPicker = createCharacterPicker({ trigger: button('ww-character'), signal,
  current: () => scene.character,
  beforeOpen() {
    if (!ready || disposed || art.open || camp.open || keepsakes.open || discovery.pending || journey.mode.kind === 'visiting' || journey.mode.kind === 'encounter') return false;
    journey.pause(); cancelAnimationFrame(animation); animation = 0; lastTime = 0; pauseAudio(); updateUI(); return true;
  },
  apply: (id, selectionSignal) => scene.setCharacter(id, selectionSignal),
  afterClose() { if (disposed) return; lastTime = 0; resize(); uiKey = ''; updateUI(); ensureLoop(); resumeAudio(); },
});
function openArt(entry?: string, place?: string, event: TrailEventId | null = null): void {
  if (!ready || disposed || discovery.pending || art.open || camp.open || keepsakes.open) return;
  activeEvent = event;
  cancelAnimationFrame(animation); animation = 0; lastTime = 0; pauseAudio(); art.show(entry, place);
}
const visits = new VisitView(continueWalk => {
  if (journey.mode.kind !== 'visiting') return;
  journey.closeVisit(continueWalk); uiKey = ''; updateUI(); resumeAudio();
}, signal);
button('ww-journal').addEventListener('click', () => openArt(), { signal });

const icons = {
  start: '<path d="M7 26V14L16 7l9 7v12M5 15l11-9 11 9M13 26v-7h6v7M5 27h22"/>',
  meadow: '<path d="M5 26q8-5 22 0M10 23Q11 14 7 10M16 24Q15 13 21 8M21 23q1-7 6-9M16 17q-5-6-8-4"/><circle class="ww-icon-gold" cx="25" cy="7" r="2"/>',
  camp: '<path d="m5 26 11-18 11 18H5Zm7 0 4-10 4 10M4 28h24"/><path class="ww-icon-gold" d="M25 4a4 4 0 0 0 3 6 5 5 0 1 1-3-6Z"/>',
  slope: '<path d="m4 25 9-15 6 8 5-10 5 17M8 27h6v-5h6v-5h5"/>',
  horse: '<path d="M16 7v21M6 8h17l4 4-4 4H6V8ZM7 21h17M10 25h14"/>',
  summit: '<path d="m4 27 8-12 5 7 5-10 7 15H4ZM22 12V4l7 3-7 2M10 19l2 2 2-2"/>',
  end: '<path d="M7 27V12m18 15V12M4 12q12-8 24 0M7 14h18M11 19h10M10 27h12"/><path class="ww-icon-gold" d="m13 23 2 2 4-5"/>',
};
const markerLayer = node('ww-markers');
const leaders = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); leaders.classList.add('ww-marker-leaders'); leaders.setAttribute('aria-hidden', 'true'); markerLayer.append(leaders);
const pinNames: Record<ScrollStopId, string> = { start: '东江村', slope: '绝望坡', meadow: '高山草甸', camp: '观音宕营地', horse: '吊马桩', summit: '金顶', end: '景区大门' };
const markers = trail.stops.map(stop => {
  const marker = document.createElement('button'); marker.type = 'button'; marker.className = 'ww-marker'; marker.dataset.stop = stop.id;
  marker.dataset.kind = 'photo';
  marker.setAttribute('aria-label', `实景打卡 · ${stop.name}`);
  marker.innerHTML = `<span class="ww-pin"><svg viewBox="0 0 32 32" aria-hidden="true">${icons[stop.id]}</svg></span><span class="ww-marker-name">${pinNames[stop.id]}</span>`;
  const leader = document.createElementNS('http://www.w3.org/2000/svg', 'path'); leaders.append(leader);
  marker.addEventListener('click', () => {
    if (!ready || discovery.pending) return;
    if (journey.hasVisited(stop.id)) journey.openVisit(stop.id);
    else journey.walkTo(stop.travel);
    uiKey = ''; updateUI(); updateVisit();
  }, { signal });
  markerLayer.append(marker); return { ...stop, element: marker, leader };
});
function positionMarkers(p: ScrollProjection): void {
  discovery.position(p.toScreen(journey.point), p.width, p.height);
  const layout = overviewMarkers(markers.map(marker => ({ id: marker.id, at: p.toScreen(marker.point) })), p.width, p.height);
  for (const marker of markers) {
    const at = p.toScreen(marker.point), close = Math.abs(marker.travel - journey.travel) < 210;
    const place = layout.find(item => item.id === marker.id);
    const x = scene.mode === 'overview' && place ? place.x : clamp(at.x - 30, 48, p.width - 48), y = scene.mode === 'overview' && place ? place.y : at.y - Math.max(140, 54 * p.scale + 64);
    marker.element.hidden = scene.mode === 'follow' && (!close || x < 25 || x > p.width - 25 || y < 75 || y > p.height - 30);
    marker.element.style.left = `${x}px`; marker.element.style.top = `${y}px`;
    marker.element.classList.toggle('is-reached', journey.hasVisited(marker.id));
    marker.leader.style.display = marker.element.hidden ? 'none' : '';
    const endY = y + (y < at.y ? 16 : -16);
    marker.leader.setAttribute('d', `M${at.x},${at.y}Q${x},${at.y} ${x},${endY}`);
  }
}
function updateUI(): void {
  const pose = journey.pose, key = `${journey.day}:${journey.mode.kind}:${journey.stage}:${scene.mode}:${ready}:${journey.collections}`;
  nearestStop = trail.stops.find(stop => journey.hasVisited(stop.id) && Math.abs(stop.travel - journey.travel) < 95)?.id ?? null;
  reopen.hidden = !nearestStop || journey.mode.kind === 'visiting';
  reopen.textContent = '再看照片';
  reset.hidden = pose.kind !== 'finished'; reset.textContent = '再走一次';
  nightCard.hidden = pose.kind !== 'sleeping' && pose.kind !== 'waking';
  nightTitle.textContent = pose.kind === 'waking' ? '清晨，山醒来了' : '在观音宕，住一晚';
  nightCopy.textContent = pose.kind === 'waking' ? '露水还在草尖上，收拾背包，向金顶出发。' : '住进帐篷，听山风慢慢安静下来。';
  if (key === uiKey) return; uiKey = key;
  map.dataset.stage = journey.stage; map.dataset.pose = pose.kind; map.dataset.view = scene.mode; map.dataset.day = String(journey.day);
  follow.setAttribute('aria-pressed', String(scene.mode === 'follow')); overview.setAttribute('aria-pressed', String(scene.mode === 'overview'));
  follow.disabled = overview.disabled = !ready;
  primary.disabled = !ready || ['stopping', 'visiting', 'encounter', 'arriving', 'unpacking', 'sitting', 'sleeping', 'waking', 'standing', 'packing'].includes(journey.mode.kind) || (pose.kind === 'resting' && !journey.canSleep);
  chapter.textContent = `第${journey.day === 1 ? '一' : '二'}天 / ${STAGES[journey.stage].label}`;
  tripDay.textContent = `武功山 · 东江村经典反穿 / ${journey.day === 1 ? '第一天 · 向营地' : '第二天 · 经金顶下山'}`;
  if (pose.kind === 'ready') { primary.textContent = campPreview ? '走到观音宕营地 →' : '从东江村出发 →'; note.textContent = campPreview ? '从营地前的一段山路开始，坐下、看星星，在这里住一晚。' : '第一天走到观音宕过夜，第二天经金顶下到景区大门。'; }
  else if (pose.kind === 'walking') {
    primary.textContent = '停下来看看';
    note.textContent = journey.day === 2 && journey.stage === 'camp' ? '清晨离开观音宕，沿山脊向吊马桩和金顶出发。' : journey.stage === 'summit' && journey.travel >= trail.summitTravel ? '离开金顶，沿景区石阶慢慢下山。' : STAGES[journey.stage].thought;
  } else if (pose.kind === 'paused') { primary.textContent = '继续走 →'; note.textContent = '停下来看看山，准备好再继续走。'; }
  else if (pose.kind === 'arriving' || pose.kind === 'stopping') { primary.textContent = '停稳脚步…'; note.textContent = journey.stage === 'camp' ? '到了。先站稳，再慢慢放下背包。' : '到了，停下来看看这里的实景。'; }
  else if (pose.kind === 'unpacking') { primary.textContent = '放下背包…'; note.textContent = '把背包放在石头旁，松一松肩膀。'; }
  else if (pose.kind === 'sitting') { primary.textContent = '坐一会儿…'; note.textContent = '在营地边的石头上，慢慢坐下来。'; }
  else if (pose.kind === 'resting') { primary.textContent = journey.canSleep ? '在观音宕过夜 →' : '坐着歇一会儿…'; note.textContent = '坐下喝口水。今晚住在这里，明早继续往金顶走。'; }
  else if (pose.kind === 'sleeping') { primary.textContent = '在营地休息…'; note.textContent = '帐篷里的灯慢慢暗下来，这一晚留给山风。'; }
  else if (pose.kind === 'waking' || pose.kind === 'standing' || pose.kind === 'packing') { primary.textContent = '清晨收拾背包…'; note.textContent = '第二天，沿山脊经吊马桩前往金顶。'; }
  else if (pose.kind === 'summit') { primary.textContent = '沿景区山路下山 →'; note.textContent = '在金顶回望来路，再沿石阶下到景区大门。'; }
  else { primary.textContent = '翻看这程手帐'; note.textContent = `两天一夜走完了。本程收好 ${journey.collections} 幅手绘，慢慢翻看。`; }
  if (journey.mode.kind === 'visiting') { primary.textContent = '看看风景'; note.textContent = '';  }
  if (journey.mode.kind === 'encounter') { primary.textContent = '停留片刻'; note.textContent = '';  }
}
function updateVisit(): void {
  const id = journey.mode.kind === 'visiting' ? journey.mode.id : null;
  const nextKey = journey.mode.kind === 'visiting' || journey.mode.kind === 'encounter' ? `${journey.mode.kind}:${journey.mode.id}` : '';
  if (nextKey === dialogKey) return;
  discovery.cancel();
  dialogKey = nextKey;
  if (nextKey) { pauseAudio(); soundscape.cue('arrive'); }
  visits.sync(id);
  if (id) button('ww-visit-proceed').textContent = id === 'camp' ? '回到营地休息' : id === 'summit' ? '准备下山' : id === 'end' ? '走完了' : '继续走 →';
  const event = journey.mode.kind === 'encounter' && !art.open ? journey.events[journey.mode.id] : null;
  if (!event) return;
  if (event.id === 'encounter') { openArt(event.entry, event.place, event.id); return; }
  discovery.show(event.id, reduced, () => {
    if (disposed || journey.mode.kind !== 'encounter' || journey.mode.id !== event.id) return;
    if (event.id === 'stars') {
      cancelAnimationFrame(animation); animation = 0; camp.show(environment.frame.weather, reduced, sound);
    } else if (event.id === 'leaves' || event.id === 'return') {
      cancelAnimationFrame(animation); animation = 0;
      keepsakes.show(event.id === 'leaves' ? FOREST_LEAVES_ID : HOMEWARD_PAGES_ID);
    } else openArt(event.entry, event.place, event.id);
  });
}
function updateEnvironment(): void {
  const e = environment.frame;
  if (e.label === weatherKey) return;
  weatherKey = e.label; environmentLabel.textContent = e.label; conditions.dataset.weather = e.night > .5 ? 'night' : e.weather;
}
async function toggleSound(): Promise<void> {
  const token = ++audioToken;
  if (sound) { sound = false; soundscape.disable(); await camp.setSound(false); soundButton.textContent = '声音 · 关'; soundButton.setAttribute('aria-pressed', 'false'); return; }
  soundButton.disabled = true;
  try {
    await soundscape.enable();
    if (camp.open) await camp.setSound(true);
    if (token !== audioToken || disposed || document.hidden) { pauseAudio(); return; }
    sound = true; soundButton.textContent = '声音 · 开'; soundButton.setAttribute('aria-pressed', 'true');
    if (art.open || camp.open || keepsakes.open || journey.mode.kind === 'visiting' || journey.mode.kind === 'encounter') pauseAudio();
  } catch { sound = false; soundscape.disable(); soundButton.textContent = '声音 · 重试'; }
  finally { if (!disposed) soundButton.disabled = false; }
}
function tick(now: number): void {
  animation = 0;
  if (disposed || document.hidden || art.open || camp.open || keepsakes.open || characterPicker.open || !ready) return;
  const dt = lastTime ? Math.min(.05, Math.max(0, (now - lastTime) / 1000)) : 0; lastTime = now;
  const day = journey.day;
  journey.tick(dt); if (journey.day !== day) environment.reset(journey);
  environment.advance(dt, journey);
  soundscape.update(journey, environment.frame, dt, journey.mode.kind !== 'visiting' && journey.mode.kind !== 'encounter');
  projection = scene.paint(journey, environment.frame, dt, reduced); positionMarkers(projection);
  updateUI(); updateVisit(); updateEnvironment(); ensureLoop();
}
function resize(): void {
  const box = map.getBoundingClientRect(); if (box.width < 1 || box.height < 1) return;
  scene.resize(box.width, box.height);
  if (ready) { projection = scene.paint(journey, environment.frame, 0, reduced); positionMarkers(projection); }
}
function restart(): void {
  if (!ready || art.open || camp.open || keepsakes.open || journey.mode.kind === 'visiting' || journey.mode.kind === 'encounter') return;
  journey.reset(); environment.reset(journey); journey.walkTo(); scene.setMode('follow'); uiKey = ''; updateUI();
}
function changeView(mode: ScrollView): void { if (ready) { scene.setMode(mode); uiKey = ''; updateUI(); } }
primary.addEventListener('click', () => { if (journey.pose.kind === 'finished') openArt(); else journey.toggle(); updateUI(); }, { signal });
reset.addEventListener('click', restart, { signal });
reopen.addEventListener('click', () => { if (nearestStop) { journey.openVisit(nearestStop); updateUI(); updateVisit(); } }, { signal });
soundButton.addEventListener('click', () => { void toggleSound(); }, { signal });
overview.addEventListener('click', () => changeView('overview'), { signal });
follow.addEventListener('click', () => changeView('follow'), { signal });
button('ww-retry').addEventListener('click', () => location.reload(), { signal });
time.addEventListener('change', () => environment.setTime(parseTimeSetting(time.value)), { signal });
weather.addEventListener('change', () => environment.setWeather(parseWeatherSetting(weather.value)), { signal });
canvas.addEventListener('pointerup', event => {
  if (!ready || !projection || art.open || journey.mode.kind === 'visiting' || journey.mode.kind === 'encounter' || event.button > 0) return;
  const box = canvas.getBoundingClientRect(), p = projection;
  const at = p.fromScreen({ x: (event.clientX - box.left) * p.width / box.width, y: (event.clientY - box.top) * p.height / box.height });
  if (distance(at, journey.point) < 30 / p.scale) journey.pause();
  else { const near = trail.nearest(at); if (near.gap < 32 / p.scale && near.travel > journey.travel) journey.walkTo(near.travel > trail.length - 28 ? trail.length : near.travel); }
  updateUI();
}, { signal });
document.addEventListener('keydown', event => {
  if (event.code === 'Escape' && discovery.pending) {
    event.preventDefault(); discovery.cancel(); journey.closeEncounter(false);
    uiKey = ''; updateUI(); updateVisit(); resumeAudio(); return;
  }
  if (!ready || art.open || characterPicker.open || journey.mode.kind === 'visiting' || journey.mode.kind === 'encounter' || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) return;
  if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) journey.toggle(); }
  else if (event.code === 'Escape' || event.code === 'ArrowLeft' || event.code === 'ArrowDown') { event.preventDefault(); journey.pause(); }
  else if (event.code === 'ArrowRight' || event.code === 'ArrowUp') { event.preventDefault(); journey.walkTo(); }
  updateUI();
}, { signal });
reducedQuery.addEventListener('change', () => { reduced = reducedQuery.matches; }, { signal });
document.addEventListener('visibilitychange', () => {
  lastTime = 0;
  if (document.hidden) { cancelAnimationFrame(animation); animation = 0; pauseAudio(); camp.pauseAudio(); journey.pause(); updateUI(); }
  else { if (autostart && ready && journey.mode.kind === 'ready') { autostart = false; journey.walkTo(); } ensureLoop(); resumeAudio(); }
}, { signal });
const observer = new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(resize, 80); });
window.addEventListener('pagehide', event => {
  lastTime = 0; cancelAnimationFrame(animation); animation = 0; pauseAudio(); journey.pause();
  if (event.persisted) return;
  disposed = true; audioToken++; lifecycle.abort(); clearTimeout(resizeTimer); observer.disconnect(); visits.destroy(); art.dispose(); camp.destroy(); keepsakes.destroy(); soundscape.destroy(); scene.destroy();
}, { signal });
window.addEventListener('pageshow', event => { if (event.persisted) { lastTime = 0; ensureLoop(); updateUI(); } }, { signal });
async function start(): Promise<void> {
  await scene.load(signal); if (signal.aborted || disposed) return;
  ready = true; resize(); loading.hidden = true; node('ww-detail-hint').hidden = true; characterPicker.refresh();
  if (autostart && !document.hidden) { journey.walkTo(); autostart = false; }
  updateUI(); updateEnvironment(); observer.observe(map); ensureLoop();
}
void start().catch(error => {
  if (signal.aborted || disposed) return;
  ready = false; message.textContent = error instanceof Error ? error.message : '山路暂时未能展开。';
  loading.hidden = false; button('ww-retry').hidden = false; scene.destroy(); primary.disabled = true;
});
