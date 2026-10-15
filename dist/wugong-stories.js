(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./wind-scene.js'):root.TrailWindScene);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailWugongStories=api;}(typeof globalThis!=='undefined'?globalThis:this,function(W){
 'use strict';
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(n)?n:a));
 const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
 const kinds={'meadow-butterfly':'clouds','wugong-wind-hiker':'greet'};
 const assets={
  clouds:{scene:'scenes/wugong-cloudsea-v1.webp',front:'sprites/wugong-meadow-grass-v1.webp'},
  greet:{scene:'scenes/wugong-v1.webp',actor:'sprites/wugong-hiker-wave-v1.webp',front:'sprites/wugong-meadow-grass-v1.webp'}
 };
 const prompts={clouds:'沿谷地点选或连线，从来风口接到远谷出口，再点「送出这阵风」。高脊会挡风，洼地会让风打转。方向键移动光标，空格选点，Enter 送风；可以撤回重画。',greet:'走近和她聊两句，再帮她拍张照。拖动取景框，让她和身后的山一起入镜，按快门后可以重拍。方向键取景，＋／－调整远近，空格拍照。'};
 const results={clouds:'我沿着山坳画了一条风路。雾顺着谷地散开，草脊浮出云海，像一封慢慢打开的信。',greet:'草甸风口遇见一位笑着招手的姑娘。我帮她把身后的山也拍进照片，给她看过后，在风里说了再见。'};
 // These are locations on the painted landscape, not a timed sequence of targets.
 const nodes=[
  {x:.09,y:.55,label:'来风口',terrain:'inlet',next:[1,2]},
  {x:.27,y:.65,label:'低谷',terrain:'valley',next:[0,3,8]},
  {x:.28,y:.38,label:'高脊',terrain:'ridge',next:[0,4]},
  {x:.46,y:.56,label:'山坳',terrain:'valley',next:[1,4,5]},
  {x:.55,y:.29,label:'脊顶',terrain:'ridge',next:[2,3,6]},
  {x:.65,y:.61,label:'背风谷',terrain:'valley',next:[3,6,7,8]},
  {x:.78,y:.39,label:'高脊',terrain:'ridge',next:[4,5,7]},
  {x:.90,y:.52,label:'远谷出口',terrain:'outlet',next:[5,6]},
  {x:.46,y:.77,label:'洼地',terrain:'hollow',next:[1,5]}
 ];
 const cloudSeeds=[{x:.25,y:.44,w:.42,h:.25},{x:.51,y:.38,w:.40,h:.24},{x:.77,y:.45,w:.40,h:.25},{x:.42,y:.64,w:.46,h:.23},{x:.77,y:.70,w:.48,h:.23}];
 function create(entry,{reduced=false}={}){
  const game=kinds[entry.id];return {
   id:entry.id,route:entry.route,kind:entry.interaction,game,age:0,acted:false,gesture:'look',dragging:false,done:false,x:game==='clouds'?.09:.45,y:.55,
   actor:{x:.60,y:.91,vx:0,vy:0},control:{x:.45,y:.5},play:{type:'minigame',progress:0,complete:false,completedAt:null,reduced},
   gates:0,serial:0,events:[],near:false,stage:game==='clouds'?'plan':'meet',stageAt:0,path:[0],pointer:null,flight:null,attempts:0,
   camera:{x:.45,y:.47,zoom:1},capture:null,shots:0,feedback:game==='clouds'?'从来风口出发，试着给风找一条顺着谷地走的路。':'她在草坡旁停下脚步，笑着朝你招了招手。'
  };
 }
 function copy(s){return {...s,actor:{...s.actor},control:{...s.control},play:{...s.play},camera:{...s.camera},events:s.events.slice(),path:s.path.slice(),pointer:s.pointer&&{...s.pointer}};}
 function event(s,type,x=.5,y=.5){s.serial++;s.events.push({serial:s.serial,type,x,y,age:s.age,index:s.gates});s.events=s.events.slice(-16);}
 function stage(s,value){s.stage=value;s.stageAt=s.age;}
 function complete(s){if(s.play.complete)return;s.gates=1;s.play.progress=1;s.play.complete=true;s.play.completedAt=s.age;event(s,'complete');}
 function nearest(p){let index=-1,d=.09;nodes.forEach((node,i)=>{const n=Math.hypot(node.x-p.x,(node.y-p.y)*.8);if(n<d){index=i;d=n;}});return index;}
 function choose(s,index){
  if(index<0)return;const tail=s.path.at(-1);
  if(index===tail)return;
  if(s.path.length>1&&index===s.path.at(-2)){s.path.pop();s.feedback='退回了一处，换个方向试试。';event(s,'wind-point',nodes[index].x,nodes[index].y);return;}
  if(!nodes[tail].next.includes(index)){s.feedback='风路要连着走，先接上邻近的山坳。';return;}
  if(s.path.includes(index)){s.feedback='风绕回原处了，试着把它送向远谷。';return;}
  s.path.push(index);s.feedback=nodes[index].terrain==='outlet'?'已接到远谷。送出这阵风，看看云会怎样走。':'接上了'+nodes[index].label+'，继续连向远谷。';event(s,'wind-point',nodes[index].x,nodes[index].y);
 }
 function windRoute(path){
  for(let i=1;i<path.length;i++){
   if(!nodes[path[i-1]]?.next.includes(path[i]))return {ok:false,fault:i,reason:'这两处没有连通，风路在这里断开了。'};
   const terrain=nodes[path[i]].terrain;
   if(terrain==='ridge')return {ok:false,fault:i,reason:'风撞上了高脊，雾堆在山前。撤回这一步，沿低处的山坳试试。'};
   if(terrain==='hollow')return {ok:false,fault:i,reason:'风在洼地里打转，云没有散开。试着让它穿过山坳。'};
  }
  if(path.at(-1)!==7)return {ok:false,fault:path.length-1,reason:'风停在了半路。把谷地连到远谷出口，再送一次风。'};
  return {ok:true,fault:path.length-1,reason:''};
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
  if(s.game==='clouds'){
   if(s.flight)return state;
   const action=p.action||(p.assist?'choose':'');
   if(action==='undo'){if(s.path.length>1)s.path.pop();s.feedback='风路退回一步，沿谷地重新接上。';event(s,'wind-point',nodes[s.path.at(-1)].x,nodes[s.path.at(-1)].y);}
   else if(action==='clear'){s.path=[0];s.pointer=null;s.feedback='从来风口重新出发。风喜欢顺着山坳走。';}
   else if(action==='send'){
    if(s.path.length<2){s.feedback='先从来风口接出一段风路。';return s;}
    const route=windRoute(s.path);s.flight={...route,path:s.path.slice(),startedAt:s.age,duration:Math.max(.6,(route.fault+.5)*(s.play.reduced?.22:.8))};s.windPassed=0;s.attempts++;stage(s,'flow');s.feedback='风出发了，看看它怎样穿过山谷。';event(s,'wind-send',nodes[0].x,nodes[0].y);
   }else{
    const q={x:clamp(p.x??s.x),y:clamp(p.y??s.y)};s.x=q.x;s.y=q.y;s.control=q;
    if(!p.key){
     const from=mode==='move'&&s.pointer?s.pointer:q,n=Math.max(1,Math.ceil(Math.hypot(q.x-from.x,q.y-from.y)/.025));
     for(let i=1;i<=n;i++)choose(s,nearest({x:from.x+(q.x-from.x)*i/n,y:from.y+(q.y-from.y)*i/n}));s.pointer=q;
    }
   }
   s.play.progress=Math.min(.42,(s.path.length-1)*.09);return s;
  }
  const action=p.action||(p.assist?(s.stage==='camera'?'shutter':s.stage==='review'&&!s.capture?.ok?'retake':'advance'):'');
  if(action==='retake'&&s.stage==='review'){s.capture=null;stage(s,'camera');s.feedback='再取一次景吧。她还在草坡旁等你。';event(s,'frame',s.camera.x);}
  else if(action==='zoom-in'&&s.stage==='camera')moveCamera(s,{zoom:s.camera.zoom+.12});
  else if(action==='zoom-out'&&s.stage==='camera')moveCamera(s,{zoom:s.camera.zoom-.12});
  else if(action==='shutter'&&s.stage==='camera'){
   const quality=judgePhoto(s);s.capture={...s.camera,...quality,pose:poseAt(s),clock:s.age,actorX:s.actor.x};s.shots++;stage(s,'review');s.feedback=quality.reason;event(s,'shutter',s.actor.x,.22);
  }else if(action==='advance'&&mode!=='move'){
   if(s.stage==='meet'){stage(s,'request');s.feedback='“能帮我把身后的山也拍进去吗？这里的风太舒服了。”';event(s,'hello',s.actor.x);}
   else if(s.stage==='request'){stage(s,'camera');s.feedback='把她和远山一起放进取景框，选一个你喜欢的瞬间。';event(s,'offer',s.actor.x);}
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
  if(s.game==='clouds'&&s.flight){
   const f=s.flight,elapsed=s.age-f.startedAt,ratio=clamp(elapsed/f.duration);s.play.progress=.42+ratio*.48;
   const passed=Math.floor(ratio*f.fault);if(passed>(s.windPassed||0)){s.windPassed=passed;const n=nodes[f.path[passed]];event(s,'wind-turn',n.x,n.y);}
   if(elapsed>=f.duration){
    if(f.ok){s.feedback='风顺着山坳远去了，草脊从云海里浮了出来。';complete(s);}
    else{s.feedback=f.reason;const n=nodes[f.path[f.fault]];event(s,'wind-blocked',n.x,n.y);s.flight=null;stage(s,'plan');s.play.progress=.22;}
   }
  }
  if(s.game==='greet'&&s.stage==='farewell'&&s.age-s.stageAt>(s.play.reduced?.3:1.45))complete(s);
  return s;
 }
 function finishDuration(s){return s.play.reduced?.45:2.7;}
 function controls(s){
  if(s.play.complete||s.stage==='farewell')return {speaker:'',line:s.feedback,primary:null,secondary:null};
  if(s.game==='clouds')return {speaker:s.flight?'风正在穿过山坳':'给风画一条路',line:s.flight?'云会跟着风流动。':s.feedback,primary:{action:'send',label:s.flight?'风在路上…':'送出这阵风',disabled:!!s.flight||s.path.length<2},secondary:{action:'undo',label:'撤回一步',disabled:!!s.flight||s.path.length<2},clear:true};
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
  const flight=s.flight?clamp((s.age-s.flight.startedAt)/s.flight.duration):s.play.complete?1:0;
  return {phase,ending,paper:s.play.complete?(s.play.reduced?1:ease((ending-1.25)/.9)):0,flight,
   stage:s.game==='clouds'?(s.flight?'风穿云隙':'沿谷地，为风引路'):({meet:'草甸风口的邂逅',request:'借你一双看山的眼睛',camera:'把她和远山一起留下',review:'先看看刚才那张照片',reply:'把照片给她看看',farewell:'下次山里见'})[s.stage],
   count:s.play.complete?1:0,total:1,unit:s.game==='clouds'?'条风路':'次相遇',counter:s.game==='clouds'?(s.flight?'风在路上':s.path.at(-1)===7?'已连到远谷':'风路 '+(s.path.length-1)+' 段'):(s.stage==='camera'?'取景中':s.stage==='review'?'第 '+s.shots+' 张':'风口相遇'),
   hold:s.play.progress,cue:s.feedback,title:s.game==='clouds'?'让风穿过云的缝隙':'在草甸的风里，遇见她',kicker:s.game==='clouds'?'武功山 · 云海开信':'武功山 · 吊带追风',invitation:s.game==='clouds'?'沿着山坳，给云一条去往远方的路。':'她停下脚步，笑着朝你招了招手。',controls:controls(s),story:true
  };
 }
 function bounds(height=460,aspect=1.5){const w=Math.min(800,height*.94*aspect),h=w/aspect;return {x:(800-w)/2,y:(height-h)/2,w,h};}
 function position(b,p){return {x:b.x+p.x*b.w,y:b.y+p.y*b.h};}
 function photoRect(s,b){
  const f=cameraFrame(s.capture||s.camera),w=Math.min(b.w*.79,b.h*1.27),h=w*f.h/f.w/(16/9),entry=s.play.reduced?1:ease((s.age-s.stageAt)/.45);
  const shift=s.stage==='review'?0:s.stage==='farewell'?1:entry,shown=1-.42*shift,photoW=w*shown,photoH=h*shown,fromX=400-w/2,fromY=b.y+(b.h-h)/2;
  return {x:fromX+(b.x+b.w*.04-fromX)*shift,y:fromY+(b.y+b.h*.48-fromY)*shift+(s.stage==='review'?(1-entry)*22:0),w:photoW,h:photoH,f,scale:photoW/(f.w*b.w)};
 }
 function windPoint(s){
  if(!s.flight)return nodes[s.path.at(-1)];const f=s.flight,q=sample(s).flight*f.fault,i=Math.min(f.fault-1,Math.floor(q)),u=clamp(q-i),a=nodes[f.path[Math.max(0,i)]],b=nodes[f.path[Math.min(f.fault,i+1)]];return {x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u};
 }
 function mistState(s,i){
  const n=cloudSeeds[i],f=sample(s),path=s.flight?.path||s.path;
  let arrive=.2+i*.12,best=Infinity;
  path.forEach((idx,j)=>{const d=Math.hypot(nodes[idx].x-n.x,nodes[idx].y-n.y);if(d<best){best=d;arrive=Math.max(.08,j/Math.max(1,path.length-1)-.18);}});
  const clear=s.play.complete?1:s.flight?.ok?ease((f.flight-arrive)/.35):0,blocked=s.events.filter(e=>e.type==='wind-blocked').at(-1),fault=s.flight&&!s.flight.ok?nodes[s.flight.path[s.flight.fault]]:blocked&&s.age-blocked.age<.8?blocked:null;
  const pile=fault?clamp(1-Math.hypot(n.x-fault.x,n.y-fault.y)/.48)*(s.flight?ease((f.flight-.45)/.55):1-(s.age-blocked.age)/.8):0;
  return {...n,x:n.x+clear*.10+(fault?(fault.x-n.x)*pile*.35:0),y:n.y+clear*.12-pile*.035,h:n.h*(1+pile*.35),alpha:Math.min(1,(i<3?.87:.58)*(1-clear*(i<3?.98:.57))+pile*.17)};
 }
 let serial=0;
 function draw(svg,parent,entry){
  const game=kinds[entry.id],uid='wugong-story-'+(++serial),root=svg('g',{},parent),paper=svg('rect',{width:800,height:460,fill:'#dce6dc'},root),world=svg('g',{},root),scene=svg('image',{href:assets[game].scene,preserveAspectRatio:'none'},world),clouds=[],hiker=[],nodeViews=[];
  const defs=svg('defs',{},root),fade=svg('radialGradient',{id:uid+'-mist'},defs);svg('stop',{offset:'0%','stop-color':'#fffdf2','stop-opacity':.97},fade);svg('stop',{offset:'100%','stop-color':'#ecf1ed','stop-opacity':0},fade);
  if(game==='clouds')for(let i=0;i<5;i++)clouds.push(svg('ellipse',{fill:'url(#'+uid+'-mist)'},world));
  function actor(parent){return [0,1,2].map(i=>{const cell=svg('svg',{overflow:'hidden',viewBox:(i*512)+' 0 512 1024',preserveAspectRatio:'xMidYMax meet'},parent);svg('image',{href:assets.greet.actor,width:1536,height:1024},cell);return cell;});}
  if(game==='greet')hiker.push(...actor(world));
  const front=svg('image',{href:assets[game].front,preserveAspectRatio:'none'},world),guide=svg('path',{fill:'none',stroke:'#fff9df','stroke-width':1,opacity:.42},root),path=svg('path',{fill:'none',stroke:'#fff1bf','stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round'},root),dot=svg('circle',{r:7,fill:'#fff9df',stroke:'#7a966c','stroke-width':2},root);
  if(game==='clouds')for(const node of nodes){const g=svg('g',{},root),pin=svg('circle',{r:9,fill:'#fffae8',stroke:'#768667','stroke-width':1.5},g),label=svg('text',{y:25,'text-anchor':'middle',fill:'#355549','font-size':13,'paint-order':'stroke',stroke:'#fffaec','stroke-width':3},g);label.textContent=node.label;nodeViews.push({g,pin,label});}
  const finder=svg('rect',{fill:'none',stroke:'#fff9df','stroke-width':2,rx:2},root),grid=svg('path',{fill:'none',stroke:'#fff9df','stroke-width':1,opacity:.35},root),shade=svg('rect',{width:800,height:460,fill:'#244637',opacity:0},root),photo=svg('g',{},root),photoPaper=svg('rect',{fill:'#fff9e8',stroke:'#d3c9a8','stroke-width':1},photo),clip=svg('clipPath',{id:uid+'-photo'},defs),clipRect=svg('rect',{},clip),photoCrop=svg('g',{'clip-path':'url(#'+uid+'-photo)'},photo),photoWorld=svg('g',{},photoCrop),photoScene=game==='greet'?svg('image',{href:assets.greet.scene,preserveAspectRatio:'none'},photoWorld):null,photoHiker=game==='greet'?actor(photoWorld):[],caption=svg('text',{'text-anchor':'middle',fill:'#5a7056','font-size':13},photo),flash=svg('rect',{width:800,height:460,fill:'#fffbe8',opacity:0},root),seal=svg('rect',{fill:'none',stroke:'#fff8e6','stroke-width':20,opacity:0},root),note=svg('text',{x:400,y:230,'text-anchor':'middle',fill:'#4e6948','font-size':13},root);
  const refs={mini:true,wugong:true,story:true,game,svg,parent,root,paper,world,scene,clouds,hiker,front,guide,path,dot,nodeViews,finder,grid,shade,photo,photoPaper,clipRect,photoWorld,photoScene,photoHiker,caption,flash,seal,note,aspect:game==='greet'?16/9:1.5,height:460,disposed:false,renderer:null,latest:null};
  scene.addEventListener('error',()=>{if(!refs.disposed)note.textContent='画作暂未加载，可以退出后重试。';});parent.setAttribute('viewBox','0 0 800 460');return refs;
 }
 function attrs(node,values){if(node)for(const [k,v]of Object.entries(values))node.setAttribute(k,v);}
 function paintActor(nodes,s,b,pose=poseAt(s),actorX=s.actor.x){const h=b.h*.88,w=h*.5;nodes.forEach((node,i)=>attrs(node,{x:b.x+b.w*actorX-w/2,y:b.y+b.h*.94-h,width:w,height:h,opacity:Math.max(0,1-Math.abs(i-pose))}));}
 function pathData(s,b){return s.path.map((index,i)=>{const p=position(b,nodes[index]);return (i?'L':'M')+p.x+' '+p.y;}).join(' ');}
 function paintFallback(refs,s){
  if(refs.disposed||!s)return;refs.latest=s;const H=refs.height||460,b=bounds(H,refs.aspect),v=sample(s),showPhoto=s.game==='greet'&&!!s.capture&&['review','reply','farewell'].includes(s.stage),camera=s.game==='greet'&&s.stage==='camera';
  refs.parent.setAttribute('viewBox','0 0 800 '+H);attrs(refs.paper,{height:H});attrs(refs.scene,{x:b.x,y:b.y,width:b.w,height:b.h});attrs(refs.front,{x:b.x-b.w*.04,y:b.y+b.h*.78,width:b.w*1.08,height:b.h*.28,opacity:s.game==='clouds'?.7:.3});
  refs.clouds.forEach((node,i)=>{const m=mistState(s,i);attrs(node,{cx:b.x+m.x*b.w,cy:b.y+m.y*b.h,rx:m.w*b.w/2,ry:m.h*b.h/2,opacity:m.alpha});});
  if(s.game==='greet')paintActor(refs.hiker,s,b);
  attrs(refs.path,{d:pathData(s,b),opacity:s.game==='clouds'&&!s.play.complete?.9:0});
  const uiScale=clamp(800/(refs.parent.getBoundingClientRect?.().width||800),1,2),links=[];nodes.forEach((n,i)=>n.next.filter(j=>j>i).forEach(j=>{const a=position(b,n),c=position(b,nodes[j]);links.push('M'+a.x+' '+a.y+'L'+c.x+' '+c.y);}));attrs(refs.guide,{d:links.join(' '),opacity:s.game==='clouds'&&!s.play.complete?.4:0});
  refs.nodeViews.forEach(({g,pin,label},i)=>{const p=position(b,nodes[i]);attrs(g,{transform:'translate('+p.x+' '+p.y+')',opacity:s.play.complete?0:s.flight?.25:1});attrs(pin,{fill:s.path.includes(i)?'#ebcf8e':'#fff9e9',r:(i===s.path.at(-1)?11:8)*uiScale});attrs(label,{y:17*uiScale,'font-size':13*uiScale});});
  const cursor=position(b,s.flight?windPoint(s):{x:s.x,y:s.y});attrs(refs.dot,{cx:cursor.x,cy:cursor.y,opacity:s.game==='clouds'&&!s.play.complete?1:0});
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
  const root=new P.Container(),world=new P.Container(),back=new P.Container(),mist=new P.Container(),actor=new P.Container(),front=new P.Container(),guide=new P.Graphics(),route=new P.Graphics(),pins=new P.Container(),finder=new P.Graphics(),shade=new P.Graphics(),photo=new P.Container(),photoPaper=new P.Graphics(),photoCrop=new P.Container(),photoWorld=new P.Container(),photoMask=new P.Graphics(),effects=new P.Graphics(),seal=new P.Graphics();
  world.addChild(back,mist,actor,front);root.addChild(world,guide,route,pins,finder,shade,photo,effects,seal);photo.addChild(photoPaper,photoCrop,photoMask);photoCrop.addChild(photoWorld);photoCrop.mask=photoMask;root.eventMode='none';app.stage.addChild(root);
  let scene=null,photoScene=null,grass=null,last=null,aspect=game==='greet'?16/9:1.5,disposed=false,pathKey='';
  const textures=[],frames=[],poses=[],photoPoses=[],clouds=[],nodeViews=[],motes=[];
  let cloudTexture=null;
  if(game==='clouds'){
   cloudTexture=mistTexture(P);if(cloudTexture)textures.push(cloudTexture);
   for(let i=0;i<5;i++){const node=cloudTexture?new P.Sprite(cloudTexture):new P.Graphics().ellipse(0,0,140,45).fill({color:0xfffbed,alpha:.8});if(cloudTexture)node.anchor.set(.5);mist.addChild(node);clouds.push(node);}
   for(const n of nodes){const g=new P.Container(),pin=new P.Graphics(),label=new P.Text({text:n.label,style:{fontFamily:'serif',fontSize:13,fill:0x304e40,stroke:{color:0xfffae9,width:3},align:'center'}});label.anchor.set(.5,0);label.y=15;g.addChild(pin,label);pins.addChild(g);nodeViews.push({g,pin,label});}
   for(let i=0;i<14;i++){const node=new P.Graphics().ellipse(0,0,3.4,1).fill({color:0xfff3cb,alpha:.9});root.addChildAt(node,3);motes.push(node);}
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
  function drawRoute(s,b){
   const uiScale=clamp(800/(app.canvas?.getBoundingClientRect?.().width||800),1,2),key=s.path.join(',')+'|'+b.w+'|'+b.h+'|'+uiScale;if(key===pathKey)return;pathKey=key;route.clear();guide.clear();
   nodes.forEach((n,i)=>n.next.filter(j=>j>i).forEach(j=>{const a=position(b,n),c=position(b,nodes[j]);guide.moveTo(a.x,a.y).lineTo(c.x,c.y);}));guide.stroke({color:0xfff9dd,width:1,alpha:.38});
   s.path.forEach((idx,i)=>{const p=position(b,nodes[idx]);i?route.lineTo(p.x,p.y):route.moveTo(p.x,p.y);});if(s.path.length>1)route.stroke({color:0xfff0b9,width:3,alpha:.95,cap:'round',join:'round'});
   nodeViews.forEach(({g,pin,label},i)=>{const p=position(b,nodes[i]),selected=s.path.includes(i),tail=i===s.path.at(-1);g.position.set(p.x,p.y);label.style.fontSize=13*uiScale;label.y=17*uiScale;pin.clear().circle(0,0,(tail?12:9)*uiScale).fill({color:selected?0xe8cd91:0xfff8df,alpha:.92}).stroke({color:0x637c60,width:1.5,alpha:.85});if(selected)pin.circle(0,0,3*uiScale).fill(0x516c52);});
  }
  function paint(s){
   if(disposed)return;last=s;const H=app.screen?.height||460,b=bounds(H,aspect),v=sample(s),t=s.play.reduced?0:s.play.complete?s.play.completedAt:s.age,showPhoto=game==='greet'&&!!s.capture&&['review','reply','farewell'].includes(s.stage),camera=game==='greet'&&s.stage==='camera';
   if(scene){scene.position.set(b.x,b.y);scene.scale.set(b.w/scene.texture.width);}
   if(game==='clouds'){
    drawRoute(s,b);guide.visible=!s.play.complete;route.alpha=s.play.complete?0:s.flight?.42:1;pins.alpha=s.play.complete?0:s.flight?.2:1;
    clouds.forEach((node,i)=>{const m=mistState(s,i),drift=s.play.reduced?0:Math.sin(t*.35+i)*.006;node.position.set(b.x+(m.x+drift)*b.w,b.y+m.y*b.h);node.alpha=m.alpha;if(cloudTexture){node.width=m.w*b.w;node.height=m.h*b.h;}else node.scale.set(m.w*b.w/280,m.h*b.h/90);});
    const head=windPoint(s);motes.forEach((node,i)=>{const p=position(b,head),q=s.flight?(i/14+v.flight*2)%1:0;node.visible=!!s.flight&&!s.play.complete&&!s.play.reduced;node.position.set(p.x-q*30,p.y+Math.sin(q*5+i)*5);node.alpha=Math.sin(q*Math.PI)*.85;});
    finder.clear();if(!s.play.complete){const p=position(b,s.flight?head:{x:s.x,y:s.y});finder.circle(p.x,p.y,s.flight?7:5).fill({color:0xfff3c9,alpha:.8}).stroke({color:0x57775b,width:1,alpha:.8});}
   }else{
    paintPoses(poses,s,b);finder.clear();
    if(camera){const f=cameraFrame(s.camera),x=b.x+f.x*b.w,y=b.y+f.y*b.h,w=f.w*b.w,h=f.h*b.h;finder.rect(b.x,b.y,b.w,y-b.y).rect(b.x,y+h,b.w,b.y+b.h-y-h).rect(b.x,y,x-b.x,h).rect(x+w,y,b.x+b.w-x-w,h).fill({color:0x183b2e,alpha:.31});finder.rect(x,y,w,h).stroke({color:0xfff5d7,width:2,alpha:.95});for(let i=1;i<3;i++){finder.moveTo(x+w*i/3,y).lineTo(x+w*i/3,y+h).moveTo(x,y+h*i/3).lineTo(x+w,y+h*i/3);}finder.stroke({color:0xfff6dd,width:1,alpha:.24});}
   }
   if(grass){grass.scale.set(b.w*1.08/grass.texture.width);grass.position.set(b.x-b.w*.04,b.y+b.h*.80);grass.alpha=game==='clouds'?.65:.23;W?.deform(grass.geometry.positions,grass.base,grass.texture.width,grass.texture.height,t,s.flight?.7:.24,'grass',s.play.reduced);grass.geometry.getBuffer('aPosition').update();}
   shade.clear();photo.visible=showPhoto;if(showPhoto){
    shade.rect(0,0,800,H).fill({color:0x1f3f30,alpha:s.stage==='review'?.31:.06});const p=photoRect(s,b);photoPaper.clear().rect(p.x-15,p.y-15,p.w+30,p.h+52).fill(0xfff8e7).stroke({color:0xd4c7a8,width:1,alpha:.8});photoMask.clear().rect(p.x,p.y,p.w,p.h).fill(0xffffff);photoWorld.scale.set(p.scale);photoWorld.position.set(p.x-(b.x+p.f.x*b.w)*p.scale,p.y-(b.y+p.f.y*b.h)*p.scale);
    if(photoScene){photoScene.position.set(b.x,b.y);photoScene.scale.set(b.w/photoScene.texture.width);}paintPoses(photoPoses,s,b,s.capture.pose,s.capture.actorX);
   }
   effects.clear();const shutter=s.events.filter(e=>e.type==='shutter').at(-1),since=shutter?s.age-shutter.age:10;if(!s.play.reduced&&since<.16)effects.rect(0,0,800,H).fill({color:0xfff9e8,alpha:(1-since/.16)*.68});
   seal.clear();if(v.paper){seal.rect(0,0,800,H).fill({color:0xfff7e4,alpha:v.paper*.1});seal.rect(12,12,776,H-24).stroke({color:0xfff8e6,width:24*v.paper,alpha:v.paper});}
  }
  function dispose(){if(disposed)return;disposed=true;root.destroy({children:true});for(const texture of frames)texture.destroy(false);for(const texture of textures)texture.destroy(true);}
  return {root,install,paint,dispose,get ready(){return !!scene?.visible&&(game!=='greet'||poses.length===3&&actor.visible);},get aspect(){return aspect;}};
 }
 return {kinds,assets,prompts,results,nodes,create,input,release,tick,finishDuration,sample,controls,cameraFrame,judgePhoto,windRoute,bounds,draw,paintFallback,createScene};
}));
