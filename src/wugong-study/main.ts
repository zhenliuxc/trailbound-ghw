import { loadStudyAssets, type StudyAssets } from "./assets";
import { prepareForeground } from "./foreground";
import { clamp, PaintedTrail, SCENE, type Point } from "./trail";

type Playback =
  | { kind: "idle" }
  | { kind: "walking"; target: number; source: "path" | "button" | "keyboard" }
  | { kind: "paused"; target: number }
  | { kind: "arrived" };

type Camera = { x: number; y: number; scale: number };
type Destination = { position: Point; until: number };

const canvasElement = document.getElementById("study-canvas");
const stageElement = document.getElementById("study-stage");
const actionElement = document.getElementById("walk-action");
const restartElement = document.getElementById("walk-restart");
const overviewElement = document.getElementById("walk-overview");
const statusElement = document.getElementById("walk-status");
const progressElement = document.getElementById("walk-progress");
const loadingElement = document.getElementById("study-loading");
const loadingMessageElement = document.getElementById("loading-message");
const retryElement = document.getElementById("load-retry");

if (!(canvasElement instanceof HTMLCanvasElement)
  || !(stageElement instanceof HTMLElement)
  || !(actionElement instanceof HTMLButtonElement)
  || !(restartElement instanceof HTMLButtonElement)
  || !(overviewElement instanceof HTMLButtonElement)
  || !(statusElement instanceof HTMLElement)
  || !(progressElement instanceof HTMLProgressElement)
  || !(loadingElement instanceof HTMLElement)
  || !(loadingMessageElement instanceof HTMLElement)
  || !(retryElement instanceof HTMLButtonElement)) {
  throw new Error("行走样段的页面结构不完整");
}

const context = canvasElement.getContext("2d", { alpha: false });
if (!context) {
  loadingMessageElement.textContent = "这个浏览器暂时无法打开画面，请换一个浏览器试试。";
  throw new Error("Canvas 2D is unavailable");
}

const canvas = canvasElement;
const stage = stageElement;
const action = actionElement;
const restart = restartElement;
const overview = overviewElement;
const status = statusElement;
const progress = progressElement;
const loading = loadingElement;
const loadingMessage = loadingMessageElement;
const retry = retryElement;
const renderingContext = context;

class WugongWalk {
  private readonly trail = new PaintedTrail();
  private readonly foreground: ReturnType<typeof prepareForeground>;
  private readonly reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  private readonly pressed = new Set<string>();
  private playback: Playback = { kind: "idle" };
  private distance = this.trail.start;
  private speed = 0;
  private gait = 0;
  private facing = 1;
  private lean = 0;
  private width = 1;
  private height = 1;
  private pixelRatio = 1;
  private camera: Camera = { x: 0, y: 0, scale: 1 };
  private showWholeScene = false;
  private destination: Destination | null = null;
  private frame: number | null = null;
  private lastTime = 0;
  private lastProgressUpdate = 0;
  private destroyed = false;
  private readonly resizeObserver: ResizeObserver;
  private readonly disposeEvents = new AbortController();

  constructor(private readonly assets: StudyAssets, private readonly ctx: CanvasRenderingContext2D) {
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

  private say(message: string): void {
    if (status.textContent !== message) status.textContent = message;
  }

  private updateControls(): void {
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
        const exhaustive: never = this.playback;
        return exhaustive;
      }
    }
    stage.dataset.state = this.playback.kind;
  }

  private schedule(): void {
    if (this.frame === null && !this.destroyed && !document.hidden) {
      this.frame = window.requestAnimationFrame(this.tick);
    }
  }

  private targetCamera(): Camera {
    if (this.showWholeScene) {
      const scale = Math.min(this.width / SCENE.width, this.height / SCENE.height);
      return {
        x: (SCENE.width - this.width / scale) / 2,
        y: (SCENE.height - this.height / scale) / 2,
        scale,
      };
    }
    const scale = Math.max(this.width / SCENE.width, this.height / SCENE.height)
      * (this.width < 650 ? 1.12 : 1.24);
    const visibleWidth = this.width / scale;
    const visibleHeight = this.height / scale;
    const person = this.trail.at(this.distance);
    return {
      x: clamp(person.x - visibleWidth * 0.43, 0, Math.max(0, SCENE.width - visibleWidth)),
      y: clamp(person.y - visibleHeight * 0.6, 0, Math.max(0, SCENE.height - visibleHeight)),
      scale,
    };
  }

  private resize = (): void => {
    const bounds = stage.getBoundingClientRect();
    this.width = Math.max(1, bounds.width);
    this.height = Math.max(1, bounds.height);
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(this.width * this.pixelRatio);
    canvas.height = Math.round(this.height * this.pixelRatio);
    this.camera = this.targetCamera();
    this.schedule();
  };

  private setWalking(target: number, source: "path" | "button" | "keyboard"): void {
    this.playback = { kind: "walking", target: clamp(target, this.trail.start, this.trail.end), source };
    this.updateControls();
    this.say(target < this.distance ? "沿着小路，回望林缘。" : "沿着小路，慢慢走向草甸。");
    this.schedule();
  }

  private pause(message = "在这里停一会儿，也很好。"): void {
    if (this.playback.kind === "walking") {
      this.playback = { kind: "paused", target: this.playback.target };
      this.speed = 0;
      this.updateControls();
      this.say(message);
      this.schedule();
    }
  }

  private onAction = (): void => {
    this.pressed.clear();
    switch (this.playback.kind) {
      case "walking": this.pause(); break;
      case "idle": this.setWalking(this.trail.end, "button"); break;
      case "paused":
        this.setWalking(Math.abs(this.playback.target - this.distance) < 3 ? this.trail.end : this.playback.target, "button");
        break;
      case "arrived":
        this.reset();
        this.setWalking(this.trail.end, "button");
        break;
      default: {
        const exhaustive: never = this.playback;
        return exhaustive;
      }
    }
  };

  private reset(): void {
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

  private onRestart = (): void => this.reset();

  private onOverview = (): void => {
    this.showWholeScene = !this.showWholeScene;
    overview.textContent = this.showWholeScene ? "跟着小人" : "看全景";
    overview.setAttribute("aria-pressed", String(this.showWholeScene));
    if (this.reducedMotion.matches) this.camera = this.targetCamera();
    this.schedule();
  };

  private onPointer = (event: PointerEvent): void => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    const bounds = canvas.getBoundingClientRect();
    const world = {
      x: (event.clientX - bounds.left) / this.camera.scale + this.camera.x,
      y: (event.clientY - bounds.top) / this.camera.scale + this.camera.y,
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
    if (Math.abs(nearest.distance - this.distance) < 6) this.pause();
    else this.setWalking(nearest.distance, "path");
    this.schedule();
  };

  private keyboardDirection(): number {
    const forward = this.pressed.has("ArrowUp") || this.pressed.has("ArrowRight")
      || this.pressed.has("w") || this.pressed.has("d");
    const backward = this.pressed.has("ArrowDown") || this.pressed.has("ArrowLeft")
      || this.pressed.has("s") || this.pressed.has("a");
    return Number(forward) - Number(backward);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing
      || event.target instanceof HTMLInputElement
      || event.target instanceof HTMLSelectElement
      || event.target instanceof HTMLTextAreaElement
      || (event.target instanceof HTMLElement && event.target.isContentEditable)) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === " " && event.target instanceof HTMLButtonElement) return;
    if (key === " " || key === "Escape") {
      event.preventDefault();
      if (!event.repeat) {
        if (key === "Escape") this.pause();
        else this.onAction();
      }
      return;
    }
    if (!["ArrowUp", "ArrowRight", "ArrowDown", "ArrowLeft", "w", "a", "s", "d"].includes(key)) return;
    event.preventDefault();
    if (this.pressed.has(key)) return;
    this.pressed.add(key);
    const direction = this.keyboardDirection();
    if (direction === 0) this.pause();
    else this.setWalking(direction > 0 ? this.trail.end : this.trail.start, "keyboard");
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.pressed.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    if (this.playback.kind !== "walking" || this.playback.source !== "keyboard") return;
    const direction = this.keyboardDirection();
    if (direction === 0) this.pause();
    else this.setWalking(direction > 0 ? this.trail.end : this.trail.start, "keyboard");
  };

  private onBlur = (): void => {
    this.pressed.clear();
    this.pause();
  };

  private onVisibility = (): void => {
    this.pressed.clear();
    if (document.hidden) {
      this.pause("已停下，回来后可以继续走。");
      if (this.frame !== null) window.cancelAnimationFrame(this.frame);
      this.frame = null;
    } else {
      this.lastTime = 0;
      this.schedule();
    }
  };

  private onMotionChange = (): void => {
    if (this.reducedMotion.matches) this.camera = this.targetCamera();
    this.schedule();
  };

  private onPageHide = (event: PageTransitionEvent): void => {
    if (!event.persisted) {
      this.destroy();
      return;
    }
    this.pressed.clear();
    this.pause();
    if (this.frame !== null) window.cancelAnimationFrame(this.frame);
    this.frame = null;
  };

  private onPageShow = (event: PageTransitionEvent): void => {
    if (event.persisted) {
      this.lastTime = 0;
      this.schedule();
    }
  };

  private tick = (time: number): void => {
    this.frame = null;
    const dt = this.lastTime === 0 ? 1 / 60 : clamp((time - this.lastTime) / 1000, 0, 0.05);
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
      if (Math.abs(tangent.x) > 0.24) this.facing = tangent.x > 0 ? 1 : -1;
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
    const cameraMoving = Math.abs(target.x - this.camera.x) > 0.04
      || Math.abs(target.y - this.camera.y) > 0.04 || Math.abs(target.scale - this.camera.scale) > 0.0001;
    if (this.destination && time >= this.destination.until) this.destination = null;
    this.paint(time, walking);
    if (time - this.lastProgressUpdate > 180) {
      progress.value = clamp((this.distance - this.trail.start) / (this.trail.end - this.trail.start), 0, 1);
      this.lastProgressUpdate = time;
    }
    if (this.playback.kind === "walking" || cameraMoving || this.destination || Math.abs(this.lean) > 0.0005) this.schedule();
    else this.lastTime = 0;
  };

  private paint(time: number, walking: boolean): void {
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
      if (person.y >= patch.groundLine) continue;
      ctx.drawImage(patch.image, 0, 0);
    }
  }

  private paintWalker(walking: boolean): void {
    const ctx = this.ctx;
    const point = this.trail.at(this.distance);
    const { frames, referenceHeight } = this.assets.atlas;
    const phase = this.gait % 1;
    const frameIndex = walking
      ? this.reducedMotion.matches ? (phase < 0.5 ? 0 : 4) : Math.floor(phase * frames.length)
      : 0;
    const frame = frames[frameIndex] ?? frames[0];
    const perspectiveHeight = 73 + (point.y / SCENE.height) * 54;
    const visibleHeight = this.width < 650 && !this.showWholeScene
      ? Math.max(perspectiveHeight, 72 / this.camera.scale)
      : perspectiveHeight;
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
    ctx.drawImage(
      this.assets.walker,
      frame.x, frame.y, frame.width, frame.height,
      -frame.footX, -frame.footY, frame.width, frame.height,
    );
    ctx.restore();
  }

  private destroy = (): void => {
    this.destroyed = true;
    if (this.frame !== null) window.cancelAnimationFrame(this.frame);
    this.frame = null;
    this.resizeObserver.disconnect();
    this.disposeEvents.abort();
  };
}

async function start(): Promise<void> {
  retry.hidden = true;
  loadingMessage.textContent = "正在铺开林缘的小路…";
  try {
    const assets = await loadStudyAssets();
    new WugongWalk(assets, renderingContext);
  } catch (error: unknown) {
    loadingMessage.textContent = error instanceof Error
      ? `${error.message}。可以重试，或先回到山径。`
      : "画面暂时没有载入。可以重试，或先回到山径。";
    retry.hidden = false;
  }
}

retry.addEventListener("click", () => { void start(); });
void start();
