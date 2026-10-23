import { CHARACTERS, CHARACTER_IDS, rememberCharacter, type CharacterId } from './catalog';

interface CharacterPickerOptions {
  readonly trigger: HTMLButtonElement; readonly signal: AbortSignal;
  current(): CharacterId;
  beforeOpen(): boolean;
  apply(id: CharacterId, signal: AbortSignal): Promise<void>;
  afterClose(): void;
}
export function createCharacterPicker(options: CharacterPickerOptions) {
  const { trigger, signal } = options, document = trigger.ownerDocument;
  const dialog = document.createElement('dialog'); dialog.className = 'character-picker';
  dialog.id = trigger.id + '-dialog'; dialog.setAttribute('aria-labelledby', dialog.id + '-title');
  const heading = document.createElement('h2'); heading.id = dialog.id + '-title'; heading.textContent = '选择旅人';
  const description = document.createElement('p'); description.className = 'character-picker-copy'; description.textContent = '途中也能更换，已走过的路会保留。';
  const close = document.createElement('button'); close.type = 'button'; close.className = 'character-picker-close'; close.textContent = '×'; close.setAttribute('aria-label', '关闭角色选择');
  const choices = document.createElement('div'); choices.className = 'character-choices'; choices.setAttribute('role', 'group'); choices.setAttribute('aria-label', '可选旅人');
  const status = document.createElement('p'); status.className = 'character-picker-status'; status.setAttribute('role', 'status');
  const apply = document.createElement('button'); apply.type = 'button'; apply.className = 'character-picker-apply'; apply.textContent = '就选这位';
  dialog.append(close, heading, description, choices, status, apply); document.body.append(dialog);
  trigger.classList.add('character-trigger'); trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('aria-controls', dialog.id); trigger.disabled = true;
  let selected = options.current(), request: AbortController | null = null, disposed = false;
  const cards = CHARACTER_IDS.map(id => {
    const appearance = CHARACTERS[id], card = document.createElement('button'); card.type = 'button'; card.className = 'character-choice'; card.dataset.character = id;
    const image = document.createElement('img'); image.src = appearance.preview; image.alt = ''; image.width = 190; image.height = 240; image.decoding = 'async';
    const name = document.createElement('strong'); name.textContent = appearance.name;
    const detail = document.createElement('small'); detail.textContent = appearance.detail;
    const mark = document.createElement('span'); mark.className = 'character-choice-mark'; mark.textContent = '✓'; mark.setAttribute('aria-hidden', 'true');
    card.append(image, name, detail, mark); choices.append(card);
    image.addEventListener('error', () => { image.hidden = true; detail.textContent = '形象预览暂未加载，仍可尝试选择。'; }, { signal });
    card.addEventListener('click', () => { selected = id; status.textContent = ''; updateChoices(); }, { signal });
    return { id, card };
  });
  function updateChoices(): void {
    for (const { id, card } of cards) { card.setAttribute('aria-pressed', String(id === selected)); card.disabled = request !== null; }
    apply.disabled = request !== null;
  }
  function refresh(): void {
    const id = options.current(); trigger.textContent = '角色'; trigger.title = '当前角色：' + CHARACTERS[id].name;
    trigger.setAttribute('aria-label', '选择角色，当前为' + CHARACTERS[id].name); trigger.dataset.character = id; trigger.disabled = false;
  }
  function cancelRequest(): void { request?.abort(); request = null; updateChoices(); }
  trigger.addEventListener('click', () => {
    if (disposed || dialog.open || document.querySelector('dialog[open]') || !options.beforeOpen()) return;
    selected = options.current(); status.textContent = ''; updateChoices(); dialog.showModal();
  }, { signal });
  close.addEventListener('click', () => { cancelRequest(); dialog.close(); }, { signal });
  dialog.addEventListener('cancel', () => cancelRequest(), { signal });
  dialog.addEventListener('close', () => {
    cancelRequest(); if (signal.aborted || disposed) return;
    options.afterClose(); trigger.focus({ preventScroll: true });
  }, { signal });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) { cancelRequest(); dialog.close(); }
  }, { signal });
  apply.addEventListener('click', () => {
    if (request || disposed) return;
    const pending = new AbortController(); request = pending; const id = selected;
    status.textContent = '旅人正在准备背包…'; updateChoices();
    void options.apply(id, pending.signal).then(() => {
      if (pending.signal.aborted || disposed || !dialog.open) return;
      const saved = rememberCharacter(id); refresh(); dialog.close();
      if (!saved) { trigger.title = CHARACTERS[id].name + '已换好，本次可用；浏览器暂时无法记住选择。'; }
    }, error => {
      if (pending.signal.aborted || disposed || !dialog.open) return;
      status.textContent = error instanceof Error ? error.message : '角色暂未展开，请重试。';
    }).finally(() => { if (request === pending) { request = null; updateChoices(); } });
  }, { signal });
  function destroy(): void { if (disposed) return; disposed = true; cancelRequest(); if (dialog.open) dialog.close(); dialog.remove(); }
  signal.addEventListener('abort', destroy, { once: true });
  return { get open() { return dialog.open; }, refresh, destroy };
}
