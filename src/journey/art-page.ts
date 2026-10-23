import { chapterFor, ROUTE_SUMMARIES } from '../content/catalog';
import { ART_EVENTS } from '../content/art-events';
import { createDom } from '../runtime/dom';
import { createSceneManager } from '../runtime/scene-manager';
import { createJournalController } from '../runtime/journal-controller';
import { createMiniGameController } from '../runtime/mini-game-controller';
import { createRewardController } from '../runtime/reward-controller';
import { createMusicLayer, type MusicScene } from '../runtime/music-layer';
import type { ImageCache, JournalData, MiniApi, MiniPlatform, Moment, MomentCatalog, SoundPlayer } from '../runtime/contracts';
import { roundJournalArt } from '../runtime/journal-badge';
import { createTigerTrailGames } from '../runtime/tiger-trail/adapter';
import { TRAIL_GAMES } from '../runtime/tiger-trail/rules';
import { createTigerMemoryGames } from '../runtime/tiger-memories/adapter';
import { MEMORY_IDS, MEMORY_SPECS, MemoryState, memoryId } from '../runtime/tiger-memories/model';
import { roadWalk } from '../runtime/tiger-memories/road';
import { createAotaiGames } from '../runtime/aotai-games/adapter';
import { AOTAI_GAMES, AOTAI_IDS, aotaiGameId } from '../runtime/aotai-games/model';
import { createCoastMemories } from '../runtime/coast-memories/adapter';
import { COAST_MEMORIES, COAST_MEMORY_IDS, coastMemoryId } from '../runtime/coast-memories/model';
import { createSaiwanShoulder } from '../runtime/coast-memories/shoulder/adapter';
import { ShoulderState } from '../runtime/coast-memories/shoulder/model';
import { createTide } from '../runtime/coast-memories/tide/adapter';
import { artMessage, readArtMessage, type ArtSession } from './art-session';
import type { LegacySling } from '../runtime/mogan/rules';
import { createDayMemories } from '../runtime/day-memories/adapter';
import { DAY_MEMORIES } from '../runtime/day-memories/model';
import { createChangpingMemories } from '../runtime/changping-memories/adapter';
import { CHANGPING_MEMORY_IDS } from '../runtime/changping-memories/model';
import { createFrameLoop } from '../runtime/frame-loop';

interface ArtAudio extends SoundPlayer { enabled: boolean; enable(scene: MusicScene): Promise<boolean>; disable(): void; hide(): void; setScene(scene: MusicScene): void; destroy(): void }
interface ArtCatalog extends MomentCatalog { safeCaptureArt(value: unknown): string | null }
declare global {
  interface Window {
    TrailDiscoveries: ArtCatalog;
    TrailJournal: JournalData;
    TrailMicroMoments: MiniApi;
    TrailArtGames: LegacySling;
    TrailMiniGames: MiniPlatform & { enhance(api: MiniApi): MiniApi };
    TrailImageCache: { create(image: typeof Image): ImageCache };
    TrailAudio: { create(options: { AudioContext: typeof AudioContext; navigator: Navigator; fetch: typeof fetch; timers: Window; createMusic: typeof createMusicLayer; onError(): void; onStateChange(): void }): ArtAudio };
    TrailRouteMoments: { evidence(id: string): { name: string; url: string; fact: string } | null };
    PIXI: unknown;
  }
}
const dom = createDom(document), { get: $ } = dom;
const query = new URLSearchParams(location.search), id = query.get('entry');
const sessionId = query.get('session');
const session: ArtSession | null = sessionId ? { session: sessionId, entry: id } : null;
document.body.dataset.embedded = String(window.parent !== window);
function notifyParent(type: 'ready' | 'collected' | 'close') {
  if (window.parent !== window && session) window.parent.postMessage(type === 'ready' ? artMessage(session, type) : artMessage(session, type, collected), location.origin);
}
const chapter = chapterFor(document.body.dataset.route ?? 'wugong');
if (!chapter) throw new Error('无法读取这段旅程');
const routeId = chapter.id, mapPage = chapter.mapPage, events = ART_EVENTS[routeId];
const allowed = new Set<string>([...events.map(event => event.entry), ...(routeId === 'tiger' ? Object.keys(TRAIL_GAMES) : [])]);
const place = events.find(event => event.entry === id)?.place ?? null;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let disposed = false, closing = false, collected = 0;
let pending: Moment | null = null;
let storage: Storage | null = null; try { storage = localStorage; } catch { /* The journal remains readable in this page session. */ }
const catalog = window.TrailDiscoveries, games = window.TrailMiniGames;
const scenes = createSceneManager({ status: () => 'paused', pause() {}, resume() {}, hidden: () => document.hidden });
const cache = window.TrailImageCache.create(Image);

function returnToMap(): void {
  if (disposed) return;
  if (window.parent !== window) notifyParent('close');
  else location.href = mapPage;
}
function stopLoop(): void { clock.stop(); }
function ensureLoop(): void { clock.ensure(); }
function audioScene(): MusicScene & { gorgeOpenness?: number; riverApproach?: number; coastOpenness?: number } {
  const current = mini.state, phase = current instanceof MemoryState && current.session.kind === 'bends' ? current.session.phase : null;
  return { routeId, mode: reward.open ? 'reward' : mini.active ? 'moment' : 'silent', momentId: current?.id ?? pending?.id, momentGame: phase?.kind === 'river' ? 'tiger-river' : mini.soundTheme ?? null, ...(phase ? { gorgeOpenness: roadWalk(phase), riverApproach: phase.kind === 'river' ? Math.min(1, phase.elapsed) : 0 } : {}), ...(current instanceof ShoulderState ? { coastOpenness: current.cameraProgress } : {}) };
}
function refresh(): void {
  if (disposed) return;
  audio.setScene(audioScene());
  if (closing && !mini.active && !reward.open) { pending = null; returnToMap(); return; }
  ensureLoop();
}
const audio = window.TrailAudio.create({ AudioContext, navigator, fetch: fetch.bind(window), timers: window, createMusic: createMusicLayer, onError() { $('mini-sound').textContent = '声音未能开启，再试一次'; }, onStateChange() {} });
const reward = createRewardController({ dom, scenes, catalog, cache, audio, reduced, autoCollect: true, presentArt: roundJournalArt, gameKind: entryId => routeId === 'aotai' ? aotaiGameId(entryId) ? AOTAI_GAMES[entryId].game : undefined : routeId === 'tiger' ? memoryId(entryId) ? MEMORY_SPECS[entryId].game : TRAIL_GAMES[entryId] : routeId === 'maclehose' && entryId === 'coast-sand' ? 'footsteps' : routeId === 'maclehose' && coastMemoryId(entryId) ? COAST_MEMORIES[entryId].game : games.kinds[entryId], refresh, stopLoop,
  onCollected(moment) {
    const saved = journal.remember(moment);
    if (saved.kind === 'error') { $('reward-copy').textContent = saved.message; return false; }
    $('reward-copy').textContent = '已收进手帐'; collected = 1; pending = null;
    notifyParent('collected');
    return true;
  },
});
const journal = createJournalController({ dom, scenes, catalog, data: window.TrailJournal, routes: ROUTE_SUMMARIES,
  weather: { clear: { name: '晴' }, cloud: { name: '多云' }, mist: { name: '薄雾' }, drizzle: { name: '小雨' } },
  storage, reduced, presentArt: roundJournalArt, tripCount: () => collected, rewardOpen: () => reward.open,
  pauseInteraction: () => mini.pause(), stopLoop, refresh, onRemember() {},
  evidence: entryId => window.TrailRouteMoments.evidence(entryId), observation: () => null, source: () => null,
});
const legacyMini = games.enhance(window.TrailMicroMoments);
const mini = createMiniGameController({ dom, scenes, api: legacyMini, platform: games, pixi: window.PIXI, catalog, cache, audio, reduced,
  svg(tag, attributes, parent) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
    parent?.appendChild(node); return node;
  },
  sound: () => audio.enabled, async toggleSound() { if (audio.enabled) audio.disable(); else await audio.enable(audioScene()); refresh(); },
  stopLoop, ensureLoop, refresh,
  onFinished(finished) {
    const outcome = finished.outcome, entry = finished.entry;
    if (!allowed.has(entry.id) || outcome.id !== entry.id || outcome.edition !== 3 || !outcome.earned) return false;
    const captureArt = outcome.captureArt ? catalog.safeCaptureArt(outcome.captureArt) : null;
    if (outcome.captureArt && !captureArt) return false;
    const now = Date.now();
    pending = { key: `${now}-${routeId}-${entry.id}`, id: entry.id, route: routeId, edition: 3, earned: true,
      title: outcome.title, memory: outcome.memory, icon: entry.icon, tag: entry.tag, place: place ?? entry.place,
      ...(entry.artV5 ? { artVersion: 5 } : entry.artV4 ? { artVersion: 4 } : {}), createdAt: now,
      ...(captureArt ? { captureArt, artSource: outcome.artSource } : {}),
    };
    return reward.show(pending, 'paused');
  },
  onClosed() { closing = true; },
});
const tigerGames = routeId === 'tiger' ? createTigerTrailGames({ dom, riverArrived: true, onAction: (name, value) => mini.action(name, value) }) : null;
if (tigerGames) mini.registerGame(Object.keys(TRAIL_GAMES), tigerGames.adapter);
const tigerMemories = routeId === 'tiger' ? createTigerMemoryGames(dom, name => mini.action(name)) : null;
if (tigerMemories) mini.registerGame(MEMORY_IDS, tigerMemories.adapter);
if (routeId === 'aotai') mini.registerGame(AOTAI_IDS, createAotaiGames(dom));
if (routeId === 'maclehose') {
  mini.registerGame(COAST_MEMORY_IDS, createCoastMemories(dom, name => mini.action(name)));
  mini.registerGame(['coast-sand'], createSaiwanShoulder(dom));
  mini.registerGame(['coast-shell'], createTide(dom));
}
if (routeId === 'changping' || routeId === 'mogan' || routeId === 'westlake') mini.registerGame(Object.keys(DAY_MEMORIES), createDayMemories(dom, audio));
if (routeId === 'changping') mini.registerGame(CHANGPING_MEMORY_IDS, createChangpingMemories(dom, audio));
const clock = createFrameLoop({ request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id), maxDelta: .05, active: () => !disposed && !document.hidden && mini.active, update: frame });
let soundElapsed = 0;
function frame(dt: number): void {
  mini.update(dt);
  soundElapsed += dt;
  if (soundElapsed > .18 && (mini.state instanceof ShoulderState || mini.state instanceof MemoryState && mini.state.session.kind === 'bends')) { audio.setScene(audioScene()); soundElapsed = 0; }
}
function destroy(): void {
  if (disposed) return; disposed = true; stopLoop(); mini.destroy(); tigerGames?.destroy(); tigerMemories?.destroy(); reward.destroy(); journal.destroy(); audio.destroy();
}
$('walk-toggle').addEventListener('click', () => { destroy(); if (window.parent !== window) notifyParent('close'); else location.href = mapPage; });
window.addEventListener('message', event => { if (event.source === window.parent && event.origin === location.origin && readArtMessage(event.data, session)?.type === 'dispose') destroy(); });
window.addEventListener('keydown', event => { if (reward.handleKey(event)) return; if (event.key === 'Escape' && !journal.open) { event.preventDefault(); $('walk-toggle').click(); } });
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopLoop(); mini.pause(); audio.hide(); scenes.suspend(); } else { scenes.foreground(); ensureLoop(); } });
window.addEventListener('pagehide', destroy);
journal.render();
if (id && allowed.has(id)) {
  if (routeId === 'maclehose') $('art-page-title').textContent = id === 'coast-sand' ? '转角见海' : '海岸手绘';
  $('art-journal-wall').hidden = true;
  const original = catalog.item(id), currentPlace = place;
  mini.begin(currentPlace ? { ...original, place: currentPlace, memory: original.memory.replace(original.place, currentPlace) } : original, 'paused');
} else $('art-page-title').textContent = '旅行手帐';
notifyParent('ready');
