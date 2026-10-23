import type { Point } from '../model';
import type { ScrollTrail } from './route';

export type TrailEventId = 'leaves' | 'kite' | 'encounter' | 'clouds' | 'stones' | 'stars' | 'return';
export interface TrailEvent {
  readonly id: TrailEventId;
  readonly entry: string;
  readonly title: string;
  readonly place: string;
  readonly story: string;
  readonly action: string;
  readonly day: 1 | 2;
  readonly trigger: 'trail' | 'camp' | 'archive';
  readonly travel: number;
  readonly point: Point;
}

export function trailEvents(trail: ScrollTrail): Readonly<Record<TrailEventId, TrailEvent>> {
  const site = (travel: number) => ({ travel, point: trail.sample(travel) });
  return {
    leaves: {
      id: 'leaves', entry: 'wugong-forest-leaves', title: '林间的叶影', place: '武功山 · 东江村上山林间',
      story: '爬过一段林间石路，树影落在手帐上。歇口气，翻开纸叶，找找相同的叶形。', action: '翻开叶影小画', day: 1, trigger: 'trail',
      ...site(trail.sites.slope.travel * .50),
    },
    kite: {
      id: 'kite', entry: 'meadow-bird', title: '借一阵草甸的风', place: '武功山 · 山脊草甸',
      story: '转过山肩，草甸上的风正好。背包里有一只纸鸢，要不要让它飞一会儿？', action: '放一会儿纸鸢', day: 1, trigger: 'trail',
      ...site((trail.sites.meadow.travel + trail.campTravel) / 2),
    },
    encounter: {
      id: 'encounter', entry: 'wugong-wind-hiker', title: '在营地遇见她', place: '武功山 · 观音宕草甸',
      story: '坐下休息时，旁边的旅人走过来，想请你帮她拍一张草甸里的照片。', action: '帮她拍张照片', day: 1, trigger: 'archive',
      ...site(trail.campTravel),
    },
    stars: {
      id: 'stars', entry: 'wugong-camp-stars', title: '星夜入帐', place: '武功山 · 观音宕／星空营地',
      story: '帐篷亮起暖光，坐下来，对着手帐认一认今晚的星星。', action: '认一认星星', day: 1, trigger: 'camp',
      ...site(trail.campTravel),
    },
    clouds: {
      id: 'clouds', entry: 'meadow-butterfly', title: '山脊上的云', place: '武功山 · 吊马桩山脊',
      story: '清晨离开观音宕，往吊马桩的山脊上浮起了云。拨开近处的云，看看藏在后面的山。', action: '拨云看山', day: 2, trigger: 'trail',
      ...site(trail.campTravel + (trail.sites.horse.travel - trail.campTravel) * .5),
    },
    stones: {
      id: 'stones', entry: 'meadow-flower', title: '古祭坛边的石语', place: '武功山 · 金顶古祭坛',
      story: '看过金顶远景，沿山肩再走几步。古祭坛旁的石色与山色，正好拼成一幅小画。', action: '拼好金顶石语', day: 2, trigger: 'trail',
      ...site(trail.summitTravel + 240),
    },
    return: {
      id: 'return', entry: 'wugong-homeward-pages', title: '把来路排进手帐', place: '武功山 · 福星谷下山林间',
      story: '从草甸下到福星谷，石阶重新走进林荫。坐在路边歇一会儿，把林间、草甸、星夜与金顶的小画按走过的顺序排好，再沿中庵方向下山。', action: '整理这一程的小画', day: 2, trigger: 'trail',
      ...site((trail.summitTravel + 240 + trail.length) / 2),
    },
  };
}
