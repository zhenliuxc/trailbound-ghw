import { ArtOverlay } from '../wugong-walk/art-overlay';
import { DiscoveryTransition } from '../wugong-walk/scroll/discovery-transition';
import { enterDialog, type CancelMotion } from '../wugong-walk/visible-motion';
import { TigerAudio } from './audio';
import { TigerJourney } from './journey';
import { PHOTOS } from './photos';
import { CHECKPOINT_IDS, EVENTS, PLACES, isCheckpoint, place, type CheckpointId, type EventId } from './route';
import { TigerScene, type Projection, type View } from './scene';

const node = (id: string): HTMLElement => { const element = document.getElementById(id); if (!element) throw new Error(`虎跳峡界面缺少 ${id}`); return element; };
const button = (id: string): HTMLButtonElement => { const element = node(id); if (!(element instanceof HTMLButtonElement)) throw new Error(`虎跳峡按钮无法读取 ${id}`); return element; };
const canvasNode = node('tg-canvas'), photoNode = node('tg-photo'), imageNode = node('tg-photo-image');
if (!(canvasNode instanceof HTMLCanvasElement) || !(photoNode instanceof HTMLDialogElement) || !(imageNode instanceof HTMLImageElement)) throw new Error('虎跳峡画面入口无法读取');
const canvas = canvasNode, photo = photoNode, image = imageNode;
const map = node('tg-map'), loading = node('tg-loading'), walk = button('tg-walk');
const lifecycle = new AbortController(), { signal } = lifecycle, reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
const journey = new TigerJourney(), scene = new TigerScene(canvas), audio = new TigerAudio();
const discovery = new DiscoveryTransition(map, signal, EVENTS);
let ready = false, disposed = false, reduced = reducedQuery.matches, animation = 0, lastTime = 0, sound = false, audioToken = 0;
let key = '', activeEvent: EventId | null = null, photoId: CheckpointId | null = null, photoMotion: CancelMotion = () => {};
let projection: Projection | null = null, resizeTimer = 0;
let uiKey = '', environmentKey = '', autostart = new URLSearchParams(location.search).get('walk') === '1';
const art = new ArtOverlay(signal, result => {
  const event = activeEvent; activeEvent = null;
  if (event && journey.mode.kind === 'game' && journey.mode.id === event) { if (journey.closeGame(result.collected > 0)) scene.snap(); }
  sync(); lastTime = 0; loop(); resumeAudio();
}, 'tg', { soft: true, page: 'tiger-art.html', version: 'road-guide-7' });
function loop(): void { if (ready && !disposed && !document.hidden && !art.open && !photo.open && !animation) animation = requestAnimationFrame(tick); }
function resumeAudio(): void { if (sound && !document.hidden && !art.open && !photo.open && !discovery.pending && journey.mode.kind !== 'game') audio.resume(); }
function openJournal(): void { if (!ready || art.open || photo.open || discovery.pending || journey.mode.kind === 'game') return; cancelAnimationFrame(animation); animation = 0; audio.pause(); art.show(); }

const icons = {
  flag: '<path d="M7 27V5l18 3-18 8M4 27h12"/>', house: '<path d="m4 14 12-9 12 9M7 13v14h18V13M13 27V17h6v10"/>',
  steps: '<path d="M4 27h8v-7h7v-7h8V6M4 20l8-13 7 5 7-9"/>', peak: '<path d="m4 26 8-15 6 8 6-15 7 22H4Z"/>',
  bed: '<path d="M4 27V14m24 13V14M4 22h24M7 14h18v8M8 11V6h16v5M8 27v-5m16 5v-5"/>',
  water: '<path d="M10 4q-3 10 0 17m6-17q-3 10 0 17m6-17q-3 10 0 17M4 26q6-5 12 0t12 0"/>',
  river: '<path d="M3 10q6-5 13 0t13 0M3 20q6-5 13 0t13 0M11 28l4-7 7 1 4 6H11Z"/>',
};
const layer = node('tg-markers');
const markers = CHECKPOINT_IDS.map(id => {
  const p = place(id), element = document.createElement('button');
  element.type = 'button'; element.className = 'tg-marker'; element.dataset.place = id; element.dataset.labelSide = p.labelSide;
  element.dataset.role = id === 'start' ? 'start' : id === 'tinas' ? 'end' : 'checkpoint';
  element.setAttribute('aria-label', `${p.name} · ${id === 'start' ? '高路起点' : id === 'tinas' ? '高路终点与支线返回点' : '实景打卡'}`);
  const role = id === 'start' ? '起点' : id === 'tinas' ? '高路终点' : '';
  element.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true">${icons[p.icon]}</svg><span>${p.name}${role ? `<small>${role}</small>` : ''}</span>`;
  element.addEventListener('click', () => { if (!discovery.pending && !art.open && !photo.open) { journey.openPhoto(id); sync(); } }, { signal });
  layer.append(element); return { ...p, id, element };
});
const waypoints = PLACES.filter(p => !isCheckpoint(p.id)).map(p => {
  const element = document.createElement('span'); element.className = 'tg-waypoint'; element.dataset.labelSide = p.labelSide;
  element.dataset.place = p.id;
  const label = document.createElement('span'); label.textContent = p.name;
  if (p.id === 'teacher') {
    const note = document.createElement('small'); note.textContent = '通往中虎跳'; label.append(note);
    element.setAttribute('aria-label', '张老师小路，通往中虎跳江边的支线入口');
  }
  element.append(label); layer.append(element);
  return { ...p, element };
});
function markerOnLeg(id: CheckpointId): boolean { return place(id).leg === (journey.leg === 'high' ? 'high' : 'down') || journey.leg === 'return' && id === 'tinas'; }
function markerDistance(id: CheckpointId): number { const p = place(id).point, at = journey.point; return Math.hypot(p.x - at.x, p.y - at.y); }
function position(p: Projection): void {
  discovery.position(p.toScreen(journey.point), p.width, p.height);
  for (const marker of markers) {
    const at = p.toScreen(marker.point);
    marker.element.hidden = scene.mode === 'follow' && (!markerOnLeg(marker.id) || markerDistance(marker.id) > 800 || at.x < -25 || at.x > p.width + 25 || at.y < -25 || at.y > p.height + 25);
    marker.element.style.left = `${at.x}px`; marker.element.style.top = `${at.y}px`;
    marker.element.disabled = !journey.visited.has(marker.id); marker.element.dataset.visited = String(journey.visited.has(marker.id));
  }
  for (const waypoint of waypoints) {
    const at = p.toScreen(waypoint.point), near = Math.hypot(waypoint.point.x - journey.point.x, waypoint.point.y - journey.point.y) < 720;
    waypoint.element.dataset.labelSide = at.x > p.width - 95 ? 'left' : at.x < 85 ? 'right' : waypoint.labelSide;
    waypoint.element.hidden = scene.mode === 'follow' && (!near || at.x < -40 || at.x > p.width + 40 || at.y < -20 || at.y > p.height + 20);
    waypoint.element.style.left = `${at.x}px`; waypoint.element.style.top = `${at.y}px`;
  }
}
function showPhoto(id: CheckpointId): void {
  const metadata = PHOTOS[id]; photoId = id;
  node('tg-photo-title').textContent = id === 'tinas' && journey.leg === 'return' ? '中峡客栈 · 返回终点' : place(id).name; node('tg-photo-caption').textContent = metadata.caption;
  for (const [target, text, url] of [['tg-photo-source', metadata.author, metadata.source], ['tg-photo-license', metadata.license, metadata.licenseUrl]]) { const link = node(target); link.textContent = text; link.setAttribute('href', url); }
  image.hidden = true; image.alt = metadata.alt; node('tg-photo-state').hidden = false; node('tg-photo-message').textContent = '实景照片正在展开…'; button('tg-photo-retry').hidden = true;
  image.onload = () => { if (photoId !== id || !photo.open) return; image.hidden = false; node('tg-photo-state').hidden = true; };
  image.onerror = () => { if (photoId !== id || !photo.open) return; node('tg-photo-message').textContent = '照片暂未加载，可以重试或继续走。'; button('tg-photo-retry').hidden = false; };
  photo.showModal(); photoMotion = enterDialog(photo, reduced); image.src = metadata.file;
  button('tg-photo-continue').textContent = journey.mode.kind === 'photo' && journey.mode.resume.kind === 'finished' ? '回到终点' : id === 'halfway' && journey.day === 1 ? '在中途客栈歇脚 →' : id === 'tinas' ? '看看江边支线 →' : '继续走 →';
  audio.pause(); cancelAnimationFrame(animation); animation = 0;
}
function closePhoto(continueWalk: boolean): void {
  if (!photo.open) return; photoMotion(); image.onload = image.onerror = null; photo.close(); photoId = null;
  journey.closePhoto(continueWalk); sync(); lastTime = 0; loop(); resumeAudio();
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
  const near = markers.find(m => journey.visited.has(m.id) && markerOnLeg(m.id) && markerDistance(m.id) < 110);
  const nextUI = `${ready}:${journey.day}:${mode.kind}:${mode.kind === 'photo' || mode.kind === 'game' ? mode.id : ''}:${chapter()}:${scene.mode}:${near?.id}:${journey.earned.size}`;
  if (uiKey === nextUI) return; uiKey = nextUI;
  button('tg-follow').disabled = button('tg-overview').disabled = !ready;
  button('tg-follow').setAttribute('aria-pressed', String(scene.mode === 'follow')); button('tg-overview').setAttribute('aria-pressed', String(scene.mode === 'overview'));
  node('tg-chapter').textContent = `第${journey.day === 1 ? '一' : '二'}天 / ${chapter()}`;
  map.dataset.leg = journey.leg; map.dataset.pose = mode.kind; map.dataset.day = String(journey.day); map.dataset.view = scene.mode;
  const endMarker = markers.find(m => m.id === 'tinas')?.element;
  endMarker?.setAttribute('aria-label', journey.leg === 'return' ? '中峡客栈 · 返回终点' : '中峡客栈 · 高路终点与支线返回点');
  endMarker?.querySelector('small')?.replaceChildren(journey.leg === 'return' ? '返回终点' : '高路终点');
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
      activeEvent = mode.id; cancelAnimationFrame(animation); animation = 0; art.show(EVENTS[mode.id].entry, EVENTS[mode.id].place);
    });
  }
}
function tick(now: number): void {
  animation = 0; if (disposed || !ready || document.hidden || art.open || photo.open) return;
  const dt = lastTime ? Math.min(.05, Math.max(0, (now - lastTime) / 1000)) : 0; lastTime = now;
  journey.tick(dt); audio.update(journey, dt); projection = scene.paint(journey, dt, reduced); position(projection); sync(); loop();
}
function resize(): void { const rect = map.getBoundingClientRect(); scene.resize(rect.width, rect.height); if (ready) { projection = scene.paint(journey, 0, reduced); position(projection); } }
walk.addEventListener('click', () => { if (journey.mode.kind === 'finished') openJournal(); else journey.toggle(); sync(); loop(); }, { signal });
button('tg-journal').addEventListener('click', openJournal, { signal });
button('tg-reopen').addEventListener('click', () => { const near = markers.find(m => journey.visited.has(m.id) && markerOnLeg(m.id) && markerDistance(m.id) < 110); if (near) { journey.openPhoto(near.id); sync(); } }, { signal });
for (const [id, view] of [['tg-follow', 'follow'], ['tg-overview', 'overview']] satisfies [string, View][]) button(id).addEventListener('click', () => { scene.setView(view); sync(); }, { signal });
button('tg-take-branch').addEventListener('click', () => { journey.chooseBranch(true); sync(); }, { signal });
button('tg-finish-high').addEventListener('click', () => { journey.chooseBranch(false); sync(); }, { signal });
button('tg-photo-continue').addEventListener('click', () => closePhoto(true), { signal });
button('tg-photo-close').addEventListener('click', () => closePhoto(false), { signal });
photo.addEventListener('cancel', event => { event.preventDefault(); closePhoto(false); }, { signal });
button('tg-photo-retry').addEventListener('click', () => { if (photoId) { const id = photoId; photoMotion(); photo.close(); showPhoto(id); } }, { signal });
button('tg-sound').addEventListener('click', () => {
  const token = ++audioToken, control = button('tg-sound');
  if (sound) { sound = false; audio.disable(); control.textContent = '声音 · 关'; control.setAttribute('aria-pressed', 'false'); return; }
  control.disabled = true;
  void audio.enable().then(() => { if (disposed || token !== audioToken) return; sound = true; control.textContent = '声音 · 开'; control.setAttribute('aria-pressed', 'true'); if (art.open || photo.open || journey.mode.kind === 'game') audio.pause(); }, () => { control.textContent = '声音 · 重试'; }).finally(() => { if (!disposed) control.disabled = false; });
}, { signal });
button('tg-retry').addEventListener('click', () => location.reload(), { signal });
document.addEventListener('keydown', event => {
  if (event.code === 'Escape' && discovery.pending) { event.preventDefault(); discovery.cancel(); journey.closeGame(false); sync(); resumeAudio(); return; }
  if (!ready || art.open || photo.open || journey.mode.kind === 'game' || event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement || event.target instanceof HTMLInputElement) return;
  if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) journey.toggle(); }
  else if (event.code === 'Escape' || event.code === 'ArrowLeft') journey.pause();
  else if (event.code === 'ArrowRight' && (journey.mode.kind === 'ready' || journey.mode.kind === 'paused')) journey.toggle();
  sync();
}, { signal });
canvas.addEventListener('pointerup', event => { if (event.button > 0 || !ready || art.open || photo.open || discovery.pending) return; if (journey.mode.kind === 'walking' || journey.mode.kind === 'paused' || journey.mode.kind === 'ready') journey.toggle(); sync(); }, { signal });
document.addEventListener('visibilitychange', () => { lastTime = 0; if (document.hidden) { cancelAnimationFrame(animation); animation = 0; journey.pause(); audio.pause(); } else { if (autostart && ready && journey.mode.kind === 'ready') { autostart = false; journey.toggle(); } loop(); resumeAudio(); } sync(); }, { signal });
reducedQuery.addEventListener('change', () => { reduced = reducedQuery.matches; }, { signal });
const observer = new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(resize, 80); });
window.addEventListener('pagehide', event => { lastTime = 0; cancelAnimationFrame(animation); animation = 0; audio.pause(); journey.pause(); if (event.persisted) return; disposed = true; audioToken++; lifecycle.abort(); observer.disconnect(); clearTimeout(resizeTimer); photoMotion(); art.dispose(); scene.destroy(); audio.destroy(); image.onload = image.onerror = null; }, { signal });
window.addEventListener('pageshow', event => { if (event.persisted) { sync(); loop(); } }, { signal });
void scene.load(signal).then(() => {
  if (signal.aborted || disposed) return; ready = true; loading.hidden = true; resize(); observer.observe(map);
  if (autostart && !document.hidden) { autostart = false; journey.toggle(); }
  sync(); loop();
}, error => { if (signal.aborted || disposed) return; scene.destroy(); node('tg-loading-copy').textContent = error instanceof Error ? error.message : '山路暂时未能展开。'; button('tg-retry').hidden = false; });
