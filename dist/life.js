(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailLife=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function build(theme,points,context={}){let seed=theme==='snow'?613:theme==='gorge'?311:127;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},actors=[];const near=(i,kind)=>{const p=points[Math.floor((i+1)/(15)*Math.max(0,points.length-1))]||[360,300],side=i%2?1:-1;actors.push({kind,x:clamp(p[0]+side*(35+random()*55),35,685),y:clamp(p[1]+25+random()*25,60,540),phase:random()*6.28,scale:kind==='butterfly'?.32+random()*.12:.7+random()*.45});};
  if(theme==='meadow'){for(let i=0;i<12;i++)near(i,'grass');for(let i=0;i<3;i++)near(i*4,'butterfly');}
  if(theme==='gorge'){for(let i=0;i<7;i++)near(i*2,'leaf');const water=context.water||[];for(const [i,p]of water.entries())actors.push({kind:'water',x:p.x,y:p.y,phase:i*.7,scale:.65});}
  if(theme==='coast'){for(let i=0;i<8;i++)near(i,'water');for(let i=0;i<3;i++)near(i*4,'grass');}
  if(theme==='forest'){for(let i=0;i<8;i++)near(i,'leaf');for(let i=0;i<3;i++)near(i*4,'butterfly');}
  if(theme==='bamboo')for(let i=0;i<13;i++)near(i,'leaf');
  if(theme==='snow')for(let i=0;i<8;i++)near(i,'spindrift');
  for(let i=0;i<2;i++)actors.push({kind:'bird',x:150+i*350,y:130+i*140,phase:i*2.4,scale:.52+i*.08});
  return actors;
 }
 function pose(actor,elapsed=0,weather='clear',reduced=false){const t=reduced?0:elapsed,p=actor.phase||0,w=weather==='wind'||weather==='blizzard'?1.8:1;let x=actor.x,y=actor.y,angle=0,alpha=.75,wing=1;
  if(actor.kind==='grass'){angle=Math.sin(t*1.5+p)*5*w;alpha=.6;}
  else if(actor.kind==='butterfly'){x+=Math.sin(t*.65+p)*18;y+=Math.sin(t*1.3+p)*7;angle=Math.sin(t*.9+p)*12;wing=.28+Math.abs(Math.sin(t*8+p))*.72;}
  else if(actor.kind==='bird'){x+=Math.sin(t*.085+p)*85;y+=Math.sin(t*.2+p)*14;angle=Math.sin(t*.3+p)*4;wing=Math.sin(t*3.8+p)*22;alpha=.76;}
  else if(actor.kind==='leaf'){x+=Math.sin(t*.5+p)*12;y+=Math.sin(t*.35+p)*13;angle=Math.sin(t*.8+p)*35;alpha=.55;}
  else if(actor.kind==='water'){alpha=.2+(Math.sin(t*2+p)+1)*.27;x+=Math.sin(t*.7+p)*4;}
  else if(actor.kind==='spindrift'){x+=Math.sin(t*.5+p)*15*w;alpha=.13+(Math.sin(t*.9+p)+1)*.12;}
  return {x,y,angle,alpha,wing,facing:actor.kind==='bird'&&Math.cos(t*.085+p)<0?-1:1};
 }
 function butterfly(svg,parent){const parts=[];for(const side of [-1,1]){const wing=svg('g',{},parent);svg('path',{d:`M0-2C${side*4}-15 ${side*14}-15 ${side*13}-5Q${side*11} 0 0 3Z`,fill:'#e6b68a',stroke:'#ba9270','stroke-width':.65},wing);svg('path',{d:`M0 2Q${side*14}-1 ${side*10} 8Q${side*5} 13 0 5Z`,fill:'#ead4a0',stroke:'#ba9270','stroke-width':.55},wing);svg('path',{d:`M0 0Q${side*5}-5 ${side*10}-7`,fill:'none',stroke:'#f7e3bf','stroke-width':.8},wing);parts.push({node:wing,side});}svg('path',{d:'M0-6V7M0-5Q-3-10-3-8M0-5Q3-10 3-8',fill:'none',stroke:'#65735b','stroke-width':1.1,'stroke-linecap':'round'},parent);return parts;}
 function bird(svg,parent,flying=false){const shape=(tag,attrs,p=parent)=>svg(tag,attrs,p),parts=[];
  if(flying){for(const [d,fill,side]of [['M-2 0Q-6-7-17-7Q-14-1-5 3Z','#8ba59b',.55],['M-1 0Q-5-10-12-13Q-12-5-5 4Z','#597b78',1]]){const wing=shape('g',{});shape('path',{d,fill},wing);parts.push({node:wing,side});}shape('path',{d:'M-3 0L-13 3L-10 0L-13-2L-2-2Q1-5 6-4Q11-5 11-1L14 0L10 1Q6 6-2 3Z',fill:'#516f6c'});shape('path',{d:'M0 2Q6 6 10 0Q6 2 0 2Z',fill:'#e9eee0'});shape('circle',{cx:8.7,cy:-1.8,r:.65,fill:'#263e3c'});}
  else{shape('path',{d:'M-7 2L-17-2L-13 5L-6 7Z',fill:'#8b7862'});shape('path',{d:'M-8 1Q-8-6-1-6Q0-13 7-11Q13-10 12-4L16-2L11 0Q9 11-1 10Q-9 9-8 1Z',fill:'#9f8b6b'});shape('path',{d:'M-3 3Q1-2 10-1Q10 8 2 9Q-3 9-3 3Z',fill:'#e4c293'});shape('path',{d:'M-7 0Q1-4 3 3Q1 8-6 5Z',fill:'#6d8172'});shape('path',{d:'M-5 1Q-1 0 1 3',fill:'none',stroke:'#a8b29a','stroke-width':.8});shape('path',{d:'M11-4L16-2L11-1Z',fill:'#d7ab64'});shape('circle',{cx:8.6,cy:-6.1,r:1,fill:'#34443a'});shape('circle',{cx:8.9,cy:-6.4,r:.28,fill:'#fff8df'});shape('path',{d:'M-1 9L-2 14M5 8L6 13M-4 14H1M4 13H9',fill:'none',stroke:'#7d745d','stroke-width':1.1,'stroke-linecap':'round'});}
  return parts;
 }
 function mount(svg,parent,actors){return actors.map(actor=>{const node=svg('g',{'data-life':actor.kind,'pointer-events':'none'},parent),shape=(tag,attrs,p=node)=>svg(tag,attrs,p),parts=[];
  if(actor.kind==='grass')shape('path',{d:'M-5 0Q-10-9-8-16M0 0Q-2-12 2-22M4 0Q10-9 11-13',fill:'none',stroke:'#789057','stroke-width':1.4,'stroke-linecap':'round'});
  else if(actor.kind==='butterfly')parts.push(...butterfly(svg,node));
  else if(actor.kind==='bird')parts.push(...bird(svg,node,true));
  else if(actor.kind==='leaf')shape('path',{d:'M-7 3Q-12-10 6-8Q11 1-7 3M-7 3L6-8',fill:'#b7b576',stroke:'#8e9d66','stroke-width':.8});
  else if(actor.kind==='water')shape('path',{d:'M-17 0Q-4-6 8-2M-5 5H18',fill:'none',stroke:'#f0f6db','stroke-width':1.8,'stroke-linecap':'round'});
  else shape('path',{d:'M-19 0Q0-5 20 0M-9 5Q4 1 26 5',fill:'none',stroke:'#f7faf1','stroke-width':2,'stroke-linecap':'round'});
  return {...actor,node,parts};});
 }
 function update(actors,elapsed,weather,reduced){for(const actor of actors){const p=pose(actor,elapsed,weather,reduced);actor.node.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.angle.toFixed(2)}) scale(${actor.scale*p.facing} ${actor.scale})`);actor.node.setAttribute('opacity',p.alpha.toFixed(3));for(const part of actor.parts){part.node.setAttribute('transform',actor.kind==='butterfly'?`scale(${p.wing.toFixed(3)} 1)`:`rotate(${(p.wing*part.side).toFixed(2)})`);}}}
 function creature(kind,elapsed=0,reduced=false){const t=reduced?0:elapsed;return {angle:Math.sin(t*(kind==='flower'?1:kind==='goat'?.6:1.8))* (kind==='flower'?6:3),wing:.3+Math.abs(Math.sin(t*8))*.7};}
 return {build,pose,mount,update,creature,butterfly,bird};
}));
