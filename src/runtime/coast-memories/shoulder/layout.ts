import { mix, SCENE, type ShoulderState } from './model';
import { coverCamera } from '../../projection';

export function shoulderCamera(s: ShoulderState, width: number, height: number) {
  const portrait = height > width, reveal = s.cameraProgress;
  const zoom = mix(portrait ? 1.13 : 1.55, 1, reveal);
  const focus = { x: mix(portrait ? 505 : 540, portrait ? 1000 : SCENE.width / 2, reveal), y: mix(710, SCENE.height / 2, reveal) };
  return { ...coverCamera(width, height, SCENE, focus, zoom), portrait };
}
