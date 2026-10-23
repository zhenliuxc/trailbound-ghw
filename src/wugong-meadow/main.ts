import { parseTerrain } from '../wugong-walk/model';
import { SceneEnvironment, parseTimeSetting, parseWeatherSetting } from '../wugong-walk/environment';
import { createWugongTerrain } from './terrain';
import { MeadowScene, type MeadowView } from './scene';
import { createTrailHiker, HIKER_ASSET } from './hiker';
import { WorldAssets } from './assets';
import { WugongJourney } from './journey';
import { LandmarkCard, stopIcons } from './landmarks';
import { loadForestTexture } from './tree-textures';
import { ArtOverlay } from '../journey/art-overlay';

function element(id: string): HTMLElement {
  const value = document.getElementById(id); if (!value) throw new Error(`武功山地图缺少 ${id}`); return value;
}
function button(id: string): HTMLButtonElement {
  const value = element(id); if (!(value instanceof HTMLButtonElement)) throw new Error(`地图控件错误 ${id}`); return value;
}
function select(id: string): HTMLSelectElement {
  const value = element(id); if (!(value instanceof HTMLSelectElement)) throw new Error(`地图选项错误 ${id}`); return value;
}
const canvasNode = element('meadow-canvas'), host = element('meadow-map');
if (!(canvasNode instanceof HTMLCanvasElement)) throw new Error('山地画布无法读取');
const canvas = canvasNode;
const primary = button('meadow-walk'), restart = button('meadow-restart'), windButton = button('meadow-wind');
const follow = button('meadow-follow'), overview = button('meadow-overview');
const timeSetting = select('meadow-time'), weatherSetting = select('meadow-weather'), paceSetting = select('meadow-pace');
const loading = element('meadow-loading'), message = element('meadow-message'), status = element('meadow-status'), weatherLabel = element('meadow-weather-label');
const progress = element('meadow-progress'), retry = button('meadow-retry'), markerLayer = element('meadow-markers');
const lifecycle = new AbortController(), { signal } = lifecycle;
const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
const assets = new WorldAssets();
const markers = new Map<string, HTMLButtonElement>();
const tethers = new Map<string, HTMLElement>();
let scene: MeadowScene | null = null, journey: WugongJourney | null = null, environment: SceneEnvironment | null = null;
let wind = true, animation = 0, lastTime = 0, disposed = false, failed = false, uiKey = '';
const art = new ArtOverlay(signal, () => { lastTime = 0; host.dataset.art = 'closed'; sync(); if (!disposed && !failed && !document.hidden && scene && !animation) animation = requestAnimationFrame(frame); }, 'meadow');
function openArt(entry?: string, place?: string): void {
  host.dataset.art = 'open'; cancelAnimationFrame(animation); animation = 0; lastTime = 0; art.show(entry, place);
}
const card = new LandmarkCard(proceed => { journey?.closeVisit(proceed); sync(); }, signal, openArt);
button('meadow-journal').addEventListener('click', () => openArt(), { signal });
const stageLabels = { forest: '穿过林间，沿山路上行', meadow: '林缘退去，草甸铺向山肩', camp: '在观音宕，等山风慢下来', ridge: '走过鞍部，再爬上下一道山脊', summit: '登上金顶，回望一路山色', descent: '沿景区山路，慢慢下到山脚', end: '到达景区大门，这一程走完了' };
function sync(): void {
  if (!scene || !journey || !environment) return;
  const { mode, terrain } = journey, visiting = mode.kind === 'visiting' ? mode.id : null;
  const key = `${mode.kind}:${journey.day}:${scene.view}:${visiting}`;
  if (key !== uiKey) {
    uiKey = key;
    primary.textContent = mode.kind === 'finished' ? '再走一遍' : mode.kind === 'camp' ? '第二天 · 出发' : mode.kind === 'walking' ? '停下来看看' : mode.kind === 'ready' ? '从东江村启程' : '继续沿山路';
    primary.setAttribute('aria-pressed', String(mode.kind === 'walking'));
    follow.setAttribute('aria-pressed', String(scene.view === 'follow')); overview.setAttribute('aria-pressed', String(scene.view === 'overview'));
    host.dataset.view = scene.view; host.dataset.walking = String(mode.kind === 'walking'); host.dataset.mode = mode.kind; host.dataset.day = String(journey.day);
  }
  const arrived = visiting ? journey.hasVisited(visiting) : false;
  const action = mode.kind !== 'visiting' || !arrived ? '返回山路' : mode.resume.kind === 'camp' ? '在营地歇一晚' : mode.resume.kind === 'finished' ? '收好这一程' : mode.resume.kind !== 'walking' ? '返回山路' : visiting === 'start' ? '从东江村启程' : '继续沿山路';
  card.sync(visiting, arrived, action);
  const stage = terrain.stage(journey.distance), fraction = journey.distance / terrain.length;
  const label = mode.kind === 'camp' ? '第一夜 · 营地歇脚，明早再出发' : stageLabels[stage];
  if (status.textContent !== label) status.textContent = label;
  const weather = environment.frame.label; if (weatherLabel.textContent !== weather) weatherLabel.textContent = weather;
  progress.style.width = `${fraction * 100}%`; host.dataset.progress = mode.kind === 'finished' ? 'finished' : stage; host.dataset.distance = journey.distance.toFixed(2);
  const placed: { x: number; y: number }[] = [];
  for (const marker of scene.projectStops(journey.distance)) {
    const node = markers.get(marker.id); if (!node) continue;
    const tether = tethers.get(marker.id);
    node.hidden = !marker.visible;
    if (tether) tether.hidden = true;
    if (marker.visible) {
      let y = marker.y;
      for (let attempt = 0; attempt < 6 && placed.some(point => Math.hypot(point.x - marker.x, point.y - y) < 43); attempt++) y = marker.y + (attempt % 2 ? -1 : 1) * Math.ceil((attempt + 1) / 2) * 43;
      placed.push({ x: marker.x, y }); node.style.transform = `translate(${marker.x - 19}px,${y - 19}px)`;
      if (tether && Math.abs(y - marker.y) > 20) {
        tether.hidden = false; tether.style.height = `${Math.abs(y - marker.y) - 18}px`; tether.style.transform = `translate(${marker.x}px,${Math.min(y, marker.y) + (y < marker.y ? 18 : 0)}px)`;
      }
    }
    node.dataset.visited = String(journey.hasVisited(marker.id));
  }
}
function reset(): void { if (!journey) return; scene?.resetWalk(); journey.reset(); environment?.reset(journey.environment); sync(); }
primary.addEventListener('click', () => { if (journey?.mode.kind === 'finished') reset(); else journey?.toggle(); sync(); }, { signal });
restart.addEventListener('click', reset, { signal });
function view(value: MeadowView): void { scene?.setView(value); sync(); }
follow.addEventListener('click', () => view('follow'), { signal }); overview.addEventListener('click', () => view('overview'), { signal });
windButton.addEventListener('click', () => { wind = !wind; scene?.setWind(wind); windButton.setAttribute('aria-pressed', String(wind)); windButton.textContent = wind ? '山风 · 开' : '山风 · 关'; }, { signal });
timeSetting.addEventListener('change', () => environment?.setTime(parseTimeSetting(timeSetting.value)), { signal });
weatherSetting.addEventListener('change', () => environment?.setWeather(parseWeatherSetting(weatherSetting.value)), { signal });
retry.addEventListener('click', () => location.reload(), { signal });
window.addEventListener('keydown', event => {
  if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement || event.target instanceof HTMLSelectElement || journey?.mode.kind === 'visiting' || art.open) return;
  if (event.code === 'Space') { event.preventDefault(); primary.click(); }
  if (event.key === 'Escape') { journey?.pause(); sync(); }
}, { signal });
function fail(error: unknown): void {
  failed = true; cancelAnimationFrame(animation); animation = 0;
  loading.hidden = false; loading.dataset.failed = 'true'; message.textContent = error instanceof Error ? `山路暂时没有展开。${error.message}` : '山路暂时没有展开，请重试。'; retry.hidden = false;
  for (const control of [primary, restart, follow, overview, windButton, timeSetting, weatherSetting, paceSetting]) control.disabled = true;
}
function frame(now: number): void {
  animation = 0; if (disposed || failed || document.hidden || art.open || !scene || !journey || !environment) return;
  const realDt = lastTime ? Math.min(.05, Math.max(0, (now - lastTime) / 1000)) : 0; lastTime = now;
  const pace = paceSetting.value === '4' ? 4 : paceSetting.value === '2' ? 2 : 1;
  const dt = realDt * pace;
  if (!art.open) { journey.advance(dt); environment.advance(dt, journey.environment); }
  scene.paint(journey.distance, journey.speed, environment.frame, journey.mode.kind === 'visiting' || art.open ? 0 : dt);
  sync(); animation = requestAnimationFrame(frame);
}
const resize = new ResizeObserver(entries => { for (const entry of entries) if (entry.target === host) scene?.resize(entry.contentRect.width, entry.contentRect.height); }); resize.observe(host);
document.addEventListener('visibilitychange', () => {
  lastTime = 0;
  if (document.hidden) { cancelAnimationFrame(animation); animation = 0; }
  else if (scene && !disposed && !failed && !animation) animation = requestAnimationFrame(frame);
}, { signal });
canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); fail(new Error('绘图连接已暂停，可以重新展开。')); }, { signal });
window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  disposed = true; lifecycle.abort(); cancelAnimationFrame(animation); resize.disconnect(); scene?.dispose(); if (!scene) assets.dispose(); card.dispose(); art.dispose();
}, { signal });
async function boot(): Promise<void> {
  const response = await fetch('scenes/wugong-relief-height-v2.json', { signal }); if (!response.ok) throw new Error('山体数据暂时无法读取');
  const terrain = createWugongTerrain(parseTerrain(await response.json())); journey = new WugongJourney(terrain);
  if (new URLSearchParams(location.search).get('section') === 'ridge') journey.startAtCamp();
  environment = new SceneEnvironment(journey.environment);
  message.textContent = '让旅人、林带和营地走进山里…';
  const characterResponse = await fetch(HIKER_ASSET, { signal }); if (!characterResponse.ok) throw new Error('徒步人物暂时无法读取');
  const hiker = await createTrailHiker(await characterResponse.arrayBuffer(), terrain.height);
  try { await Promise.all([assets.load(signal), loadForestTexture(signal)]); if (signal.aborted || disposed) { hiker.dispose(); assets.dispose(); return; } scene = new MeadowScene(canvas, terrain, () => reduceQuery.matches, hiker, assets); }
  catch (error) { hiker.dispose(); assets.dispose(); throw error; }
  for (const stop of terrain.stops) {
    const node = document.createElement('button'); node.type = 'button'; node.className = 'meadow-stop'; node.setAttribute('aria-label', stop.title); node.dataset.stop = stop.id;
    node.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${stopIcons[stop.id]}</svg>`;
    const tether = document.createElement('span'); tether.className = 'meadow-tether'; tether.setAttribute('aria-hidden', 'true'); tether.hidden = true; tethers.set(stop.id, tether);
    node.addEventListener('click', () => { journey?.openStop(stop.id); sync(); }, { signal }); markerLayer.append(tether, node); markers.set(stop.id, node);
  }
  const box = host.getBoundingClientRect(); scene.resize(box.width, box.height); scene.paint(journey.distance, 0, environment.frame, 0);
  host.dataset.character = 'quaternius-adventurer'; host.dataset.routeLength = terrain.length.toFixed(2);
  loading.hidden = true; for (const control of [primary, restart, follow, overview, windButton, timeSetting, weatherSetting, paceSetting]) control.disabled = false;
  if (new URLSearchParams(location.search).get('walk') === '1') journey.toggle(); sync();
  if (!document.hidden) animation = requestAnimationFrame(frame);
}
void boot().catch(fail);
