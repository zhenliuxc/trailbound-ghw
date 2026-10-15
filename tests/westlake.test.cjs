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
test('Westlake keeps three geographically ordered micro-moment memories alongside the full photo journey',()=>{
 let saved=null;const storage={getItem:()=>saved,setItem:(_,value)=>{saved=value;}},h=harness(storage);h.click('route-westlake');h.click('overlay-action');
 for(let i=0;i<500&&h.$('ending-panel').hidden;i++){h.advance(.6);if(!h.$('story-panel').hidden)h.$('story-choices').querySelector('button').emit('click');else if(!h.$('photo-panel').hidden)h.click('photo-continue');else if(!h.$('observe-button').hidden){const progress=h.$('journey-progress').attributes['aria-valuenow'];h.click('observe-button');assert.equal(h.$('journey-progress').attributes['aria-valuenow'],progress);assert.equal(h.pendingFrames(),1);}}
 assert.equal(h.$('ending-panel').hidden,false);assert.equal(h.$('album-count').textContent,'3 / 3');assert.deepEqual(D.loadMoments(storage).map(m=>D.item(m.id).order),[0,1,2]);assert.ok(D.loadMoments(storage).every(m=>m.route==='westlake'&&m.interaction==='look'));assert.equal(h.pendingFrames(),0);
 const first=h.$('journal-list').children[0].querySelector('button');assert.equal(first.querySelector('span').style.backgroundImage,undefined);assert.equal(h.$('journal-tag-count').textContent,'0枚互动标签');assert.equal(h.$('ending-journal').hidden,true);first.emit('click');assert.match(h.$('journal-page').querySelector('p').textContent,/龙井村/);h.click('route-tiger');assert.equal(h.$('journal-count').textContent,'3个瞬间');
});
test('Westlake portrait and landscape cameras keep every stopped photograph accessible',()=>{
 const J=require('../dist/journey');for(const viewport of [{width:320,height:435},{width:390,height:460},{width:990,height:646}]){const h=harness(undefined,{viewport});h.click('route-westlake');h.click('overlay-action');for(const stop of J.stops(J.create('westlake'))){h.advance(160);if(stop.kind==='choice')h.click('choice-'+stop.choices[0].id);else{assert.equal(h.$('photo-panel').hidden,false);const progress=h.$('journey-progress').attributes['aria-valuenow'];h.advance(8);assert.equal(h.$('journey-progress').attributes['aria-valuenow'],progress);assert.equal(h.pendingFrames(),0);h.click('photo-continue');}}assert.equal(h.$('ending-panel').hidden,false);}
});
