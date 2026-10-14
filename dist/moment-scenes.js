(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailMomentScenes=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const palettes={wugong:['#eff0d9','#cad6ad','#8da477','#6e966a'],tiger:['#e6ece1','#bbbd9d','#738c87','#6e958a'],aotai:['#eef2e8','#c9d8cf','#9fbbaf','#678e83'],maclehose:['#eef1df','#e0d4ad','#98c3bf','#76aaa7'],changping:['#e9eedf','#bfceae','#829e82','#659889'],mogan:['#edf0d8','#cbd8ac','#8caa71','#72936a']};
 const instructions={watch:'轻移视线，跟着它看一小段。',breeze:'轻轻划过，让风带着景物动一动。',trace:'沿着纹理轻划，看看藏在表面的细节。',ripple:'轻触或划过水面，看水纹慢慢散开。',drip:'轻碰叶尖，看一滴雨落下。',leaf:'轻触叶片，看看光与叶影。'};
 const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
 function draw(svg,parent,entry){
  const colors=palettes[entry.route]||palettes.wugong,refs={regional:true,kind:entry.interaction,entry};
  const add=(tag,attrs={},p=parent)=>svg(tag,attrs,p),path=(d,fill,stroke='none',w=1,p=parent)=>add('path',{d,fill,stroke,'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round'},p);
  const defs=add('defs'),water=add('linearGradient',{id:'moment-water',x2:0,y2:1},defs);add('stop',{offset:0,'stop-color':'#c1dccc'},water);add('stop',{offset:1,'stop-color':colors[3]},water);
  const sun=add('radialGradient',{id:'moment-sun'},defs);add('stop',{offset:0,'stop-color':'#fff2c0','stop-opacity':.9},sun);add('stop',{offset:1,'stop-color':'#fff2c0','stop-opacity':0},sun);
  add('rect',{width:400,height:230,fill:colors[0]});
  path('M-10 110Q80 31 167 80T420 63V230H-10Z',colors[1]);
  path('M-10 177Q124 97 220 146T420 119V230H-10Z',colors[2]);
  path('M-10 209Q96 169 191 198T420 175V240H-10Z',colors[1]);
  // Delicate background ink and pigment; no labels are baked into the scene.
  for(let i=0;i<12;i++)path(`M${i*39-12} ${179+i%3*18}q12-3 21-1`,'none',colors[3],.65).setAttribute('opacity',.2);
  function rock(x,y,s=1,p=parent){const g=add('g',{transform:`translate(${x} ${y}) scale(${s})`},p);add('ellipse',{cx:2,cy:19,rx:48,ry:9,fill:colors[3],opacity:.18},g);path('M-43 12Q-52-9-27-29Q-8-45 15-33Q41-24 45 9Q26 27-17 24Z','#aebaa1','#819b86',.9,g);path('M-41 4Q-43-19-21-28Q1-40 17-29L-3-7Z','#dde0ba','none',0,g);path('M2-21L8-5L23 3M-16-7L-23 9','none','#8c9d87',.8,g);return g;}
  function sprig(x,y,s=1){const g=add('g',{transform:`translate(${x} ${y}) scale(${s})`});g.baseTransform=`translate(${x} ${y}) scale(${s})`;path('M0 48Q-3 13 2-44','none',colors[3],2.2,g);for(const [xx,yy,angle]of [[0,-27,-18],[0,-1,26],[0,24,-12]]){const leaf=add('g',{transform:`translate(${xx} ${yy}) rotate(${angle})`},g);path('M0 0Q-44-35-77-8Q-50 26 0 0Z','#a9c583',colors[3],.8,leaf);path('M-3 0L-66-7M-19-2L-29-16M-19-2L-33 10M-43-4L-50-18M-43-4L-55 6','none','#dce1ac',.7,leaf);}return g;}
  if(entry.interaction==='watch'){
   if(entry.route==='tiger'){path('M0 155L16 58L46 33L81 143L91 218H0Z','#8d9d91');path('M16 58L46 33L52 97L28 130Z','#c5c9ac');path('M306 230L331 98L371 62L408 151V230Z','#829b93');path('M88 228Q173 151 303 222','none','#a7c9b9',20);}
   refs.actor=add('g');
   if(entry.icon==='goat'){
    path('M-20 1Q-19-13-4-12Q8-14 16-3L20 10Q0 21-20 9Z','#e8d9b2','#a6a381',.8,refs.actor);path('M11-3Q8-19 20-19Q31-15 26-5L23 6Z','#d1bb8b','#999478',.7,refs.actor);path('M17-18Q12-30 19-28M24-18Q32-28 27-30M-13 11L-15 27M-1 15L0 27M15 10L18 26','none','#80795e',2,refs.actor);add('circle',{cx:24,cy:-12,r:1,fill:'#4c6250'},refs.actor);
   }else{
    path('M-7 1Q0-8 10-2L17 1L9 5Q-1 9-7 1Z','#527b69','none',0,refs.actor);refs.wings=[path('M-2 0Q-18-27-38-17Q-24-1-2 4Z','#6b8d79','#537660',.6,refs.actor),path('M3 0Q16-25 36-17Q25-1 3 4Z','#7c9b80','#537660',.6,refs.actor)];path('M-7 2L-19 8L-16 1Z','#537660','none',0,refs.actor);
   }
   refs.focus=add('ellipse',{rx:48,ry:35,fill:'none',stroke:'#e5dfb3','stroke-width':1.2,'stroke-dasharray':'3 5',opacity:0});
   for(let i=0;i<8;i++)path(`M${30+i*47} 229q-2-20 8-31`,'none',colors[3],1);
  }else if(entry.interaction==='breeze'){
   refs.shine=add('ellipse',{cx:218,cy:108,rx:151,ry:98,fill:'url(#moment-sun)',opacity:.1});
   refs.actor=add('g');path('M-74 3Q-81-16-52-19Q-46-39-17-32Q-3-52 20-31Q47-38 53-19Q89-15 71 8Q23 27-32 20Q-68 18-74 3Z','#f8f8e8','#e5e7d2',.7,refs.actor);path('M-64 9Q-11 17 60 8','none','#d4ddce',2,refs.actor);
   refs.plants=[];
   if(entry.route==='mogan'){refs.plants.push(sprig(102,196,1.25));refs.plants.push(sprig(333,208,.82));}
   else for(const [x,y,s]of [[34,208,.85],[89,213,1.1],[290,219,.8],[369,212,1]]){const g=add('g',{transform:`translate(${x} ${y}) scale(${s})`});g.baseTransform=`translate(${x} ${y}) scale(${s})`;path('M0 9Q-2-16-8-37M0 9Q7-8 19-22M0 9L3-42','none',colors[3],1.5,g);path('M-8-24Q-22-30-19-38Q-9-38-8-24Z M10-11Q28-28 31-22Q25-7 10-11Z',colors[2],colors[3],.5,g);refs.plants.push(g);}
  }else if(entry.interaction==='trace'){
   const mask=add('mask',{id:'moment-reveal',maskUnits:'userSpaceOnUse'},defs);add('rect',{width:400,height:230,fill:'black'},mask);refs.reveal=add('path',{d:'M0 0',fill:'none',stroke:'white','stroke-width':42,'stroke-linecap':'round','stroke-linejoin':'round'},mask);
   const base=add('g'),details=add('g',{mask:'url(#moment-reveal)'});refs.focus=add('ellipse',{cx:200,cy:130,rx:110,ry:64,fill:'url(#moment-sun)',opacity:0});
   if(entry.icon==='shell'){
    path('M0 186Q181 160 400 187V230H0Z','#e2d7b5','none',0,base);path('M137 123Q142 83 196 76Q257 80 267 123L217 188Q202 197 187 185Z','#e5d4ae','#b7a081',1.2,base);
    for(let i=-4;i<5;i++)path(`M203 185Q${203+i*10} 142 ${203+i*14} ${82+Math.abs(i)*5}`,'none',i%2?'#f5ead0':'#c1a681',2,details);
    for(const [x,y]of [[121,192],[298,174],[325,209]])add('ellipse',{cx:x,cy:y,rx:3.5,ry:2,fill:'#bfb798'});
   }else if(entry.icon==='steps'){
    for(let i=0;i<4;i++){const y=81+i*35;path(`M70 ${y}H331V${y+25}H70Z`,i%2?'#b9baa0':'#c6c7ac','#919e83',.7,base);path(`M85 ${y+4}Q181 ${y-1} 316 ${y+5}`,'none','#e1dfc0',1,base);path(`M112 ${y+9}Q146 ${y+2} 166 ${y+8}L165 ${y+15}Q140 ${y+11} 111 ${y+17}Z`,'#89a275','none',0,details);}
   }else if(entry.icon==='tracks'){
    path('M0 150Q130 108 234 146T400 132V230H0Z','#f1f4e7','none',0,base);
    for(let i=0;i<6;i++){const x=135+i*23,y=191-i*18;add('ellipse',{cx:x+(i%2?13:0),cy:y,rx:5,ry:8,fill:'#9eafa5',transform:`rotate(24 ${x} ${y})`},details);for(const dx of [-4,0,4])add('circle',{cx:x+(i%2?13:0)+dx,cy:y-9,r:1.6,fill:'#9eafa5'},details);}
   }else{
    const stone=rock(201,145,1.4,base);if(entry.icon==='moss'){path('M119 156L289 113','none','#9c8967',25,base);path('M130 155L281 119','none','#c0ad85',2,base);}
    for(const [x,y,r]of [[164,123,13],[193,139,18],[232,117,14],[247,151,11]]){add('ellipse',{cx:x,cy:y,rx:r,ry:r*.65,fill:'#89a878'},details);path(`M${x-r*.5} ${y}q${r*.4}-8 ${r} -3`,'none','#c0d29a',1,details);}
   }
   refs.revealDetail=details;
  }else if(entry.interaction==='drip'||entry.interaction==='leaf'){
   path('M0 199Q175 172 400 203V230H0Z','#b3cdb6');refs.actor=sprig(219,110,1.3);
   rock(110,194,.55);refs.drops=[0,1,2].map(()=>add('ellipse',{cx:188,cy:111,rx:2.8,ry:5,fill:'#85b6ac',opacity:0}));refs.rings=[0,1].map(()=>add('ellipse',{cx:188,cy:207,rx:0,ry:0,fill:'none',stroke:'#f3f5de','stroke-width':1.2,opacity:0}));
   refs.shine=add('ellipse',{cx:229,cy:112,rx:111,ry:85,fill:'url(#moment-sun)',opacity:.2});
  }else{
   path('M0 119Q164 89 400 129V230H0Z','url(#moment-water)');
   if(entry.route==='maclehose'){
    path('M-10 186Q142 144 264 190T412 175V230H-10Z','#e0d1a6');path('M-10 183Q142 141 264 187T412 172','none','#f7f3d8',3);if(entry.icon==='pier'){path('M64 72H320L335 91H70Z','#b4a17d','#847f64',1);for(const x of [91,289]){path(`M${x} 87L${x-3} 166`,'none','#8b9074',9);path(`M${x-2} 174L${x+1} 198`,'none','#6c9d94',5).setAttribute('opacity',.6);}}
   }else if(entry.icon==='reflection'){
    path('M64 124L157 68L211 127Z','#8baca0');path('M64 139L157 190L211 141Z','#bad5c3');path('M42 134Q160 130 241 138','none','#dfe9ce',2);
   }else rock(88,137,.75);
   refs.rings=[0,1,2].map(()=>add('ellipse',{rx:0,ry:0,fill:'none',stroke:'#f4f6db','stroke-width':1.5,opacity:0}));
  }
  return refs;
 }
 function paint(refs,s,reduced=false){
  const t=reduced?0:s.age,response=clamp(s.distance*2.2+.25),gesture=s.gesture==='drag';
  if(refs.kind==='watch'){
   const x=refs.entry.icon==='goat'?248:239+Math.sin(t*.55)*28,y=refs.entry.icon==='goat'?143:100+Math.sin(t*.8)*12;
   refs.actor.setAttribute('transform',`translate(${x} ${y}) scale(${refs.entry.icon==='eagle'?1.2:1})`);
   for(const [i,wing]of (refs.wings||[]).entries())wing.setAttribute('transform',`rotate(${reduced?0:Math.sin(t*5)*(i?9:-9)})`);
   refs.focus.setAttribute('cx',gesture?70+s.x*260:x);refs.focus.setAttribute('cy',gesture?50+s.y*140:y);refs.focus.setAttribute('opacity',s.acted?.72:0);
  }else if(refs.kind==='breeze'){
   refs.actor.setAttribute('transform',`translate(${205+(s.acted?(s.x-.5)*115:Math.sin(t*.3)*8)} ${74+(s.acted?(s.y-.5)*19:0)})`);
   refs.shine.setAttribute('opacity',s.acted?.28+response*.58:.1);
   for(const plant of refs.plants)plant.setAttribute('transform',`${plant.baseTransform} rotate(${reduced?0:s.acted?(s.x-.5)*13:Math.sin(t)*1.8})`);
  }else if(refs.kind==='trace'){
   const trail=s.trail?.length?s.trail:[{x:s.x,y:s.y},{x:s.x+.001,y:s.y}];refs.reveal.setAttribute('d',trail.map((p,i)=>`${i?'L':'M'}${p.x*400} ${p.y*230}`).join(' '));refs.reveal.setAttribute('stroke-width',s.acted?gesture?46:74:0);refs.focus.setAttribute('opacity',s.acted?.2:0);
  }else if(refs.kind==='ripple'){
   for(const [i,ring]of refs.rings.entries()){const phase=clamp((s.reaction-i*.25)/2.7);ring.setAttribute('cx',50+s.x*300);ring.setAttribute('cy',123+s.y*66);ring.setAttribute('rx',reduced?40:8+phase*94);ring.setAttribute('ry',reduced?11:2+phase*21);ring.setAttribute('opacity',s.acted&&s.reaction>=i*.25?1-phase:0);}
  }else{
   refs.actor?.setAttribute('transform',`translate(219 110) scale(1.3) rotate(${reduced?0:s.acted?Math.sin(s.reaction*3)*5*Math.exp(-s.reaction*.6):Math.sin(t)*.5})`);
   refs.drops?.forEach((drop,i)=>{const age=s.reaction-i*.7,phase=clamp(age/.7);drop.setAttribute('cy',111+phase*91);drop.setAttribute('opacity',s.acted&&age>=0&&age<.7?1:0);});
   refs.rings?.forEach((ring,i)=>{const phase=clamp((s.reaction-.7-i*.7)/1.2);ring.setAttribute('rx',phase*38);ring.setAttribute('ry',phase*9);ring.setAttribute('opacity',s.acted&&phase>0?1-phase:0);});refs.shine?.setAttribute('opacity',s.acted?.65:.2);
  }
 }
 function outcome(s,entry){
  const verbs={watch:s.gesture==='drag'?'我顺着它的方向，慢慢移开视线。':'我停下脚步，看它在远处活动。',breeze:s.gesture==='drag'?'我轻轻划过画面，风和光像也跟着换了方向。':'我停了一下，风把景物轻轻带动。',trace:s.gesture==='drag'?'我沿着表面的纹理慢慢看过去，细节一点点显出来。':'我把目光落在一小块细节上。',ripple:s.gesture==='drag'?'我轻划水面，看涟漪顺着指尖的方向散开。':'我点了一下水面，看一圈水纹慢慢散开。',drip:'我停下来看一滴雨落下，听见了细细的一声。',leaf:'我轻轻碰了一下叶子，光从叶脉间透出来。'};
  return {id:s.id,title:entry.name,memory:entry.memory+(s.acted?(verbs[s.kind]||'我停下来看了一会儿。'):'我没有碰它，只安静看了一会儿。'),interaction:s.gesture};
 }
 return {draw,paint,outcome,instructions};
}));
