import { chapterFor, ROUTE_SUMMARIES } from '../content/catalog';
import { createDom } from '../runtime/dom';
import { createSceneManager } from '../runtime/scene-manager';
import { createJournalController } from '../runtime/journal-controller';
import { createMiniGameController } from '../runtime/mini-game-controller';
import { createRewardController } from '../runtime/reward-controller';
import { createMusicLayer, type MusicScene } from '../runtime/music-layer';
import type { ImageCache, JournalData, MiniApi, MiniPlatform, Moment, MomentCatalog, SoundPlayer } from '../runtime/contracts';
import { roundJournalArt } from '../runtime/journal-badge';
import { artMessage, readArtMessage, type ArtSession } from './art-session';
import { installRouteGames, type GameMusicScene } from './game-registry';
import { createFrameLoop } from '../runtime/frame-loop';

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
const sessionId = query.get('session');
const session: ArtSession | null = sessionId ? { session: sessionId, entry: id } : null;
document.body.dataset.embedded = String(window.parent !== window);
function notifyParent(type: 'ready' | 'collected' | 'close') {
  if (window.parent !== window && session) window.parent.postMessage(type === 'ready' ? artMessage(session, type) : artMessage(session, type, collected), location.origin);
}
const chapter = chapterFor(document.body.dataset.route ?? 'wugong');
if (!chapter) throw new Error('无法读取这段旅程');
const routeId = chapter.id, mapPage = chapter.mapPage, events = chapter.events;
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
function audioScene(): GameMusicScene {
  return routeGames.musicFor(mini.state, { routeId, mode: reward.open ? 'reward' : mini.active ? 'moment' : 'silent', momentId: mini.state?.id ?? pending?.id, momentGame: mini.soundTheme ?? null });
}
function refresh(): void {
  if (disposed) return;
  audio.setScene(audioScene());
  if (closing && !mini.active && !reward.open) { pending = null; returnToMap(); return; }
  ensureLoop();
}
const audio = window.TrailAudio.create({ AudioContext, navigator, fetch: fetch.bind(window), timers: window, createMusic: createMusicLayer, onError() { $('mini-sound').textContent = '声音未能开启，再试一次'; }, onStateChange() {} });
const reward = createRewardController({ dom, scenes, catalog, cache, audio, reduced, autoCollect: true, presentArt: roundJournalArt, gameKind: entryId => routeGames.kindFor(entryId), refresh, stopLoop,
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
    if (!routeGames.allows(entry.id) || outcome.id !== entry.id || outcome.edition !== 3 || !outcome.earned) return false;
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
const routeGames = installRouteGames({ chapter, mini, dom, audio, platform: games });
const clock = createFrameLoop({ request: callback => requestAnimationFrame(callback), cancel: id => cancelAnimationFrame(id), maxDelta: .05, active: () => !disposed && !document.hidden && mini.active, update: frame });
let soundElapsed = 0;
function frame(dt: number): void {
  mini.update(dt);
  soundElapsed += dt;
  if (soundElapsed > .18 && routeGames.musicChanges(mini.state)) { audio.setScene(audioScene()); soundElapsed = 0; }
}
function destroy(): void {
  if (disposed) return; disposed = true; stopLoop(); mini.destroy(); routeGames.destroy(); reward.destroy(); journal.destroy(); audio.destroy();
}
$('walk-toggle').addEventListener('click', () => { destroy(); if (window.parent !== window) notifyParent('close'); else location.href = mapPage; });
window.addEventListener('message', event => { if (event.source === window.parent && event.origin === location.origin && readArtMessage(event.data, session)?.type === 'dispose') destroy(); });
window.addEventListener('keydown', event => { if (reward.handleKey(event)) return; if (event.key === 'Escape' && !journal.open) { event.preventDefault(); $('walk-toggle').click(); } });
document.addEventListener('visibilitychange', () => { if (document.hidden) { stopLoop(); mini.pause(); audio.hide(); scenes.suspend(); } else { scenes.foreground(); ensureLoop(); } });
window.addEventListener('pagehide', destroy);
journal.render();
if (id && routeGames.allows(id)) {
  const title = routeGames.titleFor(id);
  if (title) $('art-page-title').textContent = title;
  $('art-journal-wall').hidden = true;
  const original = catalog.item(id), currentPlace = place;
  mini.begin(currentPlace ? { ...original, place: currentPlace, memory: original.memory.replace(original.place, currentPlace) } : original, 'paused');
} else $('art-page-title').textContent = '旅行手帐';
notifyParent('ready');
