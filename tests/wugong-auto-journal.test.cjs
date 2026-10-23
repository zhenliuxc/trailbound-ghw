const test = require('node:test');
const assert = require('node:assert/strict');
const { harness } = require('./dom-harness.cjs');
const Runtime = require('../dist/runtime.js');
const D = require('../dist/discoveries.js');
const J = require('../dist/journal.js');
const { buildSync } = require('esbuild');
const vm = require('node:vm');
const bundled = buildSync({ entryPoints:['src/wugong-walk/scroll/camp-journal.ts'],bundle:true,write:false,format:'cjs' }).outputFiles[0].text;
const mod = { exports:{} }; vm.runInThisContext(`(function(module,exports){${bundled}\n})`)(mod,mod.exports);
const { storeEarnedMoment } = mod.exports;
function memory() { const entry=D.item('meadow-butterfly'); return {key:'first',id:entry.id,route:'wugong',edition:3,earned:true,artVersion:4,title:entry.name,tag:entry.tag,place:entry.place,memory:'第一次的云与山',createdAt:1,icon:entry.icon}; }
function setup(onCollected,autoCollect=true,reduced=false) {
  const h=harness(),scenes=Runtime.createSceneManager({status:()=> 'paused',pause(){},resume(){},hidden:()=>h.document.hidden});
  let finish,paused=0,played=0,cancelled=0,animation;
  h.$(autoCollect?'reward-overlay':'reward-dialog').animate=(frames,timing)=>{animation={frames,timing};return {finished:new Promise(resolve=>{finish=resolve;}),cancel(){cancelled++;},pause(){paused++;},play(){played++;}};};
  const reward=Runtime.createRewardController({dom:Runtime.createDom(h.document),scenes,catalog:D,audio:{},reduced,autoCollect,gameKind:()=> 'cloud',refresh(){},stopLoop(){},onCollected});
  return {h,reward,finish:()=>finish(),counts:()=>({paused,played,cancelled}),animation:()=>animation};
}
test('completed Wugong artwork saves automatically once and closes after the memory fades',async()=>{
  let saves=0;const s=setup(()=>{saves++;});assert.equal(s.reward.show(memory(),'paused'),true);
  assert.equal(saves,1);assert.equal(s.h.$('reward-continue').hidden,true);assert.equal(s.reward.open,true);
  assert.equal(s.animation().timing.duration,2450);assert.equal(s.animation().frames.some(frame=>frame.transform),false);assert.equal(s.h.$('wind-keepsake').hidden,true);
  s.reward.collect();assert.equal(saves,1);s.finish();await Promise.resolve();assert.equal(s.reward.open,false);
  s.reward.collect();assert.equal(saves,1);s.reward.destroy();
});
test('unfinished artwork cannot enter automatic collection',()=>{
  let saves=0;const s=setup(()=>{saves++;});assert.equal(s.reward.show({...memory(),earned:false},'paused'),false);assert.equal(saves,0);assert.equal(s.reward.open,false);s.reward.destroy();
});
test('failed automatic storage stays open with an explicit retry, then saves once',async()=>{
  let writes=0;const s=setup(()=>++writes>1);s.reward.show(memory(),'paused');assert.equal(writes,1);assert.equal(s.h.$('reward-continue').hidden,false);assert.equal(s.h.$('reward-continue').textContent,'重试保存');
  s.reward.collect();assert.equal(writes,2);s.reward.collect();assert.equal(writes,2);s.finish();await Promise.resolve();assert.equal(s.reward.open,false);s.reward.destroy();
});
test('background pauses automatic collection, and closing cancels a deferred save',async()=>{
  let saves=0;const s=setup(()=>{saves++;});s.h.document.hidden=true;s.reward.show(memory(),'paused');assert.equal(saves,0);
  s.reward.close(false);s.h.document.hidden=false;s.h.document.emit('visibilitychange');assert.equal(saves,0);
  s.reward.show(memory(),'paused');assert.equal(saves,1);s.h.document.hidden=true;s.h.document.emit('visibilitychange');assert.equal(s.counts().paused,1);
  s.h.document.hidden=false;s.h.document.emit('visibilitychange');assert.equal(s.counts().played,1);s.reward.destroy();s.finish();await Promise.resolve();assert.equal(s.reward.open,false);assert.equal(saves,1);
});
test('other routes retain manual reward collection by default',async()=>{
  let saves=0;const s=setup(()=>{saves++;},false);s.reward.show(memory(),'paused');assert.equal(saves,0);assert.equal(s.h.$('reward-continue').hidden,false);s.reward.collect();assert.equal(saves,1);assert.equal(s.animation().timing.duration,680);assert.equal(s.animation().frames.some(frame=>frame.transform),true);s.finish();await Promise.resolve();assert.equal(s.reward.open,false);s.reward.destroy();
});
test('reduced motion still shows the automatically earned memory before a short fade',async()=>{
  let saves=0;const s=setup(()=>{saves++;},true,true);s.reward.show(memory(),'paused');assert.equal(saves,1);assert.equal(s.reward.open,true);
  assert.equal(s.animation().timing.duration,1380);assert.equal(s.animation().frames.some(frame=>frame.transform),false);
  s.finish();await Promise.resolve();assert.equal(s.reward.open,false);s.reward.destroy();
});
test('automatic persistence preserves the first artwork, text and date when replayed',()=>{
  const storage={value:null,getItem(){return this.value;},setItem(_,value){this.value=value;}};
  const first=memory();assert.equal(storeEarnedMoment(D,J,storage,first).kind,'stored');
  const before=storage.value;const replay=storeEarnedMoment(D,J,storage,{...first,key:'second',createdAt:2,memory:'第二次文字'});
  assert.deepEqual(replay,{kind:'stored',existing:true});assert.equal(storage.value,before);assert.equal(D.loadMoments(storage)[0].createdAt,1);
  assert.equal(storeEarnedMoment(D,J,storage,{...first,earned:false}).kind,'error');assert.equal(storage.value,before);
});
