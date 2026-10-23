const PROTOCOL = 'trailbound.art.v1';

export interface ArtSession { readonly session: string; readonly entry: string | null }
export type ArtMessage = ArtSession & { readonly protocol: typeof PROTOCOL } & (
  | { readonly type: 'ready' | 'dispose' }
  | { readonly type: 'collected' | 'close'; readonly collected: number }
);

export function artMessage(session: ArtSession, type: 'ready' | 'dispose'): ArtMessage;
export function artMessage(session: ArtSession, type: 'collected' | 'close', collected: number): ArtMessage;
export function artMessage(session: ArtSession, type: ArtMessage['type'], collected = 0): ArtMessage {
  return type === 'ready' || type === 'dispose'
    ? { ...session, protocol: PROTOCOL, type }
    : { ...session, protocol: PROTOCOL, type, collected };
}

/** Validate at the iframe boundary; route and game internals use the typed message. */
export function readArtMessage(value: unknown, current: ArtSession | null): ArtMessage | null {
  if (!current || !value || typeof value !== 'object' || !('protocol' in value) || value.protocol !== PROTOCOL
    || !('session' in value) || value.session !== current.session || !('entry' in value) || value.entry !== current.entry || !('type' in value)) return null;
  if (value.type === 'ready' || value.type === 'dispose') return artMessage(current, value.type);
  if ((value.type === 'collected' || value.type === 'close') && 'collected' in value
    && typeof value.collected === 'number' && Number.isSafeInteger(value.collected) && value.collected >= 0 && value.collected <= 1) {
    return artMessage(current, value.type, value.collected);
  }
  return null;
}
