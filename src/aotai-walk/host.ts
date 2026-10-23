import { ArtOverlay } from '../wugong-walk/art-overlay';
import { DiscoveryTransition } from '../wugong-walk/scroll/discovery-transition';
import { enterDialog, type CancelMotion } from '../wugong-walk/visible-motion';
import { createCharacterPicker } from '../characters/picker';
import type { AotaiGameId } from '../runtime/aotai-games/model';
import { AotaiAudio } from './audio';
import { AotaiJourney, CHECKPOINTS, CHECKPOINT_IDS, CUES, path, type CheckpointId } from './chapter';
import { PHOTOS } from './photos';
import { CAMP_IDS, MAIN_ORDER, PLACES, type PlaceId } from './geography';
import { layoutMapLabels, type LabelCandidate } from './labels';
import { AotaiScene, type AotaiView, type Projection } from './scene';

export function mountAotaiChapter() {
  const node = (id: string): HTMLElement => { const n = document.getElementById(id); if (!n) throw new Error(`鳌太线界面缺少 ${id}`); return n; };
  const button = (id: string): HTMLButtonElement => { const n = node(id); if (!(n instanceof HTMLButtonElement)) throw new Error(`鳌太线按钮无法读取 ${id}`); return n; };
  const canvasNode = node('ao-canvas'), photoNode = node('ao-photo'), photoImage = node('ao-photo-image');
  if (!(canvasNode instanceof HTMLCanvasElement) || !(photoNode instanceof HTMLDialogElement) || !(photoImage instanceof HTMLImageElement)) throw new Error('山路入口无法读取');
  const canvas = canvasNode, photo = photoNode, image = photoImage, map = node('ao-map'), walk = button('ao-walk');
  const lifecycle = new AbortController(), { signal } = lifecycle, reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const journey = new AotaiJourney(), scene = new AotaiScene(canvas), audio = new AotaiAudio(), discovery = new DiscoveryTransition(map, signal, CUES);
  let ready = false, disposed = false, animation = 0, lastTime = 0, reduced = reducedQuery.matches, sound = false, soundToken = 0;
  let overlay: { kind: 'journal' } | { kind: 'game'; id: AotaiGameId } | null = null;
  let phaseKey = '', uiKey = '', environmentKey = '', photoTicket = 0, photoMotion: CancelMotion = () => {};
  let autostart = new URLSearchParams(location.search).get('walk') === '1', resizeTimer = 0;
  const art = new ArtOverlay(signal, result => {
    const closing = overlay; overlay = null;
    if (closing?.kind === 'game') journey.closeGame(closing.id, result.collected > 0);
    sync(); lastTime = 0; loop(); resumeAudio();
  }, 'ao', { soft: true, page: 'aotai-art.html', version: 'painterly-6' });
  const characters = createCharacterPicker({ trigger: button('ao-character'), signal,
    current: () => scene.character,
    beforeOpen() { if (!ready || disposed || art.open || photo.open || discovery.pending || journey.phase.kind === 'game') return false; journey.pause(); stop(); audio.pause(); sync(); return true; },
    apply: (id, selectionSignal) => scene.setCharacter(id, selectionSignal),
    afterClose() { if (disposed) return; lastTime = 0; resize(); sync(); loop(); resumeAudio(); },
  });
  const icons = {
    house: '<path d="m4 15 12-10 12 10M7 13v14h18V13M13 27V17h6v10"/>',
    ridge: '<path d="m3 26 9-15 7 9 6-15 5 21H3Z"/>',
    flag: '<path d="M8 28V5l18 4-18 8M4 28h13"/>',
    tent: '<path d="m3 27 13-21 13 21ZM10 27l6-12 6 12M13 6h6"/>',
  };
  const markers = CHECKPOINT_IDS.map(id => {
    const p = CHECKPOINTS[id], element = document.createElement('button'); element.type = 'button'; element.className = 'ao-marker'; element.dataset.place = p.place;
    element.setAttribute('aria-label', `${p.name} · ${PHOTOS[id].locality === 'regional' ? '区域实景参考' : '实景打卡'}`);
    element.innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true">${icons[p.icon]}</svg><span>${p.name}</span>`;
    element.addEventListener('click', () => { if (!blocked()) { journey.openPhoto(id); sync(); } }, { signal });
    node('ao-markers').append(element);
    return { id, key: p.place, element, at: PLACES[p.place], rank: p.place === 'baxian' ? 1 : 3, icon: true, labelWidth: p.name.length * 11 + 12 };
  });
  const placeIds: PlaceId[] = [...MAIN_ORDER, 'baxian'];
  const geography = placeIds.filter(id => !CHECKPOINT_IDS.some(key => CHECKPOINTS[key].place === id)).map(id => {
    const p = PLACES[id], element = document.createElement('span'), endpoint = id === 'tangkou' || id === 'tangyu', camp = CAMP_IDS.some(key => key === id);
    const label = id === 'tangkou' ? '塘口村 · 起点' : p.name;
    element.className = endpoint || camp ? 'ao-marker ao-landmark-icon' : 'ao-landmark'; element.dataset.place = id;
    element.innerHTML = endpoint || camp ? `<svg viewBox="0 0 32 32" aria-hidden="true">${icons[camp ? 'tent' : 'flag']}</svg><span>${label}</span>` : label;
    if (camp) { const note = document.createElement('small'); note.textContent = `第${CAMP_IDS.findIndex(key => key === id) + 1}夜`; element.querySelector('span')?.append(note); }
    node('ao-markers').append(element);
    return { key: id, element, at: p, rank: endpoint || camp ? 0 : id === 'aoshan' || id === 'pyramid' ? 1 : p.rank + 3, icon: endpoint || camp, labelWidth: label.length * 11 + 12 };
  });
  function blocked(): boolean { return !ready || disposed || art.open || photo.open || characters.open || discovery.pending || journey.phase.kind === 'game'; }
  function stop(): void { cancelAnimationFrame(animation); animation = 0; lastTime = 0; }
  function loop(): void { if (ready && !disposed && !document.hidden && !art.open && !photo.open && !characters.open && !animation) animation = requestAnimationFrame(frame); }
  function resumeAudio(): void { if (sound && !document.hidden && !blocked()) audio.resume(); }
  function openJournal(): void { if (blocked()) return; overlay = { kind: 'journal' }; stop(); audio.pause(); art.show(undefined, undefined, scene.character); }
  function position(projection: Projection): void {
    discovery.position(projection.toScreen(journey.point), projection.width, projection.height);
    const candidates: LabelCandidate[] = [], all = [...markers, ...geography];
    for (const label of all) {
      const p = projection.toScreen(label.at), near = Math.hypot(label.at.x - journey.point.x, label.at.y - journey.point.y) < 950;
      if (scene.mode === 'follow' && !near || p.x < 0 || p.x > projection.width || p.y < 15 || p.y > projection.height - 20) continue;
      const width = Math.max(label.icon ? 48 : 0, label.labelWidth);
      candidates.push({ id: label.key, x: Math.max(width / 2 + 9, Math.min(projection.width - width / 2 - 9, p.x)), y: p.y + (label.icon ? scene.mode === 'follow' ? -105 : -35 : 22), width, height: label.icon ? 65 : 22, rank: label.rank });
    }
    const positions = layoutMapLabels(candidates, projection.width, projection.height);
    for (const label of all) {
      const p = positions.get(label.key); label.element.hidden = !p;
      if (p) { label.element.style.left = `${p.x}px`; label.element.style.top = `${p.y}px`; }
    }
    for (const marker of markers) { marker.element.disabled = !journey.visited.has(marker.id); marker.element.dataset.visited = String(journey.visited.has(marker.id)); marker.element.dataset.label = 'below'; }
  }
  function loadPhoto(id: CheckpointId): void {
    const metadata = PHOTOS[id], ticket = ++photoTicket;
    node('ao-photo-title').textContent = CHECKPOINTS[id].name; node('ao-photo-caption').textContent = metadata.caption;
    for (const [target, text, url] of [['ao-photo-source', metadata.author, metadata.source], ['ao-photo-license', metadata.license, metadata.licenseUrl]]) { const link = node(target); link.textContent = text; link.setAttribute('href', url); }
    node('ao-photo-source').title = metadata.title; image.hidden = true; image.alt = metadata.alt; node('ao-photo-state').hidden = false; node('ao-photo-message').textContent = '实景照片正在展开…'; button('ao-photo-retry').hidden = true;
    image.onload = () => { if (disposed || ticket !== photoTicket || !photo.open) return; image.hidden = false; node('ao-photo-state').hidden = true; };
    image.onerror = () => { if (disposed || ticket !== photoTicket || !photo.open) return; node('ao-photo-message').textContent = '照片暂未加载，可以重试或继续山路。'; button('ao-photo-retry').hidden = false; };
    image.src = metadata.file;
  }
  function showPhoto(id: CheckpointId): void { stop(); audio.pause(); photo.showModal(); photoMotion = enterDialog(photo, reduced); loadPhoto(id); }
  function closePhoto(continueWalk: boolean): void {
    if (!photo.open) return; photoTicket++; photoMotion(); image.onload = image.onerror = null; photo.close(); journey.closePhoto(continueWalk); sync(); lastTime = 0; loop(); resumeAudio();
  }
  function chapter(): string {
    if (journey.phase.kind === 'finished') return '汤峪方向 · 这程山路已走完';
    if (journey.phase.kind === 'transfer') return '下板寺 → 汤峪方向 · 接驳出山';
    if (journey.camp) return `${PLACES[journey.camp].name} · ${journey.phase.kind === 'dawn' ? '清晨出发' : '过夜'}`;
    return path.section(journey.at);
  }
  function sync(): void {
    const phase = journey.phase, minute = Math.round(journey.minute / 10) * 10;
    const environment = `第${journey.day}程 ${Math.floor(minute / 60).toString().padStart(2, '0')}:${(minute % 60).toString().padStart(2, '0')} · ${phase.kind === 'night' ? '营地星夜' : phase.kind === 'dawn' ? '清晨微光' : journey.mist ? '山脊薄雾' : '冬日晴风'}`;
    if (environment !== environmentKey) { environmentKey = environment; node('ao-environment').textContent = environment; }
    const nextUI = `${ready}:${phase.kind}:${scene.mode}:${chapter()}:${journey.earned.size}:${journey.day}`;
    if (uiKey !== nextUI) {
      uiKey = nextUI; node('ao-chapter').textContent = chapter(); map.dataset.view = scene.mode; map.dataset.phase = phase.kind;
      for (const [id, view] of [['ao-follow', 'follow'], ['ao-overview', 'overview']]) { button(id).disabled = !ready; button(id).setAttribute('aria-pressed', String(scene.mode === view)); }
      walk.disabled = !ready || !['ready', 'walking', 'paused', 'resting', 'finished'].includes(phase.kind);
      walk.textContent = phase.kind === 'ready' ? '从塘口出发 →' : phase.kind === 'walking' ? '停下来看看' : phase.kind === 'paused' ? '继续走 →' : phase.kind === 'resting' ? '在这里歇一晚 →' : phase.kind === 'finished' ? '翻看这程手帐' : phase.kind === 'night' ? '山坳入夜…' : phase.kind === 'dawn' ? '清晨收好背包…' : '停留片刻';
      node('ao-night').hidden = phase.kind !== 'night' && phase.kind !== 'dawn';
      node('ao-night-title').textContent = phase.kind === 'dawn' ? '山色亮起来了' : '把脚步交给夜晚';
      node('ao-night-copy').textContent = phase.kind === 'dawn' ? `离开${journey.camp ? PLACES[journey.camp].name : '营地'}，继续下一程山路。` : `${journey.camp ? PLACES[journey.camp].name : '营地'}的帐篷留着一点暖光，夜风慢慢经过。`;
      node('ao-note').textContent = phase.kind === 'finished' ? `从塘口翻过山脊，经太白山下山，留下 ${journey.earned.size} 枚手绘记忆。` : phase.kind === 'resting' ? '卸下背包，坐一会儿。明早继续走。' : phase.kind === 'transfer' ? '徒步在下板寺结束，随后接驳往汤峪方向离山。' : phase.kind === 'game' || phase.kind === 'photo' ? '' : '山路慢慢展开，遇到风景就停一停。';
    }
    const nextPhase = phase.kind === 'game' || phase.kind === 'photo' ? `${phase.kind}:${phase.id}` : phase.kind;
    if (nextPhase === phaseKey) return; phaseKey = nextPhase; discovery.cancel();
    if (phase.kind === 'photo') showPhoto(phase.id);
    else if (phase.kind === 'game') {
      audio.pause(); audio.cue();
      discovery.show(phase.id, reduced, () => {
        if (disposed || journey.phase.kind !== 'game' || journey.phase.id !== phase.id) return;
        overlay = { kind: 'game', id: phase.id }; stop(); art.show(phase.id, CUES[phase.id].place, scene.character);
      });
    }
  }
  function frame(now: number): void {
    animation = 0; if (disposed || !ready || document.hidden || art.open || photo.open || characters.open) return;
    const dt = lastTime ? Math.min(.05, Math.max(0, (now - lastTime) / 1000)) : 0; lastTime = now;
    journey.tick(dt); audio.update(journey, dt); position(scene.paint(journey, dt, reduced)); sync(); loop();
  }
  function resize(): void { const r = map.getBoundingClientRect(); scene.resize(r.width, r.height); if (ready) position(scene.paint(journey, 0, reduced)); }
  walk.addEventListener('click', () => { if (journey.phase.kind === 'finished') openJournal(); else journey.toggle(); sync(); loop(); resumeAudio(); }, { signal });
  button('ao-journal').addEventListener('click', openJournal, { signal });
  for (const [id, view] of [['ao-follow', 'follow'], ['ao-overview', 'overview']] satisfies [string, AotaiView][]) button(id).addEventListener('click', () => { scene.mode = view; sync(); loop(); }, { signal });
  button('ao-photo-continue').addEventListener('click', () => closePhoto(true), { signal }); button('ao-photo-close').addEventListener('click', () => closePhoto(false), { signal });
  photo.addEventListener('cancel', event => { event.preventDefault(); closePhoto(false); }, { signal });
  button('ao-photo-retry').addEventListener('click', () => { if (journey.phase.kind === 'photo') loadPhoto(journey.phase.id); }, { signal });
  button('ao-sound').addEventListener('click', () => {
    const token = ++soundToken, control = button('ao-sound');
    if (sound) { sound = false; audio.disable(); control.textContent = '声音 · 关'; control.setAttribute('aria-pressed', 'false'); return; }
    control.disabled = true;
    void audio.enable().then(() => { if (disposed || token !== soundToken) return; sound = true; control.textContent = '声音 · 开'; control.setAttribute('aria-pressed', 'true'); if (blocked()) audio.pause(); }, () => { if (!disposed) control.textContent = '声音 · 重试'; }).finally(() => { if (!disposed) control.disabled = false; });
  }, { signal });
  button('ao-retry').addEventListener('click', () => location.reload(), { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && discovery.pending && journey.phase.kind === 'game') { const id = journey.phase.id; event.preventDefault(); discovery.cancel(); journey.closeGame(id, false); sync(); resumeAudio(); return; }
    if (blocked() || event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement || event.target instanceof HTMLInputElement) return;
    if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) journey.toggle(); }
    else if (event.key === 'Escape' || event.key === 'ArrowLeft') journey.pause();
    else if (event.key === 'ArrowRight' && (journey.phase.kind === 'ready' || journey.phase.kind === 'paused')) journey.toggle(); sync(); loop();
  }, { signal });
  let mapPress: { id: number; x: number; y: number } | null = null;
  canvas.addEventListener('pointerdown', event => { if (event.isPrimary && event.button === 0 && !blocked()) mapPress = { id: event.pointerId, x: event.clientX, y: event.clientY }; }, { signal });
  canvas.addEventListener('pointercancel', () => { mapPress = null; }, { signal });
  canvas.addEventListener('pointerup', event => {
    const press = mapPress; mapPress = null;
    if (!press || press.id !== event.pointerId || event.button > 0 || blocked() || Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) return;
    journey.toggle(); sync(); loop();
  }, { signal });
  reducedQuery.addEventListener('change', () => { reduced = reducedQuery.matches; }, { signal });
  const observer = new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = window.setTimeout(resize, 80); });
  void scene.load(signal).then(() => { if (disposed || signal.aborted) return; ready = true; node('ao-loading').hidden = true; resize(); observer.observe(map); characters.refresh(); if (autostart && !document.hidden) { autostart = false; journey.toggle(); } sync(); loop(); }, error => { if (disposed || signal.aborted) return; scene.destroy(); node('ao-loading-copy').textContent = error instanceof Error ? error.message : '山路暂未展开。'; button('ao-retry').hidden = false; });
  return {
    background() { stop(); audio.pause(); journey.pause(); sync(); },
    foreground() { if (disposed) return; lastTime = 0; if (autostart && ready && journey.phase.kind === 'ready') { autostart = false; journey.toggle(); } sync(); loop(); resumeAudio(); },
    dispose() { if (disposed) return; disposed = true; soundToken++; stop(); lifecycle.abort(); observer.disconnect(); clearTimeout(resizeTimer); discovery.cancel(); photoMotion(); art.dispose(); photo.close(); image.onload = image.onerror = null; scene.destroy(); audio.destroy(); },
  };
}
