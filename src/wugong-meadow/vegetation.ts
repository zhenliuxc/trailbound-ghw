import * as THREE from 'three';
import { GrassLayer } from '../vendor/three-stylized/grass/GrassLayer';
import type { WugongTerrain } from './terrain';
import type { EnvironmentFrame } from '../wugong-walk/environment';

/** Add atmosphere and ground pigment without changing the pinned library sources. */
function meadowAtmosphere(material: THREE.ShaderMaterial): void {
  Object.assign(material.uniforms, THREE.UniformsUtils.clone(THREE.UniformsLib.fog));
  material.fog = true;
  material.vertexShader = material.vertexShader
    .replace('#include <common>', '#include <common>\n#include <fog_pars_vertex>')
    .replace('gl_Position = projectionMatrix * viewMatrix * worldPosition;', 'vec4 mvPosition = viewMatrix * worldPosition;\ngl_Position = projectionMatrix * mvPosition;\n#include <fog_vertex>');
  material.fragmentShader = material.fragmentShader
    .replace('#include <common>', '#include <common>\n#include <fog_pars_fragment>')
    .replace('gl_FragColor = vec4(lit * uBrightness, 1.0);', `
      float wash = sin(vWorldPosition.x * 0.19 + sin(vWorldPosition.z * 0.13) * 1.8) * 0.035;
      wash += sin(vWorldPosition.z * 0.37 + vWorldPosition.x * 0.09) * 0.018;
      gl_FragColor = vec4(lit * (uBrightness + wash), 1.0);`)
    .replace('#include <colorspace_fragment>', '#include <colorspace_fragment>\n#include <fog_fragment>');
  material.needsUpdate = true;
}

function uprightMeadow(blades: GrassLayer['blades']): void {
  const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), rotation = new THREE.Quaternion(), scale = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0), normal = new THREE.Vector3(), growth = new THREE.Vector3(), correction = new THREE.Quaternion();
  for (let i = 0; i < blades.count; i++) {
    blades.getMatrixAt(i, matrix); matrix.decompose(position, rotation, scale);
    normal.copy(up).applyQuaternion(rotation);
    growth.copy(up).lerp(normal, .26).normalize();
    correction.setFromUnitVectors(normal, growth); rotation.premultiply(correction);
    matrix.compose(position, rotation, scale); blades.setMatrixAt(i, matrix);
  }
  blades.instanceMatrix.needsUpdate = true;
}

interface Patch { layer: GrassLayer; surface: THREE.BufferGeometry }
export class MeadowVegetation {
  readonly group = new THREE.Group();
  private readonly patches = new Map<string, Patch>();
  private readonly empty = new Set<string>();
  private wind = true;
  private lastLight = -1;
  private readonly size = 24;
  constructor(private readonly terrain: WugongTerrain, private readonly sun: THREE.DirectionalLight, private readonly material: THREE.Material) {}
  get bladeCount(): number { let count = 0; this.patches.forEach(patch => count += patch.layer.bladeCount); return count; }
  setWind(enabled: boolean): void { this.wind = enabled; this.lastLight = -1; }
  update(root: THREE.Vector3, frame: EnvironmentFrame, overview: boolean, reduced: boolean): void {
    this.group.visible = !overview;
    if (overview) return;
    const column = Math.floor(root.x / this.size), row = Math.floor(root.z / this.size), wanted = new Map<string, [number, number]>();
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) wanted.set(`${column + dx}:${row + dz}`, [(column + dx) * this.size, (row + dz) * this.size]);
    for (const [key, patch] of this.patches) if (!wanted.has(key)) {
      this.group.remove(patch.layer); patch.layer.dispose(); patch.surface.dispose(); this.patches.delete(key);
    }
    // One tile per frame keeps a new view from constructing all nine fields at once.
    for (const [key, [x, z]] of wanted) {
      if (this.patches.has(key) || this.empty.has(key)) continue;
      const geometry = this.terrain.patchGeometry(x, z, this.size), coverage = geometry.getAttribute('meadowCoverage');
      let amount = 0; for (let i = 0; i < coverage.count; i++) amount += coverage.getX(i);
      if (amount < 1) { geometry.dispose(); this.empty.add(key); continue; }
      const layer = new GrassLayer({
        surface: new THREE.Mesh(geometry, this.material), coverage: { attribute: 'meadowCoverage' }, density: 34, seed: Math.round(x * 79 + z * 17),
        blade: { minWidth: .065, maxWidth: .125, minHeight: .19, maxHeight: .38, segments: 4, lean: .045 },
        wind: { strength: this.wind ? .032 : 0, speed: .95, frequency: .17, turbulence: .17, lean: this.wind ? .014 : 0, direction: 64 },
        colors: { bottom: '#80936b', top: '#98a778', backlight: '#b6bc8d' },
        lighting: { backlightStrength: .28, backlightPower: 3, backlightTip: .7 }, brightness: .52, shadow: false,
      });
      uprightMeadow(layer.blades); meadowAtmosphere(layer.blades.material); layer.syncDirectionalLight(this.sun);
      this.patches.set(key, { layer, surface: geometry }); this.group.add(layer); this.lastLight = -1; break;
    }
    const lightTick = Math.floor(frame.elapsed * 4);
    for (const patch of this.patches.values()) {
      if (this.lastLight !== lightTick) {
        patch.layer.setOptions({ brightness: .52 * (1 - frame.night * .55), wind: { strength: this.wind && !reduced ? .032 * frame.wind : 0, lean: this.wind && !reduced ? .014 : 0 } });
        patch.layer.syncDirectionalLight(this.sun);
      }
      patch.layer.update(reduced ? 0 : frame.elapsed);
    }
    this.lastLight = lightTick;
  }
  dispose(): void { this.patches.forEach(patch => { patch.layer.dispose(); patch.surface.dispose(); }); this.patches.clear(); this.group.clear(); }
}
