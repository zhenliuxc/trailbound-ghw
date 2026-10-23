import { LandmarkLayer } from '../journey/landmark-layer';
import { observeMapSize } from '../journey/viewport';
import { ArtOverlay } from '../journey/art-overlay';
import { DiscoveryTransition } from '../journey/discovery-transition';
import { createPhotoDialog } from '../journey/photo-dialog';
import { createFrameLoop } from '../runtime/frame-loop';
import { createCharacterPicker } from '../characters/picker';
import { CoastAudio } from './audio';
import { CoastalJourney } from './chapter';
import { PHOTOS } from './photos';
import { PLACE_ORDER, PLACES, type CheckpointId } from '../content/maclehose-map';
import { CUES, type CoastEventId as EventId } from '../content/maclehose';
import { CoastalScene, type Projection, type View } from './scene';

function mountCoast(){
  const node=(id:string):HTMLElement=>{const el=document.getElementById(id);if(!el)throw new Error(`海岸界面缺少 ${id}`);return el;};
  const button=(id:string):HTMLButtonElement=>{const el=node(id);if(!(el instanceof HTMLButtonElement))throw new Error(`海岸按钮无法读取 ${id}`);return el;};
  const canvas=node('co-canvas');
  if(!(canvas instanceof HTMLCanvasElement))throw new Error('海岸画面入口无法读取');
  const map=node('co-map'),walk=button('co-walk');
  const lifecycle=new AbortController(),{signal}=lifecycle,reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
  const journey=new CoastalJourney(),scene=new CoastalScene(canvas),audio=new CoastAudio(),discovery=new DiscoveryTransition(map,signal,CUES);
  let ready=false,disposed=false,reduced=reducedQuery.matches,sound=false,soundToken=0;
  let overlay:{kind:'journal'}|{kind:'game';id:EventId}|null=null,phaseKey='',uiKey='',environmentKey='';
  let autostart=new URLSearchParams(location.search).get('walk')==='1';
  const photo=createPhotoDialog({prefix:'co',signal,reduced:()=>reduced,onClose(continueWalk){journey.closePhoto(continueWalk);sync();stop();loop();resumeAudio();}});
  const art=new ArtOverlay(signal,result=>{
    const closing=overlay;overlay=null;
    if(closing?.kind==='game')journey.closeGame(closing.id,result.collected>0);
    sync();stop();loop();resumeAudio();
  },'co',{soft:true,chapter: 'maclehose',version:'sand-brush-18'});
  const characters=createCharacterPicker({trigger:button('co-character'),signal,current:()=>scene.character,
    beforeOpen(){if(blocked())return false;journey.pause();stop();audio.pause();sync();return true;},
    apply:(id,selectionSignal)=>scene.setCharacter(id,selectionSignal),
    afterClose(){if(disposed)return;stop();resize();sync();loop();resumeAudio();},
  });
  const markers=new LandmarkLayer({container:node('co-markers'),className:'co-marker',signal,
    places:PLACE_ORDER.map(id=>({id,name:PLACES[id].name,point:PLACES[id].site,symbol:PLACES[id].symbol,
      labelSide:PLACES[id].side,caption:id==='longke'?'起点':id==='pakTamAu'?'终点':undefined,
      ariaLabel:`${PLACES[id].name} · 实景打卡`,
    })),
    onSelect(id){if(!blocked()){journey.openPhoto(id);sync();}},
  });
  const waters=[{name:'大浪湾',x:2670,y:1500},{name:'赤径内湾',x:1000,y:355}].map(point=>{
    const element=document.createElement('span');element.className='co-water-label';element.textContent=point.name;node('co-markers').append(element);return{point,element};
  });
  function blocked():boolean{return!ready||disposed||art.open||photo.open||characters.open||discovery.pending||journey.phase.kind==='game';}
  const clock=createFrameLoop({request:callback=>requestAnimationFrame(callback),cancel:id=>cancelAnimationFrame(id),maxDelta:.05,active:()=>ready&&!disposed&&!document.hidden&&!art.open&&!photo.open&&!characters.open,update:frame});
  function stop():void{clock.stop();}
  function loop():void{clock.ensure();}
  function resumeAudio():void{if(sound&&!blocked()&&!document.hidden)audio.resume();}
  function openJournal():void{if(blocked())return;overlay={kind:'journal'};stop();audio.pause();art.show(undefined,undefined,scene.character);}
  function position(p:Projection):void{
    discovery.position(p.toScreen(journey.point),p.width,p.height);
    for(const water of waters){const at=p.toScreen(water.point);water.element.hidden=at.x<55||at.x>p.width-55||at.y<80||at.y>p.height-40;water.element.style.left=`${at.x}px`;water.element.style.top=`${at.y}px`;}
    markers.update(p,scene.mode,place=>({
      visible:scene.mode==='overview'||Math.hypot(place.point.x-journey.point.x,place.point.y-journey.point.y)<950,
      enabled:journey.visited.has(place.id),visited:journey.visited.has(place.id),
    }));
  }

  function showPhoto(id:CheckpointId):void{
    const phase=journey.phase;
    const continueLabel=phase.kind==='photo'&&!phase.arrival?phase.resume.kind==='finished'?'回到终点':'回到山径':id==='longke'?'向西湾山出发 →':id==='pakTamAu'?'完成这一程 →':'继续走 →';
    stop();audio.pause();photo.show({name:PHOTOS[id].name,photo:PHOTOS[id],checkpoint:id,continueLabel});
  }
  function sync():void{
    const phase=journey.phase,minute=Math.round(journey.minute/5)*5;
    const environment=`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')} · ${journey.progress<.25?'晨间海风':journey.progress<.7?'日间晴风':'午后微光'}`;
    if(environmentKey!==environment){environmentKey=environment;node('co-environment').textContent=environment;}
    const key=`${ready}:${phase.kind}:${scene.mode}:${journey.section}:${journey.earned.size}`;
    if(uiKey!==key){
      uiKey=key;map.dataset.view=scene.mode;map.dataset.phase=phase.kind;node('co-chapter').textContent=journey.section;
      for(const [id,view] of [['co-follow','follow'],['co-overview','overview']] satisfies [string,View][]){button(id).disabled=!ready;button(id).setAttribute('aria-pressed',String(scene.mode===view));}
      node('co-finish').hidden=phase.kind!=='finished';
      node('co-finish-copy').textContent=journey.earned.size?`海风、沙滩和村落，留下 ${journey.earned.size} 段手绘记忆。`:'从浪茄走到北潭凹，今天的海岸旅程到这里收束。';
      walk.disabled=!ready||!['ready','walking','paused','finished'].includes(phase.kind);
      walk.textContent=phase.kind==='ready'?'从浪茄出发 →':phase.kind==='walking'?'停下来看看':phase.kind==='paused'?'继续走 →':phase.kind==='finished'?'翻看这程手帐':'停留片刻';
      node('co-note').textContent=phase.kind==='game'||phase.kind==='photo'?'':phase.kind==='finished'?'午后的山径，回到北潭凹。':phase.kind==='paused'?'停一停，海风还在继续。':'跟着山径，看海湾一点点展开。';
    }
    const next=phase.kind==='photo'||phase.kind==='game'?`${phase.kind}:${phase.id}`:phase.kind;
    if(next===phaseKey)return;phaseKey=next;discovery.cancel();
    if(phase.kind==='photo')showPhoto(phase.id);
    else if(phase.kind==='game'){
      audio.pause();audio.cue();
      discovery.show(phase.id,reduced,()=>{if(disposed||journey.phase.kind!=='game'||journey.phase.id!==phase.id)return;overlay={kind:'game',id:phase.id};stop();art.show(phase.id,CUES[phase.id].place,scene.character);});
    }
  }
  function frame(dt:number):void{
    journey.tick(dt);audio.update(journey);position(scene.paint(journey,dt,reduced));sync();
  }
  function resize():void{const r=map.getBoundingClientRect();scene.resize(r.width,r.height);if(ready)position(scene.paint(journey,0,reduced));}
  walk.addEventListener('click',()=>{if(journey.phase.kind==='finished')openJournal();else journey.toggle();sync();loop();resumeAudio();},{signal});
  button('co-journal').addEventListener('click',openJournal,{signal});button('co-finish-journal').addEventListener('click',openJournal,{signal});
  for(const [id,view] of [['co-follow','follow'],['co-overview','overview']] satisfies [string,View][])button(id).addEventListener('click',()=>{scene.mode=view;sync();loop();},{signal});
  button('co-retry').addEventListener('click',()=>location.reload(),{signal});
  button('co-sound').addEventListener('click',()=>{
    const token=++soundToken,control=button('co-sound');
    if(sound){sound=false;audio.disable();control.textContent='声音 · 关';control.setAttribute('aria-pressed','false');return;}
    control.disabled=true;void audio.enable().then(()=>{if(disposed||token!==soundToken)return;sound=true;control.textContent='声音 · 开';control.setAttribute('aria-pressed','true');if(blocked())audio.pause();},()=>{if(!disposed)control.textContent='声音 · 重试';}).finally(()=>{if(!disposed)control.disabled=false;});
  },{signal});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&discovery.pending&&journey.phase.kind==='game'){const id=journey.phase.id;event.preventDefault();discovery.cancel();journey.closeGame(id,false);sync();resumeAudio();return;}
    if(blocked()||event.target instanceof HTMLButtonElement||event.target instanceof HTMLAnchorElement||event.target instanceof HTMLInputElement)return;
    if(event.code==='Space'){event.preventDefault();if(!event.repeat)journey.toggle();}
    else if(event.key==='Escape'||event.key==='ArrowLeft')journey.pause();
    else if(event.key==='ArrowRight'&&(journey.phase.kind==='ready'||journey.phase.kind==='paused'))journey.toggle();sync();loop();resumeAudio();
  },{signal});
  let press:{id:number;x:number;y:number}|null=null;
  canvas.addEventListener('pointerdown',event=>{if(event.isPrimary&&event.button===0&&!blocked())press={id:event.pointerId,x:event.clientX,y:event.clientY};},{signal});
  canvas.addEventListener('pointercancel',()=>{press=null;},{signal});
  canvas.addEventListener('pointerup',event=>{const start=press;press=null;if(!start||start.id!==event.pointerId||blocked()||Math.hypot(event.clientX-start.x,event.clientY-start.y)>10)return;journey.toggle();sync();loop();resumeAudio();},{signal});
  reducedQuery.addEventListener('change',()=>{reduced=reducedQuery.matches;},{signal});

  void scene.load(signal).then(()=>{if(disposed||signal.aborted)return;ready=true;node('co-loading').hidden=true;resize();observeMapSize(map, signal, resize);characters.refresh();if(autostart&&!document.hidden){autostart=false;journey.toggle();}sync();loop();},error=>{if(disposed||signal.aborted)return;scene.destroy();node('co-loading-copy').textContent=error instanceof Error?error.message:'海岸暂未展开。';button('co-retry').hidden=false;});
  return{
    background(){stop();audio.pause();journey.pause();sync();},
    foreground(){if(disposed)return;stop();if(autostart&&ready&&journey.phase.kind==='ready'){autostart=false;journey.toggle();}sync();loop();resumeAudio();},
    dispose(){if(disposed)return;disposed=true;soundToken++;stop();lifecycle.abort();discovery.cancel();art.dispose();photo.dispose();scene.destroy();audio.destroy();},
  };
}
const chapter=mountCoast();
document.addEventListener('visibilitychange',()=>document.hidden?chapter.background():chapter.foreground());
window.addEventListener('pagehide',event=>event.persisted?chapter.background():chapter.dispose());
window.addEventListener('pageshow',event=>{if(event.persisted)chapter.foreground();});
