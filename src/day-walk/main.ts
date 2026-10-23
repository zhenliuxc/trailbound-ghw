import { dayRouteFor } from '../content/day-routes';
import { DayJourney, DayTrail, type DayPlace, type DayRoute } from '../journey/day-route';
import { DayScene } from './scene';
import { DayAudio } from './audio';
import { observeMapSize } from '../journey/viewport';
import { ArtOverlay } from '../journey/art-overlay';
import { DiscoveryTransition } from '../journey/discovery-transition';
import { createPhotoDialog } from '../journey/photo-dialog';
import type { MapProjection, MapView } from '../journey/map-camera';
import { createFrameLoop } from '../runtime/frame-loop';
import { createCharacterPicker } from '../characters/picker';
import { LandmarkLayer } from '../journey/landmark-layer';
import { createGlimpseController } from '../journey/look-here/controller';

function mountDay(route: DayRoute) {
  const node = (id: string): HTMLElement => { const element = document.getElementById(`day-${id}`); if (!element) throw new Error(`山径界面缺少 ${id}`); return element; };
  const button = (id: string): HTMLButtonElement => { const element = node(id); if (!(element instanceof HTMLButtonElement)) throw new Error(`山径按钮无法读取 ${id}`); return element; };
  const canvas = node('canvas'); if (!(canvas instanceof HTMLCanvasElement)) throw new Error('山径画面入口无法读取');
  const map = node('map'), walk = button('walk'), lifecycle = new AbortController(), { signal } = lifecycle;
  const trail = new DayTrail(route), journey = new DayJourney(trail), scene = new DayScene(canvas, trail), audio = new DayAudio(route.id);
  const discovery = new DiscoveryTransition(map, signal, Object.fromEntries(route.events.map(event => [event.entry, event])));
  const reducedQuery = matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = reducedQuery.matches, ready = false, disposed = false, sound = false, soundToken = 0;
  let overlay: { kind: 'journal' } | { kind: 'game'; entry: string } | null = null;
  let phaseKey = '', uiKey = '', environmentKey = '', autostart = new URLSearchParams(location.search).get('walk') === '1';
  const photo = createPhotoDialog({ prefix: 'day', signal, reduced: () => reduced, onClose(continueWalk) { journey.closePhoto(continueWalk); sync(); clock.stop(); clock.ensure(); resumeAudio(); } });
  const art = new ArtOverlay(signal, result => {
    const closing = overlay; overlay = null;
    if (closing?.kind === 'game') journey.closeGame(closing.entry, result.entry === closing.entry && result.collected > 0);
    sync(); clock.stop(); clock.ensure(); resumeAudio();
  }, 'day', { soft: true, chapter: route.id, version: route.id === 'changping' ? 'changping-autumn-4' : route.id === 'westlake' ? 'westlake-scene-journey-3' : 'remaining-routes-1' });
  const characters = createCharacterPicker({ trigger: button('character'), signal, current: () => scene.character,
    beforeOpen() { if (blocked()) return false; journey.pause(); clock.stop(); audio.pause(); sync(); return true; },
    apply: (id, selectionSignal) => scene.setCharacter(id, selectionSignal),
    afterClose() { if (disposed) return; clock.stop(); resize(); sync(); clock.ensure(); resumeAudio(); },
  });
  const markers = new LandmarkLayer({
    container: node('markers'), className: 'day-marker', signal,
    places: route.places.map((place, index) => ({
      id: place.id, name: place.name, symbol: place.symbol, point: trail.sample(trail.knotDistances[place.knot]),
      importance: place.photo || index === 0 || index === route.places.length - 1 ? 'primary' : 'secondary',
      labelSide: place.labelSide ?? (index % 2 ? 'above' : 'below'),
      caption: index === 0 ? route.itinerary === 'out-and-back' ? '起终点' : '起点'
        : index === route.places.length - 1 ? route.itinerary === 'out-and-back' ? '折返点' : '终点' : undefined,
      ariaLabel: `${place.name}${place.photo ? ' · 实景照片，到达后可查看' : ''}`,
    })),
    onSelect(id) { const place = route.places.find(place => place.id === id); if (place && !blocked()) { journey.openPhoto(place); sync(); } },
  });
  const glimpse = route.id === 'westlake' ? createGlimpseController({
    map, trail, signal, ready: () => ready, reduced: () => reduced, following: () => scene.mode === 'follow',
    available: () => !blocked(), capture: frame => scene.capture(frame),
    beforeOpen() { clock.stop(); audio.cue(); },
    afterClose() { if (disposed) return; resize(); sync(); clock.stop(); clock.ensure(); resumeAudio(); },
  }) : null;
  function blocked(): boolean { return !ready || disposed || art.open || photo.open || characters.open || !!glimpse?.open || discovery.pending || journey.phase.kind === 'game'; }
  const clock = createFrameLoop({ request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id), maxDelta: .05,
    active: () => ready && !disposed && !document.hidden && !art.open && !photo.open && !characters.open && !glimpse?.open,
    update(dt) { journey.tick(dt); audio.update(journey); position(scene.paint(journey, dt, reduced), dt); sync(); },
  });
  function resumeAudio(): void { if (sound && !blocked() && !document.hidden) audio.resume(); }
  function openJournal(): void { if (blocked()) return; overlay = { kind: 'journal' }; clock.stop(); audio.pause(); art.show(undefined, undefined, scene.character); }
  function position(projection: MapProjection, dt = 0): void {
    discovery.position(projection.toScreen(journey.point), projection.width, projection.height);
    markers.update(projection, scene.mode, place => ({
      visible: scene.mode === 'overview' || Math.hypot(place.point.x - journey.point.x, place.point.y - journey.point.y) < 950,
      enabled: journey.visited.has(place.id), visited: journey.visited.has(place.id),
    }));
    glimpse?.update(journey, projection, dt, !blocked() && !document.hidden && document.hasFocus() && journey.phase.kind === 'walking');
  }

  function showPhoto(place: DayPlace): void {
    if (!place.photo) return;
    const phase = journey.phase;
    clock.stop(); audio.pause(); photo.show({ name: place.name, photo: place.photo, checkpoint: place.id, continueLabel: phase.kind === 'photo' && !phase.arrival ? '回到山径' : route.itinerary === 'out-and-back' && journey.returning ? '沿来路返回 →' : '继续走 →' });
  }
  function sync(): void {
    const phase = journey.phase, minute = Math.round(journey.minute / 5) * 5;
    const environment = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')} · ${journey.weather.name}`;
    if (environmentKey !== environment) { environmentKey = environment; node('environment').textContent = environment; }
    const key = `${ready}:${phase.kind}:${scene.mode}:${journey.section}:${journey.earned.size}`;
    if (uiKey !== key) {
      uiKey = key; map.dataset.view = scene.mode; map.dataset.phase = phase.kind; node('chapter').textContent = journey.section;
      for (const mode of ['follow', 'overview'] satisfies MapView[]) { button(mode).disabled = !ready; button(mode).setAttribute('aria-pressed', String(scene.mode === mode)); }
      node('finish').hidden = phase.kind !== 'finished'; node('finish-copy').textContent = route.ending;
      walk.disabled = !ready || !['ready', 'walking', 'paused', 'finished'].includes(phase.kind);
      walk.textContent = phase.kind === 'ready' ? `从${route.places[0].name}出发 →` : phase.kind === 'walking' ? '停下来看看' : phase.kind === 'paused' ? '继续走 →' : phase.kind === 'finished' ? '翻看这程手帐' : '停留片刻';
      node('note').textContent = phase.kind === 'photo' || phase.kind === 'game' ? '' : phase.kind === 'finished' ? `留下 ${journey.earned.size} 段手绘记忆。` : phase.kind === 'paused' ? '停一停，听一会儿山里的声音。' : route.note;
    }
    const next = phase.kind === 'photo' ? `photo:${phase.place.id}` : phase.kind === 'game' ? `game:${phase.event.entry}` : phase.kind;
    if (next === phaseKey) return; phaseKey = next; discovery.cancel();
    if (phase.kind === 'photo') showPhoto(phase.place);
    else if (phase.kind === 'game') {
      audio.pause(); audio.cue();
      discovery.show(phase.event.entry, reduced, () => {
        if (disposed || journey.phase.kind !== 'game' || journey.phase.event.entry !== phase.event.entry) return;
        overlay = { kind: 'game', entry: phase.event.entry }; clock.stop(); art.show(phase.event.entry, phase.event.place, scene.character);
      });
    }
  }
  function resize(): void { const rect = map.getBoundingClientRect(); scene.resize(rect.width, rect.height); if (ready) position(scene.paint(journey, 0, reduced)); }
  if (glimpse) window.addEventListener('blur', () => { journey.pause(); sync(); }, { signal });
  walk.addEventListener('click', () => { if (blocked()) return; if (journey.phase.kind === 'finished') openJournal(); else journey.toggle(); sync(); clock.ensure(); resumeAudio(); }, { signal });
  button('journal').addEventListener('click', openJournal, { signal }); button('finish-journal').addEventListener('click', openJournal, { signal });
  for (const mode of ['follow', 'overview'] satisfies MapView[]) button(mode).addEventListener('click', () => { scene.mode = mode; sync(); clock.ensure(); }, { signal });
  button('retry').addEventListener('click', () => location.reload(), { signal });
  button('sound').addEventListener('click', () => {
    const token = ++soundToken, control = button('sound');
    if (sound) { sound = false; audio.disable(); control.textContent = '声音 · 关'; control.setAttribute('aria-pressed', 'false'); return; }
    control.disabled = true;
    void audio.enable().then(() => { if (disposed || token !== soundToken) return; sound = true; control.textContent = '声音 · 开'; control.setAttribute('aria-pressed', 'true'); if (blocked()) audio.pause(); }, () => { if (!disposed) control.textContent = '声音 · 重试'; }).finally(() => { if (!disposed) control.disabled = false; });
  }, { signal });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && discovery.pending && journey.phase.kind === 'game') { event.preventDefault(); const entry = journey.phase.event.entry; discovery.cancel(); journey.closeGame(entry, false); sync(); resumeAudio(); return; }
    if (blocked() || event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement || event.target instanceof HTMLInputElement) return;
    if (event.code === 'Space') { event.preventDefault(); if (!event.repeat) journey.toggle(); }
    else if (event.key === 'Escape' || event.key === 'ArrowLeft') journey.pause();
    else if (event.key === 'ArrowRight' && (journey.phase.kind === 'ready' || journey.phase.kind === 'paused')) journey.toggle();
    sync(); clock.ensure(); resumeAudio();
  }, { signal });
  let press: { id: number; x: number; y: number } | null = null;
  canvas.addEventListener('pointerdown', event => { if (event.isPrimary && event.button === 0 && !blocked()) press = { id: event.pointerId, x: event.clientX, y: event.clientY }; }, { signal });
  canvas.addEventListener('pointercancel', () => { press = null; }, { signal });
  canvas.addEventListener('pointerup', event => { const start = press; press = null; if (!start || start.id !== event.pointerId || blocked() || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return; journey.toggle(); sync(); clock.ensure(); resumeAudio(); }, { signal });
  reducedQuery.addEventListener('change', () => { reduced = reducedQuery.matches; }, { signal });
  void scene.load(signal).then(() => {
    if (disposed || signal.aborted) return; ready = true; node('loading').hidden = true; resize(); observeMapSize(map, signal, resize); characters.refresh();
    if (autostart && !document.hidden) { autostart = false; journey.toggle(); } sync(); clock.ensure();
  }, error => { if (disposed || signal.aborted) return; scene.destroy(); node('loading-copy').textContent = error instanceof Error ? error.message : '山径暂未展开。'; button('retry').hidden = false; });
  return {
    background() { clock.stop(); audio.pause(); journey.pause(); sync(); },
    foreground() { if (disposed) return; clock.stop(); if (autostart && ready && journey.phase.kind === 'ready') { autostart = false; journey.toggle(); } sync(); clock.ensure(); resumeAudio(); },
    dispose() { if (disposed) return; disposed = true; soundToken++; clock.stop(); lifecycle.abort(); glimpse?.dispose(); discovery.cancel(); art.dispose(); photo.dispose(); scene.destroy(); audio.destroy(); },
  };
}
const route = dayRouteFor(document.body.dataset.route);
if (!route) throw new Error('这条山径尚未展开');
const chapter = mountDay(route);
document.addEventListener('visibilitychange', () => document.hidden ? chapter.background() : chapter.foreground());
window.addEventListener('pagehide', event => event.persisted ? chapter.background() : chapter.dispose());
window.addEventListener('pageshow', event => { if (event.persisted) chapter.foreground(); });
