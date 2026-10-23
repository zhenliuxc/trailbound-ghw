// Generated from src/wugong-study/*.ts by npm run build. Edit src/, not this file.

// .build/typescript/wugong-study/assets.js
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}
function parseFrame(value, sheetWidth, sheetHeight) {
  if (!isRecord(value))
    throw new Error("人物帧数据无法读取");
  const { x, y, width, height, footX, footY } = value;
  if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(width) || !isFiniteNumber(height) || !isFiniteNumber(footX) || !isFiniteNumber(footY) || x < 0 || y < 0 || width <= 0 || height <= 0 || x + width > sheetWidth || y + height > sheetHeight || footX < 0 || footX > width || footY < 0 || footY > height) {
    throw new Error("人物帧的边界或脚底位置不正确");
  }
  return { x, y, width, height, footX, footY };
}
function parseAtlas(value, image) {
  if (!isRecord(value))
    throw new Error("人物动画信息无法读取");
  const { width, height, columns, rows, frames, referenceHeight } = value;
  if (!isFiniteNumber(width) || !isFiniteNumber(height) || width !== image.naturalWidth || height !== image.naturalHeight || columns !== 4 || rows !== 2 || !Array.isArray(frames) || frames.length !== 8 || !isFiniteNumber(referenceHeight) || referenceHeight <= 0) {
    throw new Error("人物动画信息与图片不一致");
  }
  const first = parseFrame(frames[0], width, height);
  return {
    width,
    height,
    columns,
    rows,
    referenceHeight,
    frames: [first, ...frames.slice(1).map((frame) => parseFrame(frame, width, height))]
  };
}
function loadImage(url) {
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
async function loadStudyAssets() {
  const [ground, walker, response] = await Promise.all([
    loadImage("./scenes/wugong-study-ground-v1.webp"),
    loadImage("./characters/wugong-study-walk-v1.webp"),
    fetch("./characters/wugong-study-walk-v1.json")
  ]);
  if (!response.ok)
    throw new Error("人物动画信息没有载入");
  const data = await response.json();
  const atlas = parseAtlas(data, walker);
  if (ground.naturalWidth !== 1672 || ground.naturalHeight !== 941) {
    throw new Error("场景画幅与这段小路不一致");
  }
  return { ground, walker, atlas };
}

// .build/typescript/wugong-study/foreground.js
var FOREGROUND_PATHS = [
  {
    groundLine: 941,
    foliageOnly: true,
    outline: [
      { x: 205, y: 941 },
      { x: 230, y: 865 },
      { x: 280, y: 815 },
      { x: 310, y: 770 },
      { x: 345, y: 728 },
      { x: 390, y: 693 },
      { x: 440, y: 686 },
      { x: 480, y: 695 },
      { x: 530, y: 660 },
      { x: 590, y: 675 },
      { x: 660, y: 715 },
      { x: 740, y: 739 },
      { x: 810, y: 800 },
      { x: 890, y: 865 },
      { x: 930, y: 941 }
    ]
  },
  {
    groundLine: 520,
    foliageOnly: false,
    outline: [
      { x: 1234, y: 366 },
      { x: 1257, y: 356 },
      { x: 1283, y: 353 },
      { x: 1310, y: 363 },
      { x: 1338, y: 381 },
      { x: 1359, y: 407 },
      { x: 1375, y: 441 },
      { x: 1383, y: 469 },
      { x: 1369, y: 497 },
      { x: 1338, y: 514 },
      { x: 1301, y: 515 },
      { x: 1252, y: 499 },
      { x: 1220, y: 481 },
      { x: 1203, y: 450 },
      { x: 1200, y: 421 },
      { x: 1213, y: 390 }
    ]
  }
];
function prepareForeground(ground) {
  return FOREGROUND_PATHS.map(({ outline, groundLine, foliageOnly }) => {
    const path = new Path2D();
    const first = outline[0];
    path.moveTo(first.x, first.y);
    for (const point of outline.slice(1))
      path.lineTo(point.x, point.y);
    path.closePath();
    const image = document.createElement("canvas");
    image.width = ground.naturalWidth;
    image.height = ground.naturalHeight;
    const ctx = image.getContext("2d");
    if (!ctx)
      throw new Error("前景画面暂时无法展开");
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

// .build/typescript/wugong-study/trail.js
var SCENE = { width: 1672, height: 941 };
var CONTROL_POINTS = [
  { x: 30, y: 906 },
  { x: 180, y: 835 },
  { x: 350, y: 770 },
  { x: 530, y: 680 },
  { x: 700, y: 591 },
  { x: 850, y: 520 },
  { x: 1e3, y: 455 },
  { x: 1120, y: 421 },
  { x: 1190, y: 397 },
  { x: 1230, y: 375 },
  { x: 1252, y: 335 },
  { x: 1260, y: 286 },
  { x: 1295, y: 240 },
  { x: 1380, y: 211 },
  { x: 1430, y: 199 },
  { x: 1470, y: 171 },
  { x: 1491, y: 139 },
  { x: 1495, y: 86 },
  { x: 1454, y: 42 }
];
var clamp = (value, min, max) => Math.min(max, Math.max(min, value));
var mix = (a, b, amount) => a + (b - a) * amount;
function curve(a, b, c, d, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  const coordinate = (p0, p1, p2, p3) => 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  return {
    x: coordinate(a.x, b.x, c.x, d.x),
    y: coordinate(a.y, b.y, c.y, d.y)
  };
}
var PaintedTrail = class {
  points;
  length;
  start;
  end;
  constructor() {
    const first = { ...CONTROL_POINTS[0], distance: 0 };
    const points = [first];
    let previous = first;
    let distance = 0;
    for (let index = 0; index < CONTROL_POINTS.length - 1; index += 1) {
      const b = CONTROL_POINTS[index] ?? CONTROL_POINTS[0];
      const c = CONTROL_POINTS[index + 1] ?? b;
      const a = CONTROL_POINTS[index - 1] ?? b;
      const d = CONTROL_POINTS[index + 2] ?? c;
      const steps = Math.max(8, Math.ceil(Math.hypot(c.x - b.x, c.y - b.y) / 6));
      for (let step = 1; step <= steps; step += 1) {
        const point = curve(a, b, c, d, step / steps);
        distance += Math.hypot(point.x - previous.x, point.y - previous.y);
        previous = { ...point, distance };
        points.push(previous);
      }
    }
    this.points = points;
    this.length = distance;
    this.start = 170;
    this.end = this.nearest({ x: 1470, y: 171 }, 0, distance).distance;
  }
  at(distance) {
    const bounded = clamp(distance, 0, this.length);
    let low = 0;
    let high = this.points.length - 1;
    while (high - low > 1) {
      const middle = Math.floor((low + high) / 2);
      const point = this.points[middle] ?? this.points[0];
      if (point.distance < bounded)
        low = middle;
      else
        high = middle;
    }
    const a = this.points[low] ?? this.points[0];
    const b = this.points[high] ?? a;
    const amount = b.distance === a.distance ? 0 : (bounded - a.distance) / (b.distance - a.distance);
    return { x: mix(a.x, b.x, amount), y: mix(a.y, b.y, amount) };
  }
  tangent(distance, direction = 1) {
    const a = this.at(distance - 14 * direction);
    const b = this.at(distance + 30 * direction);
    const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { x: (b.x - a.x) / length, y: (b.y - a.y) / length };
  }
  nearest(position, start2 = this.start, end = this.end) {
    let nearest = { ...this.at(start2), distance: start2, offset: Number.POSITIVE_INFINITY };
    for (let index = 1; index < this.points.length; index += 1) {
      const a = this.points[index - 1] ?? this.points[0];
      const b = this.points[index] ?? a;
      if (b.distance < start2 || a.distance > end)
        continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const squared = dx * dx + dy * dy;
      const lower = squared === 0 ? 0 : clamp((start2 - a.distance) / (b.distance - a.distance), 0, 1);
      const upper = squared === 0 ? 1 : clamp((end - a.distance) / (b.distance - a.distance), 0, 1);
      const amount = clamp(squared === 0 ? 0 : ((position.x - a.x) * dx + (position.y - a.y) * dy) / squared, lower, upper);
      const x = a.x + dx * amount;
      const y = a.y + dy * amount;
      const offset = Math.hypot(position.x - x, position.y - y);
      if (offset < nearest.offset)
        nearest = {
          x,
          y,
          offset,
          distance: mix(a.distance, b.distance, amount)
        };
    }
    return nearest;
  }
};

// .build/typescript/wugong-study/main.js
var canvasElement = document.getElementById("study-canvas");
var stageElement = document.getElementById("study-stage");
var actionElement = document.getElementById("walk-action");
var restartElement = document.getElementById("walk-restart");
var overviewElement = document.getElementById("walk-overview");
var statusElement = document.getElementById("walk-status");
var progressElement = document.getElementById("walk-progress");
var loadingElement = document.getElementById("study-loading");
var loadingMessageElement = document.getElementById("loading-message");
var retryElement = document.getElementById("load-retry");
if (!(canvasElement instanceof HTMLCanvasElement) || !(stageElement instanceof HTMLElement) || !(actionElement instanceof HTMLButtonElement) || !(restartElement instanceof HTMLButtonElement) || !(overviewElement instanceof HTMLButtonElement) || !(statusElement instanceof HTMLElement) || !(progressElement instanceof HTMLProgressElement) || !(loadingElement instanceof HTMLElement) || !(loadingMessageElement instanceof HTMLElement) || !(retryElement instanceof HTMLButtonElement)) {
  throw new Error("行走样段的页面结构不完整");
}
var context = canvasElement.getContext("2d", { alpha: false });
if (!context) {
  loadingMessageElement.textContent = "这个浏览器暂时无法打开画面，请换一个浏览器试试。";
  throw new Error("Canvas 2D is unavailable");
}
var canvas = canvasElement;
var stage = stageElement;
var action = actionElement;
var restart = restartElement;
var overview = overviewElement;
var status = statusElement;
var progress = progressElement;
var loading = loadingElement;
var loadingMessage = loadingMessageElement;
var retry = retryElement;
var renderingContext = context;
var WugongWalk = class {
  assets;
  ctx;
  trail = new PaintedTrail();
  foreground;
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  pressed = /* @__PURE__ */ new Set();
  playback = { kind: "idle" };
  distance = this.trail.start;
  speed = 0;
  gait = 0;
  facing = 1;
  lean = 0;
  width = 1;
  height = 1;
  pixelRatio = 1;
  camera = { x: 0, y: 0, scale: 1 };
  showWholeScene = false;
  destination = null;
  frame = null;
  lastTime = 0;
  lastProgressUpdate = 0;
  destroyed = false;
  resizeObserver;
  disposeEvents = new AbortController();
  constructor(assets, ctx) {
    this.assets = assets;
    this.ctx = ctx;
    this.foreground = prepareForeground(assets.ground);
    const signal = this.disposeEvents.signal;
    canvas.addEventListener("pointerdown", this.onPointer, { signal });
    action.addEventListener("click", this.onAction, { signal });
    restart.addEventListener("click", this.onRestart, { signal });
    overview.addEventListener("click", this.onOverview, { signal });
    document.addEventListener("keydown", this.onKeyDown, { signal });
    document.addEventListener("keyup", this.onKeyUp, { signal });
    document.addEventListener("visibilitychange", this.onVisibility, { signal });
    window.addEventListener("blur", this.onBlur, { signal });
    window.addEventListener("pagehide", this.onPageHide, { signal });
    window.addEventListener("pageshow", this.onPageShow, { signal });
    this.reducedMotion.addEventListener("change", this.onMotionChange, { signal });
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(stage);
    this.resize();
    this.updateControls();
    this.say("点击浅土色小路，慢慢走向草甸。");
    action.disabled = false;
    restart.disabled = false;
    overview.disabled = false;
    loading.hidden = true;
    stage.classList.add("is-ready");
    if (new URLSearchParams(window.location.search).get("walk") === "1") {
      this.setWalking(this.trail.end, "button");
    }
  }
  say(message) {
    if (status.textContent !== message)
      status.textContent = message;
  }
  updateControls() {
    switch (this.playback.kind) {
      case "walking":
        action.textContent = "停下来";
        action.setAttribute("aria-label", "暂停行走");
        break;
      case "idle":
        action.textContent = "向草甸走";
        action.setAttribute("aria-label", "开始沿山路行走");
        break;
      case "paused":
        action.textContent = "继续走";
        action.setAttribute("aria-label", "继续沿山路行走");
        break;
      case "arrived":
        action.textContent = "再走一遍";
        action.setAttribute("aria-label", "回到林缘并重新行走");
        break;
      default: {
        const exhaustive = this.playback;
        return exhaustive;
      }
    }
    stage.dataset.state = this.playback.kind;
  }
  schedule() {
    if (this.frame === null && !this.destroyed && !document.hidden) {
      this.frame = window.requestAnimationFrame(this.tick);
    }
  }
  targetCamera() {
    if (this.showWholeScene) {
      const scale2 = Math.min(this.width / SCENE.width, this.height / SCENE.height);
      return {
        x: (SCENE.width - this.width / scale2) / 2,
        y: (SCENE.height - this.height / scale2) / 2,
        scale: scale2
      };
    }
    const scale = Math.max(this.width / SCENE.width, this.height / SCENE.height) * (this.width < 650 ? 1.12 : 1.24);
    const visibleWidth = this.width / scale;
    const visibleHeight = this.height / scale;
    const person = this.trail.at(this.distance);
    return {
      x: clamp(person.x - visibleWidth * 0.43, 0, Math.max(0, SCENE.width - visibleWidth)),
      y: clamp(person.y - visibleHeight * 0.6, 0, Math.max(0, SCENE.height - visibleHeight)),
      scale
    };
  }
  resize = () => {
    const bounds = stage.getBoundingClientRect();
    this.width = Math.max(1, bounds.width);
    this.height = Math.max(1, bounds.height);
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(this.width * this.pixelRatio);
    canvas.height = Math.round(this.height * this.pixelRatio);
    this.camera = this.targetCamera();
    this.schedule();
  };
  setWalking(target, source) {
    this.playback = { kind: "walking", target: clamp(target, this.trail.start, this.trail.end), source };
    this.updateControls();
    this.say(target < this.distance ? "沿着小路，回望林缘。" : "沿着小路，慢慢走向草甸。");
    this.schedule();
  }
  pause(message = "在这里停一会儿，也很好。") {
    if (this.playback.kind === "walking") {
      this.playback = { kind: "paused", target: this.playback.target };
      this.speed = 0;
      this.updateControls();
      this.say(message);
      this.schedule();
    }
  }
  onAction = () => {
    this.pressed.clear();
    switch (this.playback.kind) {
      case "walking":
        this.pause();
        break;
      case "idle":
        this.setWalking(this.trail.end, "button");
        break;
      case "paused":
        this.setWalking(Math.abs(this.playback.target - this.distance) < 3 ? this.trail.end : this.playback.target, "button");
        break;
      case "arrived":
        this.reset();
        this.setWalking(this.trail.end, "button");
        break;
      default: {
        const exhaustive = this.playback;
        return exhaustive;
      }
    }
  };
  reset() {
    this.pressed.clear();
    this.playback = { kind: "idle" };
    this.distance = this.trail.start;
    this.speed = 0;
    this.gait = 0;
    this.facing = 1;
    this.lean = 0;
    this.destination = null;
    this.camera = this.targetCamera();
    this.updateControls();
    this.say("回到林缘。点击浅土色小路，重新出发。");
    progress.value = 0;
    this.schedule();
  }
  onRestart = () => this.reset();
  onOverview = () => {
    this.showWholeScene = !this.showWholeScene;
    overview.textContent = this.showWholeScene ? "跟着小人" : "看全景";
    overview.setAttribute("aria-pressed", String(this.showWholeScene));
    if (this.reducedMotion.matches)
      this.camera = this.targetCamera();
    this.schedule();
  };
  onPointer = (event) => {
    if (!event.isPrimary || event.pointerType === "mouse" && event.button !== 0)
      return;
    const bounds = canvas.getBoundingClientRect();
    const world = {
      x: (event.clientX - bounds.left) / this.camera.scale + this.camera.x,
      y: (event.clientY - bounds.top) / this.camera.scale + this.camera.y
    };
    const nearest = this.trail.nearest(world);
    const pathWidth = 22 + nearest.y * 0.024;
    if (nearest.offset > pathWidth) {
      this.say("点一下浅土色小路，小人会走到那里。");
      return;
    }
    this.pressed.clear();
    canvas.focus({ preventScroll: true });
    this.destination = { position: nearest, until: performance.now() + 950 };
    if (Math.abs(nearest.distance - this.distance) < 6)
      this.pause();
    else
      this.setWalking(nearest.distance, "path");
    this.schedule();
  };
  keyboardDirection() {
    const forward = this.pressed.has("ArrowUp") || this.pressed.has("ArrowRight") || this.pressed.has("w") || this.pressed.has("d");
    const backward = this.pressed.has("ArrowDown") || this.pressed.has("ArrowLeft") || this.pressed.has("s") || this.pressed.has("a");
    return Number(forward) - Number(backward);
  }
  onKeyDown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLElement && event.target.isContentEditable)
      return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === " " && event.target instanceof HTMLButtonElement)
      return;
    if (key === " " || key === "Escape") {
      event.preventDefault();
      if (!event.repeat) {
        if (key === "Escape")
          this.pause();
        else
          this.onAction();
      }
      return;
    }
    if (!["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft", "w", "a", "s", "d"].includes(key))
      return;
    event.preventDefault();
    if (this.pressed.has(key))
      return;
    this.pressed.add(key);
    const direction = this.keyboardDirection();
    if (direction === 0)
      this.pause();
    else
      this.setWalking(direction > 0 ? this.trail.end : this.trail.start, "keyboard");
  };
  onKeyUp = (event) => {
    this.pressed.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    if (this.playback.kind !== "walking" || this.playback.source !== "keyboard")
      return;
    const direction = this.keyboardDirection();
    if (direction === 0)
      this.pause();
    else
      this.setWalking(direction > 0 ? this.trail.end : this.trail.start, "keyboard");
  };
  onBlur = () => {
    this.pressed.clear();
    this.pause();
  };
  onVisibility = () => {
    this.pressed.clear();
    if (document.hidden) {
      this.pause("已停下，回来后可以继续走。");
      if (this.frame !== null)
        window.cancelAnimationFrame(this.frame);
      this.frame = null;
    } else {
      this.lastTime = 0;
      this.schedule();
    }
  };
  onMotionChange = () => {
    if (this.reducedMotion.matches)
      this.camera = this.targetCamera();
    this.schedule();
  };
  onPageHide = (event) => {
    if (!event.persisted) {
      this.destroy();
      return;
    }
    this.pressed.clear();
    this.pause();
    if (this.frame !== null)
      window.cancelAnimationFrame(this.frame);
    this.frame = null;
  };
  onPageShow = (event) => {
    if (event.persisted) {
      this.lastTime = 0;
      this.schedule();
    }
  };
  tick = (time) => {
    this.frame = null;
    const dt = this.lastTime === 0 ? 1 / 60 : clamp((time - this.lastTime) / 1e3, 0, 0.05);
    this.lastTime = time;
    let walking = false;
    if (this.playback.kind === "walking") {
      const remaining = this.playback.target - this.distance;
      const direction = Math.sign(remaining);
      const tangent = this.trail.tangent(this.distance, direction || 1);
      const uphill = Math.max(0, -tangent.y);
      const desiredSpeed = 66 * (1 - uphill * 0.24);
      this.speed += (desiredSpeed - this.speed) * (1 - Math.exp(-dt * 5));
      const advance = Math.min(Math.abs(remaining), this.speed * dt);
      this.distance += advance * direction;
      this.gait += advance / (57 - uphill * 18);
      if (Math.abs(tangent.x) > 0.24)
        this.facing = tangent.x > 0 ? 1 : -1;
      const desiredLean = uphill * 0.045 * this.facing;
      this.lean += (desiredLean - this.lean) * (1 - Math.exp(-dt * 4));
      walking = advance > 0.01;
      if (Math.abs(this.playback.target - this.distance) < 0.1) {
        this.speed = 0;
        if (this.distance >= this.trail.end - 0.1) {
          this.playback = { kind: "arrived" };
          progress.value = 1;
          this.say("走到草甸了。可以停下看看，也可以沿路返回。");
        } else {
          this.playback = { kind: "paused", target: this.trail.end };
          this.say(this.distance <= this.trail.start + 0.1 ? "回到林缘了。" : "走到这里，停下来看看。");
        }
        this.updateControls();
      }
    } else {
      this.lean += (0 - this.lean) * (1 - Math.exp(-dt * 4));
    }
    const target = this.targetCamera();
    const follow = this.reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 2.8);
    this.camera.x += (target.x - this.camera.x) * follow;
    this.camera.y += (target.y - this.camera.y) * follow;
    this.camera.scale += (target.scale - this.camera.scale) * follow;
    const cameraMoving = Math.abs(target.x - this.camera.x) > 0.04 || Math.abs(target.y - this.camera.y) > 0.04 || Math.abs(target.scale - this.camera.scale) > 1e-4;
    if (this.destination && time >= this.destination.until)
      this.destination = null;
    this.paint(time, walking);
    if (time - this.lastProgressUpdate > 180) {
      progress.value = clamp((this.distance - this.trail.start) / (this.trail.end - this.trail.start), 0, 1);
      this.lastProgressUpdate = time;
    }
    if (this.playback.kind === "walking" || cameraMoving || this.destination || Math.abs(this.lean) > 5e-4)
      this.schedule();
    else
      this.lastTime = 0;
  };
  paint(time, walking) {
    const ctx = this.ctx;
    const camera = this.camera;
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
    ctx.fillStyle = "#e7e5d3";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.translate(-camera.x * camera.scale, -camera.y * camera.scale);
    ctx.scale(camera.scale, camera.scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(this.assets.ground, 0, 0, SCENE.width, SCENE.height);
    if (this.destination) {
      const alpha = clamp((this.destination.until - time) / 950, 0, 1);
      const position = this.destination.position;
      ctx.save();
      ctx.globalAlpha = alpha * 0.62;
      ctx.strokeStyle = "#786e49";
      ctx.lineWidth = 1.7 / camera.scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(position.x - 5, position.y - 4);
      ctx.lineTo(position.x, position.y + 1);
      ctx.lineTo(position.x + 7, position.y - 7);
      ctx.stroke();
      ctx.restore();
    }
    this.paintWalker(walking);
    const person = this.trail.at(this.distance);
    for (const patch of this.foreground) {
      if (person.y >= patch.groundLine)
        continue;
      ctx.drawImage(patch.image, 0, 0);
    }
  }
  paintWalker(walking) {
    const ctx = this.ctx;
    const point = this.trail.at(this.distance);
    const { frames, referenceHeight } = this.assets.atlas;
    const phase = this.gait % 1;
    const frameIndex = walking ? this.reducedMotion.matches ? phase < 0.5 ? 0 : 4 : Math.floor(phase * frames.length) : 0;
    const frame = frames[frameIndex] ?? frames[0];
    const perspectiveHeight = 73 + point.y / SCENE.height * 54;
    const visibleHeight = this.width < 650 && !this.showWholeScene ? Math.max(perspectiveHeight, 72 / this.camera.scale) : perspectiveHeight;
    const scale = visibleHeight / referenceHeight;
    const bob = walking && !this.reducedMotion.matches ? Math.sin(phase * Math.PI * 4) * 0.65 : 0;
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(-0.19);
    const shadow = ctx.createRadialGradient(0, 0, 1, 0, 0, visibleHeight * 0.2);
    shadow.addColorStop(0, "rgba(56, 62, 42, 0.22)");
    shadow.addColorStop(1, "rgba(56, 62, 42, 0)");
    ctx.scale(1, 0.28);
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(0, 0, visibleHeight * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(point.x, point.y + bob);
    ctx.rotate(this.reducedMotion.matches ? 0 : this.lean);
    ctx.scale(scale * this.facing, scale);
    ctx.drawImage(this.assets.walker, frame.x, frame.y, frame.width, frame.height, -frame.footX, -frame.footY, frame.width, frame.height);
    ctx.restore();
  }
  destroy = () => {
    this.destroyed = true;
    if (this.frame !== null)
      window.cancelAnimationFrame(this.frame);
    this.frame = null;
    this.resizeObserver.disconnect();
    this.disposeEvents.abort();
  };
};
async function start() {
  retry.hidden = true;
  loadingMessage.textContent = "正在铺开林缘的小路…";
  try {
    const assets = await loadStudyAssets();
    new WugongWalk(assets, renderingContext);
  } catch (error) {
    loadingMessage.textContent = error instanceof Error ? `${error.message}。可以重试，或先回到山径。` : "画面暂时没有载入。可以重试，或先回到山径。";
    retry.hidden = false;
  }
}
retry.addEventListener("click", () => {
  void start();
});
void start();
