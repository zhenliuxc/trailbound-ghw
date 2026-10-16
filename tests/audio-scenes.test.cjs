const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const S=require('../dist/audio-scenes'),A=require('../dist/audio'),D=require('../dist/discoveries'),{fixture}=require('./audio-fixture.cjs');
const flush=async()=>{for(let i=0;i<25;i++)await Promise.resolve();};
test('every current artwork and postcard resolves to a route-specific sound palette',()=>{
 const current=D.CATALOG.filter(item=>item.edition===3);assert.deepEqual(new Set(Object.keys(S.MOMENTS)),new Set(current.map(item=>item.id)));
 for(const item of current){const sound=S.landscape({routeId:item.route,momentId:item.id,mode:'moment'});assert.ok(sound.zone&&sound.cue);assert.ok(sound.layers.length);assert.ok(Object.values(sound.mix).every(value=>Number.isFinite(value)&&value>=0));}
 for(const [checkpoint,p]of Object.entries(A.PROFILES)){const sound=S.landscape({routeId:p.route,checkpointId:checkpoint,mode:'photo'});assert.equal(sound.zone,S.CHECKPOINTS[checkpoint]);assert.ok(sound.motif.length>=4);}
 assert.equal(Object.keys(S.ROUTES).length,7);assert.equal(new Set(Object.values(S.ROUTES).map(p=>p.kind)).size,6);
});
test('weather follows the map, while coast, canyon, creek, bamboo and snow retain different layers',()=>{
 const coast=S.landscape({routeId:'maclehose',weather:'clear'}),snow=S.landscape({routeId:'aotai',weather:'snow'}),gorge=S.landscape({routeId:'tiger',momentId:'gorge-sparkle'}),bamboo=S.landscape({routeId:'mogan',momentId:'bamboo-drop'});
 assert.equal(coast.layers[0].kind,'surf');assert.equal(snow.layers[0].kind,'snow');assert.ok(!snow.mix.creek);assert.equal(gorge.layers[0].kind,'spray');assert.ok(bamboo.mix.drips>0);
 for(const routeId of Object.keys(S.ROUTES)){const clear=S.landscape({routeId,weather:'clear'}),rain=S.landscape({routeId,weather:'rain'});assert.ok(!clear.layers.some(x=>x.id==='weather'));assert.ok(rain.layers.some(x=>x.id==='weather'&&x.kind==='rain'));}
 const pier=S.landscape({routeId:'maclehose',momentId:'coast-pier'});assert.ok(pier.layers[0].gain<coast.layers[0].gain);assert.equal(pier.steps,'wood');
});
test('scene identity includes the artwork and natural region, while tiny progress updates retain a sound group',async()=>{
 assert.notEqual(A.selection({routeId:'westlake',mode:'moment',momentId:'westlake-tea'}).key,A.selection({routeId:'westlake',mode:'moment',momentId:'westlake-eaves'}).key);
 const f=fixture(),a=A.create({AudioContext:f.AudioContext,timers:f.timers});await a.enable();a.setScene({routeId:'wugong',mode:'walk',progress:.10});const count=a.voiceCount,nodes=f.contexts[0].nodes.length;
 for(let i=0;i<100;i++)assert.equal(a.setScene({routeId:'wugong',mode:'walk',progress:.10+i*.001}),false);
 assert.equal(a.voiceCount,count);assert.equal(f.contexts[0].nodes.length,nodes);assert.equal(a.setScene({routeId:'wugong',mode:'walk',progress:.6}),true);assert.ok(a.groupCount<=3);a.destroy();
});
test('tea village and wind photography leave room for close sounds; collecting lowers the soundscape',()=>{
 const walk=S.landscape({routeId:'wugong',momentId:'meadow-bird',mode:'moment'}),photo=S.landscape({routeId:'wugong',momentId:'wugong-wind-hiker',mode:'moment'}),puzzle=S.landscape({routeId:'wugong',momentId:'meadow-flower',mode:'moment'}),reward=S.landscape({routeId:'wugong',momentId:'meadow-flower',mode:'reward'});
 assert.ok(photo.mix.leaves<walk.mix.leaves);assert.ok(puzzle.mix.leaves<photo.mix.leaves);assert.ok(reward.layers[0].gain<puzzle.layers[0].gain);
 const a=S.landscape({routeId:'westlake',progress:.39}),b=S.landscape({routeId:'westlake',progress:.41});assert.ok(Math.abs(a.mix.creek-b.mix.creek)<.07);assert.ok(S.landscape({routeId:'westlake',momentId:'westlake-basket'}).mix.creek<.01);
});
test('late recordings cannot restart an old scene or replay an interaction',async()=>{
 const f=fixture(),pending=[];f.AudioContext.prototype.decodeAudioData=async()=>({duration:6});const a=A.create({AudioContext:f.AudioContext,timers:f.timers,fetch:()=>new Promise(resolve=>pending.push(resolve))});
 await a.enable();a.setScene({routeId:'tiger',mode:'moment',momentId:'gorge-goat'});assert.equal(a.interact('breeze',{playType:'panorama'}),true);await flush();a.hide();const before=f.contexts[0].sources.length;
 for(const resolve of pending)resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(1)});await flush();assert.equal(f.contexts[0].sources.length,before);assert.equal(a.voiceCount,0);a.destroy();
});
test('frequent gestures, completion and disabled sounds stay bounded across all game scenes',async()=>{
 const f=fixture(),a=A.create({AudioContext:f.AudioContext,timers:f.timers});await a.enable();
 for(const [routeId,momentId,game,event]of [['wugong','meadow-butterfly','clouds','cloud-clear'],['wugong','meadow-flower','puzzle','piece-pick'],['westlake','westlake-tea','match','card-clear'],['mogan','bamboo-drop','rain','catch'],['mogan','bamboo-leaf','sling','sling-draw']]){
  a.setScene({routeId,mode:'moment',momentId,momentGame:game});const c=f.contexts[0],before=c.sources.length;for(let i=0;i<100;i++)a.mini(game,event,{index:1});assert.ok(c.sources.length-before<10);assert.equal(a.mini(game,'complete'),true);c.advance(.2);assert.equal(a.mini(game,'complete'),false);c.advance(2);
 }
 a.hide();assert.equal(a.mini('memory','collect'),false);assert.equal(a.voiceCount,0);a.destroy();
});
test('all memories can reveal and collect, including reduced-motion and non-Pixi rewards',async()=>{
 const f=fixture(),a=A.create({AudioContext:f.AudioContext,timers:f.timers});await a.enable();a.setScene({routeId:'maclehose',mode:'reward',momentId:'coast-shell'});assert.equal(a.mini('memory','reveal'),true);assert.equal(a.mini('memory','collect'),true);a.disable();assert.equal(a.mini('memory','collect'),false);f.flushTimers();assert.equal(a.voiceCount,0);a.destroy();
});
test('the buildless browser loads scene definitions before the audio engine',()=>{
 const html=fs.readFileSync(require.resolve('../dist/index.html'),'utf8'),sandbox={};assert.ok(html.indexOf('src="audio-scenes.js"')<html.indexOf('src="audio.js"'));
 for(const file of ['audio-scenes.js','audio.js'])vm.runInNewContext(fs.readFileSync(require.resolve('../dist/'+file),'utf8'),sandbox);assert.ok(sandbox.TrailAudio.scenes.MOMENTS['coast-shell']);
});
