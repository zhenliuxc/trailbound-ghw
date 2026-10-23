export interface LabelCandidate {
  readonly id: string; readonly x: number; readonly y: number;
  readonly width: number; readonly height: number; readonly rank: number;
}
interface Rect { x: number; y: number; width: number; height: number }
const overlaps = (a: Rect, b: Rect): boolean => a.x < b.x + b.width + 7 && a.x + a.width + 7 > b.x && a.y < b.y + b.height + 6 && a.y + a.height + 6 > b.y;

// Labels stay beside their terrain points; crowded minor labels wait until the
// follow camera reaches them. No off-map list or leader lines are introduced.
export function layoutMapLabels(candidates: readonly LabelCandidate[], width: number, height: number): Map<string, { x: number; y: number }> {
  const occupied: Rect[] = [
    { x: width - 154, y: 8, width: 148, height: 64 },
    { x: 8, y: height - 54, width: Math.min(270, width * .74), height: 47 },
  ];
  const result = new Map<string, { x: number; y: number }>();
  for (const candidate of [...candidates].sort((a, b) => a.rank - b.rank)) {
    for (const dy of candidate.rank === 0 ? [0, -36, 32, 64] : [0, -36, 32]) {
      const x = candidate.x, y = candidate.y + dy;
      const r = { x: x - candidate.width / 2, y: y - candidate.height / 2, width: candidate.width, height: candidate.height };
      if (r.x < 8 || r.x + r.width > width - 8 || r.y < 12 || r.y + r.height > height - 9 || occupied.some(other => overlaps(r, other))) continue;
      occupied.push(r); result.set(candidate.id, { x, y }); break;
    }
  }
  return result;
}
