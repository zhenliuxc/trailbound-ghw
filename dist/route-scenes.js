(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailRouteScenes=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
 function draw(svg,parent,e){
  const add=(tag,a={},p=parent)=>svg(tag,a,p),path=(d,fill='none',stroke='none',width=1,p=parent)=>add('path',{d,fill,stroke,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round'},p);
  const refs={custom:true,story:true,kind:e.interaction,scene:e.scene,entry:e,effects:{},plants:[],screens:[]};
  const defs=add('defs'),water=add('linearGradient',{id:'route-water',x2:0,y2:1},defs);add('stop',{offset:0,'stop-color':'#bfd8c3'},water);add('stop',{offset:1,'stop-color':'#79aaa3'},water);
  const glow=add('radialGradient',{id:'route-glow'},defs);add('stop',{offset:0,'stop-color':'#fff1b4','stop-opacity':.9},glow);add('stop',{offset:1,'stop-color':'#fff1b4','stop-opacity':0},glow);
  add('rect',{width:400,height:230,fill:'#edf1df'});
  const world=add('g');refs.world=world;
  function hill(d,color,p=world){return path(d,color,'none',0,p);}
  function mountain(x,y,s=1,p=world,snow=true){const g=add('g',{transform:`translate(${x} ${y}) scale(${s})`},p);path('M-118 80L-42-8L-14 24L27-43L118 80Z','#91afa2','#7e9e92',.6,g);path('M-67 22L-42-8L-22 15L-43 9Z M-3-6L27-43L62-1L31-13L16 2Z',snow?'#f7f6e5':'#b9c9a9','none',0,g);path('M27-43L13 40L47 65L118 80Z','#73988f','none',0,g);return g;}
  function stone(x,y,s=1,p=world,color='#aeb89d'){const g=add('g',{transform:`translate(${x} ${y}) scale(${s})`},p);add('ellipse',{cx:0,cy:22,rx:43,ry:9,fill:'#5e8977',opacity:.15},g);path('M-42 13L-33-17L-6-32L29-23L46 12L25 26L-24 25Z',color,'#81957f',.8,g);path('M-33-17L-6-32L29-23L5-3L-42 13Z','#d9dabb','none',0,g);path('M-6-32L5-3L25 26M5-3L46 12','none','#98a58d',.8,g);return g;}
  function pine(x,y,s=1,p=world){const g=add('g',{transform:`translate(${x} ${y}) scale(${s})`},p);path('M0 31V-63','none','#6c8266',3,g);path('M0-67L-19-30H-9L-28-2H-16L-35 28H35L16-2H28L9-30H19Z','#799e7d','none',0,g);path('M0-57L-12-32H10Z M-4-20L-23 3H-1Z','#afc09a','none',0,g);return g;}
  function sprig(x,y,s=1,p=world){const g=add('g',{transform:`translate(${x} ${y}) scale(${s})`},p);path('M0 44Q-5 4 8-40','none','#6b8d5c',2.3,g);for(const [xx,yy,rot]of [[0,12,-10],[1,-8,155],[6,-27,-5]]){const l=add('g',{transform:`translate(${xx} ${yy}) rotate(${rot})`},g);path('M0 0Q-30-29-60-12Q-36 13 0 0Z','#a1be7e','#70965d',.9,l);path('M-3-1L-53-11M-20-4L-25-17M-20-4L-32 4M-35-7L-39-17','none','#d3dfa8',.7,l);}return g;}
  function waterlines(p=world){for(let i=0;i<7;i++)path(`M${i*67-22} ${132+i%3*34}q31-8 63 0`,'none','#e9efda',1,p);}
  function background(p=world){hill('M-10 148Q64 54 151 92T410 69V240H-10Z','#c6d4b0',p);hill('M-10 193Q111 111 232 163T410 137V240H-10Z','#9fb795',p);}
  const scene=e.scene;
  if(scene==='encounter-art'){
   // The approved watercolor is the scene itself; overlays only show gesture targets and progress.
   refs.encounter=add('image',{href:e.artV4,x:85,y:0,width:230,height:230,'aria-hidden':'true'},world);
   refs.encounterMarks=[0,1,2].map(i=>add('circle',{cx:184+i*16,cy:216,r:3,fill:'#758e68',opacity:.18}));
   if(e.play==='yield')add('ellipse',{cx:60,cy:150,rx:23,ry:13,fill:'#e2e9d0',stroke:'#9eb28a','stroke-dasharray':'3 4'});
  }
  if(['grass','cloudsea','mistpeak','alpine','bay','forestwindow','canyon','inn','bamboowind','tealight'].includes(scene))background();
  if(scene==='grass'||scene==='cloudsea'){
   hill('M-10 217Q98 151 199 190T411 173V240H-10Z','#becb96');
   if(scene==='grass')for(let i=0;i<30;i++){const x=i*15-12,y=183+i%5*7,g=add('g',{transform:`translate(${x} ${y})`},world);g.base=`translate(${x} ${y})`;path('M0 49Q0 19-8 0M0 49Q5 25 13 15','none',i%2?'#7d9d69':'#9dac76',1.1,g);path('M-8 0q-5-9-8-4q-1 7 8 4M13 15q7-8 10-2q-2 6-10 2','#d2c991','#8da375',.5,g);refs.plants.push(g);}
   else{refs.fog=add('g');for(let i=0;i<5;i++)path(`M-50 ${95+i*23}Q50 ${70+i*24} 139 ${99+i*24}T440 ${85+i*25}V240H-50Z`,i%2?'#edf0df':'#f7f6e9','none',0,refs.fog);}
  }else if(scene==='altar'){
   hill('M0 185Q180 153 400 185V240H0Z','#c2cea0');refs.turn=add('g');
   path('M113 188V94Q116 61 156 49H243Q280 65 285 94V188Z','#bebda3','#8e9b80',1.3,refs.turn);
   path('M164 188V113Q164 76 199 76Q235 76 235 113V188Z','#6f826e','#8b947b',2,refs.turn);
   for(let j=0;j<5;j++){const y=89+j*21;path(`M116 ${y}H164M235 ${y}H282`,'none','#e2dfbb',1.8,refs.turn);for(const x of [128+j%2*12,255-j%2*12])path(`M${x} ${y}v20`,'none','#8e9b80',.9,refs.turn);}
   for(let i=0;i<7;i++){const a=Math.PI+(i+.5)*Math.PI/7,x=199+Math.cos(a)*45,y=113+Math.sin(a)*45;path(`M${x} ${y}l${Math.cos(a)*17} ${Math.sin(a)*17}`,'none','#e8dfb9',2,refs.turn);}
   path('M102 192H296M97 199H304','none','#a7ad91',4,refs.turn);path('M113 68Q200 36 282 68','none','#dedabc',3,refs.turn);
  }else if(scene==='boulders'){
   refs.turn=add('g');mountain(234,92,.8,refs.turn);for(let i=0;i<14;i++)stone(15+(i*83)%390,133+Math.floor(i/5)*29,.45+i%3*.15,refs.turn);hill('M0 227Q190 197 400 220V240H0Z','#c9d2b9');
  }else if(scene==='ridge'||scene==='mistpeak'){
   mountain(196,97,1.65);hill('M0 225L85 144L137 184L208 124L260 85L320 157L400 118V240H0Z','#9bb3a4');
   if(scene==='ridge'){refs.outline=path('M136 184L208 136L260 85','none','#f9edbd',3);refs.outline.setAttribute('stroke-dasharray','160');}
   else{refs.fog=add('g');for(let i=0;i<4;i++)path(`M-30 ${85+i*36}Q94 ${61+i*36} 198 ${92+i*36}T430 ${65+i*36}V250H-30Z`,i%2?'#edf0e2':'#e2e9dc','none',0,refs.fog);}
  }else if(scene==='canyon'||scene==='inn'){
   mountain(252,69,1.1);hill('M0 161L29 43L68 17L119 198V240H0Z','#8f9f90');hill('M287 230L337 59L385 23L410 161V240Z','#809b90');hill('M15 230Q182 161 302 227V240H15Z','#abc5ad');path('M116 229Q176 172 262 218','none','#7fafa4',15,world);
   if(scene==='inn'){refs.rail=add('g');path('M0 194H400M0 214H400','none','#a68e69',6,refs.rail);for(const x of [19,116,276,379])path(`M${x} 195v45`,'none','#9c8662',6,refs.rail);path('M21 22H379','none','#ad9571',10,refs.rail);for(const x of [21,379])path(`M${x} 22v174`,'none','#a28b65',8,refs.rail);}
  }else if(scene==='waterfall'){
   hill('M0 0H400V230H0Z','#a2b29a');hill('M32 0H177L144 230H0Z','#bdc5a6');hill('M286 0H400V230H254Z','#7e9c87');
   for(let i=0;i<8;i++)path(`M${24+i*46} 10l-7 49l12 28l-9 57`,'none','#899f86',1,world);
   refs.falls=add('g');path('M191-10Q208 44 192 92T209 184L250 197Q228 133 243 95T231-10Z','#e8efdc','#d0e1cb',1,refs.falls);for(let i=0;i<6;i++)path(`M${197+i*6} 0q15 54 2 91t16 104`,'none',i%2?'#fff8e8':'#b5cfc1',1.5,refs.falls);
   hill('M0 208Q165 174 400 202V240H0Z','url(#route-water)');waterlines();refs.mist=[0,1,2,3,4].map(i=>add('ellipse',{cx:177+i*20,cy:180+i%2*8,rx:20,ry:8,fill:'#f5f4e0',opacity:.2}));
  }else if(scene==='bay'||scene==='harbour'){
   hill('M0 109Q166 67 400 112V240H0Z','url(#route-water)');hill('M-20 176Q124 117 252 174T420 139V240H-20Z','#e2d4ad');path('M-20 176Q124 117 252 174T420 139','none','#f8f6e0',3,world);mountain(333,71,.43,world,false);waterlines();
   if(scene==='harbour'){for(const [x,y]of [[42,99],[93,96],[142,104]]){path(`M${x} ${y}h33v28h-33Z`,'#e6ddbd','#a0a58b',.6,world);path(`M${x-4} ${y}l20-15l20 15Z`,'#879d85','none',0,world);path(`M${x+13} ${y+13}v15`,'none','#aa9169',6,world);}path('M213 113H357L366 124H214Z','#b9a780','#8c8b70',1,world);refs.effects.reflection=add('g',{opacity:.5},world);for(const x of [230,339]){path(`M${x} 122v65`,'none','#8c977a',6,world);path(`M${x} 188l6 8l-9 13l6 9`,'none','#80a99a',5,refs.effects.reflection);}path('M46 140l22 17l15-17l24 19l20-16','none','#a7b9a0',11,refs.effects.reflection);}
  }else if(scene==='sand'){
   hill('M0 0H400V67Q220 43 0 83Z','url(#route-water)');path('M0 83Q180 42 400 67','none','#fff5df',4,world);hill('M0 101Q186 71 400 98V240H0Z','#d6c7a2');for(let i=0;i<40;i++)add('ellipse',{cx:i*79%399,cy:115+i*17%110,rx:i%3?1:2,ry:.8,fill:'#b5a17a',opacity:.55},world);
  }else if(scene==='deadtrees'){
   mountain(294,57,.55);hill('M0 120Q140 89 400 127V240H0Z','url(#route-water)');refs.effects.reflection=add('g',{opacity:.7},world);
   for(const [x,y,s]of [[72,145,.8],[157,137,1.2],[266,151,.65],[338,132,.9]]){const d='M0 0L-3-67L-12-91M-2-47L19-67L25-86M-1-33L-25-48L-32-70';path(d,'none','#8a8f75',3.5,add('g',{transform:`translate(${x} ${y}) scale(${s})`},world));path(d,'none','#8eaca0',3,add('g',{transform:`translate(${x} ${y+8}) scale(${s} ${-s*.65})`},refs.effects.reflection));}waterlines();
  }else if(['redrock','stonepath','teasprig'].includes(scene)){
   if(scene==='redrock'){hill('M0 174Q193 143 400 180V240H0Z','#a7b79a');stone(202,144,2,world,'#a8927d');}
   if(scene==='stonepath'){for(let i=0;i<5;i++){const y=207-i*38;path(`M${40+i*24} ${y}L${331+i*9} ${y-9}v24L${40+i*24} ${y+27}Z`,i%2?'#bac0a1':'#c8c9ad','#929e82',.8,world);path(`M${51+i*24} ${y+4}q92-13 229-9`,'none','#e8e1bb',1,world);}}
   if(scene==='teasprig'){background();for(let i=0;i<4;i++)path(`M-20 ${171+i*19}Q130 ${100+i*18} 420 ${149+i*18}`,'none',i%2?'#a6bc86':'#87a474',10,world);sprig(240,113,1.7);}
   refs.samples=[];refs.details=add('g');for(let i=0;i<26;i++){const x=scene==='teasprig'?167+i*11%80:107+i*37%190,y=scene==='teasprig'?125+i*7%23:102+i*13%57,red=scene==='redrock',d=red?'M-4 2L-7-3L-2-7L2-3L7-5L9 0L5 5L0 3L-3 7Z':scene==='teasprig'?'M-7 0L7 0M-3 0L-7-6M2 0L6 6':'M0 6V-5m0 7l-4-5m4 6l5-5',color=red?i%2?'#b36f55':'#cd8c68':i%2?'#78985f':'#c2d49e';const g=add('g',{transform:`translate(${x} ${y})`},refs.details);path(d,red?color:'none',color,red?.45:.9,g);refs.samples.push({x,y,d,fill:red?color:'none',color});}
  }else if(scene==='alpine'||scene==='forestwindow'){
   if(scene==='alpine'){mountain(227,77,1.22);hill('M0 185Q174 127 400 184V240H0Z','#b9cd99');path('M191 143Q137 170 220 188T204 239','none','url(#route-water)',11,world);refs.screens=[add('g'),add('g')];for(const [x,y,s]of [[22,162,1.1],[71,174,.8],[342,172,1.1],[397,145,1.3]])pine(x,y,s,refs.screens[x<200?0:1]);}else{hill('M0 147Q84 64 153 111Q234 21 400 142V240H0Z','#9eb99b');hill('M0 224Q180 118 400 193V240H0Z','#b6c9a1');path('M122 235Q171 167 269 151','none','#d9d2aa',12,world);refs.screens=[add('g'),add('g')];for(const [x,side]of [[88,0],[310,1]]){const g=refs.screens[side];path(`M${x} 235V4`,'none','#78986b',8,g);for(let i=0;i<5;i++){const y=28+i*36;path(`M${x} ${y}q-38-26-61-19q23 18 58 22M${x} ${y}q38-28 62-16q-23 16-59 20`,'#91b27c','#719664',.7,g);}}}
  }else if(scene==='bamboowind'){
   for(let i=0;i<9;i++){const x=14+i*47,y=195+i%3*11,g=add('g',{transform:`translate(${x} ${y})`},world);g.base=`translate(${x} ${y})`;path('M0 44Q8-70-4-198','none',i%2?'#8fa974':'#799e6c',5,g);for(let j=0;j<5;j++){const yy=-10-j*36;path(`M-2 ${yy}h9`,'none','#cfdda6',1,g);path(`M4 ${yy}q-28-21-47-14q18 13 43 18M4 ${yy}q26-25 42-17q-14 13-40 20`,'#9fbb80','#789c68',.6,g);}refs.plants.push(g);}
  }else if(scene==='creeksteps'||scene==='creekleaf'){
   background();hill('M0 87Q162 55 400 114V240H0Z','url(#route-water)');waterlines();
   if(scene==='creeksteps'){refs.steps=[];for(const p of [{x:.34,y:.8},{x:.52,y:.59},{x:.65,y:.37}])refs.steps.push(stone(p.x*400,p.y*230,.5));}
   else{stone(154,144,.8);refs.effects.leaf=add('g');path('M-18 0Q-4-17 23-5Q7 14-18 0Z','#c7aa6b','#a28a56',.8,refs.effects.leaf);path('M-15 0L18-4','none','#ead3a0',.7,refs.effects.leaf);}
  }else if(scene==='tealight'){
   for(let i=0;i<5;i++)path(`M-20 ${151+i*22}Q140 ${69+i*22} 420 ${129+i*22}`,'none',i%2?'#aabd89':'#8aa576',13,world);sprig(259,116,1.6);refs.shine=add('ellipse',{cx:270,cy:126,rx:64,ry:56,fill:'url(#route-glow)',opacity:.25});
  }else if(scene==='teacup'||scene==='villagetea'){
   hill('M0 0H400V230H0Z','#eee6cc');for(const x of [40,352])path(`M${x} 0v159`,'none','#d6c9a7',3,world);path('M0 10Q180-8 400 17V43Q194 19 0 47Z','#819487','#6c8376',1,world);for(let i=0;i<15;i++)path(`M${i*30} 11q-4 12 1 23`,'none','#b9c4a5',1,world);path('M0 198H400V240H0Z','#c3ac7f','#a18c68',1,world);
   if(scene==='villagetea'){path('M57 70H111V136H57Z','#b4aa84','#9a8968',1.5,world);path('M62 75H106V131H62Z','#a0b592','none',0,world);path('M84 75V131M62 101H106','none','#d7ccaa',2,world);}
   add('ellipse',{cx:204,cy:202,rx:99,ry:17,fill:'#a79c79',opacity:.2},world);path('M134 132Q140 206 202 208Q268 207 276 132Z','#eef0d9','#93a78b',1.4,world);add('ellipse',{cx:205,cy:133,rx:71,ry:24,fill:'#d0d8aa',stroke:'#f6f3db','stroke-width':4},world);path('M276 142Q326 135 314 166Q302 188 270 180','none','#b2bda0',8,world);refs.teaLeaves=[];for(let i=0;i<5;i++){const g=add('g',{},world);path('M-12 0Q0-13 15-2Q1 11-12 0Z',i%2?'#779561':'#a5b580','#6f8d5d',.5,g);path('M-10 0L11-1','none','#d1d5a5',.6,g);refs.teaLeaves.push(g);}refs.steam=[0,1,2].map(i=>path(`M${179+i*25} 106q-12-14 1-29t0-27`,'none','#faf5e1',1.4));
  }
  return refs;
 }
 function paint(refs,s,reduced=false){
  if(!refs?.story)return;const p=s.play||{progress:1,complete:true},q=reduced&&!s.acted?0:clamp(p.progress),t=reduced?0:s.age||0,dx=s.acted?(s.x-.5)*32:0;
  refs.encounterMarks?.forEach((g,i)=>g.setAttribute('opacity',q>i/3?.9:.18));
  if(refs.encounter){const shift=refs.entry.play==='yield'||refs.entry.play==='trail'?q*22:refs.entry.play==='sweep'?(s.x-.5)*12:0;refs.encounter.setAttribute('transform',`translate(${shift} 0)`);}
  refs.plants.forEach((g,i)=>g.setAttribute('transform',`${g.base} rotate(${reduced?0:s.acted?(s.x-.5)*12+Math.sin(t*2-i*.18)*q*3:Math.sin(t-i*.18)*1.5})`));
  if(refs.fog){refs.fog.setAttribute('opacity',1-q*.9);refs.fog.setAttribute('transform',`translate(${q*66} ${q*35})`);}
  if(['panorama','listen'].includes(p.type))refs.world.setAttribute('transform',`translate(${dx} 0) scale(${p.type==='panorama'?1.08-q*.08:1})`);
  refs.screens.forEach((g,i)=>g.setAttribute('transform',`translate(${(i?1:-1)*q*(refs.scene==='forestwindow'?26:74)} 0)`));
  refs.mist?.forEach((g,i)=>{g.setAttribute('rx',14+q*18);g.setAttribute('opacity',s.acted?.22+q*.45:.12);g.setAttribute('transform',`translate(${reduced?0:Math.sin(t*1.8+i)*7} ${-q*7})`);});
  refs.outline?.setAttribute('stroke-dashoffset',160-q*160);
  if(refs.scene==='deadtrees'){refs.effects.reflection.setAttribute('transform',`translate(${(s.x-.68)*80} 0)`);refs.effects.reflection.setAttribute('opacity',.3+q*.5);}
  refs.shine?.setAttribute('opacity',.2+q*.65);
  refs.teaLeaves?.forEach((g,i)=>g.setAttribute('transform',`translate(${169+i*18} ${128+(i%2?9:-4)}) rotate(${-30+i*19+q*18}) scale(${.15+q*.75} ${.35+q*.65})`));
  refs.steam?.forEach((g,i)=>{g.setAttribute('opacity',s.acted?.3+q*.5:.12);g.setAttribute('transform',`translate(${reduced?0:Math.sin(t+i)*3} ${reduced?0:-q*7})`);});
 }
 return {draw,paint};
}));
