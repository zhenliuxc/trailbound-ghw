(function(root,factory){const T=typeof module==='object'&&module.exports?require('./terrain.js'):root.TrailTerrain;const api=factory(T);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailScenery=api;}(typeof globalThis!=='undefined'?globalThis:this,function(T){
 'use strict';
 const palettes={meadow:{sky:'#e6eed9',ground:'#edf0cf',far:'#bfd5b3',mid:'#98ba7e',light:'#d4e2ae',shade:'#75965f',grass:'#8fa85d',leaf:'#648b57',leafLight:'#a5c17b',water:'#79b9b3'},gorge:{sky:'#e4eade',ground:'#eee5cb',far:'#c9c6aa',mid:'#b7b28e',light:'#e2d4af',shade:'#86927c',grass:'#a3a671',leaf:'#678d69',leafLight:'#aac393',water:'#70afb1'},snow:{sky:'#e3eff0',ground:'#e9f1e5',far:'#c1d7ce',mid:'#a5c1b7',light:'#f4f7e9',shade:'#7fa39d',grass:'#aabfb0',leaf:'#769f87',leafLight:'#bbd6be',water:'#a0cdd0'}};
 function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
 const fmt=n=>Math.round(n*100)/100;
 function build(route,points,context={}){const theme=route.theme==='snow'?'snow':route.theme==='gorge'?'gorge':'meadow',p=palettes[theme],random=rng(theme==='snow'?719:theme==='gorge'?947:113),layers={ground:[],land:[],hydro:[],details:[],canopy:[],clouds:[],water:[]};
 function add(layer,tag,attrs,extra={}){const feature={tag,...attrs,...extra};layers[layer].push(feature);return feature;}
 const path=(layer,d,fill,extra={})=>add(layer,'path',{d,fill,...extra});
 const ellipse=(layer,cx,cy,rx,ry,fill,opacity=1)=>add(layer,'ellipse',{cx:fmt(cx),cy:fmt(cy),rx:fmt(rx),ry:fmt(ry),fill,opacity});
 const circle=(layer,cx,cy,r,fill,opacity=1)=>add(layer,'circle',{cx:fmt(cx),cy:fmt(cy),r:fmt(r),fill,opacity});
 const terrain=T.build(route,points,context),distance=(x,y)=>T.nearest(points,x,y).distance;
 add('ground','rect',{x:-400,y:-400,width:1600,height:1400,fill:p.sky});
 path('ground','M-180 100Q160 12 390 72T900 38V1000H-180Z',p.ground);
 const spine=terrain.spine,waters=terrain.features.filter(f=>f.kind==='water'),length=f=>f.line.reduce((n,p,i)=>n+(i?Math.hypot(p[0]-f.line[i-1][0],p[1]-f.line[i-1][1]):0),0),visibleWater=new Set([...waters].sort((a,b)=>length(b)-length(a)).slice(0,theme==='snow'?2:theme==='meadow'?3:waters.length)),waterDistance=(x,y)=>Math.min(Infinity,...[...visibleWater].map(f=>T.nearest(f.line,x,y).distance));
 // Discrete rounded meadow islands and cartoon hills sit beside the route, rather than parallel contour bands.
 function hill(x,y,w,h){const z=(a,b)=>`${fmt(x+a*w)} ${fmt(y+b*h)}`;
  ellipse('land',x+5,y+h*.18,w*.63,h*.22,p.shade,.10);
  path('land',`M${z(-.65,.1)}Q${z(-.45,-.75)} ${z(-.05,-.63)}Q${z(.34,-1)} ${z(.67,.04)}Q${z(.27,.4)} ${z(-.65,.1)}Z`,p.mid,{stroke:p.shade,'stroke-width':1.4});
  path('land',`M${z(-.54,.01)}Q${z(-.39,-.63)} ${z(-.05,-.54)}Q${z(.07,-.52)} ${z(.21,-.36)}Q${z(-.16,-.39)} ${z(-.54,.01)}Z`,p.light);
 }
 for(let i=0;i<7&&spine.length;i++){const q=spine[Math.round((spine.length-1)*(.06+i*.145))],side=i%2?1:-1,away=95+(i%3)*19,x=q.x+q.nx*away*side,y=q.y+q.ny*away*side;
  hill(x,y,theme==='meadow'?100:85,theme==='snow'?44:57);
 }
 for(const feature of terrain.features){const d=T.line(feature.line);if(feature.kind==='water'){if(!visibleWater.has(feature))continue;
  const main=theme==='gorge',width=main?15:2.2;
  if(main)path('ground',d,'none',{stroke:'#d6c6a5','stroke-width':58,'stroke-linecap':'round','stroke-linejoin':'round'});
  path('hydro',d,'none',{stroke:main?'#aec7ba':'#c5dbce','stroke-width':width+5,'stroke-linecap':'round','stroke-linejoin':'round'});
  path('hydro',d,'none',{stroke:p.water,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round'});
 }else if(feature.kind==='cable')path('details',d,'none',{stroke:'#97a58b','stroke-width':1.2,opacity:.48});}
 // A few outlined mountain silhouettes communicate the terrain as a storybook map.
 function mountain(x,y,w,h){const z=(a,b)=>`${fmt(x+a*w)},${fmt(y+b*h)}`;
 ellipse('land',x,y+h*.62,w*.62,h*.15,p.shade,.12);
 path('land',`M${z(-.62,.54)}Q${z(-.49,.27)} ${z(-.36,.1)}L${z(-.22,-.05)}Q${z(-.1,-.34)} ${z(.03,-.52)}L${z(.12,-.33)} ${z(.23,-.27)}Q${z(.4,.11)} ${z(.66,.54)}Q${z(.18,.7)} ${z(-.62,.54)}Z`,p.mid,{stroke:p.shade,'stroke-width':1.6});
 path('land',`M${z(.03,-.52)}L${z(.12,-.33)} ${z(.23,-.27)}Q${z(.4,.11)} ${z(.66,.54)}Q${z(.32,.48)} ${z(.11,.6)}L${z(.04,.08)} ${z(-.06,-.04)}Z`,p.shade);
 path('land',`M${z(-.36,.1)}L${z(-.22,-.05)}Q${z(-.1,-.34)} ${z(.03,-.52)}L${z(-.05,-.12)} ${z(-.14,-.03)} ${z(-.21,.18)} ${z(-.42,.36)}Z`,p.light);
 if(theme==='snow')path('land',`M${z(-.17,-.15)}Q${z(-.05,-.39)} ${z(.03,-.52)}L${z(.12,-.33)} ${z(.23,-.27)} ${z(.28,-.18)} ${z(.13,-.2)} ${z(.08,-.11)} ${z(-.02,-.2)} ${z(-.1,-.09)}Z`,'#f6faf0');
 }
 for(const peak of terrain.peaks){const h=theme==='snow'?60:70,w=theme==='snow'?83:98;mountain(peak.x-.03*w,peak.y+.52*h,w,h);}
 if(theme!=='meadow')for(const i of [9,26,43]){const q=spine[i];if(q)mountain(q.x+q.nx*112,q.y+q.ny*112,theme==='snow'?96:74,theme==='snow'?83:74);}
 if(theme==='gorge')for(const [i,q]of terrain.water.entries()){if(i%2)continue;const side=i%4?1:-1,x=q.x+q.nx*32*side,y=q.y+q.ny*32*side;
  path('land',`M${fmt(x-15)} ${fmt(y+19)}L${fmt(x-12)} ${fmt(y-10)}L${fmt(x+2)} ${fmt(y-22)}L${fmt(x+17)} ${fmt(y-7)}L${fmt(x+12)} ${fmt(y+19)}Z`,'#c4b791',{stroke:'#8c9779','stroke-width':1.4});
  path('land',`M${fmt(x+2)} ${fmt(y-22)}L${fmt(x+17)} ${fmt(y-7)}L${fmt(x+12)} ${fmt(y+19)}L${fmt(x+2)} ${fmt(y+15)}Z`,'#9da789');
 }
 // Sparse grass, flowers and stones add texture without cartographic linework.
 for(let i=0;i<100;i++){const x=18+random()*684,y=135+random()*415;if(distance(x,y)<24||waterDistance(x,y)<(theme==='gorge'?13:4))continue;if(theme==='snow'){const size=2+random()*4;path('details',`M${fmt(x-size)} ${fmt(y+2)}l${fmt(size*.6)} ${fmt(-size)} ${fmt(size)} ${fmt(-size*.25)} ${fmt(size*.8)} ${fmt(size*.8)}-1 ${fmt(size*.7)}Z`,i%4===0?'#f6faed':'#adc2b6',{opacity:.65});}else if(i%7===0){ellipse('details',x,y,3.5,2.3,'#b9b58e',.65);}else{path('details',`M${fmt(x-3)} ${fmt(y+3)}q1-4-1-7m4 7q-1-6 3-9m-1 10 5-5`,'none',{stroke:p.grass,'stroke-width':1.1,opacity:.55});if(i%11===0)circle('details',x+2,y-4,2.2,'#f0cc80');}}
 function tree(x,y,s){ellipse('canopy',x+6*s,y+6*s,17*s,5*s,p.shade,.18);path('canopy',`M${fmt(x)} ${fmt(y)}v${fmt(-30*s)}`,'none',{stroke:'#8a8362','stroke-width':3*s});for(const [dx,dy,r]of [[-9,-23,11],[8,-26,12],[-1,-38,13],[0,-22,13]])circle('canopy',x+dx*s,y+dy*s,r*s,p.leaf);circle('canopy',x-3*s,y-41*s,9*s,p.leafLight,.82);path('canopy',`M${fmt(x-9*s)} ${fmt(y-28*s)}q${fmt(6*s)} ${fmt(-11*s)} ${fmt(13*s)} ${fmt(-8*s)}`,'none',{stroke:'#c6d4ac','stroke-width':1.2*s,opacity:.38});}
 for(let i=0;i<90;i++){const x=25+random()*675,y=85+random()*485,near=T.nearest(points,x,y),station=spine[Math.max(0,Math.min(spine.length-1,Math.round((near.index+near.t)/Math.max(1,points.length-1)*(spine.length-1))))],a=points[near.index],b=points[Math.min(points.length-1,near.index+1)],ele=Number.isFinite(a?.[2])&&Number.isFinite(b?.[2])?a[2]+(b[2]-a[2])*near.t:null,high=Number.isFinite(ele)?ele>3000:station?.progress>.25;if(near.distance<30||waterDistance(x,y)<(theme==='gorge'?42:12)||(theme==='snow'&&high)||(theme==='meadow'&&near.distance<120&&high)||random()>.52)continue;tree(x,y,(theme==='snow'?.42:.52)+random()*.3);}
 for(const [i,pt]of terrain.water.entries())path('water',`M${fmt(pt.x-5)} ${fmt(pt.y)}q4-2 9-1`,'none',{stroke:'#e0efdc','stroke-width':1.4,opacity:.48,flow:true});
 // Soft irregular cloud silhouettes have a lit rim and a quieter underside.
 for(const [i,x,y,s]of [[0,151,66,1.08],[1,532,85,1.16],[2,316,249,.66]]){
 const z=(a,b)=>`${fmt(x+a*s)} ${fmt(y+b*s)}`,group=`cloud-${i}`;
 path('clouds',`M${z(-60,8)}Q${z(-70,-5)} ${z(-48,-9)}Q${z(-42,-27)} ${z(-19,-20)}Q${z(-7,-38)} ${z(14,-22)}Q${z(37,-27)} ${z(43,-9)}Q${z(71,-5)} ${z(58,10)}Q${z(30,21)} ${z(-4,17)}Q${z(-41,23)} ${z(-60,8)}Z`,'#f9fbe9',{opacity:.83,cloud:group});
 path('clouds',`M${z(-56,8)}Q${z(-20,10)} ${z(2,3)}Q${z(30,5)} ${z(57,8)}Q${z(32,20)} ${z(-4,17)}Q${z(-35,22)} ${z(-56,8)}Z`,'#cbdcce',{opacity:.22,cloud:group});
 path('clouds',`M${z(-44,-9)}Q${z(-35,-23)} ${z(-20,-17)}Q${z(-6,-33)} ${z(11,-21)}`,'none',{stroke:'#fffef3','stroke-width':2.5,opacity:.4,cloud:group});
 }
 layers.mist=[];
 for(const [i,y]of [[0,247],[1,400],[2,528]]){
 path('mist',`M-100 ${y}Q80 ${y-33} 239 ${y-10}T495 ${y-25}T840 ${y+7}Q703 ${y+48} 509 ${y+31}T243 ${y+49}T-100 ${y+34}Z`,'#eaf4ed',{opacity:.74,mist:`mist-${i}`});
 path('mist',`M-100 ${y+23}Q88 ${y-1} 263 ${y+15}T573 ${y+11}T840 ${y+27}Q624 ${y+45} 421 ${y+36}T-100 ${y+43}Z`,'#fbfcf0',{opacity:.32,mist:`mist-${i}`});
 }
 // Everything above is scenic illustration; the reference route and named checkpoints stay in the existing coordinate overlay.
 return {theme,palette:p,layers,terrain};
 }
 function attributes(f){const skip=new Set(['tag','cloud','origin','flow','mist']);return Object.entries(f).filter(([k])=>!skip.has(k));}
 function svg(plan){let s='<svg xmlns="http://www.w3.org/2000/svg" width="720" height="600" viewBox="0 0 720 600">';for(const [name,features]of Object.entries(plan.layers)){if(name==='mist')continue;for(const f of features)s+=`<${f.tag} ${attributes(f).map(([k,v])=>`${k}="${v}"`).join(' ')}/>`;}return s+'</svg>';}
 return {build,attributes,svg,palettes};
}));
