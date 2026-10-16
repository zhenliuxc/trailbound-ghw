const test=require('node:test'),assert=require('node:assert/strict'),D=require('../dist/discoveries.js');
const {harness}=require('./dom-harness.cjs'),{openMogan,playRain,playSteps,playSling,pointer,touchStep}=require('./mogan-ui-helpers.cjs');
test('all three registered Mogan games earn the original tag once through DOM controls',async()=>{
 for(const [id,play]of [['bamboo-drop',playRain],['bamboo-step',playSteps],['bamboo-leaf',playSling]]){
  const storage={value:null,getItem(){return this.value;},setItem(k,v){this.value=v;}},h=harness(storage,{miniGames:true,autoImages:true,discoveryId:id,reducedMotion:true});
  await openMogan(h);play(h);assert.equal(h.$('micro-panel').hidden,true);assert.equal(h.$('reward-title').textContent,D.item(id).tag);
  h.click('reward-continue');h.click('reward-continue');const saved=D.loadMoments(storage);assert.equal(saved.filter(m=>m.earned&&m.id===id).length,1);
  h.window.emit('pagehide',{persisted:false});
 }
});
test('pending Mogan artwork cannot start, advance or award, and exiting ignores late images',async()=>{
 const h=harness(undefined,{miniGames:true,images:true,discoveryId:'bamboo-step'});h.click('route-mogan');h.click('overlay-action');h.advance(10);h.click('observe-button');
 pointer(h,.39,.73);h.$('micro-surface').emit('keydown',{key:'ArrowLeft'});h.advance(20);assert.equal(h.$('micro-progress').getAttribute('aria-valuenow'),'0');
 h.click('micro-skip');for(const image of h.photoImages)image.load();await h.readyArt();assert.equal(h.$('micro-panel').hidden,true);assert.equal(h.$('reward-overlay').hidden,true);assert.equal(h.$('journal-count').textContent,'0个瞬间');
});
test('background pauses a stone beat; returning and skipping cannot grant its painting',async()=>{
 const h=harness(undefined,{miniGames:true,autoImages:true,discoveryId:'bamboo-step'});await openMogan(h);touchStep(h);h.advance(.7);h.window.emit('blur');assert.equal(h.pendingFrames(),0);h.advance(30);h.window.emit('focus');assert.equal(h.$('micro-progress').getAttribute('aria-valuenow'),'0');h.click('micro-skip');assert.equal(h.$('reward-overlay').hidden,true);assert.equal(h.$('journey-state').textContent,'停下来看看');
});

test('idle hovering and tapping outside a painted footprint cannot start or earn the stone path',async()=>{
 const h=harness(undefined,{miniGames:true,autoImages:true,discoveryId:'bamboo-step'});await openMogan(h);
 pointer(h,.95,.1);h.$('micro-surface').emit('pointermove',{pointerId:73,pointerType:'mouse',clientX:20,clientY:20});h.advance(8);
 assert.equal(h.$('micro-progress').getAttribute('aria-valuenow'),'0');assert.equal(h.$('mogan-tools').getAttribute('data-beat'),'wait');
 assert.equal(h.$('mogan-start'),undefined);assert.equal(h.$('mogan-foot-left'),undefined);assert.equal(h.$('mogan-rain-left'),undefined);assert.equal(h.$('mogan-aim'),undefined);
 touchStep(h);h.advance(1.3);pointer(h,.95,.1);assert.equal(h.$('micro-progress').getAttribute('aria-valuenow'),'0');
 h.$('micro-surface').emit('pointerdown',{pointerId:74,isPrimary:true,button:0,clientX:280,clientY:440});h.$('micro-surface').emit('pointercancel',{pointerId:74});assert.equal(h.$('micro-progress').getAttribute('aria-valuenow'),'0');
 h.click('micro-skip');assert.equal(h.$('reward-overlay').hidden,true);
});

test('rain starts with a deliberate touch, then follows the mouse without direction buttons',async()=>{
 const h=harness(undefined,{miniGames:true,autoImages:true,discoveryId:'bamboo-drop'});await openMogan(h);
 const surface=h.$('micro-surface'),box=surface.getBoundingClientRect();surface.emit('pointermove',{pointerId:75,pointerType:'mouse',clientX:box.width*.9,clientY:box.height*.8});h.advance(4);
 assert.equal(h.$('micro-panel').getAttribute('data-phase'),'invite');
 pointer(h,.2);h.advance(.4);const clip=h.$('micro-art').querySelector('ellipse'),before=Number(clip.getAttribute('cx'));
 surface.emit('pointermove',{pointerId:75,pointerType:'mouse',clientX:box.width*.8,clientY:box.height*.8});h.advance(.4);
 assert.ok(Number(clip.getAttribute('cx'))>before+250);assert.equal(h.$('mogan-rain-left'),undefined);assert.equal(h.$('mogan-rain-right'),undefined);
 h.click('micro-skip');assert.equal(h.$('reward-overlay').hidden,true);
});
