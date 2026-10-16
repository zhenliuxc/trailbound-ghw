/** Freely licensed streamed themes, independent of short-lived gameplay SFX. */
export interface MusicTrack {
  readonly id: string;
  readonly file: string;
  readonly title: string;
  readonly author: string;
  readonly source: string;
  readonly license: string;
}
export const WUGONG_MUSIC = Object.freeze({
  id: 'wugong-reverie',
  file: 'audio/wugong-reverie-v1.mp3',
  title: 'Reverie',
  author: 'Scott Buckley',
  source: 'https://www.scottbuckley.com.au/library/reverie/',
  license: 'CC BY 4.0',
});
const theme = (slug: string, title: string): MusicTrack => Object.freeze({
  id: 'wugong-' + slug,
  file: 'audio/wugong-' + slug + '-loop-v1.mp3',
  title, author: 'Scott Buckley', source: 'https://www.scottbuckley.com.au/library/' + slug + '/', license: 'CC BY 4.0',
});
export const WUGONG_THEMES = Object.freeze({
  wind: theme('childhood', 'Childhood'),
  clouds: theme('cirrus', 'Cirrus'),
  greet: theme('a-kind-of-hope', 'A Kind Of Hope'),
  puzzle: WUGONG_MUSIC,
});
// Reuse the same freely licensed recordings; do not download duplicate tracks.
export const MOGAN_MUSIC = WUGONG_THEMES.greet;
export const MOGAN_THEMES = Object.freeze({ rain: WUGONG_THEMES.clouds, footsteps: WUGONG_MUSIC, sling: WUGONG_THEMES.wind });
const momentGames: Readonly<Record<string, string>> = Object.freeze({
  'meadow-bird': 'wind', 'meadow-butterfly': 'clouds', 'wugong-wind-hiker': 'greet', 'meadow-flower': 'puzzle',
  'bamboo-drop': 'rain', 'bamboo-step': 'footsteps', 'bamboo-leaf': 'sling',
});

export interface MusicScene {
  routeId?: string;
  mode?: string;
  weather?: string;
  momentGame?: string | null;
  momentId?: string | null;
}
export type MusicState = 'off' | 'loading' | 'playing' | 'paused' | 'blocked' | 'error' | 'unavailable';
export interface MusicLayerOptions {
  context: AudioContext;
  destination: AudioNode;
  createMedia?: () => HTMLAudioElement | null;
  timers?: Pick<typeof globalThis, 'setTimeout' | 'clearTimeout'>;
  onStateChange?: () => void;
}

/** Gains are a mixing starting point; headphones and phone speakers still need listening. */
export function musicLevel(scene: MusicScene): number {
  if (!['wugong', 'mogan'].includes(scene.routeId || '') || !scene.mode || scene.mode === 'silent') return 0;
  const game = scene.momentGame || momentGames[scene.momentId || ''];
  let level = scene.mode === 'photo' ? .47 : scene.mode === 'choice' ? .24 : scene.mode === 'reward' ? .42 : .40;
  if (scene.mode === 'moment') level = game === 'greet' ? .25 : game === 'puzzle' ? .35 : game === 'clouds' ? .32 : .29;
  if (scene.routeId === 'mogan') {
    level = scene.mode === 'moment' ? game === 'footsteps' ? .20 : game === 'rain' ? .24 : .30 : scene.mode === 'reward' ? .34 : scene.mode === 'choice' ? .20 : .33;
  }
  if (scene.weather === 'storm') level *= .65;
  else if (scene.weather === 'rain') level *= .82;
  return level;
}

export function musicTrack(scene: MusicScene): MusicTrack | null {
  if (!musicLevel(scene)) return null;
  const game = scene.momentGame || momentGames[scene.momentId || ''];
  if (scene.routeId === 'mogan') {
    if ((scene.mode === 'moment' || scene.mode === 'reward') && game && Object.hasOwn(MOGAN_THEMES, game)) return MOGAN_THEMES[game as keyof typeof MOGAN_THEMES];
    return MOGAN_MUSIC;
  }
  if ((scene.mode === 'moment' || scene.mode === 'reward') && game && Object.hasOwn(WUGONG_THEMES, game)) return WUGONG_THEMES[game as keyof typeof WUGONG_THEMES];
  return WUGONG_MUSIC;
}

function createTrackLayer({ context, destination, track, createMedia = () => typeof Audio === 'function' ? new Audio() : null, timers = globalThis, onStateChange = () => {} }: MusicLayerOptions & { track: MusicTrack }) {
  let media: HTMLAudioElement | null = null;
  let source: MediaElementAudioSourceNode | null = null;
  let volume: GainNode | null = null;
  let state: MusicState = 'off';
  let desired = false, destroyed = false, failed = false, pending = false;
  let failureState: MusicState = 'error';
  let epoch = 0, target = 0;
  let stopTimer: ReturnType<typeof setTimeout> | null = null;
  let fade: { from: number; to: number; at: number; duration: number } | null = null;
  let lastDuck = -Infinity;
  const listeners: Array<[string, EventListener]> = [];

  function publish(next: MusicState) {
    if (state === next || destroyed) return;
    state = next;
    // Media events are asynchronous; sync() itself must not recursively render the app.
    onStateChange();
  }
  function cancelStop() {
    if (stopTimer !== null) timers.clearTimeout(stopTimer);
    stopTimer = null;
  }
  function hold() {
    if (!volume) return 0;
    const now = context.currentTime, param = volume.gain;
    const held = fade ? fade.from + (fade.to - fade.from) * Math.max(0, Math.min(1, (now - fade.at) / fade.duration)) : param.value;
    if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now);
    else { param.cancelScheduledValues(now); param.setValueAtTime(held, now); }
    return held;
  }
  function ramp(level: number, duration: number) {
    if (!volume) return;
    const from = hold(), now = context.currentTime;
    volume.gain.linearRampToValueAtTime(level, now + duration);
    fade = { from, to: level, at: now, duration };
  }
  function silence() {
    if (!volume) return;
    volume.gain.cancelScheduledValues(context.currentTime);
    volume.gain.setValueAtTime(0, context.currentTime);
    fade = null;
  }
  function listen(type: string, fn: () => void) {
    const listener: EventListener = fn;
    media!.addEventListener(type, listener);
    listeners.push([type, listener]);
  }
  function prepare(): boolean {
    if (media) return true;
    if (typeof context.createMediaElementSource !== 'function') { failed = true; state = failureState = 'unavailable'; return false; }
    try {
      media = createMedia();
      if (!media) { failed = true; state = failureState = 'unavailable'; return false; }
      media.preload = 'none';
      media.loop = true;
      media.setAttribute('playsinline', '');
      source = context.createMediaElementSource(media);
      volume = context.createGain();
      volume.gain.value = 0;
      source.connect(volume);
      volume.connect(destination);
      listen('playing', () => {
        if (!desired || destroyed || failed) { media?.pause(); return; }
        failed = false;
        ramp(target, 2.4);
        publish('playing');
      });
      listen('waiting', () => { if (desired) { silence(); publish('loading'); } });
      listen('error', () => {
        if (!desired || destroyed) return;
        failed = true;
        pending = false;
        ++epoch;
        failureState = 'error';
        silence();
        media?.pause();
        publish('error');
      });
      media.src = track.file;
      return true;
    } catch (_) {
      failed = true;
      source?.disconnect();
      volume?.disconnect();
      source = null;
      volume = null;
      media?.pause();
      if (media) for (const [type, fn] of listeners) media.removeEventListener(type, fn);
      listeners.length = 0;
      media = null;
      state = failureState = 'unavailable';
      return false;
    }
  }
  function play() {
    if (pending || failed || !media || !desired || destroyed) return;
    if (!media.paused) { if (state === 'paused') { state = 'playing'; ramp(target, 1.4); } return; }
    const token = ++epoch;
    pending = true;
    state = 'loading';
    try {
      // Invoked synchronously by resume() inside the sound-button gesture as well as
      // by scene changes. Never wait for a fetch/decode before requesting playback.
      Promise.resolve(media.play()).then(() => {
        if (destroyed || !desired) { media?.pause(); return; }
        if (token !== epoch) return;
        pending = false;
        ramp(target, 2.4);
        publish('playing');
      }).catch((error: unknown) => {
        if (token !== epoch || destroyed || !desired) return;
        pending = false;
        failed = true;
        silence();
        media?.pause();
        failureState = error instanceof Error && error.name === 'NotAllowedError' ? 'blocked' : 'error';
        publish(failureState);
      });
    } catch (_) {
      pending = false;
      failed = true;
      silence();
      state = failureState = 'error';
    }
  }
  function pause(immediate = false, duration = .32) {
    if (destroyed) return;
    desired = false;
    pending = false;
    const token = ++epoch;
    cancelStop();
    if (!media) return;
    if (immediate || media.paused) { silence(); media.pause(); }
    else {
      ramp(0, duration);
      stopTimer = timers.setTimeout(() => { stopTimer = null; if (token === epoch && !desired) media?.pause(); }, Math.round(duration * 1000) + 20);
    }
    state = 'paused';
  }
  function sync(scene: MusicScene) {
    if (destroyed) return;
    const next = musicLevel(scene);
    if (!next) { if (desired) pause(); return; }
    cancelStop();
    const wasDesired = desired, changed = Math.abs(next - target) > .002;
    target = next;
    desired = true;
    if (failed) { state = failureState; return; }
    if (!prepare()) return;
    if (!wasDesired && !media!.paused) { state = 'playing'; ramp(target, 1.4); }
    else if (changed && state === 'playing') ramp(target, 1.2);
    play();
  }
  function resume(scene: MusicScene) {
    if (destroyed) return;
    failed = false;
    if (media?.error) media.load();
    sync(scene);
  }
  function duck(strength = .78, length = .65) {
    if (!volume || !desired || state !== 'playing' || context.currentTime - lastDuck < .12) return;
    lastDuck = context.currentTime;
    const now = context.currentTime;
    hold();
    const lower = target * Math.max(.5, Math.min(1, strength));
    volume.gain.linearRampToValueAtTime(lower, now + .04);
    volume.gain.linearRampToValueAtTime(target, now + length);
    fade = { from: lower, to: target, at: now + .04, duration: length - .04 };
  }
  function destroy() {
    if (destroyed) return;
    pause(true);
    destroyed = true;
    cancelStop();
    if (media) {
      for (const [type, fn] of listeners) media.removeEventListener(type, fn);
      media.removeAttribute('src');
      media.load();
    }
    source?.disconnect();
    volume?.disconnect();
    media = null;
    source = null;
    volume = null;
  }
  return { sync, resume, pause, duck, destroy, get state() { return state; }, get playing() { return desired && state === 'playing'; } };
}

/** Cache at most the four known themes. Only the current theme and its outgoing
 * crossfade may play; paused themes preserve position and do not run timers. */
export function createMusicLayer(options: MusicLayerOptions) {
  const layers = new Map<string, ReturnType<typeof createTrackLayer>>();
  let requested: MusicTrack | null = null;
  let previous: string | null = null;
  let desired = false, destroyed = false;

  function fadePrevious(duration: number) {
    const id = previous;
    previous = null;
    if (id && id !== requested?.id) layers.get(id)?.pause(false, duration);
  }
  function getLayer(track: MusicTrack) {
    let layer = layers.get(track.id);
    if (!layer) {
      layer = createTrackLayer({ ...options, track, onStateChange: () => {
        if (destroyed) return;
        if (desired && requested?.id === track.id) {
          const current = layers.get(track.id);
          if (current?.state === 'playing') fadePrevious(.95);
          else if (current && ['error', 'blocked', 'unavailable'].includes(current.state)) fadePrevious(.32);
        }
        options.onStateChange?.();
      } });
      layers.set(track.id, layer);
    }
    return layer;
  }
  function pause(immediate = false) {
    desired = false;
    previous = null;
    for (const layer of layers.values()) layer.pause(immediate);
  }
  function select(scene: MusicScene, retry: boolean) {
    if (destroyed) return;
    const track = musicTrack(scene);
    if (!track) { if (desired) pause(); return; }
    if (requested?.id !== track.id) {
      const outgoing = requested && layers.get(requested.id)?.playing ? requested.id : previous;
      for (const [id, layer] of layers) if (id !== track.id && id !== outgoing) layer.pause(true);
      previous = outgoing !== track.id ? outgoing : null;
      requested = track;
    }
    desired = true;
    // Keep a softened outgoing theme until the new stream is ready, then fade
    // it out. Rapid selections stop older streams instead of stacking music.
    if (previous) layers.get(previous)?.sync(scene);
    const current = getLayer(track);
    retry ? current.resume(scene) : current.sync(scene);
    if (current.state === 'playing') fadePrevious(.95);
    else if (['error', 'blocked', 'unavailable'].includes(current.state)) fadePrevious(.32);
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    desired = false;
    previous = null;
    for (const layer of layers.values()) layer.destroy();
    layers.clear();
  }
  return {
    sync: (scene: MusicScene) => select(scene, false),
    resume: (scene: MusicScene) => select(scene, true),
    pause,
    duck: (strength?: number, length?: number) => { if (desired && requested) layers.get(requested.id)?.duck(strength, length); },
    destroy,
    get track() { return requested; },
    get state(): MusicState { return requested ? layers.get(requested.id)?.state || 'off' : 'off'; },
    get playing() { return !!(desired && requested && layers.get(requested.id)?.playing); },
  };
}
