import type { GlimpsePoint } from '../../content/look-here';
import { normalizePhotoText, type PhotoAttribution, type PrivatePhoto } from '../../runtime/private-photo';

export interface Draft {
  readonly id: string;
  readonly point: GlimpsePoint;
  readonly sceneVersion: string;
  readonly createdAt: number;
  readonly body: string;
  readonly anchor: number;
  readonly zoom: number;
  readonly image: string | null;
  readonly attribution: PhotoAttribution;
}
export type Panel = { kind: 'note'; point: GlimpsePoint } | { kind: 'compose'; draft: Draft }
  | { kind: 'preview'; draft: Draft } | { kind: 'leave'; draft: Draft }
  | { kind: 'saved'; photo: PrivatePhoto } | { kind: 'settings' } | { kind: 'album' };
export type DraftCommand = { kind: 'caption'; body: string } | { kind: 'anchor'; index: number }
  | { kind: 'zoom'; value: number } | { kind: 'capture'; image: string } | { kind: 'retake' }
  | { kind: 'attribution'; value: PhotoAttribution };

export function createDraft(identity: Pick<Draft, 'id' | 'point' | 'sceneVersion' | 'createdAt'>): Draft {
  return { ...identity, body: '', anchor: 0, zoom: 1, image: null, attribution: { kind: 'anonymous' } };
}
export function editDraft(draft: Draft, command: DraftCommand): Draft {
  switch (command.kind) {
    case 'caption': return { ...draft, body: command.body };
    case 'anchor': return { ...draft, anchor: Number.isInteger(command.index) && command.index >= 0 && command.index < 3 ? command.index : 0, image: null };
    case 'zoom': return { ...draft, zoom: Math.max(1, Math.min(1.3, Number.isFinite(command.value) ? Number(command.value.toFixed(1)) : 1)), image: null };
    case 'capture': return { ...draft, image: command.image };
    case 'retake': return { ...draft, image: null };
    case 'attribution': return { ...draft, attribution: command.value.kind === 'anonymous' ? { kind: 'anonymous' } : { ...command.value } };
    default: { const exhaustive: never = command; return exhaustive; }
  }
}
export function recommendCaption(draft: Draft, sentence: string, confirmed = false):
  { kind: 'confirm' } | { kind: 'applied'; draft: Draft } {
  return draft.body.trim() && !confirmed ? { kind: 'confirm' } : { kind: 'applied', draft: editDraft(draft, { kind: 'caption', body: sentence }) };
}
export function exitPanel(panel: Panel | null): Panel | null {
  if (panel?.kind === 'leave') return { kind: 'compose', draft: panel.draft };
  if ((panel?.kind === 'compose' || panel?.kind === 'preview') && (panel.draft.image || panel.draft.body.trim())) return { kind: 'leave', draft: panel.draft };
  return null;
}
export function photoSnapshot(draft: Draft): PrivatePhoto | null {
  if (!draft.image) return null;
  return {
    id: draft.id, kind: 'private-local', route: 'westlake', point: draft.point.id,
    sceneVersion: draft.sceneVersion, createdAt: draft.createdAt, image: draft.image,
    body: normalizePhotoText(draft.body), anchor: draft.anchor, zoom: draft.zoom,
    attribution: draft.attribution.kind === 'anonymous' ? { kind: 'anonymous' } : { ...draft.attribution },
  };
}
