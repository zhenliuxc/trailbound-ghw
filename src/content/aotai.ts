import type { AotaiGameId } from '../runtime/aotai-games/model';

export const CUES = {
  'snow-tracks': { entry: 'snow-tracks', place: '鳌山 · 石海', line: '离开白起庙，石海沿着鳌山大梁铺开。', motif: '<path d="m5 31 8-19 12-5 16 12 4 19H12Z M13 12l7 15 21-8M20 27l-8 11M20 27l14 11"/>' },
  'snow-lichen': { entry: 'snow-lichen', place: '飞机梁 · 连峰', line: '爬出水窝子的谷地，一道道山梁在眼前展开。', motif: '<path d="m3 34 9-12 8 5 9-16 7 9 12-5M3 41h45"/>' },
  'aotai-takin-first': { entry: 'aotai-takin-first', place: '2800营地 · 林缘', line: '前方岩后，传来沉重的踩雪声。', motif: '<path d="M8 25q6-13 21-8l7 6v9H12ZM13 32v10M28 32v10M30 17l-2-8M36 23l8-3 3 9-11 3M43 20l1-8"/>' },
  'aotai-camp-night': { entry: 'aotai-camp-night', place: '大石河 · 雪夜营地', line: '走下石海，背风的河谷里可以歇脚了。', motif: '<path d="m5 40 19-30 20 30ZM24 10v30M10 40l14-19 15 19M3 42h44M29 27h7v9h-7Z"/>' },
} satisfies Record<AotaiGameId, { entry: AotaiGameId; place: string; line: string; motif: string }>;
