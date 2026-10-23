import { createMusicLayer } from '../runtime/music-layer';
import type { CoastalJourney } from './chapter';

// Reuse the existing licensed coastal sound design; it is not local field audio.
export class CoastAudio {
  private readonly music=new Audio('audio/wugong-reverie-v1.mp3');
  private readonly paper=new Audio('audio/mini-paper-v1.mp3');
  private readonly steps=[1,2,3].map(i=>new Audio(`audio/wugong-step-${i}-v1.mp3`));
  private readonly effects=window.TrailAudio.create({AudioContext,navigator,fetch:fetch.bind(window),timers:window,createMusic:createMusicLayer,onError(){},onStateChange(){}});
  private active=false;private suspended=false;private token=0;private lastStep=-1;private progress=0;
  constructor(){this.music.loop=true;this.music.preload='none';this.music.volume=.07;this.paper.preload='none';this.paper.volume=.1;for(const a of this.steps){a.preload='none';a.volume=.016;}}
  private scene(){return{routeId:'maclehose',mode:'walk',weather:'clear',progress:this.progress};}
  async enable():Promise<void>{
    const token=++this.token;this.active=true;this.suspended=false;
    try{const [accepted]=await Promise.all([this.effects.enable(this.scene()),this.music.play()]);if(!accepted)throw new Error('声音暂未开启');if(token!==this.token||document.hidden)this.pause();}
    catch(error){if(token===this.token)this.disable();throw error;}
  }
  disable():void{this.active=false;this.token++;this.effects.disable();this.pause();}
  pause():void{this.suspended=true;this.effects.hide();this.music.pause();this.paper.pause();for(const a of this.steps)a.pause();}
  resume():void{if(this.active&&!document.hidden){this.suspended=false;void this.effects.enable(this.scene());void this.music.play().catch(()=>{});}}
  update(journey:CoastalJourney):void{
    if(!this.active||this.suspended||document.hidden)return;this.progress=journey.progress;this.effects.setScene(this.scene());
    const step=Math.floor(journey.stride*2);
    if(journey.moving&&step!==this.lastStep){this.lastStep=step;const a=this.steps[step%this.steps.length];a.currentTime=0;void a.play().catch(()=>{});}
  }
  cue():void{if(this.active&&!document.hidden){this.paper.currentTime=0;void this.paper.play().catch(()=>{});}}
  destroy():void{this.disable();this.effects.destroy();for(const a of [this.music,this.paper,...this.steps]){a.removeAttribute('src');a.load();}}
}
