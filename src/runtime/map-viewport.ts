/** Fit the complete route inside the visible desktop crop, without stretching geography. */
export function mapViewport(width: number, height: number, desktop: boolean) {
  const ratio = Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0 ? width / height : 1.2;
  const h = desktop ? Math.min(600, 720 / ratio) : 600;
  return { x: 0, y: (600 - h) / 2, w: 720, h };
}
