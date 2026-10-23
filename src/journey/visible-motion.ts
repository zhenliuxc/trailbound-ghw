export type CancelMotion = () => void;

/** A visible-time animation. Cancellation never runs the completion callback. */
export function animateWhileVisible(element: HTMLElement, frames: Keyframe[], timing: KeyframeAnimationOptions, finish: () => void): CancelMotion {
  const doc = element.ownerDocument;
  let cancelled = false, animation: Animation | null = null, timer = 0;
  let remaining = Number(timing.duration ?? 0) + Number(timing.delay ?? 0), started: number | null = null;
  const cleanup = () => { doc.removeEventListener('visibilitychange', visibility); window.clearTimeout(timer); delete element.dataset.motionPaused; };
  const complete = () => { if (cancelled) return; cancelled = true; cleanup(); finish(); animation?.cancel(); };
  const startTimer = () => { started = performance.now(); timer = window.setTimeout(complete, remaining); };
  function visibility(): void {
    element.dataset.motionPaused = String(doc.hidden);
    if (animation) { if (doc.hidden) animation.pause(); else animation.play(); }
    else if (doc.hidden) { window.clearTimeout(timer); if (started !== null) remaining = Math.max(0, remaining - (performance.now() - started)); started = null; }
    else startTimer();
  }
  try { animation = element.animate(frames, { ...timing, fill: 'both' }); } catch { /* The same visible-time hold remains usable without Web Animations. */ }
  if (animation) void animation.finished.then(complete, () => {});
  doc.addEventListener('visibilitychange', visibility);
  if (animation || !doc.hidden) visibility();
  return () => { if (cancelled) return; cancelled = true; cleanup(); animation?.cancel(); };
}

export function enterDialog(dialog: HTMLDialogElement, reduced: boolean): CancelMotion {
  dialog.dataset.dissolve = 'enter';
  dialog.style.setProperty('--ww-fade-duration', `${reduced ? 180 : 650}ms`);
  const cancel = animateWhileVisible(dialog, [{ opacity: 0 }, { opacity: 1 }], { duration: reduced ? 180 : 650, easing: 'ease-out' }, () => { delete dialog.dataset.dissolve; });
  return () => { cancel(); delete dialog.dataset.dissolve; };
}

export function leaveDialog(dialog: HTMLDialogElement, reduced: boolean, finish: () => void, memory = true): CancelMotion {
  const hold = memory ? (reduced ? 1200 : 1500) : 0, fade = reduced ? 180 : memory ? 950 : 450;
  dialog.dataset.dissolve = memory ? 'memory' : 'leave';
  dialog.style.setProperty('--ww-fade-duration', `${hold + fade}ms`);
  dialog.style.setProperty('--ww-fade-hold', `${hold}ms`);
  dialog.style.setProperty('--ww-fade-tail', `${fade}ms`);
  const cancel = animateWhileVisible(dialog, [{ opacity: 1 }, { opacity: 1, offset: hold / (hold + fade) }, { opacity: 0 }], { duration: hold + fade, easing: 'ease-in-out' }, () => { finish(); delete dialog.dataset.dissolve; });
  return () => { cancel(); delete dialog.dataset.dissolve; };
}
