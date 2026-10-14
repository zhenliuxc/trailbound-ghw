const test=require('node:test'),assert=require('node:assert/strict'),P=require('pixi.js'),S=require('../dist/scenery'),R=require('../dist/pixi-scene'),G=require('../dist/game');
const points=[[85,230],[190,360],[330,310],[490,390],[635,290]];
for(const id of require('../dist/game.js').ROUTES.map(r=>r.id))test(`${id}: every illustrated layer compiles with the installed PixiJS version`,()=>{const route=G.getRoute(id),snapshot=JSON.stringify(route.geo.line),plan=S.build(route,points);for(const features of Object.values(plan.layers)){const graphics=R.geometry(P,features);assert.equal(graphics.context.instructions.length>0,features.length>0,'each nonempty layer produces drawing instructions');const bounds=graphics.context.bounds;assert.ok([bounds.minX,bounds.minY,bounds.maxX,bounds.maxY].every(Number.isFinite));graphics.destroy({context:true});}assert.equal(JSON.stringify(route.geo.line),snapshot);assert.equal(P.VERSION,'8.22.0');assert.ok(plan.layers.clouds.length>0);assert.match(S.svg(plan),/<svg/);});
test('GPU initialization failure returns to the vector fallback without propagating an exception',async()=>{let fallback=0;const P={Application:class{async init(){throw Error('WebGL unavailable');}destroy(){}}},host={getBoundingClientRect:()=>({width:390,height:460})};const renderer=await R.create(P,host,{onFallback:()=>fallback++});assert.equal(renderer,null);assert.equal(fallback,1);});
test('missing graphics library leaves the existing browser journey available',async()=>{assert.equal(await R.create(null,{}),null);});
function rendererFixture(width=390,height=460){
 const instances=[],colors=[],blurs=[];
 class FakeFilter{constructor(options){this.options=options;this.destroyed=false;}destroy(){this.destroyed=true;}reset(){}saturate(){}brightness(){}}
 class Color extends FakeFilter{constructor(options){super(options);colors.push(this);}}
 class Blur extends FakeFilter{constructor(options){super(options);blurs.push(this);}}
 class App{constructor(){this.stage=new P.Container();this.listeners={};this.canvas={setAttribute(){},addEventListener:(type,fn)=>this.listeners[type]=fn};this.resizes=[];this.renderer={resize:(w,h,d)=>this.resizes.push([w,h,d])};instances.push(this);}async init(options){this.options=options;}render(){this.renders=(this.renders||0)+1;}destroy(){this.destroyed=true;this.stage.destroy({children:true});}}
 let size={width,height},dpr=3,fallback=0;const adapter={...P,Application:App,ColorMatrixFilter:Color,BlurFilter:Blur},host={getBoundingClientRect:()=>size,appendChild(){}};
 return {instances,colors,blurs,adapter,host,pixelRatio:()=>dpr,onFallback:()=>fallback++,setDpr(value){dpr=value;},setSize(width,height){size={width,height};},get fallback(){return fallback;}};
}
test('renderer preserves HD filter quality and rebuilds fog resources when changing maps',async()=>{
 const f=rendererFixture(),{instances,colors,blurs}=f;
 const renderer=await R.create(f.adapter,f.host,{pixelRatio:f.pixelRatio,onFallback:f.onFallback});assert.ok(renderer?.alive);assert.equal(instances[0].options.resolution,3);
 renderer.setPlan(S.build(G.getRoute('wugong'),points));renderer.draw({view:{x:0,y:0,w:720,h:600},elapsed:1,weather:'fog'});assert.equal(colors[0].options.resolution,'inherit');assert.equal(colors[0].options.antialias,'inherit');assert.equal(instances[0].resizes.at(-1)[2],3);
 renderer.setPlan(S.build(G.getRoute('aotai'),points));assert.equal(colors[0].destroyed,true);assert.ok(blurs.slice(0,6).every(v=>v.destroyed));f.setDpr(2);renderer.draw({view:{x:0,y:0,w:720,h:600},elapsed:3,weather:'snow'});assert.equal(instances[0].resizes.at(-1)[2],2);assert.equal(f.fallback,0);instances[0].listeners.webglcontextlost({preventDefault(){}});assert.equal(renderer.alive,false);assert.equal(f.fallback,1);assert.equal(instances[0].destroyed,true);
});
test('actual Pixi filter bounds cover the whole viewport during overview, following and camera transitions',async()=>{
 const f=rendererFixture(),renderer=await R.create(f.adapter,f.host,{pixelRatio:f.pixelRatio,onFallback:f.onFallback});
 renderer.setPlan(S.build(G.getRoute('wugong'),points));
 const views=[{x:0,y:0,w:720,h:600},{x:240,y:140,w:470,h:400},{x:105,y:56,w:605,h:510}];
 for(const [width,height]of [[320,435],[390,460],[990,646],[1280,460]])for(const overview of [true,false])for(const view of views){
  f.setSize(width,height);renderer.draw({view,overview});
  const camera=f.instances[0].stage.children[0],world=camera.children[0],bounds=new P.Bounds();
  // Exercise PixiJS 8.22's real local-to-world clipping logic, without creating a GPU context.
  const transform=new P.Matrix(camera.scale.x,0,0,camera.scale.y,camera.position.x,camera.position.y);
  P.FilterSystem.prototype._calculateFilterArea.call({}, {filterEffect:{filterArea:world.filterArea},container:{worldTransform:transform,parentRenderGroup:{cacheToLocalTransform:null}}},bounds);
  assert.ok(bounds.minX<=0&&bounds.minY<=0,`background starts outside the visible screen: ${width}x${height}`);
  assert.ok(bounds.maxX>=width&&bounds.maxY>=height,`background covers every visible route pixel: ${width}x${height}`);
  assert.ok(bounds.width<=width+5&&bounds.height<=height+5,'filter allocation remains bounded to the visible viewport');
 }
 assert.equal(f.fallback,0);renderer.destroy();
});
