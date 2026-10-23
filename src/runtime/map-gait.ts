const cycleSeconds = 1.24;
// A short passing pose follows the longer contact and weight-transfer poses.
const frameEnds = [.18, .32, .42, .5, .68, .82, .92, 1];

export function mapWalkFrame(clock: number): number {
  const phase = ((clock / cycleSeconds) % 1 + 1) % 1;
  const frame = frameEnds.findIndex(end => phase < end);
  return Math.max(0, frame);
}

/** Touchdown and sprite playback share one clock, including changes of pace. */
export function createMapGait() {
  let clock = 0, cadence = 0, moving = false, starting = false;
  return {
    reset(): void { clock = 0; cadence = 0; moving = false; starting = false; },
    update(dt: number, walking: boolean, pace: number) {
      if (!walking) {
        moving = false; cadence = 0; starting = false;
        return { clock, contact: false };
      }
      if (!moving) {
        // Resume with a planted foot rather than jumping into a passing pose.
        clock = Math.ceil(clock / (cycleSeconds / 2)) * (cycleSeconds / 2);
        cadence = .45; moving = true; starting = true;
      }
      const step = Number.isFinite(dt) ? Math.max(0, Math.min(.25, dt)) : 0;
      if (!step) return { clock, contact: false };
      const target = Number.isFinite(pace) ? Math.max(.65, Math.min(1.4, pace)) : 1;
      cadence += (target - cadence) * (1 - Math.exp(-step * 8));
      const before = Math.floor(clock / (cycleSeconds / 2) + 1e-7);
      clock += step * cadence;
      const contact = starting || Math.floor(clock / (cycleSeconds / 2) + 1e-7) > before;
      starting = false;
      return { clock, contact };
    },
  };
}
