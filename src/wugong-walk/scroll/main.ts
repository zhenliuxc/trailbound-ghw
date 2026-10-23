import { observeMapSize } from '../../journey/viewport';
import { createFrameLoop } from '../../runtime/frame-loop';
import { clamp, distance } from '../model';
import { ArtOverlay } from '../../journey/art-overlay';
import { VisitView } from '../visits';
import { parseTimeSetting, parseWeatherSetting, SceneEnvironment } from '../environment';
import { ScrollJourney } from './journey';
import { ScrollScene } from './scene';
import { STAGES, PLACE_MARKERS, ScrollTrail, type ScrollStopId } from './route';
import { LandmarkLayer } from '../../journey/landmark-layer';
import type { ScrollProjection, ScrollView } from './camera';
import type { TrailEventId } from './events';
import { CampNight } from './camp-night';
import { rememberCampStars, rememberKeepsake } from './camp-journal';
import { FOREST_LEAVES_ID, HOMEWARD_PAGES_ID } from './keepsake-games';
import { TrailKeepsakes } from './trail-keepsakes';
import { TrailSoundscape } from './soundscape';
import { DISCOVERY_SCENES } from './discovery-transition';
import { DiscoveryTransition } from '../../journey/discovery-transition';
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
let reduced = reducedQuery.matches, disposed = false, ready = false;
let projection: ScrollProjection | null = null, uiKey = '', weatherKey = '';
let autostart = new URLSearchParams(location.search).get('walk') === '1';
let sound = false, audioToken = 0, dialogKey = '';
const soundscape = new TrailSoundscape();
const discovery = new DiscoveryTransition(map, signal, DISCOVERY_SCENES);
let nearestStop: ScrollStopId | null = null;
let activeEvent: TrailEventId | null = null;

function pauseAudio(): void { soundscape.pause(); }
function resumeAudio(): void { if (sound && !document.hidden && !art.open && !camp.open && !keepsakes.open && !characterPicker.open && journey.mode.kind !== 'visiting' && journey.mode.kind !== 'encounter') soundscape.resume(); }
function ensureLoop(): void { clock.ensure(); }
function stopLoop(): void { clock.stop(); }
const keepsakes = new TrailKeepsakes({ signal,
  onClose(result) {
    if (journey.mode.kind === 'encounter' && (journey.mode.id === 'leaves' || journey.mode.id === 'return')) {
      if (result.collected) journey.collectEvent(journey.mode.id);
      journey.closeEncounter(result.continueWalk);
    }
    uiKey = ''; updateUI(); updateVisit(); stopLoop(); ensureLoop(); resumeAudio();
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
    uiKey = ''; updateUI(); updateVisit(); stopLoop(); ensureLoop(); resumeAudio();
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
  uiKey = ''; updateUI(); updateVisit(); stopLoop(); ensureLoop(); resumeAudio();
}, 'ww', { soft: true });
const characterPicker = createCharacterPicker({ trigger: button('ww-character'), signal,
  current: () => scene.character,
  beforeOpen() {
    if (!ready || disposed || art.open || camp.open || keepsakes.open || discovery.pending || journey.mode.kind === 'visiting' || journey.mode.kind === 'encounter') return false;
    journey.pause(); stopLoop(); pauseAudio(); updateUI(); return true;
  },
  apply: (id, selectionSignal) => scene.setCharacter(id, selectionSignal),
  afterClose() { if (disposed) return; stopLoop(); resize(); uiKey = ''; updateUI(); ensureLoop(); resumeAudio(); },
});
const clock = createFrameLoop({ request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id), maxDelta: .05, active: () => ready && !disposed && !document.hidden && !art.open && !camp.open && !keepsakes.open && !characterPicker.open, update: tick });
function openArt(entry?: string, place?: string, event: TrailEventId | null = null): void {
  if (!ready || disposed || discovery.pending || art.open || camp.open || keepsakes.open) return;
  activeEvent = event;
  stopLoop(); pauseAudio(); art.show(entry, place);
}
const visits = new VisitView(continueWalk => {
  if (journey.mode.kind !== 'visiting') return;
  journey.closeVisit(continueWalk); uiKey = ''; updateUI(); resumeAudio();
}, signal);
button('ww-journal').addEventListener('click', () => openArt(), { signal });

const markers = new LandmarkLayer({
  container:node('ww-markers'),className:'ww-marker',signal,
  places:trail.stops.map(stop=>({id:stop.id,point:stop.point,...PLACE_MARKERS[stop.id],ariaLabel:`实景打卡 · ${stop.name}`})),
  onSelect(id) {
    if (!ready || discovery.pending || art.open || camp.open || keepsakes.open || characterPicker.open) return;
    if (journey.hasVisited(id)) journey.openVisit(id);
    else journey.walkTo(trail.sites[id].travel);
    uiKey = ''; updateUI(); updateVisit();
  },
});
function positionMarkers(p: ScrollProjection): void {
  discovery.position(p.toScreen(journey.point), p.width, p.height);
  markers.update(p,scene.mode,marker=>({
    visible:scene.mode==='overview'||Math.abs(trail.sites[marker.id].travel-journey.travel)<210,
    enabled:true,visited:journey.hasVisited(marker.id),
  }));
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
      stopLoop(); camp.show(environment.frame.weather, reduced, sound);
    } else if (event.id === 'leaves' || event.id === 'return') {
      stopLoop();
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
function tick(dt: number): void {
  const day = journey.day;
  journey.tick(dt); if (journey.day !== day) environment.reset(journey);
  environment.advance(dt, journey);
  soundscape.update(journey, environment.frame, dt, journey.mode.kind !== 'visiting' && journey.mode.kind !== 'encounter');
  projection = scene.paint(journey, environment.frame, dt, reduced); positionMarkers(projection);
  updateUI(); updateVisit(); updateEnvironment();
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
  const at = p.toWorld({ x: (event.clientX - box.left) * p.width / box.width, y: (event.clientY - box.top) * p.height / box.height });
  if (distance(at, journey.point) < 30 / p.scaleX) journey.pause();
  else { const near = trail.nearest(at); if (near.gap < 32 / p.scaleX && near.travel > journey.travel) journey.walkTo(near.travel > trail.length - 28 ? trail.length : near.travel); }
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
  stopLoop();
  if (document.hidden) { pauseAudio(); camp.pauseAudio(); journey.pause(); updateUI(); }
  else { if (autostart && ready && journey.mode.kind === 'ready') { autostart = false; journey.walkTo(); } ensureLoop(); resumeAudio(); }
}, { signal });

window.addEventListener('pagehide', event => {
  stopLoop(); pauseAudio(); journey.pause();
  if (event.persisted) return;
  disposed = true; audioToken++; lifecycle.abort();  visits.destroy(); art.dispose(); camp.destroy(); keepsakes.destroy(); soundscape.destroy(); scene.destroy();
}, { signal });
window.addEventListener('pageshow', event => { if (event.persisted) { stopLoop(); ensureLoop(); updateUI(); } }, { signal });
async function start(): Promise<void> {
  await scene.load(signal); if (signal.aborted || disposed) return;
  ready = true; resize(); loading.hidden = true; node('ww-detail-hint').hidden = true; characterPicker.refresh();
  if (autostart && !document.hidden) { journey.walkTo(); autostart = false; }
  updateUI(); updateEnvironment(); observeMapSize(map, signal, resize); ensureLoop();
}
void start().catch(error => {
  if (signal.aborted || disposed) return;
  ready = false; message.textContent = error instanceof Error ? error.message : '山路暂时未能展开。';
  loading.hidden = false; button('ww-retry').hidden = false; scene.destroy(); primary.disabled = true;
});
