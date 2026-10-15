(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailMomentPlay=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const TYPES={
  'meadow-bird':'follow','meadow-butterfly':'sweep','meadow-flower':'align',
  'gorge-goat':'wait','gorge-eagle':'follow','gorge-sparkle':'echo',
  'snow-tracks':'trail','snow-lichen':'inspect','snow-light':'align',
  'coast-sand':'sand','coast-shell':'turn','coast-pier':'settle',
  'valley-moss':'inspect','valley-bridge':'guide','valley-reflection':'settle',
  'bamboo-drop':'rhythm','bamboo-step':'trail','bamboo-leaf':'place',
  'westlake-stones':'echo','westlake-floating-leaf':'guide','westlake-tea':'turn','westlake-leaf-shadow':'align','westlake-eaves':'rhythm','westlake-basket':'rhythm'
 };
 const LABELS={follow:'跟随飞鸟',sweep:'拨开云影',align:'接住一束光',wait:'安静相遇',echo:'点亮水声',trail:'循迹发现',inspect:'放大微世界',sand:'给潮水留一笔',turn:'换个角度看',settle:'等水面安静',guide:'送落叶过溪',rhythm:'接一小段雨',place:'把叶子安放好'};
 const PROMPTS={follow:'轻移视线，让小鸟在光圈里停一会儿。',sweep:'往两边拨开云影，看看藏在后面的山脊。',align:'移动光斑，让它落在发亮的轮廓上。',wait:'停住指尖，安静等它转过头来。',echo:'点点不同的溪石，听水声一远一近。',trail:'从最近的一处开始，点亮下一段足迹。',inspect:'移动小透镜，在亮边的位置停一下。',sand:'在湿沙上随手画一笔，放开后让潮水收走。',turn:'左右轻划，换个角度看细细的纹理。',settle:'碰一下水面，再停住指尖，等倒影慢慢回来。',guide:'顺着亮起的水路，把落叶送过弯。',rhythm:'一下一下轻点，让雨滴奏出你的小节奏。',place:'把竹叶移到石头的浅浅凹处，让风轻轻经过。'};
 const RESULTS={follow:'它在我的视线里掠过，草尖的风像也慢了一点。',sweep:'云影被拨开，藏着的山脊一点点露出来。',align:'那一束光刚好落在眼前，细小的轮廓都亮了起来。',wait:'我停住了动作，它终于放松下来，转头看了我一眼。',echo:'我点过不同的溪石，水声像在一近一远地回答。',trail:'我按顺序看清了那一小段痕迹，下一段路在转角出现。',inspect:'透镜里有一个细小的绿色世界，纹理比想象中更丰富。',sand:'我在湿沙上留了一笔，下一道潮水轻轻把它收走。',turn:'换个角度，纹理和光泽就不一样了。我把它留在原处。',settle:'我停止搅动水面，倒着的山慢慢回到眼前。',guide:'落叶沿着弯弯的水路过去，终于转过了那块石头。',rhythm:'几滴雨跟着我的节奏落下，短短一段，只在这次旅程里响过。',place:'竹叶停在石头浅浅的凹处，风经过，它也没有再滑走。'};
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
 const type=entry=>TYPES[entry.id];
 const points=s=>s.play?.type==='guide'?[{x:.34,y:.82},{x:.52,y:.76},{x:.73,y:.7}]:s.id==='bamboo-step'?[{x:.27,y:.79},{x:.49,y:.57},{x:.7,y:.34}]:[{x:.34,y:.8},{x:.52,y:.59},{x:.65,y:.37}];
 function target(s){
  if(s.play.type==='trail'||s.play.type==='guide')return points(s)[Math.min(2,s.play.step)];
  if(s.play.type==='echo')return {x:[.1875,.5,.8125][Math.min(2,s.play.step)],y:.6};
  if(s.play.type==='rhythm')return {x:[.38,.5,.62][Math.min(2,s.play.step)],y:.65};
  if(s.play.type==='follow')return {x:.59+Math.sin((s.play.reduced?0:s.age)*.55)*.07,y:.43+Math.sin((s.play.reduced?0:s.age)*.8)*.05};
  if(s.play.type==='inspect')return {x:.55,y:.55};
  if(s.play.type==='place')return {x:.67,y:.66};
  return {x:.68,y:.55};
 }
 function create(entry,{reduced=false}={}){return {type:type(entry),progress:0,step:0,still:0,travel:0,turn:0,events:[],lastInput:-1,complete:false,completedAt:null,assisted:false,reduced};}
 function complete(p,age){return {...p,progress:1,complete:true,completedAt:age};}
 function input(s,point={},mode='tap'){
  if(!s.play||s.done)return s;const old=s.play;if(mode==='tap'&&s.age-old.lastInput<.12)return s;
  let x=clamp(point.x??.5),y=clamp(point.y??.56),p={...old,events:old.events.slice()},t=target(s);
  // A keyboard/switch activation operates the next focusable object, without requiring a pointer.
  if(point.assist){x=t.x;y=t.y;p.assisted=true;}
  const delta=Math.hypot(x-s.x,y-s.y);p.lastInput=s.age;
  if(['wait','settle'].includes(p.type)){if(delta>.025||mode==='tap'){p.still=0;p.progress=0;p.complete=false;p.completedAt=null;}}
  if(p.type==='sweep'){p.travel=clamp(p.travel+(point.assist?.6:mode==='move'?Math.abs(x-s.x):.09),0,2);p.progress=clamp(p.travel/.65);}
  if(p.type==='turn'){p.turn=clamp(p.turn+(point.assist?.38:mode==='move'?(x-s.x)*1.8:.08),-1,1);p.progress=Math.max(p.progress,clamp(Math.abs(p.turn)/.6));}
  if(p.type==='sand'&&mode==='move'){p.progress=clamp(p.progress+delta*1.4);}
  if(p.type==='sand'&&point.assist){p.progress=1;}
  if(['trail','guide','place'].includes(p.type)&&Math.hypot(x-t.x,y-t.y)<.16){
   if(p.type==='place')p.progress=1;
   else{p.step=Math.min(3,p.step+1);p.progress=p.step/3;}
  }
  if(['echo','rhythm'].includes(p.type)&&mode==='tap'){
   const zone=Math.min(2,Math.floor(x*3));
   if(p.type==='echo'){const notes=new Set(p.events.map(e=>e.zone));notes.add(point.assist?p.step%3:zone);p.progress=notes.size/3;p.step=notes.size;}
   else{p.step=Math.min(3,p.step+1);p.progress=p.step/3;}
   p.events=[...p.events,{age:s.age,x,y,zone:point.assist?Math.max(0,p.step-1):zone}].slice(-6);
  }
  if(!p.complete&&p.progress>=1&&p.type!=='sand')p=complete(p,s.age);
  return {...s,x,y,play:p};
 }
 function tick(s,dt){
  if(!s.play)return s;let p={...s.play};const t=target(s),near=Math.hypot(s.x-t.x,s.y-t.y)<.16;
  if(p.type==='wait'||p.type==='settle'){p.still=Math.min(3,p.still+dt);p.progress=clamp(p.still/(p.type==='wait'?1.8:2.2));}
  if(['align','inspect','follow'].includes(p.type)&&s.acted){p.still=near?p.still+dt:Math.max(0,p.still-dt*.6);p.progress=clamp(p.still/(p.type==='follow'?.65:.55));}
  if(p.type==='sand'&&s.acted&&!s.dragging&&p.progress>.15&&s.age-p.lastInput>2)p=complete(p,s.age);
  if(!p.complete&&p.progress>=1&&p.type!=='sand')p=complete(p,s.age);return {...s,play:p};
 }
 function instruction(entry){return PROMPTS[type(entry)];}
 function status(s){if(s.play?.complete)return '这一刻刚刚好，留在手帐里。';if(s.play?.type==='wait')return s.play.still>.7?'它放松了一点，再安静一会儿。':'停住指尖，给它一点时间。';if(s.play?.type==='settle')return s.play.still>.8?'水纹变浅了，远山正在回来。':'水纹散开了，停一会儿看看。';if(s.play?.type==='trail')return s.play.step?'下一处痕迹亮起来了。':'从最近的一处痕迹开始。';if(s.play?.type==='rhythm')return s.play.step?'再轻点一下，让下一滴接上。':'点一下，雨声就从这里开始。';return s.acted?'可以继续试一试，也可以随时继续走。':'也可以静静看一会儿，或用回车键慢慢体验。';}
 function memory(s,entry){if(!s.acted)return entry.memory+(s.play.complete&&['wait','settle'].includes(s.play.type)?RESULTS[s.play.type]:'我没有碰它，只安静看了一会儿。');return entry.memory+(s.play.complete?RESULTS[s.play.type]:'我试着'+LABELS[s.play.type]+'，把这段还没看完的小景物留在了旅程里。')+(s.gesture==='drag'?'指尖也跟着风景慢慢走了一小段。':'我停下来，多留意了这一刻。');}
 const CUSTOM=new Set(['sand','turn','inspect','trail','place','echo']);
 function custom(entry){return entry.route!=='westlake'&&CUSTOM.has(type(entry));}
 function draw(svg,parent,entry){
  const add=(tag,attrs={},p=parent)=>svg(tag,attrs,p),path=(d,fill,stroke='none',w=1,p=parent)=>add('path',{d,fill,stroke,'stroke-width':w,'stroke-linejoin':'round','stroke-linecap':'round'},p);
  const refs={kind:entry.interaction,custom:true},green=entry.route==='aotai'?'#b4c6b7':'#9db587';add('rect',{width:400,height:230,fill:entry.route==='maclehose'?'#e7dbb8':'#edf0dd'});
  if(type(entry)==='sand'){
   path('M0 0H400V63Q254 38 0 75Z','#9cc3b7');path('M0 77Q160 41 400 66','none','#f7f3da',4);path('M0 95Q194 56 400 94V230H0Z','#d4c49e');
   for(let i=0;i<45;i++)add('ellipse',{cx:(i*71)%399,cy:104+(i*17)%120,rx:i%3?1:2,ry:.8,fill:'#b3a37f',opacity:.55});
  }else if(type(entry)==='turn'){
   add('ellipse',{cx:200,cy:188,rx:92,ry:17,fill:'#aa9f7e',opacity:.16});refs.turn=add('g');
   path('M113 112Q119 55 199 42Q277 52 287 112L220 196Q201 208 179 194Z','#e4ceaa','#b29876',1.3,refs.turn);
   for(let i=-5;i<=5;i++){path(`M200 195Q${200+i*12} 137 ${200+i*16} ${48+Math.abs(i)*7}`,'none',i%2?'#f7e9ce':'#bea27c',1.5,refs.turn);}
   for(let j=0;j<4;j++)path(`M${133-j*4} ${84+j*16}Q200 ${114+j*17} ${266+j*3} ${84+j*16}`,'none','#d3b58c',.8,refs.turn);
   refs.sheen=path('M133 74Q161 56 198 51L215 182L192 191Z','#fff1ce','none',0,refs.turn);
  }else if(type(entry)==='inspect'){
   path('M0 194Q170 152 400 192V230H0Z',green);const g=add('g',{transform:'translate(200 135) rotate(-14)'});if(entry.icon==='moss'){path('M-135-22Q-5-56 133-19L130 31Q0 45-135 23Z','#a3916f','#89997e',1,g);for(let i=0;i<9;i++)path(`M-119 ${-13+i*5}Q-10 ${-28+i*6} 121 ${-11+i*4}`,'none','#c4b697',.8,g);}else{path('M-125 27Q-144-21-92-49Q-14-77 85-38L130 7L106 44Q-18 71-125 27Z','#b7bfa9','#8e9e88',1,g);path('M-109-15Q-33-56 65-28L13-4Z','#d9dac0','none',0,g);path('M-51-34L-31-1L-45 21M35-18L62 9L89 13','none','#98a68d',1,g);}
   for(let i=0;i<32;i++){const x=79+(i*47)%240,y=114+(i*19)%52;path(`M${x} ${y}q-4-8 2-12q5 7 2 14Z`,i%2?'#88a26b':'#b3c28c','#789260',.5);}
   refs.details=add('g');for(let i=0;i<20;i++){const x=185+(i*17)%65,y=105+(i*11)%41;path(`M${x} ${y}v-7m0 4l-4-3m4 4l4-4`,'none',i%2?'#cbdca2':'#587e4e',1.1,refs.details);}
  }else if(type(entry)==='trail'){
   const snow=entry.id==='snow-tracks';path('M0 207Q80 180 148 119T322 14L400 0V230H0Z',snow?'#f6f6e9':'#c4c7aa');
   if(!snow)for(let i=0;i<5;i++){const y=216-i*41;path(`M${35+i*31} ${y}L${276+i*19} ${y-25}v18L${35+i*31} ${y+20}Z`,'#b3b69b','#879a7b',.8);}
   refs.steps=[];const dummy={id:entry.id};for(const [i,p]of points(dummy).entries()){const g=add('g');const x=p.x*400,y=p.y*230;if(snow){for(const offset of [-6,7]){add('ellipse',{cx:x+offset,cy:y+offset,rx:5,ry:8,fill:'#9eafa0'},g);for(const dx of [-3,0,3])add('circle',{cx:x+offset+dx,cy:y+offset-10,r:1.5,fill:'#9eafa0'},g);}}else{path(`M${x-11} ${y-9}q20-12 26 9q-7 14-27 8Z`,'#718f63','#dce3bb',.8,g);}refs.steps.push(g);}
   for(const [x,y]of [[17,70],[365,117],[373,208]])path(`M${x} ${y}v-48m0 28l-12-12m12 6l16-16`,'none','#8fa27e',3);
  }else if(type(entry)==='place'){
   path('M0 93Q190 69 400 113V230H0Z','#a6c7b7');for(let i=0;i<7;i++)path(`M${i*70-20} ${117+i%3*33}q33-9 67 0`,'none','#dfe8cc',1.3);
   path('M178 171Q155 131 197 102Q260 77 319 117L350 179Q306 218 211 201Z','#adb99c','#849780',1.1);path('M198 140Q252 116 301 143Q282 176 223 167Z','#839c87','#c6cfb0',1.2);refs.placeLeaf=add('g');path('M-33 2Q-4-19 36-6Q9 12-33 2Z','#adc18b','#6e9568',1,refs.placeLeaf);path('M-30 2L31-5','none','#e3dfaa',.8,refs.placeLeaf);
  }else if(type(entry)==='echo'){
   path('M0 44Q140 1 400 48V230H0Z','#aacbb7');for(let i=0;i<7;i++)path(`M${i*67-20} ${75+i%3*47}q40-11 75 0`,'none','#e1ecce',1.1);
   refs.stones=[];for(const [i,x]of [75,200,325].entries()){const g=add('g');const y=126+(i%2?17:0);add('ellipse',{cx:x,cy:y+22,rx:43,ry:10,fill:'#63988a',opacity:.2},g);path(`M${x-35} ${y+9}Q${x-47} ${y-14} ${x-12} ${y-33}Q${x+24} ${y-41} ${x+36} ${y+7}Q${x+5} ${y+28} ${x-35} ${y+9}Z`,'#b6bca0','#849b83',1,g);path(`M${x-23} ${y-9}q18-18 38-7`,'none','#e3dfb3',3,g);refs.stones.push(g);}
  }
  return refs;
 }
 function decorate(svg,parent,entry,refs){
  const add=(tag,a={},p=parent)=>svg(tag,a,p),path=(d,fill,stroke='none',w=1,p=parent)=>add('path',{d,fill,stroke,'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round'},p);
  const v={type:type(entry),refs,custom:!!refs.custom};
  if(['follow','align','inspect','guide','place','trail'].includes(v.type)){v.goal=add('ellipse',{cx:270,cy:126,rx:v.type==='inspect'?28:20,ry:v.type==='inspect'?25:14,fill:'none',stroke:'#f9f0bb','stroke-width':2,'stroke-dasharray':'3 4'});}
  if(['trail','guide','echo'].includes(v.type))v.cursor=add('circle',{cx:200,cy:130,r:7,fill:'#f9f1c1',opacity:0});
  if(v.type==='follow'||v.type==='inspect'){v.lens=add('g');add('circle',{r:v.type==='inspect'?36:33,fill:v.type==='inspect'?'#eef1c7':'none','fill-opacity':.25,stroke:'#e8dbab','stroke-width':2},v.lens);path('M24 25L44 45','none','#a5916d',4,v.lens);}
  if(v.type==='inspect'){const defs=add('defs'),clip=add('clipPath',{id:'play-lens-clip',clipPathUnits:'userSpaceOnUse'},defs);add('circle',{r:33},clip);v.zoom=add('g',{'clip-path':'url(#play-lens-clip)'},v.lens);v.zoomPoints=[];for(let i=0;i<32;i++){const x=79+(i*47)%240,y=114+(i*19)%52,g=add('g',{},v.zoom);path('M0 9V-4m0 8l-5-5m5 6l6-6','none',i%2?'#6f985a':'#c0d59b',1.4,g);path('M-4 0Q-10-9-4-10Q2-7-4 0Z','#a4bd7d','#678c56',.5,g);v.zoomPoints.push({g,x,y});}}
  if(v.type==='sweep'){v.clouds=[-1,1].map(side=>{const g=add('g');path('M-90 1Q-106-26-62-31Q-39-63-8-40Q22-66 47-33Q98-39 94-2Q48 31-18 22Q-70 29-90 1Z','#f5f4df','#dce2c9',.8,g);g.side=side;return g;});}
  if(v.type==='sand'){v.ink=path('M0 0','none','#9d8e6d',3);v.foam=path('M0 23Q130-3 230 20T400 15V-100H0Z','#dce9d4','#f9f8df',2);}
  if(v.type==='echo'||v.type==='rhythm'){v.pulses=[0,1,2].map(()=>add('ellipse',{rx:1,ry:1,fill:'none',stroke:'#fff3c0','stroke-width':2,opacity:0}));}
  if(v.type==='rhythm'){v.notes=[0,1,2].map(i=>{const g=add('g');path(`M${143+i*45} 207q12-14 24 0q-12 14-24 0Z`,'#c2caa2','#8ba281',.7,g);return g;});}
  if(v.type==='align'){v.light=add('ellipse',{cx:200,cy:110,rx:38,ry:27,fill:'#fff0b6',opacity:.25});}
  if(v.type==='wait'){v.breath=path('M292 128q7-8 14-4m-10 10q9-6 15-2','none','#f5edc1',1.4);}
  if(v.type==='guide'){v.route=path('M136 189Q161 182 208 175T292 161','none','#e4edcb',1.2);v.route.setAttribute('stroke-dasharray','3 6');}
  return v;
 }
 function paint(v,s,reduced=false){
  const raw=s.play;if(!raw)return;const p={...raw,progress:reduced&&!s.acted?0:raw.progress,complete:reduced&&!s.acted?false:raw.complete};const refs=v.refs,t=target({...s,play:{...p,reduced:reduced||p.reduced}}),progress=clamp(p.progress),r=reduced?0:s.reaction,x=s.x*400,y=s.y*230;
  if(v.cursor){v.cursor.setAttribute('cx',x);v.cursor.setAttribute('cy',y);v.cursor.setAttribute('opacity',s.acted?.5:0);}
  if(v.goal){v.goal.setAttribute('cx',t.x*400);v.goal.setAttribute('cy',t.y*230);v.goal.setAttribute('opacity',p.complete?0:.75);}
  if(v.lens)v.lens.setAttribute('transform',`translate(${s.acted?x:t.x*400} ${s.acted?y:t.y*230})`);
  if(v.type==='follow'&&refs.actor)refs.actor.setAttribute('transform',`translate(${t.x*400} ${t.y*230}) scale(${s.id==='gorge-eagle'?1.2:1})`);
  if(v.type==='sweep'){v.clouds.forEach(g=>g.setAttribute('transform',`translate(${200+g.side*(55+progress*183)} ${92-g.side*12})`));if(refs.actor)refs.actor.setAttribute('opacity',1-progress);}
  if(v.type==='align') {v.light.setAttribute('cx',x);v.light.setAttribute('cy',y);v.light.setAttribute('opacity',p.complete?.65:.28);}
  if(v.type==='inspect'){refs.details?.setAttribute('opacity',.1+progress*.9);v.lens.setAttribute('transform',`translate(${s.acted?x:110} ${s.acted?y:125})`);v.zoomPoints.forEach(a=>a.g.setAttribute('transform',`translate(${(a.x-(s.acted?x:110))*2.4} ${(a.y-(s.acted?y:125))*2.4}) scale(2.4)`));}
  if(v.type==='turn'){
   const angle=p.turn*40;if(refs.turn)refs.turn.setAttribute('transform',`translate(200 130) scale(${1-Math.abs(p.turn)*.18} 1) rotate(${angle}) translate(-200 -130)`);
   if(refs.sheen)refs.sheen.setAttribute('opacity',.15+Math.abs(p.turn)*.6);
   if(refs.leaf)refs.leaf.setAttribute('transform',`rotate(${angle} 200 150) scale(${1-Math.abs(p.turn)*.12} 1)`);
  }
  if(v.type==='trail'&&s.acted){v.goal.setAttribute('stroke',p.step?'#f9f0bb':'#d2c59f');}
  if(v.type==='trail')refs.steps?.forEach((g,i)=>g.setAttribute('opacity',i<p.step?1:i===p.step?.5:.08));
  if(v.type==='sand'){
   const trail=p.assisted?[{x:.25,y:.65},{x:.4,y:.55},{x:.6,y:.72},{x:.73,y:.52}]:s.trail;v.ink.setAttribute('d',trail.length?trail.map((a,i)=>`${i?'L':'M'}${a.x*400} ${90+a.y*130}`).join(' '):'M0 0');
   const wash=s.acted&&!s.dragging?clamp((s.age-p.lastInput-.4)/1.6):0;v.foam.setAttribute('transform',`translate(0 ${reduced?0:wash*212})`);v.foam.setAttribute('opacity',wash>0?.9:0);v.ink.setAttribute('opacity',1-wash);
  }
  if(v.type==='settle'){
   const reflection=refs.effects?.reflection;reflection?.setAttribute('opacity',.15+progress*.8);reflection?.setAttribute('transform',`translate(${reduced?0:Math.sin(r*3)*(1-progress)*12} 0)`);refs.rings?.forEach(g=>g.setAttribute('opacity',s.acted?(1-progress)*.7:0));
  }
  if(v.type==='wait'){if(refs.effects?.head)refs.effects.head.setAttribute('transform',`rotate(${-8+progress*15} 15 -3)`);v.breath.setAttribute('opacity',p.complete?.9:0);}
  if(v.type==='guide'){
   const anchors=[{x:.25,y:.78},...points(s)],a=anchors[Math.min(3,p.step)],leaf=refs.effects?.leaf||refs.leaf;leaf?.setAttribute('transform',`translate(${a.x*400} ${a.y*230}) rotate(${p.step*27})`);v.route.setAttribute('opacity',p.complete?0:.65);
  }
  if(v.type==='place')refs.placeLeaf?.setAttribute('transform',`translate(${s.acted?x:95} ${s.acted?y:79}) rotate(${p.complete?-8:reduced?0:Math.sin(s.age)*8})`);
  if(v.pulses)v.pulses.forEach((g,i)=>{const e=p.events.at(-1-i),age=e?s.age-e.age:9,phase=clamp(age/1.2);g.setAttribute('cx',e?e.x*400:0);g.setAttribute('cy',v.type==='rhythm'?199:e?e.y*230:0);g.setAttribute('rx',reduced?24:10+phase*43);g.setAttribute('ry',reduced?8:3+phase*14);g.setAttribute('opacity',e&&age<1.2?1-phase:0);});
  if(v.type==='rhythm'){refs.effects?.bead?.setAttribute('opacity',p.events.length?0:.85);refs.drops?.forEach((g,i)=>{const e=p.events.at(-1-i),age=e?s.age-e.age:9,phase=clamp(age/.65);g.setAttribute('cx',155+i*45);g.setAttribute('cy',66+phase*133);g.setAttribute('opacity',!reduced&&e&&age<.65?1:0);});}
  if(v.notes)v.notes.forEach((g,i)=>g.setAttribute('opacity',i<p.step?1:.25));
 }
 return {TYPES,LABELS,type,target,points,create,input,tick,instruction,status,memory,custom,draw,decorate,paint};
}));
