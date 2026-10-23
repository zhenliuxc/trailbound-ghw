export { CUES } from '../content/maclehose';
import { COAST_KNOTS, PLACE_ORDER, PLACES, type PlaceId } from '../content/maclehose-map';
export { WORLD, PLACE_ORDER, CHECKPOINT_IDS, WOODLAND_REST, SAIWAN_SHOULDER, PLACES } from '../content/maclehose-map';
export type { PlaceId, CheckpointId, Place } from '../content/maclehose-map';
export type { CoastEventId as EventId } from '../content/maclehose';
import { clamp, curve, distance, mix, type Point } from '../journey/geometry';

class CoastalPath {
  readonly points = curve(COAST_KNOTS.map(([x,y]) => ({ x:x*3, y:y*3 })), 12);
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
