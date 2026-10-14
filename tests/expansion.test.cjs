const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const G=require('../dist/game'),J=require('../dist/journey'),D=require('../dist/discoveries'),S=require('../dist/scenery'),A=require('../dist/audio'),{harness}=require('./dom-harness.cjs'),{fixture}=require('./audio-fixture.cjs');
const added=['maclehose','changping','mogan'];
test('six named journeys retain distinct landscapes and eighteen distinct local photographs',()=>{
 assert.deepEqual(G.ROUTES.map(r=>r.id),['wugong','tiger','aotai',...added]);assert.equal(new Set(G.ROUTES.map(r=>r.theme)).size,6);
 const photos=G.ROUTES.flatMap(r=>r.checkpoints.map(cp=>cp.photo.file));assert.equal(photos.length,18);assert.equal(new Set(photos).size,18);
 for(const id of added){const r=G.getRoute(id);assert.equal(J.storyOf(id).events.length,2);assert.equal(D.create(id,7).slots.length,3);for(const cp of r.checkpoints)assert.ok(fs.statSync(require.resolve('../dist/'+cp.photo.file)).size<110000);}
});
test('added geography preserves official GPX endpoints and connected OSM node sequences',()=>{
 const evidence=require('../docs/expanded-route-evidence.json'),mac=G.getRoute('maclehose').geo;
 assert.equal(mac.source.type,'Official GPX');assert.equal(mac.rawPointCount,7879);assert.deepEqual(mac.line[0],[114.3731365005,22.37193906,90]);assert.deepEqual(mac.line.at(-1),[114.3318230408,22.4206881086,144]);assert.equal(mac.pointCount,evidence.maclehose.retainedPoints);
 for(const id of ['changping','mogan']){const geo=G.getRoute(id).geo;assert.deepEqual(geo.source.wayIds,evidence[id].wayIds);assert.equal(geo.line.length,evidence[id].nodeIds.length);assert.equal(evidence[id].nodeIds[0],evidence[id].startNode);assert.equal(evidence[id].nodeIds.at(-1),evidence[id].endNode);assert.ok(geo.line.every(p=>p[2]===null),'OSM paths do not invent elevation');}
 assert.ok(evidence.changping.endpointDistanceToMuluoziMeters<30);
 for(const id of added){const geo=G.getRoute(id).geo;for(let i=1;i<geo.line.length;i++)assert.ok(G.meters(geo.line[i-1],geo.line[i])<250,'no unrecorded long connector');}
});
test('all three new routes offer non-animal, non-cloud travel moments with their own places',()=>{
 const icons=new Set();for(const id of added)for(const entry of D.CATALOG.filter(e=>e.route===id)){assert.ok(entry.place&&entry.memory&&entry.hint);assert.ok(!['bird','cloud','sun','goat','eagle'].includes(entry.icon));icons.add(entry.icon);const trip=D.create(id,1),slot=trip.slots.find(x=>x.id===entry.id),state={status:'walking',progress:slot.at,elapsed:50},captured=D.capture(state,trip,entry.id),moment=D.moment(state,captured,entry.id,{weather:'clear',now:1234});assert.equal(moment.place,entry.place);assert.equal(moment.title,entry.name);assert.equal(moment.route,id);}
 assert.equal(icons.size,9);
});
test('new route moments can all be remembered through the walking UI and persist across routes',()=>{
 let saved=null;const storage={getItem:()=>saved,setItem:(_,value)=>{saved=value;}},h=harness(storage);
 for(const id of added){h.click('route-'+id);h.click('overlay-action');for(let i=0;i<500&&h.$('ending-panel').hidden;i++){h.advance(.6);if(!h.$('story-panel').hidden)h.$('story-choices').querySelector('button').emit('click');else if(!h.$('photo-panel').hidden)h.click('photo-continue');else if(!h.$('observe-button').hidden)h.click('observe-button');}
  assert.equal(h.$('ending-panel').hidden,false,id);assert.equal(h.$('trip-count').textContent,'本次记下3个瞬间',id);assert.equal(h.$('album-count').textContent,'3 / 3');assert.equal(h.pendingFrames(),0);
 }
 assert.equal(D.loadMoments(storage).length,9);assert.equal(h.$('journal-count').textContent,'9个瞬间');assert.equal(harness(storage).$('journal-list').children.length,9);
});
test('old and new journal memories keep their correct atlas cells and expand independently',()=>{
 const moments=D.CATALOG.map((entry,i)=>({key:'saved-'+entry.id,id:entry.id,route:entry.route,createdAt:1234+i,progress:entry.at,elapsed:60,weather:'clear'}));const h=harness({getItem:()=>JSON.stringify({version:2,moments}),setItem(){}});
 assert.equal(h.$('journal-list').children.length,18);for(const card of h.$('journal-list').children){const id=card.attributes['data-moment'].slice(6),index=D.CATALOG.findIndex(e=>e.id===id),button=card.querySelector('button'),art=button.querySelector('span');assert.equal(art.style.backgroundImage,`url('badges/${index<9?'moments-v1':'moments-expansion-v1'}.webp')`);assert.equal(art.style.backgroundPosition,`${index%3*50}% ${Math.floor(index%9/3)*50}%`);button.emit('click');assert.equal(h.$('journal-page').querySelector('strong').textContent,D.item(id).name);}
});
test('coastal sea closes on the water side and new scenery preserves its input coordinates',()=>{
 const r=G.getRoute('maclehose'),points=[[100,500],[200,300],[300,100]],context={features:[{kind:'coast',line:Array.from({length:12},(_,i)=>[400,550-i*40])}]},before=JSON.stringify(context),plan=S.build(r,points,context);
 assert.equal(plan.theme,'coast');assert.equal(plan.terrain.sea.length,1);assert.ok(plan.terrain.sea[0].every(p=>p[0]>=400));assert.equal(JSON.stringify(context),before);
 for(const id of added){const r=G.getRoute(id);assert.equal(S.build(r,points).theme,r.theme);}
});
test('new soundscapes include coastal swells and stop every audio node when hidden',async()=>{
 assert.equal(A.selection({routeId:'maclehose'}).ambience.kind,'surf');assert.equal(A.selection({routeId:'changping'}).ambience.kind,'stream');assert.equal(A.selection({routeId:'mogan'}).ambience.kind,'bamboo');
 const f=fixture(),p=A.create({AudioContext:f.AudioContext,timers:f.timers});await p.enable();p.setScene({routeId:'maclehose',mode:'walk'});assert.ok(p.voiceCount>=2);p.hide();assert.equal(p.voiceCount,0);assert.equal(f.contexts[0].state,'suspended');p.destroy();
});
test('browser entrypoint loads extra geography before route creation',()=>{const html=fs.readFileSync(require.resolve('../dist/index.html'),'utf8');assert.ok(html.indexOf('src="geography-extra.js"')<html.indexOf('src="routes.js"'));assert.match(html,/<script defer src="geography-extra.js"/);assert.match(html,/moments-expansion-v1.webp/);});
