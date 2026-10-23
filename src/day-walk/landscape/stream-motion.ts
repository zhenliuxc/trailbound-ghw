import type { Graphics } from 'pixi.js';
import type { Point2D } from '../../runtime/projection';
import type { LandscapeEffects, LandscapeFrame } from './effects';
import { noise } from './primitives';

interface Stream {
  /** Ordered from upstream to downstream. */
  readonly points: readonly Point2D[];
  readonly width: number;
  readonly rapids: readonly Point2D[];
}
interface FlowSegment {
  readonly a: Point2D;
  readonly b: Point2D;
  readonly from: number;
  readonly until: number;
  readonly speed: number;
}
interface Flow {
  readonly segments: readonly FlowSegment[];
  readonly duration: number;
  readonly width: number;
  readonly count: number;
}
interface Pool {
  readonly center: Point2D;
  readonly radius: number;
}
interface StreamScene {
  readonly streams: readonly Stream[];
  readonly pools: readonly Pool[];
}

function flowAlong(stream: Stream, pools: readonly Pool[]): Flow {
  let duration = 0, length = 0;
  const segments: FlowSegment[] = [];
  for (let i = 1; i < stream.points.length; i++) {
    const a = stream.points[i - 1], b = stream.points[i];
    const distance = Math.hypot(b.x - a.x, b.y - a.y);
    if (distance < .01) continue;
    const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const poolAmount = pools.reduce((amount, pool) =>
      Math.max(amount, Math.max(0, 1 - Math.hypot(center.x - pool.center.x, center.y - pool.center.y) / pool.radius)), 0);
    const rapidAmount = stream.rapids.reduce((amount, rock) =>
      Math.max(amount, Math.max(0, 1 - Math.hypot(center.x - rock.x, center.y - rock.y) / 62)), 0);
    const speed = (11 + rapidAmount * 17) * (1 - poolAmount * .72);
    const until = duration + distance / speed;
    segments.push({ a, b, from: duration, until, speed });
    duration = until; length += distance;
  }
  return { segments, duration, width: stream.width, count: Math.max(2, Math.floor(length / 110)) };
}

function sample(flow: Flow, time: number): { p: Point2D; dx: number; dy: number; speed: number } {
  let lo = 0, hi = flow.segments.length - 1;
  while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (flow.segments[mid].until < time) lo = mid + 1; else hi = mid; }
  const { a, b, from, until, speed } = flow.segments[lo];
  const t = (time - from) / (until - from), distance = Math.hypot(b.x - a.x, b.y - a.y);
  return { p: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, dx: (b.x - a.x) / distance, dy: (b.y - a.y) / distance, speed };
}

export class StreamMotion implements LandscapeEffects {
  private readonly flows: readonly Flow[];
  private drawnAt = -1;
  constructor(private readonly g: Graphics, private readonly scene: StreamScene) {
    this.flows = scene.streams.map(stream => flowAlong(stream, scene.pools)).filter(flow => flow.segments.length > 0);
  }

  paint({ time, reducedMotion }: LandscapeFrame): void {
    // Geometry is small and world anchored. Keep it at 15 fps without a separate timer.
    const tick = reducedMotion ? 0 : Math.floor(time * 15);
    if (tick === this.drawnAt) return;
    this.drawnAt = tick;
    const now = tick / 15, g = this.g;
    g.clear();
    for (const [f, flow] of this.flows.entries()) {
      for (let i = 0; i < flow.count; i++) {
        const offset = (i + noise(i + f * 31) * .5) / flow.count;
        const age = (now + flow.duration * offset) % flow.duration;
        const { p, dx, dy, speed } = sample(flow, age);
        const lateral = (noise(i * 7 + f) - .5) * flow.width * .42;
        const x = p.x - dy * lateral, y = p.y + dx * lateral;
        const fade = Math.min(1, age / 2, (flow.duration - age) / 2);
        const alpha = (.18 + noise(i + 51) * .19) * fade;
        if (speed > 20) {
          const length = 9 + noise(i + 3) * 8;
          g.moveTo(x - dx * length, y - dy * length).quadraticCurveTo(x, y, x + dx * 4 - dy * 1.5, y + dy * 4 + dx * 1.5)
            .stroke({ color: '#eff1de', width: 1.4, alpha, cap: 'round' });
        } else {
          const spread = flow.width * (.12 + noise(i + 8) * .055);
          g.moveTo(x + dy * spread - dx * 2, y - dx * spread - dy * 2)
            .quadraticCurveTo(x + dx * 3, y + dy * 3, x - dy * spread - dx * 2, y + dx * spread - dy * 2)
            .stroke({ color: '#edf0db', width: 1.6, alpha, cap: 'round' });
        }
      }
    }
    for (const pool of this.scene.pools) for (let i = 0; i < 3; i++) {
      const phase = (now * .055 + i / 3) % 1;
      const size = pool.radius / 115;
      const x = pool.center.x + (-28 + i * 20) * size, y = pool.center.y + (10 + i * 8) * size;
      const radius = (8 + phase * 18) * size;
      g.moveTo(x - radius, y).quadraticCurveTo(x, y + (3 + phase * 3) * size, x + radius, y)
        .stroke({ color: '#ecf0dc', width: 1.5, alpha: Math.sin(phase * Math.PI) * .23 });
    }
  }
}
