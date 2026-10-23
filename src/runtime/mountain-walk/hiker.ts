import * as THREE from 'three';

export interface MountainHikerPose {
  /** Travelled distance in world metres. Footfalls follow distance, not elapsed time. */
  distance: number;
  /** Actual travel speed in world metres per second. */
  speed: number;
  /** Rise / run in the character's forward direction. */
  grade: number;
  time: number;
  reduced: boolean;
}

export interface MountainHiker {
  /** Feet rest on y = 0; local forward is +Z. The caller owns this transform. */
  group: THREE.Group;
  update(options: MountainHikerPose): void;
  dispose(): void;
}

const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;
const smooth = (v: number): number => v * v * (3 - 2 * v);
const fractional = (v: number): number => v - Math.floor(v);

/**
 * An original, softly modelled traveller. All motion is articulated rotation or
 * translation: shoes, limbs and the pack keep their shape throughout the walk.
 */
export function createMountainHiker(): MountainHiker {
  const group = new THREE.Group();
  group.name = 'mountain-hiker';
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  let disposed = false;

  // A small, repeatable pigment grain is shared by the whole character. It is
  // generated locally and never loads or modifies an external image.
  let pigment: THREE.CanvasTexture | undefined;
  let grain: THREE.CanvasTexture | undefined;
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      const pixels = context.createImageData(128, 128);
      for (let y = 0; y < 128; y += 1) {
        for (let x = 0; x < 128; x += 1) {
          const hash = fractional(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
          const wash = Math.sin(x * 0.074 + Math.cos(y * 0.091)) * 2.4;
          const value = Math.round(241 + (hash - 0.5) * 15 + wash);
          const offset = (y * 128 + x) * 4;
          pixels.data[offset] = value;
          pixels.data[offset + 1] = value - 1;
          pixels.data[offset + 2] = value - 4;
          pixels.data[offset + 3] = 255;
        }
      }
      context.putImageData(pixels, 0, 0);
      context.strokeStyle = 'rgba(149, 135, 105, .045)';
      context.lineWidth = 0.5;
      for (let row = 3; row < 128; row += 7) {
        context.beginPath();
        context.moveTo(0, row);
        context.bezierCurveTo(37, row - 1, 79, row + 1, 128, row);
        context.stroke();
      }
      pigment = new THREE.CanvasTexture(canvas);
      pigment.colorSpace = THREE.SRGBColorSpace;
      grain = new THREE.CanvasTexture(canvas);
      for (const texture of [pigment, grain]) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        textures.add(texture);
      }
    }
  }

  function material(color: THREE.ColorRepresentation, softness = 0.007): THREE.MeshStandardMaterial {
    const result = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.97,
      metalness: 0,
      map: pigment,
      bumpMap: grain,
      bumpScale: softness,
      vertexColors: true,
    });
    materials.add(result);
    return result;
  }

  const cloth = material('#e9e2cc');
  const clothShade = material('#c9c9ab');
  const pants = material('#667364');
  const seam = material('#526453', 0.002);
  const hat = material('#7d9160');
  const hatEdge = material('#65774f');
  const skin = material('#dcb99a', 0.002);
  const skinShade = material('#c7a087', 0.002);
  const hair = material('#5a5544', 0.002);
  const dark = material('#454d3e', 0.001);
  const leather = material('#8c7053');
  const sole = material('#575d50', 0.004);
  const packFabric = material('#bb8756', 0.01);
  const packShade = material('#a16f46', 0.007);
  const strap = material('#827151');
  const buckle = material('#b6b9a0', 0.001);
  const pad = material('#a3ae88', 0.008);

  function own<T extends THREE.BufferGeometry>(geometry: T): T {
    const positions = geometry.getAttribute('position');
    const colors = new Float32Array(positions.count * 3);
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      const variation = Math.sin(x * 23 + y * 31 + z * 17) * 0.014 +
        Math.sin(x * 71 - y * 53 + z * 43) * 0.008;
      const tone = 0.976 + variation;
      colors[i * 3] = tone;
      colors[i * 3 + 1] = tone;
      colors[i * 3 + 2] = tone - 0.005;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometries.add(geometry);
    return geometry;
  }

  function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, surface: THREE.Material,
    x = 0, y = 0, z = 0): THREE.Mesh {
    const object = new THREE.Mesh(own(geometry), surface);
    object.position.set(x, y, z);
    geometry.computeBoundingSphere();
    // Tiny stitching, eyes and buckles need no second pass in the shadow map.
    object.castShadow = (geometry.boundingSphere?.radius ?? 0) > 0.065;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }

  function ellipsoid(parent: THREE.Object3D, surface: THREE.Material, size: [number, number, number],
    x: number, y: number, z: number): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(1, 20, 14);
    geometry.scale(...size);
    return mesh(parent, geometry, surface, x, y, z);
  }

  function roundedBox(width: number, height: number, depth: number, radius: number): THREE.BufferGeometry {
    const geometry = new THREE.BoxGeometry(width, height, depth, 6, 6, 6);
    const positions = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    const point = new THREE.Vector3();
    const inner = new THREE.Vector3();
    const normal = new THREE.Vector3();
    for (let i = 0; i < positions.count; i += 1) {
      point.fromBufferAttribute(positions, i);
      inner.set(
        clamp(point.x, -width / 2 + radius, width / 2 - radius),
        clamp(point.y, -height / 2 + radius, height / 2 - radius),
        clamp(point.z, -depth / 2 + radius, depth / 2 - radius),
      );
      normal.subVectors(point, inner).normalize();
      point.copy(inner).addScaledVector(normal, radius);
      positions.setXYZ(i, point.x, point.y, point.z);
      normals.setXYZ(i, normal.x, normal.y, normal.z);
    }
    return geometry;
  }

  function tube(parent: THREE.Object3D, points: Array<[number, number, number]>, radius: number,
    surface: THREE.Material, closed = false): THREE.Mesh {
    const curve = new THREE.CatmullRomCurve3(points.map(point => new THREE.Vector3(...point)), closed);
    return mesh(parent, new THREE.TubeGeometry(curve, Math.max(12, points.length * 5), radius, 5, closed), surface);
  }

  function taper(parent: THREE.Object3D, top: number, bottom: number, length: number,
    surface: THREE.Material, y: number): THREE.Mesh {
    return mesh(parent, new THREE.CylinderGeometry(top, bottom, length, 16, 3), surface, 0, y);
  }

  const hips = new THREE.Group();
  group.add(hips);
  // The upper body pivots at the pelvis, leaving the outside transform to the scene.
  const upper = new THREE.Group();
  upper.position.y = 0.86;
  group.add(upper);

  const torsoProfile = [
    new THREE.Vector2(0.132, 0.015), new THREE.Vector2(0.149, 0.045),
    new THREE.Vector2(0.158, 0.15), new THREE.Vector2(0.185, 0.31),
    new THREE.Vector2(0.19, 0.385), new THREE.Vector2(0.152, 0.445),
    new THREE.Vector2(0.066, 0.47),
  ];
  const torsoGeometry = new THREE.LatheGeometry(torsoProfile, 28);
  torsoGeometry.scale(1, 1, 0.67);
  mesh(upper, torsoGeometry, cloth);
  const waist = ellipsoid(hips, pants, [0.151, 0.108, 0.105], 0, 0.835, 0);
  waist.name = 'trouser-waist';
  mesh(upper, roundedBox(0.296, 0.025, 0.194, 0.008), strap, 0, 0.027, 0);
  mesh(upper, roundedBox(0.043, 0.027, 0.01, 0.005), buckle, 0, 0.028, 0.104);
  tube(upper, [[0, 0.075, 0.104], [0.004, 0.25, 0.12], [0, 0.425, 0.099]], 0.0025, clothShade);
  for (const y of [0.13, 0.225, 0.32, 0.4]) ellipsoid(upper, clothShade, [0.007, 0.007, 0.004], 0, y, 0.124);
  for (const side of [-1, 1]) {
    const collar = mesh(upper, roundedBox(0.09, 0.018, 0.078, 0.007), cloth,
      side * 0.052, 0.468, 0.071);
    collar.rotation.z = side * -0.28;
    collar.rotation.x = -0.18;
    tube(upper, [[side * 0.177, 0.365, 0.058], [side * 0.164, 0.245, 0.081],
      [side * 0.14, 0.085, 0.079]], 0.0022, clothShade);
  }
  taper(upper, 0.05, 0.055, 0.074, skinShade, 0.499);

  const head = new THREE.Group();
  head.position.set(0, 0.626, 0.015);
  upper.add(head);
  ellipsoid(head, skin, [0.119, 0.145, 0.11], 0, 0, 0.019);
  ellipsoid(head, hair, [0.1195, 0.1, 0.109], 0, 0.066, 0.003);
  for (const side of [-1, 1]) {
    ellipsoid(head, skinShade, [0.025, 0.042, 0.024], side * 0.116, -0.01, 0.012);
    ellipsoid(head, dark, [0.007, 0.007, 0.003], side * 0.04, 0.014, 0.12);
    tube(head, [[side * 0.06, 0.035, 0.117], [side * 0.039, 0.039, 0.122],
      [side * 0.023, 0.034, 0.12]], 0.0027, hair);
  }
  ellipsoid(head, skin, [0.022, 0.028, 0.029], 0, -0.014, 0.125);
  tube(head, [[-0.025, -0.062, 0.11], [0, -0.066, 0.116], [0.023, -0.061, 0.11]], 0.0024, skinShade);

  const hatBrim = new THREE.LatheGeometry([
    new THREE.Vector2(0.082, 0), new THREE.Vector2(0.18, -0.008),
    new THREE.Vector2(0.221, -0.002), new THREE.Vector2(0.224, 0.009),
    new THREE.Vector2(0.204, 0.02), new THREE.Vector2(0.13, 0.03),
  ], 40);
  hatBrim.scale(1, 1, 0.92);
  mesh(head, hatBrim, hat, 0, 0.126, 0);
  const crown = new THREE.LatheGeometry([
    new THREE.Vector2(0.135, 0), new THREE.Vector2(0.129, 0.027),
    new THREE.Vector2(0.114, 0.091), new THREE.Vector2(0.093, 0.109),
    new THREE.Vector2(0.045, 0.115), new THREE.Vector2(0, 0.116),
  ], 32);
  crown.scale(1, 1, 0.92);
  mesh(head, crown, hat, 0, 0.149, 0);
  const hatBand = mesh(head, new THREE.CylinderGeometry(0.129, 0.133, 0.019, 32), hatEdge, 0, 0.166, 0);
  hatBand.scale.z = 0.92;
  mesh(head, roundedBox(0.037, 0.018, 0.008, 0.004), leather, 0.047, 0.166, 0.117);
  const brimStitch: Array<[number, number, number]> = [];
  for (let i = 0; i < 24; i += 1) {
    const angle = i / 24 * TAU;
    brimStitch.push([Math.cos(angle) * 0.207, 0.14, Math.sin(angle) * 0.19]);
  }
  tube(head, brimStitch, 0.0016, hatEdge, true);

  const pack = new THREE.Group();
  pack.position.set(0, 0.245, -0.195);
  upper.add(pack);
  mesh(pack, roundedBox(0.345, 0.445, 0.208, 0.065), packFabric);
  mesh(pack, roundedBox(0.338, 0.102, 0.226, 0.037), packShade, 0, 0.174, -0.003);
  mesh(pack, roundedBox(0.247, 0.171, 0.056, 0.024), packShade, 0, -0.085, -0.111);
  tube(pack, [[-0.104, -0.142, -0.144], [-0.106, -0.015, -0.143],
    [0.106, -0.015, -0.143], [0.104, -0.142, -0.144]], 0.0023, leather);
  for (const side of [-1, 1]) {
    mesh(pack, roundedBox(0.023, 0.298, 0.014, 0.006), strap, side * 0.111, 0.035, -0.117);
    mesh(pack, roundedBox(0.034, 0.029, 0.016, 0.006), buckle, side * 0.111, 0.027, -0.127);
    mesh(pack, roundedBox(0.073, 0.15, 0.135, 0.026), packShade, side * 0.169, -0.072, -0.005);
    tube(upper, [[side * 0.112, 0.421, -0.193], [side * 0.15, 0.464, -0.027],
      [side * 0.141, 0.373, 0.106], [side * 0.112, 0.171, 0.119],
      [side * 0.128, 0.066, -0.074]], 0.017, strap);
  }
  tube(upper, [[-0.137, 0.3, 0.126], [0, 0.294, 0.143], [0.137, 0.3, 0.126]], 0.008, strap);
  mesh(upper, roundedBox(0.031, 0.024, 0.012, 0.005), buckle, 0.025, 0.295, 0.145);
  tube(pack, [[-0.052, 0.213, 0], [-0.055, 0.267, 0.005], [0.055, 0.267, 0.005],
    [0.052, 0.213, 0]], 0.009, strap);
  const bedroll = mesh(pack, new THREE.CylinderGeometry(0.064, 0.064, 0.392, 24), pad, 0, 0.255, -0.017);
  bedroll.rotation.z = Math.PI / 2;
  for (const side of [-1, 1]) {
    const ring = mesh(pack, new THREE.TorusGeometry(0.064, 0.006, 5, 24), strap,
      side * 0.129, 0.255, -0.017);
    ring.rotation.y = Math.PI / 2;
    for (const radius of [0.023, 0.046]) {
      const end = mesh(pack, new THREE.TorusGeometry(radius, 0.002, 4, 24), seam,
        side * 0.198, 0.255, -0.017);
      end.rotation.y = Math.PI / 2;
    }
  }

  const arms: Array<{ shoulder: THREE.Group; elbow: THREE.Group; side: number }> = [];
  for (const side of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.201, 0.399, 0);
    upper.add(shoulder);
    ellipsoid(shoulder, cloth, [0.077, 0.09, 0.083], side * 0.013, -0.043, 0);
    taper(shoulder, 0.067, 0.062, 0.181, cloth, -0.108);
    taper(shoulder, 0.063, 0.063, 0.022, clothShade, -0.194);
    const elbow = new THREE.Group();
    elbow.position.y = -0.225;
    shoulder.add(elbow);
    ellipsoid(elbow, skin, [0.052, 0.055, 0.052], 0, 0, 0);
    taper(elbow, 0.051, 0.037, 0.176, skin, -0.085);
    ellipsoid(elbow, skin, [0.042, 0.063, 0.037], 0, -0.204, 0.005);
    ellipsoid(elbow, skinShade, [0.019, 0.029, 0.021], -side * 0.031, -0.193, 0.018);
    if (side === -1) {
      taper(elbow, 0.039, 0.039, 0.021, strap, -0.156);
      mesh(elbow, roundedBox(0.034, 0.028, 0.012, 0.005), dark, -0.005, -0.156, 0.038);
    }
    arms.push({ shoulder, elbow, side });
  }

  const legs: Array<{ hip: THREE.Group; knee: THREE.Group; ankle: THREE.Group; side: number }> = [];
  for (const side of [-1, 1]) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.102, 0.86, 0);
    hips.add(hip);
    taper(hip, 0.084, 0.068, 0.37, pants, -0.181);
    tube(hip, [[side * 0.078, -0.025, 0], [side * 0.073, -0.18, 0.004],
      [side * 0.065, -0.354, 0.001]], 0.0024, seam);
    const knee = new THREE.Group();
    knee.position.y = -0.39;
    hip.add(knee);
    ellipsoid(knee, pants, [0.068, 0.079, 0.068], 0, 0.004, 0.004);
    taper(knee, 0.067, 0.052, 0.342, pants, -0.176);
    taper(knee, 0.055, 0.055, 0.033, seam, -0.342);
    const ankle = new THREE.Group();
    ankle.position.y = -0.38;
    knee.add(ankle);
    mesh(ankle, roundedBox(0.14, 0.105, 0.255, 0.034), leather, 0, -0.035, 0.045);
    mesh(ankle, roundedBox(0.146, 0.032, 0.265, 0.013), sole, 0, -0.094, 0.045);
    mesh(ankle, roundedBox(0.124, 0.111, 0.128, 0.026), leather, 0, 0.018, -0.013);
    for (let row = 0; row < 3; row += 1) {
      tube(ankle, [[-0.036, 0.027 - row * 0.016, 0.058 + row * 0.016],
        [0.033, 0.022 - row * 0.016, 0.061 + row * 0.016]], 0.0027, clothShade);
    }
    legs.push({ hip, knee, ankle, side });
  }

  let lastTime: number | null = null;
  let motion = 0;
  let smoothedGrade = 0;
  let restPhase = 0;
  // Rules emit alternating footfalls at .36, 1.08, 1.80 ... metres. One
  // complete left/right cycle is 1.44 m; the quarter-cycle offset aligns them.
  const strideLength = 1.44;

  function pose(options: MountainHikerPose): void {
    if (disposed) return;
    const time = Number.isFinite(options.time) ? options.time : (lastTime ?? 0);
    const dt = lastTime === null ? 1 / 60 : clamp(time - lastTime, 0, 0.08);
    lastTime = time;
    const distance = Number.isFinite(options.distance) ? options.distance : 0;
    const speed = Math.abs(Number.isFinite(options.speed) ? options.speed : 0);
    const targetMotion = smooth(clamp(speed / 0.55, 0, 1));
    const damping = 1 - Math.exp(-dt * 10);
    motion += (targetMotion - motion) * damping;
    smoothedGrade += (clamp(Number.isFinite(options.grade) ? options.grade : 0, -0.55, 0.7) - smoothedGrade) * damping;
    const phase = distance / strideLength + 0.25;
    if (motion > 0.02) restPhase = phase;
    const gaitPhase = motion > 0.02 ? phase : restPhase;
    const secondary = options.reduced ? 0 : 1;
    const breath = Math.sin(time * 1.55) * 0.0015 * (1 - motion) * secondary;
    const feet = legs.map((_leg, index) => {
      const cycle = fractional(gaitPhase + index * 0.5);
      const stance = 0.5;
      let z: number;
      let lift = 0;
      let roll = 0;
      if (cycle < stance) {
        const progress = cycle / stance;
        // During stance, .72 m of local foot travel cancels .72 m of forward
        // motion. The scene therefore gets planted feet rather than skating.
        z = 0.36 * (1 - 2 * progress);
        roll = -0.105 * Math.exp(-progress * 17) +
          0.13 * smooth(clamp((progress - 0.78) / 0.22, 0, 1));
      } else {
        const progress = (cycle - stance) / (1 - stance);
        z = -0.36 + 0.72 * smooth(progress);
        lift = Math.sin(progress * Math.PI) * (0.115 + Math.max(0, smoothedGrade) * 0.06);
        roll = Math.sin(progress * Math.PI) * 0.12;
      }
      z *= motion;
      return { z, y: 0.11 + smoothedGrade * z + lift * motion,
        roll: roll * motion };
    });
    let hipHeight = 0.86;
    feet.forEach(foot => {
      // The pelvis lowers through the long, split stance and rises as a foot
      // passes beneath it. Both legs constrain its height at the exchange of
      // support, avoiding a jump when the rear foot leaves a sloping trail.
      const maximumHeight = foot.y + Math.sqrt(Math.max(0.01, 0.76 * 0.76 - foot.z * foot.z));
      hipHeight = Math.min(hipHeight, maximumHeight);
    });
    hips.position.y = hipHeight - 0.86;
    upper.position.y = hipHeight + breath;
    upper.rotation.set(0.025 + smoothedGrade * 0.26 * motion,
      Math.sin(gaitPhase * TAU) * 0.027 * motion * secondary,
      Math.sin(gaitPhase * TAU) * 0.018 * motion * secondary);
    head.rotation.x = -smoothedGrade * 0.15 * motion;
    pack.rotation.x = Math.sin(gaitPhase * TAU * 2 - 0.5) * 0.012 * motion * secondary;
    pack.rotation.z = Math.sin(gaitPhase * TAU - 0.3) * 0.017 * motion * secondary;

    legs.forEach((leg, index) => {
      const foot = feet[index];
      const footZ = foot.z;
      const down = hipHeight - foot.y;
      const reach = clamp(Math.hypot(down, footZ), 0.05, 0.769);
      const first = 0.39, second = 0.38;
      const hipAngle = Math.atan2(footZ, down) +
        Math.acos(clamp((first * first + reach * reach - second * second) / (2 * first * reach), -1, 1));
      const kneeAngle = Math.PI -
        Math.acos(clamp((first * first + second * second - reach * reach) / (2 * first * second), -1, 1));
      leg.hip.rotation.x = -hipAngle;
      leg.knee.rotation.x = kneeAngle;
      leg.ankle.rotation.x = -Math.atan(smoothedGrade) + foot.roll - leg.hip.rotation.x - kneeAngle;
      const arm = arms[index];
      arm.shoulder.rotation.x = footZ * 0.85 + 0.055;
      arm.shoulder.rotation.z = arm.side * (0.065 + motion * 0.015);
      arm.elbow.rotation.x = -0.13 - 0.12 * motion - Math.max(0, footZ) * 0.3;
    });
  }

  // Install the neutral, slightly flexed stance without touching the caller's group.
  pose({ distance: 0, speed: 0, grade: 0, time: 0, reduced: true });
  lastTime = null;

  return {
    group,
    update: pose,
    dispose(): void {
      if (disposed) return;
      disposed = true;
      group.clear();
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(surface => surface.dispose());
      textures.forEach(texture => texture.dispose());
    },
  };
}
