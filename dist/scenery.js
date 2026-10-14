(function(root,factory){const T=typeof module==='object'&&module.exports?require('./terrain.js'):root.TrailTerrain;const api=factory(T);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailScenery=api;}(typeof globalThis!=='undefined'?globalThis:this,function(T){
 'use strict';
 const palettes={meadow:{sky:'#e6eed9',ground:'#dce4be',far:'#bfd5b3',mid:'#84a660',light:'#d4e2ae',shade:'#64884f',grass:'#8fa85d',leaf:'#648b57',leafLight:'#a5c17b',water:'#79b9b3'},gorge:{sky:'#e4eade',ground:'#ccd5c1',far:'#8ca4a3',mid:'#b7b28e',light:'#e2d4af',shade:'#86927c',grass:'#a3a671',leaf:'#678d69',leafLight:'#aac393',water:'#a0ac95'},snow:{sky:'#e3eff0',ground:'#d3d4bf',far:'#c1d7ce',mid:'#99aaa0',light:'#d9deca',shade:'#6e887e',grass:'#aabfb0',leaf:'#769f87',leafLight:'#bbd6be',water:'#a0cdd0'}};
 function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
 const fmt=n=>Math.round(n*100)/100;
 function regionalLandscape({theme,terrain,points,p,add}){
 const path=(layer,d,fill,extra={})=>add(layer,'path',{d,fill,...extra});
 const ellipse=(layer,cx,cy,rx,ry,fill,opacity=1)=>add(layer,'ellipse',{cx:fmt(cx),cy:fmt(cy),rx:fmt(rx),ry:fmt(ry),fill,opacity});
 const pt=(x,y)=>`${fmt(x)} ${fmt(y)}`;
 function meadow(x,y,w,h){
  const z=(a,b)=>pt(x+a*w,y+b*h);
  ellipse('land',x,y+h*.35,w*.53,h*.13,'#506d45',.11);
  path('land',`M${z(-.65,.33)}Q${z(-.47,-.09)} ${z(-.24,-.31)}Q${z(-.10,-.71)} ${z(.08,-.59)}Q${z(.27,-.44)} ${z(.58,.18)}L${z(.7,.45)}Q${z(.2,.73)} ${z(-.65,.33)}Z`,p.mid);
  path('land',`M${z(.08,-.59)}Q${z(.27,-.44)} ${z(.58,.18)}L${z(.7,.45)}Q${z(.36,.47)} ${z(.04,.59)}Q${z(.18,.08)} ${z(.08,-.59)}Z`,p.shade);
  path('land',`M${z(-.5,.15)}Q${z(-.32,-.07)} ${z(-.24,-.31)}Q${z(-.1,-.68)} ${z(.08,-.59)}Q${z(-.08,-.34)} ${z(-.11,-.07)}Q${z(-.27,.15)} ${z(-.5,.15)}Z`,p.light);
 }
 function rock(x,y,w,h,withSnow=false,layer='land'){
  const z=(a,b)=>pt(x+a*w,y+b*h);
  ellipse(layer,x,y+h*.54,w*.57,h*.10,p.shade,.14);
  path(layer,`M${z(-.62,.54)}L${z(-.46,.1)} ${z(-.32,.02)} ${z(-.25,-.19)} ${z(-.10,-.15)} ${z(.02,-.52)} ${z(.14,-.39)} ${z(.2,-.12)} ${z(.36,-.2)} ${z(.44,.02)} ${z(.63,.5)}Q${z(.1,.7)} ${z(-.62,.54)}Z`,p.mid);
  path(layer,`M${z(.02,-.52)}L${z(.14,-.39)} ${z(.2,-.12)} ${z(.36,-.2)} ${z(.44,.02)} ${z(.63,.5)}L${z(.12,.53)} ${z(.04,.05)} ${z(-.08,-.13)}Z`,p.shade);
  path(layer,`M${z(-.46,.1)}L${z(-.32,.02)} ${z(-.25,-.19)} ${z(-.10,-.15)} ${z(.02,-.52)}L${z(-.10,-.07)} ${z(-.27,.13)} ${z(-.5,.38)}Z`,p.light);
  if(withSnow)path(layer,`M${z(-.10,-.16)}L${z(.02,-.52)} ${z(.14,-.39)} ${z(.18,-.22)} ${z(.10,-.25)} ${z(.07,-.16)} ${z(-.01,-.22)} ${z(-.07,-.09)}Z`,'#f4f5e9');
  path(layer,`M${z(.19,.12)}L${z(.28,.28)} ${z(.36,.32)}M${z(-.24,.27)}L${z(-.18,.39)}`,'none',{stroke:p.shade,'stroke-width':1.2,opacity:.40});
 }
 function cliff(x,y,w,h,side){
  const z=(a,b)=>pt(x+a*w,y+b*h);
  ellipse('land',x,y+h*.51,w*.62,h*.10,'#324d50',.16);
  path('land',`M${z(-.58,.54)}L${z(-.52,-.09)} ${z(-.39,-.2)} ${z(-.28,-.53)} ${z(-.1,-.42)} ${z(.02,-.56)} ${z(.23,-.29)} ${z(.44,-.2)} ${z(.60,.49)}Z`,'#9eaaa0');
  path('land',`M${z(-.28,-.53)}L${z(-.1,-.42)} ${z(.02,-.56)} ${z(.23,-.29)} ${z(.44,-.2)} ${z(.6,.49)}L${z(.1,.49)} ${z(.03,.0)} ${z(-.12,-.13)}Z`,'#60777a');
  path('land',`M${z(-.52,-.09)}L${z(-.39,-.2)} ${z(-.28,-.53)} ${z(-.25,-.15)} ${z(-.37,.16)} ${z(-.40,.38)}Z`,'#d1c9ae');
  path('land',`M${z(-.52,-.09)}L${z(-.39,-.2)} ${z(-.28,-.53)} ${z(-.10,-.42)} ${z(.02,-.56)} ${z(.08,-.43)} ${z(-.1,-.32)} ${z(-.23,-.38)} ${z(-.34,-.12)}Z`,'#879867');
  for(const [a,b]of [[-.25,-.14],[.2,-.12]])path('land',`M${z(a,b)}l${fmt(w*.03*side)} ${fmt(h*.2)} ${fmt(w*.07)} ${fmt(h*.16)}`,'none',{stroke:'#405d63','stroke-width':1.3,opacity:.28});
 }
 if(theme==='meadow'){
  path('ground','M-180 240Q-35 141 130 183T420 136T900 181V1000H-180Z','#bacdb5');
  path('ground','M-180 290Q80 247 260 279T640 238T900 291V1000H-180Z','#d3dfbc');
  for(const [progress,side,w,h]of [[.08,-1,208,98],[.32,1,230,116],[.57,-1,216,105],[.83,1,260,132]]){
   const q=terrain.spine[Math.round((terrain.spine.length-1)*progress)];if(q)meadow(q.x+q.nx*108*side,q.y+q.ny*108*side,w,h);
  }
  for(const peak of terrain.peaks)meadow(peak.x,peak.y+52,170,100);
 }else if(theme==='gorge'){
  rock(126,100,230,205,true,'ground');rock(601,62,250,218,true,'ground');
  const anchors=terrain.water.length?terrain.water:[terrain.spine[9],terrain.spine[26],terrain.spine[43]].filter(Boolean);
  for(const index of [1,5,9]){const q=anchors[Math.min(index,anchors.length-1)];if(!q)continue;for(const side of [-1,1])cliff(q.x+q.nx*(100+(index%3)*15)*side,q.y+q.ny*(100+(index%3)*15)*side,side<0?100:122,index===5?184:145,side);}
  for(const peak of terrain.peaks)rock(peak.x,peak.y+60,120,115,true);
 }else{
  path('ground','M-180 295Q80 225 265 280T600 222T900 270V1000H-180Z','#b8c4aa');
  path('ground','M-180 500Q100 410 312 463T650 401T900 445V1000H-180Z','#b3b39b');
  for(const [progress,side,w,h]of [[.12,-1,130,72],[.38,1,153,96],[.61,-1,165,110],[.86,1,145,98]]){
   const q=terrain.spine[Math.round((terrain.spine.length-1)*progress)];if(q)rock(q.x+q.nx*105*side,q.y+q.ny*105*side,w,h,progress>.5);
  }
  for(const peak of terrain.peaks)rock(peak.x,peak.y+43,110,83,true);
  for(let i=0;i<34;i++){const q=terrain.spine[Math.round((terrain.spine.length-1)*(.18+(i%15)*.045))];if(!q)continue;const side=i%2?1:-1,x=q.x+q.nx*(45+(i%6)*14)*side,y=q.y+q.ny*(45+(i%6)*14)*side,w=5+(i%5)*2;
   if(T.nearest(points,x,y).distance<27)continue;
   path('details',`M${pt(x-w,y+4)}L${pt(x-w*.7,y-4)} ${pt(x+2,y-7)} ${pt(x+w,y)} ${pt(x+w*.7,y+6)}Z`,i%3?'#a0a496':'#d2d6c3');
   path('details',`M${pt(x+2,y-7)}L${pt(x+w,y)} ${pt(x+w*.7,y+6)} ${pt(x+1,y+3)}Z`,'#788b80',{opacity:.7});
  }
 }
}
 function build(route,points,context={}){const theme=route.theme==='snow'?'snow':route.theme==='gorge'?'gorge':'meadow',p=palettes[theme],random=rng(theme==='snow'?719:theme==='gorge'?947:113),layers={ground:[],land:[],hydro:[],details:[],canopy:[],clouds:[],water:[]};
 function add(layer,tag,attrs,extra={}){const feature={tag,...attrs,...extra};layers[layer].push(feature);return feature;}
 const path=(layer,d,fill,extra={})=>add(layer,'path',{d,fill,...extra});
 const ellipse=(layer,cx,cy,rx,ry,fill,opacity=1)=>add(layer,'ellipse',{cx:fmt(cx),cy:fmt(cy),rx:fmt(rx),ry:fmt(ry),fill,opacity});
 const circle=(layer,cx,cy,r,fill,opacity=1)=>add(layer,'circle',{cx:fmt(cx),cy:fmt(cy),r:fmt(r),fill,opacity});
 const terrain=T.build(route,points,context),distance=(x,y)=>T.nearest(points,x,y).distance;
 add('ground','rect',{x:-400,y:-400,width:1600,height:1400,fill:p.sky});
 path('ground','M-180 100Q160 12 390 72T900 38V1000H-180Z',p.ground);
 const spine=terrain.spine,waters=terrain.features.filter(f=>f.kind==='water'),length=f=>f.line.reduce((n,p,i)=>n+(i?Math.hypot(p[0]-f.line[i-1][0],p[1]-f.line[i-1][1]):0),0),visibleWater=new Set([...waters].sort((a,b)=>length(b)-length(a)).slice(0,theme==='snow'?2:theme==='meadow'?3:waters.length)),waterDistance=(x,y)=>Math.min(Infinity,...[...visibleWater].map(f=>T.nearest(f.line,x,y).distance));
 regionalLandscape({theme,terrain,points,p,add});
 for(const feature of terrain.features){const d=T.line(feature.line);if(feature.kind==='water'){if(!visibleWater.has(feature))continue;
  const main=theme==='gorge',width=main?15:2.2;
  if(main)path('ground',d,'none',{stroke:'#d6c6a5','stroke-width':58,'stroke-linecap':'round','stroke-linejoin':'round'});
  path('hydro',d,'none',{stroke:main?'#aec7ba':'#c5dbce','stroke-width':width+5,'stroke-linecap':'round','stroke-linejoin':'round'});
  path('hydro',d,'none',{stroke:p.water,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round'});
 }else if(feature.kind==='cable')path('details',d,'none',{stroke:'#97a58b','stroke-width':1.2,opacity:.48});}
 // Sparse grass, flowers and stones add texture without cartographic linework.
 for(let i=0;i<100;i++){const x=18+random()*684,y=135+random()*415;if(distance(x,y)<24||waterDistance(x,y)<(theme==='gorge'?13:4))continue;if(theme==='snow'){const size=2+random()*4;path('details',`M${fmt(x-size)} ${fmt(y+2)}l${fmt(size*.6)} ${fmt(-size)} ${fmt(size)} ${fmt(-size*.25)} ${fmt(size*.8)} ${fmt(size*.8)}-1 ${fmt(size*.7)}Z`,i%4===0?'#f6faed':'#adc2b6',{opacity:.65});}else if(i%7===0){ellipse('details',x,y,3.5,2.3,'#b9b58e',.65);}else{path('details',`M${fmt(x-3)} ${fmt(y+3)}q1-4-1-7m4 7q-1-6 3-9m-1 10 5-5`,'none',{stroke:p.grass,'stroke-width':1.1,opacity:.55});if(i%11===0)circle('details',x+2,y-4,2.2,'#f0cc80');}}
 function tree(x,y,s){if(theme==='snow'){ellipse('canopy',x+5*s,y+5*s,15*s,4*s,'#567763',.16);path('canopy',`M${fmt(x)} ${fmt(y)}v${fmt(-31*s)}`,'none',{stroke:'#817955','stroke-width':2.2*s});for(const [yy,w]of [[-29,11],[-18,16],[-8,20]])path('canopy',`M${fmt(x-w*s)} ${fmt(y+yy*s)}L${fmt(x)} ${fmt(y+(yy-25)*s)}L${fmt(x+w*s)} ${fmt(y+yy*s)}Z`,yy===-29?'#a2b38c':'#698366');return;}ellipse('canopy',x+6*s,y+6*s,17*s,5*s,p.shade,.18);path('canopy',`M${fmt(x)} ${fmt(y)}v${fmt(-30*s)}`,'none',{stroke:'#8a8362','stroke-width':3*s});for(const [dx,dy,r]of [[-9,-23,11],[8,-26,12],[-1,-38,13],[0,-22,13]])circle('canopy',x+dx*s,y+dy*s,r*s,p.leaf);circle('canopy',x-3*s,y-41*s,9*s,p.leafLight,.82);path('canopy',`M${fmt(x-9*s)} ${fmt(y-28*s)}q${fmt(6*s)} ${fmt(-11*s)} ${fmt(13*s)} ${fmt(-8*s)}`,'none',{stroke:'#c6d4ac','stroke-width':1.2*s,opacity:.38});}
 for(let i=0;i<90;i++){const x=25+random()*675,y=85+random()*485,near=T.nearest(points,x,y),station=spine[Math.max(0,Math.min(spine.length-1,Math.round((near.index+near.t)/Math.max(1,points.length-1)*(spine.length-1))))],a=points[near.index],b=points[Math.min(points.length-1,near.index+1)],ele=Number.isFinite(a?.[2])&&Number.isFinite(b?.[2])?a[2]+(b[2]-a[2])*near.t:null,high=Number.isFinite(ele)?ele>3000:station?.progress>.25;if(near.distance<30||waterDistance(x,y)<(theme==='gorge'?42:12)||(theme==='snow'&&high)||(theme==='meadow'&&near.distance<120&&high)||random()>.52)continue;tree(x,y,(theme==='snow'?.42:.52)+random()*.3);}
 for(const [i,pt]of terrain.water.entries())path('water',`M${fmt(pt.x-5)} ${fmt(pt.y)}q4-2 9-1`,'none',{stroke:'#e0efdc','stroke-width':1.4,opacity:.48,flow:true});
 // Soft irregular cloud silhouettes have a lit rim and a quieter underside.
 const cloudLayout=theme==='meadow'?[[0,144,462,1.7],[1,519,360,1.4],[2,356,65,.9]]:theme==='gorge'?[[0,150,46,.78],[1,552,75,.88],[2,398,185,.46]]:[[0,151,66,.9],[1,532,85,1.0],[2,316,249,.6]];
 for(const [i,x,y,s]of cloudLayout){
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
 return {theme,palette:p,layers,terrain,localStyle:theme==='meadow'?'wugong-grass-ridges':theme==='gorge'?'tiger-deep-gorge':'qinling-rock-and-forest'};
 }
 function attributes(f){const skip=new Set(['tag','cloud','origin','flow','mist']);return Object.entries(f).filter(([k])=>!skip.has(k));}
 function svg(plan){let s='<svg xmlns="http://www.w3.org/2000/svg" width="720" height="600" viewBox="0 0 720 600">';for(const [name,features]of Object.entries(plan.layers)){if(name==='mist')continue;for(const f of features)s+=`<${f.tag} ${attributes(f).map(([k,v])=>`${k}="${v}"`).join(' ')}/>`;}return s+'</svg>';}
 return {build,attributes,svg,palettes};
}));
