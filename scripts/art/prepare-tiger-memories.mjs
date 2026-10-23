import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const names = ['bends', 'inn', 'waterfall', 'river'];
const files = [];
for (const [kind, folder] of [['landscapes', 'scenes'], ['badges', 'badges']]) {
  const source = new URL(`art/tiger-games-design-v4/${kind}-source.png`, root);
  const metadata = await sharp(await readFile(source)).metadata();
  const width = Math.floor(metadata.width / 2), height = Math.floor(metadata.height / 2);
  await mkdir(new URL(`public/${folder}/tiger-memories-v4/`, root), { recursive: true });
  for (const [index, name] of names.entries()) {
    const file = `${folder}/tiger-memories-v4/${name}.webp`;
    const bytes = await sharp(await readFile(source)).extract({ left: index % 2 * width, top: Math.floor(index / 2) * height, width, height })
      .webp({ quality: 93, alphaQuality: 100, effort: 6 }).toBuffer();
    await writeFile(new URL(`public/${file}`, root), bytes);
    files.push({ file, source: `art/tiger-games-design-v4/${kind}-source.png`, width, height, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
}
const prompts = {};
for (const kind of ['landscapes', 'badges']) prompts[kind] = await readFile(new URL(`art/tiger-games-design-v4/${kind}-prompt.txt`, root), 'utf8');
await writeFile(new URL('public/scenes/tiger-memories-v4/credits.json', root), JSON.stringify({
  date: '2026-10-18', generator: 'Built-in image_gen', usage: 'Original game illustrations; not local photographs or surveyed viewpoints',
  processing: 'Extracted the four equal atlas quadrants and encoded WebP; original PNGs and alpha retained. No repainting or upscaling.',
  references: ['badges/tiger-bell-first-v4.webp', 'badges/tiger-river-below-v4.webp', 'scenes/tiger-climb-walk-v3.webp'], prompts, files,
}, null, 2) + '\n');
process.stdout.write('Prepared four scenery paintings and four round badges. No gameplay tests run.\n');
