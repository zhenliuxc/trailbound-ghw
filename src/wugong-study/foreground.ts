import type { Point } from "./trail";

export type ForegroundPatch = Readonly<{
  outline: readonly [Point, Point, Point, ...Point[]];
  groundLine: number;
  foliageOnly: boolean;
}>;

// Pixel-aligned painted foliage from the ground image, never a second illustration.
export const FOREGROUND_PATHS: readonly ForegroundPatch[] = [
  {
    groundLine: 941,
    foliageOnly: true,
    outline: [
      { x: 205, y: 941 }, { x: 230, y: 865 }, { x: 280, y: 815 },
      { x: 310, y: 770 }, { x: 345, y: 728 }, { x: 390, y: 693 },
      { x: 440, y: 686 }, { x: 480, y: 695 }, { x: 530, y: 660 },
      { x: 590, y: 675 }, { x: 660, y: 715 }, { x: 740, y: 739 },
      { x: 810, y: 800 }, { x: 890, y: 865 }, { x: 930, y: 941 },
    ],
  },
  {
    groundLine: 520,
    foliageOnly: false,
    outline: [
      { x: 1234, y: 366 }, { x: 1257, y: 356 }, { x: 1283, y: 353 },
      { x: 1310, y: 363 }, { x: 1338, y: 381 }, { x: 1359, y: 407 },
      { x: 1375, y: 441 }, { x: 1383, y: 469 }, { x: 1369, y: 497 },
      { x: 1338, y: 514 }, { x: 1301, y: 515 }, { x: 1252, y: 499 },
      { x: 1220, y: 481 }, { x: 1203, y: 450 }, { x: 1200, y: 421 },
      { x: 1213, y: 390 },
    ],
  },
];

export function prepareForeground(ground: HTMLImageElement): readonly { image: HTMLCanvasElement; groundLine: number }[] {
  return FOREGROUND_PATHS.map(({ outline, groundLine, foliageOnly }) => {
    const path = new Path2D();
    const first = outline[0];
    path.moveTo(first.x, first.y);
    for (const point of outline.slice(1)) path.lineTo(point.x, point.y);
    path.closePath();
    const image = document.createElement("canvas");
    image.width = ground.naturalWidth;
    image.height = ground.naturalHeight;
    const ctx = image.getContext("2d");
    if (!ctx) throw new Error("前景画面暂时无法展开");
    ctx.clip(path);
    ctx.drawImage(ground, 0, 0);
    if (foliageOnly) {
      const pixels = ctx.getImageData(0, 0, image.width, image.height);
      for (let index = 0; index < pixels.data.length; index += 4) {
        const red = pixels.data[index];
        const green = pixels.data[index + 1];
        const blue = pixels.data[index + 2];
        const leafEdge = Math.min(1, Math.max(0, (green - red + 3) / 6));
        const pigment = Math.min(1, Math.max(0, (green - blue - 8) / 12));
        pixels.data[index + 3] *= leafEdge * pigment;
      }
      ctx.putImageData(pixels, 0, 0);
    }
    return { image, groundLine };
  });
}
