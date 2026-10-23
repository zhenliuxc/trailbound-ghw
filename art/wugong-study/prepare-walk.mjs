import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('/Users/liuxucheng/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourceFile = 'art/wugong-study/walk-source-v1.png';
const source = path.join(root, sourceFile);
const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const columns = 4;
const rows = 2;
const columnEdges = Array.from({ length: columns + 1 }, (_, i) => Math.floor(i * info.width / columns));
const rowEdges = Array.from({ length: rows + 1 }, (_, i) => Math.floor(i * info.height / rows));
const alphaThreshold = 12;
const margin = 2;

// Source-image axes pass through the trouser waist beneath the torso, rather
// than the asymmetric backpack, swinging arm, or stride silhouette midpoint.
const hipAxes = [262, 674, 1092, 1526, 262, 676, 1082, 1524];
const poses = ['left-contact', 'left-weight', 'left-pass', 'left-rise', 'right-contact', 'right-weight', 'right-pass', 'right-rise'];

const details = hipAxes.map((hipX, index) => {
  const column = index % columns;
  const row = Math.floor(index / columns);
  const cell = {
    x: columnEdges[column], y: rowEdges[row],
    width: columnEdges[column + 1] - columnEdges[column],
    height: rowEdges[row + 1] - rowEdges[row],
  };
  const visited = new Uint8Array(cell.width * cell.height);
  const components = [];
  const hasAlpha = (x, y) => data[((cell.y + y) * info.width + cell.x + x) * 4 + 3] > alphaThreshold;

  for (let y = 0; y < cell.height; y++) {
    for (let x = 0; x < cell.width; x++) {
      const start = y * cell.width + x;
      if (visited[start] || !hasAlpha(x, y)) continue;
      visited[start] = 1;
      const queue = [start];
      let cursor = 0;
      let minX = x, maxX = x, minY = y, maxY = y;
      while (cursor < queue.length) {
        const pixel = queue[cursor++];
        const px = pixel % cell.width;
        const py = Math.floor(pixel / cell.width);
        minX = Math.min(minX, px); maxX = Math.max(maxX, px);
        minY = Math.min(minY, py); maxY = Math.max(maxY, py);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = px + dx, ny = py + dy;
            if (nx < 0 || nx >= cell.width || ny < 0 || ny >= cell.height) continue;
            const next = ny * cell.width + nx;
            if (visited[next] || !hasAlpha(nx, ny)) continue;
            visited[next] = 1;
            queue.push(next);
          }
        }
      }
      components.push({ pixels: queue.length, minX, minY, maxX, maxY });
    }
  }

  components.sort((a, b) => b.pixels - a.pixels);
  const body = components[0];
  if (!body) throw new Error(`No opaque character found in sprite cell ${index}.`);
  const visibleBounds = {
    x: cell.x + body.minX, y: cell.y + body.minY,
    width: body.maxX - body.minX + 1, height: body.maxY - body.minY + 1,
  };
  const x = Math.max(cell.x, visibleBounds.x - margin);
  const y = Math.max(cell.y, visibleBounds.y - margin);
  const right = Math.min(cell.x + cell.width, visibleBounds.x + visibleBounds.width + margin);
  const bottom = Math.min(cell.y + cell.height, visibleBounds.y + visibleBounds.height + margin);
  const frame = {
    x, y, width: right - x, height: bottom - y,
    footX: hipX - x,
    footY: visibleBounds.y + visibleBounds.height - y,
  };
  return {
    index, pose: poses[index], cell, visibleBounds, frame,
    hipAxisSourceX: hipX,
    bodyPixels: body.pixels,
    excludedComponentCount: components.length - 1,
    excludedAlphaPixels: components.slice(1).reduce((sum, component) => sum + component.pixels, 0),
  };
});

const heights = details.map(({ visibleBounds }) => visibleBounds.height).sort((a, b) => a - b);
const referenceHeight = (heights[3] + heights[4]) / 2;
const metadata = {
  width: info.width, height: info.height, columns, rows, referenceHeight,
  frames: details.map(({ frame }) => frame),
};
const provenance = {
  source: sourceFile,
  image: 'dist/characters/wugong-study-walk-v1.webp',
  groundSource: 'art/wugong-study/ground-source-v1.png',
  groundImage: 'dist/scenes/wugong-study-ground-v1.webp',
  preparation: 'node art/wugong-study/prepare-walk.mjs',
  bounds: 'Largest eight-connected alpha > 12 component in each equal grid cell, with a two-pixel margin clamped to that cell. Source images are converted in full; no crop, resize, redraw, or alpha cleanup is applied.',
  anchors: 'footX follows a manually inspected trouser-waist/torso axis. footY is the bottom of the main alpha component. Both are local to each source rectangle. referenceHeight is the median unpadded visible height; use a shared scale for all frames.',
  columnEdges, rowEdges, alphaThreshold, margin, referenceHeight,
  frames: details,
};

await fs.mkdir(path.join(root, 'dist/characters'), { recursive: true });
await fs.mkdir(path.join(root, 'dist/scenes'), { recursive: true });
await sharp(source).webp({ lossless: true, effort: 6 }).toFile(path.join(root, 'dist/characters/wugong-study-walk-v1.webp'));
await sharp(path.join(root, provenance.groundSource)).webp({ quality: 94, effort: 6 }).toFile(path.join(root, provenance.groundImage));
await fs.writeFile(path.join(root, 'dist/characters/wugong-study-walk-v1.json'), JSON.stringify(metadata, null, 2) + '\n');
await fs.writeFile(path.join(root, 'art/wugong-study/walk-v1.json'), JSON.stringify(provenance, null, 2) + '\n');
console.log(JSON.stringify(metadata, null, 2));
