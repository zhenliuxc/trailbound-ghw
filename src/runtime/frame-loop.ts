interface FrameOptions {
  request(callback: FrameRequestCallback): number;
  cancel(id: number): void;
  active(): boolean;
  update(dt: number): void;
  maxDelta?: number;
}

/** One clock for walking and minigames; opening/closing a scene resets elapsed time. */
export function createFrameLoop(options: FrameOptions) {
  let pending: number | null = null;
  let lastTime: number | null = null;
  let generation = 0;
  function stop() {
    generation++;
    if (pending !== null) options.cancel(pending);
    pending = null;
    lastTime = null;
  }
  function ensure() {
    if (!options.active()) { stop(); return; }
    if (pending !== null) return;
    const version = generation;
    pending = options.request(time => {
      if (version !== generation) return;
      pending = null;
      if (!options.active()) { stop(); return; }
      const dt = lastTime === null ? 0 : Math.max(0, Math.min(options.maxDelta ?? .25, (time - lastTime) / 1000));
      lastTime = time;
      options.update(dt);
      if (version === generation) ensure();
    });
  }
  return { ensure, stop };
}
