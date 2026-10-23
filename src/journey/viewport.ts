/** Observe only after scene loading; pending layout work is cancelled with the route. */
export function observeMapSize(map: HTMLElement, signal: AbortSignal, resize: () => void): void {
  if (signal.aborted) return;
  let timer = 0;
  const observer = new ResizeObserver(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => { if (!signal.aborted) resize(); }, 80);
  });
  observer.observe(map);
  signal.addEventListener('abort', () => { window.clearTimeout(timer); observer.disconnect(); }, { once: true });
}
