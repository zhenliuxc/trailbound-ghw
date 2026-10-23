import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../../', import.meta.url));
const sources = {
  terrain: 'exec-917e8c86-669d-481a-80c0-b41cd87c9bf6.png',
  distance: 'exec-0ca797b0-bd7b-44c0-b632-d815c81fb341.png',
  actions: 'exec-59bfa994-dcb7-4061-a183-12c5da3d90ed.png',
  props: 'exec-ff02a397-d11d-4c2c-9689-b83ecac1e6cc.png',
};
const sourceDir = path.join(root, 'art/wugong-scroll');
const outputDir = path.join(root, 'public/scenes/wugong-scroll-v1');
await mkdir(sourceDir, { recursive: true });
await mkdir(outputDir, { recursive: true });
for (const [name, file] of Object.entries(sources)) {
  const target = path.join(sourceDir, `${name}-source-v1.png`);
  if (name !== 'props') await sharp(target).webp({ quality: 93, alphaQuality: 100, effort: 4 }).toFile(path.join(outputDir, `${name}-v1.webp`));
}
const props = [
  ['tree-a', 0, 0, 514, 584],
  ['tree-b', 514, 0, 510, 584],
  ['grass-a', 1024, 120, 512, 464],
  ['grass-b', 0, 620, 516, 404],
  ['tent', 516, 580, 518, 444],
  ['rocks', 1034, 650, 502, 374],
];
for (const [name, left, top, width, height] of props) {
  await sharp(path.join(sourceDir, 'props-source-v1.png')).extract({ left, top, width, height }).webp({ quality: 94, alphaQuality: 100, effort: 4 }).toFile(path.join(outputDir, `${name}-v1.webp`));
}
await writeFile(path.join(sourceDir, 'provenance-v1.json'), JSON.stringify({
  date: '2026-10-18', tool: 'built-in image_gen', route: '武功山 · 林间上坡 → 草甸转弯 → 观音宕营地',
  sources, preparation: 'Preserved generated PNG originals and alpha; cropped six prop regions; encoded WebP with sharp. No third-party art was substituted.',
  style: '精细水彩纸纹，草木绿、青灰、稻草金；人物使用用户提供的大眼睛 Q 版原形象。',
  walking: { source: 'art/characters/walk-source-v2.png', file: 'characters/trailbound-walk-v2.webp', registration: 'src/runtime/map-walk-art.ts', status: 'Existing exact character selected by user, not a newly generated substitute.' },
  prompts: {
    terrain: 'Very wide transparent watercolor Wugong mountainside; temperate forest left, alpine meadow middle, camp saddle right. Continuous earth path embedded in the hillside. No sky, people, tents or labels.',
    distance: 'Watercolor Wugong receding mountain panorama matching terrain, pale sky, five blue-gray ridge layers and low valley mist; no foreground or path.',
    props: 'Transparent 3 by 2 atlas matching terrain: two irregular broadleaf trees, two soft meadow patches, ochre canvas tent, mossy rocks. No labels.',
    actions: 'Transparent 2 by 2 atlas, exact user-selected large-eyed Q hiker and outfit from walk-source-v2 and hiker-rest-source-v1 references. Standing, unloading, seated on rock, seated drinking. Retain original face, big eyes and proportions.',
  },
}, null, 2) + '\n');
process.stdout.write('Prepared Wugong watercolor scroll assets.\n');
