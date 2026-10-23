import type { Moment } from '../runtime/contracts';

export const ROUND_BADGE_IDS = new Set(['wugong-forest-leaves', 'wugong-camp-stars', 'wugong-homeward-pages', 'tiger-28-bends-v1', 'tiger-middle-river-frame-v1']);
const SIZE = 640, CENTER = SIZE / 2;
const outline = (radius: number) => Array.from({ length: 145 }, (_, i) => {
  const a = i / 144 * Math.PI * 2, r = radius + Math.sin(a * 11) * .8 + Math.sin(a * 23) * .35;
  return `${i ? 'L' : 'M'}${CENTER + Math.cos(a) * r},${CENTER + Math.sin(a) * r}`;
}).join(' ') + 'Z';
const outer = outline(302), inner = outline(279), gold = outline(295), ink = outline(285);
const sprigs = Array.from({ length: 18 }, (_, i) => {
  const a = .25 + i / 17 * 1.1, sign = i % 2 ? 1 : -1, x = CENTER + sign * Math.sin(a) * 292, y = CENTER + Math.cos(a) * 292;
  return `M${x},${y}q${sign * 7},-12 ${sign * 1},-18q${-sign * 9},9 ${-sign * 1},18Z`;
});
export function badgeFrameSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="${outer} ${inner}" fill="#f3edd9" fill-rule="evenodd"/><path d="${gold}" fill="none" stroke="#b69a61" stroke-width="2.4"/><path d="${ink}" fill="none" stroke="#a6a67b" stroke-width="1.1"/>${sprigs.map(d => `<path d="${d}" fill="#b4a777" fill-opacity=".8"/>`).join('')}</svg>`;
}

export function circularBadge(image: HTMLImageElement, options: { camp?: boolean; legacyPaper?: boolean; preserveFrame?: boolean } = {}): HTMLCanvasElement | null {
  if (!image.naturalWidth || !image.naturalHeight) return null;
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d'); if (!ctx) return null;
  let x = 0, y = 0, width = image.naturalWidth, height = image.naturalHeight;
  if (options.legacyPaper) { x = width * 24 / 900; y = height * 24 / 660; width *= 852 / 900; height *= 530 / 660; }
  const side = Math.min(width, height), centerX = options.camp ? .36 : .5;
  x += Math.max(0, Math.min(width - side, width * centerX - side / 2)); y += (height - side) / 2;
  ctx.save(); ctx.beginPath(); ctx.arc(CENTER, CENTER, 280, 0, Math.PI * 2); ctx.clip();
  if (options.preserveFrame) {
    ctx.fillStyle = '#e9e7d7'; ctx.fillRect(0, 0, SIZE, SIZE);
    const ratio = image.naturalWidth / image.naturalHeight, h = 555 / Math.sqrt(1 + ratio * ratio), w = h * ratio;
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, CENTER - w / 2, CENTER - h / 2, w, h);
  } else ctx.drawImage(image, x, y, side, side, 40, 40, 560, 560);
  ctx.restore();
  ctx.fillStyle = '#f3edd9'; ctx.fill(new Path2D(`${outer} ${inner}`), 'evenodd');
  ctx.strokeStyle = '#b69a61'; ctx.lineWidth = 2.4; ctx.stroke(new Path2D(gold));
  ctx.strokeStyle = '#a6a67b'; ctx.lineWidth = 1.1; ctx.stroke(new Path2D(ink));
  ctx.fillStyle = '#b4a777'; ctx.globalAlpha = .8; for (const d of sprigs) ctx.fill(new Path2D(d)); ctx.globalAlpha = 1;
  return canvas;
}

/** Present old rectangular captures as badges without rewriting saved memories. */
export function roundJournalArt(image: HTMLImageElement, moment: Moment): string | null {
  const tiger = moment.route === 'tiger';
  if (!ROUND_BADGE_IDS.has(moment.id) || !tiger && image.naturalWidth <= image.naturalHeight * 1.1) return null;
  const canvas = circularBadge(image, { preserveFrame: tiger, camp: moment.id === 'wugong-camp-stars', legacyPaper: !tiger && !!moment.captureArt && moment.id !== 'wugong-camp-stars' });
  return canvas?.toDataURL('image/webp', .88) ?? null;
}
