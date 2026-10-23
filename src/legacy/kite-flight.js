(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailKiteFlight=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
 const ease=t=>{t=clamp(t);return t*t*(3-2*t);};
 const names=['顺风起飞','穿过山脊侧风','云海前，缓缓放线'];
 const prompt='上下拖动牵线，陪纸鸢从草坡起飞、穿过侧风，再缓缓放线进入云海。跟着流动的风带调整，脱风后可重新找回航线；方向键也能牵线。';
 const result='我顺着草浪牵起纸鸢，带它穿过山脊的侧风，再缓缓放线。它沿着一整段风路，飞向了云海。';
 function stage(s){return s.travel<.32?0:s.travel<.72?1:2;}
 function target(s){
  const p=s.travel;let y;
  if(p<.32)y=.67-.12*ease(p/.32);
  else if(p<.72)y=.55-.20*ease((p-.32)/.40);
  else y=.35+.13*ease((p-.72)/.28);
  return y+(s.play.reduced?0:Math.sin(s.age*.75)*.014*(stage(s)===1?1.7:1));
 }
 function radius(s){return [.105,.085,.075][stage(s)];}
 function flowAt(s,x){const wave=s.play.reduced?0:(Math.sin(x*7-s.age*1.25)-Math.sin(s.actor.x*7-s.age*1.25))*.012;return target(s)+wave;}
 function create(entry,{reduced=false}={}){return {
  id:entry.id,route:entry.route,kind:entry.interaction,game:'wind',age:0,acted:false,gesture:'look',x:.5,y:.78,dragging:false,done:false,
  play:{type:'minigame',progress:0,complete:false,completedAt:null,reduced},actor:{x:.24,y:.78,vx:0,vy:0},control:{x:.5,y:.78},
  travel:0,checkpoint:0,gates:0,windHold:0,windNear:false,lastTug:-10,cooldown:0,serial:0,events:[],energy:0,feedback:prompt
 };}
 function event(s,type,index=0){s.events.push({serial:++s.serial,type,x:s.actor.x,y:s.actor.y,index,age:s.age});s.events=s.events.slice(-20);}
 function input(state,p={},mode='tap'){
  if(!state||state.done||state.play.complete)return state;
  const s={...state,actor:{...state.actor},control:{...state.control},events:state.events.slice(),acted:true,gesture:mode==='move'?'drag':'tap',dragging:mode==='move'};
  if(p.assist){s.feedback='方向键上下牵线，沿风带飞过山脊；R 可以重新起飞。';return s;}
  s.x=clamp(p.x??s.x);s.y=clamp(p.y??s.y,.10,.90);
  if(Math.abs(s.y-s.control.y)>.025&&s.age-s.lastTug>.28){event(s,'tug');s.lastTug=s.age;}
  s.control={x:s.x,y:s.y};return s;
 }
 function release(s){return s?{...s,dragging:false}:s;}
 function step(state,dt){
  const s={...state,actor:{...state.actor},play:{...state.play},events:state.events.slice(),age:state.age+dt,cooldown:Math.max(0,state.cooldown-dt)};
  if(s.play.complete){const q=s.play.reduced?1:ease((s.age-s.play.completedAt)/1.7);s.actor.x=s.finishFrom.x+(.82-s.finishFrom.x)*q;s.actor.y=s.finishFrom.y+(.17-s.finishFrom.y)*q;s.actor.vy=0;s.done=s.age-s.play.completedAt>(s.play.reduced?.45:3.2);return s;}
  if(!s.acted)return s;
  const segment=stage(s),a=s.actor,oldNear=s.windNear;
  // The ridge adds a cross-current; releasing line changes the final descent into the far current.
  const cross=s.play.reduced?0:segment===1?Math.sin(s.age*1.8)*.085:Math.sin(s.age*.9)*.012;
  a.vy=clamp((a.vy+(s.control.y-a.y)*dt*(segment===2?6.5:8)+cross*dt)*Math.exp(-dt*3.4),-.34,.34);
  a.y=clamp(a.y+a.vy*dt,.10,.90);
  const offset=Math.abs(a.y-target(s));s.windNear=offset<radius(s);
  s.energy=clamp(1-offset/radius(s));s.windHold=s.energy*2.6;
  if(s.windNear){
   const speed=[.054,.046,.040][segment]*(.60+s.energy*.40);s.travel=clamp(s.travel+speed*dt);
   if(!oldNear&&!s.cooldown){event(s,'lift');s.cooldown=1;}
  }else{
   s.travel=Math.max(s.checkpoint,s.travel-dt*.012);a.y=clamp(a.y+dt*.012,.10,.90);
   if(oldNear&&!s.cooldown){event(s,'slip');s.cooldown=.8;}
  }
  a.x=.24+s.travel*.37;s.play.progress=s.travel;
  const nextStage=stage(s);
  if(nextStage>segment){s.checkpoint=nextStage===1?.32:.72;s.gates=nextStage;event(s,'flight-phase',nextStage);}
  s.feedback=!s.windNear?(a.y>target(s)?'轻轻向上牵线 ↑ 找回风带，已经飞过的山段会保留。':'松一点线 ↓ 回到流动的风里。'):nextStage===0?'草浪托起纸鸢，沿着风带慢慢升起。':nextStage===1?'山脊侧风来了，顺着风带调整牵线，不必停住。':'缓缓放线，让纸鸢沿远处的气流飞进云海。';
  if(s.travel>=1){s.play.complete=true;s.play.completedAt=s.age;s.finishFrom={...a};s.energy=1;s.feedback='纸鸢越过了整段山脊，云海在它身后展开。';event(s,'complete');}
  return s;
 }
 function tick(s,dt){if(!s||s.done||!Number.isFinite(dt)||dt<=0)return s;for(let left=Math.min(.25,dt);left>1e-8;left-=.025)s=step(s,Math.min(.025,left));return s;}
 return {names,prompt,result,stage,target,radius,flowAt,create,input,release,tick};
}));
