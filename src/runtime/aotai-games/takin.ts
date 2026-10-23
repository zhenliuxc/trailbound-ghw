export interface EncounterPoint { x: number; y: number }
export const TAKIN_START = { x: .43, y: .67635 };
export const TAKIN_PLATFORM: readonly EncounterPoint[] = [
  { x: .09, y: .76 }, { x: .29, y: .735 }, { x: .44, y: .765 },
  { x: .45, y: .85 }, { x: .38, y: .91 }, { x: .13, y: .91 }, { x: .07, y: .85 },
];
export type EncounterPhase =
  | { kind: 'opening'; elapsed: number }
  | { kind: 'yielding'; clearFor: number }
  | { kind: 'adult'; progress: number }
  | { kind: 'calf-reveal'; elapsed: number }
  | { kind: 'calf'; progress: number }
  | { kind: 'aftermath'; elapsed: number }
  | { kind: 'returning'; elapsed: number; from: EncounterPoint }
  | { kind: 'finished' };
export interface TakinEncounter {
  kind: 'takin'; actor: EncounterPoint; target: EncounterPoint | null;
  phase: EncounterPhase; stride: number; moving: boolean; footsteps: number; breath: number;
}
export function createEncounter(): TakinEncounter {
  return { kind: 'takin', actor: { ...TAKIN_START }, target: null, phase: { kind: 'opening', elapsed: 0 }, stride: 0, moving: false, footsteps: 0, breath: 0 };
}
export const trailY = (x: number): number => .7 - x * .055;
export const TRAIL_HALF_WIDTH = .037;
export function onPlatform(p: EncounterPoint): boolean {
  let inside = false;
  for (let i = 0, j = TAKIN_PLATFORM.length - 1; i < TAKIN_PLATFORM.length; j = i++) {
    const a = TAKIN_PLATFORM[i], b = TAKIN_PLATFORM[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
export function passageClear(p: EncounterPoint, height: number): boolean {
  const distance = Math.abs((p.y - trailY(p.x)) * height) / Math.hypot(1, .055 * height / 1000);
  return onPlatform(p) && distance > TRAIL_HALF_WIDTH * height + 27;
}
function walkable(p: EncounterPoint): boolean {
  return p.x >= .09 && p.x <= .57 && (Math.abs(p.y - trailY(p.x)) <= .055 || onPlatform(p) || (p.x >= .29 && p.x <= .46 && p.y >= .67 && p.y <= .81));
}
export function targetEncounter(p: TakinEncounter, at: EncounterPoint): boolean {
  if (p.phase.kind === 'opening' || p.phase.kind === 'aftermath' || p.phase.kind === 'returning' || p.phase.kind === 'finished' || !walkable(at)) return false;
  if ((p.phase.kind === 'yielding' || p.phase.kind === 'adult') && at.x > p.actor.x + .035) return false;
  p.target = at; return true;
}
export function encounterAdult(p: TakinEncounter): number {
  return p.phase.kind === 'opening' ? .8 + (1 - Math.min(1, Math.max(0, (p.phase.elapsed - 4) / 6))) * .32 : p.phase.kind === 'yielding' ? .8 : p.phase.kind === 'adult' ? .8 - p.phase.progress * 1.04 : -.24;
}
export function encounterCalf(p: TakinEncounter): number {
  return p.phase.kind === 'calf' ? .94 - p.phase.progress * 1.15 : p.phase.kind === 'aftermath' || p.phase.kind === 'returning' || p.phase.kind === 'finished' ? -.21 : .94;
}
/** Spatial rules are fictional game behavior, not wildlife safety guidance. */
export function tickEncounter(p: TakinEncounter, dt: number, height: number, reduced: boolean): { complete: boolean; hoof: boolean; breath: boolean; cloth: boolean } {
  const wasMoving = p.moving; p.moving = false;
  if (p.target) {
    const dx = (p.target.x - p.actor.x) * 1000, dy = (p.target.y - p.actor.y) * height, length = Math.hypot(dx, dy), step = Math.min(length, dt * 48);
    if (length > 1) { p.actor.x += dx / length * step / 1000; p.actor.y += dy / length * step / height; p.moving = true; p.stride += step / 23; }
  }
  const clear = passageClear(p.actor, height), phase = p.phase, pace = reduced ? 1.65 : 1;
  let walking = false;
  switch (phase.kind) {
    case 'opening': phase.elapsed += dt * pace; walking = phase.elapsed > 1 && phase.elapsed < 10; if (phase.elapsed >= 10) p.phase = { kind: 'yielding', clearFor: 0 }; break;
    case 'yielding': phase.clearFor = clear ? phase.clearFor + dt : 0; if (phase.clearFor >= .8) p.phase = { kind: 'adult', progress: 0 }; break;
    case 'adult': if (clear) { phase.progress = Math.min(1, phase.progress + dt * pace / 17); walking = true; } if (phase.progress >= 1) p.phase = { kind: 'calf-reveal', elapsed: 0 }; break;
    case 'calf-reveal': phase.elapsed += dt * pace; if (phase.elapsed >= 6) p.phase = { kind: 'calf', progress: 0 }; break;
    case 'calf': if (clear) { phase.progress = Math.min(1, phase.progress + dt * pace / 14); walking = true; } if (phase.progress >= 1) { p.target = null; p.phase = { kind: 'aftermath', elapsed: 0 }; } break;
    case 'aftermath': phase.elapsed += dt * pace; if (phase.elapsed >= 7) p.phase = { kind: 'returning', elapsed: 0, from: { ...p.actor } }; break;
    case 'returning': {
      phase.elapsed += dt * pace; const t = Math.min(1, phase.elapsed / 4), ease = t * t * (3 - 2 * t);
      p.actor = { x: phase.from.x + (TAKIN_START.x - phase.from.x) * ease, y: phase.from.y + (TAKIN_START.y - phase.from.y) * ease };
      p.moving = t < 1; p.stride += dt * 1.6; if (t === 1) p.phase = { kind: 'finished' }; break;
    }
    case 'finished': break;
  }
  const oldFootsteps = p.footsteps; if (walking) p.footsteps += dt * (phase.kind === 'calf' ? 1.55 : 1.1);
  const oldBreath = p.breath; if (!walking && ['yielding', 'adult', 'calf'].includes(phase.kind)) p.breath += dt / 3.8;
  return { complete: p.phase.kind === 'finished', hoof: Math.floor(oldFootsteps) !== Math.floor(p.footsteps), breath: Math.floor(oldBreath) !== Math.floor(p.breath), cloth: p.moving && !wasMoving };
}
