import { mix } from '../journey/geometry';
import type { AotaiJourney } from './chapter';

export class AotaiAudio {
  private readonly music = new Audio('audio/wugong-reverie-v1.mp3');
  private readonly wind = new Audio('audio/wugong-wind-v1.m4a');
  private readonly paper = new Audio('audio/mini-paper-v1.mp3');
  private readonly steps = [1, 2, 3].map(i => new Audio(`audio/wugong-step-${i}-v1.mp3`));
  private enabled = false; private token = 0; private lastStep = -1;
  constructor() { for (const a of [this.music, this.wind]) { a.loop = true; a.preload = 'none'; a.volume = 0; } this.paper.volume = .1; for (const a of this.steps) { a.preload = 'none'; a.volume = .025; } }
  async enable(): Promise<void> {
    const token = ++this.token; this.enabled = true;
    try { await Promise.all([this.music.play(), this.wind.play()]); if (token !== this.token || document.hidden) this.pause(); }
    catch (error) { if (token === this.token) this.disable(); throw error; }
  }
  disable(): void { this.enabled = false; this.token++; this.pause(); }
  pause(): void { for (const a of [this.music, this.wind, this.paper, ...this.steps]) a.pause(); }
  resume(): void { if (this.enabled && !document.hidden) for (const a of [this.music, this.wind]) void a.play().catch(() => {}); }
  update(journey: AotaiJourney, dt: number): void {
    if (!this.enabled || document.hidden) return;
    const gain = 1 - Math.exp(-dt * 2), mist = journey.mist;
    this.music.volume = mix(this.music.volume, journey.night > .5 ? .055 : .075, gain); this.wind.volume = mix(this.wind.volume, journey.night > .5 ? .035 : mist ? .115 : .065, gain);
    const step = Math.floor(journey.stride * 2);
    if (journey.moving && step !== this.lastStep) { this.lastStep = step; const a = this.steps[step % this.steps.length]; a.currentTime = 0; void a.play().catch(() => {}); }
  }
  cue(): void { if (!this.enabled || document.hidden) return; this.paper.currentTime = 0; void this.paper.play().catch(() => {}); }
  destroy(): void { this.disable(); for (const a of [this.music, this.wind, this.paper, ...this.steps]) { a.removeAttribute('src'); a.load(); } }
}
