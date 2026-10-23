import type { GameAssets, ImageCache, MiniInput, MiniViewRefs, SvgFactory } from '../contracts';
import { BAG, BEAT_SECONDS, DEPTH_NAMES, ITEMS, VOICES, bellDirection, canPack, itemCells, itemSize, packedPiece } from './rules';
import type { Cell, TigerKind, TigerState } from './rules';
import { PROP_FRAMES, TIGER_BACKGROUND, TIGER_PAINTINGS, TIGER_PROPS, TIGER_SCENES } from './assets';

interface Rect { x: number; y: number; w: number; h: number }
interface Hit extends Rect { action: string; value?: number }
interface Layout { hits: Hit[]; grid?: Rect & { cell: number }; cards?: Rect[]; notes?: Rect[]; trays?: Rect[]; landscape?: Rect }
export interface TigerRefs extends MiniViewRefs {
  tiger: true; game: TigerKind; root: SVGElement; svg: SvgFactory; width: number; height: number;
  nodes: Map<string, SVGElement>; live: Set<string>; layout: Layout; latest?: TigerState; observer?: ResizeObserver; host?: HTMLElement;
}
const colors = { ink: '#334d49', muted: '#64766a', paper: '#faf4e4', gold: '#aa8551', blue: '#6c969d', green: '#819b77' };
const inside = (r: Rect, x: number, y: number) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
const set = (node: Element, attrs: Record<string, string | number>) => { for (const [name, v] of Object.entries(attrs)) if (node.getAttribute(name) !== String(v)) node.setAttribute(name, String(v)); };
function node(r: TigerRefs, key: string, tag: string, attrs: Record<string, string | number>, parent: Element = r.root) {
  let el = r.nodes.get(key);
  if (!el) { el = r.svg(tag, {}, parent); r.nodes.set(key, el); }
  r.live.add(key); set(el, { ...attrs, display: '' }); return el;
}
function label(r: TigerRefs, key: string, text: string, x: number, y: number, size = 14, fill = colors.ink, anchor = 'start', parent?: Element) {
  const el = node(r, key, 'text', { x, y, fill, 'font-size': size, 'text-anchor': anchor, 'font-family': 'Georgia, "Songti SC", "Noto Serif SC", serif', 'paint-order': 'stroke', stroke: '#faf4e477', 'stroke-width': .7 }, parent);
  if (el.textContent !== text) el.textContent = text; return el;
}
function paper(r: TigerRefs, key: string, box: Rect, selected = false, parent?: Element) {
  return node(r, key, 'rect', { x: box.x, y: box.y, width: box.w, height: box.h, rx: 9, fill: colors.paper, 'fill-opacity': selected ? .96 : .85, stroke: selected ? colors.gold : '#b8b69c', 'stroke-opacity': selected ? .9 : .5, 'stroke-width': selected ? 2 : 1 }, parent);
}
function sprite(r: TigerRefs, key: string, frame: number, box: Rect, rotation = 0, opacity = 1) {
  const source = PROP_FRAMES[frame];
  const g = node(r, key, 'g', { transform: 'translate(' + (box.x + box.w / 2) + ' ' + (box.y + box.h / 2) + ') rotate(' + rotation * 90 + ')', opacity });
  const crop = node(r, key + '-crop', 'svg', { x: -box.w / 2, y: -box.h / 2, width: box.w, height: box.h, viewBox: [source.x, source.y, source.w, source.h].join(' '), preserveAspectRatio: 'xMidYMid meet', overflow: 'hidden' }, g);
  node(r, key + '-image', 'image', { href: TIGER_PROPS, width: 1280, height: 1280 }, crop);
}
function painting(r: TigerRefs, key: string, file: string, box: Rect, opacity = 1) { node(r, key, 'image', { href: file, x: box.x, y: box.y, width: box.w, height: box.h, opacity, preserveAspectRatio: 'xMidYMid meet' }); }
function chip(r: TigerRefs, key: string, text: string, box: Rect, selected: boolean, action: string, value?: number) {
  paper(r, key, box, selected); label(r, key + '-label', text, box.x + box.w / 2, box.y + box.h / 2 + 5, 14, colors.ink, 'middle'); r.layout.hits.push({ ...box, action, value });
}
function backdrop(r: TigerRefs, s: TigerState) {
  node(r, 'background', 'image', { href: TIGER_SCENES[s.game], x: 0, y: 0, width: r.width, height: r.height, preserveAspectRatio: s.game === 'packing' || s.game === 'score' ? 'xMinYMid slice' : 'xMidYMid slice', opacity: s.game === 'packing' ? .85 : 1 });
  node(r, 'wash', 'rect', { width: r.width, height: r.height, fill: colors.paper, opacity: s.game === 'packing' ? .14 : .08 });
}

function depthScene(r: TigerRefs, s: Extract<TigerState, { game: 'depth' }>) {
  const { width: w, height: h } = r, gap = Math.max(7, w * .009), p = Math.max(12, w * .018);
  const cardH = Math.max(82, Math.min(150, h * .25)), stripY = h - cardH - 16;
  // Each painted source layer and its clip move together. The untouched full
  // painting underneath fills disoccluded edges; no artificial geometry replaces it.
  const scene = node(r, 'depth-scene', 'svg', { x: 0, y: 0, width: w, height: stripY - 24, viewBox: '0 0 1280 720', preserveAspectRatio: 'xMidYMid slice', overflow: 'hidden' });
  node(r, 'depth-base', 'image', { href: TIGER_BACKGROUND, width: 1280, height: 720 }, scene);
  const masks = ['0,0 1280,0 1280,315 0,315', '420,270 940,270 850,720 390,720', '780,0 1280,0 1280,720 650,720 810,400', '0,0 425,0 540,300 390,720 0,720'];
  const amount = [3, 14, 33, 58];
  for (let i = 0; i < 4; i++) {
    const layer = node(r, 'depth-layer-' + i, 'g', { transform: 'translate(' + ((s.depth.camera - .5) * amount[i]) + ' 0)' }, scene);
    const clipId = 'tiger-depth-' + i, clip = node(r, 'depth-clip-' + i, 'clipPath', { id: clipId }, layer);
    node(r, 'depth-mask-' + i, 'polygon', { points: masks[i] }, clip);
    node(r, 'depth-art-' + i, 'image', { href: TIGER_BACKGROUND, width: 1280, height: 720, 'clip-path': 'url(#' + clipId + ')' }, layer);
  }
  const buttonW = Math.min(145, (w - p * 2 - 10) / 2);
  chip(r, 'left-view', (s.depth.seen & 1 ? '✓ ' : '') + '左边观景', { x: p, y: 12, w: buttonW, h: 44 }, s.depth.view === 0, 'view', 0);
  chip(r, 'right-view', (s.depth.seen & 2 ? '✓ ' : '') + '右边观景', { x: w - p - buttonW, y: 12, w: buttonW, h: 44 }, s.depth.view === 1, 'view', 1);
  const strip = { x: 0, y: stripY - 24, w, h: cardH + 40 };
  node(r, 'depth-paper', 'rect', { x: strip.x, y: strip.y, width: strip.w, height: strip.h, fill: colors.paper, opacity: .95 });
  label(r, 'depth-direction', '近处  →  远处', p, stripY - 6, 13, colors.muted);
  const cw = (w - p * 2 - gap * 3) / 4, cards: Rect[] = [];
  const crop = ['0 90 470 580', '700 300 580 420', '450 315 360 405', '290 0 690 285'];
  s.depth.order.forEach((id, i) => {
    const box = { x: p + i * (cw + gap), y: stripY + 3, w: cw, h: cardH - 5 }; cards.push(box);
    paper(r, 'card-' + i, box, s.depth.selected === i || s.depth.target === i);
    const thumb = node(r, 'card-thumb-' + i, 'svg', { x: box.x + 4, y: box.y + 4, width: box.w - 8, height: box.h - 32, viewBox: crop[id], preserveAspectRatio: 'xMidYMid slice', overflow: 'hidden' });
    node(r, 'card-picture-' + i, 'image', { href: TIGER_BACKGROUND, width: 1280, height: 720 }, thumb);
    label(r, 'card-title-' + i, DEPTH_NAMES[id], box.x + box.w / 2, box.y + box.h - 10, w < 420 ? 12 : 14, colors.ink, 'middle');
    r.layout.hits.push({ ...box, action: 'depth-card', value: i });
  }); r.layout.cards = cards;
}

function packScene(r: TigerRefs, s: Extract<TigerState, { game: 'packing' }>) {
  const { width: w, height: h } = r, wide = w >= 700;
  const c = Math.max(12, Math.min(wide ? w * .62 / 7.3 : (w - 16) / 7.3, wide ? (h - 15) / 7.3 : h * .66 / 7.3));
  const bagW = c * 7.3, bagH = c * 7.3, bx = wide ? (w * .62 - bagW) / 2 : (w - bagW) / 2, by = wide ? (h - bagH) / 2 : 0;
  sprite(r, 'backpack', 0, { x: bx, y: by, w: bagW, h: bagH });
  const grid = { x: bx + c * 1.15, y: by + c * 1.3, w: c * 5, h: c * 4, cell: c }; r.layout.grid = grid;
  const rim = { x: grid.x - 2, y: grid.y - Math.max(18, c * .55), w: grid.w + 4, h: Math.max(16, c * .5) };
  node(r, 'bag-rim', 'rect', { x: rim.x, y: rim.y, width: rim.w, height: rim.h, rx: 7, fill: '#e4d3a9', opacity: .94 });
  label(r, 'bag-rim-label', s.bag.closed ? '收好了，继续走' : '袋口 · 留空', rim.x + rim.w / 2, rim.y + rim.h / 2 + 4, Math.min(13, Math.max(10, c * .3)), colors.ink, 'middle');
  if (s.bag.closed) {
    node(r, 'bag-closed', 'rect', { x: grid.x, y: grid.y, width: grid.w, height: grid.h, rx: 18, fill: '#8e8b62', opacity: .92 });
    label(r, 'bag-closed-label', '五件行李，一段歇脚', grid.x + grid.w / 2, grid.y + grid.h / 2, Math.min(17, c * .38), colors.paper, 'middle');
  } else {
    for (let y = 0; y < BAG.rows; y++) for (let x = 0; x < BAG.columns; x++) node(r, 'bag-cell-' + x + '-' + y, 'rect', { x: grid.x + x * c, y: grid.y + y * c, width: c, height: c, fill: '#d8c7a5', 'fill-opacity': .6, stroke: '#655d4380', 'stroke-width': .65 });
    s.bag.poses.forEach((pose, i) => {
      if (!pose.cell || s.bag.held?.piece === i) return;
      const cells = itemCells(i, pose.rotation), size = itemSize(i, pose.rotation), original = itemSize(i, 0);
      cells.forEach((cell, j) => node(r, 'packed-cell-' + i + '-' + j, 'rect', { x: grid.x + (pose.cell!.x + cell.x) * c + 1, y: grid.y + (pose.cell!.y + cell.y) * c + 1, width: c - 2, height: c - 2, rx: 4, fill: '#faf0cf', 'fill-opacity': .35, stroke: s.bag.selected === i ? colors.gold : '#6d755650', 'stroke-width': s.bag.selected === i ? 1.8 : .5 }));
      const cx = grid.x + (pose.cell.x + size.x / 2) * c, cy = grid.y + (pose.cell.y + size.y / 2) * c;
      sprite(r, 'packed-item-' + i, ITEMS[i].frame, { x: cx - original.x * c / 2, y: cy - original.y * c / 2, w: original.x * c - 4, h: original.y * c - 4 }, pose.rotation);
    });
    const cursor = s.bag.cursor;
    node(r, 'bag-cursor', 'rect', { x: grid.x + cursor.x * c + 3, y: grid.y + cursor.y * c + 3, width: c - 6, height: c - 6, rx: 3, fill: 'none', stroke: '#526b6480', 'stroke-width': 1, 'stroke-dasharray': '3 4' });
  }
  const tray = wide ? { x: w * .64, y: 34, w: w * .34 - 12, h: h - 45 } : { x: 10, y: Math.min(h * .66 + 3, bagH), w: w - 20, h: h - Math.min(h * .66 + 3, bagH) - 6 };
  const cols = wide ? 2 : 3, rows = wide ? 3 : 2, tw = tray.w / cols, th = tray.h / rows;
  const trays: Rect[] = [];
  if (wide) { painting(r, 'rest-painting', TIGER_PAINTINGS.packing, { x: Math.max(6, bx - c * .8), y: 8, w: Math.min(90, w * .1), h: Math.min(90, h * .2) }, .85); label(r, 'rest-location', '雪山前，歇一歇', tray.x, 22, 14, colors.muted); }
  ITEMS.forEach((item, i) => {
    const box = { x: tray.x + i % cols * tw + 3, y: tray.y + Math.floor(i / cols) * th + 3, w: tw - 6, h: th - 6 }; trays.push(box);
    paper(r, 'tray-' + i, box, s.bag.selected === i);
    if (!s.bag.poses[i].cell) {
      const rotation = s.bag.poses[i].rotation, iw = box.w - 16, ih = Math.max(12, box.h - 28), sw = rotation % 2 ? ih : iw, sh = rotation % 2 ? iw : ih;
      sprite(r, 'tray-item-' + i, item.frame, { x: box.x + box.w / 2 - sw / 2, y: box.y + 4 + ih / 2 - sh / 2, w: sw, h: sh }, rotation);
    }
    else label(r, 'tray-check-' + i, '✓', box.x + box.w / 2, box.y + box.h * .5, 22, colors.green, 'middle');
    label(r, 'tray-name-' + i, item.name, box.x + box.w / 2, box.y + box.h - 7, Math.min(14, Math.max(11, th * .18)), colors.ink, 'middle');
    r.layout.hits.push({ ...box, action: 'pack-piece', value: i });
  }); r.layout.trays = trays;
  if (s.bag.held && !s.bag.closed) {
    const { piece: i, at } = s.bag.held, rotation = s.bag.poses[i].rotation, cell = { x: Math.floor(at.x + .5), y: Math.floor(at.y + .5) };
    const valid = canPack(s, i, cell), size = itemSize(i, rotation), original = itemSize(i, 0);
    for (const [j, part] of itemCells(i, rotation).entries()) node(r, 'preview-' + j, 'rect', { x: grid.x + (cell.x + part.x) * c + 2, y: grid.y + (cell.y + part.y) * c + 2, width: c - 4, height: c - 4, rx: 4, fill: valid ? '#a7b58b' : '#bd9276', 'fill-opacity': .55, stroke: valid ? '#5e7958' : '#925d4c', 'stroke-width': 1.5 });
    const cx = grid.x + (at.x + size.x / 2) * c, cy = grid.y + (at.y + size.y / 2) * c;
    sprite(r, 'held-item', ITEMS[i].frame, { x: cx - original.x * c / 2, y: cy - original.y * c / 2, w: original.x * c - 4, h: original.y * c - 4 }, rotation, .92);
  }
}

function scoreScene(r: TigerRefs, s: Extract<TigerState, { game: 'score' }>) {
  const { width: w, height: h } = r, wide = w >= 580;
  const art = { x: 0, y: 0, w: w * .31, h };
  if (!wide) label(r, 'score-caption', '八拍水帘 · 点格子落一笔声音', w / 2, 28, 14, colors.ink, 'middle');
  const board = { x: wide ? w * .32 : 12, y: wide ? Math.max(30, h * .12) : 62, w: wide ? w * .66 - 5 : w - 24, h: wide ? h * .76 : h - 72 };
  const split = !wide, cols = split ? 4 : 8, rows = split ? 6 : 3, labelW = 37;
  const cellW = (board.w - labelW) / cols, cellH = Math.min(wide ? 140 : 60, (board.h - (split ? 40 : 22)) / rows);
  const notes: Rect[] = [];
  paper(r, 'score-paper', { x: board.x - 5, y: board.y - 21, w: board.w + 10, h: rows * cellH + (split ? 40 : 22) }, false);
  for (let beat = 0; beat < 8; beat++) {
    const half = split ? Math.floor(beat / 4) : 0, col = beat % cols;
    const x = board.x + labelW + col * cellW, baseY = board.y + half * (cellH * 3 + 24);
    label(r, 'beat-number-' + beat, String(beat + 1), x + cellW / 2, baseY - 5, 12, colors.muted, 'middle');
    for (let voice = 0; voice < 3; voice++) {
      const i = voice * 8 + beat, box = { x: x + 3, y: baseY + voice * cellH, w: cellW - 6, h: cellH - 5 }; notes[i] = box;
      const active = s.score.notes[voice][beat], current = s.score.playing && s.score.beat === beat;
      const color = [colors.blue, '#a08c5b', colors.green][voice];
      node(r, 'note-' + i, 'rect', { x: box.x, y: box.y, width: box.w, height: box.h, rx: 7, fill: active ? color : '#f4ebd7', 'fill-opacity': active ? .6 : .8, stroke: current ? colors.ink : s.score.cursor === i ? colors.gold : '#a6b4a0', 'stroke-width': current ? 2.4 : 1, 'stroke-dasharray': s.score.cursor === i && !current ? '3 3' : 'none' });
      if (active) {
        const yy = box.y + box.h / 2, xx = box.x + box.w / 2;
        node(r, 'note-mark-' + i, 'path', { d: voice === 0 ? 'M ' + (xx - 9) + ' ' + (yy - 4) + ' q 5 -8 10 0 t 10 0 M ' + (xx - 9) + ' ' + (yy + 5) + ' q 5 -8 10 0 t 10 0' : voice === 1 ? 'M ' + xx + ' ' + (yy - 10) + ' q -13 15 0 19 q 13 -4 0 -19 Z' : 'M ' + (xx - 11) + ' ' + yy + ' q 20 -12 21 -3 q 0 7 -9 5 M ' + (xx - 8) + ' ' + (yy + 8) + ' q 10 -4 17 -2', stroke: '#fffbed', 'stroke-width': 1.7, fill: voice === 1 ? '#fffbed' : 'none', 'stroke-linecap': 'round' });
      }
      r.layout.hits.push({ ...box, action: 'note', value: i });
      if (col === 0) label(r, 'voice-' + half + '-' + voice, VOICES[voice], board.x + 2, box.y + box.h / 2 + 5, 13, colors.ink);
    }
  }
  r.layout.notes = notes;
  if (s.score.playing) {
    const q = s.score.clock / BEAT_SECONDS - Math.floor(s.score.clock / BEAT_SECONDS);
    for (let voice = 0; voice < 3; voice++) if (s.score.notes[voice][s.score.beat]) {
      const box = notes[voice * 8 + s.score.beat];
      node(r, 'beat-ripple-' + voice, 'ellipse', { cx: box.x + box.w / 2, cy: box.y + box.h / 2, rx: Math.max(2, box.w * .38 * q), ry: Math.max(2, box.h * .38 * q), fill: 'none', stroke: '#fffef0', 'stroke-width': 2, opacity: s.play.reduced ? .7 : 1 - q });
    }
    if (wide) {
      const water = s.score.notes[0][s.score.beat], drop = s.score.notes[1][s.score.beat], wind = s.score.notes[2][s.score.beat];
      for (let i = 0; i < 9; i++) {
        const x = art.x + art.w * (.30 + i * .041), y = art.y + art.h * (.3 + (q + i * .08) % 1 * .4);
        node(r, 'fall-line-' + i, 'path', { d: 'M ' + x + ' ' + y + ' q ' + (wind ? 9 : 3) + ' 14 0 ' + (water ? 37 : 12), fill: 'none', stroke: '#eef5e3', 'stroke-width': drop && i % 2 ? 3 : 1.5, opacity: water || drop || wind ? .65 : 0 });
      }
    }
  }
}

function bellsScene(r: TigerRefs, s: Extract<TigerState, { game: 'bells' }>) {
  const { width: w, height: h } = r, b = s.bells, found = b.junction === 2;
  if (b.wrong) node(r, 'wrong-wash', 'rect', { width: w, height: h, fill: '#6b6456', opacity: .32 });
  const title = found ? '转角后的山路旅伴' : b.wrong ? '山壁前的小路' : '第' + (b.junction + 1) + '个转弯';
  paper(r, 'trail-caption', { x: Math.max(10, w / 2 - 135), y: 12, w: Math.min(270, w - 20), h: 42 });
  label(r, 'trail-title', title, w / 2, 39, 16, colors.ink, 'middle');
  if (!found) {
    const dir = bellDirection(s), x = w * (dir === 0 ? .18 : .82), y = h * .28, elapsed = s.age - b.pulseAt, q = Math.min(1, elapsed / 1.4);
    sprite(r, 'bell', 8, { x: x - 20, y: y - 42, w: 40, h: 78 }, 0, b.wrong ? .5 : 1);
    for (let i = 0; i < 3; i++) {
      const radius = 17 + i * 10 + (s.play.reduced ? 0 : q * 32);
      node(r, 'bell-pulse-' + i, 'path', { d: 'M ' + (x + (dir === 0 ? 1 : -1) * radius * .6) + ' ' + (y - radius) + ' Q ' + (x + (dir === 0 ? 1 : -1) * radius * 1.55) + ' ' + y + ' ' + (x + (dir === 0 ? 1 : -1) * radius * .6) + ' ' + (y + radius), stroke: '#fbf4d2', 'stroke-width': 2, fill: 'none', opacity: b.wrong ? .2 : s.play.reduced ? .65 : Math.max(.08, (1 - q) * .8) });
    }
    label(r, 'bell-distance', b.wrong ? '隔着山壁 · 更远' : b.junction ? '近一些了' : '铃声在转角后', x, y + 65, w < 430 ? 12 : 14, '#fdf7e8', 'middle');
    if (b.wrong) chip(r, 'trail-back', '↶ 沿原路返回', { x: w / 2 - 82, y: h - 75, w: 164, h: 48 }, false, 'return');
    else {
      const pathY = h - 80, pathW = Math.min(210, w * .41);
      for (let dir = 0; dir < 2; dir++) {
        const box = { x: dir === 0 ? w * .07 : w * .93 - pathW, y: pathY, w: pathW, h: 54 };
        node(r, 'trail-path-' + dir, 'path', { d: 'M ' + w / 2 + ' ' + (h + 8) + ' Q ' + (dir ? w * .7 : w * .3) + ' ' + (h * .7) + ' ' + (dir ? w * .83 : w * .17) + ' ' + (h * .55), stroke: '#f6edcf', 'stroke-width': 6, 'stroke-opacity': .6, fill: 'none', 'stroke-linecap': 'round' });
        chip(r, 'trail-choice-' + dir, dir === 0 ? '↖ 左边山路' : '右边山路 ↗', box, false, 'branch', dir);
      }
    }
  } else {
    const elapsed = s.age - b.movedAt, drift = s.play.reduced ? 0 : b.passing ? -elapsed * w * .27 : (1 - Math.min(1, elapsed / 1.2)) * w * .35;
    const size = Math.min(w * .68, h * 1.05), pose = s.play.reduced ? 6 : Math.floor(s.age / .38) % 2 + 6;
    sprite(r, 'mule-guide', pose, { x: w * .51 - size / 2 + drift, y: h - size - 12, w: size, h: size });
    if (!b.passing) label(r, 'guide-line', '「借过，慢慢走。」', w / 2, h - 17, 15, colors.ink, 'middle');
  }
}

export function drawTiger(svg: SvgFactory, parent: Element, game: TigerKind): TigerRefs {
  const root = svg('g', { class: 'tiger-scene' }, parent);
  return { tiger: true, game, root, svg, width: 800, height: 500, nodes: new Map(), live: new Set(), layout: { hits: [] }, contentState: 'loading' };
}
export function paintTiger(r: TigerRefs, s: TigerState) {
  if (r.disposed) return; r.latest = s; r.live.clear(); r.layout = { hits: [] };
  set(r.root.parentElement!, { viewBox: '0 0 ' + r.width + ' ' + r.height, preserveAspectRatio: 'none' });
  backdrop(r, s);
  if (r.contentState === 'ready') {
    if (s.game === 'depth') depthScene(r, s); else if (s.game === 'packing') packScene(r, s); else if (s.game === 'score') scoreScene(r, s); else bellsScene(r, s);
  } else {
    node(r, 'loading-paper', 'rect', { x: 0, y: 0, width: r.width, height: r.height, fill: colors.paper, opacity: .84 });
    label(r, 'loading-label', r.contentState === 'error' ? '画作未能展开，可重试或继续走。' : '江谷画作正在展开…', r.width / 2, r.height / 2, 16, colors.ink, 'middle');
  }
  for (const [key, el] of r.nodes) if (!r.live.has(key)) set(el, { display: 'none' });
}
export function tigerPoint(r: TigerRefs, p: MiniInput): MiniInput {
  const x = (p.x ?? -1) * r.width, y = (p.y ?? -1) * r.height;
  const grid = r.layout.grid;
  if (r.game === 'packing' && grid && r.latest?.game === 'packing') {
    const gx = (x - grid.x) / grid.cell, gy = (y - grid.y) / grid.cell;
    if (inside(grid, x, y)) { const piece = packedPiece(r.latest, gx, gy); return { ...p, action: piece >= 0 ? 'pack-piece' : 'pack-cell', value: piece, x: gx, y: gy }; }
    const hit = r.layout.hits.find(b => inside(b, x, y));
    const action = hit?.action === 'pack-piece' && r.latest.bag.poses[hit.value!].cell ? 'select-piece' : hit?.action || 'outside';
    return { ...p, action, value: hit?.value, x: gx, y: gy };
  }
  const hit = r.layout.hits.find(b => inside(b, x, y));
  return { ...p, action: hit?.action || 'outside', value: hit?.value };
}
export function tigerAssets(game: TigerKind): GameAssets { return { scene: TIGER_SCENES[game], actor: TIGER_PROPS, front: TIGER_PAINTINGS[game] }; }
export async function mountTiger(r: TigerRefs, host: HTMLElement, cache?: ImageCache) {
  r.host = host;
  const resize = () => { if (r.disposed) return; const box = host.getBoundingClientRect(); if (box.width <= 0 || box.height <= 0) return; r.width = box.width; r.height = box.height; if (r.latest) paintTiger(r, r.latest); };
  if (typeof ResizeObserver !== 'undefined') { r.observer = new ResizeObserver(resize); r.observer.observe(host); } resize();
  if (!cache) { r.contentState = 'error'; return; }
  const paths = [TIGER_SCENES[r.game], TIGER_PROPS, TIGER_PAINTINGS[r.game]];
  const results = await Promise.all(paths.map(path => cache.request(path, 'high')?.promise));
  if (r.disposed) return;
  r.contentState = results.every(asset => asset?.state === 'ready') ? 'ready' : 'error';
  if (r.latest) paintTiger(r, r.latest);
}
export function disposeTiger(r: TigerRefs) { r.disposed = true; r.observer?.disconnect(); r.latest = undefined; r.root.remove(); r.nodes.clear(); r.live.clear(); }
