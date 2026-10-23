import { clamp, mix } from '../wugong-walk/model';
import type { TigerJourney } from './journey';
import { place } from './route';

/** Existing licensed recordings form a game soundscape, not local field recordings. */
export class TigerAudio {
  private readonly music = new Audio('audio/wugong-reverie-v1.mp3');
  private readonly wind = new Audio('audio/wugong-wind-v1.m4a');
  private readonly water = new Audio('audio/westlake-creek-v1.mp3');
  private readonly paper = new Audio('audio/mini-paper-v1.mp3');
  private enabled = false;
  private token = 0;
  constructor() { for (const audio of [this.music, this.wind, this.water]) { audio.loop = true; audio.preload = 'none'; audio.volume = 0; } this.paper.preload = 'auto'; this.paper.volume = .12; }
  async enable(): Promise<void> {
    const token = ++this.token; this.enabled = true;
    try { await Promise.all([this.music, this.wind, this.water].map(a => a.play())); if (token !== this.token || document.hidden) this.pause(); }
    catch (error) { if (token === this.token) this.disable(); throw error; }
  }
  disable(): void { this.enabled = false; this.token++; this.pause(); }
  pause(): void { for (const a of [this.music, this.wind, this.water, this.paper]) a.pause(); }
  resume(): void { if (this.enabled && !document.hidden) for (const a of [this.music, this.wind, this.water]) void a.play().catch(() => {}); }
  update(journey: TigerJourney, dt: number): void {
    if (!this.enabled || document.hidden) return;
    const fall = place('waterfall').point, at = journey.point;
    const waterfall = clamp(1 - Math.hypot(at.x - fall.x, at.y - fall.y) / 330), river = journey.leg === 'high' ? 0 : clamp(journey.at / journey.path.length);
    const night = journey.mode.kind === 'sleeping';
    const volumes = [.075, night ? .025 : .065, night ? .02 : .025 + river * .2 + waterfall * .14];
    [this.music, this.wind, this.water].forEach((a, i) => { a.volume = mix(a.volume, volumes[i], 1 - Math.exp(-dt * 2)); });
  }
  cue(): void { if (!this.enabled || document.hidden) return; this.paper.currentTime = 0; void this.paper.play().catch(() => {}); }
  destroy(): void { this.disable(); for (const a of [this.music, this.wind, this.water, this.paper]) { a.removeAttribute('src'); a.load(); } }
}
