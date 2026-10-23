import * as THREE from 'three';
import { Tree } from '@dgreenheck/ez-tree';
import type { WugongTerrain } from './terrain';
import { getLeafTexture } from './tree-textures';

interface TreePlace { x: number; y: number; z: number; height: number; width: number; yaw: number; variant: number }
interface TreeParts { branches: THREE.BufferGeometry; leaves: THREE.BufferGeometry }
const unit = (seed: number) => { const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };

/** EZ-Tree silhouettes shared by instanced groves; distant groves use fewer leaves. */
export class WugongForest {
  readonly group = new THREE.Group();
  private readonly geometry = new Set<THREE.BufferGeometry>();
  private readonly materials = new Set<THREE.Material>();
  private readonly time = { value: 0 };
  private readonly strength = { value: 0 };
  private readonly groves: THREE.LOD[] = [];
  private readonly foliage: THREE.MeshStandardMaterial[] = [];
  constructor(terrain: WugongTerrain) {
    const leafMap = getLeafTexture();
    const bark = new THREE.MeshStandardMaterial({ color: '#807c61', roughness: 1 }); this.materials.add(bark);
    const leafMaterials = ['#80926a', '#909b70', '#71896c'].map(color => {
      const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .16, map: leafMap, alphaTest: .40, side: THREE.DoubleSide, roughness: 1 });
      material.alphaToCoverage = true; material.forceSinglePass = true;
      this.windShader(material); this.materials.add(material); this.foliage.push(material); return material;
    });
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: leafMap, alphaTest: .45, side: THREE.DoubleSide });
    this.windShader(depth); this.materials.add(depth);
    const parts = [0, 1, 2].map(variant => [this.template(variant, false), this.template(variant, true)]);
    const chunks = new Map<string, TreePlace[]>(), { bounds } = terrain;
    const clearings = [terrain.sample(0), terrain.sample(terrain.length), terrain.sample(terrain.campDistance)];
    let i = 0;
    for (let x = bounds.minX - 38; x < bounds.maxX + 38; x += 5.3) for (let z = bounds.minZ - 38; z < bounds.maxZ + 38; z += 5.3) {
      i++;
      const px = x + (unit(i * 3) - .5) * 5.1, pz = z + (unit(i * 7) - .5) * 5.1;
      const y = terrain.height(px, pz), edge = THREE.MathUtils.smoothstep(y, -3, 11);
      const cover = terrain.noise.noise(px * .027, pz * .027) + terrain.noise.noise(px * .085, pz * .085) * .24;
      if (y > 11 || terrain.slopeAt(px, pz) > 1.2 || terrain.roadGap(px, pz) < 2.8 || cover < -.27 + edge * .68) continue;
      if (clearings.some(point => Math.hypot(point.x - px, point.z - pz) < 11)) continue;
      const key = `${Math.floor(px / 32)}:${Math.floor(pz / 32)}`;
      const group = chunks.get(key) ?? []; chunks.set(key, group);
      const height = (3.5 + unit(i * 13) * 3.3) * (1 - edge * .34);
      group.push({ x: px, y: y - .07, z: pz, height, width: .8 + unit(i * 17) * .42, yaw: unit(i * 19) * Math.PI * 2, variant: i % 3 });
    }
    for (const places of chunks.values()) {
      const center = new THREE.Vector3(); for (const place of places) center.add(new THREE.Vector3(place.x, place.y, place.z)); center.divideScalar(places.length);
      const grove = new THREE.LOD(); grove.position.copy(center);
      for (let detail = 0; detail < 2; detail++) {
        const level = new THREE.Group();
        for (let variant = 0; variant < 3; variant++) {
          const selected = places.filter(place => place.variant === variant); if (!selected.length) continue;
          const template = parts[variant][detail];
          for (const [geometry, material, foliage] of [[template.branches, bark, false], [template.leaves, leafMaterials[variant], true]] as const) {
            const mesh = new THREE.InstancedMesh(geometry, material, selected.length), dummy = new THREE.Object3D();
            selected.forEach((place, index) => {
              dummy.position.set(place.x - center.x, place.y - center.y, place.z - center.z); dummy.rotation.y = place.yaw;
              dummy.scale.set(place.height * place.width, place.height, place.height * place.width); dummy.updateMatrix(); mesh.setMatrixAt(index, dummy.matrix);
              mesh.setColorAt(index, new THREE.Color().setScalar(.9 + unit(index * 29) * .18));
            });
            if (foliage) mesh.customDepthMaterial = depth;
            mesh.castShadow = detail === 0; mesh.receiveShadow = true; mesh.computeBoundingSphere(); level.add(mesh);
          }
        }
        grove.addLevel(level, detail === 0 ? 0 : 78, .12);
      }
      this.groves.push(grove); this.group.add(grove);
    }
  }
  private template(variant: number, distant: boolean): TreeParts {
    const tree = new Tree(); tree.loadPreset('Ash Medium');
    const options = tree.options; options.seed = 9327 + variant * 173;
    options.bark.textured = false; options.branch.children = { 0: 5, 1: 3, 2: 2 };
    options.branch.sections = { 0: 7, 1: 5, 2: 3, 3: 2 }; options.branch.segments = { 0: 6, 1: 5, 2: 3, 3: 3 };
    options.leaves.count = distant ? 5 : 13; options.leaves.size = distant ? 7.2 : 5.4;
    options.leaves.billboard = distant ? 'single' : 'double'; options.leaves.sizeVariance = .4;
    tree.generate(); tree.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(tree), scale = 1 / box.getSize(new THREE.Vector3()).y;
    const matrix = new THREE.Matrix4().makeScale(scale, scale, scale);
    const parts = { branches: tree.branchesMesh.geometry.clone().applyMatrix4(matrix), leaves: tree.leavesMesh.geometry.clone().applyMatrix4(matrix) };
    for (const geometry of Object.values(parts)) { geometry.computeBoundingSphere(); this.geometry.add(geometry); }
    for (const mesh of [tree.branchesMesh, tree.leavesMesh]) { mesh.geometry.dispose(); for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.dispose(); }
    return parts;
  }
  private windShader(material: THREE.Material): void {
    material.onBeforeCompile = shader => {
      shader.uniforms.forestTime = this.time; shader.uniforms.forestWind = this.strength;
      shader.vertexShader = 'uniform float forestTime; uniform float forestWind;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        float seed = 0.0;
        #ifdef USE_INSTANCING
          seed = instanceMatrix[3].x * .31 + instanceMatrix[3].z * .23;
        #endif
        float sway = sin(forestTime * 1.25 + seed + position.y * 4.0) + .28 * sin(forestTime * 2.1 + seed);
        transformed.xz += vec2(.014, .009) * forestWind * uv.y * sway;`);
    };
    material.customProgramCacheKey = () => 'wugong-forest-wind-1';
  }
  update(camera: THREE.Camera, time: number, wind: number, night: number): void {
    this.time.value = time; this.strength.value = wind;
    for (const material of this.foliage) material.emissiveIntensity = .16 * (1 - night * .97);
    for (const grove of this.groves) grove.update(camera);
  }
  dispose(): void { this.geometry.forEach(item => item.dispose()); this.materials.forEach(item => item.dispose()); this.group.clear(); }
}
