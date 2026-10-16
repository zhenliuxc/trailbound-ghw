/** DOM access is kept at the UI boundary, rather than in game rules. */
export function createDom(document: Document) {
  function get<T extends HTMLElement = HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing game element: ${id}`);
    return element as T;
  }
  function html<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string | null, parent?: Element, className?: string): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.setAttribute('class', className);
    parent?.appendChild(element);
    return element;
  }
  function text(id: string, value: string) {
    const element = get(id);
    if (element.textContent !== value) element.textContent = value;
  }
  return { document, get, html, text };
}
export type GameDom = ReturnType<typeof createDom>;

export class EventBindings {
  private cleanups: (() => void)[] = [];
  listen<K extends keyof HTMLElementEventMap>(target: HTMLElement, type: K, listener: (event: HTMLElementEventMap[K]) => void): void {
    const handler = listener as EventListener;
    target.addEventListener(type, handler);
    this.cleanups.push(() => target.removeEventListener?.(type, handler));
  }
  destroy() {
    for (const cleanup of this.cleanups.splice(0)) cleanup();
  }
}
