import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import * as THREE from 'three';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, '.build/check-wugong-meadow.mjs');
await mkdir(path.dirname(output), { recursive: true });
await build({ absWorkingDir: root, entryPoints: ['src/wugong-meadow/terrain.ts'], outfile: output, bundle: true, platform: 'node', format: 'esm', packages: 'external' });
const { createWugongTerrain } = await import(pathToFileURL(output).href);
const data = JSON.parse(await readFile(path.join(root, 'dist/scenes/wugong-relief-height-v2.json'), 'utf8'));
const terrain = createWugongTerrain(data);
const geometry = terrain.nearGeometry();
const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
const mesh = new THREE.Mesh(geometry, material); mesh.updateMatrixWorld();
const road = terrain.roadGeometry(1.12, .035), positions = road.getAttribute('position');
const ray = new THREE.Raycaster(), direction = new THREE.Vector3(0, -1, 0);
let checked = 0, maximumError = 0;
try {
  // Restrict each real Three.js ray to the actual two triangles in its grid cell.
  // The original buffers and triangle winding are unchanged.
  function setCell(x, z) {
    const column = Math.min(geometry.parameters.widthSegments - 1, Math.max(0, Math.floor((x - terrain.bounds.minX) / .6)));
    const row = Math.min(geometry.parameters.heightSegments - 1, Math.max(0, Math.floor((z - terrain.bounds.minZ) / .6)));
    geometry.setDrawRange((row * geometry.parameters.widthSegments + column) * 6, 6);
  }
  geometry.computeBoundingSphere();
  // Cast against the real Three.js triangles, independently of the height sampler.
  for (let i = 0; i < positions.count; i += 37) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    setCell(x, z);
    ray.set(new THREE.Vector3(x, 500, z), direction);
    const hit = ray.intersectObject(mesh)[0];
    assert.ok(hit, `Road vertex ${i} falls outside the visible near-ground mesh`);
    const clearance = y - hit.point.y;
    assert.ok(clearance > .025 && clearance < .045, `Road vertex ${i} is covered or floating: ${clearance}`);
    maximumError = Math.max(maximumError, Math.abs(clearance - .035)); checked++;
  }
  for (let i = 0; i <= 80; i++) {
    const p = terrain.sample(i / 80 * terrain.length);
    setCell(p.x, p.z);
    ray.set(new THREE.Vector3(p.x, 500, p.z), direction);
    const hit = ray.intersectObject(mesh)[0];
    assert.ok(hit, `Walking point ${i} leaves the visible near ground`);
    assert.ok(Math.abs(p.y - hit.point.y) < .005, `Walking point ${i} does not meet the ground`);
    assert.ok(terrain.roadGap(p.x, p.z) < .03, `Walking point ${i} leaves the dirt path`);
  }
  process.stdout.write(`${JSON.stringify({ roadVerticesChecked: checked, walkingPositionsChecked: 81, maximumRoadClearanceError: maximumError, routeSceneLength: terrain.length, result: 'passed', scope: 'Actual terrain geometry and Three.js ray intersections, not browser or GPU verification.' }, null, 2)}\n`);
} finally { geometry.dispose(); road.dispose(); material.dispose(); }
