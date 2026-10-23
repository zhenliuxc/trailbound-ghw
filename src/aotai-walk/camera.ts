import { OVERVIEW_BOUNDS } from '../content/aotai-map';
export interface OverviewCamera { readonly scaleX: number; readonly scaleY: number; readonly center: { readonly x: number; readonly y: number } }
export function overviewCamera(width: number, height: number): OverviewCamera {
  const b = OVERVIEW_BOUNDS, margin = width < 700 ? 38 : 55;
  const scaleX = (width - margin * 2) / (b.right - b.left);
  return { scaleX, scaleY: Math.min((height - 80) / (b.bottom - b.top), scaleX * 2.2), center: { x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2 } };
}
