(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailRouteScenes=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=v=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
 function draw(svg,parent,e){
  const add=(tag,a={},p=parent)=>svg(tag,a,p),path=(d,fill='none',stroke='none',w=1,p=parent)=>add('path',{d,fill,stroke,'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round'},p);
  const refs={custom:true,story:true,kind:e.interaction,scene:e.scene,entry:e,effects:{},plants:[],screens:[],samples:[],heroFile:e.artV5||e.artV4,heroBox:{x:60,y:-25,width:280,height:280}};
  const defs=add('defs'),fade=add('radialGradient',{id:'moment-art-fade'},defs);add('stop',{offset:0,'stop-color':'white'},fade);add('stop',{offset:.72,'stop-color':'white'},fade);add('stop',{offset:.91,'stop-color':'black'},fade);
  const mask=add('mask',{id:'moment-art-mask',maskUnits:'userSpaceOnUse',x:60,y:-25,width:280,height:280},defs);add('ellipse',{cx:200,cy:115,rx:136,ry:136,fill:'url(#moment-art-fade)'},mask);
  const light=add('linearGradient',{id:'moment-light',x1:0,y1:0,x2:1,y2:1},defs);add('stop',{offset:0,'stop-color':'#fff5ce','stop-opacity':.17},light);add('stop',{offset:.6,'stop-color':'#fff9e7','stop-opacity':0},light);add('stop',{offset:1,'stop-color':'#2d5946','stop-opacity':.12},light);
  add('rect',{width:400,height:230,fill:e.route==='aotai'?'#dfe9e8':'#e2ead6'});
  refs.backdrop=add('image',{href:'scenes/'+e.route+'-v1.webp',x:0,y:0,width:400,height:230,preserveAspectRatio:'xMidYMid slice','data-scene-background':e.route});
  refs.world=add('g',{'data-painted-subject':e.id});
  const hero=p=>add('image',{href:refs.heroFile,...refs.heroBox,mask:'url(#moment-art-mask)'},p);
  if(e.scene==='deadtrees'||e.scene==='harbour'){
   const top=add('clipPath',{id:'moment-tree-top'},defs);add('rect',{x:0,y:0,width:400,height:134},top);const bottom=add('clipPath',{id:'moment-tree-water'},defs);add('rect',{x:0,y:134,width:400,height:96},bottom);
   hero(add('g',{'clip-path':'url(#moment-tree-top)'},refs.world));refs.effects.reflection=add('g',{'clip-path':'url(#moment-tree-water)'},refs.world);hero(refs.effects.reflection);
  }else hero(refs.world);
  if(e.play==='settle')refs.rings=[0,1,2].map(i=>add('ellipse',{cx:220,cy:165,rx:28+i*22,ry:5+i*4,fill:'none',stroke:'#f9f4d7','stroke-width':1.4,opacity:0}));
  if(e.play==='turn')refs.turn=refs.world;
  if(e.play==='wait'){refs.fog=add('g');for(let i=0;i<4;i++)path(`M-30 ${90+i*35}Q76 ${62+i*35} 190 ${96+i*35}T430 ${72+i*35}V250H-30Z`,i%2?'#eef1e5':'#e4ebe1','none',0,refs.fog);}
  if(e.play==='sweep'){refs.wind=add('g',{opacity:0});for(let i=0;i<3;i++)path(`M${65+i*28} ${115+i*21}q80-35 174-5`,'none','#fff8d4',1.4,refs.wind);}
  if(e.play==='spray'){refs.mist=[0,1,2,3,4].map(i=>add('ellipse',{cx:166+i*18,cy:179+i%2*8,rx:20,ry:9,fill:'#f9f9e7',opacity:.15}));}
  if(e.play==='outline'){refs.outline=path('M136 184L208 136L260 85','none','#fff4c2',2);refs.outline.setAttribute('stroke-dasharray',160);}
  if(e.play==='brew')refs.steam=[0,1,2].map(i=>path(`M${180+i*20} 112q-8-13 1-24t0-25`,'none','#fff6dd',1.2));
  add('rect',{width:400,height:230,fill:'url(#moment-light)','pointer-events':'none'});
  return refs;
 }
 function paint(refs,s,reduced=false){
  if(!refs?.story)return;const p=s.play,q=reduced&&!s.acted?0:clamp(p.progress),t=reduced?0:s.age||0,shift=s.acted?(s.x-.5):0;
  if(p.type==='panorama')refs.world.setAttribute('transform',`translate(${-shift*13} 0) translate(200 115) scale(${1.08-q*.08}) translate(-200 -115)`);
  else if(p.type==='sweep')refs.world.setAttribute('transform',`rotate(${shift*3} 200 165)`);
  else if(p.type==='yield'||s.id==='maclehose-sideways-crab')refs.world.setAttribute('transform',`translate(${q*(p.type==='yield'?22:35)} 0)`);
  else if(p.type==='guide')refs.world.setAttribute('transform',`translate(${q*24} ${-q*7}) rotate(${q*4} 200 150)`);
  else if(p.type==='listen')refs.world.setAttribute('transform',`translate(${-shift*8} 0)`);
  if(refs.fog){refs.fog.setAttribute('opacity',.75*(1-q));refs.fog.setAttribute('transform',`translate(${q*55} ${q*20})`);}
  if(refs.wind){refs.wind.setAttribute('opacity',s.acted?.2+q*.45:0);refs.wind.setAttribute('transform',`translate(${shift*25} 0)`);}
  refs.mist?.forEach((g,i)=>{g.setAttribute('rx',14+q*18);g.setAttribute('opacity',s.acted?.2+q*.4:.1);g.setAttribute('transform',`translate(${reduced?0:Math.sin(t*1.5+i)*4} ${-q*7})`);});
  refs.outline?.setAttribute('stroke-dashoffset',160-q*160);
  if(refs.scene==='deadtrees'){refs.effects.reflection.setAttribute('transform',`translate(${(s.x-.68)*65} 0)`);refs.effects.reflection.setAttribute('opacity',.45+q*.55);}
  refs.steam?.forEach((g,i)=>{g.setAttribute('opacity',s.acted?.15+q*.6:0);g.setAttribute('transform',`translate(${reduced?0:Math.sin(t+i)*2} ${reduced?0:-q*5})`);});
 }
 return {draw,paint};
}));
