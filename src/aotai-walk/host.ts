import { LandmarkLayer, type MapLandmark } from '../journey/landmark-layer';
import { LandmarkNameLayer } from '../journey/landmark-name-layer';
import { observeMapSize } from '../journey/viewport';
import { ArtOverlay } from '../journey/art-overlay';
import { DiscoveryTransition } from '../journey/discovery-transition';
import { createPhotoDialog } from '../journey/photo-dialog';
import { createFrameLoop } from '../runtime/frame-loop';
import { createCharacterPicker } from '../characters/picker';
import type { AotaiGameId } from '../runtime/aotai-games/model';
import { AotaiAudio } from './audio';
import { AotaiJourney, CHECKPOINTS, CHECKPOINT_IDS, CUES, path, type CheckpointId } from './chapter';
import { PHOTOS } from './photos';
import { CAMP_IDS, MAIN_ORDER, PLACES, type PlaceId } from './geography';
import { AotaiScene, type AotaiView, type Projection } from './scene';

export function mountAotaiChapter() {
  const node = (id: string): HTMLElement => { const n = document.getElementById(id); if (!n) throw new Error(`鳌太线界面缺少 ${id}`); return n; };
  const button = (id: string): HTMLButtonElement => { const n = node(id); if (!(n instanceof HTMLButtonElement)) throw new Error(`鳌太线按钮无法读取 ${id}`); return n; };
  const canvas = node('ao-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) throw new Error('山路入口无法读取');
  const map = node('ao-map'), walk = button('ao-walk');
  const lifecycle = new AbortController(), { signal } = lifecycle, reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const journey = new AotaiJourney(), scene = new AotaiScene(canvas), audio = new AotaiAudio(), discovery = new DiscoveryTransition(map, signal, CUES);
  let ready = false, disposed = false, reduced = reducedQuery.matches, sound = false, soundToken = 0;
  let overlay: { kind: 'journal' } | { kind: 'game'; id: AotaiGameId } | null = null;
  let phaseKey = '', uiKey = '', environmentKey = '';
  let autostart = new URLSearchParams(location.search).get('walk') === '1';
  const photo = createPhotoDialog({ prefix: 'ao', signal, reduced: () => reduced, onClose(continueWalk) { journey.closePhoto(continueWalk); sync(); stop(); loop(); resumeAudio(); } });
  const art = new ArtOverlay(signal, result => {
    const closing = overlay; overlay = null;
    if (closing?.kind === 'game') journey.closeGame(closing.id, result.collected > 0);
    sync(); stop(); loop(); resumeAudio();
  }, 'ao', { soft: true, chapter: 'aotai', version: 'painterly-6' });
  const characters = createCharacterPicker({ trigger: button('ao-character'), signal,
    current: () => scene.character,
    beforeOpen() { if (!ready || disposed || art.open || photo.open || discovery.pending || journey.phase.kind === 'game') return false; journey.pause(); stop(); audio.pause(); sync(); return true; },
    apply: (id, selectionSignal) => scene.setCharacter(id, selectionSignal),
    afterClose() { if (disposed) return; stop(); resize(); sync(); loop(); resumeAudio(); },
  });
  const restPlaces: PlaceId[] = ['tangkou', ...CAMP_IDS, 'tangyu'];
  const photoAt = (id: PlaceId): CheckpointId | undefined => CHECKPOINT_IDS.find(key => CHECKPOINTS[key].place === id);
  const landmarkPlaces: MapLandmark<PlaceId>[] = [
    ...CHECKPOINT_IDS.map(id => {
      const p = CHECKPOINTS[id];
      return { id:p.place, name:p.name, point:PLACES[p.place], symbol:p.symbol,
        ariaLabel:`${p.name} · ${PHOTOS[id].locality === 'regional' ? '区域实景参考' : '实景打卡'}` };
    }),
    ...restPlaces.map((id): MapLandmark<PlaceId> => ({
      id,name:PLACES[id].name,point:PLACES[id],symbol:CAMP_IDS.some(key=>key===id)?'camp':'village',
      importance:CAMP_IDS.some(key=>key===id)?'secondary':'primary',
      caption:id==='tangkou'?'起点':id==='tangyu'?'接驳出山':`第${CAMP_IDS.findIndex(key=>key===id)+1}夜`,
    })),
  ];
  const markers=new LandmarkLayer({container:node('ao-markers'),className:'ao-marker',signal,places:landmarkPlaces,
    onSelect(id){const checkpoint=photoAt(id);if(checkpoint&&!blocked()){journey.openPhoto(checkpoint);sync();}},
  });
  const placeIds: PlaceId[] = [...MAIN_ORDER, 'baxian'];
  const labelRank = (id: PlaceId): number => id === 'aoshan' || id === 'pyramid' ? 1 : PLACES[id].rank + 3;
  const geography = new LandmarkNameLayer({ container: node('ao-markers'),
    places: placeIds.filter(id => !landmarkPlaces.some(p => p.id === id)).sort((a, b) => labelRank(a) - labelRank(b))
      .map(id => ({ id, name: PLACES[id].name, point: PLACES[id] })),
  });
  function blocked(): boolean { return !ready || disposed || art.open || photo.open || characters.open || discovery.pending || journey.phase.kind === 'game'; }
  const clock = createFrameLoop({ request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id), maxDelta: .05, active: () => ready && !disposed && !document.hidden && !art.open && !photo.open && !characters.open, update: frame });
  function stop(): void { clock.stop(); }
  function loop(): void { clock.ensure(); }
  function resumeAudio(): void { if (sound && !document.hidden && !blocked()) audio.resume(); }
  function openJournal(): void { if (blocked()) return; overlay = { kind: 'journal' }; stop(); audio.pause(); art.show(undefined, undefined, scene.character); }
  function position(projection: Projection): void {
    discovery.position(projection.toScreen(journey.point), projection.width, projection.height);
    const occupied=markers.update(projection,scene.mode,place=>{
      const checkpoint=photoAt(place.id);
      return{
        visible:scene.mode==='overview'||Math.hypot(place.point.x-journey.point.x,place.point.y-journey.point.y)<950,
        enabled:checkpoint!==undefined&&journey.visited.has(checkpoint),
        visited:checkpoint!==undefined?journey.visited.has(checkpoint):journey.at>=path.at(place.id),
      };
    });
    geography.update(projection, scene.mode, place => scene.mode === 'overview'
      || Math.hypot(place.point.x - journey.point.x, place.point.y - journey.point.y) < 950, occupied);
  }

  function showPhoto(id: CheckpointId): void { stop(); audio.pause(); photo.show({ name: CHECKPOINTS[id].name, photo: PHOTOS[id], checkpoint: id }); }
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
  function frame(dt: number): void {
    journey.tick(dt); audio.update(journey, dt); position(scene.paint(journey, dt, reduced)); sync();
  }
  function resize(): void { const r = map.getBoundingClientRect(); scene.resize(r.width, r.height); if (ready) position(scene.paint(journey, 0, reduced)); }
  walk.addEventListener('click', () => { if (journey.phase.kind === 'finished') openJournal(); else journey.toggle(); sync(); loop(); resumeAudio(); }, { signal });
  button('ao-journal').addEventListener('click', openJournal, { signal });
  for (const [id, view] of [['ao-follow', 'follow'], ['ao-overview', 'overview']] satisfies [string, AotaiView][]) button(id).addEventListener('click', () => { scene.mode = view; sync(); loop(); }, { signal });
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

  void scene.load(signal).then(() => { if (disposed || signal.aborted) return; ready = true; node('ao-loading').hidden = true; resize(); observeMapSize(map, signal, resize); characters.refresh(); if (autostart && !document.hidden) { autostart = false; journey.toggle(); } sync(); loop(); }, error => { if (disposed || signal.aborted) return; scene.destroy(); node('ao-loading-copy').textContent = error instanceof Error ? error.message : '山路暂未展开。'; button('ao-retry').hidden = false; });
  return {
    background() { stop(); audio.pause(); journey.pause(); sync(); },
    foreground() { if (disposed) return; stop(); if (autostart && ready && journey.phase.kind === 'ready') { autostart = false; journey.toggle(); } sync(); loop(); resumeAudio(); },
    dispose() { if (disposed) return; disposed = true; soundToken++; stop(); lifecycle.abort();  discovery.cancel(); art.dispose(); photo.dispose(); scene.destroy(); audio.destroy(); },
  };
}
