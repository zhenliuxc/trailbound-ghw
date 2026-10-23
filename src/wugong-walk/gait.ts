import type { Point, SurfaceContact, Trail } from './model';

type Side = -1 | 1;
type FootState =
  | { kind: 'planted'; contact: SurfaceContact; age: number }
  | { kind: 'swing'; from: SurfaceContact; to: SurfaceContact; elapsed: number; duration: number; clearance: number; initialLift: number };
export interface FootPose {
  readonly kind: FootState['kind']; readonly point: Readonly<Point>; readonly contact: SurfaceContact;
  readonly lift: number; readonly support: number; readonly soleAngle: number; readonly roll: number;
}
const clamp = (value: number, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => { const u = clamp(t); return u * u * u * (u * (u * 6 - 15) + 10); };
const deltaAngle = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
interface MotionInput { travel: number; speed: number; direction: Side; walking: boolean; resting: boolean }

export class GaitPlanner {
  private states: [FootState, FootState];
  private lastTravel: number;
  private transfer = 0;
  private contacts = 0;
  private wasWalking = false;
  private velocity = 0;
  angle: number;
  slope: number;
  lean = 0;
  turnSide = 1;
  phase = 0;
  support: Point;
  constructor(private readonly trail: Trail, private readonly scale: number, travel: number) {
    this.lastTravel = travel;
    this.angle = trail.headingAt(travel); this.slope = trail.gradeAt(travel); this.turnSide = Math.cos(this.angle);
    this.support = trail.sample(travel);
    this.states = [this.planted(travel, -1), this.planted(travel, 1)];
  }
  private planted(travel: number, side: Side): FootState { return { kind: 'planted', contact: this.trail.contactAt(travel, side), age: 1 }; }
  get grounded(): boolean { return this.states[0].kind === 'planted' && this.states[1].kind === 'planted'; }
  get feet(): readonly [FootPose, FootPose] { return [this.pose(this.states[0]), this.pose(this.states[1])]; }
  private pose(state: FootState): FootPose {
    if (state.kind === 'planted') return { kind: 'planted', contact: state.contact, point: state.contact.point, lift: 0, support: ease(state.age / .14), soleAngle: state.contact.soleAngle, roll: -.10 * (1 - ease(state.age / .13)) };
    const t = clamp(state.elapsed / state.duration), u = ease(t);
    const contact = this.trail.swingContact(state.from, state.to, u);
    const lift = state.initialLift * (1 - u) + Math.sin(Math.PI * t) ** 1.2 * state.clearance;
    return { kind: 'swing', contact, point: contact.point, lift, support: 0, soleAngle: mix(state.from.soleAngle, state.to.soleAngle, u), roll: mix(.17, -.10, u) };
  }
  takeContacts(): number { const count = this.contacts; this.contacts = 0; return count; }
  reset(travel: number): void {
    this.lastTravel = travel; this.transfer = 0; this.contacts = 0; this.wasWalking = false; this.velocity = 0;
    this.angle = this.trail.headingAt(travel); this.slope = this.trail.gradeAt(travel); this.turnSide = Math.cos(this.angle);
    this.phase = 0; this.lean = 0; this.support = this.trail.sample(travel);
    this.states = [this.planted(travel, -1), this.planted(travel, 1)];
  }
  advance(dt: number, input: MotionInput): void {
    const travelled = Math.abs(input.travel - this.lastTravel); this.lastTravel = input.travel;
    const up = clamp(this.slope / .45), down = clamp(-this.slope / .35), bend = clamp(this.trail.bendAt(input.travel) / 1.2);
    const stride = 5.6 * this.scale * (1 - up * .23 - down * .17 - bend * .20);
    this.phase += travelled / (stride * 2);
    const walking = input.walking && Math.abs(input.speed) > .22;
    if (this.wasWalking && !walking) {
      const settle = (state: FootState, index: number): FootState => {
        if (state.kind === 'planted') return state;
        const pose = this.pose(state), side: Side = index ? input.direction : input.direction === 1 ? -1 : 1;
        const to = this.trail.contactAt(input.travel + input.direction * (index ? .45 : -.45) * this.scale, side);
        return { kind: 'swing', from: pose.contact, to, elapsed: 0, duration: .18, clearance: .18 * this.scale, initialLift: pose.lift };
      };
      this.states = [settle(this.states[0], 0), settle(this.states[1], 1)];
    }
    this.wasWalking = walking;
    this.transfer = Math.max(0, this.transfer - dt);
    for (let i = 0; i < this.states.length; i++) {
      const state = this.states[i];
      if (state.kind === 'planted') { state.age += dt; continue; }
      state.elapsed += dt;
      if (state.elapsed >= state.duration) {
        this.states[i] = { kind: 'planted', contact: state.to, age: 0 };
        this.transfer = .075 + down * .035; this.contacts++;
      }
    }
    if (this.grounded && this.transfer === 0) {
      const a = this.states[0], b = this.states[1];
      if (a.kind === 'planted' && b.kind === 'planted') {
        const reachA = (input.travel - a.contact.travel) * input.direction, reachB = (input.travel - b.contact.travel) * input.direction;
        const index = reachA >= reachB ? 0 : 1, state = index ? b : a;
        const behind = Math.max(reachA, reachB), correction = !walking && behind > stride * 1.15;
        if (walking && behind > stride * .44 || correction) {
          const side: Side = index ? input.direction : input.direction === 1 ? -1 : 1;
          const lead = walking ? stride * (.84 + down * .08) : .35 * this.scale;
          const to = this.trail.contactAt(input.travel + input.direction * lead, side);
          this.states[index] = { kind: 'swing', from: state.contact, to, elapsed: 0, duration: walking ? clamp(stride / Math.max(1.2, Math.abs(input.speed)) * .72, .26, .46) : .18, clearance: (walking ? .86 + up * .55 - down * .18 : .20) * this.scale, initialLift: 0 };
        }
      }
    }
    const desired = input.resting ? -.20 : this.trail.headingAt(input.travel, input.direction);
    const error = deltaAngle(this.angle, desired), targetVelocity = clamp(error * 5, -2.1, 2.1);
    this.velocity = mix(this.velocity, targetVelocity, 1 - Math.exp(-dt * 9));
    const change = this.velocity * dt;
    this.angle += Math.abs(change) > Math.abs(error) ? error : change;
    this.turnSide = mix(this.turnSide, Math.cos(this.angle), 1 - Math.exp(-dt * 6));
    this.slope = mix(this.slope, this.trail.gradeAt(input.travel) * input.direction, 1 - Math.exp(-dt * 4));
    this.lean = mix(this.lean, walking ? .015 + up * .105 - down * .06 : 0, 1 - Math.exp(-dt * 5));
    const feet = this.feet, root = this.trail.sample(input.travel);
    const w0 = .22 + feet[0].support, w1 = .22 + feet[1].support;
    const target = { x: mix(root.x, (feet[0].point.x * w0 + feet[1].point.x * w1) / (w0 + w1), .16), y: mix(root.y, (feet[0].point.y * w0 + feet[1].point.y * w1) / (w0 + w1), .48) };
    this.support = { x: mix(this.support.x, target.x, 1 - Math.exp(-dt * 10)), y: mix(this.support.y, target.y, 1 - Math.exp(-dt * 8)) };
  }
}
