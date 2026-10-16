const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const G=require('../dist/game'),D=require('../dist/discoveries'),S=require('../dist/scenery'),A=require('../dist/audio'),{harness}=require('./dom-harness.cjs'),evidence=require('../docs/westlake-route-evidence.json');
test('Westlake follows original connected Nine Creeks footway and Longjing village-road nodes',()=>{
 const r=G.getRoute('westlake');assert.equal(r.name,'西湖·九溪龙井');assert.equal(r.geo.line.length,154);assert.deepEqual(r.geo.line[0],[120.1082817,30.2049691,null]);assert.deepEqual(r.geo.line.at(-1),[120.1019892,30.220395,null]);assert.deepEqual(r.geo.source.wayIds,[981902545,981902551,981902549,286073376,1415410525,1415410524]);assert.ok(r.geo.distanceKm>2.1&&r.geo.distanceKm<2.3);
 for(let i=1;i<evidence.nodeIds.length;i++){const a=evidence.nodeIds[i-1],b=evidence.nodeIds[i];assert.ok(evidence.ways.some(w=>w.nodeIds.some((n,j)=>j>0&&((n===a&&w.nodeIds[j-1]===b)||(n===b&&w.nodeIds[j-1]===a)))),'every step is a real original OSM edge');}
 assert.ok(r.geo.line.every(p=>p[2]===null));assert.equal(evidence.nodeIds.length,r.geo.line.length);
});
test('Westlake has its own tea landscape, three licensed photos and three original audio scores',()=>{
 const r=G.getRoute('westlake'),plan=S.build(r,[[100,480],[200,310],[350,230],[600,100]]);assert.equal(plan.theme,'tea');assert.equal(plan.localStyle,'westlake-creeks-and-tea-terraces');assert.equal(plan.layers.land.filter(f=>f['data-tea-row']==='true').length,18);
 for(const cp of r.checkpoints){assert.ok(cp.photo.author&&cp.photo.licenseUrl);assert.ok(fs.statSync(require.resolve('../dist/'+cp.photo.file)).size<110000);assert.equal(A.profile(cp.id).route,'westlake');assert.ok(A.score(cp.id).length>=11);}
});
test('Westlake quiet unfinished observations leave no journal entries during the full photo journey',()=>{
 let saved=null;const storage={getItem:()=>saved,setItem:(_,value)=>{saved=value;}},h=harness(storage);h.click('route-westlake');h.click('overlay-action');const seen=new Set();
 for(let i=0;i<500&&h.$('ending-panel').hidden;i++){h.advance(.6);if(!h.$('story-panel').hidden)h.$('story-choices').querySelector('button').emit('click');else if(!h.$('photo-panel').hidden)h.click('photo-continue');else if(!h.$('observe-button').hidden&&!seen.has(h.$('active-discovery').getAttribute('data-discovery'))){seen.add(h.$('active-discovery').getAttribute('data-discovery'));const progress=h.$('journey-progress').attributes['aria-valuenow'];h.click('observe-button');assert.equal(h.$('journey-progress').attributes['aria-valuenow'],progress);assert.equal(h.pendingFrames(),1);}}
 assert.equal(h.$('ending-panel').hidden,false);assert.equal(h.$('album-count').textContent,'3 / 3');assert.deepEqual(D.loadMoments(storage),[]);assert.equal(h.pendingFrames(),0);assert.equal(h.$('ending-journal').hidden,true);assert.equal(h.$('journal-count').textContent,'0个瞬间');h.click('route-tiger');assert.equal(h.$('journal-count').textContent,'0个瞬间');
});
test('Westlake portrait and landscape cameras keep every stopped photograph accessible',()=>{
 const J=require('../dist/journey');for(const viewport of [{width:320,height:435},{width:390,height:460},{width:990,height:646}]){const h=harness(undefined,{viewport});h.click('route-westlake');h.click('overlay-action');for(const stop of J.stops(J.create('westlake'))){h.advance(160);if(stop.kind==='choice')h.click('choice-'+stop.choices[0].id);else{assert.equal(h.$('photo-panel').hidden,false);const progress=h.$('journey-progress').attributes['aria-valuenow'];h.advance(8);assert.equal(h.$('journey-progress').attributes['aria-valuenow'],progress);assert.equal(h.pendingFrames(),0);h.click('photo-continue');}}assert.equal(h.$('ending-panel').hidden,false);}
});
