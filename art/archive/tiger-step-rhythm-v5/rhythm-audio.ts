import { Context, Gain, Player, Sampler } from 'tone';
import { RHYTHM, type RhythmAudio, type RhythmSoundState } from './rhythm';

const MELODY = ['B3', 'D4', 'G4', 'A4', 'G4', 'E4', 'D4', 'B3', 'D4', 'G4', 'A4', 'G4'];
const BASS = ['G3', 'C3', 'D3', 'G3'];

/** This module is loaded only by the mountain-bend memory, after its canvas mounts. */
export function createRhythmAudio(): RhythmAudio {
  const context = new Context({ latencyHint: 'interactive', lookAhead: .06 });
  const output = new Gain({ context, gain: 0 }).connect(context.destination);
  const cue = new Player({ context, volume: -19, fadeOut: .02 }).connect(output);
  const step = new Player({ context, volume: -28, fadeOut: .03 }).connect(output);
  const wind = new Player({ context, volume: -29, loop: true, fadeIn: 1.2, fadeOut: .3 }).connect(output);
  let harp: Sampler | null = null, preparation: Promise<void> | null = null;
  let enabled = false, ready = false, disposed = false, ending = false, windOn = false, firstCue = false;
  let generation = 0;
  let state: RhythmSoundState = { running: false, time: 0, hits: 0, restUntilBeat: 4, finished: false };
  const transport = context.transport;
  transport.bpm.value = RHYTHM.bpm;
  const repeat = transport.scheduleRepeat(time => {
    if (!enabled || !ready || disposed || state.finished) return;
    const beat = Math.round(transport.getSecondsAtTime(time) / RHYTHM.beat);
    if (beat < RHYTHM.countIn) { if (beat > 0) cue.start(time, 0, .12); return; }
    if (beat < state.restUntilBeat) return;
    if (beat % RHYTHM.spacing === 0 && state.hits < RHYTHM.goal) {
      cue.start(time, 0, .12);
      harp?.triggerAttackRelease(beat % 4 === 0 ? 'D4' : 'G3', .5, time, .21);
    }
    if (beat % 4 === 0) harp?.triggerAttackRelease(BASS[Math.floor((beat - 4) / 8) % BASS.length], 1.6, time, .26);
  }, RHYTHM.beat, 0);

  function prepare(): Promise<void> {
    if (disposed) return Promise.reject(new Error('音乐已关闭'));
    if (!preparation) preparation = Promise.all([
      new Promise<void>((resolve, reject) => {
        harp = new Sampler({ context, urls: { C3: 'harp-c3.wav', G3: 'harp-g3.wav', D4: 'harp-d4.wav', C5: 'harp-c5.wav' }, baseUrl: 'audio/tiger-rhythm-v5/', attack: .004, release: .8, onload: resolve, onerror: reject }).connect(output);
      }),
      cue.load('audio/wugong-place-v1.mp3'), step.load('audio/wugong-step-1-v1.mp3'), wind.load('audio/wugong-wind-v1.m4a'),
    ]).then(() => { if (!disposed) ready = true; });
    return preparation;
  }
  function pause(): void {
    if (disposed) return;
    const now = context.immediate();
    if (transport.state === 'started') transport.pause(now);
    harp?.releaseAll(now); cue.stop(now); step.stop(now);
    if (windOn) { wind.stop(now); windOn = false; }
  }
  function sync(next: RhythmSoundState): void {
    state = next;
    if (disposed || !ready || !enabled || context.state !== 'running' || document.hidden) return;
    if (next.running && transport.state !== 'started' && !next.finished) {
      transport.start(context.immediate() + .02, next.time);
      if (next.time < .12 && !firstCue) { cue.start(context.now(), 0, .12); firstCue = true; }
    }
    if (!windOn && next.running) { wind.start(context.now()); windOn = true; }
    if (next.finished && !ending) {
      ending = true;
      const now = context.now(); harp?.releaseAll(now);
      harp?.triggerAttackRelease(['G3', 'B3', 'D4'], 1.6, now + .04, .3);
    }
  }
  return {
    prepare,
    async setEnabled(value) {
      const turn = ++generation; enabled = value;
      if (disposed) return false;
      if (!value) { output.gain.rampTo(0, .08); return true; }
      // Start resume inside the user's gesture, before any loading awaits.
      const resume = context.resume();
      try {
        await Promise.all([resume, prepare()]);
        if (disposed || !enabled || turn !== generation || context.state !== 'running') return false;
        output.gain.rampTo(.78, .18); sync(state); return true;
      } catch { if (!disposed && turn === generation) { enabled = false; output.gain.value = 0; } return false; }
    },
    time() { return !disposed && context.state === 'running' && transport.state === 'started' ? Math.max(state.time, transport.getSecondsAtTime(context.immediate())) : null; },
    sync,
    hit(index) {
      if (!enabled || !ready || disposed || context.state !== 'running' || document.hidden) return;
      const now = context.now(); harp?.triggerAttackRelease(MELODY[index % MELODY.length], .9, now, .62); step.start(now, 0, .24);
    },
    pause,
    reset() { pause(); transport.stop(context.immediate()); transport.seconds = 0; ending = false; firstCue = false; state = { running: false, time: 0, hits: 0, restUntilBeat: 4, finished: false }; },
    dispose() {
      if (disposed) return;
      pause(); disposed = true; generation++; transport.clear(repeat); transport.stop(context.immediate());
      harp?.dispose(); cue.dispose(); step.dispose(); wind.dispose(); output.dispose(); context.dispose();
    },
  };
}
