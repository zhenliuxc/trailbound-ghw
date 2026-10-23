import { MAP_CHARACTER_HEIGHT } from '../characters/metrics';
import { createProjection, type Point2D, type Projection2D, type Size2D } from '../runtime/projection';

export type MapView = 'follow' | 'overview';
export interface MapFraming {
  readonly center: Point2D;
  readonly scaleX: number;
  readonly scaleY: number;
}
export interface MapProjection extends Projection2D, Size2D {
  readonly center: Point2D;
  readonly actorHeight: number;
}

const PRESENTATION = { followHeight: 40, overviewHeight: 20, response: 4 };
const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

/** Routes choose what to frame; all maps use the same motion and screen-space character size. */
export class MapCamera {
  mode: MapView = 'follow';
  width = 1200;
  height = 650;
  private offset: Point2D = { x: 0, y: 0 };
  private scaleX = 1;
  private scaleY = 1;
  private actorHeight = PRESENTATION.followHeight;
  private fresh = true;

  resize(width: number, height: number): void { this.width = width; this.height = height; this.snap(); }
  snap(): void { this.fresh = true; }

  project(target: MapFraming, dt: number, reduced: boolean): MapProjection {
    const instant = this.fresh || reduced;
    const blend = instant ? 1 : 1 - Math.exp(-Math.max(0, dt) * PRESENTATION.response);
    // Blend the complete screen transform so a visible landmark cannot swing offscreen during zoom.
    this.offset = {
      x: mix(this.offset.x, this.width / 2 - target.center.x * target.scaleX, blend),
      y: mix(this.offset.y, this.height / 2 - target.center.y * target.scaleY, blend),
    };
    this.scaleX = mix(this.scaleX, target.scaleX, blend);
    this.scaleY = mix(this.scaleY, target.scaleY, blend);
    this.actorHeight = mix(this.actorHeight, this.mode === 'follow' ? PRESENTATION.followHeight : PRESENTATION.overviewHeight, blend);
    this.fresh = false;
    return {
      ...createProjection(this.offset.x, this.offset.y, this.scaleX, this.scaleY),
      width: this.width, height: this.height,
      center: { x: (this.width / 2 - this.offset.x) / this.scaleX, y: (this.height / 2 - this.offset.y) / this.scaleY },
      actorHeight: this.actorHeight,
    };
  }
}

/** Cancel camera magnification on both axes without changing the sprite's foot anchor. */
export function mapCharacterScale(projection: MapProjection): Point2D {
  const size = projection.actorHeight / MAP_CHARACTER_HEIGHT;
  return { x: size / projection.scaleX, y: size / projection.scaleY };
}
