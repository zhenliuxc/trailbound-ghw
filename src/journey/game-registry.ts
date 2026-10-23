import type { ChapterDefinition } from '../content/catalog';
import type { GameKind, MiniApi, MiniPlatform, MiniState, RouteId, SoundPlayer } from '../runtime/contracts';
import type { GameDom } from '../runtime/dom';
import type { createMiniGameController } from '../runtime/mini-game-controller';
import type { MusicScene } from '../runtime/music-layer';
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
import { createDayMemories } from '../runtime/day-memories/adapter';
import { DAY_MEMORIES } from '../runtime/day-memories/model';
import { createChangpingMemories } from '../runtime/changping-memories/adapter';
import { CHANGPING_MEMORY_IDS } from '../runtime/changping-memories/model';

type MiniController = ReturnType<typeof createMiniGameController>;
type GameKinds = Readonly<Partial<Record<string, GameKind>>>;
interface Registration {
  readonly ids: readonly string[];
  create(): { adapter: MiniApi; destroy?(): void };
}
interface RouteGameContext {
  dom: GameDom;
  audio: SoundPlayer;
  onAction: MiniController['action'];
}
interface RouteGameDefinition {
  registrations(context: RouteGameContext): readonly Registration[];
  readonly extraEntries: readonly string[];
  kindFor(entryId: string, legacyKinds: GameKinds): GameKind | undefined;
  titleFor(entryId: string): string | null;
}
export interface GameMusicScene extends MusicScene {
  gorgeOpenness?: number;
  riverApproach?: number;
  coastOpenness?: number;
}

const DEFAULT_GAMES: RouteGameDefinition = {
  registrations: () => [],
  extraEntries: [],
  kindFor: (entryId, legacyKinds) => legacyKinds[entryId],
  titleFor: () => null,
};
const DAY_GAMES: RouteGameDefinition = {
  ...DEFAULT_GAMES,
  registrations: ({ dom, audio }) => [
    { ids: Object.keys(DAY_MEMORIES), create: () => ({ adapter: createDayMemories(dom, audio) }) },
  ],
};
const ROUTE_GAMES: Readonly<Record<RouteId, RouteGameDefinition>> = {
  wugong: DEFAULT_GAMES,
  tiger: {
    ...DEFAULT_GAMES,
    registrations: ({ dom, onAction }) => [
      { ids: Object.keys(TRAIL_GAMES), create: () => createTigerTrailGames({ dom, riverArrived: true, onAction }) },
      { ids: MEMORY_IDS, create: () => createTigerMemoryGames(dom, onAction) },
    ],
    extraEntries: Object.keys(TRAIL_GAMES),
    kindFor: entryId => memoryId(entryId) ? MEMORY_SPECS[entryId].game : TRAIL_GAMES[entryId],
  },
  aotai: {
    ...DEFAULT_GAMES,
    registrations: ({ dom }) => [
      { ids: AOTAI_IDS, create: () => ({ adapter: createAotaiGames(dom) }) },
    ],
    kindFor: entryId => aotaiGameId(entryId) ? AOTAI_GAMES[entryId].game : undefined,
  },
  maclehose: {
    ...DEFAULT_GAMES,
    registrations: ({ dom, onAction }) => [
      { ids: COAST_MEMORY_IDS, create: () => ({ adapter: createCoastMemories(dom, onAction) }) },
      { ids: ['coast-sand'], create: () => ({ adapter: createSaiwanShoulder(dom) }) },
      { ids: ['coast-shell'], create: () => ({ adapter: createTide(dom) }) },
    ],
    kindFor: (entryId, legacyKinds) => entryId === 'coast-sand' ? 'footsteps' : coastMemoryId(entryId) ? COAST_MEMORIES[entryId].game : legacyKinds[entryId],
    titleFor: entryId => entryId === 'coast-sand' ? '转角见海' : '海岸手绘',
  },
  changping: {
    ...DAY_GAMES,
    registrations: context => [
      ...DAY_GAMES.registrations(context),
      { ids: CHANGPING_MEMORY_IDS, create: () => ({ adapter: createChangpingMemories(context.dom, context.audio) }) },
    ],
  },
  mogan: DAY_GAMES,
  westlake: DAY_GAMES,
};

/** Later registrations retain the controller's existing override behavior. */
function installRegistrations(mini: MiniController, registrations: readonly Registration[]) {
  const cleanups: (() => void)[] = [];
  for (const registration of registrations) {
    const owner = registration.create();
    mini.registerGame(registration.ids, owner.adapter);
    if (owner.destroy) cleanups.push(() => owner.destroy?.());
  }
  return {
    // The host destroys mini first; adapter.dispose owns active scene resources.
    destroy() { for (const cleanup of cleanups.splice(0)) cleanup(); },
  };
}

function artMusic(state: MiniState | null, base: GameMusicScene): GameMusicScene {
  const phase = state instanceof MemoryState && state.session.kind === 'bends' ? state.session.phase : null;
  return {
    ...base,
    momentGame: phase?.kind === 'river' ? 'tiger-river' : base.momentGame,
    ...(phase ? { gorgeOpenness: roadWalk(phase), riverApproach: phase.kind === 'river' ? Math.min(1, phase.elapsed) : 0 } : {}),
    ...(state instanceof ShoulderState ? { coastOpenness: state.cameraProgress } : {}),
  };
}

export function installRouteGames(options: {
  chapter: ChapterDefinition;
  mini: MiniController;
  dom: GameDom;
  audio: SoundPlayer;
  platform: MiniPlatform;
}) {
  const { chapter, mini, dom, audio, platform } = options, definition = ROUTE_GAMES[chapter.id];
  const allowed = new Set([...chapter.events.map(event => event.entry), ...definition.extraEntries]);
  const installed = installRegistrations(mini, definition.registrations({ dom, audio, onAction: mini.action }));
  return {
    allows: (entryId: string) => allowed.has(entryId),
    kindFor: (entryId: string) => definition.kindFor(entryId, platform.kinds),
    titleFor: definition.titleFor,
    musicFor: artMusic,
    musicChanges: (state: MiniState | null) => state instanceof ShoulderState || state instanceof MemoryState && state.session.kind === 'bends',
    destroy: installed.destroy,
  };
}

