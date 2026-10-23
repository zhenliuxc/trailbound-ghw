import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';

const clamp = THREE.MathUtils.clamp;
const UP = new THREE.Vector3(0, 1, 0);
const HEIGHT = 1.52;
export const HIKER_ASSET = 'characters/wugong-adventurer-v2.glb';
export interface HikerMotion {
  distance: number; speed: number; grade: number; turn: number; dt: number; reduced: boolean;
}
type Contact = { kind: 'swing'; release?: THREE.Vector3 } | { kind: 'planted'; point: THREE.Vector3; rotation: THREE.Quaternion };
interface BoneRest { bone: THREE.Bone; position: THREE.Vector3; quaternion: THREE.Quaternion; scale: THREE.Vector3 }
interface FootProfile { floor: number; centerZ: number; rangeZ: number }
interface Leg {
  foot: THREE.Bone; lower: THREE.Bone; upper: THREE.Bone;
  effector: THREE.Bone;
  profile: FootProfile; contact: Contact; soleUp: THREE.Vector3;
  reach: number; thighLength: number; calfLength: number;
  sole: THREE.Vector3[]; orientation: THREE.Quaternion; scale: THREE.Vector3;
  desired: THREE.Vector3; animated: THREE.Vector3;
}

function boneNamed(root: THREE.Object3D, name: string): THREE.Bone {
  const bone = root.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(name));
  if (!(bone instanceof THREE.Bone)) throw new Error(`徒步人物缺少骨骼 ${name}`);
  return bone;
}
function clipNamed(asset: GLTF, name: string): THREE.AnimationClip {
  const clip = asset.animations.find(clip => clip.name === name);
  if (!clip || clip.duration <= 0) throw new Error(`徒步人物缺少 ${name} 动画`);
  return clip;
}
function soleVertices(skins: THREE.SkinnedMesh[], foot: THREE.Bone): THREE.Vector3[] {
  const samples: { position: THREE.Vector3; height: number }[] = [];
  for (const mesh of skins) {
    const indices = mesh.geometry.getAttribute('skinIndex'), weights = mesh.geometry.getAttribute('skinWeight');
    for (let i = 0; i < indices.count; i++) {
      let belongs = false;
      for (let j = 0; j < 4; j++) if (weights.getComponent(i, j) > .98 && mesh.skeleton.bones[indices.getComponent(i, j)] === foot) belongs = true;
      if (!belongs) continue;
      const position = mesh.getVertexPosition(i, new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);
      const height = position.y; foot.worldToLocal(position); samples.push({ position, height });
    }
  }
  if (!samples.length) throw new Error(`徒步人物缺少 ${foot.name} 鞋底网格`);
  const unique = new Map<string, THREE.Vector3>();
  for (const sample of samples) unique.set(sample.position.toArray().map(value => Math.round(value * 100000)).join(':'), sample.position);
  return [...unique.values()];
}
function disposeModel(root: THREE.Object3D): void {
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
  const skeletons = new Set<THREE.Skeleton>(), textures = new Set<THREE.Texture>();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    if (object instanceof THREE.SkinnedMesh) skeletons.add(object.skeleton);
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      materials.add(material);
      if (material instanceof THREE.MeshStandardMaterial && material.map) textures.add(material.map);
    }
  });
  geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
  skeletons.forEach(skeleton => skeleton.dispose()); textures.forEach(texture => texture.dispose());
}

/** Authored mesh and clips stay intact; the Three.js IK pass adapts them to the path. */
export class TrailHiker {
  readonly group = new THREE.Group();
  private readonly model: THREE.Group;
  private readonly mixer: THREE.AnimationMixer;
  private readonly idle: THREE.AnimationAction;
  private readonly walk: THREE.AnimationAction;
  private readonly duration: number;
  private readonly rest: BoneRest[] = [];
  private readonly legs: [Leg, Leg];
  private readonly body: THREE.Bone;
  private readonly torso: THREE.Bone;
  private readonly head: THREE.Bone;
  private readonly stride: number;
  private readonly modelScale: number;
  private phase = 0;
  private lastDistance = 0;
  private blend = 0;
  private lean = 0;
  private bodyDrop = 0;
  private disposed = false;
  private readonly local = new THREE.Vector3();
  private readonly groundNormal = new THREE.Vector3();
  private readonly position = new THREE.Vector3();
  private readonly rotation = new THREE.Quaternion();
  private readonly parentRotation = new THREE.Quaternion();
  private readonly correction = new THREE.Quaternion();
  private readonly desiredRotation = new THREE.Quaternion();
  private readonly soleDirection = new THREE.Vector3();
  private readonly kneeDirection = new THREE.Vector3();
  private readonly ankleDirection = new THREE.Vector3();
  private readonly bendAxis = new THREE.Vector3();
  private readonly hip = new THREE.Vector3();
  private readonly knee = new THREE.Vector3();
  private readonly ankle = new THREE.Vector3();
  private readonly targetKnee = new THREE.Vector3();
  private readonly soleMatrix = new THREE.Matrix4();

  constructor(asset: GLTF, private readonly ground: (x: number, z: number) => number) {
    this.group.name = 'wugong-authored-hiker';
    this.model = asset.scene;
    const walkClip = clipNamed(asset, 'Walk'), idleClip = clipNamed(asset, 'Idle');
    this.body = boneNamed(this.model, 'Body'); this.torso = boneNamed(this.model, 'Torso'); this.head = boneNamed(this.model, 'Head');
    const leftFoot = boneNamed(this.model, 'Foot.L'), rightFoot = boneNamed(this.model, 'Foot.R');
    const leftLower = boneNamed(this.model, 'LowerLeg.L'), leftUpper = boneNamed(this.model, 'UpperLeg.L');
    const rightLower = boneNamed(this.model, 'LowerLeg.R'), rightUpper = boneNamed(this.model, 'UpperLeg.R');
    if (leftLower.parent !== leftUpper || rightLower.parent !== rightUpper) throw new Error('徒步人物腿部骨骼版本不匹配');
    const skins: THREE.SkinnedMesh[] = [];
    this.model.traverse(object => {
      if (object instanceof THREE.Bone) this.rest.push({ bone: object, position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone() });
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true; object.receiveShadow = true;
      if (object instanceof THREE.SkinnedMesh) skins.push(object);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (material instanceof THREE.MeshStandardMaterial) { material.roughness = 1; material.metalness = 0; }
      }
    });
    const skin = skins[0];
    if (!skin) throw new Error('徒步人物没有可播放的蒙皮网格');
    this.mixer = new THREE.AnimationMixer(this.model);
    this.idle = this.mixer.clipAction(idleClip).setLoop(THREE.LoopRepeat, Infinity).play();
    this.walk = this.mixer.clipAction(walkClip).setLoop(THREE.LoopRepeat, Infinity).setEffectiveTimeScale(0).setEffectiveWeight(0).play();
    this.duration = walkClip.duration;
    this.mixer.update(0); this.model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.model, true), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
    if (size.y < .1 || size.y > 100) throw new Error('徒步人物尺寸无法识别');
    const scale = HEIGHT / size.y;
    this.modelScale = scale;
    this.model.scale.multiplyScalar(scale);
    this.model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    this.group.add(this.model); this.group.updateMatrixWorld(true);
    const profiles = this.measureWalk(leftFoot, rightFoot);
    this.stride = Math.max(.35, (profiles[0].rangeZ + profiles[1].rangeZ));
    this.restore(); this.walk.setEffectiveWeight(0); this.idle.setEffectiveWeight(1); this.mixer.update(0); this.group.updateMatrixWorld(true);

    const leg = (foot: THREE.Bone, lower: THREE.Bone, upper: THREE.Bone, profile: FootProfile): Leg => {
      // The source rig animates shoe controls below Root, separately from the knee.
      // A virtual ankle measures the connected leg independently of that control.
      const effector = new THREE.Bone(); effector.name = `ground-ankle-${foot.name}`;
      foot.getWorldPosition(effector.position); lower.worldToLocal(effector.position); lower.add(effector);
      foot.getWorldQuaternion(this.rotation);
      const hip = upper.getWorldPosition(new THREE.Vector3()), knee = lower.getWorldPosition(new THREE.Vector3());
      const ankle = effector.getWorldPosition(new THREE.Vector3());
      return {
        foot, lower, upper, effector, profile, contact: { kind: 'swing' },
        reach: hip.distanceTo(knee) + knee.distanceTo(ankle),
        thighLength: hip.distanceTo(knee), calfLength: knee.distanceTo(ankle),
        sole: soleVertices(skins, foot), orientation: new THREE.Quaternion(), scale: foot.getWorldScale(new THREE.Vector3()),
        soleUp: UP.clone().applyQuaternion(this.rotation.clone().invert()),
        desired: new THREE.Vector3(), animated: new THREE.Vector3(),
      };
    };
    this.legs = [leg(leftFoot, leftLower, leftUpper, profiles[0]), leg(rightFoot, rightLower, rightUpper, profiles[1])];
    this.group.updateMatrixWorld(true);
  }
  private restore(): void {
    for (const rest of this.rest) { rest.bone.position.copy(rest.position); rest.bone.quaternion.copy(rest.quaternion); rest.bone.scale.copy(rest.scale); }
  }
  private measureWalk(left: THREE.Bone, right: THREE.Bone): [FootProfile, FootProfile] {
    const samples = [left, right].map(foot => ({ foot, minY: Infinity, minZ: Infinity, maxZ: -Infinity }));
    this.idle.setEffectiveWeight(0); this.walk.setEffectiveWeight(1);
    for (let i = 0; i < 100; i++) {
      this.restore(); this.walk.time = this.duration * i / 100; this.mixer.update(0); this.group.updateMatrixWorld(true);
      for (const sample of samples) {
        sample.foot.getWorldPosition(this.position);
        sample.minY = Math.min(sample.minY, this.position.y); sample.minZ = Math.min(sample.minZ, this.position.z); sample.maxZ = Math.max(sample.maxZ, this.position.z);
      }
    }
    this.walk.time = 0;
    const profile = (sample: typeof samples[number]): FootProfile => ({ floor: Math.max(.008, sample.minY), centerZ: (sample.minZ + sample.maxZ) * .5, rangeZ: sample.maxZ - sample.minZ });
    return [profile(samples[0]), profile(samples[1])];
  }
  reset(): void {
    this.phase = 0; this.lastDistance = 0; this.blend = 0; this.lean = 0; this.bodyDrop = 0;
    this.walk.time = 0; this.idle.time = 0;
    for (const leg of this.legs) leg.contact = { kind: 'swing' };
  }
  update(motion: HikerMotion): void {
    if (this.disposed) return;
    const { dt, speed, grade, reduced } = motion;
    const up = clamp(grade, 0, .85), down = clamp(-grade, 0, .85);
    const strideScale = 1 - up * .33 - down * .29 - Math.min(.5, Math.abs(motion.turn)) * .16;
    const travelled = Math.max(0, motion.distance - this.lastDistance); this.lastDistance = motion.distance;
    this.phase += travelled / (this.stride * strideScale);
    this.blend = THREE.MathUtils.lerp(this.blend, THREE.MathUtils.smoothstep(speed, .03, .22), 1 - Math.exp(-dt * 9));
    this.lean = THREE.MathUtils.lerp(this.lean, (up * .25 - down * .10) * this.blend, 1 - Math.exp(-dt * 5));
    this.restore();
    this.idle.setEffectiveWeight(1 - this.blend); this.walk.setEffectiveWeight(this.blend);
    this.walk.time = (this.phase % 1) * this.duration; this.mixer.update(reduced && speed < .03 ? 0 : dt);
    this.group.updateMatrixWorld(true);
    for (const leg of this.legs) leg.foot.getWorldPosition(leg.animated);
    this.torso.rotateX(this.lean);
    if (!reduced) this.torso.rotateZ(clamp(-motion.turn * .05, -.025, .025) * this.blend);
    this.head.rotateX(-this.lean * .45);
    this.head.rotateY(clamp(motion.turn * .18, -.13, .13));
    this.group.updateMatrixWorld(true);

    let pelvisDrop = 0;
    for (const leg of this.legs) {
      this.local.copy(leg.animated); this.group.worldToLocal(this.local);
      const lift = Math.max(0, this.local.y - leg.profile.floor);
      this.local.z = THREE.MathUtils.lerp(leg.profile.centerZ, this.local.z, strideScale);
      leg.desired.copy(this.local); this.group.localToWorld(leg.desired);
      const grounded = lift < .035 && this.blend > .8 && speed > .15;
      if (leg.contact.kind === 'planted' && (!grounded || leg.contact.point.distanceTo(this.group.position) > .67)) leg.contact = { kind: 'swing', release: leg.contact.point.clone() };
      if (grounded && leg.contact.kind === 'swing') leg.contact = { kind: 'planted', point: leg.desired.clone(), rotation: leg.foot.getWorldQuaternion(new THREE.Quaternion()) };
      if (leg.contact.kind === 'planted') { leg.desired.x = leg.contact.point.x; leg.desired.z = leg.contact.point.z; }
      else if (leg.contact.release) {
        const swing = THREE.MathUtils.smoothstep(lift, .035, .12);
        leg.desired.x = THREE.MathUtils.lerp(leg.contact.release.x, leg.desired.x, swing);
        leg.desired.z = THREE.MathUtils.lerp(leg.contact.release.z, leg.desired.z, swing);
        if (swing === 1 || this.blend < .3) leg.contact = { kind: 'swing' };
      }
      leg.desired.y = this.ground(leg.desired.x, leg.desired.z) + .04 + leg.profile.floor + (grounded ? 0 : lift);
      const x = leg.desired.x, z = leg.desired.z;
      this.groundNormal.set(this.ground(x - .12, z) - this.ground(x + .12, z), .24, this.ground(x, z - .12) - this.ground(x, z + .12)).normalize();
      if (leg.contact.kind === 'planted') this.rotation.copy(leg.contact.rotation);
      else leg.foot.getWorldQuaternion(this.rotation);
      this.soleDirection.copy(leg.soleUp).applyQuaternion(this.rotation);
      this.correction.setFromUnitVectors(this.soleDirection, this.groundNormal);
      this.desiredRotation.copy(this.correction).multiply(this.rotation);
      const contactWeight = THREE.MathUtils.mapLinear(clamp(lift, .035, .14), .035, .14, 1, .75);
      leg.orientation.copy(this.rotation).slerp(this.desiredRotation, contactWeight);
      this.soleMatrix.compose(leg.desired, leg.orientation, leg.scale);
      let clearance = 0;
      for (const sample of leg.sole) {
        this.position.copy(sample).applyMatrix4(this.soleMatrix);
        clearance = Math.max(clearance, this.ground(this.position.x, this.position.z) + .04 + (grounded ? 0 : lift) - this.position.y);
      }
      leg.desired.y += clearance;
      pelvisDrop = Math.min(pelvisDrop, leg.desired.y - leg.animated.y);
      leg.upper.getWorldPosition(this.position);
      const horizontal = Math.hypot(leg.desired.x - this.position.x, leg.desired.z - this.position.z);
      // Leave the knee slightly bent instead of asking a straight chain to stretch.
      const verticalReach = Math.sqrt(Math.max(0, (leg.reach * .96) ** 2 - horizontal ** 2));
      pelvisDrop = Math.min(pelvisDrop, leg.desired.y + verticalReach - this.position.y);
    }
    const supportDrop = Math.max(-.46, pelvisDrop);
    this.bodyDrop = Math.min(supportDrop, THREE.MathUtils.lerp(this.bodyDrop, supportDrop, 1 - Math.exp(-dt * 12)));
    this.body.position.y += this.bodyDrop / this.modelScale;
    this.group.updateMatrixWorld(true);
    for (const leg of this.legs) this.solveLeg(leg);
    for (const leg of this.legs) {
      const parent = leg.foot.parent;
      if (!parent) continue;
      this.position.copy(leg.desired); parent.worldToLocal(this.position); leg.foot.position.copy(this.position);
      parent.getWorldQuaternion(this.parentRotation).invert();
      leg.foot.quaternion.copy(this.parentRotation.multiply(leg.orientation));
    }
    this.group.updateMatrixWorld(true);
  }
  private aimBone(bone: THREE.Bone, from: THREE.Vector3, to: THREE.Vector3): void {
    this.correction.setFromUnitVectors(from.normalize(), to.normalize());
    bone.getWorldQuaternion(this.rotation); this.correction.multiply(this.rotation);
    if (bone.parent) { bone.parent.getWorldQuaternion(this.parentRotation).invert(); this.correction.premultiply(this.parentRotation); }
    bone.quaternion.copy(this.correction); bone.updateMatrixWorld(true);
  }
  private solveLeg(leg: Leg): void {
    leg.upper.getWorldPosition(this.hip); leg.lower.getWorldPosition(this.knee); leg.effector.getWorldPosition(this.ankle);
    this.ankleDirection.subVectors(leg.desired, this.hip);
    const distance = clamp(this.ankleDirection.length(), .02, leg.reach * .995); this.ankleDirection.normalize();
    // A stable forward pole keeps the knee in the walking plane through turns.
    this.group.getWorldQuaternion(this.rotation); this.bendAxis.set(0, 0, 1).applyQuaternion(this.rotation);
    this.bendAxis.addScaledVector(this.ankleDirection, -this.bendAxis.dot(this.ankleDirection)).normalize();
    const along = (leg.thighLength ** 2 - leg.calfLength ** 2 + distance ** 2) / (2 * distance);
    const bend = Math.sqrt(Math.max(0, leg.thighLength ** 2 - along ** 2));
    this.targetKnee.copy(this.hip).addScaledVector(this.ankleDirection, along).addScaledVector(this.bendAxis, bend);
    this.kneeDirection.subVectors(this.knee, this.hip); this.position.subVectors(this.targetKnee, this.hip);
    this.aimBone(leg.upper, this.kneeDirection, this.position);
    leg.lower.getWorldPosition(this.knee); leg.effector.getWorldPosition(this.ankle);
    this.kneeDirection.subVectors(this.ankle, this.knee); this.position.subVectors(leg.desired, this.knee);
    this.aimBone(leg.lower, this.kneeDirection, this.position);
  }
  dispose(): void {
    if (this.disposed) return; this.disposed = true;
    this.mixer.stopAllAction(); this.mixer.uncacheRoot(this.model); disposeModel(this.group); this.group.clear();
  }
}

export async function createTrailHiker(bytes: ArrayBuffer, ground: (x: number, z: number) => number): Promise<TrailHiker> {
  const asset = await new GLTFLoader().parseAsync(bytes, '');
  try { return new TrailHiker(asset, ground); }
  catch (error) { disposeModel(asset.scene); throw error; }
}
