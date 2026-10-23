import { clamp, mix, type Point } from '../journey/geometry';
import { path } from './route';
import { SAIWAN_SHOULDER, WOODLAND_REST, type CheckpointId } from '../content/maclehose-map';
import type { CoastEventId as EventId } from '../content/maclehose';

type RestingPhase = {kind:'ready'|'walking'|'paused'|'finished'};
type Stop = {readonly at:number}&({readonly kind:'photo';readonly id:CheckpointId}|{readonly kind:'game';readonly id:EventId}|{readonly kind:'finish'});
export type Phase = RestingPhase | {kind:'stopping';elapsed:number} | {kind:'photo';id:CheckpointId;arrival:boolean;resume:RestingPhase} | {kind:'game';id:EventId};
export const STOPS:readonly Stop[] = [
  {at:path.at('longke'),kind:'photo',id:'longke'},
  {at:path.nearest(SAIWAN_SHOULDER),kind:'game',id:'coast-sand'},
  {at:path.at('saiwanShan'),kind:'photo',id:'saiwanShan'},
  {at:path.at('saiwan'),kind:'photo',id:'saiwan'},
  {at:path.between('saiwan','hamtin',.14),kind:'game',id:'maclehose-sideways-crab'},
  {at:path.at('hamtin'),kind:'photo',id:'hamtin'},
  {at:path.between('hamtin','taiLongAu',.08),kind:'game',id:'coast-shell'},
  {at:path.nearest(WOODLAND_REST),kind:'game',id:'maclehose-woodland-echo'},
  {at:path.at('taiLongAu'),kind:'photo',id:'taiLongAu'},
  {at:path.at('chekKeng'),kind:'photo',id:'chekKeng'},
  {at:path.between('chekKeng','pakTamAu',.12),kind:'game',id:'coast-pier'},
  {at:path.at('pakTamAu'),kind:'photo',id:'pakTamAu'},
  {at:path.length,kind:'finish'},
];
export class CoastalJourney {
  phase:Phase={kind:'ready'};
  at=0;clock=0;stride=0;speed=0;heading=path.heading(0);idle=0;
  private cursor=0;
  readonly visited=new Set<CheckpointId>();
  readonly encountered=new Set<EventId>();
  readonly earned=new Set<EventId>();
  get point():Point{return path.sample(this.at);}
  get progress():number{return clamp(this.at/path.length);}
  get moving():boolean{return this.phase.kind==='walking'&&this.speed>.1;}
  get minute():number{return 9*60+this.progress*6.5*60;}
  get section():string{return path.section(this.at);}
  toggle():void {
    if(this.phase.kind==='ready'||this.phase.kind==='paused'){this.phase={kind:'walking'};this.idle=0;}
    else if(this.phase.kind==='walking')this.pause();
  }
  pause():void {if(this.phase.kind==='walking'){this.phase={kind:'paused'};this.speed=0;}}
  openPhoto(id:CheckpointId):void {
    const phase=this.phase;
    if(!this.visited.has(id))return;
    if(phase.kind==='walking'||phase.kind==='paused'||phase.kind==='ready'||phase.kind==='finished'){
      this.phase={kind:'photo',id,arrival:false,resume:phase};this.speed=0;
    }
  }
  closePhoto(continueWalk:boolean):void {
    if(this.phase.kind!=='photo')return;
    const phase=this.phase;if(phase.arrival)this.cursor++;
    this.phase=phase.arrival?{kind:continueWalk?'walking':'paused'}:phase.resume;
  }
  closeGame(id:EventId,collected:boolean):void {
    if(this.phase.kind!=='game'||this.phase.id!==id)return;
    this.encountered.add(id);if(collected)this.earned.add(id);
    this.cursor++;this.speed=0;this.phase={kind:collected?'walking':'paused'};
  }
  tick(dt:number):void {
    if(dt<=0||!Number.isFinite(dt))return;
    this.clock+=dt;
    if(this.phase.kind==='paused'){this.idle+=dt;return;}
    if(this.phase.kind==='stopping'){
      this.phase.elapsed+=dt;if(this.phase.elapsed<.5)return;
      const stop=STOPS[this.cursor];
      if(stop.kind==='photo'){this.visited.add(stop.id);this.phase={kind:'photo',id:stop.id,arrival:true,resume:{kind:'walking'}};}
      else if(stop.kind==='game')this.phase={kind:'game',id:stop.id};
      else this.phase={kind:'finished'};
      return;
    }
    if(this.phase.kind!=='walking')return;
    const stop=STOPS[this.cursor],remaining=Math.max(0,stop.at-this.at),slope=path.slope(this.at);
    const target=Math.min(slope>.15?25:slope<-.15?29:34,Math.sqrt(remaining*38));
    this.speed=mix(this.speed,target,1-Math.exp(-dt*5));
    const delta=Math.min(remaining,this.speed*dt);this.at+=delta;this.stride+=delta/(slope>.15?22:slope<-.15?24:28);
    const angle=path.heading(this.at),turn=Math.atan2(Math.sin(angle-this.heading),Math.cos(angle-this.heading));
    this.heading+=turn*(1-Math.exp(-dt*3.5));
    if(remaining<.7){this.at=stop.at;this.speed=0;this.phase={kind:'stopping',elapsed:0};}
  }
}
