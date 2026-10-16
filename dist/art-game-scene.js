(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./art-games.js'):root.TrailArtGames);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailArtGameScene=api;}(typeof globalThis!=='undefined'?globalThis:this,function(A){
 'use strict';
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
 const mix=(a,b,t)=>a+(b-a)*t,pos=(b,p)=>({x:b.x+p.x*b.w,y:b.y+p.y*b.h});
 function shape(id){
  const c=id%3,r=Math.floor(id/3),vertical=[1,-1],horizontal=[1,-1,1],edges=[r?-horizontal[c]:0,c<2?vertical[c]:0,r<1?horizontal[c]:0,c?-vertical[c-1]:0],corners=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]],normals=[[0,-1],[1,0],[0,1],[-1,0]],out=[['M',-.5,-.5]];
  for(let i=0;i<4;i++){const a=corners[i],z=corners[(i+1)%4],n=normals[i],edge=edges[i],point=(u,h=0)=>[a[0]+(z[0]-a[0])*u+n[0]*h,a[1]+(z[1]-a[1])*u+n[1]*h];if(edge){out.push(['L',...point(.34)],['C',...point(.44),...point(.35,edge*.16),...point(.50,edge*.16)],['C',...point(.65,edge*.16),...point(.56),...point(.66)],['L',...z]);}else out.push(['L',...z]);}out.push(['Z']);return out;
 }
 const shapes=Array.from({length:6},(_,id)=>shape(id));
 function drawPath(g,commands){for(const [type,...v]of commands){if(type==='M')g.moveTo(...v);else if(type==='L')g.lineTo(...v);else if(type==='C')g.bezierCurveTo(...v);else g.closePath();}return g;}
 const pathData=commands=>commands.map(c=>c[0]+c.slice(1).join(' ')).join(' ');
 function piecePose(s,p){
  const selected=p.id===s.puzzle.selected,base=p.placed?A.slotPoint(p.id):s.puzzle.held&&selected?s.puzzle.held:A.trayPoint(p.tray),settle=p.placed&&p.placeFrom&&!s.play.reduced?ease((s.age-p.placedAt)/.25):1;
  let point=base;if(p.placed&&p.placeFrom)point={x:mix(p.placeFrom.x,base.x,settle),y:mix(p.placeFrom.y,base.y,settle)};
  return {...point,selected,scale:p.placed?mix(.72,1,settle):s.puzzle.held&&selected?1:.70};
 }
 function cardPose(s,index){
  const m=s.match,c=m.cells[index],end=A.cellPoint(index),duration=s.play.reduced?.10:m.stage==='fall'?.42:.28,t=ease((s.age-m.at)/duration),p=c.from&&['swap','return','fall'].includes(m.stage)?{x:mix(c.from.x,end.x,t),y:mix(c.from.y,end.y,t)}:end;
  const pop=m.stage==='pop'&&m.popping.includes(index)?clamp((s.age-m.at)/(s.play.reduced?.10:.36)):0;
  return {...p,alpha:1-pop,scale:1+Math.sin(pop*Math.PI)*.08-pop*.46,type:c.type};
 }
 function forkRect(){const f=A.Atlas.frames[4],h=.26,w=h*f.w/f.h;return {x:A.slingOrigin.x-w/2,y:.685,w,h};}
 function cordPoints(s){const f=forkRect(),a={x:f.x+f.w*.17,y:f.y+f.h*.06},b={x:f.x+f.w*.83,y:f.y+f.h*.06},pull=A.aimPouch(s);let p=pull;
  if(s.sling.stage!=='ready'){const t=s.play.reduced?10:s.age-(s.sling.releasedAt??s.sling.at),d=Math.exp(-t*11)*Math.cos(t*26);p={x:A.slingOrigin.x+(pull.x-A.slingOrigin.x)*d,y:A.slingOrigin.y+(pull.y-A.slingOrigin.y)*d};}return [a,p,b];}
 function attrs(node,values){for(const [key,value]of Object.entries(values))node.setAttribute(key,value);}
 let serial=0;
 function atlasSvg(svg,parent,index){const frame=A.Atlas.frames[index],node=svg('svg',{viewBox:[frame.x,frame.y,frame.w,frame.h].join(' '),preserveAspectRatio:'xMidYMid meet',overflow:'hidden'},parent);svg('image',{href:A.Atlas.file,width:A.Atlas.width,height:A.Atlas.height},node);return node;}
 function draw(svg,parent,entry){
  const game=A.kinds[entry.id],uid='art-play-'+(++serial),root=svg('g',{},parent),paper=svg('rect',{width:800,height:800,fill:'#f6f0df'},root),defs=svg('defs',{},root),world=svg('g',{},root),board=svg('rect',{fill:'#fffaf0',stroke:'#d4c9ad','stroke-width':2,rx:6},world),scene=svg('image',{href:A.assets[game].scene,preserveAspectRatio:game==='sling'?'xMidYMid slice':'none'},world),marks=svg('g',{},world),layers=svg('g',{},world),pieces=[],cards=[],dews=[],stalks=[];
  const label=game==='sling'?atlasSvg(svg,layers,7):null,fork=game==='sling'?atlasSvg(svg,layers,4):null,cord=svg('polyline',{fill:'none',stroke:'#6b674e','stroke-width':3,'stroke-linecap':'round'},layers),forecast=svg('g',{},layers),forecastDots=Array.from({length:22},()=>svg('circle',{r:2,fill:'#faf1c7'},forecast)),leaf=game==='sling'?atlasSvg(svg,layers,5):null;
  if(game==='puzzle')for(let id=0;id<6;id++){
   const g=svg('g',{},layers),shadow=svg('path',{d:pathData(shapes[id]),fill:'#556043',opacity:.18,transform:'translate(.015 .025)'},g),clip=svg('clipPath',{id:uid+'-'+id},defs);svg('path',{d:pathData(shapes[id])},clip);svg('path',{d:pathData(shapes[id]),fill:'#fffae9'},g);
   const image=svg('image',{href:A.assets.puzzle.scene,x:-(id%3+.5),y:-(Math.floor(id/3)+.5),width:3,height:2,preserveAspectRatio:'none','clip-path':'url(#'+uid+'-'+id+')'},g),line=svg('path',{d:pathData(shapes[id]),fill:'none',stroke:'#f8f0db','stroke-width':.012},g),number=svg('text',{x:.37,y:.41,'text-anchor':'middle',fill:'#415c42','font-size':.13,'paint-order':'stroke',stroke:'#fff9e7','stroke-width':.04},g);number.textContent=id+1;pieces.push({g,image,line,number,shadow});
  }
  let matchClip=null;if(game==='match'){
   const clip=svg('clipPath',{id:uid+'-board'},defs);matchClip=svg('rect',{},clip);layers.setAttribute('clip-path','url(#'+uid+'-board)');
   for(let i=0;i<25;i++){const g=svg('g',{},layers),base=svg('rect',{fill:'#fffbed',stroke:'#ded5bb','stroke-width':1,rx:9},g),icon=atlasSvg(svg,g,0);cards.push({g,base,icon,frame:-1});}
   for(const index of A.stamps)dews.push({index,node:svg('path',{d:'M0 -13C-5 -5 -11 1 -9 7C-7 15 8 16 10 7C12 1 5 -6 0 -13Z',fill:'#adc8ba',stroke:'#f9ffe9','stroke-width':1.3},layers)});
  }
  if(game==='sling')for(const obstacle of A.obstacles)stalks.push({obstacle,node:atlasSvg(svg,world,6)});
  if(game==='match')world.appendChild(marks);
  const cursor=svg('rect',{fill:'none',stroke:'#5b8062','stroke-width':2,rx:7},world),seal=svg('rect',{x:12,y:12,width:776,height:776,fill:'none',stroke:'#fff9e9','stroke-width':20,opacity:0},root),note=svg('text',{x:400,y:400,'text-anchor':'middle',fill:'#5c7355','font-size':17},root),refs={mini:true,art:true,game,svg,parent,root,paper,world,scene,board,marks,layers,pieces,cards,dews,label,fork,cord,forecast,forecastDots,leaf,stalks,cursor,seal,note,matchClip,height:800,disposed:false,renderer:null,latest:null};
  parent.setAttribute('viewBox','0 0 800 800');return refs;
 }
 function paintFallback(refs,s){
  if(refs.disposed||!s)return;refs.latest=s;const H=refs.height||800,b=A.bounds(H),f=A.sample(s),p=(point)=>pos(b,point);refs.parent.setAttribute('viewBox','0 0 800 '+H);attrs(refs.paper,{height:H});attrs(refs.world,{opacity:1});attrs(refs.seal,{height:H-24,opacity:f.paper});
  refs.marks.replaceChildren();attrs(refs.board,{opacity:s.game==='sling'?0:1-f.paper*.9});attrs(refs.cursor,{opacity:0});attrs(refs.cord,{opacity:s.game==='sling'?1:0});
  if(s.game==='puzzle'){
   const r=A.puzzleBoard;attrs(refs.board,{x:b.x+r.x*b.w-8,y:b.y+r.y*b.h-8,width:r.w*b.w+16,height:r.h*b.h+16});attrs(refs.scene,{x:b.x+r.x*b.w,y:b.y+r.y*b.h,width:r.w*b.w,height:r.h*b.h,opacity:s.puzzle.guide?.18:0});
   if(refs.lastSelected!==s.puzzle.selected){if(s.puzzle.selected!==null)refs.layers.appendChild(refs.pieces[s.puzzle.selected].g);refs.lastSelected=s.puzzle.selected;}
   for(const piece of s.puzzle.pieces){const view=piecePose(s,piece),node=refs.pieces[piece.id],at=p(view);attrs(node.g,{transform:'translate('+at.x+' '+at.y+') scale('+(r.w/3*b.w*view.scale)+')',opacity:piece.placed?1:1-f.paper});attrs(node.number,{opacity:!piece.placed&&s.puzzle.keyboard?1:0});attrs(node.line,{stroke:view.selected?'#8c9d6b':'#f9f1df','stroke-width':view.selected?.018:.012});}
   const at=p(A.slotPoint(s.cursor)),w=r.w/3*b.w;attrs(refs.cursor,{x:at.x-w/2+3,y:at.y-w/2+3,width:w-6,height:w-6,opacity:!s.play.complete&&s.puzzle.keyboard?.4:0});
  }else if(s.game==='match'){
   const r=A.matchBoard,w=r.w/5*b.w;attrs(refs.matchClip,{x:b.x+r.x*b.w,y:b.y+r.y*b.h,width:r.w*b.w,height:r.h*b.h});attrs(refs.board,{x:b.x+r.x*b.w-8,y:b.y+r.y*b.h-8,width:r.w*b.w+16,height:r.h*b.h+16});attrs(refs.scene,{x:b.x+.08*b.w,y:b.y+.08*b.h,width:.84*b.w,height:.84*b.h,opacity:s.play.complete?f.paper:.035});
   refs.cards.forEach((node,i)=>{const v=cardPose(s,i),at=p(v),frame=A.Atlas.frames[v.type],iconSize=w*.78;attrs(node.g,{transform:'translate('+at.x+' '+at.y+')',opacity:(1-f.paper)*v.alpha});attrs(node.base,{x:-w*.47,y:-w*.47,width:w*.94,height:w*.94});attrs(node.icon,{x:-iconSize*v.scale/2,y:-iconSize*v.scale/2,width:iconSize*v.scale,height:iconSize*v.scale,viewBox:[frame.x,frame.y,frame.w,frame.h].join(' ')});});
   refs.dews.forEach(({node,index})=>{const visible=s.match.remaining.includes(index)||s.match.poppedDews?.includes(index),at=p(A.cellPoint(index)),fade=s.match.poppedDews?.includes(index)&&s.match.stage==='pop'?1-clamp((s.age-s.match.at)/.36):1;attrs(node,{transform:'translate('+(at.x+w*.31)+' '+(at.y-w*.30)+')',opacity:visible?fade*(1-f.paper):0});});
   if(s.match.hint&&s.age<s.match.hintUntil)for(const j of s.match.hint){const at=p(A.cellPoint(j));refs.svg('rect',{x:at.x-w*.43,y:at.y-w*.43,width:w*.86,height:w*.86,rx:7,fill:'none',stroke:'#c29d4f','stroke-width':2},refs.marks);}
   const at=p(A.cellPoint(s.match.selected??s.cursor));attrs(refs.cursor,{x:at.x-w*.47,y:at.y-w*.47,width:w*.94,height:w*.94,opacity:s.play.complete?0:.7});
  }else{
   attrs(refs.scene,{x:b.x,y:b.y,width:b.w,height:b.h,opacity:1});attrs(refs.label,{x:b.x+A.target.x*b.w,y:b.y+A.target.y*b.h,width:A.target.w*b.w,height:A.target.h*b.h});const fork=forkRect();attrs(refs.fork,{x:b.x+fork.x*b.w,y:b.y+fork.y*b.h,width:fork.w*b.w,height:fork.h*b.h});refs.stalks.forEach(({node,obstacle:r})=>attrs(node,{x:b.x+r.x*b.w,y:b.y+r.y*b.h,width:r.w*b.w,height:r.h*b.h}));
   attrs(refs.cord,{points:cordPoints(s).map(point=>{const at=p(point);return at.x+','+at.y;}).join(' ')});const q=s.sling,at=p(q.shot||A.aimPouch(s)),w=b.w*.057,h=w*A.Atlas.frames[5].h/A.Atlas.frames[5].w;attrs(refs.leaf,{x:at.x-w/2,y:at.y-h/2,width:w,height:h,transform:'rotate('+((q.shot?.spin||0)*15)+' '+at.x+' '+at.y+')'});
   const preview=q.stage==='ready'?A.preview(s):[];refs.forecastDots.forEach((node,i)=>{const point=preview[i],at=point&&p(point);attrs(node,{cx:at?.x||0,cy:at?.y||0,opacity:point?.55:0});});
  }
 }
 function paperTexture(P){
  const canvas=globalThis.document?.createElement('canvas'),ctx=canvas?.getContext?.('2d');if(!ctx)return null;canvas.width=256;canvas.height=256;const data=ctx.createImageData(256,256);let seed=8319;
  for(let i=0;i<data.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const grain=(seed/4294967296-.5)*6;data.data[i]=248+grain;data.data[i+1]=244+grain;data.data[i+2]=231+grain;data.data[i+3]=255;}ctx.putImageData(data,0,0);return P.Texture.from(canvas,true);
 }
 function createScene(P,app,game){
  const root=new P.Container(),paper=new P.Container(),world=new P.Container(),back=new P.Container(),plate=new P.Graphics(),guides=new P.Graphics(),actors=new P.Container(),marks=new P.Graphics(),boardMask=new P.Graphics(),effects=new P.Container(),seal=new P.Graphics(),textures=[],frames=[],pieces=[],cards=[],dews=[],stalks=[],dots=[],sparks=[];
  root.eventMode='none';root.addChild(paper,world,seal);world.addChild(plate,back,guides,actors,marks,effects,boardMask);if(game==='match')actors.mask=boardMask;app.stage.addChild(root);
  let scene=null,atlas=null,fork=null,label=null,leaf=null,cord=null,disposed=false,last=null,hasScene=false,hasAtlas=false,fallbackPaper=null;
  const grain=paperTexture(P);if(grain){textures.push(grain);const sprite=new P.Sprite(grain);sprite.width=800;sprite.height=800;paper.addChild(sprite);}else{fallbackPaper=new P.Graphics();paper.addChild(fallbackPaper);}
  if(game==='match')for(let i=0;i<25;i++){const node=new P.Container(),base=new P.Graphics().roundRect(-.47,-.47,.94,.94,.06).fill(0xfffbee).stroke({color:0xded4bb,width:.007,alpha:.7}),icon=new P.Sprite();icon.anchor.set(.5);node.addChild(base,icon);actors.addChild(node);cards.push({node,base,icon});}
  if(game==='sling'){cord=new P.Graphics();actors.addChild(cord);for(let i=0;i<22;i++){const node=new P.Graphics().circle(0,0,2).fill({color:0xfff4cf,alpha:.75});effects.addChild(node);dots.push(node);}}
  async function install(kind,entry){
   if(disposed||entry?.state!=='ready')return;const texture=P.Texture.from(entry.image,true);textures.push(texture);let installed;
   if(kind==='scene'){
    scene=new P.Sprite(texture);back.addChild(scene);installed=scene;
    if(game==='puzzle')for(let id=0;id<6;id++){
     const node=new P.Container(),shadow=drawPath(new P.Graphics(),shapes[id]).fill({color:0x5c6043,alpha:.18}),base=drawPath(new P.Graphics(),shapes[id]).fill(0xfff7e2),picture=new P.Sprite(texture),mask=drawPath(new P.Graphics(),shapes[id]).fill(0xffffff),line=drawPath(new P.Graphics(),shapes[id]).stroke({color:0xfff6df,width:.010}),number=new P.Text({text:String(id+1),style:{fontFamily:'serif',fontSize:16,fill:0x496145,stroke:{color:0xfff9e8,width:3}}});
     shadow.position.set(.018,.024);picture.width=3;picture.height=2;picture.position.set(-(id%3+.5),-(Math.floor(id/3)+.5));picture.mask=mask;number.anchor.set(.5);number.scale.set(.008125);number.position.set(.35,.37);node.addChild(shadow,base,picture,mask,line,number);actors.addChild(node);pieces.push({node,line,number});
    }
   }else if(kind==='actor'){
    atlas=texture;for(const r of A.Atlas.frames)frames.push(new P.Texture({source:texture.source,frame:new P.Rectangle(r.x,r.y,r.w,r.h)}));installed=actors;
    if(game==='sling'){label=new P.Sprite(frames[7]);fork=new P.Sprite(frames[4]);leaf=new P.Sprite(frames[5]);leaf.anchor.set(.5);actors.addChildAt(label,0);actors.addChildAt(fork,1);actors.addChild(leaf);for(const obstacle of A.obstacles){const node=new P.Sprite(frames[6]);actors.addChildAt(node,0);stalks.push({node,obstacle});}}
    if(game==='match'){
     for(const index of A.stamps){const node=new P.Graphics().moveTo(0,-13).bezierCurveTo(-5,-5,-11,1,-9,7).bezierCurveTo(-7,15,8,16,10,7).bezierCurveTo(12,1,5,-6,0,-13).fill({color:0xa9c7b8,alpha:.95}).stroke({color:0xf5ffe7,width:1.3});effects.addChild(node);dews.push({node,index});}
     for(let i=0;i<24;i++){const node=new P.Sprite(frames[i%4]);node.anchor.set(.5);effects.addChild(node);sparks.push(node);}
    }
   }
   if(installed){await Promise.resolve(app.renderer.prepare?.upload(kind==='scene'&&game==='puzzle'?world:installed)).catch(()=>{});if(!disposed){if(kind==='scene')hasScene=true;else hasAtlas=true;if(last)paint(last);}}
  }
  function paint(s){
   if(disposed)return;last=s;const H=app.screen?.height||800,b=A.bounds(H),f=A.sample(s),p=point=>pos(b,point),fade=1-f.paper;
   paper.position.set(0,0);paper.children.forEach(node=>{if(node instanceof P.Sprite){node.width=800;node.height=H;}});if(fallbackPaper)fallbackPaper.clear().rect(0,0,800,H).fill(0xf6f0df);plate.clear();guides.clear();marks.clear();boardMask.clear();
   if(game==='puzzle'){
    const r=A.puzzleBoard,cell=r.w*b.w/3;plate.roundRect(b.x+r.x*b.w-8,b.y+r.y*b.h-8,r.w*b.w+16,r.h*b.h+16,7).fill({color:0xfff9e8,alpha:.92}).stroke({color:0xc8b993,width:1.2,alpha:.8});if(scene){scene.position.set(b.x+r.x*b.w,b.y+r.y*b.h);scene.width=r.w*b.w;scene.height=r.h*b.h;scene.alpha=s.puzzle.guide?.18:0;}
    for(const piece of s.puzzle.pieces){const view=piecePose(s,piece),at=p(view),item=pieces[piece.id];if(!item)continue;item.node.position.set(at.x,at.y);item.node.scale.set(cell*view.scale);item.node.alpha=piece.placed?1:fade;item.number.visible=!piece.placed&&s.puzzle.keyboard;item.line.tint=view.selected?0x95a875:0xffffff;if(view.selected)actors.setChildIndex(item.node,actors.children.length-1);}
    if(!s.play.complete&&s.puzzle.keyboard){const at=p(A.slotPoint(s.cursor));guides.roundRect(at.x-cell/2+4,at.y-cell/2+4,cell-8,cell-8,4).stroke({color:0x6e8b5d,width:1.8,alpha:.5});}
   }else if(game==='match'){
    const r=A.matchBoard,w=r.w*b.w/5;boardMask.rect(b.x+r.x*b.w,b.y+r.y*b.h,r.w*b.w,r.h*b.h).fill(0xffffff);if(scene){scene.anchor.set(.5);scene.position.set(b.x+b.w*.5,b.y+b.h*.5);scene.width=b.w*.86;scene.height=b.h*.86;scene.alpha=s.play.complete?f.paper:.035;}
    plate.roundRect(b.x+r.x*b.w-9,b.y+r.y*b.h-9,r.w*b.w+18,r.h*b.h+18,11).fill({color:0xf3eedb,alpha:.94*fade}).stroke({color:0xc5c7aa,width:1,alpha:fade*.8});
    cards.forEach((item,i)=>{const v=cardPose(s,i),at=p(v);item.node.position.set(at.x,at.y);item.node.scale.set(w);item.node.alpha=fade*v.alpha;if(frames[v.type]){item.icon.texture=frames[v.type];const size=.78*v.scale/Math.max(item.icon.texture.width,item.icon.texture.height);item.icon.scale.set(size);}});
    dews.forEach(({node,index})=>{const active=s.match.remaining.includes(index)||s.match.poppedDews?.includes(index),at=p(A.cellPoint(index)),pop=s.match.poppedDews?.includes(index)&&s.match.stage==='pop'?1-clamp((s.age-s.match.at)/(s.play.reduced?.1:.36)):1;node.position.set(at.x+w*.31,at.y-w*.30);node.alpha=active?fade*pop:0;node.scale.set(clamp(b.w/700,.8,1.3));});
    if(!s.play.complete){const i=s.match.selected??s.cursor,at=p(A.cellPoint(i));marks.roundRect(at.x-w*.47,at.y-w*.47,w*.94,w*.94,9).stroke({color:0x67865b,width:2,alpha:.8});if(s.match.hint&&s.age<s.match.hintUntil)for(const j of s.match.hint){const hp=p(A.cellPoint(j));marks.roundRect(hp.x-w*.43,hp.y-w*.43,w*.86,w*.86,7).stroke({color:0xc29d4f,width:2,alpha:.8});}}
    const pop=s.events.filter(e=>e.type==='card-clear').at(-1),age=pop?s.age-pop.age:10;sparks.forEach((node,i)=>{const q=clamp(age/.85),at=p(pop||{x:.5,y:.5}),a=i*2.399;node.position.set(at.x+Math.cos(a)*q*b.w*(.025+i*.003),at.y+Math.sin(a)*q*b.h*.055-q*b.h*.055);node.scale.set((.017*(1-q)+.004)*b.w/Math.max(node.texture.width,node.texture.height));node.rotation=a+q;node.alpha=s.play.reduced?0:(1-q)*fade*.7;});
   }else{
    if(scene){const scale=Math.max(b.w/scene.texture.width,b.h/scene.texture.height);scene.scale.set(scale);scene.position.set(b.x+(b.w-scene.width)/2,b.y+(b.h-scene.height)/2);}
    if(label){label.position.set(b.x+A.target.x*b.w,b.y+A.target.y*b.h);label.scale.set(A.target.h*b.h/label.texture.height);}
    if(fork){const r=forkRect();fork.position.set(b.x+r.x*b.w,b.y+r.y*b.h);fork.scale.set(r.h*b.h/fork.texture.height);}
    stalks.forEach(({node,obstacle:r})=>{node.position.set(b.x+r.x*b.w,b.y+r.y*b.h);node.scale.set(r.h*b.h/node.texture.height);});
    const points=cordPoints(s).map(p);cord.clear().moveTo(points[0].x,points[0].y).lineTo(points[1].x,points[1].y).lineTo(points[2].x,points[2].y).stroke({color:0x555641,width:3,alpha:.9});cord.moveTo(points[0].x,points[0].y-1).lineTo(points[1].x,points[1].y-1).lineTo(points[2].x,points[2].y-1).stroke({color:0xe3d6a6,width:.9,alpha:.7});
    const shot=s.sling.shot,at=p(shot||A.aimPouch(s));if(leaf){leaf.position.set(at.x,at.y);leaf.scale.set(.057*b.w/leaf.texture.width);leaf.rotation=shot?Math.atan2(shot.vy,shot.vx||.001)*.3+(s.play.reduced?0:Math.sin(s.age*9)*.07):-.25;}
    const preview=s.sling.stage==='ready'?A.preview(s):[];dots.forEach((node,i)=>{const point=preview[i],at=point&&p(point);node.visible=!!point&&!s.play.complete;if(at)node.position.set(at.x,at.y);node.alpha=.65*(1-i/27);});
    const caught=s.events.filter(e=>e.type==='sling-catch').at(-1),age=caught?s.age-caught.age:10;if(age<1){const at=p(caught);marks.ellipse(at.x,at.y,8+age*28,6+age*19).stroke({color:0xf8e7af,width:2,alpha:1-age});}
   }
   seal.clear();if(f.paper){seal.rect(0,0,800,H).fill({color:0xfff9e7,alpha:f.paper*.1});seal.rect(12,12,776,H-24).stroke({color:0xfffaeb,width:22*f.paper,alpha:f.paper});}
  }
  function dispose(){if(disposed)return;disposed=true;root.destroy({children:true});for(const frame of frames)frame.destroy(false);for(const texture of textures)texture.destroy(true);}
  return {root,install,paint,dispose,get ready(){return hasScene&&(game==='puzzle'||hasAtlas);}};
 }
 return {draw,paintFallback,createScene,shape,piecePose,cardPose,forkRect,cordPoints};
}));
