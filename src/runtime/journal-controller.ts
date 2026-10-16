import type { JournalData, Moment, MomentCatalog, RouteId, RouteSummary } from './contracts';
import type { GameDom } from './dom';
import { EventBindings } from './dom';
import type { SceneManager, SceneSession } from './scene-manager';

interface PlaceSource { name: string; url: string }
interface JournalOptions {
  dom: GameDom;
  catalog: MomentCatalog;
  data: JournalData;
  routes: RouteSummary[];
  weather: Record<string, { name: string }>;
  scenes: SceneManager;
  storage: Storage | null;
  reduced: boolean;
  tripCount(): number;
  rewardOpen(): boolean;
  pauseInteraction(): void;
  stopLoop(): void;
  refresh(): void;
  onRemember(moment: Moment): void;
  evidence(id: string): (PlaceSource & { fact: string }) | null;
  observation(id: string): { fact: string; source: string } | null;
  source(id: string): PlaceSource | null;
}

/** Owns the tag wall, reader, paging, persistence and per-trip display. Never clears saves. */
export function createJournalController(options: JournalOptions) {
  const { dom, catalog: D, data, scenes } = options;
  const { get: $, html } = dom;
  const bindings = new EventBindings();
  const pictures = new Map<string, HTMLElement>();
  let records = D.loadMoments(options.storage);
  let tripMoments: Moment[] = [];
  let route: RouteId | 'all' = 'all';
  let pageSize = data.PAGE_SIZE;
  let session: SceneSession | null = null;
  let trigger: HTMLButtonElement | null = null;
  let bodyOverflow = '';
  let entries: Moment[] = [];
  let index = 0;
  let flip: Animation | null = null;
  let swipe: { id: number; x: number; y: number; time: number; scroll: number } | null = null;

  function tagImage(parent: Element, file: string, label: string, reading = false) {
    const key = file + '|' + label;
    const cached = reading && pictures.get(key);
    if (cached) { parent.appendChild(cached); return cached; }
    const badge = html('span', null, parent, 'journal-badge-art journal-tag-art');
    badge.setAttribute('role', 'img');
    badge.setAttribute('aria-label', label + ' · 手绘收藏标签');
    const status = html('span', '画作展开中', badge, 'journal-art-status');
    const image = html('img', null, badge, 'journal-tag-image');
    status.setAttribute('aria-hidden', 'true');
    image.setAttribute('alt', '');
    image.setAttribute('loading', reading ? 'eager' : 'lazy');
    image.setAttribute('decoding', 'async');
    image.style.opacity = '0';
    if (reading) pictures.set(key, badge);
    const reveal = () => { status.hidden = true; image.style.opacity = '1'; };
    image.onload = () => { if (reading && image.decode) image.decode().then(reveal, reveal); else reveal(); };
    image.onerror = () => {
      status.textContent = '画作暂未加载';
      image.hidden = true;
      badge.setAttribute('aria-label', label + ' · 画作暂未加载，文字回忆仍可阅读');
    };
    image.setAttribute('src', file);
    return badge;
  }
  function badge(parent: Element, moment: Moment, reading = false) {
    if (moment.edition === 3 && !D.hasTag(moment)) {
      const note = html('span', null, parent, 'journal-memory-label');
      const svg = dom.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 72 44');
      svg.setAttribute('aria-hidden', 'true');
      const path = dom.document.createElementNS('http://www.w3.org/2000/svg', 'path');
      for (const [key, value] of Object.entries({ d: 'M8 34L25 12L37 28L47 18L65 34M20 34H54M26 38H47', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })) path.setAttribute(key, value);
      svg.appendChild(path); note.appendChild(svg);
      html('span', '沿途记事', note); html('small', '未获得标签', note);
      return note;
    }
    const file = D.tagArt(moment);
    if (file) return tagImage(parent, file, moment.tag || moment.title, reading);
    const entryIndex = Math.max(0, D.CATALOG.findIndex(entry => entry.id === moment.id));
    const i = entryIndex % 9;
    const node = html('span', null, parent, 'journal-badge-art');
    node.setAttribute('role', 'img'); node.setAttribute('aria-label', moment.title + '的山野徽章');
    node.style.backgroundImage = `url('badges/${['moments-v1', 'moments-expansion-v1', 'moments-westlake-v2'][Math.floor(entryIndex / 9)]}.webp')`;
    node.style.backgroundPosition = `${i % 3 * 50}% ${Math.floor(i / 3) * 50}%`;
    return node;
  }
  function render(append = false) {
    const list = $('journal-list');
    const book = data.page(records, route, pageSize);
    $('journal-count').textContent = `${book.totalAll}个瞬间`;
    $('trip-count').textContent = `本次记下${options.tripCount()}个瞬间`;
    const routeName = options.routes.find(r => r.id === route)?.name || '全部路线';
    $('journal-filter-count').textContent = book.total ? `${routeName} · ${book.total}段回忆${book.remaining ? `，已展示${book.entries.length}段` : ''}` : `${routeName} · 等待新的回忆`;
    $('journal-more').hidden = book.remaining === 0;
    $('journal-more').textContent = `再翻${Math.min(data.PAGE_SIZE, book.remaining)}段回忆 ↓`;
    const offset = append ? list.children.length : 0;
    if (!append) list.replaceChildren();
    if (!book.total) {
      const empty = html('li', null, list, 'journal-empty');
      html('strong', '这一页，留给下一次相遇', empty);
      html('p', '一阵风、一片落叶，或一段安静的水声。沿途收下的手绘和回忆，会一起留在这里。', empty);
      return;
    }
    for (const moment of book.entries.slice(offset)) {
      const li = html('li', null, list, 'journal-entry found');
      li.setAttribute('data-route', moment.route); li.setAttribute('data-moment', moment.key);
      li.setAttribute('data-kind', D.hasTag(moment) ? 'tag' : 'note');
      const button = html('button', null, li, 'journal-wall-button');
      for (const [key, value] of Object.entries({ type: 'button', 'aria-haspopup': 'dialog', 'aria-controls': 'journal-detail', 'aria-expanded': 'false', 'aria-label': '翻看' + moment.title + ' · ' + moment.place })) button.setAttribute(key, value);
      badge(button, moment);
      html('strong', moment.title, button, 'journal-wall-title');
      html('small', moment.place.split(' · ')[0], button, 'journal-wall-place');
      html('span', '翻看回忆 ↗', button, 'journal-wall-hint').setAttribute('aria-hidden', 'true');
      // Wall nodes are replaced on filtering, so their listeners have the same lifetime.
      button.addEventListener('click', () => open(moment, button));
    }
  }
  function renderDetail(direction = 0) {
    const moment = entries[index];
    if (!moment) return;
    const page = $('journal-detail-page');
    flip?.cancel(); flip = null; page.replaceChildren(); page.scrollTop = 0;
    if (D.hasTag(moment)) {
      const art = html('div', null, page, 'journal-illustration');
      badge(art, moment, true); html('span', '一幅手绘，留住这一刻', art, 'journal-art-caption');
    }
    const copy = html('div', null, page, 'journal-copy');
    html('p', moment.place, copy, 'journal-location');
    html('h3', moment.title, copy, 'journal-entry-title').id = 'journal-detail-title';
    html('p', moment.memory, copy, 'journal-memory');
    const meta = html('div', null, copy, 'journal-entry-meta');
    if (typeof moment.createdAt === 'number' && Number.isFinite(moment.createdAt)) {
      const date = new Date(moment.createdAt);
      const time = html('time', date.toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }), meta, 'journal-time');
      time.setAttribute('datetime', date.toISOString());
    } else html('span', '从旧手帐留下', meta, 'journal-time');
    if (!D.hasTag(moment)) html('span', '沿途记事', meta, 'journal-entry-kind');
    const weather = moment.weather && options.weather[moment.weather];
    if (weather) html('span', weather.name, meta, 'journal-entry-weather');
    const proof = moment.edition === 3 ? options.evidence(moment.id) : null;
    const observation = proof ? null : options.observation(moment.id);
    const note = proof || observation;
    const source = proof || (observation && options.source(observation.source));
    if (note && source) {
      const detail = html('details', null, copy, 'journal-place-note');
      html('summary', '关于这片山野', detail); html('p', note.fact, detail);
      const link = html('a', source.name + ' ↗', detail, 'journal-source');
      link.setAttribute('href', source.url); link.setAttribute('target', '_blank'); link.setAttribute('rel', 'noopener noreferrer');
    }
    $('journal-detail-route').textContent = options.routes.find(r => r.id === moment.route)?.name || moment.place;
    $('journal-detail-position').textContent = `${index + 1} / ${entries.length}`;
    $('journal-detail-announcement').textContent = `第${index + 1}段，共${entries.length}段：${moment.title}`;
    const previous = entries[index - 1], next = entries[index + 1];
    const controls = [['journal-detail-prev', previous, '上一枚'], ['journal-detail-next', next, '下一枚']] as const;
    for (const [id, entry, label] of controls) {
      $(id).setAttribute('aria-disabled', String(!entry));
      $(id).setAttribute('aria-label', entry ? label + '：' + entry.title : label === '上一枚' ? '已是第一枚' : '已是最后一枚');
    }
    $('journal-detail-hint').textContent = entries.length === 1 ? '这一刻，值得留住' : !previous ? '从这一枚，慢慢翻看' : !next ? '已翻到最后一枚' : '左右翻看沿途回忆';
    const keep = new Set<string>();
    for (const entry of [previous, moment, next]) {
      if (!entry || !D.hasTag(entry)) continue;
      const file = D.tagArt(entry); if (!file) continue;
      const label = entry.tag || entry.title, key = file + '|' + label;
      keep.add(key);
      if (!pictures.has(key)) tagImage(html('div'), file, label, true);
    }
    for (const key of pictures.keys()) if (!keep.has(key)) pictures.delete(key);
    if (direction && !options.reduced && page.animate) flip = page.animate([{ opacity: .35, transform: `translateX(${direction * 16}px)` }, { opacity: 1, transform: 'translateX(0)' }], { duration: 220, easing: 'ease-out' });
  }
  function open(moment: Moment, button: HTMLButtonElement) {
    if (session || options.rewardOpen()) return;
    entries = data.page(records, route, D.MAX_MOMENTS).entries;
    index = entries.findIndex(entry => entry.route === moment.route && entry.id === moment.id);
    if (index < 0) return;
    renderDetail();
    $('journal-detail').setAttribute('aria-modal', 'true');
    $<HTMLDialogElement>('journal-detail').showModal();
    session = scenes.enter('journal'); trigger = button; button.setAttribute('aria-expanded', 'true');
    bodyOverflow = dom.document.body.style.overflow || ''; dom.document.body.style.overflow = 'hidden';
    options.pauseInteraction(); options.stopLoop(); options.refresh();
    $('journal-detail-close').focus({ preventScroll: true });
  }
  function closed(resume = true) {
    if (!session) return;
    const closing = session; session = null;
    dom.document.body.style.overflow = bodyOverflow;
    swipe = null; flip?.cancel(); flip = null;
    trigger?.setAttribute('aria-expanded', 'false');
    scenes.leave(closing, resume); options.refresh();
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    trigger = null; entries = []; pictures.clear(); $('journal-detail-page').replaceChildren();
  }
  function close(resume = true) {
    // Clear the session first: the dialog's synchronous close event must not resume twice.
    closed(resume); $<HTMLDialogElement>('journal-detail').close();
  }
  function turn(direction: number) {
    const next = index + direction;
    if (!session || next < 0 || next >= entries.length) return;
    index = next; renderDetail(direction);
  }
  function remember(moment: Moment) {
    if (!D.hasTag(moment)) return;
    tripMoments.push(moment);
    const result = data.remember(records, moment);
    if (result.status === 'full') $('journal-storage').textContent = '手帐已满，原回忆已保留。这个新片刻仍可在本次旅程结尾查看。';
    else if (result.status !== 'unchanged') {
      records = result.moments;
      $('journal-storage').textContent = D.saveMoments(options.storage, records) ? '回忆自动保存在这个浏览器，相同的片刻只留一页。' : '这个浏览器无法保存手帐，本次打开页面期间仍可以记下瞬间。';
    }
    const message = result.status === 'unchanged' ? '再次遇见，手帐中已留存' : result.status === 'upgraded' ? '手帐已补上手绘' : '刚刚收下标签';
    $('discovery-status').textContent = `${message}「${moment.title}」 · ${moment.place}`;
    render(); options.onRemember(moment);
  }
  function renderEnding() {
    const section = $('ending-journal'), list = $('ending-badges'), detail = $('ending-detail');
    const collected = tripMoments.filter(moment => D.hasTag(moment));
    section.hidden = !collected.length; list.replaceChildren(); detail.textContent = '';
    for (const moment of collected) {
      const button = html('button', null, list, 'ending-badge-button');
      button.setAttribute('type', 'button'); button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', 'ending-detail'); button.setAttribute('aria-label', '翻看' + moment.title);
      badge(button, moment); html('small', moment.title, button);
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        for (const b of Array.from(list.children)) b.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-expanded', String(!expanded));
        detail.textContent = expanded ? '' : moment.place + ' · ' + moment.memory;
      });
    }
  }
  function bind() {
    const dialog = $<HTMLDialogElement>('journal-detail');
    bindings.listen($('journal-detail-close'), 'click', () => close());
    bindings.listen($('journal-detail-prev'), 'click', () => turn(-1));
    bindings.listen($('journal-detail-next'), 'click', () => turn(1));
    bindings.listen(dialog, 'close', () => closed());
    bindings.listen(dialog, 'keydown', event => {
      event.stopPropagation(); const target = event.target as HTMLElement;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || target.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); turn(event.key === 'ArrowLeft' ? -1 : 1); }
    });
    const page = $('journal-detail-page');
    bindings.listen(page, 'pointerdown', event => {
      swipe = null;
      if (event.pointerType !== 'touch' || !event.isPrimary || (event.target as HTMLElement).closest?.('button,a,summary,details')) return;
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp, scroll: page.scrollTop };
    });
    bindings.listen(page, 'pointerup', event => {
      const start = swipe; swipe = null;
      if (!start || start.id !== event.pointerId || event.timeStamp - start.time > 650 || Math.abs(page.scrollTop - start.scroll) > 8) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.7) turn(dx < 0 ? 1 : -1);
    });
    bindings.listen(page, 'pointercancel', () => { swipe = null; });
    for (const r of options.routes) html('option', r.name, $('journal-route')).setAttribute('value', r.id);
    bindings.listen($('journal-route'), 'change', () => {
      const selected = $<HTMLSelectElement>('journal-route').value;
      route = options.routes.find(r => r.id === selected)?.id || 'all'; pageSize = data.PAGE_SIZE; render();
    });
    bindings.listen($('journal-more'), 'click', () => {
      const previous = $('journal-list').children.length;
      pageSize += data.PAGE_SIZE; render(true);
      $('journal-list').children[previous]?.querySelector('button')?.focus();
    });
  }
  bind();
  return {
    get open() { return session !== null; },
    get records(): readonly Moment[] { return records; },
    render, renderEnding, remember, close,
    resetTrip() { tripMoments = []; },
    recent(routeId: RouteId) { return records.filter(moment => moment.route === routeId).slice(-3).map(moment => moment.id); },
    destroy() { close(false); bindings.destroy(); },
  };
}
