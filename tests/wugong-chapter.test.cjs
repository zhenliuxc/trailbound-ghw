const test=require('node:test'),assert=require('node:assert/strict');
const J=require('../dist/journal.js'),D=require('../dist/discoveries.js'),Mini=require('../dist/mini-games.js'),A=require('../dist/art-games.js'),S=require('../dist/wugong-stories.js'),{harness}=require('./dom-harness.cjs');
const {fly}=require('./wugong-ui-helpers.cjs');
function pointer(h,p,phase='tap'){
 const host=h.$('micro-surface'),rect=host.getBoundingClientRect();let point=p;
 if(h.$('micro-panel').getAttribute('data-game')==='puzzle'){const b=A.bounds(Math.round(800*rect.height/rect.width));point={x:(b.x+p.x*b.w)/800,y:(b.y+p.y*b.h)/(800*rect.height/rect.width)};}
 else if(['clouds','greet'].includes(h.$('micro-panel').getAttribute('data-game'))){const aspect=h.$('micro-panel').getAttribute('data-game')==='greet'?16/9:1.5,b=S.bounds(800*rect.height/rect.width,aspect);point={x:(b.x+p.x*b.w)/800,y:(b.y+p.y*b.h)/(800*rect.height/rect.width)};}
 const e={pointerId:1,clientX:point.x*rect.width,clientY:point.y*rect.height,button:0,isPrimary:true};host.emit('pointerdown',e);if(phase==='drag')host.emit('pointermove',{...e,clientX:e.clientX+12});host.emit('pointerup',e);
}
async function opened(id,viewport={width:390,height:390}){
 const records={value:null,getItem(){return this.value;},setItem(k,v){this.value=v;}},h=harness(records,{miniGames:true,autoImages:true,artEntry:id,viewport});await h.readyArt();return {h,records};
}

test('all four Wugong encounters preserve complete-only rewards and can be skipped without a journal entry',async()=>{
 for(const id of ['meadow-bird','meadow-butterfly','wugong-wind-hiker','meadow-flower']){const {h,records}=await opened(id);assert.equal(h.$('micro-panel').hidden,false);h.advance(20);h.click('micro-skip');assert.equal(h.$('reward-overlay').hidden,true);assert.equal(D.loadMoments(records).length,0);}
});

test('loaded cloud, photography and jigsaw automatically collect exactly once on portrait and wide hosts',async()=>{
 for(const viewport of [{width:390,height:390},{width:800,height:460}])for(const id of ['meadow-butterfly','wugong-wind-hiker','meadow-flower']){
  const {h,records}=await opened(id,viewport),host=h.$('micro-surface');
  if(id==='meadow-butterfly'){for(const point of S.cloudSeeds)pointer(h,point);assert.equal(h.$('wugong-tools').hidden,true);h.advance(5);}
  else if(id==='wugong-wind-hiker'){h.click('wugong-primary');h.click('wugong-primary');pointer(h,{x:.55,y:.47});h.click('wugong-primary');assert.match(h.$('wugong-primary').textContent,/给她/);h.click('wugong-primary');h.click('wugong-primary');h.advance(5);}
  else{for(let i=0;i<6;i++){host.emit('keydown',{key:String(i+1)});pointer(h,A.slotPoint(i));}h.advance(3);}
  assert.equal(h.$('micro-panel').hidden,true,id);assert.equal(h.$('reward-overlay').hidden,true,id);assert.equal(h.$('reward-continue').hidden,true);h.click('reward-continue');h.click('reward-continue');assert.equal(D.loadMoments(records).filter(m=>m.earned).length,1);
  assert.equal(h.messages.filter(item=>item.message.protocol==='trailbound.art.v1'&&item.message.type==='collected').length,1);
 }
});

test('continuous flight uses the same complete-only collection path after the resource gate',async()=>{
 const {h,records}=await opened('meadow-bird');fly(h);assert.equal(h.$('reward-overlay').hidden,true);assert.equal(h.$('reward-continue').hidden,true);assert.equal(D.loadMoments(records).filter(m=>m.id==='meadow-bird'&&m.earned).length,1);
});

test('the first camera arrow starts at the visible finder rather than stale encounter coordinates',async()=>{
 const {h,records}=await opened('wugong-wind-hiker');h.click('wugong-primary');h.click('wugong-primary');
 h.$('micro-surface').emit('keydown',{key:'ArrowRight'});h.click('wugong-primary');
 assert.match(h.$('wugong-primary').textContent,/给她看看/);
 h.click('wugong-primary');h.click('wugong-primary');h.advance(5);h.click('reward-continue');
 assert.equal(D.loadMoments(records).filter(moment=>moment.id==='wugong-wind-hiker'&&moment.earned).length,1);
});

test('a finished painting is already saved when its display closes',async()=>{
 const {h,records}=await opened('meadow-butterfly');
 for(const point of S.cloudSeeds)pointer(h,point);h.advance(5);
 assert.equal(h.$('reward-overlay').hidden,true);h.key('Escape');
 assert.equal(D.loadMoments(records).length,1);
 assert.equal(h.messages.filter(item=>item.message.protocol==='trailbound.art.v1'&&item.message.type==='collected').length,1);
 assert.ok(h.messages.some(item=>item.message.protocol==='trailbound.art.v1'&&item.message.type==='close'&&item.message.collected===1));
});

test('replaying the current art page keeps the first saved artwork, date and memory',async()=>{
 const {h,records}=await opened('meadow-butterfly');
 for(const point of S.cloudSeeds)pointer(h,point);h.advance(5);h.click('reward-continue');
 const first=D.loadMoments(records)[0];assert.ok(first?.earned);
 const replay=harness(records,{miniGames:true,autoImages:true,artEntry:'meadow-butterfly'});await replay.readyArt();
 for(const point of S.cloudSeeds)pointer(replay,point);replay.advance(5);replay.click('reward-continue');
 assert.deepEqual(D.loadMoments(records),[first]);
});

test('a newly collected memory uses its itinerary place even if the URL supplies a different name',async()=>{
 const records={value:null,getItem(){return this.value;},setItem(k,v){this.value=v;}},h=harness(records,{miniGames:true,autoImages:true,artEntry:'meadow-butterfly',artPlace:'武功山 · 金顶'});await h.readyArt();
 for(const point of S.cloudSeeds)pointer(h,point);h.advance(5);h.click('reward-continue');
 const [saved]=D.loadMoments(records);assert.equal(saved.place,'武功山 · 吊马桩山脊');assert.match(saved.memory,/^武功山 · 吊马桩山脊，/);assert.doesNotMatch(saved.memory,/金顶/);
});

test('wind artwork loading and failure block blind controls, permit retry, and do not leak a reward',async()=>{
 const h=harness(undefined,{miniGames:true,images:true,artEntry:'meadow-bird'});assert.equal(h.$('micro-surface').getAttribute('aria-busy'),'true');pointer(h,{x:.5,y:.67});h.advance(30);assert.equal(h.$('micro-progress').getAttribute('aria-valuenow'),'0');
 for(let i=0;i<40;i++){for(const image of h.photoImages.filter(im=>!im.complete))image.fail();await h.readyArt();}
 assert.match(h.$('wind-cue').textContent,/暂未加载/);assert.equal(h.$('micro-surface').getAttribute('aria-busy'),'false');h.click('mini-retry');assert.match(h.$('wind-cue').textContent,/正在展开/);h.click('micro-skip');assert.equal(h.$('reward-overlay').hidden,true);
});

test('all Wugong memory paintings keep one journal entry when replayed',()=>{
 for(const id of ['meadow-bird','meadow-butterfly','wugong-wind-hiker','meadow-flower']){
  const entry=D.item(id),first={key:'first-'+id,id,route:'wugong',edition:3,earned:true,artVersion:4,tag:entry.tag,title:entry.tag,place:entry.place,memory:'首次留下的文字',createdAt:1,elapsed:1,progress:.5,icon:entry.icon},again={...first,key:'again-'+id,memory:'重玩文字',createdAt:2};
  const saved=J.remember(D.cleanMoments([first]),again);assert.equal(saved.status,'unchanged');assert.equal(saved.moments.length,1);assert.equal(J.page(saved.moments).entries[0].memory,'首次留下的文字');
 }
});

test('cloud loading and failure block clicks, swipes and keyboard blows until artwork is ready',async()=>{
 const records={value:null,getItem(){return this.value;},setItem(k,v){this.value=v;}},h=harness(records,{miniGames:true,images:true,artEntry:'meadow-butterfly'});
 const host=h.$('micro-surface');assert.equal(host.getAttribute('aria-busy'),'true');
 for(const cloud of S.cloudSeeds)pointer(h,cloud);for(let i=0;i<5;i++)host.emit('keydown',{key:'Enter'});h.advance(8);assert.equal(h.$('micro-progress').getAttribute('aria-valuenow'),'0');
 for(let i=0;i<40;i++){for(const image of h.photoImages.filter(im=>!im.complete))image.fail();await h.readyArt();}
 assert.match(h.$('micro-result').textContent,/暂未加载/);host.emit('keydown',{key:' '});assert.equal(h.$('micro-progress').getAttribute('aria-valuenow'),'0');h.click('micro-skip');assert.equal(h.$('reward-overlay').hidden,true);assert.equal(D.loadMoments(records).length,0);
});
