import { Container, FillGradient, Graphics } from 'pixi.js';
import type { EnvironmentFrame } from '../environment';
import type { ScrollProjection } from './camera';
import type { ScrollTrail } from './route';

interface Cloud {
  readonly shape: Graphics;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly phase: number;
}

function cloudShape(): Graphics {
  return new Graphics().moveTo(-110, 9)
    .bezierCurveTo(-126, -1, -110, -16, -87, -15)
    .bezierCurveTo(-81, -32, -51, -35, -32, -26)
    .bezierCurveTo(-19, -45, 18, -41, 32, -24)
    .bezierCurveTo(56, -31, 82, -20, 86, -8)
    .bezierCurveTo(121, -6, 126, 9, 104, 15)
    .bezierCurveTo(60, 25, -68, 26, -110, 9).closePath().fill('#ffffff');
}

export class ScrollSky {
  readonly view = new Container();
  private readonly upper = new Graphics();
  private readonly horizon = new Graphics();
  private readonly sun = new Graphics();
  private readonly moon = new Graphics();
  private readonly fade = new FillGradient({
    start: { x: 0, y: 0 }, end: { x: 0, y: 1 },
    colorStops: [{ offset: 0, color: '#ffffff00' }, { offset: 1, color: '#ffffffff' }],
  });
  private readonly high: Cloud[] = [];
  private readonly distant: Cloud[] = [];
  private width = 1200;
  private height = 600;

  constructor(trail: ScrollTrail) {
    this.view.addChild(this.upper, this.horizon);
    this.sun.circle(0, 0, 32).fill({ color: '#f7dfad', alpha: .12 }).circle(0, 0, 23).fill({ color: '#fae7bc', alpha: .25 }).circle(0, 0, 15).fill('#faf0cd');
    this.moon.circle(0, 0, 13).fill('#e9edda').circle(6, -5, 11).fill('#415e70');
    this.view.addChild(this.sun, this.moon);
    for (let i = 0; i < 3; i++) {
      const cloud = { shape: cloudShape(), x: .14 + i * .37, y: .13 + (i % 2) * .09, width: 150 + i * 26, phase: i * 2.1 };
      this.high.push(cloud); this.view.addChild(cloud.shape);
    }
    for (let i = 0; i < 8; i++) {
      const x = 100 + i * 440;
      const cloud = { shape: cloudShape(), x, y: trail.distantAt(x) - 42 - (i % 3) * 18, width: 155 + (i % 3) * 30, phase: i * 1.9 };
      this.distant.push(cloud); this.view.addChild(cloud.shape);
    }
  }

  resize(width: number, height: number): void {
    this.width = width; this.height = height;
    this.upper.clear().rect(0, 0, width, height).fill('#ffffff');
    this.horizon.clear().rect(0, 0, width, height).fill(this.fade);
  }

  paint(projection: ScrollProjection, environment: EnvironmentFrame, reduced: boolean): void {
    const elapsed = reduced ? 0 : environment.elapsed;
    this.upper.tint = environment.skyTop; this.horizon.tint = environment.skyBottom;
    this.sun.position.set(this.width * .73, this.height * (.17 + environment.warmth * .12));
    this.sun.alpha = (1 - environment.night) * (1 - environment.cloud * .8);
    this.moon.position.set(this.width * .78, this.height * .16); this.moon.alpha = environment.night * (1 - environment.cloud * .55);
    for (const cloud of this.high) {
      const drift = Math.sin(elapsed * .018 + cloud.phase) * 22;
      const parallax = Math.sin(projection.center.x / 2100 + cloud.phase) * 18;
      cloud.shape.position.set(this.width * cloud.x + drift - parallax, this.height * cloud.y);
      cloud.shape.scale.set(Math.min(1, this.width / 850) * cloud.width / 240);
      cloud.shape.tint = environment.skyBottom; cloud.shape.alpha = .25 + environment.cloud * .24;
    }
    for (const cloud of this.distant) {
      const at = projection.toScreen({ x: cloud.x + Math.sin(elapsed * .025 + cloud.phase) * 32, y: cloud.y });
      cloud.shape.position.set(at.x, at.y);
      cloud.shape.scale.set(cloud.width / 240 * projection.scale);
      cloud.shape.tint = environment.skyBottom; cloud.shape.alpha = .50 + environment.cloud * .24;
      cloud.shape.visible = at.x > -240 && at.x < this.width + 240 && at.y > -100 && at.y < this.height + 100;
    }
  }

  destroy(): void { this.fade.destroy(); }
}
