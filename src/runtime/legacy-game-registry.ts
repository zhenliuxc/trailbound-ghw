import type { GameKind, MiniPlatform } from './contracts';
import type { GameDom } from './dom';
import type { createMiniGameController } from './mini-game-controller';
import { createMoganGames } from './mogan/adapter';
import { MOGAN_GAMES, type LegacySling } from './mogan/rules';
import { createTigerGames } from './tiger/adapter';
import { TIGER_GAMES } from './tiger/rules';
import { createTigerTrailGames } from './tiger-trail/adapter';
import { TRAIL_GAMES } from './tiger-trail/rules';

type MiniController = ReturnType<typeof createMiniGameController>;
type GameKinds = Readonly<Partial<Record<string, GameKind>>>;

/** The retained home journey uses its original adapters and river descent. */
export function installLegacyHomeGames(options: {
  mini: MiniController;
  dom: GameDom;
  platform?: MiniPlatform;
  legacy?: LegacySling;
}) {
  const { mini, dom, platform, legacy } = options, onAction = mini.action;
  const mogan = platform && legacy ? createMoganGames({ dom, legacy, onAction }) : null;
  if (mogan) mini.registerGame(Object.keys(MOGAN_GAMES), mogan.adapter);
  const tiger = createTigerGames({ dom, onAction });
  mini.registerGame(Object.keys(TIGER_GAMES), tiger.adapter);
  const trail = createTigerTrailGames({ dom, onAction });
  mini.registerGame(Object.keys(TRAIL_GAMES), trail.adapter);

  const installed = new Set([
    ...(mogan ? Object.keys(MOGAN_GAMES) : []),
    ...Object.keys(TIGER_GAMES), ...Object.keys(TRAIL_GAMES),
  ]);
  const tigerKinds: GameKinds = TIGER_GAMES, moganKinds: GameKinds = MOGAN_GAMES;
  let destroyed = false;
  return {
    has: (entryId: string) => installed.has(entryId),
    kindFor(entryId: string | null | undefined): GameKind | undefined {
      if (!entryId) return undefined;
      return TRAIL_GAMES[entryId] || tigerKinds[entryId] || (legacy ? moganKinds[entryId] : undefined) || platform?.kinds[entryId];
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      mogan?.destroy(); tiger.destroy(); trail.destroy();
    },
  };
}
