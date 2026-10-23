type Facing = 1 | -1;

const horizontalDeadzone = .28;
const angularDeadzone = 8 * Math.PI / 180;
const turnDuration = .22;

/** Keep small bends and near-vertical travel from repeatedly mirroring the hiker. */
export function createMapHeading() {
  let filteredAngle = 0;
  let facing: Facing = 1;
  let candidate: Facing | null = null;
  let candidateTime = 0;

  function clearCandidate() {
    candidate = null;
    candidateTime = 0;
  }

  function reset(angle: number): Facing {
    filteredAngle = Number.isFinite(angle) ? Math.atan2(Math.sin(angle), Math.cos(angle)) : 0;
    facing = Math.cos(filteredAngle) < -horizontalDeadzone ? -1 : 1;
    clearCandidate();
    return facing;
  }

  function update(angle: number, dt: number, moving: boolean): Facing {
    if (!moving) {
      clearCandidate();
      return facing;
    }
    if (!Number.isFinite(angle) || !Number.isFinite(dt) || dt <= 0) return facing;
    const step = Math.min(dt, .1);
    const difference = Math.atan2(Math.sin(angle - filteredAngle), Math.cos(angle - filteredAngle));
    if (Math.abs(difference) > angularDeadzone) {
      filteredAngle += difference * (1 - Math.exp(-step * 6));
      filteredAngle = Math.atan2(Math.sin(filteredAngle), Math.cos(filteredAngle));
    }
    const horizontal = Math.cos(filteredAngle);
    const next: Facing | null = horizontal > horizontalDeadzone ? 1 : horizontal < -horizontalDeadzone ? -1 : null;
    if (next === null || next === facing) {
      clearCandidate();
      return facing;
    }
    if (candidate !== next) {
      candidate = next;
      candidateTime = 0;
    }
    candidateTime += step;
    if (candidateTime >= turnDuration) {
      facing = next;
      clearCandidate();
    }
    return facing;
  }

  return { reset, update };
}
