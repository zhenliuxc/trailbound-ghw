const test=require('node:test'),assert=require('node:assert/strict');
const D=require('../dist/discoveries.js'),{harness}=require('./dom-harness.cjs');
function memoryStorage(){const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};}
test('each remaining route offers its own three observations',()=>{
 for(const route of ['wugong','tiger','aotai']){const trip=D.create(route,42);assert.equal(trip.slots.length,3);assert.equal(new Set(trip.slots.map(x=>x.id)).size,3);for(const slot of trip.slots){assert.equal(D.item(slot.id).route,route);assert.ok(slot.at>0&&slot.until<1&&slot.until>slot.at);}}
});
test('local topics retain geographic order while seeded replay timing changes',()=>{
 assert.deepEqual(D.create('tiger',42),D.create('tiger',42));const trips=[1,42,8172,123456].map(seed=>D.create('tiger',seed));assert.equal(new Set(trips.map(t=>t.slots.map(x=>x.id).join(','))).size,1);assert.deepEqual(trips[0].slots.map(x=>D.item(x.id).order),[0,1,2]);assert.ok(new Set(trips.map(t=>t.slots[0].at)).size>1);
});
test('discovery is optional, bounded by progress, and never interrupts a story or photo',()=>{
 const trip=D.create('aotai',42),slot=trip.slots[0],s={status:'walking',progress:slot.at};assert.equal(D.visible(s,trip),slot);assert.equal(D.visible({...s,status:'paused'},trip),slot);for(const status of ['ready','encounter','finished','retreated'])assert.equal(D.visible({...s,status},trip),null);assert.equal(D.visible({...s,progress:slot.until+.001},trip),null);assert.equal(trip.found.length,0);
});
test('capture validates the current opportunity and is immutable and idempotent',()=>{
 const trip=D.create('wugong',42),slot=trip.slots[0],s={status:'walking',progress:slot.at};assert.equal(D.capture(s,trip,'unknown'),trip);const next=D.capture(s,trip,slot.id);assert.deepEqual(next.found,[slot.id]);assert.deepEqual(trip.found,[]);assert.equal(D.capture(s,next,slot.id),next);assert.equal(D.capture({...s,status:'encounter'},trip,slot.id),trip);
});
test('journal storage keeps only known unique IDs and survives corrupt or denied storage',()=>{
 const storage=memoryStorage();assert.equal(D.save(storage,['meadow-bird','meadow-bird','unknown',null]),true);assert.deepEqual(D.load(storage),['meadow-bird']);storage.setItem(D.KEY,'not-json');assert.deepEqual(D.load(storage),[]);storage.setItem(D.KEY,JSON.stringify({version:2,found:['meadow-bird']}));assert.deepEqual(D.load(storage),[]);const blocked={getItem(){throw Error('denied');},setItem(){throw Error('denied');}};assert.deepEqual(D.load(blocked),[]);assert.equal(D.save(blocked,['meadow-bird']),false);
});
test('one observation click keeps walking and changes the journal and final memory',()=>{
 const storage=memoryStorage(),h=harness(storage);h.click('route-wugong');h.click('overlay-action');h.advance(9);assert.equal(h.$('observe-button').hidden,false);const id=h.$('active-discovery').attributes['data-discovery'],progress=h.$('journey-progress').attributes['aria-valuenow'];h.click('observe-button');assert.equal(h.pendingFrames(),1);assert.equal(h.$('journey-progress').attributes['aria-valuenow'],progress);assert.equal(h.$('journal-count').textContent,'1个瞬间');assert.equal(h.$('observe-button').hidden,true);assert.deepEqual(D.load(storage),[id]);
 const again=harness(storage);assert.equal(again.$('journal-count').textContent,'1个瞬间');h.click('route-tiger');assert.equal(h.$('trip-count').textContent,'本次记下0个瞬间');assert.equal(h.$('journal-count').textContent,'1个瞬间');assert.equal(h.$('nature-discoveries').children.length,0);
});
test('SVG observation can be collected with the keyboard while paused; animation stays frozen',()=>{
 const h=harness();h.click('route-wugong');h.click('overlay-action');h.advance(9);const marker=h.$('active-discovery'),before=marker.attributes.transform;h.advance(.2);assert.notEqual(marker.attributes.transform,before);h.click('walk-toggle');const stopped=marker.attributes.transform;h.advance(10);assert.equal(marker.attributes.transform,stopped);marker.emit('keydown',{key:'Enter'});assert.equal(h.$('journal-count').textContent,'1个瞬间');assert.equal(h.pendingFrames(),0);assert.equal(h.$('journey-state').textContent,'停下来看看');
});
test('three optional observations appear in the ending; replay resets the trip but retains the journal',()=>{
 const h=harness();h.click('route-wugong');h.click('overlay-action');h.advance(9);h.click('observe-button');h.toPhoto();h.click('photo-continue');h.advance(16);h.click('observe-button');h.toPhoto();h.click('photo-continue');h.advance(20);h.click('choice-wait');h.advance(35);h.click('observe-button');h.toPhoto();h.click('photo-continue');assert.equal(h.$('ending-panel').hidden,false);assert.equal(h.$('ending-memories').children.length,6);assert.equal(h.$('trip-count').textContent,'本次记下3个瞬间');assert.equal(h.$('journal-count').textContent,'3个瞬间');h.click('replay');assert.equal(h.$('trip-count').textContent,'本次记下0个瞬间');assert.equal(h.$('journal-count').textContent,'3个瞬间');assert.equal(h.$('album-count').textContent,'0 / 3');
});
test('missing an observation has no penalty; photos hide the alternative observation button',()=>{
 const h=harness();h.click('route-wugong');h.click('overlay-action');h.toPhoto();assert.equal(h.$('photo-panel').hidden,false);assert.equal(h.$('observe-button').hidden,true);assert.equal(h.$('journal-count').textContent,'0个瞬间');h.click('photo-continue');h.advance(16);assert.equal(h.$('observe-button').hidden,false);assert.equal(h.pendingFrames(),1);
});
test('denied persistence still allows observations and clearly reports session-only storage',()=>{
 const h=harness({getItem(){throw Error('denied');},setItem(){throw Error('denied');}});h.click('route-wugong');h.click('overlay-action');h.advance(9);h.click('observe-button');assert.equal(h.$('journal-count').textContent,'1个瞬间');assert.match(h.$('journal-storage').textContent,/无法保存/);assert.equal(h.pendingFrames(),1);
});
