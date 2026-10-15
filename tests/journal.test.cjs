const test=require('node:test'),assert=require('node:assert/strict'),D=require('../dist/discoveries'),J=require('../dist/journey'),{harness}=require('./dom-harness.cjs');
const storage=()=>{const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};};
test('moments preserve the capture context and repeated trips keep separate memories of the same scene',()=>{
 const trip=D.create('wugong',42),id=trip.slots[0].id,state={routeId:'wugong',status:'walking',progress:trip.slots[0].at,elapsed:9},captured=D.capture(state,trip,id);
 const first=D.moment(state,captured,id,{weather:'clear',now:1000}),second=D.moment({...state,elapsed:12},captured,id,{weather:'wind',now:2000});
 state.elapsed=80;assert.equal(first.elapsed,9);assert.equal(first.route,'wugong');assert.match(first.place,/武功山/);assert.match(first.title,/草甸/);assert.equal(D.hasTag(first),false);assert.notEqual(first.key,second.key);
 const s=storage();assert.equal(D.saveMoments(s,[first,second]),true);const saved=D.loadMoments(s);assert.equal(saved.length,2);assert.deepEqual(saved.map(m=>m.weather),['clear','wind']);assert.deepEqual(saved.map(m=>m.createdAt),[1000,2000]);
});
test('old notebooks retain their entries without fabricated dates, weather or animal encounters',()=>{
 const s=storage();s.setItem(D.KEY,JSON.stringify({version:1,found:['meadow-bird','snow-lichen','unknown','meadow-bird']}));
 const old=D.loadMoments(s);assert.equal(old.length,2);assert.ok(old.every(m=>m.legacy&&m.createdAt===null&&m.weather===null&&m.progress===null));assert.ok(old.every(m=>m.title==='从旧手帐带来的一页'));
 D.saveMoments(s,old);assert.deepEqual(D.loadMoments(s),old);assert.deepEqual(D.load(s),['meadow-bird','snow-lichen']);
});
test('journal rejects unknown or mismatched routes, bounds retained history and survives denied storage',()=>{
 const trip=D.create('tiger',42),id=trip.slots[0].id,state={status:'walking',progress:trip.slots[0].at,elapsed:8},captured=D.capture(state,trip,id),m=D.moment(state,captured,id,{weather:'clear',now:1000});
 assert.equal(D.moment(state,trip,id),null);const values=[m,{...m,key:'wrong',route:'aotai'},{...m,key:'unknown',id:'unknown'},m];assert.deepEqual(D.cleanMoments(values),[m]);
 assert.equal(D.cleanMoments(Array.from({length:150},(_,i)=>({...m,key:'trip-'+i}))).length,Math.min(150,D.MAX_MOMENTS));
 const denied={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};assert.deepEqual(D.loadMoments(denied),[]);assert.equal(D.saveMoments(denied,[m]),false);
});
test('photo checkpoints do not create journal entries; completing a moment does, and replay does not add another page',()=>{
 const s=storage(),h=harness(s);assert.equal(h.$('journal-list').children.length,1);assert.ok(h.$('journal-list').children[0].classes.has('journal-empty'));
 h.click('overlay-action');h.toPhoto();assert.equal(h.$('journal-count').textContent,'0个瞬间');assert.equal(D.loadMoments(s).length,0);
 h.click('route-wugong');h.click('overlay-action');h.advance(9);h.collectMoment();assert.equal(h.$('journal-count').textContent,'1个瞬间');const first=D.loadMoments(s)[0];assert.equal(first.route,'wugong');assert.equal(first.weather,'clear');assert.ok(first.elapsed>0);h.$('journal-list').children[0].querySelector('button').emit('click');assert.ok(h.$('journal-detail-page').querySelector('time'));h.click('journal-detail-close');assert.match(h.$('journal-list').children[0].querySelector('img').getAttribute('src'),/^badges\//);
 h.click('route-wugong');h.click('overlay-action');h.advance(9);h.collectMoment();assert.equal(h.$('journal-count').textContent,'1个瞬间');assert.equal(D.loadMoments(s).length,1);assert.equal(h.pendingFrames(),1);
 const reloaded=harness(s);assert.equal(reloaded.$('journal-count').textContent,'1个瞬间');assert.equal(reloaded.$('trip-count').textContent,'本次记下0个瞬间');
});
test('Qinling sunshine appears after the snow clears, and all moments belong to their route landscapes',()=>{
 for(const seed of [1,42,100,123456]){const trip=D.create('aotai',seed),sun=trip.slots.find(s=>s.id==='snow-light');assert.equal(J.weather({...J.create('aotai'),progress:sun.at}),'clear');}
 for(const route of ['wugong','tiger','aotai'])for(const slot of D.create(route,42).slots){const entry=D.item(slot.id);assert.equal(entry.route,route);assert.equal(entry.checkpointId,undefined);assert.ok(!entry.icon.startsWith('place:'));assert.ok(entry.memory&&entry.place);}
});
