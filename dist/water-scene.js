(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./hint-art.js'):root.TrailHintArt);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailWaterScene=api;}(typeof globalThis!=='undefined'?globalThis:this,function(Hint){
 'use strict';
 const assets={creek:{scene:'sprites/creek-water-v1.webp',actor:'sprites/creek-leaf-v1.webp',stone:'sprites/creek-stone-v1.webp',hint:Hint.HINT_ART.file},rain:{scene:'scenes/mogan-v1.webp',actor:'sprites/bamboo-cup-v2.webp'}};
 // The cleaned sprite's opening is the origin for physics, water and artwork.
 const cup={width:100,anchorY:.184,mouthY:.76,mouthRadius:38,waterRadius:34,waterDepth:14};
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
 function finishDuration(s){return s.play.reduced?.45:2.8;}
 function nextDrop(index){return [.16,.53,.30,.74,.43,.84,.24,.65][index%8];}
 function sample(s){
  const rain=s.game==='rain',elapsed=s.play.complete?s.age-s.play.completedAt:0,last=s.events.filter(e=>e.type===(rain?'catch':'goal')).at(-1),age=last?s.age-last.age:10;
  const phase=s.play.complete?(elapsed<1.55&&!s.play.reduced?'settle':'memory'):!s.acted?'invite':age<.65?'caught':'play';
  return {phase,finish:s.play.complete&&s.play.reduced?1:ease(elapsed/1.65),paper:s.play.complete&&s.play.reduced?1:ease((elapsed-1.5)/.8),pulse:Math.max(0,1-age/.65),count:rain?s.caught:s.gates,total:rain?8:3,
   cue:phase==='invite'?(rain?'轻触开始，左右移动竹筒':'点一下落叶旁的水，送它出发'):phase==='memory'?'正在展开手绘纪念':phase==='settle'?(rain?'雨声留在竹筒里':'让落叶漂向下游'):s.feedback};
 }
 function create(P,app,game,{gates,rocks,rockShapes,drawPixi,hintAsset}){
  const root=new P.Container(),back=new P.Container(),land=new P.Graphics(),currents=new P.Graphics(),targets=new P.Container(),shade=new P.Graphics(),actorLayer=new P.Container(),water=new P.Graphics(),dropsLayer=new P.Container(),canopy=new P.Container(),effects=new P.Graphics(),paper=new P.Graphics();
  root.addChild(back,land,currents,targets,shade,actorLayer,water,dropsLayer,canopy,effects,paper);app.stage.addChild(root);
  const cupWater=game==='rain'?new P.Graphics():null,cupMask=game==='rain'?new P.Graphics():null;if(game==='rain'){cupMask.ellipse(0,0,cup.mouthRadius,17).fill(0xffffff);actorLayer.addChild(cupWater,cupMask);cupWater.mask=cupMask;}
  const textures=[],stoneNodes=[],dropNodes=[],leafNodes=[];let disposed=false,scene=null,actor=null,hasScene=false,hasActor=false,lastHeight=0,original=null;
  const hints=game==='creek'?Hint.createPixiHints(P,targets,hintAsset,()=>{if(!disposed)app.render?.();}):null;
  if(game==='creek'){
   drawPixi(P,land,rockShapes);
  }else{
   for(let i=0;i<4;i++){const d=new P.Graphics();d.moveTo(0,-11).bezierCurveTo(-9,0,-7,8,0,9).bezierCurveTo(7,8,9,0,0,-11).fill({color:0xb8dcd0,alpha:.95});d.ellipse(-1,-1,1.6,4).fill({color:0xfff9de,alpha:.85});dropsLayer.addChild(d);dropNodes.push(d);}
   for(let i=0;i<8;i++){const leaf=new P.Graphics();leaf.moveTo(-67,-17).quadraticCurveTo(-25,-41,15,0).quadraticCurveTo(-24,-7,-67,-17).fill({color:i%2?0x668768:0x87a275,alpha:.9});leaf.moveTo(-63,-17).quadraticCurveTo(-22,-19,15,0).stroke({color:0xd4d8a2,width:1,alpha:.65});for(let j=0;j<5;j++)leaf.moveTo(-49+j*10,-16+j*2).lineTo(-47+j*10,-23+j*4).stroke({color:0xc4cf9e,width:.7,alpha:.5});canopy.addChild(leaf);leafNodes.push(leaf);}
  }
  async function install(kind,entry){
   if(disposed||entry?.state!=='ready')return false;const texture=P.Texture.from(entry.image,true);textures.push(texture);await app.renderer.prepare?.upload(texture);if(disposed)return false;
   if(kind==='scene'){scene=new P.Sprite(texture);back.addChildAt(scene,0);hasScene=true;}
   else if(kind==='stone'){land.visible=false;for(const [i,r]of rocks.entries()){const stone=new P.Sprite(texture);stone.anchor.set(.5);stone.width=r.r*1600;stone.height=r.r*920;stone.rotation=(i-1)*.08;back.addChild(stone);stoneNodes.push({stone,r});lastHeight=0;}}
   else if(kind==='actor'){
    actor=game==='creek'?new P.MeshPlane({texture,verticesX:9,verticesY:5}):new P.Sprite(texture);
    if(game==='creek'){original=new Float32Array(actor.geometry.getBuffer('aPosition').data);actor.pivot.set(texture.width/2,texture.height/2);}else actor.anchor.set(.5,cup.anchorY);
    actorLayer.addChildAt(actor,0);hasActor=true;
   }return true;
  }
  function paint(s){
   if(disposed)return;const H=app.screen.height,f=sample(s),t=s.play.reduced?0:Math.min(s.age,s.play.complete?s.play.completedAt+1.55:Infinity),x=s.actor.x*800,y=s.actor.y*H;
   if(scene){const scale=Math.max(800/scene.texture.width,H/scene.texture.height);scene.scale.set(scale);scene.position.set((800-scene.width)/2,(H-scene.height)/2);}
   if(H!==lastHeight){land.scale.y=H/460;lastHeight=H;for(const {stone,r}of stoneNodes){stone.position.set(r.x*800,r.y*H);stone.height=r.r*H*2;}}
   root.alpha=s.play.reduced?1:.78+.22*ease(s.age/.7);
   currents.clear();shade.clear();water.clear();effects.clear();paper.clear();
   if(game==='creek'){
    for(let i=0;i<15;i++){const xx=(i*83+t*17)%860-30,yy=(.22+(i*37%56)/100)*H;currents.moveTo(xx,yy).quadraticCurveTo(xx+18,yy-4,xx+44,yy).stroke({color:0xfffae3,width:1,alpha:.18});}
    hints.paint(Hint.creekHints(s,gates,H));
    for(const points of Hint.creekHintStrokes(s,gates,H))for(const [color,width,alpha]of [[0x527969,4,.16],[0xf5f5e4,1.7,.7]]){water.moveTo(points[0].x,points[0].y);for(const point of points.slice(1))water.lineTo(point.x,point.y);water.stroke({color,width,alpha,cap:'round',join:'round'});}
    shade.ellipse(x+3,y+7,29,8).fill({color:0x244d44,alpha:.2});
    for(let i=0;i<3;i++){const q=(t*.6+i/3)%1;water.ellipse(x-8-q*27,y+4,17+q*20,4+q*7).stroke({color:0xeff5da,width:1,alpha:(1-q)*.3});}
   }else{
    shade.ellipse(x,y+(actor?cup.width*actor.texture.height/actor.texture.width*(1-cup.anchorY):100),43,8).fill({color:0x244d44,alpha:.2});
    for(let i=0;i<leafNodes.length;i++){leafNodes[i].position.set(nextDrop(i)*800-15,H*.24);leafNodes[i].rotation=s.play.reduced?0:Math.sin(t*1.3+i)*.025;}
    for(let i=0;i<dropNodes.length;i++){const node=dropNodes[i],d=s.drops[i];node.visible=!!d&&!s.play.complete;if(d){node.position.set(d.x*800,d.y*H);node.scale.set(1,1+Math.min(.4,(d.y-.16)*.65));}}
    // A growing bead predicts where the next playable drop will detach.
    if(s.acted&&!s.play.complete){const q=clamp(1-s.spawn/1.2),bx=nextDrop(s.dropIndex||0)*800;water.ellipse(bx,H*.24,2+q*3,3+q*6).fill({color:0xd5e5ce,alpha:.9});water.ellipse(bx-1,H*.24-1,1,2).fill({color:0xfff9e1,alpha:.9});}
    for(let i=0;i<24;i++){const xx=(i*71+t*6)%800,yy=(i*73+t*120)%H;currents.moveTo(xx,yy).lineTo(xx-1,yy+7).stroke({color:0xe8f1da,width:1,alpha:.19*(1-f.finish)});}
    // Water and impact rings share the cup's mouth origin and stay inside its rim.
    cupWater.clear();const waterY=4-s.caught*.35;
    cupWater.ellipse(0,waterY,cup.waterRadius,cup.waterDepth).fill({color:0x6caa98,alpha:.28+s.caught*.035});
    cupWater.ellipse(0,waterY,cup.waterRadius-2,cup.waterDepth-2).stroke({color:0xdaebc7,width:.8,alpha:.5});
    for(const e of s.events){const age=s.age-e.age;if(e.type!=='catch'||age<0||age>.55)continue;const q=age/.55,localX=clamp((e.offsetX||0)*800,-27,27);
     cupWater.ellipse(localX*(1-q),waterY,3+q*30,2+q*11).stroke({color:0xfff2c7,width:1.4,alpha:1-q});
     for(let j=0;j<5;j++){const dx=(j-2)*3*q;cupWater.ellipse(localX+dx,waterY-Math.sin(q*Math.PI)*9+j%2,1.1,1.7).fill({color:0xe2eed4,alpha:1-q});}
    }
   }
   if(actor){
    const size=game==='creek'?79:cup.width,base=size/actor.texture.width,tilt=game==='creek'?Math.sin(t*1.6)*.045+s.actor.vy*.7:clamp((s.control.x-s.actor.x)*.7,-.09,.09);
    if(game==='rain'){actorLayer.position.set(x,y);actor.position.set(0,0);actor.rotation=0;actor.scale.set(base);}else{actor.position.set(x,y);actor.rotation=s.play.reduced?0:tilt;actor.scale.set(base*(1+f.pulse*.045),base*(1-f.pulse*.04));}actor.alpha=game==='creek'?1-f.finish*.75:1;
    if(original){const buffer=actor.geometry.getBuffer('aPosition'),v=buffer.data;for(let i=0;i<v.length;i+=2){v[i]=original[i];v[i+1]=original[i+1]+(s.play.reduced?0:Math.sin(original[i]/actor.texture.width*4+t*2)*Math.sin(original[i+1]/actor.texture.height*Math.PI)*3);}buffer.update();}
   }
   for(const e of s.events){const age=s.age-e.age;if(age<0||age>1.15||game==='rain'&&e.type==='catch')continue;const success=['catch','goal','complete'].includes(e.type),ripple=e.type==='ripple';if(!success&&!ripple&&e.type!=='miss'&&e.type!=='bump')continue;const alpha=1-age/1.15,ex=e.x*800,ey=e.y*H;
    for(let j=0;j<(ripple?3:2);j++)effects.ellipse(ex,ey,5+age*65+j*11,3+age*24+j*4).stroke({color:success?0xffecc0:0xe2f0d9,width:success?1.7:1.2,alpha:alpha*.7});
    if(success)for(let j=0;j<8;j++){const angle=j*Math.PI/4;effects.ellipse(ex+Math.cos(angle)*age*40,ey-Math.sin(angle)*age*32-age*24+age*age*35,1.7,2.7).fill({color:0xffedb9,alpha});}
   }
   if(f.paper){paper.rect(0,0,800,H).fill({color:0xfaf3df,alpha:f.paper*.22});paper.rect(15,15,770,H-30).stroke({color:0xfff7e4,alpha:f.paper*.85,width:12});}
  }
  function dispose(){if(disposed)return;disposed=true;hints?.dispose();root.destroy({children:true});for(const t of textures)t.destroy(true);}
  return {root,install,paint,dispose,get ready(){return hasScene&&hasActor;}};
 }
 return {assets,cup,nextDrop,finishDuration,sample,create};
}));
