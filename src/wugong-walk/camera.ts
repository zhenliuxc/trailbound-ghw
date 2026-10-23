import { clamp, mix, SCENE, smooth, type Point, type WalkModel } from './model';

export type CameraMode = 'overview' | 'follow';
export interface SceneBounds { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
export const MAP_EXTENT: SceneBounds = { x: -240, y: -180, width: 2120, height: 1240 };
type MarkerPlacement = { readonly kind: 'visible'; readonly point: Readonly<Point> } | { readonly kind: 'hidden' };
export interface FrameProjection {
  readonly mode: CameraMode;
  readonly width: number; readonly height: number; readonly scale: number;
  readonly x: number; readonly y: number; readonly pixelRatio: number;
  readonly close: number; readonly overviewScale: number;
  readonly bounds: SceneBounds;
  readonly overviewBounds: SceneBounds;
  sceneFromCanvas(local: Point): Point;
  canvasFromScene(point: Point): Point;
  sceneRadius(cssPixels: number): number;
  marker(anchor: Point, cssOffset: Point): MarkerPlacement;
}

function projection(mode: CameraMode, width: number, height: number, scale: number, x: number, y: number, pixelRatio: number, overviewScale: number, close: number): FrameProjection {
  return {
    mode, width, height, scale, x, y, pixelRatio, overviewScale, close,
    bounds: { x: -x / scale, y: -y / scale, width: width / scale, height: height / scale },
    overviewBounds: { x: SCENE.width / 2 - width / overviewScale / 2, y: SCENE.height / 2 - height / overviewScale / 2, width: width / overviewScale, height: height / overviewScale },
    sceneFromCanvas: point => ({ x: (point.x - x) / scale, y: (point.y - y) / scale }),
    canvasFromScene: point => ({ x: x + point.x * scale, y: y + point.y * scale }),
    sceneRadius: pixels => pixels / scale,
    marker: (anchor, offset) => {
      const left = x + anchor.x * scale + offset.x, top = y + anchor.y * scale + offset.y;
      if ((mode === 'follow' || close > .001) && (left < 25 || left > width - 25 || top < 28 || top > height - 48)) return { kind: 'hidden' };
      return { kind: 'visible', point: { x: clamp(left, 25, width - 25), y: clamp(top, 31, height - 48) } };
    },
  };
}

export class WalkCamera {
  mode: CameraMode = 'follow';
  private width = 1200;
  private height = 860;
  private ratio = 1;
  private scale = 1;
  private center: Point = { x: SCENE.width / 2, y: SCENE.height / 2 };
  private velocity: Point = { x: 0, y: 0 };
  private initialized = false;
  private firstFrame = true;
  private current: FrameProjection = projection('follow', 1200, 860, 1, 0, 0, 1, 1, 0);
  get frame(): FrameProjection { return this.current; }
  resize(width: number, height: number, ratio: number): void {
    this.width = width; this.height = height; this.ratio = ratio;
    if (!this.initialized || this.mode === 'overview') {
      this.scale = Math.min(width / SCENE.width, height / SCENE.height);
      this.center = { x: SCENE.width / 2, y: SCENE.height / 2 };
      this.velocity = { x: 0, y: 0 };
    }
    this.initialized = true;
    this.publish();
  }
  setMode(mode: CameraMode): void { if (this.mode !== mode) this.velocity = { x: 0, y: 0 }; this.mode = mode; }
  advance(model: WalkModel, dt: number, reduced: boolean): FrameProjection {
    const fit = Math.min(this.width / SCENE.width, this.height / SCENE.height);
    const follow = Math.max(fit * 1.65, clamp(this.height / 290, 1.5, 2.8));
    const desiredScale = this.mode === 'follow' ? follow : fit;
    const zoom = reduced || this.firstFrame ? 1 : 1 - Math.exp(-Math.max(0, dt) * 5.5);
    this.scale = mix(this.scale, desiredScale, zoom);
    if (Math.abs(this.scale - desiredScale) < .0001) this.scale = desiredScale;
    let target: Point = { x: SCENE.width / 2, y: SCENE.height / 2 };
    if (this.mode === 'follow') {
      const point = model.point, direction = model.direction;
      const look = Math.min(10, Math.abs(model.speed) * .9) * (1 - clamp(model.trail.bendAt(model.travel) / 1.2) * .8);
      const ahead = model.trail.sample(model.travel + direction * look);
      target = { x: point.x + (ahead.x - point.x) * .38, y: point.y + (ahead.y - point.y) * .24 - this.height * .14 / this.scale };
      const halfWidth = this.width / this.scale / 2, halfHeight = this.height / this.scale / 2;
      target.x = halfWidth * 2 >= MAP_EXTENT.width ? MAP_EXTENT.x + MAP_EXTENT.width / 2 : clamp(target.x, MAP_EXTENT.x + halfWidth, MAP_EXTENT.x + MAP_EXTENT.width - halfWidth);
      target.y = halfHeight * 2 >= MAP_EXTENT.height ? MAP_EXTENT.y + MAP_EXTENT.height / 2 : clamp(target.y, MAP_EXTENT.y + halfHeight, MAP_EXTENT.y + MAP_EXTENT.height - halfHeight);
    }
    if (reduced || this.firstFrame) { this.center = target; this.velocity = { x: 0, y: 0 }; }
    else {
      const spring = (position: number, velocity: number, destination: number, frequency: number) => {
        const offset = position - destination, decay = Math.exp(-frequency * Math.max(0, dt));
        const shift = (velocity + frequency * offset) * Math.max(0, dt);
        return { position: destination + (offset + shift) * decay, velocity: (velocity - frequency * shift) * decay };
      };
      const x = spring(this.center.x, this.velocity.x, target.x, this.mode === 'follow' ? 4.4 : 7);
      const y = spring(this.center.y, this.velocity.y, target.y, this.mode === 'follow' ? 3.6 : 7);
      this.center = { x: x.position, y: y.position }; this.velocity = { x: x.velocity, y: y.velocity };
    }
    this.firstFrame = false;
    return this.publish();
  }
  private publish(): FrameProjection {
    const fit = Math.min(this.width / SCENE.width, this.height / SCENE.height);
    const follow = Math.max(fit * 1.65, clamp(this.height / 290, 1.5, 2.8));
    const close = smooth((this.scale - fit) / Math.max(.001, follow - fit));
    this.current = projection(this.mode, this.width, this.height, this.scale,
      this.width / 2 - this.center.x * this.scale, this.height / 2 - this.center.y * this.scale, this.ratio, fit, close);
    return this.current;
  }
}
