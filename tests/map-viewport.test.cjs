const test=require('node:test'),assert=require('node:assert/strict'),{mapViewport}=require('../dist/runtime.js'),M=require('../dist/motion.js');
test('wide desktop overview fills the container with the same uniform SVG/GPU transform',()=>{
 for(const [width,height]of [[1203,540],[1804,648],[2416,860],[2820,860],[1804,480]]){
  const view=mapViewport(width,height,true),a=M.viewport(width,height,view,true),b=M.viewport(width,height,view,false);
  assert.ok(Math.abs(a.scale-b.scale)<1e-9);assert.ok(Math.abs(a.x-b.x)<1e-9);assert.ok(Math.abs(a.y-b.y)<1e-9);
  assert.ok(view.y>=0&&view.y+view.h<=600);assert.equal(view.w,720);
  assert.ok(Math.abs((view.y+view.h/2)*a.scale+a.y-height/2)<1e-9);
 }
});
test('phone and invalid sizes retain the established overview without changing gameplay',()=>{
 const old={x:0,y:0,w:720,h:600};
 assert.deepEqual(mapViewport(390,460,false),old);assert.deepEqual(mapViewport(844,500,false),old);
 assert.deepEqual(mapViewport(0,0,true),old);assert.deepEqual(mapViewport(NaN,400,true),old);
});
