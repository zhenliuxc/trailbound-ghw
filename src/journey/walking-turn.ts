import { clamp, mix } from '../wugong-walk/model';

type Facing = -1 | 1;
export interface WalkingTurnSample {
  readonly at: number;
  readonly stride: number;
  readonly heading: number;
  readonly forwardHeading: number;
  readonly slope: number;
  readonly moving: boolean;
}

export class WalkingTurn {
  facing: Facing;
  frame = 2;
  lean = 0;
  offsetX = 0;
  offsetY = 0;
  private previousAt = 0;
  private previousStride = 0;
  private sinceTurn = Infinity;
  private pending: { facing: Facing; distance: number } | null = null;

  constructor(heading: number) { this.facing = Math.cos(heading) < 0 ? -1 : 1; }

  resetFooting(): void { this.offsetX = 0; this.offsetY = 0; }

  update(sample: WalkingTurnSample, dt: number, contacts: readonly number[], reduced: boolean): void {
    const distance = Math.max(0, sample.at - this.previousAt);
    const steps = Math.max(0, sample.stride - this.previousStride);
    this.previousAt = sample.at;
    this.previousStride = sample.stride;
    const lean = sample.moving && !reduced ? Math.cos(sample.heading) * clamp(sample.slope * .22, -.04, .065) : 0;
    this.lean = mix(this.lean, lean, reduced ? 1 : 1 - Math.exp(-dt * 7));
    if (!sample.moving) { this.pending = null; return; }

    this.frame = Math.floor(sample.stride % 1 * 8);
    const settle = Math.exp(-steps * 8);
    this.offsetX *= settle;
    this.offsetY *= settle;
    this.sinceTurn += distance;
    const side = Math.cos(sample.heading), forward = Math.cos(sample.forwardHeading);
    const desired = side < -.3 && forward < -.3 ? -1 : side > .3 && forward > .3 ? 1 : null;
    if (desired === null || desired === this.facing) { this.pending = null; return; }
    if (this.pending?.facing !== desired) this.pending = { facing: desired, distance: 0 };
    this.pending.distance += distance;

    // Frames 2 and 6 bring the feet together; pivot there rather than midway through a wide step.
    if (distance === 0 || this.pending.distance < 8 || this.sinceTurn < 24 || (this.frame !== 2 && this.frame !== 6)) return;
    const contact = contacts[this.frame];
    this.offsetX += this.facing * contact * 2 * Math.cos(this.lean);
    this.offsetY += this.facing * contact * 2 * Math.sin(this.lean);
    this.facing = desired;
    this.pending = null;
    this.sinceTurn = 0;
  }
}
