(function(root,factory){const motion=typeof module==='object'&&module.exports?require('./motion.js'):root.TrailMotion;const api=factory(motion);if(typeof module==='object'&&module.exports)module.exports=api;else root.TrailPixiScene=api;}(typeof globalThis!=='undefined'?globalThis:this,function(M){
 'use strict';
 function paint(P,g,f){g.beginPath();if(f.tag==='path')g.path(new P.GraphicsPath(f.d));else if(f.tag==='circle')g.circle(f.cx,f.cy,f.r);else if(f.tag==='ellipse')g.ellipse(f.cx,f.cy,f.rx,f.ry);else if(f.tag==='rect')g.rect(f.x,f.y,f.width,f.height);else throw Error('Unsupported scenery primitive');if(f.fill&&f.fill!=='none')g.fill({color:f.fill,alpha:f.opacity??1});if(f.stroke)g.stroke({color:f.stroke,width:f['stroke-width']||1,alpha:f.opacity??1,cap:'round',join:'round'});return g;}
 function geometry(P,features){const g=new P.Graphics();for(const f of features)paint(P,g,f);return g;}
 async function create(P,host,{onReady=()=>{},onFallback=()=>{},pixelRatio=()=>globalThis.devicePixelRatio||1}={}){
 if(!P?.Application||!host)return null;let app=null,root=null,world=null,color=null,plan=null,clouds=[],mist=[],water=[],lastSize='',lastTone='',alive=true,filters=[];
 function filter(value){filters.push(value);return value;}
 function releaseFilters(){for(const value of filters)try{value.destroy();}catch(_){}filters=[];}
 function fail(){if(!alive)return;alive=false;releaseFilters();onFallback();try{app?.destroy(true,{children:true});}catch(_){}app=null;}
 try{
 app=new P.Application();const rect=host.getBoundingClientRect();await app.init({width:Math.max(1,rect.width),height:Math.max(1,rect.height),backgroundColor:'#dfead6',preference:'webgl',preferWebGLVersion:2,antialias:true,autoDensity:true,resolution:M.resolution(rect.width,rect.height,pixelRatio()),autoStart:false,powerPreference:'low-power'});
 app.canvas.setAttribute('aria-hidden','true');app.canvas.setAttribute('class','pixi-landscape');host.appendChild(app.canvas);app.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fail();});
 root=new P.Container();app.stage.addChild(root);onReady();
 }catch(_){fail();return null;}
 function setPlan(next){if(!alive)return;try{plan=next;releaseFilters();for(const child of root.removeChildren())child.destroy({children:true});world=new P.Container();world.filterArea=new P.Rectangle();root.addChild(world);clouds=[];mist=[];water=[];lastTone='';lastSize='';
 for(const [name,features]of Object.entries(plan.layers)){
 if(name==='clouds'){const groups=new Map();for(const f of features){const key=f.cloud||'cloud';if(!groups.has(key))groups.set(key,[]);groups.get(key).push(f);}for(const [key,shapes]of groups){const g=geometry(P,shapes);world.addChild(g);g.filters=[filter(new P.BlurFilter({strength:1.45,quality:2,resolution:'inherit'}))];clouds.push({g,offset:clouds.length*.8});}}
 else if(name==='mist'){const groups=new Map();for(const f of features){const key=f.mist;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(f);}for(const shapes of groups.values()){const g=geometry(P,shapes);g.filters=[filter(new P.BlurFilter({strength:9,quality:2,resolution:1}))];g.alpha=0;world.addChild(g);mist.push({g});}}
 else if(name==='water'){for(const [i,f]of features.entries()){const g=geometry(P,[f]);world.addChild(g);water.push({g,phase:i*.43});}}
 else world.addChild(geometry(P,features));
 }
 color=filter(new P.ColorMatrixFilter({resolution:'inherit',antialias:'inherit'}));world.filters=[color];
 }catch(_){fail();}}
 function draw(params){if(!alive||!plan)return;try{
 const rect=host.getBoundingClientRect(),width=Math.max(1,rect.width),height=Math.max(1,rect.height),density=M.resolution(width,height,pixelRatio()),size=`${width}:${height}:${density}`;if(size!==lastSize){app.renderer.resize(width,height,density);lastSize=size;}
 const {view,overview=false,progress=0,elapsed=0,weather='clear',reducedMotion=false}=params,matrix=M.viewport(width,height,view,overview);root.scale.set(matrix.scale);root.position.set(matrix.x,matrix.y);
 // Pixi transforms filterArea from the container's local coordinates; invert the camera on every frame.
 const area=world.filterArea,padding=2/matrix.scale;area.x=-matrix.x/matrix.scale-padding;area.y=-matrix.y/matrix.scale-padding;area.width=width/matrix.scale+padding*2;area.height=height/matrix.scale+padding*2;
 const tone=`${weather}:${Math.floor(progress*20)}`;if(tone!==lastTone){lastTone=tone;color.reset();if(weather==='fog'||weather==='blizzard'){color.saturate(-.24,false);color.brightness(.94,true);}else if(progress>.7){const evening=Math.min(1,(progress-.7)/.3);color.matrix=[1+.045*evening,0,0,0,.015*evening,0,1-.012*evening,0,0,.006*evening,0,0,1-.075*evening,0,0,0,0,0,1,0];}else color.brightness(1.035,false);}
 const time=reducedMotion?0:elapsed;
 for(const [i,c]of clouds.entries()){const pose=M.cloud(i,time,reducedMotion);c.g.position.set(pose.x+(view.x-120)*.025,pose.y);c.g.alpha=pose.alpha;}
 for(const [i,c]of mist.entries()){const pose=M.mist(i,time,weather,reducedMotion);c.g.position.set(pose.x,pose.y);c.g.alpha=pose.alpha;}
 for(const w of water){w.g.position.set(Math.sin(time*.9+w.phase)*3,Math.cos(time*.65+w.phase)*1.2);w.g.alpha=.45+Math.sin(time*1.8+w.phase)*.2;}
 app.render();
 }catch(_){fail();}}
 return {setPlan,draw,destroy(){fail();},get alive(){return alive;}};
 }
 return {paint,geometry,create};
}));
