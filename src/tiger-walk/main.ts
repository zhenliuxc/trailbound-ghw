import { LandmarkLayer } from '../journey/landmark-layer';
import { LandmarkNameLayer } from '../journey/landmark-name-layer';
import { observeMapSize } from '../journey/viewport';
import { ArtOverlay } from '../journey/art-overlay';
import { DiscoveryTransition } from '../journey/discovery-transition';
import { createPhotoDialog } from '../journey/photo-dialog';
import { createFrameLoop } from '../runtime/frame-loop';
import { TigerAudio } from './audio';
import { TigerJourney } from './journey';
import { PHOTOS } from './photos';
import { PLACES, isCheckpoint, place } from './route';
import { CHECKPOINT_IDS, type CheckpointId } from '../content/tiger-map';
import { EVENTS, type TigerEventId as EventId } from '../content/tiger';
import { TigerScene, type Projection, type View } from './scene';
import { createCharacterPicker } from '../characters/picker';

const node = (id: string): HTMLElement => { const element = document.getElementById(id); if (!element) throw new Error(`虎跳峡界面缺少 ${id}`); return element; };
const button = (id: string): HTMLButtonElement => { const element = node(id); if (!(element instanceof HTMLButtonElement)) throw new Error(`虎跳峡按钮无法读取 ${id}`); return element; };
const canvas = node('tg-canvas');
if (!(canvas instanceof HTMLCanvasElement)) throw new Error('虎跳峡画面入口无法读取');
const map = node('tg-map'), loading = node('tg-loading'), walk = button('tg-walk');
const lifecycle = new AbortController(), { signal } = lifecycle, reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
const journey = new TigerJourney(), scene = new TigerScene(canvas), audio = new TigerAudio();
const discovery = new DiscoveryTransition(map, signal, EVENTS);
let ready = false, disposed = false, reduced = reducedQuery.matches, sound = false, audioToken = 0;
let key = '', activeEvent: EventId | null = null;
let projection: Projection | null = null;
let uiKey = '', environmentKey = '', autostart = new URLSearchParams(location.search).get('walk') === '1';
const photo = createPhotoDialog({ prefix: 'tg', signal, reduced: () => reduced, onClose(continueWalk) { journey.closePhoto(continueWalk); sync(); stop(); loop(); resumeAudio(); } });
const art = new ArtOverlay(signal, result => {
  const event = activeEvent; activeEvent = null;
  if (event && journey.mode.kind === 'game' && journey.mode.id === event) { if (journey.closeGame(result.collected > 0)) scene.snap(); }
  sync(); stop(); loop(); resumeAudio();
}, 'tg', { soft: true, chapter: 'tiger', version: 'character-check-2' });
const characterPicker = createCharacterPicker({ trigger: button('tg-character'), signal,
  current: () => scene.character,
  beforeOpen() {
    if (!ready || disposed || art.open || photo.open || discovery.pending || journey.mode.kind === 'game') return false;
    journey.pause(); stop(); audio.pause(); sync(); return true;
  },
  apply: (id, selectionSignal) => scene.setCharacter(id, selectionSignal),
  afterClose() { if (disposed) return; stop(); resize(); sync(); loop(); resumeAudio(); },
});
const clock = createFrameLoop({ request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id), maxDelta: .05, active: () => ready && !disposed && !document.hidden && !art.open && !photo.open && !characterPicker.open, update: tick });
function stop(): void { clock.stop(); }
function loop(): void { clock.ensure(); }
function resumeAudio(): void { if (sound && !document.hidden && !art.open && !photo.open && !characterPicker.open && !discovery.pending && journey.mode.kind !== 'game') audio.resume(); }
function openJournal(): void { if (!ready || art.open || photo.open || discovery.pending || journey.mode.kind === 'game') return; stop(); audio.pause(); art.show(undefined, undefined, scene.character); }

const layer = node('tg-markers');
const markers = new LandmarkLayer({container:layer,className:'tg-marker',signal,
  places:CHECKPOINT_IDS.map(id=>({id,name:place(id).name,point:place(id).point,symbol:place(id).symbol,
    labelSide:place(id).labelSide,caption:id==='start'?'起点':id==='tinas'?'高路终点':undefined,
    ariaLabel:`${place(id).name} · ${id==='start'?'高路起点':id==='tinas'?'高路终点与支线返回点':'实景打卡'}`,
  })),
  onSelect(id){if(!discovery.pending&&!art.open&&!photo.open){journey.openPhoto(id);sync();}},
});
const waypoints = new LandmarkNameLayer({ container: layer,
  places: PLACES.filter(p => !isCheckpoint(p.id)).map(p => ({
    id: p.id, name: p.name, point: p.point, labelSide: p.labelSide,
    caption: p.id === 'teacher' ? '通往中虎跳' : undefined,
  })),
});
function markerOnLeg(id: CheckpointId): boolean { return place(id).leg === (journey.leg === 'high' ? 'high' : 'down') || journey.leg === 'return' && id === 'tinas'; }
function markerDistance(id: CheckpointId): number { const p = place(id).point, at = journey.point; return Math.hypot(p.x - at.x, p.y - at.y); }
function position(p: Projection): void {
  discovery.position(p.toScreen(journey.point), p.width, p.height);
  const occupied = markers.update(p,scene.mode,marker=>({
    visible:scene.mode==='overview'||markerOnLeg(marker.id)&&markerDistance(marker.id)<800,
    enabled:journey.visited.has(marker.id),visited:journey.visited.has(marker.id),
  }));
  waypoints.update(p, scene.mode, waypoint => scene.mode === 'overview'
    || Math.hypot(waypoint.point.x - journey.point.x, waypoint.point.y - journey.point.y) < 720, occupied);
}
function showPhoto(id: CheckpointId): void {
  const name = id === 'tinas' && journey.leg === 'return' ? '中峡客栈 · 返回终点' : place(id).name;
  const continueLabel = journey.mode.kind === 'photo' && journey.mode.resume.kind === 'finished' ? '回到终点' : id === 'halfway' && journey.day === 1 ? '在中途客栈歇脚 →' : id === 'tinas' ? '看看江边支线 →' : '继续走 →';
  audio.pause(); stop(); photo.show({ name, photo: PHOTOS[id], checkpoint: id, continueLabel });
}
function chapter(): string {
  if (journey.leg === 'return') return '沿原小路返回中峡客栈';
  if (journey.leg === 'down') return journey.at < 200 ? '张老师小路 · 支线联络' : '向中虎跳江边下降';
  if (journey.at < place('naxi').at) return '桥头 → 纳西雅阁';
  if (journey.at < place('bends').at) return '二十八道拐 · 向上爬升';
  if (journey.at < place('tea').at) return '高路 → 茶马客栈';
  if (journey.at < place('halfway').at) return '沿山腰走向中途客栈';
  if (journey.day === 1) return '中途客栈 · 雪山前歇脚';
  if (journey.at < place('waterfall').at) return '清晨出发 → 龙洞瀑布';
  return '沿崖山路 → 中峡客栈';
}
function sync(): void {
  const mode = journey.mode;
  const minute = Math.round(journey.minute / 5) * 5, label = `第${journey.day === 1 ? '一' : '二'}天 ${Math.floor(minute / 60).toString().padStart(2, '0')}:${(minute % 60).toString().padStart(2, '0')} · ${mode.kind === 'sleeping' ? '峡谷入夜' : journey.day === 2 && minute < 8 * 60 ? '清晨薄雾' : journey.leg === 'return' ? '江声渐远' : journey.leg === 'down' ? '江声渐近' : '峡谷晴风'}`;
  if (label !== environmentKey) { environmentKey = label; node('tg-environment').textContent = label; }
  const near = CHECKPOINT_IDS.find(id => journey.visited.has(id) && markerOnLeg(id) && markerDistance(id) < 110);
  const nextUI = `${ready}:${journey.day}:${mode.kind}:${mode.kind === 'photo' || mode.kind === 'game' ? mode.id : ''}:${chapter()}:${scene.mode}:${near}:${journey.earned.size}`;
  if (uiKey === nextUI) return; uiKey = nextUI;
  button('tg-follow').disabled = button('tg-overview').disabled = !ready;
  button('tg-follow').setAttribute('aria-pressed', String(scene.mode === 'follow')); button('tg-overview').setAttribute('aria-pressed', String(scene.mode === 'overview'));
  node('tg-chapter').textContent = `第${journey.day === 1 ? '一' : '二'}天 / ${chapter()}`;
  map.dataset.leg = journey.leg; map.dataset.pose = mode.kind; map.dataset.day = String(journey.day); map.dataset.view = scene.mode;
  markers.setCaption('tinas', journey.leg === 'return' ? '返回终点' : '高路终点', journey.leg === 'return' ? '中峡客栈 · 返回终点' : '中峡客栈 · 高路终点与支线返回点');
  node('tg-junction').hidden = mode.kind !== 'junction'; node('tg-night').hidden = mode.kind !== 'sleeping' && mode.kind !== 'waking';
  node('tg-night').querySelector('h2')?.replaceChildren(mode.kind === 'waking' ? '清晨，继续往江边走' : '在中途客栈，住一晚');
  node('tg-night').querySelector('p')?.replaceChildren(mode.kind === 'waking' ? '收好背包，沿高路走向龙洞瀑布。' : '把背包放下，听江声落进夜里。');
  walk.disabled = !ready || !['ready', 'walking', 'paused', 'resting', 'finished'].includes(mode.kind);
  walk.textContent = mode.kind === 'ready' ? '从桥头出发 →' : mode.kind === 'walking' ? '停下来看看' : mode.kind === 'paused' ? journey.atInn ? '在中途客栈歇脚 →' : journey.leg === 'return' ? '沿原小路返回 →' : '继续走 →' : mode.kind === 'resting' ? journey.encountered.has('inn-pairs') ? '在中途客栈过夜 →' : '看看桌上的小画 →' : mode.kind === 'finished' ? '翻看这程手帐' : mode.kind === 'stopping' ? '停稳脚步…' : mode.kind === 'game' ? '停留片刻' : mode.kind === 'sleeping' ? '在客栈休息…' : mode.kind === 'waking' ? '清晨收拾背包…' : '看看风景';
  node('tg-note').textContent = mode.kind === 'game' || mode.kind === 'photo' || mode.kind === 'junction' ? '' : mode.kind === 'finished' ? `这程峡谷走完了，收好 ${journey.earned.size} 枚手绘记忆。${journey.leg === 'return' ? '已沿原路回到中峡客栈。' : '旅程在高路终点收束。'}` : mode.kind === 'resting' ? '在山腰放下背包，今晚住在中途客栈。' : mode.kind === 'sleeping' ? '灯慢慢暗下来，明早继续沿高路出发。' : mode.kind === 'waking' ? '山谷亮起来了，整理背包，再去看看江。' : journey.leg === 'return' ? '沿来时的小路上行，经支线入口回到中峡客栈。' : journey.leg === 'down' ? '离开高路，经张老师小路，慢慢下到中虎跳江边。' : '沿山腰慢慢走，脚下是金沙江，对岸是玉龙雪山。';
  button('tg-reopen').hidden = !near || mode.kind === 'photo' || mode.kind === 'game';
  const next = mode.kind === 'photo' || mode.kind === 'game' ? `${mode.kind}:${mode.id}` : '';
  if (next === key) return;
  key = next; discovery.cancel();
  if (mode.kind === 'photo') { showPhoto(mode.id); return; }
  if (mode.kind === 'game') {
    audio.pause(); audio.cue();
    discovery.show(mode.id, reduced, () => {
      if (disposed || journey.mode.kind !== 'game' || journey.mode.id !== mode.id) return;
      activeEvent = mode.id; stop(); art.show(EVENTS[mode.id].entry, EVENTS[mode.id].place, scene.character);
    });
  }
}
function tick(dt: number): void {
  journey.tick(dt); audio.update(journey, dt); projection = scene.paint(journey, dt, reduced); position(projection); sync();
}
function resize(): void { const rect = map.getBoundingClientRect(); scene.resize(rect.width, rect.height); if (ready) { projection = scene.paint(journey, 0, reduced); position(projection); } }
walk.addEventListener('click', () => { if (journey.mode.kind === 'finished') openJournal(); else journey.toggle(); sync(); loop(); }, { signal });
button('tg-journal').addEventListener('click', openJournal, { signal });
button('tg-reopen').addEventListener('click', () => { const near = CHECKPOINT_IDS.find(id => journey.visited.has(id) && markerOnLeg(id) && markerDistance(id) < 110); if (near) { journey.openPhoto(near); sync(); } }, { signal });
for (const [id, view] of [['tg-follow', 'follow'], ['tg-overview', 'overview']] satisfies [string, View][]) button(id).addEventListener('click', () => { scene.setView(view); sync(); }, { signal });
button('tg-take-branch').addEventListener('click', () => { journey.chooseBranch(true); sync(); }, { signal });
button('tg-finish-high').addEventListener('click', () => { journey.chooseBranch(false); sync(); }, { signal });
button('tg-sound').addEventListener('click', () => {
  const token = ++audioToken, control = button('tg-sound');
  if (sound) { sound = false; audio.disable(); control.textContent = '声音 · 关'; control.setAttribute('aria-pressed', 'false'); return; }
  control.disabled = true;
  void audio.enable().then(() => { if (disposed || token !== audioToken) return; sound = true; control.textContent = '声音 · 开'; control.setAttribute('aria-pressed', 'true'); if (art.open || photo.open || characterPicker.open || journey.mode.kind === 'game') audio.pause(); }, () => { control.textContent = '声音 · 重试'; }).finally(() => { if (!disposed) control.disabled = false; });
}, { signal });
button('tg-retry').addEventListener('click', () => location.reload(), { signal });
document.addEventListener('keydown', event => {
  if (event.code === 'Escape' && discovery.pending) { event.preventDefault(); discovery.cancel(); journey.closeGame(false); sync(); resumeAudio(); return; }
  if (!ready || art.open || photo.open || characterPicker.open || journey.mode.kind === 'game' || event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement || event.target instanceof HTMLInputElement) return;
  if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) journey.toggle(); }
  else if (event.code === 'Escape' || event.code === 'ArrowLeft') journey.pause();
  else if (event.code === 'ArrowRight' && (journey.mode.kind === 'ready' || journey.mode.kind === 'paused')) journey.toggle();
  sync();
}, { signal });
canvas.addEventListener('pointerup', event => { if (event.button > 0 || !ready || art.open || photo.open || discovery.pending) return; if (journey.mode.kind === 'walking' || journey.mode.kind === 'paused' || journey.mode.kind === 'ready') journey.toggle(); sync(); }, { signal });
document.addEventListener('visibilitychange', () => { stop(); if (document.hidden) { journey.pause(); audio.pause(); } else { if (autostart && ready && journey.mode.kind === 'ready') { autostart = false; journey.toggle(); } loop(); resumeAudio(); } sync(); }, { signal });
reducedQuery.addEventListener('change', () => { reduced = reducedQuery.matches; }, { signal });

window.addEventListener('pagehide', event => { stop(); audio.pause(); journey.pause(); if (event.persisted) return; disposed = true; audioToken++; lifecycle.abort();  photo.dispose(); art.dispose(); scene.destroy(); audio.destroy(); }, { signal });
window.addEventListener('pageshow', event => { if (event.persisted) { sync(); loop(); } }, { signal });
void scene.load(signal).then(() => {
  if (signal.aborted || disposed) return; ready = true; loading.hidden = true; resize(); observeMapSize(map, signal, resize); characterPicker.refresh();
  if (autostart && !document.hidden) { autostart = false; journey.toggle(); }
  sync(); loop();
}, error => { if (signal.aborted || disposed) return; scene.destroy(); node('tg-loading-copy').textContent = error instanceof Error ? error.message : '山路暂时未能展开。'; button('tg-retry').hidden = false; });
