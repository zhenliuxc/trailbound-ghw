export function element<K extends keyof HTMLElementTagNameMap>(tag: K, parent: Element, className = '', text = ''): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag); node.className = className; node.textContent = text; parent.append(node); return node;
}
export function action(parent: Element, text: string, fn: () => void, primary = false): HTMLButtonElement {
  const button = element('button', parent, primary ? 'glimpse-primary' : 'glimpse-secondary', text);
  button.type = 'button'; button.addEventListener('click', fn); return button;
}
export function gear(parent: Element, fn: () => void): HTMLButtonElement {
  const button = action(parent, '', fn); button.className = 'glimpse-settings'; button.setAttribute('aria-label', '设置');
  button.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m10 2-.6 3-1.8.8-2.6-1.6-2.3 3L5 9.3l-.2 2-2.8 1 .8 3.7 3-.1 1.4 1.5-.5 3 3.5 1.5 1.7-2.5 2 .1 1.5 2.6 3.6-1.2-.2-3 1.5-1.4 3 .4 1.1-3.6-2.7-1.5-.1-2 2.4-1.8-1.7-3.3-3 .6-1.5-1.3L13.8 2Z" transform="translate(1 1) scale(.9)" fill="currentColor"/><circle cx="12" cy="12" r="4" fill="var(--glimpse-paper,#f6f3e5)"/></svg><span class="glimpse-tooltip">设置</span>';
  return button;
}
export function paperButton(parent: Element, fn: () => void): HTMLButtonElement {
  const button = action(parent, '', fn); button.className = 'glimpse-paper-entry'; button.hidden = true;
  button.setAttribute('aria-label', '你看这里，翻开路笺'); button.setAttribute('aria-haspopup', 'dialog');
  button.innerHTML = '<svg class="glimpse-fold" aria-hidden="true" viewBox="0 0 156 56" preserveAspectRatio="none"><path d="M10 4Q6 4 4 10L5 46Q6 53 14 53L145 51Q151 51 151 44L153 12 130 3 75 4Z" fill="#f3f0df" stroke="#9ba68d" stroke-width=".8"/><path d="m130 3 3 14 20-2Z" fill="#fffdf4" stroke="#9ba68d" stroke-width=".7"/><path d="m11 47 107-1" stroke="#c4c9b1" stroke-width=".6"/></svg><svg class="glimpse-sprout" aria-hidden="true" viewBox="0 0 28 30"><path d="M4 26Q19 13 22 5M12 18Q1 17 4 11Q12 8 15 16M16 15Q13 2 25 2Q28 11 16 15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>你看这里</span>';
  return button;
}
