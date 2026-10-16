(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./wind-scene.js'):root.TrailWindScene,typeof module==='object'&&module.exports?require('./water-scene.js'):root.TrailWaterScene,typeof module==='object'&&module.exports?require('./wugong-games.js'):root.TrailWugongGames,typeof module==='object'&&module.exports?require('./art-games.js'):root.TrailArtGames,typeof module==='object'&&module.exports?require('./art-game-scene.js'):root.TrailArtGameScene);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailMiniGames=api;}(typeof globalThis!=='undefined'?globalThis:this,function(W,Q,N,A,B){
 'use strict';
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
 const kinds={'westlake-floating-leaf':'creek','bamboo-drop':'rain','meadow-bird':'wind',...N.kinds,...A.kinds};
 const K=W.flight;
 const prompts={...N.prompts,...A.prompts,creek:'轻点落叶旁的水面，用水纹推它绕过溪石，经过三个金色水口。方向键也能推动；可以随时重试。',rain:'左右拖动竹筒，接住八滴从竹叶落下的雨。接住才会奏响音符；方向键移动，漏接可以继续。',wind:K.prompt};
 const results={...N.results,...A.results,creek:'我用一圈圈水纹，陪落叶绕过溪石，终于漂进了下游的光里。',rain:'我用竹筒接住竹叶上的雨滴，八个清亮的声音串起了这段竹林记忆。',wind:K.result};
 const gates=[{x:.34,y:.36},{x:.59,y:.66},{x:.84,y:.43}];
 const windLevels=[.67,.45,.48],windNames=K.names;
 function windTarget(s){return K.target(s);}
 const rocks=[{x:.27,y:.64,r:.075},{x:.49,y:.34,r:.08},{x:.72,y:.68,r:.075}];
 function create(entry,options={}){if(entry.id==='meadow-bird')return K.create(entry,options);if(A.kinds[entry.id])return A.create(entry,options);if(N.kinds[entry.id])return N.create(entry,options);return {id:entry.id,route:entry.route,kind:entry.interaction,game:kinds[entry.id],age:0,acted:false,gesture:'look',x:.5,y:.5,dragging:false,done:false,play:{type:'minigame',progress:0,complete:false,completedAt:null,reduced:!!options.reduced},actor:{x:kinds[entry.id]==='creek'?.1:kinds[entry.id]==='wind'?.44:.22,y:kinds[entry.id]==='wind'?.72:kinds[entry.id]==='rain'?Q.cup.mouthY:.5,vx:0,vy:0},control:{x:.5,y:kinds[entry.id]==='wind'?.72:.5},windHold:0,windNear:false,lastTug:-10,turnUntil:0,gates:0,caught:0,drops:[],spawn:1.2,dropIndex:0,serial:0,events:[],pulse:null,feedback:'准备好了就轻触画面开始。',cooldown:0};}
 function event(s,type,x,y,extra={}){s.serial++;s.events=[...s.events,{serial:s.serial,type,x,y,age:s.age,...extra}].slice(-8);}
 function input(state,point={},mode='tap'){
  if(state?.game==='wind')return K.input(state,point,mode);
  if(A.assets[state?.game])return A.input(state,point,mode);
  if(N.assets[state?.game])return N.input(state,point,mode);
  if(!state||state.done||state.play.complete)return state;
  const s={...state,actor:{...state.actor},control:{...state.control},events:state.events.slice(),acted:true,gesture:mode==='move'?'drag':'tap',x:clamp(point.x??state.x),y:clamp(point.y??state.y),dragging:mode==='move'};
  if(point.assist){s.feedback='用方向键调整位置；Enter 开始，R 重试。';return s;}
  if(s.game==='wind'&&Math.abs(s.y-s.control.y)>.025&&s.age-s.lastTug>.28){event(s,'tug',s.actor.x,s.actor.y);s.lastTug=s.age;}
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
  if(s.play.complete){if(s.game==='wind'){const f=s.play.reduced?1:Math.min(1,(s.age-s.play.completedAt)/1.7),q=f*f*(3-2*f);s.actor.x=s.finishFrom.x+(.78-s.finishFrom.x)*q;s.actor.y=s.finishFrom.y+(.17-s.finishFrom.y)*q;s.actor.vy=0;}if(s.game==='creek'){const q=Q.sample(s).finish;s.actor.x=s.finishFrom.x+(.96-s.finishFrom.x)*q;s.actor.y=s.finishFrom.y+(.52-s.finishFrom.y)*q;}s.done=s.age-s.play.completedAt>(s.game==='wind'?W.finishDuration(s):Q.finishDuration(s));return s;}if(!s.acted)return s;
  const a=s.actor;
  if(s.game==='creek'){
   a.vx=clamp(a.vx*Math.exp(-dt*2),-.04,.02);a.vy=clamp(a.vy*Math.exp(-dt*2),-.2,.2);a.x=clamp(a.x+(.025+a.vx)*dt,.055,.95);a.y=clamp(a.y+(Math.sin(s.age*.8)*.012+a.vy)*dt,.2,.82);
   for(const r of rocks){const dx=a.x-r.x,dy=(a.y-r.y)*.65,d=Math.hypot(dx,dy);if(d<r.r+.024){const angle=Math.atan2(dy,dx);a.x=r.x+Math.cos(angle)*(r.r+.026);a.y=clamp(r.y+Math.sin(angle)*(r.r+.026)/.65,.2,.82);a.vy+=Math.sin(angle)*.015;if(!s.cooldown){event(s,'bump',a.x,a.y);s.feedback='落叶在石边打转，从侧面拨一下水。';s.cooldown=.8;}}}
   const g=gates[s.gates];if(g&&a.x>=g.x){if(Math.abs(a.y-g.y)<.14){s.gates++;event(s,'goal',a.x,a.y);s.feedback='经过一处水口，继续顺水而行。';}else{a.x=g.x-.012;if(!s.cooldown){s.feedback='调整落叶的位置，穿过金色水口。';s.cooldown=.8;}}}
   s.play.progress=s.gates/3;
  }else if(s.game==='rain'){
   const oldX=a.x;a.x+=(clamp(s.control.x,.08,.92)-a.x)*(1-Math.exp(-dt*10));a.y=Q.cup.mouthY;s.spawn-=dt;
   if(s.spawn<=0){const n=s.dropIndex++;s.drops.push({x:Q.nextDrop(n),y:.24,speed:.29+(n%3)*.025});s.spawn=2;}
   s.drops=s.drops.filter(d=>{const oldY=d.y;d.y+=dt*d.speed;const crossed=oldY<Q.cup.mouthY&&d.y>=Q.cup.mouthY,at=crossed?(Q.cup.mouthY-oldY)/(d.y-oldY):0,cupX=oldX+(a.x-oldX)*at;if(crossed&&Math.abs(d.x-cupX)<(Q.cup.mouthRadius-3)/800){s.caught++;event(s,'catch',d.x,Q.cup.mouthY,{offsetX:d.x-cupX});s.feedback='接住了 '+s.caught+' / 8 滴，听见竹筒的回声。';return false;}if(d.y>.94){event(s,'miss',d.x,.94);s.feedback='雨滴落回石阶，下一滴还会来。';return false;}return true;});s.play.progress=clamp(s.caught/8);
  }
  if(s.play.progress>=1){s.play.complete=true;s.play.completedAt=s.age;s.finishFrom={...a};event(s,'complete',a.x,a.y);s.feedback='完成了，正在展开这一刻的手绘纪念。';}return s;
 }
 function tick(state,dt){if(state?.game==='wind')return K.tick(state,dt);if(A.assets[state?.game])return A.tick(state,dt);if(N.assets[state?.game])return N.tick(state,dt);if(!Number.isFinite(dt)||dt<=0)return state;let s=state;for(let remaining=Math.min(.25,dt);remaining>1e-8;remaining-=.025)s=step(s,Math.min(.025,remaining));return s;}
 // One shared vector scene description keeps the GPU view and its non-GPU fallback equivalent.
 const ellipse=(x,y,rx,ry,color,alpha=1)=>({shape:'ellipse',x,y,rx,ry,color,alpha});
 const line=(points,color,width=1,alpha=1)=>({shape:'line',points,color,width,alpha});
 const poly=(points,color,alpha=1)=>({shape:'poly',points,color,alpha});
 const organic=(x,y,rx,ry,seed=0)=>Array.from({length:40},(_,i)=>{const a=i*Math.PI/20,r=1+Math.sin(a*3+seed)*.07+Math.sin(a*5+seed)*.04;return [x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r];}).flat();
 function background(kind,onlyRocks=false){
  const out=[];for(let i=0;i<28;i++)out.push({shape:'rect',x:0,y:i*17,w:800,h:18,color:kind==='wind'?['#e0e9db','#d4e1d3','#c6d7c7'][Math.min(2,Math.floor(i/10))]:kind==='rain'?'#d8e2cf':'#bed7c8',alpha:1});
  for(let j=0;j<5;j++){const pts=[0,460];for(let x=0;x<=840;x+=35)pts.push(x,95+j*46+Math.sin(x*.008+j*1.8)*32+Math.cos(x*.016+j)*17);pts.push(800,460);out.push(poly(pts,['#a6c5b3','#8cad99','#759a7c','#6b916b','#5b805d'][j],.25+j*.1));}
  if(kind==='creek'){
   const bank=[];for(let x=0;x<=800;x+=10)bank.push(x,70+Math.sin(x*.015)*16);for(let x=800;x>=0;x-=10)bank.push(x,420+Math.sin(x*.012)*14);out.push(poly(bank,'#7faeaa'));
   for(let i=0;i<110;i++){const x=(i*137)%800,y=105+(i*53)%288;out.push(poly(organic(x,y,4+i%8,2+i%5,i),'#536f69',.08));out.push(ellipse(x-1,y-1,3+i%5,1+i%3,'#d7dab5',.13));}
   for(let i=0;i<55;i++){const x=i*16,y=71+Math.sin(x*.015)*16;out.push(ellipse(x,y-6,12,7,'#80965f',.7));out.push(ellipse(x+3,y-10,8,4,'#c2c791',.5));}

   for(let i=0;i<90;i++){const x=(i*137)%800,y=100+(i*53)%300;out.push(ellipse(x,y,2+i%4,1,'#dfedd7',.22));}
   const rockStart=out.length;for(const r of rocks){const x=r.x*800,y=r.y*460;out.push(ellipse(x+7,y+22,r.r*850,r.r*390,'#315b57',.22));out.push(poly(organic(x,y-2,54,36,r.x*14),'#839a87'));for(let j=0;j<32;j++){const xx=x-34+(j*13)%70,yy=y-22+(j*19)%40;out.push(ellipse(xx,yy,1+j%3,.6,'#dde0bd',.27));}out.push(poly([x-43,y-25,x-12,y-42,x+29,y-33,x+8,y-9,x-29,y-5],'#b7bda0'));out.push(line([x-12,y-36,x-7,y-9,x+13,y+6],'#667e70',2));for(let j=0;j<18;j++){const xx=x-35+(j*11)%65,yy=y-16+Math.sin(j)*11;out.push(poly(organic(xx,yy,4+j%3,2+j%2,j),'#617d54',.8));out.push(line([xx,yy,xx-2,yy-5],'#acbc80',.7));}for(let j=0;j<4;j++)out.push(line([x+36,y+23+j*5,x+57,y+27+j*5,x+70,y+24+j*5],'#d8e8d1',.8,.45));}
   if(onlyRocks)return out.slice(rockStart);
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
 function foreground(s,painted=false){
  if(N.assets[s.game])return [];
  const out=[],t=s.play.reduced?0:s.age,a=s.actor,x=a.x*800,y=a.y*460;
  if(s.game==='creek'){
   for(let i=0;i<18;i++){const xx=((i*97+t*18)%850)-25,yy=110+(i*37)%280;out.push(line([xx,yy,xx+15,yy-2,xx+30,yy],'#e0efdc',1,.34));}
   for(let i=s.gates;i<3;i++){const g=gates[i];out.push(ellipse(g.x*800,g.y*460,13,52,i===s.gates?'#f8df92':'#dce6c6',i===s.gates?.65:.2));out.push(line([g.x*800,g.y*460-45,g.x*800,g.y*460+45],'#fff7d5',1,.5));}
   out.push(ellipse(x+2,y+9,21,7,'#315e56',.25));if(!painted){out.push(poly([x-23,y+2,x-8,y-12,x+23,y-4,x+7,y+12],'#c6aa66'));out.push(line([x-22,y+2,x+21,y-4],'#eee0a2',1.5));for(let i=0;i<4;i++)out.push(line([x-13+i*8,y+1,x-10+i*8,y-7],'#947d49',.8));}
   if(s.pulse&&s.age-s.pulse.age<1.3){const age=s.age-s.pulse.age;for(let i=0;i<3;i++)out.push({shape:'ring',x:s.pulse.x*800,y:s.pulse.y*460,rx:10+age*60+i*9,ry:5+age*30+i*4,color:'#fff5d8',width:1.5,alpha:(1-age/1.3)*.7});}
  }else if(s.game==='rain'){
   for(let i=0;i<14;i++){const xx=(i*61+t*9)%800,yy=(i*47+t*145)%460;out.push(line([xx,yy,xx-2,yy+8],'#e4eedc',1,.22));}
   for(const d of s.drops){out.push(ellipse(d.x*800,d.y*460,5.5,10,'#c5e2d5'));out.push(ellipse(d.x*800-1,d.y*460-2,1,2,'#fff8df'));}
   out.push(ellipse(x,y+30,43,9,'#344e42',.25));if(!painted){const cupY=y+7;out.push(poly([x-47,cupY-7,x+47,cupY-7,x+36,cupY+33,x-37,cupY+33],'#b8aa70'));out.push(poly([x-45,cupY-5,x-30,cupY-5,x-24,cupY+31,x-37,cupY+31],'#d8cb94'));out.push(ellipse(x,cupY-7,47,12,'#6b7854'));out.push(ellipse(x,cupY-7,38,7,'#8cb3a2'));out.push(line([x-37,cupY+22,x+36,cupY+22],'#857b49',2));}
   for(let i=0;i<8;i++)out.push(ellipse(308+i*26,37,6,6,i<s.caught?'#e8cc7f':'#758f76',.85));
  }else{
   const target=windTarget(s)*460,near=s.windNear;
   // Wind is a moving current in the landscape, not a floating checkpoint ring.
   for(let j=0;j<5;j++){const path=[];for(let i=0;i<42;i++){const xx=60+i*18,yy=K.flowAt(s,xx/800)*460+(j-2)*K.radius(s)*460*.33;path.push(xx,yy);}out.push(line(path,'#435f61',3,j===2?.12:.06));out.push(line(path,near?'#fff1c2':'#fffbed',j===2?2:1,near?.64:.42));}
   for(let i=0;i<16;i++){const xx=760-((t*67+i*53)%700),yy=target+Math.sin(xx*.011-t*1.4)*7+(i%5-2)*10;out.push(ellipse(xx,yy,2.8,1.1,near?'#f3d58a':'#f8efd1',.68));out.push(line([xx,yy,xx+9,yy-4],'#f8efd1',.8,.4));}
   // Loose catenary-like line and separate cloth ribbons respond to the flight motion.
   const cord=[];for(let i=0;i<=32;i++){const q=i/32;cord.push(72+(x-72)*q,445+(y+18-445)*q+Math.sin(q*Math.PI)*(20+a.vy*100));}out.push(line(cord,'#4f6254',2,.28));out.push(line(cord,'#f8e7bd',.9,.9));
   for(let j=0;j<2;j++){const ribbon=[];for(let i=0;i<28;i++){const q=i/27;ribbon.push(x+(j?17:-17)+Math.sin(q*8-t*3+j)*q*17,y+26+q*76);}out.push(line(ribbon,j?'#c16d4a':'#d1ad68',3.4,.85));out.push(line(ribbon,'#ffe5b1',.65,.6));}
   // Detailed swallow silhouette while the painted sprite is being decoded.
   if(!painted){out.push(poly([x,y-33,x-8,y-16,x-27,y-27,x-70,y-48,x-57,y-10,x-30,y+1,x-10,y+16,x-15,y+41,x,y+30,x+15,y+41,x+10,y+16,x+30,y+1,x+57,y-10,x+70,y-48,x+27,y-27,x+8,y-16],'#e5d0a1'));
   out.push(poly([x-7,y-17,x-28,y-25,x-63,y-43,x-52,y-13,x-26,y-2,x-9,y+14],'#557c79'));out.push(poly([x+7,y-17,x+28,y-25,x+63,y-43,x+52,y-13,x+26,y-2,x+9,y+14],'#557c79'));
   for(const side of [-1,1])for(let j=0;j<5;j++)out.push(line([x+side*11,y+10-j*5,x+side*(27+j*7),y-6-j*6],'#cbd6b2',1,.85));out.push(ellipse(x,y+3,7,15,'#b97151'));out.push(line([x,y-28,x,y+30],'#b3a172',1.1));}
   for(let i=0;i<22;i++){const xx=i*39-15,sway=s.play.reduced?0:Math.sin(t*1.8+i*.4)*8;out.push(line([xx,460,xx+8+sway*.5,437-i%4*4,xx+19+sway,421-i%3*7],'#a7be73',2,.6));out.push(line([xx+8+sway*.5,437-i%4*4,xx-3+sway,431-i%4*4],'#e4d89e',1,.55));}

  }
  for(const e of s.events){const age=s.age-e.age;if(age>1||!['catch','goal','flight-phase','complete','bump','miss'].includes(e.type))continue;const color=e.type==='miss'||e.type==='bump'?'#d9dfc5':'#fff0b0';for(let i=0;i<6;i++){const angle=i*Math.PI/3;out.push(ellipse(e.x*800+Math.cos(angle)*age*40,e.y*460+Math.sin(angle)*age*25-age*15,2,2,color,1-age));}}
  return out;
 }
 function drawSvg(svg,parent,shapes){parent.replaceChildren();for(const f of shapes){const common={fill:f.color,opacity:f.alpha??1};if(f.shape==='rect')svg('rect',{...common,x:f.x,y:f.y,width:f.w,height:f.h},parent);else if(f.shape==='ellipse'||f.shape==='ring')svg('ellipse',{...common,cx:f.x,cy:f.y,rx:f.rx,ry:f.ry,...(f.shape==='ring'?{fill:'none',stroke:f.color,'stroke-width':f.width}:{})},parent);else svg(f.shape==='line'?'polyline':'polygon',{...common,points:f.points.join(' '),...(f.shape==='line'?{fill:'none',stroke:f.color,'stroke-width':f.width,'stroke-linecap':'round','stroke-linejoin':'round'}:{})},parent);}}
 function drawPixi(P,g,shapes){g.clear();for(const f of shapes){if(f.shape==='rect')g.rect(f.x,f.y,f.w,f.h);else if(f.shape==='ellipse'||f.shape==='ring')g.ellipse(f.x,f.y,f.rx,f.ry);else{g.moveTo(f.points[0],f.points[1]);for(let i=2;i<f.points.length;i+=2)g.lineTo(f.points[i],f.points[i+1]);if(f.shape==='poly')g.closePath();}if(f.shape==='line'||f.shape==='ring')g.stroke({color:f.color,alpha:f.alpha??1,width:f.width,cap:'round',join:'round'});else g.fill({color:f.color,alpha:f.alpha??1});}}
 function draw(svg,parent,entry){if(A.kinds[entry.id])return B.draw(svg,parent,entry);if(N.kinds[entry.id])return N.draw(svg,parent,entry);const holder=svg('g',{transform:'scale(.5)'},parent),photo=svg('g',{},holder),bg=svg('g',{},holder),fg=svg('g',{},holder),actorLayer=svg('g',{},holder);drawSvg(svg,bg,background(kinds[entry.id]));parent.setAttribute('viewBox','0 0 400 230');return {mini:true,game:kinds[entry.id],svg,parent,photo,bg,fg,actorLayer,disposed:false,renderer:null,latest:null};}
 function resize(refs,host){
  if(refs.disposed)return;const rect=host.getBoundingClientRect(),height=rect.width>0?Math.round(800*rect.height/rect.width):460;refs.height=height;
  if(refs.art){refs.renderer?.app.renderer.resize(800,height);refs.renderer?.backdrop?.clear().rect(0,0,800,height).fill(0xf6f0df);paint(refs,refs.latest);return;}
  if(refs.wugong){refs.renderer?.app.renderer.resize(800,height);refs.renderer?.backdrop?.clear().rect(0,0,800,height).fill(refs.game==='altar'?0xe9e4d0:0xdce6dc);paint(refs,refs.latest);return;}
  refs.renderer?.app.renderer.resize(800,height);refs.parent.setAttribute('viewBox','0 0 400 '+height/2);for(const layer of [refs.photo,refs.bg,refs.fg])layer.setAttribute('transform','scale(1 '+height/460+')');paint(refs,refs.latest);
 }
 async function mount(refs,P,host,asset,kiteAsset,grassAsset){
  if(!refs?.mini)return false;resize(refs,host);if(globalThis.ResizeObserver){refs.resizeObserver=new globalThis.ResizeObserver(()=>resize(refs,host));refs.resizeObserver.observe(host);}
  if(!P?.Application)return false;let app;
  try{app=new P.Application();await app.init({width:800,height:refs.height||460,resolution:Math.min(2,globalThis.devicePixelRatio||1),autoDensity:true,antialias:true,autoStart:false,preference:'webgl',backgroundAlpha:0});if(refs.disposed){app.destroy(true,{children:true});return false;}
   const bg=new P.Graphics(),fg=new P.Graphics();app.stage.addChild(bg,fg);if(!refs.art)drawPixi(P,bg,background(refs.latest.game));app.canvas.className='mini-game-canvas';app.canvas.setAttribute('aria-hidden','true');host.appendChild(app.canvas);refs.renderer={app,fg,P,texture:null,kiteTexture:null,kite:null};
   if(refs.art){
    const renderer=refs.renderer;renderer.backdrop=bg;renderer.art=B.createScene(P,app,refs.game);fg.visible=false;bg.clear().rect(0,0,800,refs.height||800).fill(0xf6f0df);app.canvas.setAttribute('data-ready','false');
    Promise.allSettled([['scene',asset],['actor',kiteAsset]].map(async([kind,item])=>{if(!item)return;const e=await item.promise;if(refs.disposed||refs.renderer!==renderer||e.state!=='ready')return;await renderer.art.install(kind,e);})).then(()=>{if(refs.disposed||refs.renderer!==renderer)return;app.canvas.setAttribute('data-ready',renderer.art.ready?'true':'false');paint(refs,refs.latest);});
    app.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();disposeRenderer(refs);paint(refs,refs.latest);});paint(refs,refs.latest);return true;
   }
   if(refs.wugong){
    const renderer=refs.renderer;renderer.backdrop=bg;renderer.wugong=N.createScene(P,app,refs.game);fg.visible=false;bg.clear().rect(0,0,800,refs.height||460).fill(refs.game==='altar'?0xe9e4d0:0xdce6dc);app.canvas.setAttribute('data-ready','false');
    Promise.allSettled([['scene',asset],['actor',kiteAsset],['front',grassAsset]].map(async([kind,item])=>{
     if(!item)return;const e=await item.promise;if(refs.disposed||refs.renderer!==renderer||e.state!=='ready')return;
     if(kind==='scene')refs.aspect=(e.image.naturalWidth||e.image.width)/(e.image.naturalHeight||e.image.height);
     if(kind==='actor')for(const [i,node]of refs.hiker.entries()){const w=(e.image.naturalWidth||e.image.width),h=(e.image.naturalHeight||e.image.height);node.setAttribute('viewBox',(i*w/3)+' 0 '+w/3+' '+h);const image=node.querySelector('image');image.setAttribute('width',w);image.setAttribute('height',h);}
     await renderer.wugong.install(kind,e);
    })).then(()=>{if(refs.disposed||refs.renderer!==renderer)return;app.canvas.setAttribute('data-ready',renderer.wugong.ready?'true':'false');paint(refs,refs.latest);});
    app.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();disposeRenderer(refs);paint(refs,refs.latest);});paint(refs,refs.latest);return true;
   }
   if(refs.latest.game==='wind'&&W){
    refs.renderer.wind=W.create(P,app);app.stage.addChild(fg);
app.canvas.setAttribute('data-ready','false');
    const pending=[['scene',asset],['kite',kiteAsset],['grass',grassAsset]].map(async([kind,item])=>{if(!item)return;const e=await item.promise;if(refs.disposed||!refs.renderer)return;if(e.state==='ready'){
     if(kind==='scene'){refs.svg('image',{href:e.file,width:800,height:460,preserveAspectRatio:'xMidYMid slice'},refs.photo);refs.bg.setAttribute('opacity',0);}
     if(kind==='kite'){refs.painted=true;refs.kiteSvg=refs.svg('image',{href:e.file,x:-95,y:-63,width:190,height:126},refs.actorLayer);}
     await refs.renderer.wind.install(kind,e);
    }});
    Promise.allSettled(pending).then(()=>{if(refs.disposed||!refs.renderer)return;app.canvas.setAttribute('data-ready','true');paint(refs,refs.latest);});
    app.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();disposeRenderer(refs);paint(refs,refs.latest);});paint(refs,refs.latest);return true;
   }
   if(Q&&Q.assets[refs.game]){
    refs.renderer.water=Q.create(P,app,refs.game,{gates,rocks,rockShapes:background('creek',true),drawPixi});app.canvas.setAttribute('data-ready','false');
    Promise.allSettled([['scene',asset],['actor',kiteAsset],['stone',grassAsset]].map(async([kind,item])=>{
     if(!item)return;const e=await item.promise;if(refs.disposed||!refs.renderer||e.state!=='ready')return;
     if(kind==='scene'){refs.svg('image',{href:e.file,width:800,height:460,preserveAspectRatio:'xMidYMid slice'},refs.photo);if(refs.game==='creek')drawSvg(refs.svg,refs.bg,background('creek',true));else refs.bg.setAttribute('opacity',.10);}
     if(kind==='actor'){refs.painted=true;const width=refs.game==='creek'?79:Q.cup.width,height=width*(e.image.naturalHeight||e.image.height)/(e.image.naturalWidth||e.image.width);refs.waterActorSvg=refs.svg('image',{href:e.file,x:-width/2,y:refs.game==='creek'?-height/2:-height*Q.cup.anchorY,width,height},refs.actorLayer);}
     await refs.renderer.water.install(kind,e);
    })).then(()=>{if(refs.disposed||!refs.renderer)return;if(refs.renderer.water.ready){bg.visible=false;fg.visible=false;}else refs.renderer.water.root.visible=false;app.canvas.setAttribute('data-ready',refs.renderer.water.ready?'true':'false');paint(refs,refs.latest);});
    app.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();disposeRenderer(refs);paint(refs,refs.latest);});paint(refs,refs.latest);return true;
   }
   if(asset&&refs.latest.game!=='creek')asset.promise.then(e=>{if(refs.disposed||!refs.renderer||e.state!=='ready')return;try{const texture=P.Texture.from(e.image,true),sprite=new P.Sprite(texture);sprite.width=800;sprite.height=460;app.stage.addChildAt(sprite,0);bg.alpha=refs.latest.game==='wind'?0:.14;refs.renderer.texture=texture;refs.svg('image',{href:e.file,width:800,height:460,preserveAspectRatio:'xMidYMid slice'},refs.photo);refs.bg.setAttribute('opacity',refs.latest.game==='wind'?0:.14);paint(refs,refs.latest);}catch(_){/* The complete vector scene remains playable if upload fails. */}});
   if(kiteAsset&&refs.latest.game==='wind')kiteAsset.promise.then(e=>{if(refs.disposed||!refs.renderer||e.state!=='ready')return;try{const texture=P.Texture.from(e.image,true),kite=new P.Sprite(texture);kite.anchor.set(.5,.5);kite.width=174;kite.height=174*texture.height/texture.width;app.stage.addChild(kite);refs.renderer.kiteTexture=texture;refs.renderer.kite=kite;refs.painted=true;refs.kiteSvg=refs.svg('image',{href:e.file,x:-87,y:-58,width:174,height:116},refs.actorLayer);paint(refs,refs.latest);}catch(_){}});
   app.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();disposeRenderer(refs);if(refs.latest)drawSvg(refs.svg,refs.fg,foreground(refs.latest,refs.painted));});paint(refs,refs.latest);return true;
  }catch(_){if(refs.renderer)disposeRenderer(refs);else try{app?.destroy(true,{children:true});}catch(_){}paint(refs,refs.latest);return false;}
 }
 function disposeRenderer(refs){const r=refs.renderer;refs.renderer=null;if(r){try{r.art?.dispose();r.wind?.dispose();r.water?.dispose();r.wugong?.dispose();}catch(_){}try{r.app.destroy(true,{children:true});}catch(_){}try{r.texture?.destroy(true);r.kiteTexture?.destroy(true);}catch(_){}} }
 function dispose(refs){if(!refs?.mini)return;refs.disposed=true;refs.resizeObserver?.disconnect();disposeRenderer(refs);}
 function paint(refs,s){if(!refs||refs.disposed||!s)return;refs.latest=s;if(refs.art){if(refs.renderer?.art?.ready){try{refs.renderer.art.paint(s);refs.renderer.app.render();return;}catch(_){disposeRenderer(refs);}}B.paintFallback(refs,s);return;}if(refs.wugong){if(refs.renderer?.wugong?.ready){try{refs.renderer.wugong.paint(s);refs.renderer.app.render();return;}catch(_){disposeRenderer(refs);}}N.paintFallback(refs,s);return;}const tilt=s.play.reduced?0:clamp(s.actor.vy*1.6,-.23,.23)+Math.sin(s.age*2.1)*.025;if(refs.waterActorSvg)refs.actorLayer.setAttribute('transform',`translate(${s.actor.x*800} ${s.actor.y*(refs.height||460)}) rotate(${s.play.reduced||s.game==='rain'?0:tilt*180/Math.PI})`);if(refs.renderer?.water?.ready){try{refs.renderer.water.paint(s);refs.renderer.app.render();return;}catch(_){disposeRenderer(refs);}}if(refs.kiteSvg)refs.actorLayer.setAttribute('transform',`translate(${s.actor.x*800} ${s.actor.y*(refs.height||460)-8}) rotate(${tilt*180/Math.PI})`);if(refs.renderer?.wind?.hasKite){try{refs.renderer.fg.visible=false;refs.renderer.wind.paint(s);refs.renderer.app.render();return;}catch(_){disposeRenderer(refs);}}const shapes=foreground(s,refs.painted);if(refs.renderer?.water&&!refs.renderer.water.ready)drawSvg(refs.svg,refs.fg,shapes);if(refs.renderer){try{drawPixi(refs.renderer.P,refs.renderer.fg,shapes);if(refs.renderer.kite){refs.renderer.kite.position.set(s.actor.x*800,s.actor.y*460-8);refs.renderer.kite.rotation=tilt;refs.renderer.kite.scale.x=174/refs.renderer.kite.texture.width*(s.play.reduced?1:1+Math.sin(s.age*2.1)*.018); }if(refs.renderer.wind){refs.renderer.fg.visible=!refs.renderer.wind.hasKite;refs.renderer.wind.paint(s);}refs.renderer.app.render();}catch(_){disposeRenderer(refs);drawSvg(refs.svg,refs.fg,shapes);}}else drawSvg(refs.svg,refs.fg,shapes);}
 const owner=s=>s?.game==='wind'?K:A.assets[s?.game]?A:N.assets[s?.game]?N:null;
 function enhance(base){return {...base,
  create:(e,o)=>A.kinds[e.id]?A.create(e,o):N.kinds[e.id]?N.create(e,o):kinds[e.id]?create(e,o):base.create(e,o),
  act:(s,p)=>owner(s)?owner(s).input(s,p):s.game?input(s,p):base.act(s,p),
  move:(s,p)=>owner(s)?owner(s).input(s,p,'move'):s.game?input(s,p,'move'):base.move(s,p),
  release:s=>owner(s)?owner(s).release(s):s.game?{...s,dragging:false}:base.release(s),
  tick:(s,dt)=>owner(s)?owner(s).tick(s,dt):s.game?tick(s,dt):base.tick(s,dt),
  draw:(svg,p,e)=>A.kinds[e.id]?B.draw(svg,p,e):N.kinds[e.id]?N.draw(svg,p,e):kinds[e.id]?draw(svg,p,e):base.draw(svg,p,e),
  paint:(r,s,reduced)=>s.game?paint(r,s):base.paint(r,s,reduced),
  instruction:e=>e.id==='meadow-bird'?K.prompt:A.prompts[kinds[e.id]]||N.prompts[kinds[e.id]]||prompts[kinds[e.id]]||base.instruction(e),
  status:s=>s.game?s.feedback:base.status(s),
  outcome:(s,e)=>s.game?{id:s.id,edition:e.edition,earned:s.play.complete,interaction:s.gesture,memory:e.memory+(s.play.complete?((s.game==='wind'?K.result:null)||A.results[s.game]||N.results[s.game]||results[s.game]):'我试着与这里的风雨玩了一会儿，下次再来。'),title:s.play.complete?e.tag:e.name}:base.outcome(s,e)};}

 return {artAssets:A.assets,artFlow:A.sample,artKey:A.key,artRouteAssets:route=>Object.entries(A.assets).filter(([game])=>A.routes[game]===route).flatMap(([,group])=>Object.values(group)),wugongAssets:N.assets,wugongFlow:N.sample,point:(refs,p)=>refs?.art?A.point(refs,p):refs?.wugong?N.point(refs,p):p,waterAssets:Q.assets,waterFlow:Q.sample,flow:W.sample,finishDuration:s=>A.assets[s.game]?A.finishDuration(s):N.assets[s.game]?N.finishDuration(s):s.game==='wind'?W.finishDuration(s):Q.finishDuration(s),kinds,prompts,results,gates,windLevels,windNames,windTarget,rocks,create,input,tick,background,foreground,drawPixi,resize,mount,dispose,enhance};
}));
