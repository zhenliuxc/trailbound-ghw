import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

const root = new URL('../', import.meta.url);
const output = new URL('public/scenes/changping-autumn-v1/', root);
for (const file of ['horse-rest', 'props', 'valley']) {
  await sharp(new URL(`art/changping-autumn-v1/${file}.png`, root).pathname).webp({ quality: 94, alphaQuality: 100 }).toFile(new URL(`${file}.webp`, output).pathname);
}
const bundle = await build({ entryPoints: [new URL('src/runtime/journal-badge.ts', root).pathname], bundle: true, write: false, format: 'esm' });
const { badgeFrameSvg } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const mask = Buffer.from('<svg width="640" height="640"><circle cx="320" cy="320" r="280" fill="white"/></svg>');
const frame = Buffer.from(badgeFrameSvg());
const props = await readFile(new URL('props.webp', output));
for (const [id, file, prop] of [
  ['branch-reflection', '../day-route-v2/changping.webp', null],
  ['bell-cord', 'horse-rest.webp', 0],
  ['valley-path', 'valley.webp', null],
  ['autumn-print', 'horse-rest.webp', 3],
]) {
  const layers = [];
  if (prop !== null) {
    const sprite = await sharp(props).extract({ left: prop % 3 * 512, top: Math.floor(prop / 3) * 512, width: 512, height: 512 }).resize(360, 360).toBuffer();
    layers.push({ input: sprite, left: 140, top: 200 });
  }
  const art = await sharp(new URL(file, output).pathname).resize(640, 640, { fit: 'cover' }).composite(layers).png().toBuffer();
  const circle = await sharp(art).ensureAlpha().composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  await sharp(circle).composite([{ input: frame }]).webp({ quality: 90 }).toFile(new URL(`public/badges/changping-${id}-v1.webp`, root).pathname);
}
await writeFile(new URL('credits.json', output), JSON.stringify({
  chapter: '长坪沟 · 十月彩林一日往返',
  created: '2026-10-21',
  medium: 'AI-generated watercolor illustrations, not documentary photographs',
  generator: 'OpenAI imagegen',
  originals: 'art/changping-autumn-v1/',
  assets: [
    { file: 'horse-rest.webp', content: '秋林马道休息处，布垫与远处马匹。独立铃绳游戏的场景。' },
    { file: 'props.webp', content: '透明 3×2 图集：铜铃、分叉枯枝、弯枝、两片秋叶、纸页。' },
    { file: 'valley.webp', content: '木骡子草甸、溪流与远峰的艺术化画境，不是地貌测绘。' },
  ],
  processing: '保留原始 PNG，WebP 输出，透明图集保留 alpha。徽章使用共用圆形边框；实际完成后优先保存本局画面和拓印笔迹。',
  reuse: '枯树滩沿用 scenes/day-route-v2/changping.webp；人物沿用 characters/traveler-choices-v1-credits.json。',
  sounds: '沿用 audio/credits.json 与 audio/wugong-credits.json。铃声为现有程序拟音，不是当地采样。',
}, null, 2) + '\n');
