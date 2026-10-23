import type { CHARACTERS, CharacterId } from '../../characters/catalog';
import { WESTLAKE_SCENES, type WestlakeSceneId } from '../../content/westlake-scenes';
import { DayMemoryState, leafPosition, STONES, TEA } from './model';
import { westlakeCupSize, westlakeField, westlakePoint, type WestlakePoint } from './westlake-layout';

interface WestlakePaint {
  ctx: CanvasRenderingContext2D;
  images: ReadonlyMap<string, HTMLImageElement>;
  character: typeof CHARACTERS[CharacterId];
  id: WestlakeSceneId;
  state: DayMemoryState;
  width: number;
  height: number;
}

export function paintWestlake({ ctx, images, character, id, state: s, width: w, height: h }: WestlakePaint): void {
  const spec = WESTLAKE_SCENES[id], bg = images.get(spec.background);
  if (!bg) return;
  const focus = w < h ? spec.portraitFocus : spec.focus;
  const cover = Math.max(w / bg.naturalWidth, h / bg.naturalHeight);
  ctx.drawImage(bg, -(bg.naturalWidth * cover - w) * focus.x, -(bg.naturalHeight * cover - h) * focus.y, bg.naturalWidth * cover, bg.naturalHeight * cover);
  const field = westlakeField(spec.kind, w, h), unit = Math.min(w, h * 1.45), t = s.reduced ? 0 : s.age;
  const point = (p: WestlakePoint) => { const at = westlakePoint(field, p); return { x: at.x * w, y: at.y * h }; };
  const sprite = (file: string, at: WestlakePoint, width: number, angle = 0, alpha = 1) => {
    const img = images.get(file); if (!img) return;
    const height = width * img.naturalHeight / img.naturalWidth;
    ctx.save(); ctx.translate(at.x, at.y); ctx.rotate(angle); ctx.globalAlpha = alpha;
    ctx.drawImage(img, -width / 2, -height / 2, width, height); ctx.restore();
  };
  const ripple = (at: WestlakePoint, radius: number, alpha: number) => {
    ctx.save(); ctx.strokeStyle = `rgba(246,243,213,${alpha})`; ctx.lineWidth = Math.max(1, unit * .0018);
    ctx.beginPath(); ctx.ellipse(at.x, at.y, radius, radius * .23, -.07, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  };
  const leafArt = (frame: number, at: WestlakePoint, width: number, rotation = 0, alpha = 1) => {
    const img = images.get('sprites/art-play-props-v1.webp'); if (!img) return;
    const regions = [[99, 26, 169, 350], [393, 75, 367, 282], [810, 80, 317, 274]];
    const region = regions[frame]; if (!region) return;
    const [sx, sy, sw, sh] = region;
    ctx.save(); ctx.translate(at.x, at.y); ctx.rotate(rotation); ctx.globalAlpha = alpha;
    ctx.drawImage(img, sx, sy, sw, sh, -width / 2, -width * sh / sw / 2, width, width * sh / sw); ctx.restore();
  };
  const scene = s.scene;
  if (scene.kind === 'leaf') {
    const at = point(leafPosition(scene.distance)), size = Math.min(74, unit * .11);
    ripple({ x: at.x - size * .06, y: at.y + size * .16 }, size * .47, .38);
    sprite('sprites/creek-leaf-v1.webp', at, size, -.12 + Math.sin(t * .6) * .07);
    if (s.acted) for (let i = 0; i < 3; i++) {
      const progress = ((t * .48 + i / 3) % 1);
      ripple(point({ x: s.x, y: s.y }), unit * (.025 + progress * .095), (1 - progress) * .4);
    }
    else ripple(point({ x: leafPosition(0).x - .08, y: leafPosition(0).y }), unit * .035, .65);
  } else if (scene.kind === 'stones') {
    const rock = images.get('sprites/mogan-props-v1.webp');
    const start = { x: .18, y: .88 }, exit = { x: .86, y: .48 };
    const rockAt = (p: WestlakePoint, size: number) => {
      const at = point(p), height = size * 158 / 480;
      ripple({ x: at.x, y: at.y + height * .35 }, size * .48, .32);
      if (rock) ctx.drawImage(rock, 16, 177, 480, 158, at.x - size / 2, at.y - height * .44, size, height);
    };
    rockAt(start, unit * .21); rockAt(exit, unit * .2);
    STONES.forEach((p, i) => rockAt(p, unit * (.19 - i * .018)));
    const active = STONES[scene.index];
    if (active && scene.walking === 0) ripple(point(active), unit * .054, .75);
    const from = scene.index === 0 ? start : STONES[Math.min(2, scene.index - 1)];
    const to = scene.index >= 3 ? exit : STONES[scene.index];
    const fraction = scene.index >= 3 ? Math.min(1, s.reveal / 1.5) : scene.walking;
    const at = point({ x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction });
    const image = images.get(character.walk.file);
    if (image) {
      const moving = fraction > 0 && fraction < 1;
      const frame = character.walk.frames[moving && !s.reduced ? Math.floor(s.age * 8) % 8 : 2];
      const size = Math.max(38, Math.min(72, unit * .1)), scale = size / frame.height;
      ctx.save(); ctx.fillStyle = '#34463d32'; ctx.beginPath(); ctx.ellipse(at.x, at.y + 1, size * .2, size * .045, 0, 0, Math.PI * 2); ctx.fill();
      ctx.drawImage(image, frame.x, frame.y, frame.width, frame.height, at.x - frame.footX * scale, at.y - frame.footY * scale, frame.width * scale, frame.height * scale); ctx.restore();
    }
  } else if (scene.kind === 'tea') {
    const left = w * .1, top = h * .49, width = w * .8, height = h * .46;
    ctx.save(); ctx.shadowColor = '#32493632'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
    ctx.fillStyle = '#faf5e6f2'; ctx.beginPath(); ctx.moveTo(left, top + 4); ctx.lineTo(left + width * .49, top); ctx.lineTo(left + width, top + 5); ctx.lineTo(left + width - 3, top + height); ctx.lineTo(left + 4, top + height - 3); ctx.closePath(); ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.strokeStyle = '#cfc7a65c'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(w * .5, top + 8); ctx.lineTo(w * .5, top + height - 8); ctx.stroke(); ctx.restore();
    TEA.forEach((p, i) => {
      const at = point(p), picked = scene.picked.has(i), size = Math.min(w * .145, h * .17);
      leafArt(p.bud ? 0 : p.young ? 1 : 2, at, size * (p.bud ? .44 : p.young ? .8 : 1.1), Math.sin(i) * .12, picked ? .5 : 1);
      if (picked) {
        ctx.save(); ctx.strokeStyle = '#607c50'; ctx.lineWidth = Math.max(1.5, unit * .0022); ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(at.x - 5, at.y + size * .56); ctx.lineTo(at.x - 1, at.y + size * .61); ctx.lineTo(at.x + 8, at.y + size * .49); ctx.stroke(); ctx.restore();
      }
    });
  } else if (scene.kind === 'brew') {
    const size = westlakeCupSize(w, h), cx = w * .5, cy = h * .72;
    ctx.save(); ctx.fillStyle = '#56432b26'; ctx.beginPath(); ctx.ellipse(cx, cy + size * .4, size * .42, size * .06, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    sprite('scenes/day-route-v2/teacup.webp', { x: cx, y: cy }, size);
    const waterY = cy + size * .19 - scene.water * size * .3;
    ctx.save(); ctx.fillStyle = '#bad27c55'; ctx.beginPath(); ctx.ellipse(cx, waterY, size * .31, size * .07, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    for (let i = 0; i < 3; i++) leafArt(i === 0 ? 0 : 1, { x: cx + size * (i * .085 - .085), y: waterY + size * .045 + Math.sin(t + i) * size * .006 }, size * .075, Math.sin(i + scene.steep) * .4, .8);
    if (s.dragging && !scene.released) {
      ctx.save(); ctx.strokeStyle = '#ecf4dbab'; ctx.lineWidth = Math.max(2, size * .018); ctx.beginPath(); ctx.moveTo(cx - size * .12, cy - size * .52); ctx.quadraticCurveTo(cx, cy - size * .25, cx, waterY); ctx.stroke(); ctx.restore();
    }
    if (scene.released) for (let i = 0; i < 3; i++) {
      const drift = s.reduced ? 0 : Math.sin(t * .6 + i) * size * .012;
      ctx.save(); ctx.strokeStyle = '#fffbe7a6'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx + size * (i * .1 - .1), cy - size * .23);
      ctx.bezierCurveTo(cx + size * (i * .1 - .13) + drift, cy - size * .33, cx + size * (i * .1 - .07), cy - size * .38, cx + size * (i * .1 - .1) + drift, cy - size * .46); ctx.stroke(); ctx.restore();
    }
  }
  if (s.phase === 'reveal') { ctx.fillStyle = `rgba(251,247,225,${Math.min(.1, s.reveal * .02)})`; ctx.fillRect(0, 0, w, h); }
}
