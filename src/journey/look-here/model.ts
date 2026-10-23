import { EXPLORATION_SECONDS, GLIMPSE_POINTS, type GlimpsePointId } from '../../content/look-here';
import type { DayTrail } from '../day-route';

export class GlimpseVisits {
  private readonly elapsed = new Map<GlimpsePointId, number>();
  private readonly qualified = new Set<GlimpsePointId>();
  private readonly zones;
  constructor(trail: DayTrail) {
    const at = (knot: number) => {
      const index = Math.floor(knot), a = trail.knotDistances[index], b = trail.knotDistances[index + 1] ?? a;
      return a + (b - a) * (knot - index);
    };
    this.zones = GLIMPSE_POINTS.map(point => ({ id: point.id, from: at(point.zone[0]), to: at(point.zone[1]) }));
  }
  current(distance: number): GlimpsePointId | null { return this.zones.find(zone => distance >= zone.from && distance <= zone.to)?.id ?? null; }
  update(distance: number, dt: number, exploring: boolean): GlimpsePointId | null {
    const id = this.current(distance);
    if (!id) return null;
    if (exploring && Number.isFinite(dt) && dt > 0) {
      const elapsed = (this.elapsed.get(id) ?? 0) + Math.min(dt, .1);
      this.elapsed.set(id, elapsed);
      if (elapsed >= EXPLORATION_SECONDS) this.qualified.add(id);
    }
    return this.qualified.has(id) ? id : null;
  }
}
