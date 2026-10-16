// Rule-level coverage only. These tests do not render a browser, GPU, phone or sound.
const test=require('node:test'),assert=require('node:assert/strict');
const A=require('../dist/art-games.js'),Mini=require('../dist/mini-games.js'),D=require('../dist/discoveries.js');
const X=Mini.enhance(require('../dist/micro-moments.js'));
const make=(id,options)=>X.create(D.item(id),options);
const act=(s,action,value)=>X.act(s,{action,value});
function advance(s,seconds){for(let i=0;i<Math.ceil(seconds*40);i++)s=X.tick(s,.025);return s;}
function settled(s){for(let i=0;i<600&&s.match.stage!=='idle'&&!s.play.complete;i++)s=X.tick(s,.025);assert.ok(s.play.complete||s.match.stage==='idle','the board must settle');return s;}
function matchFixture(){
 const s=make('westlake-tea'),types=[0,1,0,2,3,1,0,2,3,1,2,0,3,1,2,3,2,1,0,3,0,3,2,1,0];
 s.match.cells=s.match.cells.map((c,i)=>({...c,type:types[i],from:null}));return s;
}
function swap(s,a,b){s=X.act(s,{...A.cellPoint(a),phase:'release',dragged:false});return X.act(s,{...A.cellPoint(b),phase:'release',dragged:false});}

test('all three artworks keep their IDs and waiting alone earns nothing',()=>{
 for(const id of Object.keys(A.kinds)){let s=make(id);assert.equal(s.game,A.kinds[id]);s=advance(s,45);assert.equal(s.play.complete,false);assert.equal(X.outcome(s,D.item(id)).earned,false);}
});

test('the jigsaw rejects a wrong place and a correct place with the wrong rotation',()=>{
 let s=act(make('meadow-flower'),'choose-piece',1);s=X.act(s,{...A.slotPoint(0),phase:'release'});assert.equal(s.gates,0);
 s=X.act(s,{...A.slotPoint(1),phase:'release'});assert.equal(s.gates,0);assert.match(s.feedback,/转正/);
 s=act(s,'rotate-left');s=X.act(s,{...A.slotPoint(1),phase:'release'});assert.equal(s.gates,1);assert.equal(s.play.complete,false);
});

test('six correctly oriented pieces complete the painting once through the public API',()=>{
 for(const reduced of [false,true]){
  let s=make('meadow-flower',{reduced});
  for(let id=0;id<6;id++){s=act(s,'choose-piece',id);while(s.puzzle.pieces.find(p=>p.id===id).turn!==0)s=act(s,'rotate-right');s=X.act(s,{...A.slotPoint(id),phase:'release'});}
  assert.equal(s.play.complete,true);assert.equal(X.outcome(s,D.item(s.id)).earned,true);assert.equal(s.done,false);s=advance(s,3);assert.equal(s.done,true);assert.equal(s.events.filter(e=>e.type==='complete').length,1);
 }
});

test('cancelled jigsaw dragging preserves the selected piece without placing it',()=>{
 let s=make('meadow-flower'),piece=s.puzzle.pieces[0];s=X.act(s,{...A.trayPoint(piece.tray),phase:'press'});s=X.move(s,A.slotPoint(piece.id));assert.ok(s.puzzle.held);s=X.release(s);assert.equal(s.puzzle.held,null);assert.equal(s.gates,0);assert.equal(s.puzzle.selected,piece.id);
});

test('a fresh match board contains no automatic match and has a legal exchange',()=>{
 const s=make('westlake-tea');assert.deepEqual(A.matches(s.match.cells),[]);assert.ok(A.legalMove(s.match.cells));
 const moved=A.key(s,'ArrowRight');assert.equal(moved.match.selected,null);assert.equal(moved.cursor,1);assert.equal(moved.play.progress,0);
});

test('invalid exchanges return to their places and never clear dew',()=>{
 let s=matchFixture();const before=s.match.cells.map(c=>c.id);s=swap(s,3,4);assert.equal(s.match.swap.valid,false);s=settled(s);assert.deepEqual(s.match.cells.map(c=>c.id),before);assert.deepEqual(s.match.remaining,A.stamps);assert.equal(s.match.moves,0);
});

test('only matched dew positions clear; dropping and refilling finish before the next move',()=>{
 let s=swap(matchFixture(),1,6);assert.equal(s.match.swap.valid,true);s=advance(s,.31);assert.equal(s.match.stage,'pop');assert.deepEqual(s.match.poppedDews,[0,2]);assert.equal(s.play.progress,2/6);
 const blocked=act(s,'shuffle');assert.deepEqual(blocked.match.cells,s.match.cells);s=settled(s);assert.ok(s.match.cells.every(c=>c&&Number.isInteger(c.type)));assert.equal(s.match.cells.length,25);
});

test('undo restores the settled move and shuffle preserves cleared dew',()=>{
 let s=matchFixture(),before=s.match.cells.map(c=>c.type);s=settled(swap(s,1,6));assert.equal(s.play.complete,false);s=act(s,'undo');assert.deepEqual(s.match.cells.map(c=>c.type),before);assert.deepEqual(s.match.remaining,A.stamps);assert.equal(s.play.progress,0);
 s=advance(swap(s,1,6),.31);const remaining=s.match.remaining.slice();s=settled(s);const after=s.match.remaining.slice();s=act(s,'shuffle');assert.deepEqual(s.match.remaining,after);assert.ok(after.length<=remaining.length);assert.deepEqual(A.matches(s.match.cells),[]);assert.ok(A.legalMove(s.match.cells));
});

test('a drag swaps only its origin with an adjacent destination and cancel changes no cards',()=>{
 let s=matchFixture();const before=s.match.cells.map(c=>c.id);s=X.act(s,{...A.cellPoint(1),phase:'press'});s=X.release(s);s=X.act(s,{...A.cellPoint(6),phase:'release',dragged:true});assert.deepEqual(s.match.cells.map(c=>c.id),before);assert.equal(s.match.stage,'idle');
 s=matchFixture();s=X.act(s,{...A.cellPoint(1),phase:'press'});s=X.move(s,A.cellPoint(6));s=X.act(s,{...A.cellPoint(6),phase:'release',dragged:true});assert.equal(s.match.swap.valid,true);
});

test('clearing the last dew awards only after the cascade has settled',()=>{
 let s=matchFixture();s.match.remaining=[0,2];s=advance(swap(s,1,6),.31);assert.deepEqual(s.match.remaining,[]);assert.equal(s.play.complete,false);s=settled(s);assert.equal(s.play.complete,true);assert.equal(s.events.filter(e=>e.type==='complete').length,1);
});

test('the initial slingshot needs adjustment; a deliberate arc can reach the label',()=>{
 let s=advance(act(make('bamboo-leaf'),'fire'),5);assert.equal(s.play.complete,false);assert.equal(s.sling.shots,1);
 for(const reduced of [false,true]){s=make('bamboo-leaf',{reduced});s=act(act(s,'angle',40),'power',.60);s=advance(act(s,'fire'),1.8);assert.equal(s.play.complete,true);assert.equal(s.sling.stage,'caught');assert.equal(s.events.filter(e=>e.type==='sling-catch').length,1);}
});

test('slingshot cancellation never fires, including cancelled keyboard charging',()=>{
 let s=make('bamboo-leaf');s=A.key(s,' ');s=advance(s,.6);assert.ok(s.sling.power>.20);s=X.release(s);s=A.key(s,' ','up');assert.equal(s.sling.shots,0);assert.equal(s.sling.stage,'ready');
 s=X.act(s,{...A.slingOrigin,phase:'press'});s=X.move(s,{x:.08,y:.8});s=X.release(s);s=X.act(s,{x:.08,y:.8,phase:'release',dragged:true});assert.equal(s.sling.shots,0);
});

test('swept collision stops a fast paper leaf at visible bamboo before a farther label',()=>{
 let s=make('bamboo-leaf');s.sling.stage='flight';s.sling.shot={x:.4,y:.27,vx:50,vy:24,spin:0};s=X.tick(s,1/120);assert.equal(s.sling.stage,'miss');assert.equal(s.play.complete,false);assert.ok(s.sling.shot.vx<0);assert.equal(s.events.at(-1).type,'sling-hit');
 const hit=s.sling.shot.x;s=X.tick(s,.1);assert.ok(s.sling.shot.x<hit,'paper visibly rebounds after impact');
});

test('a fast hit on the paper label is caught once, and leaving it incomplete earns nothing',()=>{
 let s=make('bamboo-leaf');s.sling.stage='flight';s.sling.shot={x:A.target.x-.06,y:A.target.y+A.target.h/2,vx:100,vy:0,spin:0};s=X.tick(s,1/120);assert.equal(s.play.complete,true);s=advance(s,4);assert.equal(s.events.filter(e=>e.type==='complete').length,1);
 assert.equal(X.outcome(X.release(make('bamboo-leaf')),D.item('bamboo-leaf')).earned,false);
});

test('square and wide hosts map painted locations back to the same logical game points',()=>{
 for(const height of [460,800,960]){const b=A.bounds(height),world={x:.83,y:.54},point=Mini.point({art:true,height},{x:(b.x+b.w*world.x)/800,y:(b.y+b.h*world.y)/height});assert.ok(Math.abs(point.x-world.x)<1e-9);assert.ok(Math.abs(point.y-world.y)<1e-9);}
});
