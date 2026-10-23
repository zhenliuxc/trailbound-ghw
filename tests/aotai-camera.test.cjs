const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const code = buildSync({ stdin:{contents:'export * from "./src/aotai-walk/camera";export * from "./src/aotai-walk/geography";export * from "./src/aotai-walk/labels";',resolveDir:process.cwd()}, bundle:true, write:false, format:'cjs' }).outputFiles[0].text;
const box={exports:{}}; vm.runInThisContext(`(function(module,exports){${code}\n})`)(box,box.exports);
const { overviewCamera, layoutMapLabels, PLACES, path }=box.exports;
const sizes=[[368,340],[664,395],[1390,532],[1214,520]];
test('the connected mountain and valley bounds occupy the overview without extreme vertical stretching',()=>{
  for(const [width,height] of sizes){
    const c=overviewCamera(width,height),top=height/2+(250-c.center.y)*c.scaleY,bottom=height/2+(2450-c.center.y)*c.scaleY;
    assert.ok(Math.min(height,bottom)-Math.max(0,top)>=height*.6);
    assert.ok(c.scaleY/c.scaleX<=2.2);
  }
});
test('all walking places, the summit return and the transport exit remain in the overview',()=>{
  for(const [width,height] of sizes){
    const c=overviewCamera(width,height);
    for(const p of Object.values(PLACES)){
      const px=width/2+(p.x-c.center.x)*c.scaleX,py=height/2+(p.y-c.center.y)*c.scaleY;
      assert.ok(px>=26&&px<=width-26,`${p.name}: x ${px}`);assert.ok(py>=60&&py<=height-35,`${p.name}: y ${py}`);
    }
  }
});
test('map labels avoid the view controls and stay beside their terrain points',()=>{
  for(const [width,height] of sizes){
    const c=overviewCamera(width,height),items=path.stations.map((s,i)=>{
      const p=PLACES[s.id];return{id:String(i),x:width/2+(p.x-c.center.x)*c.scaleX,y:height/2+(p.y-c.center.y)*c.scaleY-35,width:Math.max(50,p.name.length*11+12),height:80,rank:p.rank};
    });
    const placed=layoutMapLabels(items,width,height);assert.ok(placed.size>=4);
    for(const item of items){const p=placed.get(item.id);if(!p)continue;
      assert.ok(Math.abs(p.y-item.y)<=(item.rank===0?64:36));assert.equal(p.x,item.x);
      const right=p.x+item.width/2,left=p.x-item.width/2,top=p.y-item.height/2,bottom=p.y+item.height/2;
      assert.ok(left>=8&&right<=width-8&&top>=12&&bottom<=height-9);
      assert.ok(right<=width-161||left>=width+1||bottom<=2||top>=78);
    }
  }
});
