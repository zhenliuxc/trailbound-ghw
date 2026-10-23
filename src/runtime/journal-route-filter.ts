import type { Moment, RouteId, RouteSummary } from './contracts';
import { EventBindings, type GameDom } from './dom';

export type JournalRoute = RouteId | 'all';

interface RouteFilterOptions {
  dom: GameDom;
  routes: readonly RouteSummary[];
  onChange(route: JournalRoute): void;
}

export function createJournalRouteFilter({ dom, routes, onChange }: RouteFilterOptions) {
  const root = dom.get('journal-route');
  const bindings = new EventBindings();
  const choices: { id: JournalRoute; name: string }[] = [{ id: 'all', name: '全部路线' }, ...routes];
  root.replaceChildren();

  function reveal(label: HTMLElement) {
    if (root.scrollWidth <= root.clientWidth) return;
    const bounds = root.getBoundingClientRect(), item = label.getBoundingClientRect();
    if (item.left < bounds.left + 6) root.scrollLeft += item.left - bounds.left - 6;
    else if (item.right > bounds.right - 6) root.scrollLeft += item.right - bounds.right + 6;
  }

  const tabs = choices.map(choice => {
    const label = dom.html('label', null, root, 'journal-route-option');
    const input = dom.html('input', null, label);
    input.type = 'radio';
    input.name = 'journal-route';
    input.value = choice.id;
    input.checked = choice.id === 'all';
    input.setAttribute('aria-controls', 'journal-list');
    const paper = dom.html('span', null, label, 'journal-route-tab');
    dom.html('span', choice.name, paper, 'journal-route-name');
    const count = dom.html('span', null, paper, 'journal-route-total');
    count.setAttribute('aria-hidden', 'true');
    bindings.listen(input, 'change', () => {
      if (!input.checked) return;
      reveal(label);
      onChange(choice.id);
    });
    bindings.listen(input, 'focus', () => reveal(label));
    return { ...choice, input, count };
  });

  return {
    render(selected: JournalRoute, moments: readonly Moment[]) {
      const counts = new Map<JournalRoute, number>([['all', moments.length]]);
      for (const moment of moments) counts.set(moment.route, (counts.get(moment.route) ?? 0) + 1);
      for (const tab of tabs) {
        const count = counts.get(tab.id) ?? 0;
        tab.input.checked = tab.id === selected;
        tab.input.setAttribute('aria-label', `${tab.name}，${count}段回忆`);
        tab.count.textContent = String(count);
        tab.count.hidden = count === 0;
      }
    },
    destroy() { bindings.destroy(); },
  };
}
