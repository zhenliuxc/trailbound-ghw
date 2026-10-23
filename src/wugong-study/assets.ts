export type WalkFrame = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  footX: number;
  footY: number;
}>;

export type WalkAtlas = Readonly<{
  width: number;
  height: number;
  columns: 4;
  rows: 2;
  frames: readonly [WalkFrame, ...WalkFrame[]];
  referenceHeight: number;
}>;

export type StudyAssets = Readonly<{
  ground: HTMLImageElement;
  walker: HTMLImageElement;
  atlas: WalkAtlas;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseFrame(value: unknown, sheetWidth: number, sheetHeight: number): WalkFrame {
  if (!isRecord(value)) throw new Error("人物帧数据无法读取");
  const { x, y, width, height, footX, footY } = value;
  if (!isFiniteNumber(x) || !isFiniteNumber(y)
    || !isFiniteNumber(width) || !isFiniteNumber(height)
    || !isFiniteNumber(footX) || !isFiniteNumber(footY)
    || x < 0 || y < 0 || width <= 0 || height <= 0
    || x + width > sheetWidth || y + height > sheetHeight
    || footX < 0 || footX > width || footY < 0 || footY > height) {
    throw new Error("人物帧的边界或脚底位置不正确");
  }
  return { x, y, width, height, footX, footY };
}

function parseAtlas(value: unknown, image: HTMLImageElement): WalkAtlas {
  if (!isRecord(value)) throw new Error("人物动画信息无法读取");
  const { width, height, columns, rows, frames, referenceHeight } = value;
  if (!isFiniteNumber(width) || !isFiniteNumber(height)
    || width !== image.naturalWidth || height !== image.naturalHeight
    || columns !== 4 || rows !== 2 || !Array.isArray(frames) || frames.length !== 8
    || !isFiniteNumber(referenceHeight) || referenceHeight <= 0) {
    throw new Error("人物动画信息与图片不一致");
  }
  const first = parseFrame(frames[0], width, height);
  return {
    width, height, columns, rows, referenceHeight,
    frames: [first, ...frames.slice(1).map((frame: unknown) => parseFrame(frame, width, height))],
  };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      image.decode().then(() => resolve(image), () => resolve(image));
    };
    image.onerror = () => reject(new Error("有一幅手绘素材没有载入"));
    image.src = url;
  });
}

export async function loadStudyAssets(): Promise<StudyAssets> {
  const [ground, walker, response] = await Promise.all([
    loadImage("./scenes/wugong-study-ground-v1.webp"),
    loadImage("./characters/wugong-study-walk-v1.webp"),
    fetch("./characters/wugong-study-walk-v1.json"),
  ]);
  if (!response.ok) throw new Error("人物动画信息没有载入");
  const data: unknown = await response.json();
  const atlas = parseAtlas(data, walker);
  if (ground.naturalWidth !== 1672 || ground.naturalHeight !== 941) {
    throw new Error("场景画幅与这段小路不一致");
  }
  return { ground, walker, atlas };
}
