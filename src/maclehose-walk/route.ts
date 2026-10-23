export { CUES } from '../content/maclehose';
import type { LandmarkSymbol } from '../journey/landmark-symbol';
import { clamp, curve, distance, mix, type Point } from '../wugong-walk/model';

export const WORLD = { width: 3000, height: 2550 };
export const PLACE_ORDER = ['longke', 'saiwanShan', 'saiwan', 'hamtin', 'taiLongAu', 'chekKeng', 'pakTamAu'] as const;
export type PlaceId = typeof PLACE_ORDER[number];
export type CheckpointId = PlaceId;
export const CHECKPOINT_IDS = PLACE_ORDER;
export type { CoastEventId as EventId } from '../content/maclehose';
// A scenic rest on the illustrated uphill path, not an additional real-world landmark.
export const WOODLAND_REST = { x: 1749, y: 768 };
export const SAIWAN_SHOULDER = { x: 1782, y: 1458 };
export interface Place extends Point { readonly name: string; readonly elevation: number; readonly symbol: LandmarkSymbol; readonly side: 'above' | 'below' | 'left' | 'right'; readonly site: Point }

// Art-directed coast positions and raised summits, not a GPS projection.
export const PLACES = {
  longke: { name: '浪茄', x: 2250, y: 2325, elevation: 5, symbol: 'beach', side: 'below', site: {x:2187,y:2337} },
  saiwanShan: { name: '西湾山', x: 1665, y: 1260, elevation: 314, symbol: 'viewpoint', side: 'left', site: {x:1626,y:1221} },
  saiwan: { name: '西湾', x: 2070, y: 1515, elevation: 8, symbol: 'beach', side: 'left', site: {x:2004,y:1470} },
  hamtin: { name: '咸田湾', x: 2265, y: 1050, elevation: 6, symbol: 'beach', side: 'right', site: {x:2202,y:1020} },
  taiLongAu: { name: '大浪坳', x: 1410, y: 405, elevation: 225, symbol: 'pass', side: 'above', site: {x:1365,y:414} },
  chekKeng: { name: '赤径', x: 1035, y: 582, elevation: 6, symbol: 'pier', side: 'left', site: {x:1005,y:609} },
  pakTamAu: { name: '北潭凹', x: 465, y: 690, elevation: 140, symbol: 'trailhead', side: 'below', site: {x:465,y:735} },
} satisfies Record<PlaceId, Place>;

const knots: readonly (readonly [number, number])[] = [
  [750,775],[724,750],[704,726],[665,718],[676,680],[631,653],[651,622],[602,590],
  [620,552],[574,520],[594,486],[553,451],[555,420],
  [587,431],[611,452],[627,480],[652,489],[665,515],[690,505],
  [714,484],[729,453],[721,424],[743,406],[752,382],[744,364],[755,350],
  [735,328],[695,337],[675,306],[636,300],[618,270],[583,256],[569,222],
  [525,210],[526,176],[488,166],[470,135],
  [449,160],[430,172],[420,202],[388,211],[367,202],[345,194],
  [307,208],[294,225],[255,220],[227,231],[196,249],[155,230],
];
class CoastalPath {
  readonly points = curve(knots.map(([x,y]) => ({ x:x*3, y:y*3 })), 12);
  readonly lengths = [0];
  readonly length: number;
  private readonly stops = new Map<PlaceId, number>();
  constructor() {
    for (let i=1;i<this.points.length;i++) this.lengths.push(this.lengths[i-1]+distance(this.points[i-1],this.points[i]));
    this.length=this.lengths[this.lengths.length-1];
    for (const id of PLACE_ORDER) this.stops.set(id,this.nearest(PLACES[id]));
  }
  sample(at:number):Point {
    const value=clamp(at,0,this.length);let i=1;
    while(i<this.lengths.length-1&&this.lengths[i]<value)i++;
    const a=this.points[i-1],b=this.points[i],t=(value-this.lengths[i-1])/Math.max(.001,this.lengths[i]-this.lengths[i-1]);
    return {x:mix(a.x,b.x,t),y:mix(a.y,b.y,t)};
  }
  nearest(point:Point):number {
    let at=0,gap=Infinity;
    this.points.forEach((p,i)=>{const next=distance(p,point);if(next<gap){gap=next;at=this.lengths[i];}});
    return at;
  }
  at(id:PlaceId):number { const value=this.stops.get(id);if(value===undefined)throw new Error(`缺少海岸地点：${id}`);return value; }
  between(a:PlaceId,b:PlaceId,t:number):number { return mix(this.at(a),this.at(b),t); }
  heading(at:number):number { const a=this.sample(at-12),b=this.sample(at+45);return Math.atan2(b.y-a.y,b.x-a.x); }
  elevation(at:number):number {
    let i=1;while(i<PLACE_ORDER.length-1&&this.at(PLACE_ORDER[i])<at)i++;
    const a=PLACE_ORDER[i-1],b=PLACE_ORDER[i],t=clamp((at-this.at(a))/Math.max(1,this.at(b)-this.at(a)));
    return mix(PLACES[a].elevation,PLACES[b].elevation,t);
  }
  slope(at:number):number { return (this.elevation(at+30)-this.elevation(at-30))/60; }
  section(at:number):string {
    let i=1;while(i<PLACE_ORDER.length-1&&this.at(PLACE_ORDER[i])<=at)i++;
    return `${PLACES[PLACE_ORDER[i-1]].name} → ${PLACES[PLACE_ORDER[i]].name}`;
  }
}
export const path = new CoastalPath();
