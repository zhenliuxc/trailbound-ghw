import type { MiniInput } from '../contracts';
import type { WestlakeSceneKind } from '../../content/westlake-scenes';

export interface WestlakeRect { x: number; y: number; width: number; height: number }
export interface WestlakePoint { x: number; y: number }

export function westlakeField(kind: WestlakeSceneKind, width: number, height: number): WestlakeRect {
  switch (kind) {
    case 'leaf': return { x: 0, y: .25, width: 1, height: .72 };
    case 'stones': return { x: .04, y: .31, width: .92, height: .65 };
    case 'tea': return { x: .03, y: .18, width: .94, height: .9 };
    case 'brew': {
      const size = westlakeCupSize(width, height);
      return { x: .5 - size / width * .44, y: .72 - size / height * .43, width: size / width * .88, height: size / height * .88 };
    }
  }
}

export function westlakeCupSize(width: number, height: number): number {
  return Math.min(width * .72, height * .48, 390);
}

export function westlakePoint(field: WestlakeRect, point: WestlakePoint): WestlakePoint {
  return { x: field.x + point.x * field.width, y: field.y + point.y * field.height };
}

export function westlakeInput(kind: WestlakeSceneKind, input: MiniInput & { viewWidth: number; viewHeight: number }): MiniInput {
  if (input.x === undefined || input.y === undefined || input.phase === 'release' || input.action === 'outside-scene') return input;
  const field = westlakeField(kind, input.viewWidth, input.viewHeight);
  const x = (input.x - field.x) / field.width, y = (input.y - field.y) / field.height;
  return { ...input, x, y, action: x < 0 || x > 1 || y < 0 || y > 1 ? 'outside-scene' : input.action };
}
