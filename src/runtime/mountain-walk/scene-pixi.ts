import type * as Pixi from 'pixi.js';
import type { ImageCache } from '../contracts';
import type { MountainWalkState } from './rules';
import { CLIMB_WORLD_LENGTH, climbGroundY, climbPath, climbPose } from './climb-layout';
import type { ClimbPoint } from './climb-layout';

export type PixiRuntime = Pick<typeof Pixi, 'Application' | 'Container' | 'Texture' | 'Rectangle' | 'Sprite' | 'MeshPlane'>;
export interface MountainEngine {
  paint(state: MountainWalkState): void;
  capture(state: MountainWalkState): string | null;
  dispose(): void;
}

const LANDSCAPE = 'scenes/tiger-high-v2.webp';
const CLIFF = 'sprites/tiger-cliff-v2.webp';
const HIKER = 'sprites/tiger-hiker-side-v1.webp';
const MATERIALS = 'textures/tiger-mountain-materials-v1.webp';
export const MOUNTAIN_WALK_ASSETS = [LANDSCAPE, CLIFF, HIKER, MATERIALS];
const HIKER_FEET = [.9250, .9182, .9250, .9273, .8818, .8773, .8841, .8841];
const HIKER_VISIBLE_HEIGHT = [365, 363, 365, 366, 356, 354, 358, 357];

const HEIGHT = 720;
const ART_WIDTH = 1659;
const ART_HEIGHT = 948;
const GROUND_START = -600;
const GROUND_END = CLIMB_WORLD_LENGTH + 1000;
const GROUND_BOTTOM = 1090;
const clamp = (value: number, low = 0, high = 1): number => Math.max(low, Math.min(high, value));
const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Only the existing browser Pixi constructors cross the renderer boundary. */
function isPixiRuntime(value: unknown): value is PixiRuntime {
  return typeof value === 'object' && value !== null
    && 'Application' in value && typeof value.Application === 'function'
    && 'Container' in value && typeof value.Container === 'function'
    && 'Texture' in value && typeof value.Texture === 'function'
    && 'from' in value.Texture && typeof value.Texture.from === 'function'
    && 'Rectangle' in value && typeof value.Rectangle === 'function'
    && 'Sprite' in value && typeof value.Sprite === 'function'
    && 'MeshPlane' in value && typeof value.MeshPlane === 'function';
}

interface PaperCanvas { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D }
function paperCanvas(width: number, height: number): PaperCanvas {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(width)); canvas.height = Math.max(1, Math.ceil(height));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable for the mountain painting.');
  return { canvas, context };
}

function polygon(context: CanvasRenderingContext2D, points: readonly ClimbPoint[]): void {
  const first = points[0]; if (!first) return;
  context.beginPath(); context.moveTo(first.x, first.y);
  for (let index = 1; index < points.length; index++) context.lineTo(points[index].x, points[index].y);
  context.closePath();
}

interface PaintedCut { canvas: HTMLCanvasElement; x: number; y: number; width: number; height: number }
/** Original painted pixels and their alpha silhouette are cut once, never per frame. */
function cutPainting(image: HTMLImageElement, points: readonly ClimbPoint[]): PaintedCut {
  const x = Math.max(0, Math.floor(Math.min(...points.map(point => point.x))));
  const y = Math.max(0, Math.floor(Math.min(...points.map(point => point.y))));
  const width = Math.min(ART_WIDTH - x, Math.ceil(Math.max(...points.map(point => point.x))) - x);
  const height = Math.min(ART_HEIGHT - y, Math.ceil(Math.max(...points.map(point => point.y))) - y);
  const { canvas, context } = paperCanvas(width, height);
  context.translate(-x, -y); polygon(context, points); context.clip();
  context.drawImage(image, 0, 0, ART_WIDTH, ART_HEIGHT);
  return { canvas, x, y, width, height };
}

const RANGE_EDGE: readonly ClimbPoint[] = [
  { x: 329, y: 244 }, { x: 375, y: 173 }, { x: 410, y: 188 }, { x: 438, y: 174 },
  { x: 470, y: 205 }, { x: 510, y: 220 }, { x: 546, y: 212 }, { x: 582, y: 195 },
  { x: 621, y: 218 }, { x: 663, y: 191 }, { x: 704, y: 216 }, { x: 743, y: 219 },
  { x: 784, y: 204 }, { x: 824, y: 178 }, { x: 868, y: 165 }, { x: 908, y: 146 },
  { x: 1010, y: 234 }, { x: 1120, y: 553 }, { x: 945, y: 650 }, { x: 619, y: 525 },
  { x: 440, y: 410 },
];
const FAR_WALL_EDGE: readonly ClimbPoint[] = [
  { x: 711, y: 372 }, { x: 783, y: 314 }, { x: 831, y: 279 }, { x: 858, y: 225 },
  { x: 909, y: 185 }, { x: 937, y: 152 }, { x: 965, y: 160 }, { x: 1002, y: 113 },
  { x: 1034, y: 123 }, { x: 1074, y: 119 }, { x: 1102, y: 134 }, { x: 1134, y: 116 },
  { x: 1188, y: 99 }, { x: 1210, y: 62 }, { x: 1243, y: 52 }, { x: 1268, y: 35 },
  { x: 1296, y: 40 }, { x: 1317, y: 9 }, { x: 1336, y: 26 }, { x: 1368, y: 5 },
  { x: 1384, y: 32 }, { x: 1410, y: 23 }, { x: 1430, y: 33 }, { x: 1442, y: 56 },
  { x: 1462, y: 25 }, { x: 1490, y: 15 }, { x: 1511, y: 43 }, { x: 1546, y: 17 },
  { x: 1584, y: 53 }, { x: 1606, y: 47 }, { x: 1659, y: 74 },
  { x: 1659, y: 948 }, { x: 1275, y: 948 }, { x: 1155, y: 752 }, { x: 1052, y: 581 },
  { x: 927, y: 501 }, { x: 844, y: 440 },
];
const NEAR_SLOPE_EDGE: readonly ClimbPoint[] = [
  { x: 0, y: 0 }, { x: 126, y: 0 }, { x: 232, y: 45 }, { x: 281, y: 93 },
  { x: 319, y: 145 }, { x: 353, y: 218 }, { x: 403, y: 258 }, { x: 455, y: 293 },
  { x: 512, y: 318 }, { x: 566, y: 365 }, { x: 609, y: 382 }, { x: 664, y: 428 },
  { x: 702, y: 466 }, { x: 764, y: 492 }, { x: 799, y: 535 }, { x: 851, y: 566 },
  { x: 902, y: 627 }, { x: 945, y: 678 }, { x: 1020, y: 724 }, { x: 1088, y: 789 },
  { x: 1162, y: 847 }, { x: 1240, y: 900 }, { x: 1318, y: 948 }, { x: 0, y: 948 },
];
const RIVER_EDGE: readonly ClimbPoint[] = [
  { x: 1027, y: 575 }, { x: 1042, y: 581 }, { x: 1052, y: 602 }, { x: 1067, y: 615 },
  { x: 1079, y: 638 }, { x: 1098, y: 654 }, { x: 1101, y: 676 }, { x: 1118, y: 697 },
  { x: 1137, y: 711 }, { x: 1153, y: 734 }, { x: 1180, y: 751 }, { x: 1194, y: 774 },
  { x: 1204, y: 802 }, { x: 1237, y: 826 }, { x: 1238, y: 847 }, { x: 1260, y: 863 },
  { x: 1274, y: 889 }, { x: 1295, y: 902 }, { x: 1310, y: 926 }, { x: 1335, y: 948 },
  { x: 1371, y: 948 }, { x: 1346, y: 922 }, { x: 1322, y: 890 }, { x: 1305, y: 873 },
  { x: 1291, y: 842 }, { x: 1266, y: 819 }, { x: 1240, y: 793 }, { x: 1221, y: 773 },
  { x: 1215, y: 744 }, { x: 1190, y: 722 }, { x: 1164, y: 701 }, { x: 1144, y: 679 },
  { x: 1130, y: 653 }, { x: 1116, y: 629 }, { x: 1087, y: 602 }, { x: 1063, y: 579 },
  { x: 1044, y: 569 },
];

function skyPainting(image: HTMLImageElement): HTMLCanvasElement {
  const { canvas, context } = paperCanvas(1536, 864);
  const sky = context.createLinearGradient(0, 0, 0, 864);
  sky.addColorStop(0, '#acc8d9'); sky.addColorStop(.43, '#d4dfde'); sky.addColorStop(1, '#ede8d7');
  context.fillStyle = sky; context.fillRect(0, 0, 1536, 864);
  // The source's clear sky and small cloud wash contain no foreground mountain.
  context.globalAlpha = .46;
  context.drawImage(image, image.naturalWidth * .27, 0, image.naturalWidth * .34, image.naturalHeight * .115, 0, 0, 1536, 235);
  context.globalAlpha = 1;
  const haze = context.createLinearGradient(0, 140, 0, 500);
  haze.addColorStop(0, '#d8e0dc00'); haze.addColorStop(1, '#e6e6d9');
  context.fillStyle = haze; context.fillRect(0, 140, 1536, 724);
  return canvas;
}

/** A deterministic paper grain makes repeated loading produce the same painting. */
function randomSource(seed: number): () => number {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
}

function materialTile(image: HTMLImageElement, column: number, row: number, side: number): HTMLCanvasElement {
  const { canvas, context } = paperCanvas(side, side);
  const halfW = image.naturalWidth / 2, halfH = image.naturalHeight / 2;
  context.drawImage(image, column * halfW + 3, row * halfH + 3, halfW - 6, halfH - 6, 0, 0, side, side);
  return canvas;
}

/** The dirt ribbon and rock lip share their centreline with every boot contact. */
function hillsidePainting(materials: HTMLImageElement): PaintedCut {
  const width = GROUND_END - GROUND_START, height = GROUND_BOTTOM + 80;
  const { canvas, context } = paperCanvas(width * .82, height * .82);
  context.scale(.82, .82); context.translate(-GROUND_START, 80);
  const path = climbPath(GROUND_START, GROUND_END, 18);
  const rock = context.createPattern(materialTile(materials, 0, 0, 416), 'repeat');
  const dirt = context.createPattern(materialTile(materials, 1, 0, 286), 'repeat');
  if (!rock || !dirt) throw new Error('The painted mountain material is unavailable.');
  const lip = path.map(point => ({ x: point.x, y: point.y + 18 + Math.sin(point.x * .019) * 4 }));
  context.save();
  polygon(context, [...lip, { x: GROUND_END, y: GROUND_BOTTOM }, { x: GROUND_START, y: GROUND_BOTTOM }]); context.clip();
  context.fillStyle = rock; context.fillRect(GROUND_START, -80, width, height);
  const shadow = context.createLinearGradient(0, 370, 0, 1090);
  shadow.addColorStop(0, '#afa58322'); shadow.addColorStop(.48, '#5d66554d'); shadow.addColorStop(1, '#303f427d');
  context.fillStyle = shadow; context.fillRect(GROUND_START, -80, width, height);
  const random = randomSource(8026);
  for (let index = 0; index < 150; index++) {
    const x = GROUND_START + random() * width, top = climbGroundY(x) + 34;
    const y = top + random() * 360, length = 20 + random() * 96;
    context.beginPath(); context.moveTo(x, y); context.lineTo(x + length * .25, y + 9);
    context.lineTo(x + length * .43, y + 38); context.lineTo(x + length, y + 76);
    context.strokeStyle = `rgba(61,64,50,${.06 + random() * .09})`; context.lineWidth = 1 + random() * 2; context.stroke();
  }
  context.restore();
  const top = path.map(point => ({ x: point.x, y: point.y - 9 + Math.sin(point.x * .03) * 1.8 }));
  const bottom = path.slice().reverse().map(point => ({ x: point.x, y: point.y + 21 + Math.sin(point.x * .026) * 2.7 }));
  context.save(); polygon(context, [...top, ...bottom]); context.clip();
  context.fillStyle = dirt; context.fillRect(GROUND_START, -80, width, height);
  context.fillStyle = '#dbc59a48'; context.fillRect(GROUND_START, -80, width, height);
  for (let index = 0; index < 410; index++) {
    const x = GROUND_START + random() * width, y = climbGroundY(x) - 6 + random() * 26;
    const size = 1 + random() * 4;
    context.beginPath(); context.ellipse(x, y, size * 1.5, size * .6, random() - .5, 0, Math.PI * 2);
    context.fillStyle = index % 3 ? '#e9dcc18c' : '#625c4857'; context.fill();
  }
  context.restore();
  context.beginPath();
  path.forEach((point, index) => { const y = point.y + 22; if (!index) context.moveTo(point.x, y); else context.lineTo(point.x, y); });
  context.strokeStyle = '#625b4059'; context.lineWidth = 3.5; context.stroke();
  // Fine dry grasses belong to the ledge, leaving the boot contact strip clear.
  for (let index = 0; index < 132; index++) {
    const x = GROUND_START + random() * width, y = climbGroundY(x) + 23;
    if (x > 1780 && x < 2050) continue;
    for (let blade = 0; blade < 5; blade++) {
      const reach = 8 + random() * 20, lean = (random() - .5) * 17;
      context.beginPath(); context.moveTo(x + blade * 2, y + random() * 4);
      context.quadraticCurveTo(x + lean * .3, y - reach * .8, x + lean, y - reach);
      context.strokeStyle = blade % 2 ? '#8c886891' : '#596e548c'; context.lineWidth = .7 + random(); context.stroke();
    }
  }
  return { canvas, x: GROUND_START, y: -80, width, height };
}

function shadowPainting(): HTMLCanvasElement {
  const { canvas, context } = paperCanvas(120, 32);
  const gradient = context.createRadialGradient(60, 16, 3, 60, 16, 56);
  gradient.addColorStop(0, '#29392d5c'); gradient.addColorStop(.7, '#34432a24'); gradient.addColorStop(1, '#34432a00');
  context.scale(1, .26); context.fillStyle = gradient; context.fillRect(0, 0, 120, 124);
  return canvas;
}

function edgePainting(): HTMLCanvasElement {
  const { canvas, context } = paperCanvas(768, 540);
  const vignette = context.createRadialGradient(384, 250, 220, 384, 250, 530);
  vignette.addColorStop(0, '#293d3800'); vignette.addColorStop(1, '#26362d35');
  context.fillStyle = vignette; context.fillRect(0, 0, 768, 540);
  const random = randomSource(1728);
  for (let index = 0; index < 6500; index++) {
    context.fillStyle = index % 2 ? '#fff7df13' : '#66583e0c';
    context.fillRect(random() * 768, random() * 540, 1, 1);
  }
  return canvas;
}

async function loadImage(file: string, cache: ImageCache | undefined): Promise<HTMLImageElement> {
  const requested = cache?.request(file, 'high');
  if (requested) {
    const entry = await requested.promise;
    if (entry.state !== 'ready' || !entry.image.naturalWidth) throw new Error(`Mountain painting unavailable: ${file}`);
    return entry.image;
  }
  const image = new Image(); image.decoding = 'async'; image.src = file;
  await image.decode();
  return image;
}

function capturePainting(source: HTMLCanvasElement): string | null {
  for (const longSide of [960, 800, 640, 480]) {
    const scale = Math.min(1, longSide / Math.max(source.width, source.height));
    const { canvas, context } = paperCanvas(source.width * scale, source.height * scale);
    context.fillStyle = '#f4edda'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    for (const format of ['image/webp', 'image/jpeg']) for (const quality of [.8, .65, .52]) {
      const result = canvas.toDataURL(format, quality);
      if (result.length <= 300000 && /^data:image\/(?:webp|png|jpeg);base64,/.test(result)) return result;
    }
  }
  return null;
}

export async function createMountainScene(
  runtime: unknown, host: HTMLElement, cache: ImageCache | undefined,
  cancelled: () => boolean, onLost: () => void,
): Promise<MountainEngine | null> {
  if (!isPixiRuntime(runtime)) return null;
  const P = runtime;
  let disposed = false;
  const ownedTextures: Pixi.Texture[] = [], crops: Pixi.Texture[] = [];
  let observer: ResizeObserver | null = null, latest: MountainWalkState | null = null;
  const app = new P.Application();
  const lose = (event: Event): void => { event.preventDefault(); dispose(); onLost(); };
  function dispose(): void {
    if (disposed) return; disposed = true;
    observer?.disconnect(); observer = null; latest = null;
    try { app.canvas?.removeEventListener('webglcontextlost', lose); } catch { /* Initialization may have been cancelled. */ }
    try { app.destroy(true, { children: true }); } catch { /* An interrupted initialization owns no stage. */ }
    for (const texture of crops) texture.destroy(false);
    for (const texture of ownedTextures) texture.destroy(true);
    crops.length = 0; ownedTextures.length = 0;
  }
  try {
    const [landscapeImage, cliffImage, hikerImage, materialImage] = await Promise.all([
      loadImage(LANDSCAPE, cache), loadImage(CLIFF, cache), loadImage(HIKER, cache), loadImage(MATERIALS, cache),
    ]);
    if (cancelled()) { dispose(); return null; }
    let cssWidth = 1000, cssHeight = 620;
    const measure = (): void => {
      const box = host.getBoundingClientRect();
      if (box.width > 0 && box.height > 0) { cssWidth = box.width; cssHeight = box.height; }
    };
    const logicalWidth = (): number => HEIGHT * cssWidth / cssHeight;
    const resolution = (): number => Math.max(.25, Math.min(2, cssHeight / HEIGHT * Math.min(2, globalThis.devicePixelRatio || 1), Math.sqrt(2500000 / (logicalWidth() * HEIGHT))));
    measure();
    await app.init({ width: logicalWidth(), height: HEIGHT, resolution: resolution(), autoDensity: true,
      antialias: true, autoStart: false, preference: 'webgl', backgroundColor: 0xe5e8dc, backgroundAlpha: 1 });
    if (cancelled()) { dispose(); return null; }
    const texture = (source: HTMLImageElement | HTMLCanvasElement): Pixi.Texture => {
      const created = P.Texture.from(source, true); ownedTextures.push(created); return created;
    };
    const crop = (source: Pixi.Texture, x: number, y: number, width: number, height: number): Pixi.Texture => {
      const created = new P.Texture({ source: source.source, frame: new P.Rectangle(x, y, width, height) });
      crops.push(created); return created;
    };
    const artSprite = (cut: PaintedCut): Pixi.Sprite => {
      const sprite = new P.Sprite(texture(cut.canvas)); sprite.width = cut.width; sprite.height = cut.height; return sprite;
    };
    const rangeCut = cutPainting(landscapeImage, RANGE_EDGE), wallCut = cutPainting(landscapeImage, FAR_WALL_EDGE);
    const nearCut = cutPainting(landscapeImage, NEAR_SLOPE_EDGE), waterCut = cutPainting(landscapeImage, RIVER_EDGE);
    const groundCut = hillsidePainting(materialImage);
    const scene = new P.Container(), farRange = new P.Container(), farWall = new P.Container();
    const backSlope = new P.Container(), terrain = new P.Container(), front = new P.Container();
    const sky = new P.Sprite(texture(skyPainting(landscapeImage)));
    const range = artSprite(rangeCut), wall = artSprite(wallCut), near = artSprite(nearCut), ground = artSprite(groundCut);
    range.position.set(rangeCut.x, rangeCut.y); wall.position.set(wallCut.x, wallCut.y);
    near.position.set(-750 + nearCut.x * 1.15, -220 + nearCut.y * 1.15); near.scale.set(1.15);
    ground.position.set(groundCut.x, groundCut.y);
    const river = new P.MeshPlane({ texture: texture(waterCut.canvas), verticesX: 13, verticesY: 22 });
    river.position.set(waterCut.x, waterCut.y); river.width = waterCut.width; river.height = waterCut.height;
    const originalWater = new Float32Array(river.geometry.getBuffer('aPosition').data);
    const cliffTexture = texture(cliffImage);
    const rockFace = crop(cliffTexture, 0, 0, Math.floor(cliffImage.naturalWidth * .202), cliffImage.naturalHeight);
    const corner = crop(cliffTexture, Math.floor(cliffImage.naturalWidth * .705), Math.floor(cliffImage.naturalHeight * .68), Math.floor(cliffImage.naturalWidth * .295), Math.floor(cliffImage.naturalHeight * .32));
    const shoulder = new P.Sprite(rockFace);
    shoulder.position.set(760, climbGroundY(850) - 410); shoulder.height = 545; shoulder.scale.x = shoulder.scale.y;
    const entryRock = new P.Sprite(rockFace);
    entryRock.position.set(-420, climbGroundY(-290) - 570); entryRock.height = 810; entryRock.scale.x = entryRock.scale.y;
    const shrubs: Array<{ sprite: Pixi.Sprite; x: number; height: number; sway: number }> = [];
    for (const [index, x] of [-170, 230, 570, 1145, 1575, 2150, 2520].entries()) {
      const sprite = new P.Sprite(corner), height = index % 3 === 0 ? 165 : 112;
      sprite.anchor.set(.65, 1); sprite.position.set(x, climbGroundY(x) + height * .86);
      sprite.height = height; sprite.scale.x = sprite.scale.y;
      shrubs.push({ sprite, x, height, sway: (index % 3 - 1) * .004 }); front.addChild(sprite);
    }
    const hikerTexture = texture(hikerImage), frameWidth = hikerImage.naturalWidth / 4, frameHeight = hikerImage.naturalHeight / 2;
    const actorFrames = HIKER_FEET.map((_, index) => crop(hikerTexture, index % 4 * frameWidth, Math.floor(index / 4) * frameHeight, frameWidth, frameHeight));
    const actor = new P.Sprite(actorFrames[0]); actor.anchor.set(.5, HIKER_FEET[0]);
    actor.scale.set(184 / HIKER_VISIBLE_HEIGHT[0]);
    const shadow = new P.Sprite(texture(shadowPainting())); shadow.anchor.set(.5, .5); shadow.width = 72; shadow.height = 18;
    const edge = new P.Sprite(texture(edgePainting()));
    app.stage.eventMode = 'none'; app.stage.addChild(scene);
    farRange.addChild(range); farWall.addChild(wall, river); backSlope.addChild(near);
    terrain.addChild(ground, shadow, actor); front.addChild(entryRock, shoulder);
    scene.addChild(sky, farRange, farWall, backSlope, terrain, front, edge);
    app.canvas.className = 'mini-game-canvas mountain-walk-canvas tiger-layered-canvas';
    app.canvas.setAttribute('aria-hidden', 'true'); app.canvas.setAttribute('data-ready', 'true');
    app.canvas.addEventListener('webglcontextlost', lose); host.appendChild(app.canvas);

    function paint(state: MountainWalkState): void {
      if (disposed || cancelled()) return;
      latest = state;
      const width = logicalWidth(), res = resolution();
      if (Math.abs(app.screen.width - width) > .1 || Math.abs(app.renderer.resolution - res) > .01) app.renderer.resize(width, HEIGHT, res);
      const pose = climbPose(state.distance), opening = state.gorgeOpenness;
      const zoom = mix(1.04, .92, opening), narrow = width < 760;
      const anchorX = width * mix(narrow ? .39 : .35, narrow ? .34 : .31, opening);
      const lookX = state.look.yaw * (narrow ? 54 : 90), lookY = state.look.pitch * 98;
      const feetY = HEIGHT * mix(.765, .77, opening) + lookY;
      const cameraX = pose.x - anchorX / zoom;
      const cameraY = feetY - pose.y * zoom;
      sky.width = width + 160; sky.height = HEIGHT + 60; sky.position.set(-80 - lookX * .1, -30 + lookY * .08);
      const farScale = HEIGHT * (1.105 - opening * .035) / ART_HEIGHT;
      const farX = width * (narrow ? .66 : .6) - ART_WIDTH * .64 * farScale - pose.x * .041 - lookX * .21 + opening * 40;
      const farY = -54 + (555 - pose.y) * .12 + lookY * .22;
      farRange.scale.set(farScale * .97); farRange.position.set(farX + 25 - pose.x * .009 - lookX * .1, farY + 1);
      farWall.scale.set(farScale); farWall.position.set(farX, farY);
      backSlope.scale.set(zoom); backSlope.position.set(-cameraX * .88 * zoom - lookX * .7, cameraY * .88 + 35);
      terrain.scale.set(zoom); terrain.position.set(-cameraX * zoom - lookX, cameraY);
      front.scale.set(zoom); front.position.copyFrom(terrain.position);
      shadow.position.set(pose.x - 1, pose.y + 5); shadow.rotation = pose.heading;
      const cycle = ((state.distance - .36) / 1.44 % 1 + 1) % 1;
      const frame = Math.min(7, Math.floor(cycle * 8));
      actor.texture = actorFrames[frame];
      actor.anchor.set(.5, HIKER_FEET[frame]);
      actor.scale.set(184 / HIKER_VISIBLE_HEIGHT[frame]);
      actor.position.set(pose.x, pose.y + 1);
      actor.rotation = clamp(pose.grade * .2, 0, .045);
      for (const shrub of shrubs) {
        shrub.sprite.rotation = state.play.reduced ? 0 : Math.sin(state.age * 1.08 + shrub.x * .04) * shrub.sway;
      }
      if (!state.play.reduced) {
        const buffer = river.geometry.getBuffer('aPosition'), vertices = buffer.data;
        for (let index = 0; index < vertices.length; index += 2) {
          const x = originalWater[index], y = originalWater[index + 1], depth = y / waterCut.height;
          vertices[index] = x + Math.sin(y * .08 - state.age * 2.1) * (.45 + depth * .55);
          vertices[index + 1] = y + Math.sin(x * .11 + y * .035 - state.age * 2.8) * .65;
        }
        buffer.update();
      } else {
        const buffer = river.geometry.getBuffer('aPosition'); buffer.data.set(originalWater); buffer.update();
      }
      edge.width = width; edge.height = HEIGHT;
      app.render();
    }
    observer = new ResizeObserver(() => { if (disposed) return; measure(); if (latest) paint(latest); });
    observer.observe(host);
    return {
      paint, dispose,
      capture(state) {
        if (disposed || cancelled()) return null;
        try {
          paint(state);
          // Copy immediately after this render. No asynchronous frame can change the chosen view.
          return capturePainting(app.canvas);
        } catch { return null; }
      },
    };
  } catch (error) {
    dispose();
    if (!cancelled()) console.warn('Layered mountain painting could not open:', error);
    return null;
  }
}
