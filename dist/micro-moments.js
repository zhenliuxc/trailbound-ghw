(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailMicroMoments=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(v,min=0,max=1)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
 function create(entry){return {id:entry.id,kind:entry.interaction,age:0,reaction:0,acted:false,gesture:'look',x:.5,y:.56,done:false};}
 function act(s,{x=.5,y=.56,gesture='tap'}={}){if(!s||s.acted||s.done)return s;return {...s,acted:true,reaction:0,x:clamp(x),y:clamp(y),gesture:gesture==='drag'?'drag':'tap'};}
 function tick(s,dt){if(!s||s.done||!Number.isFinite(dt)||dt<=0)return s;dt=Math.min(.25,dt);const age=s.age+dt,reaction=s.acted?s.reaction+dt:0;return {...s,age,reaction,done:s.acted?reaction>=3.4:age>=6};}
 function outcome(s,entry){
  let title=entry.name,memory=entry.memory;
  if(s.acted){
   if(s.kind==='ripple'){const leaf=s.id==='westlake-floating-leaf';title=leaf?(s.gesture==='drag'?'它终于转过了那块石头':'落叶跟着涟漪走了一小圈'):'指尖开出的一圈水纹';memory=leaf?'九溪溪谷里，我轻轻划了一下水面。那片绕了好久的叶子，终于转过石头，顺着溪水往前走了。':'九溪的水从石头旁经过。我轻触水面，看水纹慢慢散开，溪声像离自己更近了一点。';}
   else if(s.kind==='leaf'){title=s.id==='westlake-leaf-shadow'?'叶脉里透过来的一点光':'茶叶轻轻翻了一下';memory='龙井茶园里，我轻轻碰了一片茶叶。叶子翻过来，云缝里的光透过细细的叶脉，叶影也跟着换了个方向。';}
   else{title=s.id==='westlake-basket'?'一只等雨停的竹篮':'屋檐下，雨滴慢下来';memory=s.id==='westlake-basket'?'龙井村口的屋檐还在滴水。我听着那串小声音，一只竹篮安静放在凳上，像也在等下一段路。':'我在龙井村口的屋檐下停了一会儿。雨后的水滴渐渐稀了，听着听着，自己的脚步也不着急了。';}
  }else memory=entry.memory+'我没有碰它，只安静看了一会儿。';
  return {id:s.id,title,memory,interaction:s.gesture};
 }
 function draw(svg,parent,entry){
  const kind=entry.interaction,refs={kind},add=(tag,attrs={},p=parent)=>svg(tag,attrs,p),path=(d,fill,stroke,width=1.4,p=parent)=>add('path',{d,fill,stroke:stroke||'none','stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round'},p);
  const defs=add('defs'),water=add('linearGradient',{id:'micro-water',x2:1,y2:1},defs);add('stop',{offset:0,'stop-color':'#c8dfd4'},water);add('stop',{offset:1,'stop-color':'#72a9a4'},water);
  const glow=add('radialGradient',{id:'micro-glow'},defs);add('stop',{offset:0,'stop-color':'#fff7bf','stop-opacity':.8},glow);add('stop',{offset:1,'stop-color':'#fff7bf','stop-opacity':0},glow);
  add('rect',{width:400,height:230,rx:18,fill:kind==='ripple'?'#edf1db':kind==='leaf'?'#eff2df':'#f0ebdb'});
  if(kind==='ripple'){
   path('M0 60Q90 14 184 46T400 20V230H0Z','#a6c2aa');path('M-20 123Q75 25 154 87T421 76L420 241H-20Z','url(#micro-water)');
   for(let i=0;i<8;i++)path(`M${i*62-40} ${105+i%3*34}q35-12 68 0t65 0`,'none','#e5eee0',1.3);
   path('M55 151Q20 129 48 94Q69 69 109 85Q149 106 127 139Q104 161 55 151Z','#a6afa0','#839685',2);path('M52 105Q69 84 104 92','none','#bdc7a8',8);
   for(const [x,y]of [[322,170],[360,126],[285,206]])add('ellipse',{cx:x,cy:y,rx:20,ry:12,fill:'#9bad99',stroke:'#81988a'});
   refs.rings=[0,1,2].map(()=>add('ellipse',{cx:215,cy:150,rx:0,ry:0,fill:'none',stroke:'#f8f9da','stroke-width':2,opacity:0}));
   refs.leaf=add('g');path('M-19 1Q-6-21 23-5Q20 14-19 1Z','#c29d64','#997b53',1.2,refs.leaf);path('M-19 1L17-4','none','#e4c58a',1,refs.leaf);
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
   const basket=add('g',{transform:'translate(107 150)'});path('M-40-6Q0-45 40-6L30 19Q0 34-30 19Z','#c4a56e','#92784d',2,basket);for(let i=-3;i<4;i++)path(`M${i*10} -12l-6 36`,'none','#e2c48b',1,basket);for(let i=0;i<4;i++)path(`M-35 ${i*7-2}q35 10 70 0`,'none','#8f784e',1,basket);
   add('ellipse',{cx:284,cy:194,rx:51,ry:18,fill:'#b5c9b8',stroke:'#879f8c','stroke-width':2});add('ellipse',{cx:284,cy:190,rx:46,ry:13,fill:'url(#micro-water)'});
   refs.drops=[0,1,2].map(()=>add('ellipse',{cx:285,cy:57,rx:2.8,ry:5,fill:'#7aa9a4',opacity:0}));refs.rings=[0,1].map(()=>add('ellipse',{cx:284,cy:190,rx:0,ry:0,fill:'none',stroke:'#edf2dd','stroke-width':1.4,opacity:0}));
   add('ellipse',{cx:385,cy:180,rx:42,ry:64,fill:'url(#micro-glow)',opacity:.4});
  }
  return refs;
 }
 function paint(refs,s,reduced=false){
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
 return {create,act,tick,outcome,draw,paint};
}));
