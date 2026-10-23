import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { GLTF } from 'three/addons/loaders/GLTFLoader.js';
import type { ImageCache } from '../contracts';
import type { MountainWalkState } from './rules';
import type { MountainEngine } from './scene-three';
import { sampleWalk, WALK_LENGTH } from './world';

/** Paths and metre conventions come from art/mountain-slice/slice-v1.json. */
const ENVIRONMENT_FILE = 'models/tiger-walk-environment-v1.glb';
const CHARACTER_FILE = 'models/tiger-hiker-v1.glb';
const REQUIRED_ENVIRONMENT_NODES = ['TerrainNear', 'PathSurface', 'CliffShoulder', 'River', 'FarRidges', 'Foliage'];
const DEFAULT_STRIDE_METRES = 1.44;
const clamp = (value: number, low: number, high: number): number => Math.max(low, Math.min(high, value));
const smooth = (value: number): number => { const t = clamp(value, 0, 1); return t * t * (3 - 2 * t); };
const mix = (from: number, to: number, amount: number): number => from + (to - from) * amount;
type RenderMesh = THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
interface FlowTexture { texture: THREE.Texture; x: number; y: number; speed: number }
interface FoamMotion { mesh: RenderMesh; origin: THREE.Vector3; direction: THREE.Vector3; materials: { material: THREE.Material; opacity: number }[]; phase: number }
interface RootLock { node: THREE.Object3D; x: number; z: number }

function materialsOf(mesh: RenderMesh): THREE.Material[] { return Array.isArray(mesh.material) ? mesh.material : [mesh.material]; }
function nodeNamed(root: THREE.Object3D, name: string): THREE.Object3D | null {
  let match: THREE.Object3D | null = null;
  root.traverse(node => { if (!match && (node.name === name || node.name.startsWith(name + '_'))) match = node; });
  return match;
}
function meshesOf(node: THREE.Object3D | null): RenderMesh[] {
  const meshes: RenderMesh[] = [];
  node?.traverse(child => { if ((child as THREE.Mesh).isMesh) meshes.push(child as RenderMesh); });
  return meshes;
}
function visibleMesh(mesh: RenderMesh): boolean {
  for (let node: THREE.Object3D | null = mesh; node; node = node.parent) if (!node.visible) return false;
  return !!mesh.geometry.getAttribute('position') && materialsOf(mesh).some(material => material.visible && material.opacity > .02);
}
function clipNamed(clips: THREE.AnimationClip[], name: 'Walk' | 'WalkUphill' | 'Idle'): THREE.AnimationClip | null {
  const accepted = name === 'Walk' ? ['walk', 'walking', 'walkcycle'] : name === 'WalkUphill' ? ['walkuphill', 'uphillwalk'] : ['idle', 'standingidle'];
  return clips.find(clip => accepted.includes(clip.name.split(/[|:]/).pop()!.replace(/[\s_-]/g, '').toLowerCase()) && clip.duration > 0 && clip.tracks.length > 0) || null;
}

/**
 * This is deliberately a separate, inactive renderer until the authored GLBs
 * are available. Missing models, visible road or walking animation are errors;
 * this module never substitutes the earlier procedural person or landscape.
 */
export async function createAuthoredMountainScene(host: HTMLElement, _cache: ImageCache | undefined,
  cancelled: () => boolean, onLost: () => void): Promise<MountainEngine | null> {
  if (cancelled()) return null;
  const aborter = new AbortController();
  const manager = new THREE.LoadingManager();
  const loader = new GLTFLoader(manager);
  const loaded = new Set<GLTF>();
  const disposedAssets = new WeakSet<GLTF>();
  const disposedGeometries = new WeakSet<THREE.BufferGeometry>();
  const disposedMaterials = new WeakSet<THREE.Material>();
  const disposedTextures = new WeakSet<THREE.Texture>();
  const disposedSkeletons = new WeakSet<THREE.Skeleton>();
  const closedBitmaps = new WeakSet<object>();
  const ownedMaterials: THREE.Material[] = [];
  const ownedTextures: THREE.Texture[] = [];
  const flow: FlowTexture[] = [];
  const foam: FoamMotion[] = [];
  let disposed = false, ready = false, renderer: THREE.WebGLRenderer | null = null;
  let observer: ResizeObserver | null = null, loadTimer: ReturnType<typeof setTimeout> | null = null;
  let cancelPoll: ReturnType<typeof setInterval> | null = null;
  let mixer: THREE.AnimationMixer | null = null, character: THREE.Group | null = null;
  let lastState: MountainWalkState | null = null, lastAge = -1, width = 0, height = 0;
  let walkAction: THREE.AnimationAction | null = null, uphillAction: THREE.AnimationAction | null = null, idleAction: THREE.AnimationAction | null = null;
  let walkClip: THREE.AnimationClip | null = null, uphillClip: THREE.AnimationClip | null = null;
  let rootLocks: RootLock[] = [], movementWeight = 0, uphillWeight = 0;
  let strideMetres = DEFAULT_STRIDE_METRES;
  let pathMeshes: RenderMesh[] = [], groundMeshes: RenderMesh[] = [], collisionMeshes: RenderMesh[] = [];
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e9e8dd');
  scene.fog = new THREE.Fog('#e9e8dd', 95, 540);
  const camera = new THREE.PerspectiveCamera(52, 1, .12, 1200);
  const walker = new THREE.Group(); walker.name = 'AuthoredLocomotion'; scene.add(walker);
  const hemisphere = new THREE.HemisphereLight('#fff7e8', '#84918c', 1.55);
  const sun = new THREE.DirectionalLight('#fff0db', 2.1);
  sun.position.set(-66, 112, 104); sun.target.position.set(-28, 30, 60);
  sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -34; sun.shadow.camera.right = 34;
  sun.shadow.camera.top = 38; sun.shadow.camera.bottom = -38;
  sun.shadow.camera.near = 15; sun.shadow.camera.far = 190;
  sun.shadow.bias = -.00015; sun.shadow.normalBias = .025; sun.shadow.radius = 2;
  scene.add(hemisphere, sun, sun.target);
  const down = new THREE.Vector3(0, -1, 0), up = new THREE.Vector3(0, 1, 0);
  const surfaceRay = new THREE.Raycaster(), collisionRay = new THREE.Raycaster();
  const surfaceNormal = new THREE.Vector3(), surfaceNormalMatrix = new THREE.Matrix3();
  const rayOrigin = new THREE.Vector3(), direction = new THREE.Vector3(), bodyTarget = new THREE.Vector3();
  const desiredEye = new THREE.Vector3(), desiredTarget = new THREE.Vector3(), cameraTarget = new THREE.Vector3();
  const candidateEye = new THREE.Vector3(), chosenEye = new THREE.Vector3(), lookVector = new THREE.Vector3();
  const spherical = new THREE.Spherical(), desiredRotation = new THREE.Quaternion();

  function closeImage(value: unknown): void {
    if (Array.isArray(value)) { for (const image of value) closeImage(image); return; }
    if (!value || typeof value !== 'object' || closedBitmaps.has(value)) return;
    if (typeof ImageBitmap !== 'undefined' && value instanceof ImageBitmap) {
      closedBitmaps.add(value); value.close();
    }
  }
  function releaseTexture(texture: THREE.Texture): void {
    if (disposedTextures.has(texture)) return;
    disposedTextures.add(texture); texture.dispose(); closeImage(texture.source?.data);
  }
  function releaseMaterial(material: THREE.Material): void {
    if (disposedMaterials.has(material)) return;
    disposedMaterials.add(material);
    for (const value of Object.values(material)) if (value instanceof THREE.Texture) releaseTexture(value);
    const uniforms = (material as THREE.ShaderMaterial).uniforms;
    if (uniforms) for (const uniform of Object.values(uniforms)) if (uniform.value instanceof THREE.Texture) releaseTexture(uniform.value);
    material.dispose();
  }
  function releaseAsset(asset: GLTF): void {
    if (disposedAssets.has(asset)) return;
    disposedAssets.add(asset); loaded.delete(asset);
    for (const root of asset.scenes) root.traverse(node => {
      const mesh = node as RenderMesh;
      if (!mesh.isMesh) return;
      if (!disposedGeometries.has(mesh.geometry)) { disposedGeometries.add(mesh.geometry); mesh.geometry.dispose(); }
      for (const material of materialsOf(mesh)) releaseMaterial(material);
      const skeleton = (mesh as THREE.SkinnedMesh).skeleton;
      if (skeleton && !disposedSkeletons.has(skeleton)) { disposedSkeletons.add(skeleton); skeleton.dispose(); }
    });
    for (const root of asset.scenes) root.removeFromParent();
    asset.parser.associations.clear();
  }
  function dispose(): void {
    if (disposed) return;
    disposed = true; ready = false; aborter.abort();
    // GLB fetches use their own AbortController. Embedded image decodes can
    // still finish; the post-parse gate below releases those late results.
    if (loadTimer) clearTimeout(loadTimer); loadTimer = null;
    if (cancelPoll) clearInterval(cancelPoll); cancelPoll = null;
    observer?.disconnect(); observer = null;
    mixer?.stopAllAction(); if (mixer && character) mixer.uncacheRoot(character);
    mixer = null; walkAction = uphillAction = idleAction = null;
    for (const asset of [...loaded]) releaseAsset(asset);
    for (const material of ownedMaterials) releaseMaterial(material); ownedMaterials.length = 0;
    for (const texture of ownedTextures) releaseTexture(texture); ownedTextures.length = 0;
    sun.shadow.dispose();
    if (renderer) {
      renderer.domElement.removeEventListener('webglcontextlost', contextLost);
      renderer.renderLists.dispose(); renderer.dispose();
      try { if (!renderer.getContext().isContextLost()) renderer.forceContextLoss(); } catch { /* Some browsers expose no context release extension. */ }
      renderer.domElement.remove(); renderer = null;
    }
    scene.clear(); rootLocks = []; flow.length = 0; foam.length = 0; pathMeshes = groundMeshes = collisionMeshes = []; lastState = null; character = null;
  }
  function contextLost(event: Event): void { event.preventDefault(); dispose(); onLost(); }
  function failWhileOpen(message: string): void {
    if (disposed) return;
    console.warn(message); dispose(); onLost();
  }
  async function model(file: string): Promise<GLTF> {
    const url = new URL(file, document.baseURI);
    const response = await fetch(url.href, { signal: aborter.signal, cache: 'no-cache' });
    if (!response.ok) throw new Error('Authored mountain asset unavailable: ' + file + ' (' + response.status + ')');
    const buffer = await response.arrayBuffer();
    if (cancelled() || disposed) throw new DOMException('Mountain chapter closed', 'AbortError');
    const asset = await loader.parseAsync(buffer, new URL('.', url).href);
    if (cancelled() || disposed || aborter.signal.aborted) {
      releaseAsset(asset); throw new DOMException('Mountain chapter closed', 'AbortError');
    }
    loaded.add(asset); return asset;
  }
  function checkTextures(asset: GLTF): void {
    for (const mesh of meshesOf(asset.scene)) for (const material of materialsOf(mesh)) {
      const association = asset.parser.associations.get(material);
      const source = association?.materials === undefined ? null : asset.parser.json.materials?.[association.materials];
      const standard = material as THREE.MeshStandardMaterial;
      if (source?.pbrMetallicRoughness?.baseColorTexture && !standard.map) throw new Error('Authored material base-colour image failed: ' + material.name);
      if (source?.normalTexture && !standard.normalMap) throw new Error('Authored material normal image failed: ' + material.name);
      if (source?.emissiveTexture && !standard.emissiveMap) throw new Error('Authored material emissive image failed: ' + material.name);
    }
  }
  function surfaceAt(x: number, z: number, referenceY: number, meshes: RenderMesh[], reach = 16): THREE.Intersection | null {
    rayOrigin.set(x, referenceY + 4, z);
    surfaceRay.set(rayOrigin, down); surfaceRay.near = .001; surfaceRay.far = reach;
    return surfaceRay.intersectObjects(meshes, false).find(hit => {
      if (!hit.face) return false;
      surfaceNormalMatrix.getNormalMatrix(hit.object.matrixWorld);
      return surfaceNormal.copy(hit.face.normal).applyNormalMatrix(surfaceNormalMatrix).y > .12;
    }) || null;
  }
  function clearEye(eye: THREE.Vector3, body: THREE.Vector3): boolean {
    direction.copy(eye).sub(body); const distance = direction.length();
    if (distance < .5) return true;
    collisionRay.set(body, direction.divideScalar(distance)); collisionRay.near = .25; collisionRay.far = distance + .25;
    const hit = collisionRay.intersectObjects(collisionMeshes, false)[0];
    return !hit || hit.distance >= distance - .12;
  }
  function safeEye(eye: THREE.Vector3, body: THREE.Vector3, floorReference: number): void {
    // A camera rail shrinks toward the walker when the authored uphill shelf
    // or a nearby wall leaves too little space. It never climbs a cliff face.
    let found = false;
    for (const fraction of [1, .82, .64, .46, .3, .18]) {
      candidateEye.copy(body).lerp(eye, fraction);
      const floor = surfaceAt(candidateEye.x, candidateEye.z, floorReference, groundMeshes, 14);
      if (!floor || Math.abs(floor.point.y - floorReference) > 2.2) continue;
      candidateEye.y = floor.point.y + 1.85;
      if (clearEye(candidateEye, body)) { chosenEye.copy(candidateEye); found = true; break; }
    }
    if (!found) {
      // The character's visible road is the last safe anchor; this is still
      // measured from the loaded road, rather than a procedural height field.
      chosenEye.copy(body); chosenEye.y = floorReference + 1.85;
      direction.copy(eye).sub(body); direction.y = 0;
      if (direction.lengthSq() > .001) chosenEye.addScaledVector(direction.normalize(), .45);
      const floor = surfaceAt(chosenEye.x, chosenEye.z, floorReference, groundMeshes, 12);
      if (floor) chosenEye.y = floor.point.y + 1.85;
    }
    eye.copy(chosenEye);
  }
  function resize(): void {
    if (disposed || !renderer) return;
    const rect = host.getBoundingClientRect(); if (rect.width <= 0 || rect.height <= 0) return;
    const w = Math.round(rect.width), h = Math.round(rect.height);
    if (width === w && height === h) return;
    width = w; height = h;
    renderer.setPixelRatio(Math.max(.7, Math.min(1.65, globalThis.devicePixelRatio || 1, Math.sqrt(2100000 / (w * h)))));
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = camera.aspect < .8 ? 58 : 52; camera.updateProjectionMatrix();
    if (lastState && ready) paint(lastState);
  }
  function prepareAnimation(asset: GLTF): void {
    character = asset.scene;
    if (!meshesOf(character).some(mesh => (mesh as THREE.SkinnedMesh).isSkinnedMesh)) throw new Error('Authored hiker must contain its reviewed skin and skeleton');
    walkClip = clipNamed(asset.animations, 'Walk');
    if (!walkClip) throw new Error('Authored hiker has no Walk animation; walking chapter cannot start');
    uphillClip = clipNamed(asset.animations, 'WalkUphill');
    const idleClip = clipNamed(asset.animations, 'Idle');
    const declaredStride = walkClip.userData.strideMeters ?? nodeNamed(character, 'TigerHiker')?.userData.strideLength;
    strideMetres = typeof declaredStride === 'number' && Number.isFinite(declaredStride) && declaredStride >= .7 && declaredStride <= 2.3 ? declaredStride : DEFAULT_STRIDE_METRES;
    character.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(character), height = bounds.max.y - bounds.min.y;
    if (height < 1.45 || height > 1.95 || Math.abs(bounds.min.y) > .08) throw new Error('Authored hiker scale or foot origin differs from the 1.7 metre asset contract');
    mixer = new THREE.AnimationMixer(character);
    walkAction = mixer.clipAction(walkClip).setLoop(THREE.LoopRepeat, Infinity).setEffectiveTimeScale(0).setEffectiveWeight(0).play();
    if (uphillClip) uphillAction = mixer.clipAction(uphillClip).setLoop(THREE.LoopRepeat, Infinity).setEffectiveTimeScale(0).setEffectiveWeight(0).play();
    if (idleClip) idleAction = mixer.clipAction(idleClip).setLoop(THREE.LoopRepeat, Infinity).setEffectiveWeight(1).play();
    else console.warn('Authored hiker has no Idle clip; pausing holds the actual walking pose');
    const names = new Set<string>();
    for (const clip of [walkClip, uphillClip]) {
      const name = clip?.userData.rootMotionNode;
      if (typeof name === 'string' && name) names.add(name);
    }
    // Only explicitly declared root-motion nodes may be locked. Other bone
    // translations, including the pelvis's vertical motion, remain untouched.
    rootLocks = [...names].map(name => character!.getObjectByName(name)).filter((node): node is THREE.Object3D => !!node)
      .map(node => ({ node, x: node.position.x, z: node.position.z }));
    walker.add(character);
  }
  function animate(state: MountainWalkState, elapsed: number, initial: boolean): void {
    if (!mixer || !walkAction || !walkClip) return;
    const moving = state.speed > .025 && state.walking && !state.reached ? 1 : 0;
    const alpha = initial ? 1 : 1 - Math.exp(-elapsed * 9);
    movementWeight = mix(movementWeight, moving, alpha);
    uphillWeight = mix(uphillWeight, uphillAction ? smooth((state.pose.grade - .035) / .17) : 0, alpha);
    if (initial) mixer.setTime(0);
    const cycle = ((state.distance / strideMetres) % 1 + 1) % 1;
    // Distance phase remains in lockstep with actual travelled metres, even
    // when slowing uphill, stopping, retrying or capturing the same frame.
    walkAction.time = cycle * walkClip.duration;
    walkAction.setEffectiveWeight(idleAction ? movementWeight * (1 - uphillWeight) : 1 - uphillWeight);
    if (uphillAction && uphillClip) { uphillAction.time = cycle * uphillClip.duration; uphillAction.setEffectiveWeight((idleAction ? movementWeight : 1) * uphillWeight); }
    idleAction?.setEffectiveWeight(1 - movementWeight);
    mixer.update(elapsed);
    for (const lock of rootLocks) { lock.node.position.x = lock.x; lock.node.position.z = lock.z; }
  }
  function paint(state: MountainWalkState): void {
    if (disposed || !ready || !renderer || !character) return;
    if (cancelled()) { dispose(); return; }
    const initial = lastAge < 0 || state.age < lastAge;
    const elapsed = initial ? 0 : clamp(state.age - lastAge, 0, .1);
    lastState = state; lastAge = state.age;
    const pose = state.pose, position = pose.position;
    const foot = surfaceAt(position.x, position.z, position.y, pathMeshes);
    if (!foot) { failWhileOpen('Authored path does not support the current walking position'); return; }
    const floorY = foot.point.y;
    walker.position.set(position.x, floorY + .018, position.z);
    desiredRotation.setFromAxisAngle(up, pose.heading);
    if (initial || state.play.reduced) walker.quaternion.copy(desiredRotation);
    else walker.quaternion.slerp(desiredRotation, 1 - Math.exp(-elapsed * 9));
    animate(state, elapsed, initial);

    const opening = smooth((state.distance - 10) / 11), final = smooth((state.distance - 21) / 9);
    const behindDistance = mix(5.6, 2.65, final), side = .8 + opening * 1.8 + final * 3.1;
    const behind = sampleWalk(Math.max(0, state.distance - behindDistance)).position;
    const ahead = sampleWalk(Math.min(WALK_LENGTH, state.distance + 3.3)).position;
    const backfill = Math.max(0, behindDistance - state.distance);
    desiredEye.set(behind.x - Math.sin(pose.heading) * backfill - side, floorY + 1.85, behind.z - Math.cos(pose.heading) * backfill);
    bodyTarget.set(position.x, floorY + 1.3, position.z);
    safeEye(desiredEye, bodyTarget, floorY);
    // On the final stretch the traveller stays low-left while the gorge takes
    // the frame. Camera elevation stays human-height above visible terrain.
    const portrait = camera.aspect < .8;
    desiredTarget.set(mix(ahead.x, position.x + (portrait ? 23 : 33), opening),
      mix(ahead.y + 1.35, floorY - 6.5, opening), mix(ahead.z, position.z - 11, opening));
    lookVector.copy(desiredTarget).sub(desiredEye); spherical.setFromVector3(lookVector);
    spherical.theta += clamp(state.look.yaw, -.7, .7);
    spherical.phi = clamp(spherical.phi + clamp(state.look.pitch, -.19, .19), .58, 1.95);
    lookVector.setFromSpherical(spherical); desiredTarget.copy(desiredEye).add(lookVector);
    const follow = initial ? 1 : 1 - Math.exp(-elapsed * (state.play.reduced ? 2 : 4));
    camera.position.lerp(desiredEye, follow);
    // Smoothing must not cut through an inside corner of the loaded cliff.
    safeEye(camera.position, bodyTarget, floorY);
    cameraTarget.lerp(desiredTarget, follow); camera.lookAt(cameraTarget);
    for (const texture of flow) {
      texture.texture.offset.x = texture.x + (state.play.reduced ? 0 : Math.sin(state.age * .18) * texture.speed);
      texture.texture.offset.y = texture.y + (state.play.reduced ? 0 : Math.sin(state.age * .13) * texture.speed * .65);
    }
    for (const stroke of foam) {
      const phase = (state.age * .16 + stroke.phase) % 1;
      stroke.mesh.position.copy(stroke.origin).addScaledVector(stroke.direction, state.play.reduced ? 0 : (phase - .5) * 2.4);
      const visibility = state.play.reduced ? 1 : smooth(phase / .14) * smooth((1 - phase) / .14);
      for (const item of stroke.materials) item.material.opacity = item.opacity * visibility;
    }
    renderer.render(scene, camera);
  }
  function capture(state: MountainWalkState): string | null {
    if (disposed || !ready || !renderer) return null;
    paint(state); if (disposed || !renderer) return null;
    try {
      const source = renderer.domElement;
      for (const side of [960, 800, 640, 480]) {
        const scale = Math.min(1, side / Math.max(source.width, source.height));
        const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(source.width * scale)); canvas.height = Math.max(1, Math.round(source.height * scale));
        const context = canvas.getContext('2d'); if (!context) return null;
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        for (const type of ['image/webp', 'image/jpeg']) {
          const url = canvas.toDataURL(type, .76);
          if (url.length <= 300000 && /^data:image\/(?:webp|jpeg|png);base64,/.test(url)) return url;
        }
      }
    } catch { /* Capture failure preserves the chapter and any prior photograph. */ }
    return null;
  }

  try {
    loadTimer = setTimeout(() => aborter.abort(), 30000);
    // cancelled() is a generation gate rather than an AbortSignal. Poll only
    // while loading so closing a chapter also stops its large model fetches.
    cancelPoll = setInterval(() => { if (cancelled()) aborter.abort(); }, 180);
    const results = await Promise.allSettled([model(ENVIRONMENT_FILE), model(CHARACTER_FILE)].map(job => job.catch(error => { aborter.abort(); throw error; })));
    if (loadTimer) clearTimeout(loadTimer); loadTimer = null;
    if (cancelPoll) clearInterval(cancelPoll); cancelPoll = null;
    if (cancelled() || disposed) { dispose(); return null; }
    const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
    const failed = failures.find(result => !(result.reason instanceof DOMException && result.reason.name === 'AbortError')) || failures[0];
    if (failed) throw failed.reason;
    const environment = (results[0] as PromiseFulfilledResult<GLTF>).value;
    const hiker = (results[1] as PromiseFulfilledResult<GLTF>).value;
    for (const name of REQUIRED_ENVIRONMENT_NODES) if (!nodeNamed(environment.scene, name)) throw new Error('Authored environment is missing ' + name);
    checkTextures(environment); checkTextures(hiker);
    environment.scene.updateMatrixWorld(true);
    pathMeshes = meshesOf(nodeNamed(environment.scene, 'PathSurface')).filter(visibleMesh);
    if (!pathMeshes.length) throw new Error('Authored PathSurface has no visible road geometry');
    groundMeshes = [...new Set([...pathMeshes, ...meshesOf(nodeNamed(environment.scene, 'TerrainNear'))])];
    collisionMeshes = [...new Set([...groundMeshes, ...meshesOf(nodeNamed(environment.scene, 'CliffShoulder'))])];
    const riverMeshes = meshesOf(nodeNamed(environment.scene, 'River'));
    for (const mesh of meshesOf(environment.scene)) { mesh.receiveShadow = true; mesh.castShadow = !riverMeshes.includes(mesh); }
    for (const mesh of meshesOf(hiker.scene)) { mesh.castShadow = true; mesh.receiveShadow = true; }
    for (const mesh of riverMeshes) {
      const materials = materialsOf(mesh).map(material => {
        const copy = material.clone() as THREE.MeshStandardMaterial; ownedMaterials.push(material, copy);
        const map = copy.normalMap || (copy.userData.flowMap === true ? copy.map : null);
        if (map) {
          const texture = map.clone(); ownedTextures.push(texture);
          if (copy.normalMap) copy.normalMap = texture; else copy.map = texture;
          flow.push({ texture, x: map.offset.x, y: map.offset.y, speed: .009 });
        }
        return copy;
      });
      mesh.material = Array.isArray(mesh.material) ? materials : materials[0];
      if (mesh.name.startsWith('FoamStroke_') && mesh.parent) {
        const inverse = mesh.parent.matrixWorld.clone().invert();
        const origin = new THREE.Vector3().applyMatrix4(inverse);
        const direction = new THREE.Vector3(0, 0, 1).applyMatrix4(inverse).sub(origin);
        for (const material of materials) { material.transparent = true; material.depthWrite = false; }
        foam.push({ mesh, origin: mesh.position.clone(), direction,
          materials: materials.map(material => ({ material, opacity: material.opacity })), phase: foam.length * .381966 % 1 });
      }
    }
    prepareAnimation(hiker); scene.add(environment.scene); scene.updateMatrixWorld(true);
    if (cancelled()) { dispose(); return null; }
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'default', preserveDrawingBuffer: false });
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.04;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'mini-game-canvas mountain-walk-canvas mountain-authored-canvas';
    renderer.domElement.setAttribute('aria-hidden', 'true'); renderer.domElement.addEventListener('webglcontextlost', contextLost);
    host.appendChild(renderer.domElement); resize();
    if (globalThis.ResizeObserver) { observer = new ResizeObserver(resize); observer.observe(host); }
    ready = true;
    return { paint, capture, dispose };
  } catch (error) {
    dispose();
    if (cancelled() || error instanceof DOMException && error.name === 'AbortError' && !loaded.size) return null;
    throw error;
  }
}
