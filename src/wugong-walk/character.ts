import { clamp, mix, smooth, type Point, type WalkModel } from './model';

const ink = '#49646a';
const tau = Math.PI * 2;
function shape(ctx: CanvasRenderingContext2D, points: readonly Point[], fill: string, stroke = ink, width = .65): void {
  if (!points.length) return;
  ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) ctx.lineTo(point.x, point.y);
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
}
function line(ctx: CanvasRenderingContext2D, points: readonly Point[], color: string, width: number): void {
  ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
  for (const point of points.slice(1)) ctx.lineTo(point.x, point.y);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
}
function oval(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string, stroke = ''): void {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, tau); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = .65; ctx.stroke(); }
}
function rounded(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string, stroke = ''): void {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = .65; ctx.stroke(); }
}
function pack(ctx: CanvasRenderingContext2D): void {
  rounded(ctx, -7.5, -15, 15, 19, 4, '#819272', '#526e60');
  rounded(ctx, -6.2, -5.7, 12, 7, 2.2, '#a2ad83', '#6c8068');
  rounded(ctx, -7.8, -16.2, 15.6, 5.6, 2.5, '#aab88d', '#6f876d');
  line(ctx, [{ x: -4, y: -14 }, { x: -4, y: -9 }], '#526b58', 1.5);
  line(ctx, [{ x: 4, y: -14 }, { x: 4, y: -9 }], '#526b58', 1.5);
  rounded(ctx, -5, -10, 2.5, 2, .4, '#d9c899'); rounded(ctx, 2.9, -10, 2.5, 2, .4, '#d9c899');
  rounded(ctx, -10.2, -7, 3, 9, 1.4, '#8ba7a5', '#557879');
  rounded(ctx, -9.8, -8.3, 2.2, 1.8, .6, '#5d7d78');
  rounded(ctx, -7.8, 3, 15.8, 3.6, 1.6, '#b7aa83', '#7f8365');
  oval(ctx, 7.4, 4.8, 1.8, 2, '#ded3ab', '#8a8b69');
  line(ctx, [{ x: -5.7, y: -3.8 }, { x: 4.3, y: -3.8 }], '#c8d2b0', .7);
  line(ctx, [{ x: -4, y: 3.4 }, { x: -4, y: 6 }, { x: -2, y: 6 }], '#65725b', .7);
}

export function drawHiker(ctx: CanvasRenderingContext2D, model: WalkModel, scale: number, reduced: boolean, breeze = .65): void {
  const p = model.point, sit = model.seated, off = model.packOff, moving = model.moving;
  const phase = model.phase * tau, facing = model.turnSide;
  const profile = Math.abs(Math.cos(model.angle)), back = smooth((-Math.sin(model.angle) - .06) / .74);
  const bob = moving && !reduced ? .07 * (1 - Math.cos(phase * 2)) : 0;
  const breath = reduced ? 0 : Math.sin(model.clock * 1.7) * .08;
  const crouch = moving ? Math.min(1, Math.max(0, -model.slope) / .35) * 1.7 : 0;
  const tilt = model.lean * facing, hipX = (model.support.x - p.x) / scale;
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(scale, scale); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  oval(ctx, 1.5, 1.3, mix(7.8, 11, sit), 2.2, '#264b4828');
  const contacts = model.feet;
  const feet = contacts.map((foot, i) => ({
    x: mix((foot.point.x - p.x) / scale, 7.2 + (i ? 2.3 : -2.3), sit),
    y: mix((foot.point.y - p.y - foot.lift) / scale - 1.65, -.55 + (i ? .65 : -.65), sit),
  }));
  let hipY = -18.2 + (model.support.y - p.y) / scale - bob + crouch + sit * 11;
  if (sit < .1) for (const foot of feet) {
    const horizontal = foot.x - hipX;
    hipY = Math.max(hipY, foot.y - Math.sqrt(Math.max(4, 19.0 ** 2 - horizontal ** 2)));
  }
  for (const foot of contacts) if (foot.support > .01 && sit < .1) {
    ctx.save(); ctx.globalAlpha = foot.support * .24;
    oval(ctx, (foot.point.x - p.x) / scale, (foot.point.y - p.y) / scale + .1, 2.5, .65, '#2a453d'); ctx.restore();
  }
  function leg(i: number): void {
    const hip = { x: hipX + (i ? 1 : -1) * (1.8 - profile * .65), y: hipY + (i ? .25 : 0) }, foot = feet[i];
    const dx = foot.x - hip.x, dy = foot.y - hip.y, length = Math.max(.1, Math.hypot(dx, dy));
    const reach = clamp(length, .8, 19.5), along = (10.1 ** 2 - 9.7 ** 2 + reach ** 2) / (2 * reach);
    const bend = Math.sqrt(Math.max(0, 10.1 ** 2 - along ** 2));
    const kneeSide = facing * .86 + (i ? .14 : -.14) * (1 - profile);
    const knee = { x: hip.x + dx / length * along + dy / length * bend * kneeSide, y: hip.y + dy / length * along - dx / length * bend * kneeSide };
    line(ctx, [hip, knee, foot], '#625f4d', 3.7);
    line(ctx, [hip, knee, foot], i ? '#b3aa86' : '#949777', 2.7);
    line(ctx, [hip, { x: mix(hip.x, knee.x, .7) + .4, y: mix(hip.y, knee.y, .7) }], '#d6cb9d', .6);
    ctx.save(); ctx.translate(foot.x, foot.y + 1.65); ctx.rotate(contacts[i].soleAngle * (1 - sit));
    const roll = reduced ? 0 : contacts[i].roll * facing * (1 - sit), pivot = (contacts[i].roll < 0 ? -1.9 : 2.3) * facing;
    ctx.translate(pivot, 0); ctx.rotate(roll); ctx.translate(-pivot, 0);
    rounded(ctx, -2.2 + facing * .35, -2.5, 4.6, 2.25, .8, '#645d49', '#455c50');
    line(ctx, [{ x: -1.9, y: -.15 }, { x: 2.45, y: -.15 }], '#425447', .5);
    line(ctx, [{ x: -.1, y: -1.7 }, { x: 1.5, y: -1.4 }], '#c6b78c', .45); ctx.restore();
  }
  const far = feet[0].y < feet[1].y ? 0 : 1; leg(far); leg(1 - far);
  if (off > .01) {
    ctx.save(); ctx.translate(mix(tilt * 15 - facing * 5.2, -15.5, off), mix(hipY - 3.7, -3.2, off));
    ctx.rotate(-.18 * off); ctx.scale(.64, .64); pack(ctx); ctx.restore();
  }
  ctx.save(); ctx.translate(hipX + tilt * 11, hipY + breath); ctx.rotate(tilt); ctx.scale(1 - profile * .15, 1);
  const swing = moving && !reduced ? Math.sin(phase) * 1.6 : 0;
  const drink = model.drinking, handLift = off > 0 && off < 1 ? Math.sin(off * Math.PI) : 0;
  function carriedPack(alpha: number): void {
    if (alpha < .005) return;
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(-facing * mix(5.2, 1.5, back), -3.7);
    ctx.rotate(moving && !reduced ? Math.sin(phase - .5) * .012 : 0); ctx.scale(.64, .64); pack(ctx); ctx.restore();
  }
  function arm(which: number, foreground: boolean): void {
    const shoulder = { x: which * 4.5, y: -12.3 };
    const hand = { x: which * 4.9 + swing * which * Math.cos(model.angle), y: 3.4 + swing * which * Math.sin(model.angle) * .35 };
    if (sit > .1) { hand.x = mix(hand.x, 6 + which * 3.2, sit); hand.y = mix(hand.y, 4.8, sit); }
    if (foreground) { hand.x = mix(hand.x, 4.6, drink); hand.y = mix(hand.y, -13.5, drink); }
    hand.x = mix(hand.x, -7.5, handLift * .8); hand.y = mix(hand.y, -8, handLift * .8);
    const elbow = { x: mix(shoulder.x, hand.x, .55) + which * .8, y: mix(shoulder.y, hand.y, .5) + 1.4 };
    line(ctx, [shoulder, elbow, hand], '#506c6c', 3.4);
    line(ctx, [shoulder, elbow, hand], foreground ? '#91a9a8' : '#728e90', 2.5);
    line(ctx, [{ x: hand.x - .7, y: hand.y - .6 }, { x: hand.x + .7, y: hand.y - .6 }], '#acb9aa', .7);
    oval(ctx, hand.x, hand.y + .2, 1.25, 1.45, '#dfc19b', '#a39e7e');
    if (foreground && sit > .5) {
      rounded(ctx, hand.x - 1.6, hand.y - 2.1, 4.1, 4.1, .8, '#c4d0bd', '#6b8b81');
      ctx.beginPath(); ctx.ellipse(hand.x + 3, hand.y, 1.2, 1.5, 0, 0, tau); ctx.strokeStyle = '#9bb2a4'; ctx.lineWidth = .7; ctx.stroke();
    }
  }
  if (off <= .01) carriedPack(1 - back);
  arm(-1, false);
  shape(ctx, [{ x: -5.1, y: -13.3 }, { x: -.4, y: -14.5 }, { x: 4.9, y: -13.0 }, { x: 4.2, y: -6.5 }, { x: 3.6, y: -.4 }, { x: 1.4, y: 1.2 }, { x: -3.8, y: .7 }, { x: -4.2, y: -6.5 }], '#81999b', '#566e6a', .55);
  shape(ctx, [{ x: -4.8, y: -12.4 }, { x: -1.8, y: -11.3 }, { x: -1.1, y: .6 }, { x: -3.6, y: .2 }], '#6d898d', '');
  line(ctx, [{ x: .8, y: -11.5 }, { x: 1.1, y: .1 }], '#c5d0c3', .55);
  rounded(ctx, 2.1, -5.7, 1.7, 3.3, .4, '#98aea7', '#6a8980');
  line(ctx, [{ x: -2.9, y: -3.8 }, { x: -.9, y: -4.8 }], '#9aafa7', .5);
  if (off < .95) {
    line(ctx, [{ x: -3.5, y: -12.2 }, { x: -2.9, y: -.2 }], '#b3bd98', 1.2);
    line(ctx, [{ x: -3, y: -6.7 }, { x: 3.9, y: -6.7 }], '#5c7361', .9);
    rounded(ctx, -.2, -7.4, 1.7, 1.4, .3, '#d6c99b', '#758366');
  }
  const wind = reduced ? .3 : breeze + Math.sin(model.clock * 1.1) * .20;
  shape(ctx, [{ x: -.6, y: -14.1 }, { x: -3.4 - wind, y: -14.1 }, { x: -7.1 - wind, y: -12.7 - wind * .3 }, { x: -6.7 - wind, y: -11.2 }, { x: -2.2, y: -12.6 }], '#a97562', '#8c6254', .4);
  rounded(ctx, -1.2, -15, 2.6, 2.6, .65, '#d3b18d');
  const faceX = facing * (.25 + profile * .35);
  oval(ctx, faceX, -17.7, 3.65, 4.55, '#d9bc98', '#979b7e');
  oval(ctx, faceX - facing * 3.3, -17.2, .85, 1.2, '#cfad89');
  if (back > .005) {
    ctx.save(); ctx.globalAlpha *= back;
    shape(ctx, [{ x: -3.3, y: -20.8 }, { x: 3.1, y: -20.8 }, { x: 3.4, y: -16.1 }, { x: 1.8, y: -14.2 }, { x: -.4, y: -14.1 }, { x: -2.4, y: -14.7 }, { x: -3.4, y: -16.9 }], '#666b57', '');
    ctx.restore();
  }
  if (back < .995) {
    ctx.save(); ctx.globalAlpha *= 1 - back;
    const eyeX = faceX + facing * 1.8;
    oval(ctx, eyeX, -17.9, .32, .4, '#4d5e4e');
    if (profile < .55) oval(ctx, faceX - facing * 1.2, -17.9, .28, .36, '#4d5e4e');
    line(ctx, [{ x: faceX + facing * 2.8, y: -17.5 }, { x: faceX + facing * 3.5, y: -16.4 }, { x: faceX + facing * 2.4, y: -16.3 }], '#ae9878', .45);
    line(ctx, [{ x: faceX + facing * .9, y: -14.9 }, { x: faceX + facing * 2, y: -15 }], '#a28b70', .4);
    shape(ctx, [{ x: -3.2, y: -21 }, { x: 2.8, y: -21 }, { x: 2.9, y: -19.4 }, { x: .5, y: -20 }, { x: -1.1, y: -19.6 }, { x: -2.4, y: -19.4 }, { x: -3.1, y: -16.8 }], '#666b57', '');
    ctx.restore();
  }
  oval(ctx, .1, -20.8, 6.1, 1.65, '#cbbf9c', '#93967a');
  ctx.beginPath(); ctx.moveTo(-3.9, -21); ctx.quadraticCurveTo(-3.7, -25.8, .2, -25.4); ctx.quadraticCurveTo(3.8, -25.1, 3.8, -21.1); ctx.closePath(); ctx.fillStyle = '#c1b795'; ctx.fill(); ctx.strokeStyle = '#8e9679'; ctx.lineWidth = .5; ctx.stroke();
  line(ctx, [{ x: -3.7, y: -21.7 }, { x: 3.6, y: -21.8 }], '#8e9476', 1.0);
  line(ctx, [{ x: -2.9, y: -23.8 }, { x: -.2, y: -24.8 }, { x: 2.1, y: -24.1 }], '#e3d8b4', .55);
  rounded(ctx, -1.8, -14.2, 3.9, 1.4, .65, '#aa7762', '#926552');
  if (off <= .01) carriedPack(back);
  arm(1, true);
  ctx.restore(); ctx.restore();
}
