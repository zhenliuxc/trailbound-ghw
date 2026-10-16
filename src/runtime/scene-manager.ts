import type { JourneyStatus, SceneName } from './contracts';

export interface SceneSession {
  readonly id: number;
  readonly name: SceneName;
  returnStatus: JourneyStatus;
}
export interface SceneOptions {
  status(): JourneyStatus;
  pause(): void;
  resume(): void;
  hidden(): boolean;
}

/** Owns pause/return semantics, including a journal opened over a paused minigame. */
export function createSceneManager(options: SceneOptions) {
  const sessions: SceneSession[] = [];
  let serial = 0;
  let background = false;

  function enter(name: SceneName, returnStatus = options.status()): SceneSession {
    const session = { id: ++serial, name, returnStatus };
    sessions.push(session);
    options.pause();
    return session;
  }
  function leave(session: SceneSession | null, resume = true) {
    if (!session) return;
    const index = sessions.indexOf(session);
    if (index < 0) return;
    const wasTop = index === sessions.length - 1;
    sessions.splice(index, 1);
    if (wasTop && sessions.length === 0 && resume && session.returnStatus === 'walking' && !background && !options.hidden()) options.resume();
  }
  return {
    enter,
    leave,
    get active(): SceneName | 'journey' { return sessions.at(-1)?.name ?? 'journey'; },
    get background() { return background; },
    isTop(session: SceneSession | null) { return !!session && sessions.at(-1) === session; },
    canAnimate(hasMini: boolean) {
      if (background || options.hidden()) return false;
      const active = sessions.at(-1)?.name;
      return active === 'minigame' ? hasMini : !active && options.status() === 'walking';
    },
    suspend() {
      background = true;
      for (const session of sessions) session.returnStatus = 'paused';
      options.pause();
    },
    foreground() { background = false; },
    reset() { sessions.splice(0); },
  };
}
export type SceneManager = ReturnType<typeof createSceneManager>;
