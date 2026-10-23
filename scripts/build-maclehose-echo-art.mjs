import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const input = resolve(root, 'art/maclehose-echo-v9');
const output = resolve(root, 'dist/scenes/maclehose-echo-v9');
await mkdir(output, { recursive: true });
const assets = [
  { name: 'forest', file: 'scenes/maclehose-echo-v9/forest.webp', width: 1536 },
  { name: 'forest-phone', file: 'scenes/maclehose-echo-v9/forest-phone.webp', width: 1024 },
  { name: 'birds', file: 'scenes/maclehose-echo-v9/birds.webp', width: 1536 },
  { name: 'badge', file: 'badges/maclehose-woodland-echo-v9.webp', width: 384 },
];
const records = [];
for (const asset of assets) {
  const source = await readFile(resolve(input, asset.name + '.png'));
  const encoded = await sharp(source).resize({ width: asset.width }).webp({ quality: 90, alphaQuality: 100 }).toBuffer();
  const destination = resolve(root, 'dist', asset.file);
  await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, encoded);
  const metadata = await sharp(encoded).metadata();
  records.push({ file: asset.file, width: metadata.width, height: metadata.height, alpha: metadata.hasAlpha, bytes: encoded.length,
    sha256: createHash('sha256').update(encoded).digest('hex'), sourceSha256: createHash('sha256').update(source).digest('hex') });
}
await writeFile(resolve(output, 'credits.json'), JSON.stringify({ tool: 'imagegen built-in', source: 'art/maclehose-echo-v9/generation.json',
  description: '原创虚构林缘插画、三只虚构小鸟与圆形徽章，不是定点照片或鸟类辨认资料。',
  processing: '保持透明通道；仅等比缩放及 WebP 编码。鸟图层由运行时按原图区域绘制。', assets: records }, null, 2) + '\n');
console.log('已编码林间回声的水彩资源。');
