import { Container, Rectangle, Sprite, Texture } from 'pixi.js';
import { CHARACTERS, DEFAULT_CHARACTER, readCharacterId, type CharacterFrame, type CharacterId } from './catalog';

export interface CharacterSprite {
  readonly texture: Texture; readonly footX: number; readonly footY: number; readonly scale: number; readonly contactX: number;
}
interface CharacterSprites {
  readonly id: CharacterId; readonly walk: readonly CharacterSprite[]; readonly actions: readonly CharacterSprite[];
  readonly sources: readonly Texture[];
}
export class CharacterFigure extends Container {
  private readonly current = new Sprite();
  private readonly previous = new Sprite();
  private frame: CharacterSprite | null = null;
  private camp = false;
  private blend = 1;
  constructor() { super(); this.addChild(this.previous, this.current); this.previous.visible = false; }
  reset(): void { this.frame = null; this.previous.visible = false; this.current.alpha = 1; this.blend = 1; }
  private place(sprite: Sprite, frame: CharacterSprite): void {
    sprite.texture = frame.texture; sprite.scale.set(frame.scale); sprite.pivot.set(frame.footX, frame.footY);
  }
  show(frame: CharacterSprite, dt: number, camp: boolean, reduced: boolean): void {
    if (this.frame !== frame) {
      const previous = this.frame;
      this.previous.visible = previous !== null && !reduced && (camp || this.camp);
      if (previous && this.previous.visible) this.place(this.previous, previous);
      this.blend = this.previous.visible ? 0 : 1;
      this.place(this.current, frame); this.frame = frame; this.camp = camp;
    }
    this.blend = reduced ? 1 : Math.min(1, this.blend + dt / .24);
    const t = this.blend * this.blend * (3 - 2 * this.blend);
    this.current.alpha = t; this.previous.alpha = 1 - t;
    if (this.blend === 1) this.previous.visible = false;
  }
}
function loadImage(file: string, signal: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image(); image.decoding = 'async';
    const clean = () => { image.onload = image.onerror = null; signal.removeEventListener('abort', abort); };
    const abort = () => { clean(); image.src = ''; reject(new DOMException('角色载入已取消', 'AbortError')); };
    image.onload = () => { clean(); resolve(image); };
    image.onerror = () => { clean(); reject(new Error('角色暂未展开，请再试一次或选择另一位旅人。')); };
    if (signal.aborted) { abort(); return; }
    signal.addEventListener('abort', abort, { once: true }); image.src = file;
  });
}
function frames(source: Texture, placements: readonly CharacterFrame[]): CharacterSprite[] {
  return placements.map(p => ({ texture: new Texture({ source: source.source, frame: new Rectangle(p.x, p.y, p.width, p.height) }), footX: p.footX, footY: p.footY, scale: p.scale, contactX: p.contactX }));
}

export class CharacterLibrary {
  private readonly cache = new Map<CharacterId, CharacterSprites>();
  private disposed = false;
  async initial(signal: AbortSignal): Promise<CharacterSprites> {
    const selected = readCharacterId();
    try { return await this.load(selected, signal); }
    catch (error) { if (signal.aborted || selected === DEFAULT_CHARACTER) throw error; return this.load(DEFAULT_CHARACTER, signal); }
  }
  async load(id: CharacterId, signal: AbortSignal): Promise<CharacterSprites> {
    if (signal.aborted || this.disposed) throw new DOMException('角色载入已取消', 'AbortError');
    const cached = this.cache.get(id); if (cached) return cached;
    const appearance = CHARACTERS[id], walk = loadImage(appearance.walk.file, signal);
    const actions = appearance.actions.file === appearance.walk.file ? walk : loadImage(appearance.actions.file, signal);
    const [walkImage, actionImage] = await Promise.all([walk, actions]);
    if (signal.aborted || this.disposed) throw new DOMException('角色载入已取消', 'AbortError');
    const walking = Texture.from(walkImage), resting = walkImage === actionImage ? walking : Texture.from(actionImage);
    const pack = { id, walk: frames(walking, appearance.walk.frames), actions: frames(resting, appearance.actions.frames), sources: walking === resting ? [walking] : [walking, resting] };
    this.cache.set(id, pack); return pack;
  }
  destroy(): void {
    if (this.disposed) return; this.disposed = true;
    for (const pack of this.cache.values()) {
      for (const frame of [...pack.walk, ...pack.actions]) frame.texture.destroy(false);
      for (const source of pack.sources) source.destroy(true);
    }
    this.cache.clear();
  }
}
