(function(root,factory){const T=typeof module==='object'&&module.exports?require('./terrain.js'):root.TrailTerrain;const api=factory(T);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailIllustration=api;}(typeof globalThis!=='undefined'?globalThis:this,function(T){
 'use strict';
 const f=n=>Math.round(n*100)/100;
 // Small, deliberately drawn silhouettes. Both renderers consume these same paths.
 function westlake(layers,terrain,points){
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
  for(let i=0;i<85;i++){const x=-50+random()*820,y=70+random()*590,w=5+random()*23;
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
   const spine=T.sample(feature.line,Math.min(56,Math.max(16,feature.line.length))),width=index?5:9;
   const line=T.line(feature.line),hydro=pen('hydro');
   hydro.path(line,'none','#c5c9a4',width*2+7,.8);
   hydro.path(line,'none','#e4debf',width*2+4);
   hydro.path(T.band(spine,p=>width+Math.sin(p.progress*13)*1.8,p=>-width+Math.sin(p.progress*9)*1.3),'#a1c8bb');
   hydro.path(T.line(T.offset(spine,-width*.55)),'none','#72aca4',index?1.1:2.1,.75);
   hydro.path(T.line(T.offset(spine,width*.43)),'none','#d5e7cf',index?1:2.4,.9);
   const step=index?9:5;
   for(let i=3;i<spine.length-2;i+=step){const q=spine[i],side=i%2?1:-1,p=pen('hydro',q.x+q.nx*(width+4)*side,q.y+q.ny*(width+4)*side,.7+random()*.4);
    p.ellipse(1,2,6,2.2,'#5e9080',.25);
    p.path('M-6 0 Q-7 -4 -3 -5 Q0 -8 5 -4 Q8 -1 6 1 Q0 4 -6 0 Z','#b5ba9a','#8f9f87',.55);
    p.path('M-5 -1 Q-6 -4 -2 -5 Q1 -6 4 -4 L0 -2 Z','#dfe0bd');
    p.path('M1 1 Q3 -2 6 -1 L5 1 Z','#6f9474','none',0,.7);
    if(!index){const w=pen('water',q.x,q.y);w.path('M-5 0 Q0 -2 6 -1','none','#eef4da',.9,.6);layers.water.at(-1).flow=true;}
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
  for(let i=0;i<220&&trees.length<27;i++){const x=22+random()*674,y=125+random()*485,s=.6+random()*.35;
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
  for(let i=0;i<44;i++){const x=28+random()*666,y=150+random()*435;if(!clear(x,y,3))continue;const p=pen('details',x,y,.65+random()*.3);
   if(i%5===0){p.path('M-5 2 Q-5 -4 0 -4 Q6 -4 6 2 Q0 5 -5 2 Z','#b4b99b');p.path('M-4 0 Q-1 -3 3 -2','none','#e5e2c0',1);}
   else{p.path('M0 4 Q-1 -3 -4 -8 M0 4 Q2 -4 7 -8 M0 4 L0 -10','none','#8a9e6e',.85,.8);p.path('M-3 -2 Q-10 -8 -7 -9 Q-3 -9 -3 -2 Z M2 -2 Q9 -6 8 -8 Q4 -8 2 -2 Z','#99ad74');if(i%7===0){p.circle(0,-10,2.5,'#faf2d4');p.circle(0,-10,.9,'#d7b56c');}}
  }
  return {style:'westlake-picturebook-v1',trees:trees.length,waterSegments:waters.length};
 }
 return {westlake};
}));
