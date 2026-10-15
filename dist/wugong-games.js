(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailWugongGames=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
 const kinds={'meadow-butterfly':'clouds','meadow-flower':'altar','wugong-wind-hiker':'greet'};
 const assets={clouds:{scene:'scenes/wugong-cloudsea-v1.webp'},altar:{scene:'scenes/wugong-altar-v1.webp'},greet:{scene:'scenes/wugong-v1.webp',actor:'sprites/wugong-hiker-wave-v1.webp'}};
 const targets={clouds:[{x:.30,y:.41},{x:.56,y:.33},{x:.81,y:.41}],altar:[{x:.55,y:.38},{x:.36,y:.48},{x:.67,y:.53}]};
 const names={clouds:['云中的草脊','云上的小岛','连绵的远山'],altar:['石拱的转折','相接的石缝','石上的苔色'],greet:['隔坡遇见','再挥一次手','把问候留在风里']};
 const prompts={clouds:'拖动取景框，找到亮起的山脊。等薄云让开，把画面稳住，留下三段云海。方向键移动取景框，Enter 开始。',altar:'拖动小透镜，依次找到石拱、石缝与苔色，在细节上停稳。只观察，不移动石块。方向键可移动透镜。',greet:'先看她举手；下方「现在回应」亮起时，轻点画面或按 Enter 挥手回应。完成三次问候；早了或晚了，等下一次就好。'};
 const results={clouds:'我把取景框停在云边，等草脊、小岛与远山逐一清楚，把三段云海留在眼里。',altar:'我沿着石拱、石缝与苔色仔细看了一遍，没有触碰石块；一座小小的石坛，也有许多细节。',greet:'她在草坡另一边挥手，我顺着风声回应了三次；我们没有走近，那一声问候已经到了。'};
 function target(s){return targets[s.game]?.[Math.min(2,s.gates)]||{x:.56,y:.5};}
 function signal(s){const elapsed=Math.max(0,s.age-s.startedAt),round=Math.floor(elapsed/3.6),phase=elapsed%3.6;return {round,phase,open:s.acted&&phase>=1.25&&phase<=2.35&&round!==s.respondedRound};}
 function cloudOpening(s){return s.play.reduced?1:.5+.5*Math.sin((s.age-s.startedAt)*.9+s.gates*1.3);}
 function create(entry,{reduced=false}={}){return {id:entry.id,route:entry.route,kind:entry.interaction,game:kinds[entry.id],age:0,acted:false,gesture:'look',x:.16,y:.72,dragging:false,done:false,actor:{x:.16,y:.72,vx:0,vy:0},control:{x:.16,y:.72},play:{type:'minigame',progress:0,complete:false,completedAt:null,reduced},gates:0,steady:0,near:false,movingUntil:0,startedAt:0,turnUntil:0,lastInput:-10,lastCallRound:-1,respondedRound:-1,serial:0,events:[],feedback:'轻触画面，开始这一段山野小事。'};}
 function event(s,type,x,y){s.serial++;s.events=[...s.events,{serial:s.serial,type,x,y,age:s.age,index:s.gates}].slice(-10);}
 function input(state,point={},mode='tap'){
  if(!state||state.done||state.play.complete)return state;
  const s={...state,actor:{...state.actor},control:{...state.control},events:state.events.slice(),acted:true,gesture:mode==='move'?'drag':'tap',dragging:mode==='move'};
  if(!state.acted){s.startedAt=s.age;s.feedback=prompts[s.game];}
  if(s.game==='greet'){
   if(!state.acted||mode==='move'||s.age-s.lastInput<.32)return s;
   s.lastInput=s.age;const beat=signal(s);
   if(beat.open&&s.age>=s.turnUntil){s.gates++;s.respondedRound=beat.round;s.turnUntil=s.age+.65;event(s,'reply',.56,.46);s.feedback=s.gates===3?'隔着草坡的问候，留在风里了。':'她看见你的回应了，等她再次举手。';}
   else if(beat.round!==s.respondedRound){event(s,'early',.56,.46);s.feedback='稍等她把手举起来，再轻点回应。';}
  }else if(!point.assist){
   const x=clamp(point.x??s.x,.05,.95),y=clamp(point.y??s.y,.12,.88),delta=Math.hypot(x-s.control.x,y-s.control.y);
   if(delta>.012)s.movingUntil=s.age+.15;
   if(delta>.04&&s.age-s.lastInput>.18){event(s,s.game==='clouds'?'focus':'inspect',x,y);s.lastInput=s.age;}
   s.x=x;s.y=y;s.control={x,y};
  }
  return s;
 }
 function step(state,dt){
  const s={...state,actor:{...state.actor},play:{...state.play},events:state.events.slice(),age:state.age+dt};
  if(s.play.complete){s.done=s.age-s.play.completedAt>finishDuration(s);return s;}
  if(!s.acted)return s;
  s.actor.x+=(s.control.x-s.actor.x)*(1-Math.exp(-dt*14));s.actor.y+=(s.control.y-s.actor.y)*(1-Math.exp(-dt*14));
  if(s.game==='greet'){
   const beat=signal(s);if(beat.open&&s.lastCallRound!==beat.round){s.lastCallRound=beat.round;event(s,'call',.56,.46);}
   s.near=beat.open;s.play.progress=s.gates/3;
   if(s.age>=s.turnUntil)s.feedback=beat.open?'现在回应 · 轻点画面或按 Enter':beat.round===s.respondedRound?'她接住了你的问候，等下一次举手。':'先看她举手，再轻点画面回应。';
  }else{
   if(s.age<s.turnUntil){s.near=false;return s;}
   const t=target(s),near=Math.hypot(s.actor.x-t.x,(s.actor.y-t.y)*.85)<(s.game==='clouds'?.085:.075),still=s.age>=s.movingUntil,open=s.game==='altar'||cloudOpening(s)>.5;
   s.near=near&&still&&open;s.steady=clamp(s.steady+(s.near?dt:-dt*.8),0,s.game==='clouds'?1.5:1.2);
   const duration=s.game==='clouds'?1.5:1.2;
   s.feedback=!near?(s.game==='clouds'?'把取景框移到亮起的山脊上。':'把透镜移到亮起的细节上。'):!still?'慢一点，把画面稳住。':!open?'位置对了，等薄云慢慢让开。':s.game==='clouds'?'山脊清楚了，稳住这一小段云海。':'细节正在透镜里展开，停稳看一会儿。';
   if(s.steady>=duration){s.gates++;s.steady=0;s.turnUntil=s.age+.85;s.near=false;event(s,s.game==='clouds'?'shutter':'detail',t.x,t.y);s.feedback=s.gates<3?'这一处留住了，去找下一处。':s.game==='clouds'?'三段云海，连成了眼前的山。':'石拱、石缝和苔色，都看清了。';}
   s.play.progress=(s.gates+s.steady/duration)/3;
  }
  if(s.gates>=3){s.play.progress=1;s.play.complete=true;s.play.completedAt=s.age;event(s,'complete',.5,.5);}
  return s;
 }
 function tick(state,dt){if(!state||state.done||!Number.isFinite(dt)||dt<=0)return state;let s=state;for(let left=Math.min(.25,dt);left>1e-8;left-=.025)s=step(s,Math.min(.025,left));return s;}
 const finishDuration=s=>s.play.reduced?.5:2.7;
 function sample(s){
  const goal=s.events.filter(e=>['shutter','detail','reply'].includes(e.type)).at(-1),since=goal?s.age-goal.age:100,ending=s.play.complete?s.age-s.play.completedAt:0,phase=s.play.complete?(ending>1.45||s.play.reduced?'memory':'soar'):!s.acted?'invite':since<.8?'caught':'play',beat=signal(s);
  return {phase,stage:names[s.game][Math.min(2,s.gates)],count:s.gates,total:3,unit:s.game==='greet'?'次回应':s.game==='clouds'?'段云海':'处细节',cue:s.feedback,pulse:since<.8?1-since/.8:0,hold:s.game==='greet'?(beat.open?1:0):s.steady/(s.game==='clouds'?1.5:1.2),paper:s.play.complete?ease((ending-1.35)/.9):0,
   title:s.game==='clouds'?'等云开，留住山脊':s.game==='altar'?'在石缝里，读一小段时间':'隔着草坡，挥一挥手',kicker:s.game==='clouds'?'武功山 · 云海取景':s.game==='altar'?'武功山 · 金顶石语':'武功山 · 风口相遇',
   invitation:s.game==='clouds'?'移好取景框，给云一点时间。':s.game==='altar'?'不搬动石块，也能看见石坛的细节。':'看见她举手，再把问候送过去。',beat,open:cloudOpening(s),since,ending};
 }
 // All scenery uses one proportion-preserving rectangle. Pointer coordinates,
 // observation targets, magnification and sprites share this mapping on every viewport.
 function bounds(height=460,aspect=1.5){const w=Math.min(800,height*.9*aspect),h=w/aspect;return {x:(800-w)/2,y:(height-h)/2,w,h};}
 function point(refs,p){const b=bounds(refs.height,refs.aspect);return {...p,x:clamp((p.x*800-b.x)/b.w),y:clamp((p.y*(refs.height||460)-b.y)/b.h)};}
 function position(b,p){return {x:b.x+p.x*b.w,y:b.y+p.y*b.h};}
 function frame(g,x,y,w,h,color,alpha=1){const l=12;for(const [dx,dy,sx,sy] of [[-1,-1,1,1],[1,-1,-1,1],[-1,1,1,-1],[1,1,-1,-1]])g.moveTo(x+dx*w/2+sx*l,y+dy*h/2).lineTo(x+dx*w/2,y+dy*h/2).lineTo(x+dx*w/2,y+dy*h/2+sy*l);g.stroke({color,width:2,alpha});}
 let serial=0;
 function draw(svg,parent,entry){
  const game=kinds[entry.id],id='wugong-lens-'+(++serial),root=svg('g',{},parent),paper=svg('rect',{width:800,height:460,fill:game==='altar'?'#e9e4d0':'#dce6dc'},root),scene=svg('image',{href:assets[game].scene,preserveAspectRatio:'xMidYMid meet'},root),fog=svg('g',{'aria-hidden':'true'},root),nodes=[];
  for(let i=0;i<8;i++)nodes.push(svg('ellipse',{rx:170,ry:35,fill:'#fffced',opacity:.15},fog));
  const markings=svg('g',{},root),dots=[0,1,2].map(()=>svg('circle',{r:5,fill:'#f9e5a8',stroke:'#526749','stroke-width':1.5},markings)),finder=svg('rect',{fill:'none',stroke:'#fff8dc','stroke-width':2,rx:10},root);
  let lens=null,lensImage=null,hiker=[],hikerSheet=null;
  if(game==='altar'){const defs=svg('defs',{},root),clip=svg('clipPath',{id},defs);svg('circle',{r:55},clip);lens=svg('g',{},root);lensImage=svg('image',{href:assets.altar.scene,'clip-path':'url(#'+id+')'},lens);svg('circle',{r:55,fill:'none',stroke:'#fff9dd','stroke-width':5},lens);svg('circle',{r:58,fill:'none',stroke:'#8c936e','stroke-width':1},lens);}
  if(game==='greet'){hikerSheet=svg('g',{},root);for(let i=0;i<3;i++){const cell=svg('svg',{overflow:'hidden',viewBox:(i*512)+' 0 512 1024',preserveAspectRatio:'xMidYMax meet'},hikerSheet);svg('image',{href:assets.greet.actor,width:1536,height:1024},cell);hiker.push(cell);}}
  const seal=svg('rect',{fill:'none',stroke:'#fff8e6','stroke-width':20,opacity:0},root),note=svg('text',{x:400,y:230,'text-anchor':'middle',fill:'#4e6948','font-size':13},root);
  const refs={mini:true,wugong:true,game,svg,parent,root,paper,scene,fog,nodes,dots,finder,lens,lensImage,hiker,hikerSheet,seal,note,aspect:game==='greet'?16/9:1.5,height:460,disposed:false,renderer:null,latest:null,failed:false};
  scene.addEventListener('error',()=>{if(!refs.disposed){refs.failed=true;note.textContent='画作暂未加载，仍可按提示操作。';}});parent.setAttribute('viewBox','0 0 800 460');return refs;
 }
 function paintFallback(refs,s){
  if(refs.disposed||!s)return;refs.latest=s;const H=refs.height||460,b=bounds(H,refs.aspect),v=sample(s),t=s.play.reduced?0:s.age,p=position(b,s.actor),goal=position(b,target(s));
  refs.parent.setAttribute('viewBox','0 0 800 '+H);refs.paper.setAttribute('height',H);for(const [k,n]of Object.entries({x:b.x,y:b.y,width:b.w,height:b.h}))refs.scene.setAttribute(k,n);
  refs.nodes.forEach((node,i)=>{node.setAttribute('cx',b.x+((i*141+t*13)%(b.w+280))-140);node.setAttribute('cy',b.y+b.h*(.38+i%3*.13));node.setAttribute('rx',b.w*.22);node.setAttribute('ry',b.h*.055);node.setAttribute('opacity',s.game==='clouds'?(.09+(1-v.open)*.14)*(1-s.gates*.18):.025);});
  refs.dots.forEach((dot,i)=>{const q=position(b,targets[s.game]?.[i]||{x:.43+i*.055,y:.78});dot.setAttribute('cx',q.x);dot.setAttribute('cy',q.y);dot.setAttribute('opacity',s.game==='greet'?i<s.gates?1:.25:i===s.gates?1:i<s.gates?.55:.12);});
  const active=s.game!=='greet';for(const [key,n]of Object.entries({x:p.x-45,y:p.y-31,width:90,height:62,opacity:active&&!s.play.complete?1:0}))refs.finder.setAttribute(key,n);refs.finder.setAttribute('stroke',s.near?'#edca78':'#fff8dc');
  if(refs.lens){refs.lens.setAttribute('transform',`translate(${p.x} ${p.y})`);for(const [k,n]of Object.entries({x:(b.x-p.x)*1.85,y:(b.y-p.y)*1.85,width:b.w*1.85,height:b.h*1.85}))refs.lensImage.setAttribute(k,n);refs.lens.setAttribute('opacity',s.acted?1:0);}
  if(refs.hikerSheet){const wave=wavePose(s),h=b.h*.86,w=h*.5;refs.hiker.forEach((n,i)=>{for(const[k,value]of Object.entries({x:b.x+b.w*.56-w/2,y:b.y+b.h*.93-h,width:w,height:h,opacity:Math.max(0,1-Math.abs(i-wave))}))n.setAttribute(k,value);});}
  for(const[k,n]of Object.entries({x:12,y:12,width:776,height:H-24,opacity:v.paper}))refs.seal.setAttribute(k,n);refs.note.setAttribute('y',H*.5);
 }
 function wavePose(s){if(!s.acted)return 0;const b=signal(s);if(s.play.complete)return 2;if(b.round===s.respondedRound)return 1.5;if(b.phase<.6)return 0;if(b.phase<1.25)return (b.phase-.6)/.65*2;if(b.phase<2.35)return s.play.reduced?2:1.65+Math.sin((b.phase-1.25)*9)*.35;return Math.max(0,2-(b.phase-2.35)*2);}
 function createScene(P,app,game){
  const root=new P.Container(),land=new P.Container(),fog=new P.Container(),actor=new P.Container(),marks=new P.Graphics(),finder=new P.Graphics(),lens=new P.Container(),seal=new P.Graphics(),clouds=[],poses=[],textures=[],frames=[];
  root.eventMode='none';root.addChild(land,fog,actor,marks,finder,lens,seal);app.stage.addChild(root);let scene=null,lensPicture=null,lensMask=null,disposed=false,last=null,aspect=1.5;
  for(let i=0;i<8;i++){const node=new P.Graphics();for(let j=4;j>0;j--)node.ellipse(0,0,100+j*17,14+j*7).fill({color:0xfffced,alpha:.02+j*.008});fog.addChild(node);clouds.push(node);}
  async function install(kind,entry){
   if(disposed||entry?.state!=='ready')return;const texture=P.Texture.from(entry.image,true);textures.push(texture);
   let installed;
   if(kind==='scene'){aspect=texture.width/texture.height;scene=new P.Sprite(texture);land.addChild(scene);installed=scene;
    if(game==='altar'){lensPicture=new P.Sprite(texture);lensMask=new P.Graphics().circle(0,0,55).fill(0xffffff);lens.addChild(lensPicture,lensMask);lensPicture.mask=lensMask;}
   }else if(kind==='actor'&&game==='greet'){for(let i=0;i<3;i++){const start=Math.round(i*texture.width/3),end=Math.round((i+1)*texture.width/3),frameTexture=new P.Texture({source:texture.source,frame:new P.Rectangle(start,0,end-start,texture.height)});frames.push(frameTexture);const node=new P.Sprite(frameTexture);node.anchor.set(.5,1);actor.addChild(node);poses.push(node);}installed=actor;}
   if(installed){installed.visible=false;await Promise.resolve(app.renderer.prepare?.upload(installed)).catch(()=>{});if(!disposed){installed.visible=true;if(last)paint(last);}}
  }
  function paint(s){
   if(disposed)return;last=s;const H=app.screen?.height||460,b=bounds(H,aspect),v=sample(s),t=s.play.reduced?0:s.age,p=position(b,s.actor),goal=position(b,target(s));
   if(scene){scene.position.set(b.x,b.y);scene.scale.set(b.w/scene.texture.width);}
   clouds.forEach((node,i)=>{node.position.set(b.x+((i*141+t*13)%(b.w+280))-140,b.y+b.h*(.38+i%3*.13));node.scale.set(b.w/800,b.h/460);node.alpha=game==='clouds'?(.5+(1-v.open)*.8)*(1-s.gates*.18):.13;});
   marks.clear();if(game!=='greet')for(let i=0;i<3;i++){const q=position(b,targets[game][i]);marks.circle(q.x,q.y,i===s.gates?7:4).fill({color:i<s.gates?0xf0d185:0xfff3c5,alpha:i===s.gates?.9:i<s.gates?.65:.14});if(i===s.gates&&!s.play.complete)marks.circle(q.x,q.y,14).stroke({color:0xffedbd,width:1,alpha:.7});}
   finder.clear();if(game==='clouds'&&!s.play.complete){frame(finder,p.x,p.y,104,72,s.near?0xe8c779:0xfff8de);finder.moveTo(p.x-8,p.y).lineTo(p.x+8,p.y).moveTo(p.x,p.y-8).lineTo(p.x,p.y+8).stroke({color:0xfff8de,width:1,alpha:.6});}
   if(game==='altar'&&lensPicture){lens.position.set(p.x,p.y);lens.alpha=s.acted?1:0;lensPicture.scale.set(b.w/scene.texture.width*1.85);lensPicture.position.set((b.x-p.x)*1.85,(b.y-p.y)*1.85);finder.circle(p.x,p.y,58).stroke({color:0x526549,width:1,alpha:.9});finder.circle(p.x,p.y,55).stroke({color:s.near?0xead08b:0xfff9df,width:4,alpha:.95});}
   if(game==='greet'){const pose=wavePose(s);for(const [i,node]of poses.entries()){node.position.set(b.x+b.w*.56,b.y+b.h*.93);node.scale.set(b.h*.86/node.texture.height);node.alpha=Math.max(0,1-Math.abs(i-pose));}const q=position(b,{x:.56,y:.40});if(v.beat.open)marks.circle(q.x,q.y,22).stroke({color:0xf5da8e,width:2,alpha:.8});for(let i=0;i<3;i++)marks.circle(b.x+b.w*(.43+i*.055),b.y+b.h*.94,4).fill({color:0xf3d58e,alpha:i<s.gates?1:.2});}
   for(const e of s.events){const age=s.age-e.age;if(age>1.1||!['shutter','detail','reply'].includes(e.type))continue;const q=position(b,e);for(let i=0;i<8;i++){const a=i*Math.PI/4;marks.ellipse(q.x+Math.cos(a)*age*32,q.y+Math.sin(a)*age*20,2,1).fill({color:0xfff0c1,alpha:1-age/1.1});}}
   seal.clear();if(v.paper){seal.rect(0,0,800,H).fill({color:0xfff6df,alpha:v.paper*.1});seal.rect(12,12,776,H-24).stroke({color:0xfff8e6,width:24*v.paper,alpha:v.paper});}
  }
  function dispose(){if(disposed)return;disposed=true;root.destroy({children:true});for(const texture of frames)texture.destroy(false);for(const texture of textures)texture.destroy(true);}
  return {root,install,paint,dispose,get ready(){return !!scene?.visible&&(game!=='greet'||poses.length===3&&actor.visible);},get aspect(){return aspect;}};
 }
 return {kinds,assets,names,prompts,results,target,signal,cloudOpening,create,input,tick,finishDuration,sample,bounds,point,draw,paintFallback,createScene};
}));
