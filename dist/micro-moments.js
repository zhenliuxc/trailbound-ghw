(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./moment-scenes.js'):root.TrailMomentScenes,typeof module==='object'&&module.exports?require('./moment-play.js'):root.TrailMomentPlay);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailMicroMoments=api;}(typeof globalThis!=='undefined'?globalThis:this,function(Y,P){
 'use strict';
 const clamp=(v,min=0,max=1)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
 function create(entry,options){return {play:P.create(entry,options),id:entry.id,route:entry.route,kind:entry.interaction,age:0,reaction:0,acted:false,gesture:'look',x:.5,y:.56,distance:0,trail:[],dragging:false,done:false};}
 function act(s,point={}){
  if(!s||s.done)return s;const gesture=point.gesture==='drag'?'drag':'tap';
  const updated=P.input(s,point,gesture==='drag'?'move':'tap');if(updated===s)return s;
  return {...updated,acted:true,reaction:s.acted?s.reaction:0,gesture:s.gesture==='drag'?'drag':gesture,trail:s.trail.length?s.trail:[{x:updated.x,y:updated.y}]};
 }
 function tick(s,dt){if(!s||s.done||!Number.isFinite(dt)||dt<=0)return s;dt=Math.min(.25,dt);const age=s.age+dt,reaction=s.acted?s.reaction+dt:0,next=P.tick({...s,age,reaction},dt),limit=s.route==='westlake'||next.play.complete?3.4:6;return {...next,done:age>=10||(s.acted?!s.dragging&&reaction>=limit&&(!next.play.complete||age-next.play.completedAt>=.7):age>=6)};}
 function move(s,{x,y}={}){if(!s||s.done)return s;const p={x:clamp(x),y:clamp(y)},next=s.acted?s:act(s,{...p,gesture:'drag'}),last=next.trail.at(-1)||p,delta=Math.hypot(p.x-last.x,p.y-last.y);if(delta<.003)return {...next,dragging:true};let trail=[...next.trail,p];if(trail.length>24)trail=trail.filter((_,i)=>i%2===0||i===trail.length-1);return {...P.input(next,p,'move'),gesture:'drag',dragging:true,distance:Math.min(3,next.distance+delta),trail};}
 function release(s){return s?.dragging?{...s,dragging:false}:s;}
 function drawScene(svg,parent,entry){
  if(entry.route!=='westlake')return Y.draw(svg,parent,entry);
  const kind=entry.interaction,refs={kind},add=(tag,attrs={},p=parent)=>svg(tag,attrs,p),path=(d,fill,stroke,width=1.4,p=parent)=>add('path',{d,fill,stroke:stroke||'none','stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round'},p);
  const defs=add('defs'),water=add('linearGradient',{id:'micro-water',x2:1,y2:1},defs);add('stop',{offset:0,'stop-color':'#c8dfd4'},water);add('stop',{offset:1,'stop-color':'#72a9a4'},water);
  const glow=add('radialGradient',{id:'micro-glow'},defs);add('stop',{offset:0,'stop-color':'#fff7bf','stop-opacity':.8},glow);add('stop',{offset:1,'stop-color':'#fff7bf','stop-opacity':0},glow);
  add('rect',{width:400,height:230,rx:18,fill:kind==='ripple'?'#edf1db':kind==='leaf'?'#eff2df':'#f0ebdb'});
  if(kind==='ripple'){
   path('M0 60Q90 14 184 46T400 20V230H0Z','#a6c2aa');path('M-20 123Q75 25 154 87T421 76L420 241H-20Z','url(#micro-water)');
   for(let i=0;i<8;i++)path(`M${i*62-40} ${105+i%3*34}q35-12 68 0t65 0`,'none','#e5eee0',1.3);
   add('ellipse',{cx:83,cy:150,rx:54,ry:12,fill:'#5f968b',opacity:.22});
   path('M55 151Q20 129 48 94Q69 69 109 85Q149 106 127 139Q104 161 55 151Z','#a6afa0','#839685',1.1);path('M52 105Q69 84 104 92','none','#d3d5b2',8);
   path('M39 117Q55 116 64 127L98 137Q113 135 130 121Q130 143 102 151Q57 157 39 136Z','#839b8a');
   path('M49 110Q60 98 77 102Q82 110 74 112Q60 108 49 110Z M92 145Q106 130 123 132L114 147Z','#78986c');
   path('M79 89L82 107L76 116M108 101L103 116L113 120','none','#879580',.8);
   for(const [x,y]of [[322,170],[360,126],[285,206]]){add('ellipse',{cx:x,cy:y+3,rx:23,ry:10,fill:'#5e968a',opacity:.16});path(`M${x-21} ${y}Q${x-25} ${y-9} ${x-8} ${y-13}Q${x+13} ${y-16} ${x+22} ${y}Q${x+12} ${y+11} ${x-21} ${y}Z`,'#aeb69c','#849b89',.9);path(`M${x-15} ${y-5}Q${x-3} ${y-13} ${x+11} ${y-7}`,'none','#d7d8b7',2);}
   refs.rings=[0,1,2].map(()=>add('ellipse',{cx:215,cy:150,rx:0,ry:0,fill:'none',stroke:'#f8f9da','stroke-width':2,opacity:0}));
   refs.leaf=add('g');path('M-19 1Q-6-21 23-5Q20 14-19 1Z','#c29d64','#997b53',.8,refs.leaf);path('M-19 1L17-4M-6-1L-5-9M-6-1L-2 5M5-3L8-10M5-3L10 3','none','#e4c58a',.65,refs.leaf);
   for(let i=0;i<9;i++)path(`M${10+i*8} 211q${i%2?8:-8}-24 2-42`,'none','#648f64',2);
  }else if(kind==='leaf'){
   path('M0 160Q90 74 187 113T400 75V230H0Z','#c3d4a2');path('M-10 209Q139 113 400 152','none','#91b17b',20);path('M-10 228Q139 139 400 177','none','#a6bf87',16);
   add('ellipse',{cx:220,cy:153,rx:91,ry:34,fill:'#8d9d71',opacity:.14});refs.leaf=add('g');
   path('M204 209Q184 158 200 39','none','#63834f',5,refs.leaf);
   for(const [x,y,angle,scale]of [[196,88,-24,1],[204,135,24,1.25],[186,179,-32,1.1]]){const leaf=add('g',{transform:`translate(${x} ${y}) rotate(${angle}) scale(${scale})`},refs.leaf);path('M0 0Q-65-49-110-11Q-70 38 0 0Z','#90b96a','#638f4e',1.3,leaf);path('M0 0L-92-10','none','#c8d993',1.5,leaf);for(let i=1;i<5;i++)path(`M${-i*18} ${-i*2}l-12-16M${-i*18} ${-i*2}l-15 13`,'none','#bad28b',.8,leaf);}
   refs.shine=add('ellipse',{cx:230,cy:95,rx:100,ry:83,fill:'url(#micro-glow)',opacity:.45});
  }else{
   path('M0 34H400V230H0Z','#eee3cb');for(let i=0;i<8;i++)path(`M${i*54} 51v119`,'none','#ddcfb1',1);
   path('M0 24Q130 1 252 18T400 4V57Q264 66 164 46T0 51Z','#778780','#516b63',2);
   for(let i=0;i<14;i++)path(`M${i*32-6} 19q-8 21 0 34`,'none','#a4b0a2',2);
   path('M28 164H191V177H28Z','#9f855c');path('M46 177V220M170 177V220','none','#867650',8);
   const basket=add('g',{transform:'translate(107 150)'});path('M-40-6Q0-45 40-6L30 19Q0 34-30 19Z','#c4a56e','#92784d',1.2,basket);path('M-28-12Q-24-54 1-51Q27-54 29-13','none','#967c4f',3.5,basket);path('M-27-13Q-23-51 1-49Q24-51 28-13','none','#dbc28b',1,basket);for(let i=-3;i<4;i++)path(`M${i*10} -12l-6 36`,'none','#e2c48b',1,basket);for(let i=0;i<4;i++)path(`M-35 ${i*7-2}q35 10 70 0`,'none','#8f784e',1,basket);path('M-39-6Q0-19 39-6','none','#e4c990',2,basket);
   add('ellipse',{cx:284,cy:194,rx:51,ry:18,fill:'#b5c9b8',stroke:'#879f8c','stroke-width':2});add('ellipse',{cx:284,cy:190,rx:46,ry:13,fill:'url(#micro-water)'});
   refs.drops=[0,1,2].map(()=>add('ellipse',{cx:285,cy:57,rx:2.8,ry:5,fill:'#7aa9a4',opacity:0}));refs.rings=[0,1].map(()=>add('ellipse',{cx:284,cy:190,rx:0,ry:0,fill:'none',stroke:'#edf2dd','stroke-width':1.4,opacity:0}));
   add('ellipse',{cx:385,cy:180,rx:42,ry:64,fill:'url(#micro-glow)',opacity:.4});
  }
  return refs;
 }
 function paintScene(refs,s,reduced=false){
  if(refs.regional){Y.paint(refs,s,reduced);return;}
  const t=s.reaction;
  if(refs.kind==='ripple'){
   for(const [i,ring]of refs.rings.entries()){const age=t-i*.28,phase=clamp(age/2.7);ring.setAttribute('cx',70+s.x*270);ring.setAttribute('cy',90+s.y*105);ring.setAttribute('rx',reduced?37:8+phase*95);ring.setAttribute('ry',reduced?13:3+phase*30);ring.setAttribute('opacity',s.acted&&age>=0?Math.max(0,1-phase):0);}
   refs.leaf.setAttribute('transform',`translate(${184+(s.acted?Math.min(1,t/2.6)*83:reduced?0:Math.sin(s.age*1.3)*8)} ${129+(s.acted?Math.sin(t*1.4)*15:0)}) rotate(${s.acted?Math.min(1,t/2.6)*92:reduced?8:Math.sin(s.age)*12})`);
  }else if(refs.kind==='leaf'){
   refs.leaf.setAttribute('transform',`rotate(${reduced?0:s.acted?Math.sin(t*2.6)*12*Math.exp(-t*.7):Math.sin(s.age*.9)*1.7} 200 173)`);refs.shine.setAttribute('opacity',s.acted?.72:.35);refs.shine.setAttribute('cx',s.acted?170+s.x*130:230);
  }else{
   refs.drops.forEach((drop,i)=>{const age=t-i*.66,fall=clamp(age/.62);drop.setAttribute('cy',57+fall*128);drop.setAttribute('opacity',s.acted&&age>=0&&age<.65?1:0);});
   refs.rings.forEach((ring,i)=>{const phase=clamp((t-.62-i*.66)/1.25);ring.setAttribute('rx',phase*43);ring.setAttribute('ry',phase*10);ring.setAttribute('opacity',s.acted&&phase>0?1-phase:0);});
  }
 }
 function draw(svg,parent,entry){const refs=P.custom(entry)?P.draw(svg,parent,entry):drawScene(svg,parent,entry);refs.playView=P.decorate(svg,parent,entry,refs);return refs;}
 function paint(refs,s,reduced=false){if(!refs.custom)paintScene(refs,s,reduced);P.paint(refs.playView,s,reduced);}
 function outcome(s,entry){return {id:s.id,interaction:s.gesture,memory:P.memory(s,entry),title:s.play.complete?P.LABELS[s.play.type]+'的一刻':entry.name};}
 return {create,act,move,release,tick,outcome,draw,paint,instruction:P.instruction,status:P.status,playType:P.type,playTarget:P.target};
}));
