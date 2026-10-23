import { DAY_ROUTES } from './day-routes';
import type { RouteId, RouteSummary } from '../runtime/contracts';

export const MOMENT_CATALOG_VERSION = 'changping-autumn-4';

export interface ChapterDefinition {
  readonly id: RouteId;
  readonly name: string;
  readonly mapPage: string;
  readonly artPage: `${RouteId}-art.html`;
  readonly cover: { readonly kicker: string; readonly title: string; readonly copy: string; readonly action: string; readonly hint: string };
}

export const CHAPTERS = [
  { id: 'wugong', name: '武功山', mapPage: 'wugong-walk.html', artPage: 'wugong-art.html', cover: {
    kicker: '东江村经典反穿 · 两天一夜', title: '沿着草甸，把山野收进手帐。',
    copy: '从东江村穿过林间与草甸，在观音宕过夜。第二天经过吊马桩和金顶，沿景区山路下到大门。走到风景里，留下一幅手绘。',
    action: '从东江村出发 →', hint: '跟随山路 · 沿途实景 · 手绘互动与旅行手帐',
  } },
  { id: 'tiger', name: '虎跳峡', mapPage: 'tiger-walk.html', artPage: 'tiger-art.html', cover: {
    kicker: '虎跳峡高路 · 两天一夜', title: '从高路，走到金沙江边。',
    copy: '从桥头越过二十八道拐，在中途客栈住一晚。清晨经龙洞瀑布走到中峡客栈，也可沿小路下到中虎跳江边，再循原路返回。',
    action: '从桥头出发 →', hint: '中途客栈过夜 · 沿途实景 · 手绘收藏',
  } },
  { id: 'aotai', name: '鳌太线', mapPage: 'aotai-walk.html', artPage: 'aotai-art.html', cover: {
    kicker: '鳌太线 · 冬季历史路线', title: '循着山脊，走进云与石之间。',
    copy: '从塘口村上鳌山，翻过飞机梁、金字塔与太白梁，走向大爷海和拔仙台。沿历史路线上下山，在途中歇脚过夜，把山野相遇收进手帐，最后经下板寺向汤峪方向离山。',
    action: '走进秦岭 →', hint: '历史路线示意 · 多程过夜 · 手绘收藏',
  } },
  { id: 'maclehose', name: '麦理浩径', mapPage: 'maclehose-walk.html', artPage: 'maclehose-art.html', cover: {
    kicker: '麦理浩径第二段 · 一日海岸', title: '翻过山，海就在那里。',
    copy: '从浪茄翻过西湾山，走过西湾与咸田湾的沙岸。越过大浪坳，在赤径的潮水边歇脚，再沿林间山径走到北潭凹。',
    action: '从浪茄出发 →', hint: '浪茄 → 北潭凹 · 海岸实景 · 手绘收藏',
  } },
  ...Object.values(DAY_ROUTES).map(route => ({
    id: route.id, name: route.name, mapPage: `${route.id}-walk.html`, artPage: `${route.id}-art.html` as const,
    cover: { kicker: `${route.region} · ${route.id === 'changping' ? '十月彩林 · 一日往返' : route.id === 'mogan' ? '古道选段' : '溪谷与茶园'}`,
      title: route.title, copy: `${route.subtitle}。${route.note}`, action: `从${route.places[0].name}出发 →`, hint: '沿途实景 · 手绘互动 · 旅行手帐' },
  })),
] as const satisfies readonly ChapterDefinition[];

export type ChapterId = typeof CHAPTERS[number]['id'];
export function chapterFor(id: string): ChapterDefinition | null { return CHAPTERS.find(chapter => chapter.id === id) ?? null; }
export const ROUTE_SUMMARIES: RouteSummary[] = CHAPTERS.map(({ id, name }) => ({ id, name }));
