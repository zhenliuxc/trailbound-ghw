/** Place symbols describe the landscape; photo availability is separate. */
const SYMBOLS = {
  temple: '<path d="M6 26V14h20v12M4 14l6-5h12l6 5M10 9l6-5 6 5M12 26v-7h8v7M4 26h24"/>',
  forest: '<path d="m9 5-6 10h4l-4 7h12l-4-7h4ZM9 22v6M23 20v8"/><path d="M23 7c-5-2-9 4-6 8-3 5 7 9 10 3 5-2 3-9-1-9Z"/>',
  snag: '<path d="m11 23 1-18m0 7L6 7m6 3 6-6M23 23l-1-13m1 7 5-5M5 26q5-3 10 0t13 0"/>',
  stream: '<path d="M14 4c16 6-16 12-4 24M22 4c16 6-16 12-4 24M4 16l3-3 3 3-4 2ZM23 24l3-3 3 3-4 2Z"/>',
  'dry-basin': '<path d="M3 12q5 2 8 8h10q3-6 8-8M3 17q4 1 7 7h12q3-6 7-7M11 28h11M14 17l-2-4m5 4 1-4"/>',
  redrock: '<path d="m4 24 4-10 9-2 5 10-4 5H7ZM17 12l5-6 6 3 1 10-7 3"/><path d="m9 16 6-1 3 6-8 2Zm14-6 3 1 1 5-5 1Z" fill="#ad7c67" stroke="none"/>',
  'alpine-meadow': '<path d="M3 17q8-11 15-6t11 3M3 25q8-9 15-5t11 2M9 15l-1-4m2 3 2-4M22 24l-1-4m2 3 2-4M15 27v-4"/>',
  village: '<path d="m3 15 7-7 8 7M6 14v13h10V14m-6 13v-7h3v7M18 12l5-5 6 6m-10 1v13h8V13M21 18h3"/>',
  gate: '<path d="M6 27V13m20 14V13M4 13h24M7 9h18M11 6h10M10 13v14m12-14v14M4 27h8m8 0h8M10 17h12"/>',
  switchbacks: '<path d="m3 22 11-17 8 8 7-4M5 27h16q9 0 2-5l-10-4q-5-2 2-5l7-2"/>',
  ridge: '<path d="m3 24 5-9 5 4 5-13 5 7 5-4M3 28l6-8 5 4 5-13 5 7 5-4"/>',
  summit: '<path d="M3 27 13 5 29 27ZM9 14l4 3 4-6M13 17l-1 10"/>',
  camp: '<path d="m4 27 12-21 12 21ZM11 27l5-12 5 12M13 6h6"/>',
  inn: '<path d="m4 13 12-8 12 8M7 12v15h18V12M10 27v-8h12v8m-12-4h12M13 19v4"/>',
  waterfall: '<path d="M3 10h8V5h16M11 10v12m6-14v16m6-16v14M5 26q5-4 10 0t13 0"/>',
  rapids: '<path d="m13 14 4-7 6 2 3 8-7 2ZM3 12l5 3-4 4 6 2m17-1 3 3-5 3M3 27l6-3 7 4 6-2"/>',
  beach: '<path d="M8 5c15 0 17 15 3 23M6 8c12 0 14 11 4 17M22 10q3-2 6 0m-5 6q3-2 5 0"/><circle cx="9" cy="14" r="1" fill="currentColor" stroke="none"/><circle cx="8" cy="20" r="1" fill="currentColor" stroke="none"/>',
  pass: '<path d="m3 20 6-13 4 9q3 5 6 0l4-9 6 13M9 7l-1 8m15-8 1 8M12 28l4-9 4 9"/>',
  pier: '<path d="M5 10h22M8 10v13m16-13v13M11 9V5m10 4V5M7 6h18M12 11v9h8v-9M4 27q6-4 12 0t12 0"/>',
  trailhead: '<path d="M16 5v23M5 8h18l5 5-5 5H5ZM9 13h11M10 28h12"/>',
  bamboo: '<path d="m10 29-1-25m9 25 2-26M7 10h4m-4 8h4m-3 7h4M18 8h4m-5 8h4m-4 8h4M9 18l-5-5m15-1 6-4m-7 15 7-4"/><path d="M4 14Q1 11 2 5q4 5 2 9ZM5 15Q0 15 2 10q3 2 3 5ZM24 9q0-6 6-7-2 6-6 7Zm0 1q5-3 7-1-3 4-7 1Zm0 10q0-5 6-7-1 6-6 7Zm0 1q5-2 6 2-4 1-6-2Z" fill="currentColor" stroke="none"/>',
  steps: '<path d="M5 27h7v-7h7v-7h7V6M5 21h6m2-7h5m2-7h5"/>',
  tea: '<path d="M16 21V9m0 8Q6 17 6 8q9 0 10 9Zm0-4Q20 4 27 6q-1 9-11 7ZM4 25q12-6 24 0M7 29q9-4 18 0"/>',
  'stone-sea': '<path d="m4 13 5-6 5 3-1 7-7 1ZM19 10l5-4 5 6-3 6-7-2ZM5 25l3-5 7 3-1 6-7-1Zm14 2 1-6 7 1 1 6Z"/>',
  lake: '<path d="M8 13c-7 4-3 14 7 14s16-7 11-12c-4-3-6 0-10-2s-6-2-8 0ZM11 19q5-3 10 0M8 11V5m0 3-3-2m18 6V6m0 3 3-3"/>',
  'stepping-stones': '<path d="M3 7q5-3 10 0t15 0M3 27q5-3 10 0t15 0M4 18l4-5 5 1 1 5-7 2ZM18 16l4-5 5 2 1 5-7 2Z"/>',
  viewpoint: '<path d="M3 13h11l-3 7 3 8M3 27l8-7M17 10h12M18 16q6-3 10 0M20 23q4-2 8 0"/><circle cx="23" cy="5" r="2"/>',
} as const;

export type LandmarkSymbol = keyof typeof SYMBOLS;

export const LANDMARK_NAMES = {
  temple: '寺院', forest: '森林', snag: '枯树浅滩', stream: '溪谷', 'dry-basin': '草地盆地',
  redrock: '红石', 'alpine-meadow': '高山草甸', village: '村落', gate: '景区入口',
  switchbacks: '盘山坡道', ridge: '山脊', summit: '山顶', camp: '营地', inn: '客栈',
  waterfall: '瀑布', rapids: '江流', beach: '海湾沙滩', pass: '山口', pier: '码头',
  trailhead: '步道入口', bamboo: '竹林', steps: '石阶', tea: '茶园', 'stone-sea': '石海',
  lake: '山间水潭', 'stepping-stones': '涉溪石径', viewpoint: '山海眺望',
} satisfies Record<LandmarkSymbol, string>;

export const LANDMARK_SIZE = { follow: 30, overview: 26, compact: 24, hit: 44, labelGap: 18 } as const;

export function landmarkSymbol(symbol: LandmarkSymbol): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="trail-landmark-symbol" viewBox="0 0 40 40" fill="none" color="#4b6854" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle class="trail-landmark-rim" cx="20" cy="20" r="18" fill="#fbf8e9" fill-opacity=".94" stroke="#a4ad8a" stroke-width="1.1"/><g transform="translate(4 4)" stroke-width="1.85">${SYMBOLS[symbol]}</g></svg>`;
}
