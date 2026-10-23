import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = new URL('../../', import.meta.url);
const source = new URL('art/characters/braided-source-v1.png', root);
const bytes = await readFile(source);
const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
if (info.width !== 1536 || info.height !== 1024) throw new Error('Re-author the cell boundaries for this source image.');
const columns = [0, 384, 768, 1152, 1536], rows = [0, 382, 737, 1024];
// Camp poses use the pelvis projected onto the ground, rather than the extended boot.
const axes = [224, 608, 990, 1376, 215, 603, 990, 1378, 209, 550, 960, 1350];
const poses = ['left-contact', 'left-weight', 'right-pass', 'right-rise', 'right-contact', 'right-weight', 'left-pass', 'left-rise', 'unpacking', 'kneeling', 'seated', 'drinking'];
const frames = poses.map((pose, index) => {
  const col = index % 4, row = Math.floor(index / 4);
  const cell = { x: columns[col], y: rows[row], width: columns[col + 1] - columns[col], height: rows[row + 1] - rows[row] };
  const visited = new Uint8Array(cell.width * cell.height), components = [];
  const alpha = (x, y) => data[((cell.y + y) * info.width + cell.x + x) * 4 + 3];
  for (let y = 0; y < cell.height; y++) for (let x = 0; x < cell.width; x++) {
    const start = y * cell.width + x;
    if (visited[start] || alpha(x, y) <= 12) continue;
    visited[start] = 1;
    const queue = [start];
    let minX = x, minY = y, maxX = x, maxY = y;
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const pixel = queue[cursor], px = pixel % cell.width, py = Math.floor(pixel / cell.width);
      minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = px + dx, ny = py + dy;
        if (nx < 0 || nx >= cell.width || ny < 0 || ny >= cell.height) continue;
        const next = ny * cell.width + nx;
        if (visited[next] || alpha(nx, ny) <= 12) continue;
        visited[next] = 1; queue.push(next);
      }
    }
    if (queue.length >= 80) components.push({ minX, minY, maxX, maxY });
  }
  if (!components.length) throw new Error('No figure found in cell ' + index);
  const left = cell.x + Math.min(...components.map(c => c.minX));
  const top = cell.y + Math.min(...components.map(c => c.minY));
  const right = cell.x + Math.max(...components.map(c => c.maxX));
  const bottom = cell.y + Math.max(...components.map(c => c.maxY));
  const x = Math.max(cell.x, left - 1), y = Math.max(cell.y, top - 1);
  const width = Math.min(cell.x + cell.width, right + 2) - x, height = Math.min(cell.y + cell.height, bottom + 2) - y;
  let soleSum = 0, solePixels = 0;
  for (let sy = Math.max(top, bottom - 3); sy <= bottom; sy++) for (let sx = left; sx <= right; sx++) {
    if (data[(sy * info.width + sx) * 4 + 3] > 128) { soleSum += sx; solePixels++; }
  }
  return { pose, cell, x, y, width, height, footX: axes[index] - x, footY: bottom + 1 - y, visibleHeight: bottom + 1 - top, soleOffset: (solePixels ? soleSum / solePixels : axes[index]) - axes[index] };
});
const walkHeights = frames.slice(0, 8).map(f => f.visibleHeight).sort((a, b) => a - b);
const walkHeight = (walkHeights[3] + walkHeights[4]) / 2, actionHeight = frames[8].visibleHeight;
const tuple = f => [f.x, f.y, f.width, f.height, f.footX, f.footY];
const metadata = {
  source: 'art/characters/braided-source-v1.png', reference: 'art/characters/braided-reference-v1.png',
  generator: 'Built-in image_gen; identity reference supplied by the user.', prompt: 'art/characters/braided-v1-prompt.txt',
  sha256: createHash('sha256').update(bytes).digest('hex'), width: info.width, height: info.height,
  preparation: 'Read alpha components and foot anchors, keep original RGBA pixels in the atlas, encode WebP. Separate thumbnail crops and resizes only. No painted background is used.',
  coordinates: 'x/y are source coordinates; footX/footY are ground anchors relative to the cropped frame. Camp x anchors project the pelvis onto the ground so extended boots do not shift the body between poses. Source rows have different heights; scales normalize walking and standing camp poses to 54 map pixels.',
  walkHeight, actionHeight, frames,
};
await mkdir(new URL('src/characters/', root), { recursive: true });
await sharp(bytes).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(fileURLToPath(new URL('dist/characters/braided-hiker-v1.webp', root)));
const preview = frames[2];
await sharp(bytes).extract({ left: preview.x, top: preview.y, width: preview.width, height: preview.height }).resize({ height: 320 }).webp({ quality: 90, alphaQuality: 100 }).toFile(fileURLToPath(new URL('dist/characters/braided-hiker-preview-v1.webp', root)));
await sharp(fileURLToPath(new URL('dist/characters/trailbound-walk-v2.webp', root))).extract({ left: 978, top: 11, width: 255, height: 436 }).resize({ height: 320 }).webp({ quality: 90, alphaQuality: 100 }).toFile(fileURLToPath(new URL('dist/characters/blue-hiker-preview-v1.webp', root)));
await writeFile(new URL('art/characters/braided-v1.json', root), JSON.stringify(metadata, null, 2) + '\n');
const generated = `// Generated by scripts/art/prepare-braided-character.mjs.\nimport type { MapWalkFrame } from '../runtime/map-walk-art';\nexport const BRAIDED_FILE = 'characters/braided-hiker-v1.webp';\nexport const BRAIDED_WALK_SCALE = 54 / ${walkHeight};\nexport const BRAIDED_ACTION_SCALE = 54 / ${actionHeight};\nexport const BRAIDED_WALK_FRAMES: readonly MapWalkFrame[] = ${JSON.stringify(frames.slice(0, 8).map(tuple))};\nexport const BRAIDED_ACTION_FRAMES: readonly MapWalkFrame[] = ${JSON.stringify(frames.slice(8).map(tuple))};\nexport const BRAIDED_CONTACT_OFFSETS: readonly number[] = ${JSON.stringify(frames.slice(0, 8).map(f => Number((f.soleOffset * 54 / walkHeight).toFixed(3))))};\n`;
await writeFile(new URL('src/characters/braided-art.ts', root), generated);
await writeFile(new URL('dist/characters/traveler-choices-v1-credits.json', root), JSON.stringify({
  created: '2026-10-19', technique: 'Built-in image_gen, existing sharp for atlas encoding and thumbnails; PixiJS for display. No external paid API, CLI generation or purchased model.',
  blue: { name: '蓝衣旅人', walking: 'characters/trailbound-walk-v2.webp', actions: 'scenes/wugong-camp-night-v1/actions-q-v1.webp', preview: 'characters/blue-hiker-preview-v1.webp', originalRecord: 'art/characters/walk-v2.md', use: 'Existing character and poses retained; the preview is cropped from its existing walk sheet.' },
  braids: { name: '双辫旅人', atlas: 'characters/braided-hiker-v1.webp', preview: 'characters/braided-hiker-preview-v1.webp', source: metadata.source, reference: metadata.reference, prompt: metadata.prompt, metadata: 'art/characters/braided-v1.json', sourceSha256: metadata.sha256, use: 'Identity reference supplied by user. Twelve generated poses: eight walk frames and four camp poses. Original alpha retained; atlas is WebP-encoded, preview is a crop and resize. Generated art is not a real photograph.' },
}, null, 2) + '\n');
console.log(`Prepared twelve character poses, walking scale 54/${walkHeight}, camp scale 54/${actionHeight}.`);
