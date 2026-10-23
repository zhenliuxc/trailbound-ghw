import { CAPTION_SUGGESTED_LIMIT, PEN_NAMES, glimpsePoint, isPenName, photoFrame, type GlimpsePoint } from '../../content/look-here';
import { visibleCharacterCount, type PhotoAttribution } from '../../runtime/private-photo';
import type { GlimpseApplication } from './application';
import type { Draft, Panel } from './editor';
import { action, element, gear } from './paper';

interface GlimpseViewOptions {
  section: HTMLElement;
  app: GlimpseApplication;
  go(next: Panel, focusId?: string): void;
  requestClose(): void;
  close(): void;
  solitudeChanged(stored: boolean): void;
}
export function createGlimpseView(options: GlimpseViewOptions) {
  const { section, app, go, requestClose, close } = options;
  function heading(text: string, place = '') {
    const head = element('header', section, 'glimpse-header');
    const copy = element('div', head); if (place) element('p', copy, 'glimpse-kicker', place);
    const title = element('h2', copy, '', text); title.id = 'glimpse-title'; title.tabIndex = -1;
    const dismiss = action(head, '×', () => requestClose()); dismiss.className = 'glimpse-close'; dismiss.setAttribute('aria-label', '合上路笺');
  }
  function image(parent: Element, src: string, alt: string) {
    const frame = element('div', parent, 'glimpse-image');
    const img = element('img', frame); img.alt = alt; img.decoding = 'async';
    const message = element('p', frame, 'glimpse-image-state', '这一眼正在展开…'); message.setAttribute('role', 'status');
    img.addEventListener('load', () => { message.hidden = true; });
    img.addEventListener('error', () => { message.hidden = false; message.textContent = '画面暂未展开，文字仍可阅读。'; });
    if (src) img.src = src;
    return { frame, img, message };
  }
  function text(parent: Element, content: string) { if (content.trim()) element('p', parent, 'glimpse-caption', content); }
  function attribution(parent: Element, value: PhotoAttribution) { element('p', parent, 'glimpse-attribution', value.kind === 'anonymous' ? '匿名 · 不显示笔名' : `留笺人：${value.name}`); }
  function status(parent: Element, message = '') { const p = element('p', parent, 'glimpse-status', message); p.setAttribute('role', 'status'); return p; }
  async function save(target: HTMLElement, leave = false) {
    if (app.saving) return;
    target.textContent = '正在保存到本机…';
    const result = await app.save();
    if (result.kind === 'ignored') return;
    if (result.kind === 'error') { target.textContent = result.message; return; }
    if (leave) close(); else go({ kind: 'saved', photo: result.photo });
  }
  function renderNote(point: GlimpsePoint, token: number) {
    heading('你看这里', point.name);
    element('p', section, 'glimpse-subtitle', '把你发现的风景，留给路过的人。');
    if (app.hidden(point.id)) element('p', section, 'glimpse-empty', '这张路笺已在本机隐藏。继续看看眼前的风景吧。');
    else {
      const picture = image(section, app.cachedNote(point) ?? '', `${point.name}的游戏场景取景示意`);
      text(section, point.caption);
      element('p', section, 'glimpse-attribution', '山径创作路笺 · 游戏场景取景示意');
      if (!app.cachedNote(point)) {
        const load = () => {
          picture.message.textContent = '这一眼正在展开…';
          void app.note(point, token).then(src => {
            if (src !== null) picture.img.src = src;
          }, () => { if (app.active(token)) { picture.message.textContent = '这张路笺暂未展开。'; action(picture.message, '再试一次', load); } });
        }; load();
      }
    }
    const actions = element('div', section, 'glimpse-actions');
    action(actions, '合上', () => close(), true);
    action(actions, '留下我的这一眼', () => go({ kind: 'compose', draft: app.fresh(point) }));
    const extras = element('div', section, 'glimpse-note-extras');
    const more = element('details', extras); element('summary', more, '', '更多');
    if (!app.hidden(point.id)) action(more, '不再看这张', () => { app.hide(point.id); close(); });
    element('p', more, 'glimpse-small', '当前仅有山径创作示例，真实旅人内容尚未开放。');
    gear(extras, () => go({ kind: 'settings' }));
  }
  function renderCompose(draft: Draft, token: number) {
    heading('留住此刻', draft.point.name);
    element('p', section, 'glimpse-local-label', '只保存在这台设备 · 不会自动发布');
    const layout = element('div', section, 'glimpse-compose-layout'), camera = element('div', layout, 'glimpse-camera');
    const picture = image(camera, draft.image ?? '', `${draft.point.name}，${draft.point.labels[draft.anchor]}`);
    const controls = element('div', camera, 'glimpse-camera-controls');
    const anchors = element('div', controls, 'glimpse-anchors'); anchors.setAttribute('role', 'group'); anchors.setAttribute('aria-label', '安全取景角度');
    let preview: string | null = draft.image, captureGeneration = 0;
    const update = () => {
      const shot = ++captureGeneration; preview = null; capture.disabled = true; picture.message.hidden = false;
      void app.capture(photoFrame(draft.point, draft.anchor, draft.zoom), token).then(src => {
        if (src === null || !app.active(token) || shot !== captureGeneration) return;
        preview = src; picture.img.src = src; capture.disabled = false;
      }, () => {
        if (!app.active(token) || shot !== captureGeneration) return;
        picture.message.textContent = '取景暂时没有完成，配文仍保留。'; action(picture.message, '重新取景', update);
      });
    };
    draft.point.labels.forEach((label, index) => {
      const id = `glimpse-anchor-${index}`;
      const b = action(anchors, label, () => { draft = app.edit({ kind: 'anchor', index }) ?? draft; go({ kind: 'compose', draft }, id); });
      b.id = id;
      b.setAttribute('aria-pressed', String(draft.anchor === index));
    });
    const zoom = element('div', controls, 'glimpse-zoom');
    const zoomOut = action(zoom, '−', () => { draft = app.edit({ kind: 'zoom', value: draft.zoom - .1 }) ?? draft; go({ kind: 'compose', draft }, 'glimpse-zoom-out'); });
    zoomOut.id = 'glimpse-zoom-out'; zoomOut.setAttribute('aria-label', '缩小取景');
    const zoomValue = element('span', zoom, '', `${draft.zoom.toFixed(1)}× · 4:3`); zoomValue.setAttribute('role', 'status');
    const zoomIn = action(zoom, '+', () => { draft = app.edit({ kind: 'zoom', value: draft.zoom + .1 }) ?? draft; go({ kind: 'compose', draft }, 'glimpse-zoom-in'); });
    zoomIn.id = 'glimpse-zoom-in'; zoomIn.setAttribute('aria-label', '放大取景');
    element('p', camera, 'glimpse-small', '三个固定角度，只取眼前这段已到访的风景。');
    const editor = element('div', layout, 'glimpse-editor');
    const label = element('label', editor, '', '想让路过的人注意哪里？'); label.htmlFor = 'glimpse-caption';
    const input = element('textarea', editor); input.id = 'glimpse-caption'; input.rows = 4; input.value = draft.body;
    input.placeholder = '可以写写你的发现，也可以只留照片。';
    const count = element('p', editor, 'glimpse-count'); count.id = 'glimpse-text-count'; input.setAttribute('aria-describedby', 'glimpse-text-count');
    const updateCount = () => {
      draft = app.edit({ kind: 'caption', body: input.value }) ?? draft; const n = visibleCharacterCount(input.value);
      count.textContent = n > CAPTION_SUGGESTED_LIMIT ? `${n} 字 · 超出建议 ${n - CAPTION_SUGGESTED_LIMIT} 字，仍可私藏` : `${n} / ${CAPTION_SUGGESTED_LIMIT} 字（建议）`;
    };
    input.addEventListener('input', updateCount); updateCount();
    const privacy = element('p', editor, 'glimpse-small', '请不要留下联系方式、个人隐私或未到访地点的线索。'); privacy.id = 'glimpse-caption-help';
    input.setAttribute('aria-describedby', 'glimpse-text-count glimpse-caption-help');
    const helpers = element('div', editor, 'glimpse-inline-actions'), suggestions = element('div', editor, 'glimpse-recommendations'); suggestions.hidden = true;
    suggestions.id = 'glimpse-recommendations';
    let replacement: HTMLElement | null = null;
    const clearReplacement = () => { replacement?.remove(); replacement = null; };
    const recommend = action(helpers, '推荐一句', () => { clearReplacement(); suggestions.hidden = !suggestions.hidden; recommend.setAttribute('aria-expanded', String(!suggestions.hidden)); });
    recommend.setAttribute('aria-controls', suggestions.id); recommend.setAttribute('aria-expanded', 'false');
    action(helpers, '清空', () => { clearReplacement(); input.value = ''; updateCount(); input.focus(); });
    for (const sentence of draft.point.recommendations) {
      const row = element('div', suggestions, 'glimpse-recommendation'); element('p', row, '', sentence);
      action(row, '用这句', () => {
        clearReplacement();
        const use = () => { if (app.recommend(sentence, true) !== 'applied') return; clearReplacement(); input.value = sentence; updateCount(); suggestions.hidden = true; recommend.setAttribute('aria-expanded', 'false'); input.focus(); };
        if (app.recommend(sentence) === 'applied') { use(); return; }
        const confirm = element('div', row, 'glimpse-replace'); element('p', confirm, '', '替换当前文字？');
        replacement = confirm; confirm.setAttribute('role', 'group'); confirm.setAttribute('aria-label', '是否替换当前配文'); confirm.tabIndex = -1;
        action(confirm, '替换当前文字', use); action(confirm, '保留原文', () => { clearReplacement(); input.focus(); });
        confirm.focus();
      });
    }
    const message = status(editor);
    const capture = action(editor, draft.image ? '重新取景' : '拍下这一眼', () => {
      if (draft.image) { draft = app.edit({ kind: 'retake' }) ?? draft; go({ kind: 'compose', draft }); return; }
      if (preview) { draft = app.edit({ kind: 'capture', image: preview }) ?? draft; go({ kind: 'compose', draft }); }
    }, !draft.image);
    if (draft.image) {
      action(editor, '私藏到手帐', () => { void save(message); }, true);
      action(editor, '看看路笺预览', () => go({ kind: 'preview', draft }));
    } else update();
  }
  function renderPreview(draft: Draft) {
    heading('最后看一眼', '本机预览 · 尚未公开');
    image(section, draft.image ?? '', `${draft.point.name}的私藏照片`); text(section, draft.body);
    const names = element('fieldset', section, 'glimpse-name-choice'); element('legend', names, '', '这一张是否署名');
    for (const kind of ['anonymous', 'pen-name'] as const) {
      const label = element('label', names), radio = element('input', label); radio.type = 'radio'; radio.name = 'glimpse-attribution'; radio.checked = draft.attribution.kind === kind;
      element('span', label, '', kind === 'anonymous' ? '匿名留下' : '署名留下');
      radio.id = `glimpse-attribution-${kind}`;
      radio.addEventListener('change', () => { if (radio.checked) { draft = app.edit({ kind: 'attribution', value: kind === 'anonymous' ? { kind } : { kind, name: PEN_NAMES[0] } }) ?? draft; go({ kind: 'preview', draft }, radio.id); } });
    }
    if (draft.attribution.kind === 'pen-name') {
      const label = element('label', section, 'glimpse-pen-label', '选择笔名');
      const select = element('select', label); select.id = 'glimpse-pen-name'; select.setAttribute('aria-label', '本稿笔名');
      for (const name of PEN_NAMES) { const option = element('option', select, '', name); option.value = name; }
      select.value = draft.attribution.name;
      select.addEventListener('change', () => { if (isPenName(select.value)) { draft = app.edit({ kind: 'attribution', value: { kind: 'pen-name', name: select.value } }) ?? draft; go({ kind: 'preview', draft }, select.id); } });
      element('p', section, 'glimpse-small', '笔名可以重名，同名不代表同一位旅人。');
    }
    attribution(section, draft.attribution);
    element('p', section, 'glimpse-service-note', '真实旅人发布尚未开放。这里仅预览图文与署名，不会发送或公开。');
    const message = status(section), actions = element('div', section, 'glimpse-actions');
    action(actions, '只留给自己', () => { void save(message); }, true);
    action(actions, '返回编辑', () => go({ kind: 'compose', draft }));
  }
  function renderSettings() {
    heading('设置');
    const label = element('label', section, 'glimpse-solitude');
    const checkbox = element('input', label); checkbox.type = 'checkbox'; checkbox.checked = app.solitude;
    const copy = element('span', label); element('strong', copy, '', '独自走走'); element('small', copy, '', '隐藏所有路笺入口，不影响照片、手帐和路线。');
    const warning = status(section);
    checkbox.addEventListener('change', () => {
      const stored = app.setSolitude(checkbox.checked);
      options.solitudeChanged(stored);
      if (!app.solitude && !stored) warning.textContent = '独行偏好暂未保存，本次选择仍有效。';
    });
    action(section, '我的私藏', () => go({ kind: 'album' }));
    element('p', section, 'glimpse-small', '照片与配文只存在这台设备。真实旅人路笺和公开发布尚未接入。');
    action(section, '合上', () => close(), true);
  }
  function renderAlbum(token: number) {
    heading('我的私藏'); const message = status(section, '正在翻开本机照片…');
    void app.read(token).then(result => {
      if (!result) return;
      if (result.kind === 'error') { message.textContent = result.message; action(section, '重新读取', () => go({ kind: 'album' })); return; }
      message.textContent = result.photos.length ? '只保存在这台设备，没有公开。' : '沿途拍下的这一眼，会留在这里。';
      const grid = element('div', section, 'glimpse-album');
      for (const photo of result.photos) {
        const b = action(grid, '', () => go({ kind: 'saved', photo }));
        image(b, photo.image, glimpsePoint(photo.point)?.name ?? '九溪私藏'); element('span', b, '', glimpsePoint(photo.point)?.name ?? '九溪私藏');
      }
    }); action(section, '合上', () => close(), true);
  }
  function render(state: Panel, token: number) {
    section.replaceChildren();
    if (state.kind === 'note') renderNote(state.point, token);
    else if (state.kind === 'compose') renderCompose(state.draft, token);
    else if (state.kind === 'preview') renderPreview(state.draft);
    else if (state.kind === 'settings') renderSettings();
    else if (state.kind === 'album') renderAlbum(token);
    else if (state.kind === 'saved') {
      heading('我的私藏', glimpsePoint(state.photo.point)?.name ?? '九溪');
      image(section, state.photo.image, '九溪游戏场景私藏照片'); text(section, state.photo.body); attribution(section, state.photo.attribution);
      status(section, '已私藏在这台设备上 · 尚未公开');
      const actions = element('div', section, 'glimpse-actions'); action(actions, '合上', () => close(), true); action(actions, '翻看我的私藏', () => go({ kind: 'album' }));
    } else if (state.kind === 'leave') {
      heading('先把这一眼保存下来？');
      element('p', section, '', '保存到自己的手帐吗？这一步只保存在本机。');
      const message = status(section);
      const saveButton = action(section, '私藏并离开', () => { void save(message, true); }, true);
      if (!state.draft.image) {
        saveButton.disabled = true;
        void app.capture(photoFrame(state.draft.point, state.draft.anchor, state.draft.zoom), token).then(src => {
          if (src !== null && app.active(token)) { app.edit({ kind: 'capture', image: src }); saveButton.disabled = false; }
        }, () => { if (app.active(token)) message.textContent = '取景还未完成，可以继续编辑或放弃。'; });
      }
      action(section, '放弃这次编辑', () => close()); action(section, '继续编辑', () => { const current = app.panel; if (current?.kind === 'leave') go({ kind: 'compose', draft: current.draft }); });
    }
  }
  return { render };
}
