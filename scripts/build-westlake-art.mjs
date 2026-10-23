import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const output = new URL('public/scenes/westlake-journey-v3/', root);
await mkdir(output, { recursive: true });
const prompts = JSON.parse(await readFile(new URL('art/westlake-journey-v3/prompts.json', root), 'utf8'));
const assets = [];
for (const [index, name] of ['forest-pool', 'village-tea'].entries()) {
  const source = `art/westlake-journey-v3/${name}.png`;
  const image = await readFile(new URL(source, root));
  const result = await sharp(image).webp({ quality: 94 }).toFile(new URL(`${name}.webp`, output).pathname);
  assets.push({ file: `${name}.webp`, source, width: result.width, height: result.height, bytes: result.size, sourceSha256: createHash('sha256').update(image).digest('hex'), prompt: prompts.assets[index].prompt });
}
await writeFile(new URL('credits.json', output), JSON.stringify({
  date: prompts.date, tool: prompts.tool, reference: prompts.reference,
  identity: 'Generated watercolor game illustrations. Not location photography.',
  modifications: 'Original PNG encoded to WebP; runtime cover crop and separate interactive props.', assets,
}, null, 2) + '\n');
