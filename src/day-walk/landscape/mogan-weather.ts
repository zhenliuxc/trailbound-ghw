import { Container, Graphics } from 'pixi.js';
import type { DayTrail } from '../../journey/day-route';
import type { Point2D } from '../../runtime/projection';
import { bambooClump } from './bamboo';
import type { LandscapeEffects, LandscapeFrame } from './effects';
import { clearOfPath, trailPoint } from './ground';
import { noise } from './primitives';

interface NearBamboo {
  readonly body: Graphics;
  readonly tip: Point2D;
  readonly phase: number;
  readonly period: number;
}
interface MoganWeatherScene {
  readonly waterDrops: Graphics;
  readonly wetStones: Graphics;
  readonly sunlight: Graphics;
  readonly plants: Container;
  readonly ground: Graphics;
  readonly trail: DayTrail;
  readonly streams: readonly (readonly Point2D[])[];
}
const conditions = {
  rain: { wet: 1, light: 0, drops: 1 },
  fog: { wet: .7, light: .17, drops: .65 },
  clear: { wet: .28, light: 1, drops: .1 },
  wind: { wet: .25, light: .85, drops: .08 },
} satisfies Record<LandscapeFrame['weather'], { wet: number; light: number; drops: number }>;

export class MoganWeather implements LandscapeEffects {
  private readonly bamboos: readonly NearBamboo[];
  private previousTime: number | undefined;
  private wet = 1;
  private light = 0;
  private drops = 1;
  private drawnAt = -1;

  constructor(private readonly scene: MoganWeatherScene) {
    const { plants, ground, trail, streams } = scene;
    const candidates = [1, 2, 3, 4, 5, 6, 9, 10, 11, 12].flatMap((knot, i) => [-1, 1].map(side => {
      const at = trail.knotDistances[knot] + 35;
      const point = trailPoint(trail, at, side * (165 + noise(i + 18) * 30));
      return { ...point, height: 124 + noise(i * 7 + side) * 32, seed: i * 17 + side + 290 };
    })).sort((a, b) => a.y - b.y);
    const bamboos: NearBamboo[] = [];
    for (const { x, y, height, seed } of candidates) {
      const crown = { x, y: y - height * .48 };
      if (!clearOfPath(crown, trail.points, height * .65 + 35)
        || streams.some(stream => !clearOfPath(crown, stream, height * .65 + 26))) continue;
      ground.ellipse(x + 8, y + 5, height * .4, height * .11).fill({ color: '#496f50', alpha: .15 });
      const body = new Graphics();
      const tip = bambooClump(body, 0, 0, height, seed);
      body.position.set(x, y); plants.addChild(body);
      bamboos.push({ body, tip, phase: noise(seed) * 9, period: 4.7 + noise(seed + 3) * 3.8 });
    }
    this.bamboos = bamboos;
  }

  paint({ time, reducedMotion, weather }: LandscapeFrame): void {
    const target = conditions[weather];
    const dt = this.previousTime === undefined ? 0 : Math.max(0, time - this.previousTime);
    const blend = reducedMotion || this.previousTime === undefined ? 1 : 1 - Math.exp(-dt * .55);
    this.previousTime = time;
    this.wet += (target.wet - this.wet) * blend;
    this.light += (target.light - this.light) * blend;
    this.drops += (target.drops - this.drops) * blend;
    this.scene.wetStones.alpha = this.wet;
    this.scene.sunlight.alpha = this.light;
    this.scene.waterDrops.alpha = this.drops;
    const now = reducedMotion ? 0 : time;
    for (const plant of this.bamboos) {
      plant.body.rotation = reducedMotion ? 0 : Math.sin(now * .65 + plant.body.x * .003) * .008
        + Math.sin(now * 1.13 + plant.phase) * .003;
    }
    const tick = reducedMotion ? -2 : Math.floor(now * 24);
    if (this.drawnAt === tick) return;
    this.drawnAt = tick;
    const g = this.scene.waterDrops;
    g.clear();
    for (const plant of this.bamboos) {
      const angle = plant.body.rotation, cos = Math.cos(angle), sin = Math.sin(angle);
      const x = plant.body.x + plant.tip.x * cos - plant.tip.y * sin;
      const y = plant.body.y + plant.tip.x * sin + plant.tip.y * cos;
      const age = (now + plant.phase) % plant.period;
      if (reducedMotion || age < .65) {
        const bead = reducedMotion ? 1.3 : .7 + age * 1.4;
        g.ellipse(x, y + 1, bead, bead * 1.35).fill({ color: '#d4e4cf', alpha: .7 });
      } else if (age < 1.5) {
        const t = (age - .65) / .85, dropY = y + (plant.body.y - y) * t * t;
        g.moveTo(x, dropY - 3.5).lineTo(x + .7, dropY)
          .stroke({ color: '#dce9d5', width: 1.6, alpha: .7, cap: 'round' });
      } else if (age < 2.1) {
        const t = (age - 1.5) / .6;
        g.ellipse(x + .7, plant.body.y + 1, 2 + t * 6, 1 + t * 1.4)
          .stroke({ color: '#d3dfc4', width: 1, alpha: (1 - t) * .38 });
      }
    }
  }
}
