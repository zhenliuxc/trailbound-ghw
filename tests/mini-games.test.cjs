const test=require('node:test'),assert=require('node:assert/strict');
const Mini=require('../dist/mini-games.js'),D=require('../dist/discoveries.js'),X=Mini.enhance(require('../dist/micro-moments.js')),{harness}=require('./dom-harness.cjs'),{fixture}=require('./audio-fixture.cjs'),Audio=require('../dist/audio.js');
const entries=Object.keys(Mini.kinds).map(id=>D.item(id));
function advance(s,seconds){for(let i=0;i<seconds*40;i++)s=X.tick(s,.025);return s;}
function pilot(s){
 if(s.game==='rain'){const drop=s.drops.reduce((a,b)=>!a||b.y>a.y?b:a,null);return X.move(s,{x:drop?.x??.5,y:.8});}
 if(s.game==='wind')return X.move(s,{x:.5,y:Mini.windTarget(s)});
 const target=Mini.gates[Math.min(2,s.gates)],dy=target.y-s.actor.y;
 // Push from the opposite side; ordinary pointer input, no force-complete path.
 return X.act(s,{x:s.actor.x-.12,y:s.actor.y-Math.sign(dy)*.17});
}
test('three games require participation and do not time out or award idle users',()=>{
 for(const e of entries){let s=X.create(e);s=advance(s,60);assert.equal(s.done,false);assert.equal(X.outcome(s,e).earned,false);s=X.act(s,{assist:true});s=advance(s,8);assert.equal(X.outcome(s,e).earned,false);}
});
test('all three games can be completed through their real controls, with a delayed reward',()=>{
 for(const e of entries){let s=X.create(e);for(let i=0;i<8000&&!s.play.complete;i++){if(i%8===0)s=pilot(s);s=X.tick(s,.025);}assert.equal(s.play.complete,true,e.id+' must be reachable');assert.equal(s.done,false);assert.equal(X.outcome(s,e).earned,true);assert.ok(s.age>10);s=advance(s,s.game==='wind'?3.3:2.9);assert.equal(s.done,true);assert.equal(s.events.filter(e=>e.type==='complete').length,1);}
});
test('rain misses and flying outside the wind do not progress; retries reset all state',()=>{
 for(const e of entries.slice(1)){let s=X.create(e);s=X.move(s,{x:0,y:0});s=advance(s,10);if(s.game==='wind')assert.equal(s.gates,0);else assert.equal(s.caught,0);const fresh=X.create(e);assert.equal(fresh.play.progress,0);assert.equal(fresh.acted,false);assert.equal(fresh.events.length,0);}
});
test('reduced motion preserves gameplay while suppressing ambient motion and geometry stays finite',()=>{
 for(const e of entries){let s=X.create(e,{reduced:true}),a=Mini.foreground(s);s=advance(s,2);assert.deepEqual(Mini.foreground(s),a);s=pilot(s);s=advance(s,.25);assert.ok(!/NaN|Infinity|undefined/.test(JSON.stringify([...Mini.background(s.game),...Mini.foreground(s)])));}
});
test('real PixiJS Graphics accepts every scene primitive',async()=>{
 const P=await import('pixi.js');for(const e of entries){const g=new P.Graphics(),s=X.create(e);Mini.drawPixi(P,g,[...Mini.background(s.game),...Mini.foreground(s)]);assert.ok(g.context.instructions.length>100);g.destroy();}
});
test('new app path keeps pause, skip without reward, retry, sound controls and keyboard input',()=>{
 for(const viewport of [{width:320,height:435},{width:990,height:646}]){const h=harness(undefined,{miniGames:true,viewport});h.click('overlay-action');h.advance(10);h.click('observe-button');assert.equal(h.$('mini-controls').hidden,false);h.advance(15);assert.equal(h.$('micro-panel').hidden,false);h.$('micro-surface').emit('keydown',{key:'ArrowUp'});h.window.emit('blur');assert.equal(h.pendingFrames(),0);h.advance(20);assert.equal(h.$('micro-panel').hidden,false);h.window.emit('focus');h.click('mini-retry');assert.equal(h.$('micro-progress').getAttribute('aria-valuenow'),'0');h.click('micro-skip');assert.equal(h.$('reward-overlay').hidden,true);}
});
test('new app gameplay completes a wind challenge and saves exactly one earned reward',()=>{
 const records={value:null,getItem(){return this.value;},setItem(k,v){this.value=v;}};const h=harness(records,{miniGames:true});h.click('overlay-action');h.advance(10);h.click('observe-button');
 const surface=h.$('micro-surface');for(const y of Mini.windLevels){surface.emit('pointerdown',{pointerId:1,clientX:350,clientY:y*600,button:0,isPrimary:true});surface.emit('pointerup',{pointerId:1,clientX:350,clientY:y*600});h.advance(6);}h.advance(1.5);
 assert.equal(h.$('micro-panel').hidden,true);assert.equal(h.$('reward-overlay').hidden,false);assert.equal(D.loadMoments(records).filter(m=>m.earned).length,1);h.click('reward-continue');h.click('reward-continue');assert.equal(D.loadMoments(records).filter(m=>m.earned).length,1);
});
test('event sounds respect mute and background suspension and clean up voices',async()=>{
 const f=fixture(),a=Audio.create({AudioContext:f.AudioContext,timers:f.timers});assert.equal(a.mini('rain','catch'),false);await a.enable();a.setScene({routeId:'mogan',mode:'moment'});for(const ev of ['catch','goal','ripple','bump','complete'])assert.equal(a.mini('rain',ev,{index:2,x:.7}),true);assert.ok(a.voiceCount>0);a.hide();assert.equal(a.mini('rain','catch'),false);a.destroy();assert.equal(a.voiceCount,0);
});
test('renderer initialization cancelled by skip destroys its late GPU application',async()=>{
 const h=harness(),svg=(tag,attrs,parent)=>{const n=h.document.createElementNS('',tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);parent?.appendChild(n);return n;};const e=entries[0],refs=X.draw(svg,h.$('micro-art'),e);X.paint(refs,X.create(e));let finish,destroyed=0;class Application{init(){return new Promise(resolve=>finish=resolve);}destroy(){destroyed++;}}
 const pending=Mini.mount(refs,{Application},h.$('micro-surface'));Mini.dispose(refs);finish();assert.equal(await pending,false);assert.equal(destroyed,1);assert.equal(refs.renderer,null);
});
test('GPU initialization failure retains an interactive vector fallback',async()=>{
 const h=harness(),svg=(tag,attrs,parent)=>{const n=h.document.createElementNS('',tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);parent?.appendChild(n);return n;},refs=X.draw(svg,h.$('micro-art'),entries[1]);let s=X.create(entries[1]);X.paint(refs,s);class Application{async init(){throw Error('GPU unavailable');}destroy(){}}
 assert.equal(await Mini.mount(refs,{Application},h.$('micro-surface')),false);s=X.tick(X.move(s,{x:.8,y:.5}),.2);X.paint(refs,s);assert.ok(refs.fg.children.length>10);assert.equal(s.acted,true);
});
test('legacy journal titles and text survive the new play descriptions unchanged',()=>{
 const saved={key:'historic',id:'meadow-bird',route:'wugong',edition:3,earned:true,artVersion:4,tag:'草浪来信',title:'原来的草浪',place:'原来的地点',memory:'这是以前的手帐内容。',createdAt:1,elapsed:1,progress:.1,icon:'flower'};const result=D.cleanMoments([saved])[0];assert.equal(result.title,saved.title);assert.equal(result.memory,saved.memory);assert.equal(result.artVersion,4);
});
