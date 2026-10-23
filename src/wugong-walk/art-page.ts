import { createDom } from '../runtime/dom';
import { createSceneManager } from '../runtime/scene-manager';
import { createJournalController } from '../runtime/journal-controller';
import { createMiniGameController } from '../runtime/mini-game-controller';
import { createRewardController } from '../runtime/reward-controller';
import { createMusicLayer, type MusicScene } from '../runtime/music-layer';
import type { ImageCache, JournalData, MiniApi, MiniPlatform, Moment, MomentCatalog, RouteSummary, SoundPlayer } from '../runtime/contracts';
import { roundJournalArt } from './badge-art';
import { storeEarnedMoment } from './scroll/camp-journal';
import { createTigerTrailGames } from '../runtime/tiger-trail/adapter';
import { TRAIL_GAMES } from '../runtime/tiger-trail/rules';
import { createTigerMemoryGames } from '../runtime/tiger-memories/adapter';
import { MEMORY_IDS, MEMORY_SPECS, MemoryState, memoryId } from '../runtime/tiger-memories/model';
import { roadWalk } from '../runtime/tiger-memories/road';

interface ArtAudio extends SoundPlayer { enabled: boolean; enable(scene: MusicScene): Promise<boolean>; disable(): void; hide(): void; setScene(scene: MusicScene): void; destroy(): void }
interface ArtCatalog extends MomentCatalog { safeCaptureArt(value: unknown): string | null }
declare global {
  interface Window {
    TrailDiscoveries: ArtCatalog;
    TrailJournal: JournalData;
    TrailMicroMoments: MiniApi;
    TrailMiniGames: MiniPlatform & { enhance(api: MiniApi): MiniApi };
    TrailImageCache: { create(image: typeof Image): ImageCache };
    TrailAudio: { create(options: { AudioContext: typeof AudioContext; navigator: Navigator; fetch: typeof fetch; timers: Window; createMusic: typeof createMusicLayer; onError(): void; onStateChange(): void }): ArtAudio };
    TrailRouteMoments: { evidence(id: string): { name: string; url: string; fact: string } | null };
    PIXI: unknown;
  }
}
const dom = createDom(document), { get: $ } = dom;
const query = new URLSearchParams(location.search), id = query.get('entry');
const routeId = document.body.dataset.route === 'tiger' ? 'tiger' : 'wugong';
const mapPage = routeId === 'tiger' ? 'tiger-walk.html' : 'wugong-walk.html';
const allowed = new Set(routeId === 'tiger' ? [...Object.keys(TRAIL_GAMES), ...MEMORY_IDS] : ['meadow-bird', 'meadow-butterfly', 'meadow-flower', 'wugong-wind-hiker']);
const places = new Set(routeId === 'tiger' ? ['虎跳峡 · 二十八道拐', '虎跳峡 · 中虎跳江边', '虎跳峡 · 中途客栈', '虎跳峡 · 龙洞瀑布'] : ['武功山 · 山脊草甸', '武功山 · 观音宕草甸', '武功山 · 吊马桩', '武功山 · 吊马桩山脊', '武功山 · 金顶古祭坛']);
const requestedPlace = query.get('place'), place = requestedPlace && places.has(requestedPlace) ? requestedPlace : null;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let disposed = false, closing = false, animation = 0, lastTime = 0, collected = 0;
let pending: Moment | null = null;
let storage: Storage | null = null; try { storage = localStorage; } catch { /* The journal remains readable in this page session. */ }
const catalog = window.TrailDiscoveries, games = window.TrailMiniGames;
const scenes = createSceneManager({ status: () => 'paused', pause() {}, resume() {}, hidden: () => document.hidden });
const cache = window.TrailImageCache.create(Image);
const routes: RouteSummary[] = [{ id: 'wugong', name: '武功山' }, { id: 'tiger', name: '虎跳峡' }, { id: 'aotai', name: '鳌太线' }, { id: 'maclehose', name: '麦理浩径' }, { id: 'changping', name: '长坪沟' }, { id: 'mogan', name: '莫干山' }, { id: 'westlake', name: '九溪 · 西湖' }];
function returnToMap(): void {
  if (disposed) return;
  if (window.parent !== window) window.parent.postMessage({ type: 'trailbound-wugong-art-close', collected }, location.origin);
  else location.href = mapPage;
}
function stopLoop(): void { cancelAnimationFrame(animation); animation = 0; lastTime = 0; }
function ensureLoop(): void { if (!disposed && !document.hidden && !animation) animation = requestAnimationFrame(frame); }
function audioScene(): MusicScene & { gorgeOpenness?: number; riverApproach?: number } {
  const current = mini.state, phase = current instanceof MemoryState && current.session.kind === 'bends' ? current.session.phase : null;
  return { routeId, mode: reward.open ? 'reward' : mini.active ? 'moment' : 'silent', momentId: current?.id ?? pending?.id, momentGame: phase?.kind === 'river' ? 'tiger-river' : current?.game ?? null, ...(phase ? { gorgeOpenness: roadWalk(phase), riverApproach: phase.kind === 'river' ? Math.min(1, phase.elapsed) : 0 } : {}) };
}
function refresh(): void {
  if (disposed) return;
  audio.setScene(audioScene());
  if (closing && !mini.active && !reward.open) { pending = null; returnToMap(); return; }
  ensureLoop();
}
const audio = window.TrailAudio.create({ AudioContext, navigator, fetch: fetch.bind(window), timers: window, createMusic: createMusicLayer, onError() { $('mini-sound').textContent = '声音未能开启，再试一次'; }, onStateChange() {} });
const reward = createRewardController({ dom, scenes, catalog, cache, audio, reduced, autoCollect: true, presentArt: roundJournalArt, gameKind: entryId => routeId === 'tiger' ? memoryId(entryId) ? MEMORY_SPECS[entryId].game : TRAIL_GAMES[entryId] : games.kinds[entryId], refresh, stopLoop,
  onCollected(moment) {
    const saved = storeEarnedMoment(catalog, window.TrailJournal, storage, moment);
    if (saved.kind === 'error') { $('reward-copy').textContent = saved.message; return false; }
    journal.reload(); $('reward-copy').textContent = '已收进手帐'; collected++; pending = null;
    if (window.parent !== window) window.parent.postMessage({ type: 'trailbound-wugong-art-collected', collected }, location.origin);
    return true;
  },
});
const journal = createJournalController({ dom, scenes, catalog, data: window.TrailJournal, routes,
  weather: { clear: { name: '晴' }, cloud: { name: '多云' }, mist: { name: '薄雾' }, drizzle: { name: '小雨' } },
  storage, reduced, presentArt: roundJournalArt, tripCount: () => collected, rewardOpen: () => reward.open,
  pauseInteraction: () => mini.pause(), stopLoop, refresh, onRemember() {},
  evidence: entryId => window.TrailRouteMoments.evidence(entryId), observation: () => null, source: () => null,
});
const mini = createMiniGameController({ dom, scenes, api: games.enhance(window.TrailMicroMoments), platform: games, pixi: window.PIXI, catalog, cache, audio, reduced,
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
let lastRoadSound = 0;
function frame(now: number): void {
  animation = 0; if (disposed || document.hidden) return;
  const dt = lastTime ? Math.min(.05, (now - lastTime) / 1000) : 0; lastTime = now;
  mini.update(dt);
  if (mini.state instanceof MemoryState && mini.state.session.kind === 'bends' && now - lastRoadSound > 180) { audio.setScene(audioScene()); lastRoadSound = now; }
  if (mini.active) ensureLoop();
}
function destroy(): void {
  if (disposed) return; disposed = true; stopLoop(); mini.destroy(); tigerGames?.destroy(); tigerMemories?.destroy(); reward.destroy(); journal.destroy(); audio.destroy();
}
$('walk-toggle').addEventListener('click', () => { destroy(); if (window.parent !== window) window.parent.postMessage({ type: 'trailbound-wugong-art-close', collected }, location.origin); else location.href = mapPage; });
window.addEventListener('message', event => { if (event.source === window.parent && event.origin === location.origin && event.data?.type === 'trailbound-wugong-art-dispose') destroy(); });
window.addEventListener('keydown', event => { if (reward.handleKey(event)) return; if (event.key === 'Escape' && !journal.open) { event.preventDefault(); $('walk-toggle').click(); } });
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopLoop(); mini.pause(); audio.hide(); scenes.suspend(); } else { scenes.foreground(); ensureLoop(); } });
window.addEventListener('pagehide', destroy);
window.addEventListener('storage', event => { if (event.storageArea === storage) journal.reload(); });
journal.render();
if (id && allowed.has(id)) {
  $('art-journal-wall').hidden = true;
  const original = catalog.item(id);
  mini.begin(place ? { ...original, place, memory: original.memory.replace(original.place, place) } : original, 'paused');
} else $('art-page-title').textContent = '旅行手帐';
window.parent.postMessage({ type: 'trailbound-wugong-art-ready' }, location.origin);
