import type { Point2D } from '../runtime/projection';

import type { PhotoPointId } from '../runtime/private-photo';
export { PEN_NAMES, isPenName } from '../runtime/private-photo';
export type { PenName } from '../runtime/private-photo';
export type GlimpsePointId = PhotoPointId;
export interface PhotoFrame extends Point2D { readonly width: number; readonly height: number }
export interface GlimpsePoint {
  readonly id: GlimpsePointId;
  readonly name: string;
  readonly zone: readonly [number, number];
  readonly paper: Point2D;
  readonly bounds: PhotoFrame;
  readonly anchors: readonly [PhotoFrame, PhotoFrame, PhotoFrame];
  readonly labels: readonly [string, string, string];
  readonly recommendations: readonly [string, string, string];
  readonly caption: string;
}

export const GLIMPSE_SCENE_VERSION = 'jiuxi-spring-map-1';
export const EXPLORATION_SECONDS = 12;
export const CAPTION_SUGGESTED_LIMIT = 80;
export const GLIMPSE_POINTS: readonly GlimpsePoint[] = [
  {
    id: 'jx-creek', name: '九溪 · 溪林停步处', zone: [2, 5.7], paper: { x: 1455, y: 1435 },
    bounds: { x: 1060, y: 1190, width: 760, height: 570 },
    anchors: [{ x: 1380, y: 1190, width: 440, height: 330 }, { x: 1435, y: 1255, width: 360, height: 270 }, { x: 1300, y: 1370, width: 480, height: 360 }],
    labels: ['溪弯与树影', '石边的水纹', '树下的水岸'],
    recommendations: ['溪水在石头旁拐了一个小弯。', '树影落在水边，颜色又深了一层。', '先停一停，听听石头之间的水声。'],
    caption: '溪水在石头旁拐了一个小弯。你也看见了吗？',
  },
  {
    id: 'jx-tea', name: '九溪 · 茶坡转角', zone: [9, 12.8], paper: { x: 2250, y: 825 },
    bounds: { x: 1850, y: 610, width: 720, height: 540 },
    anchors: [{ x: 1850, y: 785, width: 440, height: 330 }, { x: 1930, y: 690, width: 400, height: 300 }, { x: 1850, y: 740, width: 520, height: 390 }],
    labels: ['转角与茶坡', '沿径望坡', '溪岸望茶垄'],
    recommendations: ['茶垄顺着山坡，一层一层弯过去。', '转过这个弯，眼前的绿又换了一种。', '把这一坡的春色，留在午前的光里。'],
    caption: '茶垄顺着山坡，一层一层弯过去。',
  },
];

export function glimpsePoint(id: string): GlimpsePoint | undefined { return GLIMPSE_POINTS.find(point => point.id === id); }
export function photoFrame(point: GlimpsePoint, anchor: number, zoom: number): PhotoFrame {
  const source = point.anchors[anchor] ?? point.anchors[0];
  const scale = Math.max(1, Math.min(1.3, Number.isFinite(zoom) ? zoom : 1));
  const width = Math.floor(source.width / scale / 4) * 4, height = width * .75;
  return { x: source.x + (source.width - width) / 2, y: source.y + (source.height - height) / 2, width, height };
}
