function color(colors: Uint8Array, index: number): string {
  return `rgb(${colors[index * 3]},${colors[index * 3 + 1]},${colors[index * 3 + 2]})`;
}

export function paintTerrainTriangle(ctx: CanvasRenderingContext2D, positions: Float32Array, colors: Uint8Array, luminance: Float32Array, a: number, b: number, c: number): void {
  const ax = positions[a * 2], ay = positions[a * 2 + 1];
  const bx = positions[b * 2], by = positions[b * 2 + 1], cx = positions[c * 2], cy = positions[c * 2 + 1];
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath();
  let low = a, high = a;
  if (luminance[b] < luminance[low]) low = b;
  if (luminance[c] < luminance[low]) low = c;
  if (luminance[b] > luminance[high]) high = b;
  if (luminance[c] > luminance[high]) high = c;
  const determinant = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
  if (luminance[high] - luminance[low] > 1.2 && Math.abs(determinant) > .00001) {
    const gx = ((luminance[b] - luminance[a]) * (cy - ay) - (luminance[c] - luminance[a]) * (by - ay)) / determinant;
    const gy = ((bx - ax) * (luminance[c] - luminance[a]) - (cx - ax) * (luminance[b] - luminance[a])) / determinant;
    const norm = gx * gx + gy * gy;
    const from = (luminance[low] - luminance[a]) / norm, to = (luminance[high] - luminance[a]) / norm;
    const gradient = ctx.createLinearGradient(ax + gx * from, ay + gy * from, ax + gx * to, ay + gy * to);
    gradient.addColorStop(0, color(colors, low)); gradient.addColorStop(1, color(colors, high));
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = `rgb(${Math.round((colors[a * 3] + colors[b * 3] + colors[c * 3]) / 3)},${Math.round((colors[a * 3 + 1] + colors[b * 3 + 1] + colors[c * 3 + 1]) / 3)},${Math.round((colors[a * 3 + 2] + colors[b * 3 + 2] + colors[c * 3 + 2]) / 3)})`;
  }
  ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = .16; ctx.stroke();
}
