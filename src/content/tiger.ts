export type TigerEventId = 'climb' | 'inn-pairs' | 'waterfall-paint' | 'river-frame';

export const EVENTS = {
  climb: { entry: 'tiger-bends-puzzle-v4', place: '虎跳峡 · 二十八道拐', line: '山径在岩壁边弯成一个 S，江声从谷底传来。', motif: '<path d="M6 44h10V33h10V22h10V11h9M4 36l12-20 9 8 9-18 12 23"/>' },
  'inn-pairs': { entry: 'tiger-inn-pairs-v4', place: '虎跳峡 · 中途客栈', line: '暮色落进峡谷，桌上留着几张小画片。', motif: '<path d="M5 12h18v25H5ZM28 17h18v25H28ZM10 31l5-9 5 9M33 34h8V24h-8Z"/>' },
  'waterfall-paint': { entry: 'tiger-waterfall-paint-v4', place: '虎跳峡 · 龙洞瀑布', line: '水声落在身后，纸上还留着两处山色。', motif: '<path d="M10 4q-4 11 0 22M19 4q-4 11 0 22M4 34q7-5 13 0t13 0M29 46l4-12L45 8l5 3-15 28Z"/>' },
  'river-frame': { entry: 'tiger-river-roundframe-v4', place: '虎跳峡 · 中虎跳江边', line: '白浪擦过巨石，远处的江声已经来到眼前。', motif: '<path d="M2 18q7-8 15 0t15 0t15 0M2 32q7-8 15 0t15 0t15 0M18 41l4-9 8 1 5 8Z"/>' },
} satisfies Record<TigerEventId, { entry: MemoryId; place: string; line: string; motif: string }>;
import type { MemoryId } from '../runtime/tiger-memories/model';
