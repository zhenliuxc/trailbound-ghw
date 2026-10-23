export const WESTLAKE_SCENES = {
  'westlake-floating-leaf': {
    kind: 'leaf', place: '九溪溪谷',
    background: 'scenes/westlake-journey-v3/forest-pool.webp',
    focus: { x: .5, y: .66 }, portraitFocus: { x: .5, y: .5 },
  },
  'westlake-stones': {
    kind: 'stones', place: '九溪十八涧',
    background: 'scenes/day-route-v2/westlake.webp',
    focus: { x: .48, y: .82 }, portraitFocus: { x: .49, y: .65 },
  },
  'westlake-tea': {
    kind: 'tea', place: '龙井茶园',
    background: 'scenes/westlake-v1.webp',
    focus: { x: .74, y: .13 }, portraitFocus: { x: .75, y: .12 },
  },
  'westlake-eaves': {
    kind: 'brew', place: '龙井村口',
    background: 'scenes/westlake-journey-v3/village-tea.webp',
    focus: { x: .5, y: .65 }, portraitFocus: { x: .54, y: .5 },
  },
} as const;

export type WestlakeSceneId = keyof typeof WESTLAKE_SCENES;
export type WestlakeSceneKind = typeof WESTLAKE_SCENES[WestlakeSceneId]['kind'];
export function isWestlakeSceneId(id: string): id is WestlakeSceneId {
  return Object.hasOwn(WESTLAKE_SCENES, id);
}
