const test=require('node:test'),assert=require('node:assert/strict'),J=require('../dist/journey.js');
function walk(id,chooseFirst=true){let s=J.start(J.create(id));for(let i=0;i<20000&&!['finished','retreated'].includes(s.status);i++){if(s.status==='encounter')s=s.pending.kind==='photo'?J.continuePhoto(s):J.choose(s,s.pending.choices[chooseFirst?0:1].id);else s=J.tick(s,.1);}return s;}
function departWugong(){return J.choose(J.tick(J.start(J.create('wugong')),.1),'depart');}
for(const id of require('../dist/game.js').ROUTES.map(r=>r.id))test(`${id}: continuous journey can complete with all real postcards`,()=>{const s=walk(id);assert.equal(s.status,'finished');assert.equal(s.visited.length,3);assert.equal(s.progress,1);assert.ok(s.elapsed>=80&&s.elapsed<=170);});
test('photo or story cannot be skipped by a large frame; inactive states freeze',()=>{let s=J.tick(J.start(J.create('wugong')),100);assert.equal(s.pending.id,'wugong-start');assert.equal(s.progress,0);s=J.choose(s,'depart');while(s.status==='walking')s=J.tick(s,100);assert.equal(s.pending.id,'ridge-breeze');assert.equal(s.progress,.14);assert.equal(J.tick(s,100),s);for(const status of ['ready','paused','finished','retreated']){const frozen={...s,status};assert.equal(J.tick(frozen,1),frozen);}});
test('choices change pace, feeling and memories, with a valid early finish',()=>{let s=J.start(J.create('aotai'));while(s.status==='walking')s=J.tick(s,1);s=J.continuePhoto(s);while(s.status==='walking')s=J.tick(s,1);assert.equal(s.pending.id,'snow-wind');const slow=J.choose(s,'protect'),push=J.choose(s,'push');assert.ok(push.warmth<slow.warmth);assert.ok(push.pace>slow.pace);assert.notDeepEqual(push.memories,slow.memories);const returned=walk('aotai',false);assert.equal(returned.status,'retreated');assert.ok(returned.progress<1);assert.match(J.ending(returned).title,/平安/);});
test('invalid choice, repeated choice and locked postcard continuation have no effects',()=>{let s=departWugong();assert.equal(J.continuePhoto(s),s);while(s.status==='walking')s=J.tick(s,1);assert.equal(J.choose(s,'unknown'),s);const chosen=J.choose(s,'slow');assert.equal(J.choose(chosen,'slow'),chosen);assert.equal(chosen.resolved.filter(id=>id==='ridge-breeze').length,1);});
test('journey functions preserve earlier states and retain the route endpoint',()=>{const s=departWugong(),snapshot=JSON.stringify(s);const next=J.tick(s,.25);assert.equal(JSON.stringify(s),snapshot);assert.ok(next.progress>s.progress);const r=J.routeOf(next);assert.equal(r.geo.line.at(-1)[0],114.173305);});
test('waiting for the mist to lift visibly changes the weather instead of only changing copy',()=>{let s=departWugong();while(!(s.status==='encounter'&&s.pending.id==='mist')){if(s.status==='encounter')s=s.pending.kind==='photo'?J.continuePhoto(s):J.choose(s,s.pending.choices[0].id);else s=J.tick(s,1);}assert.equal(J.weather(s),'fog');s=J.choose(s,'wait');assert.equal(J.weather(s),'clear');assert.equal(s.status,'walking');});

test('Wugong departure happens once at Zhong-an without granting a postcard',()=>{
 const arrival=J.tick(J.start(J.create('wugong')),.1);
 assert.equal(arrival.pending.id,'wugong-start');
 assert.equal(arrival.progress,0);
 assert.deepEqual(arrival.visited,[]);
 const departure=J.choose(arrival,'depart');
 assert.equal(departure.status,'walking');
 assert.equal(departure.energy,90);
 assert.deepEqual(departure.resolved,['wugong-start']);
 assert.equal(J.choose(departure,'depart'),departure);
});

test('Wugong summit event precedes the final photograph and journey completion',()=>{
 let s=departWugong();
 for(let step=0;step<2000&&s.pending?.id!=='wugong-end';step++){
  s=s.status==='encounter'?(s.pending.kind==='photo'?J.continuePhoto(s):J.choose(s,s.pending.choices[0].id)):J.tick(s,1);
 }
 assert.equal(s.pending.id,'wugong-end');
 assert.equal(s.status,'encounter');
 assert.equal(s.progress,1);
 assert.deepEqual(s.visited,['wugong-meadow','wugong-clouds']);
 s=J.choose(s,'summit-view');
 assert.equal(s.status,'walking');
 s=J.tick(s,.1);
 assert.equal(s.pending.id,'wugong-golden');
 assert.equal(s.pending.kind,'photo');
 assert.equal(s.status,'encounter');
 s=J.continuePhoto(s);
 assert.equal(s.status,'finished');
 assert.deepEqual(s.visited,['wugong-meadow','wugong-clouds','wugong-golden']);
 assert.equal(s.resolved.filter(id=>id==='wugong-end').length,1);
 assert.equal(J.continuePhoto(s),s);
});
