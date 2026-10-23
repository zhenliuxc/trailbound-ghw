(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./wugong-stories.js'):root.TrailWugongStories);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailWugongGames=api;}(typeof globalThis!=='undefined'?globalThis:this,function(S){
 'use strict';
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
 const kinds={...S.kinds,'meadow-flower':'altar'},assets={...S.assets,altar:{scene:'scenes/wugong-altar-v1.webp'}};
 const names={altar:['石拱的转折','相接的石缝','石上的苔色']};
 const prompts={...S.prompts,altar:'拖动小透镜，依次找到石拱、石缝与苔色，在细节上停稳。只观察，不移动石块。方向键可移动透镜。'};
 const results={...S.results,altar:'我沿着石拱、石缝与苔色仔细看了一遍，没有触碰石块；一座小小的石坛，也有许多细节。'};
 const targets=[{x:.55,y:.38},{x:.36,y:.48},{x:.67,y:.53}],isStory=s=>!!S.assets[s?.game];
 function target(s){return targets[Math.min(2,s.gates)];}
 function create(entry,options={}){if(S.kinds[entry.id])return S.create(entry,options);return {id:entry.id,route:entry.route,kind:entry.interaction,game:'altar',age:0,acted:false,gesture:'look',x:.16,y:.72,dragging:false,done:false,actor:{x:.16,y:.72,vx:0,vy:0},control:{x:.16,y:.72},play:{type:'minigame',progress:0,complete:false,completedAt:null,reduced:!!options.reduced},gates:0,steady:0,near:false,movingUntil:0,turnUntil:0,lastInput:-10,serial:0,events:[],feedback:'轻触画面，开始这一段山野小事。'};}
 function event(s,type,x,y){s.serial++;s.events=[...s.events,{serial:s.serial,type,x,y,age:s.age,index:s.gates}].slice(-10);}
 function input(state,point={},mode='tap'){
  if(isStory(state))return S.input(state,point,mode);if(!state||state.done||state.play.complete)return state;
  const s={...state,actor:{...state.actor},control:{...state.control},events:state.events.slice(),acted:true,gesture:mode==='move'?'drag':'tap',dragging:mode==='move'};
  if(!state.acted)s.feedback=prompts.altar;
  if(!point.assist){const x=clamp(point.x??s.x,.05,.95),y=clamp(point.y??s.y,.12,.88),delta=Math.hypot(x-s.control.x,y-s.control.y);if(delta>.012)s.movingUntil=s.age+.15;if(delta>.04&&s.age-s.lastInput>.18){event(s,'inspect',x,y);s.lastInput=s.age;}s.x=x;s.y=y;s.control={x,y};}
  return s;
 }
 function release(s){return isStory(s)?S.release(s):{...s,dragging:false};}
 function step(state,dt){
  const s={...state,actor:{...state.actor},play:{...state.play},events:state.events.slice(),age:state.age+dt};
  if(s.play.complete){s.done=s.age-s.play.completedAt>finishDuration(s);return s;}if(!s.acted)return s;
  s.actor.x+=(s.control.x-s.actor.x)*(1-Math.exp(-dt*14));s.actor.y+=(s.control.y-s.actor.y)*(1-Math.exp(-dt*14));
  if(s.age<s.turnUntil){s.near=false;return s;}
  const t=target(s),near=Math.hypot(s.actor.x-t.x,(s.actor.y-t.y)*.85)<.075,still=s.age>=s.movingUntil;s.near=near&&still;s.steady=clamp(s.steady+(s.near?dt:-dt*.8),0,1.2);
  s.feedback=!near?'把透镜移到亮起的细节上。':!still?'慢一点，把画面稳住。':'细节正在透镜里展开，停稳看一会儿。';
  if(s.steady>=1.2){s.gates++;s.steady=0;s.turnUntil=s.age+.85;s.near=false;event(s,'detail',t.x,t.y);s.feedback=s.gates<3?'这一处留住了，去找下一处。':'石拱、石缝和苔色，都看清了。';}
  s.play.progress=(s.gates+s.steady/1.2)/3;if(s.gates>=3){s.play.progress=1;s.play.complete=true;s.play.completedAt=s.age;event(s,'complete',.5,.5);}return s;
 }
 function tick(state,dt){if(isStory(state))return S.tick(state,dt);if(!state||state.done||!Number.isFinite(dt)||dt<=0)return state;let s=state;for(let left=Math.min(.25,dt);left>1e-8;left-=.025)s=step(s,Math.min(.025,left));return s;}
 function finishDuration(s){return isStory(s)?S.finishDuration(s):s.play.reduced?.5:2.7;}
 function sample(s){
  if(isStory(s))return S.sample(s);const goal=s.events.filter(e=>e.type==='detail').at(-1),since=goal?s.age-goal.age:100,ending=s.play.complete?s.age-s.play.completedAt:0,phase=s.play.complete?(ending>1.45||s.play.reduced?'memory':'soar'):!s.acted?'invite':since<.8?'caught':'play';
  return {phase,stage:names.altar[Math.min(2,s.gates)],count:s.gates,total:3,unit:'处细节',cue:s.feedback,pulse:since<.8?1-since/.8:0,hold:s.steady/1.2,paper:s.play.complete?ease((ending-1.35)/.9):0,title:'在石缝里，读一小段时间',kicker:'武功山 · 金顶石语',invitation:'不搬动石块，也能看见石坛的细节。',since,ending};
 }
 function bounds(height=460,aspect=1.5){const w=Math.min(800,height*.9*aspect),h=w/aspect;return {x:(800-w)/2,y:(height-h)/2,w,h};}
 function point(refs,p){const b=(refs.story?S.bounds:bounds)(refs.height,refs.aspect);return {...p,x:clamp((p.x*800-b.x)/b.w),y:clamp((p.y*(refs.height||460)-b.y)/b.h)};}
 function position(b,p){return {x:b.x+p.x*b.w,y:b.y+p.y*b.h};}
 let serial=0;
 function draw(svg,parent,entry){
  if(S.kinds[entry.id])return S.draw(svg,parent,entry);
  const id='wugong-lens-'+(++serial),root=svg('g',{},parent),paper=svg('rect',{width:800,height:460,fill:'#e9e4d0'},root),scene=svg('image',{href:assets.altar.scene,preserveAspectRatio:'xMidYMid meet'},root),markings=svg('g',{},root),dots=[0,1,2].map(()=>svg('circle',{r:5,fill:'#f9e5a8',stroke:'#526749','stroke-width':1.5},markings)),defs=svg('defs',{},root),clip=svg('clipPath',{id},defs);
  svg('circle',{r:55},clip);const lens=svg('g',{},root),lensImage=svg('image',{href:assets.altar.scene,'clip-path':'url(#'+id+')'},lens);svg('circle',{r:55,fill:'none',stroke:'#fff9dd','stroke-width':5},lens);svg('circle',{r:58,fill:'none',stroke:'#8c936e','stroke-width':1},lens);
  const seal=svg('rect',{fill:'none',stroke:'#fff8e6','stroke-width':20,opacity:0},root),note=svg('text',{x:400,y:230,'text-anchor':'middle',fill:'#4e6948','font-size':13},root),refs={mini:true,wugong:true,game:'altar',svg,parent,root,paper,scene,dots,lens,lensImage,hiker:[],seal,note,aspect:1.5,height:460,disposed:false,renderer:null,latest:null};
  scene.addEventListener('error',()=>{if(!refs.disposed)note.textContent='画作暂未加载，仍可按提示操作。';});parent.setAttribute('viewBox','0 0 800 460');return refs;
 }
 function paintFallback(refs,s){
  if(refs.story)return S.paintFallback(refs,s);if(refs.disposed||!s)return;refs.latest=s;const H=refs.height||460,b=bounds(H,refs.aspect),v=sample(s),p=position(b,s.actor);
  refs.parent.setAttribute('viewBox','0 0 800 '+H);refs.paper.setAttribute('height',H);for(const [k,n]of Object.entries({x:b.x,y:b.y,width:b.w,height:b.h}))refs.scene.setAttribute(k,n);
  refs.dots.forEach((dot,i)=>{const q=position(b,targets[i]);dot.setAttribute('cx',q.x);dot.setAttribute('cy',q.y);dot.setAttribute('opacity',i===s.gates?1:i<s.gates?.55:.12);});
  refs.lens.setAttribute('transform','translate('+p.x+' '+p.y+')');for(const [k,n]of Object.entries({x:(b.x-p.x)*1.85,y:(b.y-p.y)*1.85,width:b.w*1.85,height:b.h*1.85}))refs.lensImage.setAttribute(k,n);refs.lens.setAttribute('opacity',s.acted?1:0);
  for(const[k,n]of Object.entries({x:12,y:12,width:776,height:H-24,opacity:v.paper}))refs.seal.setAttribute(k,n);refs.note.setAttribute('y',H*.5);
 }
 function createScene(P,app,game){
  if(S.assets[game])return S.createScene(P,app,game);
  const root=new P.Container(),land=new P.Container(),marks=new P.Graphics(),finder=new P.Graphics(),lens=new P.Container(),seal=new P.Graphics(),textures=[];
  root.eventMode='none';root.addChild(land,marks,finder,lens,seal);app.stage.addChild(root);let scene=null,lensPicture=null,disposed=false,last=null,aspect=1.5;
  async function install(kind,entry){
   if(disposed||kind!=='scene'||entry?.state!=='ready')return;const texture=P.Texture.from(entry.image,true);textures.push(texture);aspect=texture.width/texture.height;scene=new P.Sprite(texture);land.addChild(scene);lensPicture=new P.Sprite(texture);const mask=new P.Graphics().circle(0,0,55).fill(0xffffff);lens.addChild(lensPicture,mask);lensPicture.mask=mask;
   scene.visible=false;await Promise.resolve(app.renderer.prepare?.upload(land)).catch(()=>{});if(!disposed){scene.visible=true;if(last)paint(last);}
  }
  function paint(s){
   if(disposed)return;last=s;const H=app.screen?.height||460,b=bounds(H,aspect),v=sample(s),p=position(b,s.actor);if(scene){scene.position.set(b.x,b.y);scene.scale.set(b.w/scene.texture.width);}
   marks.clear();for(let i=0;i<3;i++){const q=position(b,targets[i]);marks.circle(q.x,q.y,i===s.gates?7:4).fill({color:i<s.gates?0xf0d185:0xfff3c5,alpha:i===s.gates?.9:i<s.gates?.65:.14});if(i===s.gates&&!s.play.complete)marks.circle(q.x,q.y,14).stroke({color:0xffedbd,width:1,alpha:.7});}
   finder.clear();if(lensPicture){lens.position.set(p.x,p.y);lens.alpha=s.acted?1:0;lensPicture.scale.set(b.w/scene.texture.width*1.85);lensPicture.position.set((b.x-p.x)*1.85,(b.y-p.y)*1.85);finder.circle(p.x,p.y,58).stroke({color:0x526549,width:1,alpha:.9});finder.circle(p.x,p.y,55).stroke({color:s.near?0xead08b:0xfff9df,width:4,alpha:.95});}
   seal.clear();if(v.paper){seal.rect(0,0,800,H).fill({color:0xfff6df,alpha:v.paper*.1});seal.rect(12,12,776,H-24).stroke({color:0xfff8e6,width:24*v.paper,alpha:v.paper});}
  }
  function dispose(){if(disposed)return;disposed=true;root.destroy({children:true});for(const texture of textures)texture.destroy(true);}
  return {root,install,paint,dispose,get ready(){return !!scene?.visible;},get aspect(){return aspect;}};
 }
 return {kinds,assets,names,prompts,results,target,create,input,release,tick,finishDuration,sample,bounds,point,draw,paintFallback,createScene};
}));
