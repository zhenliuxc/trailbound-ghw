import { Bodies, Body, Composite, Engine, Events } from 'matter-js';

export interface SnowPoint { readonly x: number; readonly y: number }
export const SNOW_RADIUS = 26;
export const SNOW_START = { x: 168, y: 352 };
export const SNOW_FLOOR: readonly SnowPoint[] = [
  { x: 95, y: 365 }, { x: 265, y: 408 }, { x: 355, y: 442 },
  { x: 455, y: 456 }, { x: 560, y: 505 }, { x: 665, y: 530 },
  { x: 754, y: 573 }, { x: 815, y: 599 }, { x: 872, y: 592 }, { x: 915, y: 510 },
];
export const SNOW_GOAL = { x: 826, y: 580, radius: 49 };

/** A single owned engine; the host controls every tick, including pause/exit. */
export class SnowballWorld {
  private readonly engine = Engine.create({ gravity: { x: 0, y: 1.05, scale: .001 } });
  private readonly ball = Bodies.circle(SNOW_START.x, SNOW_START.y, SNOW_RADIUS, { friction: .075, frictionAir: .009, restitution: .08, density: .0014 });
  impacts = 0;
  constructor() {
    Body.setStatic(this.ball, true);
    const ground = SNOW_FLOOR.slice(1).map((b, i) => {
      const a = SNOW_FLOOR[i], angle = Math.atan2(b.y - a.y, b.x - a.x), depth = 36;
      return Bodies.rectangle((a.x + b.x) / 2 - Math.sin(angle) * depth / 2, (a.y + b.y) / 2 + Math.cos(angle) * depth / 2, Math.hypot(b.x - a.x, b.y - a.y) + 2, depth, { isStatic: true, angle, friction: i > 5 ? .3 : .08, restitution: .04 });
    });
    Composite.add(this.engine.world, [...ground, this.ball]);
    Events.on(this.engine, 'collisionStart', event => { if (event.pairs.some(pair => pair.bodyA === this.ball || pair.bodyB === this.ball)) this.impacts++; });
  }
  get point(): SnowPoint { return this.ball.position; }
  get angle(): number { return this.ball.angle; }
  get speed(): number { return this.ball.speed; }
  launch(drag: SnowPoint): void {
    const limit = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
    Body.setStatic(this.ball, false);
    Body.setVelocity(this.ball, { x: limit(drag.x * .045, -5, 8), y: limit(drag.y * .025, -5, 3) });
    Body.setAngularVelocity(this.ball, drag.x * .0008);
  }
  tick(dt: number): void { for (let left = dt; left > .00001;) { const step = Math.min(left, 1 / 60); Engine.update(this.engine, step * 1000); left -= step; } }
  reset(): void { Body.setStatic(this.ball, true); Body.setPosition(this.ball, SNOW_START); Body.setAngle(this.ball, 0); Body.setVelocity(this.ball, { x: 0, y: 0 }); Body.setAngularVelocity(this.ball, 0); }
  dispose(): void { Events.off(this.engine, 'collisionStart'); Composite.clear(this.engine.world, false); Engine.clear(this.engine); }
}
