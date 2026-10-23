export interface Point2D { readonly x: number; readonly y: number }
export interface Size2D { readonly width: number; readonly height: number }
export interface Projection2D {
  readonly x: number;
  readonly y: number;
  readonly scaleX: number;
  readonly scaleY: number;
  toScreen(world: Point2D): Point2D;
  toWorld(screen: Point2D): Point2D;
}

/** World units ↔ local viewport pixels. Pointer normalization happens at the DOM boundary. */
export function createProjection(x: number, y: number, scaleX: number, scaleY = scaleX): Projection2D {
  return {
    x, y, scaleX, scaleY,
    toScreen: world => ({ x: x + world.x * scaleX, y: y + world.y * scaleY }),
    toWorld: screen => ({ x: (screen.x - x) / scaleX, y: (screen.y - y) / scaleY }),
  };
}

/** Cover an illustration, clamping the focus to keep its edges outside the viewport. */
export function coverCamera(width: number, height: number, world: Size2D, focus: Point2D, zoom = 1) {
  const scale = Math.max(width / world.width, height / world.height) * zoom;
  const halfWidth = width / scale / 2, halfHeight = height / scale / 2;
  const cx = Math.max(halfWidth, Math.min(world.width - halfWidth, focus.x));
  const cy = Math.max(halfHeight, Math.min(world.height - halfHeight, focus.y));
  return { ...createProjection(width / 2 - cx * scale, height / 2 - cy * scale, scale), scale };
}
