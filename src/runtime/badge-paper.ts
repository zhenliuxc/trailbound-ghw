export const PAPER_BADGE = { size: 768, center: 384, outerRadius: 360, artRadius: 336 } as const;
export interface BadgeCircle { x: number; y: number; radius: number }
export const PAPER_BADGE_ART: BadgeCircle = {
  x: PAPER_BADGE.center, y: PAPER_BADGE.center, radius: PAPER_BADGE.artRadius,
};

function circle(ctx: CanvasRenderingContext2D, radius: number): void {
  ctx.moveTo(PAPER_BADGE.center + radius, PAPER_BADGE.center);
  ctx.arc(PAPER_BADGE.center, PAPER_BADGE.center, radius, 0, Math.PI * 2);
}

function paintPaperEdge(ctx: CanvasRenderingContext2D): void {
  const { center, outerRadius, artRadius } = PAPER_BADGE;
  ctx.save();
  ctx.beginPath(); circle(ctx, outerRadius); circle(ctx, artRadius - .5);
  ctx.clip('evenodd');
  ctx.fillStyle = '#f3edda'; ctx.fillRect(0, 0, PAPER_BADGE.size, PAPER_BADGE.size);
  // Fine, repeatable paper fibres remain inside the ring, never over the artwork.
  for (let i = 0; i < 760; i++) {
    const angle = i * 2.3999632297;
    const radius = artRadius + ((i * 37) % 97) / 97 * (outerRadius - artRadius);
    const x = center + Math.cos(angle) * radius, y = center + Math.sin(angle) * radius;
    ctx.strokeStyle = i % 3 ? '#a58c6119' : '#ffffff75'; ctx.lineWidth = .65;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle + .7) * 2, y + Math.sin(angle + .7) * 2); ctx.stroke();
  }
  ctx.restore();
  ctx.save(); ctx.lineCap = 'round';
  for (const line of [
    { radius: outerRadius - 2.5, color: '#a58c61', width: 2.5 },
    { radius: artRadius + 2, color: '#89947c', width: 1.35 },
  ]) {
    ctx.strokeStyle = line.color; ctx.lineWidth = line.width; ctx.beginPath();
    for (let i = 0; i <= 192; i++) {
      const angle = i / 192 * Math.PI * 2;
      const radius = line.radius + Math.sin(angle * 13) * .35 + Math.sin(angle * 29) * .15;
      const x = center + Math.cos(angle) * radius, y = center + Math.sin(angle) * radius;
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
  }
  ctx.restore();
}

/** One geometry for the picture, clipping and complete paper edge. */
export function composePaperBadge(
  doc: Document,
  paint: (ctx: CanvasRenderingContext2D, art: BadgeCircle) => void,
): HTMLCanvasElement | null {
  const canvas = doc.createElement('canvas'); canvas.width = canvas.height = PAPER_BADGE.size;
  const ctx = canvas.getContext('2d'); if (!ctx) return null;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.save(); ctx.beginPath(); circle(ctx, PAPER_BADGE.artRadius); ctx.clip();
  paint(ctx, PAPER_BADGE_ART); ctx.restore();
  paintPaperEdge(ctx);
  return canvas;
}

export function paintBadgeImage(
  ctx: CanvasRenderingContext2D, image: HTMLImageElement,
  source: BadgeCircle, target: BadgeCircle,
): void {
  const scale = target.radius / source.radius;
  ctx.drawImage(image, target.x - source.x * scale, target.y - source.y * scale,
    image.naturalWidth * scale, image.naturalHeight * scale);
}

export function encodePaperBadge(canvas: HTMLCanvasElement, maxLength = Infinity): string | null {
  try {
    for (const quality of [.9, .8, .68]) {
      const url = canvas.toDataURL('image/webp', quality);
      if (url.startsWith('data:image/webp;base64,') && url.length < maxLength) return url;
    }
  } catch { /* The caller keeps the original readable or offers capture retry. */ }
  return null;
}
