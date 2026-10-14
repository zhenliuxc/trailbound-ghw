(function(root,factory){const T=typeof module==='object'&&module.exports?require('./terrain.js'):root.TrailTerrain;const api=factory(T);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailScenery=api;}(typeof globalThis!=='undefined'?globalThis:this,function(T){
 'use strict';
 const palettes={meadow:{sky:'#dfead6',ground:'#e4e5bd',far:'#b0c3a7',mid:'#8faa7c',light:'#c9d69f',shade:'#70916b',grass:'#819459',leaf:'#67855b',leafLight:'#a0b37a',water:'#70ada7'},gorge:{sky:'#d9e6df',ground:'#dfdec3',far:'#a7bcb1',mid:'#8aab93',light:'#b7c69f',shade:'#627e77',grass:'#879967',leaf:'#5c8265',leafLight:'#9cbd8b',water:'#659f9e'},snow:{sky:'#dce8e9',ground:'#e1e7df',far:'#adbfc1',mid:'#8caaa8',light:'#d9e5df',shade:'#6f908e',grass:'#9bada3',leaf:'#70958a',leafLight:'#aec8b9',water:'#9ac6c8'}};
 function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
 const fmt=n=>Math.round(n*100)/100;
 function build(route,points,context={}){const theme=route.theme==='snow'?'snow':route.theme==='gorge'?'gorge':'meadow',p=palettes[theme],random=rng(theme==='snow'?719:theme==='gorge'?947:113),layers={ground:[],land:[],hydro:[],details:[],canopy:[],clouds:[],water:[]};
 function add(layer,tag,attrs,extra={}){const feature={tag,...attrs,...extra};layers[layer].push(feature);return feature;}
 const path=(layer,d,fill,extra={})=>add(layer,'path',{d,fill,...extra});
 const ellipse=(layer,cx,cy,rx,ry,fill,opacity=1)=>add(layer,'ellipse',{cx:fmt(cx),cy:fmt(cy),rx:fmt(rx),ry:fmt(ry),fill,opacity});
 const circle=(layer,cx,cy,r,fill,opacity=1)=>add(layer,'circle',{cx:fmt(cx),cy:fmt(cy),r:fmt(r),fill,opacity});
 const terrain=T.build(route,points,context),distance=(x,y)=>T.nearest(points,x,y).distance;
 add('ground','rect',{x:-400,y:-400,width:1600,height:1400,fill:p.sky});
 path('ground','M-180 100Q160 12 390 72T900 38V1000H-180Z',theme==='snow'?'#d4e0da':theme==='gorge'?'#c9d4bd':'#cbd8af');
 const spine=terrain.spine,waters=terrain.features.filter(f=>f.kind==='water'),waterDistance=(x,y)=>Math.min(Infinity,...waters.map(f=>T.nearest(f.line,x,y).distance));
 // These ridge faces follow the reference route; widths and shading remain illustration.
 if(spine.length){
  const wide=q=>(theme==='gorge'?70:85)+Math.sin(q.progress*Math.PI)*20;
  path('ground',T.band(spine,q=>-wide(q),q=>wide(q)),theme==='snow'?'#b5cac2':theme==='gorge'?'#a6b6a0':'#a9bf8b');
  path('land',T.band(spine,q=>-wide(q)*.9,-8),theme==='snow'?'#e8ede0':theme==='gorge'?'#d4d7b7':'#d6dfa8');
  path('land',T.band(spine,8,q=>wide(q)*.85),theme==='snow'?'#8faea6':theme==='gorge'?'#879e8b':'#91ac77');
  path('land',T.band(spine,-19,19),theme==='snow'?'#f3f4e9':theme==='gorge'?'#dce0c2':'#e4e5b6');
  for(const width of [-65,-43,42,65])path('details',T.line(T.offset(spine,width)),'none',{stroke:theme==='snow'?'#f1f4e7':'#a6b786','stroke-width':1,opacity:.38});
 }
 for(const feature of terrain.features){const d=T.line(feature.line);if(feature.kind==='water'){
  const main=theme==='gorge',width=main?15:2.2;
  if(main){path('ground',d,'none',{stroke:'#93aca2','stroke-width':104,'stroke-linecap':'round','stroke-linejoin':'round'});path('ground',d,'none',{stroke:'#6e8d86','stroke-width':60,'stroke-linecap':'round','stroke-linejoin':'round'});}
  path('hydro',d,'none',{stroke:main?'#aec7ba':'#c5dbce','stroke-width':width+5,'stroke-linecap':'round','stroke-linejoin':'round'});
  path('hydro',d,'none',{stroke:p.water,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round'});
 }else if(feature.kind==='cable')path('details',d,'none',{stroke:'#97a58b','stroke-width':1.2,opacity:.48});}
 // Broken ridgelines and separate light/shadow faces replace geometric triangle peaks.
 function mountain(x,y,w,h){const z=(a,b)=>`${fmt(x+a*w)},${fmt(y+b*h)}`;
 ellipse('land',x,y+h*.62,w*.62,h*.15,p.shade,.12);
 path('land',`M${z(-.62,.54)}Q${z(-.49,.27)} ${z(-.36,.1)}L${z(-.22,-.05)}Q${z(-.1,-.34)} ${z(.03,-.52)}L${z(.12,-.33)} ${z(.23,-.27)}Q${z(.4,.11)} ${z(.66,.54)}Q${z(.18,.7)} ${z(-.62,.54)}Z`,p.mid);
 path('land',`M${z(.03,-.52)}L${z(.12,-.33)} ${z(.23,-.27)}Q${z(.4,.11)} ${z(.66,.54)}Q${z(.32,.48)} ${z(.11,.6)}L${z(.04,.08)} ${z(-.06,-.04)}Z`,p.shade);
 path('land',`M${z(-.36,.1)}L${z(-.22,-.05)}Q${z(-.1,-.34)} ${z(.03,-.52)}L${z(-.05,-.12)} ${z(-.14,-.03)} ${z(-.21,.18)} ${z(-.42,.36)}Z`,p.light);
 if(theme==='snow')path('land',`M${z(-.17,-.15)}Q${z(-.05,-.39)} ${z(.03,-.52)}L${z(.12,-.33)} ${z(.23,-.27)} ${z(.28,-.18)} ${z(.13,-.2)} ${z(.08,-.11)} ${z(-.02,-.2)} ${z(-.1,-.09)}Z`,'#f6faf0');
 for(let k=0;k<4;k++){const xx=x+(-.28+k*.15)*w,yy=y+(.2+k*.06)*h;path('land',`M${fmt(xx)} ${fmt(yy)}q${fmt(w*.1)} ${fmt(h*.12)} ${fmt(w*.21)} ${fmt(h*.15)}`,'none',{stroke:p.light,'stroke-width':1.1,opacity:.4});}
 }
 for(const peak of terrain.peaks){const h=theme==='snow'?42:63,w=theme==='snow'?65:91;mountain(peak.x-.03*w,peak.y+.52*h,w,h);}
 // Contour strokes, grass tufts, tiny flowers and scree give the ground a readable material.
 for(let i=0;i<180;i++){const x=18+random()*684,y=135+random()*415;if(distance(x,y)<24||waterDistance(x,y)<(theme==='gorge'?13:4))continue;if(theme==='snow'){const size=2+random()*4;path('details',`M${fmt(x-size)} ${fmt(y+2)}l${fmt(size*.6)} ${fmt(-size)} ${fmt(size)} ${fmt(-size*.25)} ${fmt(size*.8)} ${fmt(size*.8)}-1 ${fmt(size*.7)}Z`,i%4===0?'#eef5e9':'#93aaa2',{opacity:.45});}else if(i%7===0){ellipse('details',x,y,2.6,1.7,'#acb08a',.65);}else{path('details',`M${fmt(x-3)} ${fmt(y+3)}q1-4-1-7m4 7q-1-6 3-9m-1 10 5-5`,'none',{stroke:p.grass,'stroke-width':.8,opacity:.42});if(i%11===0)circle('details',x+2,y-4,1.4,'#eee4ac');}}
 function tree(x,y,s){ellipse('canopy',x+6*s,y+6*s,17*s,5*s,p.shade,.18);path('canopy',`M${fmt(x)} ${fmt(y)}v${fmt(-30*s)}`,'none',{stroke:'#8a8362','stroke-width':3*s});for(const [dx,dy,r]of [[-9,-23,11],[8,-26,12],[-1,-38,13],[0,-22,13]])circle('canopy',x+dx*s,y+dy*s,r*s,p.leaf);circle('canopy',x-3*s,y-41*s,9*s,p.leafLight,.82);path('canopy',`M${fmt(x-9*s)} ${fmt(y-28*s)}q${fmt(6*s)} ${fmt(-11*s)} ${fmt(13*s)} ${fmt(-8*s)}`,'none',{stroke:'#c6d4ac','stroke-width':1.2*s,opacity:.38});}
 for(let i=0;i<110;i++){const x=25+random()*675,y=85+random()*485,near=T.nearest(points,x,y),station=spine[Math.max(0,Math.min(spine.length-1,Math.round((near.index+near.t)/Math.max(1,points.length-1)*(spine.length-1))))],a=points[near.index],b=points[Math.min(points.length-1,near.index+1)],ele=Number.isFinite(a?.[2])&&Number.isFinite(b?.[2])?a[2]+(b[2]-a[2])*near.t:null,high=Number.isFinite(ele)?ele>3000:station?.progress>.25;if(near.distance<30||waterDistance(x,y)<(theme==='gorge'?42:12)||(theme==='snow'&&high)||(theme==='meadow'&&near.distance<120&&high)||random()>.52)continue;tree(x,y,(theme==='snow'?.42:.52)+random()*.3);}
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
