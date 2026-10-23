import { clamp, mix, type Point } from '../model';
import { SCROLL } from './route';
import type { ScrollJourney } from './journey';

export type ScrollView = 'follow' | 'overview';
export interface ScrollProjection {
  readonly width: number; readonly height: number; readonly scale: number;
  readonly x: number; readonly y: number; readonly center: Readonly<Point>;
  fromScreen(point: Point): Point;
  toScreen(point: Point): Point;
}
export class ScrollCamera {
  mode: ScrollView = 'follow';
  private center: Point = { x: 500, y: 730 };
  private velocity: Point = { x: 0, y: 0 };
  private scale = 1;
  private fresh = true;
  private width = 1200;
  private height = 600;
  resize(width: number, height: number): void { this.width = width; this.height = height; this.fresh = true; }
  change(mode: ScrollView): void { this.mode = mode; this.velocity = { x: 0, y: 0 }; }
  advance(journey: ScrollJourney, dt: number, reduced: boolean): ScrollProjection {
    const { width, height } = this, instant = reduced || this.fresh;
    const fit = Math.min(width / SCROLL.width, height / SCROLL.height);
    const follow = width < 760 ? clamp(height / 440, .92, 1.3) : clamp(width / 960, 1.05, 1.7);
    this.scale = mix(this.scale, this.mode === 'follow' ? follow : fit, instant ? 1 : 1 - Math.exp(-dt * 5));
    const halfW = width / this.scale / 2, halfH = height / this.scale / 2;
    const point = journey.point, ahead = journey.trail.sample(journey.travel + 75);
    const intended = this.mode === 'overview' ? { x: SCROLL.width / 2, y: SCROLL.height / 2 } : {
      x: point.x + (ahead.x - point.x) * .55 + width * .10 / this.scale,
      y: point.y - height * .30 / this.scale,
    };
    const margin = this.mode === 'follow' ? 600 : 0;
    const target = {
      x: halfW * 2 > SCROLL.width ? SCROLL.width / 2 : clamp(intended.x, halfW - margin, SCROLL.width - halfW + margin),
      y: halfH * 2 > SCROLL.height ? SCROLL.height / 2 : clamp(intended.y, halfH, SCROLL.height - halfH),
    };
    if (instant) { this.center = target; this.velocity = { x: 0, y: 0 }; }
    else {
      const spring = (position: number, velocity: number, goal: number, frequency: number) => {
        const offset = position - goal, decay = Math.exp(-frequency * dt), shift = (velocity + frequency * offset) * dt;
        return [goal + (offset + shift) * decay, (velocity - frequency * shift) * decay] satisfies [number, number];
      };
      const [x, vx] = spring(this.center.x, this.velocity.x, target.x, 3.4);
      const [y, vy] = spring(this.center.y, this.velocity.y, target.y, 2.8);
      this.center = { x, y }; this.velocity = { x: vx, y: vy };
    }
    this.fresh = false;
    const scale = this.scale, x = width / 2 - this.center.x * scale, y = height / 2 - this.center.y * scale;
    return {
      width, height, scale, x, y, center: this.center,
      fromScreen: point => ({ x: (point.x - x) / scale, y: (point.y - y) / scale }),
      toScreen: point => ({ x: x + point.x * scale, y: y + point.y * scale }),
    };
  }
}
