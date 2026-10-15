(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailWindScene=api;}(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);};
 const grassFile='sprites/wugong-meadow-grass-v1.webp';
 const finishDuration=s=>s.play.reduced?.45:3.2;
 // One simulation clock drives scene, cues and sound. Background tabs pause this clock.
 function sample(s){
  const reduced=s.play.reduced,t=reduced?0:s.play.complete?Math.min(s.age,s.play.completedAt+1.7):s.age,goal=s.events.filter(e=>e.type==='goal').at(-1),since=goal?s.age-goal.age:100;
  const ending=s.play.complete?s.age-s.play.completedAt:0,fly=s.play.complete?(reduced?1:ease(ending/1.7)):0;
  const phase=s.play.complete?(reduced||ending>1.65?'memory':'soar'):since<.85?'caught':!s.acted?'invite':'play';
  return {t,phase,fly,entry:reduced||s.acted?1:ease(s.age/1.1),catchPulse:reduced?0:Math.sin(clamp(since/.85)*Math.PI),paper:s.play.complete?(reduced?1:ease((ending-1.65)/1.1)):0,
   tension:clamp(.25+Math.abs(s.control.y-s.actor.y)*2+(s.windNear?.4:0)),stage:Math.min(2,s.gates),since,
   kiteScale:1-fly*.48,windAlpha:s.play.complete?1-ease(ending/.7):1,
   cue:phase==='memory'?'把这一阵风，留在手帐里':phase==='soar'?'越过山脊，云海展开':phase==='caught'?['','借到第一阵风','借到第二阵风','借到第三阵风'][s.gates]:!s.acted?'上下拖动牵线 · 顺着草浪找风':s.windNear?'风托住了 · 稳稳牵住':s.actor.y>([.62,.42,.24][Math.min(2,s.gates)])?'轻轻向上牵线 ↑':'松一点，回到风里 ↓'};
 }
 // Modify the same vertex buffer in place. A folded paper centre stays fixed while its wings flex.
 function deform(vertices,original,width,height,t,force,kind,reduced){
  for(let i=0;i<vertices.length;i+=2){const x=original[i],y=original[i+1],u=x/width,v=y/height;
   if(reduced){vertices[i]=x;vertices[i+1]=y;continue;}
   if(kind==='grass'){const free=(1-v)*(1-v);vertices[i]=x+Math.sin(t*1.8+u*7)*free*width*.012*(.45+force);vertices[i+1]=y+Math.sin(t*1.8+u*7+.7)*free*height*.012;}
   else{const wing=Math.pow(Math.abs(u-.5)*2,1.6);vertices[i]=x;vertices[i+1]=y+Math.sin(t*3.1+u*1.4)*wing*height*.033*(.5+force);}
  }
 }
 function create(P,app){
  const root=new P.Container(),land=new P.Container(),mist=new P.Container(),currents=new P.Graphics(),cord=new P.Graphics(),actor=new P.Container(),front=new P.Container(),motes=new P.Container(),seal=new P.Graphics();
  root.addChild(land,mist,currents,cord,actor,front,motes,seal);root.eventMode='none';app.stage.addChild(root);
  let scene=null,kite=null,grass=null,last=null,disposed=false;const textures=[],seeds=[],clouds=[],sparks=[];
  for(let i=0;i<5;i++){const g=new P.Graphics();for(let j=0;j<9;j++)g.ellipse(j*23,Math.sin(j*2+i)*9,39,9+j%3*3).fill({color:0xfffbea,alpha:.035});mist.addChild(g);clouds.push(g);}
  for(let i=0;i<24;i++){const g=new P.Graphics().ellipse(0,0,3,1.1).fill(0xf8e6af).moveTo(0,0).lineTo(7,-4).stroke({width:.8,color:0xfff7dd});motes.addChild(g);seeds.push(g);}
  for(let i=0;i<18;i++){const g=new P.Graphics().ellipse(0,0,3+i%3,1.6).fill(i%2?0xf4dc9b:0xfffae0);motes.addChild(g);sparks.push(g);}
  function plane(texture,kind){const mesh=new P.MeshPlane({texture,verticesX:kind==='grass'?24:13,verticesY:kind==='grass'?6:7});mesh.base=new Float32Array(mesh.geometry.positions);return mesh;}
  function install(kind,entry){
   if(disposed||entry?.state!=='ready')return;
   const texture=P.Texture.from(entry.image,true);textures.push(texture);let installed;
   if(kind==='scene'){scene=new P.Sprite(texture);land.addChild(scene);installed=scene;}
   if(kind==='kite'){kite=plane(texture,'kite');kite.pivot.set(texture.width/2,texture.height/2);actor.addChild(kite);installed=kite;}
   if(kind==='grass'){grass=plane(texture,'grass');front.addChild(grass);installed=grass;}
   // Upload each completed bundle before exposing it, instead of on the first drag.
   installed.visible=false;return Promise.resolve(app.renderer.prepare?.upload(installed)).catch(()=>{}).then(()=>{if(!disposed){installed.visible=true;if(last)paint(last);}});
  }
  function paint(s){
   if(disposed)return;last=s;const v=sample(s),t=v.t,H=app.screen?.height||460,x=s.actor.x*800,y=s.actor.y*H-8;
   if(scene){const zoom=s.play.reduced?1.045:1.075-v.entry*.025-v.fly*.02;const scale=Math.max(800/scene.texture.width,H/scene.texture.height)*zoom;scene.scale.set(scale);scene.x=(800-scene.width)*.5;scene.y=(H-scene.height)*(.3+s.gates*.08);}
   clouds.forEach((g,i)=>{g.x=(i*197+t*(3+i)%1100)-170;g.y=H*(.31+i%3*.095)-v.fly*12;g.alpha=s.play.reduced?.5:.5+v.fly*.6;});
   currents.clear();const target=([.62,.42,.24][Math.min(2,s.gates)]+(s.play.reduced?0:Math.sin(s.age*.65)*.025))*H;
   for(let j=0;j<3;j++){for(let k=0;k<=36;k++){const xx=65+k*19,yy=target+(j-1)*13+Math.sin(xx*.009-t*1.3+j*.4)*8;k?currents.lineTo(xx,yy):currents.moveTo(xx,yy);}currents.stroke({color:s.windNear?0xfff0b8:0xfff9e3,width:j===1?2:1,alpha:(s.windNear?.6:.32)*v.windAlpha});}
   cord.clear();const sag=(1-v.tension)*46,fromX=80,fromY=H+20;
   cord.moveTo(fromX,fromY).quadraticCurveTo(x*.48,fromY*.55+y*.45+sag,x,y+20).stroke({color:0x46614e,width:2,alpha:.22*(1-v.fly)});
   cord.moveTo(fromX,fromY).quadraticCurveTo(x*.48,fromY*.55+y*.45+sag,x,y+20).stroke({color:0xf9e6b7,width:1.1,alpha:.95*(1-v.fly)});
   for(let j=0;j<2;j++){for(let k=0;k<=24;k++){const q=k/24,xx=x+(j?15:-15)*v.kiteScale+Math.sin(q*8-t*3+j)*q*15*v.kiteScale,yy=y+(22+q*74)*v.kiteScale;k?cord.lineTo(xx,yy):cord.moveTo(xx,yy);}cord.stroke({color:j?0xbd7958:0xddbc78,width:3*v.kiteScale,alpha:.85});}
   actor.position.set(x,y+(1-v.entry)*70);actor.alpha=v.entry;actor.rotation=s.play.reduced?0:clamp(s.actor.vy*1.6,-.23,.23)+Math.sin(t*2)*.025-v.fly*.1;
   if(kite){const scale=190/kite.texture.width*v.kiteScale*(1+v.catchPulse*.065);kite.scale.set(scale);deform(kite.geometry.positions,kite.base,kite.texture.width,kite.texture.height,t,v.tension,'kite',s.play.reduced);kite.geometry.getBuffer('aPosition').update();}
   if(grass){grass.scale.set(880/grass.texture.width);grass.position.set(-40,H-330+v.fly*55);deform(grass.geometry.positions,grass.base,grass.texture.width,grass.texture.height,t,s.windNear?.9:.3,'grass',s.play.reduced);grass.geometry.getBuffer('aPosition').update();}
   seeds.forEach((g,i)=>{const q=((t*(s.windNear?65:38)+i*39)%850)/850;g.position.set(820-q*850,target+Math.sin(q*7+t*.4)*14+(i%5-2)*10);g.rotation=-.35+Math.sin(t+i)*.2;g.alpha=Math.sin(q*Math.PI)*.8*v.windAlpha;});
   const goal=s.events.filter(e=>e.type==='goal').at(-1),age=goal?s.age-goal.age:100;
   sparks.forEach((g,i)=>{const q=clamp(age/1.15),angle=i*2.399;g.position.set((goal?.x||0)*800+Math.cos(angle)*q*(35+i*3),(goal?.y||0)*H+Math.sin(angle)*q*30-q*35);g.rotation=angle+t;g.alpha=s.play.reduced?0:(1-q)*.9;g.scale.set(1-q*.5);});
   // The moving scene becomes a paper-framed still before the earned artwork is revealed.
   seal.clear();if(v.paper){seal.rect(0,0,800,H).fill({color:0xfff7e5,alpha:v.paper*.12});seal.rect(12,12,776,H-24).stroke({color:0xfff9e9,width:24*v.paper,alpha:v.paper});}
  }
  function dispose(){if(disposed)return;disposed=true;root.destroy({children:true});textures.forEach(t=>t.destroy(true));}
  return {install,paint,dispose,root,get hasKite(){return !!kite?.visible;},get hasScene(){return !!scene;}};
 }
 return {grassFile,finishDuration,sample,deform,create};
}));
