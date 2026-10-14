(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailLife=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function build(theme,points){let seed=theme==='snow'?613:theme==='gorge'?311:127;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},actors=[];const near=(i,kind)=>{const p=points[Math.floor((i+1)/(15)*Math.max(0,points.length-1))]||[360,300],side=i%2?1:-1;actors.push({kind,x:clamp(p[0]+side*(35+random()*55),35,685),y:clamp(p[1]+25+random()*25,60,540),phase:random()*6.28,scale:.7+random()*.45});};
  if(theme==='meadow'){for(let i=0;i<12;i++)near(i,'grass');for(let i=0;i<3;i++)near(i*4,'butterfly');}
  if(theme==='gorge'){for(let i=0;i<7;i++)near(i*2,'leaf');for(let i=0;i<7;i++)actors.push({kind:'water',x:70+i*85,y:525-i*34,phase:i*.7,scale:1});}
  if(theme==='snow')for(let i=0;i<8;i++)near(i,'spindrift');
  for(let i=0;i<2;i++)actors.push({kind:'bird',x:150+i*350,y:130+i*140,phase:i*2.4,scale:.7+i*.2});
  return actors;
 }
 function pose(actor,elapsed=0,weather='clear',reduced=false){const t=reduced?0:elapsed,p=actor.phase||0,w=weather==='wind'||weather==='blizzard'?1.8:1;let x=actor.x,y=actor.y,angle=0,alpha=.75,wing=1;
  if(actor.kind==='grass'){angle=Math.sin(t*1.5+p)*5*w;alpha=.6;}
  else if(actor.kind==='butterfly'){x+=Math.sin(t*.65+p)*18;y+=Math.sin(t*1.3+p)*7;angle=Math.sin(t*.9+p)*12;wing=.28+Math.abs(Math.sin(t*8+p))*.72;}
  else if(actor.kind==='bird'){x+=Math.sin(t*.085+p)*85;y+=Math.sin(t*.2+p)*14;angle=Math.sin(t*.3+p)*4;wing=Math.sin(t*3.8+p)*22;alpha=.6;}
  else if(actor.kind==='leaf'){x+=Math.sin(t*.5+p)*12;y+=Math.sin(t*.35+p)*13;angle=Math.sin(t*.8+p)*35;alpha=.55;}
  else if(actor.kind==='water'){alpha=.2+(Math.sin(t*2+p)+1)*.27;x+=Math.sin(t*.7+p)*4;}
  else if(actor.kind==='spindrift'){x+=Math.sin(t*.5+p)*15*w;alpha=.13+(Math.sin(t*.9+p)+1)*.12;}
  return {x,y,angle,alpha,wing};
 }
 function mount(svg,parent,actors){return actors.map(actor=>{const node=svg('g',{'data-life':actor.kind,'pointer-events':'none'},parent),shape=(tag,attrs,p=node)=>svg(tag,attrs,p),parts=[];
  if(actor.kind==='grass')shape('path',{d:'M-5 0Q-10-9-8-16M0 0Q-2-12 2-22M4 0Q10-9 11-13',fill:'none',stroke:'#789057','stroke-width':1.4,'stroke-linecap':'round'});
  else if(actor.kind==='butterfly'){for(const side of [-1,1]){const wing=shape('g',{},node);shape('path',{d:`M0-2Q${side*18}-20 ${side*13}-3Q${side*20} 13 0 5Z`,fill:'#d99b69',stroke:'#bc885e','stroke-width':.6},wing);parts.push({node:wing,side});}shape('path',{d:'M0-5V7M0-3L-3-8M0-3L3-8',stroke:'#58745a','stroke-width':1.2});}
  else if(actor.kind==='bird'){for(const side of [-1,1]){const wing=shape('g',{},node);shape('path',{d:`M0 0Q${side*9}-10 ${side*20}-6Q${side*10}-4 0 2Z`,fill:'#647e70'},wing);parts.push({node:wing,side});}shape('ellipse',{cx:0,cy:1,rx:3,ry:5,fill:'#647e70'});}
  else if(actor.kind==='leaf')shape('path',{d:'M-7 3Q-12-10 6-8Q11 1-7 3M-7 3L6-8',fill:'#b7b576',stroke:'#8e9d66','stroke-width':.8});
  else if(actor.kind==='water')shape('path',{d:'M-17 0Q-4-6 8-2M-5 5H18',fill:'none',stroke:'#f0f6db','stroke-width':1.8,'stroke-linecap':'round'});
  else shape('path',{d:'M-19 0Q0-5 20 0M-9 5Q4 1 26 5',fill:'none',stroke:'#f7faf1','stroke-width':2,'stroke-linecap':'round'});
  return {...actor,node,parts};});
 }
 function update(actors,elapsed,weather,reduced){for(const actor of actors){const p=pose(actor,elapsed,weather,reduced);actor.node.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.angle.toFixed(2)}) scale(${actor.scale})`);actor.node.setAttribute('opacity',p.alpha.toFixed(3));for(const part of actor.parts){part.node.setAttribute('transform',actor.kind==='butterfly'?`scale(${p.wing.toFixed(3)} 1)`:`rotate(${(p.wing*part.side).toFixed(2)})`);}}}
 function creature(kind,elapsed=0,reduced=false){const t=reduced?0:elapsed;return {angle:Math.sin(t*(kind==='flower'?1:kind==='goat'?.6:1.8))* (kind==='flower'?6:3),wing:.3+Math.abs(Math.sin(t*8))*.7};}
 return {build,pose,mount,update,creature};
}));
