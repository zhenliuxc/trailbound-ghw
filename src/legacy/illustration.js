(function(root,factory){const T=typeof module==='object'&&module.exports?require('./terrain.js'):root.TrailTerrain;const api=factory(T);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailIllustration=api;}(typeof globalThis!=='undefined'?globalThis:this,function(T){
 'use strict';
 const f=n=>Math.round(n*100)/100;
 function watercourse(layers,feature,points,palette,halfWidth=2,theme='tea'){
  const length=feature.line.reduce((sum,p,i)=>sum+(i?Math.hypot(p[0]-feature.line[i-1][0],p[1]-feature.line[i-1][1]):0),0);
  const spine=T.sample(feature.line,Math.min(84,Math.max(16,Math.ceil(length/8))));
  if(spine.length<2)return;
  const path=(layer,d,fill,extra={})=>layers[layer].push({tag:'path',d,fill,'stroke-linecap':'round','stroke-linejoin':'round',...extra});
  const width=q=>halfWidth*(1+.12*Math.sin(q.progress*16+.7)+.07*Math.sin(q.progress*31));
  const margin=halfWidth>7?5:2.2;
  path('hydro',T.band(spine,q=>width(q)+margin,q=>-width(q)-margin),'#d6d5b6',{opacity:.82});
  path('hydro',T.band(spine,q=>width(q)+1.1,q=>-width(q)-1.1),'#aabdad',{opacity:.85});
  path('hydro',T.band(spine,width,q=>-width(q)),palette.water);
  path('hydro',T.band(spine,q=>width(q)*.24,q=>-width(q)*.72),theme==='gorge'?'#789b94':'#72aaa1',{opacity:.28});
  const markStep=Math.max(5,Math.round(spine.length/8));
  for(let i=3;i<spine.length-3;i+=markStep){
   const q=spine[i],tx=q.ny,ty=-q.nx,side=i%2?1:-1,along=Math.min(9,length/spine.length*1.1),edge=width(q)*.48*side;
   const p=(a,b)=>`${f(q.x+tx*a+q.nx*b)} ${f(q.y+ty*a+q.ny*b)}`;
   path('hydro',`M${p(-along,edge)}Q${p(0,edge+halfWidth*.1)} ${p(along,edge-halfWidth*.08)}`,'none',{stroke:'#eaf0d9','stroke-width':halfWidth>7?1.05:.65,opacity:.6});
   if(length<90||halfWidth<4||i%2===0)continue;
   const x=q.x+q.nx*(width(q)+margin+.7)*side,y=q.y+q.ny*(width(q)+margin+.7)*side;
   if(T.nearest(points,x,y).distance<26)continue;
   const z=(a,b)=>`${f(x+tx*a+q.nx*b)} ${f(y+ty*a+q.ny*b)}`;
   path('hydro',`M${z(-5,1)}Q${z(-6,-2)} ${z(-2,-3)}Q${z(2,-5)} ${z(5,-1)}L${z(4,2)}Q${z(0,3)} ${z(-5,1)}Z`,'#b4bba2',{stroke:'#8c9f8c','stroke-width':.45});
   path('hydro',`M${z(-4,0)}Q${z(-3,-3)} ${z(1,-3)}L${z(3,-1)}`,'none',{stroke:'#e5e2c4','stroke-width':.8,opacity:.8});
  }
 }
 // Small, deliberately drawn silhouettes. Both renderers consume these same paths.
 function westlake(layers,terrain,points,bounds={x:0,y:0,w:720,h:600}){
  const density=Math.min(3,bounds.w*bounds.h/(720*600));
  for(const name of ['ground','land','hydro','details','canopy','water'])layers[name]=[];
  const add=(layer,tag,attrs)=>layers[layer].push({tag,...attrs});
  function pen(layer,x=0,y=0,s=1){return {
   path(d,fill,stroke='none',width=.8,opacity=1){let i=0;d=d.replace(/-?\d*\.?\d+/g,n=>f(Number(n)*s+(i++%2?y:x)));add(layer,'path',{d,fill,stroke,'stroke-width':f(width*s),'stroke-linecap':'round','stroke-linejoin':'round',opacity});},
   ellipse(cx,cy,rx,ry,fill,opacity=1){add(layer,'ellipse',{cx:f(x+cx*s),cy:f(y+cy*s),rx:f(rx*s),ry:f(ry*s),fill,opacity});},
   circle(cx,cy,r,fill,opacity=1){add(layer,'circle',{cx:f(x+cx*s),cy:f(y+cy*s),r:f(r*s),fill,opacity});}
  };}
  const ground=pen('ground');
  add('ground','rect',{x:-400,y:-400,width:1600,height:1400,fill:'#edf0dd'});
  ground.path('M-180 130 C-30 10 112 67 254 109 C414 133 489 22 622 77 C742 120 811 79 900 126 L900 1000 L-180 1000 Z','#cfdbbd');
  ground.path('M-180 183 C-8 119 97 146 196 169 C289 191 364 142 454 162 C573 188 608 98 752 165 L900 189 L900 1000 L-180 1000 Z','#dce3c7');
  ground.path('M-180 310 C-44 186 81 235 174 284 C262 318 410 220 526 263 C651 308 709 203 900 262 L900 1000 L-180 1000 Z','#e5e8c9');
  ground.path('M-180 488 C-17 333 120 437 206 467 C352 517 459 376 589 402 C716 426 776 411 900 455 L900 1000 L-180 1000 Z','#d8dfbb');
  ground.path('M-180 540 C56 486 101 544 250 570 C360 589 421 520 523 522 C671 534 731 487 900 524 L900 1000 L-180 1000 Z','#e7e6c9');
  // Broken, translucent washes and tapered brush marks suggest paper and a grassy slope.
  let seed=739;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  for(let i=0;i<Math.round(85*density);i++){const x=bounds.x-50+random()*(bounds.w+100),y=bounds.y+70+random()*(bounds.h-10),w=5+random()*23;
   pen('ground',x,y).path(`M0 0 Q${f(w*.5)} -3 ${f(w)} 0 Q${f(w*.6)} 2 0 0 Z`,i%3?'#b5c49b':'#fbf8e6','none',0,.12+random()*.09);
  }
  function hill(x,y,s,variant=0){const p=pen('land',x,y,s);
   p.ellipse(4,21,103,17,'#789066',.10);
   p.path('M-105 17 C-80 2 -77 -23 -51 -41 C-32 -56 -19 -93 7 -96 C39 -89 39 -59 62 -37 C80 -23 92 -3 105 19 C35 42 -46 39 -105 17 Z',variant?'#a1b380':'#bdcd96');
   p.path('M7 -96 C39 -89 39 -59 62 -37 C80 -23 92 -3 105 19 C82 27 66 32 32 34 C40 9 22 -10 26 -29 C33 -49 8 -72 7 -96 Z',variant?'#879e73':'#a0b582');
   p.path('M-96 13 C-76 -2 -74 -21 -51 -41 C-32 -56 -19 -93 7 -96 C-17 -69 -12 -52 -40 -25 C-64 -12 -74 3 -96 13 Z','#dbe1b2','none',0,.7);
   for(const [xx,yy]of [[-69,0],[-43,-32],[-20,-54],[55,-4],[65,10]])p.path(`M${xx} ${yy} Q${xx+9} ${yy-4} ${xx+20} ${yy-3}`,'none','#789461',1,.24);
  }
  hill(155,188,.95);hill(560,202,1.08,1);hill(75,375,.74);hill(646,443,.77);
  // Select existing geographic water segments; widths are illustrative, coordinates unchanged.
  const length=feature=>feature.line.reduce((n,p,i)=>n+(i?Math.hypot(p[0]-feature.line[i-1][0],p[1]-feature.line[i-1][1]):0),0);
  const waters=terrain.features.filter(v=>v.kind==='water').sort((a,b)=>length(b)-length(a)).slice(0,4);
  for(const [index,feature]of waters.entries()){
   watercourse(layers,feature,points,{water:'#a1c8bb'},index?4:8,'tea');
   if(!index)for(const q of T.sample(feature.line,12).slice(1,-1)){
    const tx=q.ny,ty=-q.nx,p=(along,across)=>`${f(q.x+tx*along+q.nx*across)} ${f(q.y+ty*along+q.ny*across)}`;
    add('water','path',{d:`M${p(-4,0)}Q${p(0,1)} ${p(5,0)}`,fill:'none',stroke:'#eef4da','stroke-width':.8,opacity:.48,flow:true});
   }
  }
  function tree(x,y,s,variant=0){const p=pen('canopy',x,y,s);
   p.ellipse(7,3,24,6,'#5a7657',.13);
   p.path('M-4 2 Q-2 -10 -3 -30 L2 -31 Q2 -10 5 1 Z','#928767');
   p.path('M-1 -18 Q-14 -24 -21 -36 M0 -22 Q11 -31 17 -40','none','#817b5e',1.3);
   p.path('M-25 -26 C-36 -29 -31 -42 -26 -47 C-30 -57 -17 -61 -10 -59 C-9 -70 8 -75 17 -65 C29 -67 36 -57 31 -49 C43 -38 29 -27 21 -24 C9 -15 -16 -16 -25 -26 Z',variant?'#78956a':'#75946b','#69845e',.65);
   p.path('M-25 -26 C-36 -29 -31 -42 -26 -47 C-30 -57 -17 -61 -10 -59 C-9 -70 8 -75 17 -65 C1 -65 4 -51 -12 -48 C-25 -46 -14 -32 -25 -26 Z',variant?'#b3c38a':'#a9bd87');
   p.path('M10 -24 C26 -19 43 -38 31 -49 C25 -38 9 -45 11 -34 C4 -32 2 -26 10 -24 Z','#54795c','none',0,.7);
   p.path('M-18 -37 Q-10 -33 -7 -38 M0 -53 Q7 -49 13 -54 M19 -39 Q25 -38 29 -44','none','#dae0ad',1.05,.56);
   p.path('M-19 -52 Q-12 -54 -11 -50 M4 -65 Q9 -67 12 -62 M-8 -27 Q-2 -30 3 -27','none','#d8dfa7',.8,.6);
   for(const [dx,dy]of [[-19,-46],[3,-56],[16,-40],[-7,-34],[23,-52]]){
    p.path(`M${dx-2} ${dy} Q${dx} ${dy-5} ${dx+4} ${dy-2} Q${dx+1} ${dy+1} ${dx-2} ${dy} Z`,'#c1cf96','none',0,.55);
   }
   p.path('M-1 -15 Q0 -6 1 -1','none','#c4b18a',.8);
  }
  // Place trees by their full canopy width, leaving the route and creek readable.
  const clear=(x,y,r)=>T.nearest(points,x,y).distance>r+22&&waters.every(v=>T.nearest(v.line,x,y).distance>r+13);
  const trees=[];
  for(let i=0;i<Math.round(220*density)&&trees.length<Math.round(27*density);i++){const x=bounds.x+22+random()*(bounds.w-46),y=bounds.y+125+random()*(bounds.h-115),s=.6+random()*.35;
   if(!clear(x,y-30*s,34*s)||trees.some(v=>Math.hypot(v.x-x,v.y-y)<39))continue;
   // Tea terraces occupy the upper eastern bank; woodland frames the creek below.
   if(x>330&&x<563&&y<285)continue;trees.push({x,y,s});
  }
  trees.sort((a,b)=>a.y-b.y).forEach((v,i)=>tree(v.x,v.y,v.s,i%3===0));
  function terrace(x,y,s){const p=pen('land',x,y,s);
   p.path('M-88 16 C-70 -8 -55 -46 -12 -60 C21 -86 60 -44 95 6 C69 31 -31 48 -88 16 Z','#b9ca92');
   p.path('M-12 -60 C21 -86 60 -44 95 6 C83 22 63 23 46 31 C47 -1 22 -34 -12 -60 Z','#a4ba86');
   for(let row=0;row<6;row++){const yy=-39+row*12,half=32+row*8;
    p.path(`M${-half} ${yy+3} Q-1 ${yy-14} ${half} ${yy-4} L${half-1} ${yy+3} Q-1 ${yy-7} ${-half} ${yy+9} Z`,'#62895c','#587e53',.45);
    layers.land.at(-1)['data-tea-row']='true';
    p.path(`M${-half+2} ${yy+3} Q-1 ${yy-13} ${half-2} ${yy-4}`,'none','#a8bf7e',2.6,.8);
    for(let col=0;col<7;col++){const xx=-half+7+col*(half*2-14)/6,cy=yy-7+Math.pow(xx/half,2)*8;
     p.path(`M${f(xx-3)} ${f(cy)} Q${f(xx-1)} ${f(cy-5)} ${f(xx+3)} ${f(cy-2)} Q${f(xx+1)} ${f(cy+1)} ${f(xx-3)} ${f(cy)} Z`,col%2?'#c0cc91':'#95b777','none',0,.78);
    }
   }
   p.path('M-92 19 Q-19 53 99 12','none','#e8dfb6',3);
  }
  const q=terrain.spine[Math.round(.66*(terrain.spine.length-1))];
  if(q){terrace(q.x+118,q.y+22,.86);terrace(q.x+165,q.y-82,.69);terrace(q.x-134,q.y-66,.64);}
  function house(x,y,s,variant=0){const p=pen('canopy',x,y,s);
   p.ellipse(3,29,40,9,'#5e765c',.13);
   p.path('M-29 -1 L21 -4 L21 29 L-29 27 Z','#f0ead2','#a7ad8d',.65);
   p.path('M21 -4 L37 -13 L37 19 L21 29 Z','#cfcfb3','#a7ad8d',.65);
   p.path('M-36 -3 Q-19 -10 -2 -26 L44 -20 Q36 -5 22 -1 Z','#657e73','#536c63',.7);
   p.path('M-36 -3 Q-20 -8 -2 -26 L44 -20','none','#91a28b',1.3);
   p.path('M-36 -3 L22 -1 L21 3 L-34 1 Z','#899680');
   for(let i=0;i<6;i++)p.path(`M${-24+i*8} ${-5-i*.25} L${-10+i*8} ${-23+i*.35}`,'none','#aec0a0',.65,.48);
   for(const xx of [-21,6]){p.path(`M${xx} 7 L${xx+9} 7 L${xx+9} 17 L${xx} 17 Z`,'#66847a','#aeac89',.7);p.path(`M${xx+4.5} 7 L${xx+4.5} 17 M${xx} 12 L${xx+9} 12`,'none','#dad5b7',.55);}
   p.path('M-7 8 L0 8 L0 28 L-7 28 Z','#a4936b');p.path('M-12 28 L5 28 L8 31 L-14 31 Z','#c8c5a2');
   p.path('M26 3 L31 0 L31 11 L26 14 Z','#779286');
   if(variant){p.path('M-33 12 Q-43 10 -44 20 Q-43 27 -37 24','none','#859961',2);p.ellipse(-36,26,8,2,'#b3bb8f');}
   else{p.path('M39 13 L43 11 L43 22 L39 24 Z','#d6bd83');p.path('M38 10 L44 8 L44 11 L38 13 Z','#ad9465');}
  }
  const village=terrain.spine[Math.round(.94*(terrain.spine.length-1))];
  if(village){house(village.x+85,village.y+25,.88,1);house(village.x+145,village.y-8,.67);}
  // Ferns, tea blossoms and individual wet leaves reward closer views, without a grid.
  for(let i=0;i<Math.round(44*density);i++){const x=bounds.x+28+random()*(bounds.w-54),y=bounds.y+150+random()*(bounds.h-165);if(!clear(x,y,10))continue;const p=pen('details',x,y,.65+random()*.3);
   if(i%5===0){p.path('M-5 2 Q-5 -4 0 -4 Q6 -4 6 2 Q0 5 -5 2 Z','#b4b99b');p.path('M-4 0 Q-1 -3 3 -2','none','#e5e2c0',1);}
   else{p.path('M0 4 Q-1 -3 -4 -8 M0 4 Q2 -4 7 -8 M0 4 L0 -10','none','#8a9e6e',.85,.8);p.path('M-3 -2 Q-10 -8 -7 -9 Q-3 -9 -3 -2 Z M2 -2 Q9 -6 8 -8 Q4 -8 2 -2 Z','#99ad74');if(i%7===0){p.circle(0,-10,2.5,'#faf2d4');p.circle(0,-10,.9,'#d7b56c');}}
  }
  return {style:'westlake-picturebook-v2',trees:trees.length,waterSegments:waters.length};
 }
 function regional(layers,terrain,points,theme,palette,bounds={x:0,y:0,w:720,h:600}){
  const density=Math.min(3,bounds.w*bounds.h/(720*600));
  const path=(layer,d,fill,extra={})=>layers[layer].push({tag:'path',d,fill,'stroke-linecap':'round','stroke-linejoin':'round',...extra});
  const ellipse=(layer,x,y,rx,ry,fill,opacity=1)=>layers[layer].push({tag:'ellipse',cx:f(x),cy:f(y),rx:f(rx),ry:f(ry),fill,opacity});
  let seed={meadow:301,gorge:509,snow:719,coast:827,forest:947,bamboo:113}[theme]||439;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const water=terrain.features.filter(v=>v.kind==='water');
  const nearWater=(x,y)=>water.some(v=>T.nearest(v.line,x,y).distance<16);
  const inSea=(x,y)=>(terrain.sea||[]).some(poly=>{let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;});
  // Broken pigment strokes are static and share the landscape's coordinate system.
  for(let i=0;i<Math.round(64*density);i++){const x=bounds.x+12+random()*(bounds.w-24),y=bounds.y+90+random()*(bounds.h-100),w=4+random()*15;
   if(T.nearest(points,x,y).distance<24||nearWater(x,y)||inSea(x,y))continue;
   path('ground',`M${f(x)} ${f(y)}Q${f(x+w*.6)} ${f(y-2)} ${f(x+w)} ${f(y)}Q${f(x+w*.4)} ${f(y+2)} ${f(x)} ${f(y)}Z`,i%3?palette.shade:'#fff7db',{opacity:.075});
  }
  // Rocks and individual plants sit beside, rather than on top of, the route.
  const spine=terrain.spine;
  for(let i=3;i<spine.length-2;i+=4){const q=spine[i],side=Math.floor(i/4)%2?1:-1,offset=45+random()*28,x=q.x+q.nx*offset*side,y=q.y+q.ny*offset*side;
   if(nearWater(x,y)||inSea(x,y)||T.nearest(points,x,y-6).distance<37)continue;
   const p=(xx,yy)=>`${f(x+xx)} ${f(y+yy)}`;
   ellipse('details',x+2,y+3,12,3,palette.shade,.10);
   if(theme==='snow'||theme==='gorge'||theme==='coast'){
    path('details',`M${p(-11,2)}Q${p(-14,-6)} ${p(-6,-10)}L${p(4,-12)}Q${p(10,-6)} ${p(12,1)}Q${p(1,7)} ${p(-11,2)}Z`,theme==='snow'?'#a4b4aa':'#b7b69a',{stroke:palette.shade,'stroke-width':.7});
    path('details',`M${p(-10,-1)}Q${p(-11,-7)} ${p(-5,-9)}L${p(4,-11)}L${p(1,-4)}Z`,theme==='snow'?'#eef2e3':'#dad6b8');
    path('details',`M${p(2,-6)}L${p(4,0)}L${p(9,1)}`,'none',{stroke:palette.shade,'stroke-width':.65,opacity:.55});
    if(theme==='snow'){path('details',`M${p(-8,-5)}Q${p(-4,-7)} ${p(-1,-4)}Q${p(-2,0)} ${p(-7,-1)}Z`,'#8d9e73');}
    for(const [dx,dy,s]of [[-17,4,3.2],[15,5,2.4],[21,1,1.9]]){
     path('details',`M${p(dx-s,dy)}Q${p(dx-1,dy-s*1.6)} ${p(dx+s,dy-s*.8)}L${p(dx+s*.7,dy+1)}Z`,theme==='snow'?'#bdc9bb':'#c3c3a8',{stroke:palette.shade,'stroke-width':.35,opacity:.8});
    }
    if(theme!=='snow')path('details',`M${p(15,2)}Q${p(12,-5)} ${p(9,-9)}M${p(16,2)}Q${p(17,-5)} ${p(22,-8)}M${p(16,2)}L${p(16,-11)}`,'none',{stroke:theme==='gorge'?'#9b9f71':palette.grass,'stroke-width':.75,opacity:.8});
   }else if(theme==='meadow'){
    path('details',`M${p(-4,3)}Q${p(-13,-6)} ${p(-16,-8)}Q${p(-8,-5)} ${p(-1,2)}M${p(0,3)}Q${p(-4,-9)} ${p(-2,-16)}Q${p(1,-4)} ${p(2,3)}M${p(3,3)}Q${p(7,-9)} ${p(15,-13)}Q${p(10,-3)} ${p(6,3)}`,palette.grass,{opacity:.75});
    path('details',`M${p(-2,3)}Q${p(-9,-9)} ${p(-10,-20)}M${p(2,2)}Q${p(3,-12)} ${p(6,-23)}M${p(5,3)}Q${p(11,-5)} ${p(16,-15)}`,'none',{stroke:'#92915d','stroke-width':.7});
    for(const [dx,dy]of [[-10,-19],[6,-22],[16,-14]]){
     path('details',`M${p(dx-2,dy+2)}Q${p(dx-4,dy-4)} ${p(dx,dy-5)}Q${p(dx+2,dy-2)} ${p(dx-2,dy+2)}Z`,'#c8bc81',{opacity:.85});
     path('details',`M${p(dx-1,dy)}L${p(dx,dy-3)}`,'none',{stroke:'#e9dfb1','stroke-width':.6});
    }
   }else if(theme==='bamboo'){
    for(const [dx,dy,sign]of [[-8,-2,-1],[2,1,1],[11,-4,1]]){
     path('details',`M${p(dx-6*sign,dy+2)}Q${p(dx-3*sign,dy-4)} ${p(dx+8*sign,dy-3)}Q${p(dx+1*sign,dy+2)} ${p(dx-6*sign,dy+2)}Z`,sign<0?'#b2b78c':palette.leafLight,{opacity:.9});
     path('details',`M${p(dx-5*sign,dy+1)}L${p(dx+6*sign,dy-2)}`,'none',{stroke:palette.leaf,'stroke-width':.45,opacity:.7});
    }
    path('details',`M${p(-14,5)}Q${p(0,2)} ${p(17,7)}`,'none',{stroke:'#a6a481','stroke-width':.7,opacity:.6});
   }else{
    for(const [tipX,tipY]of [[-12,-14],[0,-21],[15,-16]]){
     path('details',`M${p(0,3)}Q${p(tipX*.3,tipY*.35)} ${p(tipX,tipY)}`,'none',{stroke:palette.leaf,'stroke-width':.7});
     for(let j=1;j<4;j++){
      const t=j/4,cx=tipX*t,cy=3+(tipY-3)*t,leaf=4*(1-t)+1;
      path('details',`M${p(cx,cy)}Q${p(cx-leaf-2,cy-1)} ${p(cx-leaf,cy-4)}Q${p(cx-1,cy-3)} ${p(cx,cy)}M${p(cx,cy)}Q${p(cx+leaf+2,cy+1)} ${p(cx+leaf+1,cy-3)}Q${p(cx+1,cy-2)} ${p(cx,cy)}`,j%2?palette.leafLight:palette.grass,{opacity:.85});
     }
    }
   }
  }
  return {style:theme+'-picturebook-v2',detail:true};
 }
 function wugong(layers,terrain,points,bounds={x:0,y:0,w:720,h:600}){
  for(const name of ['ground','land','hydro','details','canopy','clouds','water','mist'])layers[name]=[];
  const add=(layer,tag,attrs)=>layers[layer].push({tag,...attrs});
  const path=(layer,d,fill,stroke='none',width=.7,opacity=1,extra={})=>add(layer,'path',{d,fill,stroke,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round',opacity,...extra});
  const X=x=>bounds.x+bounds.w*x/720,Y=y=>bounds.y+bounds.h*y/600;
  const at=(x,y)=>`${f(X(x))} ${f(Y(y))}`;
  // Position landforms across the overview; keep each tree, stone and grass blade in proportion.
  const local=(x,y,s=1)=>(dx,dy)=>`${f(x+dx*s)} ${f(y+dy*s)}`;
  const ellipse=(layer,x,y,rx,ry,fill,opacity=1)=>add(layer,'ellipse',{cx:f(x),cy:f(y),rx:f(rx),ry:f(ry),fill,opacity});
  const clear=(x,y,r=24)=>T.nearest(points,x,y).distance>r;
  let seed=104729;
  const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
  add('ground','rect',{x:bounds.x-80,y:bounds.y-80,width:bounds.w+160,height:bounds.h+160,fill:'#f1f0de'});
  path('ground',`M${at(-30,235)}C${at(24,170)} ${at(73,137)} ${at(121,160)}C${at(171,180)} ${at(190,127)} ${at(238,134)}C${at(284,141)} ${at(300,89)} ${at(344,109)}C${at(389,132)} ${at(425,65)} ${at(464,89)}C${at(508,109)} ${at(554,55)} ${at(599,79)}L${at(754,23)}L${at(754,411)}L${at(-30,411)}Z`,'#dce3d6');
  path('ground',`M${at(-30,288)}C${at(17,254)} ${at(41,207)} ${at(94,219)}C${at(139,229)} ${at(166,173)} ${at(209,191)}C${at(245,205)} ${at(268,161)} ${at(302,169)}C${at(348,178)} ${at(376,128)} ${at(409,150)}L${at(529,249)}L${at(263,448)}L${at(-30,454)}Z`,'#c1d0c3');
  path('ground',`M${at(395,414)}C${at(456,363)} ${at(496,385)} ${at(548,347)}C${at(604,307)} ${at(638,348)} ${at(685,318)}L${at(754,288)}L${at(754,645)}L${at(277,645)}Z`,'#cedbd0');
  path('ground',`M${at(477,510)}C${at(536,440)} ${at(578,470)} ${at(635,418)}C${at(678,379)} ${at(721,419)} ${at(754,384)}L${at(754,645)}L${at(416,645)}Z`,'#b9cebf');
  path('ground',`M${at(540,547)}C${at(599,511)} ${at(666,520)} ${at(754,477)}L${at(754,645)}L${at(439,645)}Z`,'#dce4cf');

  // The descending shaded face gives the diagonal grass ridge its height.
  path('land',`M${at(-35,635)}C${at(-18,510)} ${at(49,436)} ${at(108,389)}C${at(153,331)} ${at(209,332)} ${at(251,304)}C${at(288,279)} ${at(329,287)} ${at(356,268)}C${at(389,246)} ${at(406,210)} ${at(448,209)}C${at(492,206)} ${at(510,165)} ${at(540,145)}C${at(569,129)} ${at(572,91)} ${at(601,78)}C${at(631,65)} ${at(660,93)} ${at(662,124)}C${at(665,165)} ${at(637,194)} ${at(676,236)}C${at(714,281)} ${at(721,329)} ${at(754,359)}L${at(754,464)}C${at(663,440)} ${at(633,466)} ${at(555,474)}C${at(480,483)} ${at(467,546)} ${at(384,535)}C${at(303,526)} ${at(280,618)} ${at(220,645)}Z`,'#8da784');
  path('land',`M${at(285,443)}C${at(346,402)} ${at(383,427)} ${at(427,390)}C${at(474,348)} ${at(521,367)} ${at(569,318)}C${at(618,269)} ${at(641,261)} ${at(666,235)}C${at(709,292)} ${at(715,328)} ${at(754,359)}L${at(754,411)}C${at(679,379)} ${at(657,414)} ${at(587,412)}C${at(514,411)} ${at(498,489)} ${at(422,475)}C${at(363,464)} ${at(331,510)} ${at(285,522)}Z`,'#6f947d', 'none',.7,.52);
  path('land',`M${at(-35,635)}C${at(-15,532)} ${at(39,433)} ${at(112,393)}C${at(155,336)} ${at(211,338)} ${at(251,310)}C${at(292,282)} ${at(330,294)} ${at(356,276)}C${at(391,251)} ${at(405,226)} ${at(446,224)}C${at(490,222)} ${at(510,180)} ${at(542,160)}C${at(571,142)} ${at(574,108)} ${at(600,94)}C${at(625,80)} ${at(644,105)} ${at(639,130)}C${at(632,160)} ${at(606,188)} ${at(615,221)}C${at(626,259)} ${at(652,276)} ${at(673,308)}C${at(621,332)} ${at(592,371)} ${at(543,384)}C${at(503,398)} ${at(454,399)} ${at(414,427)}C${at(371,456)} ${at(305,437)} ${at(269,468)}C${at(226,504)} ${at(211,568)} ${at(162,600)}L${at(145,635)}Z`,'#b6c58e');
  path('land',`M${at(210,352)}C${at(253,317)} ${at(306,311)} ${at(346,295)}C${at(389,279)} ${at(406,246)} ${at(450,243)}C${at(497,239)} ${at(516,197)} ${at(549,177)}C${at(578,159)} ${at(580,122)} ${at(605,108)}C${at(621,105)} ${at(629,116)} ${at(624,133)}C${at(604,163)} ${at(579,190)} ${at(588,221)}C${at(561,252)} ${at(526,242)} ${at(503,269)}C${at(463,310)} ${at(413,289)} ${at(386,321)}C${at(342,358)} ${at(287,332)} ${at(244,363)}Z`,'#d0d7a0','none',.7,.88);
  path('land',`M${at(154,438)}C${at(203,385)} ${at(224,405)} ${at(276,379)}C${at(309,365)} ${at(339,380)} ${at(367,364)}C${at(396,350)} ${at(420,327)} ${at(447,329)}C${at(417,369)} ${at(382,378)} ${at(358,407)}C${at(306,404)} ${at(283,435)} ${at(256,443)}C${at(217,463)} ${at(219,500)} ${at(194,525)}Z`,'#9db47f','none',.7,.57);
  path('land',`M${at(494,319)}C${at(534,280)} ${at(561,295)} ${at(588,263)}C${at(605,243)} ${at(604,211)} ${at(614,194)}C${at(610,232)} ${at(630,259)} ${at(651,280)}C${at(614,293)} ${at(579,328)} ${at(550,340)}Z`,'#d9d6a3','none',.7,.58);
  path('land',`M${at(-30,631)}C${at(-10,527)} ${at(44,449)} ${at(97,426)}C${at(139,445)} ${at(175,479)} ${at(182,519)}C${at(158,565)} ${at(119,597)} ${at(109,635)}Z`,'#829e78','none',.7,.8);
  for(const d of [
   `M${at(246,423)}C${at(285,393)} ${at(324,413)} ${at(357,390)}`,
   `M${at(319,470)}C${at(356,433)} ${at(386,455)} ${at(418,428)}`,
   `M${at(451,408)}C${at(486,380)} ${at(511,397)} ${at(542,371)}`,
   `M${at(553,395)}C${at(588,364)} ${at(609,373)} ${at(639,346)}`,
   `M${at(628,333)}Q${at(650,305)} ${at(671,303)}`,
   `M${at(173,549)}Q${at(197,503)} ${at(220,486)}`
  ])path('land',d,'none','#d8dfb5',1.15,.47);
  path('land',`M${at(265,453)}C${at(289,425)} ${at(333,440)} ${at(355,420)}M${at(438,455)}C${at(468,417)} ${at(495,433)} ${at(520,405)}M${at(589,450)}Q${at(614,411)} ${at(651,403)}`,'none','#78927b',.8,.4);

  function grass(x,y,s,seedHead=false){
   if(!clear(x,y,19))return;
   const p=local(x,y,s);
   ellipse('details',x+2*s,y+3*s,11*s,2*s,'#789162',.11);
   path('details',`M${p(-7,2)}Q${p(-9,-5)} ${p(-13,-8)}Q${p(-6,-5)} ${p(-4,2)}M${p(-2,2)}Q${p(-5,-9)} ${p(-3,-14)}Q${p(-1,-5)} ${p(1,2)}M${p(4,2)}Q${p(7,-7)} ${p(11,-10)}Q${p(8,-3)} ${p(7,2)}`,'#829d64','none',.7,.82);
   path('details',`M${p(-3,2)}Q${p(-5,-8)} ${p(-8,-15)}M${p(2,2)}Q${p(1,-10)} ${p(6,-20)}M${p(5,2)}Q${p(10,-5)} ${p(15,-12)}`,'none','#8c9567',.65,.8);
   if(seedHead)for(const [dx,dy]of [[-8,-15],[6,-20],[15,-12]]){
    path('details',`M${p(dx,dy+2)}Q${p(dx-4,dy-1)} ${p(dx-1,dy-5)}Q${p(dx+3,dy-5)} ${p(dx+2,dy-1)}Z`,'#d7c598','#b3a777',.35);
    path('details',`M${p(dx,dy+1)}L${p(dx+1,dy-4)}`,'none','#f1e5b8',.5);
   }
  }
  const spine=T.sample(points,64);
  for(let i=9;i<spine.length-1;i+=2){
   const q=spine[i],side=i%4===1?-1:1,offset=31+random()*26;
   grass(q.x+q.nx*offset*side,q.y+q.ny*offset*side,.5+random()*.26,i%6===1);
  }
  for(const [x,y,s]of [[260,375,.65],[323,310,.7],[370,392,.8],[416,252,.55],[474,317,.7],[526,203,.5],[570,254,.6],[606,174,.5]])grass(X(x),Y(y),s,true);
  // Small broken marks follow the slope; the path corridor stays quiet.
  for(let i=0;i<135;i++){
   const t=.16+random()*.81,q=spine[Math.round(t*(spine.length-1))],side=i%2?1:-1,offset=22+random()*55;
   const x=q.x+q.nx*offset*side,y=q.y+q.ny*offset*side;
   if(!clear(x,y,21))continue;
   const p=local(x,y,.45+random()*.35);
   path('details',`M${p(-2,1)}Q${p(0,-1)} ${p(3,0)}`,'none',i%3?'#7e9768':'#ede7bc',.7,.27);
  }

  function rock(cx,cy,s=1){
   const x=X(cx),y=Y(cy),p=local(x,y,s);
   if(!clear(x,y,25))return;
   ellipse('details',x+3*s,y+7*s,20*s,4*s,'#647e6d',.14);
   path('details',`M${p(-18,5)}Q${p(-22,-2)} ${p(-15,-11)}L${p(-3,-17)}Q${p(7,-19)} ${p(16,-9)}L${p(20,3)}Q${p(12,11)} ${p(-2,10)}Z`,'#aeb9a2','#8a9c87',.65);
   path('details',`M${p(-17,0)}L${p(-12,-10)}L${p(-3,-15)}Q${p(7,-16)} ${p(14,-9)}L${p(3,-6)}L${p(-3,0)}Z`,'#d9dcc0');
   path('details',`M${p(3,-6)}L${p(7,4)}L${p(16,3)}M${p(-9,-8)}L${p(-5,-4)}L${p(-7,3)}`,'none','#839682',.55);
   path('details',`M${p(-15,5)}Q${p(-10,2)} ${p(-6,5)}M${p(9,7)}Q${p(13,4)} ${p(17,5)}`,'none','#829b69',1.5,.7);
  }
  for(const [x,y,s]of [[225,389,.7],[305,281,.55],[379,388,.9],[458,228,.65],[517,328,1.15],[579,277,.8],[630,171,.6],[665,303,.7]])rock(x,y,s);

  function broadleaf(cx,cy,s,tone=0){
   const x=X(cx),y=Y(cy),p=local(x,y,s);
   if(!clear(x,y,20)||!clear(x,y-25*s,22*s+15))return;
   const leaf=tone?'#698a66':'#789a6d',light=tone?'#95ad7a':'#acc08a';
   ellipse('canopy',x+6*s,y+3*s,22*s,4.3*s,'#405f49',.14);
   path('canopy',`M${p(-2,1)}L${p(-2,-32)}L${p(2,-34)}L${p(3,1)}Z`,'#978e6b');
   path('canopy',`M${p(0,-14)}L${p(-10,-27)}M${p(1,-19)}L${p(11,-32)}`,'none','#8d8465',1.6);
   path('canopy',`M${p(-19,-17)}C${p(-29,-20)} ${p(-30,-32)} ${p(-23,-37)}C${p(-25,-48)} ${p(-15,-53)} ${p(-7,-49)}C${p(-2,-59)} ${p(12,-57)} ${p(17,-49)}C${p(29,-51)} ${p(34,-41)} ${p(28,-34)}C${p(35,-24)} ${p(22,-16)} ${p(13,-17)}Q${p(-3,-10)} ${p(-19,-17)}Z`,leaf,'#668465',.55);
   path('canopy',`M${p(-19,-17)}C${p(-29,-20)} ${p(-30,-32)} ${p(-23,-37)}C${p(-25,-48)} ${p(-15,-53)} ${p(-7,-49)}C${p(-2,-59)} ${p(12,-57)} ${p(17,-49)}C${p(6,-52)} ${p(1,-44)} ${p(-8,-39)}C${p(-20,-40)} ${p(-12,-24)} ${p(-19,-17)}Z`,light);
   path('canopy',`M${p(3,-17)}C${p(21,-13)} ${p(34,-25)} ${p(28,-34)}Q${p(18,-28)} ${p(11,-30)}Q${p(13,-21)} ${p(3,-17)}Z`,'#4f765e','none',.7,.48);
   path('canopy',`M${p(-18,-36)}Q${p(-13,-32)} ${p(-8,-37)}M${p(0,-46)}Q${p(6,-43)} ${p(11,-47)}M${p(15,-24)}Q${p(20,-23)} ${p(24,-28)}`,'none','#d4dcb0',1,.65);
   for(const [dx,dy]of [[-18,-43],[-4,-25],[8,-51],[20,-36]])path('canopy',`M${p(dx-3,dy)}Q${p(dx,dy-5)} ${p(dx+5,dy-2)}Q${p(dx+2,dy+1)} ${p(dx-3,dy)}Z`,light,'none',.7,.65);
   path('canopy',`M${p(0,-10)}L${p(1,0)}`,'none','#d4bf8f',.7);
  }
  const forest=[
   [80,363,.6],[46,397,.65],[113,384,.7],[144,360,.55],[77,412,.78],[25,443,.7],[120,417,.63],
   [54,458,.8],[152,405,.55],[207,386,.58],[43,491,.93],[84,487,.76],[184,477,.66],[216,434,.62],
   [16,526,1],[119,526,.85],[67,537,.95],[169,524,.72],[211,499,.68],[36,565,.85],[91,578,.9],[148,568,.76],
   [13,596,.8],[201,558,.65],[242,426,.5],[260,401,.48]
  ];
  for(const [i,[x,y,s]]of forest.entries())broadleaf(x,y,s,i%3===0?1:0);

  // A modest stone building at the forest edge, and the low stone altar beside the summit.
  {
   const x=X(88),y=Y(454),p=local(x,y,.72);
   ellipse('details',x+2,y+11,22,4,'#547354',.13);
   path('details',`M${p(-19,-6)}L${p(0,-13)}L${p(19,-6)}L${p(19,13)}L${p(0,21)}L${p(-19,13)}Z`,'#c4c6a5','#8b9d7b',.75);
   path('details',`M${p(-19,-6)}L${p(0,1)}L${p(19,-6)}L${p(19,13)}L${p(0,21)}L${p(0,1)}`,'#a9b58f','#8b9d7b',.65);
   path('details',`M${p(-25,-7)}L${p(0,-23)}L${p(25,-7)}L${p(0,3)}Z`,'#738b72','#5f7965',.75);
   path('details',`M${p(-25,-7)}L${p(0,-23)}L${p(0,3)}Z`,'#a0ae88');
   path('details',`M${p(-13,14)}L${p(-13,1)}L${p(-5,4)}L${p(-5,17)}Z`,'#6e8266');
   path('details',`M${p(5,6)}L${p(13,3)}L${p(13,9)}L${p(5,12)}Z`,'#e4dcb1','#829674',.5);
   path('details',`M${p(-15,16)}L${p(-2,20)}M${p(-18,19)}L${p(-4,23)}M${p(-21,22)}L${p(-7,26)}`,'none','#e0ddbc',1.6);
  }
  {
   const x=X(623),y=Y(147),p=local(x,y,.78);
   ellipse('details',x+2,y+12,24,4,'#647e68',.13);
   path('details',`M${p(-23,4)}L${p(0,-4)}L${p(24,4)}L${p(24,11)}L${p(0,19)}L${p(-23,11)}Z`,'#a2ad95','#7d8d78',.8);
   path('details',`M${p(-23,4)}L${p(0,-4)}L${p(24,4)}L${p(0,12)}Z`,'#dddcc0','#8d9b84',.65);
   path('details',`M${p(0,12)}L${p(0,19)}M${p(-12,8)}L${p(-12,15)}M${p(12,8)}L${p(12,15)}M${p(-16,6)}L${p(7,-2)}M${p(-5,10)}L${p(18,2)}`,'none','#84927a',.5);
   path('details',`M${p(-12,-3)}L${p(0,-7)}L${p(13,-3)}L${p(13,3)}L${p(0,7)}L${p(-12,3)}Z`,'#bbc3a9','#84927b',.6);
   path('details',`M${p(-12,-3)}L${p(0,-7)}L${p(13,-3)}L${p(0,1)}Z`,'#ebe6cc');
  }
  for(const [id,cx,cy,s]of [['valley',624,428,1.05],['low',314,553,.78]]){
   const p=local(X(cx),Y(cy),s),extra={cloud:`wugong-${id}`};
   path('clouds',`M${p(-63,8)}Q${p(-72,-5)} ${p(-47,-10)}Q${p(-40,-29)} ${p(-20,-21)}Q${p(-5,-38)} ${p(15,-23)}Q${p(39,-28)} ${p(45,-10)}Q${p(72,-5)} ${p(60,9)}Q${p(33,21)} ${p(-4,17)}Q${p(-42,23)} ${p(-63,8)}Z`,'#fcfbed','none',.7,.9,extra);
   path('clouds',`M${p(-58,9)}Q${p(-25,12)} ${p(0,5)}Q${p(27,7)} ${p(58,9)}Q${p(28,21)} ${p(-4,17)}Q${p(-37,22)} ${p(-58,9)}Z`,'#d9e3d4','none',.7,.44,extra);
   path('clouds',`M${p(-43,-10)}Q${p(-35,-22)} ${p(-20,-17)}Q${p(-6,-32)} ${p(12,-22)}`,'none','#fffef5',1.8,.7,extra);
  }
  return {style:'wugong-overview-v4',detail:true};
 }
 function tree(layers,x,y,s,theme,p){
  const point=(a,b)=>`${f(x+a*s)} ${f(y+b*s)}`;
  const path=(d,fill,stroke='none',w=.8,opacity=1)=>layers.canopy.push({tag:'path',d,fill,stroke,'stroke-width':f(w*s),'stroke-linecap':'round','stroke-linejoin':'round',opacity});
  const shape=(d,fill,stroke,w,opacity)=>{let i=0;path(d.replace(/-?\d*\.?\d+/g,n=>f(Number(n)*s+(i++%2?y:x))),fill,stroke,w,opacity);};
  layers.canopy.push({tag:'ellipse',cx:f(x+5*s),cy:f(y+4*s),rx:f(21*s),ry:f(5*s),fill:p.shade,opacity:.13});
  if(theme==='bamboo'){
   for(const [offset,height]of [[-9,74],[9,61]]){
    path(`M${point(offset,0)}Q${point(offset-4,-height*.5)} ${point(offset+2,-height)}`,'none',p.leaf,2.7);
    for(let j=1;j<4;j++)path(`M${point(offset-2.3,-j*height/5)}L${point(offset+2,-j*height/5)}`,'none',p.leafLight,.9);
    for(const [side,yy]of [[-1,22],[1,43]]){const top=-height+yy;path(`M${point(offset,top+8)}Q${point(offset+side*24,top-12)} ${point(offset+side*36,top-9)}`,'none',p.leaf,1);
     for(let k=0;k<3;k++){const xx=offset+side*(8+k*6),cy=top-k*3;path(`M${point(xx,cy)}Q${point(xx+side*5,cy-12)} ${point(xx+side*10,cy-11)}Q${point(xx+side*7,cy-2)} ${point(xx,cy)}Z`,k%2?p.leafLight:p.leaf);}}
   }return;
  }
  shape('M-3 1L-2 -47L2 -48L3 1Z','#8a8265');
  if(theme==='forest'||theme==='snow'){
   for(const [yy,w]of [[-45,12],[-32,18],[-17,23]]){
    path(`M${point(-w,yy+10)}Q${point(-w*.45,yy-2)} ${point(0,yy-18)}Q${point(w*.4,yy-1)} ${point(w,yy+10)}L${point(w*.4,yy+9)}L${point(w*.3,yy+12)}L${point(-w*.7,yy+11)}Z`,p.leaf,p.shade,.55);
    path(`M${point(-w,yy+10)}Q${point(-w*.45,yy-2)} ${point(0,yy-18)}L${point(-1,yy+6)}Z`,p.leafLight);
    for(const sign of [-1,1])path(`M${point(sign*3,yy)}L${point(sign*w*.58,yy+6)}`,'none',theme==='snow'?'#edf2df':'#bfd0a8',.8,.65);
   }
   if(theme==='snow')shape('M-6 -49L0 -63L6 -49L1 -51L0 -47L-2 -51Z','#f4f6e8');
  }else{
   shape('M-24 -20C-36 -28 -30 -43 -24 -45C-26 -58 -11 -60 -7 -59C-4 -73 13 -70 18 -61C31 -65 38 -51 31 -44C42 -31 25 -19 14 -20C0 -13 -16 -15 -24 -20Z',p.leaf,p.shade,.65);
   shape('M-24 -20C-36 -28 -30 -43 -24 -45C-26 -58 -11 -60 -7 -59C-4 -73 13 -70 18 -61C5 -64 0 -51 -12 -47C-25 -46 -13 -28 -24 -20Z',p.leafLight);
   shape('M9 -19C29 -17 40 -34 31 -44C23 -34 15 -41 10 -29L5 -24Z',p.shade,'none',0,.58);
   shape('M-17 -40Q-8 -38 -5 -42M0 -55Q6 -52 12 -56M17 -32Q22 -31 27 -36','none','#d1dcb0',1,.55);
   for(const [xx,yy]of [[-18,-49],[-3,-32],[8,-61],[21,-42]])path(`M${point(xx-3,yy)}Q${point(xx,yy-5)} ${point(xx+5,yy-2)}Q${point(xx+2,yy+1)} ${point(xx-3,yy)}Z`,p.leafLight,'none',0,.7);
  }
  shape('M0 -14L1 -1','none','#c9b58a',.7);
 }
 return {westlake,regional,wugong,tree,watercourse};
}));
