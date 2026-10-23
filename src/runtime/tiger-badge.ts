import type { Moment, JournalArtPresentation } from './contracts';
import { tigerBadgeArt, tigerLegacyBadgeTile } from '../content/tiger-badges';
import { composePaperBadge, encodePaperBadge, paintBadgeImage, PAPER_BADGE, type BadgeCircle } from './badge-paper';

const presentedArt = new WeakMap<HTMLImageElement, Map<string, JournalArtPresentation>>();

export function tigerLegacyBadgeFile(moment: Moment): string | null {
  return moment.route === 'tiger' && moment.edition !== 3 && tigerLegacyBadgeTile(moment.id)
    ? 'badges/moments-v1.webp' : null;
}

/** Derive a display image only. The stored original, date and event stay intact. */
export function tigerJournalArt(image: HTMLImageElement, moment: Moment): JournalArtPresentation | null {
  if (moment.route !== 'tiger' || !image.naturalWidth || !image.naturalHeight) return null;
  const width = image.naturalWidth, height = image.naturalHeight;
  const original = image.currentSrc || image.src;
  const cacheKey = `${moment.id}|${Boolean(moment.captureArt)}|${original}`;
  const cached = presentedArt.get(image)?.get(cacheKey);
  if (cached) return cached;
  const art = tigerBadgeArt(moment.id), tile = tigerLegacyBadgeTile(moment.id);
  const rectangular = Math.abs(width / height - 1) > .05;
  const atlas = !!tile && /(?:^|\/)moments-v1\.webp(?:[?#]|$)/.test(original);
  let source: BadgeCircle;
  if (atlas && tile) {
    source = { x: (tile.column + .5) * width / 3, y: (tile.row + .5) * height / 3, radius: Math.min(width, height) / 3 * .41 };
  } else if (rectangular) {
    source = { x: width / 2, y: height / 2, radius: Math.min(width, height) / 2 };
  } else if (moment.captureArt && art) {
    // Existing v4 captures are 576 px with radius 249. New captures use PAPER_BADGE.
    if (width === PAPER_BADGE.size && height === PAPER_BADGE.size) return { src: original };
    source = { x: width / 2, y: height / 2, radius: width * 249 / 576 };
  } else {
    source = { x: width * (art?.x ?? .5), y: height * (art?.y ?? .5), radius: Math.min(width, height) * (art?.radius ?? .41) };
  }
  const canvas = composePaperBadge(image.ownerDocument, (ctx, target) => paintBadgeImage(ctx, image, source, target));
  const src = canvas && encodePaperBadge(canvas);
  if (!src) return null;
  const keepOriginal = !atlas && (rectangular || Boolean(moment.captureArt && !art));
  const presentation: JournalArtPresentation = { src, ...(keepOriginal ? { original } : {}) };
  const cache = presentedArt.get(image) ?? new Map<string, JournalArtPresentation>();
  cache.set(cacheKey, presentation); presentedArt.set(image, cache);
  return presentation;
}
