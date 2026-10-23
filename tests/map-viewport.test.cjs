const test=require('node:test'),assert=require('node:assert/strict'),{mapViewport,mapFollowViewport,mapSymbols,mapMarkerAnchor}=require('../dist/runtime.js'),M=require('../dist/motion.js');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
const sizes=[[1203,540],[1804,648],[2008,882],[2416,860],[2820,860],[1804,480],[3840,1280],[1024,1280]];
test('desktop keeps the whole original illustration and expands the view without stretching',()=>{
 for(const [width,height]of sizes){
  const view=mapViewport(width,height,true),a=M.viewport(width,height,view,true),b=M.viewport(width,height,view,false);
  close(a.scale,b.scale);close(a.x,b.x);close(a.y,b.y);
  assert.ok(view.x<=0&&view.y<=0&&view.x+view.w>=720&&view.y+view.h>=600);
  assert.ok(a.scale<=1.45+1e-8);close(view.w/view.h,width/height);
  close(360*a.scale+a.x,width/2);close(300*a.scale+a.y,height/2);
 }
});
test('phone and invalid sizes retain the established overview without changing gameplay',()=>{
 const old={x:0,y:0,w:720,h:600};
 assert.deepEqual(mapViewport(390,460,false),old);assert.deepEqual(mapViewport(844,500,false),old);
 assert.deepEqual(mapViewport(0,0,true),old);assert.deepEqual(mapViewport(NaN,400,true),old);
});
test('desktop follow camera keeps its aspect and bounds with a restrained scale',()=>{
 for(const [width,height]of sizes){
  const full=mapViewport(width,height,true);
  for(const point of [{x:85,y:85},{x:360,y:300},{x:635,y:515}]){
   const view=mapFollowViewport(width,height,full,point,true),matrix=M.viewport(width,height,view,false);
   close(view.w/view.h,width/height);assert.ok(matrix.scale<=1.6+1e-8);
   assert.ok(view.x>=full.x-1e-8&&view.y>=full.y-1e-8);
   assert.ok(view.x+view.w<=full.x+full.w+1e-8&&view.y+view.h<=full.y+full.h+1e-8);
  }
 }
});
test('hiker, discoveries, labels and touch targets retain screen size while the camera zooms',()=>{
 for(const [width,height]of [...sizes,[390,460],[390,844]]){
  const desktop=width>=1024,full=mapViewport(width,height,desktop),follow=mapFollowViewport(width,height,full,{x:360,y:300},desktop);
  for(const [view,isFull]of [[full,true],[follow,false]]){
   const metrics=mapSymbols(width,height,view,isFull),matrix=M.viewport(width,height,view,isFull);
   close(metrics.scale,matrix.scale);close(metrics.offsetX,matrix.x);close(metrics.offsetY,matrix.y);
   close(metrics.hiker*48*metrics.scale,metrics.hikerPixels);assert.ok(metrics.hikerPixels<=68);
   close(metrics.discovery*48*metrics.scale,metrics.discoveryPixels);
   close(metrics.marker*42*metrics.scale,metrics.markerPixels);
   close(metrics.font*metrics.scale,12);assert.ok(metrics.marker*70*metrics.scale>=44);
  }
 }
});
test('discovery art and caption stay within the actual crop, including a phone slice',()=>{
 for(const [width,height]of [...sizes,[390,460],[390,844],[844,390]]){
  const desktop=width>=1024,full=mapViewport(width,height,desktop),follow=mapFollowViewport(width,height,full,{x:360,y:300},desktop);
  for(const [view,isFull]of [[full,true],[follow,false]])for(const point of [{x:-500,y:-500},{x:360,y:55},{x:2000,y:1500}]){
   const anchor=mapMarkerAnchor(point,width,height,view,isFull),metrics=mapSymbols(width,height,view,isFull),x=anchor.x*metrics.scale+metrics.offsetX,y=anchor.y*metrics.scale+metrics.offsetY;
   assert.ok(x>=48-1e-8&&x<=width-48+1e-8);assert.ok(y>=94-1e-8&&y<=height-72+1e-8);
   assert.ok(y-metrics.discoveryPixels/2>=0);assert.ok(y+metrics.discoveryPixels/48*37+12<=height);
  }
 }
});
