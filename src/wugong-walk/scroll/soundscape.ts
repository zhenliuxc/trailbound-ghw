import { clamp, mix } from '../../journey/geometry';
import type { EnvironmentFrame } from '../environment';
import type { ScrollJourney } from './journey';
import type { ScrollStage } from '../../content/wugong-map';

export function trailMix(stage: ScrollStage, e: EnvironmentFrame) {
  const forest = stage === 'forest' || stage === 'temple' || stage === 'valley' || stage === 'village' || stage === 'end';
  return {
    music: .085 * (1 - e.rain * .25),
    woodland: forest ? .22 * (1 - e.night) * (1 - e.rain * .8) : 0,
    wind: (.065 + e.wind * .16) * (forest ? .35 : 1),
    rain: e.rain * .26,
    step: (forest ? .022 : .028) * (1 - e.rain * .2),
  };
}

type LoopName = 'music' | 'woodland' | 'wind' | 'rain';
type Cue = 'turn' | 'match' | 'collect' | 'arrive' | 'cloth';
export class TrailSoundscape {
  private readonly loops = new Map<LoopName, HTMLAudioElement>();
  private readonly cues = new Map<Cue, HTMLAudioElement>();
  private readonly feet: HTMLAudioElement[] = [];
  private readonly failedUntil = new Map<HTMLAudioElement, number>();
  private enabled = false;
  private stepGain = .028;
  private foot = 0;
  private pose = '';
  private arrival = '';
  private playing = false;
  private token = 0;
  private prepare(): void {
    if (this.loops.size) return;
    for (const [name, file] of [['music', 'wugong-reverie-v1.mp3'], ['woodland', 'wugong-woodland-v1.m4a'], ['wind', 'wugong-wind-v1.m4a'], ['rain', 'wugong-rain-v1.m4a']] as const) {
      const audio = new Audio(`audio/${file}`); audio.loop = true; audio.preload = 'auto'; audio.volume = 0; this.loops.set(name, audio);
    }
    for (const [cue, file] of [['turn', 'turn'], ['match', 'place'], ['collect', 'paper'], ['arrive', 'paper'], ['cloth', 'cloth']] as const) {
      const audio = new Audio(`audio/wugong-${file}-v1.mp3`); audio.preload = 'auto'; audio.volume = cue === 'collect' ? .13 : .075; this.cues.set(cue, audio);
    }
    for (const i of [1, 2, 3, 1]) { const audio = new Audio(`audio/wugong-step-${i}-v1.mp3`); audio.preload = 'auto'; audio.volume = .028; this.feet.push(audio); }
  }
  async enable(): Promise<void> {
    this.prepare(); const token = ++this.token;
    const started = await Promise.allSettled([...this.loops.values()].map(audio => audio.play()));
    if (token !== this.token || document.hidden) { if (token === this.token) this.pause(); return; }
    if (started.every(result => result.status === 'rejected')) throw new Error('声音暂未展开');
    for (const [index, audio] of [...this.loops.values()].entries()) if (started[index].status === 'rejected') this.failedUntil.set(audio, performance.now() + 5000);
    this.enabled = true; this.playing = true;
  }
  disable(): void { this.token++; this.enabled = false; this.pause(); }
  pause(): void { this.playing = false; for (const audio of [...this.loops.values(), ...this.feet, ...this.cues.values()]) audio.pause(); }
  resume(): void { if (this.enabled && !document.hidden) this.playing = true; }
  cue(cue: Cue): void {
    if (!this.enabled || document.hidden) return;
    const audio = this.cues.get(cue);
    if (audio && audio.readyState >= 3) { audio.currentTime = 0; void audio.play().catch(() => {}); }
  }
  update(journey: ScrollJourney, e: EnvironmentFrame, dt: number, active: boolean): void {
    const contacts = journey.takeContacts(), pose = journey.pose.kind;
    const arrival = journey.mode.kind === 'visiting' || journey.mode.kind === 'encounter' ? `${journey.mode.kind}:${journey.mode.id}` : '';
    if (arrival && this.arrival !== arrival && this.playing) this.cue('arrive'); this.arrival = arrival;
    if (!active || !this.enabled || document.hidden) { if (this.playing) this.pause(); this.pose = pose; return; }
    this.playing = true;
    const gains = trailMix(journey.stage, e); this.stepGain = gains.step;
    for (const [name, audio] of this.loops) {
      const target = gains[name]; audio.volume = clamp(mix(audio.volume, target, 1 - Math.exp(-dt * 1.6)));
      if (audio.volume < .002 && target < .002) audio.pause();
      else if (audio.paused && performance.now() >= (this.failedUntil.get(audio) ?? 0)) {
        this.failedUntil.set(audio, performance.now() + 5000);
        void audio.play().catch(() => {});
      }
    }
    if (contacts && journey.moving && this.feet.length) {
      const audio = this.feet[this.foot++ % this.feet.length]; audio.volume = this.stepGain;
      if (audio.readyState >= 3) { audio.currentTime = 0; void audio.play().catch(() => {}); }
    }
    if ((pose === 'unpacking' || pose === 'packing') && pose !== this.pose) this.cue('cloth');
    this.pose = pose;
  }
  destroy(): void { this.disable(); for (const audio of [...this.loops.values(), ...this.feet, ...this.cues.values()]) { audio.removeAttribute('src'); audio.load(); } this.loops.clear(); this.cues.clear(); this.feet.length = 0; }
}
