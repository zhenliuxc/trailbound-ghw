import { clamp } from '../model';
import { SCROLL } from './route';
import type { ScrollJourney } from './journey';
import { MapCamera, type MapProjection, type MapView } from '../../journey/map-camera';

export type ScrollView = MapView;
export type ScrollProjection = MapProjection;
export class ScrollCamera extends MapCamera {
  change(mode: ScrollView): void { this.mode = mode; }
  advance(journey: ScrollJourney, dt: number, reduced: boolean): ScrollProjection {
    const { width, height } = this;
    const fit = Math.min(width / SCROLL.width, height / SCROLL.height);
    const follow = width < 760 ? clamp(height / 440, .92, 1.3) : clamp(width / 960, 1.05, 1.7);
    const scale = this.mode === 'follow' ? follow : fit;
    const halfW = width / scale / 2, halfH = height / scale / 2;
    const point = journey.point, ahead = journey.trail.sample(journey.travel + 75);
    const intended = this.mode === 'overview' ? { x: SCROLL.width / 2, y: SCROLL.height / 2 } : {
      x: point.x + (ahead.x - point.x) * .55 + width * .10 / scale,
      y: point.y - height * .30 / scale,
    };
    const margin = this.mode === 'follow' ? 600 : 0;
    const target = {
      x: halfW * 2 > SCROLL.width ? SCROLL.width / 2 : clamp(intended.x, halfW - margin, SCROLL.width - halfW + margin),
      y: halfH * 2 > SCROLL.height ? SCROLL.height / 2 : clamp(intended.y, halfH, SCROLL.height - halfH),
    };
    return this.project({ center: target, scaleX: scale, scaleY: scale }, dt, reduced);
  }
}
