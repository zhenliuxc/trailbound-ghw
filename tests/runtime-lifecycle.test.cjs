// Runtime contracts, not browser/GPU or listening verification.
const test=require('node:test'),assert=require('node:assert/strict');
const {createSceneManager,createFrameLoop}=require('../dist/runtime.js');
function sceneFixture(){
 let status='walking',resumed=0;
 const scenes=createSceneManager({status:()=>status,pause:()=>{if(status==='walking')status='paused';},resume:()=>{if(status==='paused'){status='walking';resumed++;}},hidden:()=>false});
 return {scenes,status:()=>status,resumed:()=>resumed};
}
test('nested journal returns to its minigame without resuming walking, and completion transfers to a reward',()=>{
 const f=sceneFixture(),{scenes}=f,mini=scenes.enter('minigame');assert.equal(f.status(),'paused');assert.equal(scenes.canAnimate(true),true);
 const journal=scenes.enter('journal');assert.equal(scenes.canAnimate(true),false);scenes.leave(journal);assert.equal(scenes.active,'minigame');assert.equal(f.resumed(),0);
 const reward=scenes.enter('reward',mini.returnStatus);scenes.leave(mini,false);assert.equal(scenes.canAnimate(false),false);scenes.leave(reward);assert.equal(f.status(),'walking');assert.equal(f.resumed(),1);
 scenes.leave(mini);scenes.leave(reward);assert.equal(f.resumed(),1,'obsolete scene handles cannot resume twice');
});
test('backgrounding invalidates every nested return-to-walking state and stale handles cannot close a new route scene',()=>{
 const f=sceneFixture(),{scenes}=f,mini=scenes.enter('minigame'),journal=scenes.enter('journal');
 scenes.suspend();scenes.foreground();scenes.leave(journal);scenes.leave(mini);assert.equal(f.status(),'paused');assert.equal(f.resumed(),0);
 const stale=scenes.enter('photo');scenes.reset();const current=scenes.enter('journal');scenes.leave(stale);assert.equal(scenes.isTop(current),true);assert.equal(scenes.active,'journal');
});
test('one frame clock ignores a late cancelled callback and resets time after a pause',()=>{
 let serial=0,active=true;const callbacks=new Map(),cancelled=[],updates=[];
 const loop=createFrameLoop({request:callback=>{callbacks.set(++serial,callback);return serial;},cancel:id=>cancelled.push(id),active:()=>active,update:dt=>updates.push(dt)});
 loop.ensure();loop.ensure();assert.equal(serial,1,'repeated ensure does not create competing clocks');const old=callbacks.get(1);loop.stop();assert.deepEqual(cancelled,[1]);old(100000);assert.deepEqual(updates,[]);
 loop.ensure();callbacks.get(2)(200000);assert.deepEqual(updates,[0]);callbacks.get(3)(201000);assert.deepEqual(updates,[0,.25],'a long frame is bounded');
 active=false;loop.ensure();const before=updates.length;callbacks.get(4)(300000);assert.equal(updates.length,before);active=true;loop.ensure();callbacks.get(5)(500000);assert.equal(updates.at(-1),0,'background time is not replayed');loop.stop();
});
