const test=require('node:test'),assert=require('node:assert/strict'),D=require('../dist/discoveries'),X=require('../dist/micro-moments'),P=require('../dist/moment-play'),G=require('../dist/game'),A=require('../dist/audio'),{fixture}=require('./audio-fixture.cjs'),{harness}=require('./dom-harness.cjs');
const entry=id=>D.item(id),make=id=>X.create(entry(id));
function tick(s,seconds){for(let i=0;i<Math.ceil(seconds/.05);i++)s=X.tick(s,.05);return s;}
function scene(e){const h=harness(),root=h.$('micro-art'),svg=(tag,attrs,p)=>{const n=h.document.createElementNS('',tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);p?.appendChild(n);return n;};return{root,refs:X.draw(svg,root,e)};}
const snapshot=n=>JSON.stringify({tag:n.tagName,attrs:n.attributes,children:n.children.map(c=>JSON.parse(snapshot(c)))});
const count=n=>1+n.children.reduce((sum,c)=>sum+count(c),0);
test('each journey has three genuinely different play types, including every Westlake candidate combination',()=>{
 for(const route of G.ROUTES){const candidates=D.CATALOG.filter(e=>e.route===route.id),groups=[0,1,2].map(i=>new Set(candidates.filter(e=>e.order===i).map(P.type)));for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert.ok(![...groups[i]].some(t=>groups[j].has(t)),route.id);}
 assert.equal(new Set(D.CATALOG.map(P.type)).size,15);
});
test('footprints and a guided leaf require visiting targets in order; an arbitrary swipe cannot finish them',()=>{
 for(const id of ['snow-lichen','westlake-stones','westlake-floating-leaf']){let s=make(id);s=X.move(s,{x:.9,y:.1});assert.equal(s.play.step,0,id);for(let i=0;i<3;i++){const p=P.target(s);s=X.move(s,p);assert.equal(s.play.step,i+1,id);}assert.equal(s.play.complete,true);assert.match(X.outcome(s,entry(id)).memory,id.includes('leaf')?/终于转过/:/山脊|石径/);}
});
test('drawing in sand needs a stroke and a released hand before the tide takes it away',()=>{
 let s=make('coast-shell');for(const p of [{x:.2,y:.6},{x:.4,y:.8},{x:.6,y:.5},{x:.8,y:.7}])s=X.move(s,p);assert.equal(s.play.complete,false);s=tick(s,1);assert.equal(s.play.complete,false);s=X.release(s);s=tick(s,2.1);assert.equal(s.play.complete,true);const stamp=s.play.completedAt;s=tick(s,.5);assert.equal(s.play.completedAt,stamp);const {refs}=scene(entry(s.id));X.paint(refs,s);assert.equal(refs.playView.ink.getAttribute('opacity'),'0');assert.match(X.outcome(s,entry(s.id)).memory,/潮水轻轻把它收走/);
});
test('shells turn sideways, clouds need a broad sweep, and a leaf must be placed in its stone hollow',()=>{
 let s=X.move(make('snow-tracks'),{x:.5,y:.2});s=X.move(s,{x:.5,y:.8});assert.ok(s.play.progress<.5);s=X.move(s,{x:.93,y:.8});assert.equal(s.play.complete,true);
 let cloud=X.move(make('meadow-bird'),{x:.2,y:.5});cloud=X.move(cloud,{x:.9,y:.5});assert.equal(cloud.play.complete,true);
 let bay=X.act(make('coast-sand'),{assist:true});assert.equal(bay.play.type,'panorama');bay=tick(bay,.2);bay=X.act(bay,{assist:true});assert.equal(bay.play.complete,true);
});
test('stillness reveals the goat and reflection, while movement disturbs the water again',()=>{
 let goat=tick(make('meadow-butterfly'),1.9);assert.equal(goat.play.complete,true);assert.equal(goat.gesture,'look');let water=X.act(make('coast-pier'));water=tick(water,1);assert.ok(water.play.progress<1);water=X.move(water,{x:.2,y:.7});water=X.release(water);assert.equal(water.play.still,0);water=tick(water,2.3);assert.equal(water.play.complete,true);water=X.move(water,{x:.9,y:.3});assert.equal(water.play.complete,false);
});
test('listening uses three sound depths without counting a synthesized duplicate click; brewing waits for leaves to open',()=>{
 let sound=X.act(make('gorge-eagle'),{x:.1});assert.equal(sound.play.step,1);assert.equal(X.act(sound,{assist:true}),sound);sound=tick(sound,.2);sound=X.act(sound,{x:.1});assert.equal(sound.play.step,1);for(const x of [.5,.9]){sound=tick(sound,.2);sound=X.act(sound,{x});}assert.equal(sound.play.complete,true);
 let tea=X.act(make('westlake-eaves'));assert.equal(tea.play.complete,false);tea=tick(tea,1.9);assert.equal(tea.play.complete,true);
});
test('a moving lens shows magnified detail; all new renderers are bounded, finite and reduced-motion safe',()=>{
 for(const e of D.CATALOG){const {root,refs}=scene(e);let s=X.create(e,{reduced:true});X.paint(refs,s,true);const n=count(root),idle=snapshot(root);s=tick(s,.25);X.paint(refs,s,true);assert.equal(snapshot(root),idle,e.id);for(let i=0;i<40;i++){s=X.move(s,{x:i/40,y:.5});X.paint(refs,s,true);}assert.equal(count(root),n,e.id);assert.ok(n<350,e.id);assert.ok(!/NaN|Infinity|undefined/.test(snapshot(root)),e.id);}
 const {refs}=scene(entry('valley-bridge'));let s=X.move(make('valley-bridge'),{x:.4,y:.5});X.paint(refs,s);const first=refs.playView.zoomArt.getAttribute('transform');s=X.move(s,{x:.6,y:.5});X.paint(refs,s);assert.notEqual(refs.playView.zoomArt.getAttribute('transform'),first);assert.equal(refs.playView.zoom.getAttribute('clip-path'),'url(#play-lens-clip)');
});
test('keyboard and switch activations can participate in every mechanic; success and a partial attempt keep truthful memories',()=>{
 for(const e of D.CATALOG){let s=X.act(X.create(e,{reduced:true}),{assist:true});if(['wait','settle','sand','brew','yield'].includes(s.play.type))s=tick(s,2.4);for(let i=0;i<8&&!s.play.complete;i++){s=tick(s,.22);s=X.act(s,{assist:true});}s=tick(s,.8);assert.equal(s.play.complete,true,e.id);assert.ok(!X.outcome(s,e).memory.includes('还没看完'));const partial=X.act(X.create(e),{x:.01,y:.01});if(!partial.play.complete){assert.equal(X.outcome(partial,e).earned,false);assert.notEqual(X.outcome(partial,e).title,e.tag);}}
});
test('mobile dragging, pointer cancellation, keyboard moves and background resume keep one journal entry and one earned tag',()=>{
 for(const width of [320,390,990]){let saved=null;const h=harness({getItem:()=>saved,setItem:(_,v)=>saved=v},{viewport:{width,height:460}});h.click('route-mogan');h.click('overlay-action');h.advance(10);h.click('observe-button');const surface=h.$('micro-surface'),before=h.$('journey-progress').getAttribute('aria-valuenow');surface.emit('pointerdown',{pointerId:1,clientX:.15*width,clientY:180});surface.emit('pointermove',{pointerId:1,clientX:.9*width,clientY:180});surface.emit('pointerup',{pointerId:1,clientX:.9*width,clientY:180});surface.emit('click',{detail:1});assert.match(h.$('micro-result').textContent,/已收下/);assert.equal(h.$('journey-progress').getAttribute('aria-valuenow'),before);surface.emit('keydown',{key:'ArrowLeft'});h.window.emit('blur');h.advance(10);assert.equal(h.$('micro-panel').hidden,false);assert.equal(h.pendingFrames(),0);h.window.emit('focus');h.finishMoment('look');assert.equal(D.loadMoments({getItem:()=>saved}).length,1);assert.equal(h.$('journal-count').textContent,'1个瞬间');h.window.emit('pagehide',{persisted:false});}
});
test('rain taps and stone echoes have position-based tones with the existing sound consent and cleanup',async()=>{
 const f=fixture(),a=A.create({AudioContext:f.AudioContext,timers:f.timers});assert.equal(a.interact('drip',{playType:'rhythm'}),false);await a.enable();a.setScene({routeId:'mogan',mode:'moment'});const c=f.contexts[0];let frequencies=[];for(const x of [.1,.5,.9]){c.currentTime+=.3;const n=c.sources.length;assert.equal(a.interact('drip',{playType:'rhythm',x}),true);frequencies.push(c.sources[n].frequency.events[0][1]);}assert.deepEqual(frequencies,[440,554,659]);c.currentTime+=.3;const n=c.sources.length;a.interact('ripple',{playType:'echo',x:.5});assert.equal(c.sources.length-n,2);a.disable();assert.equal(a.interact('drip',{playType:'rhythm'}),false);f.flushTimers();assert.equal(a.voiceCount,0);a.destroy();
});
