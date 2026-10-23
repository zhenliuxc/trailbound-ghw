import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { type TrailHiker } from './hiker';
import type { RouteStopId, WugongTerrain } from './terrain';
import type { EnvironmentFrame } from '../wugong-walk/environment';
import { MeadowVegetation } from './vegetation';
import { type WorldAssets, type Placement } from './assets';
import { WugongForest } from './forest';
import { disposeForestTexture } from './tree-textures';

export type MeadowView = 'follow' | 'overview';
export interface StopProjection { id: RouteStopId; x: number; y: number; visible: boolean }
const clamp = THREE.MathUtils.clamp;
const UP = new THREE.Vector3(0, 1, 0);

export class MeadowScene {
  readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(43, 1, .15, 2800);
  private readonly grass: MeadowVegetation;
  private readonly forest: WugongForest;
  private readonly sun = new THREE.DirectionalLight('#fff3d6', 1.5);
  private readonly skyLight = new THREE.HemisphereLight('#e1e9e3', '#53654c', 1.45);
  private readonly fog = new THREE.Fog('#dce6de', 88, 370);
  private readonly geometries = new Set<THREE.BufferGeometry>();
  private readonly materials = new Set<THREE.Material>();
  private readonly textures = new Set<THREE.Texture>();
  private readonly eye = new THREE.Vector3();
  private readonly target = new THREE.Vector3();
  private readonly nextEye = new THREE.Vector3();
  private readonly nextTarget = new THREE.Vector3();
  private readonly root = new THREE.Vector3();
  private readonly ahead = new THREE.Vector3();
  private readonly before = new THREE.Vector3();
  private readonly scratch = new THREE.Vector3();
  private readonly projection = new THREE.Vector3();
  private readonly overviewBox: THREE.Box3;
  private readonly clouds = new THREE.Group();
  private readonly cloudMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: false,
    uniforms: { color: { value: new THREE.Color('#e9eee2') }, opacity: { value: .13 } },
    vertexShader: 'varying vec3 vNormal;varying vec3 vView;void main(){vec4 p=modelViewMatrix*vec4(position,1.0);vNormal=normalMatrix*normal;vView=-p.xyz;gl_Position=projectionMatrix*p;}',
    fragmentShader: 'uniform vec3 color;uniform float opacity;varying vec3 vNormal;varying vec3 vView;void main(){float edge=pow(max(0.0,dot(normalize(vNormal),normalize(vView))),1.65);gl_FragColor=vec4(color,opacity*edge);\n#include <colorspace_fragment>\n}',
  });
  private readonly rain: THREE.Points;
  private readonly stars: THREE.Points;
  private readonly campLight = new THREE.PointLight('#f2c88a', 0, 18, 1.4);
  private readonly sky: THREE.ShaderMaterial;
  private readonly roadInk: Line2;
  private mode: MeadowView = 'follow';
  private initialized = false;
  private lastHeading = 0;
  private disposed = false;
  private width = 1;
  private height = 1;
  private wind = true;
  private readonly pigment: THREE.CanvasTexture;

  constructor(canvas: HTMLCanvasElement, private readonly terrain: WugongTerrain, private readonly reduced: () => boolean, private readonly hiker: TrailHiker, private readonly assets: WorldAssets) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'default' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.08;
    this.renderer.setClearColor('#dce6de'); this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.scene.fog = this.fog; this.scene.add(this.skyLight);
    this.sun.position.set(-65, 100, 60); this.sun.castShadow = true; this.sun.shadow.mapSize.set(1024, 1024);
    this.sun.shadow.camera.left = this.sun.shadow.camera.bottom = -28; this.sun.shadow.camera.right = this.sun.shadow.camera.top = 28;
    this.sun.shadow.camera.near = .5; this.sun.shadow.camera.far = 210; this.sun.shadow.bias = -.00025; this.sun.shadow.normalBias = .035;
    this.scene.add(this.sun, this.sun.target);
    this.sky = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, toneMapped: false,
      uniforms: { top: { value: new THREE.Color('#c3d8dc') }, bottom: { value: new THREE.Color('#e7ead6') } },
      vertexShader: 'varying float vHeight; void main(){vHeight=position.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader: 'uniform vec3 top;uniform vec3 bottom;varying float vHeight;void main(){gl_FragColor=vec4(mix(bottom,top,clamp(vHeight/1200.0,0.0,1.0)),1.0);\n#include <colorspace_fragment>\n}',
    });
    this.materials.add(this.sky); this.mesh(new THREE.SphereGeometry(2200, 24, 12), this.sky);
    this.pigment = this.createPigment();
    const groundMaterial = this.material('#ffffff', true);
    const backdrop = this.mesh(terrain.geometry(terrain.backdropBounds, 240, 240, false, true), groundMaterial); backdrop.receiveShadow = true;
    const groundGeometry = terrain.nearGeometry(); groundGeometry.computeBoundingBox();
    this.overviewBox = groundGeometry.boundingBox ? groundGeometry.boundingBox.clone() : new THREE.Box3().setFromPoints(terrain.points);
    const ground = this.mesh(groundGeometry, groundMaterial); ground.receiveShadow = true;
    const road = this.mesh(terrain.roadGeometry(1.2, .035), this.material('#ffffff', true)); road.receiveShadow = true;
    const line = new LineGeometry().setPositions(terrain.points.flatMap(point => [point.x, point.y + .08, point.z]));
    const ink = new LineMaterial({ color: '#dfc99f', linewidth: 2.4, transparent: true, opacity: .9, depthWrite: false });
    this.geometries.add(line); this.materials.add(ink); this.roadInk = new Line2(line, ink); this.roadInk.computeLineDistances(); this.scene.add(this.roadInk);
    this.grass = new MeadowVegetation(terrain, this.sun, groundMaterial);
    this.scene.add(this.grass.group, this.hiker.group);
    this.forest = new WugongForest(terrain); this.scene.add(this.forest.group);
    this.addRocks(); this.addCamp(); this.addLandmarks(); this.addClouds();
    this.rain = this.createParticles(420, '#c7d9d4', .045, false); this.stars = this.createParticles(400, '#eee7c9', 1.2, true);
    this.scene.add(this.rain, this.stars, this.clouds, this.campLight);
  }
  get view(): MeadowView { return this.mode; }
  get bladeCount(): number { return this.grass.bladeCount; }
  setView(view: MeadowView): void { this.mode = view; }
  resetWalk(): void { this.initialized = false; this.hiker.reset(); }
  setWind(enabled: boolean): void { this.wind = enabled; this.grass.setWind(enabled); }
  resize(width: number, height: number): void {
    this.width = Math.max(1, width); this.height = Math.max(1, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 600 ? 1.35 : 1.7));
    this.renderer.setSize(this.width, this.height, false); this.camera.aspect = this.width / this.height; this.camera.updateProjectionMatrix();
    this.roadInk.material.resolution.set(this.width, this.height);
  }
  paint(distance: number, speed: number, frame: EnvironmentFrame, dt: number): void {
    if (this.disposed) return;
    this.terrain.sample(distance, this.root); this.terrain.sample(distance + .9, this.ahead); this.terrain.sample(distance - .9, this.before);
    const heading = Math.atan2(this.ahead.x - this.before.x, this.ahead.z - this.before.z);
    if (!this.initialized) this.lastHeading = heading;
    const turn = Math.atan2(Math.sin(heading - this.lastHeading), Math.cos(heading - this.lastHeading));
    this.lastHeading += turn * (1 - Math.exp(-dt * 5));
    this.hiker.group.position.copy(this.root); this.hiker.group.position.y += .042; this.hiker.group.rotation.y = this.lastHeading;
    const grade = (this.ahead.y - this.before.y) / Math.max(.1, Math.hypot(this.ahead.x - this.before.x, this.ahead.z - this.before.z));
    this.hiker.update({ distance, speed, grade, turn, dt, reduced: this.reduced() });
    this.terrain.sample(distance + 2.5, this.nextTarget); this.nextTarget.y += .9;
    const portrait = this.width / this.height < .9;
    if (this.mode === 'follow') {
      this.scratch.copy(this.root).y += 1; this.nextTarget.lerp(this.scratch, .56);
      this.nextEye.copy(this.root).add(this.scratch.set(portrait ? 12 : 13.5, portrait ? 11 : 9.5, portrait ? 22 : 20));
      let clearance = this.nextEye.y;
      for (let i = 1; i <= 5; i++) {
        this.scratch.lerpVectors(this.nextTarget, this.nextEye, i / 5);
        const rise = this.terrain.height(this.scratch.x, this.scratch.z) + 2 - this.scratch.y;
        if (rise > 0) clearance = Math.max(clearance, this.nextEye.y + rise * 5 / i);
      }
      this.nextEye.y = clearance;
    } else this.overviewCamera();
    if (!this.initialized || this.reduced()) { this.eye.copy(this.nextEye); this.target.copy(this.nextTarget); this.initialized = true; }
    else {
      const amount = 1 - Math.exp(-Math.min(.05, dt) * 2.5);
      this.eye.lerp(this.nextEye, amount); this.target.lerp(this.nextTarget, amount);
    }
    this.camera.position.copy(this.eye); this.camera.lookAt(this.target); this.camera.updateMatrixWorld();
    this.atmosphere(frame);
    this.roadInk.visible = this.mode === 'overview';
    this.grass.update(this.root, frame, this.mode === 'overview', this.reduced());
    this.forest.update(this.camera, this.reduced() ? 0 : frame.elapsed, this.wind && !this.reduced() ? frame.wind : 0, frame.night);
    this.renderer.render(this.scene, this.camera);
  }
  projectStops(distance: number): StopProjection[] {
    return this.terrain.stops.map(stop => {
      this.projection.copy(stop.point); this.projection.y += 2.4;
      let visible = this.mode === 'overview' || Math.abs(stop.distance - distance) < 34;
      if (visible && this.mode === 'follow') for (let i = 1; i < 8; i++) {
        this.scratch.lerpVectors(this.eye, this.projection, i / 8);
        if (this.scratch.y < this.terrain.height(this.scratch.x, this.scratch.z) + .4) visible = false;
      }
      this.projection.project(this.camera);
      return { id: stop.id, x: (this.projection.x * .5 + .5) * this.width, y: (-this.projection.y * .5 + .5) * this.height, visible: visible && Math.abs(this.projection.x) < .94 && this.projection.y > -.72 && this.projection.y < .83 && this.projection.z < 1 };
    });
  }
  private overviewCamera(): void {
    this.overviewBox.getCenter(this.nextTarget);
    const direction = (this.width > this.height ? new THREE.Vector3(1.3, 1.1, 1) : new THREE.Vector3(.18, 1.45, 1.2)).normalize();
    const rotation = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(direction, new THREE.Vector3(), UP)).invert();
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov * .5));
    let distance = 0;
    for (const x of [this.overviewBox.min.x, this.overviewBox.max.x]) for (const y of [this.overviewBox.min.y, this.overviewBox.max.y]) for (const z of [this.overviewBox.min.z, this.overviewBox.max.z]) {
      this.scratch.set(x, y, z).sub(this.nextTarget).applyQuaternion(rotation);
      distance = Math.max(distance, Math.abs(this.scratch.x) / (tan * this.camera.aspect) + this.scratch.z, Math.abs(this.scratch.y) / tan + this.scratch.z);
    }
    this.nextEye.copy(this.nextTarget).addScaledVector(direction, distance * 1.12);
  }
  private atmosphere(frame: EnvironmentFrame): void {
    this.sky.uniforms.top.value.set(frame.skyTop); this.sky.uniforms.bottom.value.set(frame.skyBottom);
    this.fog.color.set(frame.skyBottom);
    const overview = this.mode === 'overview', distance = this.eye.distanceTo(this.target);
    this.fog.near = overview ? distance * .8 : 70 - frame.fog * 20; this.fog.far = overview ? distance * 2.2 : 380 - frame.fog * 160;
    this.skyLight.color.set(frame.skyTop); this.skyLight.groundColor.set(frame.night > .5 ? '#596f77' : '#657355'); this.skyLight.intensity = 1.45 - frame.night * .87;
    this.sun.color.set(frame.night > .5 ? '#b6cbd2' : '#fff0ce'); this.sun.intensity = (1.5 - frame.night * 1.25) * (1 - frame.cloud * .24);
    this.sun.position.copy(this.root).add(this.scratch.set(-65 + frame.warmth * 18, 100 - frame.warmth * 52, 60)); this.sun.target.position.copy(this.root);
    this.campLight.intensity = frame.night * 10; this.cloudMaterial.uniforms.color.value.set(frame.skyBottom); this.cloudMaterial.uniforms.opacity.value = .05 + frame.cloud * .13;
    this.clouds.position.x = this.reduced() || !this.wind ? 0 : Math.sin(frame.elapsed * .012) * 5;
    this.rain.visible = frame.rain > .12 && !overview && !this.reduced(); this.rain.position.copy(this.root);
    const positions = this.rain.geometry.getAttribute('position');
    if (this.rain.visible) {
      for (let i = 0; i < positions.count; i++) positions.setY(i, 17 - ((frame.elapsed * 12 + i * .37) % 22));
      positions.needsUpdate = true;
    }
    if (this.rain.material instanceof THREE.PointsMaterial) this.rain.material.opacity = frame.rain * .52;
    this.stars.visible = frame.night > .45 && frame.cloud < .82;
    if (this.stars.material instanceof THREE.PointsMaterial) this.stars.material.opacity = frame.night * (1 - frame.cloud * .5);
  }
  private createPigment(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
    const context = canvas.getContext('2d'); if (!context) throw new Error('无法准备山体纸纹');
    const pixels = context.createImageData(128, 128);
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      const value = 241 + this.terrain.noise.noise(x * .7, y * .7) * 9 + this.terrain.noise.noise(x * .11, y * .11) * 4, i = (y * 128 + x) * 4;
      pixels.data[i] = value; pixels.data[i + 1] = value; pixels.data[i + 2] = value - 2; pixels.data[i + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(110, 110);
    this.textures.add(texture); return texture;
  }
  private material(color: THREE.ColorRepresentation, vertexColors = false): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0, vertexColors, map: this.pigment }); this.materials.add(material); return material;
  }
  private mesh(geometry: THREE.BufferGeometry, material: THREE.Material): THREE.Mesh {
    this.geometries.add(geometry); const mesh = new THREE.Mesh(geometry, material); this.scene.add(mesh); return mesh;
  }
  private box(width: number, height: number, depth: number, x: number, y: number, z: number, material: THREE.Material): THREE.Mesh {
    const mesh = this.mesh(new THREE.BoxGeometry(width, height, depth), material); mesh.position.set(x, y + height / 2, z); mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
  }
  private addRocks(): void {
    const rocks: [Placement[], Placement[]] = [[], []];
    for (let i = 0; i < 290; i++) {
      const road = this.terrain.sample(i / 289 * this.terrain.length), offset = 2.4 + (Math.sin(i * 47.21) * .5 + .5) * 18;
      const x = road.x + Math.sin(i * 8.71) * offset, z = road.z + Math.cos(i * 17.9) * offset;
      if (this.terrain.roadGap(x, z) < 1.7) continue;
      rocks[i % 2].push({ x, y: this.terrain.height(x, z) - .04, z, height: .14 + (Math.sin(i * 71.31) * .5 + .5) ** 3 * 1.25, yaw: i * 1.42 });
    }
    this.scene.add(this.assets.instances('rock-a', rocks[0]), this.assets.instances('rock-b', rocks[1]));
  }
  private addCamp(): void {
    const camp = this.terrain.sample(this.terrain.campDistance), tents: Placement[] = [];
    for (const [dx, dz, height, yaw] of [[3, -4, 1.5, .2], [7, -4, 1.7, -.2], [10, -1, 1.4, -.7], [7, 3, 1.55, 2.8], [3, 4, 1.25, 2.4]]) {
      const x = camp.x + dx, z = camp.z + dz; tents.push({ x, y: this.terrain.height(x, z) + .03, z, height, yaw });
    }
    this.scene.add(this.assets.instances('tent', tents));
    this.scene.add(this.assets.instances('log', [{ x: camp.x + 3, y: this.terrain.height(camp.x + 3, camp.z + 1), z: camp.z + 1, height: .4, yaw: 1.2 }]));
    const wood = this.material('#8f8065'), lantern = new THREE.MeshStandardMaterial({ color: '#d7c69b', emissive: '#c49655', emissiveIntensity: .65, roughness: 1 }); this.materials.add(lantern);
    const x = camp.x + 5, z = camp.z - .3, y = this.terrain.height(x, z);
    this.box(.08, 1.5, .08, x, y, z, wood); this.box(.3, .4, .3, x, y + 1.4, z, lantern); this.campLight.position.set(x, y + 1.55, z);
  }
  private addLandmarks(): void {
    const stone = this.material('#9da99e'), wood = this.material('#87785d'), roof = this.material('#60716a'), wall = this.material('#cbc8ac'), dark = this.material('#4e6259');
    const start = this.terrain.sample(0), end = this.terrain.sample(this.terrain.length);
    for (const anchor of [start, end]) for (let i = 0; i < 3; i++) {
      const x = anchor.x + 6 + i * 5, z = anchor.z + 1 + Math.sin(i * 3.2) * 5, y = this.terrain.height(x, z), width = 3.4;
      this.box(width, 2.6, 2.7, x, y, z, wall); this.box(.8, 1.5, .05, x, y, z + 1.38, dark);
      this.box(.6, .65, .06, x + 1.1, y + 1.3, z + 1.4, dark);
      const ridge = this.mesh(new THREE.ConeGeometry(2.7, 1.2, 4), roof); ridge.rotation.y = Math.PI / 4; ridge.scale.z = .83; ridge.position.set(x, y + 3.1, z); ridge.castShadow = true;
    }
    const y = end.y;
    this.box(.34, 3.3, .4, end.x - 2.1, y, end.z, wood); this.box(.34, 3.3, .4, end.x + 2.1, y, end.z, wood);
    this.box(5.3, .48, .85, end.x, y + 2.9, end.z, roof); this.box(1.7, .5, .12, end.x, y + 2.25, end.z + .43, wall);
    const summit = this.terrain.sample(this.terrain.summitDistance), bx = summit.x + 2.5, bz = summit.z - 1.2, by = this.terrain.height(bx, bz);
    this.box(2.4, .22, 1.9, bx, by, bz, stone); this.box(1.6, .2, 1.3, bx, by + .22, bz, stone);
    this.box(.9, 2.1, .45, bx, by + .42, bz, stone); this.box(.56, 1.1, .025, bx, by + 1.1, bz + .238, dark);
    const signs = this.terrain.stops.filter(stop => !['start', 'camp', 'summit', 'end'].includes(stop.id)).map(stop => ({ x: stop.point.x + 1.8, y: this.terrain.height(stop.point.x + 1.8, stop.point.z), z: stop.point.z, height: 1.45, yaw: -.5 }));
    this.scene.add(this.assets.instances('signpost', signs));
  }
  private addClouds(): void {
    const geometry = new THREE.SphereGeometry(1, 24, 16); this.geometries.add(geometry); this.materials.add(this.cloudMaterial);
    for (let i = 0; i < 26; i++) {
      const road = this.terrain.sample(i / 25 * this.terrain.length), x = road.x - 28 - Math.sin(i * 3.1) * 17, z = road.z - 23 + Math.cos(i * 9.7) * 20;
      const height = this.terrain.height(x, z);
      if (height > 10) continue;
      const cloud = new THREE.Mesh(geometry, this.cloudMaterial); cloud.scale.set(12 + i % 4, 1.1, 7 + i % 3); cloud.position.set(x, height + 2.2, z); this.clouds.add(cloud);
    }
  }
  private createParticles(count: number, color: string, size: number, stars: boolean): THREE.Points {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = Math.sin(i * 177.3) * (stars ? 750 : 18);
      positions[i * 3 + 1] = stars ? 270 + (Math.cos(i * 23.4) * .5 + .5) * 450 : i % 20;
      positions[i * 3 + 2] = Math.cos(i * 137.7) * (stars ? 750 : 18);
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); this.geometries.add(geometry);
    const material = new THREE.PointsMaterial({ color, size, transparent: true, opacity: .5, depthWrite: false, fog: !stars }); this.materials.add(material);
    return new THREE.Points(geometry, material);
  }
  dispose(): void {
    if (this.disposed) return; this.disposed = true;
    this.grass.dispose(); this.hiker.dispose();
    this.scene.traverse(object => { if (object instanceof THREE.InstancedMesh) object.dispose(); });
    this.geometries.forEach(geometry => geometry.dispose()); this.materials.forEach(material => material.dispose()); this.textures.forEach(texture => texture.dispose());
    this.forest.dispose(); disposeForestTexture();
    this.assets.dispose(); this.sun.shadow.dispose(); this.scene.clear(); this.renderer.dispose();
  }
}
