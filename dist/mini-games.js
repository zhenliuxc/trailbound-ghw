(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailMiniGames=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
 const kinds={'westlake-floating-leaf':'creek','bamboo-drop':'rain','meadow-bird':'wind'};
 const prompts={creek:'轻点落叶旁的水面，用水纹推它绕过溪石，经过三个金色水口。方向键也能推动；可以随时重试。',rain:'左右拖动竹筒，接住八滴从竹叶落下的雨。接住才会奏响音符；方向键移动，漏接可以继续。',wind:'上下移动纸鸢，借着风穿过三个金色风口。留意风向的变化；方向键也能控制，错过可再试。'};
 const results={creek:'我用一圈圈水纹，陪落叶绕过溪石，终于漂进了下游的光里。',rain:'我用竹筒接住竹叶上的雨滴，八个清亮的声音串起了这段竹林记忆。',wind:'我牵着纸鸢借风穿过三个山脊风口，看草浪一层层向远处展开。'};
 const gates=[{x:.34,y:.36},{x:.59,y:.66},{x:.84,y:.43}];
 const rocks=[{x:.27,y:.64,r:.075},{x:.49,y:.34,r:.08},{x:.72,y:.68,r:.075}];
 function create(entry,options={}){return {id:entry.id,route:entry.route,kind:entry.interaction,game:kinds[entry.id],age:0,acted:false,gesture:'look',x:.5,y:.5,dragging:false,done:false,play:{type:'minigame',progress:0,complete:false,completedAt:null,reduced:!!options.reduced},actor:{x:kinds[entry.id]==='creek'?.1:.22,y:.5,vx:0,vy:0},control:{x:.5,y:.5},gates:0,caught:0,drops:[],spawn:0,serial:0,events:[],pulse:null,feedback:'准备好了就轻触画面开始。',cooldown:0};}
 function event(s,type,x,y){s.serial++;s.events=[...s.events,{serial:s.serial,type,x,y,age:s.age}].slice(-8);}
 function input(state,point={},mode='tap'){
  if(!state||state.done||state.play.complete)return state;
  const s={...state,actor:{...state.actor},control:{...state.control},events:state.events.slice(),acted:true,gesture:mode==='move'?'drag':'tap',x:clamp(point.x??state.x),y:clamp(point.y??state.y),dragging:mode==='move'};
  if(point.assist){s.feedback='用方向键调整位置；Enter 开始，R 重试。';return s;}
  s.control={x:s.x,y:s.y};
  if(s.game==='creek'&&(mode==='tap'||point.key)&&s.age-(s.pulse?.age??-1)>.14){
   let dx=point.key?(point.dx??s.x-state.x):s.actor.x-s.x,dy=point.key?(point.dy??s.y-state.y):s.actor.y-s.y;
   const d=Math.hypot(dx,dy)||1;if(point.key||d<.38){s.actor.vx+=dx/d*.1;s.actor.vy+=dy/d*.18;}
   s.pulse={x:s.x,y:s.y,age:s.age};event(s,'ripple',s.x,s.y);s.feedback='水纹推着落叶前行，绕过石头，找下一处水口。';
  }
  return s;
 }
 function step(state,dt){
  if(!state||state.done||!Number.isFinite(dt)||dt<=0)return state;
  dt=Math.min(dt,.05);const s={...state,actor:{...state.actor},play:{...state.play},drops:state.drops.map(d=>({...d})),events:state.events.slice(),age:state.age+dt,cooldown:Math.max(0,state.cooldown-dt)};
  if(s.play.complete){s.done=s.age-s.play.completedAt>1.1;return s;}if(!s.acted)return s;
  const a=s.actor;
  if(s.game==='creek'){
   a.vx=clamp(a.vx*Math.exp(-dt*2),-.04,.02);a.vy=clamp(a.vy*Math.exp(-dt*2),-.2,.2);a.x=clamp(a.x+(.025+a.vx)*dt,.055,.95);a.y=clamp(a.y+(Math.sin(s.age*.8)*.012+a.vy)*dt,.2,.82);
   for(const r of rocks){const dx=a.x-r.x,dy=(a.y-r.y)*.65,d=Math.hypot(dx,dy);if(d<r.r+.024){const angle=Math.atan2(dy,dx);a.x=r.x+Math.cos(angle)*(r.r+.026);a.y=clamp(r.y+Math.sin(angle)*(r.r+.026)/.65,.2,.82);a.vy+=Math.sin(angle)*.015;if(!s.cooldown){event(s,'bump',a.x,a.y);s.feedback='落叶在石边打转，从侧面拨一下水。';s.cooldown=.8;}}}
   const g=gates[s.gates];if(g&&a.x>=g.x){if(Math.abs(a.y-g.y)<.14){s.gates++;event(s,'goal',a.x,a.y);s.feedback='经过一处水口，继续顺水而行。';}else{a.x=g.x-.012;if(!s.cooldown){s.feedback='调整落叶的位置，穿过金色水口。';s.cooldown=.8;}}}
   s.play.progress=s.gates/3;
  }else if(s.game==='rain'){
   a.x+=(s.control.x-a.x)*(1-Math.exp(-dt*10));a.y=.84;s.spawn-=dt;
   if(s.spawn<=0){const n=Math.floor(s.age/2);s.drops.push({x:.16+((n*37)%69)/100,y:.15,speed:.29+(n%3)*.025});s.spawn=2;}
   s.drops=s.drops.filter(d=>{d.y+=dt*d.speed;if(d.y>=.81&&d.y<.9&&Math.abs(d.x-a.x)<.085){s.caught++;event(s,'catch',d.x,.82);s.feedback='接住了 '+s.caught+' / 8 滴，听见竹筒的回声。';return false;}if(d.y>.94){event(s,'miss',d.x,.94);s.feedback='雨滴落回石阶，下一滴还会来。';return false;}return true;});s.play.progress=clamp(s.caught/8);
  }else{
   const wind=Math.sin(s.age*.8)*.038;a.y=clamp(a.y+((s.control.y-a.y)*2.1+wind)*dt,.12,.86);a.x=.24;
   const g=gates[s.gates];s.spawn+=dt;const gx=.92-s.spawn*.085;s.gateX=gx;
   if(g&&gx<=a.x){if(Math.abs(a.y-g.y)<.13){s.gates++;event(s,'goal',a.x,a.y);s.feedback='穿过风口 '+s.gates+' / 3，下一阵风来了。';}else{event(s,'miss',a.x,a.y);s.feedback='风把纸鸢带偏了，调整高度，再试这个风口。';}s.spawn=0;}
   s.play.progress=s.gates/3;
  }
  if(s.play.progress>=1){s.play.complete=true;s.play.completedAt=s.age;event(s,'complete',a.x,a.y);s.feedback='完成了，正在展开这一刻的手绘纪念。';}return s;
 }
 function tick(state,dt){if(!Number.isFinite(dt)||dt<=0)return state;let s=state;for(let remaining=Math.min(.25,dt);remaining>1e-8;remaining-=.025)s=step(s,Math.min(.025,remaining));return s;}
 // One shared vector scene description keeps the GPU view and its non-GPU fallback equivalent.
 const ellipse=(x,y,rx,ry,color,alpha=1)=>({shape:'ellipse',x,y,rx,ry,color,alpha});
 const line=(points,color,width=1,alpha=1)=>({shape:'line',points,color,width,alpha});
 const poly=(points,color,alpha=1)=>({shape:'poly',points,color,alpha});
 const organic=(x,y,rx,ry,seed=0)=>Array.from({length:40},(_,i)=>{const a=i*Math.PI/20,r=1+Math.sin(a*3+seed)*.07+Math.sin(a*5+seed)*.04;return [x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r];}).flat();
 function background(kind){
  const out=[];for(let i=0;i<28;i++)out.push({shape:'rect',x:0,y:i*17,w:800,h:18,color:kind==='wind'?['#e0e9db','#d4e1d3','#c6d7c7'][Math.min(2,Math.floor(i/10))]:kind==='rain'?'#d8e2cf':'#bed7c8',alpha:1});
  for(let j=0;j<5;j++){const pts=[0,460];for(let x=0;x<=840;x+=35)pts.push(x,95+j*46+Math.sin(x*.008+j*1.8)*32+Math.cos(x*.016+j)*17);pts.push(800,460);out.push(poly(pts,['#a6c5b3','#8cad99','#759a7c','#6b916b','#5b805d'][j],.25+j*.1));}
  if(kind==='creek'){
   const bank=[];for(let x=0;x<=800;x+=10)bank.push(x,70+Math.sin(x*.015)*16);for(let x=800;x>=0;x-=10)bank.push(x,420+Math.sin(x*.012)*14);out.push(poly(bank,'#7faeaa'));
   for(let i=0;i<110;i++){const x=(i*137)%800,y=105+(i*53)%288;out.push(poly(organic(x,y,4+i%8,2+i%5,i),'#536f69',.08));out.push(ellipse(x-1,y-1,3+i%5,1+i%3,'#d7dab5',.13));}
   for(let i=0;i<55;i++){const x=i*16,y=71+Math.sin(x*.015)*16;out.push(ellipse(x,y-6,12,7,'#80965f',.7));out.push(ellipse(x+3,y-10,8,4,'#c2c791',.5));}

   for(let i=0;i<90;i++){const x=(i*137)%800,y=100+(i*53)%300;out.push(ellipse(x,y,2+i%4,1,'#dfedd7',.22));}
   for(const r of rocks){const x=r.x*800,y=r.y*460;out.push(ellipse(x+7,y+22,r.r*850,r.r*390,'#315b57',.22));out.push(poly(organic(x,y-2,54,36,r.x*14),'#839a87'));for(let j=0;j<32;j++){const xx=x-34+(j*13)%70,yy=y-22+(j*19)%40;out.push(ellipse(xx,yy,1+j%3,.6,'#dde0bd',.27));}out.push(poly([x-43,y-25,x-12,y-42,x+29,y-33,x+8,y-9,x-29,y-5],'#b7bda0'));out.push(line([x-12,y-36,x-7,y-9,x+13,y+6],'#667e70',2));for(let j=0;j<18;j++){const xx=x-35+(j*11)%65,yy=y-16+Math.sin(j)*11;out.push(poly(organic(xx,yy,4+j%3,2+j%2,j),'#617d54',.8));out.push(line([xx,yy,xx-2,yy-5],'#acbc80',.7));}for(let j=0;j<4;j++)out.push(line([x+36,y+23+j*5,x+57,y+27+j*5,x+70,y+24+j*5],'#d8e8d1',.8,.45));}
  }
  if(kind==='rain'){
   for(let i=0;i<16;i++){const x=(i*71)%830-15,w=6+i%4*2;out.push(line([x,460,x+18,0],i%2?'#547c64':'#8ca78b',w,.45+i%3*.15));for(let j=0;j<6;j++){const y=j*82+(i%3)*15;out.push(line([x-3,y,x+w+3,y-1],'#ced5a6',2,.6));for(let k=0;k<3;k++){const dx=(i%2?1:-1)*(22+k*12);out.push(poly([x,y,x+dx*.5,y-15-k*6,x+dx,y-8-k*13,x+dx*.6,y+1],'#4f765a',.55));}}}
   out.push(poly([0,410,800,390,800,460,0,460],'#89958a'));for(let i=0;i<18;i++){const x=i*53;out.push(line([x,430,x+40,423],'#c2c6ac',2,.6));}
  }
  for(let i=0;i<95;i++){const x=(i*79)%800,y=kind==='creek'?(i%2?440:73):440+(i%4)*6;out.push(line([x,y,x-4+(i%7),y-12-i%23],i%2?'#567950':'#a5b67a',1.4,.65));}
  // Fine paper flecks, warm light and layers remain static; only gameplay geometry is rebuilt.
  for(let i=0;i<150;i++)out.push(ellipse((i*113)%800,(i*79)%460,.6+i%2,.6,'#fff6d9',.16));
  for(let i=5;i>0;i--)out.push(ellipse(640,80,28+i*9,24+i*7,'#fff1c9',.025));
  return out;
 }
 function foreground(s){
  const out=[],t=s.play.reduced?0:s.age,a=s.actor,x=a.x*800,y=a.y*460;
  if(s.game==='creek'){
   for(let i=0;i<18;i++){const xx=((i*97+t*18)%850)-25,yy=110+(i*37)%280;out.push(line([xx,yy,xx+15,yy-2,xx+30,yy],'#e0efdc',1,.34));}
   for(let i=s.gates;i<3;i++){const g=gates[i];out.push(ellipse(g.x*800,g.y*460,13,52,i===s.gates?'#f8df92':'#dce6c6',i===s.gates?.65:.2));out.push(line([g.x*800,g.y*460-45,g.x*800,g.y*460+45],'#fff7d5',1,.5));}
   out.push(ellipse(x+2,y+9,21,7,'#315e56',.25));out.push(poly([x-23,y+2,x-8,y-12,x+23,y-4,x+7,y+12],'#c6aa66'));out.push(line([x-22,y+2,x+21,y-4],'#eee0a2',1.5));for(let i=0;i<4;i++)out.push(line([x-13+i*8,y+1,x-10+i*8,y-7],'#947d49',.8));
   if(s.pulse&&s.age-s.pulse.age<1.3){const age=s.age-s.pulse.age;for(let i=0;i<3;i++)out.push({shape:'ring',x:s.pulse.x*800,y:s.pulse.y*460,rx:10+age*60+i*9,ry:5+age*30+i*4,color:'#fff5d8',width:1.5,alpha:(1-age/1.3)*.7});}
  }else if(s.game==='rain'){
   for(let i=0;i<14;i++){const xx=(i*61+t*9)%800,yy=(i*47+t*145)%460;out.push(line([xx,yy,xx-2,yy+8],'#e4eedc',1,.22));}
   for(const d of s.drops){out.push(ellipse(d.x*800,d.y*460,5.5,10,'#c5e2d5'));out.push(ellipse(d.x*800-1,d.y*460-2,1,2,'#fff8df'));}
   out.push(ellipse(x,y+30,43,9,'#344e42',.25));out.push(poly([x-47,y-7,x+47,y-7,x+36,y+33,x-37,y+33],'#b8aa70'));out.push(poly([x-45,y-5,x-30,y-5,x-24,y+31,x-37,y+31],'#d8cb94'));out.push(ellipse(x,y-7,47,12,'#6b7854'));out.push(ellipse(x,y-7,38,7,'#8cb3a2'));out.push(line([x-37,y+22,x+36,y+22],'#857b49',2));
   for(let i=0;i<8;i++)out.push(ellipse(308+i*26,37,6,6,i<s.caught?'#e8cc7f':'#758f76',.85));
  }else{
   const g=gates[Math.min(2,s.gates)],gx=(s.gateX??.92)*800;out.push({shape:'ring',x:gx,y:g.y*460,rx:23,ry:61,color:'#f4dd98',width:3,alpha:.8});
   for(let i=0;i<12;i++){const xx=800-((t*60+i*73)%900),yy=50+(i*39)%300;out.push(line([xx,yy,xx+18,yy-3,xx+42,yy],'#f1efd1',1,.4));}
   out.push(line([x,y+15,x-18,y+49,x-7,y+70,x-26,y+94],'#ddbe8b',2));out.push(line([x,y+18,90,430],'#e7dbc0',.8,.7));out.push(poly([x,y-31,x+25,y,x,y+26,x-25,y],'#e9d4a3'));out.push(poly([x,y-31,x,y+26,x-25,y],'#819b78'));out.push(line([x,y-31,x,y+26,x-25,y,x+25,y],'#566e55',1));
  }
  for(const e of s.events){const age=s.age-e.age;if(age>1||!['catch','goal','complete','bump','miss'].includes(e.type))continue;const color=e.type==='miss'||e.type==='bump'?'#d9dfc5':'#fff0b0';for(let i=0;i<6;i++){const angle=i*Math.PI/3;out.push(ellipse(e.x*800+Math.cos(angle)*age*40,e.y*460+Math.sin(angle)*age*25-age*15,2,2,color,1-age));}}
  return out;
 }
 function drawSvg(svg,parent,shapes){parent.replaceChildren();for(const f of shapes){const common={fill:f.color,opacity:f.alpha??1};if(f.shape==='rect')svg('rect',{...common,x:f.x,y:f.y,width:f.w,height:f.h},parent);else if(f.shape==='ellipse'||f.shape==='ring')svg('ellipse',{...common,cx:f.x,cy:f.y,rx:f.rx,ry:f.ry,...(f.shape==='ring'?{fill:'none',stroke:f.color,'stroke-width':f.width}:{})},parent);else svg(f.shape==='line'?'polyline':'polygon',{...common,points:f.points.join(' '),...(f.shape==='line'?{fill:'none',stroke:f.color,'stroke-width':f.width,'stroke-linecap':'round','stroke-linejoin':'round'}:{})},parent);}}
 function drawPixi(P,g,shapes){g.clear();for(const f of shapes){if(f.shape==='rect')g.rect(f.x,f.y,f.w,f.h);else if(f.shape==='ellipse'||f.shape==='ring')g.ellipse(f.x,f.y,f.rx,f.ry);else{g.moveTo(f.points[0],f.points[1]);for(let i=2;i<f.points.length;i+=2)g.lineTo(f.points[i],f.points[i+1]);if(f.shape==='poly')g.closePath();}if(f.shape==='line'||f.shape==='ring')g.stroke({color:f.color,alpha:f.alpha??1,width:f.width,cap:'round',join:'round'});else g.fill({color:f.color,alpha:f.alpha??1});}}
 function draw(svg,parent,entry){const holder=svg('g',{transform:'scale(.5)'},parent),photo=svg('g',{},holder),bg=svg('g',{},holder),fg=svg('g',{},holder);drawSvg(svg,bg,background(kinds[entry.id]));return {mini:true,svg,parent,photo,bg,fg,disposed:false,renderer:null,latest:null};}
 async function mount(refs,P,host,asset){
  if(!refs?.mini||!P?.Application)return false;let app;
  try{app=new P.Application();await app.init({width:800,height:460,resolution:Math.min(2,globalThis.devicePixelRatio||1),autoDensity:true,antialias:true,autoStart:false,preference:'webgl',backgroundAlpha:0});if(refs.disposed){app.destroy(true,{children:true});return false;}
   const bg=new P.Graphics(),fg=new P.Graphics();app.stage.addChild(bg,fg);drawPixi(P,bg,background(refs.latest.game));app.canvas.className='mini-game-canvas';app.canvas.setAttribute('aria-hidden','true');host.appendChild(app.canvas);refs.renderer={app,fg,P,texture:null};
   if(asset&&refs.latest.game!=='creek')asset.promise.then(e=>{if(refs.disposed||!refs.renderer||e.state!=='ready')return;try{const texture=P.Texture.from(e.image,true),sprite=new P.Sprite(texture);sprite.width=800;sprite.height=460;app.stage.addChildAt(sprite,0);bg.alpha=.14;refs.renderer.texture=texture;refs.svg('image',{href:e.file,width:800,height:460,preserveAspectRatio:'xMidYMid slice'},refs.photo);refs.bg.setAttribute('opacity',.14);paint(refs,refs.latest);}catch(_){/* The complete vector scene remains playable if upload fails. */}});
   app.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();disposeRenderer(refs);if(refs.latest)drawSvg(refs.svg,refs.fg,foreground(refs.latest));});paint(refs,refs.latest);return true;
  }catch(_){try{app?.destroy(true,{children:true});}catch(_){}return false;}
 }
 function disposeRenderer(refs){const r=refs.renderer;refs.renderer=null;if(r){try{r.app.destroy(true,{children:true});}catch(_){}try{r.texture?.destroy(true);}catch(_){}} }
 function dispose(refs){if(!refs?.mini)return;refs.disposed=true;disposeRenderer(refs);}
 function paint(refs,s){if(!refs||refs.disposed||!s)return;refs.latest=s;const shapes=foreground(s);if(refs.renderer){try{drawPixi(refs.renderer.P,refs.renderer.fg,shapes);refs.renderer.app.render();}catch(_){disposeRenderer(refs);drawSvg(refs.svg,refs.fg,shapes);}}else drawSvg(refs.svg,refs.fg,shapes);}
 function enhance(base){return {...base,create:(e,o)=>kinds[e.id]?create(e,o):base.create(e,o),act:(s,p)=>s.game?input(s,p):base.act(s,p),move:(s,p)=>s.game?input(s,p,'move'):base.move(s,p),release:s=>s.game?{...s,dragging:false}:base.release(s),tick:(s,dt)=>s.game?tick(s,dt):base.tick(s,dt),draw:(svg,p,e)=>kinds[e.id]?draw(svg,p,e):base.draw(svg,p,e),paint:(r,s,reduced)=>s.game?paint(r,s):base.paint(r,s,reduced),instruction:e=>prompts[kinds[e.id]]||base.instruction(e),status:s=>s.game?s.feedback:base.status(s),outcome:(s,e)=>s.game?{id:s.id,edition:e.edition,earned:s.play.complete,interaction:s.gesture,memory:e.memory+(s.play.complete?results[s.game]:'我试着与这里的风雨玩了一会儿，下次再来。'),title:s.play.complete?e.tag:e.name}:base.outcome(s,e)};}
 return {kinds,prompts,results,gates,rocks,create,input,tick,background,foreground,drawPixi,mount,dispose,enhance};
}));
