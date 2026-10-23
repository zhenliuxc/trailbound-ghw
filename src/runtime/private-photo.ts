// Persisted v1 identities are independent of current route/crop configuration.
export const PRIVATE_PHOTO_SCHEMA_VERSION = 1;
export type PhotoPointId = 'jx-creek' | 'jx-tea';
export function isPhotoPointId(value: unknown): value is PhotoPointId { return value === 'jx-creek' || value === 'jx-tea'; }
export const PEN_NAMES = ['松间客', '溪边客', '茶山客', '听雨人', '望云人', '寻叶人'] as const;
export type PenName = typeof PEN_NAMES[number];
export function isPenName(value: unknown): value is PenName { return PEN_NAMES.some(name => name === value); }

export type PhotoAttribution = { readonly kind: 'anonymous' } | { readonly kind: 'pen-name'; readonly name: PenName };
export interface PrivatePhoto {
  readonly id: string;
  readonly kind: 'private-local';
  readonly route: 'westlake';
  readonly point: PhotoPointId;
  readonly sceneVersion: string;
  readonly createdAt: number;
  readonly image: string;
  readonly body: string;
  readonly anchor: number;
  readonly zoom: number;
  readonly attribution: PhotoAttribution;
}
export type PhotoSaveResult = { kind: 'stored'; photo: PrivatePhoto } | { kind: 'error'; message: string };
export type PhotoReadResult = { kind: 'loaded'; photos: PrivatePhoto[] } | { kind: 'error'; message: string };

export function normalizePhotoText(value: string): string { return value.replace(/\r\n?/g, '\n').replace(/\t/g, ' ').normalize('NFC').trim(); }
export function visibleCharacterCount(value: string): number { return Array.from(new Intl.Segmenter('zh', { granularity: 'grapheme' }).segment(value)).length; }
export function parsePrivatePhoto(value: unknown): PrivatePhoto | null {
  if (!value || typeof value !== 'object' || !('kind' in value) || value.kind !== 'private-local'
    || !('id' in value) || typeof value.id !== 'string' || !value.id
    || !('route' in value) || value.route !== 'westlake'
    || !('point' in value) || typeof value.point !== 'string'
    || !('sceneVersion' in value) || typeof value.sceneVersion !== 'string'
    || !('createdAt' in value) || typeof value.createdAt !== 'number' || !Number.isFinite(value.createdAt)
    || !('image' in value) || typeof value.image !== 'string' || !/^data:image\/(webp|png);base64,[A-Za-z0-9+/=]+$/.test(value.image)
    || !('body' in value) || typeof value.body !== 'string'
    || !('anchor' in value) || typeof value.anchor !== 'number' || !Number.isInteger(value.anchor) || value.anchor < 0 || value.anchor > 2
    || !('zoom' in value) || typeof value.zoom !== 'number' || !Number.isFinite(value.zoom) || value.zoom < 1 || value.zoom > 1.3
    || !('attribution' in value) || !value.attribution || typeof value.attribution !== 'object' || !('kind' in value.attribution)) return null;
  if (!isPhotoPointId(value.point)) return null;
  let attribution: PhotoAttribution;
  if (value.attribution.kind === 'anonymous') attribution = { kind: 'anonymous' };
  else if (value.attribution.kind === 'pen-name' && 'name' in value.attribution && isPenName(value.attribution.name)) attribution = { kind: 'pen-name', name: value.attribution.name };
  else return null;
  return { id: value.id, kind: 'private-local', route: 'westlake', point: value.point, sceneVersion: value.sceneVersion, createdAt: value.createdAt, image: value.image, body: value.body, anchor: value.anchor, zoom: value.zoom, attribution };
}

export interface PrivatePhotoStore {
  read(): Promise<PhotoReadResult>;
  save(photo: PrivatePhoto): Promise<PhotoSaveResult>;
  close(): Promise<void>;
}
