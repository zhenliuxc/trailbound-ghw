const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { buildSync } = require('esbuild');
const code = buildSync({ stdin:{contents:'export * from "./src/aotai-walk/camera";export * from "./src/aotai-walk/geography";export * from "./src/journey/landmark-label";export { LANDMARK_SIZE } from "./src/journey/landmark-symbol";',resolveDir:process.cwd()}, bundle:true, write:false, format:'cjs' }).outputFiles[0].text;
const box={exports:{}}; vm.runInThisContext(`(function(module,exports){${code}\n})`)(box,box.exports);
const { overviewCamera, layoutLandmarkLabels, visibleLandmarkSymbols, LANDMARK_SIZE, PLACES, MAIN_ORDER, CAMP_IDS }=box.exports;
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
const overlaps = (a,b) => a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y;
test('dense overview keeps the photo and overnight names readable without moving terrain anchors',()=>{
  for(const [width,height] of sizes){
    const c=overviewCamera(width,height), ids=['baiqi','taibailiang','baxian','tangkou',...CAMP_IDS,'tangyu'];
    const project=id=>({id,x:width/2+(PLACES[id].x-c.center.x)*c.scaleX,y:height/2+(PLACES[id].y-c.center.y)*c.scaleY});
    const anchors=ids.map(id=>({...project(id),secondary:CAMP_IDS.includes(id)})), before=structuredClone(anchors);
    const diameter=width<460?LANDMARK_SIZE.compact:LANDMARK_SIZE.overview;
    const shown=visibleLandmarkSymbols(anchors,diameter,new Set());
    const symbols=anchors.filter(p=>shown.has(p.id)).map(p=>({x:p.x-diameter/2,y:p.y-diameter/2,width:diameter,height:diameter}));
    for(const [i,rect] of symbols.entries()) for(const other of symbols.slice(0,i)) assert.equal(overlaps(rect,other),false);
    if(width===368){assert.ok(shown.has('baiqi'));assert.equal(shown.has('penjing'),false,'nearby camp keeps its name instead of covering the temple');}
    const labels=anchors.map(p=>({...p,width:Math.min(100,PLACES[p.id].name.length*11),height:p.secondary||p.id==='tangkou'||p.id==='tangyu'?30:18,side:'below',iconRadius:shown.has(p.id)?diameter/2:0}));
    const placed=layoutLandmarkLabels(labels,width,height,diameter/2);
    assert.equal(placed.size,ids.length,`${width}px must keep all checkpoint and overnight names`);
    const reserved=[...symbols,...[...placed.values()].map(p=>p.rect)];
    const minor=MAIN_ORDER.filter(id=>!ids.includes(id)).map(id=>({...project(id),width:PLACES[id].name.length*10,height:15,side:'below'}));
    const names=layoutLandmarkLabels(minor,width,height,0,{reserved});
    const all=[...placed.values(),...names.values()];
    for(const [i,p] of all.entries()){
      assert.ok(Math.abs(p.dx)<=36&&Math.abs(p.dy)<=36);
      assert.ok(p.rect.x>=8&&p.rect.x+p.rect.width<=width-8&&p.rect.y>=8&&p.rect.y+p.rect.height<=height-8);
      assert.equal(overlaps(p.rect,{x:width-166,y:0,width:166,height:78}),false);
      for(const other of all.slice(0,i))assert.equal(overlaps(p.rect,other.rect),false);
    }
    assert.deepEqual(anchors,before);
    const follow=anchors.map(p=>({...p,secondary:false}));
    assert.equal(visibleLandmarkSymbols(follow,LANDMARK_SIZE.follow,shown).size,ids.length,'follow view restores every symbol');
  }
});
test('a nearby camera step preserves each readable label placement',()=>{
  const labels=[{id:'falls',x:180,y:180,width:52,height:18,side:'below'},{id:'inn',x:210,y:220,width:52,height:18,side:'below'}];
  const previous=layoutLandmarkLabels(labels,390,500,12);
  const moved=layoutLandmarkLabels(labels.map(p=>({...p,x:p.x+1,y:p.y+1})),390,500,12,{previous});
  for(const [id,p] of previous){const next=moved.get(id);assert.equal(next.side,p.side);assert.equal(next.dx,p.dx);assert.equal(next.dy,p.dy);assert.equal(next.rect.x,p.rect.x+1);assert.equal(next.rect.y,p.rect.y+1);}
});
test('the compact valley keeps a photo symbol clear while preserving nearby meadow names',()=>{
  const anchors=[{id:'valley',x:174,y:280,secondary:false},{id:'lower',x:190,y:267,secondary:true},{id:'upper',x:224,y:257,secondary:true},{id:'redrock',x:245,y:238,secondary:true}];
  const shown=visibleLandmarkSymbols(anchors,LANDMARK_SIZE.compact,new Set());
  assert.deepEqual([...shown],['valley','upper','redrock']);
  const labels=anchors.map(p=>({...p,width:p.id==='valley'?22:33,height:17,side:'below',iconRadius:shown.has(p.id)?12:0}));
  const names=layoutLandmarkLabels(labels,368,540,12);
  assert.equal(names.size,4,'de-emphasizing a secondary circle must not remove its place name');
  const moved=anchors.map(p=>({...p,x:p.x+.2,y:p.y+.2}));
  assert.deepEqual(visibleLandmarkSymbols(moved,LANDMARK_SIZE.compact,shown),shown);
});
