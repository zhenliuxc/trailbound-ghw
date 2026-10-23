export interface MapView { x: number; y: number; w: number; h: number }
interface Point { x: number; y: number }
interface Insets { top?: number; right?: number; bottom?: number; left?: number }
const canonical = (): MapView => ({ x: 0, y: 0, w: 720, h: 600 });
const valid = (width: number, height: number) => Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/** Keep the whole 720×600 illustration; wide screens reveal more land beside it.
 * Geography always uses the canonical projection, independent of the container. */
export function mapViewport(width: number, height: number, desktop: boolean): MapView {
  if (!desktop || !valid(width, height)) return canonical();
  const ratio = width / height, h = Math.max(600, height / 1.45), w = Math.max(720, h * ratio), fittedH = w / ratio;
  return { x: (720 - w) / 2, y: (600 - fittedH) / 2, w, h: fittedH };
}

/** A modest desktop follow lens, using the same aspect ratio as the overview. */
export function mapFollowViewport(width: number, height: number, full: MapView, point: Point, desktop: boolean, photo = false): MapView {
  if (!valid(width, height)) return { ...full };
  const ratio = width / height, h = desktop ? Math.max(full.h / 1.14, height / 1.6) : Math.min(600, 470 / ratio), w = desktop ? h * ratio : 470;
  const minX = desktop ? full.x : 0, maxX = desktop ? full.x + full.w - w : 720 - w;
  const minY = (desktop ? full.y : 0) - (photo ? 80 : 0), maxY = (desktop ? full.y + full.h : 600) - h + (photo ? 400 : 0);
  return { x: clamp(point.x - w / 2, minX, Math.max(minX, maxX)), y: clamp(point.y - h * (photo ? .24 : .54), minY, Math.max(minY, maxY)), w, h };
}

/** Match SVG meet/slice and the Pixi camera; overlay sizes are in CSS pixels. */
export function mapSymbols(width: number, height: number, view: MapView, full: boolean) {
  const scale = valid(width, height) ? (full ? Math.min : Math.max)(width / view.w, height / view.h) : 1;
  const safeScale = Math.max(.001, scale), frameHeight = valid(width, height) ? height : 600;
  const markerPixels = clamp(frameHeight * .05, 36, 44), discoveryPixels = clamp(frameHeight * .075, 48, 64), hikerPixels = clamp(frameHeight * .08, 44, 68);
  return { scale: safeScale, offsetX: (width - view.w * safeScale) / 2 - view.x * safeScale, offsetY: (height - view.h * safeScale) / 2 - view.y * safeScale,
    marker: markerPixels / (42 * safeScale), discovery: discoveryPixels / (48 * safeScale), hiker: hikerPixels / (48 * safeScale), font: 12 / safeScale,
    markerPixels, discoveryPixels, hikerPixels };
}

/** Clamp the entire discovery bubble to the displayed crop, including mobile slice. */
export function mapMarkerAnchor(point: Point, width: number, height: number, view: MapView, full: boolean, insets: Insets = {}): Point {
  const metrics = mapSymbols(width, height, view, full), left = Math.min(width / 2, insets.left ?? 48), right = Math.max(left, width - (insets.right ?? 48));
  const top = Math.min(height / 2, insets.top ?? 94), bottom = Math.max(top, height - (insets.bottom ?? 72));
  return { x: (clamp(point.x * metrics.scale + metrics.offsetX, left, right) - metrics.offsetX) / metrics.scale,
    y: (clamp(point.y * metrics.scale + metrics.offsetY, top, bottom) - metrics.offsetY) / metrics.scale };
}
