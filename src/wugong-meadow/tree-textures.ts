import * as THREE from 'three';

let leaves: THREE.Texture | null = null;
export async function loadForestTexture(signal: AbortSignal): Promise<void> {
  const response = await fetch('textures/wugong-tree-leaves-v1.png', { signal });
  if (!response.ok) throw new Error('林间叶片暂时无法读取');
  const bitmap = await createImageBitmap(await response.blob());
  if (signal.aborted) { bitmap.close(); return; }
  leaves = new THREE.Texture(bitmap); leaves.colorSpace = THREE.SRGBColorSpace; leaves.needsUpdate = true;
}
export function getLeafTexture(): THREE.Texture {
  if (!leaves) throw new Error('林间叶片尚未展开');
  return leaves;
}
// EZ-Tree supplies branching and leaf geometry; the scene uses its own matte bark.
export function getBarkTexture(): null { return null; }
export function disposeForestTexture(): void {
  if (leaves?.image instanceof ImageBitmap) leaves.image.close();
  leaves?.dispose(); leaves = null;
}
