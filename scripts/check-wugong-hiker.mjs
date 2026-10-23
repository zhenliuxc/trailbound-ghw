import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, '.build/hiker-check');
await mkdir(output, { recursive: true });
await build({ absWorkingDir: root, entryPoints: ['src/wugong-meadow/hiker.ts', 'src/wugong-meadow/terrain.ts'], outdir: output, bundle: true, platform: 'node', format: 'esm', outExtension: { '.js': '.mjs' }, packages: 'external' });
const { createTrailHiker } = await import(pathToFileURL(path.join(output, 'hiker.mjs')).href);
const { createWugongTerrain } = await import(pathToFileURL(path.join(output, 'terrain.mjs')).href);
const source = await readFile(path.join(root, 'dist/characters/wugong-adventurer-v2.glb'));
const bytes = source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
const asset = await new GLTFLoader().parseAsync(bytes, '');
assert.deepEqual(asset.animations.map(clip => clip.name).sort(), ['Idle', 'Walk']);
assert.ok(asset.scene.getObjectByName('Backpack'), 'The downloaded character must include its authored backpack');
const terrain = createWugongTerrain(JSON.parse(await readFile(path.join(root, 'dist/scenes/wugong-relief-height-v2.json'), 'utf8')));
const actor = await createTrailHiker(bytes, terrain.height);
const feet = actor.group.getObjectByName('Adventurer_Feet');
assert.ok(feet, 'The actual skinned shoes must be present');
const soles = [];
feet.traverse(mesh => {
  if (!(mesh instanceof THREE.SkinnedMesh)) return;
  const indices = mesh.geometry.getAttribute('skinIndex'), weights = mesh.geometry.getAttribute('skinWeight');
  for (let i = 0; i < indices.count; i++) {
    let dominant = 0;
    for (let j = 1; j < 4; j++) if (weights.getComponent(i, j) > weights.getComponent(i, dominant)) dominant = j;
    const foot = mesh.skeleton.bones[indices.getComponent(i, dominant)].name;
    if (foot === 'FootL' || foot === 'FootR') soles.push({ mesh, vertex: i, foot });
  }
});
assert.ok(soles.length > 100, 'Check the real shoe vertices, not only invisible ankle targets');
let distance = 0, speed = 0, heading = 0, frame = 0, seconds = 0, sampled = 0;
let worstPenetration = 0, largestSupportGap = 0, minGrade = Infinity, maxGrade = -Infinity;
let largestAnkleGap = 0;
const point = new THREE.Vector3(), ahead = new THREE.Vector3(), before = new THREE.Vector3(), vertex = new THREE.Vector3();
const snapshots = [];
function inspect(label) {
  for (const name of ['FootL', 'FootR']) {
    const shoe = actor.group.getObjectByName(name), ankle = actor.group.getObjectByName(`ground-ankle-${name}`);
    assert.ok(shoe && ankle, 'The leg chain must connect to the actual authored shoe control');
    const gap = shoe.getWorldPosition(new THREE.Vector3()).distanceTo(ankle.getWorldPosition(new THREE.Vector3()));
    largestAnkleGap = Math.max(largestAnkleGap, gap);
    assert.ok(gap < .08, `${label}: the calf ends ${gap} units away from its shoe at ${distance}`);
  }
  const clearance = { FootL: Infinity, FootR: Infinity };
  for (const sample of soles) {
    sample.mesh.getVertexPosition(sample.vertex, vertex).applyMatrix4(sample.mesh.matrixWorld);
    assert.ok(vertex.toArray().every(Number.isFinite), `${label}: the skinned shoes contain an invalid position`);
    const gap = vertex.y - terrain.height(vertex.x, vertex.z) - .035;
    clearance[sample.foot] = Math.min(clearance[sample.foot], gap);
  }
  const support = Math.min(clearance.FootL, clearance.FootR);
  worstPenetration = Math.min(worstPenetration, support); largestSupportGap = Math.max(largestSupportGap, support);
  assert.ok(support >= -.025, `${label}: a shoe penetrates the visible road by ${-support} units at ${distance}`);
  assert.ok(support < .10, `${label}: neither shoe supports the character, lowest sole ${support} units above the road at ${distance}`);
  sampled++;
  return clearance;
}
function step(moving, reduced = false) {
  const dt = 1 / 60;
  terrain.sample(distance - .5, before); terrain.sample(distance + .5, ahead);
  const grade = (ahead.y - before.y) / Math.max(.1, Math.hypot(ahead.x - before.x, ahead.z - before.z));
  const targetSpeed = moving ? 1.12 / (1 + Math.max(0, grade) * 1.2 + Math.max(0, -grade) * .55) : 0;
  speed += (targetSpeed - speed) * (1 - Math.exp(-dt * 5));
  distance = Math.min(terrain.length, distance + speed * dt);
  terrain.sample(distance, point); terrain.sample(distance + .9, ahead); terrain.sample(distance - .9, before);
  const desired = Math.atan2(ahead.x - before.x, ahead.z - before.z);
  if (frame === 0) heading = desired;
  const turn = Math.atan2(Math.sin(desired - heading), Math.cos(desired - heading));
  heading += turn * (1 - Math.exp(-dt * 5));
  actor.group.position.copy(point); actor.group.position.y += .042; actor.group.rotation.y = heading;
  const poseGrade = (ahead.y - before.y) / Math.max(.1, Math.hypot(ahead.x - before.x, ahead.z - before.z));
  actor.update({ distance, speed, grade: poseGrade, turn, dt, reduced });
  minGrade = Math.min(minGrade, poseGrade); maxGrade = Math.max(maxGrade, poseGrade);
  frame++; seconds += dt;
  if (frame % 8 === 0) inspect(`Frame ${frame}`);
}
try {
  while (distance < terrain.length) {
    assert.ok(frame < 180000, 'The authored hiker must reach camp');
    step(true);
    if (frame % 900 === 0) snapshots.push({ distance, seconds, clearance: inspect('Route snapshot') });
  }
  for (let i = 0; i < 180; i++) step(false);
  const resting = inspect('Camp idle');
  assert.ok(Math.max(resting.FootL, resting.FootR) < .055, 'Both shoes should settle on the road when resting');
  assert.ok(minGrade < -.06 && maxGrade > .06, 'The actual walking path must exercise both ascent and descent');
  actor.reset(); distance = speed = frame = 0;
  for (let i = 0; i < 120; i++) step(false, true);
  inspect('Reduced motion after reset');
  const result = { result: 'passed', source: 'Actual Quaternius GLB, Three.js AnimationMixer, two-bone terrain IK and CPU-skinned shoe vertices; no DOM, rig or animation mocks.', routeLength: terrain.length, shoeVertices: soles.length, poseSamples: sampled, minGrade, maxGrade, worstSolePenetration: worstPenetration, largestSupportGap, largestAnkleGap, restingSoleClearance: resting, snapshots };
  const destination = path.join(root, 'docs/previews/wugong-trees-gait');
  await mkdir(destination, { recursive: true });
  await writeFile(path.join(destination, 'pose-check.json'), JSON.stringify(result, null, 2) + '\n');
  const { snapshots: _snapshots, ...summary } = result;
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
} finally { actor.dispose(); }
