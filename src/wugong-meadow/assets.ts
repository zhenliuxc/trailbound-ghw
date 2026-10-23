import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export type AssetName = 'tent' | 'rock-a' | 'rock-b' | 'signpost' | 'log';
export interface Placement { x: number; y: number; z: number; height: number; yaw: number }
export class WorldAssets {
  private readonly templates = new Map<AssetName, THREE.Group>();
  private readonly geometries = new Set<THREE.BufferGeometry>();
  private readonly materials = new Set<THREE.Material>();
  async load(signal: AbortSignal): Promise<void> {
    const loader = new GLTFLoader();
    await Promise.all((['tent', 'rock-a', 'rock-b', 'signpost', 'log'] satisfies AssetName[]).map(async name => {
      const response = await fetch(`scenes/wugong-environment-v1/${name === 'tent' ? 'tent-v2' : name}.glb`, { signal });
      if (!response.ok) throw new Error('山间景物暂时无法读取');
      const asset = await loader.parseAsync(await response.arrayBuffer(), '');
      const model = asset.scene, box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
      const scale = 1 / Math.max(.01, size.y);
      model.scale.multiplyScalar(scale); model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
      model.updateMatrixWorld(true);
      model.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        this.geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) this.materials.add(material);
      });
      this.templates.set(name, model);
    }));
  }
  instances(name: AssetName, placements: readonly Placement[], shadows = true): THREE.Group {
    const template = this.templates.get(name); if (!template) throw new Error(`山间景物尚未展开 ${name}`);
    const group = new THREE.Group(), dummy = new THREE.Object3D(), matrix = new THREE.Matrix4(), tint = new THREE.Color();
    template.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const mesh = new THREE.InstancedMesh(object.geometry, object.material, placements.length);
      for (let i = 0; i < placements.length; i++) {
        const place = placements[i]; dummy.position.set(place.x, place.y, place.z); dummy.rotation.set(0, place.yaw, 0); dummy.scale.setScalar(place.height); dummy.updateMatrix();
        matrix.multiplyMatrices(dummy.matrix, object.matrixWorld); mesh.setMatrixAt(i, matrix);
        tint.setScalar(.91 + (Math.sin(i * 17.3) * .5 + .5) * .18); mesh.setColorAt(i, tint);
      }
      mesh.castShadow = shadows; mesh.receiveShadow = true; mesh.computeBoundingSphere(); group.add(mesh);
    });
    return group;
  }
  dispose(): void { this.geometries.forEach(item => item.dispose()); this.materials.forEach(item => item.dispose()); this.templates.clear(); }
}
