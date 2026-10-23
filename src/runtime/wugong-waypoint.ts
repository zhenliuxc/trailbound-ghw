import type { WugongWaypointKind } from './wugong-overview';

export const WUGONG_WAYPOINT_SIZE = 44;
export const WUGONG_WAYPOINT_LABEL_WIDTH = 86;
export const WUGONG_WAYPOINT_HEIGHT = 72;

interface WaypointOptions {
  document: Document;
  parent: SVGElement;
  kind: WugongWaypointKind;
  label: string;
}

export function createWugongWaypoint({ document, parent, kind, label }: WaypointOptions) {
  function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, host: SVGElement) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, String(value));
    host.append(element);
    return element;
  }
  const sign = svg('g', { class: 'wugong-waypoint-sign' }, parent);
  svg('rect', { x: -24, y: -35, width: 48, height: 48, rx: 12, fill: 'transparent', 'aria-hidden': 'true' }, sign);
  svg('rect', { x: -22, y: -33, width: WUGONG_WAYPOINT_SIZE, height: WUGONG_WAYPOINT_SIZE, rx: 10, fill: '#fffdf1', stroke: '#9bab86', 'stroke-width': 1.3, class: 'wugong-waypoint-tile' }, sign);
  const glyph = svg('g', { transform: 'translate(0 -11)', fill: 'none', stroke: '#607b53', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' }, sign);
  switch (kind) {
    case 'start':
      svg('path', { d: 'M-12 12V-8M12 12V-8M-15-8H15M-11-8L0-15L11-8M-9 12H9M-6 12L-5 1H5L6 12M-8-3H8' }, glyph);
      break;
    case 'meadow':
      svg('path', { d: 'M-12 12Q-11 1-15-4M-6 12Q-8-2-3-13M0 12Q-1-5 5-12M6 12Q6 1 13-5M-14 13H14' }, glyph);
      svg('path', { d: 'M5-8Q1-12 5-15Q9-14 8-11Z', fill: '#c8b47e', stroke: '#af9f70', 'stroke-width': .8 }, glyph);
      break;
    case 'clouds':
      svg('path', { d: 'M-12 7Q-18 2-12-3Q-12-11-5-10Q0-17 7-10Q16-11 15-3Q22 4 13 8H-12ZM-12 13H12M-6 16H6' }, glyph);
      break;
    case 'end':
      svg('path', { d: 'M-15 12L-6-4L0 4L6-8L16 12ZM6-8V-17L15-14L6-11M-8 12L-4 7M8 12L6 6' }, glyph);
      break;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
  svg('rect', { x: -WUGONG_WAYPOINT_LABEL_WIDTH / 2, y: 17, width: WUGONG_WAYPOINT_LABEL_WIDTH, height: 18, rx: 6, fill: '#fffdf1ed' }, sign);
  const text = svg('text', { y: 30, 'text-anchor': 'middle', fill: '#526d4b', 'font-size': 11, 'font-weight': 600, class: 'wugong-waypoint-label' }, sign);
  text.textContent = label;
  return { sign, label: text };
}
