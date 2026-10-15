const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../dist/wugong-stories.js'),N=require('../dist/wugong-games.js'),Mini=require('../dist/mini-games.js'),D=require('../dist/discoveries.js'),X=Mini.enhance(require('../dist/micro-moments.js'));
const make=(id,options)=>X.create(D.item(id),options);
function advance(s,seconds){for(let i=0;i<Math.ceil(seconds*40);i++)s=X.tick(s,.025);return s;}
const act=(s,action)=>X.act(s,{action});
function connect(s,path){for(const i of path)s=X.release(X.act(s,S.nodes[i]));return s;}
function meet(){return act(act(make('wugong-wind-hiker'),'advance'),'advance');}

test('clouds need a connected valley route and an explicit send; idling never earns the painting',()=>{
 let s=make('meadow-butterfly');s=advance(s,60);assert.equal(s.play.complete,false);
 s=connect(s,[1,3,5,7]);assert.deepEqual(s.path,[0,1,3,5,7]);s=advance(s,30);assert.equal(s.play.complete,false);
 const planned=s;s=act(s,'send');assert.equal(planned.flight,null);assert.equal(s.play.complete,false);assert.equal(X.act(s,S.nodes[2]),s,'the route cannot change while wind is travelling');
 s=advance(s,5);assert.equal(s.play.complete,true);assert.equal(s.done,false);assert.equal(X.outcome(s,D.item(s.id)).earned,true);
 s=advance(s,3);assert.equal(s.done,true);assert.equal(s.events.filter(e=>e.type==='complete').length,1);
});

test('ridge, hollow and unfinished routes give distinct feedback and remain editable',()=>{
 for(const [path,message]of [[[2],/高脊/],[[1,8],/洼地/],[[1,3],/半路/]]){
  let s=connect(make('meadow-butterfly'),path);const original=s.path.slice();s=advance(act(s,'send'),5);
  assert.equal(s.play.complete,false);assert.equal(s.flight,null);assert.match(s.feedback,message);assert.deepEqual(s.path,original);assert.equal(X.outcome(s,D.item(s.id)).earned,false);
  s=act(s,'undo');assert.equal(s.path.length,original.length-1);s=act(s,'clear');assert.deepEqual(s.path,[0]);
 }
});

test('keyboard cursor movement alone selects no wind points, and cancel clears the drag origin',()=>{
 let s=make('meadow-butterfly');s=X.move(s,{...S.nodes[1],key:true});assert.deepEqual(s.path,[0]);s=X.act(s,{assist:true});assert.deepEqual(s.path,[0,1]);
 s=X.move(s,S.nodes[3]);assert.ok(s.pointer);s=X.release(s);assert.equal(s.pointer,null);assert.equal(s.dragging,false);
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
 let clouds=connect(make('meadow-butterfly',{reduced:true}),[1,3,5,7]);assert.equal(advance(clouds,10).play.complete,false);clouds=advance(act(clouds,'send'),2);assert.equal(clouds.play.complete,true);
 let photo=make('wugong-wind-hiker',{reduced:true});photo=act(act(photo,'advance'),'advance');photo=X.move(photo,{x:.55,y:.47});photo=act(photo,'shutter');assert.equal(advance(photo,30).play.complete,false);photo=act(act(photo,'advance'),'advance');photo=advance(photo,.4);assert.equal(photo.play.complete,true);
});

test('the painted scene and pointer share one map on square phones and wide screens',()=>{
 for(const height of [460,800])for(const game of ['clouds','greet']){
  const aspect=game==='greet'?16/9:1.5,b=S.bounds(height,aspect),world={x:.65,y:.61};
  const point=N.point({story:true,height,aspect},{x:(b.x+b.w*world.x)/800,y:(b.y+b.h*world.y)/height});
  assert.ok(Math.abs(point.x-world.x)<1e-9);assert.ok(Math.abs(point.y-world.y)<1e-9);
 }
});

test('existing altar detail inspection is still completable through the same public API',()=>{
 let s=make('meadow-flower');for(let i=0;i<3;i++){s=X.move(s,N.target(s));s=advance(s,2.5);}assert.equal(s.play.complete,true);assert.equal(X.outcome(s,D.item(s.id)).earned,true);
});
