import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../../', import.meta.url));
const source = path.join(root, 'node_modules/@dgreenheck/ez-tree/src/lib/assets/leaves/ash_color.png');
const original = await readFile(source);
const { data, info } = await sharp(original).resize(256, 256).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const shade = Math.round(170 + (data[i] * .21 + data[i + 1] * .72 + data[i + 2] * .07) * .33);
  data[i] = data[i + 1] = data[i + 2] = shade;
}
const output = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
await mkdir(path.join(root, 'dist/textures'), { recursive: true });
await writeFile(path.join(root, 'dist/textures/wugong-tree-leaves-v1.png'), output);
await mkdir(path.join(root, 'art/wugong-trees'), { recursive: true });
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
await writeFile(path.join(root, 'art/wugong-trees/provenance-v1.json'), JSON.stringify({
  generator: '@dgreenheck/ez-tree', version: '1.1.0', license: 'MIT', author: 'Daniel Greenheck',
  source: 'https://github.com/dgreenheck/ez-tree', sourceFile: 'src/lib/assets/leaves/ash_color.png',
  sourceSHA256: hash(original), outputSHA256: hash(output), bytes: output.length,
  changes: ['Resize leaf alpha texture to 256px; neutralise colour while retaining vein shading and silhouette.', 'Generate three seeded Ash Medium branch / leaf silhouettes with two levels of detail.', 'Scene materials, instancing, grove layout and wind / shadow adapter belong to Trailbound.'],
}, null, 2) + '\n');
process.stdout.write(`Prepared EZ-Tree leaf mask: ${output.length} bytes.\n`);
