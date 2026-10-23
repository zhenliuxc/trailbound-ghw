import { clamp, type Point } from '../model';

export interface MarkerAnchor { readonly id: string; readonly at: Point }
export interface MarkerPosition extends MarkerAnchor { readonly x: number; readonly y: number }

export function overviewMarkers(anchors: readonly MarkerAnchor[], width: number, height: number): MarkerPosition[] {
  if (width < 520 && anchors.length > 0) {
    const columns = Math.max(1, Math.floor((width - 24) / 88)), rowCount = Math.ceil(anchors.length / columns);
    const above = clamp(Math.min(...anchors.map(anchor => anchor.at.y)) - 58, 96, height - 84 - (rowCount - 1) * 74);
    const ordered = [...anchors].sort((a, b) => a.at.x - b.at.x);
    const rows = Array.from({ length: rowCount }, (_, row) => ordered.filter((_, i) => i % rowCount === row));
    return rows.flatMap((row, index) => {
      return row.map((anchor, i) => ({ ...anchor, x: 47 + (width - 94) * (row.length === 1 ? .5 : i / (row.length - 1)), y: above + index * 74 }));
    });
  }
  const placed: MarkerPosition[] = [];
  for (const anchor of anchors) {
    const x = clamp(anchor.at.x, 60, width - 60), y = clamp(anchor.at.y - 50, 96, height - 110);
    const candidates = [0, -116, 116, -232, 232, -348, 348].flatMap(dx => [0, -74, 74, -148, 148, -222, 222].map(dy => ({ x: clamp(x + dx, 60, width - 60), y: clamp(y + dy, 96, height - 110) })));
    candidates.sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y));
    const chosen = candidates.find(candidate => placed.every(other => Math.abs(other.x - candidate.x) >= 116 || Math.abs(other.y - candidate.y) >= 74)) ?? { x, y };
    placed.push({ ...anchor, ...chosen });
  }
  return placed;
}
