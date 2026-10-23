import fs from 'node:fs/promises';
import sharp from 'sharp';

const root = new URL('../../', import.meta.url);
const source = new URL('art/aotai-games-v2/', root);
const scenes = new URL('public/scenes/aotai-games-v2/', root);
await fs.mkdir(scenes, { recursive: true });
for (const name of ['winter-tent', 'takin-atlas', 'winter-encounter', 'winter-slope']) {
  await sharp(await fs.readFile(new URL(`${name}.png`, source))).webp({ quality: 90, alphaQuality: 100 }).toFile(new URL(`${name}.webp`, scenes).pathname);
}
await sharp(await fs.readFile(new URL('camp-badge.png', source))).resize(640, 640).webp({ quality: 91, alphaQuality: 100 }).toFile(new URL('public/badges/aotai-camp-night-v1.webp', root).pathname);

console.log('Prepared Aotai watercolor scenes and camp badge.');
