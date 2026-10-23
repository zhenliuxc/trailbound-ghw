import * as THREE from 'three';
import type { ImageCache } from '../contracts';
import type { MountainWalkState } from './rules';
import { groundHeight, sampleWalk, WALK_LENGTH } from './world';
import { buildMountainWorld } from './terrain';
import { createMountainHiker } from './hiker';

export const MOUNTAIN_MATERIAL_ATLAS = 'textures/tiger-mountain-materials-v1.webp';
export interface MountainEngine { paint(state: MountainWalkState): void; capture(state: MountainWalkState): string | null; dispose(): void }
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const smooth = (v: number) => { const t = clamp(v, 0, 1); return t * t * (3 - 2 * t); };

/** Loaded as a separate ES module only when this walking chapter is entered. */
export async function createMountainScene(host: HTMLElement, cache: ImageCache | undefined,
  cancelled: () => boolean, onLost: () => void): Promise<MountainEngine | null> {
  if (cancelled()) return null;
  const request = cache?.request(MOUNTAIN_MATERIAL_ATLAS, 'high');
  const asset = request ? await request.promise : null;
  if (cancelled()) return null;
  if (!asset || asset.state !== 'ready') throw new Error('Mountain watercolor material could not load');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'default', preserveDrawingBuffer: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setClearColor('#e8e9dc');
  renderer.domElement.className = 'mini-game-canvas mountain-walk-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e8e9dc');
  scene.fog = new THREE.Fog('#e8e9dc', 105, 480);
  const camera = new THREE.PerspectiveCamera(55, 1, .12, 1100);
  const light = new THREE.HemisphereLight('#fffae8', '#7c918f', 2.25);
  const sun = new THREE.DirectionalLight('#fff0d4', 2.05); sun.position.set(-45, 160, 80);
  scene.add(light, sun);
  const ownedTextures: THREE.Texture[] = [];
  const contactCanvas = document.createElement('canvas'); contactCanvas.width = contactCanvas.height = 64;
  const contactContext = contactCanvas.getContext('2d');
  if (contactContext) {
    const wash = contactContext.createRadialGradient(32, 32, 1, 32, 32, 30);
    wash.addColorStop(0, 'rgba(37,51,42,.28)'); wash.addColorStop(1, 'rgba(37,51,42,0)');
    contactContext.fillStyle = wash; contactContext.fillRect(0, 0, 64, 64);
  }
  const contactTexture = new THREE.CanvasTexture(contactCanvas); ownedTextures.push(contactTexture);
  const contactMaterial = new THREE.MeshBasicMaterial({ map: contactTexture, transparent: true, depthWrite: false });
  const contactGeometry = new THREE.PlaneGeometry(1.65, 1.65);
  const contact = new THREE.Mesh(contactGeometry, contactMaterial); contact.rotation.x = -Math.PI / 2; scene.add(contact);
  let disposed = false, ready = false, lastAge = -1, width = 0, height = 0;
  let lastState: MountainWalkState | null = null;
  let world: ReturnType<typeof buildMountainWorld> | null = null;
  let hiker: ReturnType<typeof createMountainHiker> | null = null;
  let observer: ResizeObserver | null = null;
  const cameraTarget = new THREE.Vector3(), desiredTarget = new THREE.Vector3(), desiredEye = new THREE.Vector3();
  const eyeDirection = new THREE.Vector3(), quaternion = new THREE.Quaternion(), yawAxis = new THREE.Vector3(0, 1, 0);
  const lookSpherical = new THREE.Spherical();
  const loss = (event: Event) => { event.preventDefault(); dispose(); onLost(); };

  function dispose() {
    if (disposed) return; disposed = true;
    observer?.disconnect(); observer = null;
    renderer.domElement.removeEventListener('webglcontextlost', loss);
    hiker?.dispose(); hiker = null; world?.dispose(); world = null;
    for (const texture of ownedTextures) texture.dispose(); ownedTextures.length = 0;
    contactGeometry.dispose(); contactMaterial.dispose();
    renderer.dispose();
    try { if (!renderer.getContext().isContextLost()) renderer.forceContextLoss(); } catch { /* Context release is optional on unsupported browsers. */ }
    renderer.domElement.remove(); lastState = null;
  }
  function resize() {
    if (disposed) return;
    const rect = host.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const w = Math.round(rect.width), h = Math.round(rect.height);
    if (w === width && h === height) return;
    width = w; height = h;
    const resolution = Math.min(1.75, globalThis.devicePixelRatio || 1, Math.sqrt(2200000 / (w * h)));
    renderer.setPixelRatio(Math.max(.7, resolution)); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = w / h < .8 ? 62 : 55; camera.updateProjectionMatrix();
    if (lastState && ready) paint(lastState);
  }
  function atlasTile(image: HTMLImageElement, column: number, row: number) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
    const context = canvas.getContext('2d'); if (!context) return undefined;
    const iw = image.naturalWidth / 2, ih = image.naturalHeight / 2;
    context.drawImage(image, column * iw + 3, row * ih + 3, iw - 6, ih - 6, 0, 0, 512, 512);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    ownedTextures.push(texture); return texture;
  }

  function paint(state: MountainWalkState) {
    if (disposed || !ready || !world || !hiker) return;
    lastState = state;
    const initial = lastAge < 0 || state.age < lastAge;
    const elapsed = initial ? 0 : clamp(state.age - lastAge, 0, .1);
    lastAge = state.age;
    const progress = state.distance / WALK_LENGTH, reveal = smooth((progress - .38) / .5);
    const pose = state.pose, position = pose.position, forwardX = Math.sin(pose.heading), forwardZ = Math.cos(pose.heading);
    const behind = sampleWalk(Math.max(0, state.distance - 8.5)).position;
    const ahead = sampleWalk(Math.min(WALK_LENGTH, state.distance + 8)).position;
    const portrait = camera.aspect < .8;
    const backfill = Math.max(0, 8.5 - state.distance);
    desiredEye.set(behind.x - forwardX * backfill - .8, behind.y + 4.2 + reveal * 11.8, behind.z - forwardZ * backfill);
    desiredEye.y = Math.max(desiredEye.y, groundHeight(desiredEye.x, desiredEye.z) + 2.1);
    // Early framing keeps both the small traveller and the path readable. The
    // shoulder's real volume occludes the gorge until the route clears it.
    const gaze = portrait ? 20 : 33;
    desiredTarget.set(ahead.x + reveal * gaze, ahead.y + .8 - reveal * 30, ahead.z);
    if (state.reached) {
      desiredEye.set(position.x - 7.5, position.y + 16, position.z + 9);
      desiredTarget.set(position.x + (portrait ? 24 : 43), position.y - 36, position.z - 14);
    }
    // Limited look angles offer a glance around without orbiting through the
    // mountain or revealing the back of distant painted ridges.
    eyeDirection.copy(desiredTarget).sub(desiredEye); lookSpherical.setFromVector3(eyeDirection);
    lookSpherical.theta += state.look.yaw; lookSpherical.phi = clamp(lookSpherical.phi + state.look.pitch, .3, 2.65);
    eyeDirection.setFromSpherical(lookSpherical); desiredTarget.copy(desiredEye).add(eyeDirection);
    const alpha = initial || state.play.reduced ? 1 : 1 - Math.exp(-Math.max(1 / 120, elapsed) * 3.1);
    camera.position.lerp(desiredEye, alpha);
    camera.position.y = Math.max(camera.position.y, groundHeight(camera.position.x, camera.position.z) + 1.3);
    cameraTarget.lerp(desiredTarget, alpha); camera.lookAt(cameraTarget);
    hiker.group.position.set(position.x, position.y + .085, position.z);
    contact.position.set(position.x, position.y + .092, position.z);
    contact.rotation.set(-Math.PI / 2, 0, -pose.heading);
    quaternion.setFromAxisAngle(yawAxis, pose.heading);
    if (initial || state.play.reduced) hiker.group.quaternion.copy(quaternion);
    else hiker.group.quaternion.slerp(quaternion, 1 - Math.exp(-Math.max(elapsed, 1 / 120) * 8));
    hiker.update({ distance: state.distance, speed: state.speed, grade: pose.grade, time: state.age, reduced: !!state.play.reduced });
    world.update(state.age, !!state.play.reduced);
    renderer.render(scene, camera);
  }
  function capture(state: MountainWalkState): string | null {
    if (disposed || !ready) return null;
    paint(state);
    try {
      const source = renderer.domElement;
      for (const side of [960, 800, 640, 480]) {
        const factor = Math.min(1, side / Math.max(source.width, source.height));
        const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(source.width * factor)); canvas.height = Math.max(1, Math.round(source.height * factor));
        const context = canvas.getContext('2d'); if (!context) return null;
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        for (const format of ['image/webp', 'image/jpeg']) {
          const url = canvas.toDataURL(format, .76);
          if (url.length <= 300000 && /^data:image\/(?:webp|jpeg|png);base64,/.test(url)) return url;
        }
      }
    } catch { /* The view stays readable when capture is unavailable. */ }
    return null;
  }

  try {
    if (cancelled()) { dispose(); return null; }
    const rock = atlasTile(asset.image, 0, 0);
    const ground = atlasTile(asset.image, 1, 0);
    const grass = atlasTile(asset.image, 0, 1);
    const farRock = atlasTile(asset.image, 1, 1);
    world = buildMountainWorld({ rock, ground, grass, farRock }); hiker = createMountainHiker();
    scene.add(world.group, hiker.group);
    if (cancelled()) { dispose(); return null; }
    renderer.domElement.addEventListener('webglcontextlost', loss);
    host.appendChild(renderer.domElement); resize();
    if (globalThis.ResizeObserver) { observer = new ResizeObserver(resize); observer.observe(host); }
    ready = true;
    return { paint, capture, dispose };
  } catch (error) { dispose(); throw error; }
}
