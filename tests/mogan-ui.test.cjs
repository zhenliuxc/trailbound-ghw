const test=require('node:test'),assert=require('node:assert/strict'),D=require('../dist/discoveries.js');
const {harness}=require('./dom-harness.cjs'),{openMogan,playRain,playSteps,playSling}=require('./mogan-ui-helpers.cjs');
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
 h.click('mogan-start');h.$('micro-surface').emit('keydown',{key:'ArrowLeft'});h.advance(20);assert.equal(h.$('micro-progress').getAttribute('aria-valuenow'),'0');
 h.click('micro-skip');for(const image of h.photoImages)image.load();await h.readyArt();assert.equal(h.$('micro-panel').hidden,true);assert.equal(h.$('reward-overlay').hidden,true);assert.equal(h.$('journal-count').textContent,'0个瞬间');
});
test('background pauses a stone beat; returning and skipping cannot grant its painting',async()=>{
 const h=harness(undefined,{miniGames:true,autoImages:true,discoveryId:'bamboo-step'});await openMogan(h);h.click('mogan-start');h.advance(.7);h.window.emit('blur');assert.equal(h.pendingFrames(),0);h.advance(30);h.window.emit('focus');assert.equal(h.$('micro-progress').getAttribute('aria-valuenow'),'0');h.click('micro-skip');assert.equal(h.$('reward-overlay').hidden,true);assert.equal(h.$('journey-state').textContent,'停下来看看');
});
