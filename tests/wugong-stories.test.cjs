const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../dist/wugong-stories.js'),N=require('../dist/wugong-games.js'),Mini=require('../dist/mini-games.js'),D=require('../dist/discoveries.js'),X=Mini.enhance(require('../dist/micro-moments.js'));
const make=(id,options)=>X.create(D.item(id),options);
function advance(s,seconds){for(let i=0;i<Math.ceil(seconds*40);i++)s=X.tick(s,.025);return s;}
const act=(s,action)=>X.act(s,{action});
function clouds(s){for(const point of S.cloudSeeds)s=X.act(s,point);return s;}
function meet(){return act(act(make('wugong-wind-hiker'),'advance'),'advance');}

test('only touching the cloud patches reveals the ridge, with one reward after the mist clears',()=>{
 let s=make('meadow-butterfly');s=advance(s,60);assert.equal(s.play.complete,false);
 s=X.act(s,{x:.02,y:.05});assert.equal(s.gates,0);assert.equal(X.outcome(s,D.item(s.id)).earned,false);
 const before=s;s=X.act(s,S.cloudSeeds[0]);assert.equal(before.gates,0);assert.equal(s.gates,1);assert.equal(s.play.complete,false);
 for(let i=0;i<5;i++)s=X.act(s,S.cloudSeeds[0]);assert.equal(s.gates,1,'one cloud clears only once');
 for(const point of S.cloudSeeds.slice(1))s=X.act(s,point);assert.equal(s.gates,3);assert.equal(s.play.complete,false,'let the last cloud finish dispersing');
 s=advance(s,1.1);assert.equal(s.play.complete,true);assert.equal(s.gates,3);assert.equal(s.done,false);assert.equal(X.outcome(s,D.item(s.id)).earned,true);
 s=advance(s,3);assert.equal(s.done,true);assert.equal(s.events.filter(e=>e.type==='complete').length,1);
});

test('a deliberate sweep reaches the visible clouds while idle cursor motion and legacy route actions earn nothing',()=>{
 let s=make('meadow-butterfly');s=X.move(s,S.cloudSeeds[0]);assert.equal(s.gates,0);
 for(const action of ['send','undo','clear'])s=act(s,action);assert.equal(s.gates,0);
 s=X.act(s,{x:.03,y:.47,phase:'press'});s=X.move(s,{x:.97,y:.47});s=X.release(s);assert.equal(s.gates,3);assert.equal(s.pointer,null);assert.equal(s.dragging,false);
 assert.equal(s.events.filter(e=>e.type==='cloud-clear').length,3);assert.equal(advance(s,1.1).play.complete,true);
});

test('a cancelled cloud tap does not clear a cloud, and keyboard selection needs an explicit blow',()=>{
 let s=make('meadow-butterfly');s=X.act(s,{...S.cloudSeeds[0],phase:'press'});s=X.release(s);s=X.act(s,{...S.cloudSeeds[0],phase:'release'});assert.equal(s.gates,0);
 s=X.move(s,{key:true,dx:.08,dy:0});assert.equal(s.gates,0);assert.equal(s.cloudCursor,1);assert.equal(s.keyboard,true);
 s=act(s,'blow');assert.equal(s.gates,1);assert.equal(s.clouds[1].clearedAt,s.age);
});

test('photography requires a usable composition, showing the photograph and saying goodbye',()=>{
 let s=meet();assert.equal(s.stage,'camera');s=X.move(s,{x:.55,y:.47});s=act(s,'shutter');assert.equal(s.capture.ok,true);assert.equal(s.stage,'review');
 const shot={...s.capture};s=advance(s,40);assert.equal(s.play.complete,false);assert.deepEqual(s.capture,shot);
 s=act(s,'advance');assert.equal(s.stage,'reply');s=advance(s,20);assert.equal(s.play.complete,false);
 s=act(s,'advance');assert.equal(s.stage,'farewell');assert.equal(s.play.complete,false);s=advance(s,1.6);assert.equal(s.play.complete,true);assert.equal(s.done,false);
 s=advance(s,3);assert.equal(s.done,true);assert.equal(s.events.filter(e=>e.type==='complete').length,1);
});

test('a cropped-out subject can be retaken and cannot unlock a reward through repeated confirmation',()=>{
 let s=meet();s=X.move(s,{x:.33,y:.50,zoom:1.45});s=act(s,'shutter');assert.equal(s.capture.ok,false);assert.match(s.feedback,/出框|紧|位置/);
 for(let i=0;i<10;i++)s=act(s,'advance');s=advance(s,10);assert.equal(s.stage,'review');assert.equal(X.outcome(s,D.item(s.id)).earned,false);
 s=act(s,'retake');s=X.move(s,{x:.55,y:.47,zoom:1});s=act(s,'shutter');assert.equal(s.capture.ok,true);assert.equal(s.shots,2);assert.equal(s.play.complete,false);
});

test('reduced motion keeps both completion rules and omits an idle or waiting shortcut',()=>{
 let mist=make('meadow-butterfly',{reduced:true});assert.equal(advance(mist,10).play.complete,false);mist=advance(clouds(mist),.2);assert.equal(mist.play.complete,true);assert.equal(mist.gates,3);
 let photo=make('wugong-wind-hiker',{reduced:true});photo=act(act(photo,'advance'),'advance');photo=X.move(photo,{x:.55,y:.47});photo=act(photo,'shutter');assert.equal(advance(photo,30).play.complete,false);photo=act(act(photo,'advance'),'advance');photo=advance(photo,.4);assert.equal(photo.play.complete,true);
});

test('the painted scene and pointer share one map on square phones and wide screens',()=>{
 for(const height of [460,800])for(const game of ['clouds','greet']){
  const aspect=game==='greet'?16/9:1.5,b=S.bounds(height,aspect),world={x:.65,y:.61};
  const point=N.point({story:true,height,aspect},{x:(b.x+b.w*world.x)/800,y:(b.y+b.h*world.y)/height});
  assert.ok(Math.abs(point.x-world.x)<1e-9);assert.ok(Math.abs(point.y-world.y)<1e-9);
 }
});

test('the stone-altar moment now uses the jigsaw and no longer completes by holding a lens',()=>{
 let s=make('meadow-flower');assert.equal(s.game,'puzzle');s=X.move(s,{x:.5,y:.5});s=advance(s,30);assert.equal(s.play.complete,false);assert.equal(X.outcome(s,D.item(s.id)).earned,false);
});
