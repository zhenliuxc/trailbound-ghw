import { photoFrame, type GlimpsePoint, type GlimpsePointId, type PhotoFrame } from '../../content/look-here';
import type { PrivatePhotoStore, PhotoSaveResult, PhotoReadResult } from '../../runtime/private-photo';
import { createDraft, editDraft, recommendCaption, photoSnapshot, type Draft, type DraftCommand, type Panel } from './editor';
import type { GlimpsePreferences, GlimpsePreferenceStore } from './preferences';

interface GlimpseServices {
  readonly photos: PrivatePhotoStore;
  readonly preferences: GlimpsePreferenceStore;
  readonly sceneVersion: string;
  capture(frame: PhotoFrame): Promise<string>;
  id(): string;
  now(): number;
  saved(): void;
}
export class GlimpseApplication {
  private state: Panel | null = null;
  private preference: GlimpsePreferences;
  private readonly notes = new Map<GlimpsePointId, string>();
  private revision = 0;
  private disposed = false;
  private pendingSave = false;
  constructor(private readonly services: GlimpseServices) { this.preference = services.preferences.read(); }
  get panel(): Panel | null { return this.state; }
  get generation(): number { return this.revision; }
  get saving(): boolean { return this.pendingSave; }
  get solitude(): boolean { return this.preference.solitude; }
  hidden(id: GlimpsePointId): boolean { return this.preference.hidden.includes(id); }
  active(token: number): boolean { return !this.disposed && token === this.revision; }
  invalidate(): void { this.revision++; }
  show(panel: Panel | null): boolean {
    if (this.disposed || this.pendingSave) return false;
    this.state = panel; this.invalidate(); return true;
  }
  fresh(point: GlimpsePoint): Draft {
    return createDraft({ id: this.services.id(), point, createdAt: this.services.now(), sceneVersion: this.services.sceneVersion });
  }
  edit(command: DraftCommand): Draft | null {
    if (this.disposed || this.pendingSave || !this.state || !('draft' in this.state)) return null;
    const draft = editDraft(this.state.draft, command);
    this.state = { ...this.state, draft }; return draft;
  }
  recommend(sentence: string, confirmed = false): 'applied' | 'confirm' | 'ignored' {
    if (this.disposed || this.pendingSave || !this.state || !('draft' in this.state)) return 'ignored';
    const result = recommendCaption(this.state.draft, sentence, confirmed);
    if (result.kind === 'applied') this.state = { ...this.state, draft: result.draft };
    return result.kind;
  }
  setSolitude(solitude: boolean): boolean {
    this.preference = { ...this.preference, solitude }; return this.services.preferences.save(this.preference);
  }
  hide(id: GlimpsePointId): boolean {
    this.preference = { ...this.preference, hidden: [...new Set([...this.preference.hidden, id])] };
    return this.services.preferences.save(this.preference);
  }
  cachedNote(point: GlimpsePoint): string | undefined { return this.notes.get(point.id); }
  async note(point: GlimpsePoint, token: number): Promise<string | null> {
    const image = await this.capture(photoFrame(point, 0, 1), token);
    if (image !== null) this.notes.set(point.id, image);
    return image;
  }
  async capture(frame: PhotoFrame, token: number): Promise<string | null> {
    try { const image = await this.services.capture(frame); return this.active(token) ? image : null; }
    catch (error) { if (this.active(token)) throw error; return null; }
  }
  async read(token: number): Promise<PhotoReadResult | null> {
    const result = await this.services.photos.read(); return this.active(token) ? result : null;
  }
  async save(): Promise<PhotoSaveResult | { kind: 'ignored' }> {
    if (this.disposed || this.pendingSave || !this.state || !('draft' in this.state)) return { kind: 'ignored' };
    const photo = photoSnapshot(this.state.draft);
    if (!photo) return { kind: 'ignored' };
    const token = this.revision; this.pendingSave = true;
    let result: PhotoSaveResult;
    try { result = await this.services.photos.save(photo); }
    catch { result = { kind: 'error', message: '这张照片还没保存成功，请腾出空间后重试。编辑内容仍留在这里。' }; }
    finally { this.pendingSave = false; }
    if (!this.active(token)) return { kind: 'ignored' };
    if (result.kind === 'stored') this.services.saved();
    return result;
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true; this.invalidate(); this.state = null; this.notes.clear(); void this.services.photos.close();
  }
}
