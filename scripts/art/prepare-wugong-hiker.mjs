import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { dedup, prune, resample } from '@gltf-transform/functions';
import { Color } from 'three';

const root = fileURLToPath(new URL('../../', import.meta.url));
const cache = path.join(root, '.local/assets/wugong-hiker');
const output = path.join(root, 'dist/characters/wugong-adventurer-v2.glb');
const evidence = path.join(root, 'art/wugong-hiker');
const sources = [
  { name: 'Adventurer.gltf', id: '1fzSq1Rr037f7QkfXPWEAzmbLMNx-FpPA', sha256: '21f7a61afb6bd6cef6961490c367594e3c2fc01ec1f041662131172ce763063e' },
  { name: 'quaternius-License.txt', id: '1TTvylHa1CsiJuHFWWiv6PFGhLM-aAH5z', sha256: 'e8dbf915a2b82229913e301a0787696611241bdefec4832bc084f54161db1efe' },
];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
await mkdir(cache, { recursive: true }); await mkdir(evidence, { recursive: true });
await mkdir(path.dirname(output), { recursive: true });
for (const source of sources) {
  const file = path.join(cache, source.name);
  let bytes = await readFile(file).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
  if (!bytes) {
    const response = await fetch(`https://drive.google.com/uc?export=download&id=${source.id}`, { signal: AbortSignal.timeout(90000) });
    if (!response.ok) throw new Error(`Cannot download ${source.name}: ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    if (sha256(bytes) !== source.sha256) throw new Error(`The upstream source changed: ${source.name}`);
    await writeFile(file, bytes);
  }
  if (sha256(bytes) !== source.sha256) throw new Error(`Preserving a modified source file: ${source.name}`);
}

const io = new NodeIO();
const document = await io.read(path.join(cache, 'Adventurer.gltf'));
const originalAnimations = document.getRoot().listAnimations().map(animation => animation.getName());
for (const node of document.getRoot().listNodes()) {
  if (node.getName() !== 'Adventurer_Feet') continue;
  const skin = node.getSkin(), mesh = node.getMesh();
  if (!skin || !mesh) throw new Error('The authored shoe rig is missing.');
  const joints = skin.listJoints(), left = joints.findIndex(joint => joint.getName() === 'Foot.L'), right = joints.findIndex(joint => joint.getName() === 'Foot.R');
  if (left < 0 || right < 0) throw new Error('The independent shoe controls are missing.');
  for (const primitive of mesh.listPrimitives()) {
    const indices = primitive.getAttribute('JOINTS_0'), weights = primitive.getAttribute('WEIGHTS_0');
    if (!indices || !weights) throw new Error('The authored shoe skin is incomplete.');
    const resultIndices = new Uint16Array(indices.getCount() * 4), resultWeights = new Float32Array(indices.getCount() * 4), ids = [0, 0, 0, 0], amounts = [0, 0, 0, 0];
    for (let i = 0; i < indices.getCount(); i++) {
      indices.getElement(i, ids); weights.getElement(i, amounts);
      let leftWeight = 0, rightWeight = 0;
      for (let j = 0; j < 4; j++) {
        const name = joints[ids[j]].getName();
        if (name.endsWith('.L')) leftWeight += amounts[j]; else if (name.endsWith('.R')) rightWeight += amounts[j];
      }
      resultIndices[i * 4] = leftWeight > rightWeight ? left : right; resultWeights[i * 4] = 1;
    }
    primitive.setAttribute('JOINTS_0', indices.clone().setArray(resultIndices)); primitive.setAttribute('WEIGHTS_0', weights.clone().setArray(resultWeights));
  }
}
for (const animation of document.getRoot().listAnimations()) {
  if (!['Idle_Neutral', 'Walk'].includes(animation.getName())) {
    animation.listChannels().forEach(channel => channel.dispose());
    animation.listSamplers().forEach(sampler => sampler.dispose());
    animation.dispose(); continue;
  }
  if (animation.getName() === 'Idle_Neutral') animation.setName('Idle');
  // Movement belongs to the mountain path. Keep the original vertical motion.
  for (const channel of animation.listChannels()) {
    if (channel.getTargetNode()?.getName() !== 'Root' || channel.getTargetPath() !== 'translation') continue;
    const sampler = channel.getSampler(), accessor = sampler?.getOutput(), values = accessor?.getArray();
    if (!sampler || !accessor || !values) throw new Error('The authored root-motion channel is incomplete.');
    const copy = values.slice();
    for (let i = 0; i < copy.length; i += 3) { copy[i] = 0; copy[i + 2] = 0; }
    channel.setSampler(sampler.clone().setOutput(accessor.clone().setArray(copy)));
  }
}
const palette = {
  Skin: '#caaa88', Green: '#647b65', LightGreen: '#a7b19a', Grey: '#56665e', Black: '#3c433c',
  Eyebrows: '#514b3d', Hair: '#554b38', Eye: '#343b34', Brown: '#99805d', Brown2: '#78694e', Gold: '#b5a478',
};
for (const material of document.getRoot().listMaterials()) {
  const hex = palette[material.getName()];
  if (!hex) throw new Error(`An unreviewed material appeared: ${material.getName()}`);
  const color = new Color(hex);
  material.setBaseColorFactor([color.r, color.g, color.b, 1]).setMetallicFactor(0).setRoughnessFactor(1);
}
await document.transform(resample(), dedup(), prune());
const bytes = await io.writeBinary(document);
await writeFile(output, bytes);
const license = await readFile(path.join(cache, sources[1].name));
await writeFile(path.join(evidence, 'LICENSE-Quaternius.txt'), license);
await writeFile(path.join(root, 'dist/characters/wugong-adventurer-LICENSE.txt'), license);
const manifest = {
  author: 'Quaternius', title: 'Adventurer, Ultimate Modular Men Pack', license: 'CC0-1.0',
  sourcePage: 'https://quaternius.com/packs/ultimatemodularcharacters.html',
  sourceFolder: 'https://drive.google.com/drive/folders/1USAAquX2JJWuA2m6zol0KUkFe3UkZ8zX',
  sources: sources.map(source => ({ ...source, url: `https://drive.google.com/uc?export=download&id=${source.id}` })),
  originalAnimations, includedAnimations: document.getRoot().listAnimations().map(animation => animation.getName()),
  changes: ['Kept authored Walk and Idle_Neutral, renamed Idle_Neutral to Idle.', 'Removed horizontal root translation, preserving body and limb animation.', 'Recoloured existing materials to the Wugong sage / brown palette, with matte surfaces.', 'Assigned each rigid shoe to its independent Foot control; removed calf influence from its sole.', 'Packed the existing mesh, backpack, skeleton and two clips into one GLB with glTF Transform.'],
  output: { path: 'dist/characters/wugong-adventurer-v2.glb', bytes: bytes.length, sha256: sha256(bytes) },
};
await writeFile(path.join(evidence, 'provenance-v2.json'), `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`Prepared ${bytes.length} byte hiker with authored ${manifest.includedAnimations.join(' / ')} clips.\n`);
