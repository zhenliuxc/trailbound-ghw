(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailScenery=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const palettes={meadow:{sky:'#dfead6',ground:'#e4e5bd',far:'#b0c3a7',mid:'#8faa7c',light:'#c9d69f',shade:'#70916b',grass:'#819459',leaf:'#67855b',leafLight:'#a0b37a',water:'#70ada7'},gorge:{sky:'#d9e6df',ground:'#dfdec3',far:'#a7bcb1',mid:'#8aab93',light:'#b7c69f',shade:'#627e77',grass:'#879967',leaf:'#5c8265',leafLight:'#9cbd8b',water:'#659f9e'},snow:{sky:'#dce8e9',ground:'#e1e7df',far:'#adbfc1',mid:'#8caaa8',light:'#d9e5df',shade:'#6f908e',grass:'#9bada3',leaf:'#70958a',leafLight:'#aec8b9',water:'#9ac6c8'}};
 function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
 const fmt=n=>Math.round(n*100)/100;
 function build(route,points){const theme=route.theme==='snow'?'snow':route.theme==='gorge'?'gorge':'meadow',p=palettes[theme],random=rng(theme==='snow'?719:theme==='gorge'?947:113),layers={ground:[],land:[],details:[],canopy:[],clouds:[],water:[]};
 function add(layer,tag,attrs,extra={}){const feature={tag,...attrs,...extra};layers[layer].push(feature);return feature;}
 const path=(layer,d,fill,extra={})=>add(layer,'path',{d,fill,...extra});
 const ellipse=(layer,cx,cy,rx,ry,fill,opacity=1)=>add(layer,'ellipse',{cx:fmt(cx),cy:fmt(cy),rx:fmt(rx),ry:fmt(ry),fill,opacity});
 const circle=(layer,cx,cy,r,fill,opacity=1)=>add(layer,'circle',{cx:fmt(cx),cy:fmt(cy),r:fmt(r),fill,opacity});
 const distance=(x,y)=>Math.min(...points.map(pt=>Math.hypot(pt[0]-x,pt[1]-y)));
 add('ground','rect',{x:-400,y:-400,width:1600,height:1400,fill:p.sky});
 path('ground','M-60 172Q100 135 232 195T492 165T790 177V680H-60Z',p.ground);
 path('ground','M-50 418Q86 310 217 385T472 418T790 346V680H-50Z',theme==='snow'?'#cfdbd6':'#cbd5ae');
 path('ground','M-70 564Q115 482 315 565T790 480V680H-70Z',theme==='snow'?'#bbcfc8':'#b4c49c');
 // Broken ridgelines and separate light/shadow faces replace geometric triangle peaks.
 function mountain(x,y,w,h){const z=(a,b)=>`${fmt(x+a*w)},${fmt(y+b*h)}`;
 ellipse('land',x,y+h*.62,w*.62,h*.15,p.shade,.12);
 path('land',`M${z(-.62,.54)}Q${z(-.49,.27)} ${z(-.36,.1)}L${z(-.22,-.05)}Q${z(-.1,-.34)} ${z(.03,-.52)}L${z(.12,-.33)} ${z(.23,-.27)}Q${z(.4,.11)} ${z(.66,.54)}Q${z(.18,.7)} ${z(-.62,.54)}Z`,p.mid);
 path('land',`M${z(.03,-.52)}L${z(.12,-.33)} ${z(.23,-.27)}Q${z(.4,.11)} ${z(.66,.54)}Q${z(.32,.48)} ${z(.11,.6)}L${z(.04,.08)} ${z(-.06,-.04)}Z`,p.shade);
 path('land',`M${z(-.36,.1)}L${z(-.22,-.05)}Q${z(-.1,-.34)} ${z(.03,-.52)}L${z(-.05,-.12)} ${z(-.14,-.03)} ${z(-.21,.18)} ${z(-.42,.36)}Z`,p.light);
 if(theme==='snow')path('land',`M${z(-.17,-.15)}Q${z(-.05,-.39)} ${z(.03,-.52)}L${z(.12,-.33)} ${z(.23,-.27)} ${z(.28,-.18)} ${z(.13,-.2)} ${z(.08,-.11)} ${z(-.02,-.2)} ${z(-.1,-.09)}Z`,'#f6faf0');
 for(let k=0;k<4;k++){const xx=x+(-.28+k*.15)*w,yy=y+(.2+k*.06)*h;path('land',`M${fmt(xx)} ${fmt(yy)}q${fmt(w*.1)} ${fmt(h*.12)} ${fmt(w*.21)} ${fmt(h*.15)}`,'none',{stroke:p.light,'stroke-width':1.1,opacity:.4});}
 }
 for(const [x,y,w,h]of [[91,145,172,142],[375,98,138,104],[645,180,184,177],[77,383,146,127],[604,391,154,136],[338,527,151,117]])if(distance(x,y)>54)mountain(x,y,w,h);
 // Contour strokes, grass tufts, tiny flowers and scree give the ground a readable material.
 for(let i=0;i<180;i++){const x=18+random()*684,y=135+random()*415;if(distance(x,y)<24)continue;if(theme==='snow'){const size=2+random()*4;path('details',`M${fmt(x-size)} ${fmt(y+2)}l${fmt(size*.6)} ${fmt(-size)} ${fmt(size)} ${fmt(-size*.25)} ${fmt(size*.8)} ${fmt(size*.8)}-1 ${fmt(size*.7)}Z`,i%4===0?'#eef5e9':'#93aaa2',{opacity:.45});}else if(i%7===0){ellipse('details',x,y,2.6,1.7,'#acb08a',.65);}else{path('details',`M${fmt(x-3)} ${fmt(y+3)}q1-4-1-7m4 7q-1-6 3-9m-1 10 5-5`,'none',{stroke:p.grass,'stroke-width':.8,opacity:.42});if(i%11===0)circle('details',x+2,y-4,1.4,'#eee4ac');}}
 function tree(x,y,s){ellipse('canopy',x+6*s,y+6*s,17*s,5*s,p.shade,.18);path('canopy',`M${fmt(x)} ${fmt(y)}v${fmt(-30*s)}`,'none',{stroke:'#8a8362','stroke-width':3*s});for(const [dx,dy,r]of [[-9,-23,11],[8,-26,12],[-1,-38,13],[0,-22,13]])circle('canopy',x+dx*s,y+dy*s,r*s,p.leaf);circle('canopy',x-3*s,y-41*s,9*s,p.leafLight,.82);path('canopy',`M${fmt(x-9*s)} ${fmt(y-28*s)}q${fmt(6*s)} ${fmt(-11*s)} ${fmt(13*s)} ${fmt(-8*s)}`,'none',{stroke:'#c6d4ac','stroke-width':1.2*s,opacity:.38});}
 for(let i=0;i<38;i++){const x=25+random()*675,y=155+random()*385;if(distance(x,y)<55)continue;tree(x,y,(theme==='snow'?.42:.55)+random()*.35);}
 if(theme==='gorge'){
 const river='M-30 590Q125 465 255 467T477 343T770 259';
 path('ground',river,'none',{stroke:'#a7c4b0','stroke-width':39,'stroke-linecap':'round'});path('ground',river,'none',{stroke:p.water,'stroke-width':26,'stroke-linecap':'round'});path('ground',river,'none',{stroke:'#b3d2c3','stroke-width':3,'stroke-linecap':'round',opacity:.8});
 for(let i=0;i<15;i++){const x=48+i*43,y=535-x*.38+Math.sin(i*.65)*18;path('water',`M${fmt(x)} ${fmt(y)}q9-5 20-3`,'none',{stroke:'#e0efdc','stroke-width':1.8,opacity:.48,flow:true});}
 }else if(theme==='snow'){ellipse('ground',519,485,72,17,'#a9c7c1',.48);ellipse('ground',519,482,60,11,'#d0e5df',.8);}
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
 return {theme,palette:p,layers};
 }
 function attributes(f){const skip=new Set(['tag','cloud','origin','flow','mist']);return Object.entries(f).filter(([k])=>!skip.has(k));}
 function svg(plan){let s='<svg xmlns="http://www.w3.org/2000/svg" width="720" height="600" viewBox="0 0 720 600">';for(const [name,features]of Object.entries(plan.layers)){if(name==='mist')continue;for(const f of features)s+=`<${f.tag} ${attributes(f).map(([k,v])=>`${k}="${v}"`).join(' ')}/>`;}return s+'</svg>';}
 return {build,attributes,svg,palettes};
}));
