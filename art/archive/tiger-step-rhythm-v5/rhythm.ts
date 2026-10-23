import type { Rhythm } from './model';

export const RHYTHM = { bpm: 72, beat: 60 / 72, countIn: 4, spacing: 2, goal: 12, window: .26, walkDuration: 1.25 };
export const rhythmTime = (p: Rhythm): number => p.timing.kind === 'running' ? p.timing.time : 0;
export const nearestBeat = (time: number): number => RHYTHM.countIn + Math.round((time / RHYTHM.beat - RHYTHM.countIn) / RHYTHM.spacing) * RHYTHM.spacing;
export function cueBeat(p: Rhythm): number {
  const time = rhythmTime(p);
  let beat = Math.max(RHYTHM.countIn, p.restUntilBeat, nearestBeat(time));
  if (beat <= p.lastAttemptedBeat || beat * RHYTHM.beat < time - RHYTHM.window) beat += RHYTHM.spacing;
  return beat;
}
export function cuePulse(p: Rhythm): number {
  if (p.timing.kind !== 'running' || p.hits >= RHYTHM.goal) return 0;
  const delta = rhythmTime(p) - cueBeat(p) * RHYTHM.beat;
  return Math.max(0, 1 - Math.abs(delta) / .55);
}
export interface RhythmSoundState { running: boolean; time: number; hits: number; restUntilBeat: number; finished: boolean }
export interface RhythmAudio {
  prepare(): Promise<void>;
  setEnabled(enabled: boolean): Promise<boolean>;
  time(): number | null;
  sync(state: RhythmSoundState): void;
  hit(index: number): void;
  pause(): void;
  reset(): void;
  dispose(): void;
}
declare global { interface Window { TrailTigerRhythm?: { createRhythmAudio(): RhythmAudio } } }
let modulePromise: Promise<void> | null = null;
export async function loadRhythmAudio(): Promise<RhythmAudio> {
  if (!window.TrailTigerRhythm) {
    if (!modulePromise) modulePromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script'); script.src = 'tiger-rhythm-audio-v5.js'; script.async = true;
      script.onload = () => { script.onload = script.onerror = null; if (window.TrailTigerRhythm) resolve(); else { modulePromise = null; reject(new Error('音乐暂未展开')); } };
      script.onerror = () => { script.remove(); modulePromise = null; reject(new Error('音乐暂未展开')); };
      document.head.append(script);
    });
    await modulePromise;
  }
  if (!window.TrailTigerRhythm) throw new Error('音乐暂未展开');
  return window.TrailTigerRhythm.createRhythmAudio();
}
