const test=require('node:test');
const assert=require('node:assert/strict');
const Audio=require('../dist/audio.js');
const Scenes=require('../dist/audio-scenes.js');
const {fixture}=require('./audio-fixture.cjs');
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
test('the winter encounter leaves space for close hoof, breath and cloth cues',()=>{
 const forest=Scenes.landscape({routeId:'aotai',momentId:'aotai-takin-first',mode:'moment',momentGame:'footsteps'});
 const ridge=Scenes.landscape({routeId:'aotai',momentId:'snow-lichen',mode:'moment',momentGame:'wind'});
 assert.equal(forest.mix.drips,0);assert.ok(forest.layers[0].gain<ridge.layers[0].gain);assert.equal(Scenes.MOMENTS['aotai-camp-night'].zone,'camp');
});
test('Aotai preloads its existing licensed cloth and step recordings',()=>{
 for(const key of ['wugongCloth','wugongPlace','wugongStep1','wugongStep2','wugongStep3'])assert.ok(Audio.MINI_SAMPLES.aotai.includes(key));
});
test('encounter cues use the active sound group and are silent before enable or after hide',async()=>{
 const f=fixture();f.AudioContext.prototype.decodeAudioData=async()=>({duration:.4});
 const player=Audio.create({AudioContext:f.AudioContext,timers:f.timers,fetch:async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)})});
 assert.equal(player.mini('footsteps','aotai-hoof'),false);
 await player.enable();player.setScene({routeId:'aotai',mode:'moment',momentId:'aotai-takin-first',momentGame:'footsteps'});await flush();
 for(const event of ['aotai-hoof','aotai-breath','aotai-cloth']){const c=f.contexts[0],before=c.sources.length;assert.equal(player.mini('footsteps',event,{index:1}),true);assert.ok(c.sources.length>before);c.advance(1.1);}
 player.hide();const before=f.contexts[0].sources.length;assert.equal(player.mini('footsteps','aotai-hoof'),false);assert.equal(f.contexts[0].sources.length,before);player.destroy();assert.equal(player.voiceCount,0);
});
test('camp quieting and a ridge gust have route-specific sound responses',async()=>{
 const f=fixture(),player=Audio.create({AudioContext:f.AudioContext,timers:f.timers});
 await player.enable();player.setScene({routeId:'aotai',mode:'moment',momentId:'aotai-camp-night'});
 assert.equal(player.mini('packing','aotai-camp-quiet'),true);f.contexts[0].advance(2);
 player.setScene({routeId:'aotai',mode:'moment',momentId:'snow-lichen',momentGame:'wind'});assert.equal(player.mini('wind','aotai-gust'),true);player.destroy();
});
