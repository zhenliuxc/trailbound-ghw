import * as THREE from 'three';
import { groundHeight, sampleWalk, terrainGrain, WALK_LENGTH } from './world.js';

export interface MountainTextures { rock?: THREE.Texture; ground?: THREE.Texture; grass?: THREE.Texture; farRock?: THREE.Texture }
export interface MountainWorld {
  group: THREE.Group;
  update(time: number, reduced: boolean): void;
  dispose(): void;
}

const clamp = (n: number, a = 0, b = 1): number => Math.max(a, Math.min(b, n));
const fract = (n: number): number => n - Math.floor(n);
const seed = (n: number): number => fract(Math.sin(n * 127.1 + 311.7) * 43758.5453);
const cream = new THREE.Color('#ded8bf');
const sage = new THREE.Color('#88977b');
const rockColour = new THREE.Color('#a49f89');
const shade = new THREE.Color('#7c8b87');

/** A continuous, painterly terrain vignette; no surveyed route is implied. */
export function buildMountainWorld(textures: MountainTextures = {}): MountainWorld {
  const group = new THREE.Group();
  group.name = 'tiger-mountain-world';
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const ownedTextures = new Set<THREE.Texture>();
  const instanceBatches: THREE.InstancedMesh[] = [];
  let disposed = false;
  const ownGeometry = <T extends THREE.BufferGeometry>(geometry: T): T => { geometries.add(geometry); return geometry; };
  const ownMaterial = <T extends THREE.Material>(material: T): T => { materials.add(material); return material; };
  const repeatTexture = (source: THREE.Texture | undefined, x: number, y: number): THREE.Texture | null => {
    if (!source) return null;
    const copy = source.clone();
    copy.wrapS = copy.wrapT = THREE.RepeatWrapping;
    copy.repeat.set(x, y);
    copy.colorSpace = THREE.SRGBColorSpace;
    copy.needsUpdate = true;
    ownedTextures.add(copy);
    return copy;
  };
  const groundMap = repeatTexture(textures.ground, 10, 11);
  const cliffMap = repeatTexture(textures.rock, 8, 9);
  const grassMap = repeatTexture(textures.grass, 10, 11);
  const farMap = repeatTexture(textures.farRock, 9, 6);
  const roadMap = repeatTexture(textures.ground, 1.2, .35);
  const terrainMaterial = ownMaterial(new THREE.MeshStandardMaterial({
    color: '#e3dfca', vertexColors: true, map: grassMap || groundMap,
    roughness: 1, metalness: 0,
  }));
  const cliffMaterial = ownMaterial(new THREE.MeshStandardMaterial({
    color: '#e2ddd0', vertexColors: true, map: cliffMap || groundMap,
    roughness: 1, metalness: 0,
  }));

  function land(x0: number, x1: number, z0: number, z1: number, columns: number, rows: number, cliff = false): void {
    const positions: number[] = [];
    const colours: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const colour = new THREE.Color();
    for (let iz = 0; iz <= rows; iz += 1) {
      for (let ix = 0; ix <= columns; ix += 1) {
        const x = x0 + (x1 - x0) * ix / columns;
        const z = z0 + (z1 - z0) * iz / rows;
        const y = groundHeight(x, z);
        positions.push(x, y, z);
        uvs.push((x + 145) / 345, (z + 175) / 320);
        const wash = clamp(0.5 + terrainGrain(x * 0.65, z * 0.65) * 0.36);
        colour.copy(cliff ? rockColour : sage).lerp(cream, cliff ? wash * 0.32 : wash * 0.46);
        if (x > 24 && x < 84) colour.lerp(shade, 0.12 + (1 - wash) * 0.16);
        if (x > 125) colour.lerp(shade, 0.17).lerp(cream, clamp((x - 125) / 100) * 0.17);
        colours.push(colour.r, colour.g, colour.b);
        if (ix < columns && iz < rows) {
          const a = iz * (columns + 1) + ix;
          const b = a + 1;
          const c = a + columns + 1;
          const d = c + 1;
          indices.push(a, c, b, b, c, d);
        }
      }
    }
    const geometry = ownGeometry(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const mesh = new THREE.Mesh(geometry, cliff ? cliffMaterial : terrainMaterial);
    mesh.name = cliff ? 'continuous-gorge-wall' : 'continuous-mountainside';
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  // Shared seams use exactly the same height function. The road remains part
  // of the mountainside, while denser cliff rows retain its eroded silhouette.
  land(-145, -48, -175, 145, 32, 112);
  land(-48, 24, -175, 145, 90, 112);
  land(24, 84, -175, 145, 30, 112, true);
  land(84, 125, -175, 145, 16, 72, true);
  land(125, 203, -175, 145, 34, 112, true);

  function roadRibbon(width: number, offset: number, colour: string, opacity = 1): void {
    const positions: number[] = [];
    const colours: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const tint = new THREE.Color(colour);
    for (let index = 0; index <= 380; index += 1) {
      const pose = sampleWalk(WALK_LENGTH * index / 380);
      const px = Math.cos(pose.heading);
      const pz = -Math.sin(pose.heading);
      const irregular = 1 + Math.sin(index * 0.39) * 0.035 + Math.sin(index * 1.1) * 0.018;
      for (const side of [-1, 1]) {
        const x = pose.position.x + px * width * side * irregular;
        const z = pose.position.z + pz * width * side * irregular;
        positions.push(x, groundHeight(x, z) + offset, z);
        const wash = 0.95 + Math.sin(index * 0.17 + side) * 0.05;
        colours.push(tint.r * wash, tint.g * wash, tint.b * wash);
        uvs.push(side > 0 ? 1 : 0, index / 24);
      }
      if (index < 380) { const a = index * 2; indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const geometry = ownGeometry(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const material = ownMaterial(new THREE.MeshStandardMaterial({
      vertexColors: true, map: roadMap, roughness: 1, transparent: opacity < 1, opacity,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
      side: THREE.DoubleSide, depthWrite: opacity === 1,
    }));
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'graded-earth-footpath';
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  roadRibbon(1.42, 0.045, '#b9b196', 0.45);
  roadRibbon(1.09, 0.065, '#d4c6a3');
  roadRibbon(0.73, 0.082, '#e0d3b3', 0.55);

  // Distant mountain curtains have actual depth and gently rounded ridges.
  // Desaturated layers recede through the main scene's fog instead of using a
  // flat landscape photograph that would move with the viewer.
  for (let layer = 0; layer < 3; layer += 1) {
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const colour = new THREE.Color(['#9aa7a1', '#b1bcb2', '#c5cdbd'][layer]);
    for (let index = 0; index <= 96; index += 1) {
      const z = -310 + index / 96 * 620;
      const crest = 143 + layer * 23 + Math.sin(z * 0.014 + layer * 2.1) * 46
        + Math.sin(z * 0.037 + layer) * 17 + Math.sin(z * 0.085) * 4;
      const x = 232 + layer * 46 + Math.sin(z * 0.019 + layer) * 12;
      positions.push(x - 12, -80, z, x, crest * 0.72, z, x + 25, crest, z, x + 55, crest * 0.7, z);
      uvs.push(index / 96, 0, index / 96, .72, index / 96, 1, index / 96, .7);
      if (index < 96) {
        for (let width = 0; width < 3; width += 1) {
          const a = index * 4 + width;
          indices.push(a, a + 4, a + 1, a + 1, a + 4, a + 5);
        }
      }
    }
    const geometry = ownGeometry(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const material = ownMaterial(new THREE.MeshStandardMaterial({ color: colour, map: farMap, roughness: 1, side: THREE.DoubleSide }));
    const ridge = new THREE.Mesh(geometry, material);
    ridge.name = `distant-watercolour-ridge-${layer}`;
    group.add(ridge);
  }

  const riverColumns = 12;
  const riverRows = 90;
  const riverPositions: number[] = [];
  const riverColours: number[] = [];
  const riverIndices: number[] = [];
  const waterDark = new THREE.Color('#789b96');
  const waterLight = new THREE.Color('#b4c0a8');
  const waterTint = new THREE.Color();
  for (let iz = 0; iz <= riverRows; iz += 1) {
    for (let ix = 0; ix <= riverColumns; ix += 1) {
      const x = 83 + ix / riverColumns * 43;
      const z = -178 + iz / riverRows * 326;
      riverPositions.push(x, -75, z);
      waterTint.copy(waterDark).lerp(waterLight, clamp(0.43 + terrainGrain(x * 1.9, z * 0.55) * 0.45));
      riverColours.push(waterTint.r, waterTint.g, waterTint.b);
      if (ix < riverColumns && iz < riverRows) {
        const a = iz * (riverColumns + 1) + ix;
        const c = a + riverColumns + 1;
        riverIndices.push(a, c, a + 1, a + 1, c, c + 1);
      }
    }
  }
  const waterGeometry = ownGeometry(new THREE.BufferGeometry());
  const waterAttribute = new THREE.Float32BufferAttribute(riverPositions, 3);
  waterAttribute.setUsage(THREE.DynamicDrawUsage);
  waterGeometry.setAttribute('position', waterAttribute);
  waterGeometry.setAttribute('color', new THREE.Float32BufferAttribute(riverColours, 3));
  waterGeometry.setIndex(riverIndices);
  waterGeometry.computeVertexNormals();
  const waterMaterial = ownMaterial(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.76, metalness: 0.02 }));
  const river = new THREE.Mesh(waterGeometry, waterMaterial);
  river.name = 'jinsha-river';
  group.add(river);

  const foamCount = 116;
  const foamPositions = new Float32Array(foamCount * 6);
  const foamGeometry = ownGeometry(new THREE.BufferGeometry());
  const foamAttribute = new THREE.BufferAttribute(foamPositions, 3);
  foamAttribute.setUsage(THREE.DynamicDrawUsage);
  foamGeometry.setAttribute('position', foamAttribute);
  const foamMaterial = ownMaterial(new THREE.LineBasicMaterial({ color: '#e8e9d0', transparent: true, opacity: 0.62 }));
  const foam = new THREE.LineSegments(foamGeometry, foamMaterial);
  foam.name = 'river-current-strokes';
  // The geometry begins at zero. Culling stays disabled while it is advected.
  foam.frustumCulled = false;
  group.add(foam);

  const rockGeometry = ownGeometry(new THREE.SphereGeometry(1, 14, 10));
  const rockVertices = rockGeometry.getAttribute('position');
  for (let index = 0; index < rockVertices.count; index += 1) {
    const x = rockVertices.getX(index), y = rockVertices.getY(index), z = rockVertices.getZ(index);
    const rough = 1 + Math.sin(x * 5 + z * 3) * 0.095 + Math.sin(y * 6 - x * 2) * 0.05;
    rockVertices.setXYZ(index, x * rough, y * rough, z * rough);
  }
  rockGeometry.computeVertexNormals();
  const propRockMaterials = ['#a3a28b', '#b4ac95', '#929b86', '#c0b69e'].map(color => ownMaterial(new THREE.MeshStandardMaterial({ color, map: cliffMap, roughness: 1 })));
  interface PropTransform { x: number; y: number; z: number; sx: number; sy: number; sz: number; ry: number; rz?: number }
  const dummy = new THREE.Object3D();
  function setTransform(transform: PropTransform, rz = transform.rz || 0): void {
    dummy.position.set(transform.x, transform.y, transform.z);
    dummy.scale.set(transform.sx, transform.sy, transform.sz);
    dummy.rotation.set(0, transform.ry, rz);
    dummy.updateMatrix();
  }
  function propBatch(geometry: THREE.BufferGeometry, material: THREE.Material, transforms: PropTransform[], name: string): THREE.InstancedMesh {
    const batch = new THREE.InstancedMesh(geometry, material, transforms.length);
    batch.name = name;
    for (let index = 0; index < transforms.length; index += 1) {
      setTransform(transforms[index]);
      batch.setMatrixAt(index, dummy.matrix);
    }
    batch.instanceMatrix.needsUpdate = true;
    batch.computeBoundingSphere();
    batch.receiveShadow = true;
    group.add(batch);
    instanceBatches.push(batch);
    return batch;
  }
  const rockTransforms: PropTransform[][] = propRockMaterials.map(() => []);
  const addRock = (x: number, z: number, sx: number, sy: number, sz: number, index: number, fixedY?: number): void => {
    rockTransforms[index % propRockMaterials.length].push({
      x, y: fixedY === undefined ? groundHeight(x, z) + sy * 0.31 : fixedY, z,
      sx, sy, sz, ry: seed(index + 404) * Math.PI,
    });
  };
  // River boulders are illustrative and deliberately have no landmark label.
  addRock(102, -32, 3.7, 3.1, 5.3, 2, -74.1);
  addRock(92, 44, 2.1, 2.3, 3.6, 0, -74.7);
  addRock(117, -102, 3.2, 2.1, 3.1, 1, -74.5);
  for (let index = 0; index < 74; index += 1) {
    const pose = sampleWalk(4 + seed(index + 71) * (WALK_LENGTH - 8));
    const side = index % 2 ? 1 : -1;
    const lateral = side * (2.8 + seed(index + 118) * 8);
    const x = pose.position.x + Math.cos(pose.heading) * lateral;
    const z = pose.position.z - Math.sin(pose.heading) * lateral;
    const size = 0.3 + seed(index + 2) * 1.18;
    addRock(x, z, size * 1.3, size * 0.62, size, index);
  }
  rockTransforms.forEach((transforms, index) => propBatch(rockGeometry, propRockMaterials[index], transforms, 'mountain-stones'));

  // Dry high-trail grasses and small pines leave the road and river sightline
  // open. Their quiet colours belong to the gorge rather than a lush jungle.
  const grassMaterials = ['#a6ae83', '#b9b68b', '#909d79'].map(color => ownMaterial(new THREE.MeshStandardMaterial({ color, roughness: 1, side: THREE.DoubleSide })));
  const bladeGeometry = ownGeometry(new THREE.BufferGeometry());
  bladeGeometry.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.28, 0, 0, 0.02, 1.04, 0.03, 0.18, 0, 0,
    -0.34, 0, -0.17, -0.44, 0.78, -0.1, -0.13, 0, -0.08,
    0.05, 0, 0.1, 0.45, 0.92, 0.18, 0.3, 0, 0.14,
  ], 3));
  bladeGeometry.computeVertexNormals();
  const grassTransforms: (PropTransform & { phase: number })[][] = grassMaterials.map(() => []);
  for (let index = 0; index < 185; index += 1) {
    const pose = sampleWalk(seed(index + 501) * WALK_LENGTH);
    const lateral = (index % 2 ? 1 : -1) * (1.8 + seed(index + 222) * 10.8);
    const x = pose.position.x + Math.cos(pose.heading) * lateral;
    const z = pose.position.z - Math.sin(pose.heading) * lateral;
    const scale = 0.45 + seed(index + 321) * 0.68;
    grassTransforms[index % grassMaterials.length].push({
      x, y: groundHeight(x, z) + 0.02, z, sx: scale, sy: scale, sz: scale,
      ry: seed(index + 111) * Math.PI * 2, phase: seed(index + 662) * Math.PI * 2,
    });
  }
  const grassBatches = grassTransforms.map((transforms, index) => {
    const batch = propBatch(bladeGeometry, grassMaterials[index], transforms, 'cliff-grass');
    batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    return batch;
  });
  const trunkGeometry = ownGeometry(new THREE.CylinderGeometry(0.13, 0.22, 1, 7));
  const trunkMaterial = ownMaterial(new THREE.MeshStandardMaterial({ color: '#8c836a', roughness: 1 }));
  const foliageGeometry = ownGeometry(new THREE.SphereGeometry(1, 12, 9));
  const foliageMaterials = ['#6f866d', '#849476', '#a2ac83'].map(color => ownMaterial(new THREE.MeshStandardMaterial({ color, roughness: 1 })));
  const trunkTransforms: PropTransform[] = [];
  const foliageTransforms: PropTransform[][] = foliageMaterials.map(() => []);
  for (let index = 0; index < 24; index += 1) {
    const pose = sampleWalk(seed(index + 1200) * WALK_LENGTH * 0.82);
    // Pines favour the uphill side. None stands in the walking ribbon.
    const lateral = 7 + seed(index + 1210) * 23;
    const x = pose.position.x + Math.cos(pose.heading) * lateral;
    const z = pose.position.z - Math.sin(pose.heading) * lateral;
    const y = groundHeight(x, z);
    const height = 2.6 + seed(index + 1230) * 2.8;
    trunkTransforms.push({ x, y: y + height * 0.45, z, sx: 1, sy: height * 0.9, sz: 1, ry: 0 });
    for (let crown = 0; crown < 4; crown += 1) {
      foliageTransforms[(index + crown) % foliageMaterials.length].push({
        x: x + Math.sin(crown * 2.4 + index) * height * 0.2,
        y: y + height * (0.68 + crown * 0.09), z: z + Math.cos(crown * 2.4) * height * 0.17,
        sx: height * 0.33, sy: height * 0.14, sz: height * 0.32,
        ry: 0, rz: Math.sin(index + crown) * 0.12,
      });
    }
  }
  propBatch(trunkGeometry, trunkMaterial, trunkTransforms, 'pine-trunks');
  foliageTransforms.forEach((transforms, index) => propBatch(foliageGeometry, foliageMaterials[index], transforms, 'pine-canopies'));

  function update(time: number, reduced: boolean): void {
    if (disposed) return;
    const t = reduced ? 0 : time;
    for (let index = 0; index < waterAttribute.count; index += 1) {
      const x = waterAttribute.getX(index);
      const z = waterAttribute.getZ(index);
      waterAttribute.setY(index, -75 + Math.sin(z * 0.2 + x * 0.08 - t * 2.5) * 0.1 + Math.sin(z * 0.47 - t * 3.8) * 0.045);
    }
    waterAttribute.needsUpdate = true;
    for (let index = 0; index < foamCount; index += 1) {
      const z = -174 + fract(seed(index + 70) + t * (0.017 + seed(index + 2) * 0.009)) * 318;
      const x = 86 + seed(index + 19) * 36 + Math.sin(z * 0.1 + index) * 0.7;
      const length = 1.3 + seed(index + 86) * 3.8;
      foamPositions[index * 6] = x;
      foamPositions[index * 6 + 1] = -74.78;
      foamPositions[index * 6 + 2] = z;
      foamPositions[index * 6 + 3] = x + Math.sin(z * 0.06) * 0.5;
      foamPositions[index * 6 + 4] = -74.78;
      foamPositions[index * 6 + 5] = z + length;
    }
    foamAttribute.needsUpdate = true;
    grassBatches.forEach((batch, materialIndex) => {
      grassTransforms[materialIndex].forEach((transform, index) => {
        setTransform(transform, reduced ? 0 : Math.sin(t * 1.1 + transform.phase) * 0.045);
        batch.setMatrixAt(index, dummy.matrix);
      });
      batch.instanceMatrix.needsUpdate = true;
    });
  }
  update(0, true);

  return {
    group, update,
    dispose(): void {
      if (disposed) return;
      disposed = true;
      group.removeFromParent();
      group.clear();
      for (const batch of instanceBatches) batch.dispose();
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
      for (const texture of ownedTextures) texture.dispose();
      geometries.clear(); materials.clear(); ownedTextures.clear();
      grassTransforms.forEach(transforms => { transforms.length = 0; });
      instanceBatches.length = 0;
    },
  };
}
