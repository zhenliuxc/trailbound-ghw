const test=require('node:test'),assert=require('node:assert/strict'),K=require('../dist/nature'),D=require('../dist/discoveries'),G=require('../dist/game'),S=require('../dist/scenery'),{harness}=require('./dom-harness.cjs');
test('all nine checkpoint facts and journal topics belong to their own place and carry source links',()=>{
 for(const route of G.ROUTES){for(const cp of route.checkpoints){const note=K.checkpoint(cp.id);assert.equal(note.route,route.id);assert.ok(note.look&&note.fact);assert.match(K.source(note.source).url,/^https:\/\//);}
 for(const entry of D.CATALOG.filter(e=>e.route===route.id)){assert.ok(route.checkpoints.some(c=>c.id===entry.checkpointId));const note=K.observation(entry.id);assert.equal(note.route,route.id);assert.equal(note.checkpointId,entry.checkpointId);assert.match(K.source(note.source).url,/^https:\/\//);}}
 assert.equal(K.checkpoint('unknown'),null);assert.equal(K.observation('unknown'),null);
});
test('three regional compositions remain finite and preserve the original reference geography',()=>{
 const styles=[];for(const id of ['wugong','tiger','aotai']){const route=G.getRoute(id),before=JSON.stringify(route.geo),plan=S.build(route,[[85,240,1700],[220,320,2500],[420,280,3100],[635,390,3500]],{features:[{kind:'water',line:[[100,430],[360,370],[640,150]]}],peaks:[{x:520,y:150}]});styles.push(plan.localStyle);assert.ok(!/NaN|Infinity/.test(S.svg(plan)));assert.equal(JSON.stringify(route.geo),before);}
 assert.equal(new Set(styles).size,3);
});
test('remembering a local topic shows a real regional photo and learning note while walking continues',()=>{
 for(const id of ['wugong','tiger','aotai']){const h=harness();h.click('route-'+id);h.click('overlay-action');h.advance(11);const progress=h.$('journey-progress').attributes['aria-valuenow'];h.click('observe-button');assert.equal(h.$('journey-progress').attributes['aria-valuenow'],progress);assert.equal(h.pendingFrames(),1);assert.equal(h.$('learning-note').hidden,false);const card=h.$('journal-list').children.find(n=>n.classes.has('found'));assert.equal(card.attributes['data-route'],id);assert.match(card.querySelector('img').attributes.src,/^photos\//);assert.match(h.$('learning-note-source').attributes.href,/^https:\/\//);}
});
test('checkpoint knowledge changes with the actual photograph and never advances photo dwell time',()=>{
 for(const route of G.ROUTES){const h=harness();h.click('route-'+route.id);h.click('overlay-action');for(const cp of route.checkpoints){h.toPhoto();assert.equal(h.$('photo-nature-title').textContent,K.checkpoint(cp.id).title);assert.equal(h.$('photo-nature').hidden,false);const progress=h.$('journey-progress').attributes['aria-valuenow'];h.advance(7);assert.equal(h.$('journey-progress').attributes['aria-valuenow'],progress);assert.equal(h.pendingFrames(),0);h.click('photo-continue');}}
});
test('legacy journal IDs keep saved topics, with local photos available after a fresh page load',()=>{
 const storage={getItem:()=>JSON.stringify({version:1,found:['meadow-bird','snow-lichen']}),setItem(){}};const h=harness(storage);assert.equal(h.$('journal-count').textContent,'2 / 9');const cards=h.$('journal-list').children.filter(n=>n.classes.has('found'));assert.deepEqual(cards.map(n=>n.attributes['data-route']),['wugong','aotai']);assert.ok(cards.every(n=>n.querySelector('img')));assert.equal(K.observation('snow-lichen').source,'lichen');
});
