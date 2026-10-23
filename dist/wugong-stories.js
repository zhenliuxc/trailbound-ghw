(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./wind-scene.js'):root.TrailWindScene);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailWugongStories=api;}(typeof globalThis!=='undefined'?globalThis:this,function(W){
 'use strict';
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
 const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
 const kinds={'meadow-butterfly':'clouds','wugong-wind-hiker':'greet'};
 const assets={
  clouds:{scene:'scenes/wugong-cloudsea-v1.webp',front:'sprites/wugong-meadow-grass-v1.webp'},
  greet:{scene:'scenes/wugong-v1.webp',actor:'sprites/wugong-hiker-wave-v1.webp',front:'sprites/wugong-meadow-grass-v1.webp'}
 };
 const prompts={clouds:'点一点或划过云朵，让山脊露出来。',greet:'走近和她聊两句，再帮她拍张照。拖动取景框，让她和身后的山一起入镜，按快门后可以重拍。'};
 const results={clouds:'我轻轻拨开山脊前的云。云絮随着风散去，绿色的草脊浮出云海，像一封慢慢打开的信。',greet:'草甸风口遇见一位笑着招手的姑娘。我帮她把身后的山也拍进照片，给她看过后，在风里说了再见。'};
 // Three touchable patches of foreground mist; the painted cloud sea stays in the valleys.
 const cloudSeeds=[{x:.22,y:.47,w:.42,h:.34},{x:.51,y:.38,w:.40,h:.34},{x:.78,y:.56,w:.42,h:.34}];
 function create(entry,{reduced=false}={}){
  const game=kinds[entry.id];return {
   id:entry.id,route:entry.route,kind:entry.interaction,game,age:0,acted:false,gesture:'look',dragging:false,done:false,x:game==='clouds'?.22:.45,y:game==='clouds'?.47:.55,
   actor:{x:.60,y:.91,vx:0,vy:0},control:{x:.45,y:.5},play:{type:'minigame',progress:0,complete:false,completedAt:null,reduced},
   gates:0,serial:0,events:[],near:false,stage:game==='clouds'?'clouds':'meet',stageAt:0,clouds:cloudSeeds.map(()=>({clearedAt:null,direction:0})),cloudCursor:0,keyboard:false,pointer:null,
   camera:{x:.45,y:.47,zoom:1},capture:null,shots:0,feedback:game==='clouds'?'点一点云朵，山脊就会露出来。':'她在草坡旁停下脚步，笑着朝你招了招手。'
  };
 }
 function copy(s){return {...s,actor:{...s.actor},control:{...s.control},play:{...s.play},camera:{...s.camera},events:s.events.slice(),clouds:s.clouds.map(c=>({...c})),pointer:s.pointer&&{...s.pointer}};}
 function event(s,type,x=.5,y=.5){s.serial++;s.events.push({serial:s.serial,type,x,y,age:s.age,index:s.gates});s.events=s.events.slice(-16);}
 function stage(s,value){s.stage=value;s.stageAt=s.age;}
 function complete(s){if(s.play.complete)return;if(s.game!=='clouds')s.gates=1;s.play.progress=1;s.play.complete=true;s.play.completedAt=s.age;event(s,'complete');}
 function clearCloud(s,index,direction=0){
  const cloud=s.clouds[index];if(!cloud||cloud.clearedAt!==null)return;
  const at=mistState(s,index);cloud.clearedAt=s.age;cloud.direction=direction||(at.x<.5?-1:1);s.gates++;s.play.progress=s.gates/3;
  s.feedback=s.gates===3?'云散了，山脊就在眼前。':'一朵云散开了，再拨开旁边的云吧。';event(s,'cloud-clear',at.x,at.y);
  if(s.gates===3)stage(s,'reveal');
 }
 function sweepClouds(s,from,to){
  for(let i=0;i<cloudSeeds.length;i++){
   if(s.clouds[i].clearedAt!==null)continue;const c=mistState(s,i),rx=c.w*.36,ry=c.h*.36,a={x:(from.x-c.x)/rx,y:(from.y-c.y)/ry},d={x:(to.x-from.x)/rx,y:(to.y-from.y)/ry},t=clamp(-(a.x*d.x+a.y*d.y)/(d.x*d.x+d.y*d.y||1));
   if(Math.hypot(a.x+d.x*t,a.y+d.y*t)<=1)clearCloud(s,i,Math.abs(to.x-from.x)>.015?Math.sign(to.x-from.x):0);
  }
 }
 function cloudInput(s,p,mode){
  const action=p.action||(p.assist?'blow':'');
  if(p.key){
   const free=s.clouds.map((c,i)=>c.clearedAt===null?i:-1).filter(i=>i>=0);if(!free.length)return;
   const at=free.indexOf(s.cloudCursor),delta=(p.dx||p.dy||0)<0?-1:1;s.cloudCursor=free[(at+delta+free.length)%free.length];s.keyboard=true;return;
  }
  if(action==='blow'){
   const index=s.clouds[s.cloudCursor]?.clearedAt===null?s.cloudCursor:s.clouds.findIndex(c=>c.clearedAt===null);s.keyboard=true;clearCloud(s,index);return;
  }
  if(action)return;
  const q={x:clamp(p.x??s.x),y:clamp(p.y??s.y)};s.x=q.x;s.y=q.y;s.control=q;s.keyboard=false;
  if(p.phase==='press'){s.pointer=q;s.dragging=false;return;}
  if(mode==='move'){
   if(s.pointer){sweepClouds(s,s.pointer,q);s.pointer=q;s.dragging=true;}return;
  }
  if(p.phase==='release'){
   if(s.pointer)sweepClouds(s,p.dragged?s.pointer:q,q);s.pointer=null;s.dragging=false;return;
  }
  // A direct tap is also used by assistive controls. Unknown legacy actions never clear a cloud.
  sweepClouds(s,q,q);
 }
 function cameraFrame(camera){const w=.62/camera.zoom,h=.74/camera.zoom;return {x:camera.x-w/2,y:camera.y-h/2,w,h};}
 function poseAt(s){
  if(s.stage==='meet')return 1;
  if(s.stage==='request')return 0;
  if(s.stage==='farewell'||s.play.complete)return s.play.reduced?2:1+ease((s.age-s.stageAt)/.5);
  if(s.capture&&['review','reply'].includes(s.stage))return s.capture.pose;
  if(s.play.reduced)return 1;
  const t=(s.age-s.stageAt)%8;return t<2?0:t<2.45?(t-2)/.45:t<4.8?1:t<5.25?1+(t-4.8)/.45:t<6.1?2:t<6.55?2-(t-6.1)/.45*2:0;
 }
 function judgePhoto(s){
  const f=cameraFrame(s.camera),face={x:s.actor.x,y:.22},left=f.x,right=f.x+f.w,top=f.y,bottom=f.y+f.h;
  if(face.x-.053<left||face.x+.053>right||face.y-.07<top||face.y+.07>bottom)return {ok:false,reason:'她的脸有些出框了。把取景框移回来，留一点头顶的空间。'};
  if(bottom<.66)return {ok:false,reason:'画面有些紧，退远一点，让人物和草坡一起入镜。'};
  const subject=(face.x-left)/f.w;
  if(f.w<.43||subject<.30||subject>.84)return {ok:false,reason:'也给身后的山留些位置吧。可以移一移取景框，或退远一点。'};
  return {ok:true,reason:poseAt(s)>.5?'风吹起她的发梢，你刚好留下了这个笑着招手的瞬间。':'她站在草甸的风里，身后的山也完整留在了画面中。'};
 }
 function moveCamera(s,p){
  const zoom=clamp(p.zoom??s.camera.zoom,.85,1.45),frame=cameraFrame({zoom});
  s.camera={x:clamp(p.x??s.camera.x,frame.w/2+.015,1-frame.w/2-.015),y:clamp(p.y??s.camera.y,frame.h/2+.015,1-frame.h/2-.015),zoom};s.x=s.camera.x;s.y=s.camera.y;s.control={x:s.x,y:s.y};
 }
 function input(state,p={},mode='tap'){
  if(!state||state.done||state.play.complete)return state;
  const s=copy(state);s.acted=true;s.gesture=mode==='move'?'drag':'tap';s.dragging=mode==='move';
  if(s.game==='clouds'){cloudInput(s,p,mode);return s;}
  const action=p.action||(p.assist?(s.stage==='camera'?'shutter':s.stage==='review'&&!s.capture?.ok?'retake':'advance'):'');
  if(action==='retake'&&s.stage==='review'){s.capture=null;stage(s,'camera');s.feedback='再取一次景吧。她还在草坡旁等你。';event(s,'frame',s.camera.x);}
  else if(action==='zoom-in'&&s.stage==='camera')moveCamera(s,{zoom:s.camera.zoom+.12});
  else if(action==='zoom-out'&&s.stage==='camera')moveCamera(s,{zoom:s.camera.zoom-.12});
  else if(action==='shutter'&&s.stage==='camera'){
   const quality=judgePhoto(s);s.capture={...s.camera,...quality,pose:poseAt(s),clock:s.age,actorX:s.actor.x};s.shots++;stage(s,'review');s.feedback=quality.reason;event(s,'shutter',s.actor.x,.22);
  }else if(action==='advance'&&mode!=='move'){
   if(s.stage==='meet'){stage(s,'request');s.feedback='“能帮我把身后的山也拍进去吗？这里的风太舒服了。”';event(s,'hello',s.actor.x);}
   else if(s.stage==='request'){stage(s,'camera');moveCamera(s,{});s.feedback='把她和远山一起放进取景框，选一个你喜欢的瞬间。';event(s,'offer',s.actor.x);}
   else if(s.stage==='review'&&s.capture?.ok){stage(s,'reply');s.feedback='“拍得真好！连刚才那阵风，好像也留下来了。”';event(s,'show-photo',s.actor.x);}
   else if(s.stage==='reply'){stage(s,'farewell');s.feedback='“那就下次山里见。”她挥挥手，山风又从草坡上吹过。';event(s,'goodbye',s.actor.x);}
  }else if(s.stage==='camera'&&!action){moveCamera(s,p);if(s.age-(s.lastFrame??-10)>.3){event(s,'frame',s.camera.x);s.lastFrame=s.age;}}
  s.play.progress=({meet:0,request:.15,camera:.35,review:.6,reply:.84,farewell:.94})[s.stage];return s;
 }
 function release(s){return s?{...s,dragging:false,pointer:null}:s;}
 function tick(state,dt){
  if(!state||state.done||!Number.isFinite(dt)||dt<=0)return state;
  const s=copy(state);s.age+=Math.min(.25,dt);
  if(s.play.complete){s.done=s.age-s.play.completedAt>finishDuration(s);return s;}
  if(s.game==='clouds'&&s.stage==='reveal'&&s.age-s.stageAt>(s.play.reduced?.12:1.05))complete(s);
  if(s.game==='greet'&&s.stage==='farewell'&&s.age-s.stageAt>(s.play.reduced?.3:1.45))complete(s);
  return s;
 }
 function finishDuration(s){return s.play.reduced?.45:2.7;}
 function controls(s){
  if(s.game==='clouds')return null;
  if(s.play.complete||s.stage==='farewell')return {speaker:'',line:s.feedback,primary:null,secondary:null};
  const lines={
   meet:['草甸风口','她放慢脚步，笑着朝你招手。风把一句招呼送了过来。','走近打个招呼'],
   request:['她说','“能帮我把身后的山也拍进去吗？这里的风太舒服了。”','好，我来帮你拍'],
   camera:['替她留住这阵风','拖动取景框，把人物与远山一起留下；觉得合适就按快门。','拍下这一刻'],
   review:[s.capture?.ok?'这一张，留下来了':'换个角度再试试',s.feedback,s.capture?.ok?'给她看看':'重新取景'],
   reply:['她看着照片笑了','“拍得真好！连刚才那阵风，好像也留下来了。”','下次山里见']
  },line=lines[s.stage]||lines.meet;
  return {speaker:line[0],line:line[1],primary:{action:s.stage==='camera'?'shutter':s.stage==='review'&&!s.capture?.ok?'retake':'advance',label:line[2]},secondary:s.stage==='review'&&s.capture?.ok?{action:'retake',label:'再拍一张'}:null,zoom:s.stage==='camera'};
 }
 function sample(s){
  const ending=s.play.complete?s.age-s.play.completedAt:0,phase=s.play.complete?(s.play.reduced||ending>1.4?'memory':'soar'):!s.acted?'invite':'play';
  return {phase,ending,paper:s.play.complete?(s.play.reduced?1:ease((ending-1.25)/.9)):0,
   stage:s.game==='clouds'?'拨云见山':({meet:'草甸风口的邂逅',request:'借你一双看山的眼睛',camera:'把她和远山一起留下',review:'先看看刚才那张照片',reply:'把照片给她看看',farewell:'下次山里见'})[s.stage],
   count:s.game==='clouds'?s.gates:s.play.complete?1:0,total:s.game==='clouds'?3:1,unit:s.game==='clouds'?'朵云':'次相遇',counter:s.game==='clouds'?s.gates+' / 3 朵云':(s.stage==='camera'?'取景中':s.stage==='review'?'第 '+s.shots+' 张':'风口相遇'),
   hold:s.play.progress,cue:s.feedback,title:s.game==='clouds'?'拨开云，看看山':'在草甸的风里，遇见她',kicker:s.game==='clouds'?'武功山 · 云海开信':'武功山 · 吊带追风',invitation:s.game==='clouds'?'点一点云朵，让山脊露出来。':'她停下脚步，笑着朝你招了招手。',controls:controls(s),story:true
  };
 }
 function bounds(height=460,aspect=1.5){const w=Math.min(800,height*.94*aspect),h=w/aspect;return {x:(800-w)/2,y:(height-h)/2,w,h};}
 function position(b,p){return {x:b.x+p.x*b.w,y:b.y+p.y*b.h};}
 function photoRect(s,b){
  const f=cameraFrame(s.capture||s.camera),w=Math.min(b.w*.79,b.h*1.27),h=w*f.h/f.w/(16/9),entry=s.play.reduced?1:ease((s.age-s.stageAt)/.45);
  const shift=s.stage==='review'?0:s.stage==='farewell'?1:entry,shown=1-.42*shift,photoW=w*shown,photoH=h*shown,fromX=400-w/2,fromY=b.y+(b.h-h)/2;
  return {x:fromX+(b.x+b.w*.04-fromX)*shift,y:fromY+(b.y+b.h*.48-fromY)*shift+(s.stage==='review'?(1-entry)*22:0),w:photoW,h:photoH,f,scale:photoW/(f.w*b.w)};
 }
 function mistState(s,i){
  const n=cloudSeeds[i],cloud=s.clouds[i],clearing=cloud.clearedAt!==null,t=clearing?clamp((s.age-cloud.clearedAt)/(s.play.reduced?.12:.95)):0,flow=ease(t),idle=s.play.reduced?0:Math.sin(s.age*.6+i*2)*.006;
  return {...n,x:n.x+idle+flow*cloud.direction*(s.play.reduced?.02:.24),y:n.y-flow*(s.play.reduced?0:.045),w:n.w*(1+flow*.22),h:n.h*(1-flow*.18),alpha:.96*(1-flow),flow,clearing,direction:cloud.direction};
 }
 let serial=0;
 function draw(svg,parent,entry){
  const game=kinds[entry.id],uid='wugong-story-'+(++serial),root=svg('g',{},parent),paper=svg('rect',{width:800,height:460,fill:'#dce6dc'},root),world=svg('g',{},root),scene=svg('image',{href:assets[game].scene,preserveAspectRatio:'none'},world),clouds=[],hiker=[];
  const defs=svg('defs',{},root),fade=svg('radialGradient',{id:uid+'-mist'},defs);svg('stop',{offset:'0%','stop-color':'#fffdf2','stop-opacity':.97},fade);svg('stop',{offset:'100%','stop-color':'#ecf1ed','stop-opacity':0},fade);
  if(game==='clouds')for(let i=0;i<cloudSeeds.length;i++){const g=svg('g',{},world),lobes=[[-.24,.07,.27,.33],[-.02,-.08,.32,.46],[.23,.04,.28,.37]].map(([x,y,w,h])=>svg('ellipse',{cx:x,cy:y,rx:w,ry:h,fill:'url(#'+uid+'-mist)'},g));clouds.push({g,lobes});}
  function actor(parent){return [0,1,2].map(i=>{const cell=svg('svg',{overflow:'hidden',viewBox:(i*512)+' 0 512 1024',preserveAspectRatio:'xMidYMax meet'},parent);svg('image',{href:assets.greet.actor,width:1536,height:1024},cell);return cell;});}
  if(game==='greet')hiker.push(...actor(world));
  const front=svg('image',{href:assets[game].front,preserveAspectRatio:'none'},world),cloudFocus=svg('ellipse',{fill:'none',stroke:'#fdf7da','stroke-width':2,'stroke-dasharray':'3 7',opacity:0},root);
  const finder=svg('rect',{fill:'none',stroke:'#fff9df','stroke-width':2,rx:2},root),grid=svg('path',{fill:'none',stroke:'#fff9df','stroke-width':1,opacity:.35},root),shade=svg('rect',{width:800,height:460,fill:'#244637',opacity:0},root),photo=svg('g',{},root),photoPaper=svg('rect',{fill:'#fff9e8',stroke:'#d3c9a8','stroke-width':1},photo),clip=svg('clipPath',{id:uid+'-photo'},defs),clipRect=svg('rect',{},clip),photoCrop=svg('g',{'clip-path':'url(#'+uid+'-photo)'},photo),photoWorld=svg('g',{},photoCrop),photoScene=game==='greet'?svg('image',{href:assets.greet.scene,preserveAspectRatio:'none'},photoWorld):null,photoHiker=game==='greet'?actor(photoWorld):[],caption=svg('text',{'text-anchor':'middle',fill:'#5a7056','font-size':13},photo),flash=svg('rect',{width:800,height:460,fill:'#fffbe8',opacity:0},root),seal=svg('rect',{fill:'none',stroke:'#fff8e6','stroke-width':20,opacity:0},root),note=svg('text',{x:400,y:230,'text-anchor':'middle',fill:'#4e6948','font-size':13},root);
  const refs={mini:true,wugong:true,story:true,game,svg,parent,root,paper,world,scene,clouds,hiker,front,cloudFocus,finder,grid,shade,photo,photoPaper,clipRect,photoWorld,photoScene,photoHiker,caption,flash,seal,note,aspect:game==='greet'?16/9:1.5,height:460,disposed:false,renderer:null,latest:null};
  scene.addEventListener('error',()=>{if(!refs.disposed)note.textContent='画作暂未加载，可以退出后重试。';});parent.setAttribute('viewBox','0 0 800 460');return refs;
 }
 function attrs(node,values){if(node)for(const [k,v]of Object.entries(values))node.setAttribute(k,v);}
 function paintActor(nodes,s,b,pose=poseAt(s),actorX=s.actor.x){const h=b.h*.88,w=h*.5;nodes.forEach((node,i)=>attrs(node,{x:b.x+b.w*actorX-w/2,y:b.y+b.h*.94-h,width:w,height:h,opacity:Math.max(0,1-Math.abs(i-pose))}));}
 function paintFallback(refs,s){
  if(refs.disposed||!s)return;refs.latest=s;const H=refs.height||460,b=bounds(H,refs.aspect),v=sample(s),showPhoto=s.game==='greet'&&!!s.capture&&['review','reply','farewell'].includes(s.stage),camera=s.game==='greet'&&s.stage==='camera';
  refs.parent.setAttribute('viewBox','0 0 800 '+H);attrs(refs.paper,{height:H});attrs(refs.scene,{x:b.x,y:b.y,width:b.w,height:b.h});attrs(refs.front,{x:b.x-b.w*.04,y:b.y+b.h*.78,width:b.w*1.08,height:b.h*.28,opacity:s.game==='clouds'?.7:.3});
  refs.clouds.forEach(({g,lobes},i)=>{const m=mistState(s,i);attrs(g,{transform:'translate('+(b.x+m.x*b.w)+' '+(b.y+m.y*b.h)+') scale('+(m.w*b.w)+' '+(m.h*b.h)+')',opacity:m.alpha});lobes.forEach((node,j)=>attrs(node,{transform:'translate('+(m.direction*m.flow*(j-1)*.20)+' '+(-m.flow*Math.abs(j-1)*.1)+')'}));});
  if(s.game==='greet')paintActor(refs.hiker,s,b);
  const focused=s.game==='clouds'&&s.keyboard&&s.clouds[s.cloudCursor]?.clearedAt===null?mistState(s,s.cloudCursor):null;attrs(refs.cloudFocus,{cx:focused?b.x+focused.x*b.w:0,cy:focused?b.y+focused.y*b.h:0,rx:focused?focused.w*b.w*.35:0,ry:focused?focused.h*b.h*.35:0,opacity:focused?.8:0});
  const f=cameraFrame(s.camera);attrs(refs.finder,{x:b.x+f.x*b.w,y:b.y+f.y*b.h,width:f.w*b.w,height:f.h*b.h,opacity:camera?1:0});
  const grid=[];for(let i=1;i<3;i++){const x=b.x+(f.x+f.w*i/3)*b.w,y=b.y+(f.y+f.h*i/3)*b.h;grid.push('M'+x+' '+(b.y+f.y*b.h)+'v'+f.h*b.h,'M'+(b.x+f.x*b.w)+' '+y+'h'+f.w*b.w);}attrs(refs.grid,{d:grid.join(' '),opacity:camera?.3:0});
  attrs(refs.shade,{height:H,opacity:showPhoto?(s.stage==='review'?.28:.06):0});attrs(refs.photo,{opacity:showPhoto?1:0});
  if(showPhoto){const p=photoRect(s,b);attrs(refs.photoPaper,{x:p.x-14,y:p.y-14,width:p.w+28,height:p.h+52});attrs(refs.clipRect,{x:p.x,y:p.y,width:p.w,height:p.h});attrs(refs.photoWorld,{transform:'translate('+(p.x-(b.x+p.f.x*b.w)*p.scale)+' '+(p.y-(b.y+p.f.y*b.h)*p.scale)+') scale('+p.scale+')'});attrs(refs.photoScene,{x:b.x,y:b.y,width:b.w,height:b.h});paintActor(refs.photoHiker,s,b,s.capture.pose,s.capture.actorX);attrs(refs.caption,{x:p.x+p.w/2,y:p.y+p.h+27});refs.caption.textContent=s.capture.ok?'草甸风口 · 风刚好经过':'再给人物与远山留一点空间';}
  const shutter=s.events.filter(e=>e.type==='shutter').at(-1),age=shutter?s.age-shutter.age:10;attrs(refs.flash,{height:H,opacity:!s.play.reduced&&age<.16?(1-age/.16)*.68:0});attrs(refs.seal,{x:12,y:12,width:776,height:H-24,opacity:v.paper});attrs(refs.note,{y:H*.5});
 }
 // A small, shared, grainy opacity texture keeps drifting mist soft without rebuilding geometry each frame.
 function mistTexture(P){
  const canvas=globalThis.document?.createElement('canvas'),ctx=canvas?.getContext?.('2d');if(!ctx)return null;canvas.width=256;canvas.height=128;
  const data=ctx.createImageData(256,128),lobes=[[.2,.57,.19,.26],[.40,.43,.23,.29],[.61,.52,.23,.25],[.81,.53,.17,.23]];
  for(let y=0;y<128;y++)for(let x=0;x<256;x++){const u=x/255,v=y/127;let field=0;for(const [cx,cy,rx,ry]of lobes)field+=Math.exp(-((u-cx)**2/(rx*rx)+(v-cy)**2/(ry*ry))*2);const grain=.90+.05*Math.sin(x*1.7+y*2.9)+.05*Math.sin(x*.21-y*.37),a=clamp((field-.10)*1.2)*grain,at=(y*256+x)*4;data.data[at]=248+Math.round(grain*5);data.data[at+1]=248+Math.round(grain*4);data.data[at+2]=237+Math.round(grain*7);data.data[at+3]=Math.round(a*255);}
  ctx.putImageData(data,0,0);return P.Texture.from(canvas,true);
 }
 function createScene(P,app,game){
  const root=new P.Container(),world=new P.Container(),back=new P.Container(),mist=new P.Container(),actor=new P.Container(),front=new P.Container(),finder=new P.Graphics(),shade=new P.Graphics(),photo=new P.Container(),photoPaper=new P.Graphics(),photoCrop=new P.Container(),photoWorld=new P.Container(),photoMask=new P.Graphics(),effects=new P.Graphics(),seal=new P.Graphics();
  world.addChild(back,mist,actor,front);root.addChild(world,finder,shade,photo,effects,seal);photo.addChild(photoPaper,photoCrop,photoMask);photoCrop.addChild(photoWorld);photoCrop.mask=photoMask;root.eventMode='none';app.stage.addChild(root);
  let scene=null,photoScene=null,grass=null,last=null,aspect=game==='greet'?16/9:1.5,disposed=false;
  const textures=[],frames=[],poses=[],photoPoses=[],clouds=[];
  let cloudTexture=null;
  if(game==='clouds'){
   cloudTexture=mistTexture(P);if(cloudTexture)textures.push(cloudTexture);
   for(let i=0;i<cloudSeeds.length;i++){
    const group=new P.Container(),wisps=[];
    for(let j=0;j<4;j++){const node=cloudTexture?new P.Sprite(cloudTexture):new P.Graphics().ellipse(0,0,140,45).fill({color:0xfffbed,alpha:.8});if(cloudTexture)node.anchor.set(.5);group.addChild(node);wisps.push(node);}mist.addChild(group);clouds.push({group,wisps});
   }
  }
  function paintPoses(list,s,b,pose=poseAt(s),actorX=s.actor.x){for(const [i,node]of list.entries()){node.position.set(b.x+b.w*actorX,b.y+b.h*.94);node.scale.set(b.h*.88/node.texture.height);node.alpha=Math.max(0,1-Math.abs(i-pose));}}
  async function install(kind,entry){
   if(disposed||entry?.state!=='ready')return;const texture=P.Texture.from(entry.image,true);textures.push(texture);let installed;
   if(kind==='scene'){aspect=texture.width/texture.height;scene=new P.Sprite(texture);back.addChild(scene);installed=scene;if(game==='greet'){photoScene=new P.Sprite(texture);photoWorld.addChild(photoScene);}}
   else if(kind==='actor'&&game==='greet'){
    for(let i=0;i<3;i++){const start=Math.round(i*texture.width/3),end=Math.round((i+1)*texture.width/3),t=new P.Texture({source:texture.source,frame:new P.Rectangle(start,0,end-start,texture.height)});frames.push(t);const node=new P.Sprite(t),copy=new P.Sprite(t);node.anchor.set(.5,1);copy.anchor.set(.5,1);actor.addChild(node);photoWorld.addChild(copy);poses.push(node);photoPoses.push(copy);}installed=actor;
   }else if(kind==='front'){grass=new P.MeshPlane({texture,verticesX:24,verticesY:6});grass.base=new Float32Array(grass.geometry.positions);front.addChild(grass);installed=grass;}
   if(installed){installed.visible=false;await Promise.resolve(app.renderer.prepare?.upload(installed)).catch(()=>{});if(!disposed){installed.visible=true;if(last)paint(last);}}
  }
  function paint(s){
   if(disposed)return;last=s;const H=app.screen?.height||460,b=bounds(H,aspect),v=sample(s),t=s.play.reduced?0:s.play.complete?s.play.completedAt:s.age,showPhoto=game==='greet'&&!!s.capture&&['review','reply','farewell'].includes(s.stage),camera=game==='greet'&&s.stage==='camera';
   if(scene){scene.position.set(b.x,b.y);scene.scale.set(b.w/scene.texture.width);}
   if(game==='clouds'){
    clouds.forEach(({group,wisps},i)=>{const m=mistState(s,i);group.position.set(b.x+m.x*b.w,b.y+m.y*b.h);group.alpha=m.alpha;wisps.forEach((node,j)=>{const split=j?m.flow:1-m.flow;node.visible=split>0;node.alpha=j?split*.55:split;const size=j?.40:1;node.position.set(m.direction*m.flow*(j-1)*b.w*.075,-m.flow*(j%2)*b.h*.035);if(cloudTexture){node.width=m.w*b.w*size;node.height=m.h*b.h*size;}else node.scale.set(m.w*b.w/280*size,m.h*b.h/90*size);});});
    finder.clear();if(s.keyboard&&s.clouds[s.cloudCursor]?.clearedAt===null){const m=mistState(s,s.cloudCursor);finder.ellipse(b.x+m.x*b.w,b.y+m.y*b.h,m.w*b.w*.35,m.h*b.h*.35).stroke({color:0xfff7d9,width:2,alpha:.8});}
   }else{
    paintPoses(poses,s,b);finder.clear();
    if(camera){const f=cameraFrame(s.camera),x=b.x+f.x*b.w,y=b.y+f.y*b.h,w=f.w*b.w,h=f.h*b.h;finder.rect(b.x,b.y,b.w,y-b.y).rect(b.x,y+h,b.w,b.y+b.h-y-h).rect(b.x,y,x-b.x,h).rect(x+w,y,b.x+b.w-x-w,h).fill({color:0x183b2e,alpha:.31});finder.rect(x,y,w,h).stroke({color:0xfff5d7,width:2,alpha:.95});for(let i=1;i<3;i++){finder.moveTo(x+w*i/3,y).lineTo(x+w*i/3,y+h).moveTo(x,y+h*i/3).lineTo(x+w,y+h*i/3);}finder.stroke({color:0xfff6dd,width:1,alpha:.24});}
   }
   if(grass){grass.scale.set(b.w*1.08/grass.texture.width);grass.position.set(b.x-b.w*.04,b.y+b.h*.80);grass.alpha=game==='clouds'?.65:.23;W?.deform(grass.geometry.positions,grass.base,grass.texture.width,grass.texture.height,t,game==='clouds'&&s.events.some(e=>e.type==='cloud-clear'&&s.age-e.age<1)?.65:.24,'grass',s.play.reduced);grass.geometry.getBuffer('aPosition').update();}
   shade.clear();photo.visible=showPhoto;if(showPhoto){
    shade.rect(0,0,800,H).fill({color:0x1f3f30,alpha:s.stage==='review'?.31:.06});const p=photoRect(s,b);photoPaper.clear().rect(p.x-15,p.y-15,p.w+30,p.h+52).fill(0xfff8e7).stroke({color:0xd4c7a8,width:1,alpha:.8});photoMask.clear().rect(p.x,p.y,p.w,p.h).fill(0xffffff);photoWorld.scale.set(p.scale);photoWorld.position.set(p.x-(b.x+p.f.x*b.w)*p.scale,p.y-(b.y+p.f.y*b.h)*p.scale);
    if(photoScene){photoScene.position.set(b.x,b.y);photoScene.scale.set(b.w/photoScene.texture.width);}paintPoses(photoPoses,s,b,s.capture.pose,s.capture.actorX);
   }
   effects.clear();if(game==='clouds'&&!s.play.reduced){for(const e of s.events.filter(e=>e.type==='cloud-clear'&&s.age-e.age<.65)){const q=clamp((s.age-e.age)/.65),dir=e.x<.5?-1:1,x=b.x+(e.x+dir*q*.18)*b.w,y=b.y+e.y*b.h;for(let j=0;j<3;j++)effects.moveTo(x-dir*b.w*.025,y+(j-1)*b.h*.02).quadraticCurveTo(x,y-b.h*.012+(j-1)*b.h*.02,x+dir*b.w*.025,y+(j-1)*b.h*.02);effects.stroke({color:0xfff9e9,width:1.3,alpha:(1-q)*.48});}}
   const shutter=s.events.filter(e=>e.type==='shutter').at(-1),since=shutter?s.age-shutter.age:10;if(!s.play.reduced&&since<.16)effects.rect(0,0,800,H).fill({color:0xfff9e8,alpha:(1-since/.16)*.68});
   seal.clear();if(v.paper){seal.rect(0,0,800,H).fill({color:0xfff7e4,alpha:v.paper*.1});seal.rect(12,12,776,H-24).stroke({color:0xfff8e6,width:24*v.paper,alpha:v.paper});}
  }
  function dispose(){if(disposed)return;disposed=true;root.destroy({children:true});for(const texture of frames)texture.destroy(false);for(const texture of textures)texture.destroy(true);}
  return {root,install,paint,dispose,get ready(){return !!scene?.visible&&(game!=='greet'||poses.length===3&&actor.visible);},get aspect(){return aspect;}};
 }
 return {kinds,assets,prompts,results,cloudSeeds,create,input,release,tick,finishDuration,sample,controls,cameraFrame,judgePhoto,mistState,bounds,draw,paintFallback,createScene};
}));
