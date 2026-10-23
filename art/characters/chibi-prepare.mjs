import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('/Users/liuxucheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = path.join(root, 'art/characters/chibi-source-v1.png');
const output = path.join(root, 'public/characters/trailbound-chibi-v1.webp');
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const rowEdges = [0, 376, 724, 1086];
const hips = [217, 560, 916, 1270, 218, 571, 924, 1282, 218, 568, 924, 1291];
const poses = ['front-idle', 'right-idle', 'camera', 'back-scenic', 'walk-left-contact', 'walk-lower-a', 'walk-pass-a', 'walk-rise-a', 'walk-right-contact', 'walk-lower-b', 'walk-pass-b', 'walk-rise-b'];
const frames = poses.map((pose, index) => {
  const x = (index % 4) * 362;
  const y = rowEdges[Math.floor(index / 4)];
  const width = 362;
  const height = rowEdges[Math.floor(index / 4) + 1] - y;
  const seen = new Uint8Array(width * height);
  const components = [];
  let allMinX = width, allMinY = height, allMaxX = -1, allMaxY = -1;
  const has = (lx, ly) => data[((y + ly) * info.width + x + lx) * 4 + 3] > 12;
  for (let ly = 0; ly < height; ly++) {
    for (let lx = 0; lx < width; lx++) {
      if (!has(lx, ly)) continue;
      allMinX = Math.min(allMinX, lx); allMaxX = Math.max(allMaxX, lx);
      allMinY = Math.min(allMinY, ly); allMaxY = Math.max(allMaxY, ly);
      const start = ly * width + lx;
      if (seen[start]) continue;
      seen[start] = 1;
      const queue = [start];
      let cursor = 0, minX = lx, maxX = lx, minY = ly, maxY = ly;
      while (cursor < queue.length) {
        const current = queue[cursor++];
        const cx = current % width;
        const cy = Math.floor(current / width);
        minX = Math.min(minX, cx); maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy); maxY = Math.max(maxY, cy);
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const next = ny * width + nx;
          if (seen[next] || !has(nx, ny)) continue;
          seen[next] = 1;
          queue.push(next);
        }
      }
      components.push({ pixels: queue.length, minX, minY, maxX, maxY });
    }
  }
  components.sort((a, b) => b.pixels - a.pixels);
  const body = components[0];
  const visibleBounds = { x: body.minX, y: body.minY, width: body.maxX - body.minX + 1, height: body.maxY - body.minY + 1 };
  const footAnchor = { x: hips[index] - x, y: body.maxY + 1 };
  return {
    index, pose, sourceRect: { x, y, width, height }, visibleBounds,
    alphaBoundsIncludingNoise: { x: allMinX, y: allMinY, width: allMaxX - allMinX + 1, height: allMaxY - allMinY + 1 },
    footAnchor,
    anchor: { x: footAnchor.x / width, y: footAnchor.y / height },
    visualScaleTo350: 350 / visibleBounds.height,
    note: 'Bounds use alpha > 12 and the largest connected character component. Horizontal foot anchor follows the visually read pelvis axis, not backpack-biased bounds midpoint.'
  };
});
await sharp(source).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(output);
const meta = {
  image: '/characters/trailbound-chibi-v1.webp',
  source: 'art/characters/chibi-source-v1.png',
  width: info.width, height: info.height,
  columns: 4, rows: 3,
  layout: 'Four equal-width columns; generated row baselines are uneven, so sourceRect must be used instead of equal-height slicing.',
  alphaThreshold: 12,
  recommendedVisibleHeight: { mapCssPx: 72, notes: 'Use a common apparent height and each frame footAnchor. Keep full sprite aspect ratio; do not stretch. Map sizing needs later game review.' },
  frames
};
await fs.writeFile(path.join(root, 'art/characters/chibi-v1.json'), JSON.stringify(meta, null, 2) + '\n');
console.log(JSON.stringify({ width: info.width, height: info.height, frames: frames.map(({ index, sourceRect, visibleBounds, footAnchor }) => ({ index, sourceRect, visibleBounds, footAnchor })) }, null, 2));
