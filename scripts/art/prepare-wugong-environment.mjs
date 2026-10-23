import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { dedup, prune, mergeDocuments, unpartition } from '@gltf-transform/functions';
import sharp from 'sharp';
import { Color, SRGBColorSpace } from 'three';

const root = fileURLToPath(new URL('../../', import.meta.url));
const cache = path.join(root, '.local/assets/wugong-environment');
const destination = path.join(root, 'dist/scenes/wugong-environment-v1');
const evidence = path.join(root, 'art/wugong-environment');
const io = new NodeIO();
const hash = data => createHash('sha256').update(data).digest('hex');
await mkdir(destination, { recursive: true }); await mkdir(evidence, { recursive: true });
const sources = [
  ['tree-a', 'nature/Models/GLTF format/tree_oak.glb'], ['tree-b', 'nature/Models/GLTF format/tree_detailed.glb'],
  ...['tent', 'rock-a', 'rock-b', 'signpost', 'tree-log'].map(name => [name === 'tree-log' ? 'log' : name, `Models/GLB format/${name}.glb`]),
];
const manifest = [];
for (const [name, source] of sources) {
  const file = path.join(cache, source), original = await readFile(file), document = await io.read(file);
  const extraSources = [];
  if (name === 'tent') {
    const file = path.join(cache, 'Models/GLB format/tent-canvas.glb'), canvas = await io.read(file);
    extraSources.push({ source: 'Models/GLB format/tent-canvas.glb', sha256: hash(await readFile(file)) });
    mergeDocuments(document, canvas);
    const scenes = document.getRoot().listScenes(), main = scenes[0];
    for (const scene of scenes.slice(1)) { for (const node of scene.listChildren()) main.addChild(node); scene.dispose(); }
    document.getRoot().setDefaultScene(main);
  }
  for (const mesh of document.getRoot().listMeshes()) for (const primitive of mesh.listPrimitives()) {
    const material = primitive.getMaterial(), uv = primitive.getAttribute('TEXCOORD_0'), texture = material?.getBaseColorTexture();
    if (texture && uv) {
      const pixels = await sharp(texture.getImage()).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const colors = new Float32Array(uv.getCount() * 3), coordinate = [0, 0], color = new Color(), tint = new Color();
      for (let i = 0; i < uv.getCount(); i++) {
        uv.getElement(i, coordinate);
        const x = Math.min(pixels.info.width - 1, Math.max(0, Math.floor(coordinate[0] * pixels.info.width)));
        const y = Math.min(pixels.info.height - 1, Math.max(0, Math.floor(coordinate[1] * pixels.info.height)));
        const j = (y * pixels.info.width + x) * 4, r = pixels.data[j] / 255, g = pixels.data[j + 1] / 255, b = pixels.data[j + 2] / 255;
        color.setRGB(r, g, b, SRGBColorSpace);
        tint.set(g > r * 1.05 && g > b * .9 ? '#7c916b' : r > b * 1.12 ? '#ac9674' : '#8e9a8d');
        color.lerp(tint, .55); colors.set([color.r, color.g, color.b], i * 3);
      }
      primitive.setAttribute('COLOR_0', document.createAccessor().setType('VEC3').setArray(colors));
      material.setBaseColorTexture(null).setBaseColorFactor([1, 1, 1, 1]);
    }
    if (material) {
      const materialName = material.getName().toLowerCase();
      if (materialName.includes('leaf')) { const c = new Color(name === 'tree-a' ? '#718764' : '#7e916a'); material.setBaseColorFactor([c.r, c.g, c.b, 1]); }
      else if (materialName.includes('bark')) { const c = new Color('#81745a'); material.setBaseColorFactor([c.r, c.g, c.b, 1]); }
      material.setMetallicFactor(0).setRoughnessFactor(1);
    }
  }
  await document.transform(dedup(), prune(), unpartition());
  const filename = name === 'tent' ? 'tent-v2.glb' : `${name}.glb`;
  const result = await io.writeBinary(document); await writeFile(path.join(destination, filename), result);
  manifest.push({ name, filename, source, sourceSHA256: hash(original), extraSources, bytes: result.length, sha256: hash(result) });
}
for (const [name, source] of [['Nature-Kit', 'nature/License.txt'], ['Survival-Kit', 'License.txt']]) {
  const bytes = await readFile(path.join(cache, source));
  await writeFile(path.join(evidence, `LICENSE-${name}.txt`), bytes); await writeFile(path.join(destination, `LICENSE-${name}.txt`), bytes);
}
await writeFile(path.join(evidence, 'provenance-v2.json'), JSON.stringify({ author: 'Kenney', license: 'CC0-1.0', sources: ['https://kenney.nl/assets/nature-kit', 'https://kenney.nl/assets/survival-kit'], natureMembers: JSON.parse(await readFile(path.join(cache, 'nature-sources.json'), 'utf8')), survivalZipSHA256: 'c3586341b5932c87eb43d75d915434f47daed168b17ed36a03e8ca9977c7443e', changes: ['Selected two non-tropical green trees, two rocks, a tent, a signpost and a fallen log.', 'Merged the matching authored tent frame and tent-canvas parts into one default scene.', 'Baked the palette texture into linear vertex colours; muted green / earth colours and matte materials.', 'Preserved source geometry and reused templates with Three.js instancing.'], assets: manifest }, null, 2) + '\n');
process.stdout.write(`Prepared ${manifest.length} environment models, ${manifest.reduce((sum, file) => sum + file.bytes, 0)} bytes.\n`);
